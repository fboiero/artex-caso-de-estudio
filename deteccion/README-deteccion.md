---
title: "ARTEX — Paquete de detección y laboratorio de contención"
author: "F. Boiero — Investigador principal"
date: "20 de noviembre de 2026"
---

# ARTEX — Detección y laboratorio de contención (defensivo)

Material **defensivo** para detectar ARTEX y sus forks renombrados, y para **validar la
detección sin ejecutar la herramienta ofensiva**. Pensado para blue/purple team y para la
cátedra. No incluye ni habilita el uso ofensivo de ARTEX.

## 1. Principio

ARTEX se renombra (ScopeWeaver, AntiFox, Pojun…), así que **detectar por nombre falla**. Se
detecta por **comportamiento e indicadores de red**, que son estables entre forks:

- **Consola** en puertos **8787** (UI/API) y **8788** (proxy), a menudo con bind `0.0.0.0`.
- **Egress a notificadores**: `api.telegram.org`, `oapi.dingtalk.com`, `qyapi.weixin.qq.com`,
  `open.feishu.cn`.
- **Tráfico a LLMs** con guardrails débiles desde un host que además escanea: DeepSeek, GLM
  (Zhipu), Grok.
- **Ráfaga agéntica**: decenas de acciones/requests por segundo desde un mismo origen.
- **Co-ubicación** con C2 conocidos (Vshell, Cobalt Strike, Adaptix).
- Ruta de setup inicial **`/setup`** y auto-update contra GitHub Releases.

## 2. Laboratorio de contención (diseño)

> Objetivo: **observar y detectar**, no atacar. No se ejecuta ARTEX en esta guía.

- **Red aislada** (host-only / interna), **sin egress a internet**. Un colector (ej. tu SIEM,
  o un listener) recibe la telemetría.
- **Snapshots** antes de cualquier prueba; destrucción al terminar.
- **Blancos propios** intencionalmente vulnerables (DVWA, OWASP Juice Shop) — solo si hicieras
  pruebas, y **nunca** contra terceros.
- Sensores: Suricata/Zeek en la red del lab; Sysmon + reenvío de logs en los hosts.
- La validación de reglas se hace con el **emulador de indicadores benigno** (sección 4),
  **no** con ARTEX.

## 3. Reglas de detección

- `sigma/` — reglas Sigma (logs de host/proxy/firewall): consola expuesta, egress a
  notificadores, ráfaga agéntica.
- `suricata/artex.rules` — firmas de red: consola 8787/8788, egress a notificadores.

Son **puntos de partida**: ajustá umbrales y allowlists a tu entorno antes de alertar en
producción (para no generar falsos positivos con usos legítimos de Telegram/DingTalk).

## 4. Validación sin correr ARTEX (purple team)

`emulador/artex_indicator_emulator.py` **emula los indicadores de red** de ARTEX de forma
**benigna**: abre un banner en 8787/8788 y envía requests con las características de egress a un
**colector que vos controlás**. **No escanea, no explota, no trae payloads.** Sirve para
confirmar que tus reglas Sigma/Suricata **disparan**.

```bash
# en el lab aislado, contra tu propio colector de prueba
python3 emulador/artex_indicator_emulator.py --collector http://127.0.0.1:9000 --listen
# luego verificá que Suricata/tu SIEM generó las alertas esperadas
```

## 5. Caza (threat hunting) — checklist

- Hosts escuchando en **8787/8788** no inventariados.
- Procesos que hacen **a la vez** recon/escaneo **y** llamadas a APIs de LLM.
- Egress a `api.telegram.org`/`oapi.dingtalk.com` desde servidores que no deberían notificar.
- Picos de **acciones por segundo** hacia activos internos (ráfaga agéntica).
- Co-ocurrencia con binarios/tráfico de Vshell, Cobalt Strike o Adaptix.
- Claves de API de IA usadas desde IPs/ASN inusuales (robo de credenciales — ver caso AWS).

## 6. Mitigación

- Imponer **egress allowlist** a nivel de red (bloquear notificadores y APIs de LLM no
  autorizadas).
- No exponer 8787/8788; segmentar.
- Rotación y bóveda de **claves de API de IA** (son el objetivo).
- EDR + reglas de este paquete; revisión de la guía técnica para el playbook de auditoría.

---

*Material defensivo. No habilita ni documenta el uso ofensivo de ARTEX. Ajustar las reglas
antes de usarlas en producción.*

## 7. Módulo detector en vivo (`detector/`)

`detector/artex_detector.py` es un **sensor de host** que se "prende" y detecta en vivo si
ARTEX o un fork está corriendo o atacando desde/hacia este equipo (consola 8787/8788, egress a
notificadores/LLM, ráfaga agéntica, procesos marcados). Solo lee el sistema local; no ataca.
Ver `detector/README-detector.pdf`. Validado contra el emulador benigno.

## 8. Reglas Zeek (`zeek/`)

`zeek/artex.zeek` detecta a nivel de red: consola 8787/8788, egress a notificadores/LLM por
SNI, y ráfaga agéntica (fan-out por origen con SumStats). Cargá con `zeek -i <iface> artex.zeek`
o agregalo a `local.zeek`. Complementa al detector de host.

## 9. Dashboard (`dashboard/`)

`dashboard/collector.py` recibe las alertas del detector por webhook (POST /alert) y las
muestra en un tablero web con auto-refresco (conteos por severidad/tipo + tabla). Todo local.
```bash
python3 dashboard/collector.py --host 127.0.0.1 --port 9000
sudo python3 detector/artex_detector.py --interval 10 --json --webhook http://127.0.0.1:9000/alert
# abrir http://127.0.0.1:9000
```
