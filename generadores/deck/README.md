# Deck — generador

`build_deck.js` genera `ARTEX-caso-de-estudio.pptx` (32 slides, con notas del orador) usando
**pptxgenjs**. Es autocontenido.

## Uso
```bash
npm install pptxgenjs        # si falta
node build_deck.js           # -> ARTEX-caso-de-estudio.pptx
```

## Notas de mantenimiento
- Paleta: NAVY `0E1526`, RED `E63946`, TEAL `2A9D8F`, GOLD `E9C46A`. Fuentes Cambria/Calibri.
- Las **notas del orador** están en el objeto `NOTES`, **indexado por número de slide (1..32)**.
  Si insertás o movés slides, hay que **renumerar las claves de `NOTES`** y actualizar el
  `s.addNotes(NOTES[32])` hardcodeado de la slide de cierre.
- A PDF: `soffice --headless --convert-to pdf ARTEX-caso-de-estudio.pptx`.
