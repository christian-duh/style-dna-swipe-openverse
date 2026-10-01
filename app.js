const STORAGE_KEY='styleDNA.v1';
const APP_VERSION='1.4.0-wearable-mix';

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

function defaultState(){return{selectedCategories:CATEGORIES.map(c=>c.id),exploration:35,statementFrequency:15,history:[],tagScores:{},queryScores:{},categoryCounts:{},lastCategory:null,setupComplete:false,createdAt:new Date().toISOString(),appVersion:APP_VERSION}}
function loadState(){try{return Object.assign(defaultState(),JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch{return defaultState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}

function showView(name){Object.values(views).forEach(v=>v.classList.add('hidden'));views[name].classList.remove('hidden');$('#headerMode').textContent=(name==='profile'?'Profile':name==='setup'?'Setup':'Discover')+' · v1.4.0';window.scrollTo(0,0)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.add('hidden'),1800)}

function init(){
  purgeLegacyCaches().catch(()=>{});
  migrateLegacyFeed();
  migrateV14Learning();state.appVersion=APP_VERSION;saveState();
  renderCategoryPicker();renderDetailChips();$('#explorationRange').value=state.exploration;$('#statementRange').value=state.statementFrequency??15;updateStatementMixLabel();bind();
  updateBuildDiagnostics();
  if(state.setupComplete||state.history.length){state.setupComplete=true;saveState();showView('swipe');loadDeck()}else{showView('setup');probeFeed()}
  updateUndo();
}
function migrateLegacyFeed(){const legacy=state.history.filter(h=>['openverse','wikimedia'].includes(String(h.provider||'').toLowerCase())||String(h.source||'').includes('Wikimedia'));if(!legacy.length)return;state.history=state.history.filter(h=>!legacy.includes(h));state.tagScores={};state.queryScores={};state.categoryCounts={};for(const h of state.history)applyLearning(h,1);saveState();toast(`${legacy.length} old non-fashion swipe${legacy.length===1?'':'s'} removed`)}
function migrateV14Learning(){if(state.appVersion===APP_VERSION)return;state.statementFrequency=Number.isFinite(Number(state.statementFrequency))?Number(state.statementFrequency):15;state.tagScores={};state.queryScores={};state.categoryCounts={};for(const h of state.history){if(h.provider==='frontpose'&&!h.feedTier)h.feedTier='statement';applyLearning(h,1)}saveState()}
function updateStatementMixLabel(){const v=Number($('#statementRange')?.value??state.statementFrequency??15);const el=$('#statementMixLabel');if(el)el.textContent=`${100-v}% everyday · ${v}% statement`;const everyday=$('#statementEverydayPct');if(everyday)everyday.textContent=`${100-v}% everyday`;const edge=$('#statementEdgePct');if(edge)edge.textContent=`${v}% statement`}
async function purgeLegacyCaches(){
  if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister().catch(()=>false)))}
  if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}
}
async function forceUpdate(){
  const btn=$('#forceUpdateBtn');if(btn)btn.disabled=true;
  try{await purgeLegacyCaches()}catch{}
  const base=location.pathname;location.replace(`${base}?build=1.4.0&fresh=${Date.now()}`);
}


function bind(){
  $('#startBtn').onclick=()=>{state.exploration=Number($('#explorationRange').value);state.statementFrequency=Number($('#statementRange').value);state.setupComplete=true;saveState();showView('swipe');loadDeck(true)};
  $('#explorationRange').oninput=e=>{state.exploration=Number(e.target.value);saveState()};
  $('#statementRange').oninput=e=>{state.statementFrequency=Number(e.target.value);saveState();updateStatementMixLabel()};
  $('#statsBtn').onclick=()=>{renderProfile();showView('profile')}; $('#backToSwipeBtn').onclick=()=>showView('swipe');
  $('#menuBtn').onclick=openDrawer; $('#closeDrawerBtn').onclick=closeDrawer;
  document.querySelectorAll('.drawer-item[data-nav]').forEach(b=>b.onclick=()=>{closeDrawer();const n=b.dataset.nav;if(n==='profile')renderProfile();showView(n)});
  $('#changeCategoriesBtn').onclick=()=>{closeDrawer();renderCategoryPicker();showView('setup')};
  $('#clearDataBtn').onclick=()=>{if(confirm('Reset all swipe history and learned preferences?')){const cats=[...state.selectedCategories],explore=state.exploration,statementFrequency=state.statementFrequency;state=defaultState();state.selectedCategories=cats;state.exploration=explore;state.statementFrequency=statementFrequency;state.setupComplete=true;saveState();deck=[];idx=0;toast('Swipe history reset');closeDrawer();loadDeck(true)}};
  $('#forceUpdateBtn').onclick=forceUpdate;
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
      setFeedHealth('loading','Loading mostly-everyday menswear + a smaller statement pool…');
      const [everydayPool,statementPool]=await Promise.all([getEverydayPool(force),getFrontPosePool(force)]);
      const recipes=chooseRecipes(8),unique=[],batchSeen=new Set();
      const alreadySeen=new Set([...state.history.map(h=>h.photoId),...deck.map(x=>x.photoId)]);
      for(const r of recipes){
        const slots=4;
        const edgeShare=statementShareForCategory(r.categoryId);
        let edgeSlots=Math.round(slots*edgeShare);
        if(r.categoryId==='statement')edgeSlots=Math.max(2,edgeSlots);
        const everydaySlots=Math.max(1,slots-edgeSlots);
        const normals=cardsForEverydayRecipe(everydayPool,r,everydaySlots+3);
        const edges=cardsForRecipe(statementPool,r,edgeSlots+2,true);
        const blended=shuffle([...normals.slice(0,everydaySlots),...edges.slice(0,edgeSlots)]);
        for(const card of blended){if(card?.image&&!alreadySeen.has(card.photoId)&&!batchSeen.has(card.photoId)){unique.push(card);batchSeen.add(card.photoId)}}
      }
      // Fill shortages from everyday looks first. Statement looks are deliberately the minority.
      if(unique.length<28){
        for(const r of recipes){
          for(const card of cardsForEverydayRecipe(everydayPool,r,12)){if(card?.image&&!alreadySeen.has(card.photoId)&&!batchSeen.has(card.photoId)){unique.push(card);batchSeen.add(card.photoId)}if(unique.length>=32)break}
          if(unique.length>=32)break;
        }
      }
      if(unique.length<24){
        for(const r of recipes){
          for(const card of cardsForRecipe(statementPool,r,8,true)){if(card?.image&&!alreadySeen.has(card.photoId)&&!batchSeen.has(card.photoId)){unique.push(card);batchSeen.add(card.photoId)}if(unique.length>=28)break}
          if(unique.length>=28)break;
        }
      }
      if(force || idx>=deck.length){deck=unique;idx=0}else{deck.push(...unique)}
      if(!deck.length || idx>=deck.length)throw new Error('No unseen fashion looks remain in the current source pools.');
      setFeedHealth('online',`${everydayPool.length} everyday + ${statementPool.length} statement looks ready · default ${100-(state.statementFrequency??15)}% everyday`);
      if(blocking){showLoading(false);showCard()}
    }catch(e){
      feedHealth.lastError=e?.message||String(e);setFeedHealth('error',feedHealth.lastError);
      if(blocking)showLoading(false);console.error(e);toast('Fashion feed error — open menu for details');
      if(!activeCard){$('#emptyCard').classList.remove('hidden');$('#emptyCard p').textContent=`Build v1.4.0 loaded, but the fashion source failed: ${feedHealth.lastError}. No unrelated fallback was used.`}
    }finally{loadingPromise=null}
  })();
  return loadingPromise;
}
function statementShareForCategory(categoryId){
  const base=Math.max(.05,Math.min(.4,Number(state.statementFrequency??15)/100));
  if(categoryId==='statement')return Math.max(.6,base);
  if(categoryId==='nightlife')return Math.max(.25,base);
  if(categoryId==='summer')return Math.max(.18,base);
  if(categoryId==='date'||categoryId==='event')return Math.max(.12,base*.9);
  if(categoryId==='office'||categoryId==='workout')return Math.min(.08,base*.35);
  return Math.min(.18,base*.7);
}
function chooseRecipes(n){const pool=[];for(const cid of state.selectedCategories){const c=CATEGORIES.find(x=>x.id===cid);for(const r of c.queries)pool.push({...r,categoryId:c.id,categoryName:c.name})}
  const explore=state.exploration/100;return weightedSampleNoReplace(pool,n,r=>{const qs=state.queryScores[r.query]||0;const novelty=(state.categoryCounts[r.categoryId]||0)<8?1.25:1;const learned=Math.max(.15,1+qs*.22);return (Math.random()<explore?1:learned)*novelty});
}
function weightedSampleNoReplace(items,n,weightFn){const copy=[...items],out=[];while(copy.length&&out.length<n){const weights=copy.map(weightFn),sum=weights.reduce((a,b)=>a+b,0);let r=Math.random()*sum,i=0;for(;i<copy.length;i++){r-=weights[i];if(r<=0)break}out.push(copy.splice(Math.min(i,copy.length-1),1)[0])}return out}

const HF_BASE='https://datasets-server.huggingface.co';
const EVERYDAY_DATASET='lihicarmeli/fashion-stylist-multimodal-v2';
const EVERYDAY_PAGE='https://huggingface.co/datasets/lihicarmeli/fashion-stylist-multimodal-v2';
const EVERYDAY_OFFSETS=[0,200,400,600,800];
const FRONTPOSE_DATASET='zoha-ahmed07/Garment_to_Front_Pose_V1';
const FRONTPOSE_PAGE='https://huggingface.co/datasets/zoha-ahmed07/Garment_to_Front_Pose_V1';
const FRONTPOSE_TOTAL=165;
const CONTEXT_TERMS={
  office:['button-down','button down','trousers','pants','tailored','blazer','shirt','clean','minimal','sweater'],
  casual:['denim','jeans','hoodie','sweater','t-shirt','t shirt','casual','sneakers','cargo','modern'],
  date:['shirt','sweater','lace','sheer','necklace','trousers','modern','clean','fitted','fashion-forward'],
  nightlife:['mesh','sheer','leather','tactical','edgy','bold','high fashion','lace','harness','crochet'],
  brunch:['shirt','shorts','sweater','colorful','vibrant','casual','sneakers','denim','patterned'],
  summer:['shorts','bermuda','mesh','sheer','crochet','lace','short sleeve','sleeveless'],
  workout:['shorts','athletic','sport','tank','sleeveless','sneakers','technical','hoodie'],
  event:['suit','blazer','tailored','dress shirt','button-down','button down','formal','trousers','shirt'],
  travel:['hoodie','denim','sneakers','cargo','jacket','casual','comfortable','sweater'],
  cold:['jacket','sweater','hoodie','coat','layered','knitted','knit'],
  statement:['mesh','sheer','lace','patterned','tactical','bold','vibrant','high fashion','fashion-forward','androgynous','harness','crochet']
};
const STYLE_PATTERNS=[
  ['wide-leg',/wide[- ]leg|baggy (?:pants|trousers)/i],['relaxed-fit',/relaxed|loose|oversized|baggy/i],['fitted',/fitted|slim[- ]fit|body[- ]hugging/i],['cropped',/cropped|crop top/i],['tailored',/tailor|blazer|suit/i],
  ['shorts',/\bshorts\b|bermuda/i],['short-shorts',/short shorts|very short shorts|thigh[- ]length shorts/i],['trousers',/\btrousers\b|\bpants\b|slacks/i],['denim',/denim|jeans/i],['cargo',/cargo/i],['leather',/leather/i],['knitwear',/knit|sweater|cardigan/i],['sheer',/sheer|transparent|mesh|lace/i],
  ['tank',/tank top|sleeveless top|singlet/i],['button-down',/button[- ]down|button[- ]up/i],['blazer',/blazer|sport coat/i],['suit',/\bsuit\b|tuxedo/i],['jacket',/\bjacket\b/i],
  ['sneakers',/sneaker|trainer/i],['boots',/\bboots?\b/i],['sandals',/sandal/i],['necklace',/necklace|bead/i],['sunglasses',/sunglasses/i],['harness',/harness|tactical vest/i],
  ['color',/colorful|bright|vibrant|green|blue|red|purple|yellow|orange/i],['pattern',/pattern|stripe|plaid|checkered|floral|graphic/i],['layering',/layered|layering|vest|jacket over/i],['statement',/statement|bold|avant[- ]garde|dramatic|fashion[- ]forward|high fashion|edgy/i]
];

const EVERYDAY_STYLES={
  office:['office','minimalist','elegant'],
  casual:['casual','minimalist','streetwear'],
  date:['elegant','minimalist','casual'],
  nightlife:['streetwear','elegant','minimalist'],
  brunch:['casual','minimalist','streetwear'],
  summer:['casual','sporty','minimalist'],
  workout:['sporty'],
  event:['elegant','office','minimalist'],
  travel:['casual','minimalist','streetwear','sporty'],
  cold:['streetwear','casual','minimalist'],
  statement:['streetwear','boho','romantic','elegant']
};
let _everydayPoolPromise=null;
async function getEverydayPool(force=false){
  if(force)_everydayPoolPromise=null;
  if(_everydayPoolPromise)return _everydayPoolPromise;
  _everydayPoolPromise=(async()=>{
    const settled=await Promise.allSettled(EVERYDAY_OFFSETS.map(async offset=>{
      const params=new URLSearchParams({dataset:EVERYDAY_DATASET,config:'default',split:'train',offset:String(offset),length:'100'});
      const res=await fetchWithTimeout(`${HF_BASE}/rows?${params.toString()}`,15000);
      if(!res.ok)throw new Error(`everyday source HTTP ${res.status}`);
      const j=await res.json();return j.rows||[];
    }));
    const rows=[];for(const x of settled)if(x.status==='fulfilled')rows.push(...x.value);
    const good=rows.filter(rec=>{const r=rec?.row||{};return String(r.gender).toLowerCase()==='man'&&['young adult','adult'].includes(String(r.age_group).toLowerCase())&&String(r.image_quality||'good').toLowerCase()!=='bad'&&imageSrc(r.image_improved||r.image_original)});
    if(!good.length)throw new Error('everyday fashion source returned zero usable men\'s looks');
    return good;
  })();
  return _everydayPoolPromise;
}
function everydayStyle(rec){return String(rec?.row?.style_preference||'casual').toLowerCase()}
function everydayScore(rec,r){const style=everydayStyle(rec),wanted=EVERYDAY_STYLES[r.categoryId]||[];let score=wanted.includes(style)?5:0;if(style==='minimalist'||style==='casual')score+=1;if(String(rec?.row?.age_group).toLowerCase()==='young adult')score+=.5;return score+Math.random()*.35}
function cardsForEverydayRecipe(pool,r,limit=8){
  return [...pool].map(rec=>({rec,score:everydayScore(rec,r)})).filter(x=>x.score>=5).sort((a,b)=>b.score-a.score).slice(0,Math.max(24,limit*5)).sort(()=>Math.random()-.5).slice(0,limit).map(x=>cardFromEveryday(x.rec,r,x.score)).filter(Boolean)
}
function cardFromEveryday(rec,r,score=0){
  const row=rec?.row||{},image=imageSrc(row.image_improved)||imageSrc(row.image_original);if(!image)return null;
  const style=String(row.style_preference||'casual').toLowerCase(),age=String(row.age_group||'adult');
  const id=rec.row_idx??row.id??image;
  const prompt=String(row.image_prompt||'').replace(/^professional portrait photo of a man,\s*/i,'').replace(/,\s*studio lighting.*$/i,'').trim();
  const tags=[...new Set(['everyday',style,r.categoryId,style==='minimalist'?'clean':null,style==='office'?'polished':null,style==='streetwear'?'streetwear':null,style==='sporty'?'sporty':null].filter(Boolean))];
  const desc=`${age.replace(/\b\w/g,m=>m.toUpperCase())} men's ${style} look${prompt?` · ${prompt}`:''}.`;
  return{photoId:'everyday:'+String(id),image,thumb:image,url:EVERYDAY_PAGE,photographer:'Everyday menswear dataset',photographerUrl:EVERYDAY_PAGE,alt:desc,imageTitle:r.title,source:'Fashion Stylist Multimodal · Hugging Face',provider:'everyday-hf',license:'MIT',licenseVersion:'',licenseUrl:EVERYDAY_PAGE,title:`${r.title} · ${style}`,query:r.query,searchTerm:r.categoryId,tags,categoryId:r.categoryId,categoryName:r.categoryName,datasetGender:'male',matchScore:score,aiGenerated:true,feedTier:'everyday',learningWeight:1};
}

let _frontPosePoolPromise=null;
let feedHealth={status:'checking',detail:'Waiting for source test.',lastError:''};
function setFeedHealth(status,detail=''){
  feedHealth.status=status;feedHealth.detail=detail||'';
  const label=status==='online'?'online':status==='loading'?'loading':status==='error'?'error':'checking';
  const setup=$('#setupFeedStatus');if(setup){setup.textContent=label;setup.dataset.status=status}
  const badge=$('#feedStatusBadge');if(badge){badge.textContent=`feed: ${label}`;badge.dataset.status=status}
  const drawer=$('#drawerFeedStatus');if(drawer){drawer.textContent=label;drawer.dataset.status=status}
  const d=$('#drawerFeedDetail');if(d)d.textContent=detail||'Fashion-only source.';
}
function updateBuildDiagnostics(){const b=$('#drawerBuild');if(b)b.textContent='v1.4.0';setFeedHealth(feedHealth.status,feedHealth.detail)}
async function probeFeed(){try{setFeedHealth('loading','Testing everyday + statement fashion sources…');const [a,b]=await Promise.all([getEverydayPool(false),getFrontPosePool(false)]);setFeedHealth('online',`${a.length} everyday + ${b.length} statement looks available`)}catch(e){feedHealth.lastError=e?.message||String(e);setFeedHealth('error',feedHealth.lastError)}}
function fetchWithTimeout(url,ms=12000){const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),ms);return fetch(url,{headers:{Accept:'application/json'},signal:ctl.signal}).finally(()=>clearTimeout(t))}
async function getFrontPosePool(force=false){
  if(force)_frontPosePoolPromise=null;
  if(_frontPosePoolPromise)return _frontPosePoolPromise;
  _frontPosePoolPromise=(async()=>{
    const chunks=[[0,100],[100,65]];
    const settled=await Promise.allSettled(chunks.map(async([offset,length])=>{
      const params=new URLSearchParams({dataset:FRONTPOSE_DATASET,config:'default',split:'train',offset:String(offset),length:String(length)});
      const res=await fetchWithTimeout(`${HF_BASE}/rows?${params.toString()}`,15000);
      if(!res.ok)throw new Error(`fashion source HTTP ${res.status}`);
      const j=await res.json();return j.rows||[];
    }));
    const rows=[];const errors=[];
    for(const x of settled){if(x.status==='fulfilled')rows.push(...x.value);else errors.push(x.reason?.message||String(x.reason))}
    if(!rows.length)throw new Error(errors.join('; ')||'fashion source returned zero rows');
    const dedup=[];const seen=new Set();
    for(const rec of rows){const cap=frontPoseCaption(rec).toLowerCase();if(!cap||seen.has(cap))continue;seen.add(cap);dedup.push(rec)}
    return dedup;
  })();
  return _frontPosePoolPromise;
}
function frontPoseCaption(rec){return String(rec?.row?.front_pose_caption_sentence||'').replace(/^\s*["']+|["']+\s*$/g,'').replace(/\s+/g,' ').trim()}
function imageSrc(v){if(!v)return'';if(typeof v==='string')return v;if(typeof v==='object')return v.src||v.url||v.path||'';return''}
function actualTags(caption,base=[]){const found=[];for(const [tag,re] of STYLE_PATTERNS)if(re.test(caption))found.push(tag);for(const t of base){const plain=String(t).replaceAll('-',' ');if(caption.toLowerCase().includes(plain))found.push(t)}return [...new Set(found)].slice(0,10)}
function scoreForRecipe(rec,r){const text=frontPoseCaption(rec).toLowerCase();let score=0;for(const term of CONTEXT_TERMS[r.categoryId]||[]){if(text.includes(term))score+=term.includes(' ')?3:2}for(const t of r.tags){if(text.includes(String(t).replaceAll('-',' ')))score+=2}if(/full-length|full length/.test(text))score+=1;return score}
function cardsForRecipe(pool,r,limit=10,relaxed=false){
  const ranked=pool.map(rec=>({rec,score:scoreForRecipe(rec,r),jitter:Math.random()})).sort((a,b)=>(b.score-a.score)||(b.jitter-a.jitter));
  const candidates=ranked.filter(x=>relaxed||x.score>0).slice(0,relaxed?60:35);
  return shuffle(candidates).slice(0,limit).map(x=>cardFromFrontPose(x.rec,r,x.score)).filter(Boolean);
}
function cardFromFrontPose(rec,r,score=0){
  const row=rec?.row||{};const image=imageSrc(row.front_pose_image)||imageSrc(row.product_image);if(!image)return null;
  const caption=frontPoseCaption(rec);if(!caption)return null;
  const id=rec.row_idx??caption;const tags=actualTags(caption,r.tags);
  return{photoId:'frontpose:'+String(id),image,thumb:image,url:FRONTPOSE_PAGE,photographer:'Statement menswear dataset',photographerUrl:FRONTPOSE_PAGE,alt:caption,imageTitle:r.title,source:'Garment → Front Pose · Hugging Face',provider:'frontpose',license:'dataset source',licenseVersion:'',licenseUrl:FRONTPOSE_PAGE,title:`${r.title} · statement`,query:r.query,searchTerm:r.categoryId,tags:[...new Set(['statement',...tags])],categoryId:r.categoryId,categoryName:r.categoryName,datasetGender:/androgynous/i.test(caption)?'androgynous':'male',matchScore:score,aiGenerated:true,feedTier:'statement',learningWeight:.75};
}

function showLoading(on){$('#loadingCard').classList.toggle('hidden',!on);$('#swipeCard').classList.toggle('hidden',on);$('#emptyCard').classList.add('hidden')}
function showCard(){resetTransform();if(idx>=deck.length){activeCard=null;$('#swipeCard').classList.add('hidden');$('#emptyCard').classList.remove('hidden');return}activeCard=deck[idx];$('#swipeCard').classList.remove('hidden');$('#emptyCard').classList.add('hidden');const img=$('#outfitImage');img.onerror=()=>{img.onerror=null;idx++;showCard();if(deck.length-idx<=5)loadDeck(false)};img.src=activeCard.image;img.alt=activeCard.alt||activeCard.title;$('#cardCategory').textContent=activeCard.categoryName;$('#cardTitle').textContent=activeCard.title;$('#cardDescription').textContent=activeCard.alt||`Search recipe: ${activeCard.query}`;$('#cardSource').textContent=`${activeCard.photographer} · ${activeCard.source||'Fashion feed'}`;$('#cardSource').href=activeCard.url||FRONTPOSE_PAGE;$('#cardTags').innerHTML=activeCard.tags.map(t=>`<span>${esc(t)}</span>`).join('');$('#progressText').textContent=`${state.history.length} swipes learned · v1.4.0`;$('#categoryFilterBtn').textContent=activeCard.categoryName+' ▾';$('#categoryFilterBtn').onclick=()=>{renderCategoryPicker();showView('setup')};updateUndo()}

function applyLearning(h,direction){const weight=Number(h.learningWeight??(h.provider==='frontpose'?.35:1));const val=(h.decision==='like'?1:-.55)*direction*weight;for(const t of h.tags){state.tagScores[t]=(state.tagScores[t]||0)+val}state.queryScores[h.query]=(state.queryScores[h.query]||0)+val;state.categoryCounts[h.categoryId]=(state.categoryCounts[h.categoryId]||0)+direction}
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

function exportData(){return{app:'Style DNA',version:APP_VERSION,exportedAt:new Date().toISOString(),settings:{selectedCategories:state.selectedCategories,exploration:state.exploration,statementFrequency:state.statementFrequency},summary:computeSummary(),swipes:state.history}}
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
function decide(decision){if(!activeCard)return;const pending=activeCard.pendingDetail;animateDecision(decision,()=>{const h={...activeCard,decision,detailTags:pending?.tags||[],note:pending?.note||'',timestamp:new Date().toISOString(),appVersionAtSwipe:APP_VERSION};delete h.pendingDetail;state.history.push(h);applyLearning(h,1);if(h.detailTags?.length){for(const t of h.detailTags){const k=`detail:${t}`;state.tagScores[k]=(state.tagScores[k]||0)+(decision==='like'?1.15:-.65)}}saveState();idx++;showCard();if(deck.length-idx<=5)loadDeck(false)})}

init();
