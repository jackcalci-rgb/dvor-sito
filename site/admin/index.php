<?php
declare(strict_types=1);
require __DIR__ . '/inc.php';
$tok = logged_in() ? csrf() : '';
?><!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Gestione foto – Osteria Enoteca Dvor</title>
<style>
:root{--bg:#FBF6EE;--ink:#2A1D14;--muted:#7A6A5C;--line:#DCCDB8;--gold:#A8631F;--alt:#F1E7D6;--bad:#B3261E;--ok:#2F6B3A}
@media (prefers-color-scheme:dark){:root{--bg:#1D1510;--ink:#F3E9DA;--muted:#B8A793;--line:#4A382B;--gold:#E0A04F;--alt:#2A1E16;--bad:#FF8A80;--ok:#8FD19A}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Georgia,'Times New Roman',serif}
.wrap{max-width:880px;margin:0 auto;padding:1.5rem 1rem 4rem}
h1{font-weight:400;font-size:2rem;margin:0}
h2{font-weight:400;font-size:1.4rem;margin:2rem 0 .6rem}
.top{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}
.top a,.top button{font:inherit;font-size:.85rem}
button,.btn{font:inherit;font-size:.9rem;background:var(--ink);color:var(--bg);border:1px solid var(--ink);padding:.55rem 1rem;cursor:pointer}
button.ghost{background:none;color:var(--ink);border-color:var(--line)}
button:disabled{opacity:.5;cursor:default}
input,select{font:inherit;font-size:.95rem;color:var(--ink);background:var(--bg);border:1px solid var(--line);padding:.55rem .65rem;width:100%}
label{display:block;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
label input,label select{margin-top:.3rem;text-transform:none;letter-spacing:0}
.card{border:1px solid var(--line);background:var(--alt);padding:1rem}
#login{max-width:380px;margin:12vh auto 0}
#login .card{display:grid;gap:1rem}
.msg{min-height:1.4rem;font-size:.92rem;margin:.6rem 0}.msg.bad{color:var(--bad)}.msg.ok{color:var(--ok)}
.drop{display:block;margin-top:1rem;border:2px dashed var(--line);padding:1.8rem 1rem;text-align:center;cursor:pointer;position:relative;text-transform:none;letter-spacing:0;font-size:1rem;color:var(--ink)}
.drop.over{border-color:var(--gold);background:var(--alt)}
.drop input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.drop small{display:block;color:var(--muted);margin-top:.3rem}
.list{display:grid;gap:1rem}
.ph{display:grid;grid-template-columns:110px 1fr;gap:.9rem;border:1px solid var(--line);padding:.7rem;background:var(--bg)}
.ph img{width:110px;height:110px;object-fit:cover;background:var(--alt);display:block}
.ph .f{display:grid;gap:.4rem;align-content:start}
.ph input,.ph select{font-size:.85rem;padding:.45rem .55rem;margin:0}
.del{justify-self:start;background:none;color:var(--muted);border-color:var(--line);font-size:.78rem;padding:.35rem .7rem}
.del.sure{background:var(--bad);border-color:var(--bad);color:#fff}
.chk{list-style:none;margin:0;padding:0;font-size:.92rem}
.chk li{padding:.25rem 0}.chk .y::before{content:"✔ ";color:var(--ok)}.chk .n::before{content:"✘ ";color:var(--bad)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media (max-width:560px){.grid2{grid-template-columns:1fr}.ph{grid-template-columns:84px 1fr}.ph img{width:84px;height:84px}}
[hidden]{display:none!important}
.zones{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:1rem}.zone h3{margin:0 0 .6rem;font-size:1.05rem}.zone .drop{margin:0}
</style>
</head>
<body>
<div class="wrap">

<section id="login" hidden>
  <h1>Area riservata</h1>
  <p style="color:var(--muted)">Osteria Enoteca Dvor – gestione della galleria foto.</p>
  <form class="card" id="lf">
    <label>Password<input type="password" id="pw" autocomplete="current-password" required></label>
    <button type="submit">Entra</button>
    <div class="msg" id="lmsg" role="alert"></div>
  </form>
</section>

<section id="app" hidden>
  <div class="top"><h1>Gestione foto</h1>
    <div><a href="../" target="_blank" rel="noopener">Vedi il sito ↗</a> &nbsp; <button class="ghost" id="logout" type="button">Esci</button></div></div>

  <h2>Carica nuove foto</h2>
  <p style="margin:0 0 1rem;color:var(--muted);font-size:.92rem">Ogni riquadro carica le foto direttamente nella sezione indicata della pagina Galleria. Puoi scegliere più foto insieme o trascinarle.</p>
  <div class="zones" id="zones"></div>
  <div class="msg" id="msg" role="status" aria-live="polite"></div>

  <h2>Foto caricate</h2>
  <p id="empty" style="color:var(--muted)">Ancora nessuna foto caricata.</p>
  <div class="list" id="list"></div>

  <h2>Recensioni</h2>
  <div class="card">
    <p style="margin:0 0 .8rem;color:var(--muted);font-size:.92rem">Le recensioni con 4 o 5 stelle compaiono a rotazione nel blocco "Dicono di noi" della home. Se in <code>config.php</code> c'è la chiave Google, quelle di Google arrivano da sole (Google ne fornisce al massimo alcune alla volta). Qui puoi aggiungere a mano altre recensioni <strong>vere</strong>, copiandole da Google, TripAdvisor o Facebook.</p>
    <form id="rf">
      <div class="grid2">
        <label>Nome dell'autore<input id="ra" maxlength="80" required></label>
        <label>Stelle<select id="rr"><option value="5">★★★★★ 5</option><option value="4">★★★★ 4</option><option value="3">★★★ 3</option><option value="2">★★ 2</option><option value="1">★ 1</option></select></label>
        <label>Data (facoltativa)<input id="rd" type="date"></label>
        <label>Fonte<select id="rs"><option value="google">Google</option><option value="tripadvisor">TripAdvisor</option><option value="facebook">Facebook</option><option value="altro">Altro</option></select></label>
      </div>
      <label style="margin-top:.8rem">Testo della recensione<textarea id="rt" rows="4" maxlength="2000" required style="width:100%;font:inherit;font-size:.95rem;padding:.55rem .65rem;margin-top:.3rem;border:1px solid var(--line);background:var(--bg);color:var(--ink)"></textarea></label>
      <div style="margin-top:.8rem"><button type="submit">Aggiungi recensione</button></div>
      <div class="msg" id="rmsg" role="status"></div>
    </form>
    <div class="list" id="rlist" style="margin-top:1rem"></div>
  </div>

  <h2>Cambia password</h2>
  <form class="card" id="pf">
    <div class="grid2">
      <label>Password attuale<input type="password" id="po" autocomplete="current-password" required></label>
      <label>Nuova password (almeno 10 caratteri)<input type="password" id="pn" autocomplete="new-password" minlength="10" required></label>
    </div>
    <div style="margin-top:.8rem"><button type="submit">Salva password</button></div>
    <div class="msg" id="pmsg" role="status"></div>
  </form>

  <h2>Controlli del server</h2>
  <div class="card"><ul class="chk" id="chk"></ul><p style="color:var(--muted);font-size:.85rem;margin:.6rem 0 0" id="lim"></p></div>
</section>

</div>
<script>
(function(){
var csrf=<?= json_encode($tok) ?>;
var $=function(i){return document.getElementById(i)};
var CATS=[['sale','Sale interne'],['giardino','Giardino'],['panorama','Panorama'],['piatti','Piatti'],['eventi','Eventi']];
function say(el,t,cls){el.textContent=t;el.className='msg'+(cls?' '+cls:'')}
function api(action,data,files){
  var fd=new FormData();fd.append('action',action);
  Object.keys(data||{}).forEach(function(k){fd.append(k,data[k])});
  if(files)Object.keys(files).forEach(function(k){fd.append(k,files[k][0],files[k][1])});
  return fetch('api.php',{method:'POST',body:fd,credentials:'same-origin',headers:{'X-CSRF':csrf}})
    .then(function(r){return r.json().catch(function(){return {ok:false,error:'server'}}).then(function(j){j._s=r.status;return j})});
}
function show(app){$('app').hidden=!app;$('login').hidden=app}
function err(j){
  var m={bad:'Password errata.',locked:'Troppi tentativi: riprova tra qualche minuto.',auth:'Sessione scaduta: accedi di nuovo.',csrf:'Sessione non valida: ricarica la pagina.',
   nofile:'Nessun file ricevuto.',type:'Formato non supportato (usa JPG, PNG o WebP).',too_large:'La foto è troppo grande per il server.',upload:'Caricamento non riuscito: riprova.',write:'Impossibile salvare la foto: controlla i permessi di uploads/.',data:'Impossibile salvare: controlla i permessi della cartella data/.',
   short:'La nuova password è troppo corta.',server:'Errore del server.'};
  return m[j&&j.error]||('Qualcosa è andato storto'+(j&&j.error?' ('+j.error+')':'')+'.')}
function boot(){
  api('list').then(function(j){
    if(j.ok){show(true);render(j.photos);status();revLoad()}else show(false)}).catch(function(){show(false);say($('lmsg'),'Server non raggiungibile.','bad')})}
$('lf').addEventListener('submit',function(e){e.preventDefault();var b=e.target.querySelector('button');b.disabled=true;say($('lmsg'),'');
  api('login',{password:$('pw').value}).then(function(j){
    b.disabled=false;
    if(j.ok){csrf=j.csrf;$('pw').value='';boot()}else say($('lmsg'),err(j),'bad')}).catch(function(){b.disabled=false;say($('lmsg'),'Server non raggiungibile.','bad')})});
$('logout').addEventListener('click',function(){api('logout').then(function(){csrf='';show(false)})});

function toJpeg(file){
  return (window.createImageBitmap?createImageBitmap(file,{imageOrientation:'from-image'}).catch(function(){return createImageBitmap(file)}):Promise.reject(new Error('nobitmap')))
  .then(function(bmp){
    var max=1800,sc=Math.min(1,max/Math.max(bmp.width,bmp.height)),w=Math.round(bmp.width*sc),h=Math.round(bmp.height*sc);
    var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bmp,0,0,w,h);
    return new Promise(function(res,rej){c.toBlob(function(b){b?res(b):rej(new Error('blob'))},'image/jpeg',0.82)})})}
async function upload(files,forceCat){
  var list=[].slice.call(files).filter(function(f){return /^image\//.test(f.type)||/\.(jpe?g|png|webp)$/i.test(f.name)});
  if(!list.length){say($('msg'),'Scegli almeno un file immagine.','bad');return}
  var ok=0;
  for(var i=0;i<list.length;i++){
    say($('msg'),'Caricamento '+(i+1)+' di '+list.length+'…');
    try{
      var blob;try{blob=await toJpeg(list[i])}catch(e){blob=list[i]}
      var j=await api('upload',{cat:forceCat},{photo:[blob,'foto.jpg']});
      if(!j.ok){say($('msg'),(list[i].name||'Foto')+': '+err(j),'bad');break}
      ok++;
    }catch(e){say($('msg'),'Errore di rete durante il caricamento.','bad');break}
  }
  if(ok){say($('msg'),ok===1?'Foto caricata.':ok+' foto caricate.','ok')}
  api('list').then(function(j){if(j.ok)render(j.photos)});
}
var ZONES=[['sale','Sale interne'],['giardino','Giardino'],['panorama','Panorama'],['piatti','Piatti'],['eventi','Eventi']];
(function(){var host=$('zones');ZONES.forEach(function(z){
  var card=document.createElement('div');card.className='card zone';
  var h=document.createElement('h3');h.textContent=z[1];card.appendChild(h);
  var lab=document.createElement('label');lab.className='drop';
  var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
  var sp=document.createElement('span');sp.textContent='Carica foto';
  var sm=document.createElement('small');sm.textContent='Scegli o trascina qui';
  lab.appendChild(inp);lab.appendChild(sp);lab.appendChild(sm);card.appendChild(lab);host.appendChild(card);
  inp.addEventListener('change',function(){if(inp.files.length){upload(inp.files,z[0]);inp.value=''}});
  ['dragenter','dragover'].forEach(function(n){lab.addEventListener(n,function(e){e.preventDefault();lab.classList.add('over')})});
  ['dragleave','drop'].forEach(function(n){lab.addEventListener(n,function(e){e.preventDefault();lab.classList.remove('over')})});
  lab.addEventListener('drop',function(e){if(e.dataTransfer&&e.dataTransfer.files.length)upload(e.dataTransfer.files,z[0])});
})})();

function render(photos){
  var el=$('list');el.textContent='';$('empty').hidden=photos.length>0;
  photos.forEach(function(p){
    var card=document.createElement('div');card.className='ph';
    var im=document.createElement('img');im.src='../uploads/'+encodeURIComponent(p.file);im.alt='';im.loading='lazy';card.appendChild(im);
    var f=document.createElement('div');f.className='f';
    var sel=document.createElement('select');sel.setAttribute('aria-label','Sezione');
    CATS.forEach(function(c){var o=document.createElement('option');o.value=c[0];o.textContent=c[1];if(c[0]===p.cat)o.selected=true;sel.appendChild(o)});
    sel.addEventListener('change',function(){api('update',{id:p.id,cat:sel.value}).then(function(j){say($('msg'),j.ok?'Salvato.':err(j),j.ok?'ok':'bad')})});
    function inp(key,ph){var i=document.createElement('input');i.type='text';i.maxLength=140;i.placeholder=ph;i.value=p[key]||'';i.setAttribute('aria-label',ph);
      i.addEventListener('change',function(){var d={id:p.id};d[key]=i.value.trim();api('update',d).then(function(j){say($('msg'),j.ok?'Salvato.':err(j),j.ok?'ok':'bad')})});return i}
    var del=document.createElement('button');del.type='button';del.className='del';del.textContent='Elimina';var t=null;
    del.addEventListener('click',function(){
      if(!del.classList.contains('sure')){del.classList.add('sure');del.textContent='Conferma eliminazione';t=setTimeout(function(){del.classList.remove('sure');del.textContent='Elimina'},4000);return}
      clearTimeout(t);del.disabled=true;
      api('delete',{id:p.id}).then(function(j){if(j.ok){card.remove();say($('msg'),'Foto eliminata.','ok');if(!el.children.length)$('empty').hidden=false}else{say($('msg'),err(j),'bad');del.disabled=false}})});
    f.appendChild(sel);f.appendChild(inp('it','Didascalia in italiano'));f.appendChild(inp('en','Caption in English'));f.appendChild(del);
    card.appendChild(f);el.appendChild(card)})}

$('pf').addEventListener('submit',function(e){e.preventDefault();
  api('passwd',{old:$('po').value,'new':$('pn').value}).then(function(j){
    if(j.ok){say($('pmsg'),'Password cambiata.','ok');$('po').value='';$('pn').value=''}else say($('pmsg'),err(j),'bad')})});


function revRender(list){var el=$('rlist');el.textContent='';
  if(!list.length){var p=document.createElement('p');p.style.color='var(--muted)';p.textContent='Nessuna recensione aggiunta a mano.';el.appendChild(p);return}
  list.forEach(function(r){var d=document.createElement('div');d.className='ph';d.style.gridTemplateColumns='1fr auto';
    var b=document.createElement('div');var h=document.createElement('strong');h.textContent=r.author+'  '+'★★★★★'.slice(0,r.rating)+(r.date?'  · '+r.date:'')+'  · '+r.source;var tx=document.createElement('p');tx.style.margin='.3rem 0 0';tx.style.fontSize='.9rem';tx.textContent=r.text;b.appendChild(h);b.appendChild(tx);
    var x=document.createElement('button');x.type='button';x.className='del';x.textContent='Elimina';var tm=null;
    x.addEventListener('click',function(){if(!x.classList.contains('sure')){x.classList.add('sure');x.textContent='Conferma';tm=setTimeout(function(){x.classList.remove('sure');x.textContent='Elimina'},4000);return}clearTimeout(tm);
      api('rev_del',{id:r.id}).then(function(j){if(j.ok)d.remove();else say($('rmsg'),err(j),'bad')})});
    d.appendChild(b);d.appendChild(x);el.appendChild(d)})}
function revLoad(){api('rev_list').then(function(j){if(j.ok)revRender(j.reviews)})}
$('rf').addEventListener('submit',function(e){e.preventDefault();
  api('rev_add',{author:$('ra').value,rating:$('rr').value,date:$('rd').value,source:$('rs').value,text:$('rt').value}).then(function(j){
    if(j.ok){say($('rmsg'),'Recensione aggiunta.','ok');$('ra').value='';$('rt').value='';$('rd').value='';revLoad()}else say($('rmsg'),j.error==='rev_fields'?'Scrivi il nome e il testo.':err(j),'bad')})});
function status(){api('status').then(function(j){
  if(!j.ok)return;var ul=$('chk');ul.textContent='';
  j.checks.forEach(function(c){var li=document.createElement('li');li.className=c[1]?'y':'n';li.textContent=c[0];ul.appendChild(li)});
  $('lim').textContent=j.limits||''})}
boot();
})();
</script>
</body>
</html>
