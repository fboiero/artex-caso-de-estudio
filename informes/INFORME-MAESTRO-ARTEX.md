---
title: "ARTEX — Informe de estado actual"
subtitle: "Revisión, procedencia y auditoría comparativa de forks (consolidado)"
author: "F. Boiero — Investigador principal"
date: "19 de noviembre de 2026"
---

# ARTEX — Informe de estado actual

| | |
|---|---|
| **ID de informe** | AUD-ARTEX-MASTER-2026-11-19 |
| **Clasificación** | TLP:CLEAR |
| **Consolida** | AUD-ARTEX-2026-11-19 (auditoría), AUD-ARTEX-PROV (procedencia), AUD-ARTEX-FORKS (forks) |
| **Objeto** | ARTEX (framework de pentest autónomo con IA) y su ecosistema de forks |
| **Corte de información** | 19 de noviembre de 2026 |

---

## 1. Resumen ejecutivo

ARTEX es un framework open source de pentest autónomo basado en agentes de IA. Tras hacerse
célebre por su uso en ataques reales y una alerta FLASH del FBI (FLASH-20261113-001), se
auditó su código, su procedencia y su ecosistema de forks. Conclusiones centrales:

1. **El código base no contiene backdoor** identificable; el historial de "herramienta con
   backdoor" aplica a **imágenes de terceros** y al **uso ofensivo**, no al fuente. Verificado
   también por terceros (BadByte: el fuente de GitHub coincide con el upstream).
2. **El riesgo es por fork.** El ecosistema va de reproducciones fieles y variantes
   **endurecidas/defensivas** hasta forks **weaponizados** (reverse shells, webshells cifrados,
   C2). El **borrado de código** respecto del upstream es el mejor predictor de riesgo.
3. **El fork que adoptamos para estudio (`jiwoochris/artex-global`) es fiel** (0 archivos
   borrados; cambios de i18n, tests y reglas de detección).
4. **El ecosistema se descentralizó:** el autor ya no lo controla; forks mantenidos superan el
   último release upstream (v0.3.29 / v0.4.5 / v0.5.1) con actividad en noviembre 2026.

Apto para **estudio en laboratorio aislado**; **no apto** para entornos productivos/conectados.

---

## 2. Estado actual del ecosistema (noviembre 2026)

- **Escala.** Wiz Research contó **más de 12.000 forks** en GitHub al 8 de octubre (incluye
  copias de botón "fork"). De ese universo, decenas son re-subidas mantenidas/notables; este
  informe audita 14 representativas.
- **Exposición.** Censys contó **1.465 consolas ARTEX** expuestas a internet al 4 de noviembre
  (~815 despliegues distintos tras descontar dos bloques idénticos). El FBI cita 1.600+.
- **Co-ubicación con C2.** El **10,6%** de esos hosts también alojaba otras herramientas
  ofensivas — **Vshell, Cobalt Strike, Adaptix C2** (CSA, 16-nov).
- **Versiones.** Forks mantenidos alcanzaron **v0.3.29, v0.4.5 y v0.5.1**, con commits de
  noviembre 2026; el código lo sostiene hoy una **comunidad descentralizada**.
- **Distribución de imágenes.** ~34 namespaces en Docker Hub con imágenes "artex" (~60.000
  pulls combinados). **Docker retiró la imagen el 5 de noviembre** a pedido de BadByte.
- **Modelos observados.** **DeepSeek v4.1-flash** (primario en el caso Corea), **GLM-5.3**
  (Zhipu), **Grok 4.6**, y un modelo comercial no identificado (Vapor Panda).
- **Incidentes recientes.** El 13-nov Amazon mostró agentes ARTEX **robando claves de API de
  IA a escala industrial** (las claves robadas pagaban la factura de IA de los propios
  agentes). **AntiFox** (fork de ARTEX 0.1.1) se usó en **robo de credenciales en AWS**;
  Arctic Wolf vinculó hosts de Alibaba Cloud con AntiFox a intrusiones (10-nov). **Barracuda**
  fue nombrada (16-nov) entre las organizaciones afectadas, junto a ConnectWise.
- **Respuesta.** El FBI publicó FLASH-20261113-001 (13-nov) y la oficina de **Dallas lo
  reposteó el 17-nov**. No hay CVE: es herramienta de doble uso, no una vulnerabilidad.

---

## 3. Auditoría de código del fork base

**Objeto:** `jiwoochris/artex-global` @ `06b36d7` - **Método:** revisión estática manual
(OWASP Code Review), sin ejecución.

**Veredicto: sin evidencia de backdoor ni código malicioso en el fuente.**

| Control | Resultado |
|---|---|
| Reverse shells / `/dev/tcp` / `nc -e` | No se encontraron |
| Ofuscación / `eval`+`base64 -d` de payloads | No (única ocurrencia: string de demo en UI) |
| `curl\|bash` malicioso | No (instaladores legítimos: NodeSource, Docker) |
| Secretos hardcodeados | No |
| Beacon/telemetría encubierta al arranque | No se encontró en `cmd/` ni `server/` |
| Binarios precompilados commiteados | Ninguno (el CI compila desde fuente) |
| Dependencias | Todas conocidas y de uso extendido |

**Riesgos residuales (no son backdoors):**

| ID | Hallazgo | Severidad |
|---|---|---|
| F-01 | Auto-update valida SHA256SUMS del mismo release, sin firma independiente | Media |
| F-02 | Alcance impuesto en capa de aplicación, no de red | Media |
| F-03 | Confianza en imagen GHCR no auditada (usar compilación propia) | Media |
| F-04 | Canales de notificación (Telegram/DingTalk) = posible exfiltración | Baja |
| F-05 | Puerto configurable `ARTEX_BIND=0.0.0.0` (default seguro 127.0.0.1) | Baja |
| F-06 | GitHub Actions ancladas por versión mayor, no por SHA | Baja |

Este fork, además, es más maduro que el original: contacto de abuso, *fail-toward-human* en
intercepción, y auto-update con SHA256 + *smoke test* + *rollback*.

---

## 4. Procedencia y fidelidad al upstream

**Punto de bifurcación:** commit `d0033724` (último de Autumn-27, 3-oct), con **325 archivos
`.go`**. Método: comparación por **hash de blob** (cross-repo, content-addressed) y prueba de
**SHA de git** (dos repos con el mismo SHA => historia idéntica).

- **`jiwoochris` (auditado) es reproducción fiel:** conserva los 325 archivos (**0 borrados**),
  201 byte-idénticos y 124 modificados (29 tests + i18n). Comparte el SHA base → **fidelidad
  probada criptográficamente**. En `selfupdate/github.go`, el único cambio funcional es el
  puntero del repo de releases; el resto son strings traducidos.
- **`MoLeft`** comparte el mismo SHA base (segunda fuente que confirma el upstream).
- **Hallazgo de procedencia:** varios forks se publicaron **sin historia de git** (re-commit
  desde zip), por lo que **no se verifican por SHA**, solo por contenido — un riesgo de cadena
  de suministro en sí mismo.

---

## 5. Auditoría comparativa de forks (14)

Comparación por hash de blob vs. base `d0033724` + barrido de patrones (con control de falsos
positivos: se descartó una señal "C2" uniforme que matcheaba módulos internos, y
`intercept/risk.go`, que es la lógica de scoring de riesgo de la propia herramienta).

| Fork | Idént | Modif | Borra | Nuevos | Clasificación |
|---|---:|---:|---:|---:|---|
| horizonl/ARTEX | 321 | 4 | 0 | 0 | Espejo fiel |
| failsafe-security/artex | 308 | 17 | 0 | 10 | Espejo fiel |
| D4rk-3ch0/artex-c | 304 | 21 | 0 | 30 | **Endurecido (defensivo)** |
| 2561769445/ycode | 267 | 58 | 0 | 81 | Fiel + ofensivo leve |
| RuoJi6/ARTEX | 231 | 94 | 0 | 122 | Baseline mantenido |
| MoLeft/ARTEX | 208 | 117 | 0 | 136 | Fiel + i18n |
| **jiwoochris/artex-global** | 201 | 124 | 0 | 67 | Fiel + i18n (auditado) |
| acheong08/artex | 98 | 227 | 0 | 2 | Espejo (reformateado) |
| lyrisoft/artex-hardened | 67 | 251 | 7 | 181 | Endurecido (declarado) |
| cskwork/scopeweaver | 67 | 258 | 0 | 483 | Rebrand EN/KO (quita OPSEC) |
| BaaRai/ARTEX | 59 | 259 | 7 | 253 | Reescritura (v0.6, con approval gate) |
| chu0119/Pojun | 134 | 189 | 2 | 259 | **Ofensivo (C2)** |
| panda0x123/artex-ymh | 205 | 78 | **42** | 132 | **Weaponizado** |
| ChathurangaBW/antifox | 6 | 94 | **225** | 147 | **Despojado (AntiFox)** |

**Taxonomía (3 niveles):**

- **Fieles / espejos:** horizonl, failsafe-security, acheong08, RuoJi6 — reproducen sin borrar.
- **Traducciones / endurecidos:** jiwoochris, MoLeft, BaaRai, cskwork (i18n/rebrand);
  **D4rk-3ch0/artex-c** suma honeypot-detection, revisión de egress y anti-trampa — los
  controles que recomendamos; `lyrisoft/artex-hardened` declara endurecimiento.
- **Weaponizados:** `panda0x123` (reverse shell, webshell cifrado, tunneling; -42 archivos),
  `chu0119/Pojun` (consola C2), `ChathurangaBW/antifox` (AntiFox; -225 archivos; usada en robo
  de credenciales AWS).

---

## 6. Conclusiones

1. No hay backdoor en el código base; **el riesgo es por fork**.
2. **El borrado de código predice el riesgo:** los fieles borran 0; los weaponizados, decenas
   o cientos.
3. Separar **con qué se construyó** (Go + Norma) de **con qué se operó** (Claude Code /
   DeepSeek).
4. **Un control en el prompt no es un control:** el alcance debe imponerse en la red.
5. El ecosistema se **descentralizó** y **supera al autor original**; la defensa es por
   comportamiento (IoCs, egress, consolas expuestas), no por nombre de repo.

---

## 7. Recomendaciones

- Para estudio: usar un fork **fiel** (horizonl, failsafe-security, RuoJi6, jiwoochris) o el
  **endurecido** `D4rk-3ch0/artex-c`. Evitar los weaponizados salvo análisis en entorno aislado.
- **Verificar qué borra** un fork respecto del upstream antes de confiar en él.
- **Compilar desde fuente**; nunca imágenes de terceros (`tomicdd`, `congdonglinux`).
- **Desactivar el auto-update** o fijar versión; mantener bind `127.0.0.1`.
- **Detección:** buscar por comportamiento, no por nombre (los forks se renombran). IoCs:
  consola 8787/8788 expuesta, egress a notificadores, co-ubicación con C2 conocidos.

---

## 8. Apéndice — Evidencia (nuestra auditoría)

```
git rev-parse HEAD                     # 06b36d7
git rev-list --count HEAD              # 801 commits
git ls-files '*.go' | wc -l            # 392 archivos
# fidelidad: ls-tree -r <ref> | hash de blob .go, comparado vs base d0033724 (325 .go)
# patrones: grep /dev/tcp, nc -e, base64_decode, webshell, reverse shell
# selfupdate: const Repo = "jiwoochris/artex-global"; verifyStaged (SHA256 + smoke + rollback)
```

## 9. Fuentes (estado actual)

- Cloud Security Alliance — "ARTEX and Its Forks" (2026-11-16)
- SOCRadar — "ARTEX AI Pentest Tool" (act. 2026-11-16)
- Brandefense — "ARTEX Detection Playbook" (2026-11-19)
- Ostorlab — "ARTEX: How a Free AI Pentest Framework Became an Attacker Staple"
- AgentBeam — "FBI FLASH ARTEX: TTPs and IOCs" (act. 2026-11-17)
- TechTimes / TechCrunch — cobertura FBI FLASH (2026-11-16)
- FBI IC3 — FLASH-20261113-001

---

*Aviso: informe de investigación y docencia. Análisis estático; sin ejecución ni reproducción
de código ofensivo. El estado del ecosistema cambia rápido; datos al corte indicado. No es
asesoramiento legal.*
