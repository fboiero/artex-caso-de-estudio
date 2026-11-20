# ARTEX — Caso de estudio, auditoría y detección

Material de **research, auditoría y docencia** sobre **ARTEX**, un framework open source de
pentest autónomo con agentes de IA, señalado por la alerta FLASH del FBI (FLASH-20261113-001)
por uso malicioso generalizado. Preparado para la cátedra de **Seguridad Informática
(UTN FRVM)**. Corte de información: **noviembre 2026**.

> ⚠️ **Aviso ético.** Este repositorio es material de análisis, auditoría y defensa. **No**
> incluye ni redistribuye el código de ARTEX, ni habilita su uso ofensivo. No ejecutes la
> herramienta contra sistemas de terceros. No uses imágenes precompiladas de terceros.

## 🔑 Hallazgos clave

1. **El código base no tiene backdoor.** La fama de "herramienta con backdoor" aplica a
   **imágenes de terceros** y al **uso ofensivo**, no al código fuente (verificado también por
   BadByte).
2. **El riesgo es por fork.** El ecosistema va de copias fieles a variantes **endurecidas**
   (defensivas) y forks **weaponizados** (reverse shell, webshell cifrado, C2).
3. **El borrado de código es el mejor predictor de riesgo:** los fieles borran 0 archivos del
   original; los weaponizados borran decenas o cientos.
4. **El ecosistema se descentralizó:** más de **12.000 forks**; el autor ya no lo controla;
   forks mantenidos superan al upstream (v0.5.1), con **1.465 consolas expuestas** y 10,6%
   co-alojando C2.
5. **La defensa es por comportamiento, no por nombre** (los forks se renombran): consolas
   8787/8788, egress a notificadores, ráfaga agéntica. Ver `deteccion/`.

## 📄 Informe consolidado (empezá acá)

**`informes/INFORME-MAESTRO-ARTEX.pdf`** — estado actual: resumen ejecutivo, revisión de
código, procedencia y auditoría de forks.

## 🧭 Cómo leer según tu rol

- **Alumno / docente:** `ARTEX-caso-de-estudio.pdf` (presentación) → `HANDOUT-alumnos.pdf` →
  `clase/05-material-clase.md` (práctico). Dudas de términos: `GLOSARIO.md`.
- **Auditor / investigador:** `INFORME-MAESTRO` → `GUIA-TECNICA-Y-REVISION` (estructura +
  **playbook para auditar un fork**) → `INFORME-AUDITORIA-FORKS` + `ANEXO`.
- **Defensor / blue team:** `deteccion/README-deteccion.pdf` → reglas `sigma/`, `suricata/`,
  `zeek/` → `detector/` (sensor en vivo) + `dashboard/` + `emulador/` (validación benigna).

## 📁 Contenido

### Informes (`informes/`)
| Documento | Qué cubre |
|---|---|
| `INFORME-MAESTRO-ARTEX` | Consolidado de estado actual (revisión + procedencia + forks) |
| `INFORME-AUDITORIA-ARTEX` | Auditoría de código del fork base (sin backdoor; riesgos residuales) |
| `INFORME-COMPARACION-FORKS-ARTEX` | Procedencia y fidelidad al upstream |
| `INFORME-AUDITORIA-FORKS-ARTEX` | Auditoría comparativa de 14 forks (taxonomía) |
| `ANEXO-AMPLIACION-FORKS-ARTEX` | Segunda tanda de forks (cobertura ~28/56) |
| `GUIA-TECNICA-Y-REVISION-ARTEX` | Estructura, seguridad y **playbook para auditar un fork** |

### Detección y defensa (`deteccion/`)
Reglas **Sigma**, **Suricata** y **Zeek**, un **detector** de host en vivo + **dashboard**,
diseño de **laboratorio de contención** y un **emulador benigno** para validar la detección
sin ejecutar ARTEX. Ver `deteccion/README-deteccion.pdf`.

### Material de clase
| Archivo | Tema |
|---|---|
| `ARTEX-caso-de-estudio.pdf` / `.pptx` | Presentación (32 slides, con notas del orador) |
| `HANDOUT-alumnos.pdf` / `.md` | Hoja resumen para repartir |
| `GLOSARIO.md` | Términos clave explicados |
| `ARTEX-para-alumnos.mp4` | Video resumen narrado (~4 min) con placas de prensa reales |
| `clase/01-arquitectura-artex.md` | Agentes, skills, planner, retest, stack |
| `clase/02-fallas-seguridad.md` | Fallas del propio ARTEX |
| `clase/03-timeline-abuso.md` | Cronología + estado actual (nov 2026) |
| `clase/04-licencia-agpl.md` | Licencia AGPL-3.0 |
| `clase/05-material-clase.md` | Guía del práctico |
| `clase/06-desarrollo-del-framework.md` | Desarrollador, Norma, casos/FBI |
| `clase/07-ensenanzas.md` | Metodología y enseñanzas |
| `clase/08-analisis-del-proyecto.md` | Cómo está construido, cómo evoluciona, qué hacer al descargarlo |

## Fuentes

Reportes públicos (CSA, Censys, SOCRadar, Brandefense, Ostorlab, Dark Reading, Obsidian
Security, CERT-EU, Microsoft, Mandiant/Google, Wiz) y revisión directa del código. URLs al pie
de cada documento.

## Licencia

Material educativo y documentación bajo **CC BY 4.0**; el código de `deteccion/` bajo **MIT**. Ver `LICENSE`. ARTEX no se incluye ni redistribuye (su código es AGPL-3.0 de sus autores).

_Autor: Fernando Boiero — Investigador principal. Material educativo; citar la fuente al reutilizar._
