---
title: "Auditoría de seguridad de código — ARTEX (fork artex-global)"
subtitle: "Revisión estática de código en busca de backdoors y código malicioso"
author: "F. Boiero — Investigador principal"
date: "19 de noviembre de 2026"
---

# Auditoría de seguridad de código — ARTEX

| | |
|---|---|
| **ID de informe** | AUD-ARTEX-2026-11-19 |
| **Clasificación** | TLP:CLEAR |
| **Tipo** | Revisión estática de código fuente (SAST manual) |
| **Artefacto** | Fork `jiwoochris/artex-global` de ARTEX |
| **Commit auditado** | `06b36d7219244c5e2b6467394f60eca160c785cf` |
| **Fecha** | 2026-11-19 |
| **Metodología** | OWASP Code Review, revisión manual dirigida |
| **Veredicto** | **Sin evidencia de backdoor ni código malicioso en el fuente** (riesgos residuales de diseño y cadena de suministro documentados abajo) |

---

## 1. Resumen ejecutivo

Se auditó el código fuente del fork `jiwoochris/artex-global` de **ARTEX**, un framework de
pentest autónomo con agentes de IA señalado por una alerta FLASH del FBI
(FLASH-20261113-001) por uso malicioso generalizado. El objetivo fue determinar si el
**código** contiene puertas traseras, mecanismos de exfiltración o lógica maliciosa
insertada.

**Conclusión:** no se encontró backdoor, reverse shell, beacon de telemetría, secretos
embebidos ni binarios precompilados sospechosos en el repositorio. El historial de abuso
documentado públicamente se vincula a **imágenes precompiladas de terceros**
(`tomicdd/artex`, `congdonglinux/artex`) y al **uso operativo** de la herramienta por
atacantes, **no al código fuente de este fork**. Este fork, además, incorpora prácticas de
seguridad más maduras que el original (contacto de abuso, verificación de integridad en el
auto-update, *fail-toward-human* en reglas de intercepción).

Se identificaron **riesgos residuales** (no son backdoors): la confianza del auto-update en
un único release, la imposición del alcance en capa de aplicación (no de red) y canales de
notificación que pueden servir de exfiltración si un operador los configura. Ninguno
representa compromiso del código; se listan con recomendaciones de mitigación.

**Riesgo global:** Medio-bajo para estudio en laboratorio aislado; **no apto** para ejecución
en entornos productivos o conectados.

---

## 2. Alcance y metodología

**En alcance:**
- Código fuente Go (392 archivos, ~65.135 LOC sin tests) del commit indicado.
- Pipeline de construcción (`.github/workflows/`), `Dockerfile`, `start.sh`, `install.sh`.
- Dependencias declaradas (`go.mod`).
- Configuración de despliegue (`docker-compose.yml`).

**Fuera de alcance:**
- La **imagen precompilada** publicada en GHCR (`ghcr.io/jiwoochris/artex-global`): no se
  analizó el binario resultante, solo el fuente del que debería derivar.
- Análisis dinámico / ejecución (la herramienta **no** se ejecutó, por política).
- Diff línea por línea contra el upstream (se hizo revisión dirigida de alta señal).

**Técnicas aplicadas:**
- Búsqueda de patrones de ejecución remota y ofuscación (`curl|bash`, `/dev/tcp`, `nc -e`,
  `eval`/`base64 -d`).
- Inventario de hosts y endpoints hardcodeados.
- Revisión del mecanismo de auto-actualización (vector de ejecución de código).
- Escaneo de secretos commiteados.
- Revisión de la cadena de suministro (CI/CD, publicación de artefactos).
- Revisión de telemetría/beacons al arranque.

**Limitaciones:** revisión manual dirigida, no exhaustiva. La ausencia de hallazgos no
garantiza ausencia total de defectos; garantiza que los vectores de mayor señal fueron
revisados sin resultado positivo.

---

## 3. Objeto auditado (identidad del artefacto)

| Atributo | Valor |
|---|---|
| Módulo Go | `github.com/Autumn-27/artex` (go 1.26.3) |
| Commit (HEAD) | `06b36d7` — 2026-11-20, "fix(selfupdate): point the release source at a repository that exists" |
| Commits totales | 801 |
| Tags | `v0.3.15-global.1`, `v0.3.15-ko.1` |
| Contribuidores principales | Autumn-27 (upstream), jiwoochris (fork), pphua, RuoJi6 |
| Dependencias notables | `Autumn-27/norma` v0.4.4 (harness de agentes), `go-mitmproxy` (proxy), `pgx` (PostgreSQL), `projectdiscovery/dnsx·cdncheck` (recon), `modernc.org/sqlite` |

Todas las dependencias son proyectos conocidos y de uso extendido. No se observaron
dependencias desconocidas, typosquatting ni réplicas sospechosas.

---

## 4. Hallazgos

| ID | Hallazgo | Severidad | Tipo |
|---|---|---|---|
| F-01 | Auto-update sin firma criptográfica independiente | Media | Cadena de suministro |
| F-02 | Alcance impuesto en capa de aplicación, no de red | Media | Diseño |
| F-03 | Confianza en imagen GHCR no auditada | Media | Operacional |
| F-04 | Canales de notificación como posible exfiltración | Baja | Diseño |
| F-05 | Exposición de puerto configurable (`ARTEX_BIND=0.0.0.0`) | Baja | Configuración |
| F-06 | GitHub Actions ancladas por versión mayor, no por SHA | Baja | Cadena de suministro |
| F-07 | Identidad placeholder en un commit (`developer@example.com`) | Informativa | Procedencia |

### F-01 · Auto-update sin firma criptográfica independiente — Media
El paquete `selfupdate` descarga nuevas versiones desde GitHub Releases del repo
**hardcodeado** `jiwoochris/artex-global` y valida el binario contra un `SHA256SUMS`
publicado **en el mismo release**. Hay verificación de integridad (SHA256), *smoke test* y
*rollback*, pero **no** una firma criptográfica independiente del canal de distribución.
- *Evidencia:* `selfupdate/github.go:19` → `const Repo = "jiwoochris/artex-global"`;
  `selfupdate/bootstrap.go:160` `verifyStaged` (SHA256 + smoke test); `.github/workflows/release.yml:91`
  `sha256sum -- *.zip > SHA256SUMS`.
- *Impacto:* si la cuenta/release de origen se comprometiera, el updater aceptaría el binario
  malicioso (el checksum viajaría junto al artefacto).
- *Recomendación:* fijar versión y **desactivar el auto-update** en entornos de estudio; para
  uso real, exigir firma (minisign/cosign) y anclar el origen.

### F-02 · Alcance impuesto en capa de aplicación, no de red — Media
Existe manejo de alcance (`taskScopeAdd/Delete`, `addCompanyScope`, un *blocklist* global de
assets en `asset_intercept.go` y mensajes de "allowlist" por agente), pero la imposición es
**in-process**: depende de que el agente/herramientas respeten la lista, no de un límite de
red o sandbox.
- *Evidencia:* `server/asset_intercept.go:28` ("Global asset blocklist"); `agent/tools_insert.go:431`
  `addTaskScope`; `server/errmsg_catalog.go:78` ("no está en la lista de permitidos de este agente").
- *Impacto:* coincide con el hallazgo de CERT-EU sobre ARTEX: un alcance que no se impone en
  la red puede eludirse.
- *Recomendación:* para cualquier ejecución, confinar en red (allowlist a nivel
  infraestructura / sandbox sin salida).

### F-03 · Confianza en imagen GHCR no auditada — Media
El `docker-compose.yml` baja `ghcr.io/jiwoochris/artex-global`. El fuente es limpio, pero la
**imagen** no se auditó en este trabajo.
- *Evidencia:* `docker-compose.yml` → `image: ghcr.io/jiwoochris/artex-global:${ARTEX_TAG:-latest}`.
- *Recomendación:* **no** usar imágenes de terceros; **compilar desde fuente**
  (`CGO_ENABLED=0 go build`). Nunca `tomicdd/artex` ni `congdonglinux/artex` (backdoor conocido).

### F-04 · Canales de notificación como posible exfiltración — Baja
Módulos de notificación hacia Telegram, DingTalk, WeChat Work y Feishu. Son **opt-in** (exigen
token por configuración del usuario), no exfiltración embebida, pero constituyen un canal de
salida.
- *Evidencia:* `notify/telegram.go:93` `base = "https://api.telegram.org"`; token vía
  `SecretKeys() → bot_token` (config del usuario, no hardcodeado).
- *Impacto (defensivo):* egress a `api.telegram.org` / `oapi.dingtalk.com` desde un host de
  pentest es un **IoC** útil para detección.
- *Recomendación:* monitorear/bloquear ese egress; documentarlo como indicador.

### F-05 · Exposición de puerto configurable — Baja
Por defecto la consola liga a `127.0.0.1:8787` (seguro). La variable `ARTEX_BIND=0.0.0.0`
permite exponerla a toda interfaz.
- *Evidencia:* `docker-compose.yml` → `- "${ARTEX_BIND:-127.0.0.1}:8787:8787"`.
- *Recomendación:* dejar el bind por defecto; nunca `0.0.0.0` sin proxy inverso con TLS y auth.

### F-06 · Actions ancladas por versión mayor, no por SHA — Baja
El pipeline usa `actions/checkout@v4`, `softprops/action-gh-release@v2`, etc. (ancladas a
versión mayor, no a hash inmutable).
- *Recomendación:* anclar por SHA para endurecer la cadena de suministro del build.

### F-07 · Identidad placeholder en un commit — Informativa
Un commit figura con `FileShare Developer <developer@example.com>`. Sin impacto técnico; se
registra por trazabilidad de procedencia.

---

## 5. Lo que NO se encontró (controles negativos)

Verificado explícitamente y **sin resultado positivo**:

- **Backdoors / reverse shells:** sin `/dev/tcp`, `nc -e`, `bash -i`, sockets a C2.
- **Ofuscación / ejecución encubierta:** sin `eval`/`base64 -d` de payloads (la única
  ocurrencia de `base64 -d` es un *string* de demo en datos mock de la UI).
- **`curl|bash` malicioso:** los dos existentes son instaladores legítimos (NodeSource,
  Docker get.docker.com) dentro del `Dockerfile`/`install.sh`.
- **Secretos hardcodeados:** escaneo de tokens/llaves/credenciales sin hallazgos.
- **Beacon / telemetría al arranque:** sin llamadas de red encubiertas en `cmd/` ni
  `server/` al inicializar.
- **Binarios precompilados commiteados:** ninguno rastreado por git; el binario lo produce
  el CI desde fuente (lo que se lee es lo que se compila).
- **Dependencias sospechosas:** todas conocidas y de uso extendido.

---

## 6. Recomendaciones para manipularlo de forma segura

**Para estudio (recomendado):**
1. **No ejecutar.** Trabajar solo por lectura de código.
2. Clonar en un repositorio **privado**; conservar el `LICENSE` AGPL-3.0.
3. No copiar código a productos propietarios (contaminación AGPL — ver informe de licencia).

**Si se requiere ejecución (solo laboratorio):**
4. Entorno **aislado sin salida a internet**; blancos intencionalmente vulnerables y propios
   (DVWA, OWASP Juice Shop).
5. **Compilar desde fuente**, no usar imágenes de terceros. Jamás `tomicdd/*` ni
   `congdonglinux/*`.
6. **Desactivar el auto-update** o fijar una versión; no confiar en releases remotos.
7. Mantener el bind por defecto `127.0.0.1`; nunca `ARTEX_BIND=0.0.0.0`.
8. Monitorear egress (notificadores: Telegram/DingTalk/WeChat/Feishu) como IoC.
9. Tratar el puerto 8787 como superficie sensible: auth fuerte, TLS, sin exposición pública.

---

## 7. Conclusión

El fuente del fork auditado **no contiene código malicioso identificable**. La narrativa de
"herramienta con backdoor" aplica a **imágenes de terceros** y al **uso ofensivo** por
atacantes, no a este código. Los riesgos reales son de **cadena de suministro**
(auto-update, imagen GHCR) y de **diseño** (alcance no impuesto en red), mitigables con las
recomendaciones anteriores. El artefacto es apto para **estudio en laboratorio aislado** y
**no apto** para entornos productivos o conectados.

---

## 8. Apéndice — Evidencia (comandos ejecutados)

```
git rev-parse HEAD                         # 06b36d7…
git rev-list --count HEAD                  # 801 commits
git ls-files '*.go' | wc -l                # 392 archivos
grep -rE 'curl .*\| *sh|/dev/tcp/|nc +-e|base64 +-d'   # solo instaladores + demo mock
grep -rhoE 'https?://[^ ]+'                # hosts: notificadores + fixtures de test
sed -n Dockerfile / start.sh / install.sh  # sin lógica de descarga maliciosa
grep selfupdate/*.go (Repo, SHA256, verify)# update firmado por checksum, no por firma
git grep (api_key|secret|password|token)   # sin secretos hardcodeados
grep release.yml (SHA256SUMS, ghcr, build) # build desde fuente, publica checksums
grep (scope|allowlist|blocklist)           # enforcement in-app (asset_intercept.go)
grep (telemetry|beacon|http.Get) cmd/ server/  # sin beacon al arranque
```

---

*Aviso: informe con fines de investigación y docencia. Revisión estática manual, no
exhaustiva; la ausencia de hallazgos no constituye garantía absoluta. No es asesoramiento
legal.*
