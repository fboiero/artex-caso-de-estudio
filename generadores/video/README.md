# Video para alumnos — pipeline

Produce `ARTEX-para-alumnos.mp4` (~3:55, 1080p): placas de prensa + slides narradas, voz
ElevenLabs + música con ducking. Herramientas: **ffmpeg**, **Python (PIL, numpy)**, **pandoc/soffice**.

## Orden de construcción
1. **Deck → PNGs de escena.** Generar el deck (ver `../deck`), exportarlo a PDF y rasterizar las
   páginas usadas a 1920×1080:
   `pdftoppm -png -r 144 -f N -l N deck.pdf s-N` (las slides del motor PDCA y doble uso son las
   páginas 21 y 22 → `s-pdca.png`, `s-dualuse.png`).
2. **Recortes de prensa.** Capturar los artículos reales (screenshots de navegador) y guardarlos en
   `recortes/`. URLs usadas (todas atribuyen a ARTEX):
   - Korea/The Herald Business: https://biz.heraldcorp.com/article/10892497
   - CSO Online (2.250 tenants M365): https://www.csoonline.com/article/4239028/china-linked-hackers-used-agentic-ai-in-attack-on-2250-microsoft-365-tenants.html
   - BleepingComputer (FBI FLASH): https://www.bleepingcomputer.com/news/security/fbi-warns-artex-ai-hacking-tool-is-powering-global-cyberattacks/
   - Digital Shield (<3 h): https://www.escudodigital.com/en/cybersecurity/fbi-warns-of-artex-an-ai-agent-platform-capable-of-breaching-companies-in-under-3-hours.html
   - Healthcare IT News (sectores): https://www.healthcareitnews.com/news/fbi-warns-healthcare-and-other-sectors-agentic-ai-threat
   - SecureWorld: https://www.secureworld.io/industry-news/fbi-artex-flash-ai-attacks
   (⚠️ son material de terceros: usar solo como recorte/evidencia educativa, no redistribuir sueltos.)
3. **Placas.** `python3 gen_news2.py` (placas de noticias con el recorte enmarcado como ventana de
   navegador) y `python3 gen_stats.py` (placas de dato 8M / claves API).
4. **Voz.** Generar la narración `narration_full.txt` con ElevenLabs (voz "Ignacio", español) →
   `voz.mp3`. (No automatizable sin API key; se hizo manejando la cuenta vía navegador.)
5. **Música + mezcla con ducking:**
   ```bash
   DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 voz.mp3)
   python3 music_bed.py            # editar total = DUR + 2  -> bed.wav
   ffmpeg -i voz.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 -ac 1 voz_n.wav
   ffmpeg -i voz_n.wav -i bed.wav -filter_complex \
     "[1:a]volume=0.55[m];[m][0:a]sidechaincompress=threshold=0.04:ratio=7:attack=5:release=350[md];[0:a][md]amix=inputs=2:normalize=0:duration=longest[mix];[mix]apad=pad_dur=0.8,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
     -map "[a]" -ar 44100 -ac 2 final_audio.wav
   ```
6. **Render final.** `python3 build_final.py` — calcula duración de cada escena ∝ caracteres de su
   tramo de narración, renderiza cada escena (fades; zoom lento en las 2 largas), concatena con
   `-c copy` y muxea `final_audio.wav`. Produce `ARTEX-para-alumnos.mp4`.

## Archivos
- `build_final.py` — timeline + render + concat + mux (lista de escenas y pesos adentro).
- `gen_news2.py` — placas de prensa (requiere `recortes/`).
- `gen_stats.py` — placas de dato.
- `music_bed.py` — cortina Am–F–C–G (pad + arpegio + sub), normalizada. Editar `total`.
- `narration_full.txt` — guion completo (el mismo que se pega en ElevenLabs).
