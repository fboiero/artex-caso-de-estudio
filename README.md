# ARTEX — Caso de estudio, auditoría y detección

Material de **research, auditoría y docencia** sobre **ARTEX**, un framework open source de
pentest autónomo con agentes de IA, señalado por la alerta FLASH del FBI (FLASH-20261113-001)
por uso malicioso generalizado. Preparado para la cátedra de **Seguridad Informática
(UTN FRVM)**.

> ⚠️ **Aviso ético.** Este repositorio es material de análisis, auditoría y defensa. **No**
> incluye ni redistribuye el código de ARTEX, ni habilita su uso ofensivo. No ejecutes la
> herramienta contra sistemas de terceros. No uses imágenes precompiladas de terceros.

## 📄 Informe consolidado (empezá acá)

**`informes/INFORME-MAESTRO-ARTEX.pdf`** — estado actual: resumen ejecutivo, revisión de
código, procedencia y auditoría de forks, con datos a noviembre 2026.

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
Reglas **Sigma** y **Suricata**, diseño de **laboratorio de contención** y un **emulador
benigno** para validar la detección sin ejecutar ARTEX. Ver `deteccion/README-deteccion.pdf`.

### Material de clase
| Archivo | Tema |
|---|---|
| `ARTEX-caso-de-estudio.pdf` / `.pptx` | Presentación (30 slides, con notas del orador) |
| `HANDOUT-alumnos.pdf` / `.md` | Hoja resumen para repartir |
| `01-arquitectura-artex.md` | Agentes, skills, planner, retest, stack |
| `02-fallas-seguridad.md` | Fallas del propio ARTEX |
| `03-timeline-abuso.md` | Cronología + estado actual (nov 2026) |
| `04-licencia-agpl.md` | Licencia AGPL-3.0 |
| `06-material-clase.md` | Guía del práctico |
| `07-desarrollo-del-framework.md` | Desarrollador, Norma, casos/FBI |
| `08-enseñanzas.md` | Metodología y enseñanzas |
| `09-analisis-del-proyecto.md` | Cómo está construido, cómo evoluciona, qué hacer al descargarlo |

## 🎓 Cómo usar este repositorio

1. Leé el **informe maestro** para el panorama.
2. Para dar la clase: la **presentación** + el **handout** + la guía del práctico (`06`).
3. Para auditar un fork vos mismo: el **playbook** de `GUIA-TECNICA-Y-REVISION-ARTEX`.
4. Para defender/detectar: el paquete `deteccion/`.

## Fuentes

Reportes públicos (CSA, Censys, SOCRadar, Brandefense, Ostorlab, Dark Reading, Obsidian
Security, CERT-EU, Microsoft, Mandiant/Google, Wiz) y revisión directa del código. URLs al pie
de cada documento.

_Autor: Fernando Boiero — Investigador principal._
