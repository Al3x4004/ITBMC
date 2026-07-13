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

/* ══ CONFIG ══ */
const CFG={
  MODE:'supabase',
  DATA_PATH:'Excel/data.json',
  GACHA_CARDS_PATH:'gacha/cards.json',
  GITHUB_RAW:'https://raw.githubusercontent.com/Al3x4004/ITBMC/main/',
  ADMIN_PW:'admin1234',
  SUPABASE_URL:'https://ksmxclenaeglnahinkvm.supabase.co',
  SUPABASE_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhjbGVuYWVnbG5haGlua3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjY0MzQsImV4cCI6MjA5ODMwMjQzNH0.pBaUUXSDGjXPLbAjIOAdtM0nvAgfxul7BUzfcQaWqNc',
};

/* ══ DATOS ESTÁTICOS ══ */
const CLASSES=[
  {name:'Mago',       icon:'🔮',role:'Dev / Técnico',       bonus:'+5 INT · +3 AGI',attrs:{fue:1,int:5,agi:3,car:1,sab:2}},
  {name:'Paladín',    icon:'🛡️',role:'Gestión / Liderazgo', bonus:'+5 CAR · +4 SAB',attrs:{fue:2,int:1,agi:1,car:5,sab:4}},
  {name:'Exploradora',icon:'🏹',role:'Data / Análisis',      bonus:'+5 AGI · +4 INT',attrs:{fue:1,int:4,agi:5,car:1,sab:2}},
  {name:'Guerrero',   icon:'⚔️',role:'Ops / Ejecución',     bonus:'+6 FUE · +3 AGI',attrs:{fue:6,int:1,agi:3,car:1,sab:1}},
  {name:'Pícaro',     icon:'🗡️',role:'Diseño / Creatividad',bonus:'+5 AGI · +3 CAR',attrs:{fue:1,int:3,agi:5,car:3,sab:1}},
  {name:'Bardo',      icon:'📯',role:'Marketing / Comms',   bonus:'+6 CAR · +3 SAB',attrs:{fue:1,int:2,agi:1,car:6,sab:3}},
];
const EQUIP={
  'Mago':       {w:['Báculo arcano','Tomo de hechizos','Varita de poder'],        a:['Túnica de seda','Capa del arcano','Velos del vacío'],          c:['Anillo de enfoque','Amuleto de mana','Cristal oráculo']},
  'Paladín':    {w:['Espada sagrada','Martillo de la justicia','Lanza del alba'],  a:['Armadura completa','Escudo reluciente','Cota de malla'],         c:['Símbolo sagrado','Capa de liderazgo','Corona de estratega']},
  'Exploradora':{w:['Arco largo','Dagas gemelas','Ballesta de precisión'],         a:['Cuero ligero','Capucha de rastreador','Manto del bosque'],        c:['Brújula mágica','Lente de análisis','Mapa estelar']},
  'Guerrero':   {w:['Hacha de guerra','Espada bastarda','Mandoble del norte'],     a:['Armadura de placas','Coraza de hierro','Malla de batalla'],       c:['Brazales de fuerza','Cinturón de campeón','Casco de berserker']},
  'Pícaro':     {w:['Daga envenenada','Garfio de sombras','Estiletes gemelos'],    a:['Traje de sombras','Capa de invisibilidad','Cuero tachonado'],     c:['Gema de ilusión','Máscara de engaño','Guantes de artesano']},
  'Bardo':      {w:['Laúd de guerra','Trompeta del trueno','Pluma encantada'],     a:['Ropas de gala','Capa del viajero','Vestido de corte'],            c:['Insignia de elocuencia','Anillo de persuasión','Sello de alianzas']},
};
const COLORS=[
  {hex:'#7f77dd',bg:'rgba(127,119,221,0.15)'},{hex:'#1d9e75',bg:'rgba(29,158,117,0.15)'},
  {hex:'#d85a30',bg:'rgba(216,90,48,0.15)'}, {hex:'#378add',bg:'rgba(55,138,221,0.15)'},
  {hex:'#d4537e',bg:'rgba(212,83,126,0.15)'},{hex:'#e4a428',bg:'rgba(228,164,40,0.15)'},
  {hex:'#888780',bg:'rgba(136,135,128,0.15)'},{hex:'#639922',bg:'rgba(99,153,34,0.15)'},
];
const EMBLEMS=['⚔️','🗡️','🏹','🛡️','🔮','📯','🔥','❄️','⚡','🌙','☀️','🐉','🦅','🌿','💎','👁️'];
const AC={fue:'#d85a30',int:'#7f77dd',agi:'#1d9e75',car:'#378add',sab:'#e4a428'};
const AN={fue:'Força',int:'Intel·ligència',agi:'Agilitat',car:'Carisma',sab:'Saviesa'};
const RARITY_ORDER=['legendaria','epica','rara','comun'];
const RARITY_PROB={comun:60,rara:25,epica:12,legendaria:3};
const RARITY_LABEL={comun:'Comú',rara:'Rara',epica:'Èpica',legendaria:'Llegendària'};

const DEMO={
  players:[
    {id:'pj001',realName:'',name:'Aldric el Arcano',   cls:'Mago',       role:'Dev / Técnico',       emblem:'🔮',color:'#7f77dd',colorBg:'rgba(127,119,221,0.15)',level:3,xp:2400,xpNext:100,gold:580,missions:8,weapon:'Báculo arcano',  armor:'Túnica de seda',   accessory:'Cristal oráculo',   lore:'Estudioso de los lenguajes arcanos del código.',quote:'El código no falla, fallan los que no lo prueban.',pin:'',attrs:{fue:1,int:18,agi:10,car:4,sab:8},gachaTokens:0,gallery:[],lastDaily:''},
    {id:'pj002',realName:'',name:'Brynn Escudohierro', cls:'Paladín',    role:'Gestión / Liderazgo', emblem:'🛡️',color:'#378add',colorBg:'rgba(55,138,221,0.15)', level:2,xp:1200,xpNext:100,gold:310,missions:5,weapon:'Espada sagrada',armor:'Armadura completa',accessory:'Corona de estratega',lore:'Líder nato que guía al grupo con honor.',       quote:'Un equipo sin dirección es un ejército sin mapa.',pin:'',attrs:{fue:8,int:5,agi:4,car:16,sab:14},gachaTokens:0,gallery:[],lastDaily:''},
    {id:'pj003',realName:'',name:'Seraphine Ojoagudo', cls:'Exploradora',role:'Data / Análisis',     emblem:'🏹',color:'#1d9e75',colorBg:'rgba(29,158,117,0.15)', level:2,xp:1050,xpNext:100,gold:270,missions:4,weapon:'Arco largo',    armor:'Cuero ligero',     accessory:'Lente de análisis', lore:'Rastreadora de datos perdidos en el caos.',     quote:'Los datos no mienten. Las personas sí.',         pin:'',attrs:{fue:3,int:14,agi:16,car:6,sab:10},gachaTokens:0,gallery:[],lastDaily:''},
  ],
  missions:[
    {id:'tut1_demo',name:'Explora tu ficha de héroe',arc:'Tutorial: Primeros Pasos',playerId:'pj001',status:'pending',diff:'D',xp:25,gold:10,attr:'Sabiduría',attrPts:1,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
    {id:'tut2_demo',name:'Visita la Tienda y observa los items',arc:'Tutorial: Primeros Pasos',playerId:'pj001',status:'pending',diff:'C',xp:75,gold:25,attr:'Inteligencia',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
    {id:'tut3_demo',name:'Haz tu primera invocación en el Gacha',arc:'Tutorial: Primeros Pasos',playerId:'pj001',status:'pending',diff:'C',xp:75,gold:25,attr:'Agilidad',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
    {id:'tut4_demo',name:'Crea tu primera misión propia',arc:'Tutorial: Primeros Pasos',playerId:'pj001',status:'pending',diff:'C',xp:75,gold:25,attr:'Carisma',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
    {id:'tut5_demo',name:'Añade un evento al Calendario',arc:'Tutorial: Primeros Pasos',playerId:'pj001',status:'pending',diff:'C',xp:75,gold:25,attr:'Sabiduría',attrPts:2,deadline:'',daily:false,isDaily_instance:false,plannerId:'',createdBy:'system'},
  ],
  arcs:[
    {id:'arc_tutorial_demo',name:'Tutorial: Primeros Pasos',lore:'Bienvenido al Cuartel General. Este arco te guiará por las funciones principales: crea misiones, explora la tienda, invoca en el gacha y añade eventos al calendario. ¡Completa las 5 misiones para recibir un bonus de XP y oro!',status:'active',total:5,done:0,createdBy:'system'},
  ],
  cal_events:[
    {id:'ev001',title:'Reunión de sprint',date:'2026-06-26',time:'10:00',desc:'Review del sprint actual.',type:'team',missionId:'',ownerId:'team'},
    {id:'ev002',title:'Deploy producción',date:'2026-06-30',time:'15:00',desc:'Despliegue del arco completo.',type:'team',missionId:'m001',ownerId:'team'},
    {id:'ev003',title:'1on1 con manager',date:'2026-06-28',time:'11:00',desc:'Sesión individual.',type:'personal',missionId:'',ownerId:'pj001'},
  ],
  shop_items:[
    // ── ARMAS ──
    {id:'i001',name:'Daga de Hierro',      icon:'🗡️',desc:'Una daga básica pero efectiva.',                    slot:'arma',     cost:80,  minLevel:1, minAttrs:{fue:0,int:0,agi:2,car:0,sab:0},bonus:{fue:0,int:0,agi:2,car:0,sab:0}},
    {id:'i002',name:'Espada Corta',         icon:'⚔️',desc:'Equilibrada y fácil de manejar.',                  slot:'arma',     cost:150, minLevel:2, minAttrs:{fue:3,int:0,agi:0,car:0,sab:0},bonus:{fue:2,int:0,agi:1,car:0,sab:0}},
    {id:'i003',name:'Báculo Arcano',        icon:'🔮',desc:'Amplifica los hechizos del portador.',             slot:'arma',     cost:200, minLevel:2, minAttrs:{fue:0,int:5,agi:0,car:0,sab:0},bonus:{fue:0,int:4,agi:0,car:0,sab:1}},
    {id:'i004',name:'Arco Élfico',          icon:'🏹',desc:'Tallado en madera de roble milenario.',            slot:'arma',     cost:220, minLevel:3, minAttrs:{fue:0,int:0,agi:6,car:0,sab:0},bonus:{fue:0,int:1,agi:4,car:0,sab:0}},
    {id:'i005',name:'Hacha de Guerra',      icon:'🪓',desc:'Pura fuerza bruta en cada golpe.',                 slot:'arma',     cost:280, minLevel:3, minAttrs:{fue:7,int:0,agi:0,car:0,sab:0},bonus:{fue:5,int:0,agi:0,car:0,sab:0}},
    {id:'i006',name:'Espada del Abismo',    icon:'⚡',desc:'Forjada en las sombras más profundas.',            slot:'arma',     cost:450, minLevel:5, minAttrs:{fue:10,int:0,agi:0,car:0,sab:0},bonus:{fue:7,int:0,agi:2,car:0,sab:0}},
    {id:'i007',name:'Varita de Caos',       icon:'✨',desc:'Inestable pero devastadoramente poderosa.',        slot:'arma',     cost:500, minLevel:5, minAttrs:{fue:0,int:12,agi:0,car:0,sab:0},bonus:{fue:0,int:8,agi:0,car:0,sab:2}},
    // ── ARMADURAS ──
    {id:'i008',name:'Túnica de Tela',       icon:'👘',desc:'Ligera, cómoda y fácil de llevar.',                slot:'armadura', cost:60,  minLevel:1, minAttrs:{fue:0,int:0,agi:0,car:0,sab:0},bonus:{fue:0,int:1,agi:1,car:0,sab:0}},
    {id:'i009',name:'Cuero Reforzado',      icon:'🥋',desc:'Protección ligera para el ágil explorador.',      slot:'armadura', cost:130, minLevel:2, minAttrs:{fue:0,int:0,agi:4,car:0,sab:0},bonus:{fue:1,int:0,agi:2,car:0,sab:0}},
    {id:'i010',name:'Capa del Arcano',      icon:'🧥',desc:'Tejida con hilos de maná puro.',                  slot:'armadura', cost:180, minLevel:2, minAttrs:{fue:0,int:4,agi:0,car:0,sab:0},bonus:{fue:0,int:2,agi:1,car:0,sab:1}},
    {id:'i011',name:'Cota de Malla',        icon:'🛡️',desc:'Protección estándar para el guerrero.',           slot:'armadura', cost:240, minLevel:3, minAttrs:{fue:5,int:0,agi:0,car:0,sab:0},bonus:{fue:2,int:0,agi:0,car:1,sab:0}},
    {id:'i012',name:'Armadura de Placas',   icon:'⚙️',desc:'Máxima protección, mínima movilidad.',            slot:'armadura', cost:380, minLevel:5, minAttrs:{fue:9,int:0,agi:0,car:0,sab:0},bonus:{fue:4,int:0,agi:0,car:0,sab:1}},
    {id:'i013',name:'Manto de Sombras',     icon:'🌑',desc:'Te hace casi invisible en la oscuridad.',          slot:'armadura', cost:350, minLevel:4, minAttrs:{fue:0,int:0,agi:8,car:0,sab:0},bonus:{fue:0,int:0,agi:5,car:0,sab:0}},
    // ── ACCESORIOS ──
    {id:'i014',name:'Amuleto de Maná',      icon:'💎',desc:'Aumenta el flujo de energía mágica.',             slot:'accesorio',cost:100, minLevel:1, minAttrs:{fue:0,int:3,agi:0,car:0,sab:0},bonus:{fue:0,int:2,agi:0,car:0,sab:1}},
    {id:'i015',name:'Anillo Veloz',         icon:'💍',desc:'Acelera los reflejos del portador.',               slot:'accesorio',cost:120, minLevel:1, minAttrs:{fue:0,int:0,agi:3,car:0,sab:0},bonus:{fue:0,int:0,agi:3,car:0,sab:0}},
    {id:'i016',name:'Colgante del Orador',  icon:'📿',desc:'Mejora la persuasión y presencia social.',        slot:'accesorio',cost:160, minLevel:2, minAttrs:{fue:0,int:0,agi:0,car:4,sab:0},bonus:{fue:0,int:0,agi:0,car:3,sab:1}},
    {id:'i017',name:'Brazales de Fuerza',   icon:'💪',desc:'Refuerzan los músculos del portador.',             slot:'accesorio',cost:200, minLevel:2, minAttrs:{fue:5,int:0,agi:0,car:0,sab:0},bonus:{fue:4,int:0,agi:0,car:0,sab:0}},
    {id:'i018',name:'Lente del Analista',   icon:'🔍',desc:'Revela patrones ocultos en los datos.',            slot:'accesorio',cost:250, minLevel:3, minAttrs:{fue:0,int:6,agi:0,car:0,sab:3},bonus:{fue:0,int:3,agi:0,car:0,sab:3}},
    {id:'i019',name:'Botas de Viento',      icon:'👟',desc:'Tan rápidas como el viento del norte.',            slot:'accesorio',cost:280, minLevel:3, minAttrs:{fue:0,int:0,agi:7,car:0,sab:0},bonus:{fue:0,int:0,agi:5,car:0,sab:0}},
    {id:'i020',name:'Sello del Líder',      icon:'🏅',desc:'Símbolo de autoridad reconocido en todo el reino.',slot:'accesorio',cost:400, minLevel:5, minAttrs:{fue:0,int:0,agi:0,car:10,sab:5},bonus:{fue:0,int:0,agi:0,car:6,sab:3}},
    // ── ESPECIALES ──
    {id:'i021',name:'Tomo del Novato',      icon:'📓',desc:'Primeros pasos en el camino del conocimiento.',   slot:'especial', cost:90,  minLevel:1, minAttrs:{fue:0,int:0,agi:0,car:0,sab:0},bonus:{fue:0,int:1,agi:0,car:0,sab:2}},
    {id:'i022',name:'Insignia de Escudero', icon:'🎖️',desc:'Reconocimiento por completar el primer arco.',    slot:'especial', cost:150, minLevel:2, minAttrs:{fue:2,int:2,agi:2,car:2,sab:2},bonus:{fue:1,int:1,agi:1,car:1,sab:1}},
    {id:'i023',name:'Cristal Arcano',       icon:'🔮',desc:'Fragmento de poder puro de las eras antiguas.',   slot:'especial', cost:300, minLevel:3, minAttrs:{fue:0,int:8,agi:0,car:0,sab:4},bonus:{fue:0,int:4,agi:0,car:0,sab:4}},
    {id:'i024',name:'Corona del Orador',    icon:'👑',desc:'Solo los más carismáticos pueden portarla.',      slot:'especial', cost:420, minLevel:4, minAttrs:{fue:0,int:0,agi:0,car:10,sab:0},bonus:{fue:0,int:0,agi:0,car:6,sab:2}},
    {id:'i025',name:'Máscara del Pícaro',   icon:'🎭',desc:'Oculta la identidad y aguza los sentidos.',       slot:'especial', cost:350, minLevel:4, minAttrs:{fue:0,int:3,agi:8,car:3,sab:0},bonus:{fue:0,int:2,agi:5,car:2,sab:0}},
    {id:'i026',name:'Grimorio Ancestral',   icon:'📜',desc:'Contiene hechizos olvidados por siglos.',         slot:'especial', cost:480, minLevel:5, minAttrs:{fue:0,int:12,agi:0,car:0,sab:8},bonus:{fue:0,int:6,agi:0,car:0,sab:6}},
    {id:'i027',name:'Capa del Campeón',     icon:'🦸',desc:'Otorgada solo a los héroes del reino.',           slot:'especial', cost:550, minLevel:6, minAttrs:{fue:8,int:5,agi:5,car:5,sab:5},bonus:{fue:3,int:2,agi:2,car:2,sab:2}},
    {id:'i028',name:'Orbe de Sabiduría',    icon:'🌐',desc:'Concentra el conocimiento universal.',            slot:'especial', cost:500, minLevel:5, minAttrs:{fue:0,int:10,agi:0,car:0,sab:10},bonus:{fue:0,int:5,agi:0,car:0,sab:7}},
    {id:'i029',name:'Talismán de Batalla',  icon:'⚔️',desc:'Bendecido por los dioses de la guerra.',          slot:'especial', cost:460, minLevel:5, minAttrs:{fue:12,int:0,agi:5,car:0,sab:0},bonus:{fue:6,int:0,agi:3,car:0,sab:0}},
    {id:'i030',name:'Corona del DM',        icon:'🌟',desc:'El poder absoluto. Solo para el elegido.',        slot:'especial', cost:999, minLevel:10,minAttrs:{fue:15,int:15,agi:15,car:15,sab:15},bonus:{fue:10,int:10,agi:10,car:10,sab:10}},
  ],
  gacha_cards:[
    {id:'c001',name:'Escudo del Alba',    rarity:'comun',    imageUrl:'https://picsum.photos/seed/c001/200/280',description:'Un viejo escudo que aún brilla.'},
    {id:'c002',name:'Daga Susurrante',    rarity:'comun',    imageUrl:'https://picsum.photos/seed/c002/200/280',description:'Silenciosa como la noche.'},
    {id:'c003',name:'Manto del Viajero',  rarity:'comun',    imageUrl:'https://picsum.photos/seed/c003/200/280',description:'Ha recorrido mil reinos.'},
    {id:'c004',name:'Amuleto de Piedra',  rarity:'comun',    imageUrl:'https://picsum.photos/seed/c004/200/280',description:'Trae suerte al portador.'},
    {id:'c005',name:'Espada Rúnica',      rarity:'rara',     imageUrl:'https://picsum.photos/seed/c005/200/280',description:'Inscrita con hechizos olvidados.'},
    {id:'c006',name:'Orbe de Tormenta',   rarity:'rara',     imageUrl:'https://picsum.photos/seed/c006/200/280',description:'Contiene una tormenta en su interior.'},
    {id:'c007',name:'Capa del Arcano',    rarity:'rara',     imageUrl:'https://picsum.photos/seed/c007/200/280',description:'Tejida con hilos de maná puro.'},
    {id:'c008',name:'Yelmo del Guardián', rarity:'rara',     imageUrl:'https://picsum.photos/seed/c008/200/280',description:'Protege la mente del portador.'},
    {id:'c009',name:'Armadura del Dragón',rarity:'epica',    imageUrl:'https://picsum.photos/seed/c009/200/280',description:'Forjada con escamas de dragón anciano.'},
    {id:'c010',name:'Báculo del Caos',    rarity:'epica',    imageUrl:'https://picsum.photos/seed/c010/200/280',description:'Canaliza energías inestables.'},
    {id:'c011',name:'Sello del Titán',    rarity:'epica',    imageUrl:'https://picsum.photos/seed/c011/200/280',description:'Solo los titanes pueden portarlo.'},
    {id:'c012',name:'Corona del DM',      rarity:'legendaria',imageUrl:'https://picsum.photos/seed/c012/200/280',description:'El poder absoluto en una corona.'},
    {id:'c013',name:'Espada Dragontooth', rarity:'legendaria',imageUrl:'https://picsum.photos/seed/c013/200/280',description:'Tallada en el colmillo de un dragón.'},
    {id:'c014',name:'Arco Estelar',       rarity:'legendaria',imageUrl:'https://picsum.photos/seed/c014/200/280',description:'Dispara flechas de luz pura.'},
  ]
};

/* ══ ESTADO ══ */
let session={loggedIn:false,isAdmin:false,playerId:null};
let players=[],missions=[],arcs=[],gachaCards=[],shopItems=[],calEvents=[];
let luState={pid:null,pts:0,spent:{}};
let curHero=0,editPid=null;
let cpState={cls:null,color:COLORS[0],emblem:'⚔️',weapon:null,armor:null,accessory:null};
let galleryHeroIdx=0;

/* ══ CARGA ══ */
/* ══ JSONBIN ══ */
const JB_URL=`https://api.jsonbin.io/v3/b/${CFG.JSONBIN_ID}`;
const JB_HDR={'Content-Type':'application/json','X-Master-Key':CFG.JSONBIN_KEY,'X-Bin-Versioning':'false'};

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
    xp:m.xp||0,gold:m.gold||0,attr:m.attr||'',attr_pts:m.attrPts||0,
    deadline:m.deadline||'',daily:!!m.daily,is_daily_instance:!!m.isDaily_instance,
    template_id:m.templateId||'',planner_id:m.plannerId||'',
    from_planner:!!m.fromPlanner,created_by:m.createdBy||''
  };
}
function rowToMission(r){
  return {
    id:r.id,name:r.nombre,desc:r.descripcion||'',arc:r.arco||'General',
    playerId:r.player_id||'',status:r.status||'pending',diff:r.diff||'C',
    xp:r.xp||0,gold:r.gold||0,attr:r.attr||'',attrPts:r.attr_pts||0,
    deadline:r.deadline||'',daily:!!r.daily,isDaily_instance:!!r.is_daily_instance,
    templateId:r.template_id||'',plannerId:r.planner_id||'',
    fromPlanner:!!r.from_planner,createdBy:r.created_by||''
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

async function saveToSupabase(){
  try{
    // Save main game data
    await fetch(`${CFG.SUPABASE_URL}/rest/v1/game_data`,{
      method:'POST',
      headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify({id:'main',data:{players,arcs,gacha_cards:gachaCards,cal_events:calEvents}})
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

  if(CFG.MODE==='supabase'){
    const d=await loadFromSupabase();
    if(d&&d.players){
      players =d.players;
      try{
        const _eq=await fetch(CFG.SUPABASE_URL+'/rest/v1/equipamiento?activo=eq.true&order=tipo',{
          headers:{'apikey':CFG.SUPABASE_KEY,'Authorization':'Bearer '+CFG.SUPABASE_KEY}
        });
        const _eqd=await _eq.json();
        shopItems=Array.isArray(_eqd)&&_eqd.length?_eqd.map(r=>({id:r.id,name:r.nombre,icon:r.icono||'📦',imageUrl:r.imagen_url||null,desc:r.descripcion||'',slot:r.tipo,rareza:r.rareza||'comun',cost:r.coste_oro,minLevel:r.nivel_minimo,via:r.via_obtencion||'tienda',minAttrs:r.req_attrs||{fue:0,int:0,agi:0,car:0,sab:0},bonus:r.bonus_attrs||{fue:0,int:0,agi:0,car:0,sab:0}})):[];
      }catch{shopItems=[];}
      if(d.cal_events)calEvents=d.cal_events;
      else calEvents=[];
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
        shopItems=Array.isArray(_eqd)&&_eqd.length?_eqd.map(r=>({id:r.id,name:r.nombre,icon:r.icono||'📦',imageUrl:r.imagen_url||null,desc:r.descripcion||'',slot:r.tipo,rareza:r.rareza||'comun',cost:r.coste_oro,minLevel:r.nivel_minimo,via:r.via_obtencion||'tienda',minAttrs:r.req_attrs||{fue:0,int:0,agi:0,car:0,sab:0},bonus:r.bonus_attrs||{fue:0,int:0,agi:0,car:0,sab:0}})):[];
      }catch{shopItems=[];}
      calEvents=[];
      await saveToSupabase();
    }
  }else{
    try{
      const r=await fetch(CFG.DATA_PATH);
      if(!r.ok)throw new Error();
      const d=await r.json();
      players =d.players  ||[];
      missions=d.missions ||[];
      arcs    =d.arcs     ||[];
    }catch{
      players =[];
      missions=[];
      arcs    =[];
    }
  }
  players.forEach(p=>{
    if(!p.gachaTokens)p.gachaTokens=0;
    if(!p.gallery)p.gallery=[];
    if(!p.lastDaily)p.lastDaily='';
    if(!p.inventory)p.inventory=[];
    if(!p.equipped)p.equipped={arma:null,armadura:null,accesorio:null,casco:null,botas:null};
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
  if(CFG.MODE==='supabase'){
    saveToSupabase();
    (function(){var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';})();
    
    return;
  }
  const blob=new Blob([JSON.stringify({players,missions,arcs,gacha_cards:gachaCards,cal_events:calEvents},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='data.json';a.click();
  URL.revokeObjectURL(url);
  (function(){var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';})();
  
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
  const p=players.find(p=>p.id===session.playerId);
  if(p){const _idx=players.findIndex(function(pl){return pl.id===session.playerId;});if(_idx>=0)curHero=_idx;}
  document.getElementById('ulabel').textContent=session.isAdmin?'Dios 👑':(p?p.name.split(' ')[0]:'—');
  (function(){var _x=document.getElementById('umname');if(_x)_x.textContent=session.isAdmin?'👑 Dios':(p?p.name:'—');})();
  if(CFG.MODE==='local'){
    document.getElementById('mode-ban-wrap').innerHTML=`
      <div class="mode-ban">
        <span>⚗️ Modo pruebas local — exporta el JSON para guardar cambios</span>
        <button class="btn btn-sm btn-g" onclick="exportJSON()">⬇️ Exportar data.json</button>
      </div>`;
  }
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
      cpState.cls=c;cpState.weapon=EQUIP[c.name].w[0];cpState.armor=EQUIP[c.name].a[0];cpState.accessory=EQUIP[c.name].c[0];
      buildAttrBars('cp-abars',c.attrs);document.getElementById('cp-cstats').style.display='block';buildEquipOpts();
    };
    g.appendChild(d);
  });
}
function buildAttrBars(cid,attrs){
  document.getElementById(cid).innerHTML=Object.entries(attrs).map(([k,v])=>
    `<div class="srow"><span class="slbl">${AN[k]}</span><div class="strk"><div class="sfill" style="width:${Math.round(v/6*100)}%;background:${AC[k]};"></div></div><span class="snum">${v}</span></div>`
  ).join('');
}
function buildCreatorColors(cid){
  const c=document.getElementById(cid);c.innerHTML='';
  COLORS.forEach((col,i)=>{const d=document.createElement('div');d.className='cdot'+(i===0?' selected':'');d.style.background=col.hex;d.onclick=()=>{c.querySelectorAll('.cdot').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');cpState.color=col;};c.appendChild(d);});
}
function buildCreatorEmblems(cid){
  const c=document.getElementById(cid);c.innerHTML='';
  EMBLEMS.forEach(e=>{const d=document.createElement('div');d.style.cssText=`width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;border:1px solid ${e===cpState.emblem?'var(--accent)':'var(--border)'};background:${e===cpState.emblem?'var(--bg3)':'transparent'};transition:all .15s;`;d.textContent=e;d.onclick=()=>{cpState.emblem=e;buildCreatorEmblems(cid);};c.appendChild(d);});
}
function buildEquipOpts(){
  const eq=cpState.cls?EQUIP[cpState.cls.name]:null;if(!eq)return;
  const c=document.getElementById('cp-equip');c.innerHTML='';
  [['Arma','w','weapon'],['Armadura','a','armor'],['Accesorio','c','accessory']].forEach(([lbl,key,sk])=>{
    let h=`<div><div class="stitle">${lbl}</div>`;
    eq[key].forEach(item=>{const sel=cpState[sk]===item;h+=`<div onclick="cpState['${sk}']='${item}';buildEquipOpts();" style="padding:6px 10px;font-size:12px;border:1px solid ${sel?'var(--accent)':'var(--border)'};border-radius:var(--rsm);cursor:pointer;background:${sel?'rgba(127,119,221,.1)':'transparent'};color:${sel?'var(--accent)':'var(--muted)'};margin-bottom:4px;transition:all .15s;">${item}</div>`;});
    h+='</div>';c.innerHTML+=h;
  });
}
function cGoTo(step){
  document.querySelectorAll('.wp').forEach((p,i)=>p.classList.toggle('active',i===step));
  document.querySelectorAll('.stepi').forEach((s,i)=>{s.classList.toggle('active',i===step);s.classList.toggle('done',i<step);});
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
  const np={id:'pj'+Date.now(),realName:rn,name:pn,cls:cpState.cls.name,role:cpState.cls.role,emblem:cpState.emblem,color:cpState.color.hex,colorBg:cpState.color.bg,level:1,xp:0,xpNext:100,gold:0,missions:0,weapon:cpState.weapon,armor:cpState.armor,accessory:cpState.accessory,lore:lore||'Historia por escribir...',quote:quote||'...',pin,attrs:{...cpState.cls.attrs},gachaTokens:0,gallery:[],lastDaily:''};
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
    <div class="csm"><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">Oro del equipo</div><div style="font-size:22px;font-weight:700;">${tg.toLocaleString()}</div></div>`;
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
      <span class="rchip"><span>${m.gold}</span> oro</span>
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
    p.xp+=m.xp;p.gold+=m.gold;p.missions++;
    if(m.attrPts&&m.attr){const k=Object.keys(AN).find(k=>AN[k]===m.attr);if(k)p.attrs[k]=(p.attrs[k]||0)+m.attrPts;}
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
  const emojis={fue:'💪',int:'🧠',agi:'⚡',car:'✨',sab:'📖'};
  document.getElementById('lu-attrs').innerHTML=Object.entries(AN).map(([k,name])=>
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--bg3);border-radius:var(--radius);padding:8px 4px;">'    +'<div style="font-size:16px;">'+emojis[k]+'</div>'    +'<div style="font-size:9px;color:var(--muted);">'+name+'</div>'    +'<div style="font-size:14px;font-weight:600;" id="lu-'+k+'">'+p.attrs[k]+'</div>'    +'<button class="btn btn-sm btn-p" style="padding:1px 10px;width:100%;" onclick="addAttrPt(\''+k+'\',1)">+</button>'    +'<button class="btn btn-sm" style="padding:1px 10px;width:100%;" onclick="addAttrPt(\''+k+'\',-1)">−</button>'    +'</div>').join('');
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
  document.getElementById('rp-chips').innerHTML=`
    <span class="badge b-purple">+${m.xp} XP</span>
    <span class="badge b-gold">+${m.gold} oro</span>
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
  (function(){var _x=document.getElementById('umenu-inline');if(_x)_x.style.display='none';})();
  const idx=players.findIndex(p=>p.id===session.playerId);
  if(idx>=0){curHero=idx;showPage('heroes',document.querySelector('.nb:nth-child(2)'));renderHeroProfile(idx);}
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
    gachaTokens:Infinity,gallery:allCards,lastDaily:''
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
      </div>
      <div class="ptab-panel active" id="pinfo">
        <div class="phead">
          <div class="av av-lg" style="background:${p.colorBg};border-color:${p.color};">${p.emblem}</div>
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
        <div class="g3" style="margin-bottom:1.25rem;">
          <div class="smini"><div class="v">${p.xp.toLocaleString()}</div><div class="l">XP total</div></div>
          <div class="smini"><div class="v">${p.gold}</div><div class="l">Oro</div></div>
          <div class="smini"><div class="v">${p.missions}</div><div class="l">Missions</div></div>
        </div>
        <div class="pbody">
          <div>
            <div class="stitle">Atributos</div>
            ${(function(){var eff=getEffectiveAttrs(p);return Object.entries(p.attrs).map(function(e){var k=e[0],v=e[1],ev=eff[k]||v,bonus=ev-v;return '<div class="srow"><span class="slbl">'+AN[k]+'</span><div class="strk"><div class="sfill" style="width:'+Math.round(ev/20*100)+'%;background:'+AC[k]+';"></div></div><span class="snum">'+v+(bonus>0?' <span style=\'color:var(--gold);font-size:10px;\'>+'+bonus+'</span>':'')+'</span></div>';}).join('');})()}
            <div class="pentagon-wrap" style="margin-top:1rem;">${buildPentagon(getEffectiveAttrs(p),p.color)}</div>
            <div class="stitle" style="margin-top:1rem;">Equipamiento</div>
            <div class="erow"><span class="epill">⚔️ ${p.weapon}</span><span class="epill">🛡️ ${p.armor}</span><span class="epill">💎 ${p.accessory}</span></div>
            ${(function(){var eq=Object.values(p.equipped||{}).filter(Boolean);if(!eq.length)return '';var items=eq.map(function(id){return shopItems.find(function(i){return i.id===id;});}).filter(Boolean);return '<div class="stitle" style="margin-top:.75rem;">Items equipados</div><div class="erow">'+items.map(function(i){return '<span class="epill" style="border-color:var(--gold);color:var(--gold);">'+i.icon+' '+i.name+'</span>';}).join('')+'</div>';})()}
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
      <span style="font-size:13px;color:var(--gold);width:70px;text-align:right;">${p.gold} oro</span>
    </div>`;
  }).join('');
}

/* ══ GACHA ══ */
function renderGachaGold(){
  const p=players.find(p=>p.id===session.playerId);
  document.getElementById('gacha-gold-display').textContent=session.isAdmin?'∞ oro':p?`${p.gold} oro`:'— oro';
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
  const gachaItems=shopItems.filter(i=>i.via==='gacha'||i.via==='ambas');
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
  const cost=times===1?100:900;
  if(!session.isAdmin){
    if(!p||p.gold<cost){toast(`Necesitas ${cost} oro para invocar.`);return;}
    p.gold-=cost;
  }
  const results=Array.from({length:times},()=>pullResult()).filter(r=>r!==null);
if(!results.length){toast('No hay cartas disponibles. Revisa el cards.json en GitHub.');return;}
  if(!p.gallery)p.gallery=[];
  if(!p.inventory)p.inventory=[];
  results.forEach(r=>{
    if(r.type==='card')p.gallery.push(r.data.id);
    else if(r.type==='item'&&!p.inventory.includes(r.data.id))p.inventory.push(r.data.id);
  });
  const reveal=document.getElementById('card-reveal');
  reveal.innerHTML='';reveal.classList.add('show');
  results.forEach((r,i)=>{
    const div=document.createElement('div');div.className='gacha-card pull-anim';
    div.style.animationDelay=`${i*0.08}s`;
    if(r.type==='card'){
      const imgUrl=r.data.imageUrl||(r.data.image?CFG.GITHUB_RAW+r.data.image:'');
      div.innerHTML=`<img src="${imgUrl}" alt="${r.data.name}" onerror="this.style.background='var(--bg3)';this.style.minHeight='160px';">
        <div class="gacha-card-info"><div class="gacha-card-name">${r.data.name}</div><div class="gacha-card-rarity rarity-${r.data.rarity}">${RARITY_LABEL[r.data.rarity]}</div></div>`;
    }else{
      div.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;min-height:160px;font-size:48px;background:var(--gold-bg);">${r.data.icon}</div>
        <div class="gacha-card-info"><div class="gacha-card-name">${r.data.name}</div><div class="gacha-card-rarity" style="color:var(--gold);">✨ Item obtenido</div></div>`;
    }
    reveal.appendChild(div);
  });
  if(CFG.MODE==='supabase')saveToSupabase();
  renderGachaGold();renderMyGallery();renderGalleryTabs();renderAll();
  const nCards=results.filter(r=>r.type==='card').length;
  const nItems=results.filter(r=>r.type==='item').length;
  let msg=nCards>0?`${nCards} carta${nCards>1?'s':''}`:''+(nItems>0?(nCards>0?' + ':'')+`${nItems} item${nItems>1?'s':''}`:'');
  
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
    document.getElementById('e-gold').value=p.gold;
    document.getElementById('e-cls').value=p.cls;
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
    p.cls=document.getElementById('e-cls').value;p.level=Math.floor(p.xp/100)+1;
    const cls=CLASSES.find(c=>c.name===p.cls);if(cls){p.role=cls.role;p.attrs={...cls.attrs};}
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
  var ap=document.getElementById('admin-shop-panel');
  if(ap)ap.style.display=session.isAdmin?'block':'none';
  if(session.isAdmin)renderAdminItemsList();
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
    else if(canBuy)btn='<button class="btn btn-sm btn-gold" style="margin-top:auto;" onclick="buyItem(\''+item.id+'\')">Comprar '+item.cost+' oro</button>';
    else if(!meetsR)btn='<div style="font-size:11px;color:var(--coral);margin-top:auto;">🔒 Requisitos no cumplidos</div>';
    else btn='<div style="font-size:11px;color:var(--coral);margin-top:auto;">Oro insuficiente</div>';
    return '<div class="shop-item '+cls+'">'
      +(item.imageUrl?'<img src="'+item.imageUrl+'" alt="'+item.name+'" style="width:100%;height:120px;object-fit:cover;border-radius:var(--radius);margin-bottom:4px;">':'<div class="item-icon">'+item.icon+'</div>')
      +'<div class="item-name">'+item.name+'</div>'
      +'<div class="item-slot">'+item.slot+'</div>'
      +'<div class="item-desc">'+item.desc+'</div>'
      +(bonusStr?'<div class="item-bonus">⬆️ '+bonusStr+'</div>':'')
      +(reqStr?'<div class="item-reqs">📋 Req: '+reqStr+' · Nv.'+item.minLevel+'+'+'</div>':'')
      +'<div class="item-cost">'+(owned?'✅ Comprado':'💰 '+item.cost+' oro')+'</div>'
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
  if(!p.equipped)p.equipped={arma:null,armadura:null,accesorio:null,casco:null,botas:null};
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
    +'<div class="g2">'
    +'<div class="field"><label>Slot</label><select id="aem-slot"><option value="arma"'+(item.slot==='arma'?' selected':'')+'>Arma</option><option value="armadura"'+(item.slot==='armadura'?' selected':'')+'>Armadura</option><option value="accesorio"'+(item.slot==='accesorio'?' selected':'')+'>Accessori</option><option value="casco"'+(item.slot==='casco'?' selected':'')+'>Casc</option><option value="botas"'+(item.slot==='botas'?' selected':'')+'>Botes</option></select></div>'
    +'<div class="field"><label>Raresa</label><select id="aem-rarity"><option value="comun"'+(item.rareza==='comun'?' selected':'')+'>Comú</option><option value="rara"'+(item.rareza==='rara'?' selected':'')+'>Rara</option><option value="epica"'+(item.rareza==='epica'?' selected':'')+'>Èpica</option><option value="legendaria"'+(item.rareza==='legendaria'?' selected':'')+'>Llegendària</option></select></div>'
    +'<div class="field"><label>Cost (or)</label><input type="number" id="aem-cost" value="'+(item.cost||0)+'"/></div>'
    +'<div class="field"><label>Nivell mínim</label><input type="number" id="aem-lvl" value="'+(item.minLevel||1)+'"/></div>'
    +'</div>'
    +'<div class="field"><label>Disponible a</label><select id="aem-via"><option value="tienda"'+(item.via==='tienda'?' selected':'')+'>Botiga+Gacha</option><option value="gacha"'+(item.via==='gacha'?' selected':'')+'>Només Gacha</option><option value="solo_tienda"'+(item.via==='solo_tienda'?' selected':'')+'>Només Botiga</option></select></div>';
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
function switchAdminTab(btn, tabId){
  document.querySelectorAll('#page-items-admin .ptab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-items','tab-cartas'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.style.display=id===tabId?'block':'none';
  });
  if(tabId==='tab-cartas')renderAdminCartasPage();
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
function adminCreateItem(){
  var name=document.getElementById('si-name').value.trim();
  var icon=document.getElementById('si-icon').value.trim()||'📦';
  var desc=document.getElementById('si-desc').value.trim();
  var slot=document.getElementById('si-slot').value;
  var cost=parseInt(document.getElementById('si-cost').value)||0;
  var minLevel=parseInt(document.getElementById('si-lvl').value)||1;
  if(!name){toast('El item necesita un nombre.');return;}
  shopItems.push({id:'item'+Date.now(),name:name,icon:icon,desc:desc,slot:slot,cost:cost,minLevel:minLevel,
    minAttrs:{fue:parseInt(document.getElementById('si-rfue').value)||0,int:parseInt(document.getElementById('si-rint').value)||0,agi:parseInt(document.getElementById('si-ragi').value)||0,car:parseInt(document.getElementById('si-rcar').value)||0,sab:parseInt(document.getElementById('si-rsab').value)||0},
    bonus:{fue:parseInt(document.getElementById('si-bfue').value)||0,int:parseInt(document.getElementById('si-bint').value)||0,agi:parseInt(document.getElementById('si-bagi').value)||0,car:parseInt(document.getElementById('si-bcar').value)||0,sab:parseInt(document.getElementById('si-bsab').value)||0}
  });
  if(CFG.MODE==='supabase')saveToSupabase();
  ['si-name','si-icon','si-desc','si-cost','si-lvl'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  ['si-rfue','si-rint','si-ragi','si-rcar','si-rsab','si-bfue','si-bint','si-bagi','si-bcar','si-bsab'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='0';});
  renderShop();
}
function adminDeleteItem(itemId){
  if(!confirm('¿Eliminar este item?'))return;
  shopItems=shopItems.filter(function(i){return i.id!==itemId;});
  players.forEach(function(p){
    if(p.inventory)p.inventory=p.inventory.filter(function(id){return id!==itemId;});
    if(p.equipped)Object.keys(p.equipped).forEach(function(k){if(p.equipped[k]===itemId)p.equipped[k]=null;});
  });
  if(CFG.MODE==='supabase')saveToSupabase();
  renderShop();
}
function renderAdminItemsList(){
  var wrap=document.getElementById('admin-items-list');
  if(!wrap)return;
  if(!shopItems.length){wrap.innerHTML='';return;}
  wrap.innerHTML='<div class="stitle" style="margin-top:.5rem;">Items existentes</div>'
    +shopItems.map(function(item){
      return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);">'
        +'<span style="font-size:18px;">'+item.icon+'</span>'
        +'<span style="flex:1;font-size:13px;">'+item.name+' <span style="color:var(--muted);font-size:11px;">'+item.slot+' · '+item.cost+' oro · Nv.'+item.minLevel+'+'+'</span></span>'
        +'<button class="btn btn-sm" style="background:rgba(216,90,48,.15);color:#f08060;border-color:rgba(216,90,48,.3);" onclick="adminDeleteItem(\''+item.id+'\')">🗑️</button>'
        +'</div>';
    }).join('');
}



/* ══ CALENDARIO ══ */
var calState={year:new Date().getFullYear(),month:new Date().getMonth(),selectedDate:null,filter:'all',editingEventId:null};

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
  if(!plannerRows.length){toast('No se encontraron tareas en el archivo.');return;}
  document.getElementById('planner-preview').style.display='block';
  document.getElementById('planner-preview-title').textContent='Previsualització — '+plannerRows.length+' tareas encontradas';
  
  // Populate column selectors
  var selects=['map-title','map-assignee','map-deadline','map-bucket','map-status'];
  var defaults={
    'map-title':['Nombre de la tarea','Task Name','Title','Título'],
    'map-assignee':['Asignado a','Assigned To','Assignee'],
    'map-deadline':['Fecha de vencimiento','Due Date','Deadline'],
    'map-bucket':['Depósito','Bucket Name','Nombre de depósito','Bucket'],
    'map-status':['Estado','Progress','State','Status']
  };
  selects.forEach(function(sid){
    var sel=document.getElementById(sid);
    if(!sel)return;
    sel.innerHTML='<option value="">(ninguna)</option>'+plannerHeaders.map(function(h){
      return '<option value="'+h+'">'+h+'</option>';
    }).join('');
    // Auto-select best match
    var candidates=defaults[sid]||[];
    for(var i=0;i<candidates.length;i++){
      var match=plannerHeaders.find(function(h){return h.toLowerCase().includes(candidates[i].toLowerCase());});
      if(match){sel.value=match;break;}
    }
  });
  
  // Build preview table
  var titleCol=document.getElementById('map-title').value||plannerHeaders[0];
  var table=document.getElementById('planner-table');
  var cols=plannerHeaders.slice(0,6);
  table.innerHTML='<thead><tr>'+cols.map(function(h){
    return '<th style="text-align:left;padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:11px;color:var(--muted);font-weight:500;">'+h+'</th>';
  }).join('')+'</tr></thead><tbody>'+plannerRows.slice(0,8).map(function(row){
    return '<tr>'+cols.map(function(h){
      return '<td style="padding:6px 8px;border-bottom:0.5px solid var(--border);font-size:12px;color:var(--text);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+((row[h]||'')+'</td>');
    }).join('')+'</tr>';
  }).join('')+'</tbody>';
}

function confirmPlannerImport(){
  var titleCol  =document.getElementById('map-title').value;
  var assignCol =document.getElementById('map-assignee').value;
  var deadlineCol=document.getElementById('map-deadline').value;
  var bucketCol =document.getElementById('map-bucket').value;
  var statusCol =document.getElementById('map-status').value;
  var defaultDiff=document.getElementById('map-diff').value;
  
  if(!titleCol){toast('Selecciona al menos la columna de título.');return;}
  
  var DIFF_REWARDS={D:{xp:25,gold:10},C:{xp:75,gold:25},B:{xp:150,gold:50},A:{xp:300,gold:100},S:{xp:500,gold:200}};
  var imported=0;
  
  plannerRows.forEach(function(row){
    var title=(row[titleCol]||'').trim();
    if(!title)return;
    
    // Skip if already imported (same plannerId)
    var existingId='planner_'+title.replace(/\s+/g,'_').toLowerCase().slice(0,20);
    if(missions.find(function(m){return m.plannerId===existingId;}))return;
    
    // Map status
    var plannerStatus=(row[statusCol]||'').toLowerCase();
    var status=plannerStatus.includes('complet')||plannerStatus.includes('done')?'done':
               plannerStatus.includes('progres')||plannerStatus.includes('curso')?'active':'pending';
    
    // Map bucket to arc
    var arc=(row[bucketCol]||'General').trim()||'General';
    
    // Find assignee
    var assigneeName=(row[assignCol]||'').trim();
    var assignedPlayer=players.find(function(p){
      return p.realName&&assigneeName&&(
        p.realName.toLowerCase().includes(assigneeName.toLowerCase().split(' ')[0])||
        assigneeName.toLowerCase().includes(p.realName.toLowerCase().split(' ')[0])
      );
    });
    
    var priorityMap={'Urgente':'A','Importante':'B','Media':'C','Baja':'D'};
    var taskPriority=row['Priority']||row['Prioridad']||'';
    var taskDiff=priorityMap[taskPriority]||defaultDiff;
    var rewards=DIFF_REWARDS[taskDiff]||DIFF_REWARDS['C'];
    
    var newM={
      id:'planner_'+Date.now()+'_'+imported,
      name:title,
      arc:arc,
      playerId:assignedPlayer?assignedPlayer.id:'',
      status:status,
      diff:taskDiff,
      xp:rewards.xp,
      gold:rewards.gold,
      attr:'Inteligencia',attrPts:2,
      deadline:row[deadlineCol]||'',
      daily:false,isDaily_instance:false,
      plannerId:existingId,
      createdBy:session.playerId,
      fromPlanner:true
    };
    missions.push(newM);
    imported++;
  });
  
  if(CFG.MODE==='supabase')saveToSupabase();
  clearPlannerImport();
  renderAll();
  renderPlannerImported();
  document.getElementById('planner-imported').style.display='block';
  
}

function clearPlannerImport(){
  plannerRows=[];plannerHeaders=[];
  document.getElementById('planner-preview').style.display='none';
  document.getElementById('planner-file').value='';
  var drop=document.getElementById('planner-drop');
  if(drop)drop.innerHTML='<div style="font-size:32px;margin-bottom:8px;">📂</div><div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px;">Arrossega el teu fitxer aquí</div><div style="font-size:12px;color:var(--muted);">o haz clic para seleccionar — .xlsx, .csv</div><input type="file" id="planner-file" accept=".csv,.xlsx,.xls" style="display:none;" onchange="plannerFileSelected(this)"/>';
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
    return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:0.5px solid var(--border);">'
      +'<span class="badge d'+m.diff+'">'+m.diff+'</span>'
      +'<div style="flex:1;"><div style="font-size:13px;font-weight:500;">'+m.name+'</div>'
      +'<div style="font-size:11px;color:var(--muted);">'+m.arc+(p?' · '+p.emblem+' '+p.name:'')+(m.deadline?' · '+m.deadline:'')+'</div></div>'
      +'<span class="badge '+(m.status==='done'?'b-teal':m.status==='active'?'b-gold':'b-gray')+'">'+
        (m.status==='done'?'Completada':m.status==='active'?'En curs':'Pendiente')+'</span>'
      +'<button class="btn btn-sm" style="font-size:11px;" onclick="deleteMission(\''+m.id+'\')">✕</button>'
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


/* ══ PENTAGON ══ */
function buildPentagon(attrs,color){
  var keys=['fue','int','agi','car','sab'];
  var labels=['Fuerza','Intel.','Agilidad','Carisma','Sabiduría'];
  var cx=100,cy=100,r=75,n=5;
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
  var sw=document.getElementById('inv-slots'),gw=document.getElementById('inv-grid');
  if(!sw||!gw)return;
  if(!p){sw.innerHTML='<div style="color:var(--muted);font-size:13px;">Inicia sesión.</div>';gw.innerHTML='';return;}
  if(!p.equipped)p.equipped={arma:null,armadura:null,accesorio:null,casco:null,botas:null};
  var slotDefs=[
    {key:'arma',label:'Arma',icon:'⚔️'},
    {key:'armadura',label:'Armadura',icon:'🛡️'},
    {key:'accesorio',label:'Accesorio',icon:'💎'},
    {key:'casco',label:'Casco',icon:'⛑️'},
    {key:'botas',label:'Botas',icon:'👟'}
  ];
  sw.innerHTML=slotDefs.map(function(sl){
    var iid=p.equipped[sl.key];
    var item=shopItems.find(function(i){return i.id===iid;});
    var html='<div class="inv-slot '+(item?'filled':'')+'" onclick="invEquipSlot(\"'+sl.key+'\")">';
    html+='<div class="inv-slot-icon">'+(item?item.icon:sl.icon)+'</div>';
    html+='<div class="inv-slot-name">'+(item?item.name:'Vacío')+'</div>';
    html+='<div class="inv-slot-label">'+sl.label+'</div>';
    if(item)html+='<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;" onclick="event.stopPropagation();unequipItem(\"'+iid+'\");renderInventario();">✕</button>';
    html+='</div>';
    return html;
  }).join('');
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
  if(!inv.length){gw.innerHTML='';return;}
  gw.innerHTML=inv.map(function(iid){
    var item=shopItems.find(function(i){return i.id===iid;});
    if(!item)return '';
    var eq=p.equipped&&Object.values(p.equipped).indexOf(iid)>=0;
    var bonusStr=Object.entries(item.bonus||{}).filter(function(e){return e[1]>0;}).map(function(e){return '+'+e[1]+' '+AN[e[0]];}).join(' · ');
    var html='<div class="inv-item bg-rarity-'+(item.rareza||'comun')+' '+(eq?'equipped':'')+'">';
    html+=(item.imageUrl?'<img src="'+item.imageUrl+'" alt="'+item.name+'" style="width:100%;height:120px;object-fit:cover;border-radius:var(--radius);margin-bottom:4px;">':'<div style="font-size:24px;text-align:center;">'+item.icon+'</div>');
    html+='<div style="font-size:13px;font-weight:500;">'+item.name+'</div>';
    html+='<div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);">'+item.slot+'</div>';
    if(bonusStr)html+='<div style="font-size:11px;color:var(--accent);">⬆️ '+bonusStr+'</div>';
    html+='<div style="margin-top:auto;padding-top:6px;">';
    if(eq){
      html+='<button class="btn btn-sm" style="width:100%;" onclick="unequipItem(\"'+iid+'\");renderInventario();">Desequipar</button>';
    }else{
      html+='<button class="btn btn-sm btn-p" style="width:100%;" onclick="equipItem(\"'+iid+'\");renderInventario();">Equipar</button>';
    }
    html+='</div></div>';
    return html;
  }).join('');
}
function invEquipSlot(slot){
  var p=players.find(function(pl){return pl.id===session.playerId;});if(!p)return;
  var compatible=(p.inventory||[]).filter(function(id){var item=shopItems.find(function(i){return i.id===id;});return item&&item.slot===slot;});
  if(!compatible.length){toast('No tienes items para el slot: '+slot);return;}
  var current=p.equipped?p.equipped[slot]:null;
  var next=compatible.find(function(id){return id!==current;})||compatible[0];
  equipItem(next);renderInventario();
}

/* ══ SHOWCASE ══ */
function openShowcaseSelector(idx){
  var p=players.find(function(pl){return pl.id===session.playerId;});
  if(!p||!(p.gallery||[]).length){toast('Encara no tens cartes a la teva galeria.');return;}
  if(!p.showcase)p.showcase=[null,null,null];
  var allIds=typeof p.gallery[0]==='string'?p.gallery:p.gallery.map(function(e){return e.cardId||e;});
  var available=allIds.filter(function(id){return !p.showcase.includes(id)||id===p.showcase[idx];});
  if(!available.length){toast('No hi ha més cartes disponibles.');return;}
  var ci=available.indexOf(p.showcase[idx]);
  p.showcase[idx]=available[(ci+1)%available.length];
  if(CFG.MODE==='supabase')saveToSupabase();
  renderHeroProfile(curHero);
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
    +`<div class="smini"><div class="v">${m.gold}</div><div class="l">Oro</div></div>`
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
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',2500);}

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
const DIFF_REWARDS={D:{xp:25,gold:10},C:{xp:75,gold:25},B:{xp:150,gold:50},A:{xp:300,gold:100},S:{xp:500,gold:200}};
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
