# Genera la versión "estructura" del sitio AVATR: misma web, sin la experiencia 3D.
# La sección 2 se reemplaza por un montaje estático bloqueado y no se publican modelos, fondos 360 ni AR.
import re,shutil,os,sys
SRC,OUT,IMG=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(os.path.join(SRC,'index.html'),encoding='utf-8').read()
def cut(a,b):
    global s
    i=s.index(a);j=s.index(b,i)+len(b);s=s[:i]+s[j:]
# 1) sección 3D por montaje
i=s.index('<!-- 2. IMAGÍNALA EN TU VIDA');j=s.index('<!-- 2b. CIFRAS')
LOCK='''<!-- 2. IMAGÍNALA EN TU VIDA (se presenta en vivo) -->
<section class="vlock" id="vivela" data-dark aria-label="Imagínala en tu vida: experiencia interactiva" data-i18n-aria="v_aria">
  <div class="vl-bg" aria-hidden="true"></div>
  <div class="wrap vl-in">
    <div class="vl-head rv">
      <p class="eyebrow" data-i18n="v_eye">Imagínala en tu vida</p>
      <h2 data-i18n="v_title">Tu AVATR,
en tu mundo.</h2>
    </div>
    <figure class="vl-frame rv d1">
      <div class="vl-bar" aria-hidden="true"><i></i><i></i><i></i><span data-i18n="vl_url">Experiencia interactiva</span></div>
      <div class="vl-shot">
        <picture>
          <source media="(max-width:767px)" srcset="img/lock-3d-m.webp">
          <img src="img/lock-3d.webp" alt=""  loading="lazy">
        </picture>
        <div class="vl-lock">
          <span class="vl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg></span>
          <p class="vl-t" data-i18n="vl_t">Experiencia interactiva</p>
          <p class="vl-s" data-i18n="vl_s">Se presenta en vivo durante la reunión</p>
        </div>
      </div>
    </figure>
  </div>
</section>

'''
s=s[:i]+LOCK+s[j:]
# 2) sin three.js: importmap y módulo de la escena
cut('<script type="importmap">','</script>')
i=s.index('<script type="module">');j=s.index('</script>',i)+len('</script>');assert 'Imagínala en tu vida: escena 3D' in s[i:j];s=s[:i]+s[j:]
# 3) estilos del montaje
CSS='''
/* Sección 2 en versión estructura: montaje bloqueado */
.vlock{position:relative;overflow:hidden;background:var(--plum);color:var(--blush);padding:clamp(110px,14vh,150px) 0 clamp(70px,10vh,120px)}
.vl-bg{position:absolute;inset:-40px;background:url(img/lock-3d.webp) center/cover;filter:blur(38px) saturate(120%) brightness(.45);transform:scale(1.08)}
.vl-in{position:relative;z-index:1;display:grid;gap:clamp(28px,4vw,48px)}
.vl-head h2{white-space:pre-line;font-weight:300;font-size:clamp(36px,4.6vw,64px);line-height:1.04;margin:12px 0 0}
.vl-head .eyebrow{color:rgba(246,239,238,.75)}
.vl-lead{margin:16px 0 0;max-width:46ch;font-size:clamp(16px,1.3vw,18px);line-height:1.55;color:rgba(246,239,238,.72)}
.vl-frame{margin:0;border-radius:clamp(14px,1.6vw,22px);overflow:hidden;background:rgba(246,239,238,.08);border:1px solid rgba(246,239,238,.16);box-shadow:0 40px 100px rgba(0,0,0,.45);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.vl-bar{display:flex;align-items:center;gap:7px;padding:12px 16px;border-bottom:1px solid rgba(246,239,238,.1)}
.vl-bar i{width:10px;height:10px;border-radius:50%;background:rgba(246,239,238,.25)}
.vl-bar span{margin:0 auto;transform:translateX(-17px);font-size:12px;letter-spacing:.08em;color:rgba(246,239,238,.6);padding:5px 16px;border-radius:999px;background:rgba(246,239,238,.07)}
.vl-shot{position:relative;overflow:hidden}
.vl-shot img{display:block;width:100%;height:auto;filter:saturate(.9) brightness(.72);transform:scale(1.08)}
.vl-shot::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(31,26,32,.15) 0%,rgba(31,26,32,.55) 100%);pointer-events:none}
.vl-lock{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:clamp(22px,2.6vw,32px) clamp(26px,3.4vw,44px);border-radius:22px;background:rgba(20,16,22,.48);border:1px solid rgba(246,239,238,.2);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);box-shadow:0 20px 60px rgba(0,0,0,.35);width:max-content;max-width:calc(100% - 40px)}
.vl-ico{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:rgba(246,239,238,.12);border:1px solid rgba(246,239,238,.22);margin-bottom:8px}
.vl-ico svg{width:24px;height:24px}
.vl-t{margin:0;font-size:clamp(17px,1.5vw,21px);font-weight:500}
.vl-s{margin:0;font-size:14px;color:rgba(246,239,238,.7)}
@media (max-width:767px){.vl-frame{max-width:360px;margin:0 auto;border-radius:34px;padding:10px;background:rgba(246,239,238,.1)}.vl-bar{display:none}.vl-shot{border-radius:26px;overflow:hidden}.vl-lock{top:46%}}
'''
k=s.index('</style>');s=s[:k]+CSS+s[k:]
# 4) textos en inglés
EN="v_eye:'Picture it in your life',"
assert s.count(EN)==1
s=s.replace(EN,EN+" vl_url:'Interactive experience', vl_t:'Interactive experience', vl_s:'Presented live during the meeting',")
s=s.replace("v_aria:'Picture it in your life: interactive 3D scene'","v_aria:'Picture it in your life: interactive experience'")
assert 'avatr11.glb' not in s and 'three.module' not in s
# 5) archivos: todo menos 3D, fondos 360 y AR
if os.path.exists(OUT): shutil.rmtree(OUT)
skip={'.git','models','pano','ar','ar.html','index.html','README.md'}
for f in os.listdir(SRC):
    if f in skip: continue
    a=os.path.join(SRC,f);b=os.path.join(OUT,f)
    shutil.copytree(a,b) if os.path.isdir(a) else (os.makedirs(OUT,exist_ok=True),shutil.copy2(a,b))
from PIL import Image,ImageFilter
for n in ('lock-3d.webp','lock-3d-m.webp'):
    im=Image.open(os.path.join(IMG,n)).convert('RGB');w,h=im.size;sm=im.resize((max(1,w//8),max(1,h//8)),Image.LANCZOS).filter(ImageFilter.GaussianBlur(4))
    sm.resize((w//2,h//2),Image.BICUBIC).save(os.path.join(OUT,'img',n),quality=70)
open(os.path.join(OUT,'index.html'),'w',encoding='utf-8').write(s)
print('ok',len(s))
