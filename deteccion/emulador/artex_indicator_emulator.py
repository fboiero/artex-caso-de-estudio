#!/usr/bin/env python3
"""
Emulador BENIGNO de indicadores de ARTEX — para validar reglas de detección (purple team).

Qué hace:
  - Abre listeners TCP en 8787/8788 que devuelven un banner (para que un sensor de red
    vea los puertos de "consola").
  - Envía requests HTTP benignos a un COLECTOR QUE VOS CONTROLÁS, con los marcadores que
    usan las reglas (header X-Artex-Emulator, ruta /setup) y una ráfaga para probar la
    regla de actividad agéntica.

Qué NO hace (a propósito):
  - No escanea, no explota, no se conecta a objetivos de terceros, no trae payloads,
    no toca ARTEX ni ninguna herramienta ofensiva. Solo genera firmas de red inofensivas.

Uso (en un lab aislado, contra tu propio colector):
  python3 artex_indicator_emulator.py --collector http://127.0.0.1:9000 --listen --burst 120
"""
import argparse, socket, threading, time, urllib.request, sys

def banner_listener(port, stop):
    try:
        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind(("127.0.0.1", port))   # localhost a propósito: es un emulador, no un servicio real
        srv.listen(5); srv.settimeout(1.0)
        print(f"[emulador] escuchando banner en 127.0.0.1:{port}")
        while not stop.is_set():
            try:
                c, _ = srv.accept()
                c.sendall(b"ARTEX-EMULATOR (benigno) - validacion de deteccion\n")
                c.close()
            except socket.timeout:
                continue
        srv.close()
    except OSError as e:
        print(f"[emulador] no pude abrir {port}: {e}")

def send_markers(collector, burst):
    hdr = {"X-Artex-Emulator": "1", "User-Agent": "artex-emulator/benign"}
    # 1) marcador de 'consola': ruta /setup
    for path in ("/setup", "/api/health"):
        try:
            req = urllib.request.Request(collector.rstrip("/") + path, headers=hdr)
            urllib.request.urlopen(req, timeout=2).read()
            print(f"[emulador] enviado marcador {path}")
        except Exception as e:
            print(f"[emulador] {path}: {e}")
    # 2) ráfaga agéntica (para la regla de burst): N requests rápidos
    print(f"[emulador] enviando ráfaga de {burst} requests…")
    ok = 0
    for i in range(burst):
        try:
            req = urllib.request.Request(collector.rstrip("/") + f"/t/{i}", headers=hdr)
            urllib.request.urlopen(req, timeout=1).read(); ok += 1
        except Exception:
            pass
    print(f"[emulador] ráfaga completada ({ok}/{burst}).")

def main():
    ap = argparse.ArgumentParser(description="Emulador benigno de indicadores de ARTEX")
    ap.add_argument("--collector", help="URL de TU colector de prueba (ej. http://127.0.0.1:9000)")
    ap.add_argument("--listen", action="store_true", help="abrir banners en 8787/8788")
    ap.add_argument("--burst", type=int, default=120, help="cantidad de requests de la ráfaga")
    args = ap.parse_args()
    if not args.collector and not args.listen:
        ap.print_help(); sys.exit(1)

    stop = threading.Event(); threads = []
    if args.listen:
        for port in (8787, 8788):
            t = threading.Thread(target=banner_listener, args=(port, stop), daemon=True)
            t.start(); threads.append(t)
    if args.collector:
        send_markers(args.collector, args.burst)
    if args.listen:
        print("[emulador] banners activos. Ctrl-C para salir.")
        try:
            while True: time.sleep(1)
        except KeyboardInterrupt:
            stop.set()
    print("[emulador] fin.")

if __name__ == "__main__":
    main()
