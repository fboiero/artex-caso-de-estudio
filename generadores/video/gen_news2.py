from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
FB="/usr/local/lib/python3.13/site-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans-Bold.ttf"
FR="/usr/local/lib/python3.13/site-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf"
NAVY=(14,21,38); RED=(230,57,70); WHITE=(238,240,246); MUTE=(150,160,182)
GOLD=(233,196,106); TEAL=(42,157,143); CARD=(22,30,50)
W,H=1920,1080
def f(b,s): return ImageFont.truetype(FB if b else FR, s)
def wrap(d,txt,font,maxw):
    words=txt.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if d.textlength(t,font=font)<=maxw: cur=t
        else: lines.append(cur); cur=w
    if cur: lines.append(cur)
    return lines

def crop(path, box):
    im=Image.open(path).convert("RGB")
    return im.crop(box)

def stack(path, bands):
    """stack vertical crops (list of boxes) left-aligned, white bg between."""
    im=Image.open(path).convert("RGB")
    parts=[im.crop(b) for b in bands]
    wmax=max(p.width for p in parts); htot=sum(p.height for p in parts)
    out=Image.new("RGB",(wmax,htot),(255,255,255)); y=0
    for p in parts: out.paste(p,(0,y)); y+=p.height
    return out

def browser_card(shot, domain, target_w):
    """Frame a screenshot as a browser window (titlebar + dots + address) with shadow. Returns RGBA."""
    scale=target_w/shot.width
    sw=target_w; sh=int(shot.height*scale)
    shot=shot.resize((sw,sh), Image.LANCZOS)
    bar=52; pad=0
    cw, ch = sw, sh+bar
    card=Image.new("RGB",(cw,ch),(32,38,52))
    d=ImageDraw.Draw(card)
    # titlebar
    d.rectangle([0,0,cw,bar],fill=(38,44,60))
    for i,c in enumerate([(237,106,94),(245,191,79),(98,197,110)]):
        cx=26+i*30; d.ellipse([cx-9,bar//2-9,cx+9,bar//2+9],fill=c)
    # address pill
    ax0=130; ax1=cw-30
    d.rounded_rectangle([ax0,12,ax1,bar-12],14,fill=(24,28,40))
    lf=f(False,24)
    d.ellipse([ax0+16,bar//2-7,ax0+30,bar//2+7],outline=(120,200,160),width=3)  # lock-ish
    d.text((ax0+46,bar//2-15),domain,font=lf,fill=(176,186,208))
    # paste screenshot
    card.paste(shot,(0,bar))
    # rounded corners + border via mask
    rad=18
    mask=Image.new("L",(cw,ch),0); md=ImageDraw.Draw(mask)
    md.rounded_rectangle([0,0,cw-1,ch-1],rad,fill=255)
    out=Image.new("RGBA",(cw,ch),(0,0,0,0)); out.paste(card,(0,0),mask)
    bd=ImageDraw.Draw(out)
    bd.rounded_rectangle([0,0,cw-1,ch-1],rad,outline=(70,80,104),width=2)
    return out

def paste_shadow(base, card, x, y, blur=26, alpha=150, angle=0):
    if angle: card=card.rotate(angle, expand=True, resample=Image.BICUBIC)
    # shadow
    sh=Image.new("RGBA",base.size,(0,0,0,0))
    shm=Image.new("RGBA",card.size,(0,0,0,0))
    a=card.split()[3].point(lambda p: alpha if p>0 else 0)
    shm.putalpha(a)
    sh.paste(shm,(x+10,y+16),shm)
    sh=sh.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(sh)
    base.alpha_composite(card,(x,y))

def scene(path, tag, kicker, headline, source, footer, shot, domain):
    im=Image.new("RGBA",(W,H),NAVY+(255,)); d=ImageDraw.Draw(im)
    # left text column
    X=120
    tf=f(True,30); tw=d.textlength(tag,font=tf)
    d.rounded_rectangle([X,120,X+tw+48,180],16,fill=RED)
    d.text((X+24,133),tag,font=tf,fill=WHITE)
    kf=f(True,27); d.text((X,210),kicker,font=kf,fill=TEAL)
    hf=f(True,62); lines=wrap(d,headline,hf,760); y=300
    for ln in lines: d.text((X,y),ln,font=hf,fill=WHITE); y+=80
    sf=f(False,30); d.text((X,y+28),source,font=sf,fill=MUTE)
    # gold footer
    d.rectangle([0,H-128,W,H],fill=(20,28,48))
    af=f(True,36); d.text((X,H-94),footer,font=af,fill=GOLD)
    # evidence card right
    card=browser_card(shot, domain, 900)
    cx=1800-card.width
    cy=(H-128-card.height)//2 + 20
    if cy<70: cy=70
    paste_shadow(im, card, cx, cy, angle=-1.2)
    im.convert("RGB").save(path)

def intro(path, shots):
    im=Image.new("RGBA",(W,H),NAVY+(255,)); d=ImageDraw.Draw(im)
    # montage of browser cards, fanned, lower area
    angs=[-7,4,-3]; xs=[140,760,1120]; ys=[430,520,360]; wz=[560,620,560]
    for sh,a,x,y,w in zip(shots,angs,xs,ys,wz):
        c=browser_card(sh,"",w)
        paste_shadow(im,c,x,y,blur=30,alpha=160,angle=a)
    # darken top for title legibility
    ov=Image.new("RGBA",(W,330),(14,21,38,205)); im.alpha_composite(ov,(0,0))
    d=ImageDraw.Draw(im)
    d.rectangle([0,250,W,258],fill=RED)
    tf=f(True,118); t="NOVIEMBRE NEGRO"
    d.text(((W-d.textlength(t,font=tf))/2,96),t,font=tf,fill=WHITE)
    sf=f(False,40); s="Los titulares que después se identificaron como ARTEX"
    d.text(((W-d.textlength(s,font=sf))/2,285),s,font=sf,fill=(202,220,252))
    im.convert("RGB").save(path)

R="recortes/"
# prepared crops
korea   = crop(R+"recorte-01-korea.jpg",   (0,0,1291,735))
cso     = crop(R+"recorte-02-cso.jpg",      (40,0,1251,712))
bleep   = stack(R+"recorte-03-bleeping.jpg",[(0,0,1291,92),(0,398,1291,772)])
horas   = crop(R+"recorte-04-3horas.jpg",   (24,18,1270,466))
secw    = crop(R+"recorte-05-secureworld.jpg",(0,150,1291,760))
health  = stack(R+"recorte-06-healthcare.jpg",[(0,0,1291,128),(0,250,838,596)])

intro("news-00.png",[korea,cso,bleep])
scene("news-01.png","INCIDENTE","COREA DEL SUR · OCT 2026",
      "Bancos atacados con IA: Shinhan, Kookmin, Hana",
      "Fuente: The Herald Business · 3 oct 2026","→  atribuido a ARTEX", korea,"biz.heraldcorp.com")
scene("news-02.png","INCIDENTE","CADENA DE SUMINISTRO · OCT 2026",
      "ConnectWise: 2.250+ tenants de Microsoft 365",
      "Fuente: CSO Online · 22 oct 2026","→  framework usado: ARTEX", cso,"csoonline.com")
scene("news-03.png","ALERTA FBI","FLASH-20261113-001 · 13 NOV",
      "El FBI alerta: ARTEX impulsa ciberataques globales",
      "Fuente: BleepingComputer · 15 nov 2026","→  IC3 / FBI FLASH", bleep,"bleepingcomputer.com")
scene("news-04.png","ALERTA FBI","VELOCIDAD · NOV 2026",
      "Del primer contacto al acceso privilegiado en menos de 3 horas",
      "Fuente: Digital Shield","→  a velocidad de máquina", horas,"escudodigital.com")
scene("news-05.png","ALERTA FBI","SECTORES CRÍTICOS · 17 NOV",
      "Diez sectores críticos en la mira",
      "Fuente: Healthcare IT News · 17 nov 2026","→  uso generalizado de ARTEX", health,"healthcareitnews.com")
scene("news-06.png","ANÁLISIS","DEFENSA · NOV 2026",
      "«Están iniciando sesión, no irrumpiendo»",
      "Fuente: SecureWorld · 17 nov 2026","→  detectar por comportamiento", secw,"secureworld.io")
print("placas OK:", [p for p in os.listdir('.') if p.startswith('news-') and p.endswith('.png')])
