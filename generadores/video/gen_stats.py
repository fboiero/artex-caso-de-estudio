from PIL import Image, ImageDraw, ImageFont
FB="/usr/local/lib/python3.13/site-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans-Bold.ttf"
FR="/usr/local/lib/python3.13/site-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf"
NAVY=(14,21,38); RED=(230,57,70); WHITE=(238,240,246); MUTE=(150,160,182); GOLD=(233,196,106); TEAL=(42,157,143)
W,H=1920,1080
def f(b,s): return ImageFont.truetype(FB if b else FR, s)
def stat(path, tag, kicker, big, label, sub, footer):
    im=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(im)
    X=120
    tf=f(True,30); tw=d.textlength(tag,font=tf)
    d.rounded_rectangle([X,140,X+tw+48,200],16,fill=RED); d.text((X+24,153),tag,font=tf,fill=WHITE)
    kf=f(True,27); d.text((X,230),kicker,font=kf,fill=TEAL)
    bf=f(True,230); d.text((X-6,330),big,font=bf,fill=RED)
    lf=f(True,56); d.text((X,620),label,font=lf,fill=WHITE)
    sf=f(False,38); d.text((X,700),sub,font=sf,fill=MUTE)
    d.rectangle([0,H-128,W,H],fill=(20,28,48))
    af=f(True,36); d.text((X,H-94),footer,font=af,fill=GOLD)
    im.save(path)
stat("news-stat1.png","INCIDENTE","SEÚL · COREA DEL SUR",
     "8M+","registros personales expuestos","en la oleada de ataques al sector financiero","→  atribuido a ARTEX")
stat("news-stat2.png","INCIDENTE","ABUSO DE IA · 2026",
     "API","Claves de IA robadas a escala industrial","las claves robadas pagaban la factura de inferencia de los agentes","→  monetización del ataque")
print("stats OK")
