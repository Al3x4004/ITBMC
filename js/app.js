/* EARLY BINDINGS */
window.showScreen=function(id){
  ['screen-welcome','screen-login','screen-admin','screen-new','screen-app'].forEach(function(s){
    var el=document.getElementById(s);if(el)el.style.display='none';
  });
  var t=document.getElementById(id);
  if(!t)return;
  if(id==='screen-app'){
    t.style.display='block';
  } else if(id==='screen-new'){
    t.style.display='block';
    if(typeof buildCreatorCls==='function'){buildCreatorCls();buildCreatorColors('cp-colors');buildCreatorEmblems('cp-emblems');}
  } else {
    t.style.display='flex';
  }
};

/* ══ ESTADO GLOBAL (inicializado en window para que los onclick del HTML lo vean) ══ */
var session={loggedIn:false,isAdmin:false,playerId:null};
var players=[];
var missions=[];
var arcs=[];
var shopItems=[];
var gachaCards=[];
var calEvents=[];
var curHero=0;
var editPid=null;
var cpState={cls:null,color:null,emblem:'⚔️'};
var calState={year:new Date().getFullYear(),month:new Date().getMonth(),selectedDate:null,filter:'all',editingEventId:null};
var customTraits=[];/* categorías de rasgos custom: {id,name,options:[{id,name,imageUrl,pos:{x,y,w,z}}]} *//* color se fija a COLORS[0] tras definir COLORS */
var widgetCatalog=[];/* catálogo de widgets del admin: {id,name,icon,type,embedUrl,height} */

/* ══ CONFIG ══ */
const CFG={
  MODE:'supabase',
  GITHUB_RAW:'https://raw.githubusercontent.com/Al3x4004/ITBMC/main/',
  ADMIN_PW:'',/* la contrasenya es verifica al servidor (RPC verify_admin); ja no viu al codi */
  SUPABASE_URL:'https://ksmxclenaeglnahinkvm.supabase.co',
  SUPABASE_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhjbGVuYWVnbG5haGlua3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjY0MzQsImV4cCI6MjA5ODMwMjQzNH0.pBaUUXSDGjXPLbAjIOAdtM0nvAgfxul7BUzfcQaWqNc',
};

/* ══ DATOS ESTÁTICOS ══ */
let CLASSES=[
  {name:'Mago',       icon:'🔮',role:'Dev / Tècnic',        bonus:'+5 INT · +3 AGI',attrs:{fue:1,int:5,agi:3,car:1,sab:2}},
  {name:'Paladín',    icon:'🛡️',role:'Gestió / Lideratge',  bonus:'+5 CAR · +4 SAB',attrs:{fue:2,int:1,agi:1,car:5,sab:4}},
  {name:'Exploradora',icon:'🏹',role:'Data / Anàlisi',       bonus:'+5 AGI · +4 INT',attrs:{fue:1,int:4,agi:5,car:1,sab:2}},
  {name:'Guerrero',   icon:'⚔️',role:'Ops / Execució',      bonus:'+6 FUE · +3 AGI',attrs:{fue:6,int:1,agi:3,car:1,sab:1}},
  {name:'Pícaro',     icon:'🗡️',role:'Disseny / Creativitat',bonus:'+5 AGI · +3 CAR',attrs:{fue:1,int:3,agi:5,car:3,sab:1}},
  {name:'Bardo',      icon:'📯',role:'Marketing / Comms',   bonus:'+6 CAR · +3 SAB',attrs:{fue:1,int:2,agi:1,car:6,sab:3}},
];
function _mkcol(hex){var h=hex.replace('#','');var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return {hex:hex,bg:'rgba('+r+','+g+','+b+',0.15)'};}
const COLORS=[
  '#7f77dd','#5b6ee0','#378add','#2bb6c9','#1d9e75','#3fae4a','#639922','#a5b520',
  '#e4a428','#e8863b','#d85a30','#d63b3b','#d4537e','#c451b0','#9b59d6','#6b52c9',
  '#e05c8a','#c98a12','#7a8a99','#5a7d7a','#888780','#455063','#b0894f','#2f9e8f'
].map(_mkcol);
const EMBLEMS=['⚔️','🗡️','🏹','🛡️','🔮','📯','🔥','❄️','⚡','🌙','☀️','🐉','🦅','🌿','💎','👁️'];
// ══ SLOTS DE EQUIPAMIENTO (centralizados) ══
var SLOT_DEFS=[
  {key:'arma',label:'Arma',icon:'⚔️',pos:{x:60,y:30,w:46,z:4}},
  {key:'armadura',label:'Armadura',icon:'🛡️',pos:{x:20,y:42,w:60,z:3}},
  {key:'accesorio',label:'Accessori',icon:'💎',pos:{x:8,y:22,w:30,z:4}},
  {key:'casco',label:'Casc',icon:'⛑️',pos:{x:18,y:-2,w:64,z:6}},
  {key:'botas',label:'Botes',icon:'👟',pos:{x:26,y:78,w:48,z:2}},
  {key:'cosm1',label:'Cosmètic',icon:'✨',pos:{x:20,y:20,w:60,z:10},cosmetic:true},
  {key:'cosm2',label:'Cosmètic',icon:'✨',pos:{x:20,y:20,w:60,z:11},cosmetic:true},
  {key:'cosm3',label:'Cosmètic',icon:'✨',pos:{x:20,y:20,w:60,z:12},cosmetic:true},
  {key:'cosm4',label:'Cosmètic',icon:'✨',pos:{x:20,y:20,w:60,z:13},cosmetic:true},
  {key:'cosm5',label:'Cosmètic',icon:'✨',pos:{x:20,y:20,w:60,z:14},cosmetic:true}
];
function slotDefaultPos(k){var s=SLOT_DEFS.find(function(x){return x.key===k;});return s?s.pos:{x:20,y:20,w:60,z:4};}
function emptyEquipped(){var o={};SLOT_DEFS.forEach(function(s){o[s.key]=null;});return o;}
function zeroAttrs(){var o={};attrKeys().forEach(function(k){o[k]=0;});return o;}
cpState.color=COLORS[0];/* color por defecto */
// ══ ATRIBUTOS DINÁMICOS ══
// ATTRS: array ordenado de {key, name, color}. Se puede añadir/quitar.
var ATTR_COLORS=['#d85a30','#7f77dd','#1d9e75','#378add','#e4a428','#d4537e','#639922','#0f6e56','#993c1d','#534ab7'];
var ATTRS=[
  {key:'fue',name:'Força',color:'#d85a30',icon:'💪'},
  {key:'int',name:'Intel·ligència',color:'#7f77dd',icon:'🧠'},
  {key:'agi',name:'Agilitat',color:'#1d9e75',icon:'⚡'},
  {key:'car',name:'Carisma',color:'#378add',icon:'✨'},
  {key:'sab',name:'Saviesa',color:'#e4a428',icon:'📖'}
];
function attrKeys(){return ATTRS.map(function(a){return a.key;});}
try{var _sa=localStorage.getItem('cg_attrs');if(_sa){var _pa=JSON.parse(_sa);if(Array.isArray(_pa)&&_pa.length)ATTRS=_pa;}}catch(e){}
try{normalizeAttrs();}catch(e){}
try{var _sc=localStorage.getItem('cg_custom_traits');if(_sc){var _pc=JSON.parse(_sc);if(Array.isArray(_pc))customTraits=_pc;}}catch(e){}
try{var _sw=localStorage.getItem('cg_widgets');if(_sw){var _pw=JSON.parse(_sw);if(Array.isArray(_pw))widgetCatalog=_pw;}}catch(e){}
function attrName(k){var a=ATTRS.find(function(x){return x.key===k;});return a?a.name:k;}
function attrColor(k){var a=ATTRS.find(function(x){return x.key===k;});return a?a.color:'#888';}
// Separa un emoji inicial del text (per si l'emoji està incrustat al nom de l'atribut)
function _attrLead(s){
  s=(''+(s||''));
  var m=s.match(/^\s*((?:\p{Extended_Pictographic})(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)\s*/u);
  if(m)return {emoji:m[1],rest:s.slice(m[0].length).trim()};
  return {emoji:'',rest:s.trim()};
}
// Mou l'emoji del nom cap al camp icona (una sola vegada) i deixa el nom net
function normalizeAttrs(){
  ATTRS.forEach(function(a){
    var lead=_attrLead(a.name);
    if(lead.emoji){
      if(!a.icon||a.icon==='⭐')a.icon=lead.emoji;
      a.name=lead.rest;
    }
    if(!a.icon)a.icon='⭐';
  });
}
function attrIcon(k){var a=ATTRS.find(function(x){return x.key===k;});if(!a)return '⭐';if(a.icon&&a.icon!=='⭐')return a.icon;var lead=_attrLead(a.name);return lead.emoji||'⭐';}
// Proxies de compatibilidad: AN[k] y AC[k] siguen funcionando como antes
var AN=new Proxy({},{get:function(t,k){return attrName(k);},set:function(t,k,v){var a=ATTRS.find(function(x){return x.key===k;});if(a)a.name=v;return true;},ownKeys:function(){return attrKeys();},getOwnPropertyDescriptor:function(){return {enumerable:true,configurable:true};}});
var AC=new Proxy({},{get:function(t,k){return attrColor(k);}});
// Escapa HTML per evitar injecció (XSS) en dades externes (Planner, etiquetes, notes...)
function _esc(s){return (s==null?'':String(s)).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
// Fragments per grau (fallback quan la missió no té frag propi)
function fragForDiff(diff){return ({D:20,C:50,B:100,A:200,S:400}[diff])||50;}
// Formata l'or (fins a 2 decimals, sense zeros sobrants): 12 → "12", 12.5 → "12.5", 12.34 → "12.34"
function fmtGold(n){n=Math.round((Number(n)||0)*100)/100;return (n%1===0)?String(n):String(n).replace(/0+$/,'');}
// Nombres históricos/legacy de atributos para no perder el match si se renombran
var AN_LEGACY={fue:['Força','Fuerza','FUE'],int:['Intel·ligència','Inteligencia','Intel.','INT'],agi:['Agilitat','Agilidad','AGI'],car:['Carisma','CAR'],sab:['Saviesa','Sabiduría','SAB']};
function attrKeyFromName(name){
  if(!name)return null;
  var k=ATTRS.find(function(a){return a.name===name;});
  if(k)return k.key;
  // Comparació ignorant un emoji inicial (compat. amb noms antics que el duien incrustat)
  var target=_attrLead(name).rest;
  if(target){var k2=ATTRS.find(function(a){return _attrLead(a.name).rest===target;});if(k2)return k2.key;}
  if(ATTRS.find(function(a){return a.key===name;}))return name;
  var low=(''+name).toLowerCase();
  return Object.keys(AN_LEGACY).find(function(k){
    return AN_LEGACY[k].some(function(n){return n.toLowerCase()===low;});
  })||null;
}
const RARITY_ORDER=['legendaria','epica','rara','comun'];
const RARITY_PROB={comun:70,rara:25,epica:4,legendaria:1};
const GACHA_COST_SINGLE=100;
const GACHA_COST_MULTI=900;
const RARITY_LABEL={comun:'Comú',rara:'Rara',epica:'Èpica',legendaria:'Llegendària'};

let galleryHeroIdx=0;
let galleryOnlyOwned=false;
let galleryDupOnly=false;
let galleryRarity='';
var classGrowthMap={};/* {nomClasse:{attrKey:puntsPerNivell}} — punts que puja cada classe en pujar de nivell */
var market=[];/* mercat negre: [{id,sellerId,cardId,mode:'gold'|'frag'|'trade',price,wantCardId}] */
var marketHistory=[];/* historial: [{ts,type:'buy'|'trade',cardId,wantCardId,mode,price,fromId,toId}] (últimes 60) */
var statsLog=[];/* registre d'activitat per a estadístiques: [{t:ISO,pid,xp,gold,frag,hours,stars,diff,arc}] */
var weeklyTemplates=[];/* plantilles setmanals: [{id,name,desc,arc,playerId,diff,xp,gold,frag,attr,attrPts}] (a game_data) */
var missionAssignees={};/* {missionId:[playerId,...]} assignació múltiple (a game_data) */
var rewardsPending={};/* {missionId:true} missions completades importades amb recompensa sense reclamar (a game_data) */
var itemLimits={};/* {itemId:{per:Number|null, total:Number|null}} límits de compra (a game_data) */
var itemPurchases={};/* {itemId:{total:Number, by:{playerId:Number}}} compres fetes (a game_data) */
var itemConsumable={};/* {itemId:true} items consumibles: en usar-los desapareixen (a game_data) */
var itemDuration={};/* {itemId:Number} durada en DIES (des que s'obté); caducat → desapareix (a game_data) */
var consumeHistory=[];/* [{itemId,name,icon,rareza,playerId,playerName,at,expired?}] historial de consum/caducitat (a game_data) */
// Càrrega d'scripts sota demanda (lazy). Retorna una Promise cachejada per URL.
var _scriptPromises={};
function _loadScript(src){
  if(_scriptPromises[src])return _scriptPromises[src];
  _scriptPromises[src]=new Promise(function(res,rej){
    var s=document.createElement('script');s.src=src;s.async=true;
    s.onload=function(){res();};
    s.onerror=function(){delete _scriptPromises[src];rej(new Error('No s\'ha pogut carregar '+src));};
    document.head.appendChild(s);
  });
  return _scriptPromises[src];
}
function _ensureChart(){
  if(typeof Chart!=='undefined')return Promise.resolve();
  return _loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js');
}
function _ensureXLSX(){
  if(typeof XLSX!=='undefined')return Promise.resolve();
  return _loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
}
function isConsumable(id){return !!itemConsumable[id];}
function itemDur(id){var d=itemDuration[id];return (d!=null&&d!==''&&!isNaN(d)&&d>0)?Number(d):null;}
// Comprova i retira els ítems caducats de tots els jugadors (durada des que s'obté). Retorna true si hi ha canvis.
function checkItemExpiry(){
  var now=Date.now();var changed=false;
  players.forEach(function(p){
    if(!p.inventory||!p.inventory.length)return;
    if(!p.itemAcq)p.itemAcq={};
    var uniq={};p.inventory.forEach(function(id){uniq[id]=true;});
    Object.keys(uniq).forEach(function(id){
      var days=itemDur(id);if(!days)return;
      if(!p.itemAcq[id])p.itemAcq[id]=new Date().toISOString();
      var acq=Date.parse(p.itemAcq[id]);if(isNaN(acq))return;
      if(now-acq>=days*86400000){
        var item=shopItems.find(function(i){return i.id===id;});
        var count=p.inventory.filter(function(x){return x===id;}).length;
        p.inventory=p.inventory.filter(function(x){return x!==id;});
        if(p.equipped)Object.keys(p.equipped).forEach(function(k){if(p.equipped[k]===id)p.equipped[k]=null;});
        delete p.itemAcq[id];
        for(var c=0;c<count;c++){
          consumeHistory.unshift({itemId:id,name:item?item.name:id,icon:item?(item.icon||'📦'):'📦',rareza:item?item.rareza:'comun',playerId:p.id,playerName:p.name,at:new Date().toISOString(),expired:true});
        }
        changed=true;
      }
    });
  });
  if(changed){if(consumeHistory.length>1000)consumeHistory=consumeHistory.slice(0,1000);if(CFG.MODE==='supabase')saveToSupabase();}
  return changed;
}
// Marca el moment d'obtenció d'un ítem (per calcular-ne la caducitat)
function markItemAcquired(p,itemId){if(!p)return;if(!p.itemAcq)p.itemAcq={};if(!p.itemAcq[itemId])p.itemAcq[itemId]=new Date().toISOString();}
function itemLim(id){return itemLimits[id]||{};}
function itemBoughtTotal(id){return (itemPurchases[id]&&itemPurchases[id].total)||0;}
function itemBoughtBy(id,pid){return (itemPurchases[id]&&itemPurchases[id].by&&itemPurchases[id].by[pid])||0;}
function itemStockLeft(id){var l=itemLim(id);if(l.total==null||l.total==='')return Infinity;return Math.max(0,(+l.total)-itemBoughtTotal(id));}
function itemPerLeft(id,pid){var l=itemLim(id);if(l.per==null||l.per==='')return Infinity;return Math.max(0,(+l.per)-itemBoughtBy(id,pid));}
function resetItemPurchases(id){if(!confirm('Reiniciar el comptador de compres d\'aquest ítem? Tornarà a estar disponible per a tothom.'))return;delete itemPurchases[id];if(CFG.MODE==='supabase')saveToSupabase();try{openAdminEditItem(id);}catch(e){}renderShop();}

/* ══ CARGA ══ */

// Claus de configuració/catàlegs (viuen a la fila game_data 'config', separades de l'estat)
var CONFIG_KEYS=['attr_defs','custom_traits','widget_catalog','slot_defs','class_growth'];
async function loadFromSupabase(){
  try{
    const r=await fetch(`${CFG.SUPABASE_URL}/rest/v1/game_data?id=in.(main,config)&select=id,data`,{
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
    const rows=await r.json();
    if(!Array.isArray(rows)||!rows.length)return null;
    var main=null,cfg=null;
    rows.forEach(function(x){if(x.id==='main')main=x.data;else if(x.id==='config')cfg=x.data;});
    // Fusió tolerant: si hi ha 'config' les seves claus manen; si no, tot ve de 'main' (compatible amb dades antigues)
    if(main&&cfg)return Object.assign({},main,cfg);
    return main||cfg||null;
  }catch(e){console.error('Supabase load error',e);return null;}
}


async function saveItemToSupabase(item){
  try{
    const _r=await fetch(CFG.SUPABASE_URL+'/rest/v1/equipamiento',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify({
        id:item.id,
        nombre:item.name,
        icono:item.icon||'📦',
        imagen_url:item.imageUrl||null,
        descripcion:item.desc||'',
        tipo:item.slot,
        rareza:item.rareza||'comun',
        coste_oro:item.cost||0,
        nivel_minimo:item.minLevel||1,
        via_obtencion:item.via||'tienda',
        req_attrs:item.minAttrs||{fue:0,int:0,agi:0,car:0,sab:0},
        bonus_attrs:item.bonus||{fue:0,int:0,agi:0,car:0,sab:0},
        avatar_pos:item.avatarPos||null,
        es_cosmetic:item.isCosmetic||false,
        activo:true
      })
    });
    if(!_r.ok){const _e=await _r.text();console.error('Supabase error saving item:',_r.status,_e);}
  }catch(e){console.error('Error saving item to Supabase',e);}
}
async function deleteItemFromSupabase(id){
  try{
    await fetch(CFG.SUPABASE_URL+'/rest/v1/equipamiento?id=eq.'+id,{
      method:'DELETE',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
  }catch(e){console.error('Error deleting item from Supabase',e);}
}
async function saveCartaToSupabase(carta){
  try{
    await fetch(CFG.SUPABASE_URL+'/rest/v1/cartas',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify({id:carta.id,nombre:carta.name,imagen_url:carta.imageUrl||null,rareza:carta.rarity,descripcion:carta.description||null,activo:true})
    });
  }catch(e){console.error('Error saving carta',e);}
}
async function deleteCartaFromSupabase(id){
  try{
    await fetch(CFG.SUPABASE_URL+'/rest/v1/cartas?id=eq.'+id,{
      method:'DELETE',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
  }catch(e){console.error('Error deleting carta',e);}
}
// ══ MISIONES: mapping entre formato JS y Supabase ══
function missionToRow(m){
  return {
    id:m.id,nombre:m.name,descripcion:m.desc||'',arco:m.arc||'',
    player_id:m.playerId||'',status:m.status||'pending',diff:m.diff||'C',
    xp:m.xp||0,gold:m.gold||0,frag:m.frag||0,attr:m.attr||'',attr_pts:m.attrPts||0,
    duration_h:m.durationH||0,stars:m.stars||0,
    deadline:m.deadline||'',daily:!!m.daily,is_daily_instance:!!m.isDaily_instance,
    template_id:m.templateId||'',planner_id:m.plannerId||'',
    from_planner:!!m.fromPlanner,created_by:m.createdBy||'',
    planner_creator:m.plannerCreator||'',planner_assignee:m.plannerAssignee||'',planner_tags:m.plannerTags||''
  };
}
function rowToMission(r){
  return {
    id:r.id,name:r.nombre,desc:r.descripcion||'',arc:r.arco||'General',
    playerId:r.player_id||'',status:r.status||'pending',diff:r.diff||'C',
    xp:r.xp||0,gold:r.gold||0,frag:r.frag||0,attr:r.attr||'',attrPts:r.attr_pts||0,
    durationH:r.duration_h||0,stars:r.stars||0,
    deadline:r.deadline||'',daily:!!r.daily,isDaily_instance:!!r.is_daily_instance,
    templateId:r.template_id||'',plannerId:r.planner_id||'',
    fromPlanner:!!r.from_planner,createdBy:r.created_by||'',
    plannerCreator:r.planner_creator||'',plannerAssignee:r.planner_assignee||'',plannerTags:r.planner_tags||''
  };
}
async function saveMissionToSupabase(m){
  try{
    const _r=await fetch(CFG.SUPABASE_URL+'/rest/v1/misiones',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify(missionToRow(m))
    });
    if(!_r.ok){const _e=await _r.text();console.error('Error saving mission:',_r.status,_e);}
  }catch(e){console.error('Error saving mission',e);}
}
async function saveAllMissionsToSupabase(){
  if(!missions.length)return;
  var r=await fetch(CFG.SUPABASE_URL+'/rest/v1/misiones',{
    method:'POST',
    headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
    body:JSON.stringify(missions.map(missionToRow))
  });
  if(!r.ok){var t='';try{t=await r.text();}catch(e){}throw new Error('misiones save '+r.status+' '+t.slice(0,200));}
}
async function deleteMissionFromSupabase(id){
  try{
    await fetch(CFG.SUPABASE_URL+'/rest/v1/misiones?id=eq.'+id,{
      method:'DELETE',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
  }catch(e){console.error('Error deleting mission',e);}
}
async function loadMissionsFromSupabase(){
  try{
    const _r=await fetch(CFG.SUPABASE_URL+'/rest/v1/misiones?order=creado_at',{
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
    const _d=await _r.json();
    return Array.isArray(_d)?_d.map(rowToMission):null;
  }catch(e){console.error('Error loading missions',e);return null;}
}

// ══ CLASES: mapping entre formato JS y Supabase ══
function classToRow(cls,idx){
  return {
    id:cls.id,nombre:cls.name,rol:cls.role||'',icono:cls.icon||'⚔️',
    attrs:cls.attrs||{fue:1,int:1,agi:1,car:1,sab:1},
    items_iniciales:cls.startItems||[],orden:(typeof idx==='number'?idx:cls.orden||0)
  };
}
function rowToClass(r){
  var attrs=r.attrs;
  if(typeof attrs==='string'){try{attrs=JSON.parse(attrs);}catch(e){attrs=null;}}
  if(!attrs||typeof attrs!=='object')attrs={fue:1,int:1,agi:1,car:1,sab:1};
  // Asegurar las 5 claves y valores numéricos
  attrKeys().forEach(function(k){attrs[k]=parseInt(attrs[k])||0;});
  var items=r.items_iniciales;
  if(typeof items==='string'){try{items=JSON.parse(items);}catch(e){items=[];}}
  if(!Array.isArray(items))items=[];
  return {
    id:r.id,name:r.nombre,role:r.rol||'',icon:r.icono||'⚔️',
    attrs:attrs,startItems:items,orden:r.orden||0,
    bonus:computeClassBonus(attrs)
  };
}
function computeClassBonus(attrs){
  return Object.entries(attrs||{}).filter(function(e){return (e[1]||0)>0;}).sort(function(a,b){return b[1]-a[1];}).slice(0,2)
    .map(function(e){
      var nm=(typeof attrName==='function')?attrName(e[0]):e[0];
      var ab=((nm||e[0])+'').replace(/[^\p{L}0-9]/gu,'').slice(0,3).toUpperCase()||(e[0]+'').toUpperCase();
      return '+'+e[1]+' '+ab;
    }).join(' · ');
}
async function loadClassesFromSupabase(){
  try{
    const _r=await fetch(CFG.SUPABASE_URL+'/rest/v1/clases?order=orden',{
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
    const _d=await _r.json();
    return Array.isArray(_d)&&_d.length?_d.map(rowToClass):null;
  }catch(e){console.error('Error loading classes',e);return null;}
}
async function saveClassToSupabase(cls,idx){
  try{
    const _r=await fetch(CFG.SUPABASE_URL+'/rest/v1/clases',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify(classToRow(cls,idx))
    });
    if(!_r.ok){const _e=await _r.text();console.error('Error saving class:',_r.status,_e);}
  }catch(e){console.error('Error saving class',e);}
}

/* Config compartida (no és dada de compte). */
/* gacha_cards NO s'hi desa: les cartes viuen a la taula "cartas" (aquí seria un duplicat mort) */
function _sharedGameData(){return {arcs:arcs,cal_events:calEvents,attr_defs:ATTRS,custom_traits:customTraits,widget_catalog:widgetCatalog,slot_defs:SLOT_DEFS,class_growth:classGrowthMap,market:market,market_history:marketHistory,weekly_templates:weeklyTemplates,mission_assignees:missionAssignees,rewards_pending:rewardsPending,item_limits:itemLimits,item_purchases:itemPurchases,item_consumable:itemConsumable,item_duration:itemDuration,consume_history:consumeHistory,stats_log:statsLog};}
// Registra una activitat (finalització de missió) per a les estadístiques setmanals/mensuals
function logActivity(pid,m,goldGiven){
  if(!pid||!m)return;
  var tags=(m.plannerTags&&m.plannerTags.indexOf('weekly:')!==0)?m.plannerTags.split(';').map(function(t){return t.trim();}).filter(Boolean):[];
  var _ak=m.attr?(attrKeyFromName(m.attr)||''):'';
  statsLog.push({t:new Date().toISOString(),pid:pid,xp:m.xp||0,gold:goldGiven||0,frag:m.frag||0,hours:m.durationH||0,stars:m.stars||0,diff:m.diff||'C',arc:m.arc||'General',tags:tags,attr:_ak,attrPts:(_ak?(m.attrPts||0):0)});
  // Poda: conservar ~13 mesos i màxim 4000 entrades
  var lim=new Date();lim.setMonth(lim.getMonth()-13);var limS=lim.toISOString();
  statsLog=statsLog.filter(function(e){return e.t>=limS;});
  if(statsLog.length>4000)statsLog=statsLog.slice(statsLog.length-4000);
}
/*
 Desa fent FUSIÓ de jugadors: només sobreescriu els personatges que aquest client ha canviat
 (el de la sessió + els passats a extraPlayerIds). Per a la resta manté la versió de la BD.
 Així dos usuaris alhora no es piseguen les dades de compte. removedIds s'exclouen (esborrat).
*/
var _saveStatusTimer=null;
function saveStatus(state){
  var el=document.getElementById('save-status');
  if(!el){el=document.createElement('div');el.id='save-status';document.body.appendChild(el);}
  if(_saveStatusTimer){clearTimeout(_saveStatusTimer);_saveStatusTimer=null;}
  if(state==='saving'){el.className='show saving';el.innerHTML='<span class="ss-dot"></span> Desant…';}
  else if(state==='saved'){el.className='show saved';el.innerHTML='✓ Desat';_saveStatusTimer=setTimeout(function(){el.className='';},1800);}
  else if(state==='error'){el.className='show error';el.innerHTML='⚠️ Error en desar';_saveStatusTimer=setTimeout(function(){el.className='';},4000);}
}
var _undoTimer=null;
function showUndo(msg,undoFn){
  var el=document.getElementById('undo-bar');
  if(!el){el=document.createElement('div');el.id='undo-bar';document.body.appendChild(el);}
  el.innerHTML='<span>'+msg+'</span><button type="button">↩️ Desfer</button>';
  el.classList.add('show');
  if(_undoTimer)clearTimeout(_undoTimer);
  var hide=function(){el.classList.remove('show');if(_undoTimer){clearTimeout(_undoTimer);_undoTimer=null;}};
  el.querySelector('button').onclick=function(){hide();try{undoFn();}catch(e){console.error(e);}};
  _undoTimer=setTimeout(hide,6500);
}
function _sbHeaders(){return {'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'};}
// POST amb comprovació de resposta i reintents amb backoff (per errors de xarxa o 5xx/429)
async function _postWithRetry(url,body,tries){
  tries=tries||3;var lastErr;
  for(var i=0;i<tries;i++){
    try{
      var r=await fetch(url,{method:'POST',headers:_sbHeaders(),body:JSON.stringify(body)});
      if(r.ok)return r;
      var t='';try{t=await r.text();}catch(e){}
      lastErr=new Error(r.status+' '+t.slice(0,200));
      if(r.status<500&&r.status!==429)break; // 4xx (excepte 429) no es reintenten
    }catch(e){lastErr=e;}
    if(i<tries-1)await new Promise(function(res){setTimeout(res,400*(i+1));});
  }
  throw lastErr||new Error('fetch failed');
}
// Cua offline: si falla el desat de game_data (font de veritat), es guarda localment i es reintenta en tornar la connexió
function _queuePendingSave(data){try{localStorage.setItem('cg_pending_save',JSON.stringify(data));}catch(e){}}
function _clearPendingSave(){try{localStorage.removeItem('cg_pending_save');}catch(e){}}
async function _flushPendingSave(){
  var raw;try{raw=localStorage.getItem('cg_pending_save');}catch(e){return;}
  if(!raw)return;
  var data;try{data=JSON.parse(raw);}catch(e){_clearPendingSave();return;}
  try{await _postWithRetry(`${CFG.SUPABASE_URL}/rest/v1/game_data`,{id:'main',data:data},2);_clearPendingSave();toast('Canvis pendents desats');}catch(e){/* segueix pendent */}
}
if(typeof window!=='undefined')window.addEventListener('online',function(){_flushPendingSave();});
// Wrapper "debounce": agrupa desats seguits en un de sol (menys tràfic).
// Acumula els ids afectats i buida immediatament si la pàgina es tanca (cap dada es perd).
var _saveTimer=null,_saveAccExtra={},_saveAccRemoved={},_saveWaiters=[];
function saveToSupabase(extraPlayerIds,removedIds){
  (extraPlayerIds||[]).forEach(function(id){if(id)_saveAccExtra[id]=true;});
  (removedIds||[]).forEach(function(id){if(id)_saveAccRemoved[id]=true;});
  saveStatus('saving');
  return new Promise(function(res){
    _saveWaiters.push(res);
    if(_saveTimer)clearTimeout(_saveTimer);
    _saveTimer=setTimeout(_flushSave,450);
  });
}
function _flushSave(){
  if(_saveTimer){clearTimeout(_saveTimer);_saveTimer=null;}
  if(!_saveWaiters.length)return Promise.resolve();
  var extra=Object.keys(_saveAccExtra);_saveAccExtra={};
  var removed=Object.keys(_saveAccRemoved);_saveAccRemoved={};
  var waiters=_saveWaiters;_saveWaiters=[];
  return _saveToSupabaseNow(extra,removed).then(function(){waiters.forEach(function(w){w();});},function(){waiters.forEach(function(w){w();});});
}
try{window.addEventListener('pagehide',function(){if(_saveWaiters.length)_flushSave();});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&_saveWaiters.length)_flushSave();});}catch(e){}
async function _saveToSupabaseNow(extraPlayerIds,removedIds){
  saveStatus('saving');
  var merged=null,removed={};
  try{
    var mine={};[session.playerId].concat(extraPlayerIds||[]).forEach(function(id){if(id)mine[id]=true;});
    (removedIds||[]).forEach(function(id){if(id)removed[id]=true;});
    // Llegir l'estat actual per fusionar (evita pisar canvis d'altres usuaris)
    var dbPlayers=[];
    try{
      var _lat=await fetch(`${CFG.SUPABASE_URL}/rest/v1/game_data?id=eq.main&select=data`,{headers:_sbHeaders()}).then(function(r){return r.json();});
      if(_lat&&_lat[0]&&_lat[0].data&&Array.isArray(_lat[0].data.players))dbPlayers=_lat[0].data.players;
    }catch(e){dbPlayers=players.slice();}
    var byId={};
    dbPlayers.forEach(function(p){if(p&&!removed[p.id])byId[p.id]=p;});
    players.forEach(function(p){if(!removed[p.id]&&(mine[p.id]||!byId[p.id]))byId[p.id]=p;});
    Object.keys(removed).forEach(function(id){delete byId[id];});
    merged=Object.keys(byId).map(function(k){return byId[k];});
    var full=Object.assign({},_sharedGameData(),{players:merged});
    // Separar catàlegs (config) de l'estat (main): la BD queda ordenada
    var cfg={};var data={};
    Object.keys(full).forEach(function(k){if(CONFIG_KEYS.indexOf(k)>=0)cfg[k]=full[k];else data[k]=full[k];});
    // 1) game_data['main'] = FONT DE VERITAT (jugadors + estat): si falla, no seguim i desem a la cua offline
    try{
      await _postWithRetry(`${CFG.SUPABASE_URL}/rest/v1/game_data`,{id:'main',data:data});
      // 1b) game_data['config'] = catàlegs (no crític: si falla, els catàlegs segueixen a 'main' fins al pròxim cop)
      try{await _postWithRetry(`${CFG.SUPABASE_URL}/rest/v1/game_data`,{id:'config',data:cfg},2);}catch(e2){console.warn('config save (no crític)',e2);}
      _clearPendingSave();
    }catch(e){
      console.error('game_data save error',e);
      _queuePendingSave(full);
      saveStatus('error');
      return;
    }
    // 2) Missions i 3) mirall de players: independents (un fallo no bloqueja l'altre)
    var missionsOk=true;
    try{await saveAllMissionsToSupabase();}catch(e){missionsOk=false;console.error('missions save error',e);}
    try{await mirrorPlayersToTable(merged,Object.keys(removed));}catch(e){console.warn('mirror players (no crític)',e);}
    saveStatus(missionsOk?'saved':'error');
  }catch(e){console.error('Supabase save error',e);saveStatus('error');}
}
async function mirrorPlayersToTable(list,removedIds){
  try{
    (removedIds||[]).forEach(function(id){
      if(!id)return;
      fetch(CFG.SUPABASE_URL+'/rest/v1/players?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}}).catch(function(){});
    });
    if(!list||!list.length)return;
    var now=new Date().toISOString();
    var rows=list.map(function(p){return {
      id:p.id,name:p.name||'',classe:p.cls||'',role:p.role||'',
      level:p.level||1,xp:p.xp||0,xp_next:p.xpNext||100,gold:p.gold||0,
      fragments:p.fragments||0,gacha_tokens:p.gachaTokens||0,missions:p.missions||0,
      pending_attr_pts:p.pendingAttrPts||0,
      real_name:p.realName||'',emblem:p.emblem||'',color:p.color||'',color_bg:p.colorBg||'',
      quote:p.quote||'',lore:p.lore||'',last_daily:p.lastDaily||'',avatar_frame:p.avatarFrame||'',
      updated_at:now,
      // A "data" només hi queden les estructures (llistes/objectes) que no caben en columnes
      data:{attrs:p.attrs,baseAttrs:p.baseAttrs,avatar:p.avatar,equipped:p.equipped,equipPos:p.equipPos,showcase:p.showcase,widgets:p.widgets,widgetSizes:p.widgetSizes,widgetPos:p.widgetPos,gallery:p.gallery,inventory:p.inventory,pin:p.pin}
    };});
    await fetch(CFG.SUPABASE_URL+'/rest/v1/players',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify(rows)
    });
  }catch(e){console.warn('mirror players (no crític)',e);}
}

async function loadData(){
  // Cartas del gacha desde Supabase
  try{
    const _cr=await fetch(CFG.SUPABASE_URL+'/rest/v1/cartas?activo=eq.true&order=rareza',{
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
    const _crd=await _cr.json();
    if(Array.isArray(_crd)&&_crd.length){
      gachaCards=_crd.map(r=>({id:r.id,name:r.nombre,rarity:r.rareza,imageUrl:r.imagen_url||'',description:r.descripcion||''}));
    }else{
      gachaCards=[];
    }
  }catch(e){gachaCards=[];}

  // Clases desde tabla dedicada (siempre, independiente de players)
  if(CFG.MODE==='supabase'){
    var _clsLoad=await loadClassesFromSupabase();
    if(_clsLoad&&_clsLoad.length)CLASSES=_clsLoad;
  }

  if(CFG.MODE==='supabase'){
    const d=await loadFromSupabase();
    if(d&&d.players){
      players =d.players;
      try{
        const _eq=await fetch(CFG.SUPABASE_URL+'/rest/v1/equipamiento?activo=eq.true&order=tipo',{
          headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
        });
        const _eqd=await _eq.json();
        shopItems=Array.isArray(_eqd)&&_eqd.length?_eqd.map(r=>({id:r.id,name:r.nombre,icon:r.icono||'📦',imageUrl:r.imagen_url||null,desc:r.descripcion||'',slot:r.tipo,rareza:r.rareza||'comun',cost:r.coste_oro,minLevel:r.nivel_minimo,via:r.via_obtencion||'tienda',minAttrs:r.req_attrs||{fue:0,int:0,agi:0,car:0,sab:0},bonus:r.bonus_attrs||{fue:0,int:0,agi:0,car:0,sab:0},avatarPos:r.avatar_pos||null,isCosmetic:r.es_cosmetic||false})):[];
      }catch{shopItems=[];}
      if(d.cal_events)calEvents=d.cal_events;
      else calEvents=[];
      if(Array.isArray(d.custom_traits))customTraits=d.custom_traits;
      if(Array.isArray(d.widget_catalog))widgetCatalog=d.widget_catalog;
      if(Array.isArray(d.slot_defs)&&d.slot_defs.length)SLOT_DEFS=d.slot_defs;
      if(d.class_growth&&typeof d.class_growth==='object')classGrowthMap=d.class_growth;
      if(Array.isArray(d.market))market=d.market;
      if(Array.isArray(d.market_history))marketHistory=d.market_history;
      if(Array.isArray(d.weekly_templates))weeklyTemplates=d.weekly_templates;
      if(d.mission_assignees&&typeof d.mission_assignees==='object')missionAssignees=d.mission_assignees;
      if(d.rewards_pending&&typeof d.rewards_pending==='object')rewardsPending=d.rewards_pending;
      if(d.item_limits&&typeof d.item_limits==='object')itemLimits=d.item_limits;
      if(d.item_purchases&&typeof d.item_purchases==='object')itemPurchases=d.item_purchases;
      if(d.item_consumable&&typeof d.item_consumable==='object')itemConsumable=d.item_consumable;
      if(d.item_duration&&typeof d.item_duration==='object')itemDuration=d.item_duration;
      if(Array.isArray(d.consume_history))consumeHistory=d.consume_history;
      if(Array.isArray(d.stats_log))statsLog=d.stats_log;
      if(Array.isArray(d.attr_defs)&&d.attr_defs.length){
        ATTRS=d.attr_defs.map(function(a){return {key:a.key,name:a.name,color:a.color||'#888',icon:a.icon||''};});
      }else if(d.attr_names&&typeof d.attr_names==='object'){
        ATTRS.forEach(function(a){if(d.attr_names[a.key])a.name=d.attr_names[a.key];});
      }
      try{normalizeAttrs();}catch(e){}
      // Asegurar que todos los players tienen todas las claves de atributo
      players.forEach(function(p){if(p.attrs){attrKeys().forEach(function(k){if(p.attrs[k]===undefined)p.attrs[k]=10;});}});
      // Nivell sempre automàtic segons l'XP (100 XP/nivell, màxim 100)
      players.forEach(function(p){p.level=levelFromXp(p.xp);p.xpNext=Math.min(MAX_LEVEL,p.level+1)*XP_PER_LEVEL;});

      // (ja no es generen missions de tutorial automàticament)
      // Load missions from dedicated table
      var _sbMissions=await loadMissionsFromSupabase();
      if(_sbMissions&&_sbMissions.length){
        missions=_sbMissions;
      }else if(d.missions&&d.missions.length){
        // MIGRATION: old missions in game_data → new table
        missions=d.missions;
        await saveAllMissionsToSupabase();
      }else{
        missions=[];
      }
      arcs    =d.arcs    ||[];
    }else{
      players =[];
      var _sbM=await loadMissionsFromSupabase();
      missions=_sbM&&_sbM.length?_sbM:[];
      arcs    =[];
      try{
        const _eq=await fetch(CFG.SUPABASE_URL+'/rest/v1/equipamiento?activo=eq.true&order=tipo',{
          headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
        });
        const _eqd=await _eq.json();
        shopItems=Array.isArray(_eqd)&&_eqd.length?_eqd.map(r=>({id:r.id,name:r.nombre,icon:r.icono||'📦',imageUrl:r.imagen_url||null,desc:r.descripcion||'',slot:r.tipo,rareza:r.rareza||'comun',cost:r.coste_oro,minLevel:r.nivel_minimo,via:r.via_obtencion||'tienda',minAttrs:r.req_attrs||{fue:0,int:0,agi:0,car:0,sab:0},bonus:r.bonus_attrs||{fue:0,int:0,agi:0,car:0,sab:0},avatarPos:r.avatar_pos||null,isCosmetic:r.es_cosmetic||false})):[];
      }catch{shopItems=[];}
      calEvents=[];
      await saveToSupabase();
    }
  }
  players.forEach(p=>{
    if(!p.gachaTokens)p.gachaTokens=0;
    if(p.fragments===undefined)p.fragments=0;
    if(!p.gallery)p.gallery=[];
    if(!p.lastDaily)p.lastDaily='';
    if(!p.inventory)p.inventory=[];
    if(!p.equipped)p.equipped=emptyEquipped();
    if(!p.pendingAttrPts)p.pendingAttrPts=0;
  });
  checkDailyMissions();
  checkWeeklyMissions();
}

/* ══ MISIONES DIARIAS ══ */
function checkDailyMissions(){
  var today=new Date().toISOString().slice(0,10);
  // For each player, find their personal daily templates and regenerate instances for today
  players.forEach(function(p){
    // Personal templates: daily=true, isDaily_instance=false, owned by this player
    var myTemplates=missions.filter(function(m){
      return m.daily&&!m.isDaily_instance&&m.playerId===p.id;
    });
    if(!myTemplates.length)return;
    // Treure instàncies completades de dies anteriors (i esborrar-les de la BD per no acumular)
    var _oldD=missions.filter(function(m){return m.isDaily_instance&&m.playerId===p.id&&m.status==='done'&&m.deadline!==today;}).map(function(m){return m.id;});
    if(_oldD.length){
      missions=missions.filter(function(m){return _oldD.indexOf(m.id)<0;});
      if(CFG.MODE==='supabase')_oldD.forEach(function(id){deleteMissionFromSupabase(id);});
    }
    // Create today's instances for any template that doesn't have one yet
    myTemplates.forEach(function(tpl){
      var instanceId=tpl.id+'_'+today;
      var exists=missions.find(function(m){return m.id===instanceId;});
      if(!exists){
        missions.push({
          id:instanceId,
          name:tpl.name,arc:tpl.arc||'General',
          playerId:p.id,status:'pending',
          diff:'C',xp:MISSION_XP,gold:MISSION_GOLD,frag:MISSION_FRAG,
          attr:'Saviesa',attrPts:1,
          deadline:today,daily:true,
          isDaily_instance:true,templateId:tpl.id,
          plannerId:'',createdBy:p.id
        });
      }
    });
  });
}

/* ── misiones SEMANALES (guardades a game_data, no toquen la taula misiones) ── */
function weekKey(d){var dd=d?new Date(d):new Date();var off=(dd.getDay()+6)%7;var mon=new Date(dd);mon.setDate(dd.getDate()-off);return mon.toISOString().slice(0,10);}
function _isWeekly(m){return !!(m&&m.plannerTags&&m.plannerTags.indexOf('weekly:')===0);}
function checkWeeklyMissions(){
  var wk=weekKey();
  // Treure instàncies setmanals que no són d'aquesta setmana (reset setmanal)
  missions=missions.filter(function(m){if(_isWeekly(m)){return m.plannerTags.slice(7)===wk;}return true;});
  var mon=new Date(wk);var end=new Date(mon);end.setDate(mon.getDate()+6);var endStr=end.toISOString().slice(0,10);
  weeklyTemplates.forEach(function(tpl){
    var instId=tpl.id+'__'+wk;
    if(missions.find(function(m){return m.id===instId;}))return;
    missions.push({
      id:instId,name:tpl.name,desc:tpl.desc||'',arc:tpl.arc||'General',
      playerId:tpl.playerId||'',status:'pending',diff:tpl.diff||'C',
      xp:tpl.xp||75,gold:tpl.gold||25,frag:tpl.frag||50,
      attr:tpl.attr||'',attrPts:tpl.attrPts||0,
      deadline:endStr,daily:false,isDaily_instance:false,
      templateId:tpl.id,plannerId:'',createdBy:tpl.playerId||'',plannerTags:'weekly:'+wk
    });
  });
}
function deleteWeeklyTemplate(id){
  var tpl=weeklyTemplates.find(function(t){return t.id===id;});if(!tpl)return;
  weeklyTemplates=weeklyTemplates.filter(function(t){return t.id!==id;});
  missions=missions.filter(function(m){return m.templateId!==id||!_isWeekly(m);});
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}
function exportJSON(){
  // Guardar en Supabase (ya no hay modo local)
  saveToSupabase();
  var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';
}
/* ══ COPIA DE SEGURETAT / RESTAURACIÓ ══ */
function backupData(){
  var data={players:players,arcs:arcs,market:market,gacha_cards:gachaCards,cal_events:calEvents,attr_defs:ATTRS,custom_traits:customTraits,widget_catalog:widgetCatalog,slot_defs:SLOT_DEFS,class_growth:classGrowthMap,missions:missions,_backup_ts:new Date().toISOString()};
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='itbmc-backup-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';
  toast('Còpia descarregada');
}
function restoreData(input){
  if(!session.isAdmin){alert('Només l\'admin pot restaurar.');return;}
  var f=input&&input.files&&input.files[0];if(!f)return;
  var rd=new FileReader();
  rd.onload=function(){
    try{
      var d=JSON.parse(rd.result);
      if(!d||!Array.isArray(d.players)){alert('Fitxer de còpia no vàlid.');return;}
      if(!confirm('Restaurar '+d.players.length+' jugadors i tota la configuració? AIXÒ SOBREESCRIU les dades actuals de Supabase.'))return;
      players=d.players;
      if(Array.isArray(d.arcs))arcs=d.arcs;
      if(Array.isArray(d.market))market=d.market;
      if(Array.isArray(d.market_history))marketHistory=d.market_history;
      if(Array.isArray(d.weekly_templates))weeklyTemplates=d.weekly_templates;
      if(d.mission_assignees&&typeof d.mission_assignees==='object')missionAssignees=d.mission_assignees;
      if(d.rewards_pending&&typeof d.rewards_pending==='object')rewardsPending=d.rewards_pending;
      if(d.item_limits&&typeof d.item_limits==='object')itemLimits=d.item_limits;
      if(d.item_purchases&&typeof d.item_purchases==='object')itemPurchases=d.item_purchases;
      if(d.item_consumable&&typeof d.item_consumable==='object')itemConsumable=d.item_consumable;
      if(d.item_duration&&typeof d.item_duration==='object')itemDuration=d.item_duration;
      if(Array.isArray(d.consume_history))consumeHistory=d.consume_history;
      if(Array.isArray(d.stats_log))statsLog=d.stats_log;
      if(Array.isArray(d.cal_events))calEvents=d.cal_events;
      if(Array.isArray(d.custom_traits))customTraits=d.custom_traits;
      if(Array.isArray(d.widget_catalog))widgetCatalog=d.widget_catalog;
      if(Array.isArray(d.slot_defs)&&d.slot_defs.length)SLOT_DEFS=d.slot_defs;
      if(d.class_growth&&typeof d.class_growth==='object')classGrowthMap=d.class_growth;
      if(Array.isArray(d.attr_defs)&&d.attr_defs.length)ATTRS=d.attr_defs;
      if(Array.isArray(d.missions))missions=d.missions;
      if(CFG.MODE==='supabase')saveToSupabase();
      renderAll();
      input.value='';
      alert('Restauració completada: '+players.length+' jugadors.');
    }catch(e){alert('Error llegint el fitxer: '+e);}
  };
  rd.readAsText(f);
}

/* ══ CÒPIES DEL SERVIDOR (RPC) ══ */
var _adminPwCache=null;
function _askAdminPw(){
  if(_adminPwCache)return _adminPwCache;
  var pw=prompt('Contrasenya d\'admin per gestionar còpies del servidor:');
  if(pw)_adminPwCache=pw;
  return pw;
}
async function openServerBackups(){
  if(!session.isAdmin)return;
  var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';
  var m=document.getElementById('server-backups-modal');if(m)m.style.display='flex';
  var list=document.getElementById('server-backups-list');
  if(list)list.innerHTML='<div style="font-size:13px;color:var(--muted);">Carregant…</div>';
  var pw=_askAdminPw();if(!pw){closeServerBackups();return;}
  try{
    var r=await fetch(CFG.SUPABASE_URL+'/rest/v1/rpc/list_backups',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({pw:pw})
    });
    if(!r.ok){var t=await r.text();list.innerHTML='<div style="font-size:13px;color:var(--coral);">No s\'ha pogut carregar (encara no has executat el SQL de còpies?).<br><span style="color:var(--muted);">'+r.status+': '+t.slice(0,120)+'</span></div>';return;}
    var rows=await r.json();
    if(!Array.isArray(rows)||!rows.length){list.innerHTML='<div style="font-size:13px;color:var(--muted);">Encara no hi ha còpies.</div>';return;}
    list.innerHTML='<div style="display:flex;flex-direction:column;gap:8px;">'+rows.map(function(b){
      var when='';try{when=new Date(b.snapshot_at).toLocaleString();}catch(e){}
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 11px;background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius);">'
        +'<div><div style="font-size:13px;font-weight:600;">'+when+'</div><div style="font-size:11px;color:var(--muted);">👥 '+(b.player_count!=null?b.player_count:'?')+' jugadors</div></div>'
        +'<button class="btn btn-sm btn-p" onclick="restoreServerBackup('+b.id+')">Restaurar</button></div>';
    }).join('')+'</div>';
  }catch(e){if(list)list.innerHTML='<div style="font-size:13px;color:var(--coral);">Error: '+e+'</div>';}
}
function closeServerBackups(){var m=document.getElementById('server-backups-modal');if(m)m.style.display='none';}
async function restoreServerBackup(bid){
  if(!session.isAdmin)return;
  var pw=_askAdminPw();if(!pw)return;
  if(!confirm('Restaurar aquesta còpia? SOBREESCRIU les dades actuals del servidor.'))return;
  try{
    var r=await fetch(CFG.SUPABASE_URL+'/rest/v1/rpc/restore_backup',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({pw:pw,bid:bid})
    });
    if(!r.ok){var t=await r.text();alert('No s\'ha pogut restaurar: '+r.status+' '+t.slice(0,160));return;}
    closeServerBackups();
    alert('Còpia restaurada. Es recarregarà l\'app.');
    location.reload();
  }catch(e){alert('Error: '+e);}
}

/* ══ AUTH ══ */
function showScreen(id){
  ['screen-welcome','screen-login','screen-admin','screen-new','screen-app'].forEach(s=>{
    const el=document.getElementById(s);el.style.display='none';
  });
  const t=document.getElementById(id);
  if(id==='screen-app')t.style.display='block';
  else if(id==='screen-new'){t.style.display='block';buildCreatorCls();buildCreatorColors('cp-colors');buildCreatorEmblems('cp-emblems');}
  else t.style.display='flex';
}

var _loginBusy=false;
async function doLogin(){
  if(_loginBusy)return;
  _loginBusy=true;
  var btn=document.querySelector('#screen-login .btn-p');
  var oldTxt=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent='Entrant…';}
  var errEl=document.getElementById('lerr');
  try{
    const name=document.getElementById('ln').value.trim().toLowerCase();
    const pin=document.getElementById('lp').value;
    function findP(){return players.find(function(p){return p&&p.name&&p.name.toLowerCase()===name;});}
    // Carrega dades; si no trobem el jugador, reintenta un parell de cops (pot ser una lectura freda/lenta)
    var p=null;
    for(var intent=0;intent<3;intent++){
      if(CFG.MODE==='supabase'){
        var d=await loadFromSupabase();
        if(d&&Array.isArray(d.players)&&d.players.length)players=d.players;
      }
      p=findP();
      if(p)break;
      if(intent<2)await new Promise(function(r){setTimeout(r,500);});
    }
    if(!p||(p.pin&&p.pin!==pin)){if(errEl)errEl.style.display='block';return;}
    if(errEl)errEl.style.display='none';
    session={loggedIn:true,isAdmin:false,playerId:p.id};
    localStorage.setItem('cg_pid',p.id);
    enterApp();
  }catch(e){
    console.error('Login error',e);
    if(errEl)errEl.style.display='block';
  }finally{
    _loginBusy=false;
    if(btn){btn.disabled=false;btn.textContent=oldTxt||'Entrar';}
  }
}
async function verifyAdminServer(pin){
  // Retorna true/false si el RPC existeix; null si no està configurat (per fer fallback)
  try{
    var r=await fetch(CFG.SUPABASE_URL+'/rest/v1/rpc/verify_admin',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({pw:pin})
    });
    if(!r.ok)return null; // funció no existeix encara (404) → fallback
    var v=await r.json();
    return v===true;
  }catch(e){return null;}
}
async function doAdminLogin(){
  const pin=document.getElementById('ap').value;
  var ok=await verifyAdminServer(pin);
  if(ok===null)ok=(!!CFG.ADMIN_PW&&pin===CFG.ADMIN_PW); // fallback només si hi ha contrasenya al codi (ara buida)
  if(!ok){document.getElementById('aerr').style.display='block';return;}
  document.getElementById('aerr').style.display='none';
  session={loggedIn:true,isAdmin:true,playerId:'admin'};
  enterApp();
}
function doLogout(){
  session={loggedIn:false,isAdmin:false,playerId:null};
  localStorage.removeItem('cg_pid');
  (function(){var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';})();
  showScreen('screen-welcome');
}
function enterApp(){
  showScreen('screen-app');
  document.body.classList.toggle('admin-mode', session.isAdmin);
  var adminNav=document.getElementById('nav-items-admin');
  if(adminNav)adminNav.style.display=session.isAdmin?'flex':'none';
  var classNav=document.getElementById('nav-classes-admin');
  if(classNav)classNav.style.display=session.isAdmin?'flex':'none';
  var wgNav=document.getElementById('nav-widgets-admin');
  if(wgNav)wgNav.style.display=session.isAdmin?'flex':'none';
  var plNav=document.getElementById('nav-planner');
  if(plNav)plNav.style.display=session.isAdmin?'flex':'none';
  var rb=document.getElementById('menu-restore');
  if(rb)rb.style.display=session.isAdmin?'block':'none';
  var sb=document.getElementById('menu-server-backups');
  if(sb)sb.style.display=session.isAdmin?'block':'none';
  const p=players.find(p=>p.id===session.playerId);
  if(p){const _idx=players.findIndex(function(pl){return pl.id===session.playerId;});if(_idx>=0)curHero=_idx;}
  document.getElementById('ulabel').textContent=session.isAdmin?'Déu 👑':(p?p.name.split(' ')[0]:'—');
  updateSidebarAvatar();
  (function(){var _x=document.getElementById('umname');if(_x)_x.textContent=session.isAdmin?'👑 Déu':(p?p.name:'—');})();
  renderAll();
  try{renderInicio();}catch(e){}
  try{populateSlotSelects();}catch(e){}
}
function toggleUMenu(){
  const m=document.getElementById('umenu-inline');
  if(m)m.style.display=m.style.display==='none'?'block':'none';
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#umenu-inline')&&!e.target.closest('#upill')){
    const m=document.getElementById('umenu-inline');if(m)m.style.display='none';
  }
});

/* ══ CREADOR ══ */
function buildCreatorCls(){
  const g=document.getElementById('cp-cgrid');if(!g)return;g.innerHTML='';
  CLASSES.forEach(c=>{
    const d=document.createElement('button');d.className='copt';
    d.innerHTML=`<div class="icon">${c.icon}</div><div class="cname">${c.name}</div><div class="crole">${c.role}</div><div class="cbonus">${c.bonus}</div>`;
    d.onclick=()=>{
      document.querySelectorAll('.copt').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');
      cpState.cls=c;
      try{buildAttrBars('cp-abars',(classGrowthMap[c.name]||defaultGrowth(c)),true);}catch(e){console.error('buildAttrBars error',e);}
      try{var cs=document.getElementById('cp-cstats');if(cs)cs.style.display='block';}catch(e){}
      try{buildStartItemsPreview(c);}catch(e){console.error('buildStartItemsPreview error',e);}
    };
    g.appendChild(d);
  });
}
function buildAttrBars(cid,attrs,boost){
  var el=document.getElementById(cid);if(!el)return;
  attrs=attrs||{};
  // Solo las claves conocidas, en orden fijo
  var keys=attrKeys();
  var maxAll=keys.reduce(function(m,k){return Math.max(m,parseInt(attrs[k])||0);},0);
  var maxv=Math.max(boost?3:6,maxAll);
  el.innerHTML=keys.map(function(k){
    var v=parseInt(attrs[k])||0;
    return '<div class="srow"><span class="slbl">'+attrIcon(k)+' '+(AN[k]||k)+'</span><div class="strk"><div class="sfill" style="width:'+Math.round(v/maxv*100)+'%;background:'+(AC[k]||'#888')+';"></div></div><span class="snum">'+(boost&&v>0?'+':'')+v+'</span></div>';
  }).join('');
}
function buildCreatorColors(cid){
  const c=document.getElementById(cid);if(!c)return;c.innerHTML='';
  if(!cpState.color)cpState.color=COLORS[0];
  COLORS.forEach((col,i)=>{const d=document.createElement('div');d.className='cdot'+(col.hex===cpState.color.hex?' selected':'');d.style.background=col.hex;d.onclick=()=>{c.querySelectorAll('.cdot').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');cpState.color=col;};c.appendChild(d);});
}
function buildCreatorEmblems(cid){
  const c=document.getElementById(cid);c.innerHTML='';
  EMBLEMS.forEach(e=>{const d=document.createElement('div');d.style.cssText=`width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;border:1px solid ${e===cpState.emblem?'var(--accent)':'var(--border)'};background:${e===cpState.emblem?'var(--bg3)':'transparent'};transition:all .15s;`;d.textContent=e;d.onclick=()=>{cpState.emblem=e;buildCreatorEmblems(cid);};c.appendChild(d);});
}
function buildStartItemsPreview(cls){
  const c=document.getElementById('cp-equip');if(!c)return;
  var items=(cls.startItems||[]).map(function(iid){return shopItems.find(function(i){return i.id===iid;});}).filter(Boolean);
  if(!items.length){c.innerHTML='<div style="font-size:12px;color:var(--muted);grid-column:1/-1;">Aquesta classe no té equipament inicial assignat.</div>';return;}
  c.innerHTML='<div style="grid-column:1/-1;"><div class="stitle">Equipament inicial de la classe</div></div>'
    +items.map(function(item){
      return '<div style="border:0.5px solid var(--border);border-radius:var(--radius);padding:8px;text-align:center;">'
        +(item.imageUrl?'<img src="'+item.imageUrl+'" style="width:100%;height:60px;object-fit:cover;border-radius:var(--radius);margin-bottom:4px;">':'<div style="font-size:24px;">'+item.icon+'</div>')
        +'<div style="font-size:11px;font-weight:500;margin-top:2px;">'+item.name+'</div>'
        +'<div style="font-size:10px;color:var(--muted);">'+item.slot+'</div>'
        +'</div>';
    }).join('');
}
function cGoTo(step){
  var wps=document.querySelectorAll('.wp');
  wps.forEach(function(p,i){p.classList.toggle('active',i===step);});
  var stps=document.querySelectorAll('.stepi');
  stps.forEach(function(s,i){s.classList.toggle('active',i===step);s.classList.toggle('done',i<step);});
}
function cNext(step){
  if(step===0){if(!document.getElementById('cp-rn').value.trim()){toast('Introdueix el teu nom real.');return;}if(!document.getElementById('cp-pn').value.trim()){toast('Tria un nom per al teu personatge.');return;}if(!document.getElementById('cp-pin').value){toast('Tria una contrasenya.');return;}}
  if(step===1&&!cpState.cls){toast('Tria primer una classe.');return;}
  cGoTo(step+1);
}
function saveNewChar(){
  const rn=document.getElementById('cp-rn').value.trim(),pn=document.getElementById('cp-pn').value.trim(),pin=document.getElementById('cp-pin').value;
  const lore=document.getElementById('cp-lore').value.trim(),quote=document.getElementById('cp-quote').value.trim();
  if(!cpState.cls){toast('Torna al pas 2 i tria una classe.');return;}
  // Items iniciales fijos de la clase
  var startItems=(cpState.cls.startItems||[]).slice();
  var equipped=emptyEquipped();
  startItems.forEach(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(item&&equipped.hasOwnProperty(item.slot)&&!equipped[item.slot])equipped[item.slot]=iid;
  });
  const np={id:'pj'+Date.now(),realName:rn,name:pn,cls:cpState.cls.name,role:cpState.cls.role,emblem:cpState.emblem,color:cpState.color.hex,colorBg:cpState.color.bg,level:1,xp:0,xpNext:100,gold:0,missions:0,lore:lore||'Història per escriure...',quote:quote||'...',pin,attrs:zeroAttrs(),baseAttrs:zeroAttrs(),gachaTokens:0,fragments:0,gallery:[],lastDaily:'',inventory:startItems,equipped:equipped,pendingAttrPts:0};
  players.push(np);
  startItems.forEach(function(iid){markItemAcquired(np,iid);});
  checkDailyMissions();
  if(CFG.MODE==='supabase')saveToSupabase();
  session={loggedIn:true,isAdmin:false,playerId:np.id};localStorage.setItem('cg_pid',np.id);
  const idx=players.findIndex(function(pl){return pl.id===np.id;});if(idx>=0)curHero=idx;
  setTimeout(()=>enterApp(),300);
}

/* ══ RENDER ══ */
function renderAll(){applyMenuNames();renderMStats();renderMissions();renderHeroTabs();renderArcs();renderRanking();renderGachaGold();renderShop();populateArcSelect();}
function renderInicio(){
  var hero=document.getElementById('inicio-hero');
  if(hero){
    var p=players.find(function(pl){return pl.id===session.playerId;});
    var name=session.isAdmin?'Déu 👑':(p?p.name.split(' ')[0]:'—');
    var sub=session.isAdmin
      ?'Tens el control absolut d\'ITBMC.'
      :(p?('Nivell '+p.level+' · '+p.cls+' · <span class="coin"></span> '+fmtGold(p.gold)):'');
    hero.innerHTML='<div class="card hero-card">'
      +'<div class="hero-hi">Hola, '+_esc(name)+' 👋</div>'
      +'<div class="hero-sub">'+sub+'</div>'
      +'</div>';
  }
  renderUserWidgets();
}
function renderUserWidgets(){
  var cont=document.getElementById('user-widgets');
  if(!cont)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  // Botón de gestionar (siempre visible si hay catálogo o widgets)
  var manageBtn=(widgetCatalog.length&&p)?'<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:8px;">'+((p.widgets&&p.widgets.length)?'<button class="btn btn-sm" onclick="arrangeWidgets()" title="Ordena totes les extensions sense solapaments">🧹 Organitzar</button>':'')+'<button class="btn btn-sm" onclick="openWidgetPicker()">🧩 Gestionar widgets</button></div>':'';
  if(!p||!p.widgets||!p.widgets.length){
    cont.innerHTML=manageBtn;
    return;
  }
  if(!p.widgetSizes)p.widgetSizes={};
  if(!p.widgetPos)p.widgetPos={};
  var html=manageBtn;
  html+='<div class="widgets-canvas" id="widgets-canvas">';
  p.widgets.forEach(function(wid,idx){
    var w=widgetCatalog.find(function(x){return x.id===wid;});
    if(!w)return;
    var sz=normWidgetSize(p.widgetSizes[wid],w);
    var pos=(p.widgetPos&&p.widgetPos[wid])?p.widgetPos[wid]:_defaultWidgetPos(idx,sz);
    html+='<div id="wcard-'+wid+'" class="card widget-card widget-'+w.type+'" style="width:'+sz.w+'px;left:'+pos.x+'px;top:'+pos.y+'px;">'
      +'<div class="stitle widget-drag" onmousedown="startWidgetDrag(event,\''+wid+'\')" ontouchstart="startWidgetDrag(event,\''+wid+'\')" title="Arrossega per moure" style="margin:0 0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:move;">⠿ '+(w.icon||'🧩')+' '+w.name+'</div>'
      +'<iframe id="wframe-'+wid+'" src="'+_esc(w.embedUrl)+'" width="100%" height="'+sz.h+'" frameborder="0" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation allow-forms" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:10px;display:block;height:'+sz.h+'px;"></iframe>'
      +'<div class="widget-resize widget-resize-tr" title="Arrossega per canviar la mida" onmousedown="startWidgetResize(event,\''+wid+'\',\'tr\')" ontouchstart="startWidgetResize(event,\''+wid+'\',\'tr\')">◹</div>'
      +'<div class="widget-resize" title="Arrossega per canviar la mida" onmousedown="startWidgetResize(event,\''+wid+'\',\'br\')" ontouchstart="startWidgetResize(event,\''+wid+'\',\'br\')">◢</div>'
      +'</div>';
  });
  html+='</div>';
  cont.innerHTML=html;
  setTimeout(updateWidgetCanvasHeight,60);
}
// Posició per defecte (graella suau) per a widgets encara sense posició desada
function _defaultWidgetPos(idx,sz){
  var perRow=3,gap=16,colW=(sz&&sz.w?sz.w:340)+gap;
  return {x:(idx%perRow)*colW,y:Math.floor(idx/perRow)*260};
}
// Ajusta l'alçada del llenç perquè càpiguen tots els widgets absoluts
function updateWidgetCanvasHeight(){
  var canvas=document.getElementById('widgets-canvas');if(!canvas)return;
  var max=0;
  canvas.querySelectorAll('.widget-card').forEach(function(c){var b=c.offsetTop+c.offsetHeight;if(b>max)max=b;});
  canvas.style.minHeight=(max+24)+'px';
}
// Rectangles de tots els widgets (excepte un opcional)
function _widgetRects(exceptWid){
  var canvas=document.getElementById('widgets-canvas');if(!canvas)return [];
  var rects=[];
  canvas.querySelectorAll('.widget-card').forEach(function(c){
    var wid=c.id.replace('wcard-','');
    if(exceptWid&&wid===exceptWid)return;
    rects.push({x:c.offsetLeft,y:c.offsetTop,w:c.offsetWidth,h:c.offsetHeight});
  });
  return rects;
}
function _rectsOverlap(a,b,gap){gap=gap||8;return !(a.x+a.w+gap<=b.x||b.x+b.w+gap<=a.x||a.y+a.h+gap<=b.y||b.y+b.h+gap<=a.y);}
// Si la posició (x,y) del widget xoca amb un altre, l'empeny cap avall fins trobar lloc lliure
function _resolveWidgetCollision(wid,x,y,w,h){
  var others=_widgetRects(wid);
  var rect={x:Math.max(0,x),y:Math.max(0,y),w:w,h:h};
  var guard=0;
  while(guard++<600){
    var hit=null;
    for(var i=0;i<others.length;i++){if(_rectsOverlap(rect,others[i])){hit=others[i];break;}}
    if(!hit)break;
    rect.y=hit.y+hit.h+16;
  }
  return {x:Math.round(rect.x),y:Math.round(rect.y)};
}
// Organitza totes les extensions en una graella ordenada (sense solapaments)
function arrangeWidgets(){
  var p=players.find(function(pl){return pl.id===session.playerId;});if(!p)return;
  var canvas=document.getElementById('widgets-canvas');if(!canvas)return;
  var cards=[].slice.call(canvas.querySelectorAll('.widget-card'));
  if(!cards.length){toast('No tens extensions per organitzar.');return;}
  var maxW=canvas.clientWidth||1000;var gap=16;
  var x=0,y=0,rowH=0;
  if(!p.widgetPos)p.widgetPos={};
  cards.forEach(function(c){
    var wid=c.id.replace('wcard-','');
    var cardW=c.offsetWidth,cardH=c.offsetHeight;
    if(x>0&&x+cardW>maxW+1){x=0;y+=rowH+gap;rowH=0;}
    c.style.left=x+'px';c.style.top=y+'px';
    p.widgetPos[wid]={x:Math.round(x),y:Math.round(y)};
    x+=cardW+gap;
    if(cardH>rowH)rowH=cardH;
  });
  updateWidgetCanvasHeight();
  if(CFG.MODE==='supabase')saveToSupabase();
  toast('Extensions organitzades');
}
/* ── Moure widgets lliurement (drag de la capçalera) ── */
var _wDrag=null;
function startWidgetDrag(e,wid){
  var card=document.getElementById('wcard-'+wid);
  var canvas=document.getElementById('widgets-canvas');
  if(!card||!canvas)return;
  if(e.cancelable)e.preventDefault();
  var pt=e.touches?e.touches[0]:e;
  _wDrag={wid:wid,card:card,canvas:canvas,startX:pt.clientX,startY:pt.clientY,origX:card.offsetLeft,origY:card.offsetTop};
  document.querySelectorAll('.widget-card iframe').forEach(function(f){f.style.pointerEvents='none';});
  card.style.zIndex=100;card.classList.add('dragging');
  document.body.style.userSelect='none';
  document.addEventListener('mousemove',onWidgetDragMove);
  document.addEventListener('mouseup',endWidgetDrag);
  document.addEventListener('touchmove',onWidgetDragMove,{passive:false});
  document.addEventListener('touchend',endWidgetDrag);
}
function onWidgetDragMove(e){
  if(!_wDrag)return;
  if(e.cancelable)e.preventDefault();
  var pt=e.touches?e.touches[0]:e;
  // Moviment lliure: sense límits de marge (l'usuari col·loca on vulgui)
  var x=_wDrag.origX+(pt.clientX-_wDrag.startX);
  var y=_wDrag.origY+(pt.clientY-_wDrag.startY);
  _wDrag.card.style.left=x+'px';_wDrag.card.style.top=y+'px';
}
function endWidgetDrag(){
  if(!_wDrag)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  // Evitar solapaments: si la posició xoca amb un altre widget, l'empenyem a un lloc lliure
  var resolved=_resolveWidgetCollision(_wDrag.wid,_wDrag.card.offsetLeft,_wDrag.card.offsetTop,_wDrag.card.offsetWidth,_wDrag.card.offsetHeight);
  _wDrag.card.style.left=resolved.x+'px';_wDrag.card.style.top=resolved.y+'px';
  if(p){if(!p.widgetPos)p.widgetPos={};p.widgetPos[_wDrag.wid]={x:resolved.x,y:resolved.y};if(CFG.MODE==='supabase')saveToSupabase();}
  _wDrag.card.style.zIndex='';_wDrag.card.classList.remove('dragging');
  document.querySelectorAll('.widget-card iframe').forEach(function(f){f.style.pointerEvents='';});
  document.body.style.userSelect='';
  document.removeEventListener('mousemove',onWidgetDragMove);
  document.removeEventListener('mouseup',endWidgetDrag);
  document.removeEventListener('touchmove',onWidgetDragMove);
  document.removeEventListener('touchend',endWidgetDrag);
  updateWidgetCanvasHeight();
  _wDrag=null;
}
function normWidgetSize(v,w){
  var dw=340,dh=(w&&w.height)||200;
  if(typeof v==='number')return {w:dw,h:v};
  if(v&&typeof v==='object')return {w:v.w||dw,h:v.h||dh};
  return {w:dw,h:dh};
}
// Auto-ajustar una extensió: alçada a proporció 16:9 respecte l'amplada actual
function autoFitWidget(wid){
  var p=players.find(function(pl){return pl.id===session.playerId;});if(!p)return;
  var card=document.getElementById('wcard-'+wid);
  var fr=document.getElementById('wframe-'+wid);
  if(!card||!fr)return;
  var w=card.offsetWidth||340;
  var h=Math.max(120,Math.min(800,Math.round(w*9/16)));
  fr.style.height=h+'px';fr.height=h;
  if(!p.widgetSizes)p.widgetSizes={};
  p.widgetSizes[wid]={w:Math.round(w),h:h};
  if(CFG.MODE==='supabase')saveToSupabase();
  try{updateWidgetCanvasHeight();}catch(e){}
  toast('Extensió ajustada');
}
var _wResize=null;
function startWidgetResize(e,wid,corner){
  var fr=document.getElementById('wframe-'+wid);
  var card=document.getElementById('wcard-'+wid);
  if(!fr||!card)return;
  if(e.cancelable)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
  var pt=e.touches?e.touches[0]:e;
  _wResize={wid:wid,fr:fr,card:card,corner:corner||'br',startX:pt.clientX,startY:pt.clientY,startW:card.offsetWidth,startH:fr.offsetHeight,startTop:card.offsetTop};
  document.querySelectorAll('.widget-card iframe').forEach(function(f){f.style.pointerEvents='none';});
  document.body.style.userSelect='none';
  document.addEventListener('mousemove',onWidgetResizeMove);
  document.addEventListener('mouseup',endWidgetResize);
  document.addEventListener('touchmove',onWidgetResizeMove,{passive:false});
  document.addEventListener('touchend',endWidgetResize);
}
function onWidgetResizeMove(e){
  if(!_wResize)return;
  if(e.cancelable)e.preventDefault();
  var pt=e.touches?e.touches[0]:e;
  var dx=pt.clientX-_wResize.startX, dy=pt.clientY-_wResize.startY;
  var w=Math.max(240,Math.min(1200,_wResize.startW+dx));
  var h;
  if(_wResize.corner==='tr'){
    // Cantonada superior dreta: amplada creix cap a la dreta, alçada creix cap amunt (part de baix fixa)
    h=Math.max(80,Math.min(800,_wResize.startH-dy));
    var newTop=_wResize.startTop+(_wResize.startH-h);
    if(newTop<0){h=_wResize.startH+_wResize.startTop;newTop=0;}
    _wResize.card.style.top=newTop+'px';
  }else{
    h=Math.max(80,Math.min(800,_wResize.startH+dy));
  }
  _wResize.card.style.width=w+'px';
  _wResize.fr.style.height=h+'px';_wResize.fr.height=h;
}
function endWidgetResize(){
  if(!_wResize)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(p){
    if(!p.widgetSizes)p.widgetSizes={};p.widgetSizes[_wResize.wid]={w:Math.round(_wResize.card.offsetWidth),h:Math.round(_wResize.fr.offsetHeight)};
    if(_wResize.corner==='tr'){if(!p.widgetPos)p.widgetPos={};p.widgetPos[_wResize.wid]={x:Math.round(_wResize.card.offsetLeft),y:Math.round(_wResize.card.offsetTop)};}
    if(CFG.MODE==='supabase')saveToSupabase();
  }
  document.querySelectorAll('.widget-card iframe').forEach(function(f){f.style.pointerEvents='';});
  document.body.style.userSelect='';
  document.removeEventListener('mousemove',onWidgetResizeMove);
  document.removeEventListener('mouseup',endWidgetResize);
  document.removeEventListener('touchmove',onWidgetResizeMove);
  document.removeEventListener('touchend',endWidgetResize);
  updateWidgetCanvasHeight();
  _wResize=null;
}
function openWidgetPicker(){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p)return;
  if(!p.widgets)p.widgets=[];
  var list=document.getElementById('widget-picker-list');
  if(!widgetCatalog.length){
    list.innerHTML='<div style="font-size:13px;color:var(--muted);padding:1rem;text-align:center;">Encara no hi ha widgets disponibles. Demana a l\'admin que en creï.</div>';
  }else{
    var typeLabels={spotify:'🎵 Spotify',youtube:'▶️ YouTube',twitch:'🎮 Twitch',calendar:'📅 Calendari',other:'🌐 Altre'};
    list.innerHTML=widgetCatalog.map(function(w){
      var on=p.widgets.indexOf(w.id)>=0;
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px;border:0.5px solid var(--border);border-radius:var(--radius);margin-bottom:8px;">'
        +'<span style="font-size:22px;flex-shrink:0;">'+(w.icon||'🧩')+'</span>'
        +'<div style="flex:1;min-width:0;">'
        +'<div style="font-size:13px;font-weight:500;">'+w.name+'</div>'
        +'<div style="font-size:11px;color:var(--muted);">'+(typeLabels[w.type]||w.type)+'</div>'
        +'</div>'
        +'<button class="btn btn-sm '+(on?'btn-p':'')+'" onclick="toggleUserWidget(\''+w.id+'\')">'+(on?'✓ Activat':'+ Activar')+'</button>'
        +'</div>';
    }).join('');
  }
  document.getElementById('widget-picker-modal').style.display='flex';
}
function toggleUserWidget(wid){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p)return;
  if(!p.widgets)p.widgets=[];
  var i=p.widgets.indexOf(wid);
  if(i>=0)p.widgets.splice(i,1);
  else p.widgets.push(wid);
  if(CFG.MODE==='supabase')saveToSupabase();
  openWidgetPicker();
  renderUserWidgets();
}
function closeWidgetPicker(){
  var m=document.getElementById('widget-picker-modal');if(m)m.style.display='none';
}
function renderWidgetAdmin(){
  var list=document.getElementById('wg-list');
  var cnt=document.getElementById('wg-count');if(cnt)cnt.textContent=widgetCatalog.length;
  if(!list)return;
  if(!widgetCatalog.length){list.innerHTML='<div style="font-size:13px;color:var(--muted);padding:1rem;">Encara no hi ha widgets. Crea\'n un a dalt.</div>';return;}
  var typeLabels={spotify:'🎵 Spotify',youtube:'▶️ YouTube',twitch:'🎮 Twitch',calendar:'📅 Calendari',other:'🌐 Altre'};
  list.innerHTML=widgetCatalog.map(function(w){
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px;border:0.5px solid var(--border);border-radius:var(--radius);margin-bottom:6px;">'
      +'<span style="font-size:22px;flex-shrink:0;">'+(w.icon||'🧩')+'</span>'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:13px;font-weight:500;">'+w.name+'</div>'
      +'<div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(typeLabels[w.type]||w.type)+' · '+w.embedUrl+'</div>'
      +'</div>'
      +'<button class="btn btn-sm" onclick="editWidget(\''+w.id+'\')">✏️</button>'
      +'<button class="btn btn-sm" style="color:var(--coral);border-color:var(--coral-border);" onclick="deleteWidget(\''+w.id+'\')">✕</button>'
      +'</div>';
  }).join('');
}
/* Convierte URLs normales de Spotify/YouTube a su formato embed */
function toEmbedUrl(url){
  try{
    if(/open\.spotify\.com\//.test(url)&&!/open\.spotify\.com\/embed\//.test(url)){
      url=url.replace(/open\.spotify\.com\/(intl-[a-z]+\/)?/,'open.spotify.com/embed/');
    }
    if(/open\.spotify\.com\/embed\//.test(url))url=url.replace(/\?.*$/,'');
    var ytw=url.match(/youtube\.com\/watch[^ ]*[?&]v=([A-Za-z0-9_-]{6,})/);
    if(ytw)url='https://www.youtube.com/embed/'+ytw[1];
    var ytb=url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    if(ytb)url='https://www.youtube.com/embed/'+ytb[1];
  }catch(e){}
  return url;
}
var wgEditId=null;
function editWidget(id){
  var w=widgetCatalog.find(function(x){return x.id===id;});
  if(!w)return;
  wgEditId=id;
  document.getElementById('wg-name').value=w.name||'';
  document.getElementById('wg-icon').value=(w.icon&&w.icon!=='🧩')?w.icon:'';
  document.getElementById('wg-type').value=w.type||'other';
  document.getElementById('wg-url').value=w.embedUrl||'';
  var btn=document.getElementById('wg-submit');if(btn)btn.textContent='💾 Desar canvis';
  var cancel=document.getElementById('wg-cancel');if(cancel)cancel.style.display='';
  var form=document.getElementById('wg-name');if(form&&form.scrollIntoView)form.scrollIntoView({behavior:'smooth',block:'center'});
}
function cancelWidgetEdit(){
  wgEditId=null;
  ['wg-name','wg-icon','wg-url'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var btn=document.getElementById('wg-submit');if(btn)btn.textContent='+ Crear widget';
  var cancel=document.getElementById('wg-cancel');if(cancel)cancel.style.display='none';
}
async function createWidget(){
  var name=document.getElementById('wg-name').value.trim();
  var url=toEmbedUrl(document.getElementById('wg-url').value.trim());
  if(!name){toast('Posa un nom');return;}
  if(!url){alert('Cal la URL d\'inserció (embed).');return;}
  // Validación básica: debe ser https
  if(url.indexOf('https://')!==0){alert('La URL ha de començar per https://');return;}
  var icon=document.getElementById('wg-icon').value.trim()||'🧩';
  var type=document.getElementById('wg-type').value;
  if(wgEditId){
    var ex=widgetCatalog.find(function(x){return x.id===wgEditId;});
    if(ex){ex.name=name;ex.icon=icon;ex.type=type;ex.embedUrl=url;}
    persistWidgets();
    cancelWidgetEdit();
    renderWidgetAdmin();
    try{renderUserWidgets();}catch(e){}
    toast('Widget actualitzat');
    return;
  }
  widgetCatalog.push({id:'wg'+Date.now(),name:name,icon:icon,type:type,embedUrl:url});
  persistWidgets();
  ['wg-name','wg-icon','wg-url'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  renderWidgetAdmin();
}
function deleteWidget(id){
  if(!confirm('Eliminar aquest widget del catàleg? Es traurà del tauler de tots els usuaris.'))return;
  widgetCatalog=widgetCatalog.filter(function(w){return w.id!==id;});
  // quitarlo de los usuarios que lo tuvieran
  players.forEach(function(p){if(p.widgets)p.widgets=p.widgets.filter(function(wid){return wid!==id;});});
  persistWidgets();
  renderWidgetAdmin();
}
function persistWidgets(){
  try{localStorage.setItem('cg_widgets',JSON.stringify(widgetCatalog));}catch(e){}
  if(CFG.MODE==='supabase')saveToSupabase();
}
function showPage(name,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  // L'inici usa un contenidor més ample (més zona lateral per als widgets)
  document.body.classList.toggle('on-inicio',name==='inicio');
  if(name==='heroe')renderHeroProfile(curHero);
  if(name==='gacha'){renderGachaGold();renderMyGallery();renderGalleryTabs();}
  if(name==='tienda')renderShop();
  if(name==='mercat'){onListingModeChange();renderMarket();}
  if(name==='encants')showSubTab('page-encants','page-gacha',document.getElementById('enc-tab-gacha'));
  if(name==='rendiment')showSubTab('page-rendiment','page-ranking',document.getElementById('rend-tab-ranking'));
  if(name==='inventario')renderInventario();
  if(name==='misiones')populateArcSelect();
  if(name==='calendario'){if(!calState.selectedDate)calState.selectedDate=new Date().toISOString().slice(0,10);renderCalendar();}
  if(name==='inicio'){try{renderInicio();}catch(e){}}
  if(name==='panoramica'){try{renderPanoramica();}catch(e){console.error('panoramica',e);}}
  if(name==='estadistiques'){try{renderStats();}catch(e){}}
  if(name==='planner'){renderPlannerImported();}
  if(name==='items-admin'){renderAdminItemsPage();renderAdminCartasPage();}
  if(name==='classes-admin'){renderClassesAdmin();}
  if(name==='widgets-admin'){renderWidgetAdmin();}
}
// Sub-pestanyes dins d'un apartat unificat (Encants, Rànquing+Analítiques)
function showSubTab(wrapId,panelId,btn){
  var wrap=document.getElementById(wrapId);if(!wrap)return;
  wrap.querySelectorAll('.subpanel').forEach(function(pp){pp.classList.remove('active');});
  var el=document.getElementById(panelId);if(el)el.classList.add('active');
  wrap.querySelectorAll('.htab').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  if(panelId==='page-gacha'){renderGachaGold();renderMyGallery();renderGalleryTabs();}
  else if(panelId==='page-tienda')renderShop();
  else if(panelId==='page-mercat'){onListingModeChange();renderMarket();}
  else if(panelId==='page-ranking')renderRanking();
  else if(panelId==='page-estadistiques'){try{renderStats();}catch(e){}}
}

/* ── misiones stats ── */
function renderMStats(){
  const act=missions.filter(m=>m.status!=='done'&&!m.isDaily_instance&&!_isWeekly(m)).length;
  const don=missions.filter(m=>m.status==='done').length;
  const tlvl=players.reduce((s,p)=>s+(p.level||1),0);
  const tg=players.reduce((s,p)=>s+p.gold,0);
  document.getElementById('mstats').innerHTML=`
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">Pendents</div><div style="font-size:22px;font-weight:700;">${act}</div></div>
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">Completades</div><div style="font-size:22px;font-weight:700;">${don}</div></div>
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">Nivell de l'equip</div><div style="font-size:22px;font-weight:700;">${tlvl.toLocaleString()}</div></div>
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;"><span class="coin"></span> Or de l'equip</div><div style="font-size:22px;font-weight:700;">${tg.toLocaleString()}</div></div>`;
}

/* ── misiones ── */
var missionFilter={q:'',arc:'',prio:'',assignee:'',tag:''};
function setMissionSearch(v){missionFilter.q=(v||'').toLowerCase();renderMissions();}
function setMissionArc(v){missionFilter.arc=v||'';renderMissions();}
function setMissionPrio(v){missionFilter.prio=v||'';renderMissions();}
function setMissionAssignee(v){missionFilter.assignee=v||'';renderMissions();}
function setMissionTag(v){missionFilter.tag=v||'';renderMissions();}
function _missionTags(m){
  if(!m.plannerTags||m.plannerTags.indexOf('weekly:')===0)return [];
  return m.plannerTags.split(';').map(function(t){return t.trim();}).filter(Boolean);
}
function _passMissionFilter(m){
  if(missionFilter.q&&(m.name||'').toLowerCase().indexOf(missionFilter.q)<0)return false;
  if(missionFilter.arc&&m.arc!==missionFilter.arc)return false;
  if(missionFilter.prio&&(m.diff||'C')!==missionFilter.prio)return false;
  if(missionFilter.assignee&&getAssigneeIds(m).indexOf(missionFilter.assignee)<0)return false;
  if(missionFilter.tag&&_missionTags(m).indexOf(missionFilter.tag)<0)return false;
  return true;
}
function clearMissionFilters(){
  missionFilter={q:'',arc:'',prio:'',assignee:'',tag:''};
  var s=document.getElementById('m-search');if(s)s.value='';
  renderMissions();
}
/* ── accions massives (admin) ── */
var selMissions={};
var _lastMissionAnchor=null;
function toggleMissionSel(id,on){if(on)selMissions[id]=true;else delete selMissions[id];renderBulkBar();}
// Clic a un checkbox de missió. Amb Shift, selecciona/deselecciona tot el rang des de l'últim clicat.
function missionCheckClick(ev,el){
  var id=el.getAttribute('data-mid');
  var boxes=Array.prototype.slice.call(document.querySelectorAll('.mcrd-sel'));
  var idx=boxes.indexOf(el);
  var target=el.checked; // estat nou del checkbox clicat (s'aplica a tot el rang)
  if(ev.shiftKey&&_lastMissionAnchor){
    var aIdx=-1;
    for(var j=0;j<boxes.length;j++){if(boxes[j].getAttribute('data-mid')===_lastMissionAnchor){aIdx=j;break;}}
    if(aIdx>=0&&idx>=0){
      var lo=Math.min(aIdx,idx),hi=Math.max(aIdx,idx);
      for(var i=lo;i<=hi;i++){
        var mid=boxes[i].getAttribute('data-mid');
        boxes[i].checked=target;
        if(target)selMissions[mid]=true;else delete selMissions[mid];
      }
    }
  }else{
    if(target)selMissions[id]=true;else delete selMissions[id];
  }
  _lastMissionAnchor=id;
  renderBulkBar();
}
function clearMissionSel(){selMissions={};_lastMissionAnchor=null;renderMissions();}
// Marca totes les missions visibles (les que tenen checkbox al DOM ara mateix)
function selectAllVisibleMissions(){
  var boxes=document.querySelectorAll('.mcrd-sel');
  boxes.forEach(function(b){var mid=b.getAttribute('data-mid');b.checked=true;selMissions[mid]=true;});
  if(boxes.length)_lastMissionAnchor=boxes[boxes.length-1].getAttribute('data-mid');
  renderBulkBar();
}
function _selIds(){return Object.keys(selMissions).filter(function(id){return missions.find(function(m){return m.id===id;});});}
function renderBulkBar(){
  var bar=document.getElementById('m-bulkbar');if(!bar)return;
  var ids=_selIds();
  if(!session.isAdmin||!ids.length){bar.style.display='none';bar.innerHTML='';return;}
  bar.style.display='flex';
  bar.innerHTML='<span style="font-weight:600;">'+ids.length+' seleccionades</span>'
    +'<button class="btn btn-sm" onclick="selectAllVisibleMissions()" title="Marcar totes les visibles">☑️ Totes</button>'
    +'<button class="btn btn-sm btn-p" onclick="bulkComplete()">✓ Completar</button>'
    +'<select class="filter-chip" style="padding:6px 10px;" onchange="bulkAssign(this.value);this.value=\'\';"><option value="">Reassignar a…</option>'+players.map(function(p){return '<option value="'+p.id+'">'+p.emblem+' '+p.name.split(' ')[0]+'</option>';}).join('')+'<option value="__none__">Sense assignar</option></select>'
    +'<button class="btn btn-sm" style="color:var(--coral);border-color:var(--coral-border);" onclick="bulkDelete()">🗑️ Esborrar</button>'
    +'<button class="btn btn-sm" onclick="clearMissionSel()">Cancel·lar</button>';
}
function bulkComplete(){
  var ids=_selIds();if(!ids.length)return;
  ids.forEach(function(id){var m=missions.find(function(x){return x.id===id;});if(m&&m.status!=='done')completeMission(id);});
  selMissions={};renderMissions();
}
function bulkDelete(){
  var ids=_selIds();if(!ids.length)return;
  if(!confirm('Esborrar '+ids.length+' missions seleccionades?'))return;
  ids.forEach(function(id){missions=missions.filter(function(m){return m.id!==id;});delete missionAssignees[id];if(CFG.MODE==='supabase')deleteMissionFromSupabase(id);});
  selMissions={};
  if(CFG.MODE==='supabase')saveToSupabase();
  renderMissions();renderAll();
}
function bulkAssign(pid){
  var ids=_selIds();if(!ids.length||!pid)return;
  var newIds=(pid==='__none__')?[]:[pid];
  ids.forEach(function(id){var m=missions.find(function(x){return x.id===id;});if(m){m.playerId=newIds[0]||'';if(newIds.length>1)missionAssignees[id]=newIds.slice();else delete missionAssignees[id];}});
  if(CFG.MODE==='supabase')saveToSupabase(newIds);
  selMissions={};renderMissions();renderAll();
}
function clearCompletedMissions(){
  if(!session.isAdmin)return;
  var done=missions.filter(function(m){return m.status==='done'&&!m.isDaily_instance&&!_isWeekly(m);});
  if(!done.length){alert('No hi ha missions completades per netejar.');return;}
  if(!confirm('Esborrar '+done.length+' missions completades? Aquesta acció no es pot desfer.'))return;
  var ids=done.map(function(m){return m.id;});
  missions=missions.filter(function(m){return ids.indexOf(m.id)<0;});
  ids.forEach(function(id){delete missionAssignees[id];if(CFG.MODE==='supabase')deleteMissionFromSupabase(id);});
  if(CFG.MODE==='supabase')saveToSupabase();
  renderMissions();renderAll();
}
function _fillMissionArcFilter(){
  var sel=document.getElementById('m-arc-filter');
  if(sel){
    var uniq=[];missions.forEach(function(m){if(m.arc&&uniq.indexOf(m.arc)<0)uniq.push(m.arc);});
    sel.innerHTML='<option value="">Tots els arcs</option>'+uniq.map(function(a){return '<option value="'+a+'"'+(a===missionFilter.arc?' selected':'')+'>'+a+'</option>';}).join('');
  }
  var ps=document.getElementById('m-prio-filter');
  if(ps){
    var PR=[['','Tota prioritat'],['A','Urgent'],['B','Important'],['C','Mitjana'],['D','Baixa']];
    ps.innerHTML=PR.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===missionFilter.prio?' selected':'')+'>'+o[1]+'</option>';}).join('');
  }
  var asg=document.getElementById('m-assignee-filter');
  if(asg){
    asg.innerHTML='<option value="">Tothom</option>'+players.map(function(p){return '<option value="'+p.id+'"'+(p.id===missionFilter.assignee?' selected':'')+'>'+p.emblem+' '+p.name.split(' ')[0]+'</option>';}).join('');
  }
  var tg=document.getElementById('m-tag-filter');
  if(tg){
    var tags=[];missions.forEach(function(m){_missionTags(m).forEach(function(t){if(tags.indexOf(t)<0)tags.push(t);});});
    tg.innerHTML='<option value="">Totes les etiquetes</option>'+tags.map(function(t){return '<option value="'+t+'"'+(t===missionFilter.tag?' selected':'')+'>'+t+'</option>';}).join('');
    tg.style.display=tags.length?'':'none';
  }
}
function renderMissions(){
  _fillMissionArcFilter();
  const today=new Date().toISOString().slice(0,10);
  const daily   =missions.filter(m=>m.daily&&m.isDaily_instance&&m.status!=='done'&&(session.isAdmin||m.playerId===session.playerId)&&_passMissionFilter(m));
  const weekly  =missions.filter(m=>_isWeekly(m)&&(session.isAdmin||m.playerId===session.playerId)&&_passMissionFilter(m));
  // Només 2 estats: pendent (tot el que no està fet) o completada
  const pending =missions.filter(m=>!m.daily&&!_isWeekly(m)&&m.status!=='done'&&_passMissionFilter(m));
  const done    =missions.filter(m=>m.status==='done'&&!m.isDaily_instance&&!_isWeekly(m)&&_passMissionFilter(m));
  var mwk=document.getElementById('m-weekly');
  if(mwk)mwk.innerHTML=weekly.length?weekly.map(m=>mCard(m)).join(''):`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sense missions setmanals.</div>`;
  var mwt=document.getElementById('m-weekly-templates');
  if(mwt){
    var myTpls=weeklyTemplates.filter(t=>session.isAdmin||t.playerId===session.playerId);
    mwt.innerHTML=myTpls.length?('<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">'+myTpls.map(t=>'<span class="filter-chip" style="cursor:default;">🗓️ '+t.name+' <span style="color:var(--coral);cursor:pointer;font-weight:700;" onclick="deleteWeeklyTemplate(\''+t.id+'\')">✕</span></span>').join('')+'</div>'):'';
  }
  document.getElementById('m-daily').innerHTML  =daily.length  ?daily.map(m=>mCard(m)).join('')  :`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sense missions diàries.</div>`;
  document.getElementById('m-pending').innerHTML=pending.length?pending.map(m=>mCard(m)).join(''):`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sense missions pendents.</div>`;
  // Completades: mostra només les primeres N (5 + "ver más" de 10 en 10)
  var shown=done.slice(0,doneLimit);
  document.getElementById('m-done').innerHTML   =done.length   ?shown.map(m=>mCard(m)).join('')   :`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sense missions completades.</div>`;
  var moreBox=document.getElementById('m-done-more');
  if(moreBox){
    if(done.length>doneLimit){moreBox.innerHTML='<button class="btn btn-sm" onclick="showMoreDone()">Veure més ('+(done.length-doneLimit)+' restants)</button>';}
    else if(doneLimit>5&&done.length>5){moreBox.innerHTML='<button class="btn btn-sm" onclick="resetDone()">Veure\'n menys</button>';}
    else{moreBox.innerHTML='';}
  }
  var cd=document.getElementById('m-clear-done');
  if(cd)cd.style.display=(session.isAdmin&&done.length)?'':'none';
  renderBulkBar();
}
var doneLimit=5;
function showMoreDone(){doneLimit+=10;renderMissions();}
function resetDone(){doneLimit=5;renderMissions();}

function mCard(m){
  const assignees=getAssignees(m);
  const isMine=assignees.some(function(a){return a.id===session.playerId;});
  const assigneesLabel=assignees.length?assignees.map(function(a){return a.emblem+' '+a.name.split(' ')[0];}).join(', '):'Sense assignar';
  const canComplete=session.isAdmin||(isMine&&m.status!=='done');
  const canEdit=session.isAdmin||isMine;
  const dailyBadge=_isWeekly(m)?`<span class="daily-rib" style="background:var(--teal-bg,var(--accent-bg));color:var(--teal);">🗓️ Setmanal</span>`:(m.daily&&m.isDaily_instance?`<span class="daily-rib">Diària</span>`:(m.daily&&!m.isDaily_instance?`<span class="daily-rib" style="background:var(--accent-bg);color:var(--accent);">📌 Diària personal</span>`:''));
  const completedBtn=canComplete&&m.status!=='done'
    ?`<button class="btn-complete" onclick="event.stopPropagation();completeMission('${m.id}')">✓ Completar</button>`:'';
  const statusBadge=m.status==='done'?`<span class="badge b-teal">Completada</span>`:`<span class="badge b-gray">Pendent</span>`;
  const claimBtn=(m.status==='done'&&rewardsPending[m.id]&&(session.isAdmin||isMine))?`<button class="btn-complete" style="background:var(--gold-bg);color:var(--gold);border-color:var(--gold-border);font-weight:700;" onclick="event.stopPropagation();claimMissionReward('${m.id}')">🎁 Reclamar</button>`:'';
  var _prio={A:['Urgente','b-coral'],B:['Importante','b-gold'],C:['Media','b-gray'],D:['Baja','b-teal']}[m.diff]||['Media','b-gray'];
  const prioBadge=`<span class="badge ${_prio[1]}">${_prio[0]}</span>`;
  var _tags=(m.plannerTags&&m.plannerTags.indexOf('weekly:')!==0)?m.plannerTags:'';
  const tagsHtml=_tags?_tags.split(';').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="mtag">${_esc(t)}</span>`).join(''):'';
  const assignBtn=session.isAdmin?`<button class="btn-complete" onclick="event.stopPropagation();openMissionModal('${m.id}')" title="Assignar persones">👥</button>`:'';
  const selChk=session.isAdmin?`<input type="checkbox" class="mcrd-sel" data-mid="${m.id}" ${selMissions[m.id]?'checked':''} onclick="event.stopPropagation();missionCheckClick(event,this)" title="Seleccionar (Shift+clic per rang)" style="margin-right:8px;flex-shrink:0;">`:'';
  return `<div class="mcrd ${m.daily?'daily-mission':''}" onclick="openMissionModal('${m.id}')" style="cursor:pointer;">
    ${selChk}
    <div class="minfo">
      <div class="mname">${_esc(m.name)}${dailyBadge}</div>
      <div class="mmeta">${_esc(m.arc)} · ${assigneesLabel}</div>
      ${tagsHtml?`<div class="mtags">${tagsHtml}</div>`:''}
    </div>
    <div class="mrews">
      <span class="rchip"><span>${m.xp}</span> XP</span>
      <span class="rchip"><span><span class="coin"></span> ${fmtGold(m.gold)}</span></span>
      ${prioBadge}
      ${statusBadge}
      ${assignBtn}
      ${claimBtn}
      ${completedBtn}
      ${(session.isAdmin||m.createdBy===session.playerId)?`<button class="btn-complete" style="background:var(--coral-bg);color:var(--coral);border-color:var(--coral-border);" onclick="event.stopPropagation();deleteMission('${m.id}')">✕</button>`:''}
    </div>
  </div>`;
}

function updateArcCounts(){
  arcs.forEach(function(a){
    var arcMs=missions.filter(function(m){return m.arc===a.name&&!m.daily;});
    a.total=arcMs.length;
    a.done=arcMs.filter(function(m){return m.status==='done';}).length;
  });
}
function deleteArc(id){
  if(!confirm('Esborrar aquest arc?'))return;
  arcs=arcs.filter(function(a){return a.id!==id;});
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}
function deleteMission(id){
  var m=missions.find(function(x){return x.id===id;});if(!m)return;
  var _savedAssignees=missionAssignees[id];
  missions=missions.filter(function(x){return x.id!==id;});
  delete missionAssignees[id];
  if(CFG.MODE==='supabase'){deleteMissionFromSupabase(id);saveToSupabase();}
  renderAll();
  showUndo('Missió eliminada: '+(m.name||''),function(){
    if(_savedAssignees)missionAssignees[id]=_savedAssignees;
    missions.push(m);
    if(CFG.MODE==='supabase')saveToSupabase();
    renderAll();
  });
}

function getAssigneeIds(m){
  if(!m)return [];
  var ids=[];
  var extra=missionAssignees[m.id];
  if(Array.isArray(extra))ids=extra.slice();
  if(m.playerId&&ids.indexOf(m.playerId)<0)ids.unshift(m.playerId);
  return ids.filter(function(id){return players.find(function(p){return p.id===id;});});
}
function getAssignees(m){
  // retorna objectes jugador (no ids)
  return getAssigneeIds(m).map(function(id){return players.find(function(p){return p.id===id;});}).filter(Boolean);
}
function setMissionAssignees(missionId,ids){
  var m=missions.find(function(x){return x.id===missionId;});if(!m)return;
  ids=(ids||[]).filter(function(id){return id&&players.find(function(p){return p.id===id;});});
  m.playerId=ids[0]||'';
  if(ids.length>1)missionAssignees[missionId]=ids.slice();
  else delete missionAssignees[missionId];
  if(CFG.MODE==='supabase')saveToSupabase(ids);
  renderAll();
}
function toggleMissionAssignee(missionId,playerId){
  var m=missions.find(function(x){return x.id===missionId;});if(!m)return;
  var cur=getAssigneeIds(m);
  var i=cur.indexOf(playerId);
  if(i>=0)cur.splice(i,1);else cur.push(playerId);
  setMissionAssignees(missionId,cur);
}
function assignMission(missionId, playerId){
  // reassignació ràpida a UNA persona (substitueix)
  setMissionAssignees(missionId, playerId?[playerId]:[]);
}
function setMissionStatus(missionId,status){
  // Canvi d'estat manual (admin): NO reparteix recompenses, només corregeix l'estat
  if(!session.isAdmin)return;
  var m=missions.find(function(x){return x.id===missionId;});if(!m)return;
  m.status=(status==='done')?'done':'pending';
  if(CFG.MODE==='supabase')saveToSupabase(getAssigneeIds(m));
  renderAll();
  try{openMissionModal(missionId);}catch(e){}
}

// Modal per triar estrelles (1-5) en completar una missió amb durada. Crida cb(stars).
function askMissionStars(title,cb){
  var ov=document.getElementById('star-ask');
  if(!ov){ov=document.createElement('div');ov.id='star-ask';document.body.appendChild(ov);}
  ov.className='reward-pop show';ov.style.zIndex=500;
  var sb='';for(var i=1;i<=5;i++){sb+='<button type="button" data-s="'+i+'" class="star-btn" style="background:none;border:none;font-size:34px;line-height:1;cursor:pointer;filter:grayscale(1);opacity:.5;transition:all .12s;padding:2px;">⭐</button>';}
  ov.innerHTML='<div class="reward-box" onclick="event.stopPropagation()">'
    +'<div style="font-size:15px;font-weight:600;margin-bottom:6px;">Quantes estrelles?</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:14px;">'+_esc(title)+'</div>'
    +'<div id="star-row" style="display:flex;justify-content:center;gap:4px;" role="group" aria-label="Valoració amb estrelles">'+sb+'</div>'
    +'<div id="star-val" style="font-size:12px;color:var(--muted);height:18px;margin:8px 0 12px;"></div>'
    +'<button class="btn btn-sm" onclick="closeStarAsk()">Cancel·lar</button>'
    +'</div>';
  var btns=ov.querySelectorAll('.star-btn');
  function paint(n){btns.forEach(function(b){var s=+b.getAttribute('data-s');b.style.filter=s<=n?'none':'grayscale(1)';b.style.opacity=s<=n?'1':'.5';});}
  btns.forEach(function(b){
    var s=+b.getAttribute('data-s');
    b.setAttribute('aria-label','Valorar amb '+s+' estrelle'+(s>1?'s':''));
    b.onmouseenter=function(){paint(s);document.getElementById('star-val').textContent=s+'★ · '+(s*20)+'% de l\'or';};
    b.onclick=function(e){e.stopPropagation();closeStarAsk(true);cb(s);};
  });
  ov.onclick=function(){closeStarAsk();};
}
function closeStarAsk(picked){var ov=document.getElementById('star-ask');if(ov)ov.className='reward-pop';if(!picked)toast('Missió no completada (has cancel·lat la valoració).');}
function completeMission(id){
  const m=missions.find(m=>m.id===id);if(!m||m.status==='done')return;
  // Si té durada definida, pregunta quantes estrelles per calcular l'or (durada × estrelles).
  if(m.durationH>0&&!m.stars){
    askMissionStars(m.name,function(stars){
      m.stars=stars;
      m.gold=Math.round(m.durationH*(stars/5)*100)/100;
      _doCompleteMission(id);
    });
    return;
  }
  _doCompleteMission(id);
}
function _doCompleteMission(id){
  const m=missions.find(m=>m.id===id);if(!m||m.status==='done')return;
  var assignees=getAssignees(m);
  const p=players.find(p=>p.id===m.playerId);
  m.status='done';
  var mFrag=m.frag||fragForDiff(m.diff);
  // Recompensa a TOTES les persones assignades
  assignees.forEach(function(ap){
    ap.xp+=m.xp;var _g=awardGold(ap,m.gold);ap.fragments=(ap.fragments||0)+mFrag;ap.missions++;
    if(m.attrPts&&m.attr){var k=attrKeyFromName(m.attr);if(k)ap.attrs[k]=(ap.attrs[k]||0)+m.attrPts;}
    logActivity(ap.id,Object.assign({},m,{frag:mFrag}),_g);
    checkLevelUp(ap);
  });
  if(assignees.length){showRewardPopup(m,assignees[0],assignees);}
  // Bonus diarias
  if(m.daily&&p){
    const myDailies=missions.filter(mx=>mx.daily&&mx.isDaily_instance&&mx.playerId===p.id);
    if(myDailies.length>=1&&myDailies.length<=4&&myDailies.every(mx=>mx.status==='done')){
      const bx=myDailies.reduce((s,mx)=>s+mx.xp,0),bg=myDailies.reduce((s,mx)=>s+mx.gold,0);
      p.xp+=bx;awardGold(p,bg);
      setTimeout(()=>showRewardPopup({name:'Bonus diari!',xp:bx,gold:bg,attr:null},p),600);
    }
  }
  // Bonus arco
  if(m.arc&&p){
    const arcMs=missions.filter(mx=>mx.arc===m.arc&&mx.playerId===p.id);
    if(arcMs.length&&arcMs.every(mx=>mx.status==='done')){
      const arc=arcs.find(a=>a.name===m.arc);
      const bonusKey='bonusPaid_'+p.id;
      if(arc&&!arc[bonusKey]){
        arc[bonusKey]=true;
        arc.status='done';
        const bx=arcMs.reduce((s,mx)=>s+mx.xp,0),bg=arcMs.reduce((s,mx)=>s+mx.gold,0);
        p.xp+=bx;awardGold(p,bg);
        setTimeout(()=>showRewardPopup({name:'Arc completat: '+m.arc+'!',xp:bx,gold:bg,attr:null},p),1200);
      }
    }
  }
  updateArcCounts();
  cleanOldCompleted();
  if(CFG.MODE==='supabase')saveToSupabase(assignees.map(function(a){return a.id;}));
  renderAll();
}
// Aplica la recompensa d'una missió a un jugador concret (sense popup). Reutilitzat per l'import del Planner.
function awardMissionTo(p,m){
  if(!p||!m)return;
  var mFrag=m.frag||fragForDiff(m.diff);
  p.xp=(p.xp||0)+(m.xp||0);
  var _g=awardGold(p,m.gold);
  p.fragments=(p.fragments||0)+mFrag;
  p.missions=(p.missions||0)+1;
  if(m.attrPts&&m.attr){var k=attrKeyFromName(m.attr);if(k)p.attrs[k]=(p.attrs[k]||0)+m.attrPts;}
  logActivity(p.id,Object.assign({},m,{frag:mFrag}),_g);
  checkLevelUp(p);
}
function claimMissionReward(id){
  var m=missions.find(function(x){return x.id===id;});if(!m||!rewardsPending[id])return;
  var assignees=getAssignees(m);
  if(!assignees.length){alert('Aquesta missió no té ningú assignat. Assigna-la abans de reclamar la recompensa.');return;}
  var mFrag=m.frag||fragForDiff(m.diff);
  assignees.forEach(function(ap){
    ap.xp+=m.xp;var _g=awardGold(ap,m.gold);ap.fragments=(ap.fragments||0)+mFrag;ap.missions++;
    if(m.attrPts&&m.attr){var k=attrKeyFromName(m.attr);if(k)ap.attrs[k]=(ap.attrs[k]||0)+m.attrPts;}
    logActivity(ap.id,Object.assign({},m,{frag:mFrag}),_g);
    checkLevelUp(ap);
  });
  delete rewardsPending[id];
  showRewardPopup(m,assignees[0],assignees);
  if(CFG.MODE==='supabase')saveToSupabase(assignees.map(function(a){return a.id;}));
  renderAll();
}

/* ── level up (automàtic segons classe) ── */
function defaultGrowth(cls){
  var g={};attrKeys().forEach(function(k){g[k]=0;});
  var base=(cls&&cls.attrs)?cls.attrs:{};
  var sorted=attrKeys().slice().sort(function(a,b){return (base[b]||0)-(base[a]||0);});
  if(sorted[0])g[sorted[0]]=2;
  if(sorted[1])g[sorted[1]]=1;
  return g;
}
function classGrowthFor(p){
  if(classGrowthMap[p.cls])return classGrowthMap[p.cls];
  var cls=CLASSES.find(function(c){return c.name===p.cls;});
  return defaultGrowth(cls);
}
// Recompensa FIXA de missions (la prioritat és només una etiqueta/grau, no afecta l'XP)
var MISSION_XP=10;      // totes les missions donen 10 XP
var MISSION_GOLD=10;    // or fix per a missions creades a mà
var MISSION_FRAG=20;    // fragments fixos per missió
var GOLD_MONTH_CAP=100;
function curMonthKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
function goldEarnedThisMonth(p){if(!p)return 0;return (p.goldMonthKey===curMonthKey())?(p.goldMonth||0):0;}
// Dona oro respectant el límit mensual (màxim 100/mes). Retorna el que realment ha rebut.
function awardGold(p,amount){
  if(!p||!amount||amount<=0)return 0;
  var mk=curMonthKey();
  if(p.goldMonthKey!==mk){p.goldMonthKey=mk;p.goldMonth=0;}
  var give=Math.min(amount,Math.max(0,GOLD_MONTH_CAP-(p.goldMonth||0)));
  p.gold=(p.gold||0)+give;p.goldMonth=(p.goldMonth||0)+give;
  return give;
}
var MAX_LEVEL=100, XP_PER_LEVEL=100;
// Nivell derivat automàticament de l'XP (100 XP per nivell, màxim 100)
function levelFromXp(xp){return Math.min(MAX_LEVEL, Math.floor((xp||0)/XP_PER_LEVEL)+1);}
// XP que falta per pujar de nivell (0 si ja ets nivell màxim)
function xpToNext(xp){var lv=levelFromXp(xp);return lv>=MAX_LEVEL?0:(lv*XP_PER_LEVEL-(xp||0));}
function checkLevelUp(p){
  if(!p)return;
  const newLv=levelFromXp(p.xp);
  if(newLv>p.level){
    var levels=newLv-p.level;
    var g=classGrowthFor(p);
    var applied={};
    for(var i=0;i<levels;i++){
      attrKeys().forEach(function(k){var add=g[k]||0;if(add){p.attrs[k]=(p.attrs[k]||0)+add;applied[k]=(applied[k]||0)+add;}});
    }
    p.xpNext=Math.min(MAX_LEVEL,newLv+1)*XP_PER_LEVEL;
    p.level=newLv;
    showLevelUpPopup(p,applied,levels);
  }
}
function showLevelUpPopup(p,applied,levels){
  applied=applied||{};levels=levels||1;
  document.getElementById('lu-level').textContent='Nivell '+p.level+(levels>1?' (+'+levels+' nivells)':'');
  var pts=document.getElementById('lu-pts');if(pts)pts.textContent=p.cls;
  document.getElementById('lu-attrs').innerHTML=attrKeys().map(function(k){var name=attrName(k);var add=applied[k]||0;return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--bg3);border-radius:var(--radius);padding:8px 4px;'+(add?'outline:2px solid var(--gold);':'')+'">'    +'<div style="font-size:16px;">'+attrIcon(k)+'</div>'    +'<div style="font-size:9px;color:var(--muted);">'+name+'</div>'    +'<div style="font-size:14px;font-weight:600;">'+p.attrs[k]+(add?' <span style="color:var(--gold);font-size:11px;">+'+add+'</span>':'')+'</div>'    +'</div>';}).join('');
  document.getElementById('levelup-pop').classList.add('show');
}
function confirmLevelUp(){
  document.getElementById('levelup-pop').classList.remove('show');
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}

/* ── reward popup ── */
function showRewardPopup(m,p,assignees){
  var multi=Array.isArray(assignees)&&assignees.length>1;
  document.getElementById('rp-emoji').textContent=multi?assignees.map(function(a){return a.emblem;}).join(' '):p.emblem;
  document.getElementById('rp-title').textContent='Missió completada!';
  document.getElementById('rp-mission').textContent=m.name+(multi?' · recompensa per a '+assignees.map(function(a){return a.name.split(' ')[0];}).join(', '):'');
  var mFrag=m.frag||fragForDiff(m.diff);
  document.getElementById('rp-chips').innerHTML=`
    <span class="badge b-purple">+${m.xp} XP</span>
    <span class="badge b-gold"><span class="coin"></span> +${fmtGold(m.gold)}</span>
    ${mFrag?`<span class="badge b-purple" style="background:var(--accent-bg);">+${mFrag} ✨</span>`:''}
    ${m.attr?`<span class="badge b-teal">+${m.attrPts} ${m.attr}</span>`:''}`;
  document.getElementById('reward-pop').classList.add('show');
}
function closeReward(){document.getElementById('reward-pop').classList.remove('show');}

/* ── héroes ── */
function renderHeroTabs(){
  let tabs=players.map((p,i)=>{
    var act=(i===curHero&&curHero!=='admin');
    var _c=(/^#[0-9a-fA-F]{3,8}$/.test(p.color||''))?p.color:'var(--accent)';
    return `<div class="htab ${act?'active':''}" onclick="selectHero(${i})" style="${act?('--accent:'+_c+';border-color:'+_c+';color:'+_c+';'):''}"><span class="hdot" style="background:${_c};"></span>${_esc(p.emblem)} ${_esc(p.name.split(' ')[0])}</div>`;
  }).join('');
  if(session.isAdmin){
    tabs+=`<div class="htab ${'admin'===curHero?'active':''}" onclick="selectHero('admin')" style="border-color:rgba(228,164,40,.3);"><span class="hdot" style="background:#e4a428;"></span>👑 Déu</div>`;
  }
  document.getElementById('htabs').innerHTML=tabs;
}
function selectHero(i){curHero=i;renderHeroTabs();renderHeroProfile(i==='admin'?'admin':i);}
function goToInventory(){
  var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';
  showPage('inventario',document.getElementById('nav-inventario'));
}
function goToMyProfile(){
  var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';
  var navBtn=document.getElementById('nav-heroe');
  if(session.isAdmin){
    curHero='admin';
    showPage('heroe',navBtn);
    renderHeroProfile('admin');
    return;
  }
  const idx=players.findIndex(p=>p.id===session.playerId);
  if(idx>=0){
    curHero=idx;
    showPage('heroe',navBtn);
    renderHeroProfile(idx);
  }
}

function getAdminProfile(){
  const allCards=gachaCards.map(c=>({cardId:c.id,obtainedAt:'2000-01-01'}));
  return {
    id:'admin_special',realName:'',name:'Déu',cls:'—',role:'Omniscient',
    emblem:'👑',color:'#e4a428',colorBg:'rgba(228,164,40,0.15)',
    level:99,xp:999999,xpNext:100,gold:Infinity,missions:999,
    weapon:'La Paraula',armor:'Armadura Divina',accessory:'Corona Eterna',
    lore:'Existia abans que es creés el primer personatge. El seu poder no té límits ni necessita demostració.',
    quote:'Jo soc el principi i la fi d\'aquest repo.',
    pin:'',attrs:{fue:20,int:20,agi:20,car:20,sab:20},
    gachaTokens:Infinity,fragments:Infinity,gallery:allCards,lastDaily:''
  };
}

/* ══ MARCS DE PERFIL (desbloqueig per nivell) ══ */
const FRAME_TIERS=[
  {key:'none',label:'Sense marc',min:0,color:''},
  {key:'bronze',label:'Bronze',min:1,color:'#cd7f32'},
  {key:'silver',label:'Plata',min:5,color:'#9fb2c9'},
  {key:'gold',label:'Or',min:10,color:'#e4a428'},
  {key:'ruby',label:'Robí',min:15,color:'#d64550'},
  {key:'legend',label:'Llegendari',min:20,color:'#b06be0'},
  {key:'emerald',label:'Maragda',min:25,color:'#2ecc8f'},
  {key:'diamond',label:'Diamant',min:30,color:'#4fd1e0'},
  {key:'mythic',label:'Mític',min:50,color:'#ff5fa2'}
];
function playerFrame(p){
  if(!p)return FRAME_TIERS[0];
  var lvl=p.level||1;
  var unlocked=FRAME_TIERS.filter(function(f){return lvl>=f.min;});
  var sel=FRAME_TIERS.find(function(f){return f.key===p.avatarFrame;});
  if(sel&&lvl>=sel.min)return sel;
  return unlocked[unlocked.length-1]||FRAME_TIERS[0];
}
// Posición del jugador en el ranking (1/2/3) si está en el top 3 con puntos; si no, 0.
function playerRankBanner(p){
  if(!p||!p.id)return 0;
  var score=function(x){return (x.xp||0)+(x.gold||0);};
  if(score(p)<=0)return 0;
  var sorted=players.filter(function(x){return x.id!=='admin_special';}).slice().sort(function(a,b){return score(b)-score(a);});
  var idx=sorted.findIndex(function(x){return x.id===p.id;});
  return (idx>=0&&idx<3)?idx+1:0;
}
function frameWrap(p,inner){
  // Banner exclusiu del top 3. Per defecte s'activa sol (avatarFrame buit),
  // però el jugador el pot treure triant un altre marc (avatarFrame='none' o un tier).
  var rank=playerRankBanner(p);
  var choice=(p&&p.avatarFrame)?p.avatarFrame:'rank';
  if(rank&&choice==='rank'){
    var tag=rank===1?'1r':rank===2?'2n':'3r';
    var crown=rank===1?'👑':rank===2?'🥈':'🥉';
    return '<div class="ava-rank ava-rank-'+rank+'">'
      +'<span class="ava-rank-crown">'+crown+'</span>'
      +'<div class="ava-rank-inner">'+inner+'</div>'
      +'<span class="ava-rank-tag">'+tag+'</span>'
      +'</div>';
  }
  var f=playerFrame(p);
  if(!f||!f.color)return inner;
  return '<div class="ava-frame" style="--frame:'+f.color+';">'+inner+'</div>';
}
function setPlayerFrame(key){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p)return;
  p.avatarFrame=key;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderFramePicker();
  ['inv-ava-preview','inline-avatar-preview'].forEach(function(id){var pv=document.getElementById(id);if(pv)pv.innerHTML=frameWrap(p,renderAvatar(p,'pixel-avatar-lg'));});
  updateSidebarAvatar();
}
function renderFramePicker(){
  var hosts=document.querySelectorAll('.frame-picker-host');
  if(!hosts.length)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var html='';
  if(p){
    var rank=playerRankBanner(p);
    var choice=(p.avatarFrame)?p.avatarFrame:'rank';
    var activeKey=(choice==='rank'&&rank)?'rank':playerFrame(p).key;
    var rankNote=rank?'<div style="font-size:12px;color:var(--gold);background:var(--gold-bg);border:0.5px solid var(--gold-border);border-radius:var(--radius);padding:6px 10px;margin-top:12px;">🏆 Estàs al <strong>Top '+rank+'</strong>! Pots activar el banner exclusiu o triar un altre marc quan vulguis.</div>':'';
    // Opció del banner exclusiu (només si estàs al top del rànquing)
    var rankOpt=rank?('<button class="frame-opt'+(activeKey==='rank'?' active':'')+'" onclick="setPlayerFrame(\'rank\')" title="Banner exclusiu del Top '+rank+'">'
      +'<span class="frame-swatch" style="border-color:var(--gold);box-shadow:0 0 6px var(--gold);">🏆</span>'
      +'<span style="font-size:11px;margin-top:4px;">Top '+rank+'</span></button>'):'';
    html='<div class="stitle" style="margin-top:16px;">Banner del perfil</div>'+rankNote
      +'<div class="frame-grid">'+rankOpt+FRAME_TIERS.map(function(f){
        var unlocked=(p.level||1)>=f.min;
        var sw='<span class="frame-swatch"'+(f.color?' style="border-color:'+f.color+';box-shadow:0 0 6px '+f.color+';"':'')+'>'+(f.color?'':'∅')+'</span>';
        return '<button class="frame-opt'+(activeKey===f.key?' active':'')+'"'+(unlocked?' onclick="setPlayerFrame(\''+f.key+'\')"':' disabled')+'>'
          +sw+'<span style="font-size:11px;margin-top:4px;">'+f.label+'</span>'
          +(unlocked?'':'<span style="font-size:10px;color:var(--muted);">🔒 Nv.'+f.min+'</span>')
          +'</button>';
      }).join('')+'</div>';
  }
  [].forEach.call(hosts,function(h){h.innerHTML=html;});
}
function renderHeroProfile(i){
  const p=(session.isAdmin&&i==='admin')?getAdminProfile():players[i];if(!p)return;
  // Nivell i XP automàtics: 100 XP/nivell, màxim 100
  const lvl=levelFromXp(p.xp);
  const atMax=lvl>=MAX_LEVEL;
  const inLvl=Math.max(0,Math.min(XP_PER_LEVEL,(p.xp||0)-(lvl-1)*XP_PER_LEVEL));
  const toNext=atMax?0:(XP_PER_LEVEL-inLvl);
  const xpPct=atMax?100:Math.round(inLvl/XP_PER_LEVEL*100);
  const canEdit=session.isAdmin||session.playerId===p.id;
  const recent=missions.filter(m=>m.playerId===p.id&&m.status==='done').slice(-3);
  // El color triat pel jugador esdevé l'accent principal de tot el seu perfil
  var _pc=(/^#[0-9a-fA-F]{3,8}$/.test(p.color||''))?p.color:'';
  var colScope=_pc?`--accent:${_pc};--accent2:color-mix(in srgb,${_pc} 72%, #000);--accent-bg:color-mix(in srgb,${_pc} 15%, transparent);--accent-border:color-mix(in srgb,${_pc} 40%, transparent);`:'';
  document.getElementById('hprofile').innerHTML=`
    <div class="card" style="${colScope}">
      <div class="profile-tabs">
        <div class="ptab active" onclick="switchPTab(this,'pinfo')"><svg class="uico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/></svg>Fitxa</div>
        <div class="ptab" onclick="switchPTab(this,'pgallery')"><svg class="uico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>Galeria</div>
        ${canEdit?`<div class="ptab" onclick="switchPTab(this,'pcustom');renderInlineAvatarEditor('${p.id}')"><svg class="uico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h1a3 3 0 0 0 3-3 8 8 0 0 0-8-9Z"/></svg>Personalització</div>`:''}
      </div>
      <div class="ptab-panel active" id="pinfo">
        <div class="pinfo-layout">
          <aside class="pinfo-side">
        <div class="phead">
          <div class="phead-ava">${frameWrap(p,renderAvatar(p,"pixel-avatar-lg"))}</div>
          <div class="phead-info">
            <span class="badge b-purple" style="margin-bottom:6px;display:inline-block;">Nivell ${lvl} · ${p.cls}</span>
            <div class="pname">${p.name}${session.isAdmin?'<span class="adm-rib">DÉU</span>':`<span class="adm-rib" style="display:none"></span>`}</div>
            <div class="pclass">${p.role}</div>
            <div class="pquote">"${p.quote}"</div>
          </div>
        </div>
        ${canEdit?`<div class="pedit-btns"><button class="btn btn-sm" onclick="goToInventory()">🎒 Inventari</button><button class="btn btn-sm pedit-btn" onclick="openEditModal('${p.id}')">✏️ Editar</button></div>`:''}
        <div class="xpw">
          <div class="xpl"><span>${inLvl} / ${XP_PER_LEVEL} XP</span><span>${atMax?'Nivell màxim (100)':('Falten '+toNext+' XP per al nivell '+(lvl+1))}</span></div>
          <div class="xpt"><div class="xpf" style="width:${xpPct}%;background:${p.color};"></div></div>
        </div>
        ${(function(){var gm=goldEarnedThisMonth(p);var gp=Math.min(100,Math.round(gm/GOLD_MONTH_CAP*100));var gl=Math.max(0,GOLD_MONTH_CAP-gm);var r2=function(n){return Math.round(n*100)/100;};return `<div class="xpw">
          <div class="xpl"><span>Or aquest mes: ${r2(gm)} / ${GOLD_MONTH_CAP}</span><span>${gl>0?('Queden '+r2(gl)):'Límit assolit'}</span></div>
          <div class="xpt"><div class="xpf" style="width:${gp}%;background:linear-gradient(90deg,#d4a017,#ffcf40);"></div></div>
        </div>`;})()}
        <div class="g4" style="margin-bottom:1.25rem;">
          <div class="smini"><div class="v">${p.xp.toLocaleString()} ⭐</div><div class="l">XP total</div></div>
          <div class="smini"><div class="v">${fmtGold(p.gold)} <span class="coin"></span></div><div class="l">Or</div></div>
          <div class="smini"><div class="v">${(p.fragments||0).toLocaleString()} ✨</div><div class="l">Fragments</div></div>
          <div class="smini"><div class="v">${p.missions} 🎯</div><div class="l">Missions</div></div>
        </div>
          </aside>
          <div class="pinfo-main">
        <div class="pbody">
          <div>
            <div class="stitle">Atributs</div>
            ${(function(){
              function slotRow(sl){
                var iid=p.equipped&&p.equipped[sl.key];
                var item=iid?shopItems.find(function(i){return i.id===iid;}):null;
                var ic=item?(item.imageUrl?'<img class="pslot-img" src="'+item.imageUrl+'" alt="">':(item.icon||sl.icon)):sl.icon;
                return '<div class="pslot'+(item?' filled':'')+'"'+(item?' onclick="showItemDetails(\''+iid+'\')" title="Veure detalls"':'')+'>'
                  +'<span class="pslot-ic">'+ic+'</span>'
                  +'<div class="pslot-txt"><div class="pslot-name">'+(item?item.name:'Buit')+'</div><div class="pslot-lbl">'+sl.label+'</div></div>'
                  +'</div>';
              }
              var eq=SLOT_DEFS.filter(function(s){return !s.cosmetic;});
              var eqCol='<div class="pslots"><div class="pslot-group"><div class="pslot-h">Equipament</div>'+eq.map(slotRow).join('')+'</div></div>';
              var radar='<div class="pstats-radar">'+buildPentagon(getEffectiveAttrs(p),p.color)+'</div>';
              return '<div class="pstats-top pstats-top--noco">'+eqCol+radar+'</div>';
            })()}
            <div class="attrs-grid">
            ${(function(){var eff=getEffectiveAttrs(p);return Object.entries(p.attrs).map(function(e){var k=e[0],v=e[1],ev=eff[k]||v,bonus=ev-v;var full=attrName(k),shortNm=full.split('(')[0].trim();return '<div class="attr-chip" title="'+full+'"><span class="attr-ic">'+attrIcon(k)+'</span><div class="attr-body"><div class="attr-top"><span class="attr-nm">'+shortNm+'</span><span class="attr-vl">'+v+(bonus>0?' <span style=\'color:var(--gold);font-size:10px;\'>+'+bonus+'</span>':'')+'</span></div><div class="strk"><div class="sfill" style="width:'+Math.round(Math.min(100,ev/99*100))+'%;background:'+AC[k]+';"></div></div></div></div>';}).join('');})()}
            </div>
          </div>
          <div>
            <div class="stitle">Història</div>
            <p class="plore" style="margin-bottom:1rem;">${p.lore}</p>
            <div class="stitle">Showcase</div>
            <div class="hero-showcase">${(function(){if(!p.showcase)p.showcase=[null,null,null];return p.showcase.map(function(cid,si){var card=cid?gachaCards.find(function(x){return x.id===cid;}):null;var url=card?(card.imageUrl||CFG.GITHUB_RAW+card.image):'';var canEdit=session.playerId===p.id;if(card&&url)return '<img class="showcase-img" src="'+url+'" alt="'+card.name+'"'+(canEdit?' onclick="openShowcaseSelector('+si+')" title="Clic per canviar"':'')+' onerror="this.style.opacity=0"/>';return canEdit?'<div class="showcase-empty" onclick="openShowcaseSelector('+si+')" title="Afegir carta del gacha">＋</div>':'<div class="showcase-empty" style="cursor:default;opacity:.4;">✦</div>';}).join('');})()}</div>
            ${recent.length?`<div class="stitle">Últimes missions</div>`+recent.map(m=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);"><span style="font-size:12px;color:var(--text);">${m.name}</span><span class="badge b-teal">+${m.xp} XP</span></div>`).join(''):''}
          </div>
        </div>
          </div>
        </div>
      </div>
      <div class="ptab-panel" id="pgallery">
        <div class="stitle">Cartas obtenidas</div>
        ${renderGalleryCards(p.gallery||[],'view')}
      </div>
      ${canEdit?`<div class="ptab-panel" id="pcustom">
        <div class="pcustom-layout">
          <div class="pcustom-avatar">
            <div id="inline-avatar-preview"></div>
            <button class="btn btn-p btn-sm" style="margin-top:10px;" onclick="saveInlineAvatar('${p.id}')">💾 Desar avatar</button>
            <div id="pcustom-frame-picker" class="frame-picker-host" style="width:100%;"></div>
          </div>
          <div id="inline-avatar-controls" class="pcustom-controls"></div>
        </div>
      </div>`:''}
    </div>`;
  try{initRadars();}catch(e){}
}

function switchPTab(btn,panelId){
  document.querySelectorAll('.ptab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ptab-panel').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

/* ── arcos ── */
function renderArcs(){
  const myArcs=session.isAdmin?arcs:arcs.filter(a=>missions.some(m=>m.arc===a.name&&m.playerId===session.playerId));
  if(!myArcs.length){
    document.getElementById('arcs-grid').innerHTML='<div style="font-size:13px;color:var(--muted);">Encara no hi ha arcs. Crea\'n un des de Missions → Nou arc.</div>';
    return;
  }
  document.getElementById('arcs-grid').innerHTML=myArcs.map(a=>{
    const pct=a.total>0?Math.round(a.done/a.total*100):0;
    const canDel=session.isAdmin||(a.createdBy===session.playerId);
    return `<div class="arcc">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div class="arcn">${a.name}</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <span class="badge ${a.status==='done'?'b-purple':a.status==='active'?'b-teal':'b-gray'}">${a.status==='done'?'Completat':a.status==='active'?'Actiu':'Blocat'}</span>
          ${canDel?`<button class="btn btn-sm" style="background:var(--coral-bg);color:var(--coral);border-color:var(--coral-border);padding:2px 8px;font-size:11px;" onclick="deleteArc('${a.id}')">✕</button>`:''}
        </div>
      </div>
      <div class="arcl">${a.lore}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px;"><span>Progrés</span><span>${a.done} / ${a.total}</span></div>
      <div class="ptrk"><div class="pfill" style="width:${pct}%;background:${a.status==='active'?'var(--teal)':'var(--muted)'};\"></div></div>
    </div>`;
  }).join('');
}

/* ── ranking ── */
function renderRanking(){
  const score=p=>(p.xp||0)+(p.gold||0);
  const sorted=[...players].filter(p=>p.id!=='admin_special').sort((a,b)=>score(b)-score(a));
  document.getElementById('rank-list').innerHTML=sorted.map((p,i)=>{
    const rc=i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const rs=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
    const _c=(/^#[0-9a-fA-F]{3,8}$/.test(p.color||''))?p.color:'var(--accent)';
    return `<div class="lbrow" style="border-left:3px solid ${_c};">
      <span class="lbrnk ${rc}">${rs}</span>
      <div class="av av-sm" style="background:${p.colorBg};border-color:${_c};">${_esc(p.emblem)}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:${_c};">${_esc(p.name)}</div><div style="font-size:11px;color:var(--muted);">${_esc(p.cls)}</div></div>
      <div class="lbstat"><div class="lbstat-v">${score(p).toLocaleString()}</div><div class="lbstat-l">punts</div></div>
      <div class="lbstat"><div class="lbstat-v">${p.level}</div><div class="lbstat-l">nivell</div></div>
      <div class="lbstat"><div class="lbstat-v" style="color:var(--gold);"><span class="coin"></span> ${fmtGold(p.gold)}</div><div class="lbstat-l">or</div></div>
    </div>`;
  }).join('');
}

/* ══ GACHA ══ */
function renderGachaGold(){
  const p=players.find(p=>p.id===session.playerId);
  document.getElementById('gacha-gold-display').textContent=session.isAdmin?'∞ fragments ✨':p?`${p.fragments||0} fragments ✨`:'— fragments';
}

function getRarityByChance(){
  const r=Math.random()*100;
  let cum=0;
  for(const [rar,pct] of Object.entries(RARITY_PROB)){cum+=pct;if(r<cum)return rar;}
  return 'comun';
}

function pullCard(){
  const rarity=getRarityByChance();
  // Estricte: només una carta EXACTAMENT de la rareza sortejada. Si no n'hi ha, null
  // (així cada carta surt just a la seva probabilitat: rara=25%, epica=4%, etc.).
  var pool=gachaCards.filter(function(c){return c.rarity===rarity;});
  return pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
}

function pullItemByRarity(items){
  if(!items.length)return null;
  // Estricte: objecte EXACTAMENT de la rareza sortejada; si no n'hi ha, null.
  var rarity=getRarityByChance();
  var pool=items.filter(function(it){return (it.rareza||'comun')===rarity;});
  return pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
}
function pullResult(){
  // Bossa unificada: cartes + objectes de gacha. Es sorteja la rareza (70/25/4/1) i,
  // dins d'aquesta rareza, TOTS els elements (cartes i objectes) tenen la mateixa probabilitat.
  var gachaItems=shopItems.filter(function(i){return i.via==='gacha'||i.via==='tienda';});
  var rarity=getRarityByChance();
  function buildPool(rar){
    var pool=[];
    gachaCards.forEach(function(c){if((c.rarity||'comun')===rar)pool.push({type:'card',data:c});});
    gachaItems.forEach(function(it){if((it.rareza||'comun')===rar)pool.push({type:'item',data:it});});
    return pool;
  }
  var pool=buildPool(rarity);
  // Si no hi ha res d'aquesta rareza, cau a qualsevol element existent (bossa completa)
  if(!pool.length){
    gachaCards.forEach(function(c){pool.push({type:'card',data:c});});
    gachaItems.forEach(function(it){pool.push({type:'item',data:it});});
  }
  if(!pool.length)return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
function doPull(times){
  const p=players.find(pl=>pl.id===session.playerId);
  if(!p){toast('Inicia sessió per invocar.');return;}
  const cost=times===1?GACHA_COST_SINGLE:GACHA_COST_MULTI;
  const costPerPull=cost/times;
  if(!session.isAdmin){
    if((p.fragments||0)<cost){toast(`Necessites ${cost} fragments ✨ per invocar.`);return;}
    p.fragments-=cost;
  }
  const results=Array.from({length:times},()=>pullResult()).filter(r=>r!==null);
  // Devolver fragmentos de las tiradas vacías (rareza sorteada sin cartas ni objetos)
  const emptyPulls=times-results.length;
  if(emptyPulls>0&&!session.isAdmin)p.fragments+=emptyPulls*costPerPull;
  if(!results.length){toast('No hi ha cartes ni objectes disponibles.');renderGachaGold();return;}
  if(!p.gallery)p.gallery=[];
  if(!p.inventory)p.inventory=[];
  var refund=0,dupes=0;
  results.forEach(r=>{
    if(r.type==='card'){
      // Les cartes s'acumulen (duplicats): els pots vendre/intercanviar al mercat negre
      if(p.gallery.indexOf(r.data.id)>=0){dupes++;r._dupe=true;}
      p.gallery.push(r.data.id);
    }else if(r.type==='item'){
      var haveItem=p.inventory.indexOf(r.data.id)>=0;
      if(haveItem){refund+=Math.floor(costPerPull/2);dupes++;r._dupe=true;}
      else {p.inventory.push(r.data.id);markItemAcquired(p,r.data.id);}
    }
  });
  if(refund>0&&!session.isAdmin)p.fragments+=refund;
  const reveal=document.getElementById('card-reveal');
  reveal.innerHTML='';reveal.classList.add('show');
  results.forEach((r,i)=>{
    var rarity=r.type==='card'?r.data.rarity:(r.data.rareza||'comun');
    const div=document.createElement('div');div.className='gacha-card pull-anim rarity-frame-'+rarity;
    div.style.animationDelay=`${i*0.08}s`;
    div.style.position='relative';
    var dupeMsg=(r._dupe&&r.type==='card')?'<div class="gacha-dupe-msg">🔁 Duplicat! El pots vendre o intercanviar</div>':(r._dupe?'<div class="gacha-dupe-msg">✨ Ja el tenies · +'+Math.floor(costPerPull/2)+' retornats</div>':'');
    if(r.type==='card'){
      const imgUrl=r.data.imageUrl||(r.data.image?CFG.GITHUB_RAW+r.data.image:'');
      div.innerHTML=`<div class="gacha-card-imgwrap rarity-bg-${rarity}"><img src="${imgUrl}" alt="${r.data.name}" onerror="this.style.opacity=0;"></div>
        <div class="gacha-card-info"><div class="gacha-card-name">${r.data.name}</div><div class="gacha-card-rarity rarity-${rarity}">${RARITY_LABEL[rarity]}</div>${dupeMsg}</div>`;
    }else{
      div.innerHTML=`<div class="gacha-card-imgwrap rarity-bg-${rarity}">${r.data.imageUrl?'<img src="'+r.data.imageUrl+'" alt="'+r.data.name+'" onerror="this.style.opacity=0;">':'<div style="display:flex;align-items:center;justify-content:center;min-height:160px;font-size:48px;">'+r.data.icon+'</div>'}</div>
        <div class="gacha-card-info"><div class="gacha-card-name">${r.data.name}</div><div class="gacha-card-rarity rarity-${rarity}">${RARITY_LABEL[rarity]||'Item'}</div>${dupeMsg}</div>`;
    }
    reveal.appendChild(div);
  });
  if(CFG.MODE==='supabase')saveToSupabase();
  renderGachaGold();renderMyGallery();renderGalleryTabs();renderAll();
  if(dupes>0)toast(dupes+' duplicat'+(dupes>1?'s':'')+' · +'+refund+' fragments ✨ retornats');
}

// Àlbum de cromos: mostra TOTES les cartes del joc; les que tens en color, la resta bloquejades.
function renderGalleryCards(ownedEntries,mode){
  if(!gachaCards.length)return`<div class="gallery-empty">Encara no hi ha cartes al joc.</div>`;
  var counts={};(ownedEntries||[]).map(function(e){return typeof e==='string'?e:(e&&e.cardId)||e;}).forEach(function(id){counts[id]=(counts[id]||0)+1;});
  var all=gachaCards.slice().sort(function(a,b){return (a.name||'').localeCompare(b.name||'');});
  var haveCount=all.filter(function(c){return counts[c.id];}).length;
  var dupCount=all.filter(function(c){return counts[c.id]>1;}).length;
  var list=all;
  if(galleryDupOnly)list=all.filter(function(c){return counts[c.id]>1;});
  else if(galleryOnlyOwned)list=all.filter(function(c){return counts[c.id];});
  if(galleryRarity)list=list.filter(function(c){return (c.rarity||'comun')===galleryRarity;});
  var rarChips=[['','Totes']].concat(RARITY_ORDER.map(function(r){return [r,RARITY_LABEL[r]];})).map(function(rc){
    return '<span class="filter-chip'+(galleryRarity===rc[0]?' active':'')+'" onclick="setGalleryRarity(\''+rc[0]+'\')">'+rc[1]+'</span>';
  }).join('');
  var header='<div class="gallery-head">'
    +'<span class="gallery-count">📖 '+haveCount+' / '+all.length+' <span style="font-weight:500;color:var(--muted);font-size:12px;">· 🔁 '+dupCount+' duplicades</span></span>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
    +'<button class="btn btn-sm'+(galleryOnlyOwned&&!galleryDupOnly?' btn-p':'')+'" onclick="toggleGalleryOwned()">'+(galleryOnlyOwned&&!galleryDupOnly?'✓ Només les meves':'Només les meves')+'</button>'
    +'<button class="btn btn-sm'+(galleryDupOnly?' btn-p':'')+'" onclick="toggleGalleryDup()">'+(galleryDupOnly?'✓ ':'')+'Només duplicats ('+dupCount+')</button>'
    +'</div></div>'
    +'<div class="filter-bar" style="margin-top:.5rem;">'+rarChips+'</div>';
  if(!list.length)return header+'<div class="gallery-empty">'+(galleryDupOnly?'No tens cap carta duplicada.':'Encara no tens cap carta.')+'</div>';
  var grid='<div class="gallery-grid">'+list.map(function(c){
    var n=counts[c.id]||0;var mine=n>0;
    var imgUrl=c.imageUrl||(c.image?CFG.GITHUB_RAW+c.image:'');
    return '<div class="gallery-card rarity-frame-'+c.rarity+(mine?'':' locked')+'">'
      +(mine
        ?'<img src="'+imgUrl+'" alt="'+c.name+'" onerror="this.style.background=\'var(--bg3)\';this.style.minHeight=\'120px\';">'
        :'<div class="gallery-locked-img">?</div>')
      +(n>1?'<div class="cpick-x" style="top:5px;right:5px;">x'+n+'</div>':'')
      +'<div class="gallery-card-label">'
      +'<div class="gname">'+(mine?c.name:'???')+(n>1?' <span style="color:var(--gold);">×'+n+'</span>':'')+'</div>'
      +'<div class="grarity rarity-'+c.rarity+'">'+RARITY_LABEL[c.rarity]+(n>1?' · '+(n-1)+' duplicada'+(n-1>1?'es':''):'')+'</div>'
      +'</div></div>';
  }).join('')+'</div>';
  return header+grid;
}
function refreshGalleries(){
  try{renderMyGallery();}catch(e){}
  try{renderGalleryTabs();}catch(e){}
  var g=document.getElementById('inv-my-gallery');
  if(g){var p=players.find(function(pl){return pl.id===session.playerId;});g.innerHTML=renderGalleryCards(p?p.gallery:[]);}
  var pg=document.getElementById('pgallery');
  if(pg&&pg.classList.contains('active')){var pp=players[curHero];if(pp)pg.innerHTML='<div class="stitle">Cartas obtenidas</div>'+renderGalleryCards(pp.gallery||[],'view');}
}
function toggleGalleryOwned(){
  galleryOnlyOwned=!galleryOnlyOwned;if(galleryOnlyOwned)galleryDupOnly=false;
  refreshGalleries();
}
function toggleGalleryDup(){
  galleryDupOnly=!galleryDupOnly;if(galleryDupOnly)galleryOnlyOwned=false;
  refreshGalleries();
}
function setGalleryRarity(r){galleryRarity=(galleryRarity===r)?'':r;refreshGalleries();}

function renderMyGallery(){
  const p=players.find(pl=>pl.id===session.playerId);
  document.getElementById('my-gallery').innerHTML=p?renderGalleryCards(p.gallery||[]):`<div class="gallery-empty">Inicia sesión para ver tu galería.</div>`;
}

function renderGalleryTabs(){
  const tabs=document.getElementById('gallery-tabs');
  const cont=document.getElementById('team-gallery');
  if(!tabs||!cont)return;
  tabs.innerHTML=players.map((p,i)=>
    `<div class="htab ${i===galleryHeroIdx?'active':''}" onclick="selectGalleryHero(${i})">${p.emblem} ${p.name.split(' ')[0]} <span style="font-size:10px;color:var(--muted);">(${(p.gallery||[]).length})</span></div>`
  ).join('');
  const gp=players[galleryHeroIdx];
  cont.innerHTML=gp?renderGalleryCards(gp.gallery||[]):'';
}

function selectGalleryHero(i){galleryHeroIdx=i;renderGalleryTabs();}

/* ══ MERCAT NEGRE ══ */
const QUICK_SELL={comun:50,rara:75,epica:150,legendaria:300};
function mkCardById(id){return gachaCards.find(function(c){return c.id===id;});}
function galleryCounts(p){var m={};((p&&p.gallery)?p.gallery:[]).forEach(function(id){m[id]=(m[id]||0)+1;});return m;}
function dupIds(p){var m=galleryCounts(p);return Object.keys(m).filter(function(id){return m[id]>1;});}
var mlSelCard=null,mlSelWant=null;
function selectSellCard(id){mlSelCard=id;renderCardPickers();}
function selectWantCard(id){mlSelWant=id;renderCardPickers();}
function mkThumb(c,selected,onclick,extra){
  var img=c.imageUrl||(c.image?CFG.GITHUB_RAW+c.image:'');
  return '<div class="cpick'+(selected?' sel':'')+'" onclick="'+onclick+'">'
    +'<img src="'+img+'" alt="'+c.name+'" onerror="this.style.background=\'var(--bg3)\';this.style.minHeight=\'64px\';">'
    +'<div class="cpick-lbl">'+c.name+'</div>'
    +'<div class="grarity rarity-'+c.rarity+'" style="font-size:9px;">'+RARITY_LABEL[c.rarity]+'</div>'
    +(extra||'')+'</div>';
}
function renderCardPickers(){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var cg=document.getElementById('ml-card-grid');
  if(cg){
    var counts=galleryCounts(p);
    var dups=dupIds(p).map(mkCardById).filter(Boolean);
    if(mlSelCard&&dups.every(function(c){return c.id!==mlSelCard;}))mlSelCard=null;
    cg.innerHTML=dups.length?dups.map(function(c){return mkThumb(c,mlSelCard===c.id,'selectSellCard(\''+c.id+'\')','<div class="cpick-x">x'+counts[c.id]+'</div>');}).join(''):'<div style="font-size:12px;color:var(--muted);">No tens cartes duplicades. Aconsegueix-ne repetides al gacha per vendre-les o intercanviar-les.</div>';
  }
  var wg=document.getElementById('ml-want-grid');
  if(wg){
    wg.innerHTML=gachaCards.slice().sort(function(a,b){return RARITY_ORDER.indexOf(a.rarity)-RARITY_ORDER.indexOf(b.rarity);}).map(function(c){return mkThumb(c,mlSelWant===c.id,'selectWantCard(\''+c.id+'\')');}).join('');
  }
}
function onListingModeChange(){
  var mode=document.getElementById('ml-mode').value;
  var pw=document.getElementById('ml-price-wrap'),ww=document.getElementById('ml-want-wrap');
  if(pw)pw.style.display=mode==='trade'?'none':'';
  if(ww)ww.style.display=mode==='trade'?'':'none';
}
function renderQuickSell(){
  var host=document.getElementById('quicksell-grid');if(!host)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p){host.innerHTML='<div style="font-size:12px;color:var(--muted);">Entra amb un personatge.</div>';return;}
  var counts=galleryCounts(p);
  var dups=dupIds(p).map(mkCardById).filter(Boolean);
  if(!dups.length){host.innerHTML='<div style="font-size:12px;color:var(--muted);">No tens duplicats per vendre.</div>';return;}
  host.innerHTML='<div class="gallery-grid">'+dups.map(function(c){
    var val=QUICK_SELL[c.rarity]||0;
    var img=c.imageUrl||(c.image?CFG.GITHUB_RAW+c.image:'');
    return '<div class="gallery-card rarity-frame-'+c.rarity+'">'
      +'<img src="'+img+'" alt="'+c.name+'" onerror="this.style.background=\'var(--bg3)\';this.style.minHeight=\'120px\';">'
      +'<div class="gallery-card-label"><div class="gname">'+c.name+' <span style="color:var(--muted);">x'+counts[c.id]+'</span></div>'
      +'<button class="btn btn-sm btn-gold" style="width:100%;margin-top:5px;" onclick="quickSellCard(\''+c.id+'\')">Vendre +'+val+' ✨</button>'
      +'</div></div>';
  }).join('')+'</div>';
}
function quickSellCard(cardId){
  var p=players.find(function(pl){return pl.id===session.playerId;});if(!p)return;
  var counts=galleryCounts(p);
  if(!(counts[cardId]>1)){toast('Només pots vendre duplicats (has de conservar-ne una).');return;}
  var c=mkCardById(cardId);if(!c)return;
  var val=QUICK_SELL[c.rarity]||0;
  var idx=p.gallery.indexOf(cardId);if(idx>=0)p.gallery.splice(idx,1);
  p.fragments=(p.fragments||0)+val;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderMarket();renderAll();
  showUndo('Venuda '+c.name+' per +'+val+' ✨',function(){
    p.gallery.push(cardId);
    p.fragments=Math.max(0,(p.fragments||0)-val);
    if(CFG.MODE==='supabase')saveToSupabase();
    renderMarket();renderAll();
  });
}
function logMarket(entry){
  entry.ts=new Date().toISOString();
  marketHistory.unshift(entry);
  if(marketHistory.length>60)marketHistory=marketHistory.slice(0,60);
}
function renderMarketHistory(){
  var host=document.getElementById('mercat-history');if(!host)return;
  if(!marketHistory.length){host.innerHTML='<div style="font-size:13px;color:var(--muted);">Encara no hi ha operacions.</div>';return;}
  function pname(id){var p=players.find(function(x){return x.id===id;});return p?p.name.split(' ')[0]:'?';}
  function cname(id){var c=mkCardById(id);return c?c.name:'?';}
  function when(ts){try{var d=new Date(ts);return d.toLocaleDateString()+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}catch(e){return '';}}
  host.innerHTML='<div style="display:flex;flex-direction:column;gap:6px;">'+marketHistory.map(function(h){
    var desc;
    if(h.type==='trade')desc='🔄 <b>'+pname(h.toId)+'</b> va donar <b>'+cname(h.wantCardId)+'</b> i va rebre <b>'+cname(h.cardId)+'</b> de <b>'+pname(h.fromId)+'</b>';
    else desc='🛒 <b>'+pname(h.toId)+'</b> va comprar <b>'+cname(h.cardId)+'</b> a <b>'+pname(h.fromId)+'</b> per '+(h.mode==='gold'?('<span class="coin"></span> '+h.price):('✨ '+h.price));
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 10px;background:var(--bg2);border:0.5px solid var(--border);border-radius:var(--radius);font-size:12px;">'
      +'<span style="color:var(--text);">'+desc+'</span>'
      +'<span style="color:var(--muted);white-space:nowrap;font-size:11px;">'+when(h.ts)+'</span></div>';
  }).join('')+'</div>';
}
function renderMarket(){
  renderCardPickers();renderQuickSell();renderMarketHistory();
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var w=document.getElementById('mercat-wallet');
  if(w)w.innerHTML=p?('El teu moneder: <span class="coin"></span> '+p.gold+' or · ✨ '+(p.fragments||0)+' fragments'):'Entra amb un personatge per operar al mercat.';
  var host=document.getElementById('mercat-list');if(!host)return;
  if(!market.length){host.innerHTML='<div style="font-size:13px;color:var(--muted);padding:1rem;">No hi ha res al mercat. Sigues el primer en publicar una carta!</div>';return;}
  var RARCOL={comun:'#9aa0a6',rara:'#4a90d9',epica:'#a855f7',legendaria:'#e4a428'};
  host.innerHTML='<div class="mkt-grid">'+market.map(function(l){
    var c=mkCardById(l.cardId);if(!c)return '';
    var seller=players.find(function(pl){return pl.id===l.sellerId;});
    var sellerName=seller?seller.name.split(' ')[0]:'?';
    var mine=p&&l.sellerId===p.id;
    var counts=galleryCounts(p);
    var imgUrl=c.imageUrl||(c.image?CFG.GITHUB_RAW+c.image:'');
    var priceLine='',wantBlock='';
    if(l.mode==='gold')priceLine='<span class="coin"></span> '+l.price+' or';
    else if(l.mode==='frag')priceLine='✨ '+l.price+' fragments';
    else{
      var wc=mkCardById(l.wantCardId);
      var wimg=wc?(wc.imageUrl||(wc.image?CFG.GITHUB_RAW+wc.image:'')):'';
      priceLine='🔄 Vol a canvi:';
      wantBlock='<div class="mkt-want">'
        +(wc?'<img src="'+wimg+'" alt="'+wc.name+'" onerror="this.style.background=\'var(--bg3)\';">':'')
        +'<div style="min-width:0;"><div class="tw-name">'+(wc?wc.name:'?')+'</div><div class="grarity rarity-'+(wc?wc.rarity:'comun')+'" style="font-size:9px;">'+(wc?RARITY_LABEL[wc.rarity]:'')+'</div></div>'
        +'</div>';
    }
    var btn='';
    if(mine||session.isAdmin){
      btn='<button class="btn btn-sm" style="width:100%;color:var(--coral);border-color:var(--coral-border);" onclick="cancelListing(\''+l.id+'\')">Retirar</button>';
    }else if(p){
      if(l.mode==='trade'){
        var canTrade=(counts[l.wantCardId]||0)>1;/* cal un duplicat de la carta demanada */
        btn='<button class="btn btn-sm btn-p" style="width:100%;" '+(canTrade?'':'disabled')+' onclick="tradeListing(\''+l.id+'\')">'+(canTrade?'Intercanviar':'Necessites un duplicat')+'</button>';
      }else{
        var cur=l.mode==='gold'?(p.gold||0):(p.fragments||0);
        var can=cur>=l.price;
        btn='<button class="btn btn-sm btn-p" style="width:100%;" '+(can?'':'disabled')+' onclick="buyListing(\''+l.id+'\')">'+(can?'Comprar':'Sense saldo')+'</button>';
      }
    }
    var accent=RARCOL[c.rarity]||'#9aa0a6';
    return '<div class="mkt-card" style="border-left:3px solid '+accent+';">'
      +'<div class="mkt-img"><img src="'+imgUrl+'" alt="'+c.name+'" onerror="this.style.background=\'var(--bg3)\';"></div>'
      +'<div class="mkt-body">'
      +(l.mode==='trade'?'<div class="mkt-tag">Ofereix</div>':'')
      +'<div class="mkt-name">'+c.name+'</div>'
      +'<div class="grarity rarity-'+c.rarity+'" style="font-size:11px;">'+RARITY_LABEL[c.rarity]+'</div>'
      +'<div class="mkt-price">'+priceLine+'</div>'
      +wantBlock
      +'<div class="mkt-seller">de '+sellerName+'</div>'
      +btn
      +'</div></div>';
  }).join('')+'</div>';
}
function createListing(){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p){toast('Entra amb un personatge.');return;}
  var cardId=mlSelCard;
  var counts=galleryCounts(p);
  if(!cardId||!(counts[cardId]>1)){toast('Tria una carta DUPLICADA (n\'has de tenir més d\'una).');return;}
  var mode=document.getElementById('ml-mode').value;
  var listing={id:'mk'+Date.now(),sellerId:p.id,cardId:cardId,mode:mode};
  if(mode==='trade'){
    var want=mlSelWant;
    if(!want){toast('Tria la carta que vols a canvi.');return;}
    listing.wantCardId=want;
  }else{
    var price=parseInt(document.getElementById('ml-price').value)||0;
    if(price<=0){toast('Posa un preu vàlid.');return;}
    listing.price=price;
  }
  var _ei=p.gallery.indexOf(cardId);if(_ei>=0)p.gallery.splice(_ei,1);/* escrow: treu una còpia */
  market.push(listing);
  mlSelCard=null;mlSelWant=null;
  if(CFG.MODE==='supabase')saveToSupabase();
  var pn=document.getElementById('panel-new-listing');if(pn)pn.removeAttribute('open');
  renderMarket();renderAll();
  toast('Publicat al mercat');
}
function cancelListing(id){
  var l=market.find(function(x){return x.id===id;});if(!l)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!(session.isAdmin||(p&&l.sellerId===p.id)))return;
  var seller=players.find(function(pl){return pl.id===l.sellerId;});
  if(seller){if(!seller.gallery)seller.gallery=[];if(seller.gallery.indexOf(l.cardId)<0)seller.gallery.push(l.cardId);}
  market=market.filter(function(x){return x.id!==id;});
  if(CFG.MODE==='supabase')saveToSupabase([l.sellerId]);
  renderMarket();renderAll();
  toast('Oferta retirada');
}
function buyListing(id){
  var l=market.find(function(x){return x.id===id;});if(!l||l.mode==='trade')return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p||l.sellerId===p.id)return;
  var cur=l.mode==='gold'?(p.gold||0):(p.fragments||0);
  if(cur<l.price){toast('No tens prou saldo.');return;}
  var seller=players.find(function(pl){return pl.id===l.sellerId;});
  if(l.mode==='gold'){p.gold-=l.price;if(seller)seller.gold=(seller.gold||0)+l.price;}
  else{p.fragments=(p.fragments||0)-l.price;if(seller)seller.fragments=(seller.fragments||0)+l.price;}
  if(!p.gallery)p.gallery=[];p.gallery.push(l.cardId);
  market=market.filter(function(x){return x.id!==id;});
  logMarket({type:'buy',cardId:l.cardId,mode:l.mode,price:l.price,fromId:l.sellerId,toId:p.id});
  if(CFG.MODE==='supabase')saveToSupabase([l.sellerId]);
  renderMarket();renderAll();
}
function tradeListing(id){
  var l=market.find(function(x){return x.id===id;});if(!l||l.mode!=='trade')return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p||l.sellerId===p.id)return;
  var counts=galleryCounts(p);
  if(!(counts[l.wantCardId]>1)){toast('Necessites un DUPLICAT de la carta que demanen.');return;}
  var seller=players.find(function(pl){return pl.id===l.sellerId;});
  var _wi=p.gallery.indexOf(l.wantCardId);if(_wi>=0)p.gallery.splice(_wi,1);/* dóna una còpia */
  p.gallery.push(l.cardId);/* rep la carta oferta */
  if(seller){if(!seller.gallery)seller.gallery=[];seller.gallery.push(l.wantCardId);}
  market=market.filter(function(x){return x.id!==id;});
  logMarket({type:'trade',cardId:l.cardId,wantCardId:l.wantCardId,fromId:l.sellerId,toId:p.id});
  if(CFG.MODE==='supabase')saveToSupabase([l.sellerId]);
  renderMarket();renderAll();
}

function showInvTab(name,btn){
  ['equip','cosm','galeria','historial'].forEach(function(t){var el=document.getElementById('inv-tab-'+t);if(el)el.style.display=(t===name)?'':'none';});
  var tabs=document.getElementById('inv-tabs');
  if(tabs)[].forEach.call(tabs.querySelectorAll('.htab'),function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(name==='cosm'){
    var pv=document.getElementById('inv-ava-preview');
    if(p){getPlayerAvatar(p);if(pv)pv.innerHTML=frameWrap(p,renderAvatar(p,'pixel-avatar-lg'));renderInventario();renderFramePicker();}
    else if(pv){pv.innerHTML='<div style="font-size:13px;color:var(--muted);">Inicia sessió per personalitzar el teu personatge.</div>';}
  }
  if(name==='galeria'){
    var g=document.getElementById('inv-my-gallery');
    if(g)g.innerHTML=p?renderGalleryCards(p.gallery||[]):'<div class="gallery-empty">Inicia sessió per veure la teva galeria.</div>';
  }
  if(name==='historial')renderConsumeHistoryPlayer();
}
/* ══ HISTORIAL DE CONSUMIBLES ══ */
function consumeHistoryHTML(list){
  if(!list.length)return '<div class="empty-state"><div class="es-ico">📜</div><div class="es-txt">Encara no s\'ha consumit cap ítem.</div></div>';
  return '<div class="ch-list">'+list.map(function(h){
    var d=h.at?new Date(h.at):null;
    var dstr=d?(d.toLocaleDateString('ca-ES')+' · '+d.toLocaleTimeString('ca-ES',{hour:'2-digit',minute:'2-digit'})):'';
    return '<div class="ch-row bg-rarity-'+(h.rareza||'comun')+'">'
      +'<span class="ch-ico">'+(h.icon||'📦')+'</span>'
      +'<div class="ch-info"><div class="ch-name">'+_esc(h.name||'')+(h.expired?' <span class="badge b-gray" style="font-size:10px;">⏳ caducat</span>':'')+'</div>'
      +'<div class="ch-meta">'+_esc(h.playerName||'')+(dstr?(' · '+dstr):'')+'</div></div>'
      +'</div>';
  }).join('')+'</div>';
}
function renderConsumeHistoryPlayer(){
  var el=document.getElementById('inv-consume-history');if(!el)return;
  var pid=session.playerId;
  el.innerHTML=consumeHistoryHTML(consumeHistory.filter(function(h){return h.playerId===pid;}));
}
function renderConsumeHistoryAdmin(){
  var el=document.getElementById('admin-consume-history');if(!el)return;
  el.innerHTML=consumeHistoryHTML(consumeHistory);
}
function consumeItem(itemId){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!p||!item)return;
  var idx=(p.inventory||[]).indexOf(itemId);
  if(idx<0){toast('No tens aquest ítem.');return;}
  if(!confirm('Consumir «'+item.name+'»? Desapareixerà de la teva motxilla.'))return;
  p.inventory.splice(idx,1);
  if(p.equipped)Object.keys(p.equipped).forEach(function(k){if(p.equipped[k]===itemId)p.equipped[k]=null;});
  consumeHistory.unshift({itemId:itemId,name:item.name,icon:item.icon||'📦',rareza:item.rareza||'comun',playerId:p.id,playerName:p.name,at:new Date().toISOString()});
  if(consumeHistory.length>1000)consumeHistory=consumeHistory.slice(0,1000);
  if(CFG.MODE==='supabase')saveToSupabase();
  renderInventario();renderShop();
  try{renderConsumeHistoryPlayer();}catch(e){}
  toast('Has consumit: '+item.name);
}
function saveAvatarInline(){
  if(CFG.MODE==='supabase')saveToSupabase();
  updateSidebarAvatar();
  try{renderHeroProfile(curHero);}catch(e){}
  toast('Avatar desat');
}

/* ══ EDIT MODAL ══ */
function openEditModal(pid){
  const p=players.find(p=>p.id===pid);if(!p)return;
  editPid=pid;
  document.getElementById('e-name').value=p.name;
  var _ern=document.getElementById('e-rn');if(_ern)_ern.value=p.realName||'';
  document.getElementById('e-lore').value=p.lore;
  document.getElementById('e-quote').value=p.quote;
  const ec=document.getElementById('e-colors');ec.innerHTML='';
  COLORS.forEach(col=>{const d=document.createElement('div');d.className='cdot'+(col.hex===p.color?' selected':'');d.style.background=col.hex;d.onclick=()=>{ec.querySelectorAll('.cdot').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');p.color=col.hex;p.colorBg=col.bg;};ec.appendChild(d);});
  const ee=document.getElementById('e-emblems');ee.innerHTML='';
  EMBLEMS.forEach(e=>{const d=document.createElement('div');d.style.cssText=`width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;border:1px solid ${e===p.emblem?'var(--accent)':'var(--border)'};background:${e===p.emblem?'var(--bg3)':'transparent'};transition:all .15s;`;d.textContent=e;d.onclick=()=>{p.emblem=e;ee.querySelectorAll('div').forEach(x=>x.style.borderColor='var(--border)');d.style.borderColor='var(--accent)';};ee.appendChild(d);});
  const ae=document.getElementById('adm-extras');
  const ad=document.getElementById('adm-delete-wrap');
  if(session.isAdmin){
    ae.style.display='block';ad.style.display='block';
    document.getElementById('e-xp').value=p.xp;
    document.getElementById('e-level').value=p.level;
    document.getElementById('e-gold').value=p.gold;
    document.getElementById('e-frag').value=p.fragments||0;
    // Poblar el selector de classe amb les classes reals (BD), no valors fixos
    var _ecls=document.getElementById('e-cls');
    if(_ecls){var _opts=CLASSES.map(function(c){return '<option value="'+_esc(c.name)+'">'+_esc((c.icon||'')+' '+c.name)+'</option>';}).join('');if(p.cls&&!CLASSES.some(function(c){return c.name===p.cls;}))_opts+='<option value="'+_esc(p.cls)+'">'+_esc(p.cls)+'</option>';_ecls.innerHTML=_opts;_ecls.value=p.cls;}
    var _ag=document.getElementById('e-attrs-grid');
    if(_ag)_ag.innerHTML=attrKeys().map(function(k){
      return '<div class="field" style="margin:0;"><label>'+attrName(k).slice(0,6)+'</label><input type="number" id="e-attr-'+k+'" min="0" value="'+(p.attrs[k]||0)+'"/></div>';
    }).join('');
  }else{ae.style.display='none';ad.style.display='none';}
  document.getElementById('modal-edit').style.display='block';
}
function closeEdit(){document.getElementById('modal-edit').style.display='none';editPid=null;}
function deletePlayer(){
  if(!session.isAdmin)return;
  const p=players.find(p=>p.id===editPid);
  if(!p)return;
  if(!confirm('Segur que vols esborrar '+p.name+'? Aquesta acció no es pot desfer.'))return;
  const _delId=editPid;
  players=players.filter(p=>p.id!==_delId);
  missions=missions.map(m=>m.playerId===_delId?{...m,playerId:''}:m);
  arcs=arcs.filter(a=>!a.id.includes(_delId));
  if(CFG.MODE==='supabase'){
    saveToSupabase([],[_delId]);
    fetch(`${CFG.SUPABASE_URL}/rest/v1/players?id=eq.`+_delId,{
      method:'DELETE',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
  }
  closeEdit();renderAll();
  if(curHero>=players.length)curHero=0;
  
}
function saveEdit(){
  const p=players.find(p=>p.id===editPid);if(!p)return;
  p.name=document.getElementById('e-name').value.trim()||p.name;
  var _ern=document.getElementById('e-rn');if(_ern)p.realName=_ern.value.trim();
  p.lore=document.getElementById('e-lore').value.trim();
  p.quote=document.getElementById('e-quote').value.trim();
  if(session.isAdmin){
    var _exp=parseInt(document.getElementById('e-xp').value);p.xp=isNaN(_exp)?p.xp:Math.max(0,_exp);
    var _egold=parseFloat(document.getElementById('e-gold').value);p.gold=isNaN(_egold)?p.gold:Math.round(_egold*100)/100;
    var _efrag=parseInt(document.getElementById('e-frag').value);p.fragments=isNaN(_efrag)?0:Math.max(0,_efrag);
    // Nivel: si el admin lo pone manualmente lo respeta; si no, lo deriva de XP
    var manualLevel=parseInt(document.getElementById('e-level').value);
    p.level=manualLevel&&manualLevel>0?manualLevel:Math.floor(p.xp/100)+1;
    // Clase: solo resetea attrs si REALMENTE cambió de clase
    var newCls=document.getElementById('e-cls').value;
    var clsChanged=newCls!==p.cls;
    p.cls=newCls;
    var cls=CLASSES.find(c=>c.name===p.cls);
    if(cls){p.role=cls.role;if(clsChanged){p.attrs={...cls.attrs};p.baseAttrs={...cls.attrs};}}
    // Stats manuales (siempre se aplican, después del posible reset por cambio de clase)
    attrKeys().forEach(function(k){
      var el=document.getElementById('e-attr-'+k);
      if(el)p.attrs[k]=parseInt(el.value)||0;
    });
  }
  if(CFG.MODE==='supabase')saveToSupabase([editPid]);
  closeEdit();renderAll();
}


/* ══ TIENDA ══ */
function getEffectiveAttrs(p){
  var base={};Object.keys(p.attrs).forEach(function(k){base[k]=p.attrs[k];});
  if(!p.equipped)return base;
  Object.values(p.equipped).forEach(function(itemId){
    if(!itemId)return;
    var item=shopItems.find(function(i){return i.id===itemId;});
    if(item&&item.bonus)Object.entries(item.bonus).forEach(function(e){base[e[0]]=(base[e[0]]||0)+e[1];});
  });
  return base;
}
function canBuyItem(p,item){
  if(!p||p.gold<item.cost||p.level<item.minLevel)return false;
  var attrs=getEffectiveAttrs(p);
  return Object.entries(item.minAttrs||{}).every(function(e){return (attrs[e[0]]||0)>=e[1];});
}
function meetsReqs(p,item){
  if(!p||p.level<item.minLevel)return false;
  var attrs=getEffectiveAttrs(p);
  return Object.entries(item.minAttrs||{}).every(function(e){return (attrs[e[0]]||0)>=e[1];});
}
function renderShop(){
  try{checkItemExpiry();}catch(e){}
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var eqWrap=document.getElementById('my-equipped');
  if(eqWrap){
    if(!p){
      eqWrap.innerHTML='<div class="stitle">Equipament (l\'admin no té personatge)</div>';
    }else{
    eqWrap.innerHTML='<div class="stitle">Equipat actualment</div><div class="equipped-slots">'
      +SLOT_DEFS.filter(function(s){return !s.cosmetic;}).map(function(sl){
        var itemId=p.equipped?p.equipped[sl.key]:null;
        var item=shopItems.find(function(i){return i.id===itemId;});
        return '<div class="eslot '+(item?'filled':'')+'">'
          +'<span>'+(item?item.icon:sl.icon)+'</span>'
          +'<div><div class="eslot-label">'+sl.label+'</div>'
          +'<div style="font-size:11px;color:'+(item?'var(--text)':'var(--muted)')+';">'+(item?item.name:'Vacío')+'</div></div>'
          +'</div>';
      }).join('')+'</div>';
    }
  }
  var wrap=document.getElementById('shop-grid-wrap');
  if(!wrap)return;
  if(!shopItems.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);">No hi ha ítems a la botiga encara.</div>';return;}
  var shopSearch=(document.getElementById('shop-search')?document.getElementById('shop-search').value.toLowerCase().trim():'');
  var shopSlot=(document.getElementById('shop-filter-slot')?document.getElementById('shop-filter-slot').value:'');
  var shopRarity=(document.getElementById('shop-filter-rarity')?document.getElementById('shop-filter-rarity').value:'');
  var shopSortBy=(document.getElementById('shop-sort')?document.getElementById('shop-sort').value:'name');
  var filteredShop=shopItems.filter(function(item){
    if(item.via==='gacha')return false;
    if(shopSearch&&item.name.toLowerCase().indexOf(shopSearch)<0)return false;
    if(shopSlot&&item.slot!==shopSlot)return false;
    if(shopRarity&&item.rareza!==shopRarity)return false;
    return true;
  }).sort(function(a,b){
    if(shopSortBy==='name')return a.name.localeCompare(b.name);
    if(shopSortBy==='cost-asc')return(a.cost||0)-(b.cost||0);
    if(shopSortBy==='cost-desc')return(b.cost||0)-(a.cost||0);
    return RARITY_ORDER.indexOf(a.rareza||'comun')-RARITY_ORDER.indexOf(b.rareza||'comun');
  });
  wrap.innerHTML='<div class="shop-grid">'+filteredShop.map(function(item){
    var owned=p&&(p.inventory||[]).indexOf(item.id)>=0;
    var equipped=p&&p.equipped&&Object.values(p.equipped).indexOf(item.id)>=0;
    var meetsR=p&&meetsReqs(p,item);
    var lim=itemLim(item.id);
    var hasTotal=(lim.total!=null&&lim.total!=='');
    var hasPer=(lim.per!=null&&lim.per!=='');
    var stockLeft=itemStockLeft(item.id);
    var perLeft=p?itemPerLeft(item.id,p.id):Infinity;
    var soldOut=stockLeft<=0;
    var perReached=perLeft<=0;
    var buyable=p&&canBuyItem(p,item)&&!soldOut&&!perReached;
    var cls=soldOut?'locked':equipped?'equipped':buyable?'can-buy':!meetsR?'locked':'';
    var bonusStr=Object.entries(item.bonus||{}).filter(function(e){return e[1]>0;}).map(function(e){return '+'+e[1]+' '+AN[e[0]];}).join(' · ');
    var reqStr=Object.entries(item.minAttrs||{}).filter(function(e){return e[1]>0;}).map(function(e){return AN[e[0]]+' '+e[1]+'+';}).join(' · ');
    // Info d'estoc / límit per persona
    var stockInfo='';
    if(hasTotal)stockInfo+='<div class="item-stock'+(soldOut?' out':'')+'">'+(soldOut?'Esgotat':('📦 Estoc: '+stockLeft+' / '+lim.total))+'</div>';
    if(hasPer&&p)stockInfo+='<div class="item-stock">👤 '+itemBoughtBy(item.id,p.id)+' / '+lim.per+' per persona</div>';
    if(itemDur(item.id))stockInfo+='<div class="item-stock">⏳ Dura '+itemDur(item.id)+' dies des que l\'obtens</div>';
    // Botó de compra
    var btn='';
    if(soldOut)btn='<div class="soldout-lbl">Esgotat</div>';
    else if(buyable)btn='<button class="btn btn-sm btn-gold" onclick="buyItem(\''+item.id+'\')">Comprar <span class="coin"></span> '+item.cost+'</button>';
    else if(perReached)btn='<div style="font-size:11px;color:var(--muted);">Límit assolit</div>';
    else if(!meetsR)btn='<div style="font-size:11px;color:var(--coral);">🔒 Requisits no complerts</div>';
    else btn='<div style="font-size:11px;color:var(--coral);"><span class="coin"></span> Or insuficient</div>';
    // Equipar/Desequipar si ja el té (només items amb slot d'equip real)
    var eqBtn='';
    if(isConsumable(item.id)){
      if(owned)eqBtn='<button class="btn btn-sm btn-gold" onclick="consumeItem(\''+item.id+'\')">🍴 Consumir</button>';
    }else if(equipped)eqBtn='<button class="btn btn-sm" onclick="unequipItem(\''+item.id+'\')">Desequipar</button>';
    else if(owned)eqBtn='<button class="btn btn-sm btn-p" onclick="equipItem(\''+item.id+'\')">Equipar</button>';
    return '<div class="shop-item bg-rarity-'+(item.rareza||'comun')+' '+cls+'">'
      +'<button class="info-btn" title="Veure info" onclick="event.stopPropagation();showItemDetails(\''+item.id+'\')">i</button>'
      +'<div class="item-media">'+(item.imageUrl?'<img src="'+item.imageUrl+'" alt="'+item.name+'">':'<span class="item-emoji">'+item.icon+'</span>')+'</div>'
      +'<div class="item-name">'+item.name+'</div>'
      +'<div class="item-desc">'+item.desc+'</div>'
      +stockInfo
      +btn+eqBtn+'</div>';
  }).join('')+'</div>';
}
function buyItem(itemId){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!p||!item)return;
  if(itemStockLeft(itemId)<=0){toast('Esgotat: no queden existències.');return;}
  if(itemPerLeft(itemId,p.id)<=0){toast('Ja has arribat al teu límit de compres d\'aquest ítem.');return;}
  if(!canBuyItem(p,item)){toast('No pots comprar aquest ítem.');return;}
  p.gold-=item.cost;
  if(!p.inventory)p.inventory=[];
  p.inventory.push(itemId);
  markItemAcquired(p,itemId);
  // Registrar compra (per persona i total)
  if(!itemPurchases[itemId])itemPurchases[itemId]={total:0,by:{}};
  itemPurchases[itemId].total=(itemPurchases[itemId].total||0)+1;
  itemPurchases[itemId].by[p.id]=(itemPurchases[itemId].by[p.id]||0)+1;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderShop();renderAll();
}
function equipItem(itemId){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!p||!item)return;
  if(!p.equipped)p.equipped=emptyEquipped();
  p.equipped[item.slot]=itemId;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderShop();renderHeroProfile(curHero);
  
}
function unequipItem(itemId){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p||!p.equipped)return;
  // Buidar la casella ON estigui realment l'item (no depenem de item.slot, que pot no coincidir)
  var found=false;
  Object.keys(p.equipped).forEach(function(k){if(p.equipped[k]===itemId){p.equipped[k]=null;found=true;}});
  if(!found){var item=shopItems.find(function(i){return i.id===itemId;});if(item&&p.equipped.hasOwnProperty(item.slot))p.equipped[item.slot]=null;}
  if(CFG.MODE==='supabase')saveToSupabase();
  renderShop();renderInventario();try{renderHeroProfile(curHero);}catch(e){}
}
async function adminCreateItemFull(){
  var name=document.getElementById('ai-name').value.trim();
  if(!name){alert('El ítem necessita un nom.');return;}
  var icon=document.getElementById('ai-icon').value.trim()||'📦';
  var imageUrl=document.getElementById('ai-imageurl').value.trim()||null;
  var desc=document.getElementById('ai-desc').value.trim();
  var slot=document.getElementById('ai-slot').value;
  var rareza=document.getElementById('ai-rarity').value;
  var cost=parseInt(document.getElementById('ai-cost').value)||0;
  var minLevel=parseInt(document.getElementById('ai-lvl').value)||1;
  var via=document.getElementById('ai-via').value;
  var newItem={
    id:'item'+Date.now(),name:name,icon:icon,imageUrl:imageUrl,desc:desc,
    slot:slot,rareza:rareza,cost:cost,minLevel:minLevel,via:via,
    minAttrs:{fue:parseInt(document.getElementById('ai-rfue').value)||0,int:parseInt(document.getElementById('ai-rint').value)||0,agi:parseInt(document.getElementById('ai-ragi').value)||0,car:parseInt(document.getElementById('ai-rcar').value)||0,sab:parseInt(document.getElementById('ai-rsab').value)||0},
    bonus:{fue:parseInt(document.getElementById('ai-bfue').value)||0,int:parseInt(document.getElementById('ai-bint').value)||0,agi:parseInt(document.getElementById('ai-bagi').value)||0,car:parseInt(document.getElementById('ai-bcar').value)||0,sab:parseInt(document.getElementById('ai-bsab').value)||0}
  };
  shopItems.push(newItem);
  // Límits de compra (opcionals): buit = sense límit
  var _mp=document.getElementById('ai-maxper'),_mt=document.getElementById('ai-maxtotal');
  var perV=(_mp&&_mp.value.trim()!=='')?parseInt(_mp.value)||0:null;
  var totV=(_mt&&_mt.value.trim()!=='')?parseInt(_mt.value)||0:null;
  if(perV!=null||totV!=null)itemLimits[newItem.id]={per:perV,total:totV};
  var _consEl=document.getElementById('ai-consumible');
  if(_consEl&&_consEl.checked)itemConsumable[newItem.id]=true;
  var _durEl=document.getElementById('ai-duration');
  var _durV=(_durEl&&_durEl.value.trim()!=='')?parseInt(_durEl.value)||0:null;
  if(_durV&&_durV>0)itemDuration[newItem.id]=_durV;
  if(CFG.MODE==='supabase'){await saveItemToSupabase(newItem);saveToSupabase();}
  ['ai-name','ai-icon','ai-imageurl','ai-desc','ai-cost','ai-lvl','ai-maxper','ai-maxtotal','ai-duration'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  if(_consEl)_consEl.checked=false;
  ['ai-rfue','ai-rint','ai-ragi','ai-rcar','ai-rsab','ai-bfue','ai-bint','ai-bagi','ai-bcar','ai-bsab'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='0';});
  renderAdminItemsPage();
  renderShop();
}
async function adminChangeVia(itemId, via){
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!item)return;
  item.via=via;
  if(CFG.MODE==='supabase')await saveItemToSupabase(item);
  renderAdminItemsPage();
  renderShop();
}
async function adminDeleteItemFull(itemId){
  if(!confirm('Eliminar aquest ítem?'))return;
  shopItems=shopItems.filter(function(i){return i.id!==itemId;});
  players.forEach(function(p){
    if(p.inventory)p.inventory=p.inventory.filter(function(id){return id!==itemId;});
    if(p.equipped)Object.keys(p.equipped).forEach(function(k){if(p.equipped[k]===itemId)p.equipped[k]=null;});
  });
  if(CFG.MODE==='supabase'){await deleteItemFromSupabase(itemId);await saveToSupabase();}
  renderAdminItemsPage();
  renderShop();
}
/* ══ GESTOR DE CATEGORIES / SLOTS D'EQUIPAMENT ══ */
function equipmentSlots(){return SLOT_DEFS.filter(function(s){return !s.cosmetic;});}
function populateSlotSelects(){
  var opts=equipmentSlots().map(function(s){return '<option value="'+s.key+'">'+(s.icon||'📦')+' '+s.label+'</option>';}).join('');
  var ai=document.getElementById('ai-slot');
  if(ai){var cur=ai.value;ai.innerHTML=opts;if(cur&&equipmentSlots().some(function(s){return s.key===cur;}))ai.value=cur;}
  var withAll='<option value="">Tots els slots</option>'+opts;
  ['ai-filter-slot','shop-filter-slot'].forEach(function(id){var el=document.getElementById(id);if(el){var c=el.value;el.innerHTML=withAll;el.value=c;}});
}
function renderSlotManager(){
  var host=document.getElementById('slot-manager');if(!host)return;
  host.innerHTML=equipmentSlots().map(function(s){
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'
      +'<input type="text" value="'+(s.icon||'📦').replace(/"/g,'&quot;')+'" maxlength="2" title="Icona (emoji)" onchange="setSlotIcon(\''+s.key+'\',this.value)" style="width:44px;flex-shrink:0;padding:6px;font-size:18px;text-align:center;border:2px solid var(--border2);background:var(--bg2);color:var(--text);"/>'
      +'<input type="text" value="'+(s.label||'').replace(/"/g,'&quot;')+'" onchange="renameSlot(\''+s.key+'\',this.value)" style="flex:1;padding:6px 10px;font-size:13px;border:2px solid var(--border2);background:var(--bg2);color:var(--text);"/>'
      +'<button class="btn btn-sm" style="color:var(--coral);border-color:var(--coral-border);" onclick="deleteSlot(\''+s.key+'\')">✕</button>'
      +'</div>';
  }).join('');
}
function slotRefresh(){
  populateSlotSelects();renderSlotManager();
  try{renderInventario();}catch(e){}
  try{renderShop();}catch(e){}
  try{renderAdminItemsPage();}catch(e){}
}
function addSlot(){
  var inp=document.getElementById('new-slot-name');if(!inp)return;
  var label=inp.value.trim();if(!label){toast('Posa un nom');return;}
  var base=label.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'').slice(0,12)||'slot';
  var key=base,n=1;while(SLOT_DEFS.some(function(s){return s.key===key;})){key=base+(n++);}
  SLOT_DEFS.push({key:key,label:label,icon:'📦',pos:{x:20,y:20,w:60,z:5}});
  inp.value='';
  if(CFG.MODE==='supabase')saveToSupabase();
  slotRefresh();
  toast('Categoria afegida');
}
function renameSlot(key,val){
  var s=SLOT_DEFS.find(function(x){return x.key===key;});if(!s)return;
  s.label=(val||'').trim()||s.label;
  if(CFG.MODE==='supabase')saveToSupabase();
  slotRefresh();
}
function setSlotIcon(key,val){
  var s=SLOT_DEFS.find(function(x){return x.key===key;});if(!s)return;
  s.icon=(val||'').trim()||s.icon;
  if(CFG.MODE==='supabase')saveToSupabase();
  slotRefresh();
}
function deleteSlot(key){
  var s=SLOT_DEFS.find(function(x){return x.key===key;});if(!s)return;
  if(!confirm('Eliminar la categoria "'+s.label+'"? Es desequiparà de tots els personatges i els ítems d\'aquesta categoria deixaran de ser equipables.'))return;
  SLOT_DEFS=SLOT_DEFS.filter(function(x){return x.key!==key;});
  players.forEach(function(p){if(p.equipped&&p.equipped[key])p.equipped[key]=null;});
  if(CFG.MODE==='supabase')saveToSupabase();
  slotRefresh();
  toast('Categoria eliminada');
}
function renderAdminItemsPage(){
  renderSlotManager();populateSlotSelects();
  var filterVia=document.getElementById('ai-filter-via')?document.getElementById('ai-filter-via').value:'';
  var filterSlot=document.getElementById('ai-filter-slot')?document.getElementById('ai-filter-slot').value:'';
  var filterRarity=document.getElementById('ai-filter-rarity')?document.getElementById('ai-filter-rarity').value:'';
  var aiSearch=document.getElementById('ai-search')?document.getElementById('ai-search').value.toLowerCase().trim():'';
  var items=shopItems.filter(function(i){
    if(i.isCosmetic)return false;
    if(filterVia&&i.via!==filterVia)return false;
    if(filterSlot&&i.slot!==filterSlot)return false;
    if(filterRarity&&i.rareza!==filterRarity)return false;
    if(aiSearch&&i.name.toLowerCase().indexOf(aiSearch)<0)return false;
    return true;
  }).sort(function(a,b){return (a.name||'').localeCompare(b.name||'');});
  var countEl=document.getElementById('ai-count');
  if(countEl)countEl.textContent=items.length;
  var wrap=document.getElementById('ai-list');
  if(!wrap)return;
  if(!items.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);">No hi ha ítems.</div>';return;}
  wrap.innerHTML=items.map(function(item){
    var viaLabel=item.via==='gacha'?'Només Gacha':item.via==='solo_tienda'?'Només Botiga':'Botiga+Gacha';
    var viaColor=item.via==='gacha'?'var(--accent)':item.via==='solo_tienda'?'var(--teal)':'var(--gold)';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);">'
      +(item.imageUrl?'<img src="'+item.imageUrl+'" style="width:36px;height:36px;object-fit:cover;border-radius:var(--radius);flex-shrink:0;">':'<span style="font-size:22px;width:36px;text-align:center;">'+item.icon+'</span>')
      +'<div style="flex:1;min-width:0;">'
        +'<div style="font-size:13px;font-weight:500;">'+item.name+'</div>'
        +'<div style="font-size:11px;color:var(--muted);">'+item.slot+' · '+item.rareza+' · '+item.cost+' or · Nv.'+item.minLevel+'</div>'
      +'</div>'
      +'<select data-iid="'+item.id+'" onchange="adminChangeVia(this.dataset.iid,this.value)" style="padding:4px 8px;font-size:11px;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:'+viaColor+';">'
        +'<option value="tienda"'+(item.via==='tienda'?' selected':'')+'>Botiga+Gacha</option>'
        +'<option value="gacha"'+(item.via==='gacha'?' selected':'')+'>Només Gacha</option>'
        +'<option value="solo_tienda"'+(item.via==='solo_tienda'?' selected':'')+'>Només Botiga</option>'
      +'</select>'
      +'<button class="btn btn-sm" style="flex-shrink:0;margin-right:4px;" data-iid="'+item.id+'" onclick="openAdminEditItem(this.dataset.iid)">✏️</button>'
      +'<button class="btn btn-sm" style="background:var(--coral-bg);color:var(--coral);border-color:var(--coral-border);flex-shrink:0;" data-iid="'+item.id+'" onclick="adminDeleteItemFull(this.dataset.iid)">🗑️</button>'
      +'</div>';
  }).join('');
}

var _adminEditType=null, _adminEditId=null;
function defaultSlotPos(slot){return slotDefaultPos(slot);}
function openAdminEditItem(itemId){
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!item)return;
  _adminEditType='item';_adminEditId=itemId;
  document.getElementById('aem-title').textContent='Editar Ítem: '+item.name;
  document.getElementById('aem-fields').innerHTML=
    '<div class="field"><label>Nom</label><input type="text" id="aem-name" value="'+item.name+'"/></div>'
    +'<div class="field"><label>Icona (emoji)</label><input type="text" id="aem-icon" value="'+(item.icon||'')+'" maxlength="2"/></div>'
    +'<div class="field"><label>URL Imatge</label><input type="text" id="aem-imageurl" value="'+(item.imageUrl||'')+'"/></div>'
    +'<div class="field"><label>Descripció</label><input type="text" id="aem-desc" value="'+(item.desc||'')+'"/></div>'
    +'<div class="stitle" style="margin-top:10px;">Posició i mida al avatar (%)</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">'
    +'<div class="field" style="margin:0;"><label>X (esq.)</label><input type="number" id="aem-px" value="'+((item.avatarPos&&item.avatarPos.x)!=null?item.avatarPos.x:defaultSlotPos(item.slot).x)+'"/></div>'
    +'<div class="field" style="margin:0;"><label>Y (dalt)</label><input type="number" id="aem-py" value="'+((item.avatarPos&&item.avatarPos.y)!=null?item.avatarPos.y:defaultSlotPos(item.slot).y)+'"/></div>'
    +'<div class="field" style="margin:0;"><label>Amplada</label><input type="number" id="aem-pw" value="'+((item.avatarPos&&item.avatarPos.w)!=null?item.avatarPos.w:defaultSlotPos(item.slot).w)+'"/></div>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-top:2px;">X/Y=posició des de dalt-esquerra, Amplada=mida. Deixa buit per usar la posició del slot.</div>'
    +'<div class="g2">'
    +'<div class="field"><label>Slot</label><select id="aem-slot">'+SLOT_DEFS.filter(function(s){return !s.cosmetic;}).map(function(s){return '<option value="'+s.key+'"'+(item.slot===s.key?' selected':'')+'>'+s.icon+' '+s.label+'</option>';}).join('')+'<option value="cosmetic"'+((item.isCosmetic||item.slot==='cosmetic'||/^cosm/.test(item.slot||''))?' selected':'')+'>✨ Cosmètic</option></select></div>'
    +'<div class="field"><label>Raresa</label><select id="aem-rarity"><option value="comun"'+(item.rareza==='comun'?' selected':'')+'>Comú</option><option value="rara"'+(item.rareza==='rara'?' selected':'')+'>Rara</option><option value="epica"'+(item.rareza==='epica'?' selected':'')+'>Èpica</option><option value="legendaria"'+(item.rareza==='legendaria'?' selected':'')+'>Llegendària</option></select></div>'
    +'<div class="field"><label>Cost (or)</label><input type="number" id="aem-cost" value="'+(item.cost||0)+'"/></div>'
    +'<div class="field"><label>Nivell mínim</label><input type="number" id="aem-lvl" value="'+(item.minLevel||1)+'"/></div>'
    +'</div>'
    +'<div class="field"><label>Disponible a</label><select id="aem-via"><option value="tienda"'+(item.via==='tienda'?' selected':'')+'>Botiga+Gacha</option><option value="gacha"'+(item.via==='gacha'?' selected':'')+'>Només Gacha</option><option value="solo_tienda"'+(item.via==='solo_tienda'?' selected':'')+'>Només Botiga</option></select></div>'
    +'<div class="stitle" style="margin-top:10px;">Límits de compra (buit = sense límit)</div>'
    +'<div class="g2">'
    +'<div class="field"><label>Màx per persona</label><input type="number" id="aem-maxper" min="1" value="'+((itemLim(item.id).per!=null&&itemLim(item.id).per!=='')?itemLim(item.id).per:'')+'"/></div>'
    +'<div class="field"><label>Stock total</label><input type="number" id="aem-maxtotal" min="1" value="'+((itemLim(item.id).total!=null&&itemLim(item.id).total!=='')?itemLim(item.id).total:'')+'"/></div>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--muted);">Comprat fins ara: total '+itemBoughtTotal(item.id)+(itemLim(item.id).total?(' / '+itemLim(item.id).total):'')+'. <span style="color:var(--accent);cursor:pointer;" onclick="resetItemPurchases(\''+item.id+'\')">↺ Reiniciar comptador</span></div>'
    +'<div class="field" style="margin-top:10px;display:flex;align-items:center;gap:8px;"><label style="margin:0;cursor:pointer;"><input type="checkbox" id="aem-consumible"'+(isConsumable(item.id)?' checked':'')+' style="vertical-align:middle;margin-right:6px;"/>🍴 Consumible (desapareix en usar-lo)</label></div>'
    +'<div class="field"><label>⏳ Durada en dies (buit = permanent · compta des que s\'obté)</label><input type="number" id="aem-duration" min="1" value="'+(itemDur(item.id)||'')+'"/></div>'
    +'<div class="stitle" style="margin-top:10px;">Requisits mínims per comprar (0 = sense requisit)</div>'
    +'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">'
    +attrKeys().map(function(k){return '<div class="field" style="margin:0;"><label>'+k.toUpperCase()+'</label><input type="number" id="aem-r'+k+'" value="'+((item.minAttrs&&item.minAttrs[k])||0)+'" min="0"/></div>';}).join('')
    +'</div>'
    +'<div class="stitle" style="margin-top:10px;">Bonus d\'atributs en equipar (0 = sense bonus)</div>'
    +'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">'
    +attrKeys().map(function(k){return '<div class="field" style="margin:0;"><label>+'+k.toUpperCase()+'</label><input type="number" id="aem-b'+k+'" value="'+((item.bonus&&item.bonus[k])||0)+'" min="0"/></div>';}).join('')
    +'</div>';
  document.getElementById('modal-admin-edit').style.display='flex';
}
function openAdminEditCarta(cartaId){
  var carta=gachaCards.find(function(c){return c.id===cartaId;});
  if(!carta)return;
  _adminEditType='carta';_adminEditId=cartaId;
  document.getElementById('aem-title').textContent='Editar Carta: '+carta.name;
  document.getElementById('aem-fields').innerHTML=
    '<div class="field"><label>Nom</label><input type="text" id="aem-name" value="'+carta.name+'"/></div>'
    +'<div class="field"><label>Raresa</label><select id="aem-rarity"><option value="comun"'+(carta.rarity==='comun'?' selected':'')+'>Comú</option><option value="rara"'+(carta.rarity==='rara'?' selected':'')+'>Rara</option><option value="epica"'+(carta.rarity==='epica'?' selected':'')+'>Èpica</option><option value="legendaria"'+(carta.rarity==='legendaria'?' selected':'')+'>Llegendària</option></select></div>'
    +'<div class="field"><label>URL Imatge</label><input type="text" id="aem-imageurl" value="'+(carta.imageUrl||'')+'"/></div>'
    +'<div class="field"><label>Descripció</label><input type="text" id="aem-desc" value="'+(carta.description||'')+'"/></div>';
  document.getElementById('modal-admin-edit').style.display='flex';
}
function closeAdminEditModal(){
  document.getElementById('modal-admin-edit').style.display='none';
  _adminEditType=null;_adminEditId=null;
}
async function saveAdminEdit(){
  if(_adminEditType==='item'){
    var item=shopItems.find(function(i){return i.id===_adminEditId;});
    if(!item)return;
    item.name=document.getElementById('aem-name').value.trim()||item.name;
    item.icon=document.getElementById('aem-icon').value.trim()||item.icon;
    item.imageUrl=document.getElementById('aem-imageurl').value.trim()||null;
    item.desc=document.getElementById('aem-desc').value.trim();
    item.slot=document.getElementById('aem-slot').value;
    item.isCosmetic=(item.slot==='cosmetic');
    item.rareza=document.getElementById('aem-rarity').value;
    item.cost=parseInt(document.getElementById('aem-cost').value)||0;
    item.minLevel=parseInt(document.getElementById('aem-lvl').value)||1;
    item.via=document.getElementById('aem-via').value;
    var _px=document.getElementById('aem-px'),_py=document.getElementById('aem-py'),_pw=document.getElementById('aem-pw');
    item.avatarPos={x:parseFloat(_px.value)||0,y:parseFloat(_py.value)||0,w:parseFloat(_pw.value)||60};
    item.minAttrs={};attrKeys().forEach(function(k){var el=document.getElementById('aem-r'+k);item.minAttrs[k]=el?(parseInt(el.value)||0):0;});
    item.bonus={};attrKeys().forEach(function(k){var el=document.getElementById('aem-b'+k);item.bonus[k]=el?(parseInt(el.value)||0):0;});
    // Límits de compra
    var _mp=document.getElementById('aem-maxper'),_mt=document.getElementById('aem-maxtotal');
    var perV=(_mp&&_mp.value.trim()!=='')?parseInt(_mp.value)||0:null;
    var totV=(_mt&&_mt.value.trim()!=='')?parseInt(_mt.value)||0:null;
    if(perV==null&&totV==null)delete itemLimits[item.id];
    else itemLimits[item.id]={per:perV,total:totV};
    var _consEl=document.getElementById('aem-consumible');
    if(_consEl){if(_consEl.checked)itemConsumable[item.id]=true;else delete itemConsumable[item.id];}
    var _durEl=document.getElementById('aem-duration');
    if(_durEl){var _dv=(_durEl.value.trim()!=='')?parseInt(_durEl.value)||0:0;if(_dv>0)itemDuration[item.id]=_dv;else delete itemDuration[item.id];}
    if(CFG.MODE==='supabase'){saveItemToSupabase(item);saveToSupabase();}
    renderAdminItemsPage();renderShop();
  }else if(_adminEditType==='carta'){
    var carta=gachaCards.find(function(c){return c.id===_adminEditId;});
    if(!carta)return;
    carta.name=document.getElementById('aem-name').value.trim()||carta.name;
    carta.rarity=document.getElementById('aem-rarity').value;
    carta.imageUrl=document.getElementById('aem-imageurl').value.trim()||'';
    carta.description=document.getElementById('aem-desc').value.trim();
    await saveCartaToSupabase(carta);
    renderAdminCartasPage();
  }
  closeAdminEditModal();
}
function renderCustomTraitsAdmin(){
  // Rellenar select de slots
  // Rellenar grid de requisitos (los cosméticos no dan stats, solo se compran)
  var reqs=document.getElementById('cu-reqs');
  if(reqs)reqs.innerHTML=attrKeys().map(function(k){return '<div class="field" style="margin:0;"><label>'+attrName(k).slice(0,6)+'</label><input type="number" id="cu-r'+k+'" value="0" min="0"/></div>';}).join('');
  // Lista de cosméticos existentes
  var list=document.getElementById('cu-list');
  var cosmetics=shopItems.filter(function(i){return i.isCosmetic;});
  var cnt=document.getElementById('cu-count');if(cnt)cnt.textContent=cosmetics.length;
  if(!list)return;
  if(!cosmetics.length){list.innerHTML='<div style="font-size:13px;color:var(--muted);padding:1rem;">Encara no hi ha cosmètics. Crea\'n un a dalt.</div>';return;}
  list.innerHTML=cosmetics.map(function(item){
    var sl=SLOT_DEFS.find(function(s){return s.key===item.slot;});
    var viaLabel=item.via==='gacha'?'🎲 Només Gacha':item.via==='solo_tienda'?'🛒 Només Botiga':'🛒+🎲 Botiga i Gacha';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px;border:0.5px solid var(--border);border-radius:var(--radius);margin-bottom:6px;">'
      +(item.imageUrl?'<img src="'+item.imageUrl+'" style="width:40px;height:40px;object-fit:contain;background:var(--bg3);border-radius:var(--radius);flex-shrink:0;"/>':'<span style="font-size:24px;width:40px;text-align:center;">'+(item.icon||'📦')+'</span>')
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:13px;font-weight:500;">'+item.name+'</div>'
      +'<div style="font-size:11px;color:var(--muted);">'+(sl?sl.icon+' '+sl.label:item.slot)+' · '+item.rareza+' · <span class="coin"></span> '+item.cost+' · '+viaLabel+'</div>'
      +'</div>'
      +'<button class="btn btn-sm" onclick="openAdminEditItem(\''+item.id+'\')">✎</button>'
      +'<button class="btn btn-sm" style="color:var(--coral);border-color:var(--coral-border);" onclick="adminDeleteItemFull(\''+item.id+'\')">✕</button>'
      +'</div>';
  }).join('');
}
async function createCosmetic(){
  var name=document.getElementById('cu-name').value.trim();
  if(!name){toast('Posa un nom');return;}
  var minAttrs={};attrKeys().forEach(function(k){var el=document.getElementById('cu-r'+k);minAttrs[k]=el?(parseInt(el.value)||0):0;});
  var newItem={
    id:'cosm'+Date.now(),
    name:name,
    icon:document.getElementById('cu-icon').value.trim()||'✨',
    imageUrl:document.getElementById('cu-imageurl').value.trim()||null,
    desc:'',
    slot:'cosmetic',
    rareza:document.getElementById('cu-rarity').value,
    cost:parseInt(document.getElementById('cu-cost').value)||0,
    minLevel:parseInt(document.getElementById('cu-lvl').value)||1,
    via:document.getElementById('cu-via').value,
    minAttrs:minAttrs,
    bonus:{},
    avatarPos:{x:20,y:20,w:60,z:10},
    isCosmetic:true
  };
  shopItems.push(newItem);
  if(CFG.MODE==='supabase')await saveItemToSupabase(newItem);
  ['cu-name','cu-icon','cu-imageurl','cu-cost'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('cu-lvl').value='1';
  attrKeys().forEach(function(k){var r=document.getElementById('cu-r'+k);if(r)r.value='0';});
  renderCustomTraitsAdmin();
  renderShop();
  toast('Cosmètic creat');
}
function switchAdminTab(btn, tabId){
  document.querySelectorAll('#page-items-admin .ptab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-items','tab-cartas','tab-custom','tab-consum'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.style.display=id===tabId?'block':'none';
  });
  if(tabId==='tab-cartas')renderAdminCartasPage();
  if(tabId==='tab-custom')renderCustomTraitsAdmin();
  if(tabId==='tab-consum')renderConsumeHistoryAdmin();
}
async function adminCreateCarta(){
  var name=document.getElementById('ac-name').value.trim();
  if(!name){alert('La carta necessita un nom.');return;}
  var carta={
    id:'c'+Date.now(),
    name:name,
    rarity:document.getElementById('ac-rarity').value,
    imageUrl:document.getElementById('ac-imageurl').value.trim()||'',
    description:document.getElementById('ac-desc').value.trim()
  };
  gachaCards.push(carta);
  await saveCartaToSupabase(carta);
  ['ac-name','ac-imageurl','ac-desc'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  renderAdminCartasPage();
}
async function adminDeleteCarta(id){
  if(!confirm('Eliminar aquesta carta?'))return;
  gachaCards=gachaCards.filter(function(c){return c.id!==id;});
  await deleteCartaFromSupabase(id);
  renderAdminCartasPage();
}
function renderAdminCartasPage(){
  var filterRarity=document.getElementById('ac-filter-rarity')?document.getElementById('ac-filter-rarity').value:'';
  var acSearch=document.getElementById('ac-search')?document.getElementById('ac-search').value.toLowerCase().trim():'';
  var cartas=gachaCards.filter(function(c){
    if(filterRarity&&c.rarity!==filterRarity)return false;
    if(acSearch&&c.name.toLowerCase().indexOf(acSearch)<0)return false;
    return true;
  }).sort(function(a,b){return (a.name||'').localeCompare(b.name||'');});
  var countEl=document.getElementById('ac-count');
  if(countEl)countEl.textContent=cartas.length;
  var wrap=document.getElementById('ac-list');
  if(!wrap)return;
  if(!cartas.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);">No hi ha cartes.</div>';return;}
  var rarityColor={comun:'var(--muted)',rara:'var(--teal)',epica:'var(--accent)',legendaria:'var(--gold)'};
  wrap.innerHTML=cartas.map(function(carta){
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);">'
      +(carta.imageUrl?'<img src="'+carta.imageUrl+'" style="width:36px;height:50px;object-fit:cover;border-radius:var(--radius);flex-shrink:0;">':'<div style="width:36px;height:50px;background:var(--bg3);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:18px;"></div>')
      +'<div style="flex:1;min-width:0;">'
        +'<div style="font-size:13px;font-weight:500;">'+carta.name+'</div>'
        +'<div style="font-size:11px;color:'+(rarityColor[carta.rarity]||'var(--muted)')+';">'+RARITY_LABEL[carta.rarity]+(carta.description?' · '+carta.description:'')+'</div>'
      +'</div>'
      +'<button class="btn btn-sm" style="flex-shrink:0;margin-right:4px;" data-cid="'+carta.id+'" onclick="openAdminEditCarta(this.dataset.cid)">✏️</button>'
      +'<button class="btn btn-sm" style="background:var(--coral-bg);color:var(--coral);border-color:var(--coral-border);flex-shrink:0;" data-cid="'+carta.id+'" onclick="adminDeleteCarta(this.dataset.cid)">🗑️</button>'
      +'</div>';
  }).join('');
}
function initCalFilterBtns(){
  ['all','personal','team','mission'].forEach(function(k){
    var b=document.getElementById('cal-filter-'+k);
    if(b)b.classList.toggle('btn-p',k===calState.filter);
  });
}

function renderCalendar(){
  initCalFilterBtns();
  var yr=calState.year,mo=calState.month,selD=calState.selectedDate,fil=calState.filter;
  var today=new Date();
  var todayStr=formatDate(today);
  var firstDay=new Date(yr,mo,1);
  var lastDay=new Date(yr,mo+1,0);
  var startDow=(firstDay.getDay()+6)%7;
  var mnames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var lbl=document.getElementById('cal-month-label');
  if(lbl)lbl.textContent=mnames[mo]+' '+yr;
  var grid=document.getElementById('cal-grid');
  if(!grid)return;
  var dows=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var html=dows.map(function(d){return '<div class="cal-dow">'+d+'</div>';}).join('');
  var prevLast=new Date(yr,mo,0).getDate();
  for(var i=startDow-1;i>=0;i--){
    html+='<div class="cal-day other-month"><div class="cal-day-num">'+(prevLast-i)+'</div></div>';
  }
  for(var day=1;day<=lastDay.getDate();day++){
    var ds=yr+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    var isToday=ds===todayStr;
    var isSel=ds===selD;
    var dayEvs=getFilteredEvents(fil).filter(function(e){return e.date===ds;});
    var evHtml=dayEvs.slice(0,3).map(function(ev){
      return '<div class="cal-event '+ev.type+'" onclick="event.stopPropagation();openEventModal(\"'+ev.id+'\")" title="'+ev.title+'">'+ev.title+'</div>';
    }).join('')+(dayEvs.length>3?'<div class="cal-more">+'+(dayEvs.length-3)+' más</div>':'');
    var cls='cal-day'+(isToday?' today':'')+(isSel?' selected':'');
    var numHtml=isToday?'<span style="background:var(--accent);color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;">'+day+'</span>':day;
    html+='<div class="'+cls+'" onclick="selectCalDay(\"'+ds+'\")">'
      +'<div class="cal-day-num">'+numHtml+'</div>'+evHtml+'</div>';
  }
  var total=startDow+lastDay.getDate();
  var rem=total%7===0?0:7-(total%7);
  for(var pd=1;pd<=rem;pd++){
    html+='<div class="cal-day other-month"><div class="cal-day-num">'+pd+'</div></div>';
  }
  grid.innerHTML=html;
  renderDayEvents(selD||todayStr);
  renderUpcoming();
}

function formatDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

function getFilteredEvents(filter){
  const pid=session.playerId;
  return calEvents.filter(e=>{
    if(filter==='personal')return e.type==='personal'&&(e.ownerId===pid||session.isAdmin);
    if(filter==='team')return e.type==='team';
    if(filter==='mission')return !!e.missionId;
    return e.type==='team'||(e.type==='personal'&&(e.ownerId===pid||session.isAdmin));
  });
}

function selectCalDay(dateStr){
  calState.selectedDate=dateStr;
  renderCalendar();
}

function eventItemHTML(e){
  var typeColor=e.type==='team'?'var(--teal)':'var(--accent)';
  var d=document.createElement('div');
  d.style.cssText='display:flex;align-items:center;gap:8px;padding:8px;border-radius:var(--radius);cursor:pointer;border-left:3px solid '+typeColor+';background:var(--bg3);margin-bottom:6px;';
  d.addEventListener('click',function(){openEventModal(e.id);});
  d.innerHTML='<div style="font-size:11px;color:var(--muted);min-width:42px;">'+(e.time||'')+'</div>'
    +'<div style="font-size:12px;font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e.title+'</div>';
  return d.outerHTML;
}
function renderDayEvents(dateStr){
  const wrap=document.getElementById('cal-day-events');
  const lbl=document.getElementById('cal-selected-label');
  if(!wrap)return;
  const d=new Date(dateStr+'T00:00:00');
  const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  if(lbl)lbl.textContent=days[d.getDay()]+' '+d.getDate()+' '+months[d.getMonth()];
  const evs=getFilteredEvents(calState.filter).filter(e=>e.date===dateStr);
  if(!evs.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sense esdeveniments.</div>';return;}
  wrap.innerHTML=evs.map(e=>eventItemHTML(e)).join('');
}

function renderUpcoming(){
  const wrap=document.getElementById('cal-upcoming');
  if(!wrap)return;
  const today=formatDate(new Date());
  const upcoming=getFilteredEvents(calState.filter).filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  if(!upcoming.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sense esdeveniments propers.</div>';return;}
  wrap.innerHTML=upcoming.map(e=>eventItemHTML(e)).join('');
}

function calNav(dir){
  if(dir===0){calState.year=new Date().getFullYear();calState.month=new Date().getMonth();}
  else{calState.month+=dir;if(calState.month>11){calState.month=0;calState.year++;}else if(calState.month<0){calState.month=11;calState.year--;}}
  renderCalendar();
}

function setCalFilter(f,btn){
  calState.filter=f;
  ['all','personal','team','mission'].forEach(k=>{const b=document.getElementById('cal-filter-'+k);if(b)b.classList.toggle('btn-p',k===f);});
  renderCalendar();
}

function openEventModal(eventId){
  calState.editingEventId=eventId;
  const modal=document.getElementById('cal-event-modal');
  const e=eventId?calEvents.find(ev=>ev.id===eventId):null;
  document.getElementById('cal-modal-title').textContent=e?'Editar esdeveniment':'Nou esdeveniment';
  document.getElementById('ev-title').value=e?e.title:'';
  document.getElementById('ev-date').value=e?e.date:(calState.selectedDate||formatDate(new Date()));
  document.getElementById('ev-time').value=e?e.time:'09:00';
  document.getElementById('ev-desc').value=e?e.desc:'';
  document.getElementById('ev-type').value=e?e.type:'personal';
  // Populate missions select
  const msel=document.getElementById('ev-mission');
  msel.innerHTML='<option value="">Sense vincular</option>'+missions.map(m=>'<option value="'+m.id+'"'+(e&&e.missionId===m.id?' selected':'')+'>'+m.name+'</option>').join('');
  // Show delete only for owner or admin
  const delWrap=document.getElementById('ev-delete-wrap');
  if(delWrap)delWrap.style.display=(e&&(session.isAdmin||e.ownerId===session.playerId))?'block':'none';
  modal.classList.add('show');
}

function closeEventModal(){document.getElementById('cal-event-modal').classList.remove('show');}

function saveEvent(){
  const title=document.getElementById('ev-title').value.trim();
  if(!title){toast('L\'esdeveniment necessita un títol.');return;}
  const ev={
    id:calState.editingEventId||('ev'+Date.now()),
    title,
    date:document.getElementById('ev-date').value,
    time:document.getElementById('ev-time').value,
    desc:document.getElementById('ev-desc').value.trim(),
    type:document.getElementById('ev-type').value,
    missionId:document.getElementById('ev-mission').value,
    ownerId:calState.editingEventId?(calEvents.find(e=>e.id===calState.editingEventId)||{}).ownerId||session.playerId:session.playerId,
  };
  if(calState.editingEventId){
    const idx=calEvents.findIndex(e=>e.id===calState.editingEventId);
    if(idx>=0)calEvents[idx]=ev;else calEvents.push(ev);
  }else{calEvents.push(ev);}
  if(CFG.MODE==='supabase')saveToSupabase();
  closeEventModal();renderCalendar();
}

function deleteEvent(){
  if(!calState.editingEventId)return;
  if(!confirm('Esborrar aquest esdeveniment?'))return;
  calEvents=calEvents.filter(e=>e.id!==calState.editingEventId);
  if(CFG.MODE==='supabase')saveToSupabase();
  closeEventModal();renderCalendar();
}




/* ══ PLANNER IMPORT ══ */
let plannerRows=[];
let plannerHeaders=[];

// Decodifica el temps de la columna "Depósito" (emojis-dígit tipus 0️⃣:1️⃣5️⃣) → hores decimals.
// Els emojis-teclat són dígit ASCII + U+FE0F + U+20E3; treiem els modificadors i queda "0:15".
function plannerParseHours(raw){
  if(raw==null)return 0;
  var s=(''+raw).replace(/[️⃣]/g,'').trim();
  var m=s.match(/(\d+)\s*[:hH]\s*(\d+)/);      // format h:mm
  if(m)return parseInt(m[1],10)+parseInt(m[2],10)/60;
  var only=s.match(/\d+/);                       // un sol número → minuts
  if(only)return parseInt(only[0],10)/60;
  return 0;
}
// Compta les estrelles (⭐ = U+2B50) a la columna "Etiquetas". Màxim 5.
function plannerCountStars(raw){
  if(!raw)return 0;
  var m=(''+raw).match(/⭐/g);
  return m?Math.min(5,m.length):0;
}
// Oro = hores × (estrelles × 20%). 5★=100% … 1★=20%. Sense temps o sense estrelles → 0. Arrodonit a 2 decimals.
function plannerGoldFor(row){
  var hours=plannerParseHours(row['Depósito']!=null?row['Depósito']:row['Deposito']);
  var stars=plannerCountStars(row['Etiquetas']!=null?row['Etiquetas']:row['Etiquetes']);
  if(hours<=0||stars<=0)return 0;
  return Math.round(hours*(stars/5)*100)/100;
}

function showPage_planner(){
  renderPlannerImported();
}

function plannerDragOver(e){
  e.preventDefault();
  document.getElementById('planner-drop').style.borderColor='var(--accent)';
}

function plannerDrop(e){
  e.preventDefault();
  document.getElementById('planner-drop').style.borderColor='var(--border2)';
  var file=e.dataTransfer.files[0];
  if(file)parsePlannerFile(file);
}

function plannerFileSelected(input){
  var file=input.files[0];
  if(file)parsePlannerFile(file);
}

function parsePlannerFile(file){
  var name=file.name.toLowerCase();
  if(name.endsWith('.csv')){
    var reader=new FileReader();
    reader.onload=function(e){parsePlannerCSV(e.target.result);};
    reader.readAsText(file,'UTF-8');
  } else if(name.endsWith('.xlsx')||name.endsWith('.xls')){
    var reader=new FileReader();
    reader.onload=function(e){parsePlannerExcel(e.target.result);};
    reader.readAsArrayBuffer(file);
  } else {
    toast('Format no admès. Usa .csv o .xlsx');
  }
}

function parsePlannerCSV(text){
  var lines=text.split(/\r\n|\n|\r/).filter(function(l){return l.trim();});
  if(!lines.length){return;}
  var sep=lines[0].includes('	')?'	':(lines[0].split(';').length>lines[0].split(',').length?';':',');
  plannerHeaders=lines[0].split(sep).map(function(h){return h.replace(/^"|"$/g,'').trim();});
  function splitLine(line){
    var cols=[],cur='',inQ=false;
    for(var i=0;i<line.length;i++){
      var ch=line[i];
      if(ch==='"'&&!inQ){inQ=true;}
      else if(ch==='"'&&inQ&&line[i+1]==='"'){cur+='"';i++;}
      else if(ch==='"'&&inQ){inQ=false;}
      else if(ch===sep&&!inQ){cols.push(cur.trim());cur='';}
      else{cur+=ch;}
    }
    cols.push(cur.trim());
    return cols;
  }
  plannerRows=lines.slice(1).map(function(line){
    var cols=splitLine(line);
    var row={};
    plannerHeaders.forEach(function(h,i){row[h]=(cols[i]||'').replace(/^"|"$/g,'').trim();});
    return row;
  }).filter(function(r){return Object.values(r).some(function(v){return v;});});
  showPlannerPreview();
}

function parsePlannerExcel(buffer){
  if(typeof XLSX==='undefined'){
    var _d=document.getElementById('planner-drop');
    if(_d)_d.innerHTML='<div style="font-size:14px;color:var(--muted);">Carregant el lector d\'Excel…</div>';
    _ensureXLSX().then(function(){parsePlannerExcel(buffer);}).catch(function(){
      if(_d)_d.innerHTML='<div style="font-size:14px;color:var(--coral);">⚠️ No s\'ha pogut carregar el lector d\'Excel. Comprova la connexió i torna-ho a provar (o exporta com a CSV).</div>';
    });
    return;
  }
  try{
    var wb=XLSX.read(new Uint8Array(buffer),{type:'array'});
    // Preferim la fulla "Datos consolidados" (conté temps + etiquetes); si no, "Tareas"; si no, la primera
    var _pref=['Datos consolidados','Dades consolidades','Tareas','Tasques'];
    var sheetName=wb.SheetNames[0];
    for(var _pi=0;_pi<_pref.length;_pi++){if(wb.SheetNames.indexOf(_pref[_pi])>=0){sheetName=_pref[_pi];break;}}
    var ws=wb.Sheets[sheetName];
    var matrix=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,blankrows:false});
    if(!matrix.length){toast('La fulla "'+sheetName+'" està buida.');return;}
    // Primera fila amb contingut = capçaleres
    var hdrIdx=0;
    for(var i=0;i<matrix.length;i++){if(matrix[i].some(function(c){return (''+c).trim();})){hdrIdx=i;break;}}
    plannerHeaders=matrix[hdrIdx].map(function(h){return (''+h).trim();});
    plannerRows=matrix.slice(hdrIdx+1).map(function(cols){
      var row={};plannerHeaders.forEach(function(h,i){if(h)row[h]=(''+(cols[i]!=null?cols[i]:'')).trim();});
      return row;
    }).filter(function(r){return Object.values(r).some(function(v){return v;});});
    showPlannerPreview();
  }catch(e){
    console.error('Excel parse error',e);
    toast('Error llegint l\'Excel. Prova a exportar-lo com a CSV.');
  }
}

function showPlannerPreview(){
  if(!plannerRows.length){toast('No s\'han trobat tasques al fitxer.');return;}
  document.getElementById('planner-preview').style.display='block';
  document.getElementById('planner-preview-title').textContent='Previsualització — '+plannerRows.length+' tasques trobades';

  // Mapeo FIJO — el CSV de Planner siempre tiene el mismo formato
  // Columnas: Nombre de la tarea, Depósito, Estado, Priority, Asignado a, Creado por, Fecha de vencimiento, Etiquetas, Notas
  var table=document.getElementById('planner-table');
  var cols=['Nombre de la tarea','Depósito','Estado','Priority','Asignado a','Creado por','Fecha de vencimiento','Etiquetas'];
  // Only show columns that actually exist
  cols=cols.filter(function(col){return plannerHeaders.indexOf(col)>=0;});
  if(!cols.length)cols=plannerHeaders.slice(0,6);
  var thGold='<th style="text-align:right;padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:11px;color:var(--gold);font-weight:600;">Or (calc.)</th>';
  table.innerHTML='<thead><tr>'+cols.map(function(h){
    return '<th style="text-align:left;padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:11px;color:var(--muted);font-weight:500;">'+_esc(h)+'</th>';
  }).join('')+thGold+'</tr></thead><tbody>'+plannerRows.slice(0,10).map(function(row){
    var _g=plannerGoldFor(row);var _st=plannerCountStars(row['Etiquetas']);var _h=plannerParseHours(row['Depósito']);
    var tdGold='<td title="'+(_h?_h.toFixed(2)+'h × '+_st+'★':'sense temps/estrelles')+'" style="padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:12px;text-align:right;font-weight:600;color:'+(_g>0?'var(--gold)':'var(--muted)')+';">'+_g+'</td>';
    return '<tr>'+cols.map(function(h){
      return '<td style="padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:12px;color:var(--text);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+_esc(row[h]||'')+'</td>';
    }).join('')+tdGold+'</tr>';
  }).join('')+'</tbody>';
}

function confirmPlannerImport(){
  // Mapeo FIJO — formato estándar de exportación de Planner
  var titleCol='Nombre de la tarea';
  var bucketCol='Depósito';
  var statusCol='Estado';
  var assignCol='Asignado a';
  var creatorCol='Creado por';
  var deadlineCol='Fecha de vencimiento';
  var tagsCol='Etiquetas';
  var notesCol='Notas';

  var DEFAULT_DIFF='C';
  var imported=0;
  var autoClaimed=0;

  plannerRows.forEach(function(row){
    var title=(row[titleCol]||'').trim();
    if(!title)return;

    // Evitar duplicats: id derivat del títol COMPLET (abans es truncava a 30 → col·lisions)
    var existingId='planner_'+title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    if(missions.find(function(m){return m.plannerId===existingId;}))return;

    // Map status — només 2 estats: completada o pendent
    var plannerStatus=(row[statusCol]||'').toLowerCase();
    var status=(plannerStatus.includes('complet')||plannerStatus.includes('done')||plannerStatus.includes('acabad')||plannerStatus.includes('finalitz'))?'done':'pending';

    // Assignar per "Creado por" = nom real del personatge (ex: "Pol Figuerola" → personatge amb realName "Pol Figuerola")
    var creatorName=(row[creatorCol]||'').trim();
    var assigneeName=(row[assignCol]||'').trim(); // es guarda per referència
    // Ignora accents/diacrítics (à→a, ï→i, ç→c...) i majúscules per emparellar noms
    function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();}
    var cn=norm(creatorName);
    var assignedPlayer=players.find(function(p){return p.realName&&cn&&norm(p.realName)===cn;})
      ||players.find(function(p){return p.realName&&cn&&(norm(p.realName).indexOf(cn)>=0||cn.indexOf(norm(p.realName))>=0);});

    // Grau de PRIORITAT (només etiqueta, no afecta recompensa). Es desa a "diff" per compatibilitat.
    var priorityMap={'urgente':'A','importante':'B','media':'C','baja':'D'};
    var taskPriority=(row['Priority']||row['Prioridad']||'').toLowerCase().trim();
    var taskDiff=priorityMap[taskPriority]||DEFAULT_DIFF;

    // OR: es calcula pel temps (columna C "Depósito") × estrelles (columna R "Etiquetas").
    // 5★=100% … 1★=20% · 1 or = 1 hora a 5★. Sense temps o estrelles → 0. XP i fragments són fixos.
    var plGold=plannerGoldFor(row);

    // Build description: Notas + Etiquetas + Creado por + Asignado
    var notes=(row[notesCol]||'').trim();
    var tags=(row[tagsCol]||'').trim();
    var creator=(row[creatorCol]||'').trim();

    var newM={
      id:'planner_'+Date.now()+'_'+imported,
      name:title,
      desc:notes,
      arc:'General',
      playerId:assignedPlayer?assignedPlayer.id:'',
      status:status,
      diff:taskDiff,
      xp:MISSION_XP,
      gold:plGold,
      frag:MISSION_FRAG,
      attr:'Intel·ligència',attrPts:2,
      deadline:row[deadlineCol]||'',
      daily:false,isDaily_instance:false,
      plannerId:existingId,
      createdBy:session.playerId,
      fromPlanner:true,
      plannerCreator:creator,
      plannerAssignee:assigneeName,
      plannerTags:tags
    };
    missions.push(newM);
    // Si ja està feta: recompensa reclamada AUTOMÀTICAMENT al jugador assignat.
    // Si no hi ha ningú assignat (no s'ha pogut emparellar "Creado por"), queda pendent de reclamar.
    if(status==='done'){
      if(assignedPlayer){awardMissionTo(assignedPlayer,newM);autoClaimed++;}
      else{rewardsPending[newM.id]=true;}
    }
    imported++;
  });

  if(CFG.MODE==='supabase')saveToSupabase();
  clearPlannerImport();
  renderAll();
  renderPlannerImported();
  document.getElementById('planner-imported').style.display='block';
  toast(imported+' missions importades'+(autoClaimed?(' · '+autoClaimed+' recompenses reclamades automàticament'):''));
}

function clearPlannerImport(){
  plannerRows=[];plannerHeaders=[];
  document.getElementById('planner-preview').style.display='none';
  document.getElementById('planner-file').value='';
  var drop=document.getElementById('planner-drop');
  if(drop)drop.innerHTML='<div style="font-size:32px;margin-bottom:8px;">📂</div><div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px;">Arrossega el teu fitxer aquí</div><div style="font-size:12px;color:var(--muted);">o fes clic per seleccionar — .xlsx, .csv</div><input type="file" id="planner-file" accept=".csv,.xlsx,.xls" style="display:none;" onchange="plannerFileSelected(this)"/>';
}

function saveAttrNames(){
  ATTRS.forEach(function(a){
    var el=document.getElementById('an-'+a.key);
    if(el&&el.value.trim())a.name=el.value.trim();
    var ic=document.getElementById('ai-'+a.key);
    if(ic&&ic.value.trim())a.icon=ic.value.trim();
    var co=document.getElementById('ac-'+a.key);
    if(co&&co.value)a.color=co.value;
  });
  normalizeAttrs();
  persistAttrs();
  if(CFG.MODE==='supabase')saveToSupabase();
  try{renderClassesAdmin();renderAll();}catch(e){console.error(e);}
  toast('Atributs actualitzats');
}
function addAttr(){
  // Guardar nombres actuales antes de re-render
  ATTRS.forEach(function(a){var el=document.getElementById('an-'+a.key);if(el&&el.value.trim())a.name=el.value.trim();var ic=document.getElementById('ai-'+a.key);if(ic&&ic.value.trim())a.icon=ic.value.trim();var co=document.getElementById('ac-'+a.key);if(co&&co.value)a.color=co.value;});
  var n=1;var key;
  do{key='a'+n;n++;}while(ATTRS.some(function(a){return a.key===key;}));
  var color=ATTR_COLORS[ATTRS.length%ATTR_COLORS.length];
  ATTRS.push({key:key,name:'Nou atribut',color:color,icon:'⭐'});
  // Añadir el campo a todos los jugadores y clases con valor base
  players.forEach(function(p){if(p.attrs&&p.attrs[key]===undefined)p.attrs[key]=10;});
  CLASSES.forEach(function(cl){if(cl.attrs&&cl.attrs[key]===undefined)cl.attrs[key]=1;});
  persistAttrs();
  renderClassesAdmin();
  toast('Atribut afegit');
}
function removeAttr(key){
  if(ATTRS.length<=1){toast('Ha d\'haver almenys un atribut');return;}
  if(!confirm('Segur que vols treure aquest atribut? Es perdrà a tots els personatges.'))return;
  ATTRS=ATTRS.filter(function(a){return a.key!==key;});
  players.forEach(function(p){if(p.attrs)delete p.attrs[key];});
  CLASSES.forEach(function(cl){if(cl.attrs)delete cl.attrs[key];});
  persistAttrs();
  if(CFG.MODE==='supabase')saveToSupabase(players.map(function(p){return p.id;}));
  try{renderClassesAdmin();renderAll();}catch(e){console.error(e);}
  toast('Atribut tret');
}
function persistAttrs(){
  // Guarda la definición de atributos para recargarla
  try{localStorage.setItem('cg_attrs',JSON.stringify(ATTRS));}catch(e){}
}
var collapsedCls={};
function toggleClassCard(idx){
  var cls=CLASSES[idx];if(!cls)return;
  var body=document.getElementById('cls-body-'+idx);
  var chev=document.getElementById('cls-chev-'+idx);
  var collapse=body&&body.style.display!=='none';
  if(body)body.style.display=collapse?'none':'block';
  if(chev)chev.style.transform=collapse?'rotate(-90deg)':'rotate(0deg)';
  collapsedCls[cls.id]=collapse;
}
async function recalcAllStats(){
  if(!players.length){toast('No hi ha personatges.');return;}
  if(!confirm('Sincronitzar els stats base de TOTS els personatges ('+players.length+') amb la base de la seva classe?\n\nNomés canvia la part base (la diferència respecte de la base que tenien). Es mantenen els punts guanyats per nivell i missions.\n\nEls personatges que encara no tenen base registrada NO es modifiquen (només se\'ls registra la base actual).'))return;
  var ids=[];var changedCount=0;var anchoredCount=0;
  players.forEach(function(p){
    var cls=CLASSES.find(function(c){return c.name===p.cls;});
    if(!cls)return;
    if(!p.attrs)p.attrs={};
    if(!p.baseAttrs){
      // PJ sense base registrada: NO toquem els seus stats (evitem esborrar
      // valors posats a mà). Només ancorem la base a la que ja tenen, perquè
      // els futurs canvis de classe s'apliquin per diferència.
      p.baseAttrs={};attrKeys().forEach(function(k){p.baseAttrs[k]=p.attrs[k]||0;});
      anchoredCount++;ids.push(p.id);
      return;
    }
    // Aplicar només la diferència entre la base de la classe i la base del PJ
    var changed=false;
    attrKeys().forEach(function(k){
      var diff=(cls.attrs[k]||0)-(p.baseAttrs[k]||0);
      if(diff!==0){p.attrs[k]=Math.max(0,(p.attrs[k]||0)+diff);changed=true;}
      p.baseAttrs[k]=cls.attrs[k]||0;
    });
    if(changed)changedCount++;
    ids.push(p.id);
  });
  if(!ids.length){toast('Cap personatge amb una classe vàlida.');return;}
  if(CFG.MODE==='supabase'){saveToSupabase(ids);}
  renderClassesAdmin();renderAll();
  toast(changedCount+' ajustats · '+anchoredCount+' amb base registrada (sense canvis)');
}
function renderClassesAdmin(){
  var wrap=document.getElementById('classes-list');
  if(!wrap)return;
  // Editor de atributs (renombrar + afegir/treure)
  var attrEditor='<div class="card" style="margin-bottom:1rem;">'
    +'<div class="stitle">Atributs</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Renombra, afegeix o treu atributs. S\'apliquen a tota l\'app.</div>';
  attrEditor+=ATTRS.map(function(a,i){
    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">'
      +'<input type="text" id="ai-'+a.key+'" value="'+(a.icon||'⭐')+'" maxlength="2" title="Icona" style="width:38px;flex-shrink:0;padding:6px;font-size:16px;text-align:center;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);"/>'
      +'<input type="color" id="ac-'+a.key+'" value="'+(a.color||'#888888')+'" title="Color" style="width:34px;height:32px;flex-shrink:0;padding:0;border:0.5px solid var(--border2);border-radius:var(--radius);background:none;cursor:pointer;"/>'
      +'<input type="text" id="an-'+a.key+'" value="'+(a.name||'')+'" style="flex:1;min-width:0;padding:6px 8px;font-size:13px;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);"/>'
      +(ATTRS.length>1?'<button class="btn btn-sm" style="flex-shrink:0;color:var(--coral);border-color:var(--coral-border);" onclick="removeAttr(\''+a.key+'\')">✕</button>':'')
      +'</div>';
  }).join('');
  attrEditor+='<div style="display:flex;justify-content:space-between;margin-top:12px;">'
    +'<button class="btn btn-sm" onclick="addAttr()">＋ Afegir atribut</button>'
    +'<button class="btn btn-p btn-sm" onclick="saveAttrNames()">Desar</button>'
    +'</div>'
    +'</div>';
  // Barra d'accions globals
  var globalBar='<div class="card" style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">'
    +'<div style="font-size:12px;color:var(--muted);">Posa els stats base de tots els personatges segons la seva classe + creixement pel nivell.</div>'
    +'<button class="btn btn-sm" onclick="recalcAllStats()" title="Recalcular els stats de tots els personatges segons la seva classe">↻ Recalcular stats de tots els PJ</button>'
    +'</div>';
  // Group shop items by slot for the selectors
  wrap.innerHTML=attrEditor+globalBar+CLASSES.map(function(cls,idx){
    var startItems=cls.startItems||[];
    var collapsed=!!collapsedCls[cls.id];
    // Build item checklist
    var itemsHtml=shopItems.map(function(item){
      var checked=startItems.indexOf(item.id)>=0;
      return '<label style="display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:12px;border-radius:var(--radius);cursor:pointer;'+(checked?'background:var(--accent-bg);':'')+'">'
        +'<input type="checkbox" data-cls="'+idx+'" data-item="'+item.id+'" class="cls-item-chk" '+(checked?'checked':'')+'>'
        +'<span>'+(item.icon||'📦')+' '+item.name+' <span style="color:var(--muted);">('+item.slot+')</span></span>'
        +'</label>';
    }).join('');
    return '<div class="card" style="margin-bottom:1rem;">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;">'
        +'<input type="text" id="cls-icon-'+idx+'" value="'+(cls.icon||'')+'" maxlength="2" style="width:44px;padding:6px;font-size:20px;text-align:center;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);"/>'
        +'<div style="flex:1;">'
          +'<input type="text" id="cls-name-'+idx+'" value="'+cls.name+'" style="width:100%;padding:6px 10px;font-size:14px;font-weight:500;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);margin-bottom:4px;"/>'
          +'<input type="text" id="cls-role-'+idx+'" value="'+(cls.role||'')+'" placeholder="Rol" style="width:100%;padding:5px 10px;font-size:12px;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--muted);"/>'
        +'</div>'
        +'<button class="btn btn-sm" style="flex-shrink:0;" title="Minimitzar / expandir" onclick="toggleClassCard('+idx+')"><span id="cls-chev-'+idx+'" style="display:inline-block;transition:transform .15s;transform:'+(collapsed?'rotate(-90deg)':'rotate(0deg)')+';">▾</span></button>'
        +'<button class="btn btn-sm" style="flex-shrink:0;color:var(--coral);border-color:var(--coral-border);" title="Esborrar classe" onclick="deleteClass('+idx+')">🗑️</button>'
      +'</div>'
      +'<div id="cls-body-'+idx+'" style="display:'+(collapsed?'none':'block')+';">'
      +'<div class="stitle">Estadístiques base</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-bottom:1rem;">'
        +attrKeys().map(function(k){
          return '<div style="display:flex;align-items:center;gap:8px;min-width:0;">'
            +'<label style="font-size:11px;color:var(--muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+AN[k]+'">'+AN[k]+'</label>'
            +'<input type="number" id="cls-'+k+'-'+idx+'" value="'+(cls.attrs[k]||0)+'" min="0" style="width:56px;flex-shrink:0;padding:6px;font-size:13px;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);text-align:center;"/></div>';
        }).join('')
      +'</div>'
      +'<div class="stitle">Punts per nivell (pujada automàtica)</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-bottom:1rem;">'
        +attrKeys().map(function(k){var gv=((classGrowthMap[cls.name]||defaultGrowth(cls))[k]||0);
          return '<div style="display:flex;align-items:center;gap:8px;min-width:0;">'
            +'<label style="font-size:11px;color:var(--muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+AN[k]+'">'+AN[k]+'</label>'
            +'<input type="number" id="clsg-'+k+'-'+idx+'" value="'+gv+'" min="0" style="width:56px;flex-shrink:0;padding:6px;font-size:13px;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);text-align:center;"/></div>';
        }).join('')
      +'</div>'
      +'<div class="stitle">Equipament inicial (es dóna en crear el personatge)</div>'
      +'<div style="max-height:180px;overflow-y:auto;border:0.5px solid var(--border);border-radius:var(--radius);padding:6px;margin-bottom:1rem;display:grid;grid-template-columns:1fr 1fr;gap:2px;">'
        +(shopItems.length?itemsHtml:'<div style="font-size:12px;color:var(--muted);padding:6px;">No hi ha ítems creats encara.</div>')
      +'</div>'
      +'<div style="display:flex;justify-content:flex-end;gap:8px;">'
        +'<button class="btn btn-p btn-sm" data-idx="'+idx+'" onclick="saveClassEdit(parseInt(this.dataset.idx))">Desar canvis</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('')
  +'<div style="display:flex;justify-content:center;margin-top:.5rem;"><button class="btn" onclick="addClass()">＋ Crear nova classe</button></div>';
}
async function addClass(){
  var attrs={};attrKeys().forEach(function(k){attrs[k]=5;});
  var cls={id:'cls'+Date.now(),name:'Nova classe',role:'',icon:'⚔️',attrs:attrs,startItems:[],bonus:computeClassBonus(attrs)};
  CLASSES.push(cls);
  if(CFG.MODE==='supabase'){await saveClassToSupabase(cls,CLASSES.length-1);saveToSupabase();}
  renderClassesAdmin();
  toast('Classe afegida — edita-la i desa');
}
async function deleteClassFromSupabase(id){
  try{await fetch(CFG.SUPABASE_URL+'/rest/v1/clases?id=eq.'+id,{method:'DELETE',headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}});}catch(e){console.error('Error deleting class',e);}
}
async function deleteClass(idx){
  var cls=CLASSES[idx];if(!cls)return;
  if(CLASSES.length<=1){alert('Ha d\'haver-hi almenys una classe.');return;}
  if(!confirm('Esborrar la classe "'+cls.name+'"? Els personatges que la tinguin la conservaran com a text.'))return;
  CLASSES.splice(idx,1);
  if(classGrowthMap[cls.name])delete classGrowthMap[cls.name];
  if(CFG.MODE==='supabase'){await deleteClassFromSupabase(cls.id);saveToSupabase();}
  renderClassesAdmin();renderAll();
  toast('Classe esborrada');
}
async function saveClassEdit(idx){
  var cls=CLASSES[idx];
  if(!cls)return;
  var newName=document.getElementById('cls-name-'+idx).value.trim();
  if(!newName){alert('La classe necessita un nom.');return;}
  var oldName=cls.name;
  cls.name=newName;
  cls.role=document.getElementById('cls-role-'+idx).value.trim();
  cls.icon=document.getElementById('cls-icon-'+idx).value.trim()||'⚔️';
  // Guardar els stats base anteriors per calcular la diferència
  var oldAttrs={};attrKeys().forEach(function(k){oldAttrs[k]=cls.attrs[k]||0;});
  attrKeys().forEach(function(k){
    cls.attrs[k]=parseInt(document.getElementById('cls-'+k+'-'+idx).value)||0;
  });
  // Propagar el canvi de stats base als personatges d'aquesta classe,
  // aplicant la diferència per no esborrar els punts repartits per nivell/missions.
  var affectedIds=[];
  players.forEach(function(p){
    if(p.cls!==oldName)return;
    if(!p.attrs)p.attrs={};
    if(!p.baseAttrs)p.baseAttrs={...oldAttrs};
    var changed=false;
    attrKeys().forEach(function(k){
      var diff=(cls.attrs[k]||0)-(oldAttrs[k]||0);
      if(diff!==0){p.attrs[k]=Math.max(0,(p.attrs[k]||0)+diff);changed=true;}
      p.baseAttrs[k]=cls.attrs[k]||0;
    });
    if(changed)affectedIds.push(p.id);
  });
  // Punts per nivell (creixement per classe)
  var gm={};attrKeys().forEach(function(k){var el=document.getElementById('clsg-'+k+'-'+idx);gm[k]=el?(parseInt(el.value)||0):0;});
  cls.growth=gm;classGrowthMap[newName]=gm;
  if(oldName!==newName&&classGrowthMap[oldName])delete classGrowthMap[oldName];
  // Collect selected start items
  var chks=document.querySelectorAll('.cls-item-chk[data-cls="'+idx+'"]:checked');
  cls.startItems=Array.prototype.map.call(chks,function(chk){return chk.getAttribute('data-item');});
  // Recompute bonus
  cls.bonus=computeClassBonus(cls.attrs);
  // If name changed, update players
  if(oldName!==newName){players.forEach(function(p){if(p.cls===oldName)p.cls=newName;});}
  // Save to dedicated table (passant els personatges afectats perquè no es pisin amb la BD)
  if(CFG.MODE==='supabase'){await saveClassToSupabase(cls,idx);saveToSupabase(affectedIds);}
  renderClassesAdmin();renderAll();
  toast('Classe "'+newName+'" actualitzada'+(affectedIds.length?(' · '+affectedIds.length+' personatge'+(affectedIds.length>1?'s':'')+' ajustats'):''));
}

function renderPlannerImported(){
  var wrap=document.getElementById('planner-missions-list');
  if(!wrap)return;
  var imported=missions.filter(function(m){return m.fromPlanner;});
  if(!imported.length){
    document.getElementById('planner-imported').style.display='none';
    return;
  }
  document.getElementById('planner-imported').style.display='block';
  wrap.innerHTML=imported.map(function(m){
    var p=players.find(function(pl){return pl.id===m.playerId;});
    var metaParts=[];
    if(m.plannerAssignee)metaParts.push('👤 Assignat: '+_esc(m.plannerAssignee));
    if(m.plannerCreator)metaParts.push('✍️ Creat per: '+_esc(m.plannerCreator));
    if(m.deadline)metaParts.push('📅 '+_esc(m.deadline));
    if(m.plannerTags)metaParts.push('🏷️ '+_esc(m.plannerTags));
    var statusLabel=m.status==='done'?'Completada':m.status==='active'?'En curs':'Pendent';
    var statusCls=m.status==='done'?'b-teal':m.status==='active'?'b-gold':'b-gray';
    return '<div style="padding:10px 0;border-bottom:0.5px solid var(--border);">'
      +'<div style="display:flex;align-items:center;gap:10px;">'
        +(function(){var pr={A:['Urgent','b-coral'],B:['Important','b-gold'],C:['Mitjana','b-gray'],D:['Baixa','b-teal']}[m.diff]||['Mitjana','b-gray'];return '<span class="badge '+pr[1]+'">'+pr[0]+'</span>';})()
        +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;">'+_esc(m.name)+'</div></div>'
        +'<span class="badge '+statusCls+'">'+statusLabel+'</span>'
        +'<button class="btn btn-sm" style="font-size:11px;" data-mid="'+m.id+'" onclick="deleteMission(this.dataset.mid)">✕</button>'
      +'</div>'
      +(metaParts.length?'<div style="font-size:11px;color:var(--muted);margin-top:4px;padding-left:2px;">'+metaParts.join(' · ')+'</div>':'')
      +(m.desc?'<div style="font-size:11px;color:var(--muted);margin-top:4px;padding:6px 8px;background:var(--bg3);border-radius:var(--radius);white-space:pre-wrap;">'+_esc(m.desc)+'</div>':'')
      +'</div>';
  }).join('');
}



/* ══ OPTIMIZACIÓN JSON ══ */
function cleanOldCompleted(){
  // Mantener solo las últimas 20 misiones completadas por jugador (no diarias)
  players.forEach(function(p){
    var done=missions.filter(function(m){
      return m.status==='done'&&m.playerId===p.id&&!m.isDaily_instance&&!rewardsPending[m.id];
    });
    if(done.length>20){
      // Ordenar per data de finalització (o id) descendent i conservar les 20 més noves
      done.sort(function(a,b){return String(b.id).localeCompare(String(a.id));});
      var toRemove=done.slice(20).map(function(m){return m.id;});
      missions=missions.filter(function(m){return toRemove.indexOf(m.id)<0;});
      // Esborrar també a Supabase perquè no reapareguin en recarregar
      if(CFG.MODE==='supabase')toRemove.forEach(function(id){deleteMissionFromSupabase(id);});
    }
  });
  // Treure instàncies diàries completades de dies anteriors (també a la BD)
  var today=new Date().toISOString().slice(0,10);
  var oldDaily=missions.filter(function(m){return m.isDaily_instance&&m.status==='done'&&m.deadline<today;}).map(function(m){return m.id;});
  missions=missions.filter(function(m){return oldDaily.indexOf(m.id)<0;});
  if(CFG.MODE==='supabase')oldDaily.forEach(function(id){deleteMissionFromSupabase(id);});
}


/* ══ AVATAR PIXEL-ART ══ */
// Opciones disponibles del estilo pixel-art de DiceBear
const AVATAR_OPTS={
  skinColor:['ffdbac','f5cfa0','eac393','e0b687','cb9e6e','b68655','a26d3d','8d5524'],
  hair:['short01','short02','short03','short04','short05','short06','short07','short08','short09','short10','short11','short12','short13','short14','short15','short16','short17','short18','short19','short20','short21','short22','short23','short24','long01','long02','long03','long04','long05','long06','long07','long08','long09','long10','long11','long12','long13','long14','long15','long16','long17','long18','long19','long20','long21'],
  hairColor:['cab188','603a14','83623b','a78961','611c17','603015','612616','28150a','009bbd','bd1700','91cb15'],
  eyes:['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12'],
  eyesColor:['76778b','697b94','647b90','5b7c8b','588387','876658'],
  mouth:['happy01','happy02','happy03','happy04','happy05','happy06','happy07','happy08','happy09','happy10','happy11','happy12','happy13','sad01','sad02','sad03','sad04','sad05','sad06','sad07','sad08','sad09','sad10'],
  clothing:['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12','variant13','variant14','variant15','variant16','variant17','variant18','variant19','variant20','variant21','variant22','variant23'],
  clothingColor:['5bc0de','428bca','03396c','88d8b0','44c585','00b159','ff6f69','d11141','ae0001','ffeead','ffd969','ffc425'],
  glasses:['none','dark01','dark02','dark03','dark04','dark05','dark06','dark07','light01','light02','light03','light04','light05','light06','light07'],
  glassesColor:['4b4b4b','323232','191919','43677d','5f705c','a04b5d'],
  beard:['none','variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08'],
  hat:['none','variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10'],
  hatColor:['2e1e05','2663a3','989789','3d8a6b','cc6192','614f8a','a62116'],
  accessories:['none','variant01','variant02','variant03','variant04'],
  accessoriesColor:['daa520','ffd700','fafad2','d3d3d3','a9a9a9']
};
// Construye la URL de DiceBear para el avatar base
function buildAvatarUrl(av){
  av=av||{};
  var base='https://api.dicebear.com/10.x/pixel-art/png';
  var params=[];
  params.push('seed='+encodeURIComponent(av.seed||'hero'));
  if(av.skinColor)params.push('skinColor='+av.skinColor);
  if(av.hair)params.push('hair='+av.hair);
  if(av.hairColor)params.push('hairColor='+av.hairColor);
  if(av.eyes)params.push('eyes='+av.eyes);
  if(av.eyesColor)params.push('eyesColor='+av.eyesColor);
  if(av.mouth)params.push('mouth='+av.mouth);
  if(av.clothing)params.push('clothing='+av.clothing);
  if(av.clothingColor)params.push('clothingColor='+av.clothingColor);
  if(av.glasses&&av.glasses!=='none'){params.push('glasses='+av.glasses);params.push('glassesProbability=100');if(av.glassesColor)params.push('glassesColor='+av.glassesColor);}
  else params.push('glassesProbability=0');
  if(av.beard&&av.beard!=='none'){params.push('beard='+av.beard);params.push('beardProbability=100');}
  else params.push('beardProbability=0');
  if(av.hat&&av.hat!=='none'){params.push('hat='+av.hat);params.push('hatProbability=100');if(av.hatColor)params.push('hatColor='+av.hatColor);}
  else params.push('hatProbability=0');
  if(av.accessories&&av.accessories!=='none'){params.push('accessories='+av.accessories);params.push('accessoriesProbability=100');if(av.accessoriesColor)params.push('accessoriesColor='+av.accessoriesColor);}
  else params.push('accessoriesProbability=0');
  params.push('size=180');
  return base+'?'+params.join('&');
}
// Devuelve el objeto avatar del jugador (con defaults)
function getPlayerAvatar(p){
  if(!p.avatar)p.avatar={seed:p.id||p.name||'hero',skinColor:'f5cfa0',hair:'short01',hairColor:'603a14',beardColor:'603a14',eyes:'variant01',eyesColor:'5b7c8b',mouth:'happy01',clothing:'variant01',clothingColor:'5bc0de',glasses:'none',glassesColor:'4b4b4b',beard:'none',hat:'none',hatColor:'2663a3',accessories:'none',accessoriesColor:'ffd700'};
  // Corregir valores inválidos de versiones antiguas (evita error 400 de DiceBear)
  var a=p.avatar;
  // Rellenar campos que falten (avatares antiguos) y corregir inválidos
  var defs={skinColor:'f5cfa0',hair:'short01',hairColor:'603a14',beardColor:'603a14',eyes:'variant01',eyesColor:'5b7c8b',mouth:'happy01',clothing:'variant01',clothingColor:'5bc0de',glasses:'none',glassesColor:'4b4b4b',beard:'none',hat:'none',hatColor:'2663a3',accessories:'none',accessoriesColor:'ffd700'};
  // Claves de FORMA: deben ser un valor válido de la lista. Las de COLOR son libres.
  var shapeKeys=['hair','eyes','mouth','clothing','glasses','beard','hat','accessories'];
  Object.keys(defs).forEach(function(k){
    if(a[k]===undefined){a[k]=defs[k];return;}
    if(shapeKeys.indexOf(k)>=0&&AVATAR_OPTS[k]&&AVATAR_OPTS[k].indexOf(a[k])<0)a[k]=defs[k];
    // los colores (hex) se dejan tal cual, sean de la lista o elegidos libremente
  });
  return a;
}
// Renderiza el avatar completo (base DiceBear + capas de items equipados)
function recolorBeard(svg,hairHex,beardHex){
  // Recolorea SOLO el bloque de la barba, sin re-serializar todo el SVG (evita corromperlo).
  try{
    var hh=('#'+hairHex.replace('#','')).toLowerCase();
    var bh='#'+beardHex.replace('#','');
    // La barba se compone de un <mask id="beardVariantXX-a">...</mask> seguido de <g mask="url(#beardVariantXX-a)">...</g>
    // Localizamos el ID de la variante presente
    var m=svg.match(/beardVariant\d+-a/);
    if(!m)return svg;
    var maskId=m[0];
    // Recolorear dentro del bloque <mask id="maskId"> ... </mask>
    var maskRe=new RegExp('(<mask id="'+maskId+'"[\\s\\S]*?<\\/mask>)');
    svg=svg.replace(maskRe,function(block){
      return block.replace(new RegExp(hh,'gi'),bh);
    });
    // Recolorear dentro del bloque <g mask="url(#maskId)"> ... </g> (primer </g> tras la apertura; DiceBear no anida aquí)
    var gStart=svg.indexOf('<g mask="url(#'+maskId+')"');
    if(gStart>=0){
      var gEnd=svg.indexOf('</g>',gStart);
      if(gEnd>=0){
        gEnd+=4;
        var before=svg.slice(0,gStart);
        var block=svg.slice(gStart,gEnd);
        var after=svg.slice(gEnd);
        block=block.replace(new RegExp(hh,'gi'),bh);
        svg=before+block+after;
      }
    }
    return svg;
  }catch(e){console.error('recolorBeard error',e);return svg;}
}
function buildAvatarSvg(av){
  // Genera el SVG localmente con la librería DiceBear (respeta cada rasgo)
  if(!window.DiceBearCreate||!window.DiceBearPixelArt)return null;
  try{
    var opts={seed:av.seed||'hero',size:180};
    if(av.skinColor)opts.skinColor=[av.skinColor];
    if(av.hair)opts.hair=[av.hair];
    if(av.hairColor)opts.hairColor=[av.hairColor];
    if(av.eyes)opts.eyes=[av.eyes];
    if(av.eyesColor)opts.eyesColor=[av.eyesColor];
    if(av.mouth)opts.mouth=[av.mouth];
    if(av.clothing)opts.clothing=[av.clothing];
    if(av.clothingColor)opts.clothingColor=[av.clothingColor];
    if(av.glasses&&av.glasses!=='none'){opts.glasses=[av.glasses];opts.glassesProbability=100;if(av.glassesColor)opts.glassesColor=[av.glassesColor];}
    else opts.glassesProbability=0;
    if(av.beard&&av.beard!=='none'){opts.beard=[av.beard];opts.beardProbability=100;}
    else opts.beardProbability=0;
    if(av.hat&&av.hat!=='none'){opts.hat=[av.hat];opts.hatProbability=100;if(av.hatColor)opts.hatColor=[av.hatColor];}
    else opts.hatProbability=0;
    if(av.accessories&&av.accessories!=='none'){opts.accessories=[av.accessories];opts.accessoriesProbability=100;if(av.accessoriesColor)opts.accessoriesColor=[av.accessoriesColor];}
    else opts.accessoriesProbability=0;
    return window.DiceBearCreate(window.DiceBearPixelArt,opts).toString();
  }catch(e){console.error('DiceBear local error',e);return null;}
}
function renderAvatar(p,sizeClass){
  // Si el jugador ha triat una FOTO com a avatar, es mostra a tot arreu (perfil, rànquing, banner...)
  if(p&&p.bannerPortraitMode==='photo'&&p.bannerPortrait){
    return '<div class="pixel-avatar '+(sizeClass||'pixel-avatar-lg')+' pa-isphoto"><img class="pa-photo" src="'+_esc(p.bannerPortrait)+'" alt="" onerror="this.style.display=\'none\'"/></div>';
  }
  var av=getPlayerAvatar(p);
  var emblem=p.emblem||'🧙';
  var bg=av.bgColor?(av.bgColor.charAt(0)==='#'?av.bgColor:'#'+av.bgColor):(p.colorBg||'var(--bg3)');
  var html='<div class="pixel-avatar '+(sizeClass||'pixel-avatar-lg')+'" style="background:'+bg+';">';
  html+='<div class="pa-fallback" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:60%;">'+emblem+'</div>';
  // Preferir SVG local (control total de rasgos); fallback a la API HTTP
  var svg=buildAvatarSvg(av);
  if(svg){
    html=html.replace('display:flex;align-items:center','display:none;align-items:center');
    html+='<div class="pa-base" style="position:absolute;inset:0;">'+svg+'</div>';
  }else{
    var url=buildAvatarUrl(av);
    html+='<img class="pa-base" src="'+url+'" alt="" onerror="this.style.display=\'none\'" onload="var f=this.parentNode.querySelector(\'.pa-fallback\');if(f)f.style.display=\'none\'"/>';
  }
  if(svg){var _f='';}
  // Capas de items equipados: NOMÉS cosmètics (l'equip normal no s'enganxa sobre l'avatar)
  if(p.equipped){
    SLOT_DEFS.slice().sort(function(a,b){return (a.pos.z||0)-(b.pos.z||0);}).forEach(function(sl){
      if(!sl.cosmetic)return;
      var iid=p.equipped[sl.key];
      if(!iid)return;
      var item=shopItems.find(function(i){return i.id===iid;});
      if(item&&item.imageUrl){
        var ps=(p.equipPos&&p.equipPos[sl.key])||item.avatarPos||sl.pos;
        var z=(ps.z!=null?ps.z:(sl.pos.z||4));
        html+='<img class="pa-layer" data-slot="'+sl.key+'" style="position:absolute;left:'+ps.x+'%;top:'+ps.y+'%;width:'+ps.w+'%;height:auto;z-index:'+z+';" src="'+item.imageUrl+'" alt="'+item.name+'" onerror="this.style.display=\'none\'"/>';
      }
    });
  }

  html+='</div>';
  return html;
}

function updateSidebarAvatar(){
  var mini=document.getElementById('sidebar-mini-avatar');
  var dot=document.getElementById('udot-fallback');
  if(!mini)return;
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(p&&!session.isAdmin){
    mini.innerHTML=renderAvatar(p,'pixel-avatar-mini');
    mini.style.display='inline-block';
    if(dot)dot.style.display='none';
  }else{
    mini.style.display='none';
    if(dot)dot.style.display='inline-block';
  }
}

/* ══ EDITOR DE AVATAR ══ */
var _avatarEditPid=null;
function renderInlineAvatarEditor(pid){
  _avatarEditPid=pid;
  renderAvatarEditor('inline-avatar-preview','inline-avatar-controls');
  enableAvatarDrag('inline-avatar-preview');
  renderFramePicker();
}
function refreshAvatarPreview(){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  var t=window._avaTargets||{};
  var pid=t.preview||'avatar-editor-preview';
  var pv=document.getElementById(pid);
  if(pv){pv.innerHTML=renderAvatar(p,'pixel-avatar-lg');enableAvatarDrag(pid);}
}
function enableAvatarDrag(previewId){
  var cont=document.getElementById(previewId);
  if(!cont)return;
  var wrap=cont.querySelector('.pixel-avatar');
  if(!wrap)return;
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  if(!p.equipPos)p.equipPos={};
  var layers=wrap.querySelectorAll('.pa-layer[data-slot]');
  layers.forEach(function(layer){
    var slot=layer.getAttribute('data-slot');
    if(!slot)return;
    layer.classList.add('pa-draggable');
    var dragging=false,startX,startY,startPx,startPy,rect;
    function down(e){
      e.preventDefault();e.stopPropagation();
      dragging=true;
      rect=wrap.getBoundingClientRect();
      var pt=e.touches?e.touches[0]:e;
      startX=pt.clientX;startY=pt.clientY;
      var it=shopItems.find(function(i){return i.id===p.equipped[slot];});
      var sl=SLOT_DEFS.find(function(x){return x.key===slot;});
      var cur=p.equipPos[slot]||(it&&it.avatarPos)||(sl&&sl.pos)||{x:20,y:20,w:60,z:10};
      p.equipPos[slot]=Object.assign({},cur);
      startPx=p.equipPos[slot].x;startPy=p.equipPos[slot].y;
      document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
      document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',up);
    }
    function move(e){
      if(!dragging)return;
      e.preventDefault();
      var pt=e.touches?e.touches[0]:e;
      var dx=(pt.clientX-startX)/rect.width*100;
      var dy=(pt.clientY-startY)/rect.height*100;
      var nx=Math.round(startPx+dx),ny=Math.round(startPy+dy);
      p.equipPos[slot].x=nx;p.equipPos[slot].y=ny;
      // Mover SOLO este elemento (sin regenerar el avatar)
      layer.style.left=nx+'%';
      layer.style.top=ny+'%';
    }
    function up(){
      dragging=false;
      document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);
      document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up);
    }
    layer.addEventListener('mousedown',down);
    layer.addEventListener('touchstart',down,{passive:false});
  });
}
function saveInlineAvatar(pid){
  _avatarEditPid=pid;
  if(CFG.MODE==='supabase')saveToSupabase();
  updateSidebarAvatar();
  toast('Avatar desat');
}
function openAvatarEditor(pid){
  var p=players.find(function(pl){return pl.id===pid;});
  if(!p)return;
  _avatarEditPid=pid;
  getPlayerAvatar(p);
  renderAvatarEditor('avatar-editor-preview','avatar-editor-controls');
  document.getElementById('avatar-editor-modal').style.display='flex';
}
function closeAvatarEditor(){
  document.getElementById('avatar-editor-modal').style.display='none';
  _avatarEditPid=null;
}
// Convierte un valor de DiceBear (short01, variant05, happy03...) en una etiqueta legible en catalán
function avaOptLabel(v,index){
  if(v==='none')return 'Cap';
  var m=(''+v).match(/^([a-zA-Z]+)(\d+)$/);
  var prefix=m?m[1].toLowerCase():(''+v);
  var num=m?parseInt(m[2],10):(index+1);
  var map={short:'Curt',long:'Llarg',happy:'Somrient',sad:'Trist',dark:'Fosc',light:'Clar',variant:'Estil'};
  var name=map[prefix]||'Estil';
  return name+' '+num;
}
function toggleCustSec(head){
  var body=head.nextElementSibling;
  var collapsed=head.classList.toggle('collapsed');
  if(body)body.style.display=collapsed?'none':'';
}
function renderAvatarEditor(previewId,controlsId){
  previewId=previewId||(window._avaTargets&&window._avaTargets.preview)||'avatar-editor-preview';
  controlsId=controlsId||(window._avaTargets&&window._avaTargets.controls)||'avatar-editor-controls';
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  var av=getPlayerAvatar(p);
  var pv=document.getElementById(previewId);if(pv){pv.innerHTML=frameWrap(p,renderAvatar(p,'pixel-avatar-lg'));enableAvatarDrag(previewId);}
  var html='';
  window._avaTargets={preview:previewId,controls:controlsId};
  function colorPicker(key,label){
    var raw=av[key]||'000000';
    var val=raw.charAt(0)==='#'?raw:'#'+raw;
    return '<div class="ava-opt-row"><label>'+label+'</label>'
      +'<div style="display:flex;align-items:center;gap:8px;">'
      +'<input type="color" value="'+val+'" oninput="setAvatarColor(\''+key+'\',this.value)" style="width:44px;height:32px;padding:0;border:2px solid var(--border2);border-radius:var(--radius);background:none;cursor:pointer;"/>'
      +'<span style="width:26px;height:26px;border:2px solid var(--border2);border-radius:var(--radius);background:'+val+';display:inline-block;"></span>'
      +'</div></div>';
  }
  // Menú desplegable con todas las opciones de forma (nombres en catalán)
  function selector(key,label){
    var cur=av[key]||AVATAR_OPTS[key][0];
    var opts=AVATAR_OPTS[key].map(function(v,i){
      return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+avaOptLabel(v,i)+'</option>';
    }).join('');
    return '<div class="ava-opt-row"><label>'+label+'</label>'
      +'<select onchange="setAvatarShape(\''+key+'\',this.value)" style="flex:1;padding:6px 8px;font-size:13px;border:2px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);cursor:pointer;">'+opts+'</select>'
      +'</div>';
  }
  // Colors (secció plegable)
  html+='<div class="cust-sec"><div class="cust-head" onclick="toggleCustSec(this)"><span class="cust-chev">▾</span><span>🎨 Colors</span></div><div class="cust-body cust-grid">';
  html+=colorPicker('skinColor','Pell');
  html+=colorPicker('bgColor','Fons');
  html+=colorPicker('hairColor','Cabell');
  html+=colorPicker('eyesColor','Ulls');
  html+=colorPicker('clothingColor','Roba');
  html+=colorPicker('glassesColor','Ulleres');
  html+=colorPicker('hatColor','Barret');
  html+=colorPicker('accessoriesColor','Accessoris');
  html+='</div></div>';
  // Formes (secció plegable)
  html+='<div class="cust-sec"><div class="cust-head" onclick="toggleCustSec(this)"><span class="cust-chev">▾</span><span>✂️ Formes</span></div><div class="cust-body cust-grid">';
  html+=selector('hair','Pentinat');
  html+=selector('eyes','Ulls');
  html+=selector('mouth','Boca');
  html+=selector('clothing','Roba');
  html+=selector('glasses','Ulleres');
  html+=selector('beard','Barba');
  html+=selector('hat','Barret');
  html+=selector('accessories','Accessoris');
  html+='</div></div>';
  // Cosmètics (secció plegable): 5 slots per posar qualsevol cosmètic que tinguis
  if(p.equipped){
    if(!p.equipPos)p.equipPos={};
    var cosmeticSlots=SLOT_DEFS.filter(function(sl){return sl.cosmetic;});
    var ownedCosmetics=(p.inventory||[]).filter(function(id){var it=shopItems.find(function(i){return i.id===id;});return it&&it.isCosmetic;});
    html+='<div class="cust-sec"><div class="cust-head" onclick="toggleCustSec(this)"><span class="cust-chev">▾</span><span>✨ Cosmètics</span></div><div class="cust-body">';
    if(!ownedCosmetics.length){
      html+='<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">No tens cap cosmètic encara. Aconsegueix-ne a la botiga o al gacha!</div>';
    }else{
      html+='<div style="font-size:11px;color:var(--muted);margin-bottom:8px;">🖱️ Arrossega els cosmètics sobre l\'avatar per moure\'ls.</div>';
    }
    html+='<div class="cosm-slots">';
    cosmeticSlots.forEach(function(sl,idx){
      var cur=p.equipped[sl.key]||'';
      var opts='<option value="">— Buit —</option>'+ownedCosmetics.map(function(id){
        var it=shopItems.find(function(i){return i.id===id;});
        return '<option value="'+id+'"'+(cur===id?' selected':'')+'>'+(it.icon||'✨')+' '+it.name+'</option>';
      }).join('');
      var it=cur?shopItems.find(function(i){return i.id===cur;}):null;
      var filled=!!(it&&it.imageUrl);
      html+='<div class="cosm-slot'+(cur?' filled':'')+'">'
        +'<select onchange="equipFromEditor(\''+sl.key+'\',this.value)" class="cosm-sel">'+opts+'</select>';
      if(filled){
        var ps=p.equipPos[sl.key]||it.avatarPos||sl.pos;
        html+='<div class="cosm-size">'
          +'<span class="cosm-size-ic">⛶</span>'
          +'<button class="ava-cycle-btn" onclick="nudgeEquipPos(\''+sl.key+'\',\'w\',-4)">−</button>'
          +'<input type="range" min="8" max="140" value="'+ps.w+'" oninput="setEquipPos(\''+sl.key+'\',\'w\',this.value)"/>'
          +'<button class="ava-cycle-btn" onclick="nudgeEquipPos(\''+sl.key+'\',\'w\',4)">+</button>'
          +'<button class="cosm-reset" title="Posició per defecte" onclick="resetEquipPos(\''+sl.key+'\')">↺</button>'
          +'</div>';
      }
      html+='</div>';
    });
    html+='</div>';
    html+='</div></div>';
  }
      html+='<div style="margin-top:12px;"><button class="btn btn-sm" style="width:100%;" onclick="randomizeAvatar()">🎲 Aleatori</button></div>';
  var cc=document.getElementById(controlsId);if(cc)cc.innerHTML=html;
}
function setAvatarShape(key,val){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  getPlayerAvatar(p)[key]=val;
  refreshAvatarPreview();
}
function equipFromEditor(slot,itemId){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  if(!p.equipped)p.equipped=emptyEquipped();
  if(itemId)p.equipped[slot]=itemId;
  else p.equipped[slot]=null;
  var t=window._avaTargets||{};
  refreshAvatarPreview();
  renderAvatarEditor(t.preview,t.controls);
}
function nudgeEquipPos(slot,axis,delta){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  if(!p.equipPos)p.equipPos={};
  var it=shopItems.find(function(i){return i.id===(p.equipped&&p.equipped[slot]);});
  var sl=SLOT_DEFS.find(function(x){return x.key===slot;});
  if(!p.equipPos[slot])p.equipPos[slot]=Object.assign({},(it&&it.avatarPos)||(sl&&sl.pos)||{x:20,y:20,w:60,z:4});
  p.equipPos[slot][axis]=(p.equipPos[slot][axis]||0)+delta;
  var lbl=document.getElementById('eqp-'+axis+'-'+slot);if(lbl)lbl.textContent=Math.round(p.equipPos[slot][axis]);
  refreshAvatarPreview();
}
function setEquipPos(slot,axis,val){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  if(!p.equipPos)p.equipPos={};
  var it=shopItems.find(function(i){return i.id===(p.equipped&&p.equipped[slot]);});
  var sl=SLOT_DEFS.find(function(x){return x.key===slot;});
  if(!p.equipPos[slot])p.equipPos[slot]=Object.assign({},(it&&it.avatarPos)||(sl&&sl.pos)||{x:20,y:20,w:60,z:4});
  p.equipPos[slot][axis]=parseFloat(val);
  var lbl=document.getElementById('eqp-'+axis+'-'+slot);if(lbl)lbl.textContent=val;
  refreshAvatarPreview();
}
function resetEquipPos(slot){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p||!p.equipPos)return;
  delete p.equipPos[slot];
  var t=window._avaTargets||{};renderAvatarEditor(t.preview,t.controls);
}
function setCustomTrait(catId,optId){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  var av=getPlayerAvatar(p);
  if(!av.custom)av.custom={};
  if(optId==='none')delete av.custom[catId];
  else av.custom[catId]=optId;
  refreshAvatarPreview();
}
function setAvatarColor(key,hex){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  // bgColor es CSS (necesita #); los colores de DiceBear van sin #
  getPlayerAvatar(p)[key]=(key==='bgColor')?hex:hex.replace('#','');
  var t=window._avaTargets||{};renderAvatarEditor(t.preview,t.controls);
}
function randomizeAvatar(){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  var av=getPlayerAvatar(p);
  Object.keys(AVATAR_OPTS).forEach(function(k){
    var opts=AVATAR_OPTS[k];
    av[k]=opts[Math.floor(Math.random()*opts.length)];
  });
  var t=window._avaTargets||{};renderAvatarEditor(t.preview,t.controls);
}
function cycleAvatarOpt(key,dir){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  var av=getPlayerAvatar(p);
  var opts=AVATAR_OPTS[key];
  var idx=opts.indexOf(av[key]);if(idx<0)idx=0;
  idx=(idx+dir+opts.length)%opts.length;
  av[key]=opts[idx];
  renderAvatarEditor();
}
function setAvatarOpt(key,val){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  getPlayerAvatar(p)[key]=val;
  renderAvatarEditor();
}

function saveAvatar(){
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  if(CFG.MODE==='supabase')saveToSupabase();
  closeAvatarEditor();
  updateSidebarAvatar();
  renderHeroProfile(curHero);
  toast('Avatar desat');
}

/* ══ RADAR D'ATRIBUTS (Chart.js) ══ */
function _hexA(hex,a){if(!/^#([0-9a-fA-F]{6})$/.test(hex||''))return hex||'rgba(127,119,221,'+a+')';var n=parseInt(hex.slice(1),16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
// Genera el contenidor + canvas; el gràfic es crea a initRadars() després d'inserir-lo al DOM.
function buildPentagon(attrs,color){
  var keys=attrKeys();
  var labels=keys.map(function(k){return attrIcon(k);});
  var values=keys.map(function(k){return Math.min(100,attrs[k]||0);});
  var colors=keys.map(function(k){return attrColor(k);});
  var cfg={labels:labels,values:values,colors:colors,color:color||'#7f77dd'};
  return '<div class="radar-wrap"><canvas class="radar-canvas" data-cfg="'+encodeURIComponent(JSON.stringify(cfg))+'"></canvas></div>';
}
// Inicialitza (o reinicia) tots els radars presents al DOM
function initRadars(){
  if(typeof Chart==='undefined'){
    if(document.querySelector('canvas.radar-canvas')){_ensureChart().then(function(){try{initRadars();}catch(e){}}).catch(function(){});}
    return;
  }
  document.querySelectorAll('canvas.radar-canvas').forEach(function(cv){
    var raw=cv.getAttribute('data-cfg');if(!raw)return;
    var cfg;try{cfg=JSON.parse(decodeURIComponent(raw));}catch(e){return;}
    if(cv._chart){try{cv._chart.destroy();}catch(e){}}
    var css=getComputedStyle(document.body);
    var grid=(css.getPropertyValue('--border')||'#ddd').trim()||'#ddd';
    var txt=(css.getPropertyValue('--text')||'#333').trim()||'#333';
    var col=cfg.color||'#7f77dd';
    var EMOJI_FONT='"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji","Segoe UI Symbol",sans-serif';
    var acolors=(cfg.colors&&cfg.colors.length)?cfg.colors:cfg.labels.map(function(){return col;});
    // Colors dels punts = color de cada atribut
    var pointColors=acolors.slice();
    // Plugin: dibuixa el nombre de punts en una pastilla al PERÍMETRE (angle fix de cada atribut,
    // vora el seu emoji) — així no es solapen encara que els valors siguin baixos o 0.
    var valuePlugin={
      id:'attrValues',
      afterDatasetsDraw:function(chart){
        var ctx=chart.ctx;var r=chart.scales.r;if(!r||!r.getPointPosition)return;
        var rad=r.drawingArea||100;
        for(var i=0;i<cfg.values.length;i++){
          var v=cfg.values[i];if(v==null)continue;
          var pos=r.getPointPosition(i,rad*0.9);
          var txtv=String(v);
          ctx.save();
          ctx.font='700 12px system-ui,sans-serif';
          var w=ctx.measureText(txtv).width;var padX=6,h=17,rw=w+padX*2;
          var x=pos.x,y=pos.y;
          ctx.fillStyle=acolors[i]||col;
          ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.5;
          if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x-rw/2,y-h/2,rw,h,8);ctx.fill();ctx.stroke();}
          else{ctx.fillRect(x-rw/2,y-h/2,rw,h);}
          ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(txtv,x,y+0.5);
          ctx.restore();
        }
      }
    };
    cv._chart=new Chart(cv,{
      type:'radar',
      data:{labels:cfg.labels,datasets:[{label:'Nivell',data:cfg.values,
        borderColor:col,
        backgroundColor:function(c){var a=c.chart.chartArea;if(!a)return _hexA(col,0.28);var g=c.chart.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,_hexA(col,0.42));g.addColorStop(1,_hexA(col,0.06));return g;},
        pointBackgroundColor:pointColors,pointBorderColor:'#fff',pointBorderWidth:0,pointRadius:0,pointHoverRadius:0,borderWidth:2.5,tension:0.02}]},
      options:{responsive:true,maintainAspectRatio:true,animation:false,layout:{padding:14},plugins:{legend:{display:false},tooltip:{enabled:true}},scales:{r:{suggestedMin:0,suggestedMax:100,grid:{color:grid},angleLines:{color:grid},ticks:{display:false,stepSize:25,backdropColor:'transparent'},pointLabels:{color:txt,font:{size:22,family:EMOJI_FONT}}}}},
      plugins:[valuePlugin]
    });
  });
  // Els emojis en canvas necessiten la font carregada: reintenta un cop quan estigui llesta
  if(document.fonts&&!window._radarFontRetry){window._radarFontRetry=true;document.fonts.ready.then(function(){try{initRadars();}catch(e){}});}
}

/* ══ INVENTARIO ══ */
function renderInventario(){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var eqEl=document.getElementById('inv-slots-equip');
  var cosmEl=document.getElementById('inv-slots-cosm');
  var gw=document.getElementById('inv-grid');
  if(!gw)return;
  try{checkItemExpiry();}catch(e){}
  var goldBanner=document.getElementById('inv-gold-banner');
  if(goldBanner)goldBanner.innerHTML=p?('<span class="coin"></span> <b>'+(p.gold||0).toLocaleString()+'</b> or'):'';
  if(!p){if(eqEl)eqEl.innerHTML='<div style="color:var(--muted);font-size:13px;">Inicia sessió.</div>';if(cosmEl)cosmEl.innerHTML='';gw.innerHTML='';return;}
  if(!p.equipped)p.equipped=emptyEquipped();
  // Qué slots son cosméticos: los que solo tienen items isCosmetic disponibles, o por convención (gafas,sombrero,capa,alas). Mejor: por tipo de item.
  var COSMETIC_SLOTS=SLOT_DEFS.filter(function(s){return s.cosmetic;}).map(function(s){return s.key;});
  // Cosmètics que té el jugador (per activar/desactivar des de l'inventari)
  var cosmOwned=(p.inventory||[]).filter(function(id){var it=shopItems.find(function(i){return i.id===id;});return it&&it.isCosmetic;});
  function slotCard(sl){
    var iid=p.equipped[sl.key];
    var item=shopItems.find(function(i){return i.id===iid;});
    var html='<div class="inv-slot '+(item?'filled bg-rarity-'+(item.rareza||'comun'):'')+'"'+(sl.cosmetic?'':' onclick="invFilterBySlot(\''+sl.key+'\',false)" title="Filtrar la motxilla per aquest tipus"')+'>';
    html+='<div class="inv-slot-icon">'+(item?(item.imageUrl?'<img class="inv-slot-img" src="'+_esc(item.imageUrl)+'" alt="">':item.icon):sl.icon)+'</div>';
    html+='<div class="inv-slot-name">'+_esc(item?item.name:'Buit')+'</div>';
    var _slbl=sl.cosmetic?(sl.label||'Cosmètic').replace(/\s*\d+\s*$/,''):sl.label;
    html+='<div class="inv-slot-label">'+_esc(_slbl)+'</div>';
    if(sl.cosmetic){
      // Selector per activar/desactivar/canviar el cosmètic directament
      if(cosmOwned.length){
        html+='<select class="cosm-inv-sel" onclick="event.stopPropagation()" onchange="invEquipCosmetic(\''+sl.key+'\',this.value)">'
          +'<option value="">— Desactivat —</option>'
          +cosmOwned.map(function(id){var it=shopItems.find(function(i){return i.id===id;});return '<option value="'+id+'"'+(iid===id?' selected':'')+'>'+_esc((it.icon||'✨')+' '+it.name)+'</option>';}).join('')
          +'</select>';
      }else{
        html+='<div style="font-size:10px;color:var(--muted);margin-top:6px;">Encara no tens cosmètics</div>';
      }
      if(item)html+='<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;margin-top:6px;" onclick="event.stopPropagation();showItemDetails(\''+iid+'\')">ℹ️ Detalls</button>';
    }else if(item){
      html+='<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;margin-top:4px;" onclick="event.stopPropagation();unequipItem(\''+iid+'\');renderInventario();">✕ Treure</button>';
      html+='<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;margin-top:4px;" onclick="event.stopPropagation();showItemDetails(\''+iid+'\')">ℹ️ Detalls</button>';
    }
    html+='</div>';
    return html;
  }
  if(eqEl)eqEl.innerHTML=SLOT_DEFS.filter(function(sl){return COSMETIC_SLOTS.indexOf(sl.key)<0;}).map(slotCard).join('');
  if(cosmEl)cosmEl.innerHTML=SLOT_DEFS.filter(function(sl){return COSMETIC_SLOTS.indexOf(sl.key)>=0;}).map(slotCard).join('');
  var galEl=document.getElementById('inv-my-gallery');
  if(galEl)galEl.innerHTML=renderGalleryCards(p.gallery||[]);
  var avaPv=document.getElementById('inv-ava-preview');
  if(avaPv)avaPv.innerHTML=frameWrap(p,renderAvatar(p,'pixel-avatar-lg'));
  // Filtro de slot del catálogo (dinámico con todos los slots)
  var slotFilterEl=document.getElementById('inv-filter-slot');
  if(slotFilterEl&&slotFilterEl.options.length<=1){
    // Slots d'equip individuals + una sola opció "Cosmètics" (agrupa cosm1..cosm5)
    var equipOpts=SLOT_DEFS.filter(function(s){return !s.cosmetic;}).map(function(s){return '<option value="'+s.key+'">'+s.icon+' '+s.label+'</option>';}).join('');
    slotFilterEl.innerHTML='<option value="">Tots els slots</option>'+equipOpts+'<option value="__cosm__">✨ Cosmètics</option>';
  }
  var invSearch=(document.getElementById('inv-search')?document.getElementById('inv-search').value.toLowerCase().trim():'');
  var invSlot=(document.getElementById('inv-filter-slot')?document.getElementById('inv-filter-slot').value:'');
  var invRarity=(document.getElementById('inv-filter-rarity')?document.getElementById('inv-filter-rarity').value:'');
  var invSortBy=(document.getElementById('inv-sort')?document.getElementById('inv-sort').value:'name');
  var COSM_KEYS=SLOT_DEFS.filter(function(s){return s.cosmetic;}).map(function(s){return s.key;});
  var inv=(p.inventory||[]).filter(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(!item)return false;
    if(invSearch&&item.name.toLowerCase().indexOf(invSearch)<0)return false;
    if(invSlot==='__cosm__'){if(COSM_KEYS.indexOf(item.slot)<0)return false;}
    else if(invSlot&&item.slot!==invSlot)return false;
    if(invRarity&&item.rareza!==invRarity)return false;
    return true;
  }).sort(function(a,b){
    var ia=shopItems.find(function(i){return i.id===a;}),ib=shopItems.find(function(i){return i.id===b;});
    if(invSortBy==='name')return(ia?ia.name:'').localeCompare(ib?ib.name:'');
    return RARITY_ORDER.indexOf(ia?ia.rareza:'comun')-RARITY_ORDER.indexOf(ib?ib.rareza:'comun');
  });
  if(!inv.length){gw.innerHTML='<div class="empty-state" style="grid-column:1/-1;"><div class="es-ico">🎒</div><div class="es-txt">La motxilla està buida.</div></div>';return;}
  gw.innerHTML=inv.map(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(!item)return '';
    var eq=p.equipped&&Object.values(p.equipped).indexOf(iid)>=0;
    var bonusLines=Object.entries(item.bonus||{}).filter(function(e){return e[1]>0;}).map(function(e){return '<div class="inv-bonus-row">+'+e[1]+' '+AN[e[0]]+'</div>';}).join('');
    var html='<div class="inv-item bg-rarity-'+(item.rareza||'comun')+' '+(eq?'equipped':'')+'">';
    html+='<button class="info-btn" title="Veure info" onclick="event.stopPropagation();showItemDetails(\''+iid+'\')">i</button>';
    html+=(item.imageUrl?'<img src="'+item.imageUrl+'" alt="'+item.name+'" style="width:100%;height:90px;object-fit:contain;border-radius:var(--radius);margin-bottom:4px;background:var(--bg3);">':'<div style="font-size:24px;text-align:center;">'+item.icon+'</div>');
    html+='<div style="font-size:12px;font-weight:500;">'+item.name+'</div>';
    var slLbl=(SLOT_DEFS.find(function(s){return s.key===item.slot;})||{}).label||item.slot;
    html+='<div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);">'+slLbl+'</div>';
    var _dd=itemDur(iid);
    if(_dd){
      var _acq=(p.itemAcq&&p.itemAcq[iid])?Date.parse(p.itemAcq[iid]):Date.now();
      var _left=Math.ceil((_acq+_dd*86400000-Date.now())/86400000);
      if(_left<0)_left=0;
      html+='<div style="font-size:10px;font-weight:600;color:'+(_left<=1?'var(--coral)':'var(--gold)')+';">⏳ '+(_left<=0?'Caduca avui':('Caduca en '+_left+' d'+(_left===1?'ia':'ies')))+'</div>';
    }
    if(bonusLines)html+='<div class="inv-bonus">'+bonusLines+'</div>';
    html+='<div style="margin-top:auto;padding-top:6px;">';
    if(isConsumable(iid)){
      html+='<button class="btn btn-sm btn-gold" style="width:100%;" onclick="consumeItem(\''+iid+'\')">🍴 Consumir</button>';
    }else if(eq){
      html+='<button class="btn btn-sm" style="width:100%;" onclick="unequipItem(\''+iid+'\');renderInventario();">Treure</button>';
    }else{
      html+='<button class="btn btn-sm btn-p" style="width:100%;" onclick="equipItem(\''+iid+'\');renderInventario();">Equipar</button>';
    }
    html+='</div></div>';
    return html;
  }).join('');
}
function invFilterBySlot(slot,isCosm){
  var sel=document.getElementById('inv-filter-slot');
  if(sel){sel.value=isCosm?'__cosm__':slot;}
  renderInventario();
}
// Activar / desactivar / canviar un cosmètic des de l'inventari
function invEquipCosmetic(slot,itemId){
  var p=players.find(function(pl){return pl.id===session.playerId;});if(!p)return;
  if(!p.equipped)p.equipped=emptyEquipped();
  p.equipped[slot]=itemId||null;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderInventario();
}
var RARITY_LABEL_SAFE={comun:'Comú',rara:'Rara',epica:'Èpica',legendaria:'Llegendària'};
function showItemDetails(id){
  var it=shopItems.find(function(i){return i.id===id;});if(!it)return;
  var body=document.getElementById('item-detail-body');if(!body)return;
  var slLbl=(SLOT_DEFS.find(function(s){return s.key===it.slot;})||{}).label||it.slot;
  var rarLbl=(typeof RARITY_LABEL!=='undefined'&&RARITY_LABEL[it.rareza])?RARITY_LABEL[it.rareza]:(RARITY_LABEL_SAFE[it.rareza]||it.rareza||'Comú');
  var bonus=Object.entries(it.bonus||{}).filter(function(e){return e[1]>0;}).map(function(e){return '<div class="inv-bonus-row" style="font-size:13px;">+'+e[1]+' '+AN[e[0]]+'</div>';}).join('')||'<span style="color:var(--muted);font-size:13px;">Cap</span>';
  var reqs=Object.entries(it.minAttrs||{}).filter(function(e){return e[1]>0;}).map(function(e){return '<span class="badge b-gray" style="margin:2px 4px 2px 0;">'+AN[e[0]]+' ≥ '+e[1]+'</span>';}).join('')||'<span style="color:var(--muted);font-size:13px;">Cap</span>';
  var img=it.imageUrl?'<img src="'+it.imageUrl+'" alt="'+it.name+'" style="width:120px;height:120px;object-fit:contain;background:var(--bg3);border-radius:var(--radius);">':'<div style="font-size:64px;">'+(it.icon||'📦')+'</div>';
  body.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;margin-bottom:1rem;">'
    +img
    +'<div style="font-size:18px;font-weight:600;margin-top:6px;">'+it.name+'</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;"><span class="badge rarity-'+(it.rareza||'comun')+'" style="border:0.5px solid var(--border2);">'+rarLbl+'</span><span class="badge b-gray">'+slLbl+'</span>'+(it.isCosmetic?'<span class="badge b-purple">Cosmètic</span>':'')+(isConsumable(it.id)?'<span class="badge b-gold">🍴 Consumible</span>':'')+(itemDur(it.id)?'<span class="badge b-gray">⏳ '+itemDur(it.id)+' dies</span>':'')+'</div>'
    +'</div>'
    +(it.desc?'<div style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:1rem;padding:.75rem;background:var(--bg3);border-radius:var(--radius);">'+it.desc+'</div>':'')
    +'<div class="stitle">Bonus d\'atributs</div><div style="margin-bottom:1rem;">'+bonus+'</div>'
    +'<div class="stitle">Requisits</div><div style="margin-bottom:1rem;">'+reqs+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
      +'<div class="csm" style="text-align:center;"><div style="font-size:16px;font-weight:600;"><span class="coin"></span> '+(it.cost||0)+'</div><div style="font-size:10px;color:var(--muted);">Cost</div></div>'
      +'<div class="csm" style="text-align:center;"><div style="font-size:16px;font-weight:600;">Nvl '+(it.minLevel||1)+'</div><div style="font-size:10px;color:var(--muted);">Nivell mínim</div></div>'
    +'</div>';
  document.getElementById('item-detail-modal').style.display='flex';
}
function closeItemDetails(){var m=document.getElementById('item-detail-modal');if(m)m.style.display='none';}
function invEquipSlot(slot){
  var p=players.find(function(pl){return pl.id===session.playerId;});if(!p)return;
  var compatible=(p.inventory||[]).filter(function(id){var item=shopItems.find(function(i){return i.id===id;});return item&&item.slot===slot;});
  if(!compatible.length){toast('No tens objectes per aquest slot');return;}
  // Ciclo: null (buit) -> item1 -> item2 -> ... -> null
  var cycle=[null].concat(compatible);
  var current=p.equipped?p.equipped[slot]:null;
  var ci=cycle.indexOf(current);
  var next=cycle[(ci+1)%cycle.length];
  if(next)equipItem(next);
  else unequipItem(current);
  renderInventario();
}

/* ══ SHOWCASE ══ */
var _showcaseIdx=null;
function openShowcaseSelector(idx){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p||!(p.gallery||[]).length)return;
  if(!p.showcase)p.showcase=[null,null,null];
  _showcaseIdx=idx;
  var rawIds=typeof p.gallery[0]==='string'?p.gallery:p.gallery.map(function(e){return e.cardId||e;});
  var _seen={};var allIds=rawIds.filter(function(id){if(_seen[id])return false;_seen[id]=true;return true;});/* nomes 1 per carta, sense duplicats */
  // Cartas disponibles: las que no están ya en OTROS huecos del showcase
  var grid=document.getElementById('showcase-grid');
  var html='';
  // Opción para dejar el hueco vacío
  html+='<div onclick="pickShowcaseCard(null)" style="cursor:pointer;border:2px dashed var(--border2);border-radius:var(--radius);min-height:110px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--muted);">— Buit —</div>';
  allIds.forEach(function(id){
    var usedElsewhere=p.showcase.some(function(sc,i){return sc===id&&i!==idx;});
    if(usedElsewhere)return;
    var card=gachaCards.find(function(x){return x.id===id;});
    if(!card)return;
    var url=card.imageUrl||CFG.GITHUB_RAW+card.image;
    var isCurrent=p.showcase[idx]===id;
    html+='<div onclick="pickShowcaseCard(\''+id+'\')" style="cursor:pointer;border:2px solid '+(isCurrent?'var(--accent)':'var(--border)')+';border-radius:var(--radius);overflow:hidden;position:relative;'+(isCurrent?'box-shadow:0 0 12px var(--accent-border);':'')+'">'
      +'<img src="'+url+'" alt="'+card.name+'" style="width:100%;height:110px;object-fit:cover;display:block;" onerror="this.style.opacity=0"/>'
      +'<div style="font-size:10px;text-align:center;padding:3px;background:var(--bg3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+card.name+'</div>'
      +'</div>';
  });
  grid.innerHTML=html;
  document.getElementById('showcase-modal').style.display='flex';
}
function pickShowcaseCard(cardId){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p||_showcaseIdx===null)return;
  if(!p.showcase)p.showcase=[null,null,null];
  p.showcase[_showcaseIdx]=cardId;
  if(CFG.MODE==='supabase')saveToSupabase();
  closeShowcaseModal();
  renderHeroProfile(curHero);
}
function closeShowcaseModal(){
  var m=document.getElementById('showcase-modal');if(m)m.style.display='none';
  _showcaseIdx=null;
}


/* ══ MISSION MODAL ══ */
function openMissionModal(id){
  const m=missions.find(mx=>mx.id===id);if(!m)return;
  const p=players.find(px=>px.id===m.playerId);
  document.getElementById('mm-name').textContent=m.name;
  const statusLabel=m.status==='done'?'Completada':'Pendent';
  const statusCls=m.status==='done'?'b-teal':'b-gray';
  var _prio={A:['Urgente','b-coral'],B:['Importante','b-gold'],C:['Media','b-gray'],D:['Baja','b-teal']}[m.diff]||['Media','b-gray'];
  var _tags=(m.plannerTags&&m.plannerTags.indexOf('weekly:')!==0)?m.plannerTags:'';
  document.getElementById('mm-badges').innerHTML=
    `<span class="badge ${statusCls}">${statusLabel}</span>`
    +`<span class="badge ${_prio[1]}">${_prio[0]}</span>`
    +(m.daily?'<span class="badge b-gold">Diària</span>':'')
    +(_isWeekly(m)?'<span class="badge b-teal">🗓️ Setmanal</span>':'')
    +`<span class="badge b-gray">${m.arc}</span>`
    +(p?`<span class="badge b-purple">${p.emblem} ${p.name}</span>`:'')
    +(_tags?_tags.split(';').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="badge b-gray">${_esc(t)}</span>`).join(''):'');
  document.getElementById('mm-desc').textContent=m.desc||m.name;
  document.getElementById('mm-stats').innerHTML=
    `<div class="smini"><div class="v">${m.xp}</div><div class="l">XP</div></div>`
    +`<div class="smini"><div class="v"><span class="coin"></span> ${fmtGold(m.gold)}</div><div class="l">Or</div></div>`
    +`<div class="smini"><div class="v" style="font-size:.72em;">${_prio[0]}</div><div class="l">Prioritat</div></div>`
    +(m.durationH>0?`<div class="smini"><div class="v" style="font-size:.8em;">${Math.floor(m.durationH)}h ${Math.round((m.durationH%1)*60)}m</div><div class="l">Durada</div></div>`:'')
    +(m.stars>0?`<div class="smini"><div class="v" style="font-size:.8em;">${'⭐'.repeat(m.stars)}</div><div class="l">Estrelles</div></div>`:'');
  const canComplete=(session.isAdmin||(session.playerId===m.playerId))&&m.status!=='done';
  const canDel=session.isAdmin||(m.createdBy===session.playerId);
  if(session.isAdmin){
    var _asg=getAssignees(m).map(function(a){return a.id;});
    var box=document.getElementById('mm-assign');
    if(box){
      box.style.display='block';
      box.innerHTML='<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">🔧 Estat (canvi manual, sense recompensa):</div>'
        +'<div style="display:flex;gap:6px;margin-bottom:12px;">'
        +'<span class="filter-chip'+(m.status!=='done'?' active':'')+'" style="cursor:pointer;" onclick="setMissionStatus(\''+m.id+'\',\'pending\')">Pendent</span>'
        +'<span class="filter-chip'+(m.status==='done'?' active':'')+'" style="cursor:pointer;" onclick="setMissionStatus(\''+m.id+'\',\'done\')">Completada</span>'
        +'</div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">👥 Assignar a (pots triar-ne diverses):</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'+players.map(function(pl){
          var on=_asg.indexOf(pl.id)>=0;
          return '<label class="filter-chip'+(on?' active':'')+'" style="cursor:pointer;display:inline-flex;align-items:center;gap:5px;">'
            +'<input type="checkbox" '+(on?'checked':'')+' style="display:none;" onchange="toggleMissionAssignee(\''+m.id+'\',\''+pl.id+'\');openMissionModal(\''+m.id+'\')">'
            +pl.emblem+' '+pl.name.split(' ')[0]+'</label>';
        }).join('')+'</div>';
    }
  }else{var box2=document.getElementById('mm-assign');if(box2)box2.style.display='none';}
  var canClaim=(m.status==='done'&&rewardsPending[m.id]&&(session.isAdmin||(p&&session.playerId===p.id)));
  document.getElementById('mm-actions').innerHTML=
    (canClaim?`<button class="btn btn-p" style="background:linear-gradient(135deg,var(--gold),#c98a12);border-color:transparent;" onclick="claimMissionReward('${m.id}');closeMissionModal();">🎁 Reclamar recompensa</button>`:'')
    +(canComplete?`<button class="btn btn-p" onclick="completeMission('${m.id}');closeMissionModal();">✓ Completar</button>`:'')
    +(canDel?`<button class="btn" style="background:var(--coral-bg);color:var(--coral);" onclick="deleteMission('${m.id}');closeMissionModal();">🗑️ Eliminar</button>`:'')
    +`<button class="btn" onclick="closeMissionModal()">Tancar</button>`;
  const modal=document.getElementById('mission-modal');
  modal.style.display='flex';
}
function closeMissionModal(){
  document.getElementById('mission-modal').style.display='none';
}


/* ══ REANOMENAR MENÚS (ADMIN) ══ */
// Noms per defecte de TOTES les pestanyes (l'admin pot sobreescriure qualsevol)
var menuDefaults={
  inicio:'Inici',misiones:'Missions',heroe:'Herois',arcos:'Arcs',ranking:'Rànquing',
  gacha:'Gacha',tienda:'Botiga',mercat:'Mercat negre',inventario:'Inventari',
  calendario:'Calendari',planner:'Planner','items-admin':'Items','classes-admin':'Classes','widgets-admin':'Widgets'
};
var menuNames={}; // només sobreescriptures desades
function menuKeyFromId(id){return (id&&id.indexOf('nav-')===0)?id.slice(4):'';}
function menuLabelFor(key,btn){
  if(menuNames[key])return menuNames[key];
  if(menuDefaults[key])return menuDefaults[key];
  // pestanya nova sense default: fes servir el text actual del botó
  if(btn){var t=(btn.getAttribute('data-label')||'').trim();if(t)return t;}
  return key;
}
function loadMenuNames(){
  var saved=localStorage.getItem('cg_menu_names');
  if(saved){try{menuNames=JSON.parse(saved)||{};}catch(e){menuNames={};}}
  applyMenuNames();
}
function applyMenuNames(){
  // Recorre TOTS els botons de navegació (així també val per a pestanyes noves)
  document.querySelectorAll('.nav .nb').forEach(function(btn){
    var key=menuKeyFromId(btn.id);
    if(!key)return;
    // Desa el text original una sola vegada, per si no hi ha default
    if(!btn.hasAttribute('data-label')){
      var clone=btn.cloneNode(true);
      var ic=clone.querySelector('.nb-icon');if(ic)ic.remove();
      var eb0=clone.querySelector('.nb-edit-btn');if(eb0)eb0.remove();
      btn.setAttribute('data-label',(clone.textContent||'').trim());
    }
    var label=menuLabelFor(key,btn);
    var icon=btn.querySelector('.nb-icon');
    var iconHtml=icon?icon.outerHTML:'';
    btn.innerHTML=iconHtml+label+(session.isAdmin?'<button class="nb-edit-btn" title="Reanomenar">✏️</button>':'');
    if(session.isAdmin){
      var eb=btn.querySelector('.nb-edit-btn');
      if(eb){eb.addEventListener('click',function(ev){ev.stopPropagation();promptRenameMenu(key);});}
    }
  });
}
function promptRenameMenu(key){
  var current=menuNames[key]||menuDefaults[key]||key;
  var newName=prompt('Nou nom per a la pestanya "'+current+'":',current);
  if(newName===null)return;
  newName=newName.trim();
  if(!newName){delete menuNames[key];}   // buit = torna al nom per defecte
  else{menuNames[key]=newName;}
  localStorage.setItem('cg_menu_names',JSON.stringify(menuNames));
  applyMenuNames();
}

/* ══ TOAST ══ */
let toastT;
function toast(msg){/* toasts desactivados a petición del usuario */}

/* ══ TEMA ══ */
function toggleTheme(){
  const html=document.documentElement;
  const isDark=html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme',isDark?'light':'dark');
  localStorage.setItem('cg_theme',isDark?'light':'dark');
}
function initTheme(){
  const saved=localStorage.getItem('cg_theme')||'dark';
  document.documentElement.setAttribute('data-theme',saved);
  const btn=document.getElementById('theme-btn');
  const _tbl=document.getElementById('theme-label');if(_tbl)_tbl.textContent=saved==='dark'?'Mode fosc':'Mode clar';
}

/* ══ RECOLLIR / DESPLEGAR BARRA LATERAL ══ */
function _applySidebarBtn(collapsed){
  var b=document.getElementById('sidebar-toggle');
  if(b){b.textContent=collapsed?'»':'«';b.title=collapsed?'Desplegar menú':'Recollir menú';b.setAttribute('aria-label',b.title);}
}
function toggleSidebar(){
  var collapsed=!document.body.classList.contains('sidebar-collapsed');
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  localStorage.setItem('cg_sidebar',collapsed?'collapsed':'open');
  _applySidebarBtn(collapsed);
}
function initSidebar(){
  var collapsed=localStorage.getItem('cg_sidebar')==='collapsed';
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  _applySidebarBtn(collapsed);
}

/* ══ ARRANCADA ══ */
/* ══ CREAR MISSIONS/ARCS ══ */
function toggleDailyFields(){
  var type=document.getElementById('nm-type').value;
  // La durada només aplica a missions normals (l'or es calcula amb estrelles en completar)
  var durWrap=document.getElementById('nm-dur-wrap');
  if(durWrap)durWrap.style.display=(type==='daily'||type==='weekly')?'none':'block';
}

function populateArcSelect(){
  var sel=document.getElementById('nm-arc');
  if(sel)sel.innerHTML='<option value="">Sense arc</option>'+arcs.map(function(a){
    return '<option value="'+a.name+'">'+a.name+'</option>';
  }).join('');
  var asel=document.getElementById('nm-attr');
  if(asel){var cur=asel.value;asel.innerHTML=attrKeys().map(function(k){return '<option value="'+k+'">'+attrIcon(k)+' '+attrName(k)+'</option>';}).join('');if(cur)asel.value=cur;}
  // Assignació múltiple (només admin la veu; si no, s'assigna a un mateix)
  var asgWrap=document.getElementById('nm-assign-wrap');
  if(asgWrap)asgWrap.style.display=session.isAdmin?'':'none';
  var box=document.getElementById('nm-assign-box');
  if(box&&session.isAdmin){
    box.innerHTML=players.map(function(p){
      return '<label class="filter-chip" style="cursor:pointer;"><input type="checkbox" class="nm-assign-cb" value="'+p.id+'" style="margin-right:5px;">'+p.emblem+' '+p.name.split(' ')[0]+'</label>';
    }).join('');
    box.querySelectorAll('.nm-assign-cb').forEach(function(cb){cb.onchange=function(){this.closest('label').classList.toggle('active',this.checked);};});
  }
}

function createMission(){
  var name=document.getElementById('nm-name').value.trim();
  if(!name){toast('La missió necessita un nom.');return;}
  var type=document.getElementById('nm-type').value;
  var isDaily=type==='daily';
  var isWeekly=type==='weekly';
  var arc=document.getElementById('nm-arc').value;
  var deadline=document.getElementById('nm-deadline').value;
  var attrKey=document.getElementById('nm-attr')?document.getElementById('nm-attr').value:'';
  var attrName_=attrKey?attrName(attrKey):'';
  var attrPts=parseInt(document.getElementById('nm-attrpts')?document.getElementById('nm-attrpts').value:'0')||0;
  // Prioritat (només etiqueta/grau, es desa a "diff")
  var priorityMap={'urgente':'A','importante':'B','media':'C','baja':'D'};
  var prio=(document.getElementById('nm-priority')?document.getElementById('nm-priority').value:'media');
  var prioDiff=priorityMap[prio]||'C';
  // Durada → hores decimals (per calcular l'or en completar, segons estrelles)
  var durH=parseInt(document.getElementById('nm-dur-h')?document.getElementById('nm-dur-h').value:'0')||0;
  var durM=parseInt(document.getElementById('nm-dur-m')?document.getElementById('nm-dur-m').value:'0')||0;
  var durationH=durH+durM/60;
  // Assignació múltiple: admin tria (checkboxes); la resta s'assigna a un mateix
  var assignIds=[];
  if(session.isAdmin){
    var _cbs=document.querySelectorAll('.nm-assign-cb:checked');
    _cbs.forEach(function(cb){assignIds.push(cb.value);});
  }else if(session.playerId){assignIds=[session.playerId];}
  var assignTo=assignIds[0]||'';
  // Etiquetes
  var tags=(document.getElementById('nm-tags')?document.getElementById('nm-tags').value.trim():'');
  if(isWeekly){
    weeklyTemplates.push({id:'wt'+Date.now(),name:name,desc:document.getElementById('nm-desc')?document.getElementById('nm-desc').value.trim():'',arc:arc||'General',playerId:assignTo||session.playerId,diff:prioDiff,xp:MISSION_XP,gold:MISSION_GOLD,frag:MISSION_FRAG,attr:attrName_,attrPts:attrPts});
    checkWeeklyMissions();
    if(CFG.MODE==='supabase')saveToSupabase();
    document.getElementById('nm-name').value='';
    document.getElementById('nm-deadline').value='';
    var _pw=document.getElementById('panel-new-mission');if(_pw)_pw.removeAttribute('open');
    renderAll();
    return;
  }
  var newM={
    id:'m'+Date.now(),
    name:name,
    desc:document.getElementById('nm-desc')?document.getElementById('nm-desc').value.trim():'',
    arc:arc||'General',
    playerId:isDaily?session.playerId:(assignTo||''),
    status:'pending',
    diff:isDaily?'C':prioDiff,
    xp:MISSION_XP,
    // Missió normal: l'or es calcula en completar (durada × estrelles). Diària: or fix.
    gold:isDaily?MISSION_GOLD:0,
    durationH:isDaily?0:durationH,
    frag:MISSION_FRAG,
    attr:attrName_,
    attrPts:attrPts,
    deadline:isDaily?'':deadline||'',
    daily:isDaily,
    isDaily_instance:false,
    plannerId:'',
    createdBy:session.playerId,
    plannerTags:(!isDaily&&tags)?tags:''
  };
  // Check daily limit
  if(isDaily){
    var myDailies=missions.filter(function(m){return m.daily&&!m.id.includes('_');});
    if(myDailies.length>=4){toast('Màxim 4 missions diàries globals.');return;}
  }
  missions.push(newM);
  if(!isDaily&&assignIds.length>1)missionAssignees[newM.id]=assignIds.slice();
  if(isDaily)checkDailyMissions();
  if(CFG.MODE==='supabase')saveToSupabase(assignIds);
  document.getElementById('nm-name').value='';
  document.getElementById('nm-deadline').value='';
  var _nt=document.getElementById('nm-tags');if(_nt)_nt.value='';
  document.querySelectorAll('.nm-assign-cb:checked').forEach(function(cb){cb.checked=false;cb.closest('label').classList.remove('active');});
  document.getElementById('panel-new-mission').removeAttribute('open');
  renderAll();
}

function createArc(){
  var name=document.getElementById('na-name').value.trim();
  if(!name){toast('L\'arc necessita un nom.');return;}
  var newArc={
    id:'arc'+Date.now(),
    name:name,
    lore:document.getElementById('na-desc').value.trim()||'Un nou capítol comença.',
    status:document.getElementById('na-status').value,
    total:0,done:0,
    createdBy:session.playerId
  };
  arcs.push(newArc);
  if(CFG.MODE==='supabase')saveToSupabase();
  populateArcSelect();
  document.getElementById('na-name').value='';
  document.getElementById('na-desc').value='';
  document.getElementById('panel-new-arc').removeAttribute('open');
  renderAll();populateArcSelect();
}

/* ══ ARRANQUE DE LA APP ══ */
function hideBootLoader(){var b=document.getElementById('boot-loader');if(b){b.classList.add('hide');setTimeout(function(){if(b&&b.parentNode)b.parentNode.removeChild(b);},400);}}
// PWA: registrar el service worker (instal·lable + càrrega ràpida)
if('serviceWorker' in navigator){window.addEventListener('load',function(){
  var hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(function(reg){
    // Comprova si hi ha una versió nova cada 60s (sense recarregar res encara)
    setInterval(function(){reg.update().catch(function(){});},60000);
  }).catch(function(e){console.warn('SW no registrat',e);});
  var reloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(reloaded||!hadController)return; // no recarreguis en la primera instal·lació
    reloaded=true;location.reload();
  });
});}
(async()=>{
  initTheme();
  try{initSidebar();}catch(e){}
  try{
    await loadData();
    loadMenuNames();
    const sid=localStorage.getItem('cg_pid');
    if(sid){
      const p=players.find(p=>p.id===sid);
      if(p){
        session={loggedIn:true,isAdmin:false,playerId:sid};
        const idx=players.findIndex(pl=>pl.id===sid);if(idx>=0)curHero=idx;
        enterApp();return;
      }
    }
    showScreen('screen-welcome');
  }finally{
    hideBootLoader();
  }
})();

// Accessibilitat: tancar modals amb la tecla Escape
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  ['mission-modal','server-backups-modal','showcase-modal','widget-picker-modal','modal-edit','avatar-editor-modal','modal-admin-edit','item-detail-modal'].forEach(function(id){
    var el=document.getElementById(id);
    if(el&&getComputedStyle(el).display!=='none'){el.style.display='none';}
  });
  // Modals que s'obren/tanquen per classe .show
  ['reward-pop','levelup-pop','cal-event-modal','star-ask','banner-editor'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.classList.remove('show');
  });
  var um=document.getElementById('umenu-inline');if(um)um.style.display='none';
});

// Cuando la librería DiceBear termina de cargar (asíncrono), refrescar avatares
window.addEventListener('dicebear-ready',function(){
  try{
    updateSidebarAvatar();
    var hp=document.getElementById('page-heroe');
    if(hp&&hp.classList.contains('active')&&typeof curHero!=='undefined')renderHeroProfile(curHero);
    var am=document.getElementById('avatar-editor-modal');
    if(am&&am.style.display==='flex')renderAvatarEditor();
  }catch(e){}
});

/* ══ PANORÀMICA (dashboard setmanal de l'equip) ══ */
var panoOffset=0;
function panoNav(d){panoOffset+=d;if(panoOffset>0)panoOffset=0;renderPanoramica();}
// ── Personalitzar el banner (cada jugador el seu) ──
function openBannerEditor(){
  var p=players.find(function(x){return x.id===session.playerId;});if(!p)return;
  var ov=document.getElementById('banner-editor');
  if(!ov){ov=document.createElement('div');ov.id='banner-editor';ov.className='reward-pop';document.body.appendChild(ov);}
  ov.className='reward-pop show';ov.style.zIndex=500;
  _beMode=(p.bannerPortraitMode==='photo')?'photo':'avatar';
  var pv=p.bannerPortrait||'';
  ov.innerHTML='<div class="reward-box" style="max-width:440px;text-align:left;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">'
    +'<div style="font-family:var(--font-display);font-size:20px;font-weight:700;margin-bottom:14px;">Personalitzar banner</div>'
    +'<div class="field"><label>Frase / lema</label><input type="text" id="be-quote" maxlength="140" value="'+_esc(p.quote||'')+'" placeholder="El teu lema..."/></div>'
    +'<div class="field"><label>Color del banner</label><input type="color" id="be-color" value="'+(/^#[0-9a-fA-F]{6}$/.test(p.bannerColor||p.color||'')?(p.bannerColor||p.color):'#7f77dd')+'" style="height:40px;padding:3px;"/></div>'
    +'<div class="field"><label>Imatge de fons (opcional)</label><input type="text" id="be-img" value="'+_esc(p.bannerImg||'')+'" placeholder="Enganxa una URL..."/>'
      +'<label class="btn btn-sm" style="margin-top:6px;display:inline-block;">⬆ Pujar imatge de fons<input type="file" accept="image/*" style="display:none" onchange="bannerUpload(this,\'be-img\')"></label></div>'
    +'<div class="field"><label>Retrat</label>'
      +'<div class="be-seg"><button type="button" class="'+(_beMode==='avatar'?'active':'')+'" onclick="beSetMode(\'avatar\')">Avatar del joc</button><button type="button" class="'+(_beMode==='photo'?'active':'')+'" onclick="beSetMode(\'photo\')">Foto</button></div></div>'
    +'<div class="field" id="be-photo-box" style="'+(_beMode==='photo'?'':'display:none;')+'">'
      +'<input type="text" id="be-portrait" value="'+_esc(pv)+'" placeholder="URL de la foto..."/>'
      +'<label class="btn btn-sm" style="margin-top:6px;display:inline-block;">⬆ Pujar foto<input type="file" accept="image/*" style="display:none" onchange="bannerUpload(this,\'be-portrait\')"></label>'
      +'<img id="be-portrait-prev" src="'+_esc(pv)+'" style="'+(pv?'':'display:none;')+'max-height:90px;border-radius:8px;margin-top:8px;"/></div>'
    +'<div style="display:flex;gap:8px;justify-content:space-between;margin-top:16px;">'
      +'<button class="btn btn-sm" onclick="resetBanner()">↺ Restablir</button>'
      +'<div style="display:flex;gap:8px;"><button class="btn btn-sm" onclick="closeBannerEditor()">Cancel·lar</button><button class="btn btn-sm btn-p" onclick="saveBanner()">Desar</button></div>'
    +'</div>'
  +'</div>';
  ov.onclick=function(){closeBannerEditor();};
}
function closeBannerEditor(){var ov=document.getElementById('banner-editor');if(ov)ov.className='reward-pop';}
var _beMode='avatar';
function beSetMode(m){_beMode=m;
  var box=document.getElementById('be-photo-box');if(box)box.style.display=(m==='photo')?'':'none';
  var segs=document.querySelectorAll('#banner-editor .be-seg button');segs.forEach(function(b,i){b.classList.toggle('active',(i===0&&m==='avatar')||(i===1&&m==='photo'));});
}
// Puja el JPEG redimensionat a Supabase Storage (bucket "banners"). Retorna la URL pública.
// Si el bucket no existeix o falla, es rebutja i el codi cau al dataURL (base64) — mai es perd la imatge.
function _uploadBanner(blob,kind){
  var path=(session.playerId||'anon')+'_'+kind+'.jpg';
  var up=CFG.SUPABASE_URL+'/storage/v1/object/banners/'+encodeURIComponent(path);
  return fetch(up,{method:'POST',headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'image/jpeg','x-upsert':'true'},body:blob})
    .then(function(res){if(!res.ok)throw new Error('storage '+res.status);
      return CFG.SUPABASE_URL+'/storage/v1/object/public/banners/'+encodeURIComponent(path)+'?t='+Date.now();});
}
// Puja una imatge (redimensionada): la mostra a l'instant en base64 i, en paral·lel, intenta desar-la
// a Storage. Si ho aconsegueix, el camp guarda la URL (blob petit); si no, es queda el base64.
function bannerUpload(input,targetId){
  var f=input.files&&input.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(e){
    var img=new Image();
    img.onload=function(){
      var max=(targetId==='be-img')?1000:600;var w=img.width,h=img.height;var sc=Math.min(1,max/Math.max(w,h));
      var cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(h*sc));
      var cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
      cv.getContext('2d').drawImage(img,0,0,cw,ch);
      var data=cv.toDataURL('image/jpeg',0.82);
      var fld=document.getElementById(targetId);if(fld)fld.value=data;
      var prev=(targetId==='be-portrait')?document.getElementById('be-portrait-prev'):null;
      if(prev){prev.src=data;prev.style.display='block';}
      // Intent de pujada a Storage (no bloqueja la vista prèvia); si falla, es queda el base64.
      var kind=(targetId==='be-img')?'bg':'portrait';
      var toBlob=function(cb){if(cv.toBlob)cv.toBlob(cb,'image/jpeg',0.82);else cb(null);};
      toBlob(function(blob){
        if(!blob)return;
        _uploadBanner(blob,kind).then(function(url){
          if(fld)fld.value=url;
          if(prev)prev.src=url;
        }).catch(function(){/* fallback: es manté el base64 al camp */});
      });
    };
    img.src=e.target.result;
  };
  r.readAsDataURL(f);
}
function saveBanner(){
  var p=players.find(function(x){return x.id===session.playerId;});if(!p)return;
  var q=document.getElementById('be-quote');if(q)p.quote=q.value.trim();
  var c=document.getElementById('be-color');if(c)p.bannerColor=c.value;
  var im=document.getElementById('be-img');if(im)p.bannerImg=im.value.trim();
  var po=document.getElementById('be-portrait');if(po)p.bannerPortrait=po.value.trim();
  p.bannerPortraitMode=_beMode;
  if(CFG.MODE==='supabase')saveToSupabase();
  closeBannerEditor();renderPanoramica();
}
function resetBanner(){
  var p=players.find(function(x){return x.id===session.playerId;});if(!p)return;
  delete p.bannerColor;delete p.bannerImg;delete p.bannerPortrait;delete p.bannerPortraitMode;
  if(CFG.MODE==='supabase')saveToSupabase();
  closeBannerEditor();renderPanoramica();
}
try{window.openBannerEditor=openBannerEditor;window.closeBannerEditor=closeBannerEditor;window.saveBanner=saveBanner;window.resetBanner=resetBanner;window.beSetMode=beSetMode;window.bannerUpload=bannerUpload;}catch(e){}
function _panoWeek(offset){
  var r=_statsRange('week',offset);
  var names=['Dl','Dt','Dc','Dj','Dv'];var days=[];
  for(var i=0;i<5;i++){var dd=new Date(r.start);dd.setDate(r.start.getDate()+i);days.push({key:dd.toISOString().slice(0,10),label:names[i]});}
  return {start:r.start,end:r.end,label:r.label,days:days};
}
// Agregació setmanal de TOT l'equip (ignora el filtre de persona de les Analítiques)
function _panoAgg(start,end){
  var s=start.toISOString(),e=end.toISOString();
  var A={missions:0,hours:0,gold:0,xp:0,starsSum:0,starsN:0,byPid:{},byTag:{},byArc:{}};
  statsLog.forEach(function(x){
    if(!(x.t>=s&&x.t<e))return;
    A.missions++;A.hours+=x.hours||0;A.gold+=x.gold||0;A.xp+=x.xp||0;
    if(x.stars>0){A.starsSum+=x.stars;A.starsN++;}
    var b=A.byPid[x.pid]=A.byPid[x.pid]||{hours:0,gold:0,xp:0,missions:0,byDay:{},attrs:{}};
    b.hours+=x.hours||0;b.gold+=x.gold||0;b.xp+=x.xp||0;b.missions++;
    var day=x.t.slice(0,10);b.byDay[day]=b.byDay[day]||{hours:0,gold:0};b.byDay[day].hours+=x.hours||0;b.byDay[day].gold+=x.gold||0;
    (x.tags||[]).forEach(function(tg){A.byTag[tg]=(A.byTag[tg]||0)+1;});
    A.byArc[x.arc||'General']=(A.byArc[x.arc||'General']||0)+1;
    if(x.attr&&x.attrPts){b.attrs[x.attr]=(b.attrs[x.attr]||0)+x.attrPts;}
  });
  return A;
}
function _panoDonut(segs,centerLbl){
  var total=segs.reduce(function(s,x){return s+(x.value||0);},0);
  var r=54,c=2*Math.PI*r,off=0;
  var arcs=segs.filter(function(s){return s.value>0;}).map(function(s){
    var len=(total?s.value/total:0)*c;
    var el='<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="'+s.color+'" stroke-width="16" stroke-linecap="butt" stroke-dasharray="'+len.toFixed(2)+' '+(c-len).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 70 70)"/>';
    off+=len;return el;
  }).join('');
  return '<svg viewBox="0 0 140 140" class="pano-donut"><circle cx="70" cy="70" r="'+r+'" fill="none" stroke="var(--bg3)" stroke-width="16"/>'+arcs
    +'<text x="70" y="68" text-anchor="middle" class="pano-donut-num">'+total+'</text>'
    +'<text x="70" y="86" text-anchor="middle" class="pano-donut-lbl">'+(centerLbl||'TOTAL')+'</text></svg>';
}
function _panoStack(week,persons,valFn,fmtFn){
  var dayTot=week.days.map(function(d){return persons.reduce(function(s,p){return s+(valFn(p.id,d.key)||0);},0);});
  var maxD=Math.max.apply(null,dayTot.concat([1]));
  return '<div class="pano-bars">'+week.days.map(function(d,di){
    var segs=persons.map(function(p){var v=valFn(p.id,d.key)||0;if(v<=0)return '';var h=(v/maxD)*100;return '<div class="pano-seg" style="height:'+h.toFixed(1)+'%;background:'+p.color+';" title="'+_esc(p.name)+': '+fmtFn(v)+'"></div>';}).join('');
    var tot=dayTot[di];
    return '<div class="pano-col"><div class="pano-coltot">'+(tot>0?fmtFn(tot):'')+'</div><div class="pano-bar">'+segs+'</div><div class="pano-collbl">'+d.label+'</div></div>';
  }).join('')+'</div>';
}
function _panoPersonList(persons,valFn,fmtFn){
  var arr=persons.map(function(p){return {p:p,v:valFn(p.id)};}).sort(function(a,b){return b.v-a.v;});
  return '<div class="pano-plist">'+arr.map(function(x){
    return '<div class="pano-prow"><span class="pano-pdot" style="background:'+x.p.color+';"></span><span class="pano-pemb">'+(x.p.emblem||'')+'</span><span class="pano-pname">'+_esc((x.p.name||'').split(' ')[0])+'</span><span class="pano-pval">'+fmtFn(x.v)+'</span></div>';
  }).join('')+'</div>';
}
function renderPanoramica(){
  var host=document.getElementById('pano-body');if(!host)return;
  var week=_panoWeek(panoOffset);
  var A=_panoAgg(week.start,week.end);
  var prev=_panoWeek(panoOffset-1);var Ap=_panoAgg(prev.start,prev.end);
  var persons=players.filter(function(p){return p&&p.id;});
  var coin='<span class="coin"></span>';
  // Banner: jugador de la sessió (o genèric si admin)
  var me=players.find(function(p){return p.id===session.playerId;});
  var avatarHtml='<div style="font-size:88px;">👑</div>';
  if(me){try{getPlayerAvatar(me);avatarHtml=frameWrap(me,renderAvatar(me,'pixel-avatar-lg'));}catch(e){avatarHtml='<div style="font-size:88px;">'+(me.emblem||'🦸')+'</div>';}}
  var bReal=me?(me.realName||''):'Quarter General';
  var bName=me?me.name:'DÉU';
  var bClass=me?me.cls:'Administrador';
  var bQuote=me?(me.quote||''):'Tens el control absolut del Quarter General.';
  var bColor=me?(me.bannerColor||me.color):'#e4a428';
  var bImg=me?(me.bannerImg||''):'';
  var bPortrait=(me&&me.bannerPortraitMode==='photo')?(me.bannerPortrait||''):'';
  var now=new Date();
  var _mAbbr=['gen.','febr.','març','abr.','maig','juny','jul.','ag.','set.','oct.','nov.','des.'];
  var dateStr=now.getDate()+' '+_mAbbr[now.getMonth()]+' '+now.getFullYear();
  var dow=now.toLocaleDateString('ca-ES',{weekday:'long'}).toUpperCase();
  // Retrat personalitzat (imatge) o avatar per defecte
  if(bPortrait)avatarHtml='<img src="'+_esc(bPortrait)+'" alt="" onerror="this.style.display=\'none\'"/>';
  // Fons del banner: imatge personalitzada o degradat del color
  var bnStyle='--pc:'+bColor+';';
  if(bImg)bnStyle+="background-image:linear-gradient(90deg,var(--bg2) 4%,color-mix(in srgb,var(--bg2) 55%,transparent) 42%,transparent 78%),url('"+encodeURI(bImg).replace(/'/g,'%27')+"');background-size:cover;background-position:center;";
  var editBtn=me?'<button class="pano-banner-edit" onclick="openBannerEditor()" title="Personalitzar banner" aria-label="Personalitzar banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>':'';
  var banner='<div class="pano-banner'+(bImg?' has-img':'')+'" style="'+bnStyle+'">'
    +editBtn
    +'<div class="pano-banner-text">'
      +(bReal?'<div class="pano-realname">'+_esc(bReal)+'</div>':'')
      +'<div class="pano-charname">'+_esc(bName)+'</div>'
      +'<div class="pano-class">'+_esc(bClass)+' —</div>'
      +(bQuote?'<div class="pano-quote">"'+_esc(bQuote)+'"</div>':'')
    +'</div>'
    +'<div class="pano-banner-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/></svg><span class="pbd-txt">'+dateStr+'<br><span class="pbd-dow">'+dow+'</span></span></div>'
    +'<div class="pano-banner-avatar">'+avatarHtml+'</div>'
  +'</div>';
  // Navegació setmanal
  var nav='<div class="pano-nav"><button onclick="panoNav(-1)" aria-label="Anterior">‹</button><span>'+_esc(week.label)+'</span><button onclick="panoNav(1)" '+(panoOffset>=0?'disabled':'')+' aria-label="Següent">›</button></div>';
  // KPIs
  var avg=A.starsN?(A.starsSum/A.starsN):0;
  var objH=35;var hPct=Math.min(100,Math.round(A.hours/objH*100));
  function kpi(icon,label,value,sub,bar){return '<div class="pano-kpi"><div class="pano-kpi-ico">'+icon+'</div><div class="pano-kpi-lbl">'+label+'</div><div class="pano-kpi-val">'+value+'</div>'+(bar!=null?'<div class="pano-kpi-bar"><div style="width:'+bar+'%;"></div></div>':'')+(sub?'<div class="pano-kpi-sub">'+sub+'</div>':'')+'</div>';}
  var _ic=function(paths){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';};
  var icClock=_ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
  var icDoc=_ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>');
  var icRefresh=_ic('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>');
  var icTarget=_ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>');
  var kpis='<div class="pano-kpis">'
    +kpi(icClock,'HORES COMPUTADES',_fmtH(A.hours),'Objectiu setmanal: '+objH+'h',hPct)
    +kpi(icDoc,'ASSISTÈNCIES RESOLTES',A.missions,'Setmana passada: '+Ap.missions,null)
    +kpi(icRefresh,'PROJECTES ACTUALITZATS','—','(sense dades encara)',null)
    +kpi(icTarget,'SATISFACCIÓ',(function(){if(!avg)return '—';var pc=Math.round(avg/5*100);var col=pc>=75?'var(--teal)':pc>=50?'var(--gold)':'var(--coral)';return '<span style="color:'+col+'">'+pc+'%</span>';})(),(avg?('<span class="pano-stars">'+'★'.repeat(Math.round(avg))+'<span class="off">'+'★'.repeat(5-Math.round(avg))+'</span></span>'):'sense valoracions'),null)
  +'</div>';
  // Llista de persones: SEMPRE mostra l'or total sota el nom; el badge de la dreta canvia (hores o or setmanal)
  function _panoList(badgeFn,badgeFmt){
    return '<div class="pano-plist2">'+persons.map(function(p){
      var bv=badgeFn(p.id)||0;
      return '<div class="pano-prow2"><span class="pano-pdot" style="background:'+p.color+';"></span><span class="pano-pemb">'+(p.emblem||'')+'</span>'
        +'<div class="pano-pmain"><div class="pano-pname" style="color:'+p.color+';">'+_esc((p.name||'').split(' ')[0])+'</div><div class="pano-psub"><span class="coin"></span> '+fmtGold(p.gold||0)+'</div></div>'
        +'<span class="pano-pbadge'+(bv>0?' up':'')+'">'+(bv>0?'+'+badgeFmt(bv):'—')+'</span></div>';
    }).join('')+'</div>';
  }
  // Hores computades: barres d'hores + llista (badge = hores setmanals)
  var hoursCard='<div class="card pano-card"><div class="pano-cardhead"><div class="stitle">Hores computades</div></div>'
    +'<div class="pano-chartrow">'+_panoStack(week,persons,function(pid,day){var b=A.byPid[pid];return b&&b.byDay[day]?b.byDay[day].hours:0;},function(v){return _fmtH(v);})
    +_panoList(function(pid){var b=A.byPid[pid];return b?b.hours:0;},function(v){return _fmtH(v);})+'</div>'
    +'<div class="pano-cardfoot">⏱️ Total setmanal <b>'+_fmtH(A.hours)+'</b></div></div>';
  // Or aconseguit: barres d'or + llista (badge = or setmanal)
  var goldCard='<div class="card pano-card"><div class="pano-cardhead"><div class="stitle">Or aconseguit</div></div>'
    +'<div class="pano-chartrow">'+_panoStack(week,persons,function(pid,day){var b=A.byPid[pid];return b&&b.byDay[day]?b.byDay[day].gold:0;},function(v){return fmtGold(v);})
    +_panoList(function(pid){var b=A.byPid[pid];return b?b.gold:0;},function(v){return fmtGold(v);})+'</div>'
    +'<div class="pano-cardfoot">'+coin+' Total setmanal <b>+'+fmtGold(A.gold)+' or</b></div></div>';
  // Donut estat de tasques (missions actuals)
  var realM=missions.filter(function(m){return !m.isDaily_instance;});
  var doneN=realM.filter(function(m){return m.status==='done';}).length;
  var pendN=realM.filter(function(m){return m.status!=='done';}).length;
  var statusSegs=[{value:pendN,color:'#e4a428',label:'En curs'},{value:doneN,color:'#1d9e75',label:'Completades'}];
  var statusLegend=statusSegs.map(function(s){return '<div class="pano-leg"><span class="pano-legdot" style="background:'+s.color+';"></span><span class="pano-leglbl">'+s.label+'</span><span class="pano-legn">'+s.value+'</span></div>';}).join('');
  var statusCard='<div class="card pano-card"><div class="stitle">Estat de les tasques</div><div class="pano-donutrow">'+_panoDonut(statusSegs,'TOTAL')+'<div class="pano-legs">'+statusLegend+'</div></div></div>';
  // Donut categories (per etiqueta; si no n'hi ha, per arc)
  var catObj=Object.keys(A.byTag).length?A.byTag:A.byArc;
  var CATCOL=['#e4a428','#7f77dd','#1d9e75','#378add','#d85a30','#c065b0','#5bc0be'];
  var catEntries=Object.keys(catObj).map(function(k){return [k,catObj[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,7);
  var catSegs=catEntries.map(function(e,i){return {value:e[1],color:CATCOL[i%CATCOL.length],label:e[0]};});
  var catLegend=catSegs.length?catSegs.map(function(s){return '<div class="pano-leg"><span class="pano-legdot" style="background:'+s.color+';"></span><span class="pano-leglbl">'+_esc(s.label)+'</span><span class="pano-legn">'+s.value+'</span></div>';}).join(''):'<div class="pano-empty">Sense categories aquesta setmana.</div>';
  var catCard='<div class="card pano-card"><div class="stitle">Categories reiteratives</div><div class="pano-donutrow">'+_panoDonut(catSegs,'TOTAL')+'<div class="pano-legs">'+catLegend+'</div></div></div>';
  // Atributs guanyats per persona — nom a dalt, quadrats a sota (compacte, en graella)
  var attrItems=attrKeys().map(function(k){
    var cells=persons.map(function(p){var v=(A.byPid[p.id]&&A.byPid[p.id].attrs[k])||0;return '<span class="pano-attr-box" style="border-color:'+p.color+';color:'+(v!==0?p.color:'var(--muted)')+';" title="'+_esc(p.name)+'">'+(v>0?'+'+v:(v<0?v:'0'))+'</span>';}).join('');
    var tot=persons.reduce(function(s,p){return s+((A.byPid[p.id]&&A.byPid[p.id].attrs[k])||0);},0);
    return '<div class="pano-attr-item"><div class="pano-attr-name">'+attrIcon(k)+' '+_esc(attrName(k).split('(')[0].trim())+' <b>+'+tot+'</b></div><div class="pano-attr-boxes">'+cells+'</div></div>';
  }).join('');
  var attrCard='<div class="card pano-card"><div class="stitle">Atributs guanyats</div><div class="pano-attr-wrap">'+attrItems+'</div></div>';
  // Nivell i XP: progrés dins del nivell, XP que falta per pujar i XP guanyada la setmana
  var lvlRows=persons.map(function(p){
    var xp=p.xp||0;var lvl=levelFromXp(xp);
    var inLvl=Math.max(0,Math.min(XP_PER_LEVEL,xp-(lvl-1)*XP_PER_LEVEL));
    var rem=lvl>=MAX_LEVEL?0:(XP_PER_LEVEL-inLvl);var pct=Math.round(inLvl/XP_PER_LEVEL*100);
    var xpw=(A.byPid[p.id]&&A.byPid[p.id].xp)||0;
    return '<div class="pano-hprow">'
      +'<div class="pano-hp-id"><span class="pano-pdot" style="background:'+p.color+';"></span><span class="pano-pemb">'+(p.emblem||'')+'</span><span class="pano-hp-name" style="color:'+p.color+';">'+_esc((p.name||'').split(' ')[0])+'</span></div>'
      +'<div class="pano-hp-mid"><div class="pano-hp-bar"><div style="width:'+pct+'%;background:'+p.color+';"></div></div><div class="pano-hp-sub">'+inLvl+' / '+XP_PER_LEVEL+' XP'+(rem>0?(' · falten <b>'+rem+'</b>'):' · <b>màxim</b>')+'</div></div>'
      +'<div class="pano-hp-wk'+(xpw>0?' up':'')+'">+'+xpw.toLocaleString()+'<span>XP</span></div>'
      +'<div class="pano-hp-lvl">Nvl '+lvl+'</div>'
    +'</div>';
  }).join('');
  var lvlCard='<div class="card pano-card"><div class="stitle">Nivell i XP guanyada</div><div class="pano-hplist">'+lvlRows+'</div></div>';

  host.innerHTML=banner+nav+kpis
    +'<div class="pano-grid3">'+hoursCard+catCard+statusCard+'</div>'
    +'<div class="pano-grid3">'+goldCard+attrCard+lvlCard+'</div>';
  try{_dashAnimate(host);}catch(e){}
}
// ── Animacions de dashboard (entrada en cascada + comptador ascendent) ──
// Purament visual: no toca dades ni lògica. Respecta "prefers-reduced-motion".
function _dashReduced(){try{return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function _countUp(el,target){
  if(_dashReduced()||!(target>0)||document.hidden){return;}
  var dur=1150,t0=null,done=false;
  function fin(){if(done)return;done=true;el.textContent=target;}
  el.textContent='0';
  function step(ts){if(done)return;if(t0==null)t0=ts;var p=Math.min(1,(ts-t0)/dur);var e=1-Math.pow(1-p,3);el.textContent=Math.round(e*target);if(p<1){requestAnimationFrame(step);}else{fin();}}
  requestAnimationFrame(step);
  setTimeout(fin,dur+400);/* xarxa de seguretat: si rAF es pausa (pestanya oculta), mai es queda a 0 */
}
function _dashStagger(list,cls,base,step){
  Array.prototype.forEach.call(list,function(el,i){el.classList.remove(cls);void el.offsetWidth;el.style.animationDelay=(base+i*step)+'ms';el.classList.add(cls);});
}
function _dashAnimate(root){
  if(!root)return;
  // 1) Entrada en cascada de banner, KPIs i targetes
  _dashStagger(root.querySelectorAll('.pano-banner,.pano-kpi,.pano-card,.stat-kpi,.stats-grid>.card'),'anim-rise',0,75);
  if(_dashReduced())return;
  // 2) Banner: línies de text que entren des de l'esquerra + avatar amb "pop"
  _dashStagger(root.querySelectorAll('.pano-realname,.pano-charname,.pano-class,.pano-quote'),'anim-slideL',160,105);
  var av=root.querySelector('.pano-banner-avatar');if(av){av.classList.remove('anim-pop');void av.offsetWidth;av.style.animationDelay='230ms';av.classList.add('anim-pop');}
  var dt=root.querySelector('.pano-banner-date');if(dt){dt.classList.remove('anim-fade');void dt.offsetWidth;dt.style.animationDelay='460ms';dt.classList.add('anim-fade');}
  // 3) Files internes de cada targeta en cascada (persones, atributs, XP, llegendes)
  _dashStagger(root.querySelectorAll('.pano-prow2'),'anim-rise',320,60);
  _dashStagger(root.querySelectorAll('.pano-attr-item'),'anim-rise',320,60);
  _dashStagger(root.querySelectorAll('.pano-hprow'),'anim-rise',320,60);
  _dashStagger(root.querySelectorAll('.pano-leg'),'anim-slideL',320,70);
  // 4) Comptador ascendent només en valors enters purs (segurs, sense format de locale)
  root.querySelectorAll('.pano-kpi-val,.pano-donut-num,.pano-legn,.stat-kpi .v,.lbstat-v').forEach(function(el){
    var t=(el.textContent||'').trim();
    if(/^\d{1,7}$/.test(t)){_countUp(el,parseInt(t,10));}
  });
}
try{window._dashAnimate=_dashAnimate;}catch(e){}

/* ══ EXPONER FUNCIONES EN WINDOW (para onclick del HTML) ══ */
// Necesario al tener el JS en archivo externo: garantiza que los onclick="fn()" encuentren las funciones.
try{window.applyMenuNames=applyMenuNames;}catch(e){}try{window.assignMission=assignMission;}catch(e){}try{window.buildAttrBars=buildAttrBars;}catch(e){}try{window.buildAvatarUrl=buildAvatarUrl;}catch(e){}try{window.buildCreatorCls=buildCreatorCls;}catch(e){}try{window.buildCreatorColors=buildCreatorColors;}catch(e){}try{window.buildCreatorEmblems=buildCreatorEmblems;}catch(e){}try{window.buildPentagon=buildPentagon;}catch(e){}try{window.buildStartItemsPreview=buildStartItemsPreview;}catch(e){}try{window.consumeItem=consumeItem;}catch(e){}try{window.buyItem=buyItem;}catch(e){}try{window.cGoTo=cGoTo;}catch(e){}try{window.cNext=cNext;}catch(e){}try{window.calNav=calNav;}catch(e){}try{window.canBuyItem=canBuyItem;}catch(e){}try{window.checkDailyMissions=checkDailyMissions;}catch(e){}try{window.checkLevelUp=checkLevelUp;}catch(e){}try{window.classToRow=classToRow;}catch(e){}try{window.cleanOldCompleted=cleanOldCompleted;}catch(e){}try{window.clearPlannerImport=clearPlannerImport;}catch(e){}try{window.closeAdminEditModal=closeAdminEditModal;}catch(e){}try{window.closeAvatarEditor=closeAvatarEditor;}catch(e){}try{window.closeEdit=closeEdit;}catch(e){}try{window.closeEventModal=closeEventModal;}catch(e){}try{window.closeMissionModal=closeMissionModal;}catch(e){}try{window.closeReward=closeReward;}catch(e){}try{window.completeMission=completeMission;}catch(e){}try{window.computeClassBonus=computeClassBonus;}catch(e){}try{window.confirmLevelUp=confirmLevelUp;}catch(e){}try{window.confirmPlannerImport=confirmPlannerImport;}catch(e){}try{window.createArc=createArc;}catch(e){}try{window.createMission=createMission;}catch(e){}try{window.deleteArc=deleteArc;}catch(e){}try{window.deleteEvent=deleteEvent;}catch(e){}try{window.deleteMission=deleteMission;}catch(e){}try{window.deletePlayer=deletePlayer;}catch(e){}try{window.doAdminLogin=doAdminLogin;}catch(e){}try{window.doLogout=doLogout;}catch(e){}try{window.doPull=doPull;}catch(e){}try{window.enterApp=enterApp;}catch(e){}try{window.equipItem=equipItem;}catch(e){}try{window.eventItemHTML=eventItemHTML;}catch(e){}try{window.exportJSON=exportJSON;}catch(e){}try{window.backupData=backupData;}catch(e){}try{window.restoreData=restoreData;}catch(e){}try{window.formatDate=formatDate;}catch(e){}try{window.getAdminProfile=getAdminProfile;}catch(e){}try{window.getEffectiveAttrs=getEffectiveAttrs;}catch(e){}try{window.getFilteredEvents=getFilteredEvents;}catch(e){}try{window.getPlayerAvatar=getPlayerAvatar;}catch(e){}try{window.getRarityByChance=getRarityByChance;}catch(e){}try{window.goToInventory=goToInventory;}catch(e){}try{window.goToMyProfile=goToMyProfile;}catch(e){}try{window.initCalFilterBtns=initCalFilterBtns;}catch(e){}try{window.initTheme=initTheme;}catch(e){}try{window.invEquipSlot=invEquipSlot;}catch(e){}try{window.loadMenuNames=loadMenuNames;}catch(e){}try{window.mCard=mCard;}catch(e){}try{window.meetsReqs=meetsReqs;}catch(e){}try{window.missionToRow=missionToRow;}catch(e){}try{window.openAdminEditCarta=openAdminEditCarta;}catch(e){}try{window.openAdminEditItem=openAdminEditItem;}catch(e){}try{window.openAvatarEditor=openAvatarEditor;}catch(e){}try{window.openEditModal=openEditModal;}catch(e){}try{window.openEventModal=openEventModal;}catch(e){}try{window.openMissionModal=openMissionModal;}catch(e){}try{window.openShowcaseSelector=openShowcaseSelector;}catch(e){}try{window.parsePlannerCSV=parsePlannerCSV;}catch(e){}try{window.parsePlannerExcel=parsePlannerExcel;}catch(e){}try{window.parsePlannerFile=parsePlannerFile;}catch(e){}try{window.plannerDragOver=plannerDragOver;}catch(e){}try{window.plannerDrop=plannerDrop;}catch(e){}try{window.plannerFileSelected=plannerFileSelected;}catch(e){}try{window.populateArcSelect=populateArcSelect;}catch(e){}try{window.promptRenameMenu=promptRenameMenu;}catch(e){}try{window.pullCard=pullCard;}catch(e){}try{window.pullResult=pullResult;}catch(e){}try{window.renderAdminCartasPage=renderAdminCartasPage;}catch(e){}try{window.renderAdminItemsPage=renderAdminItemsPage;}catch(e){}try{window.renderAll=renderAll;}catch(e){}try{window.renderArcs=renderArcs;}catch(e){}try{window.renderAvatar=renderAvatar;}catch(e){}try{window.renderAvatarEditor=renderAvatarEditor;}catch(e){}try{window.renderCalendar=renderCalendar;}catch(e){}try{window.renderClassesAdmin=renderClassesAdmin;}catch(e){}try{window.renderDayEvents=renderDayEvents;}catch(e){}try{window.renderGachaGold=renderGachaGold;}catch(e){}try{window.renderGalleryCards=renderGalleryCards;}catch(e){}try{window.renderGalleryTabs=renderGalleryTabs;}catch(e){}try{window.renderHeroProfile=renderHeroProfile;}catch(e){}try{window.renderHeroTabs=renderHeroTabs;}catch(e){}try{window.renderInventario=renderInventario;}catch(e){}try{window.renderMStats=renderMStats;}catch(e){}try{window.renderMissions=renderMissions;}catch(e){}try{window.renderMyGallery=renderMyGallery;}catch(e){}try{window.renderPlannerImported=renderPlannerImported;}catch(e){}try{window.renderRanking=renderRanking;}catch(e){}try{window.renderShop=renderShop;}catch(e){}try{window.renderUpcoming=renderUpcoming;}catch(e){}try{window.rowToClass=rowToClass;}catch(e){}try{window.rowToMission=rowToMission;}catch(e){}try{window.saveAvatar=saveAvatar;}catch(e){}try{window.saveEdit=saveEdit;}catch(e){}try{window.saveEvent=saveEvent;}catch(e){}try{window.saveNewChar=saveNewChar;}catch(e){}try{window.selectCalDay=selectCalDay;}catch(e){}try{window.selectGalleryHero=selectGalleryHero;}catch(e){}try{window.showSubTab=showSubTab;}catch(e){}try{window.renderPanoramica=renderPanoramica;}catch(e){}try{window.panoNav=panoNav;}catch(e){}try{window.showInvTab=showInvTab;}catch(e){}try{window.toggleGalleryOwned=toggleGalleryOwned;}catch(e){}try{window.toggleGalleryDup=toggleGalleryDup;}catch(e){}
try{window.renderMarket=renderMarket;}catch(e){}try{window.createListing=createListing;}catch(e){}try{window.cancelListing=cancelListing;}catch(e){}try{window.buyListing=buyListing;}catch(e){}try{window.tradeListing=tradeListing;}catch(e){}try{window.onListingModeChange=onListingModeChange;}catch(e){}try{window.quickSellCard=quickSellCard;}catch(e){}try{window.selectSellCard=selectSellCard;}catch(e){}try{window.selectWantCard=selectWantCard;}catch(e){}try{window.renderQuickSell=renderQuickSell;}catch(e){}try{window.renderCardPickers=renderCardPickers;}catch(e){}try{window.saveAvatarInline=saveAvatarInline;}catch(e){}try{window.avaOptLabel=avaOptLabel;}catch(e){}try{window.setPlayerFrame=setPlayerFrame;}catch(e){}try{window.renderFramePicker=renderFramePicker;}catch(e){}try{window.selectHero=selectHero;}catch(e){}try{window.setAvatarOpt=setAvatarOpt;}catch(e){}try{window.setCalFilter=setCalFilter;}catch(e){}try{window.showLevelUpPopup=showLevelUpPopup;}catch(e){}try{window.showPage=showPage;}catch(e){}try{window.showPage_planner=showPage_planner;}catch(e){}try{window.showPlannerPreview=showPlannerPreview;}catch(e){}try{window.showRewardPopup=showRewardPopup;}catch(e){}try{window.showScreen=showScreen;}catch(e){}try{window.switchAdminTab=switchAdminTab;}catch(e){}try{window.switchPTab=switchPTab;}catch(e){}try{window.toast=toast;}catch(e){}try{window.toggleDailyFields=toggleDailyFields;}catch(e){}try{window.toggleTheme=toggleTheme;}catch(e){}try{window.toggleUMenu=toggleUMenu;}catch(e){}try{window.unequipItem=unequipItem;}catch(e){}try{window.updateArcCounts=updateArcCounts;}catch(e){}try{window.updateSidebarAvatar=updateSidebarAvatar;}catch(e){}
try{window.adminChangeVia=adminChangeVia;}catch(e){}try{window.adminCreateCarta=adminCreateCarta;}catch(e){}try{window.adminCreateItemFull=adminCreateItemFull;}catch(e){}try{window.adminDeleteCarta=adminDeleteCarta;}catch(e){}try{window.adminDeleteItemFull=adminDeleteItemFull;}catch(e){}try{window.deleteCartaFromSupabase=deleteCartaFromSupabase;}catch(e){}try{window.deleteItemFromSupabase=deleteItemFromSupabase;}catch(e){}try{window.deleteMissionFromSupabase=deleteMissionFromSupabase;}catch(e){}try{window.doLogin=doLogin;}catch(e){}try{window.loadClassesFromSupabase=loadClassesFromSupabase;}catch(e){}try{window.loadData=loadData;}catch(e){}try{window.loadFromSupabase=loadFromSupabase;}catch(e){}try{window.loadMissionsFromSupabase=loadMissionsFromSupabase;}catch(e){}try{window.saveAdminEdit=saveAdminEdit;}catch(e){}try{window.saveAllMissionsToSupabase=saveAllMissionsToSupabase;}catch(e){}try{window.saveCartaToSupabase=saveCartaToSupabase;}catch(e){}try{window.saveClassEdit=saveClassEdit;}catch(e){}try{window.saveClassToSupabase=saveClassToSupabase;}catch(e){}try{window.saveItemToSupabase=saveItemToSupabase;}catch(e){}try{window.saveMissionToSupabase=saveMissionToSupabase;}catch(e){}try{window.saveToSupabase=saveToSupabase;}catch(e){}
try{window.saveAttrNames=saveAttrNames;}catch(e){}
try{window.attrKeyFromName=attrKeyFromName;}catch(e){}
try{window.randomizeAvatar=randomizeAvatar;}catch(e){}
try{window.cycleAvatarOpt=cycleAvatarOpt;}catch(e){}
try{window.addAttr=addAttr;}catch(e){}
try{window.removeAttr=removeAttr;}catch(e){}
try{window.persistAttrs=persistAttrs;}catch(e){}
try{window.setAvatarColor=setAvatarColor;}catch(e){}
try{window.setAvatarShape=setAvatarShape;}catch(e){}
try{window.recolorBeard=recolorBeard;}catch(e){}
try{window.renderCustomTraitsAdmin=renderCustomTraitsAdmin;}catch(e){}
try{window.addCustomCategory=addCustomCategory;}catch(e){}
try{window.removeCustomCategory=removeCustomCategory;}catch(e){}
try{window.addCustomOption=addCustomOption;}catch(e){}
try{window.editCustomOption=editCustomOption;}catch(e){}
try{window.removeCustomOption=removeCustomOption;}catch(e){}
try{window.persistCustomTraits=persistCustomTraits;}catch(e){}
try{window.setCustomTrait=setCustomTrait;}catch(e){}
try{window.renderInlineAvatarEditor=renderInlineAvatarEditor;}catch(e){}
try{window.saveInlineAvatar=saveInlineAvatar;}catch(e){}
try{window.setEquipPos=setEquipPos;}catch(e){}
try{window.resetEquipPos=resetEquipPos;}catch(e){}
try{window.createCosmetic=createCosmetic;}catch(e){}
try{window.equipFromEditor=equipFromEditor;}catch(e){}
try{window.nudgeEquipPos=nudgeEquipPos;}catch(e){}
try{window.enableAvatarDrag=enableAvatarDrag;}catch(e){}
try{window.refreshAvatarPreview=refreshAvatarPreview;}catch(e){}
try{window.pickShowcaseCard=pickShowcaseCard;}catch(e){}
try{window.closeShowcaseModal=closeShowcaseModal;}catch(e){}
try{window.renderWidgetAdmin=renderWidgetAdmin;}catch(e){}
try{window.addSlot=addSlot;}catch(e){}try{window.renameSlot=renameSlot;}catch(e){}try{window.deleteSlot=deleteSlot;}catch(e){}try{window.setSlotIcon=setSlotIcon;}catch(e){}try{window.renderSlotManager=renderSlotManager;}catch(e){}try{window.populateSlotSelects=populateSlotSelects;}catch(e){}
try{window.createWidget=createWidget;}catch(e){}
try{window.deleteWidget=deleteWidget;}catch(e){}
try{window.editWidget=editWidget;}catch(e){}
try{window.cancelWidgetEdit=cancelWidgetEdit;}catch(e){}
try{window.persistWidgets=persistWidgets;}catch(e){}
try{window.renderUserWidgets=renderUserWidgets;}catch(e){}
try{window.renderInicio=renderInicio;}catch(e){}
try{window.openWidgetPicker=openWidgetPicker;}catch(e){}
try{window.toggleUserWidget=toggleUserWidget;}catch(e){}
try{window.startWidgetResize=startWidgetResize;}catch(e){}try{window.autoFitWidget=autoFitWidget;}catch(e){}try{window.arrangeWidgets=arrangeWidgets;}catch(e){}
try{window.closeWidgetPicker=closeWidgetPicker;}catch(e){}

/* ══════════════ ESTADISTIQUES (setmanals / mensuals) ══════════════ */
var statsPeriod='week',statsOffset=0,statsPid='';
function setStatsPeriod(pr){statsPeriod=pr;statsOffset=0;renderStats();}
function statsNav(d){statsOffset+=d;if(statsOffset>0)statsOffset=0;renderStats();}
function setStatsPid(pid){statsPid=pid||'';renderStats();}
function _fmtH(h){h=Math.max(0,h||0);var hh=Math.floor(h),mm=Math.round((h-hh)*60);if(mm===60){hh++;mm=0;}return hh+'h'+(mm?(' '+mm+'m'):'');}
function _statsRange(period,offset){
  var now=new Date();
  if(period==='month'){
    var start=new Date(now.getFullYear(),now.getMonth()+offset,1);
    var end=new Date(start.getFullYear(),start.getMonth()+1,1);
    return {start:start,end:end,label:start.toLocaleDateString('ca-ES',{month:'long',year:'numeric'})};
  }
  var base=new Date(now);base.setDate(base.getDate()+offset*7);
  var off=(base.getDay()+6)%7;var mon=new Date(base.getFullYear(),base.getMonth(),base.getDate()-off);
  var end=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+7);
  return {start:mon,end:end,label:'Setmana del '+mon.toLocaleDateString('ca-ES',{day:'numeric',month:'short'})};
}
function _statsAgg(start,end){
  var s=start.toISOString(),e=end.toISOString();
  var agg={missions:0,xp:0,gold:0,hours:0,frag:0,starsSum:0,starsN:0,byPid:{},byDiff:{},byArc:{},byTag:{},byDay:{}};
  statsLog.forEach(function(x){
    if(!(x.t>=s&&x.t<e))return;
    if(statsPid&&x.pid!==statsPid)return;
    agg.missions++;agg.xp+=x.xp||0;agg.gold+=x.gold||0;agg.hours+=x.hours||0;agg.frag+=x.frag||0;
    if(x.stars>0){agg.starsSum+=x.stars;agg.starsN++;}
    var b=agg.byPid[x.pid]=agg.byPid[x.pid]||{missions:0,hours:0,xp:0,gold:0,starsSum:0,starsN:0};
    b.missions++;b.hours+=x.hours||0;b.xp+=x.xp||0;b.gold+=x.gold||0;if(x.stars>0){b.starsSum+=x.stars;b.starsN++;}
    agg.byDiff[x.diff||'C']=(agg.byDiff[x.diff||'C']||0)+1;
    agg.byArc[x.arc||'General']=(agg.byArc[x.arc||'General']||0)+1;
    (x.tags||[]).forEach(function(tg){agg.byTag[tg]=(agg.byTag[tg]||0)+1;});
    var day=x.t.slice(0,10);var dd=agg.byDay[day]=agg.byDay[day]||{missions:0,hours:0,gold:0,xp:0};
    dd.missions++;dd.hours+=x.hours||0;dd.gold+=x.gold||0;dd.xp+=x.xp||0;
  });
  return agg;
}
// Sèrie de tendència: darrers N períodes (missions i hores) acabant al període actual
function _statsTrend(){
  var N=statsPeriod==='week'?8:6;var labels=[],missions=[],hours=[];
  for(var i=N-1;i>=0;i--){
    var rg=_statsRange(statsPeriod,statsOffset-i);var a=_statsAgg(rg.start,rg.end);
    labels.push(statsPeriod==='week'?rg.start.toLocaleDateString('ca-ES',{day:'numeric',month:'short'}):rg.start.toLocaleDateString('ca-ES',{month:'short'}));
    missions.push(a.missions);hours.push(Math.round(a.hours*10)/10);
  }
  return {labels:labels,missions:missions,hours:hours};
}
function exportStatsCSV(){
  var r=_statsRange(statsPeriod,statsOffset),agg=_statsAgg(r.start,r.end);
  var lines=[['Persona','Missions','Hores','XP','Or','Estrelles mitjana']];
  Object.keys(agg.byPid).forEach(function(pid){var b=agg.byPid[pid];var p=players.find(function(x){return x.id===pid;});var nm=p?p.name:pid;var av=b.starsN?(b.starsSum/b.starsN).toFixed(2):'';lines.push([nm,b.missions,(Math.round(b.hours*100)/100),b.xp,(Math.round(b.gold*100)/100),av]);});
  var csv=lines.map(function(row){return row.map(function(c){var s=String(c);return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(';');}).join('\r\n');
  var blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='analitiques_'+statsPeriod+'_'+r.start.toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function _statsBuckets(period,start,end,byDay){
  var labels=[],hours=[],missions=[];
  if(period==='week'){
    var names=['Dl','Dt','Dc','Dj','Dv','Ds','Dg'];
    for(var i=0;i<7;i++){var d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);var key=d.toISOString().slice(0,10);var b=byDay[key]||{hours:0,missions:0};labels.push(names[i]);hours.push(Math.round(b.hours*10)/10);missions.push(b.missions);}
  } else {
    var cur=new Date(start),wi=1;
    while(cur<end){
      var wEnd=new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()+7);var h=0,m=0;
      Object.keys(byDay).forEach(function(k){var dd=new Date(k+'T12:00:00');if(dd>=cur&&dd<wEnd&&dd<end){h+=byDay[k].hours;m+=byDay[k].missions;}});
      labels.push('Set. '+wi);hours.push(Math.round(h*10)/10);missions.push(m);cur=wEnd;wi++;
    }
  }
  return {labels:labels,hours:hours,missions:missions};
}
function renderStats(){
  var cont=document.getElementById('stats-body');if(!cont)return;
  var r=_statsRange(statsPeriod,statsOffset),agg=_statsAgg(r.start,r.end);
  var pr=_statsRange(statsPeriod,statsOffset-1),prev=_statsAgg(pr.start,pr.end);
  function delta(cur,old){if(!old&&!cur)return '';if(!old)return '<span class="st-up">&#9650;</span>';var dd=Math.round((cur-old)/old*100);if(dd===0)return '<span class="st-flat">&mdash;</span>';var cls=dd>0?'st-up':'st-down';return '<span class="'+cls+'">'+(dd>0?'&#9650;':'&#9660;')+' '+Math.abs(dd)+'%</span>';}
  var avgStars=agg.starsN?(agg.starsSum/agg.starsN):0,prevAvg=prev.starsN?(prev.starsSum/prev.starsN):0;
  var active=Object.keys(agg.byPid).length;
  var coin='<span class="coin"></span>';
  var kpis=[
    ['Missions',agg.missions,delta(agg.missions,prev.missions)],
    ['Hores',_fmtH(agg.hours),delta(agg.hours,prev.hours)],
    ['XP',agg.xp.toLocaleString(),delta(agg.xp,prev.xp)],
    ['Or',fmtGold(agg.gold)+' '+coin,delta(agg.gold,prev.gold)],
    ['Estrelles mitjana',(avgStars?avgStars.toFixed(1):'-'),delta(avgStars,prevAvg)],
    ['Persones actives',active,'']
  ];
  var kpiHtml=kpis.map(function(k){return '<div class="smini stat-kpi"><div class="v">'+k[1]+'</div><div class="l">'+k[0]+'</div>'+(k[2]?'<div class="st-delta">'+k[2]+'</div>':'')+'</div>';}).join('');
  var rows=Object.keys(agg.byPid).map(function(pid){var b=agg.byPid[pid];var p=players.find(function(x){return x.id===pid;});return {name:p?(p.emblem+' '+p.name):pid,color:p?p.color:'#888',b:b};}).sort(function(a,b){return b.b.missions-a.b.missions;});
  var tbl=rows.length?('<div style="overflow-x:auto"><table class="stats-table"><thead><tr><th>Persona</th><th>Missions</th><th>Hores</th><th>XP</th><th>Or</th><th>Estrelles</th></tr></thead><tbody>'+rows.map(function(rw){var b=rw.b;var av=b.starsN?(b.starsSum/b.starsN).toFixed(1):'-';return '<tr><td><span class="st-dot" style="background:'+rw.color+'"></span>'+_esc(rw.name)+'</td><td>'+b.missions+'</td><td>'+_fmtH(b.hours)+'</td><td>'+b.xp.toLocaleString()+'</td><td>'+fmtGold(b.gold)+'</td><td>'+av+'</td></tr>';}).join('')+'</tbody></table></div>'):'<div class="stats-empty">Encara no hi ha activitat en aquest periode.</div>';
  var prioNames={A:'Urgent',B:'Important',C:'Mitjana',D:'Baixa'};
  var prioTotal=Object.keys(agg.byDiff).reduce(function(s,k){return s+agg.byDiff[k];},0);
  var prioHtml=['A','B','C','D'].filter(function(k){return agg.byDiff[k];}).map(function(k){var v=agg.byDiff[k];var pct=prioTotal?Math.round(v/prioTotal*100):0;return '<div class="st-bar-row"><span class="st-bar-lbl">'+prioNames[k]+'</span><div class="st-bar"><div class="st-bar-fill" style="width:'+pct+'%"></div></div><span class="st-bar-n">'+v+'</span></div>';}).join('')||'<div class="stats-empty">-</div>';
  var arcArr=Object.keys(agg.byArc).map(function(k){return [k,agg.byArc[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
  var arcMax=arcArr.length?arcArr[0][1]:1;
  var arcHtml=arcArr.length?arcArr.map(function(a){var pct=Math.round(a[1]/arcMax*100);return '<div class="st-bar-row"><span class="st-bar-lbl">'+_esc(a[0])+'</span><div class="st-bar"><div class="st-bar-fill" style="width:'+pct+'%"></div></div><span class="st-bar-n">'+a[1]+'</span></div>';}).join(''):'<div class="stats-empty">-</div>';
  var bk=_statsBuckets(statsPeriod,r.start,r.end,agg.byDay);
  var trend=_statsTrend();
  // Etiquetes (top 8)
  var tagArr=Object.keys(agg.byTag).map(function(k){return [k,agg.byTag[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
  var tagMax=tagArr.length?tagArr[0][1]:1;
  var tagHtml=tagArr.length?tagArr.map(function(a){var pct=Math.round(a[1]/tagMax*100);return '<div class="st-bar-row"><span class="st-bar-lbl">'+_esc(a[0])+'</span><div class="st-bar"><div class="st-bar-fill" style="width:'+pct+'%"></div></div><span class="st-bar-n">'+a[1]+'</span></div>';}).join(''):'<div class="stats-empty">Sense etiquetes en aquest periode.</div>';
  // Selector de persona
  var pplOpts='<option value="">Tot l\'equip</option>'+players.map(function(p){return '<option value="'+_esc(p.id)+'"'+(statsPid===p.id?' selected':'')+'>'+_esc(p.emblem+' '+p.name)+'</option>';}).join('');
  cont.innerHTML=
    '<div class="stats-controls">'
    +'<div class="stats-seg"><button class="'+(statsPeriod==='week'?'active':'')+'" onclick="setStatsPeriod(\'week\')">Setmana</button><button class="'+(statsPeriod==='month'?'active':'')+'" onclick="setStatsPeriod(\'month\')">Mes</button></div>'
    +'<div class="stats-nav"><button onclick="statsNav(-1)" aria-label="Anterior">&#8249;</button><span class="stats-period-lbl">'+_esc(r.label)+'</span><button onclick="statsNav(1)" '+(statsOffset>=0?'disabled':'')+' aria-label="Seguent">&#8250;</button></div>'
    +'<select class="stats-person" onchange="setStatsPid(this.value)">'+pplOpts+'</select>'
    +'<button class="btn btn-sm" onclick="exportStatsCSV()" title="Exportar a CSV">&#8681; CSV</button>'
    +'</div>'
    +'<div class="g4 stats-kpis">'+kpiHtml+'</div>'
    +'<div class="stats-grid">'
      +'<div class="card"><div class="stitle">'+(statsPeriod==='week'?'Hores per dia':'Hores per setmana')+'</div><div style="height:220px"><canvas id="stats-time"></canvas></div></div>'
      +'<div class="card"><div class="stitle">Tendencia ('+(statsPeriod==='week'?'8 setmanes':'6 mesos')+')</div><div style="height:220px"><canvas id="stats-trend"></canvas></div></div>'
    +'</div>'
    +'<div class="stats-grid">'
      +'<div class="card"><div class="stitle">Per prioritat</div>'+prioHtml+'</div>'
      +'<div class="card"><div class="stitle">Per etiqueta</div>'+tagHtml+'</div>'
    +'</div>'
    +'<div class="stats-grid">'
      +'<div class="card"><div class="stitle">Ranquing del periode</div>'+tbl+'</div>'
      +'<div class="card"><div class="stitle">Per arc / categoria</div>'+arcHtml+'</div>'
    +'</div>';
  try{_dashAnimate(cont);}catch(e){}
  try{
    if(typeof Chart==='undefined'){_ensureChart().then(function(){try{renderStats();}catch(e){}}).catch(function(){});}
    if(typeof Chart!=='undefined'){
      var cv=document.getElementById('stats-time');
      if(cv){
        if(cv._chart){try{cv._chart.destroy();}catch(e){}}
        var css=getComputedStyle(document.body);var grid=(css.getPropertyValue('--border')||'#333').trim();var txt=(css.getPropertyValue('--muted')||'#888').trim();var acc=(css.getPropertyValue('--accent')||'#d9a441').trim();
        cv._chart=new Chart(cv,{type:'bar',data:{labels:bk.labels,datasets:[{label:'Hores',data:bk.hours,backgroundColor:acc,borderRadius:5,maxBarThickness:40}]},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.parsed.y+' h - '+(bk.missions[c.dataIndex]||0)+' missions';}}}},scales:{x:{grid:{display:false},ticks:{color:txt}},y:{beginAtZero:true,grid:{color:grid},ticks:{color:txt,precision:0}}}}});
      }
      var tv=document.getElementById('stats-trend');
      if(tv){
        if(tv._chart){try{tv._chart.destroy();}catch(e){}}
        var css2=getComputedStyle(document.body);var grid2=(css2.getPropertyValue('--border')||'#333').trim();var txt2=(css2.getPropertyValue('--muted')||'#888').trim();var acc2=(css2.getPropertyValue('--accent')||'#d9a441').trim();
        tv._chart=new Chart(tv,{type:'line',data:{labels:trend.labels,datasets:[{label:'Missions',data:trend.missions,borderColor:acc2,backgroundColor:'transparent',tension:.3,pointRadius:3,pointBackgroundColor:acc2,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.parsed.y+' missions - '+(trend.hours[c.dataIndex]||0)+' h';}}}},scales:{x:{grid:{display:false},ticks:{color:txt2}},y:{beginAtZero:true,grid:{color:grid2},ticks:{color:txt2,precision:0}}}}});
      }
    }
  }catch(e){console.warn('stats chart',e);}
}
try{window.setStatsPeriod=setStatsPeriod;}catch(e){}
try{window.statsNav=statsNav;}catch(e){}
try{window.setStatsPid=setStatsPid;}catch(e){}
try{window.exportStatsCSV=exportStatsCSV;}catch(e){}
try{window.renderStats=renderStats;}catch(e){}
