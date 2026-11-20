# ARTEX Detector — módulo de detección en vivo

Sensor **defensivo** de host: lo prendés en un servidor o endpoint y detecta si ARTEX (o un
fork renombrado) está corriendo o atacando desde/hacia ese host. Solo **lee** el sistema
local; no ataca ni escanea redes ajenas.

## Qué detecta

| Indicador | Señal |
|---|---|
| `consola_artex` | Proceso escuchando en 8787/8788 (alta si es 0.0.0.0) |
| `egress_notificador` | Conexión a Telegram/DingTalk/WeChat/Feishu |
| `egress_api_llm` | Conexión a DeepSeek/GLM/Grok |
| `rafaga_agentica` | Un proceso con muchos destinos salientes a la vez (fan-out) |
| `proceso_artex` | Proceso/comando con marcadores (artex, scopesentry, playwright-cli…) |

## Cómo prenderlo

```bash
pip install psutil

# una pasada (diagnóstico)
sudo python3 artex_detector.py --once

# prendido en loop, cada 15s, con log y envío a tu SIEM
sudo python3 artex_detector.py --interval 15 --log /var/log/artex-detector.jsonl \
     --webhook http://TU-SIEM:9000/alert --json
```

> `sudo` permite ver las conexiones de todos los procesos (sin privilegios, solo ve las
> propias). Ajustá allowlists en un `config.json` (ver `config.ejemplo.json`).

## Dejarlo corriendo como servicio

**Linux (systemd)** — `/etc/systemd/system/artex-detector.service`:
```ini
[Unit]
Description=ARTEX Detector
After=network.target
[Service]
ExecStart=/usr/bin/python3 /opt/artex-detector/artex_detector.py --interval 15 --log /var/log/artex-detector.jsonl --json
Restart=always
[Install]
WantedBy=multi-user.target
```
`sudo systemctl enable --now artex-detector`

**macOS (launchd):** un `.plist` en `~/Library/LaunchAgents` con `ProgramArguments`
apuntando al script y `RunAtLoad=true`.

## Config (allowlists)

Creá un `config.json` para bajar falsos positivos:
```json
{
  "allow_users": ["app-legit"],
  "allow_pids": [1234],
  "burst_distinct_dst": 80,
  "llm_hosts": ["api.deepseek.com", "open.bigmodel.cn", "api.x.ai"]
}
```
Pasalo con `--config config.json`.

## Límites

- Es **host-based**: ve este equipo, no la red completa. Para cobertura de red usá las reglas
  **Suricata/Zeek** del paquete (`../suricata/`).
- Detecta por **comportamiento/indicadores**, no por nombre — pero ajustá umbrales a tu línea
  de base para no alertar con usos legítimos (Telegram corporativo, CI/CD).
- Validá que funciona con el **emulador benigno** (`../emulador/`): corré el emulador y
  confirmá que el detector levanta `consola_artex` y `rafaga_agentica`.

## Flujo de validación (purple team, sin ARTEX)

```bash
# terminal 1: detector
sudo python3 artex_detector.py --interval 5 --once=false
# terminal 2: emulador benigno (abre 8787/8788 y hace ráfaga a tu colector local)
python3 ../emulador/artex_indicator_emulator.py --listen --collector http://127.0.0.1:9000 --burst 120
# el detector debería alertar consola_artex (8787/8788) y rafaga_agentica
```
