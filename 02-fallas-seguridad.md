# 02 — Fallas de seguridad del propio ARTEX

Lección central para la clase: **una herramienta de seguridad también es superficie de
ataque.** ARTEX ejecuta operaciones ofensivas de forma autónoma pero descuida su propia
seguridad.

## Alcance "blando" (soft scope)

- Por defecto, el original bloquea objetivos `.gov` y `.edu` y retiene las acciones
  riesgosas para aprobación del operador.
- **CERT-EU encontró que no hay imposición técnica real del alcance:** los controles son
  "blandos", dependen de que el modelo coopere, no de la red ni del sistema.
- Al menos un fork publicita haber **quitado la blocklist**.

➡️ Enseñanza: un control de seguridad que vive en el prompt no es un control. Tiene que
imponerse en una capa que el agente no pueda eludir (red, sandbox, políticas).

## Exposición de red

- El `docker-compose` suministrado expone el puerto **8787 en todas las interfaces de red**,
  no solo en localhost. Investigadores contaron primero ~600, luego más de 3.600 instancias
  expuestas; el FBI citó más de 1.600 consolas expuestas a comienzos de noviembre.

## Datos sensibles sin proteger

- Los **tokens capturados no se cifran en reposo**.
- La extensión de captura manda los datos a localhost **por HTTP, sin TLS**.
- Truncamiento de datos a 256 KB, pero sin cifrado.

## Aislamiento y privilegios

- **No hay perfiles AppArmor, ni filtros seccomp, ni drop de privilegios** después de
  instalar las herramientas: una herramienta diseñada para ejecutar operaciones ofensivas
  autónomas corre con más privilegio del necesario.

## Cadena de suministro

- La procedencia de las herramientas se valida con **checksums SHA256 sin verificación de
  firma**.
- Tras el takedown, una copia en GitHub cambió una línea para que el Compose bajara una
  **imagen con backdoor**. Las imágenes troyanizadas identificadas son
  **`tomicdd/artex`** y **`congdonglinux/artex`**: el backdoor **no** está en el código
  fuente, solo en la imagen precompilada.

➡️ Enseñanza: nunca corras imágenes precompiladas de forks no confiables. Buildeá desde
fuente auditada o no ejecutes.

## Resumen para la diapositiva

| Falla | Riesgo | Cómo debería hacerse |
|---|---|---|
| Scope por prompt | Evasión trivial | Imposición en capa de red / allowlist |
| Puerto 8787 en 0.0.0.0 | Consola expuesta a internet | Bind a localhost + auth fuerte |
| Tokens sin cifrar | Robo de credenciales capturadas | Cifrado en reposo |
| HTTP sin TLS | Intercepción local | TLS incluso en loopback |
| Sin seccomp/AppArmor | Escalada / escape | Sandbox + menor privilegio |
| SHA256 sin firma | Cadena de suministro | Firma + verificación |

## Fuentes

- https://www.stepsecurity.io/blog/artex-ai-pentesting-tool-attackers-leaked-secrets
- https://starlog.is/articles/developer-tools/baarai-artex
- https://socradar.io/blog/artex-ai-pentest-tool-what-security-teams-need-to-know/
