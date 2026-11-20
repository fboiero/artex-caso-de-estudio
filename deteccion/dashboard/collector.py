#!/usr/bin/env python3
"""
ARTEX Dashboard — colector + tablero para las alertas del detector (defensivo).

Recibe las alertas del detector por webhook (POST /alert) y las muestra en un tablero web
que se auto-refresca. Todo local; no ataca nada.

Uso:
  python3 collector.py --host 127.0.0.1 --port 9000
  # en otra terminal, apuntá el detector acá:
  sudo python3 ../detector/artex_detector.py --interval 10 --json --webhook http://127.0.0.1:9000/alert
  # abrí http://127.0.0.1:9000 en el navegador
"""
import http.server, socketserver, json, threading, argparse, datetime, html

ALERTS = []
LOCK = threading.Lock()
MAX = 1000

PAGE = """<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>ARTEX Dashboard</title><meta http-equiv="refresh" content="5">
<style>
 body{font-family:system-ui,Segoe UI,Arial,sans-serif;background:#121A2E;color:#E8ECF4;margin:0;padding:24px}
 h1{font-size:20px;margin:0 0 4px} .sub{color:#8A93A8;font-size:13px;margin-bottom:18px}
 .cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px}
 .card{background:#1E2A47;border-radius:10px;padding:14px 18px;min-width:120px}
 .card .n{font-size:28px;font-weight:700} .card .l{color:#CADCFC;font-size:12px}
 .high{color:#E63946} .medium{color:#E9C46A} .low{color:#2A9D8F} .info{color:#8A93A8}
 table{width:100%;border-collapse:collapse;font-size:13px}
 th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #2A3550}
 th{color:#8A93A8;font-weight:600} tr:hover{background:#19233c}
 .pill{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}
 .empty{color:#8A93A8;padding:40px;text-align:center}
</style></head><body>
<h1>ARTEX Dashboard</h1>
<div class="sub">Alertas del detector &middot; auto-refresco 5s &middot; __TS__</div>
<div class="cards">
 <div class="card"><div class="n">__TOTAL__</div><div class="l">alertas</div></div>
 <div class="card"><div class="n high">__HIGH__</div><div class="l">high</div></div>
 <div class="card"><div class="n medium">__MED__</div><div class="l">medium</div></div>
 <div class="card"><div class="n low">__LOW__</div><div class="l">low/info</div></div>
</div>
__BODY__
</body></html>"""

def render():
    with LOCK:
        data = list(ALERTS)
    counts = {"high": 0, "medium": 0, "low": 0}
    by_type = {}
    for a in data:
        sev = a.get("severity", "info")
        counts["high"] += sev == "high"
        counts["medium"] += sev == "medium"
        counts["low"] += sev in ("low", "info")
        by_type[a.get("type", "?")] = by_type.get(a.get("type", "?"), 0) + 1
    if not data:
        body = '<div class="empty">Sin alertas todavía. Apuntá el detector a este colector con --webhook.</div>'
    else:
        rows = []
        for a in reversed(data[-200:]):
            sev = a.get("severity", "info")
            cls = sev if sev in ("high", "medium", "low", "info") else "info"
            rows.append(
                f"<tr><td>{html.escape(str(a.get('ts','')))}</td>"
                f"<td><span class='pill {cls}'>{html.escape(sev)}</span></td>"
                f"<td>{html.escape(str(a.get('type','')))}</td>"
                f"<td>{html.escape(str(a.get('detail','')))}</td>"
                f"<td>{html.escape(str(a.get('pid','')))}</td></tr>")
        top = " &middot; ".join(f"{html.escape(k)}: {v}" for k, v in
                                sorted(by_type.items(), key=lambda x: -x[1]))
        body = (f"<div class='sub'>Por tipo: {top}</div>"
                "<table><tr><th>Hora</th><th>Sev</th><th>Tipo</th><th>Detalle</th><th>PID</th></tr>"
                + "".join(rows) + "</table>")
    page = (PAGE.replace("__TS__", datetime.datetime.now().astimezone().strftime("%H:%M:%S"))
                .replace("__TOTAL__", str(len(data)))
                .replace("__HIGH__", str(counts["high"]))
                .replace("__MED__", str(counts["medium"]))
                .replace("__LOW__", str(counts["low"]))
                .replace("__BODY__", body))
    return page.encode("utf-8")

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):  # silencioso
        pass

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            out = render()
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(out))); self.end_headers(); self.wfile.write(out)
        elif self.path == "/api/alerts":
            with LOCK:
                out = json.dumps(ALERTS).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(out))); self.end_headers(); self.wfile.write(out)
        else:
            self.send_response(404); self.end_headers()

    def do_POST(self):
        if self.path != "/alert":
            self.send_response(404); self.end_headers(); return
        n = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(n) if n else b"{}"
        try:
            obj = json.loads(raw.decode() or "{}")
            items = obj if isinstance(obj, list) else [obj]
            with LOCK:
                ALERTS.extend(items)
                del ALERTS[:-MAX]
            self.send_response(200)
        except Exception:
            self.send_response(400)
        self.end_headers()

def main():
    ap = argparse.ArgumentParser(description="ARTEX Dashboard — colector + tablero")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=9000)
    args = ap.parse_args()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer((args.host, args.port), Handler) as srv:
        print(f"[dashboard] http://{args.host}:{args.port}  (POST /alert para recibir)")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\n[dashboard] fin.")

if __name__ == "__main__":
    main()
