# 01 — Arquitectura de ARTEX

## Visión general

ARTEX es un framework **multi-agente ofensivo escrito en Go**, pensado para conducir un
pentest de forma autónoma. Un operador fija un objetivo y un alcance, y los agentes de IA
planifican y ejecutan las acciones usando herramientas reales de pentest, realimentando los
resultados para decidir el siguiente paso. Se publicó con la versión 0.3.15 como última
release open source.

## Agentes

- **Orquestador:** traduce el objetivo del operador en objetivos concretos y fija el alcance.
- **Planner:** descompone esos objetivos en pasos de ataque.
- **Workers:** por defecto **tres por tarea**, ejecutan los pasos con herramientas reales
  (nmap, shell, cliente HTTP, etc.).
- **Agente de chat:** permite al operador dirigir el trabajo en curso.
- **Agente de retest:** re-verifica cada hallazgo y lo etiqueta como
  *reproducible / corregido / no confirmado*.

Google y Mandiant describieron alrededor de seis sub-agentes; un solo operador puede dirigir
un controlador que corre varias intrusiones en paralelo.

## Modelo de skills (lo más interesante del diseño)

Cada herramienta de seguridad es un **binario independiente en `./skills/`**, no una
librería embebida en el código del agente. El backend en Go ejecuta el binario pasándole
parámetros JSON por stdin y recibe texto crudo por stdout, que después el LLM interpreta.

- **Ventaja:** aísla fallos y permite *hot-swap* de herramientas (cambiar gobuster por ffuf
  sin tocar el código del agente). Los agentes descubren las skills en runtime.
- **Costo:** overhead de spawn de procesos, bloqueo en scans largos (nmap) y dependencia de
  que el LLM interprete salida no estructurada (fuente de no-determinismo).

## Memoria del motor

Durante una corrida ARTEX mantiene **dos registros**:
1. Un grafo de **assets** descubiertos del objetivo.
2. Un registro de **pasos ya intentados**.

El frontend muestra el grafo de assets con un layout *force-directed* en D3 (sin
virtualización: en entornos grandes puede colgar el navegador).

## Modelos de IA

ARTEX **no tiene modelo propio**: es agnóstico y se conecta a cualquier proveedor. Soporta
Anthropic Claude, OpenAI y Ollama. En ataques reales se lo observó con DeepSeek, GLM y Grok.

## Captura de tráfico autenticado

Una extensión de navegador graba las requests mientras el operador inicia sesión a mano
(resolviendo 2FA o CAPTCHA) y las sube como JSON a un endpoint local de ingesta. Así los
agentes operan sobre sesiones ya autenticadas.

## Gates de aprobación

Cuando un agente propone una acción riesgosa (inyección SQL, fuerza bruta, ejecución de
exploit), la sesión se pausa, la operación queda como `awaiting_approval` y un humano la
aprueba o rechaza en el frontend.

- **Limitaciones:** no hay aprobación en lote, ni motor de políticas, ni scoring de riesgo.
- **Cuello de botella:** una sola aprobación pendiente pausa a **todos** los workers de esa
  sesión.

## Stack técnico

- Backend en **Go**; frontend **Next.js** exportado estático y embebido en el binario de Go
  vía `embed.FS`.
- **PostgreSQL** para sesiones, aprobaciones pendientes y tráfico capturado (el diagrama
  también muestra SQLite).
- Consola y API en el **puerto 8787**, normalmente bajo Docker.
- Base de reconocimiento: **ScopeSentry**, del mismo autor (ARTEX es la capa de IA encima).

## Fuentes

- https://socradar.io/blog/artex-ai-pentest-tool-what-security-teams-need-to-know/
- https://www.stepsecurity.io/blog/artex-ai-pentesting-tool-attackers-leaked-secrets
- https://starlog.is/articles/developer-tools/baarai-artex
