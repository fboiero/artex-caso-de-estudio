# 07 — Cómo se desarrolló ARTEX, el desarrollador y los casos de ataque

Este archivo cubre tres cosas que se confunden fácilmente y conviene mantener separadas:
1. **Quién** lo desarrolló y **qué hizo** cuando salió a la luz.
2. El **modelo constructivo** del framework (cómo está hecho por dentro).
3. Si **se puede inferir** con qué metodología/herramientas lo desarrolló (SDD, agentes,
   skills, modelos) — marcado explícitamente como inferencia.
4. Los **casos de ataque** más importantes y lo que dijo el **FBI**.

---

## 1. El desarrollador y qué hizo

- Publicado como **`Autumn-27/ARTEX`** en GitHub el **26 jul 2026**, bajo **AGPL-3.0**,
  escrito en **Go**.
- El mismo autor desarrolló **ScopeSentry**, una plataforma china de descubrimiento de
  activos y escaneo de vulnerabilidades (~2.000 estrellas). ARTEX es, en esencia, **una capa
  de agentes de IA sobre ScopeSentry**: importa a su grafo de assets los dominios,
  subdominios, IPs, puertos y endpoints que ScopeSentry descubre.
- No es una cuenta anónima: es un nombre conocido en los círculos de seguridad chinos. El
  *Wall Street Journal* identificó al desarrollador como **Li Puhua**, ingeniero de
  ciberseguridad que usa el alias "Autumn"; la cuenta de GitHub existe desde 2019.
- Según la descripción del propio proyecto, ARTEX fue **campeón del desafío de
  ataque-defensa "Agent+" de Baidu (sept 2026)**, lo que ubica al autor dentro del ecosistema
  de agentes, no como un aficionado aislado.
- **Cuánta gente participó:** el repo original figura con un **equipo chico, ~3 a 8
  contribuidores** (los números varían entre rastreadores de GitHub; los forks suman más, p.
  ej. artex-global con 11). No es un proyecto de una gran organización.

### Qué hizo cuando estalló el abuso

- El **8 oct 2026**, un día después del reporte de CrowdStrike sobre uso malicioso, Autumn-27
  publicó una declaración **en su perfil de GitHub** (no en el repo): afirmó **no estar
  involucrado** en los ataques, que ARTEX se construyó "para aprendizaje e investigación" y
  pruebas dentro de alcances autorizados, y que el proyecto pasaba a **código cerrado** y
  dejaba de recibir actualizaciones.
- En la misma edición borró de su perfil el enlace "ARTEX: AI automated penetration testing
  system", agregado el 27 jul.
- Después **bajó el repositorio**. No sirvió de mucho: forks, traducciones, copias archivadas
  y una versión comercial **ARTEX PRO** siguen circulando.

---

## 2. Modelo constructivo del framework

Cómo está construido ARTEX (arquitectura de ingeniería):

- **Monolito en Go** con el **frontend Next.js embebido** en el mismo binario, **PostgreSQL**
  para el estado (sesiones, aprobaciones, tráfico) y un **shim tipo mitmproxy** que graba cada
  request HTTP de los workers.
- **El framework agéntico: Norma.** Las capacidades de agente las provee **Norma**, un **SDK
  de harness de agentes en Go** del mismo autor, **con licencia Apache-2.0** (separada de la
  AGPL-3.0 de ARTEX). Varios análisis del código lo describen como una **reimplementación
  clean-room de la arquitectura de Claude Code**: un loop de tool-use en streaming que
  convierte un LLM en un agente autónomo, con el prompt, las herramientas y el límite de
  seguridad bajo control del integrador (herramientas read-only en paralelo, mutating en
  serie). Componentes: `agentcore / tool / permission / harness / memory / transcript`. Es
  decir, el autor **no cableó los agentes a mano**: construyó ARTEX sobre su propio harness.
- **Escala del código:** ~**21.000 líneas** de Norma (el harness) y ~**362 archivos Go** en
  ARTEX, según lecturas públicas del fork sobreviviente.
- **Arquitectura de doble grafo** (dual-graph): un grafo de assets y un grafo de exploración,
  más dos mecanismos de autonomía — intercambio de información a nivel de proceso entre workers
  y un **todolist compartido multironda** del planner para estabilizar la cadena de ataque.
- **Agnóstico de modelo:** se conecta a cualquier proveedor de LLM vía API.
- **Skills como binarios** en una carpeta `./skills/` junto al programa (ver `01-arquitectura`).

Patrón de diseño general: **reconocimiento (ScopeSentry) → grafo de assets → planner →
workers con herramientas reales → hallazgos realimentados**, con el LLM como "cerebro"
intercambiable y las herramientas como piezas externas.

---

## 3. ¿Con qué desarrolló ARTEX? (INFERENCIA, no confirmado)

> ⚠️ **Advertencia epistemológica.** No hay fuente pública que documente la metodología con la
> que el autor **escribió el código** de ARTEX. Lo que sigue es inferencia a partir de la
> arquitectura y del ecosistema del autor, útil para discutir en clase, no un hecho.

**Lo que sí está documentado — pero es sobre los OPERADORES, no sobre el autor:**
la nota de investigación de la Cloud Security Alliance y el reporte de CrowdStrike muestran que
los **atacantes** operaron ARTEX **desde sesiones de Claude Code**, con la **metodología de
testing provista al agente en documentos markdown de instrucciones** (estilo *skills*). En la
infraestructura de un operador se encontraron **historiales de sesión de Claude Code, archivos
de configuración de ARTEX y archivos de memoria de Claude**, que revelaban el método prompt a
prompt. El backend de modelo primario reportado fue **DeepSeek**, con Claude Code en paralelo.

**Inferencias razonables sobre cómo pudo construirlo el autor:**
- El framework **encarna** patrones de *agent SDK* y de *skills*: ARTEX se construyó sobre
  **Norma**, el propio harness del autor, modelado como la arquitectura de Claude Code. Quien
  diseña su propio harness de agentes suele **pensar y construir** con desarrollo asistido por
  agentes.
- Ser campeón de un desafío de agentes de Baidu sugiere fluidez con desarrollo asistido por
  agentes.
- Es **plausible** que haya usado desarrollo asistido por IA y una metodología cercana a
  **Spec-Driven Development** (especificar → generar → iterar), pero **no está probado**.

**Honestamente:** el modelo constructivo *del producto* refleja skills + agent-SDK; la
metodología *de desarrollo del autor* no es pública. En clase, esto es un buen ejemplo de
dónde termina la evidencia y empieza la especulación.

---

## 4. Casos de ataque y la alerta del FBI

### Campañas más relevantes
- **Bancos de Corea del Sur (oct):** un atacante de habla china usó ARTEX + agentes de Claude
  (Claude Code); CrowdStrike confirmó el uso. Primer caso de alto perfil.
- **Vapor Panda (17 oct):** campaña contra 200+ organizaciones en 14 países.
- **Storm-0940 (21 oct):** abuso de credenciales de ConnectWise Cloud Backup contra 2.250+
  tenants de Microsoft 365 (cadena de suministro).
- **Storm-3358 y actores con motivación financiera:** también citados entre los operadores.
- **Banda de Seúl (26 oct):** ~8,2 millones de registros robados.
- **WorkOS (2 nov):** brecha vinculada a ARTEX en una app interna de ventas.
- Velocidad de máquina: Mandiant/GTIG registraron **27 acciones en 23 segundos** en un caso.

### FBI FLASH-20261113-001 (13 nov 2026)
Título: *"Threat Overview of ARTEX Autonomous Penetration Testing Framework"*, TLP:CLEAR, vía
IC3. Puntos clave:
- Múltiples actores (estatales y criminales) usan ARTEX desde **al menos agosto 2026**.
- Sectores objetivo: servicios financieros, gobierno, tecnología, defensa, semiconductores,
  energía, salud, manufactura, telecomunicaciones y legal.
- **Comprime los tiempos:** algunas intrusiones pasaron de la selección inicial al **acceso
  privilegiado en menos de 3 horas**.
- ARTEX **no trae modelo propio**: se conecta a modelos externos.
- Bajar el repo no lo detuvo: **1.600+ consolas expuestas** a comienzos de noviembre (el FBI
  estima que son más).
- La tabla de indicadores incluye infraestructura de C2 y variantes (ScopeWeaver, LUCK,
  Guanlan SEC).

### Lección para la clase
ARTEX **no inventa técnicas nuevas**: baja el costo y el tiempo de técnicas existentes y amplía
quién puede ejecutarlas. Por eso la defensa pasa por higiene de secretos, imposición técnica
del alcance, hardening y detección de actividad agéntica — no por "prohibir la herramienta".

---

## Fuentes

- https://censys.com/blog/artex-agentic-asbestos/
- https://labs.cloudsecurityalliance.org/research/csa-research-note-artex-ai-agent-korean-bank-attacks-2026101/
- https://www.bleepingcomputer.com/news/security/hacker-used-artex-ai-and-claude-agents-to-target-south-korean-banks/
- https://www.getastra.com/blog/security-advisory/artex/
- https://www.safebreach.com/blog/artex-ai-attack-framework-fbi-flash-alert-20261113-001-safebreach-coverage/
- https://oodaloop.com/analysis/ooda-original/fbi-flash-on-artex-agentic-ai-hacking-frameworks-move-from-pen-testing-tool-to-mainstream-threat/
- https://www.infosecurity-magazine.com/news/fbi-growing-abuse-ai-pentesting/
- https://www.progressiverobot.com/2026/10/09/artex-ai-chinese-tool-pulled-misuse-south-korea-hacks/
