# 09 — Análisis del proyecto: cómo está construido, cómo evoluciona y qué hacer al descargarlo

Guía para que los alumnos entiendan ARTEX como proyecto de software: su construcción, su
evolución y cómo abordarlo de forma segura cuando clonan el repositorio.

---

## A. Cómo está construido

**Stack**
- **Go** como lenguaje principal: un único binario sirve la API (~150 rutas) y la interfaz.
- **Next.js** exportado estático y **embebido** en el binario de Go (`embed.FS`).
- **PostgreSQL** para el estado: sesiones, aprobaciones pendientes, tráfico capturado.
- Un **proxy integrado** (estilo mitmproxy) graba cada request/response de los agentes en un
  store consultable.

**Capa de agentes: Norma**
- Los agentes corren sobre **Norma**, un **SDK de harness de agentes en Go (Apache-2.0)** del
  mismo autor, descrito como reimplementación *clean-room* de la arquitectura de Claude Code.
- Componentes: `agentcore / tool / permission / harness / memory / transcript`.
- Loop de tool-use en streaming: herramientas read-only en paralelo, mutating en serie.

**Flujo de una corrida**
```
ScopeSentry (recon) → Grafos (assets + exploración) → Planner → Workers ×N (nmap, HTTP, shell)
→ hallazgos realimentan el grafo → Retest agent verifica cada hallazgo
```

**Skills como binarios**
- Las herramientas viven desacopladas en `./skills/` y se cargan en runtime.
- En el fork que clonamos (`jiwoochris/artex-global`) las skills son: **`api-recon`,
  `playwright-cli`, `scopesentry`**.

**Escala del código**
- ~**362 archivos Go** en ARTEX, ~**21.000 líneas** en Norma, ~**3–8 contribuidores**.

---

## B. Cómo evoluciona

- **Releases etiquetadas (`v*`):** cada tag publica una imagen en **GHCR**
  (`ghcr.io/jiwoochris/artex-global`) vía `.github/workflows/release.yml`. Así se versiona y
  distribuye el fork.
- **Upstream cerrado, forks vivos:** el original `Autumn-27/ARTEX` se cerró/bajó; la evolución
  sigue en forks (ARTEX Global, **ScopeWeaver**, **ARTEX PRO** comercial, AntiFox).
- **Retest agent editable:** se pre-crea en el primer arranque; se le configura prompt, LLM,
  presupuesto de ejecución y herramientas. Al concluir "Fixed", marca la vulnerabilidad como
  corregida automáticamente; la evidencia original siempre se conserva.
- **Skills evolucionan sin rebuild:** el `./skills/` se monta por bind-mount en el contenedor
  (sobrescribe el `/app/skills` de la imagen), así que editar una skill no obliga a reconstruir
  la imagen.
- **Lección de ingeniería:** separar cerebro (LLM), herramientas (skills) y orquestación
  (planner/workers) es lo que permite que cada parte evolucione por separado.

---

## C. Qué hacer cuando lo descargás (lectura segura)

> El objetivo es **leer y entender**, no ejecutar. ARTEX tiene una alerta FLASH del FBI por
> uso malicioso: en la cátedra se estudia, no se opera contra terceros.

1. **No lo levantes.** Nada de `docker compose up` ni `./install.sh`.
2. **Revisá `docker-compose.yml` primero:** mirá qué imagen baja. Rechazá `tomicdd/artex` y
   `congdonglinux/artex` (backdoor en la imagen precompilada). El fork `jiwoochris` usa
   `ghcr.io/jiwoochris/artex-global`, sin backdoor conocido — pero igual no lo ejecutes.
3. **Mapeá el código:** entrá por `agentcore` → `harness` (el loop), mirá el `planner` y cómo
   se cargan las skills. Cruzá con `01-arquitectura-artex.md`.
4. **Entendé qué config espera** (del compose, útil para la clase sin ejecutar nada):
   - Postgres: `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`, DSN en `ARTEX_PG_DSN`.
   - LLM: `ARTEX_LLM_PROVIDER` / `ARTEX_LLM_MODEL` / `ARTEX_LLM_BASE_URL` o claves
     `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`.
   - Primer arranque: `ARTEX_SETUP_TOKEN` o `ARTEX_ADMIN_PASSWORD` para el `/setup`.
   - Puertos: **8787** (UI/API) y 8788. Bind por defecto a **127.0.0.1** (seguro); el riesgo
     aparece si alguien pone `ARTEX_BIND=0.0.0.0` (ver `02-fallas-seguridad.md`).
5. **Auditá el tooling:** aplicá el checklist de `02-fallas-seguridad.md` sobre el propio
   ARTEX (puerto, tokens sin cifrar, TLS, aislamiento).

---

## D. La enseñanza que cierra el análisis

- **Separá "con qué se construyó" de "con qué se operó".** Construcción: Go + Norma. Operación
  (atacantes): sesiones de Claude Code, metodología en markdown, backend DeepSeek.
- **La herramienta de seguridad también es superficie de ataque.**
- **Un control en el prompt no es un control:** el alcance se impone en la red, no en el modelo.
