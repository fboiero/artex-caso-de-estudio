# 08 — Metodología de desarrollo y enseñanzas

Síntesis para cerrar el caso con los alumnos.

## Arquitectura por capas (de un vistazo)

```
ScopeSentry ──▶ Grafos (assets + exploración) ──▶ Planner ──▶ Workers ×N (nmap, HTTP, shell)
                         ▲                                           │
                         └───────── realimenta hallazgos ───────────┘

            Debajo: Norma (harness de agentes en Go) + LLM externo (DeepSeek / Claude / Ollama)
            Transversal: proxy que graba el tráfico · gates de aprobación · presupuesto de tokens
```

## Cómo se construye un pentest agéntico

- **Harness reutilizable (Norma):** separa tres cosas que no hay que mezclar — el *cerebro*
  (LLM), las *herramientas* (tools) y la *orquestación* (planner/workers). Permite cambiar
  cualquiera sin reescribir el resto.
- **Skills como binarios:** cada herramienta vive desacoplada en `./skills/`, se descubre en
  runtime y se puede intercambiar (hot-swap).
- **LLM agnóstico:** el modelo es un conector, no el núcleo. Hoy DeepSeek, mañana otro.
- **Spec-Driven Development (plausible):** especificar → generar → iterar. El autor construyó
  ARTEX sobre su propio harness, un patrón típico del desarrollo asistido por agentes.

## Qué se llevan los alumnos

1. **La herramienta de seguridad también es superficie de ataque.** ARTEX ejecuta ofensiva
   autónoma pero expone su consola, no cifra tokens y no se aísla.
2. **Un control en el prompt no es un control.** El alcance tiene que imponerse en una capa que
   el agente no pueda eludir (red, sandbox, allowlist).
3. **Doble uso y responsabilidad.** Publicar una herramienta ofensiva potente tiene
   consecuencias; el takedown no alcanza una vez que los forks circulan.
4. **Las licencias importan.** ARTEX es AGPL-3.0 (copyleft de red); Norma es Apache-2.0.
   Determinan qué se puede reutilizar y qué no.
5. **La IA no inventa técnicas nuevas:** comprime el tiempo y democratiza el ataque. La defensa
   pasa por higiene de secretos, hardening, imposición técnica del alcance y detección de la
   actividad agéntica.

## Separar "con qué se construyó" de "con qué se operó"

- **Construcción (el autor):** Go, monolito + Next.js, agentes sobre Norma. Metodología exacta
  del autor: no documentada.
- **Operación (los atacantes):** sesiones de Claude Code, metodología en documentos markdown
  (estilo skills), backend primario DeepSeek. Se hallaron logs de Claude Code y configs de
  ARTEX en su infraestructura.

Esta distinción es la mejor lección epistemológica del caso: dónde termina la evidencia y
empieza la inferencia.
