---
title: "ARTEX — Guía técnica y de revisión"
subtitle: "Estructura del repositorio, seguridad, comparación de forks y playbook de auditoría"
author: "F. Boiero — Investigador principal"
date: "20 de noviembre de 2026"
---

# ARTEX — Guía técnica y de revisión

| | |
|---|---|
| **ID** | AUD-ARTEX-GUIA-2026-11-20 |
| **Clasificación** | TLP:CLEAR |
| **Base** | `jiwoochris/artex-global` @ `06b36d7` - upstream `d0033724` (325 `.go`) |
| **Objeto** | Entender la estructura, evaluar la seguridad y **saber revisar** cualquier fork |

---

## 1. Estructura del repositorio (módulo por módulo)

ARTEX es un **monolito en Go** (392 archivos `.go`, ~65k LOC) con frontend Next.js embebido.
Mapa de módulos y su relevancia para seguridad:

| Módulo | .go | Rol | Relevancia de seguridad |
|---|---:|---|---|
| `cmd/` | 3 | Entrypoint (`cmd/artex/main.go`), arranque y self-update bootstrap | Alta — orquesta el inicio |
| `agent/` | 55 | Loop de agente: metas, blackboard, hallazgos, chat, compaction, `mainagent` | Alta — el "cerebro" |
| `server/` | 148 | API HTTP (~150 rutas), auth, assets, **scope**, orquestación, conversaciones | Alta — superficie expuesta |
| `db/` | 98 | Capa de datos (PostgreSQL/SQLite): esquema, migraciones, queries | Media — persistencia |
| `intercept/` | 10 | Reglas de intercepción, **scoring de riesgo** (`risk.go`) | Alta — control de acciones |
| `guard/` | 2 | Guardrails / salvaguardas | Alta — a vigilar si lo borran |
| `traffic/` | 10 | Captura de tráfico (mitmproxy) | Media — datos sensibles |
| `notify/` | 32 | Canales de notificación (Telegram, DingTalk, WeChat, Feishu) | Media — posible exfiltración |
| `selfupdate/` | 6 | Auto-actualización desde GitHub Release (SHA256 + smoke + rollback) | Alta — ejecución de código |
| `llmpool/` | 5 | Pool de conexiones a LLM (agnóstico de modelo) | Media — claves de API |
| `llmrec/` | 4 | Grabación/transcript de interacciones con el LLM | Baja |
| `mcphttp/` | 2 | Cliente MCP HTTP (integración ScopeSentry) | Baja |
| `enrich/` | 1 | Enriquecimiento de assets | Baja |
| `evidence/` | 3 | Store de evidencia de hallazgos | Baja |
| `report/` | 3 | Generación de reportes | Baja |
| `sidequestion/` | 7 | Agente de preguntas laterales / aclaraciones | Baja |
| `config/` | 3 | Configuración | Media |
| `detections/` | 0 | Reglas Sigma/Suricata/ATT&CK (agregadas por el fork) | Defensivo (positivo) |
| `skills/` | — | Herramientas como binarios: `api-recon`, `playwright-cli`, `scopesentry` | Alta — capacidades |
| `web/` | — | Frontend Next.js (embebido en el binario) | Media |
| `docs/` `scripts/` `screenshots/` | 0 | Documentación, scripts, capturas | Baja |

**Archivos raíz clave:** `go.mod` (deps), `Dockerfile` (imagen run-only), `docker-compose.yml`
(Postgres + artex, puertos 8787/8788), `build.sh` (cross-compile), `start.sh` (supervisor),
`install.sh`.

**Flujo:** `cmd` arranca -> `server` expone API/UI -> `agent` corre el engagement apoyándose en
`skills` (tools), `llmpool` (modelo), `intercept`/`guard` (control), `traffic` (captura) y
`db` (estado).

---

## 2. Arquitectura de seguridad (dónde mirar)

Los módulos que deciden la postura de seguridad:

- **`server/` + scope:** `asset_intercept.go` (blocklist global de assets), `assets_scope*`,
  `taskScopeAdd/Delete`, `addCompanyScope`. **El alcance se evalúa en la aplicación**, no en la
  red: un agente que no respete la lista puede, en teoría, salirse. *Imponer el scope en red.*
- **`intercept/` + `guard/`:** interceptan acciones riesgosas y puntúan riesgo
  (`intercept/risk.go`). El fork base hace *fail-toward-human* (ante error de reglas, frena).
  **Si un fork borra `guard/` o `intercept/`, es señal de alerta.**
- **`selfupdate/`:** descarga de GitHub Release (`const Repo` hardcodeado), valida **SHA256SUMS
  + smoke test + rollback**. Riesgo residual: sin firma independiente (F-01).
- **`server/auth.go`:** setup inicial (`/setup`), `ARTEX_SETUP_TOKEN` / `ARTEX_ADMIN_PASSWORD`.
- **`notify/`:** canales salientes — útiles como **IoC de egress** (api.telegram.org, etc.).
- **Red:** puertos **8787** (UI/API) y **8788**; bind por defecto `127.0.0.1` (seguro);
  `ARTEX_BIND=0.0.0.0` lo expone.

---

## 3. Comparación estructural entre forks

La estructura revela la intención. Qué agrega o borra cada tipo de fork:

| Fork | Cambio estructural | Lectura |
|---|---|---|
| horizonl, failsafe, acheong08 | Casi sin cambios de estructura | Espejo fiel |
| **jiwoochris** (auditado) | +`detections/`, +tests i18n, +catálogos de idioma | Fiel + i18n/defensa |
| **D4rk-3ch0/artex-c** | +`honeydetect/`, +`server/egress.go`, +`agent/antitrap.go` | **Endurecido** |
| cskwork/scopeweaver | Renombra binarios y canal de self-update; quita bloque OPSEC | Rebrand (menos fricción) |
| **panda0x123/artex-ymh** | +`server/reverse.go`, +`tunnel/`, +`session/http_shell_enc.go`, +`session/bypass.go`; **-42 archivos** | **Weaponizado** |
| **chu0119/Pojun** | +`vulnintel/`, servidor ampliado (consola C2) | **Ofensivo (C2)** |
| **ChathurangaBW/antifox** | **-225 archivos**: despojado a un "delivery" mínimo | **Despojado (AntiFox)** |

**Regla:** mirá primero **qué módulos de control (`guard/`, `intercept/`) desaparecen** y **qué
módulos ofensivos nuevos aparecen** (`tunnel/`, `session/http_shell*`, `reverse.go`, `vulnintel/`).
El **borrado de código** es el mejor predictor de riesgo.

---

## 4. Playbook de revisión — cómo revisar un fork vos mismo

Reproducible, **sin ejecutar** la herramienta. Reemplazá `<fork>` por el repo a auditar.

### Paso 0 — Preparar base de comparación (una vez)
```bash
git clone https://github.com/jiwoochris/artex-global.git ref && cd ref
BASE=d0033724a63aefbbcc1ed022b0faf4dc4a1fce51    # último commit upstream (Autumn-27)
git ls-tree -r $BASE | grep '\.go$' | awk '{print $3" "$4}' | sort > /tmp/base.txt
cd ..
```

### Paso 1 — Clonar e inventariar el fork
```bash
git clone --depth 1 https://github.com/<fork>.git target && cd target
git log -1 --format='%H %ci %s'              # HEAD y fecha
find . -maxdepth 1 -type d                   # estructura: ¿qué dirs hay?
```

### Paso 2 — Fidelidad vs. upstream (hash de blob)
```bash
git ls-tree -r HEAD | grep '\.go$' | awk '{print $3" "$4}' | sort > /tmp/f.txt
echo "idénticos: $(comm -12 /tmp/base.txt /tmp/f.txt | wc -l)"
comm -23 <(awk '{print $2}' /tmp/base.txt|sort) <(awk '{print $2}' /tmp/f.txt|sort) > /tmp/borrados.txt
echo "BORRADOS del upstream: $(wc -l </tmp/borrados.txt)"; head /tmp/borrados.txt
```
> **Muchos borrados = alerta.** Revisá si borraron `guard/`, `intercept/`, salvaguardas.

### Paso 3 — Barrido de patrones maliciosos
```bash
grep -rInE '/dev/tcp/|nc +-e|bash -i *>&|meterpreter|base64_decode *\(|eval *\( *\$_(POST|GET)|system *\( *\$_|passthru *\(' \
  --include='*.go' --include='*.php' --include='*.sh' --include='*.ts' . | grep -v _test
grep -rIl -iE 'webshell|reverse.?shell|tunnel|c2 console|\bbeacon\b' --include='*.go' . | grep -v _test
```
> Distinguí **capacidad declarada** (un pentest menciona webshells) de **payload embebido**
> (un handler de webshell cifrado). Mirá el archivo, no solo el match.

### Paso 4 — Cadena de suministro
```bash
cat docker-compose.yml | grep -i image      # ¿qué imagen baja? rechazá tomicdd/ congdonglinux/
grep -n 'const Repo' selfupdate/github.go    # ¿a qué repo apunta el auto-update?
grep -rniE 'sha256|verify|signature' selfupdate/*.go   # ¿verifica integridad?
cat .github/workflows/release.yml 2>/dev/null | grep -iE 'build|ghcr|sha256sum'  # ¿compila desde fuente?
```

### Paso 5 — Secretos y beacons
```bash
git grep -nIiE '(api[_-]?key|secret|password|token)\s*[:=]\s*["'"'"'][A-Za-z0-9/_+-]{16,}' | grep -viE 'getenv|os\.|cfg|example|test'
grep -rniE 'http\.(Get|Post)\(|telemetry|phonehome' --include='*.go' cmd/ server/ | grep -v _test
```

### Paso 6 — Veredicto
Clasificá: **fiel** (0 borrados, sin patrones), **endurecido** (agrega controles),
**weaponizado** (agrega ofensiva / borra salvaguardas). Documentá evidencia (archivo:línea).

---

## 5. Recomendaciones — cómo usarlo y qué hacer

**Cómo usarlo (de forma segura):**
- **Solo lectura de código** para estudio; **no ejecutar** contra terceros.
- Si se ejecuta: **laboratorio aislado sin salida**, blancos propios (DVWA, Juice Shop).
- **Compilar desde fuente** (`CGO_ENABLED=0 go build`); nunca imágenes de terceros.
- **Desactivar el auto-update** o fijar versión; mantener bind `127.0.0.1`.
- Tratar 8787/8788 como superficie sensible: auth fuerte, TLS, sin exposición pública.

**Cómo revisarlo:** seguir el playbook (sección 4) para cualquier fork antes de confiar en él.

**Qué hacer (defensa / blue team):**
- Detectar por **comportamiento, no por nombre** (los forks se renombran).
- IoCs: consolas 8787/8788 expuestas, egress a notificadores, co-ubicación con C2 (Vshell,
  Cobalt Strike, Adaptix), uso de modelos con guardrails débiles (DeepSeek/GLM/Grok).
- Higiene de secretos (las claves de API son el objetivo: ver robo en AWS).
- Imponer alcance y egress a nivel de red; monitorear actividad agéntica (muchas acciones/seg).

---

*Aviso: guía de investigación y docencia. Análisis estático; sin ejecución ni reproducción de
payloads. No es asesoramiento legal.*
