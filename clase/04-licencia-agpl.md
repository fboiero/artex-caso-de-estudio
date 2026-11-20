# 04 — Licencia AGPL-3.0: qué implica

ARTEX se publicó bajo **GNU Affero General Public License v3.0 (AGPL-3.0)**. Entender esta
licencia es parte del caso de estudio: afecta qué se puede y qué no se puede hacer con el
código.

## Qué es la AGPL

Es una licencia **copyleft fuerte con cláusula de red**. Respecto de la GPL, agrega que si
ofrecés como **servicio accesible por red** un software derivado del código AGPL, estás
obligado a poner a disposición de los usuarios el **código fuente completo** de ese derivado,
bajo la misma licencia.

Es decir: no alcanza con "no distribuir binarios". El solo hecho de **ofrecerlo como SaaS**
dispara la obligación de liberar el fuente.

## Consecuencias prácticas

- **Forkear y estudiar:** permitido. Tener una copia privada para leer no genera obligación.
- **Reutilizar código en un producto comercial de red:** haría que ese producto quede
  alcanzado por la AGPL, con la obligación de liberar su código fuente. Para un producto
  propietario que se vende, es incompatible.
- **Las ideas no tienen copyright.** Se puede estudiar la arquitectura y **reimplementar los
  conceptos desde cero** en código propio. Lo que no se puede es copiar o adaptar el código.

## Regla operativa

> Separación estricta: un repo de estudio de ARTEX y el código de cualquier producto
> propietario **no se tocan entre sí**. De ARTEX salen ideas documentadas, nunca líneas de
> código. Quien implemente en un producto propietario no debe trabajar copiando desde el
> fuente de ARTEX abierto al lado.

## Aviso

Esto es un resumen con fines docentes, no asesoramiento legal. Para decisiones de producto,
validar con el área legal correspondiente.

## Fuentes

- https://www.gnu.org/licenses/agpl-3.0.html
- https://socradar.io/blog/artex-ai-pentest-tool-what-security-teams-need-to-know/
