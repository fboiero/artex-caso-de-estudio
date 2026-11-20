# ARTEX — Hoja de ruta del caso (handout)

**Seguridad Informática · UTN FRVM** — para llevarse y consultar durante el práctico.

---

## Qué es
ARTEX: framework open source de **pentest autónomo con agentes de IA**, en Go. Publicado en
julio 2026 por *Autumn-27* (autor también de ScopeSentry). Señalado por una **alerta FLASH del
FBI** (nov 2026) por uso malicioso generalizado.

## Cómo funciona (en una línea)
`ScopeSentry (recon) → grafos de assets → Planner → Workers con tools reales → Retest`,
con los agentes corriendo sobre **Norma** (harness en Go) y un **LLM externo** intercambiable.

## Tres ejes del caso
| Eje | Idea central |
|---|---|
| **Técnico** | Skills como binarios, planner/workers, LLM agnóstico |
| **Seguridad del tooling** | Scope blando, puerto expuesto, tokens sin cifrar, imágenes con backdoor |
| **Ético-legal** | Doble uso, responsabilidad del autor, licencias (AGPL vs Apache) |

## 5 cosas para recordar
1. La herramienta de seguridad **también es superficie de ataque**.
2. Un control **en el prompt no es un control**: imponer el alcance en la **red**.
3. **Doble uso:** publicar ofensiva potente tiene consecuencias; el takedown no frena a los forks.
4. **Las licencias importan:** ARTEX es AGPL-3.0; Norma, Apache-2.0.
5. La IA **no inventa técnicas**: comprime el tiempo y democratiza el ataque.

## Construido vs. operado
- **Construido (autor):** Go + Next.js embebido + PostgreSQL; agentes sobre Norma.
- **Operado (atacantes):** sesiones de Claude Code, metodología en markdown, backend DeepSeek.

## Reglas del práctico
- **No** ejecutar ARTEX contra objetivos externos.
- **No** usar imágenes precompiladas de terceros (`tomicdd/artex`, `congdonglinux/artex`).
- Solo **lectura de código**; si hay hands-on, laboratorio aislado con blancos propios (DVWA,
  Juice Shop).

## Casos y FBI (datos clave)
Corea del Sur (bancos), Vapor Panda (200+ orgs), Storm-0940 (ConnectWise → 2.250+ tenants M365).
**FBI FLASH-20261113-001:** uso desde agosto, 10 sectores críticos, **acceso privilegiado en
< 3 horas**, 1.600+ consolas expuestas.
