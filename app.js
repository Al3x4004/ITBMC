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

/* ══ CONFIG ══ */
const CFG={
  MODE:'supabase',
  GITHUB_RAW:'https://raw.githubusercontent.com/Al3x4004/ITBMC/main/',
  ADMIN_PW:'admin1234',
  SUPABASE_URL:'https://ksmxclenaeglnahinkvm.supabase.co',
  SUPABASE_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhjbGVuYWVnbG5haGlua3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjY0MzQsImV4cCI6MjA5ODMwMjQzNH0.pBaUUXSDGjXPLbAjIOAdtM0nvAgfxul7BUzfcQaWqNc',
};

/* ══ DATOS ESTÁTICOS ══ */
let CLASSES=[
  {name:'Mago',       icon:'🔮',role:'Dev / Técnico',       bonus:'+5 INT · +3 AGI',attrs:{fue:1,int:5,agi:3,car:1,sab:2}},
  {name:'Paladín',    icon:'🛡️',role:'Gestión / Liderazgo', bonus:'+5 CAR · +4 SAB',attrs:{fue:2,int:1,agi:1,car:5,sab:4}},
  {name:'Exploradora',icon:'🏹',role:'Data / Análisis',      bonus:'+5 AGI · +4 INT',attrs:{fue:1,int:4,agi:5,car:1,sab:2}},
  {name:'Guerrero',   icon:'⚔️',role:'Ops / Ejecución',     bonus:'+6 FUE · +3 AGI',attrs:{fue:6,int:1,agi:3,car:1,sab:1}},
  {name:'Pícaro',     icon:'🗡️',role:'Diseño / Creatividad',bonus:'+5 AGI · +3 CAR',attrs:{fue:1,int:3,agi:5,car:3,sab:1}},
  {name:'Bardo',      icon:'📯',role:'Marketing / Comms',   bonus:'+6 CAR · +3 SAB',attrs:{fue:1,int:2,agi:1,car:6,sab:3}},
];
const COLORS=[
  {hex:'#7f77dd',bg:'rgba(127,119,221,0.15)'},{hex:'#1d9e75',bg:'rgba(29,158,117,0.15)'},
  {hex:'#d85a30',bg:'rgba(216,90,48,0.15)'}, {hex:'#378add',bg:'rgba(55,138,221,0.15)'},
  {hex:'#d4537e',bg:'rgba(212,83,126,0.15)'},{hex:'#e4a428',bg:'rgba(228,164,40,0.15)'},
  {hex:'#888780',bg:'rgba(136,135,128,0.15)'},{hex:'#639922',bg:'rgba(99,153,34,0.15)'},
];
const EMBLEMS=['⚔️','🗡️','🏹','🛡️','🔮','📯','🔥','❄️','⚡','🌙','☀️','🐉','🦅','🌿','💎','👁️'];
// ══ SLOTS DE EQUIPAMIENTO (centralizados) ══
var SLOT_DEFS=[
  {key:'arma',label:'Arma',icon:'⚔️',pos:{x:60,y:30,w:46,z:4}},
  {key:'armadura',label:'Armadura',icon:'🛡️',pos:{x:20,y:42,w:60,z:3}},
  {key:'accesorio',label:'Accessori',icon:'💎',pos:{x:8,y:22,w:30,z:4}},
  {key:'casco',label:'Casc',icon:'⛑️',pos:{x:18,y:-2,w:64,z:6}},
  {key:'botas',label:'Botes',icon:'👟',pos:{x:26,y:78,w:48,z:2}},
  {key:'cosm1',label:'Cosmètic 1',icon:'✨',pos:{x:20,y:20,w:60,z:10},cosmetic:true},
  {key:'cosm2',label:'Cosmètic 2',icon:'✨',pos:{x:20,y:20,w:60,z:11},cosmetic:true},
  {key:'cosm3',label:'Cosmètic 3',icon:'✨',pos:{x:20,y:20,w:60,z:12},cosmetic:true},
  {key:'cosm4',label:'Cosmètic 4',icon:'✨',pos:{x:20,y:20,w:60,z:13},cosmetic:true},
  {key:'cosm5',label:'Cosmètic 5',icon:'✨',pos:{x:20,y:20,w:60,z:14},cosmetic:true}
];
function slotLabel(k){var s=SLOT_DEFS.find(function(x){return x.key===k;});return s?s.label:k;}
function slotDefaultPos(k){var s=SLOT_DEFS.find(function(x){return x.key===k;});return s?s.pos:{x:20,y:20,w:60,z:4};}
function emptyEquipped(){var o={};SLOT_DEFS.forEach(function(s){o[s.key]=null;});return o;}
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
try{var _sc=localStorage.getItem('cg_custom_traits');if(_sc){var _pc=JSON.parse(_sc);if(Array.isArray(_pc))customTraits=_pc;}}catch(e){}
function attrName(k){var a=ATTRS.find(function(x){return x.key===k;});return a?a.name:k;}
function attrColor(k){var a=ATTRS.find(function(x){return x.key===k;});return a?a.color:'#888';}
function attrIcon(k){var a=ATTRS.find(function(x){return x.key===k;});return a&&a.icon?a.icon:'⭐';}
// Proxies de compatibilidad: AN[k] y AC[k] siguen funcionando como antes
var AN=new Proxy({},{get:function(t,k){return attrName(k);},set:function(t,k,v){var a=ATTRS.find(function(x){return x.key===k;});if(a)a.name=v;return true;},ownKeys:function(){return attrKeys();},getOwnPropertyDescriptor:function(){return {enumerable:true,configurable:true};}});
var AC=new Proxy({},{get:function(t,k){return attrColor(k);}});
// Nombres históricos/legacy de atributos para no perder el match si se renombran
var AN_LEGACY={fue:['Força','Fuerza','FUE'],int:['Intel·ligència','Inteligencia','Intel.','INT'],agi:['Agilitat','Agilidad','AGI'],car:['Carisma','CAR'],sab:['Saviesa','Sabiduría','SAB']};
function attrKeyFromName(name){
  if(!name)return null;
  var k=ATTRS.find(function(a){return a.name===name;});
  if(k)return k.key;
  if(ATTRS.find(function(a){return a.key===name;}))return name;
  var low=(''+name).toLowerCase();
  return Object.keys(AN_LEGACY).find(function(k){
    return AN_LEGACY[k].some(function(n){return n.toLowerCase()===low;});
  })||null;
}
const RARITY_ORDER=['legendaria','epica','rara','comun'];
const RARITY_PROB={comun:60,rara:25,epica:12,legendaria:3};
const GACHA_COST_SINGLE=100;
const GACHA_COST_MULTI=900;
const RARITY_LABEL={comun:'Comú',rara:'Rara',epica:'Èpica',legendaria:'Llegendària'};

let galleryHeroIdx=0;

/* ══ CARGA ══ */

async function loadFromSupabase(){
  try{
    const r=await fetch(`${CFG.SUPABASE_URL}/rest/v1/game_data?id=eq.main&select=data`,{
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
    });
    const rows=await r.json();
    return rows&&rows.length?rows[0].data:null;
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
    else{console.log('Item saved OK:',item.name);}
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
  try{
    await fetch(CFG.SUPABASE_URL+'/rest/v1/misiones',{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify(missions.map(missionToRow))
    });
  }catch(e){console.error('Error saving all missions',e);}
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
  var abbr={fue:'FUE',int:'INT',agi:'AGI',car:'CAR',sab:'SAB'};
  return Object.entries(attrs).sort(function(a,b){return b[1]-a[1];}).slice(0,2)
    .map(function(e){return '+'+e[1]+' '+abbr[e[0]];}).join(' · ');
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

async function saveToSupabase(){
  try{
    // Save main game data
    await fetch(`${CFG.SUPABASE_URL}/rest/v1/game_data`,{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify({id:'main',data:{players,arcs,gacha_cards:gachaCards,cal_events:calEvents,attr_defs:ATTRS,custom_traits:customTraits}})
    });
    // Save each player to players table
    for(const p of players){
      await fetch(`${CFG.SUPABASE_URL}/rest/v1/players`,{
        method:'POST',
        headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
        body:JSON.stringify({id:p.id,data:p,updated_at:new Date().toISOString()})
      });
    }
    // Save all missions to dedicated table
    await saveAllMissionsToSupabase();
  }catch(e){console.error('Supabase save error',e);}
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
      if(Array.isArray(d.attr_defs)&&d.attr_defs.length){
        ATTRS=d.attr_defs.map(function(a){return {key:a.key,name:a.name,color:a.color||'#888'};});
      }else if(d.attr_names&&typeof d.attr_names==='object'){
        ATTRS.forEach(function(a){if(d.attr_names[a.key])a.name=d.attr_names[a.key];});
      }
      // Asegurar que todos los players tienen todas las claves de atributo
      players.forEach(function(p){if(p.attrs){attrKeys().forEach(function(k){if(p.attrs[k]===undefined)p.attrs[k]=10;});}});

      // Ensure tutorial missions exist for each player
      players.forEach(function(p){
        var hasTutorial=missions&&missions.find(function(m){return m.arc==='Tutorial: Primeros Pasos'&&m.playerId===p.id;});
        if(!hasTutorial)createTutorialForPlayer(p);
      });
      // Load missions from dedicated table
      var _sbMissions=await loadMissionsFromSupabase();
      if(_sbMissions&&_sbMissions.length){
        missions=_sbMissions;
      }else if(d.missions&&d.missions.length){
        // MIGRATION: old missions in game_data → new table
        missions=d.missions;
        await saveAllMissionsToSupabase();
        console.log('Migrated '+missions.length+' missions to dedicated table');
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
    // Remove completed instances from previous days
    missions=missions.filter(function(m){
      return !(m.isDaily_instance&&m.playerId===p.id&&m.status==='done'&&m.deadline!==today);
    });
    // Create today's instances for any template that doesn't have one yet
    myTemplates.forEach(function(tpl){
      var instanceId=tpl.id+'_'+today;
      var exists=missions.find(function(m){return m.id===instanceId;});
      if(!exists){
        missions.push({
          id:instanceId,
          name:tpl.name,arc:tpl.arc||'General',
          playerId:p.id,status:'pending',
          diff:'D',xp:25,gold:10,
          attr:'Sabiduría',attrPts:1,
          deadline:today,daily:true,
          isDaily_instance:true,templateId:tpl.id,
          plannerId:'',createdBy:p.id
        });
      }
    });
  });
}

function exportJSON(){
  // Guardar en Supabase (ya no hay modo local)
  saveToSupabase();
  var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';
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

async function doLogin(){
  if(CFG.MODE==='supabase'){
    const d=await loadFromSupabase();
    if(d&&d.players)players=d.players;
  }
  const name=document.getElementById('ln').value.trim().toLowerCase();
  const pin=document.getElementById('lp').value;
  const p=players.find(p=>p.name.toLowerCase()===name);
  if(!p||(p.pin&&p.pin!==pin)){document.getElementById('lerr').style.display='block';return;}
  document.getElementById('lerr').style.display='none';
  session={loggedIn:true,isAdmin:false,playerId:p.id};
  localStorage.setItem('cg_pid',p.id);
  enterApp();
}
function doAdminLogin(){
  const pin=document.getElementById('ap').value;
  if(pin!==CFG.ADMIN_PW){document.getElementById('aerr').style.display='block';return;}
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
  const p=players.find(p=>p.id===session.playerId);
  if(p){const _idx=players.findIndex(function(pl){return pl.id===session.playerId;});if(_idx>=0)curHero=_idx;}
  document.getElementById('ulabel').textContent=session.isAdmin?'Dios 👑':(p?p.name.split(' ')[0]:'—');
  updateSidebarAvatar();
  (function(){var _x=document.getElementById('umname');if(_x)_x.textContent=session.isAdmin?'👑 Dios':(p?p.name:'—');})();
  renderAll();
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
      try{buildAttrBars('cp-abars',c.attrs);}catch(e){console.error('buildAttrBars error',e);}
      try{var cs=document.getElementById('cp-cstats');if(cs)cs.style.display='block';}catch(e){}
      try{buildStartItemsPreview(c);}catch(e){console.error('buildStartItemsPreview error',e);}
    };
    g.appendChild(d);
  });
}
function buildAttrBars(cid,attrs){
  var el=document.getElementById(cid);if(!el)return;
  attrs=attrs||{};
  // Solo las 5 claves conocidas, en orden fijo
  var keys=attrKeys();
  el.innerHTML=keys.map(function(k){
    var v=parseInt(attrs[k])||0;
    var maxv=Math.max(6,v);
    return '<div class="srow"><span class="slbl">'+(AN[k]||k)+'</span><div class="strk"><div class="sfill" style="width:'+Math.round(v/maxv*100)+'%;background:'+(AC[k]||'#888')+';"></div></div><span class="snum">'+v+'</span></div>';
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
  if(step===0){if(!document.getElementById('cp-rn').value.trim()){toast('Introduce tu nombre real.');return;}if(!document.getElementById('cp-pn').value.trim()){toast('Elige un nombre para tu personaje.');return;}if(!document.getElementById('cp-pin').value){toast('Elige una contraseña.');return;}}
  if(step===1&&!cpState.cls){toast('Elige una clase primero.');return;}
  cGoTo(step+1);
}
function saveNewChar(){
  const rn=document.getElementById('cp-rn').value.trim(),pn=document.getElementById('cp-pn').value.trim(),pin=document.getElementById('cp-pin').value;
  const lore=document.getElementById('cp-lore').value.trim(),quote=document.getElementById('cp-quote').value.trim();
  if(!cpState.cls){toast('Vuelve al paso 2 y elige una clase.');return;}
  // Items iniciales fijos de la clase
  var startItems=(cpState.cls.startItems||[]).slice();
  var equipped=emptyEquipped();
  startItems.forEach(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(item&&equipped.hasOwnProperty(item.slot)&&!equipped[item.slot])equipped[item.slot]=iid;
  });
  const np={id:'pj'+Date.now(),realName:rn,name:pn,cls:cpState.cls.name,role:cpState.cls.role,emblem:cpState.emblem,color:cpState.color.hex,colorBg:cpState.color.bg,level:1,xp:0,xpNext:100,gold:0,missions:0,lore:lore||'Historia por escribir...',quote:quote||'...',pin,attrs:{...cpState.cls.attrs},gachaTokens:0,fragments:0,gallery:[],lastDaily:'',inventory:startItems,equipped:equipped,pendingAttrPts:0};
  players.push(np);
  createWelcomeArc(np);
  createTutorialForPlayer(np);
  checkDailyMissions();
  if(CFG.MODE==='supabase')saveToSupabase();
  session={loggedIn:true,isAdmin:false,playerId:np.id};localStorage.setItem('cg_pid',np.id);
  const idx=players.findIndex(function(pl){return pl.id===np.id;});if(idx>=0)curHero=idx;
  setTimeout(()=>enterApp(),300);
}

/* ══ RENDER ══ */
function renderAll(){applyMenuNames();renderMStats();renderMissions();renderHeroTabs();renderArcs();renderRanking();renderGachaGold();renderShop();populateArcSelect();}
function showPage(name,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  if(name==='heroe')renderHeroProfile(curHero);
  if(name==='gacha'){renderGachaGold();renderMyGallery();renderGalleryTabs();}
  if(name==='tienda')renderShop();
  if(name==='inventario')renderInventario();
  if(name==='misiones')populateArcSelect();
  if(name==='calendario'){if(!calState.selectedDate)calState.selectedDate=new Date().toISOString().slice(0,10);renderCalendar();}
  if(name==='planner'){renderPlannerImported();}
  if(name==='items-admin'){renderAdminItemsPage();renderAdminCartasPage();}
  if(name==='classes-admin'){renderClassesAdmin();}
}

/* ── misiones stats ── */
function renderMStats(){
  const act=missions.filter(m=>m.status==='active').length;
  const don=missions.filter(m=>m.status==='done').length;
  const txp=players.reduce((s,p)=>s+p.xp,0);
  const tg=players.reduce((s,p)=>s+p.gold,0);
  document.getElementById('mstats').innerHTML=`
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">En curso</div><div style="font-size:22px;font-weight:700;">${act}</div></div>
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">Completades</div><div style="font-size:22px;font-weight:700;">${don}</div></div>
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">XP del equipo</div><div style="font-size:22px;font-weight:700;">${txp.toLocaleString()}</div></div>
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">🪙 Oro del equipo</div><div style="font-size:22px;font-weight:700;">${tg.toLocaleString()}</div></div>`;
}

/* ── misiones ── */
function renderMissions(){
  const today=new Date().toISOString().slice(0,10);
  const daily   =missions.filter(m=>m.daily&&m.isDaily_instance&&m.status!=='done'&&(session.isAdmin||m.playerId===session.playerId));
  const active  =missions.filter(m=>!m.daily&&m.status==='active');
  const pending =missions.filter(m=>!m.daily&&m.status==='pending');
  const done    =missions.filter(m=>m.status==='done'&&!m.isDaily_instance);
  document.getElementById('m-daily').innerHTML  =daily.length  ?daily.map(m=>mCard(m)).join('')  :`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sin misiones diarias.</div>`;
  document.getElementById('m-active').innerHTML =active.length ?active.map(m=>mCard(m)).join('') :`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sin misiones activas.</div>`;
  document.getElementById('m-pending').innerHTML=pending.length?pending.map(m=>mCard(m)).join(''):`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sin misiones pendientes.</div>`;
  document.getElementById('m-done').innerHTML   =done.length   ?done.map(m=>mCard(m)).join('')   :`<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sin misiones completadas.</div>`;
}

function mCard(m){
  const player=players.find(p=>p.id===m.playerId);
  const canComplete=session.isAdmin||(session.playerId===m.playerId&&m.status!=='done');
  const canEdit=session.isAdmin||session.playerId===m.playerId;
  const dailyBadge=m.daily&&m.isDaily_instance?`<span class="daily-rib">Diaria</span>`:(m.daily&&!m.isDaily_instance?`<span class="daily-rib" style="background:var(--accent-bg);color:var(--accent);">📌 Diaria personal</span>`:'');
  const completedBtn=canComplete&&m.status!=='done'
    ?`<button class="btn-complete" onclick="completeMission('${m.id}')">✓ Completar</button>`:'';
  const statusBadge=m.status==='done'?`<span class="badge b-teal">Completada</span>`:m.status==='active'?`<span class="badge b-gold">En curso</span>`:`<span class="badge b-gray">Pendiente</span>`;
  const assignSel=session.isAdmin?`<select class="sstat" onchange="assignMission('${m.id}',this.value)" style="font-size:11px;">
    <option value="">Sense assignar</option>
    ${players.map(p=>`<option value="${p.id}" ${m.playerId===p.id?'selected':''}>${p.emblem} ${p.name.split(' ')[0]}</option>`).join('')}
    </select>`:'';
  return `<div class="mcrd ${m.daily?'daily-mission':''}" onclick="openMissionModal('${m.id}')" style="cursor:pointer;">
    <div class="minfo">
      <div class="mname">${m.name}${dailyBadge}</div>
      <div class="mmeta">${m.arc}${player?' · '+player.emblem+' '+player.name:' · Sense assignar'}</div>
    </div>
    <div class="mrews">
      <span class="rchip"><span>${m.xp}</span> XP</span>
      <span class="rchip"><span>🪙 ${m.gold}</span></span>
      <span class="badge dS" style="display:none"></span>
      <span class="badge d${m.diff}">${m.diff}</span>
      ${statusBadge}
      ${assignSel}
      ${completedBtn}
      ${(session.isAdmin||m.createdBy===session.playerId)?`<button class="btn-complete" style="background:var(--coral-bg);color:var(--coral);border-color:var(--coral-border);" onclick="deleteMission('${m.id}')">✕</button>`:''}
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
  if(!confirm('¿Eliminar este arco?'))return;
  arcs=arcs.filter(function(a){return a.id!==id;});
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}
function deleteMission(id){
  if(!confirm('¿Eliminar esta misión?'))return;
  missions=missions.filter(function(m){return m.id!==id;});
  if(CFG.MODE==='supabase'){deleteMissionFromSupabase(id);saveToSupabase();}
  renderAll();
}

function assignMission(missionId, playerId){
  const m=missions.find(m=>m.id===missionId);if(!m)return;
  m.playerId=playerId;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}

function completeMission(id){
  const m=missions.find(m=>m.id===id);if(!m||m.status==='done')return;
  const p=players.find(p=>p.id===m.playerId);
  m.status='done';
  if(p){
    var mFrag=m.frag||({D:20,C:50,B:100,A:200,S:400}[m.diff]||50);
    p.xp+=m.xp;p.gold+=m.gold;p.fragments=(p.fragments||0)+mFrag;p.missions++;
    if(m.attrPts&&m.attr){var k=attrKeyFromName(m.attr);if(k)p.attrs[k]=(p.attrs[k]||0)+m.attrPts;}
    p.level=Math.floor(p.xp/100)+1;
    showRewardPopup(m,p);
  }
  // Bonus diarias
  if(m.daily&&p){
    const myDailies=missions.filter(mx=>mx.daily&&mx.playerId===p.id);
    if(myDailies.length>=1&&myDailies.length<=4&&myDailies.every(mx=>mx.status==='done')){
      const bx=myDailies.reduce((s,mx)=>s+mx.xp,0),bg=myDailies.reduce((s,mx)=>s+mx.gold,0);
      p.xp+=bx;p.gold+=bg;
      setTimeout(()=>showRewardPopup({name:'¡Bonus diario!',xp:bx,gold:bg,attr:null},p),600);
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
        p.xp+=bx;p.gold+=bg;
        setTimeout(()=>showRewardPopup({name:'¡Arco completado: '+m.arc+'!',xp:bx,gold:bg,attr:null},p),1200);
      }
    }
  }
  // Level up
  checkLevelUp(p);
  updateArcCounts();
  cleanOldCompleted();
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}

/* ── level up ── */
function checkLevelUp(p){
  if(!p)return;
  const newLv=Math.floor(p.xp/100)+1;
  if(newLv>p.level){
    const gained=(newLv-p.level)*3;
    p.xpNext=(newLv+1)*100;
    p.level=newLv;p.pendingAttrPts=(p.pendingAttrPts||0)+gained;
    showLevelUpPopup(p);
  }
}
function showLevelUpPopup(p){
  luState={pid:p.id,pts:p.pendingAttrPts,spent:{}};
  document.getElementById('lu-level').textContent='Nivell '+p.level;
  document.getElementById('lu-pts').textContent=luState.pts;
  document.getElementById('lu-attrs').innerHTML=attrKeys().map(function(k){var name=attrName(k);return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--bg3);border-radius:var(--radius);padding:8px 4px;">'    +'<div style="font-size:16px;">'+attrIcon(k)+'</div>'    +'<div style="font-size:9px;color:var(--muted);">'+name+'</div>'    +'<div style="font-size:14px;font-weight:600;" id="lu-'+k+'">'+p.attrs[k]+'</div>'    +'<button class="btn btn-sm btn-p" style="padding:1px 10px;width:100%;" onclick="addAttrPt(\''+k+'\',1)">+</button>'    +'<button class="btn btn-sm" style="padding:1px 10px;width:100%;" onclick="addAttrPt(\''+k+'\',-1)">−</button>'    +'</div>';}).join('');
  document.getElementById('levelup-pop').classList.add('show');
}
function addAttrPt(attr,delta){
  const p=players.find(p=>p.id===luState.pid);if(!p)return;
  if(delta>0){
    if(luState.pts<=0)return;
    luState.pts--;luState.spent[attr]=(luState.spent[attr]||0)+1;p.attrs[attr]++;
  }else{
    if((luState.spent[attr]||0)<=0)return;
    luState.pts++;luState.spent[attr]--;p.attrs[attr]--;
  }
  document.getElementById('lu-'+attr).textContent=p.attrs[attr];
  document.getElementById('lu-pts').textContent=luState.pts;
}
function confirmLevelUp(){
  const p=players.find(p=>p.id===luState.pid);
  if(p)p.pendingAttrPts=luState.pts;
  document.getElementById('levelup-pop').classList.remove('show');
  if(CFG.MODE==='supabase')saveToSupabase();
  renderAll();
}

/* ── reward popup ── */
function showRewardPopup(m,p){
  document.getElementById('rp-emoji').textContent=p.emblem;
  document.getElementById('rp-title').textContent='¡Misión completada!';
  document.getElementById('rp-mission').textContent=m.name;
  var mFrag=m.frag||({D:20,C:50,B:100,A:200,S:400}[m.diff]||0);
  document.getElementById('rp-chips').innerHTML=`
    <span class="badge b-purple">+${m.xp} XP</span>
    <span class="badge b-gold">🪙 +${m.gold}</span>
    ${mFrag?`<span class="badge b-purple" style="background:var(--accent-bg);">+${mFrag} ✨</span>`:''}
    ${m.attr?`<span class="badge b-teal">+${m.attrPts} ${m.attr}</span>`:''}`;
  document.getElementById('reward-pop').classList.add('show');
}
function closeReward(){document.getElementById('reward-pop').classList.remove('show');}

/* ── héroes ── */
function renderHeroTabs(){
  let tabs=players.map((p,i)=>
    `<div class="htab ${i===curHero&&curHero!=='admin'?'active':''}" onclick="selectHero(${i})"><span class="hdot" style="background:${p.color};"></span>${p.emblem} ${p.name.split(' ')[0]}</div>`
  ).join('');
  if(session.isAdmin){
    tabs+=`<div class="htab ${'admin'===curHero?'active':''}" onclick="selectHero('admin')" style="border-color:rgba(228,164,40,.3);"><span class="hdot" style="background:#e4a428;"></span>👑 Dios</div>`;
  }
  document.getElementById('htabs').innerHTML=tabs;
}
function renderHeroTabsOLD(){
  document.getElementById('htabs').innerHTML=players.map((p,i)=>
    `<div class="htab ${i===curHero?'active':''}" onclick="selectHero(${i})"><span class="hdot" style="background:${p.color};"></span>${p.emblem} ${p.name.split(' ')[0]}</div>`).join('');
}//legacy
function selectHero(i){curHero=i;renderHeroTabs();renderHeroProfile(i==='admin'?'admin':i);}
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
    id:'admin_special',realName:'',name:'Dios',cls:'—',role:'Omnisciente',
    emblem:'👑',color:'#e4a428',colorBg:'rgba(228,164,40,0.15)',
    level:99,xp:999999,xpNext:100,gold:Infinity,missions:999,
    weapon:'La Palabra',armor:'Armadura Divina',accessory:'Corona Eterna',
    lore:'Existía antes de que el primer personaje fuera creado. Su poder no tiene límites ni necesita demostración.',
    quote:'Yo soy el principio y el fin de este repo.',
    pin:'',attrs:{fue:20,int:20,agi:20,car:20,sab:20},
    gachaTokens:Infinity,fragments:Infinity,gallery:allCards,lastDaily:''
  };
}

function renderHeroProfile(i){
  const p=(session.isAdmin&&i==='admin')?getAdminProfile():players[i];if(!p)return;
  const xpPct=Math.round(p.xp/p.xpNext*100);
  const canEdit=session.isAdmin||session.playerId===p.id;
  const recent=missions.filter(m=>m.playerId===p.id&&m.status==='done').slice(-3);
  document.getElementById('hprofile').innerHTML=`
    <div class="card">
      <div class="profile-tabs">
        <div class="ptab active" onclick="switchPTab(this,'pinfo')">Ficha</div>
        <div class="ptab" onclick="switchPTab(this,'pgallery')">Galería (${(p.gallery||[]).length})</div>
        ${canEdit?`<div class="ptab" onclick="switchPTab(this,'pcustom');renderInlineAvatarEditor('${p.id}')">🎨 Personalització</div>`:''}
      </div>
      <div class="ptab-panel active" id="pinfo">
        <div class="phead">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">${renderAvatar(p,"pixel-avatar-lg")}</div>
          <div style="flex:1;min-width:0;">
            <span class="badge b-purple" style="margin-bottom:6px;display:inline-block;">Nivel ${p.level} · ${p.cls}</span>
            <div class="pname">${p.name}${session.isAdmin?'<span class="adm-rib">DIOS</span>':`<span class="adm-rib" style="display:none"></span>`}</div>
            <div class="pclass">${p.role}</div>
            <div class="pquote">"${p.quote}"</div>
          </div>
          ${canEdit?`<button class="btn btn-sm" onclick="openEditModal('${p.id}')">✏️ Editar</button>`:''}
        </div>
        <div class="xpw">
          <div class="xpl"><span>XP: ${p.xp.toLocaleString()}</span><span>Nivel ${p.level+1} en ${(p.xpNext-p.xp).toLocaleString()} XP</span></div>
          <div class="xpt"><div class="xpf" style="width:${xpPct}%;background:${p.color};"></div></div>
        </div>
        <div class="g4" style="margin-bottom:1.25rem;">
          <div class="smini"><div class="v">${p.xp.toLocaleString()}</div><div class="l">XP total</div></div>
          <div class="smini"><div class="v">🪙 ${p.gold}</div><div class="l">Or</div></div>
          <div class="smini"><div class="v">${p.fragments||0} ✨</div><div class="l">Fragments</div></div>
          <div class="smini"><div class="v">${p.missions}</div><div class="l">Missions</div></div>
        </div>
        <div class="pbody">
          <div>
            <div class="stitle">Atributos</div>
            ${(function(){var eff=getEffectiveAttrs(p);return Object.entries(p.attrs).map(function(e){var k=e[0],v=e[1],ev=eff[k]||v,bonus=ev-v;return '<div class="srow"><span class="slbl" title="'+attrName(k)+'">'+attrName(k)+'</span><div class="strk"><div class="sfill" style="width:'+Math.round(Math.min(100,ev/99*100))+'%;background:'+AC[k]+';"></div></div><span class="snum">'+v+(bonus>0?' <span style=\'color:var(--gold);font-size:10px;\'>+'+bonus+'</span>':'')+'</span></div>';}).join('');})()}
            <div class="pentagon-wrap" style="margin-top:1rem;">${buildPentagon(getEffectiveAttrs(p),p.color)}</div>
            <div class="stitle" style="margin-top:1rem;">Equipament</div>
            ${(function(){var eq=Object.values(p.equipped||{}).filter(Boolean);if(!eq.length)return '<div style="font-size:12px;color:var(--muted);">Sense equipament.</div>';var items=eq.map(function(id){return shopItems.find(function(i){return i.id===id;});}).filter(Boolean);return '<div class="erow">'+items.map(function(i){return '<span class="epill" style="border-color:var(--gold);color:var(--gold);">'+(i.icon||'')+' '+i.name+'</span>';}).join('')+'</div>';})()}
          </div>
          <div>
            <div class="stitle">Història</div>
            <p class="plore" style="margin-bottom:1rem;">${p.lore}</p>
            <div class="stitle">Showcase</div>
            <div class="hero-showcase">${(function(){if(!p.showcase)p.showcase=[null,null,null];return p.showcase.map(function(cid,si){var card=cid?gachaCards.find(function(x){return x.id===cid;}):null;var url=card?(card.imageUrl||CFG.GITHUB_RAW+card.image):'';var canEdit=session.playerId===p.id;if(card&&url)return '<img class="showcase-img" src="'+url+'" alt="'+card.name+'"'+(canEdit?' onclick="openShowcaseSelector('+si+')" title="Clic para cambiar"':'')+' onerror="this.style.opacity=0"/>';return canEdit?'<div class="showcase-empty" onclick="openShowcaseSelector('+si+')" title="Añadir carta del gacha">＋</div>':'<div class="showcase-empty" style="cursor:default;opacity:.4;">✦</div>';}).join('');})()}</div>
            ${recent.length?`<div class="stitle">Últimas misiones</div>`+recent.map(m=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);"><span style="font-size:12px;color:var(--text);">${m.name}</span><span class="badge b-teal">+${m.xp} XP</span></div>`).join(''):''}
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
          </div>
          <div id="inline-avatar-controls" class="pcustom-controls"></div>
        </div>
      </div>`:''}
    </div>`;
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
    document.getElementById('arcs-grid').innerHTML='<div style="font-size:13px;color:var(--muted);">Sin arcos aún. Crea uno desde Misiones → Nou arc.</div>';
    return;
  }
  document.getElementById('arcs-grid').innerHTML=myArcs.map(a=>{
    const pct=a.total>0?Math.round(a.done/a.total*100):0;
    const canDel=session.isAdmin||(a.createdBy===session.playerId);
    return `<div class="arcc">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div class="arcn">${a.name}</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <span class="badge ${a.status==='done'?'b-purple':a.status==='active'?'b-teal':'b-gray'}">${a.status==='done'?'Completado':a.status==='active'?'Activo':'Bloqueado'}</span>
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
  const sorted=[...players].filter(p=>p.id!=='admin_special').sort((a,b)=>b.xp-a.xp);
  document.getElementById('rank-list').innerHTML=sorted.map((p,i)=>{
    const rc=i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const rs=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
    return `<div class="lbrow">
      <span class="lbrnk ${rc}">${rs}</span>
      <div class="av av-sm" style="background:${p.colorBg};border-color:${p.color};">${p.emblem}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:500;">${p.name}</div><div style="font-size:11px;color:var(--muted);">${p.cls} · Nv.${p.level}</div></div>
      <div class="lbxp">${p.xp.toLocaleString()} XP</div>
      <span style="font-size:13px;color:var(--gold);width:70px;text-align:right;">🪙 ${p.gold}</span>
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
  const pool=gachaCards.filter(c=>c.rarity===rarity);
  if(!pool.length)return gachaCards[Math.floor(Math.random()*gachaCards.length)];
  return pool[Math.floor(Math.random()*pool.length)];
}

function pullResult(){
  const gachaItems=shopItems.filter(i=>i.via==='gacha'||i.via==='tienda');
  if(gachaItems.length&&Math.random()<0.3){
    return {type:'item',data:gachaItems[Math.floor(Math.random()*gachaItems.length)]};
  }
  if(!gachaCards.length)return null;
  const card=pullCard();
  if(!card)return null;
  return {type:'card',data:card};
}
function doPull(times){
  const p=players.find(pl=>pl.id===session.playerId);
  if(!p){toast('Inicia sesión para invocar.');return;}
  const cost=times===1?GACHA_COST_SINGLE:GACHA_COST_MULTI;
  const costPerPull=cost/times;
  if(!session.isAdmin){
    if((p.fragments||0)<cost){toast(`Necessites ${cost} fragments ✨ per invocar.`);return;}
    p.fragments-=cost;
  }
  const results=Array.from({length:times},()=>pullResult()).filter(r=>r!==null);
  if(!results.length){toast('No hi ha cartes disponibles.');return;}
  if(!p.gallery)p.gallery=[];
  if(!p.inventory)p.inventory=[];
  var refund=0,dupes=0;
  results.forEach(r=>{
    if(r.type==='card'){
      var already=p.gallery.indexOf(r.data.id)>=0;
      if(already){refund+=Math.floor(costPerPull/2);dupes++;r._dupe=true;}
      else p.gallery.push(r.data.id);
    }else if(r.type==='item'){
      var haveItem=p.inventory.indexOf(r.data.id)>=0;
      if(haveItem){refund+=Math.floor(costPerPull/2);dupes++;r._dupe=true;}
      else p.inventory.push(r.data.id);
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
    var dupeMsg=r._dupe?'<div class="gacha-dupe-msg">✨ Ja el tenies · +'+Math.floor(costPerPull/2)+' retornats</div>':'';
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

function renderGalleryCards(galleryEntries,mode){
  if(!galleryEntries||!galleryEntries.length)return`<div class="gallery-empty">Sin cartas aún. ¡Ve al Gacha a invocar!</div>`;
  // agrupar por rareza
  const sorted=[...galleryEntries].map(e=>typeof e==='string'?e:e.cardId||e).sort((a,b)=>{
    const ca=gachaCards.find(x=>x.id===a),cb=gachaCards.find(x=>x.id===b);
    return RARITY_ORDER.indexOf(ca?.rarity||'comun')-RARITY_ORDER.indexOf(cb?.rarity||'comun');
  });
  return `<div class="gallery-grid">${sorted.map(e=>{
    const c=gachaCards.find(x=>x.id===e);if(!c)return'';
    const imgUrl=c?(c.imageUrl||CFG.GITHUB_RAW+c.image):'';
    return `<div class="gallery-card">
      <img src="${imgUrl}" alt="${c?c.name:''}" onerror="this.style.background='var(--bg3)';this.style.minHeight='120px';">
      <div class="gallery-card-label">
        <div class="gname">${c?c.name:'Carta desconocida'}</div>
        <div class="grarity rarity-${c?c.rarity:'comun'}">${c?RARITY_LABEL[c.rarity]:''}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

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

/* ══ EDIT MODAL ══ */
function openEditModal(pid){
  const p=players.find(p=>p.id===pid);if(!p)return;
  editPid=pid;
  document.getElementById('e-name').value=p.name;
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
    document.getElementById('e-cls').value=p.cls;
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
  if(!confirm('¿Seguro que quieres eliminar a '+p.name+'? Esta acción no se puede deshacer.'))return;
  const _delId=editPid;
  players=players.filter(p=>p.id!==_delId);
  missions=missions.map(m=>m.playerId===_delId?{...m,playerId:''}:m);
  arcs=arcs.filter(a=>!a.id.includes(_delId));
  if(CFG.MODE==='supabase'){
    saveToSupabase();
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
  p.lore=document.getElementById('e-lore').value.trim();
  p.quote=document.getElementById('e-quote').value.trim();
  if(session.isAdmin){
    p.xp=parseInt(document.getElementById('e-xp').value)||p.xp;
    p.gold=parseInt(document.getElementById('e-gold').value)||p.gold;
    p.fragments=parseInt(document.getElementById('e-frag').value)||0;
    // Nivel: si el admin lo pone manualmente lo respeta; si no, lo deriva de XP
    var manualLevel=parseInt(document.getElementById('e-level').value);
    p.level=manualLevel&&manualLevel>0?manualLevel:Math.floor(p.xp/100)+1;
    // Clase: solo resetea attrs si REALMENTE cambió de clase
    var newCls=document.getElementById('e-cls').value;
    var clsChanged=newCls!==p.cls;
    p.cls=newCls;
    var cls=CLASSES.find(c=>c.name===p.cls);
    if(cls){p.role=cls.role;if(clsChanged)p.attrs={...cls.attrs};}
    // Stats manuales (siempre se aplican, después del posible reset por cambio de clase)
    attrKeys().forEach(function(k){
      var el=document.getElementById('e-attr-'+k);
      if(el)p.attrs[k]=parseInt(el.value)||0;
    });
  }
  if(CFG.MODE==='supabase')saveToSupabase();
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
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var eqWrap=document.getElementById('my-equipped');
  if(eqWrap){
    if(!p){
      eqWrap.innerHTML='<div class="stitle">Equipamiento (admin no tiene personaje)</div>';
    }else{
    var slots=['arma','armadura','accesorio','casco','botas'];
    var slotIcons={arma:'⚔️',armadura:'🛡️',accesorio:'💎',casco:'⛑️',botas:'👟'};
    eqWrap.innerHTML='<div class="stitle">Equipat actualment</div><div class="equipped-slots">'
      +slots.map(function(slot){
        var itemId=p.equipped?p.equipped[slot]:null;
        var item=shopItems.find(function(i){return i.id===itemId;});
        return '<div class="eslot '+(item?'filled':'')+'">'
          +'<span>'+(item?item.icon:slotIcons[slot])+'</span>'
          +'<div><div class="eslot-label">'+slot+'</div>'
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
  var shopSortBy=(document.getElementById('shop-sort')?document.getElementById('shop-sort').value:'rarity');
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
    var canBuy=p&&canBuyItem(p,item)&&!owned;
    var meetsR=p&&meetsReqs(p,item);
    var cls=equipped?'equipped':owned?'owned':canBuy?'can-buy':!meetsR?'locked':'';
    var bonusStr=Object.entries(item.bonus||{}).filter(function(e){return e[1]>0;}).map(function(e){return '+'+e[1]+' '+AN[e[0]];}).join(' · ');
    var reqStr=Object.entries(item.minAttrs||{}).filter(function(e){return e[1]>0;}).map(function(e){return AN[e[0]]+' '+e[1]+'+';}).join(' · ');
    var btn='';
    if(equipped)btn='<button class="btn btn-sm" style="margin-top:auto;" onclick="unequipItem(\''+item.id+'\')">Desequipar</button>';
    else if(owned)btn='<button class="btn btn-sm btn-p" style="margin-top:auto;" onclick="equipItem(\''+item.id+'\')">Equipar</button>';
    else if(canBuy)btn='<button class="btn btn-sm btn-gold" style="margin-top:auto;" onclick="buyItem(\''+item.id+'\')">Comprar 🪙 '+item.cost+'</button>';
    else if(!meetsR)btn='<div style="font-size:11px;color:var(--coral);margin-top:auto;">🔒 Requisitos no cumplidos</div>';
    else btn='<div style="font-size:11px;color:var(--coral);margin-top:auto;">🪙 Oro insuficiente</div>';
    return '<div class="shop-item '+cls+'">'
      +(item.imageUrl?'<img src="'+item.imageUrl+'" alt="'+item.name+'" style="width:100%;height:120px;object-fit:cover;border-radius:var(--radius);margin-bottom:4px;">':'<div class="item-icon">'+item.icon+'</div>')
      +'<div class="item-name">'+item.name+'</div>'
      +'<div class="item-slot">'+item.slot+'</div>'
      +'<div class="item-desc">'+item.desc+'</div>'
      +(bonusStr?'<div class="item-bonus">⬆️ '+bonusStr+'</div>':'')
      +(reqStr?'<div class="item-reqs">📋 Req: '+reqStr+' · Nv.'+item.minLevel+'+'+'</div>':'')
      +'<div class="item-cost">'+(owned?'✅ Comprado':'🪙 '+item.cost)+'</div>'
      +btn+'</div>';
  }).join('')+'</div>';
}
function buyItem(itemId){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!p||!item)return;
  if(!canBuyItem(p,item)){toast('No puedes comprar este item.');return;}
  p.gold-=item.cost;
  if(!p.inventory)p.inventory=[];
  p.inventory.push(itemId);
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
  var item=shopItems.find(function(i){return i.id===itemId;});
  if(!p||!item||!p.equipped)return;
  p.equipped[item.slot]=null;
  if(CFG.MODE==='supabase')saveToSupabase();
  renderShop();renderHeroProfile(curHero);
  
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
  if(CFG.MODE==='supabase')await saveItemToSupabase(newItem);
  ['ai-name','ai-icon','ai-imageurl','ai-desc','ai-cost','ai-lvl'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
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
function renderAdminItemsPage(){
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
  });
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
    +'<div class="field"><label>Slot</label><select id="aem-slot">'+SLOT_DEFS.map(function(s){return '<option value="'+s.key+'"'+(item.slot===s.key?' selected':'')+'>'+s.icon+' '+s.label+'</option>';}).join('')+'</select></div>'
    +'<div class="field"><label>Raresa</label><select id="aem-rarity"><option value="comun"'+(item.rareza==='comun'?' selected':'')+'>Comú</option><option value="rara"'+(item.rareza==='rara'?' selected':'')+'>Rara</option><option value="epica"'+(item.rareza==='epica'?' selected':'')+'>Èpica</option><option value="legendaria"'+(item.rareza==='legendaria'?' selected':'')+'>Llegendària</option></select></div>'
    +'<div class="field"><label>Cost (or)</label><input type="number" id="aem-cost" value="'+(item.cost||0)+'"/></div>'
    +'<div class="field"><label>Nivell mínim</label><input type="number" id="aem-lvl" value="'+(item.minLevel||1)+'"/></div>'
    +'</div>'
    +'<div class="field"><label>Disponible a</label><select id="aem-via"><option value="tienda"'+(item.via==='tienda'?' selected':'')+'>Botiga+Gacha</option><option value="gacha"'+(item.via==='gacha'?' selected':'')+'>Només Gacha</option><option value="solo_tienda"'+(item.via==='solo_tienda'?' selected':'')+'>Només Botiga</option></select></div>'
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
    item.rareza=document.getElementById('aem-rarity').value;
    item.cost=parseInt(document.getElementById('aem-cost').value)||0;
    item.minLevel=parseInt(document.getElementById('aem-lvl').value)||1;
    item.via=document.getElementById('aem-via').value;
    var _px=document.getElementById('aem-px'),_py=document.getElementById('aem-py'),_pw=document.getElementById('aem-pw');
    item.avatarPos={x:parseFloat(_px.value)||0,y:parseFloat(_py.value)||0,w:parseFloat(_pw.value)||60};
    item.minAttrs={};attrKeys().forEach(function(k){var el=document.getElementById('aem-r'+k);item.minAttrs[k]=el?(parseInt(el.value)||0):0;});
    item.bonus={};attrKeys().forEach(function(k){var el=document.getElementById('aem-b'+k);item.bonus[k]=el?(parseInt(el.value)||0):0;});
    if(CFG.MODE==='supabase')saveItemToSupabase(item);
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
      +'<div style="font-size:11px;color:var(--muted);">'+(sl?sl.icon+' '+sl.label:item.slot)+' · '+item.rareza+' · 🪙 '+item.cost+' · '+viaLabel+'</div>'
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
  ['tab-items','tab-cartas','tab-custom'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.style.display=id===tabId?'block':'none';
  });
  if(tabId==='tab-cartas')renderAdminCartasPage();
  if(tabId==='tab-custom')renderCustomTraitsAdmin();
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
  });
  var countEl=document.getElementById('ac-count');
  if(countEl)countEl.textContent=cartas.length;
  var wrap=document.getElementById('ac-list');
  if(!wrap)return;
  if(!cartas.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);">No hi ha cartes.</div>';return;}
  var rarityColor={comun:'var(--muted)',rara:'var(--teal)',epica:'var(--accent)',legendaria:'var(--gold)'};
  wrap.innerHTML=cartas.map(function(carta){
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);">'
      +(carta.imageUrl?'<img src="'+carta.imageUrl+'" style="width:36px;height:50px;object-fit:cover;border-radius:var(--radius);flex-shrink:0;">':'<div style="width:36px;height:50px;background:var(--bg3);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:18px;">🃏</div>')
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
  if(!evs.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sin eventos.</div>';return;}
  wrap.innerHTML=evs.map(e=>eventItemHTML(e)).join('');
}

function renderUpcoming(){
  const wrap=document.getElementById('cal-upcoming');
  if(!wrap)return;
  const today=formatDate(new Date());
  const upcoming=getFilteredEvents(calState.filter).filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  if(!upcoming.length){wrap.innerHTML='<div style="font-size:13px;color:var(--muted);padding:.5rem 0;">Sin eventos próximos.</div>';return;}
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
  document.getElementById('cal-modal-title').textContent=e?'Editar evento':'Nou esdeveniment';
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
  if(!title){toast('El evento necesita un título.');return;}
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
  if(!confirm('¿Eliminar este evento?'))return;
  calEvents=calEvents.filter(e=>e.id!==calState.editingEventId);
  if(CFG.MODE==='supabase')saveToSupabase();
  closeEventModal();renderCalendar();
}




/* ══ PLANNER IMPORT ══ */
let plannerRows=[];
let plannerHeaders=[];

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
    toast('Formato no soportado. Usa .csv o .xlsx');
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
  // Parse XLSX manually (simple version - read as text looking for shared strings)
  // For full xlsx support we'd need a library, but Planner exports simple xlsx
  // Try to convert to CSV-like by extracting text
  try {
    var arr=new Uint8Array(buffer);
    var str=String.fromCharCode.apply(null,arr);
    // Check if it's actually a CSV saved as xlsx
    if(str.startsWith('Task Name')||str.startsWith('Nombre')){
      parsePlannerCSV(str);return;
    }
    // Show message to save as CSV
    toast('Por favor exporta el archivo como CSV desde Excel: Archivo → Guardar como → CSV');
    document.getElementById('planner-drop').innerHTML='<div style="font-size:14px;color:var(--coral);">⚠️ Guarda el archivo como CSV (.csv) desde Excel y vuelve a subirlo.</div>';
  } catch(e) {
    toast('Error al leer el archivo. Guárdalo como CSV e inténtalo de nuevo.');
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
  table.innerHTML='<thead><tr>'+cols.map(function(h){
    return '<th style="text-align:left;padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:11px;color:var(--muted);font-weight:500;">'+h+'</th>';
  }).join('')+'</tr></thead><tbody>'+plannerRows.slice(0,10).map(function(row){
    return '<tr>'+cols.map(function(h){
      return '<td style="padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:12px;color:var(--text);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(row[h]||'')+'</td>';
    }).join('')+'</tr>';
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

  // Dificultad por defecto FIJA
  var DEFAULT_DIFF='C';
  var DIFF_REWARDS={D:{xp:25,gold:10,frag:20},C:{xp:75,gold:25,frag:50},B:{xp:150,gold:50,frag:100},A:{xp:300,gold:100,frag:200},S:{xp:500,gold:200,frag:400}};
  var imported=0;

  plannerRows.forEach(function(row){
    var title=(row[titleCol]||'').trim();
    if(!title)return;

    // Skip if already imported (same plannerId)
    var existingId='planner_'+title.replace(/\s+/g,'_').toLowerCase().slice(0,30);
    if(missions.find(function(m){return m.plannerId===existingId;}))return;

    // Map status
    var plannerStatus=(row[statusCol]||'').toLowerCase();
    var status=plannerStatus.includes('complet')||plannerStatus.includes('done')?'done':
               plannerStatus.includes('curso')||plannerStatus.includes('progres')||plannerStatus.includes('progress')?'active':'pending';

    // Find assignee by real name
    var assigneeName=(row[assignCol]||'').trim();
    var assignedPlayer=players.find(function(p){
      return p.realName&&assigneeName&&(
        p.realName.toLowerCase().includes(assigneeName.toLowerCase().split(';')[0].split(' ')[0])||
        assigneeName.toLowerCase().includes(p.realName.toLowerCase().split(' ')[0])
      );
    });

    // Difficulty by priority (fallback to default)
    var priorityMap={'urgente':'A','importante':'B','media':'C','baja':'D'};
    var taskPriority=(row['Priority']||row['Prioridad']||'').toLowerCase().trim();
    var taskDiff=priorityMap[taskPriority]||DEFAULT_DIFF;
    var rewards=DIFF_REWARDS[taskDiff]||DIFF_REWARDS[DEFAULT_DIFF];

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
      xp:rewards.xp,
      gold:rewards.gold,
      frag:rewards.frag||50,
      attr:'Inteligencia',attrPts:2,
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
    imported++;
  });

  if(CFG.MODE==='supabase')saveToSupabase();
  clearPlannerImport();
  renderAll();
  renderPlannerImported();
  document.getElementById('planner-imported').style.display='block';
  toast(imported+' missions importades');
}

function clearPlannerImport(){
  plannerRows=[];plannerHeaders=[];
  document.getElementById('planner-preview').style.display='none';
  document.getElementById('planner-file').value='';
  var drop=document.getElementById('planner-drop');
  if(drop)drop.innerHTML='<div style="font-size:32px;margin-bottom:8px;">📂</div><div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px;">Arrossega el teu fitxer aquí</div><div style="font-size:12px;color:var(--muted);">o haz clic para seleccionar — .xlsx, .csv</div><input type="file" id="planner-file" accept=".csv,.xlsx,.xls" style="display:none;" onchange="plannerFileSelected(this)"/>';
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
  if(CFG.MODE==='supabase')saveToSupabase();
  try{renderClassesAdmin();renderAll();}catch(e){console.error(e);}
  toast('Atribut tret');
}
function persistAttrs(){
  // Guarda la definición de atributos para recargarla
  try{localStorage.setItem('cg_attrs',JSON.stringify(ATTRS));}catch(e){}
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
  // Group shop items by slot for the selectors
  wrap.innerHTML=attrEditor+CLASSES.map(function(cls,idx){
    var startItems=cls.startItems||[];
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
      +'</div>'
      +'<div class="stitle">Estadístiques base</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-bottom:1rem;">'
        +attrKeys().map(function(k){
          return '<div style="display:flex;align-items:center;gap:8px;min-width:0;">'
            +'<label style="font-size:11px;color:var(--muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+AN[k]+'">'+AN[k]+'</label>'
            +'<input type="number" id="cls-'+k+'-'+idx+'" value="'+(cls.attrs[k]||0)+'" min="0" style="width:56px;flex-shrink:0;padding:6px;font-size:13px;border:0.5px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);text-align:center;"/></div>';
        }).join('')
      +'</div>'
      +'<div class="stitle">Equipament inicial (es dóna en crear el personatge)</div>'
      +'<div style="max-height:180px;overflow-y:auto;border:0.5px solid var(--border);border-radius:var(--radius);padding:6px;margin-bottom:1rem;display:grid;grid-template-columns:1fr 1fr;gap:2px;">'
        +(shopItems.length?itemsHtml:'<div style="font-size:12px;color:var(--muted);padding:6px;">No hi ha ítems creats encara.</div>')
      +'</div>'
      +'<div style="display:flex;justify-content:flex-end;">'
        +'<button class="btn btn-p btn-sm" data-idx="'+idx+'" onclick="saveClassEdit(parseInt(this.dataset.idx))">Desar canvis</button>'
      +'</div>'
      +'</div>';
  }).join('');
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
  attrKeys().forEach(function(k){
    cls.attrs[k]=parseInt(document.getElementById('cls-'+k+'-'+idx).value)||0;
  });
  // Collect selected start items
  var chks=document.querySelectorAll('.cls-item-chk[data-cls="'+idx+'"]:checked');
  cls.startItems=Array.prototype.map.call(chks,function(chk){return chk.getAttribute('data-item');});
  // Recompute bonus
  cls.bonus=computeClassBonus(cls.attrs);
  // If name changed, update players
  if(oldName!==newName){players.forEach(function(p){if(p.cls===oldName)p.cls=newName;});}
  // Save to dedicated table
  if(CFG.MODE==='supabase'){await saveClassToSupabase(cls,idx);if(oldName!==newName)saveToSupabase();}
  renderClassesAdmin();
  toast('Classe "'+newName+'" actualitzada');
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
    if(m.plannerAssignee)metaParts.push('👤 Assignat: '+m.plannerAssignee);
    if(m.plannerCreator)metaParts.push('✍️ Creat per: '+m.plannerCreator);
    if(m.deadline)metaParts.push('📅 '+m.deadline);
    if(m.plannerTags)metaParts.push('🏷️ '+m.plannerTags);
    var statusLabel=m.status==='done'?'Completada':m.status==='active'?'En curs':'Pendent';
    var statusCls=m.status==='done'?'b-teal':m.status==='active'?'b-gold':'b-gray';
    return '<div style="padding:10px 0;border-bottom:0.5px solid var(--border);">'
      +'<div style="display:flex;align-items:center;gap:10px;">'
        +'<span class="badge d'+m.diff+'">'+m.diff+'</span>'
        +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;">'+m.name+'</div></div>'
        +'<span class="badge '+statusCls+'">'+statusLabel+'</span>'
        +'<button class="btn btn-sm" style="font-size:11px;" data-mid="'+m.id+'" onclick="deleteMission(this.dataset.mid)">✕</button>'
      +'</div>'
      +(metaParts.length?'<div style="font-size:11px;color:var(--muted);margin-top:4px;padding-left:2px;">'+metaParts.join(' · ')+'</div>':'')
      +(m.desc?'<div style="font-size:11px;color:var(--muted);margin-top:4px;padding:6px 8px;background:var(--bg3);border-radius:var(--radius);white-space:pre-wrap;">'+m.desc+'</div>':'')
      +'</div>';
  }).join('');
}


/* ══ TUTORIAL ══ */
function createWelcomeArc(p){
  var arcName='Bienvenida al Cuartel General';
  arcs.push({id:'arc_welcome_'+p.id,name:arcName,lore:'¡Bienvenido al equipo! Completa estas dos misiones para arrancar tu aventura con buen pie.',status:'active',total:2,done:0,createdBy:'system'});
  missions.push({id:'wlc1_'+p.id,name:'Preséntate al equipo',arc:arcName,playerId:p.id,status:'pending',diff:'C',xp:100,gold:450,attr:'Carisma',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'});
  missions.push({id:'wlc2_'+p.id,name:'Configura tu primer objetivo',arc:arcName,playerId:p.id,status:'pending',diff:'C',xp:0,gold:450,attr:'Sabiduría',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'});
  updateArcCounts();
}
function createTutorialForPlayer(p){
  var arcName='Tutorial: Primeros Pasos';
  arcs.push({id:'arc_tutorial_'+p.id,name:arcName,lore:'Aprende lo básico del Cuartel General completando estas 3 misiones.',status:'active',total:3,done:0,createdBy:'system'});
  var tuts=[
    {id:'tut1_'+p.id,name:'Explora tu Héroe',desc:'Ve a la sección Héroes y revisa tu ficha: atributos, nivel, oro y el gráfico de pentágono. Cuando subas de nivel podrás repartir 3 puntos entre tus stats con los botones + y −.',arc:arcName,playerId:p.id,status:'pending',diff:'D',xp:25,gold:50,attr:'Sabiduría',attrPts:1,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
    {id:'tut2_'+p.id,name:'Invoca en el Gacha',desc:'Ve a la sección Gacha y haz tu primera invocación con 100 de oro. Puedes obtener cartas ilustradas o items de equipamiento. Las cartas se guardan en tu galería y los items en tu Inventario.',arc:arcName,playerId:p.id,status:'pending',diff:'C',xp:75,gold:100,attr:'Agilidad',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
    {id:'tut3_'+p.id,name:'Crea tu primera Misión',desc:'Ve a Misiones y despliega "Nova missió". Escribe el nombre, una descripción, elige el arco y guárdala. Las misiones normales dan 75 XP y 25 oro. Las diarias se repiten cada día automáticamente.',arc:arcName,playerId:p.id,status:'pending',diff:'C',xp:75,gold:100,attr:'Carisma',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
  ];
  tuts.forEach(function(m){missions.push(m);});
  updateArcCounts();
}


/* ══ OPTIMIZACIÓN JSON ══ */
function cleanOldCompleted(){
  // Mantener solo las últimas 20 misiones completadas por jugador (no diarias)
  players.forEach(function(p){
    var done=missions.filter(function(m){
      return m.status==='done'&&m.playerId===p.id&&!m.isDaily_instance;
    });
    if(done.length>20){
      // Sort by id (timestamp-based) descending, keep newest 20
      done.sort(function(a,b){return b.id.localeCompare(a.id);});
      var toRemove=done.slice(20).map(function(m){return m.id;});
      missions=missions.filter(function(m){return toRemove.indexOf(m.id)<0;});
    }
  });
  // Remove daily instances older than today
  var today=new Date().toISOString().slice(0,10);
  missions=missions.filter(function(m){
    return !(m.isDaily_instance&&m.status==='done'&&m.deadline<today);
  });
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
  // Capas de items equipados (todos los slots, ordenados por z)
  if(p.equipped){
    SLOT_DEFS.slice().sort(function(a,b){return (a.pos.z||0)-(b.pos.z||0);}).forEach(function(sl){
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
  renderAvatarEditor();
  document.getElementById('avatar-editor-modal').style.display='flex';
}
function closeAvatarEditor(){
  document.getElementById('avatar-editor-modal').style.display='none';
  _avatarEditPid=null;
}
function renderAvatarEditor(previewId,controlsId){
  previewId=previewId||'avatar-editor-preview';
  controlsId=controlsId||'avatar-editor-controls';
  var p=players.find(function(pl){return pl.id===_avatarEditPid;});
  if(!p)return;
  var av=getPlayerAvatar(p);
  var pv=document.getElementById(previewId);if(pv){pv.innerHTML=renderAvatar(p,'pixel-avatar-lg');enableAvatarDrag(previewId);}
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
  // Menú desplegable con todas las opciones de forma
  function selector(key,label){
    var cur=av[key]||AVATAR_OPTS[key][0];
    var opts=AVATAR_OPTS[key].map(function(v,i){
      var name=v==='none'?'Cap':(i+(AVATAR_OPTS[key][0]==='none'?0:1))+' — '+v;
      return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+name+'</option>';
    }).join('');
    return '<div class="ava-opt-row"><label>'+label+'</label>'
      +'<select onchange="setAvatarShape(\''+key+'\',this.value)" style="flex:1;padding:6px 8px;font-size:13px;border:2px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);cursor:pointer;">'+opts+'</select>'
      +'</div>';
  }
  // Colores
  html+=colorPicker('skinColor','Pell');
  html+=colorPicker('bgColor','Color de fons');
  html+=colorPicker('hairColor','Color cabell');
  html+=colorPicker('eyesColor','Color ulls');
  html+=colorPicker('clothingColor','Color roba');
  html+=colorPicker('glassesColor','Color ulleres');
  html+=colorPicker('hatColor','Color barret');
  html+=colorPicker('accessoriesColor','Color accessoris');
  html+='<div style="border-top:0.5px solid var(--border);margin:10px 0;padding-top:6px;"></div>';
  // Formas (desplegables)
  html+=selector('hair','Pentinat');
  html+=selector('eyes','Ulls');
  html+=selector('mouth','Boca');
  html+=selector('clothing','Roba');
  html+=selector('glasses','Ulleres');
  html+=selector('beard','Barba');
  html+=selector('hat','Barret');
  html+=selector('accessories','Accessoris');
  // Cosmètics: 5 slots per posar qualsevol cosmètic que tinguis
  if(p.equipped){
    if(!p.equipPos)p.equipPos={};
    var cosmeticSlots=SLOT_DEFS.filter(function(sl){return sl.cosmetic;});
    var ownedCosmetics=(p.inventory||[]).filter(function(id){var it=shopItems.find(function(i){return i.id===id;});return it&&it.isCosmetic;});
    html+='<div style="grid-column:1/-1;border-top:0.5px solid var(--border);margin:10px 0;padding-top:6px;"></div>';
    html+='<div class="stitle" style="grid-column:1/-1;">✨ Cosmètics</div>';
    if(!ownedCosmetics.length){
      html+='<div style="grid-column:1/-1;font-size:12px;color:var(--muted);margin-bottom:8px;">No tens cap cosmètic encara. Aconsegueix-ne a la botiga o al gacha!</div>';
    }else{
      html+='<div style="grid-column:1/-1;font-size:11px;color:var(--muted);margin-bottom:8px;">🖱️ Arrossega els cosmètics sobre l\'avatar per moure\'ls.</div>';
    }
    cosmeticSlots.forEach(function(sl,idx){
      var cur=p.equipped[sl.key]||'';
      var opts='<option value="">— Buit —</option>'+ownedCosmetics.map(function(id){
        var it=shopItems.find(function(i){return i.id===id;});
        return '<option value="'+id+'"'+(cur===id?' selected':'')+'>'+(it.icon||'✨')+' '+it.name+'</option>';
      }).join('');
      html+='<div style="grid-column:1/-1;margin-bottom:10px;border:0.5px solid var(--border);border-radius:var(--radius);padding:8px;">'
        +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">'
        +'<span style="font-size:12px;color:var(--muted);flex-shrink:0;">Cosmètic</span>'
        +'<select onchange="equipFromEditor(\''+sl.key+'\',this.value)" style="flex:1;padding:6px;font-size:12px;border:2px solid var(--border2);border-radius:var(--radius);background:var(--bg2);color:var(--text);">'+opts+'</select>'
        +'</div>';
      var it=cur?shopItems.find(function(i){return i.id===cur;}):null;
      if(it&&it.imageUrl){
        var ps=p.equipPos[sl.key]||it.avatarPos||sl.pos;
        html+='<div style="display:flex;align-items:center;gap:6px;">'
          +'<span style="font-size:11px;width:40px;">⛶ Mida</span>'
          +'<button class="ava-cycle-btn" onclick="nudgeEquipPos(\''+sl.key+'\',\'w\',-4)">−</button>'
          +'<input type="range" min="8" max="140" value="'+ps.w+'" style="flex:1;" oninput="setEquipPos(\''+sl.key+'\',\'w\',this.value)"/>'
          +'<button class="ava-cycle-btn" onclick="nudgeEquipPos(\''+sl.key+'\',\'w\',4)">+</button>'
          +'<span style="font-size:11px;width:32px;text-align:right;" id="eqp-w-'+sl.key+'">'+Math.round(ps.w)+'</span>'
          +'</div>'
          +'<button class="btn btn-sm" style="width:100%;margin-top:4px;" onclick="resetEquipPos(\''+sl.key+'\')">↺ Posició per defecte</button>';
      }
      html+='</div>';
    });
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

/* ══ PENTAGON ══ */
function buildPentagon(attrs,color){
  var keys=attrKeys();
  var labels=keys.map(function(k){var n=attrName(k)||k;return attrIcon(k)+' '+n.slice(0,4).toUpperCase();});
  var cx=100,cy=100,r=75,n=keys.length||1;
  var bgLvls=[0.25,0.5,0.75,1.0];
  var bgSvg=bgLvls.map(function(lv){
    var pts=keys.map(function(k,i){var a=(Math.PI*2/n)*i-Math.PI/2;return (cx+r*lv*Math.cos(a)).toFixed(1)+','+(cy+r*lv*Math.sin(a)).toFixed(1);}).join(' ');
    return '<polygon class="penta-bg" points="'+pts+'"/>';
  }).join('');
  var axes=keys.map(function(k,i){var a=(Math.PI*2/n)*i-Math.PI/2;return '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+r*Math.cos(a)).toFixed(1)+'" y2="'+(cy+r*Math.sin(a)).toFixed(1)+'" stroke="var(--border)" stroke-width="1"/>';}).join('');
  var dataPts=keys.map(function(k,i){var a=(Math.PI*2/n)*i-Math.PI/2;var v=Math.min(100,attrs[k]||0)/100;return {x:cx+r*v*Math.cos(a),y:cy+r*v*Math.sin(a),lx:cx+(r+20)*Math.cos(a),ly:cy+(r+20)*Math.sin(a),label:labels[i],val:attrs[k]||0};});
  var fillPts=dataPts.map(function(p){return p.x.toFixed(1)+','+p.y.toFixed(1);}).join(' ');
  var lblSvg=dataPts.map(function(p){return '<text class="penta-label" x="'+p.lx.toFixed(1)+'" y="'+p.ly.toFixed(1)+'" text-anchor="middle" dominant-baseline="middle">'+p.label+'</text><text class="penta-value" x="'+(p.x+(p.lx-p.x)*0.45).toFixed(1)+'" y="'+(p.y+(p.ly-p.y)*0.45).toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" fill="'+color+'">'+p.val+'</text>';}).join('');
  return '<svg width="200" height="200" viewBox="0 0 200 200" style="overflow:visible">'+bgSvg+axes+'<polygon class="penta-fill" points="'+fillPts+'" fill="'+color+'" stroke="'+color+'"/>'+lblSvg+'</svg>';
}

/* ══ INVENTARIO ══ */
function renderInventario(){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  var eqEl=document.getElementById('inv-slots-equip');
  var cosmEl=document.getElementById('inv-slots-cosm');
  var gw=document.getElementById('inv-grid');
  if(!gw)return;
  if(!p){if(eqEl)eqEl.innerHTML='<div style="color:var(--muted);font-size:13px;">Inicia sessió.</div>';if(cosmEl)cosmEl.innerHTML='';gw.innerHTML='';return;}
  if(!p.equipped)p.equipped=emptyEquipped();
  // Qué slots son cosméticos: los que solo tienen items isCosmetic disponibles, o por convención (gafas,sombrero,capa,alas). Mejor: por tipo de item.
  var COSMETIC_SLOTS=SLOT_DEFS.filter(function(s){return s.cosmetic;}).map(function(s){return s.key;});
  function slotCard(sl){
    var iid=p.equipped[sl.key];
    var item=shopItems.find(function(i){return i.id===iid;});
    var html='<div class="inv-slot '+(item?'filled':'')+'" onclick="invEquipSlot(\''+sl.key+'\')">';
    html+='<div class="inv-slot-icon">'+(item?(item.imageUrl?'<img src="'+item.imageUrl+'" style="width:32px;height:32px;object-fit:contain;">':item.icon):sl.icon)+'</div>';
    html+='<div class="inv-slot-name">'+(item?item.name:'Buit')+'</div>';
    html+='<div class="inv-slot-label">'+sl.label+'</div>';
    if(item)html+='<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;margin-top:4px;" onclick="event.stopPropagation();unequipItem(\''+iid+'\');renderInventario();">✕ Treure</button>';
    html+='</div>';
    return html;
  }
  if(eqEl)eqEl.innerHTML=SLOT_DEFS.filter(function(sl){return COSMETIC_SLOTS.indexOf(sl.key)<0;}).map(slotCard).join('');
  if(cosmEl)cosmEl.innerHTML=SLOT_DEFS.filter(function(sl){return COSMETIC_SLOTS.indexOf(sl.key)>=0;}).map(slotCard).join('');
  // Filtro de slot del catálogo (dinámico con todos los slots)
  var slotFilterEl=document.getElementById('inv-filter-slot');
  if(slotFilterEl&&slotFilterEl.options.length<=1){
    slotFilterEl.innerHTML='<option value="">Tots els slots</option>'+SLOT_DEFS.map(function(s){return '<option value="'+s.key+'">'+s.icon+' '+s.label+'</option>';}).join('');
  }
  var invSearch=(document.getElementById('inv-search')?document.getElementById('inv-search').value.toLowerCase().trim():'');
  var invSlot=(document.getElementById('inv-filter-slot')?document.getElementById('inv-filter-slot').value:'');
  var invRarity=(document.getElementById('inv-filter-rarity')?document.getElementById('inv-filter-rarity').value:'');
  var invSortBy=(document.getElementById('inv-sort')?document.getElementById('inv-sort').value:'rarity');
  var inv=(p.inventory||[]).filter(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(!item)return false;
    if(invSearch&&item.name.toLowerCase().indexOf(invSearch)<0)return false;
    if(invSlot&&item.slot!==invSlot)return false;
    if(invRarity&&item.rareza!==invRarity)return false;
    return true;
  }).sort(function(a,b){
    var ia=shopItems.find(function(i){return i.id===a;}),ib=shopItems.find(function(i){return i.id===b;});
    if(invSortBy==='name')return(ia?ia.name:'').localeCompare(ib?ib.name:'');
    return RARITY_ORDER.indexOf(ia?ia.rareza:'comun')-RARITY_ORDER.indexOf(ib?ib.rareza:'comun');
  });
  if(!inv.length){gw.innerHTML='<div style="font-size:13px;color:var(--muted);padding:1rem;grid-column:1/-1;">La motxilla està buida.</div>';return;}
  gw.innerHTML=inv.map(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(!item)return '';
    var eq=p.equipped&&Object.values(p.equipped).indexOf(iid)>=0;
    var bonusStr=Object.entries(item.bonus||{}).filter(function(e){return e[1]>0;}).map(function(e){return '+'+e[1]+' '+AN[e[0]];}).join(' · ');
    var html='<div class="inv-item bg-rarity-'+(item.rareza||'comun')+' '+(eq?'equipped':'')+'">';
    html+=(item.imageUrl?'<img src="'+item.imageUrl+'" alt="'+item.name+'" style="width:100%;height:90px;object-fit:contain;border-radius:var(--radius);margin-bottom:4px;background:var(--bg3);">':'<div style="font-size:24px;text-align:center;">'+item.icon+'</div>');
    html+='<div style="font-size:12px;font-weight:500;">'+item.name+'</div>';
    var slLbl=(SLOT_DEFS.find(function(s){return s.key===item.slot;})||{}).label||item.slot;
    html+='<div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);">'+slLbl+'</div>';
    if(bonusStr)html+='<div style="font-size:10px;color:var(--accent);">⬆️ '+bonusStr+'</div>';
    html+='<div style="margin-top:auto;padding-top:6px;">';
    if(eq){
      html+='<button class="btn btn-sm" style="width:100%;" onclick="unequipItem(\''+iid+'\');renderInventario();">Treure</button>';
    }else{
      html+='<button class="btn btn-sm btn-p" style="width:100%;" onclick="equipItem(\''+iid+'\');renderInventario();">Equipar</button>';
    }
    html+='</div></div>';
    return html;
  }).join('');
}
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
  var allIds=typeof p.gallery[0]==='string'?p.gallery:p.gallery.map(function(e){return e.cardId||e;});
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
  const statusLabel=m.status==='done'?'Completada':m.status==='active'?'En curs':'Pendiente';
  const statusCls=m.status==='done'?'b-teal':m.status==='active'?'b-gold':'b-gray';
  document.getElementById('mm-badges').innerHTML=
    `<span class="badge ${statusCls}">${statusLabel}</span>`
    +(m.daily?'<span class="badge b-gold">Diaria</span>':'')
    +`<span class="badge b-gray">${m.arc}</span>`
    +(p?`<span class="badge b-purple">${p.emblem} ${p.name}</span>`:'');
  document.getElementById('mm-desc').textContent=m.desc||m.name+' — Completa esta misión para obtener recompensas.';
  document.getElementById('mm-stats').innerHTML=
    `<div class="smini"><div class="v">${m.xp}</div><div class="l">XP</div></div>`
    +`<div class="smini"><div class="v">🪙 ${m.gold}</div><div class="l">Oro</div></div>`
    +`<div class="smini"><div class="v">${m.diff||'C'}</div><div class="l">Dificultad</div></div>`;
  const canComplete=(session.isAdmin||(session.playerId===m.playerId))&&m.status!=='done';
  const canDel=session.isAdmin||(m.createdBy===session.playerId);
  document.getElementById('mm-actions').innerHTML=
    (canComplete?`<button class="btn btn-p" onclick="completeMission('${m.id}');closeMissionModal();">✓ Completar</button>`:'')
    +(canDel?`<button class="btn" style="background:var(--coral-bg);color:var(--coral);" onclick="deleteMission('${m.id}');closeMissionModal();">🗑️ Eliminar</button>`:'')
    +`<button class="btn" onclick="closeMissionModal()">Tancar</button>`;
  const modal=document.getElementById('mission-modal');
  modal.style.display='flex';
}
function closeMissionModal(){
  document.getElementById('mission-modal').style.display='none';
}


/* ══ REANOMENAR MENÚS (ADMIN) ══ */
var menuNames={
  misiones:'Missions',heroe:'Herois',arcos:'Arcs',ranking:'Rànquing',
  gacha:'Gacha',tienda:'Botiga',inventario:'Inventari',
  calendario:'Calendari',planner:'Planner'
};
function loadMenuNames(){
  var saved=localStorage.getItem('cg_menu_names');
  if(saved){try{menuNames=JSON.parse(saved);}catch(e){}}
  applyMenuNames();
}
function applyMenuNames(){
  Object.keys(menuNames).forEach(function(k){
    var btn=document.getElementById('nav-'+k);
    if(!btn)return;
    var icon=btn.querySelector('.nb-icon');
    var iconHtml=icon?icon.outerHTML:'';
    btn.innerHTML=iconHtml+menuNames[k]+(session.isAdmin?'<button class="nb-edit-btn" title="Reanomenar">✏️</button>':'');
    if(session.isAdmin){
      var eb=btn.querySelector('.nb-edit-btn');
      if(eb){eb.addEventListener('click',function(ev){ev.stopPropagation();promptRenameMenu(k);});}
    }
  });
}
function promptRenameMenu(key){
  var current=menuNames[key]||key;
  var newName=prompt('Nou nom per a "'+current+'":',current);
  if(!newName||!newName.trim())return;
  menuNames[key]=newName.trim();
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
  const _tb=document.getElementById('theme-btn');if(_tb){_tb.querySelector?_tb.querySelector('span#theme-label')&&(_tb.querySelector('span#theme-label').textContent=isDark?'Mode clar':'Mode fosc'):null;_tb.childNodes[0].textContent=isDark?'☀️ ':'🌙 ';}
  localStorage.setItem('cg_theme',isDark?'light':'dark');
}
function initTheme(){
  const saved=localStorage.getItem('cg_theme')||'light';
  document.documentElement.setAttribute('data-theme',saved);
  const btn=document.getElementById('theme-btn');
  const _tbl=document.getElementById('theme-label');if(_tbl)_tbl.textContent=saved==='dark'?'Mode fosc':'Mode clar';
}

/* ══ ARRANQUE ══ */
/* ══ CREAR MISIONES/ARCOS ══ */
const DIFF_REWARDS={D:{xp:25,gold:10,frag:20},C:{xp:75,gold:25,frag:50},B:{xp:150,gold:50,frag:100},A:{xp:300,gold:100,frag:200},S:{xp:500,gold:200,frag:400}};
const DIFF_ATTRS={D:'Sabiduría',C:'Inteligencia',B:'Agilidad',A:'Fuerza',S:'Carisma'};
const DIFF_ATTR_PTS={D:1,C:2,B:3,A:5,S:10};
let selectedDiff='D';

function selectDiff(btn,diff){
  selectedDiff=diff;
  document.querySelectorAll('.diff-opt').forEach(function(b){
    var d=b.getAttribute('data-diff');
    b.className='diff-opt'+(d===diff?' sel-'+d:'');
  });
}

function toggleDailyFields(){
  var type=document.getElementById('nm-type').value;
  var diffWrap=document.getElementById('nm-diff-wrap');
  if(diffWrap)diffWrap.style.display=type==='daily'?'none':'block';
}

function populateArcSelect(){
  var sel=document.getElementById('nm-arc');
  if(!sel)return;
  sel.innerHTML='<option value="">Sin arco</option>'+arcs.map(function(a){
    return '<option value="'+a.name+'">'+a.name+'</option>';
  }).join('');
}

function createMission(){
  var name=document.getElementById('nm-name').value.trim();
  if(!name){toast('La misión necesita un nombre.');return;}
  var type=document.getElementById('nm-type').value;
  var isDaily=type==='daily';
  var arc=document.getElementById('nm-arc').value;
  var deadline=document.getElementById('nm-deadline').value;
  var newM={
    id:'m'+Date.now(),
    name:name,
    desc:document.getElementById('nm-desc')?document.getElementById('nm-desc').value.trim():'',
    arc:arc||'General',
    playerId:session.playerId,
    status:'pending',
    diff:isDaily?'D':'C',
    xp:isDaily?25:75,
    gold:isDaily?10:25,
    frag:isDaily?20:50,
    attr:isDaily?'Sabiduría':'Inteligencia',
    attrPts:isDaily?1:2,
    deadline:isDaily?'':deadline||'',
    daily:isDaily,
    isDaily_instance:false,
    plannerId:'',
    createdBy:session.playerId
  };
  // Check daily limit
  if(isDaily){
    var myDailies=missions.filter(function(m){return m.daily&&!m.id.includes('_');});
    if(myDailies.length>=4){toast('Máximo 4 misiones diarias globales.');return;}
  }
  missions.push(newM);
  if(isDaily)checkDailyMissions();
  if(CFG.MODE==='supabase')saveToSupabase();
  document.getElementById('nm-name').value='';
  document.getElementById('nm-deadline').value='';
  document.getElementById('panel-new-mission').removeAttribute('open');
  renderAll();
}

function createArc(){
  var name=document.getElementById('na-name').value.trim();
  if(!name){toast('El arco necesita un nombre.');return;}
  var newArc={
    id:'arc'+Date.now(),
    name:name,
    lore:document.getElementById('na-desc').value.trim()||'Un nuevo capítulo comienza.',
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
(async()=>{
  initTheme();
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
})();

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

/* ══ EXPONER FUNCIONES EN WINDOW (para onclick del HTML) ══ */
// Necesario al tener el JS en archivo externo: garantiza que los onclick="fn()" encuentren las funciones.
try{window.addAttrPt=addAttrPt;}catch(e){}try{window.applyMenuNames=applyMenuNames;}catch(e){}try{window.assignMission=assignMission;}catch(e){}try{window.buildAttrBars=buildAttrBars;}catch(e){}try{window.buildAvatarUrl=buildAvatarUrl;}catch(e){}try{window.buildCreatorCls=buildCreatorCls;}catch(e){}try{window.buildCreatorColors=buildCreatorColors;}catch(e){}try{window.buildCreatorEmblems=buildCreatorEmblems;}catch(e){}try{window.buildPentagon=buildPentagon;}catch(e){}try{window.buildStartItemsPreview=buildStartItemsPreview;}catch(e){}try{window.buyItem=buyItem;}catch(e){}try{window.cGoTo=cGoTo;}catch(e){}try{window.cNext=cNext;}catch(e){}try{window.calNav=calNav;}catch(e){}try{window.canBuyItem=canBuyItem;}catch(e){}try{window.checkDailyMissions=checkDailyMissions;}catch(e){}try{window.checkLevelUp=checkLevelUp;}catch(e){}try{window.classToRow=classToRow;}catch(e){}try{window.cleanOldCompleted=cleanOldCompleted;}catch(e){}try{window.clearPlannerImport=clearPlannerImport;}catch(e){}try{window.closeAdminEditModal=closeAdminEditModal;}catch(e){}try{window.closeAvatarEditor=closeAvatarEditor;}catch(e){}try{window.closeEdit=closeEdit;}catch(e){}try{window.closeEventModal=closeEventModal;}catch(e){}try{window.closeMissionModal=closeMissionModal;}catch(e){}try{window.closeReward=closeReward;}catch(e){}try{window.completeMission=completeMission;}catch(e){}try{window.computeClassBonus=computeClassBonus;}catch(e){}try{window.confirmLevelUp=confirmLevelUp;}catch(e){}try{window.confirmPlannerImport=confirmPlannerImport;}catch(e){}try{window.createArc=createArc;}catch(e){}try{window.createMission=createMission;}catch(e){}try{window.createTutorialForPlayer=createTutorialForPlayer;}catch(e){}try{window.createWelcomeArc=createWelcomeArc;}catch(e){}try{window.deleteArc=deleteArc;}catch(e){}try{window.deleteEvent=deleteEvent;}catch(e){}try{window.deleteMission=deleteMission;}catch(e){}try{window.deletePlayer=deletePlayer;}catch(e){}try{window.doAdminLogin=doAdminLogin;}catch(e){}try{window.doLogout=doLogout;}catch(e){}try{window.doPull=doPull;}catch(e){}try{window.enterApp=enterApp;}catch(e){}try{window.equipItem=equipItem;}catch(e){}try{window.eventItemHTML=eventItemHTML;}catch(e){}try{window.exportJSON=exportJSON;}catch(e){}try{window.formatDate=formatDate;}catch(e){}try{window.getAdminProfile=getAdminProfile;}catch(e){}try{window.getEffectiveAttrs=getEffectiveAttrs;}catch(e){}try{window.getFilteredEvents=getFilteredEvents;}catch(e){}try{window.getPlayerAvatar=getPlayerAvatar;}catch(e){}try{window.getRarityByChance=getRarityByChance;}catch(e){}try{window.goToMyProfile=goToMyProfile;}catch(e){}try{window.initCalFilterBtns=initCalFilterBtns;}catch(e){}try{window.initTheme=initTheme;}catch(e){}try{window.invEquipSlot=invEquipSlot;}catch(e){}try{window.loadMenuNames=loadMenuNames;}catch(e){}try{window.mCard=mCard;}catch(e){}try{window.meetsReqs=meetsReqs;}catch(e){}try{window.missionToRow=missionToRow;}catch(e){}try{window.openAdminEditCarta=openAdminEditCarta;}catch(e){}try{window.openAdminEditItem=openAdminEditItem;}catch(e){}try{window.openAvatarEditor=openAvatarEditor;}catch(e){}try{window.openEditModal=openEditModal;}catch(e){}try{window.openEventModal=openEventModal;}catch(e){}try{window.openMissionModal=openMissionModal;}catch(e){}try{window.openShowcaseSelector=openShowcaseSelector;}catch(e){}try{window.parsePlannerCSV=parsePlannerCSV;}catch(e){}try{window.parsePlannerExcel=parsePlannerExcel;}catch(e){}try{window.parsePlannerFile=parsePlannerFile;}catch(e){}try{window.plannerDragOver=plannerDragOver;}catch(e){}try{window.plannerDrop=plannerDrop;}catch(e){}try{window.plannerFileSelected=plannerFileSelected;}catch(e){}try{window.populateArcSelect=populateArcSelect;}catch(e){}try{window.promptRenameMenu=promptRenameMenu;}catch(e){}try{window.pullCard=pullCard;}catch(e){}try{window.pullResult=pullResult;}catch(e){}try{window.renderAdminCartasPage=renderAdminCartasPage;}catch(e){}try{window.renderAdminItemsPage=renderAdminItemsPage;}catch(e){}try{window.renderAll=renderAll;}catch(e){}try{window.renderArcs=renderArcs;}catch(e){}try{window.renderAvatar=renderAvatar;}catch(e){}try{window.renderAvatarEditor=renderAvatarEditor;}catch(e){}try{window.renderCalendar=renderCalendar;}catch(e){}try{window.renderClassesAdmin=renderClassesAdmin;}catch(e){}try{window.renderDayEvents=renderDayEvents;}catch(e){}try{window.renderGachaGold=renderGachaGold;}catch(e){}try{window.renderGalleryCards=renderGalleryCards;}catch(e){}try{window.renderGalleryTabs=renderGalleryTabs;}catch(e){}try{window.renderHeroProfile=renderHeroProfile;}catch(e){}try{window.renderHeroTabs=renderHeroTabs;}catch(e){}try{window.renderHeroTabsOLD=renderHeroTabsOLD;}catch(e){}try{window.renderInventario=renderInventario;}catch(e){}try{window.renderMStats=renderMStats;}catch(e){}try{window.renderMissions=renderMissions;}catch(e){}try{window.renderMyGallery=renderMyGallery;}catch(e){}try{window.renderPlannerImported=renderPlannerImported;}catch(e){}try{window.renderRanking=renderRanking;}catch(e){}try{window.renderShop=renderShop;}catch(e){}try{window.renderUpcoming=renderUpcoming;}catch(e){}try{window.rowToClass=rowToClass;}catch(e){}try{window.rowToMission=rowToMission;}catch(e){}try{window.saveAvatar=saveAvatar;}catch(e){}try{window.saveEdit=saveEdit;}catch(e){}try{window.saveEvent=saveEvent;}catch(e){}try{window.saveNewChar=saveNewChar;}catch(e){}try{window.selectCalDay=selectCalDay;}catch(e){}try{window.selectDiff=selectDiff;}catch(e){}try{window.selectGalleryHero=selectGalleryHero;}catch(e){}try{window.selectHero=selectHero;}catch(e){}try{window.setAvatarOpt=setAvatarOpt;}catch(e){}try{window.setCalFilter=setCalFilter;}catch(e){}try{window.showLevelUpPopup=showLevelUpPopup;}catch(e){}try{window.showPage=showPage;}catch(e){}try{window.showPage_planner=showPage_planner;}catch(e){}try{window.showPlannerPreview=showPlannerPreview;}catch(e){}try{window.showRewardPopup=showRewardPopup;}catch(e){}try{window.showScreen=showScreen;}catch(e){}try{window.switchAdminTab=switchAdminTab;}catch(e){}try{window.switchPTab=switchPTab;}catch(e){}try{window.toast=toast;}catch(e){}try{window.toggleDailyFields=toggleDailyFields;}catch(e){}try{window.toggleTheme=toggleTheme;}catch(e){}try{window.toggleUMenu=toggleUMenu;}catch(e){}try{window.unequipItem=unequipItem;}catch(e){}try{window.updateArcCounts=updateArcCounts;}catch(e){}try{window.updateSidebarAvatar=updateSidebarAvatar;}catch(e){}
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
