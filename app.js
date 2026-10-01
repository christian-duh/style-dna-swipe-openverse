const STORAGE_KEY='styleDNA.v1';
const APP_VERSION='1.1-openverse';

const CATEGORIES=[
  {id:'office',name:'Office',emoji:'◼',queries:[
    q('Quiet luxury office','men smart casual office tailored trousers knit polo loafers',['tailored','polished','minimal','knitwear','loafers']),
    q('Modern banker','men business casual modern suit no tie loafers',['tailored','business-casual','structured','classic']),
    q('Relaxed tailoring','men relaxed tailoring wide leg trousers office',['relaxed','wide-leg','tailored','contemporary']),
    q('Creative professional','men creative professional fashion office outfit',['statement','layering','polished','creative'])]},
  {id:'casual',name:'Everyday casual',emoji:'○',queries:[
    q('Elevated basics','men elevated casual outfit clean sneakers trousers',['minimal','clean','sneakers','versatile']),
    q('Relaxed street','men relaxed street style outfit wide pants',['relaxed','streetwear','wide-leg','layering']),
    q('Retro casual','men vintage inspired casual fashion outfit',['retro','texture','casual','statement']),
    q('Queer casual','queer mens fashion casual colorful outfit',['queer','color','statement','casual'])]},
  {id:'date',name:'Dates & dinner',emoji:'♡',queries:[
    q('Polished date night','men date night outfit fitted shirt trousers',['sleek','fitted','evening','polished']),
    q('Soft luxe','men silk shirt evening outfit trousers',['texture','drape','evening','sensual']),
    q('Minimal sexy','men monochrome date outfit fitted',['monochrome','sleek','fitted','minimal']),
    q('Fashion-forward date','men fashion editorial date night outfit',['statement','fashion-forward','evening','creative'])]},
  {id:'nightlife',name:'Nightlife & going out',emoji:'✦',queries:[
    q('Club minimal','men club outfit black sleeveless trousers',['nightlife','black','sleeveless','sleek']),
    q('Queer nightlife','queer men nightlife fashion outfit',['queer','nightlife','statement','skin']),
    q('Statement night','men metallic sheer fashion nightlife outfit',['sheer','metallic','statement','nightlife']),
    q('Sexy casual','men fitted tank jeans nightlife outfit',['tank','denim','fitted','nightlife'])]},
  {id:'brunch',name:'Brunch & social',emoji:'☼',queries:[
    q('DC brunch','men brunch outfit summer city',['social','smart-casual','summer','clean']),
    q('Playful social','men colorful casual fashion outfit accessories',['color','accessories','playful','statement']),
    q('Preppy remix','men modern preppy fashion outfit shorts',['preppy','shorts','layering','polished']),
    q('Artful casual','men artsy casual fashion outfit',['creative','texture','statement','casual'])]},
  {id:'summer',name:'Hot weather & shorts',emoji:'☀',queries:[
    q('Shorts done right','men tailored shorts outfit summer',['shorts','tailored','summer','proportion']),
    q('Resort clean','men linen shorts shirt outfit summer',['linen','shorts','relaxed','summer']),
    q('Short shorts','men short shorts fashion outfit summer',['short-shorts','skin','summer','sporty']),
    q('City heat','men hot weather city fashion outfit',['summer','urban','breathable','casual'])]},
  {id:'workout',name:'Workout & athleisure',emoji:'△',queries:[
    q('Clean gym','men gym outfit fitted shorts tank',['gym','shorts','tank','fitted']),
    q('Athleisure','men athleisure outfit city fashion',['athleisure','sporty','layering','sneakers']),
    q('Runner','men running outfit fashion shorts',['running','shorts','technical','sporty']),
    q('Gym statement','men fashionable gym outfit colorful',['gym','color','statement','sporty'])]},
  {id:'event',name:'Weddings & events',emoji:'◇',queries:[
    q('Modern formal','men modern wedding guest suit fashion',['formal','tailored','suit','modern']),
    q('Statement tailoring','men colorful suit fashion editorial',['suit','color','statement','tailored']),
    q('Summer event','men summer wedding guest linen suit',['linen','formal','summer','tailored']),
    q('Black tie remix','men black tie fashion creative',['formal','black-tie','creative','statement'])]},
  {id:'travel',name:'Travel & vacation',emoji:'→',queries:[
    q('Airport polished','men airport outfit stylish comfortable',['travel','comfortable','layering','clean']),
    q('European summer','men european summer vacation outfit',['travel','summer','linen','polished']),
    q('Beach club','men resort fashion outfit shorts',['resort','shorts','summer','statement']),
    q('City exploring','men travel city outfit comfortable stylish',['travel','sneakers','versatile','casual'])]},
  {id:'cold',name:'Cold weather & layers',emoji:'❄',queries:[
    q('City layers','men winter city outfit layering coat',['winter','layering','coat','urban']),
    q('Textured winter','men knitwear winter fashion outfit',['knitwear','texture','winter','cozy']),
    q('Statement outerwear','men statement coat fashion outfit',['coat','statement','color','winter']),
    q('Clean cold weather','men minimalist winter fashion outfit',['minimal','winter','layering','clean'])]},
  {id:'statement',name:'Queer / statement',emoji:'✧',queries:[
    q('Gender-bendy','androgynous mens fashion outfit editorial',['androgynous','queer','statement','editorial']),
    q('Sheer & texture','men sheer fashion outfit editorial',['sheer','texture','skin','statement']),
    q('Color story','men colorful fashion editorial outfit',['color','editorial','statement','creative']),
    q('Unexpected silhouette','men avant garde wearable fashion outfit',['avant-garde','silhouette','statement','creative'])]}
];
function q(title,query,tags){return{title,query,tags}}

const DETAIL_OPTIONS=['silhouette','shirt / top','pants','shorts','shoes','outerwear','color palette','fit','proportions','fabric / texture','layering','accessories','skin shown','overall vibe','too basic','too preppy','too corporate','too sporty','too loud','too safe'];

let state=loadState();
let deck=[]; let idx=0; let activeCard=null; let drag={on:false,startX:0,currentX:0}; let detailSelection=new Set(); let loadingPromise=null;

const $=s=>document.querySelector(s);
const views={setup:$('#setupView'),swipe:$('#swipeView'),profile:$('#profileView')};

function defaultState(){return{selectedCategories:CATEGORIES.map(c=>c.id),exploration:35,history:[],tagScores:{},queryScores:{},categoryCounts:{},lastCategory:null,setupComplete:false,createdAt:new Date().toISOString()}}
function loadState(){try{return Object.assign(defaultState(),JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch{return defaultState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}

function showView(name){Object.values(views).forEach(v=>v.classList.add('hidden'));views[name].classList.remove('hidden');$('#headerMode').textContent=name==='profile'?'Profile':name==='setup'?'Setup':'Discover';window.scrollTo(0,0)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.add('hidden'),1800)}

function init(){renderCategoryPicker();renderDetailChips();$('#explorationRange').value=state.exploration;bind();if(state.setupComplete||state.history.length){state.setupComplete=true;saveState();showView('swipe');loadDeck()}else{showView('setup')}updateUndo()}

function bind(){
  $('#startBtn').onclick=()=>{state.exploration=Number($('#explorationRange').value);state.setupComplete=true;saveState();showView('swipe');loadDeck(true)};
  $('#explorationRange').oninput=e=>{state.exploration=Number(e.target.value);saveState()};
  $('#statsBtn').onclick=()=>{renderProfile();showView('profile')}; $('#backToSwipeBtn').onclick=()=>showView('swipe');
  $('#menuBtn').onclick=openDrawer; $('#closeDrawerBtn').onclick=closeDrawer;
  document.querySelectorAll('.drawer-item[data-nav]').forEach(b=>b.onclick=()=>{closeDrawer();const n=b.dataset.nav;if(n==='profile')renderProfile();showView(n)});
  $('#changeCategoriesBtn').onclick=()=>{closeDrawer();renderCategoryPicker();showView('setup')};
  $('#clearDataBtn').onclick=()=>{if(confirm('Reset all swipe history and learned preferences?')){const cats=[...state.selectedCategories],explore=state.exploration;state=defaultState();state.selectedCategories=cats;state.exploration=explore;state.setupComplete=true;saveState();deck=[];idx=0;toast('Swipe history reset');closeDrawer();loadDeck(true)}};
  $('#likeBtn').onclick=()=>decide('like'); $('#nopeBtn').onclick=()=>decide('nope'); $('#undoBtn').onclick=undo; $('#detailBtn').onclick=openDetail;
  $('#closeSheetBtn').onclick=closeDetail; $('#sheetBackdrop').onclick=closeDetail; $('#saveDetailBtn').onclick=saveDetail;
  $('#moreBtn').onclick=()=>loadDeck(true);
  $('#copyBriefBtn').onclick=()=>copyText(buildChatGPTBrief(),'ChatGPT brief copied');
  $('#gaboBriefBtn').onclick=()=>copyText(buildShoppingBrief(),'Shopping brief copied');
  $('#downloadJsonBtn').onclick=()=>download('style-dna-export.json',JSON.stringify(exportData(),null,2),'application/json');
  $('#downloadCsvBtn').onclick=()=>download('style-dna-swipes.csv',toCSV(),'text/csv');
  setupSwipeGestures();
}

function renderCategoryPicker(){const box=$('#categoryPicker');box.innerHTML='';CATEGORIES.forEach(c=>{const b=document.createElement('button');b.className='select-chip '+(state.selectedCategories.includes(c.id)?'active':'');b.textContent=`${c.emoji} ${c.name}`;b.onclick=()=>{const set=new Set(state.selectedCategories);set.has(c.id)?set.delete(c.id):set.add(c.id);if(!set.size)return toast('Keep at least one context');state.selectedCategories=[...set];saveState();renderCategoryPicker()};box.appendChild(b)})}
function renderDetailChips(){const box=$('#detailChips');box.innerHTML='';DETAIL_OPTIONS.forEach(x=>{const b=document.createElement('button');b.className='detail-chip';b.textContent=x;b.onclick=()=>{detailSelection.has(x)?detailSelection.delete(x):detailSelection.add(x);b.classList.toggle('active')};box.appendChild(b)})}
function openDrawer(){$('#drawer').classList.remove('hidden');$('#sheetBackdrop').classList.remove('hidden');$('#sheetBackdrop').onclick=closeDrawer}
function closeDrawer(){$('#drawer').classList.add('hidden');$('#sheetBackdrop').classList.add('hidden');$('#sheetBackdrop').onclick=closeDetail}

async function loadDeck(force=false){
  if(loadingPromise)return loadingPromise;
  if(!force && deck.length-idx>7)return;
  const blocking=force || !activeCard || idx>=deck.length;
  if(blocking)showLoading(true);
  loadingPromise=(async()=>{
    try{
      const recipes=chooseRecipes(5),results=[];
      for(const r of recipes){const cards=await fetchPhotoCards(r,Math.floor(Math.random()*5)+1,10);results.push(...cards)}
      const seen=new Set([...state.history.map(h=>h.photoId),...deck.map(x=>x.photoId)]);
      const unique=[];const batchSeen=new Set();
      for(const card of shuffle(results)){if(!seen.has(card.photoId)&&!batchSeen.has(card.photoId)){unique.push(card);batchSeen.add(card.photoId)}if(unique.length>=30)break}
      if(force || idx>=deck.length){deck=unique;idx=0}else{deck.push(...unique)}
      if(!deck.length || idx>=deck.length)throw new Error('No new looks returned.');
      if(blocking){showLoading(false);showCard()}
    }catch(e){
      if(blocking)showLoading(false);console.error(e);toast(String(e.message).includes('429')?'Image source rate limit reached — try again shortly':'Could not load photos');
      if(!activeCard){$('#emptyCard').classList.remove('hidden');$('#emptyCard p').textContent='I could not load a photo batch from Openverse or Wikimedia Commons. Check your connection and try again.'}
    }finally{loadingPromise=null}
  })();
  return loadingPromise;
}

function chooseRecipes(n){const pool=[];for(const cid of state.selectedCategories){const c=CATEGORIES.find(x=>x.id===cid);for(const r of c.queries)pool.push({...r,categoryId:c.id,categoryName:c.name})}
  const explore=state.exploration/100;return weightedSampleNoReplace(pool,n,r=>{const qs=state.queryScores[r.query]||0;const novelty=(state.categoryCounts[r.categoryId]||0)<8?1.25:1;const learned=Math.max(.15,1+qs*.22);return (Math.random()<explore?1:learned)*novelty});
}
function weightedSampleNoReplace(items,n,weightFn){const copy=[...items],out=[];while(copy.length&&out.length<n){const weights=copy.map(weightFn),sum=weights.reduce((a,b)=>a+b,0);let r=Math.random()*sum,i=0;for(;i<copy.length;i++){r-=weights[i];if(r<=0)break}out.push(copy.splice(Math.min(i,copy.length-1),1)[0])}return out}
async function fetchPhotoCards(r,page=1,pageSize=10){
  try{
    const photos=await fetchOpenverse(r.query,page,pageSize);
    if(photos.length)return photos.map(p=>cardFromOpenverse(p,r));
  }catch(e){console.warn('Openverse request failed; using Wikimedia Commons fallback.',e)}
  const pages=await fetchWikimedia(r.query,page,pageSize);
  return pages.map(p=>cardFromWikimedia(p,r));
}
async function fetchOpenverse(query,page=1,pageSize=10){const params=new URLSearchParams({q:query,page:String(page),page_size:String(pageSize)});const res=await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`,{headers:{Accept:'application/json'}});if(!res.ok)throw new Error(`Openverse ${res.status}`);const j=await res.json();return (j.results||[]).filter(p=>p.thumbnail||p.url)}
async function fetchWikimedia(query,page=1,pageSize=10){const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:String(pageSize),gsroffset:String(Math.max(0,(page-1)*pageSize)),prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1000',iiextmetadatalanguage:'en',iiextmetadatafilter:'ImageDescription|Artist|LicenseShortName|LicenseUrl|Credit'});const res=await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);if(!res.ok)throw new Error(`Wikimedia ${res.status}`);const j=await res.json();return (j.query?.pages||[]).filter(p=>{const ii=p.imageinfo?.[0];return ii&&(ii.thumburl||ii.url)&&(!ii.mime||String(ii.mime).startsWith('image/'))})}
function cardFromOpenverse(p,r){const source=p.source||p.provider||'Openverse';const creator=p.creator||'Unknown creator';const landing=p.foreign_landing_url||p.detail_url||p.url||'https://openverse.org/';return{photoId:'ov:'+String(p.id||p.identifier||landing),image:p.thumbnail||p.url,thumb:p.thumbnail||p.url,url:landing,photographer:creator,photographerUrl:p.creator_url||landing,alt:p.description||p.title||'',imageTitle:p.title||'',source,provider:p.provider||'',license:p.license||'',licenseVersion:p.license_version||'',licenseUrl:p.license_url||'',title:r.title,query:r.query,tags:r.tags,categoryId:r.categoryId,categoryName:r.categoryName}}
function cardFromWikimedia(p,r){const ii=p.imageinfo?.[0]||{},m=ii.extmetadata||{};const landing=ii.descriptionurl||`https://commons.wikimedia.org/wiki/${encodeURIComponent(String(p.title||'').replaceAll(' ','_'))}`;const creator=stripHtml(m.Artist?.value)||ii.user||'Wikimedia contributor';const desc=stripHtml(m.ImageDescription?.value)||String(p.title||'').replace(/^File:/,'');return{photoId:'wm:'+String(p.pageid||p.title||landing),image:ii.thumburl||ii.url,thumb:ii.thumburl||ii.url,url:landing,photographer:creator,photographerUrl:landing,alt:desc,imageTitle:String(p.title||'').replace(/^File:/,''),source:'Wikimedia Commons',provider:'wikimedia',license:stripHtml(m.LicenseShortName?.value)||'',licenseVersion:'',licenseUrl:stripHtml(m.LicenseUrl?.value)||'',title:r.title,query:r.query,tags:r.tags,categoryId:r.categoryId,categoryName:r.categoryName}}
function stripHtml(v){if(!v)return'';const d=document.createElement('div');d.innerHTML=String(v);return(d.textContent||d.innerText||'').replace(/\s+/g,' ').trim()}

function showLoading(on){$('#loadingCard').classList.toggle('hidden',!on);$('#swipeCard').classList.toggle('hidden',on);$('#emptyCard').classList.add('hidden')}
function showCard(){resetTransform();if(idx>=deck.length){activeCard=null;$('#swipeCard').classList.add('hidden');$('#emptyCard').classList.remove('hidden');return}activeCard=deck[idx];$('#swipeCard').classList.remove('hidden');$('#emptyCard').classList.add('hidden');$('#outfitImage').src=activeCard.image;$('#outfitImage').alt=activeCard.alt||activeCard.title;$('#cardCategory').textContent=activeCard.categoryName;$('#cardTitle').textContent=activeCard.title;$('#cardDescription').textContent=activeCard.alt||`Search recipe: ${activeCard.query}`;$('#cardSource').textContent=`${activeCard.photographer} · ${activeCard.source||'Openverse'}`;$('#cardSource').href=activeCard.url||'https://openverse.org/';$('#cardTags').innerHTML=activeCard.tags.map(t=>`<span>${esc(t)}</span>`).join('');$('#progressText').textContent=`${state.history.length} swipes learned`;$('#categoryFilterBtn').textContent=activeCard.categoryName+' ▾';$('#categoryFilterBtn').onclick=()=>{renderCategoryPicker();showView('setup')};updateUndo()}

function applyLearning(h,direction){const val=(h.decision==='like'?1:-.55)*direction;for(const t of h.tags){state.tagScores[t]=(state.tagScores[t]||0)+val}state.queryScores[h.query]=(state.queryScores[h.query]||0)+val;state.categoryCounts[h.categoryId]=(state.categoryCounts[h.categoryId]||0)+direction}
function undo(){const h=state.history.pop();if(!h)return;applyLearning(h,-1);saveState();if(idx>0)idx--;if(deck[idx]?.photoId!==h.photoId){deck.splice(idx,0,{...h})}showCard();toast('Last swipe undone')}
function updateUndo(){$('#undoBtn').disabled=!state.history.length}

function animateDecision(type,cb){const c=$('#swipeCard');const dir=type==='like'?1:-1;c.style.transition='transform .22s ease,opacity .22s ease';c.style.transform=`translateX(${dir*120}%) rotate(${dir*18}deg)`;c.style.opacity='0';setTimeout(()=>{cb();c.style.transition='';c.style.opacity='1'},225)}
function setupSwipeGestures(){const c=$('#swipeCard');const start=(x)=>{if(!activeCard)return;drag={on:true,startX:x,currentX:x};c.style.transition='none'};const move=(x)=>{if(!drag.on)return;drag.currentX=x;const dx=x-drag.startX;const rot=dx/22;c.style.transform=`translateX(${dx}px) rotate(${rot}deg)`;$('.decision-stamp.like').style.opacity=Math.max(0,Math.min(1,dx/90));$('.decision-stamp.nope').style.opacity=Math.max(0,Math.min(1,-dx/90))};const end=()=>{if(!drag.on)return;const dx=drag.currentX-drag.startX;drag.on=false;if(Math.abs(dx)>90)decide(dx>0?'like':'nope');else resetTransform()};c.addEventListener('touchstart',e=>start(e.touches[0].clientX),{passive:true});c.addEventListener('touchmove',e=>move(e.touches[0].clientX),{passive:true});c.addEventListener('touchend',end);c.addEventListener('mousedown',e=>start(e.clientX));window.addEventListener('mousemove',e=>move(e.clientX));window.addEventListener('mouseup',end)}
function resetTransform(){const c=$('#swipeCard');c.style.transition='transform .18s ease';c.style.transform='translateX(0) rotate(0)';$('.decision-stamp.like').style.opacity=0;$('.decision-stamp.nope').style.opacity=0;setTimeout(()=>c.style.transition='',190)}

function openDetail(){if(!activeCard)return;detailSelection=new Set();document.querySelectorAll('.detail-chip').forEach(x=>x.classList.remove('active'));$('#detailNote').value='';$('#detailSheet').classList.remove('hidden');$('#sheetBackdrop').classList.remove('hidden')}
function closeDetail(){$('#detailSheet').classList.add('hidden');$('#sheetBackdrop').classList.add('hidden')}
function saveDetail(){if(!activeCard)return;activeCard.pendingDetail={tags:[...detailSelection],note:$('#detailNote').value.trim()};closeDetail();toast('Detail attached to this look')}

function renderProfile(){const H=state.history,likes=H.filter(x=>x.decision==='like'),rate=H.length?Math.round(likes.length/H.length*100):0;$('#profileSummary').innerHTML=metric(H.length,'swipes')+metric(likes.length,'likes')+metric(rate+'%','like rate');const signals=Object.entries(state.tagScores).sort((a,b)=>b[1]-a[1]).slice(0,12);const max=Math.max(1,...signals.map(x=>Math.abs(x[1])));$('#signalBars').innerHTML=signals.length?signals.map(([t,s])=>`<div class="signal-row"><div class="signal-head"><span>${esc(t)}</span><span>${s>0?'+':''}${s.toFixed(1)}</span></div><div class="bar"><i style="width:${Math.max(4,Math.abs(s)/max*100)}%"></i></div></div>`).join(''):'<p class="muted">Swipe at least a few looks and your strongest signals will appear here.</p>';
 const cats=CATEGORIES.filter(c=>state.selectedCategories.includes(c.id)).map(c=>{const a=H.filter(x=>x.categoryId===c.id),l=a.filter(x=>x.decision==='like').length;return{n:c.name,total:a.length,rate:a.length?Math.round(l/a.length*100):0}}).sort((a,b)=>b.total-a.total);$('#categoryStats').innerHTML=cats.map(c=>`<div class="category-stat"><span>${esc(c.n)}</span><span>${c.total?`${c.rate}% liked · ${c.total} seen`:'not trained yet'}</span></div>`).join('');$('#likedGrid').innerHTML=likes.slice(-18).reverse().map(x=>`<a href="${x.url}" target="_blank" rel="noopener" title="${escAttr(x.title)}"><img src="${x.thumb||x.image}" alt="${escAttr(x.alt||x.title)}"></a>`).join('')||'<p class="muted">Your liked looks will collect here.</p>'}
function metric(v,l){return`<div class="metric"><strong>${v}</strong><span>${l}</span></div>`}

function exportData(){return{app:'Style DNA',version:APP_VERSION,exportedAt:new Date().toISOString(),settings:{selectedCategories:state.selectedCategories,exploration:state.exploration},summary:computeSummary(),swipes:state.history}}
function computeSummary(){const H=state.history,likes=H.filter(x=>x.decision==='like'),dislikes=H.filter(x=>x.decision==='nope');const ranked=Object.entries(state.tagScores).sort((a,b)=>b[1]-a[1]);return{totalSwipes:H.length,likes:likes.length,dislikes:dislikes.length,likeRate:H.length?likes.length/H.length:0,topPositiveTags:ranked.filter(x=>x[1]>0).slice(0,12),topNegativeTags:[...ranked].reverse().filter(x=>x[1]<0).slice(0,12)}}
function buildChatGPTBrief(){const e=exportData(),s=e.summary;const lines=[];lines.push('# STYLE DNA — ANALYSIS PACKET');lines.push(`Exported: ${e.exportedAt}`);lines.push(`Total swipes: ${s.totalSwipes} | Likes: ${s.likes} | Dislikes: ${s.dislikes} | Like rate: ${Math.round(s.likeRate*100)}%`);lines.push('');lines.push('## Task for ChatGPT');lines.push('Analyze this preference dataset to infer my fashion taste without overfitting to any single photo or search query. Separate strong evidence from tentative hypotheses. Identify preferences in silhouette, proportions, fit, color, texture, formality, styling, shoes, accessories, skin exposure, statement level, and masculine/feminine/androgynous expression. Compare patterns across life contexts. Then propose the next 20-30 outfits I should evaluate to resolve the biggest uncertainties. Ultimately use this profile to design a versatile wardrobe from shoes through accessories, including item priorities and mix-and-match logic.');lines.push('');lines.push('## Aggregate signals');lines.push('Positive: '+(s.topPositiveTags.map(x=>`${x[0]} (${x[1].toFixed(1)})`).join(', ')||'not enough data'));lines.push('Negative: '+(s.topNegativeTags.map(x=>`${x[0]} (${x[1].toFixed(1)})`).join(', ')||'not enough data'));lines.push('');lines.push('## Swipe-level evidence');for(const h of e.swipes){lines.push(`- ${h.decision.toUpperCase()} | ${h.categoryName} | ${h.title} | tags: ${h.tags.join(', ')} | photo description: ${h.alt||'n/a'} | source: ${h.url}${h.detailTags?.length?` | user detail: ${h.detailTags.join(', ')}`:''}${h.note?` | note: ${h.note}`:''}`)}return lines.join('\n')}
function buildShoppingBrief(){const s=computeSummary();const pos=s.topPositiveTags.map(x=>x[0]).slice(0,8),neg=s.topNegativeTags.map(x=>x[0]).slice(0,6);const likes=state.history.filter(x=>x.decision==='like').slice(-8).reverse();return [`STYLE SHOPPING BRIEF`,`Based on ${s.totalSwipes} outfit reactions.`,``,`Look for: ${pos.join(', ')||'still learning'}.`,`Avoid / be cautious with: ${neg.join(', ')||'still learning'}.`,``,`Reference looks:`,...likes.map((x,i)=>`${i+1}. ${x.title} — ${x.url}`),``,`Use these as direction, not a uniform: prioritize pieces that can recombine across office, casual, social, date, travel, and going-out outfits.`].join('\n')}
function toCSV(){const cols=['timestamp','decision','category','title','query','tags','detail_tags','note','photo_description','photo_url','source_url','source','creator','license'];const rows=state.history.map(h=>[h.timestamp,h.decision,h.categoryName,h.title,h.query,h.tags.join('|'),(h.detailTags||[]).join('|'),h.note||'',h.alt||'',h.image||'',h.url||'',h.source||'',h.photographer||'',h.license||'']);return [cols,...rows].map(r=>r.map(csvCell).join(',')).join('\n')}
function csvCell(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function download(name,text,type){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function copyText(text,msg){try{await navigator.clipboard.writeText(text);toast(msg)}catch{download('style-dna-brief.txt',text,'text/plain')}}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function escAttr(s){return esc(s).replace(/"/g,'&quot;')}

// Preserve optional detail on the exact card when the swipe is recorded.
function decide(decision){if(!activeCard)return;const pending=activeCard.pendingDetail;animateDecision(decision,()=>{const h={...activeCard,decision,detailTags:pending?.tags||[],note:pending?.note||'',timestamp:new Date().toISOString()};delete h.pendingDetail;state.history.push(h);applyLearning(h,1);if(h.detailTags?.length){for(const t of h.detailTags){const k=`detail:${t}`;state.tagScores[k]=(state.tagScores[k]||0)+(decision==='like'?1.15:-.65)}}saveState();idx++;showCard();if(deck.length-idx<=5)loadDeck(false)})}

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
init();
