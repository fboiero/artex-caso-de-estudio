import subprocess, os
VID="/home/claude/vid"; os.chdir(VID)
TOTAL=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
  "-of","csv=p=0","final_audio.wav"],capture_output=True,text=True).stdout.strip())-0.3
scenes=[
("s-01",77),("news-00",73),("news-01",33),("news-02",152),("news-stat1",52),
("news-stat2",137),("news-03",48),("news-04",66),("s-02",229),("s-06",116),
("s-07",73),("s-10",82),("s-pdca",711),("s-dualuse",484),("s-27",64),("news-06",64),("s-19",91),("s-20",159),
("s-24",112),("s-25",169),("news-05",111),("s-22",129),("s-16",97),("s-28",76),("s-30",22),
]
# durations proportional to chars, min 2.6s, rescaled to TOTAL
raw=[c for _,c in scenes]; k=TOTAL/sum(raw)
durs=[max(2.6, c*k) for c in raw]
s=TOTAL/sum(durs); durs=[round(d*s,3) for d in durs]
# fix rounding to hit TOTAL on last
durs[-1]=round(durs[-1]+(TOTAL-sum(durs)),3)
print("scenes:",len(scenes),"total:",round(sum(durs),2))
for (n,_),d in zip(scenes,durs): print(f"  {n:11s} {d:5.2f}s")

parts=[]
for (n,_),D in zip(scenes,durs):
    png=f"{n}.png"; out=f"fx_{n}.mp4"; fo=round(D-0.35,3)
    vf=(f"scale=1920:1080:force_original_aspect_ratio=decrease,"
        f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0E1526,setsar=1,format=yuv420p,"
        f"loop=-1:1,trim=duration={D},"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={fo}:d=0.35,setpts=PTS-STARTPTS")
    cmd=["ffmpeg","-y","-framerate","30","-i",png,"-vf",vf,"-an",
         "-c:v","libx264","-crf","18","-preset","veryfast","-pix_fmt","yuv420p","-r","30",out]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode!=0: print("ERR",n,r.stderr[-400:]); raise SystemExit(1)
    parts.append(out)
with open("concat_final.txt","w") as fcat:
    for p in parts: fcat.write(f"file '{p}'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i","concat_final.txt","-c","copy","silent_final.mp4"],check=True,capture_output=True)
# mux final audio
subprocess.run(["ffmpeg","-y","-i","silent_final.mp4","-i","final_audio.wav",
  "-c:v","copy","-c:a","aac","-b:a","192k","-map","0:v:0","-map","1:a:0","-shortest",
  "/home/claude/ARTEX-para-alumnos.mp4"],check=True,capture_output=True)
print("DONE")
