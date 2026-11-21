import numpy as np, wave
sr=44100; total=161.5
def note(freq,dur,amp=1.0,kind='pad'):
    t=np.linspace(0,dur,int(sr*dur),endpoint=False)
    if kind=='pad':
        w=(np.sin(2*np.pi*freq*t)+0.6*np.sin(2*np.pi*(freq*2.003)*t)+0.4*np.sin(2*np.pi*(freq*0.5)*t))
        env=np.minimum(1,np.linspace(0,1,len(t))*6)*np.minimum(1,np.linspace(1,0,len(t))*6)
    else:
        w=np.sin(2*np.pi*freq*t)+0.5*np.sin(2*np.pi*freq*2*t)
        env=np.exp(-t*3.2)
    return amp*w*env
chords=[[220.00,261.63,329.63],[174.61,220.00,261.63],[261.63,329.63,392.00],[196.00,246.94,293.66]]
out=np.zeros(int(sr*total))
def place(sig,at):
    i=int(sr*at); j=min(len(out),i+len(sig)); out[i:j]+=sig[:j-i]
tpos=0.0; ci=0
while tpos<total:
    ch=chords[ci%4]
    for f in ch: place(note(f,4.0,amp=0.33,kind='pad'),tpos)
    arp=[ch[0]*2,ch[1]*2,ch[2]*2,ch[1]*2]*2
    for k,f in enumerate(arp): place(note(f,0.5,amp=0.20,kind='pluck'),tpos+k*0.5)
    place(note(ch[0]/2,4.0,amp=0.12,kind='pad'),tpos)
    tpos+=4.0; ci+=1
out/=np.max(np.abs(out)); out*=0.7
fi=int(sr*2); fo=int(sr*3)
out[:fi]*=np.linspace(0,1,fi); out[-fo:]*=np.linspace(1,0,fo)
pcm=(out*32767).astype(np.int16)
with wave.open("bed3.wav","w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
print("bed3.wav", total)
