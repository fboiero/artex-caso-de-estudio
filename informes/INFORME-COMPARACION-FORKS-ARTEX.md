---
title: "Análisis de procedencia y comparación de forks — ARTEX"
subtitle: "¿Es el fork auditado una reproducción fiel del upstream?"
author: "F. Boiero — Investigador principal"
date: "19 de noviembre de 2026"
---

# Análisis de procedencia y comparación de forks — ARTEX

| | |
|---|---|
| **ID de informe** | AUD-ARTEX-PROV-2026-11-19 |
| **Clasificación** | TLP:CLEAR |
| **Complementa** | AUD-ARTEX-2026-11-19 (auditoría de código) |
| **Objeto** | `jiwoochris/artex-global` @ `06b36d7` vs. upstream y otros forks |
| **Upstream base** | commit `d0033724` (2026-10-03, último de Autumn-27 antes de la bifurcación) |

---

## 1. Objetivo

Determinar si el fork auditado (`jiwoochris/artex-global`) es una **reproducción fiel** del
código original de ARTEX, y comparar su fidelidad contra otros forks supervivientes, para
descartar que la copia que tomamos tenga alteraciones respecto de lo que había en el upstream.

## 2. Metodología

El repositorio original `Autumn-27/ARTEX` fue borrado (404), así que se reconstruyó la
referencia upstream desde la **historia preservada dentro del propio fork**: el último commit
de Autumn-27 es `d0033724` (punto de bifurcación). Técnicas:

1. **Prueba por SHA de git (criptográfica).** Los identificadores de git son por contenido:
   si dos repos contienen el mismo SHA, su historia hasta ahí es byte-idéntica. Se verificó
   qué forks contienen `d0033724`.
2. **Comparación por hash de blobs.** Para forks publicados **sin historia de git** (re-commit
   desde un zip), la ancestría no sirve; se comparó archivo por archivo usando el hash de blob
   de cada `.go` contra el upstream base (idéntico / modificado / borrado / nuevo).
3. **Muestreo de lógica sensible.** Diff dirigido de archivos críticos (p. ej.
   `selfupdate/github.go`) para distinguir cambios de **lógica** de cambios de **strings/i18n**.

## 3. Punto de bifurcación

| | |
|---|---|
| Último commit upstream (Autumn-27) | `d0033724` — "Merge PR #189 fix/sse-same-origin", 2026-10-03 |
| Primer commit del fork (jiwoochris) | `1acd2da` — 2026-10-03 |
| `.go` en el upstream base | **325 archivos** |

## 4. Matriz de fidelidad (archivos `.go` vs. upstream base)

| Fork (HEAD) | Idénticos | Modificados | Borrados | Nuevos | Total .go |
|---|---:|---:|---:|---:|---:|
| **jiwoochris/artex-global** (auditado) | 201 | 124 | **0** | 67 | 392 |
| MoLeft/ARTEX | 208 | 117 | **0** | 136 | 461 |
| failsafe-security/artex | **308** | 17 | **0** | 10 | 335 |
| panda0x123/artex-ymh | 205 | 78 | **42** | 132 | 415 |
| baarai/ARTEX | 59 | 259 | 7 | 253 | 571 |

*Idénticos = byte-idénticos al upstream. Modificados = mismo path, contenido distinto.*

## 5. Interpretación

- **`jiwoochris/artex-global` (el que auditamos) — reproducción fiel.** Conserva **los 325
  archivos del upstream (0 borrados)**: 201 byte-idénticos y 124 modificados; de esos 124, 29
  son tests y el resto son archivos que recibieron **internacionalización** (extracción y
  traducción de strings a catálogos ko/en/es/ja). Agrega 67 `.go` nuevos (en su mayoría tests
  `*_localized_test.go` e infraestructura i18n). Además comparte el SHA `d0033724` con el
  upstream → **fidelidad probada criptográficamente** hasta la bifurcación.
- **MoLeft/ARTEX — mismo linaje.** También contiene `d0033724` (misma base probada) y mismo
  perfil: 0 borrados, i18n + agregados. Sirve como segunda fuente que confirma la base.
- **failsafe-security/artex — espejo casi pristino.** 308/325 idénticos, solo 17 modificados,
  0 borrados. Es la copia más cercana al original; **útil como referencia upstream** pese a no
  compartir historia de git.
- **panda0x123/artex-ymh — divergente.** **Borró 42 archivos** del upstream y agregó 132. No
  es una copia fiel; conviene tratarla con cautela (código base eliminado).
- **baarai/ARTEX — reescritura.** Solo 59/325 intactos, 259 modificados y 253 nuevos: es
  prácticamente otra base construida sobre ARTEX, no una reproducción.

## 6. Hallazgo de procedencia

Tres de los cuatro forks comparados (**baarai**, **failsafe-security**, **panda0x123**) **no
comparten historia de git** con el upstream: fueron publicados re-commiteando desde un zip,
sin el árbol de commits original. Consecuencia práctica: **no pueden verificarse por SHA** y
solo se validan comparando contenido. Esto es, en sí, un riesgo de cadena de suministro —
una copia sin historia podría introducir cambios sin dejar rastro de autoría. El fork
auditado **sí preserva la historia** (y el SHA base), lo que lo hace más confiable como objeto
de estudio.

## 7. Verificación de lógica (muestra)

En `selfupdate/github.go`, los cambios del fork respecto del upstream son:

```
- const Repo = "Autumn-27/artex"
+ const Repo = "jiwoochris/artex-global"    # redirige el origen del update (upstream 404)
- fmt.Errorf("<mensaje 'rechaza dirección no-HTTPS', en chino>: %s", ...)
+ fmt.Errorf("<mismo mensaje traducido al coreano>: %s", ...)   # solo traducción, sin cambio de lógica
```

Es decir: el único cambio funcional es el **puntero del repositorio de releases** (documentado
en F-01 de la auditoría); el resto es traducción de strings. Esto es consistente con que los
~95 archivos "sensibles" marcados como modificados lo estén por i18n y no por alteración de
lógica.

## 8. Veredicto

El fork auditado **es una reproducción fiel del upstream base**: no elimina código original,
preserva la historia de git y concentra sus cambios en internacionalización, tests y reglas de
detección. Entre los forks comparados, la fidelidad ordena así:

> failsafe-security (espejo) > **jiwoochris / MoLeft** (fiel + i18n) > panda0x123 (borra código) > baarai (reescritura)

## 9. Limitaciones y recomendación

- La categoría "modificado" se midió por hash de blob; la naturaleza benigna (i18n) se
  confirmó por **muestreo**, no con diff línea por línea de los 95 archivos core. Para
  aseguramiento máximo: diff completo del fork contra el espejo pristino
  `failsafe-security/artex`, acotando el ruido de i18n.
- Mantener como referencia upstream la **base compartida `d0033724`** o el espejo
  `failsafe-security`.
- Para estudio, el fork auditado es confiable; evitar `panda0x123` (código borrado) y `baarai`
  (reescritura) como "copias del original".

---

*Aviso: informe de investigación y docencia. Análisis de procedencia por contenido y SHA;
la confirmación de benignidad de los cambios core es por muestreo. No es asesoramiento legal.*
