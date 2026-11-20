# Glosario — términos clave

Para leer los informes y el material de clase sin fricción.

- **ARTEX** — framework open source de *pentest autónomo*: agentes de IA que conducen una
  intrusión (reconocimiento → explotación) con herramientas reales, dirigidos por un LLM.
- **Pentest autónomo / agéntico** — prueba de intrusión conducida por agentes de IA que
  deciden y ejecutan pasos solos, en vez de un operador humano paso a paso.
- **Upstream** — el proyecto original del que derivan los forks. En ARTEX, el repo de
  Autumn-27 (ya borrado); su último commit es la **base** de comparación (`d0033724`).
- **Fork** — copia de un repositorio que sigue su propio camino. Puede ser fiel al original o
  divergir (traducir, endurecer o *weaponizar*).
- **Backdoor** — acceso oculto deliberado en el código o en un binario. En ARTEX el backdoor
  documentado estaba en **imágenes de terceros**, no en el fuente.
- **Weaponizado** — fork al que se le agregó capacidad ofensiva lista para usar (reverse
  shell, webshell, C2) y/o se le borraron salvaguardas.
- **Endurecido (hardened)** — fork que agrega controles defensivos (detección de honeypots,
  revisión de egress, refuerzo de alcance).
- **Norma** — SDK de *harness* de agentes en Go, del mismo autor, sobre el que corre ARTEX;
  descrito como reimplementación de la arquitectura de Claude Code.
- **Skill (en ARTEX)** — herramienta empaquetada como binario independiente en `./skills/`
  que los agentes cargan en runtime (nmap, recon, etc.).
- **Hash de blob** — identificador de contenido de un archivo en git. Si dos repos comparten
  el mismo hash para un archivo, ese archivo es **byte-idéntico** (base de la comparación de
  fidelidad).
- **Alcance (scope)** — el conjunto de objetivos autorizados. "Blando" = impuesto por prompt
  (evadible); "técnico" = impuesto en la red o un sandbox (no evadible).
- **Egress** — tráfico saliente de una red. Controlarlo (allowlist) limita exfiltración y C2.
- **IoC (Indicator of Compromise)** — señal observable de actividad maliciosa (una IP, un
  puerto, un patrón). Base de la detección.
- **C2 (Command & Control)** — infraestructura desde la que un atacante controla sus
  implantes. Ej.: Cobalt Strike, Vshell, Adaptix.
- **Sigma** — formato abierto de reglas de detección para **logs** (portable entre SIEMs).
- **Suricata** — IDS/IPS de **red**; sus reglas inspeccionan el tráfico.
- **Zeek** — motor de análisis de **red** que genera metadatos/logs ricos y permite lógica de
  detección (p. ej. ráfaga por origen con SumStats).
- **AGPL-3.0** — licencia copyleft "de red": ofrecer como servicio un derivado obliga a
  liberar su código fuente. Por eso no se reutiliza código de ARTEX en productos propietarios.
- **TLP (Traffic Light Protocol)** — etiqueta de compartición. **TLP:CLEAR** = difusión libre.
- **FBI FLASH** — alerta táctica del FBI para la industria. ARTEX: **FLASH-20261113-001**.
