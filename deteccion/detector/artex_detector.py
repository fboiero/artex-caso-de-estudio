#!/usr/bin/env python3
"""
ARTEX Detector — sensor DEFENSIVO de host.

Qué hace: inspecciona TU propio sistema (conexiones y procesos) en busca de indicadores de que
ARTEX o un fork (ScopeWeaver, AntiFox, Pojun, KSIR…) está corriendo o atacando desde/hacia este
host, y alerta. Se "prende" y corre en loop.

Qué NO hace: no escanea redes ajenas, no explota, no ataca. Es solo lectura del sistema local.

Indicadores (estables entre forks):
  - Consola escuchando en 8787/8788 (sobre todo bind 0.0.0.0).
  - Egress a notificadores (Telegram/DingTalk/WeChat/Feishu) y a APIs de LLM de guardrails
    débiles (DeepSeek/GLM/Grok).
  - Ráfaga agéntica: un proceso con muchos destinos salientes a la vez (fan-out).
  - Procesos con nombre/comando de ARTEX o sus skills (scopesentry, playwright-cli).

Uso:
  pip install psutil        # requerido
  python3 artex_detector.py --once           # una pasada
  python3 artex_detector.py --interval 15     # loop cada 15s ("prendido")
  python3 artex_detector.py --interval 15 --webhook http://tu-siem:9000/alert --json
"""
import argparse, json, socket, sys, time, datetime, os, collections

try:
    import psutil
except ImportError:
    sys.exit("Falta psutil. Instalá: pip install psutil")

# ---------- Configuración por defecto (editable con --config JSON) ----------
DEFAULT_CFG = {
    "watch_ports": [8787, 8788],
    "notifier_hosts": ["api.telegram.org", "oapi.dingtalk.com",
                        "qyapi.weixin.qq.com", "open.feishu.cn"],
    "llm_hosts": ["api.deepseek.com", "open.bigmodel.cn", "api.x.ai"],
    "proc_markers": ["artex", "scopeweaver", "antifox", "pojun",
                     "scopesentry", "playwright-cli"],
    "burst_distinct_dst": 60,     # >N destinos salientes por proceso = ráfaga
    "allow_pids": [],             # PIDs a ignorar (procesos legítimos conocidos)
    "allow_users": [],            # usuarios a ignorar
    "resolve_ttl": 300            # segundos entre refrescos de DNS de la watchlist
}

def load_cfg(path):
    cfg = dict(DEFAULT_CFG)
    if path and os.path.exists(path):
        with open(path) as f:
            cfg.update(json.load(f))
    return cfg

def resolve_hosts(hosts):
    ip2host = {}
    for h in hosts:
        try:
            for res in socket.getaddrinfo(h, None):
                ip2host[res[4][0]] = h
        except socket.gaierror:
            pass
    return ip2host

def alert(findings, out_json, logfile, webhook):
    for f in findings:
        f["ts"] = datetime.datetime.now().astimezone().isoformat()
        line = (json.dumps(f, ensure_ascii=False) if out_json
                else f"[{f['ts']}] {f['severity'].upper():6} {f['type']}: {f['detail']}")
        print(line, flush=True)
        if logfile:
            with open(logfile, "a") as lf:
                lf.write(json.dumps(f, ensure_ascii=False) + "\n")
        if webhook:
            try:
                import urllib.request
                req = urllib.request.Request(webhook, data=json.dumps(f).encode(),
                                             headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=3).read()
            except Exception:
                pass

def scan(cfg, watch_ips):
    findings = []
    watch_ports = set(cfg["watch_ports"])
    # --- conexiones ---
    per_pid_dst = collections.defaultdict(set)
    try:
        conns = psutil.net_connections(kind="inet")
    except (psutil.AccessDenied, PermissionError):
        findings.append({"severity": "info", "type": "permiso",
                         "detail": "Ejecutá con privilegios para ver todas las conexiones (sudo)."})
        conns = []
    for c in conns:
        # consola escuchando en 8787/8788
        if c.status == psutil.CONN_LISTEN and c.laddr and c.laddr.port in watch_ports:
            exposed = c.laddr.ip in ("0.0.0.0", "::")
            findings.append({
                "severity": "high" if exposed else "medium",
                "type": "consola_artex",
                "detail": f"escuchando en {c.laddr.ip}:{c.laddr.port}"
                          + (" (EXPUESTA 0.0.0.0)" if exposed else ""),
                "pid": c.pid})
        # egress a notificadores / LLM
        if c.status == psutil.CONN_ESTABLISHED and c.raddr:
            host = watch_ips.get(c.raddr.ip)
            if host:
                kind = "notificador" if host in cfg["notifier_hosts"] else "api_llm"
                findings.append({
                    "severity": "medium",
                    "type": f"egress_{kind}",
                    "detail": f"conexión a {host} ({c.raddr.ip}:{c.raddr.port})",
                    "pid": c.pid})
            if c.pid:
                per_pid_dst[c.pid].add((c.raddr.ip, c.raddr.port))
    # ráfaga agéntica
    for pid, dsts in per_pid_dst.items():
        if pid in cfg["allow_pids"]:
            continue
        if len(dsts) >= cfg["burst_distinct_dst"]:
            findings.append({
                "severity": "high", "type": "rafaga_agentica",
                "detail": f"PID {pid} con {len(dsts)} destinos salientes simultáneos",
                "pid": pid})
    # procesos con marcadores (match por NOMBRE o binario distintivo, no por substring de ruta)
    me = os.getpid()
    distinctive = {"scopesentry", "playwright-cli", "scopeweaver", "antifox", "pojun"}
    for p in psutil.process_iter(["pid", "name", "username", "cmdline"]):
        try:
            if p.info["pid"] == me or p.info["username"] in cfg["allow_users"]:
                continue
            name = (p.info.get("name") or "").lower()
            toks = [t.lower() for t in (p.info.get("cmdline") or [])]
            cmd = " ".join(toks)
            if "artex_detector" in cmd or "deteccion-artex" in cmd:
                continue  # no detectarse a sí mismo ni a rutas del propio paquete
            hit = None
            for m in cfg["proc_markers"]:
                if name == m or name.startswith(m):
                    hit = m
                    break
            if not hit:
                for t in toks:
                    if os.path.basename(t) in distinctive:
                        hit = os.path.basename(t)
                        break
            if hit:
                findings.append({
                    "severity": "high", "type": "proceso_artex",
                    "detail": f"PID {p.info['pid']} coincide con marcador '{hit}' ({p.info.get('name')})",
                    "pid": p.info["pid"]})
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return findings

def main():
    ap = argparse.ArgumentParser(description="ARTEX Detector — sensor defensivo de host")
    ap.add_argument("--config", help="JSON de configuración (opcional)")
    ap.add_argument("--once", action="store_true", help="una sola pasada")
    ap.add_argument("--interval", type=int, default=30, help="segundos entre pasadas (loop)")
    ap.add_argument("--json", action="store_true", help="salida en JSON")
    ap.add_argument("--log", help="archivo de log (JSONL)")
    ap.add_argument("--webhook", help="URL para POST de alertas (tu SIEM)")
    args = ap.parse_args()
    cfg = load_cfg(args.config)

    print(f"[artex-detector] iniciado. Puertos {cfg['watch_ports']}, "
          f"{len(cfg['notifier_hosts'])+len(cfg['llm_hosts'])} hosts en watchlist.", flush=True)
    watch_ips, last_res = {}, 0
    while True:
        if time.time() - last_res > cfg["resolve_ttl"]:
            watch_ips = resolve_hosts(cfg["notifier_hosts"] + cfg["llm_hosts"])
            last_res = time.time()
        findings = scan(cfg, watch_ips)
        if findings:
            alert(findings, args.json, args.log, args.webhook)
        elif args.once:
            print("[artex-detector] sin indicadores en esta pasada.", flush=True)
        if args.once:
            break
        time.sleep(args.interval)

if __name__ == "__main__":
    main()
