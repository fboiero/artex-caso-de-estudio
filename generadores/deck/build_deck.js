const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
const W = 13.3, H = 7.5;

// Palette
const NAVY = "121A2E", NAVY2 = "1E2A47", RED = "E63946", TEAL = "2A9D8F",
      LIGHT = "F5F7FA", WHITE = "FFFFFF", INK = "17203A", MUTE = "5A6478",
      GOLD = "E9C46A", CARD = "FFFFFF", LINE = "DCE1EA";
const HF = "Cambria", BF = "Calibri";

// Speaker notes keyed by slide number
const NOTES = {
  1: "Presentacion del caso. ARTEX es un pentest autonomo con IA que paso de proyecto open source a herramienta usada en ataques reales. Lo vemos en tres planos: tecnico, seguridad del propio tooling, y etico-legal.",
  2: "ARTEX automatiza un pentest completo: el operador da objetivo y alcance, y los agentes ejecutan con herramientas reales. Destacar las cuatro cifras: nace en julio 2026, licencia AGPL, corre varios sub-agentes, y en noviembre el FBI alerta. Es open source y de doble uso.",
  3: "Enunciar que van a poder hacer al terminar. El objetivo 5 (imponer el alcance tecnicamente) es el hilo conductor de toda la clase.",
  4: "Pasamos a como funciona por dentro.",
  5: "Cinco roles. Orquestador fija el alcance, planner descompone, workers ejecutan (en rojo porque son los que tocan el objetivo), chat para dirigir, y retest que verifica. Un operador maneja varias intrusiones en paralelo.",
  6: "El mismo flujo como pipeline: recon con ScopeSentry, grafos de assets, planner, workers. Abajo la banda clave: los agentes corren sobre Norma y un LLM externo intercambiable. Senalar la flecha de realimentacion y los controles transversales (proxy, aprobaciones, presupuesto de tokens).",
  7: "La decision de diseno mas elegante: cada herramienta es un binario aparte en ./skills/, no esta cableada. Ventaja: se cambia sin tocar el agente. Costo: depende de que el LLM interprete salida sin estructura, fuente de no-determinismo.",
  8: "Hay human-in-the-loop pero mal resuelto: sin lote, sin politicas, sin scoring, y una aprobacion pendiente frena todo. Aca se siembra la oportunidad de diseno que retoma la parte de defensa.",
  9: "Giro central de la clase: la herramienta ofensiva descuida su propia seguridad.",
  10: "Recorrer la tabla. Para cada falla, preguntar a los alumnos como la corregirian antes de mostrar la tercera columna. Idea fuerza: un control que vive en el prompt no es un control.",
  11: "Profundizar en la falla mas importante: el alcance es blando. CERT-EU mostro que no hay imposicion tecnica. Comparar con como deberia imponerse: en la red o un sandbox del que el agente no pueda salir.",
  12: "Como paso de research a arma.",
  13: "Recorrer la cronologia. Punto clave: entre que se publica (jul) y el FBI alerta (nov) pasan menos de cuatro meses. Cerrar el codigo el 8 de octubre no freno nada porque los forks ya circulaban.",
  14: "Abrir el debate con las tres preguntas. No hay respuesta correcta; buscar que argumenten responsabilidad del desarrollador vs. del operador.",
  15: "La licencia como parte del caso. AGPL es copyleft de red: ofrecerlo como servicio obliga a liberar el fuente. Por eso no se reutiliza codigo en un producto propietario; las ideas si se pueden reimplementar.",
  16: "Dar vuelta el caso hacia la defensa. Cada punto responde a una falla vista antes. Conectar con normas: ISO 27001 e ISO/IEC 42001.",
  17: "Explicar la consigna del practico. Recalcar: analisis estatico, nada de ejecutar la herramienta ni usar imagenes con backdoor. La parte C (control de alcance) es el entregable central.",
  18: "Quien lo construyo y con que herramientas.",
  19: "El autor no es anonimo: el WSJ lo nombro y ya tenia ScopeSentry. Gano un desafio de agentes de Baidu. Cuando estallo el abuso, se deslindo y cerro el codigo. Discutir si eso alcanza.",
  20: "Aca esta la respuesta a con que se construyo: Norma, un orquestador de agentes en Go que conduce al LLM por un protocolo comun (ACP), al estilo Claude Code. Las cifras dan escala: equipo chico, ~21k lineas de harness.",
  21: "El harness por dentro. Norma usa un ciclo PDCA (Plan-Do-Check-Act), el mismo de ISO/Deming: planifica descomponiendo el objetivo en pasos y criterios de aceptacion, ejecuta en un workspace aislado (worktree Git), verifica contra esos criterios y decide continuar, replanificar o cerrar. Las herramientas son binarios que hablan ACP (Agent Control Protocol) y el modelo es intercambiable. Conectar el PDCA con ISO 27001 / 42001.",
  22: "El corazon del caso: el MISMO motor de desarrollo se reusa para atacar. En dev, Do compila y testea; en ofensiva, Do hace recon, prueba credenciales y escala. La IA no aporto una tecnica nueva de ataque, aporto el orquestador. La ingenieria que hace util a un agente de programacion es la que lo hace peligroso.",
  23: "La distincion epistemologica clave de la clase: separar con que se CONSTRUYO (Go + Norma) de con que se OPERO (Claude Code, DeepSeek). Lo segundo esta documentado por los investigadores; lo primero no.",
  24: "Los datos duros del FBI dan peso al caso. El que mas impacta: acceso privilegiado en menos de 3 horas. Y que bajar el repo no sirvio: 1.600+ consolas seguian expuestas.",
  25: "Cierre conceptual. Izquierda: el patron de construccion (harness + skills + LLM agnostico + SDD). Derecha: las cinco ideas que deberian llevarse. Usar esta slide como repaso.",
  26: "La matriz de 14 forks auditados. Resaltar: horizonl y failsafe son espejos; nuestro fork (jiwoochris) no borra nada; panda0x123 y AntiFox borran decenas o cientos de archivos.",
  27: "Los tres niveles del ecosistema: fieles, endurecidos (D4rk-3ch0 agrega justo los controles que recomendamos) y weaponizados (webshell cifrado, C2, robo en AWS). El borrado de codigo predice el riesgo.",
  28: "Cerramos con la sintesis de la investigacion.",
  29: "Recorrer la linea de tiempo: de la publicacion en julio al FBI en noviembre; nuestra auditoria cierra la secuencia. Menos de cuatro meses de research a amenaza global.",
  30: "Las conclusiones del caso. La mas fuerte: no hay backdoor en el codigo base; el riesgo es por fork, y el borrado de codigo lo predice.",
  31: "Que produjo esta investigacion y que sigue. Izquierda: entregables. Derecha: proximos pasos.",
  32: "Mensaje final: la IA no inventa tecnicas, baja el costo y amplia quien ataca. La defensa no es prohibir la herramienta —los forks persisten— sino higiene de secretos, imposicion tecnica del alcance, hardening y deteccion.",
};

function bg(s, c){ s.background = { color: c }; }
function footer(s, dark){
  s.addText("ARTEX · Seguridad Informática — UTN FRVM", { x:0.6, y:7.05, w:8, h:0.3,
    fontFace:BF, fontSize:9, color: dark?"8A93A8":MUTE, isTextBox:true, margin:0 });
}
function pageNum(s, n, dark){
  s.addText(String(n), { x:12.4, y:7.0, w:0.5, h:0.35, fontFace:BF, fontSize:10,
    color: dark?"8A93A8":MUTE, align:"right", isTextBox:true, margin:0 });
}
// numbered circle
function circle(s, x, y, label, col){
  s.addShape(p.ShapeType.ellipse, { x, y, w:0.5, h:0.5, fill:{color:col} });
  s.addText(label, { x, y, w:0.5, h:0.5, align:"center", valign:"middle",
    fontFace:HF, fontSize:18, bold:true, color:WHITE, isTextBox:true, margin:0 });
}

let n = 0;
function content(title){
  const s = p.addSlide(); n++; bg(s, LIGHT);
  s.addText(title, { x:0.6, y:0.4, w:12.1, h:0.8, fontFace:HF, fontSize:30, bold:true,
    color:NAVY, isTextBox:true, margin:0 });
  footer(s, false); pageNum(s, n, false);
  if(NOTES[n]) s.addNotes(NOTES[n]);
  return s;
}
function divider(kicker, title){
  const s = p.addSlide(); n++; bg(s, NAVY);
  s.addShape(p.ShapeType.rect, { x:0, y:3.1, w:0.9, h:0.08, fill:{color:RED} });
  s.addText(kicker, { x:0.9, y:2.5, w:11, h:0.4, fontFace:BF, fontSize:14, bold:true,
    color:RED, charSpacing:2, isTextBox:true, margin:0 });
  s.addText(title, { x:0.85, y:3.3, w:11.6, h:1.6, fontFace:HF, fontSize:40, bold:true,
    color:WHITE, isTextBox:true, margin:0 });
  pageNum(s, n, true);
  if(NOTES[n]) s.addNotes(NOTES[n]);
  return s;
}

// ---------- 1. TITLE ----------
(function(){
  const s = p.addSlide(); n++; bg(s, NAVY);
  s.addShape(p.ShapeType.ellipse, { x:10.3, y:-1.4, w:4.6, h:4.6, fill:{color:NAVY2} });
  s.addShape(p.ShapeType.ellipse, { x:11.6, y:4.7, w:3.2, h:3.2, fill:{color:NAVY2} });
  s.addText("CASO DE ESTUDIO", { x:0.8, y:1.7, w:10, h:0.4, fontFace:BF, fontSize:15,
    bold:true, color:RED, charSpacing:3, isTextBox:true, margin:0 });
  s.addText("ARTEX: cuando el pentest se vuelve autónomo", { x:0.75, y:2.2, w:11.2, h:1.9,
    fontFace:HF, fontSize:46, bold:true, color:WHITE, isTextBox:true, margin:0, lineSpacingMultiple:0.95 });
  s.addText("Arquitectura, fallas de seguridad e implicancias éticas de una herramienta de IA ofensiva de doble uso",
    { x:0.8, y:4.2, w:10.6, h:0.9, fontFace:BF, fontSize:18, color:"CADCFC", isTextBox:true, margin:0 });
  s.addText("Seguridad Informática · UTN Facultad Regional Villa María   —   Fernando Boiero",
    { x:0.8, y:6.4, w:11.5, h:0.4, fontFace:BF, fontSize:14, color:"8A93A8", isTextBox:true, margin:0 });
  pageNum(s, n, true);
  s.addNotes(NOTES[1]);
})();

// ---------- 2. QUÉ ES ----------
(function(){
  const s = content("Qué es ARTEX");
  s.addText([
    {text:"Framework open source de ", options:{}},
    {text:"pentest autónomo", options:{bold:true}},
    {text:" basado en agentes de IA, escrito en Go.", options:{}},
  ], { x:0.6, y:1.5, w:6.6, h:0.9, fontFace:BF, fontSize:18, color:INK, isTextBox:true, margin:0 });
  s.addText([
    {text:"El operador fija un objetivo y un alcance. ", options:{breakLine:true}},
    {text:"Los agentes planifican y ejecutan las acciones con herramientas reales de pentest (nmap, shell, HTTP) y realimentan los resultados para decidir el próximo paso.", options:{}},
  ], { x:0.6, y:2.5, w:6.6, h:2.2, fontFace:BF, fontSize:16, color:MUTE, isTextBox:true, margin:0, paraSpaceAfter:8 });

  const stats = [["Jul 2026","Publicado en GitHub"],["AGPL-3.0","Licencia copyleft de red"],
                 ["6","Sub-agentes en paralelo"],["Nov 2026","Alerta FLASH del FBI"]];
  let x=7.6, y=1.5;
  stats.forEach((st,i)=>{
    const cx = x + (i%2)*2.9, cy = y + Math.floor(i/2)*2.35;
    s.addShape(p.ShapeType.roundRect, { x:cx, y:cy, w:2.6, h:2.0, rectRadius:0.1,
      fill:{color:CARD}, line:{color:LINE, width:1}, shadow:{type:"outer", color:"AAB2C2", blur:6, offset:2, angle:90, opacity:0.4} });
    s.addText(st[0], { x:cx, y:cy+0.35, w:2.6, h:0.8, align:"center", fontFace:HF, fontSize:26, bold:true, color: i===3?RED:NAVY, isTextBox:true, margin:0 });
    s.addText(st[1], { x:cx+0.15, y:cy+1.2, w:2.3, h:0.7, align:"center", fontFace:BF, fontSize:12.5, color:MUTE, isTextBox:true, margin:0 });
  });
})();

// ---------- 3. OBJETIVOS ----------
(function(){
  const s = content("Objetivos de la clase");
  const obj = [
    "Describir la arquitectura multi-agente de un pentest autónomo",
    "Identificar fallas de seguridad en la propia herramienta ofensiva",
    "Explicar las implicancias de la licencia AGPL-3.0",
    "Analizar el ciclo de doble uso: de research a arma, y su dimensión ética",
    "Proponer controles que impongan el alcance de forma técnica",
  ];
  let y=1.7;
  obj.forEach((t,i)=>{
    circle(s, 0.7, y, String(i+1), i%2? TEAL: NAVY);
    s.addText(t, { x:1.45, y:y-0.05, w:11.1, h:0.6, fontFace:BF, fontSize:17, color:INK, valign:"middle", isTextBox:true, margin:0 });
    y += 1.0;
  });
})();

// ---------- 4. DIVIDER ----------
divider("PARTE 1", "Cómo funciona");

// ---------- 5. ARQUITECTURA ----------
(function(){
  const s = content("Arquitectura multi-agente");
  const ag = [
    ["Orquestador","Traduce el objetivo en metas y fija el alcance", NAVY],
    ["Planner","Descompone las metas en pasos de ataque", NAVY],
    ["Workers (3/tarea)","Ejecutan los pasos con herramientas reales", RED],
    ["Chat","Permite al operador dirigir el trabajo en curso", TEAL],
    ["Retest","Re-verifica hallazgos: reproducible / corregido / no confirmado", TEAL],
  ];
  // first row 3 cards, second row 2 cards
  const pos = [[0.6,1.6],[4.9,1.6],[9.2,1.6],[0.6,4.15],[4.9,4.15]];
  ag.forEach((a,i)=>{
    const [cx,cy]=pos[i];
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:3.5,h:2.2,rectRadius:0.09,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addShape(p.ShapeType.ellipse,{x:cx+0.25,y:cy+0.3,w:0.35,h:0.35,fill:{color:a[2]}});
    s.addText(a[0],{x:cx+0.75,y:cy+0.22,w:2.6,h:0.5,fontFace:HF,fontSize:16,bold:true,color:NAVY,valign:"middle",isTextBox:true,margin:0});
    s.addText(a[1],{x:cx+0.28,y:cy+0.95,w:3.0,h:1.1,fontFace:BF,fontSize:13,color:MUTE,isTextBox:true,margin:0});
  });
  s.addText("Un operador puede dirigir varias intrusiones en paralelo. El motor mantiene un grafo de assets y un registro de pasos ya intentados.",
    { x:9.2, y:4.3, w:3.5, h:1.9, fontFace:BF, fontSize:13.5, italic:true, color:INK, isTextBox:true, margin:0 });
})();

// ---------- DIAGRAMA DE CAPAS ----------
(function(){
  const s = content("Arquitectura por capas");
  const boxes=[
    ["ScopeSentry","Reconocimiento: dominios, IPs, puertos, endpoints"],
    ["Grafos","Assets + exploración (memoria del motor)"],
    ["Planner","Descompone el objetivo en pasos"],
    ["Workers ×N","Ejecutan tools reales: nmap, HTTP, shell"],
  ];
  const bx=[0.6,3.75,6.9,10.05], bw=2.65, by=2.0, bh=1.5;
  boxes.forEach((b,i)=>{
    const col = i===3?RED:NAVY;
    s.addShape(p.ShapeType.roundRect,{x:bx[i],y:by,w:bw,h:bh,rectRadius:0.08,fill:{color:CARD},line:{color:col,width:1.5},
      shadow:{type:"outer",color:"AAB2C2",blur:5,offset:2,angle:90,opacity:0.35}});
    s.addText(b[0],{x:bx[i]+0.15,y:by+0.2,w:bw-0.3,h:0.5,align:"center",fontFace:HF,fontSize:16,bold:true,color:col,isTextBox:true,margin:0});
    s.addText(b[1],{x:bx[i]+0.2,y:by+0.75,w:bw-0.4,h:0.65,align:"center",fontFace:BF,fontSize:11.5,color:MUTE,isTextBox:true,margin:0});
  });
  for(let i=0;i<3;i++){
    const ax=bx[i]+bw+0.03, ax2=bx[i+1]-0.03, ay=by+bh/2;
    s.addShape(p.ShapeType.line,{x:ax,y:ay,w:ax2-ax,h:0,line:{color:TEAL,width:2.5,endArrowType:"triangle"}});
  }
  // feedback arrow (workers -> grafos)
  s.addShape(p.ShapeType.line,{x:bx[1]+bw/2,y:by+bh+0.35,w:(bx[3]+bw/2)-(bx[1]+bw/2),h:0,line:{color:MUTE,width:1.5,beginArrowType:"triangle",dashType:"dash"}});
  s.addText("realimenta hallazgos al grafo",{x:bx[1],y:by+bh+0.42,w:(bx[3]+bw)-bx[1],h:0.3,align:"center",fontFace:BF,fontSize:10.5,italic:true,color:MUTE,isTextBox:true,margin:0});
  // bottom band: Norma + LLM
  const bandY=4.6;
  s.addShape(p.ShapeType.roundRect,{x:3.75,y:bandY,w:8.95,h:1.0,rectRadius:0.08,fill:{color:NAVY}});
  s.addText([{text:"Norma",options:{bold:true,color:WHITE}},{text:" — harness de agentes en Go    ·    ",options:{color:"CADCFC"}},{text:"LLM externo",options:{bold:true,color:WHITE}},{text:" (DeepSeek / Claude / Ollama)",options:{color:"CADCFC"}}],
    {x:3.95,y:bandY+0.3,w:8.55,h:0.4,align:"center",fontFace:BF,fontSize:14,valign:"middle",isTextBox:true,margin:0});
  [bx[2]+bw/2,bx[3]+bw/2].forEach(cx=>{
    s.addShape(p.ShapeType.line,{x:cx,y:by+bh,w:0,h:bandY-(by+bh),line:{color:GOLD,width:1.5,beginArrowType:"triangle"}});
  });
  s.addText("Proxy integrado graba todo el tráfico · Gates de aprobación human-in-the-loop · Presupuesto de tokens por sesión",
    {x:0.6,y:5.9,w:12.1,h:0.4,align:"center",fontFace:BF,fontSize:12.5,italic:true,color:TEAL,isTextBox:true,margin:0});
})();

// ---------- 6. SKILLS ----------
(function(){
  const s = content("Modelo de skills: herramientas como binarios");
  s.addText([
    {text:"Cada herramienta (nmap, nuclei, ffuf) es un ", options:{}},
    {text:"binario independiente en ./skills/", options:{bold:true, fontFace:"Courier New"}},
    {text:", no una librería embebida. El backend lo ejecuta con parámetros JSON y el LLM interpreta la salida.", options:{}},
  ], { x:0.6, y:1.5, w:12.0, h:1.0, fontFace:BF, fontSize:17, color:INK, isTextBox:true, margin:0 });

  // ventaja / costo two columns
  const col=[["Ventaja", TEAL, [
      "Aísla fallos de cada herramienta",
      "Hot-swap sin tocar el código del agente",
      "Los agentes descubren las skills en runtime",
    ]],
    ["Costo", RED, [
      "Overhead de spawn de procesos",
      "Bloqueo en scans largos (nmap)",
      "Depende del LLM para leer salida sin estructura",
    ]]];
  col.forEach((c,ci)=>{
    const cx=0.6+ci*6.1, cy=2.9;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:3.4,rectRadius:0.09,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addText(c[0],{x:cx+0.4,y:cy+0.3,w:5,h:0.5,fontFace:HF,fontSize:20,bold:true,color:c[1],isTextBox:true,margin:0});
    s.addText(c[2].map((t,i)=>({text:t,options:{bullet:{code:"2022"}, breakLine:true}})),
      {x:cx+0.45,y:cy+1.05,w:5.1,h:2.1,fontFace:BF,fontSize:15,color:INK,isTextBox:true,margin:0,paraSpaceAfter:10});
  });
})();

// ---------- 7. GATES ----------
(function(){
  const s = content("Gates de aprobación — y su cuello de botella");
  s.addText([
    {text:"Cuando un agente propone una acción riesgosa (inyección SQL, fuerza bruta, exploit), la sesión se pausa en ", options:{}},
    {text:"awaiting_approval", options:{bold:true, fontFace:"Courier New"}},
    {text:" y un humano aprueba o rechaza en el frontend.", options:{}},
  ], { x:0.6, y:1.5, w:12.0, h:1.0, fontFace:BF, fontSize:17, color:INK, isTextBox:true, margin:0 });

  const gaps=[["Sin aprobación en lote","Cada acción riesgosa necesita un clic"],
    ["Sin motor de políticas","No hay reglas reutilizables por tipo de acción"],
    ["Sin scoring de riesgo","Todo pesa igual, no se prioriza"],
    ["Una pendiente frena todo","Bloquea a TODOS los workers de la sesión"]];
  let x=0.6,y=2.9;
  gaps.forEach((g,i)=>{
    const cx=x+(i%2)*6.1, cy=y+Math.floor(i/2)*1.75;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:1.5,rectRadius:0.08,fill:{color:"FDECEC"},line:{color:"F3C6C6",width:1}});
    s.addText(g[0],{x:cx+0.35,y:cy+0.22,w:5.2,h:0.5,fontFace:HF,fontSize:15.5,bold:true,color:"B3242F",isTextBox:true,margin:0});
    s.addText(g[1],{x:cx+0.35,y:cy+0.75,w:5.2,h:0.6,fontFace:BF,fontSize:13,color:INK,isTextBox:true,margin:0});
  });
  s.addText("→ Oportunidad de diseño: motor de políticas con niveles de riesgo, aprobación en lote y log de auditoría.",
    {x:0.6,y:6.45,w:12,h:0.5,fontFace:BF,fontSize:14,italic:true,bold:true,color:TEAL,isTextBox:true,margin:0});
})();

// ---------- 8. DIVIDER ----------
divider("PARTE 2", "Por qué su propia seguridad es frágil");

// ---------- 9. FALLAS (table) ----------
(function(){
  const s = content("Fallas de seguridad del propio ARTEX");
  const head=["Falla","Riesgo","Cómo debería hacerse"];
  const rows=[
    ["Scope por prompt","Evasión trivial","Imposición en capa de red / allowlist"],
    ["Puerto 8787 en 0.0.0.0","Consola expuesta a internet","Bind a localhost + auth fuerte"],
    ["Tokens sin cifrar","Robo de credenciales capturadas","Cifrado en reposo"],
    ["HTTP sin TLS (captura)","Intercepción local","TLS incluso en loopback"],
    ["Sin seccomp / AppArmor","Escalada o escape","Sandbox + menor privilegio"],
    ["SHA256 sin firma","Cadena de suministro","Firma + verificación"],
  ];
  const tbl=[head.map(h=>({text:h,options:{bold:true,color:WHITE,fill:{color:NAVY},fontFace:HF,fontSize:14,align:"left",valign:"middle"}}))];
  rows.forEach((r,i)=>{
    tbl.push(r.map((c,ci)=>({text:c,options:{color: ci===1?"B3242F":INK, bold: ci===1, fill:{color:i%2?"EEF1F6":WHITE}, fontFace:BF, fontSize:13, valign:"middle"}})));
  });
  s.addTable(tbl,{x:0.6,y:1.6,w:12.1,colW:[3.5,3.6,5.0],rowH:0.72,border:{type:"solid",color:LINE,pt:1},margin:5});
})();

// ---------- 10. SCOPE blando vs técnico ----------
(function(){
  const s = content("La lección: alcance blando vs. técnico");
  const cols=[["ARTEX — control blando", RED, "FDECEC", "F3C6C6", [
      "Bloquea .gov y .edu… por prompt",
      "CERT-EU: sin imposición técnica real",
      "Al menos un fork quitó la blocklist",
      "El agente puede eludirlo",
    ]],
    ["Cómo debería ser", TEAL, "E8F6F3", "BFE6DE", [
      "Alcance impuesto en la red, no en el prompt",
      "Allowlist de objetivos a nivel infraestructura",
      "Sandbox del que el agente no sale",
      "El control no depende de que el modelo coopere",
    ]]];
  cols.forEach((c,ci)=>{
    const cx=0.6+ci*6.1, cy=1.7;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:4.7,rectRadius:0.09,fill:{color:c[2]},line:{color:c[3],width:1}});
    s.addText(c[0],{x:cx+0.4,y:cy+0.3,w:5,h:0.6,fontFace:HF,fontSize:18,bold:true,color:c[1],isTextBox:true,margin:0});
    s.addText(c[4].map(t=>({text:t,options:{bullet:{code:"2022"},breakLine:true}})),
      {x:cx+0.45,y:cy+1.15,w:5.1,h:3.2,fontFace:BF,fontSize:15,color:INK,isTextBox:true,margin:0,paraSpaceAfter:12});
  });
})();

// ---------- 11. DIVIDER ----------
divider("PARTE 3", "De research a arma");

// ---------- 12. TIMELINE (table) ----------
(function(){
  const s = content("Cronología del abuso — 2026");
  const rows=[
    ["26 jul","Publicado en GitHub (Go, AGPL-3.0), para pruebas autorizadas"],
    ["7 oct","Primer uso contra bancos de Corea del Sur"],
    ["8 oct","El autor cierra el código citando abuso — los forks ya circulan"],
    ["17 oct","Vapor Panda: 200+ organizaciones en 14 países"],
    ["21 oct","Storm-0940: 2.250+ tenants de Microsoft 365"],
    ["26 oct","Banda de Seúl: ~8,2 millones de registros robados"],
    ["13 nov","El FBI emite alerta FLASH por uso malicioso generalizado"],
  ];
  const tbl=rows.map((r,i)=>[
    {text:r[0],options:{bold:true,color:WHITE,fill:{color: i===6?RED:NAVY},fontFace:HF,fontSize:14,align:"center",valign:"middle"}},
    {text:r[1],options:{color:INK,fill:{color:i%2?"EEF1F6":WHITE},fontFace:BF,fontSize:14,valign:"middle"}},
  ]);
  s.addTable(tbl,{x:0.6,y:1.6,w:12.1,colW:[1.9,10.2],rowH:0.66,border:{type:"solid",color:LINE,pt:1},margin:6});
  s.addText("Derivados que persisten: ARTEX Global, ScopeWeaver, ARTEX PRO, AntiFox. Imágenes con backdoor: tomicdd/artex, congdonglinux/artex.",
    {x:0.6,y:6.55,w:12.1,h:0.4,fontFace:BF,fontSize:11.5,italic:true,color:MUTE,isTextBox:true,margin:0});
})();

// ---------- 13. ÉTICA ----------
(function(){
  const s = content("Doble uso: preguntas para debatir");
  const q=[
    "¿Es responsable el autor por el abuso de una herramienta publicada con fines legítimos?",
    "¿Sirvió de algo cerrar el código, si los forks ya estaban distribuidos?",
    "¿Dónde está la línea entre investigación ofensiva publicable y facilitación del delito?",
  ];
  let y=1.9;
  q.forEach((t,i)=>{
    s.addShape(p.ShapeType.roundRect,{x:0.7,y,w:11.9,h:1.3,rectRadius:0.09,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addText("?",{x:0.95,y:y+0.3,w:0.8,h:0.8,align:"center",valign:"middle",fontFace:HF,fontSize:34,bold:true,color: i%2?TEAL:RED,isTextBox:true,margin:0});
    s.addText(t,{x:2.0,y:y+0.15,w:10.4,h:1.0,fontFace:BF,fontSize:17,color:INK,valign:"middle",isTextBox:true,margin:0});
    y+=1.55;
  });
})();

// ---------- 14. AGPL ----------
(function(){
  const s = content("Licencia AGPL-3.0: qué implica");
  const pts=[
    ["Copyleft de red","Ofrecer como servicio un derivado obliga a liberar el código fuente completo bajo la misma licencia"],
    ["Forkear y estudiar","Permitido — una copia privada para leer no genera obligación"],
    ["Reutilizar código en un producto comercial","Contaminaría el producto con la AGPL: incompatible con software propietario"],
    ["Las ideas no tienen copyright","Se estudia la arquitectura y se reimplementa desde cero; el código no se copia"],
  ];
  let y=1.7;
  pts.forEach((pt,i)=>{
    s.addShape(p.ShapeType.ellipse,{x:0.7,y:y+0.05,w:0.3,h:0.3,fill:{color: i===2?RED:TEAL}});
    s.addText([{text:pt[0]+".  ",options:{bold:true,color:NAVY}},{text:pt[1],options:{color:INK}}],
      {x:1.2,y:y-0.1,w:11.4,h:0.9,fontFace:BF,fontSize:15.5,isTextBox:true,margin:0,valign:"top"});
    y+=1.05;
  });
  s.addShape(p.ShapeType.roundRect,{x:0.7,y:6.0,w:11.9,h:0.85,rectRadius:0.08,fill:{color:NAVY}});
  s.addText([{text:"Regla del equipo:  ",options:{bold:true,color:GOLD}},
    {text:"de ARTEX salen ideas documentadas, nunca líneas de código.",options:{color:WHITE}}],
    {x:1.0,y:6.12,w:11.3,h:0.6,fontFace:BF,fontSize:15,valign:"middle",isTextBox:true,margin:0});
})();

// ---------- 15. DEFENSA ----------
(function(){
  const s = content("Qué hace un buen tooling (y una buena defensa)");
  const items=[
    ["Higiene de secretos","Los agentes entran más rápido con una credencial expuesta"],
    ["Alcance impuesto técnicamente","En la red o el sandbox, no en el prompt"],
    ["Hardening","Cifrado en reposo, TLS, seccomp/AppArmor, menor privilegio"],
    ["Detección de actividad agéntica","Miles de acciones por sesión dejan huella"],
    ["Cumplimiento y trazabilidad","ISO 27001 / ISO 42001, auditoría, soporte y origen confiable"],
  ];
  let y=1.7;
  items.forEach((it,i)=>{
    circle(s,0.7,y,"✓", TEAL);
    s.addText([{text:it[0]+".  ",options:{bold:true,color:NAVY}},{text:it[1],options:{color:INK}}],
      {x:1.45,y:y-0.05,w:11.1,h:0.6,fontFace:BF,fontSize:16,valign:"middle",isTextBox:true,margin:0});
    y+=1.0;
  });
})();

// ---------- 16. PRÁCTICO ----------
(function(){
  const s = content("El práctico");
  s.addText("Análisis estático y diseño. No se ejecuta ARTEX contra objetivos reales ni se usan imágenes con backdoor.",
    {x:0.6,y:1.45,w:12.1,h:0.5,fontFace:BF,fontSize:15,italic:true,color:RED,isTextBox:true,margin:0});
  const parts=[
    ["A — Lectura de arquitectura","Identificar orquestador, planner, workers y modelo de skills en el fuente"],
    ["B — Auditoría de la herramienta","Hallar y justificar ≥4 fallas de seguridad del propio ARTEX"],
    ["C — Control de alcance","Diseñar un mecanismo que imponga el scope de forma no evadible"],
    ["D — Debate ético-legal","Responsabilidad del autor, utilidad del takedown, AGPL"],
  ];
  let x=0.6,y=2.2;
  parts.forEach((pt,i)=>{
    const cx=x+(i%2)*6.1, cy=y+Math.floor(i/2)*2.15;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:1.9,rectRadius:0.09,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addText(pt[0],{x:cx+0.4,y:cy+0.3,w:5.0,h:0.5,fontFace:HF,fontSize:17,bold:true,color: i%2?TEAL:NAVY,isTextBox:true,margin:0});
    s.addText(pt[1],{x:cx+0.4,y:cy+0.9,w:5.1,h:0.9,fontFace:BF,fontSize:13.5,color:INK,isTextBox:true,margin:0});
  });
})();

// ---------- P4 DIVIDER ----------
divider("PARTE 4", "Quién lo construyó y con qué");

// ---------- DESARROLLADOR ----------
(function(){
  const s = content("El desarrollador y qué hizo");
  const rows=[
    ["Autumn-27","El WSJ lo identificó como Li Puhua, ingeniero chino; cuenta de GitHub desde 2019"],
    ["No es anónimo","También creó ScopeSentry (~2.000 estrellas); ARTEX es la capa de agentes encima"],
    ["Reconocido","ARTEX ganó el desafío “Agent+” de Baidu (sept 2026)"],
    ["Al estallar el abuso","8 oct: dijo no estar involucrado, “para aprendizaje e investigación”; pasó a código cerrado y bajó el repo"],
  ];
  let y=1.8;
  rows.forEach((r,i)=>{
    s.addShape(p.ShapeType.ellipse,{x:0.7,y:y+0.05,w:0.3,h:0.3,fill:{color: i===3?RED:NAVY}});
    s.addText([{text:r[0]+".  ",options:{bold:true,color:NAVY}},{text:r[1],options:{color:INK}}],
      {x:1.2,y:y-0.1,w:11.4,h:0.95,fontFace:BF,fontSize:16.5,isTextBox:true,margin:0,valign:"top"});
    y+=1.2;
  });
})();

// ---------- NORMA ----------
(function(){
  const s = content("Norma: el framework agéntico con que se construyó");
  s.addText([
    {text:"Los agentes de ARTEX corren sobre ", options:{}},
    {text:"Norma", options:{bold:true}},
    {text:", un orquestador de agentes en Go (MIT) del mismo autor, que conduce al LLM por un protocolo común (", options:{}},
    {text:"ACP", options:{bold:true}},
    {text:") con patrones de harness al estilo de Claude Code.", options:{}},
  ], { x:0.6, y:1.5, w:12.0, h:1.0, fontFace:BF, fontSize:17, color:INK, isTextBox:true, margin:0 });
  const stats=[["~21.000","líneas de Norma (el harness)"],["362","archivos Go en ARTEX"],
               ["3–8","contribuidores del repo original"],["MIT","licencia de Norma · ARTEX es AGPL-3.0"]];
  let x=0.6,y=2.85;
  stats.forEach((st,i)=>{
    const cx=x+(i%2)*6.1, cy=y+Math.floor(i/2)*1.7;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:1.45,rectRadius:0.08,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addText(st[0],{x:cx+0.35,y:cy+0.18,w:5.2,h:0.7,fontFace:HF,fontSize:25,bold:true,color:NAVY,isTextBox:true,margin:0});
    s.addText(st[1],{x:cx+0.37,y:cy+0.92,w:5.2,h:0.45,fontFace:BF,fontSize:12.5,color:MUTE,isTextBox:true,margin:0});
  });
  s.addText("Componentes del SDK: agentcore · tool · permission · harness · memory · transcript",
    {x:0.6,y:6.4,w:12,h:0.4,fontFace:BF,fontSize:13.5,italic:true,bold:true,color:TEAL,isTextBox:true,margin:0});
})();

// ---------- NORMA: MOTOR PDCA + ACP ----------
(function(){
  const s = content("El motor de Norma: ciclo PDCA + herramientas ACP");
  s.addText([
    {text:"Norma es un orquestador de agentes en Go. Su motor es un ciclo ", options:{}},
    {text:"PDCA (Plan · Do · Check · Act)", options:{bold:true}},
    {text:" —el mismo de ISO/Deming— sobre una capa de herramientas intercambiables.", options:{}},
  ], { x:0.6, y:1.4, w:12.1, h:0.8, fontFace:BF, fontSize:16.5, color:INK, isTextBox:true, margin:0 });
  const steps=[
    ["PLAN", NAVY,  "B3242F", "Descompone el objetivo en pasos y criterios de aceptación"],
    ["DO",   RED,   "B3242F", "Ejecuta en un workspace aislado (worktree Git)"],
    ["CHECK",TEAL,  "1E7A6F", "Evalúa el resultado contra los criterios → pass / fail"],
    ["ACT",  "E9C46A","B9902B","Cierra y mergea, o continúa / replanifica"],
  ];
  const bx=[0.6,3.75,6.9,10.05], bw=2.85, by=2.6, bh=2.15;
  steps.forEach((st,i)=>{
    s.addShape(p.ShapeType.roundRect,{x:bx[i],y:by,w:bw,h:bh,rectRadius:0.09,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addShape(p.ShapeType.rect,{x:bx[i],y:by,w:bw,h:0.13,fill:{color:st[1]}});
    s.addText(st[0],{x:bx[i]+0.3,y:by+0.4,w:bw-0.6,h:0.6,fontFace:HF,fontSize:22,bold:true,color:st[2],isTextBox:true,margin:0});
    s.addText(st[3],{x:bx[i]+0.32,y:by+1.1,w:bw-0.62,h:1.0,fontFace:BF,fontSize:13,color:INK,isTextBox:true,margin:0});
  });
  for(let i=0;i<3;i++){
    const ax=bx[i]+bw+0.02, ax2=bx[i+1]-0.02, ay=by+bh/2;
    s.addShape(p.ShapeType.line,{x:ax,y:ay,w:ax2-ax,h:0,line:{color:TEAL,width:2.5,endArrowType:"triangle"}});
  }
  s.addShape(p.ShapeType.line,{x:bx[0]+bw/2,y:by+bh+0.3,w:(bx[3]+bw/2)-(bx[0]+bw/2),h:0,line:{color:MUTE,width:1.5,dashType:"dash",beginArrowType:"triangle"}});
  s.addText("el lazo se repite —planificar, ejecutar, verificar, reintentar— hasta cumplir el objetivo",
    {x:bx[0],y:by+bh+0.38,w:(bx[3]+bw)-bx[0],h:0.3,align:"center",fontFace:BF,fontSize:11,italic:true,color:MUTE,isTextBox:true,margin:0});
  s.addShape(p.ShapeType.roundRect,{x:0.6,y:5.95,w:12.1,h:0.95,rectRadius:0.08,fill:{color:NAVY}});
  s.addText([{text:"Herramientas = binarios que hablan ACP",options:{bold:true,color:WHITE}},
    {text:"    ·    LLM intercambiable (Claude · Codex · Gemini · DeepSeek)    ·    Go puro, binario único",options:{color:"CADCFC"}}],
    {x:0.9,y:6.17,w:11.5,h:0.5,align:"center",fontFace:BF,fontSize:13,valign:"middle",isTextBox:true,margin:0});
})();

// ---------- DOBLE USO: DEV -> EXPLOTACIÓN ----------
(function(){
  const s = content("Doble uso: del desarrollo a la explotación");
  s.addText("El mismo ciclo PDCA, el mismo orquestador. Solo cambia el catálogo de herramientas que ejecuta el paso «Do».",
    {x:0.6,y:1.4,w:12.1,h:0.5,fontFace:BF,fontSize:15.5,italic:true,color:MUTE,isTextBox:true,margin:0});
  const lx=3.0, cw=4.75;
  s.addText("Desarrollo — para lo que se diseñó",{x:lx,y:2.0,w:cw,h:0.4,align:"center",fontFace:HF,fontSize:15,bold:true,color:NAVY,isTextBox:true,margin:0});
  s.addText("Explotación — ARTEX lo repropósita",{x:lx+cw+0.2,y:2.0,w:cw,h:0.4,align:"center",fontFace:HF,fontSize:15,bold:true,color:RED,isTextBox:true,margin:0});
  const rows=[
    ["Plan","Descompone el feature en tareas","Recon + grafo de objetivos: descompone en «intents»"],
    ["Do","Compila y corre los tests","Ejecuta skills ofensivas: nmap, credenciales, exploit"],
    ["Check","¿Tests en verde?","¿Se logró acceso o escalada de privilegios?"],
    ["Act","Mergea (Conventional Commits)","Pivota, persiste o replanifica"],
  ];
  let y=2.5;
  rows.forEach(r=>{
    s.addShape(p.ShapeType.roundRect,{x:0.6,y:y+0.05,w:2.2,h:0.7,rectRadius:0.08,fill:{color:NAVY}});
    s.addText(r[0],{x:0.6,y:y+0.05,w:2.2,h:0.7,align:"center",valign:"middle",fontFace:HF,fontSize:16,bold:true,color:WHITE,isTextBox:true,margin:0});
    s.addShape(p.ShapeType.roundRect,{x:lx,y:y,w:cw,h:0.8,rectRadius:0.07,fill:{color:"EEF2F8"},line:{color:"D4DCEA",width:1}});
    s.addText(r[1],{x:lx+0.25,y:y,w:cw-0.5,h:0.8,valign:"middle",fontFace:BF,fontSize:12.5,color:INK,isTextBox:true,margin:0});
    s.addShape(p.ShapeType.roundRect,{x:lx+cw+0.2,y:y,w:cw,h:0.8,rectRadius:0.07,fill:{color:"FDECEC"},line:{color:"F3C6C6",width:1}});
    s.addText(r[2],{x:lx+cw+0.45,y:y,w:cw-0.5,h:0.8,valign:"middle",fontFace:BF,fontSize:12.5,color:INK,isTextBox:true,margin:0});
    y+=0.92;
  });
  s.addShape(p.ShapeType.roundRect,{x:0.6,y:6.25,w:12.1,h:0.7,rectRadius:0.08,fill:{color:NAVY}});
  s.addText([{text:"Mismo motor, distinto catálogo.  ",options:{bold:true,color:GOLD}},
    {text:"La IA no inventa la técnica de ataque: aporta el orquestador autónomo.",options:{color:WHITE}}],
    {x:0.9,y:6.25,w:11.5,h:0.7,align:"center",valign:"middle",fontFace:BF,fontSize:14,isTextBox:true,margin:0});
})();

// ---------- BUILD VS USO ----------
(function(){
  const s = content("Con qué se construyó vs. con qué se operó");
  const cols=[["Construcción (el autor)", NAVY, "EEF2F8", "D4DCEA", [
      "Go: monolito + Next.js embebido",
      "Agentes: SDK Norma (harness propio)",
      "Cómo lo escribió el autor: no documentado",
      "Equipo chico: ~3–8 contribuidores",
    ]],
    ["Operación (los atacantes)", RED, "FDECEC", "F3C6C6", [
      "Operado desde sesiones de Claude Code",
      "Metodología en documentos markdown (skills)",
      "Modelo primario observado: DeepSeek",
      "Hallados: logs de Claude Code y config de ARTEX",
    ]]];
  cols.forEach((c,ci)=>{
    const cx=0.6+ci*6.1, cy=1.7;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:4.7,rectRadius:0.09,fill:{color:c[2]},line:{color:c[3],width:1}});
    s.addText(c[0],{x:cx+0.4,y:cy+0.3,w:5,h:0.6,fontFace:HF,fontSize:17,bold:true,color:c[1],isTextBox:true,margin:0});
    s.addText(c[4].map(t=>({text:t,options:{bullet:{code:"2022"},breakLine:true}})),
      {x:cx+0.45,y:cy+1.15,w:5.1,h:3.2,fontFace:BF,fontSize:14.5,color:INK,isTextBox:true,margin:0,paraSpaceAfter:11});
  });
})();

// ---------- FBI ----------
(function(){
  const s = content("FBI FLASH-20261113-001");
  s.addText("13 nov 2026 · TLP:CLEAR · vía IC3 — Threat Overview of ARTEX Autonomous Penetration Testing Framework",
    {x:0.6,y:1.45,w:12.1,h:0.5,fontFace:BF,fontSize:14,italic:true,color:MUTE,isTextBox:true,margin:0});
  const items=[
    ["Uso desde agosto 2026","Actores estatales y criminales: Storm-0940, Storm-3358, Vapor Panda"],
    ["< 3 horas","De la selección inicial al acceso privilegiado"],
    ["10 sectores críticos","Finanzas, gobierno, defensa, semiconductores, energía, salud, telco…"],
    ["1.600+ consolas","Expuestas; bajar el repo no lo detuvo (el FBI estima más)"],
  ];
  let x=0.6,y=2.2;
  items.forEach((it,i)=>{
    const cx=x+(i%2)*6.1, cy=y+Math.floor(i/2)*2.1;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:1.85,rectRadius:0.08,fill:{color:CARD},line:{color:LINE,width:1},
      shadow:{type:"outer",color:"AAB2C2",blur:6,offset:2,angle:90,opacity:0.4}});
    s.addText(it[0],{x:cx+0.35,y:cy+0.25,w:5.2,h:0.6,fontFace:HF,fontSize:19,bold:true,color: i===1?RED:NAVY,isTextBox:true,margin:0});
    s.addText(it[1],{x:cx+0.37,y:cy+0.95,w:5.2,h:0.8,fontFace:BF,fontSize:13,color:INK,isTextBox:true,margin:0});
  });
})();

// ---------- METODOLOGÍA Y ENSEÑANZAS ----------
(function(){
  const s = content("Metodología de desarrollo y enseñanzas");
  const cols=[["Cómo se construye un pentest agéntico", NAVY, "EEF2F8", "D4DCEA", [
      "Harness reutilizable (Norma): separa cerebro, tools y orquestación",
      "Skills como binarios: herramientas desacopladas y hot-swap",
      "LLM agnóstico: el modelo es intercambiable",
      "Spec-Driven Development: especificar → generar → iterar",
    ]],
    ["Qué se llevan los alumnos", TEAL, "E8F6F3", "BFE6DE", [
      "La herramienta de seguridad también es superficie de ataque",
      "Un control en el prompt no es un control: imponer en la red",
      "Doble uso: responsabilidad de quien publica",
      "Las licencias importan: AGPL (ARTEX) vs MIT (Norma)",
      "La IA no inventa técnicas: comprime tiempo y democratiza el ataque",
    ]],
  ];
  cols.forEach((c,ci)=>{
    const cx=0.6+ci*6.1, cy=1.7;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:4.9,rectRadius:0.09,fill:{color:c[2]},line:{color:c[3],width:1}});
    s.addText(c[0],{x:cx+0.4,y:cy+0.3,w:5.0,h:0.8,fontFace:HF,fontSize:17,bold:true,color:c[1],isTextBox:true,margin:0});
    s.addText(c[4].map(t=>({text:t,options:{bullet:{code:"2022"},breakLine:true}})),
      {x:cx+0.45,y:cy+1.35,w:5.0,h:3.3,fontFace:BF,fontSize:13.5,color:INK,isTextBox:true,margin:0,paraSpaceAfter:10});
  });
})();

// ---------- MATRIZ DE FORKS ----------
(function(){
  const s = content("Matriz de 14 forks auditados");
  const head=["Fork","Idén","Mod","Borra","Nuev","Clasificación"];
  const rows=[
    ["horizonl/ARTEX","321","4","0","0","Espejo fiel",0],
    ["failsafe-security/artex","308","17","0","10","Espejo fiel",0],
    ["D4rk-3ch0/artex-c","304","21","0","30","Endurecido",2],
    ["2561769445/ycode","267","58","0","81","Fiel + ofens. leve",0],
    ["RuoJi6/ARTEX","231","94","0","122","Baseline mantenido",0],
    ["MoLeft/ARTEX","208","117","0","136","Fiel + i18n",0],
    ["jiwoochris/artex-global","201","124","0","67","Fiel (auditado)",2],
    ["acheong08/artex","98","227","0","2","Espejo",0],
    ["lyrisoft/artex-hardened","67","251","7","181","Endurecido",0],
    ["cskwork/scopeweaver","67","258","0","483","Rebrand EN/KO",0],
    ["BaaRai/ARTEX","59","259","7","253","Reescritura (v0.6)",0],
    ["chu0119/Pojun","134","189","2","259","Ofensivo (C2)",1],
    ["panda0x123/artex-ymh","205","78","42","132","Weaponizado",1],
    ["ChathurangaBW/antifox","6","94","225","147","Despojado (AntiFox)",1],
  ];
  const tbl=[head.map((h,i)=>({text:h,options:{bold:true,color:WHITE,fill:{color:NAVY},fontFace:HF,fontSize:11,valign:"middle",align:(i===0||i===5)?"left":"center"}}))];
  rows.forEach(r=>{
    const fill = r[6]===1? "FDECEC" : r[6]===2? "E8F6F3" : WHITE;
    tbl.push([
      {text:r[0],options:{fontFace:BF,fontSize:10,color:INK,fill:{color:fill},valign:"middle"}},
      {text:r[1],options:{fontFace:BF,fontSize:10,align:"center",color:INK,fill:{color:fill},valign:"middle"}},
      {text:r[2],options:{fontFace:BF,fontSize:10,align:"center",color:INK,fill:{color:fill},valign:"middle"}},
      {text:r[3],options:{fontFace:BF,fontSize:10,align:"center",bold:(+r[3]>20),color:(+r[3]>20)?"B3242F":INK,fill:{color:fill},valign:"middle"}},
      {text:r[4],options:{fontFace:BF,fontSize:10,align:"center",color:INK,fill:{color:fill},valign:"middle"}},
      {text:r[5],options:{fontFace:BF,fontSize:10,color:INK,fill:{color:fill},valign:"middle"}},
    ]);
  });
  s.addTable(tbl,{x:0.5,y:1.4,w:12.3,colW:[3.3,1.0,1.0,1.1,1.1,4.8],rowH:0.35,border:{type:"solid",color:LINE,pt:1},margin:3});
  s.addText("Rojo = weaponizado · Verde = endurecido/auditado · El borrado de código predice el riesgo",
    {x:0.5,y:6.8,w:12.3,h:0.3,fontFace:BF,fontSize:10.5,italic:true,color:MUTE,isTextBox:true,margin:0});
})();

// ---------- TAXONOMÍA ----------
(function(){
  const s = content("Taxonomía: tres niveles de riesgo");
  const cols=[
    ["Fieles / espejos", TEAL, "E8F6F3","BFE6DE", ["horizonl, failsafe-security","acheong08, RuoJi6","Reproducen sin borrar código","Bajo riesgo de integridad"]],
    ["Endurecidos / i18n", NAVY, "EEF2F8","D4DCEA", ["jiwoochris (auditado), MoLeft","D4rk-3ch0: honeypot-detect,","egress review, anti-trampa","Agregan controles de seguridad"]],
    ["Weaponizados", RED, "FDECEC","F3C6C6", ["panda0x123: webshell cifrado","Pojun: consola C2","AntiFox: −225 archivos (robo AWS)","ALTO riesgo: borran salvaguardas"]],
  ];
  const w=4.0, gap=0.25;
  cols.forEach((c,ci)=>{
    const cx=0.55+ci*(w+gap), cy=1.7;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:w,h:4.6,rectRadius:0.09,fill:{color:c[2]},line:{color:c[3],width:1}});
    s.addText(c[0],{x:cx+0.3,y:cy+0.3,w:w-0.6,h:0.6,fontFace:HF,fontSize:16,bold:true,color:c[1],isTextBox:true,margin:0});
    s.addText(c[4].map(t=>({text:t,options:{bullet:{code:"2022"},breakLine:true}})),{x:cx+0.35,y:cy+1.15,w:w-0.65,h:3.2,fontFace:BF,fontSize:12.5,color:INK,isTextBox:true,margin:0,paraSpaceAfter:9});
  });
  s.addText("El borrado de código respecto del upstream es el mejor predictor de riesgo.",
    {x:0.55,y:6.55,w:12.2,h:0.4,align:"center",fontFace:BF,fontSize:13,italic:true,bold:true,color:NAVY,isTextBox:true,margin:0});
})();

// ---------- P5 DIVIDER ----------
divider("PARTE 5", "Síntesis y cierre");

// ---------- LÍNEA DE TIEMPO ----------
(function(){
  const s = content("Línea de tiempo: de research a amenaza");
  const pts=[
    ["26 jul","Publicación open source (AGPL)", NAVY],
    ["3 oct","Los forks se bifurcan", NAVY],
    ["7–8 oct","Ataques a bancos · el autor cierra el código", RED],
    ["17–26 oct","Campañas: Vapor Panda, Storm-0940, Seúl", RED],
    ["4 nov","1.465 consolas expuestas", NAVY],
    ["13 nov","Alerta FLASH del FBI", RED],
    ["19 nov","Nuestra auditoría: 14 forks", TEAL],
  ];
  const x0=1.3, x1=12.0, lineY=3.95, N=pts.length;
  s.addShape(p.ShapeType.line,{x:x0,y:lineY,w:x1-x0,h:0,line:{color:MUTE,width:2.5}});
  pts.forEach((pt,i)=>{
    const x = x0 + i*(x1-x0)/(N-1);
    const up = i%2===0;
    s.addShape(p.ShapeType.ellipse,{x:x-0.1,y:lineY-0.1,w:0.2,h:0.2,fill:{color:pt[2]}});
    if(up){ s.addShape(p.ShapeType.line,{x:x,y:lineY-0.7,w:0,h:0.7,line:{color:LINE,width:1}}); }
    else  { s.addShape(p.ShapeType.line,{x:x,y:lineY,w:0,h:0.7,line:{color:LINE,width:1}}); }
    const bx=Math.max(0.3, Math.min(x-1.15, 13.3-0.3-2.3));
    const dateY = up ? lineY-1.95 : lineY+0.8;
    const txtY  = up ? lineY-1.58 : lineY+1.17;
    s.addText(pt[0],{x:bx,y:dateY,w:2.3,h:0.35,align:"center",fontFace:HF,fontSize:14,bold:true,color:pt[2],isTextBox:true,margin:0});
    s.addText(pt[1],{x:bx,y:txtY,w:2.3,h:0.85,align:"center",fontFace:BF,fontSize:11,color:INK,isTextBox:true,margin:0});
  });
})();

// ---------- CONCLUSIONES ----------
(function(){
  const s = content("Conclusiones");
  const concl=[
    "No hay backdoor en el código base: el riesgo es por fork",
    "El borrado de código es el mejor predictor de riesgo",
    "Separar con qué se construyó (Go + Norma) de con qué se operó (Claude Code / DeepSeek)",
    "Un control en el prompt no es un control: imponer el alcance en la red",
    "El ecosistema tiene forks defensivos y weaponizados a la vez",
  ];
  let y=1.75;
  concl.forEach((t,i)=>{
    circle(s, 0.7, y, String(i+1), i%2? TEAL: NAVY);
    s.addText(t, { x:1.45, y:y-0.05, w:11.1, h:0.6, fontFace:BF, fontSize:16.5, color:INK, valign:"middle", isTextBox:true, margin:0 });
    y += 1.0;
  });
})();

// ---------- QUÉ HICIMOS / QUÉ HAREMOS ----------
(function(){
  const s = content("Qué hicimos y qué vamos a hacer");
  const cols=[["Qué hicimos", NAVY, "EEF2F8", "D4DCEA", [
      "Caso de estudio + material de clase (deck, handout, 10 notas)",
      "Auditoría de código del fork: sin backdoor",
      "Análisis de procedencia vs. upstream",
      "Auditoría comparativa de 14 forks (taxonomía)",
    ]],
    ["Qué vamos a hacer", TEAL, "E8F6F3", "BFE6DE", [
      "Diff completo contra el espejo failsafe (aseguramiento)",
      "Validación privada contra un desarrollo propio",
      "Revisar forks de riesgo (Pojun, AntiFox) en entorno aislado",
      "Publicar el repo y dar la clase",
    ]]];
  cols.forEach((c,ci)=>{
    const cx=0.6+ci*6.1, cy=1.7;
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:5.8,h:4.9,rectRadius:0.09,fill:{color:c[2]},line:{color:c[3],width:1}});
    s.addText(c[0],{x:cx+0.4,y:cy+0.3,w:5.0,h:0.6,fontFace:HF,fontSize:18,bold:true,color:c[1],isTextBox:true,margin:0});
    s.addText(c[4].map(t=>({text:t,options:{bullet:{code:"2022"},breakLine:true}})),
      {x:cx+0.45,y:cy+1.25,w:5.0,h:3.4,fontFace:BF,fontSize:14,color:INK,isTextBox:true,margin:0,paraSpaceAfter:12});
  });
})();

// ---------- 17. CLOSING ----------
(function(){
  const s = p.addSlide(); n++; bg(s, NAVY);
  s.addShape(p.ShapeType.rect,{x:0,y:2.9,w:0.9,h:0.08,fill:{color:RED}});
  s.addText("Para llevarse",{x:0.9,y:2.3,w:11,h:0.4,fontFace:BF,fontSize:14,bold:true,color:RED,charSpacing:2,isTextBox:true,margin:0});
  s.addText("La IA ofensiva baja el costo del ataque y amplía quién puede ejecutarlo.",
    {x:0.85,y:3.05,w:11.6,h:1.3,fontFace:HF,fontSize:32,bold:true,color:WHITE,isTextBox:true,margin:0,lineSpacingMultiple:1.0});
  s.addText("La defensa no pasa por prohibir la herramienta —los forks persisten— sino por higiene de secretos, imposición técnica del alcance, hardening y detección de la actividad agéntica.",
    {x:0.85,y:4.6,w:11.4,h:1.5,fontFace:BF,fontSize:18,color:"CADCFC",isTextBox:true,margin:0});
  pageNum(s,n,true);
  s.addNotes(NOTES[32]);
})();

p.writeFile({ fileName: "ARTEX-caso-de-estudio.pptx" }).then(f=>console.log("WROTE", f));
