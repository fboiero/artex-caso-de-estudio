---
title: "Auditoría comparativa de forks de ARTEX"
subtitle: "Fidelidad al upstream, clasificación y señales de riesgo en 14 forks"
author: "F. Boiero — Investigador principal"
date: "19 de noviembre de 2026"
---

# Auditoría comparativa de forks de ARTEX

| | |
|---|---|
| **ID de informe** | AUD-ARTEX-FORKS-2026-11-19 |
| **Clasificación** | TLP:CLEAR |
| **Complementa** | AUD-ARTEX-2026-11-19 y AUD-ARTEX-PROV-2026-11-19 |
| **Universo** | ~56–58 forks/copias públicas (102 aparecieron en la semana del takedown) |
| **Muestra auditada** | 14 forks (curados por estrellas, linaje y riesgo) |
| **Base de comparación** | upstream `d0033724` (325 archivos `.go`) |

---

## 1. Objetivo y alcance

Dimensionar el universo de forks de ARTEX y auditar una **muestra representativa** para
clasificarlos por fidelidad al original y detectar variantes con alteraciones de riesgo
(adición de C2, webshells, borrado de controles). **No** se auditaron los 56+ forks: se
seleccionaron 14 que cubren todo el espectro (espejos, traducciones, endurecidos y
weaponizados). Revisión **estática y automatizada** + verificación dirigida; **sin ejecutar**
ninguna herramienta y **sin reproducir** payloads ofensivos.

## 2. Metodología

Por cada fork: clonado, comparación de `.go` por **hash de blob** contra el upstream base
(idéntico / modificado / borrado / nuevo), barrido de patrones maliciosos
(`/dev/tcp`, `nc -e`, `base64_decode`, webshells PHP, reverse shells), inspección del origen
del self-update, y clasificación de módulos nuevos por nombre de archivo.

> **Control de falsos positivos:** una primera corrida marcó "C2" en casi todos los forks,
> incluidos los limpios. Al verificar, matcheaba módulos internos (`assembly.go`,
> `mainagent.go`) — es ruido de base (una función de telemetría dormida común a la familia).
> **Se descartó.** Igual, `intercept/risk.go` disparaba el patrón malicioso: es la **lógica de
> scoring de riesgo** de la propia herramienta (falso positivo), no código malicioso.

## 3. Matriz comparativa

| Fork | Stars | Idént | Modif | Borra | Nuevos | Señal real | Clasificación |
|---|---:|---:|---:|---:|---:|---|---|
| horizonl/ARTEX | 67 | 321 | 4 | 0 | 0 | — | Espejo fiel |
| failsafe-security/artex | baja | 308 | 17 | 0 | 10 | — | Espejo fiel |
| **D4rk-3ch0/artex-c** | 10 | 304 | 21 | 0 | 30 | defensivo | **Endurecido** |
| 2561769445/ycode-auto-pentest | 22 | 267 | 58 | 0 | 81 | evasión | Fiel + ofensivo leve |
| RuoJi6/ARTEX | ~2098 | 231 | 94 | 0 | 122 | — | Baseline mantenido |
| MoLeft/ARTEX | baja | 208 | 117 | 0 | 136 | — | Fiel + i18n |
| **jiwoochris/artex-global** (auditado) | 4088 | 201 | 124 | 0 | 67 | — | Fiel + i18n |
| acheong08/artex | 8 | 98 | 227 | 0 | 2 | — | Espejo (reformateado) |
| lyrisoft/artex-hardened | baja | 67 | 251 | 7 | 181 | — | Endurecido (declarado) |
| cskwork/scopeweaver | 1136 | 67 | 258 | 0 | 483 | quita OPSEC | Rebrand EN/KO |
| BaaRai/ARTEX | 11411 | 59 | 259 | 7 | 253 | — | Reescritura (v0.6, con *approval gate*) |
| chu0119/Pojun | 84 | 134 | 189 | 2 | 259 | C2 / vuln-intel | **Ofensivo (C2)** |
| **panda0x123/artex-ymh** | baja | 205 | 78 | **42** | 132 | reverse+webshell | **Weaponizado** |
| **ChathurangaBW/antifox** | baja | 6 | 94 | **225** | 147 | delivery | **Despojado (AntiFox)** |

## 4. Taxonomía (3 niveles)

### Nivel 1 — Reproducciones fieles / espejos (bajo riesgo de integridad)
`horizonl/ARTEX` (321/325 idénticos), `failsafe-security/artex` (308), `acheong08/artex`
(mirror reformateado, 0 borrados), `RuoJi6/ARTEX` (baseline mantenido que **preserva la
historia de git** — buena referencia). Reproducen el original sin eliminar código.

### Nivel 2 — Traducciones / endurecidos (benignos, con cambios declarados)
- **Traducciones:** `jiwoochris/artex-global` (el auditado, i18n), `MoLeft/ARTEX`,
  `BaaRai/ARTEX` (EN, su propia v0.6 con *opt-in approval gate* — mejora de seguridad),
  `cskwork/scopeweaver` (EN/KO). **Nota:** ScopeWeaver, según análisis de terceros, **removió
  un bloque de OPSEC** y renombró binarios/canal de self-update — reduce fricción de uso.
- **Endurecidos (defensivos):** `D4rk-3ch0/artex-c` agrega **detección de honeypots
  (`honeydetect/`), revisión de egress (`server/egress.go`), anti-trampa (`agent/antitrap.go`)
  y refuerzo de alcance** — precisamente los controles que recomendamos en la auditoría base.
  `lyrisoft/artex-hardened` se declara endurecido.

### Nivel 3 — Weaponizados / ofensivos (ALTO riesgo)
- **`panda0x123/artex-ymh`** — **weaponizado.** Borra 42 archivos del upstream y agrega
  módulos ofensivos: `server/reverse.go` (reverse shell), `tunnel/deploy.go`+`tunnel/probe.go`
  (tunneling), `session/http_shell.go` y `session/http_shell_enc.go` (**webshell cifrado**),
  `session/bypass.go`. Coincide con el reporte externo de "encrypted webshells / evasión de defensas".
  Su self-update apunta a `Autumn-27/artex` (404), roto.
- **`chu0119/Pojun`** — **ofensivo (C2).** +259 archivos, módulo `vulnintel/` y servidor
  ampliado; descrito por terceros como ARTEX con **consola C2** incorporada.
- **`ChathurangaBW/antifox`** (AntiFox) — **despojado.** Solo 6/325 archivos intactos, **225
  borrados**: ya no es una copia de ARTEX sino una variante "delivery-enhanced" que reutiliza
  piezas.

## 5. Hallazgos clave

1. **El fork que adoptamos (`jiwoochris`) es de los fieles:** 0 archivos borrados, cambios de
   i18n/tests/detecciones, self-update al propio repo. Sin señales maliciosas.
2. **Existen forks defensivos** (`D4rk-3ch0/artex-c`) que implementan los controles que
   recomendamos — material didáctico ideal de "cómo se debería endurecer".
3. **Existen forks weaponizados** (`panda0x123`, `Pojun`, `antifox`) que agregan reverse
   shells, webshells cifrados o C2, y borran salvaguardas. Son la cara peligrosa del ecosistema.
4. **El borrado de código es el mejor predictor de riesgo:** los weaponizados borran decenas o
   cientos de archivos del original; los fieles borran 0.
5. **La "autonomía con backdoor" sigue siendo FUD para el código base;** el riesgo real es
   **por fork**: hay que mirar qué agrega y qué borra cada uno.

## 6. Recomendaciones

- Para estudio/laboratorio, usar un **fork fiel** (`horizonl`, `failsafe-security`,
  `RuoJi6`, o el auditado `jiwoochris`) o el **endurecido** `D4rk-3ch0/artex-c`.
- **No** usar los weaponizados (`panda0x123`, `Pojun`, `antifox`) salvo para análisis de
  amenazas en entorno aislado — contienen capacidades ofensivas listas (webshell/C2).
- Verificar **qué borra** un fork respecto del upstream antes de confiar en él.
- Para la familia completa, usar los IoCs de red consistentes entre forks (egress a
  notificadores, consola 8787) descritos en la auditoría base.

## 7. Limitaciones

Muestra de 14 de ~56 forks. Comparación por hash de blob y clasificación por nombre de módulo
+ barrido de patrones con verificación dirigida; **no** se hizo revisión manual línea por línea
de cada fork ni se ejecutó ninguno. Las estrellas son aproximadas (snapshot 2026-11-19). La
caracterización de los forks weaponizados se apoya en nombres de módulos y en reportes
públicos corroborantes; no se reprodujo ningún payload.

---

*Aviso: informe de investigación y docencia. Análisis estático; sin ejecución ni
reproducción de código ofensivo. No es asesoramiento legal.*
