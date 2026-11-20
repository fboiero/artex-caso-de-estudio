# 06 — Práctico: ARTEX como caso de estudio

Guía para la práctica de la cátedra de Seguridad Informática. El práctico es de **análisis
estático y diseño**: los alumnos **no ejecutan** ARTEX contra sistemas reales.

## Objetivos de aprendizaje

Al terminar, el alumno debe poder:
1. Describir la arquitectura multi-agente de un pentest autónomo.
2. Identificar fallas de seguridad en la propia herramienta ofensiva.
3. Explicar las implicancias de la licencia AGPL-3.0.
4. Analizar el ciclo de doble uso (research → arma) y su dimensión ética.
5. Proponer controles que impongan el alcance de forma técnica.

## Reglas de seguridad del práctico

- **No** ejecutar ARTEX contra objetivos externos ni de terceros.
- **No** usar imágenes precompiladas de forks (`tomicdd/artex`, `congdonglinux/artex`: con
  backdoor).
- Si hay parte hands-on, solo en **laboratorio aislado** (sin salida a internet) y contra
  blancos intencionalmente vulnerables y **propios** (DVWA, OWASP Juice Shop, VulnHub).
- Trabajo primario: **lectura de código fuente** del fork de origen, no ejecución.

## Actividades

### Parte A — Lectura de arquitectura (individual)
A partir del fuente de un fork de origen (p. ej. `jiwoochris/artex-global`), el alumno
identifica y documenta:
- Dónde está el orquestador, el planner y los workers.
- Cómo se cargan las skills (`./skills/`) y cómo se pasan parámetros.
- Dónde se almacenan sesiones y aprobaciones (PostgreSQL).
- Dónde escucha la consola (puerto, bind).

### Parte B — Auditoría de la herramienta (en parejas)
Encontrar y justificar al menos 4 fallas de seguridad del propio ARTEX y proponer la
corrección. Usar como checklist la tabla de `02-fallas-seguridad.md` **sin mirarla primero**.

### Parte C — Diseño de control de alcance (grupal)
Diseñar un mecanismo que **imponga** el alcance de forma técnica (no por prompt). Entregable:
diagrama + descripción de en qué capa se aplica (red, sandbox, proxy, allowlist) y por qué
no se puede evadir desde el agente.

### Parte D — Debate ético-legal (plenario)
Usar las preguntas de `03-timeline-abuso.md` y `04-licencia-agpl.md`:
- Responsabilidad del autor.
- Utilidad del takedown frente a los forks.
- AGPL: qué se puede reutilizar y qué no.

## Evaluación (rúbrica sugerida)

| Criterio | Peso |
|---|---|
| Correcta identificación de componentes (Parte A) | 25% |
| Calidad y justificación de fallas halladas (Parte B) | 25% |
| Diseño de control de alcance no evadible (Parte C) | 30% |
| Participación y argumentación en el debate (Parte D) | 20% |

## Cierre

Mensaje para llevarse: las herramientas de IA ofensiva bajan el costo del ataque y amplían
quién puede ejecutarlo. La defensa no pasa por prohibir la herramienta —los forks persisten—
sino por **higiene de secretos, imposición técnica del alcance, hardening y detección** de la
actividad agéntica.
