---
title: "ARTEX — Anexo: ampliación de la auditoría de forks (tanda 2)"
author: "F. Boiero — Investigador principal"
date: "20 de noviembre de 2026"
---

# Anexo — Ampliación de la auditoría de forks (tanda 2)

| | |
|---|---|
| **ID** | AUD-ARTEX-FORKS-ANEXO-2026-11-20 |
| **Complementa** | AUD-ARTEX-FORKS-2026-11-19 |
| **Base** | upstream `d0033724` (325 `.go`) |
| **Cobertura acumulada** | ~28 repos examinados de ~56 (22 con código Go + 6 sin código) |

## 1. Alcance

Segunda tanda sobre forks no cubiertos antes, priorizando señales ("reArtex", "RedTeam",
"deep-hunter", "harness", "defense-factory", "ttps-gap", "vaccine-shield", "Magisk"). Mismo
método estático (hash de blob + barrido de patrones), **sin ejecución**.

## 2. Resultados (forks con código Go)

| Fork | Idént | Modif | Borra | Nuevos | malp | Clasificación |
|---|---:|---:|---:|---:|---:|---|
| wufufu770/reArtex | 206 | 118 | 1 | 588 | 0 | Reescritura/extensión |
| j5tv9nfzhn-hue/artex-harness | 276 | 47 | 2 | 295 | 0 | Fiel + extensión |
| logkiller/artex-deep-hunter | 185 | 140 | 0 | 104 | 0 | Modificado (sin ofensiva) |
| Bluestar-coder/ARTEX-RedTeam | 105 | 218 | 2 | 307 | 0 | Reescritura |
| **rizkrisk/KSIR-ARTEX** | 90 | 226 | 9 | 81 | **4** | **Weaponizado (payloads)** |
| konanguyen/ARTEX | 152 | 173 | 0 | 458 | 0 | Reescritura/traducción |
| bcyw/ARTEX | 158 | 158 | 9 | 58 | 0 | Modificado |
| doraemonbd903/ARTEX | 91 | 234 | 0 | 43 | 0 | Modificado |

## 3. Hallazgo nuevo: KSIR-ARTEX está weaponizado

A diferencia del resto de la tanda, **`rizkrisk/KSIR-ARTEX` incorpora capacidad ofensiva lista
para usar**: un módulo de **webshells PHP** con payload ofuscado en base64
(`skills/php2shell/payloads/ws_obf_b64.php`, `ws_basic.php`) y **mutadores de payload**
(`agent/payloads/php.go`, `agent/payloads/mutators.go`). Es decir, no solo "menciona"
webshells: **las trae empaquetadas**. Se suma a `panda0x123/artex-ymh` (tanda 1) en la
categoría weaponizada. *(Caracterizado por nombre de archivo; no se reprodujo ningún payload.)*

## 4. Control de falsos positivos

El flag por palabra clave `webshell|reverse-shell` dispara en casi todos los forks, incluidos
los fieles — en `konanguyen` matchea `server/assembly.go` y `db/db.go` (strings/esquema). **Es
ruido.** La señal confiable es `malp` (patrón de código peligroso real) **más** la presencia de
**módulos ofensivos** (`tunnel/`, `session/http_shell*`, `skills/*shell*/payloads/`).

## 5. Repos sin código Go (docs / análisis / otros)

No son forks de código; se clasifican aparte: `urai-group/ScopeWeaver` (docs),
`hmruu/ARTEX-Magisk` (módulo Android), `beeyeas/artex-defense-factory` y
`hisashiyamaguchi/artex-ttps-gap-analysis` y `jicine1360-prog/roy-vaccine-artex-shield`
(material defensivo/análisis), `joker553/dsh-artex-ops`. Los tres defensivos son material
interesante para la cátedra.

## 6. Conclusión de la ampliación

La regla se sostiene: **la mayoría son fieles/reescrituras benignas; los weaponizados se
delatan por los módulos de payload/tunnel que agregan.** Dos weaponizados confirmados hasta
ahora (`panda0x123/artex-ymh`, `rizkrisk/KSIR-ARTEX`). Para el resto del universo (~56), el
**playbook de revisión** (ver guía técnica) permite auditar cada uno con el mismo método.

---

*Aviso: análisis estático; sin ejecución ni reproducción de payloads. No es asesoramiento legal.*
