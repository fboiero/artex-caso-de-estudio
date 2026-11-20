# 03 — De research a arma: cronología (2026)

ARTEX muestra, en pocos meses, el ciclo de vida de una herramienta ofensiva de doble uso:
publicación con intención legítima → adopción por atacantes → takedown del autor →
persistencia vía forks.

| Fecha | Hecho |
|---|---|
| **26 jul** | El dev **Autumn-27** publica ARTEX en GitHub, en Go, bajo **AGPL-3.0**. Pensado para aprendizaje y pruebas sobre activos autorizados. |
| **fin ago** | Mandiant observa abuso temprano. |
| **3 oct** | **jiwoochris** publica el fork "ARTEX Global Edition" (inglés/coreano); llega a ~1.628 estrellas y ~1.920 forks. |
| **7 oct** | Primer uso reportado contra firmas financieras de Corea del Sur; robo de datos de clientes. |
| **8 oct** | El autor **cierra el código** citando abuso. Los forks ya circulan. |
| **17 oct** | **Vapor Panda** (China-nexus): campaña contra **200+ organizaciones** en al menos 14 países, 9 comprometidas confirmadas. |
| **19 oct** | ~20 empresas japonesas vinculadas a actividad ARTEX. |
| **21 oct** | **Storm-0940** abusa credenciales de ConnectWise Cloud Backup contra **2.250+ tenants** de Microsoft 365. |
| **26 oct** | Banda de Seúl reportada por robo de ~8,2 millones de registros. |
| **2 nov** | WorkOS divulga una brecha vinculada a ARTEX en una app interna de ventas. |
| **4 nov** | ~1.465 consolas ARTEX expuestas en internet. |
| **13 nov** | El **FBI** emite una alerta **FLASH** por uso malicioso generalizado desde al menos agosto. |

## Derivados que persisten

- **ARTEX Global Edition** (jiwoochris) — fork localizado.
- **ScopeWeaver** y **ARTEX PRO** (edición paga) — usados por varios actores.
- **AntiFox** — herramienta construida sobre código de ARTEX.
- Imágenes con backdoor: `tomicdd/artex`, `congdonglinux/artex`.

## Preguntas de debate

1. ¿El autor es responsable del abuso de una herramienta que publicó con fines legítimos?
2. ¿Cerrar el código sirvió de algo, si los forks ya estaban distribuidos?
3. ¿Dónde está la línea entre investigación ofensiva publicable y facilitación del delito?

## Fuentes

- https://socradar.io/blog/artex-ai-pentest-tool-what-security-teams-need-to-know/
- https://darkreading.com/cyberattacks-data-breaches/artex-ai-pen-test-tool-hackers-weapon
- https://www.obsidiansecurity.com/blog/artex-and-the-rise-of-agentic-exploitation-hours-not-days-to-privileged-access
- https://explainx.ai/blog/artex-global-edition-fork-autonomous-pentest-agent-korean-bank-hacks-2026

## Actualización — estado actual (noviembre 2026)

- **4 nov:** Censys contabiliza 1.465 consolas expuestas (~815 despliegues distintos).
- **5 nov:** Docker retira la imagen oficial a pedido de BadByte.
- **13 nov:** FBI FLASH-20261113-001; Amazon muestra robo de claves de API de IA a escala industrial.
- **16 nov:** CSA publica "ARTEX and Its Forks"; se nombra a Barracuda entre las afectadas.
- **17 nov:** el FBI (Dallas) repostea la alerta FLASH.
- **Estado del ecosistema:** forks mantenidos ya superan el último release upstream (v0.3.29 / v0.4.5 / v0.5.1); Wiz contó 12.000+ forks; el 10,6% de las consolas expuestas co-aloja otros C2 (Vshell, Cobalt Strike, Adaptix).
