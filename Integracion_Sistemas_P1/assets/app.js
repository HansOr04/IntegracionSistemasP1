/* ---------- núcleo compartido (todas las páginas) ---------- */
// Si un elemento no existe en la página actual, $ devuelve un objeto «nulo» inofensivo.
const NULLX=new Proxy(function(){},{get:(t,k)=>NULLX,set:()=>true,apply:()=>NULLX});
const $=s=>document.querySelector(s)||NULLX, $$=s=>[...document.querySelectorAll(s)];
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* estado en memoria que sobrevive al cambio de página (sin localStorage) */
const ST=(()=>{try{return window.name.indexOf('IS:')===0?JSON.parse(window.name.slice(3)):{}}catch(e){return {}}})();
function saveST(){try{window.name='IS:'+JSON.stringify(ST)}catch(e){}}
function applyTheme(t){document.documentElement.dataset.theme=t;ST.theme=t;saveST()}
applyTheme(ST.theme||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'));

/* ---------- navegación ---------- */
const NAV=[
 {id:'semana1',href:'semana1.html',t:'Semana 1 · Panorama histórico',c:'n1'},
 {id:'semana2',href:'semana2.html',t:'Semana 2 · Patrones clásicos',c:'n2'},
 {id:'semana3',href:'semana3.html',t:'Semana 3 · APIs como estándar',c:'n3'},
 {id:'taller',href:'taller.html',t:'🧪 Taller (repaso)',c:'n3'},
 {id:'taller-codigo',href:'taller-codigo.html',t:'🛠️ Taller: cómo hacer el código',c:'n3'},
 {id:'seguridad',href:'seguridad.html',t:'🔐 Seguridad de APIs',c:'n3'},
 {id:'articulo',href:'articulo.html',t:'📄 Artículo: parlamento',c:'n2'},
 {id:'linea-tiempo',href:'linea-tiempo.html',t:'🕰️ Línea de tiempo'},
 {id:'tablas',href:'tablas.html',t:'📊 Tablas comparativas'},
 {id:'practica',href:'practica.html',t:'🧭 Práctica de API'},
 {id:'glosario',href:'glosario.html',t:'📚 Glosario'},
 {id:'autoevaluacion',href:'autoevaluacion.html',t:'✅ Autoevaluación'},
 {id:'cheat-sheet',href:'cheat-sheet.html',t:'🗒️ Cheat sheet'}
];
const GROUPS=[['Contenido',['semana1','semana2','semana3']],['Taller',['taller','taller-codigo','seguridad']],['Recursos',['linea-tiempo','tablas','practica']],['Evaluación',['articulo','glosario','autoevaluacion','cheat-sheet']]];
const CUR=document.body.dataset.page;
(function buildLayout(){
  const byId={};NAV.forEach(n=>byId[n.id]=n);
  let nav='<a href="index.html" class="'+(CUR==='index'?'active':'')+'">🏠 Portada</a>'+(CUR==='index'?'<div class="toc" id="toc"></div>':'');
  GROUPS.forEach(g=>{nav+='<div class="sep">'+g[0]+'</div>';g[1].forEach(id=>{const n=byId[id];nav+='<a class="'+(n.c||'')+(CUR===id?' active':'')+'" href="'+n.href+'">'+n.t+'</a>'+(CUR===id?'<div class="toc" id="toc"></div>':'')})});
  const sb=document.createElement('aside');sb.className='sidebar';sb.id='sidebar';
  sb.innerHTML='<h2>Integración de Sistemas</h2><small>ISWZ3104 · UDLA · Progreso 1</small><nav id="nav">'+nav+'</nav><div class="tools"><button class="icon-btn" id="mode">⚡ Modo express</button> <button class="icon-btn" id="theme">◐ Tema claro/oscuro</button></div>';
  const tb=document.createElement('div');tb.className='topbar';
  tb.innerHTML='<button class="icon-btn" id="burger" aria-label="Menú">☰</button><b>Integración de Sistemas · P1</b><span style="flex:1"></span><button class="icon-btn" id="mode2" aria-label="Modo express">⚡</button><button class="icon-btn" id="theme2" aria-label="Cambiar tema">◐</button>';
  const pg=document.createElement('div');pg.id='progress';
  document.body.prepend(sb);document.body.prepend(tb);document.body.prepend(pg);

  /* anterior / siguiente */
  const order=['index'].concat(...GROUPS.map(g=>g[1]));const i=order.indexOf(CUR);
  const wrap=document.querySelector('.wrap');
  if(wrap&&i>=0){
    const lab=id=>id==='index'?{href:'index.html',t:'🏠 Portada'}:byId[id];
    const prev=order[i-1],next=order[i+1];
    let h='<div class="pager">';
    h+=prev?'<a class="prev" href="'+lab(prev).href+'"><small>← Anterior</small>'+lab(prev).t+'</a>':'<span></span>';
    h+=next?'<a class="next" href="'+lab(next).href+'"><small>Siguiente →</small>'+lab(next).t+'</a>':'<span></span>';
    h+='</div>';
    const f=wrap.querySelector('footer');
    if(f)f.insertAdjacentHTML('beforebegin',h);else wrap.insertAdjacentHTML('beforeend',h);
  }

  /* índice de la página actual dentro del menú lateral */
  const toc=document.getElementById('toc');
  if(toc){
    const heads=[...document.querySelectorAll('main section.block > h3, main .topic[id] > h3, main h3.tsec')];
    const targets=[];
    heads.forEach((h,k)=>{
      const host=h.closest('.topic[id]')||h;
      if(!host.id)host.id='sec-'+(k+1);
      const c=h.cloneNode(true);c.querySelectorAll('.tag,.num').forEach(x=>x.remove());
      const txt=c.textContent.replace(/\s+/g,' ').trim();if(!txt)return;
      const a=document.createElement('a');a.href='#'+host.id;a.textContent=txt;toc.appendChild(a);targets.push([host,a]);
    });
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){targets.forEach(t=>t[1].classList.toggle('on',t[0]===e.target))}})},{rootMargin:'-20% 0px -70% 0px'});
      targets.forEach(t=>io.observe(t[0]));
    }
  }
})();
function toggleTheme(){applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')}
$('#theme').onclick=toggleTheme;$('#theme2').onclick=toggleTheme;
$('#burger').onclick=()=>$('#sidebar').classList.toggle('open');
$$('#nav a').forEach(a=>a.addEventListener('click',()=>$('#sidebar').classList.remove('open')));
function onScroll(){const d=document.documentElement;const p=d.scrollTop/(d.scrollHeight-d.clientHeight||1);$('#progress').style.width=(p*100)+'%'}
addEventListener('scroll',onScroll,{passive:true});onScroll();



/* ---------- diagramas ---------- */
function drawDiagram(s){
  const B={};s.boxes.forEach(b=>{b.w=b.w||130;b.h=b.h||46;B[b.id]=b});
  let o='<svg class="diagram" viewBox="0 0 '+s.w+' '+s.h+'" role="img" aria-label="'+esc(s.alt)+'">';
  (s.arrows||[]).forEach(a=>{
    const A=B[a.f],T=B[a.t],ca={x:A.x+A.w/2,y:A.y+A.h/2},cb={x:T.x+T.w/2,y:T.y+T.h/2};
    const dx=cb.x-ca.x,dy=cb.y-ca.y,off=a.o||0;let x1,y1,x2,y2;
    const vert=a.d?a.d==='v':Math.abs(dy)>Math.abs(dx);
    if(vert){
      y1=dy>0?A.y+A.h:A.y;y2=dy>0?T.y:T.y+T.h;
      if(ca.x>=T.x&&ca.x<=T.x+T.w){x1=x2=ca.x}else if(cb.x>=A.x&&cb.x<=A.x+A.w){x1=x2=cb.x}else{x1=ca.x;x2=cb.x}
      x1+=off;x2+=off;
    }else{
      x1=dx>0?A.x+A.w:A.x;x2=dx>0?T.x:T.x+T.w;
      if(ca.y>=T.y&&ca.y<=T.y+T.h){y1=y2=ca.y}else if(cb.y>=A.y&&cb.y<=A.y+A.h){y1=y2=cb.y}else{y1=ca.y;y2=cb.y}
      y1+=off;y2+=off;
    }
    o+='<line class="ar'+(a.dash?' dash':'')+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"'+(a.nm?'':' marker-end="url(#mk)"')+'/>';
    if(a.l){const mx=(x1+x2)/2,my=(y1+y2)/2,w=a.l.length*5.6+10;
      o+='<rect class="lb" x="'+(mx-w/2)+'" y="'+(my-8)+'" width="'+w+'" height="16" rx="4"/><text class="lt" x="'+mx+'" y="'+(my+4)+'">'+esc(a.l)+'</text>'}
  });
  s.boxes.forEach(b=>{
    o+='<rect class="bx k-'+(b.k||'sys')+'" x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="9"/>';
    const L=b.t.split('\n'),n=L.length;
    L.forEach((ln,i)=>{o+='<text x="'+(b.x+b.w/2)+'" y="'+(b.y+b.h/2-(n-1)*7.5+i*15+4.5)+'">'+esc(ln)+'</text>'});
  });
  (s.texts||[]).forEach(t=>{o+='<text class="cap" x="'+t.x+'" y="'+t.y+'">'+esc(t.t)+'</text>'});
  return o+'</svg>';
}
const DG={
 batch:{w:700,h:150,alt:'Flujo Batch',boxes:[
  {id:'a',x:20,y:50,t:'Sistema origen\n(ERP)'},{id:'f',x:200,y:50,w:150,t:'Archivo / extracción\n(noche, 02:00)',k:'file'},
  {id:'j',x:400,y:50,t:'Job programado\n(ETL / scheduler)',k:'mid'},{id:'b',x:560,y:50,w:120,t:'Destino\n(Data Warehouse)'}],
  arrows:[{f:'a',t:'f',l:'vuelca'},{f:'f',t:'j',l:'lee'},{f:'j',t:'b'}]},
 p2p:{w:700,h:240,alt:'Punto a punto frente a hub-and-spoke',texts:[{x:125,y:22,t:'Punto a punto: n(n−1)/2'},{x:535,y:22,t:'Hub-and-spoke: n conexiones'}],
  boxes:[{id:'A',x:30,y:50,w:90,h:40,t:'App A'},{id:'B',x:200,y:50,w:90,h:40,t:'App B'},{id:'C',x:30,y:170,w:90,h:40,t:'App C'},{id:'D',x:200,y:170,w:90,h:40,t:'App D'},
  {id:'H',x:480,y:97,w:110,h:46,t:'Hub EAI\n(broker)',k:'mid'},{id:'1',x:400,y:35,w:90,h:40,t:'App A'},{id:'2',x:580,y:35,w:90,h:40,t:'App B'},{id:'3',x:400,y:170,w:90,h:40,t:'App C'},{id:'4',x:580,y:170,w:90,h:40,t:'App D'}],
  arrows:[{f:'A',t:'B',nm:1},{f:'A',t:'C',nm:1,d:'v'},{f:'B',t:'D',nm:1,d:'v'},{f:'C',t:'D',nm:1},{f:'A',t:'D',nm:1,d:'h'},{f:'B',t:'C',nm:1,d:'h'},
  {f:'1',t:'H',d:'v'},{f:'2',t:'H',d:'v'},{f:'3',t:'H',d:'v'},{f:'4',t:'H',d:'v'}]},
 esb:{w:700,h:280,alt:'Servicios y consumidores alrededor de un ESB',boxes:[
  {id:'s1',x:40,y:15,t:'Servicio\nClientes'},{id:'s2',x:200,y:15,t:'Servicio\nPedidos'},{id:'s3',x:360,y:15,t:'Servicio\nFacturación'},{id:'s4',x:520,y:15,t:'Servicio\nInventario'},
  {id:'e',x:40,y:115,w:610,h:50,t:'ESB: enrutamiento · transformación · mediación de protocolos · seguridad',k:'mid'},
  {id:'c1',x:40,y:215,t:'App Web'},{id:'c2',x:200,y:215,t:'App Móvil'},{id:'c3',x:360,y:215,t:'Legacy /\nMainframe'},{id:'c4',x:520,y:215,t:'Socio B2B'}],
  arrows:[{f:'s1',t:'e'},{f:'s2',t:'e'},{f:'s3',t:'e'},{f:'s4',t:'e'},{f:'e',t:'c1'},{f:'e',t:'c2'},{f:'e',t:'c3'},{f:'e',t:'c4'}]},
 ms:{w:700,h:270,alt:'Microservicios con API Gateway y base de datos por servicio',boxes:[
  {id:'g',x:270,y:12,w:160,t:'API Gateway',k:'mid'},
  {id:'m1',x:30,y:110,t:'Servicio\nUsuarios'},{id:'m2',x:200,y:110,t:'Servicio\nPedidos'},{id:'m3',x:370,y:110,t:'Servicio\nPagos'},{id:'m4',x:540,y:110,t:'Servicio\nCatálogo'},
  {id:'d1',x:30,y:205,h:40,t:'BD propia',k:'db'},{id:'d2',x:200,y:205,h:40,t:'BD propia',k:'db'},{id:'d3',x:370,y:205,h:40,t:'BD propia',k:'db'},{id:'d4',x:540,y:205,h:40,t:'BD propia',k:'db'}],
  arrows:[{f:'g',t:'m1',d:'v'},{f:'g',t:'m2',d:'v'},{f:'g',t:'m3',d:'v'},{f:'g',t:'m4',d:'v'},{f:'m1',t:'d1'},{f:'m2',t:'d2'},{f:'m3',t:'d3'},{f:'m4',t:'d4'}]},
 eda:{w:700,h:230,alt:'Arquitectura orientada a eventos',boxes:[
  {id:'p1',x:20,y:35,t:'Servicio\nPedidos'},{id:'p2',x:20,y:140,t:'Servicio\nPagos'},
  {id:'br',x:260,y:78,w:180,h:74,t:'Broker de eventos\n(Kafka / RabbitMQ)\ntópico: pedido.creado',k:'mid'},
  {id:'c1',x:540,y:12,t:'Notificaciones'},{id:'c2',x:540,y:92,t:'Inventario'},{id:'c3',x:540,y:172,t:'Analítica'}],
  arrows:[{f:'p1',t:'br',l:'publica'},{f:'p2',t:'br'},{f:'br',t:'c1'},{f:'br',t:'c2',l:'suscriben'},{f:'br',t:'c3'}]},
 ft:{w:700,h:130,alt:'Transferencia de archivos',boxes:[
  {id:'a',x:20,y:42,t:'Sistema A\n(exporta)'},{id:'f',x:230,y:36,w:210,h:58,t:'Archivo compartido\npagos_20261025.csv · SFTP',k:'file'},{id:'b',x:550,y:42,t:'Sistema B\n(importa)'}],
  arrows:[{f:'a',t:'f',l:'escribe'},{f:'f',t:'b',l:'lee después'}]},
 db:{w:700,h:210,alt:'Base de datos compartida',boxes:[
  {id:'a',x:40,y:15,h:42,t:'App Matrícula'},{id:'b',x:40,y:84,h:42,t:'App Finanzas'},{id:'c',x:40,y:153,h:42,t:'App CRM'},
  {id:'d',x:380,y:62,w:200,h:86,t:'Base de datos compartida\n(un solo esquema)',k:'db'}],
  arrows:[{f:'a',t:'d',l:'lee/escribe'},{f:'b',t:'d'},{f:'c',t:'d'}]},
 rpc:{w:700,h:140,alt:'Invocación remota de procedimientos',boxes:[
  {id:'c',x:20,y:47,w:140,t:'Cliente\n(stub)'},{id:'s',x:520,y:47,w:150,t:'Servidor\n(skeleton)'}],
  arrows:[{f:'c',t:'s',o:-9,l:'calcularNota(id)'},{f:'s',t:'c',o:9,dash:1,l:'resultado'}]},
 msg:{w:700,h:160,alt:'Mensajería',boxes:[
  {id:'p',x:20,y:57,t:'Productor'},{id:'c',x:250,y:45,w:200,h:70,t:'Canal de mensajes\n(cola / tópico)\nstore-and-forward',k:'mid'},{id:'k',x:550,y:57,t:'Consumidor'}],
  arrows:[{f:'p',t:'c',l:'envía'},{f:'c',t:'k',l:'entrega'}]},
 camel:{w:700,h:130,alt:'Ruta Apache Camel',boxes:[
  {id:'a',x:10,y:40,t:'Endpoint origen\nfile:data/entrada'},{id:'b',x:180,y:40,t:'Procesador\nCSV → objetos'},{id:'c',x:350,y:40,t:'Enrutador\nfilter / choice'},{id:'d',x:520,y:40,w:160,t:'Endpoint destino\nhttp://…/pagos'}],
  arrows:[{f:'a',t:'b'},{f:'b',t:'c'},{f:'c',t:'d'}]},
 role:{w:700,h:260,alt:'Matrícula, Finanzas y CRM',boxes:[
  {id:'m',x:30,y:20,w:150,h:50,t:'Matrícula\n(académico)'},{id:'f',x:520,y:20,w:150,h:50,t:'Finanzas\n(legacy ERP)'},{id:'c',x:275,y:190,w:150,h:50,t:'CRM'}],
  arrows:[{f:'m',t:'f',o:-8,l:'evento MatriculaConfirmada'},{f:'f',t:'m',o:12,dash:1,l:'PagoRegistrado'},{f:'m',t:'c',d:'v',l:'evento'},{f:'f',t:'c',d:'v',dash:1,l:'archivo nocturno'}]},
 frontera:{w:700,h:150,alt:'Consumidor, contrato de la API e implementación',boxes:[
  {id:'c',x:20,y:45,w:130,t:'Consumidor'},{id:'a',x:240,y:30,w:220,h:76,t:'Menú de la API\nqué pedir · cómo pedirlo\nqué esperar',k:'mid'},{id:'i',x:550,y:45,w:130,t:'Implementación\n(la «cocina»)'}],
  arrows:[{f:'c',t:'a'},{f:'a',t:'i'}]},
 rest:{w:700,h:130,alt:'Petición REST',boxes:[
  {id:'c',x:20,y:42,w:130,t:'Cliente\n(app móvil)'},{id:'s',x:540,y:42,w:140,t:'Servidor API\n/orders'}],
  arrows:[{f:'c',t:'s',o:-9,l:'GET /orders/O-9831'},{f:'s',t:'c',o:9,dash:1,l:'200 OK + JSON'}]},
 gql:{w:700,h:200,alt:'GraphQL con un solo endpoint',boxes:[
  {id:'c',x:20,y:77,w:120,t:'Cliente'},{id:'e',x:270,y:70,w:160,h:60,t:'POST /graphql\n(un solo endpoint)',k:'mid'},
  {id:'r1',x:550,y:10,w:130,t:'Resolver\nUsuarios'},{id:'r2',x:550,y:77,w:130,t:'Resolver\nPedidos'},{id:'r3',x:550,y:144,w:130,t:'Resolver\nProductos'}],
  arrows:[{f:'c',t:'e',l:'query { … }'},{f:'e',t:'r1'},{f:'e',t:'r2'},{f:'e',t:'r3'}]},
 grpc:{w:700,h:130,alt:'gRPC',boxes:[
  {id:'c',x:20,y:42,w:140,t:'Cliente\n(stub generado)'},{id:'s',x:530,y:42,w:150,t:'Servidor gRPC\n(.proto)'}],
  arrows:[{f:'c',t:'s',o:-9,l:'Protobuf sobre HTTP/2'},{f:'s',t:'c',o:9,dash:1,l:'respuesta binaria / stream'}]}
};
$$('.dg[data-d]').forEach(el=>{const s=DG[el.dataset.d];if(s)el.innerHTML=drawDiagram(s)});

/* ---------- YAML resaltado ---------- */
function hlYaml(src){
  return src.split('\n').map(line=>{
    let code=line,com='';const ci=line.search(/\s#\s|^\s*#/);
    if(ci>=0){code=line.slice(0,ci);com=line.slice(ci)}
    let html='';
    const m=code.match(/^(\s*(?:-\s+)?)([^\s:#][^:]*?)(:)(\s.*|)$/);
    const val=v=>{
      const t=v.trim();if(!t)return esc(v);
      const lead=v.match(/^\s*/)[0];
      let cls='v';
      if(/^['"].*['"]$/.test(t))cls='s';else if(/^-?\d+(\.\d+)?$/.test(t))cls='n';else if(/^(true|false|null)$/.test(t))cls='b';else if(/^\[.*\]$/.test(t))cls='s';
      return lead+'<span class="'+cls+'">'+esc(t)+'</span>';
    };
    if(m){
      const isRef=m[2]==='$ref';
      html=esc(m[1])+'<span class="'+(isRef?'r':'k')+'">'+esc(m[2])+'</span>'+esc(m[3])+val(m[4]);
    }else{
      const t=code.trim();
      if(t.startsWith('- ')){html=esc(code.slice(0,code.indexOf('-')+2))+val(t.slice(2))}else html=val(code);
    }
    if(com)html+='<span class="c">'+esc(com)+'</span>';
    return html;
  }).join('\n');
}
$('#yamlout').innerHTML=hlYaml($('#yaml-src').textContent.trim());

/* ---------- línea de tiempo ---------- */
const TL=[
 {n:'Batch',y:'~1960–1980',c:'#64748b',p:'Procesar grandes volúmenes de datos en mainframes con recursos escasos, aprovechando horarios de poca carga.',l:'Latencia de horas o días; datos desactualizados; errores detectados tarde; ventanas de proceso que se saturan; sin interacción en tiempo real.'},
 {n:'EAI',y:'~1990s',c:'#2563eb',p:'El espagueti de interfaces punto a punto entre ERP, CRM y sistemas legacy. Se centraliza con un hub, adaptadores y un modelo canónico.',l:'El hub es punto único de fallo y cuello de botella; productos propietarios y costosos (lock-in); difícil gobernar el modelo canónico.'},
 {n:'SOA / ESB',y:'~2000–2010',c:'#7c3aed',p:'Reutilizar capacidades de negocio como servicios con contrato (SOAP/WSDL), mediados por un ESB que enruta, transforma y asegura.',l:'XML verboso; gobernanza pesada; el ESB acumula lógica y se vuelve cuello de botella; servicios de grano grueso.'},
 {n:'APIs / REST',y:'~2000 (Fielding); auge ~2010',c:'#059669',p:'Ofrecer integración simple y universal sobre HTTP, con recursos y JSON, y contratos descritos con OpenAPI. Base de las APIs web y móviles.',l:'Acoplamiento temporal (síncrono); over/under-fetching; versionado de contratos; varias llamadas para vistas complejas.'},
 {n:'Microservicios',y:'~2014 en adelante',c:'#d97706',p:'Permitir equipos autónomos, despliegue y escalado independientes con servicios pequeños y base de datos por servicio.',l:'Complejidad operativa y de red; consistencia eventual; observabilidad y pruebas difíciles; riesgo de «monolito distribuido».'},
 {n:'EDA',y:'~2010s, consolidada con Kafka',c:'#dc2626',p:'Desacoplar en el tiempo y en la ubicación: los componentes reaccionan a eventos publicados en un broker, sin conocerse entre sí.',l:'Consistencia eventual; depuración y trazabilidad; orden y duplicados (idempotencia); versionado de esquemas de eventos.'}
];
(function(){
  const bar=$('#tlbar'),det=$('#tldetail');
  function show(i){
    const t=TL[i];$$('#tlbar button').forEach((b,j)=>b.classList.toggle('on',j===i));
    det.style.setProperty('--tc',t.c);
    det.innerHTML='<h3>'+t.n+' <small style="color:var(--muted);font-weight:500">· '+t.y+' (aprox.)</small></h3><div class="row"><div><b>Problema que resolvía</b><br>'+t.p+'</div><div><b>Limitaciones</b><br>'+t.l+'</div></div>';
  }
  TL.forEach((t,i)=>{const b=document.createElement('button');b.style.setProperty('--tc',t.c);b.innerHTML=(i+1)+'. '+t.n+'<small>'+t.y.split(';')[0]+'</small>';b.onclick=()=>show(i);bar.appendChild(b)});
  show(0);
})();

/* ---------- glosario ---------- */
const GL=[
["Acoplamiento (coupling)","Grado de dependencia entre componentes; cuanto menor, más fácil cambiar uno sin romper el otro."],
["Cohesión (cohesion)","Grado en que los elementos de un módulo trabajan por un único propósito."],
["API (Application Programming Interface)","Interfaz mediante la cual un software expone capacidades o información a otro."],
["Batch (procesamiento por lotes)","Procesar datos acumulados en bloque, en una ventana programada."],
["EAI (Enterprise Application Integration)","Integración de aplicaciones empresariales mediante middleware central (hub-and-spoke)."],
["Hub-and-spoke","Topología en que todas las aplicaciones se conectan a un hub central mediante adaptadores."],
["SOA (Service-Oriented Architecture)","Estilo en que la funcionalidad se expone como servicios con contrato, reutilizables y componibles."],
["ESB (Enterprise Service Bus)","Middleware que media entre servicios: enruta, transforma, adapta protocolos y asegura."],
["Middleware","Software intermedio que permite comunicar aplicaciones heterogéneas."],
["Broker","Intermediario que recibe, almacena y distribuye mensajes o eventos."],
["Microservicio (microservice)","Servicio pequeño y autónomo, desplegable de forma independiente, con sus propios datos."],
["EDA (Event-Driven Architecture)","Arquitectura donde los componentes se comunican mediante eventos."],
["Evento (event)","Hecho inmutable que ya ocurrió, por ejemplo PedidoCreado."],
["Comando (command)","Orden dirigida a un destinatario para que ejecute una acción."],
["Publish/Subscribe","Modelo en que un productor publica y varios suscriptores reciben."],
["File Transfer","Estilo de integración en que un sistema produce archivos que otro consume más tarde."],
["Shared Database","Estilo de integración en que varias aplicaciones usan una misma base de datos."],
["RPC (Remote Procedure Invocation)","Invocar un procedimiento de otra aplicación como si fuera local."],
["Messaging","Estilo de integración mediante mensajes asíncronos por un canal."],
["Store-and-forward","El canal guarda el mensaje hasta poder entregarlo."],
["Dead Letter Queue (DLQ)","Cola donde se envían los mensajes que no pudieron procesarse."],
["Endpoint","Punto de acceso a una API: URL más método HTTP."],
["Recurso (resource)","Entidad del dominio identificada por una URI, por ejemplo un pedido."],
["URI","Identificador uniforme de un recurso, por ejemplo /orders/O-9831."],
["Representación","Forma en que se transmite el estado de un recurso (JSON, XML)."],
["Idempotencia (idempotency)","Propiedad por la que repetir una operación deja el mismo estado final."],
["Operación segura (safe)","Operación que no modifica el estado del servidor, como GET."],
["Stateless (sin estado)","Cada petición contiene toda la información necesaria; el servidor no guarda sesión del cliente."],
["Contrato (contract)","Acuerdo explícito sobre operaciones, datos, errores y expectativas entre consumidor y proveedor."],
["Contract First","Diseñar y validar el contrato antes de implementar."],
["Consumidor / Proveedor (consumer / provider)","Sistema que usa la API / sistema que la expone."],
["Schema","Descripción formal de la estructura y tipos de un dato."],
["OpenAPI","Estándar para describir APIs HTTP en YAML o JSON."],
["Swagger","Nombre histórico de OpenAPI y de sus herramientas (UI, Editor, Codegen)."],
["Path parameter","Parámetro dentro de la ruta que identifica un recurso: /orders/{orderId}."],
["Query parameter","Parámetro tras ? que filtra, ordena o busca: ?customerId=C-1."],
["Payload","Cuerpo de datos de una petición o respuesta."],
["Códigos de estado (status codes)","Números HTTP que indican el resultado de una petición."],
["Correlation ID","Identificador para rastrear una petición a través de varios sistemas."],
["Paginación (pagination)","Devolver resultados por partes (offset o cursor)."],
["Versionado (versioning)","Gestionar cambios incompatibles de una API con versiones."],
["HATEOAS","Hipermedia: las respuestas incluyen enlaces a las acciones posibles."],
["REST","Estilo arquitectónico basado en recursos, HTTP y restricciones como stateless."],
["SOAP","Protocolo de mensajes XML con contrato WSDL."],
["WSDL","Lenguaje XML que describe el contrato de un servicio SOAP."],
["GraphQL","Lenguaje de consulta donde el cliente pide exactamente los campos que necesita."],
["gRPC","Framework RPC con Protocol Buffers sobre HTTP/2 y streaming."],
["Protocol Buffers (Protobuf)","Formato binario tipado definido en archivos .proto."],
["Webhook","Llamada HTTP que el proveedor hace al consumidor cuando ocurre un evento."],
["Over-fetching / Under-fetching","Recibir más datos de los necesarios / necesitar varias llamadas por datos insuficientes."],
["Polling","Consultar repetidamente para ver si hay novedades."],
["Legacy","Sistema antiguo, crítico y difícil de modificar, a menudo sin APIs modernas."],
["Modelo canónico de datos (canonical data model)","Formato común intermedio para traducir entre sistemas."],
["Consistencia eventual (eventual consistency)","Los datos convergen con el tiempo, no de inmediato."],
["Apache Camel","Framework de integración que implementa los EIP con rutas y componentes."],
["Postman","Herramienta para probar APIs e importar especificaciones OpenAPI."]
];
function renderGl(f){f=(f||'').toLowerCase();$('#gl').innerHTML=GL.filter(g=>!f||g[0].toLowerCase().includes(f)||g[1].toLowerCase().includes(f)).map(g=>'<div><b>'+esc(g[0])+'</b>'+esc(g[1])+'</div>').join('')||'<p>Sin resultados.</p>'}
renderGl();$('#gsearch').addEventListener('input',e=>renderGl(e.target.value));

/* ---------- preguntas ---------- */
const QS=[
{w:1,q:"¿Qué describe mejor un sistema con BAJO acoplamiento (loose coupling)?",o:["Los componentes comparten la misma base de datos y se despliegan siempre juntos","Cada componente conoce muy poco del otro y puede cambiar sin romperlo mientras se respete la interfaz acordada","Un componente invoca directamente las clases internas del otro para ser más rápido","Todos los componentes se ejecutan en el mismo proceso y servidor"],a:1,e:["Incorrecto: compartir BD y desplegar juntos son síntomas típicos de alto acoplamiento.","Correcto: el bajo acoplamiento reduce lo que un sistema debe saber del otro; solo depende de un contrato estable.","Incorrecto: depender de detalles internos es la forma más fuerte de acoplamiento; cualquier refactor rompe al consumidor.","Incorrecto: ejecutar en el mismo proceso no define el acoplamiento y suele implicar dependencia de implementación."]},
{w:1,q:"¿Qué es la cohesión (cohesion) de un módulo?",o:["El número de conexiones que tiene con otros módulos","La velocidad con que transmite datos","El grado en que sus elementos trabajan por un único propósito bien definido","La cantidad de líneas de código que contiene"],a:2,e:["Incorrecto: eso se parece al acoplamiento, no a la cohesión.","Incorrecto: la velocidad es un atributo de rendimiento.","Correcto: alta cohesión significa que el módulo hace una cosa bien definida; se busca junto con bajo acoplamiento.","Incorrecto: el tamaño no mide cohesión."]},
{w:1,q:"¿Cuál es la característica principal del procesamiento por lotes (Batch)?",o:["Acumula datos y los procesa en bloque en ventanas programadas, con latencia alta","Procesa cada evento en milisegundos apenas ocurre","Requiere necesariamente un ESB","Usa siempre HTTP y REST"],a:0,e:["Correcto: el lote se procesa en una ventana programada (por ejemplo nocturna), con latencia de horas.","Incorrecto: eso describe el procesamiento en tiempo real o por eventos.","Incorrecto: Batch es anterior al ESB y no lo necesita.","Incorrecto: Batch se hace con archivos y jobs; no depende de REST."]},
{w:1,q:"¿Qué problema atacó la EAI con su modelo hub-and-spoke?",o:["La falta de navegadores web","La necesidad de eliminar toda integración entre sistemas","El costo del almacenamiento en disco","El «espagueti» de integraciones punto a punto, con hasta n(n−1)/2 conexiones"],a:3,e:["Incorrecto: no guarda relación con la integración empresarial.","Incorrecto: la EAI busca integrar, no eliminar la integración.","Incorrecto: no es un problema de almacenamiento.","Correcto: con un hub central el número de conexiones crece de forma lineal, no cuadrática."]},
{w:1,q:"¿Cuál es una desventaja clásica del hub de la EAI?",o:["Aumenta el número de conexiones punto a punto","Se convierte en punto único de fallo y cuello de botella","No permite transformar mensajes","Obliga a todas las aplicaciones a usar el mismo lenguaje"],a:1,e:["Incorrecto: el hub las reduce.","Correcto: toda la comunicación pasa por el hub; si cae o se satura, afecta a todos.","Incorrecto: la transformación es una de sus funciones principales.","Incorrecto: usa adaptadores justamente para integrar tecnologías distintas."]},
{w:1,q:"En SOA, ¿qué elemento permite usar un servicio sin conocer su implementación?",o:["El código fuente del servicio","La base de datos del servicio","Un contrato de servicio publicado (por ejemplo, un WSDL)","La dirección IP del servidor"],a:2,e:["Incorrecto: ver el código sería acoplarse a la implementación.","Incorrecto: acceder a la BD rompe la abstracción del servicio.","Correcto: el contrato describe operaciones y mensajes y oculta la implementación.","Incorrecto: la IP es ubicación, no define cómo usar el servicio."]},
{w:1,q:"¿Qué funciones cumple típicamente un ESB?",o:["Enrutamiento, transformación de mensajes, mediación de protocolos y seguridad","Almacenar los datos maestros de la organización","Renderizar las interfaces de usuario","Compilar el código de los servicios"],a:0,e:["Correcto: son las funciones de mediación centrales de un bus de servicios.","Incorrecto: almacenar datos maestros corresponde a otros sistemas (MDM, BD).","Incorrecto: un ESB no tiene capa de presentación.","Incorrecto: la compilación no es función de un ESB."]},
{w:1,q:"¿Qué diferencia a los microservicios de una SOA basada en ESB?",o:["Los microservicios exigen un ESB central más potente","Los microservicios comparten una única base de datos","SOA no usa servicios","Servicios pequeños y autónomos, con despliegue independiente, datos propios y «endpoints inteligentes, tuberías tontas»"],a:3,e:["Incorrecto: los microservicios evitan concentrar la inteligencia en un bus central.","Incorrecto: lo habitual es una base de datos por servicio.","Incorrecto: SOA se basa justamente en servicios.","Correcto: autonomía, datos propios y comunicación ligera son sus rasgos."]},
{w:1,q:"En una arquitectura orientada a eventos (EDA), el productor del evento:",o:["Espera la respuesta de cada consumidor antes de continuar","Publica el evento sin conocer quién lo consumirá","Debe conocer la dirección de todos los consumidores","Elimina el evento cuando el primer consumidor lo lee"],a:1,e:["Incorrecto: eso sería comunicación síncrona.","Correcto: el productor publica y continúa; el broker distribuye a los suscriptores.","Incorrecto: ese conocimiento es acoplamiento que la EDA evita.","Incorrecto: un evento puede ser consumido por muchos suscriptores."]},
{w:1,q:"¿Cuál es el orden cronológico aproximado de la evolución de la integración?",o:["EAI → Batch → REST → SOA → EDA → Microservicios","Microservicios → Batch → EAI → ESB → EDA → REST","Batch → EAI → SOA/ESB → APIs/REST → Microservicios → EDA","SOA → Batch → EAI → Microservicios → REST → EDA"],a:2,e:["Incorrecto: Batch es anterior a EAI.","Incorrecto: los microservicios son posteriores a SOA y REST.","Correcto: es el orden aproximado de la línea de tiempo del curso.","Incorrecto: SOA no es el punto de partida."]},
{w:2,q:"¿Cuál es la principal desventaja de File Transfer?",o:["Latencia alta y datos potencialmente desactualizados, además de gestionar formatos y archivos parciales","Exige que ambos sistemas usen la misma base de datos","Solo funciona con HTTP","No permite integrar sistemas legacy"],a:0,e:["Correcto: se intercambia por lotes y hay que cuidar el formato, el bloqueo y la validación.","Incorrecto: eso describe Shared Database.","Incorrecto: File Transfer no depende de HTTP.","Incorrecto: al contrario, suele ser la opción para legacy."]},
{w:2,q:"¿Cuál es el problema más serio de Shared Database?",o:["No garantiza consistencia","Acoplamiento al esquema: cambiar una tabla puede romper a todas las aplicaciones, además de contención y bloqueos","Es muy lenta por usar archivos","Requiere un broker de mensajes"],a:1,e:["Incorrecto: gracias a las transacciones ACID es su punto fuerte.","Correcto: todos dependen del mismo modelo interno de datos.","Incorrecto: no usa archivos.","Incorrecto: no requiere broker."]},
{w:2,q:"¿Qué falacia ilustra el RPC cuando trata una llamada remota como si fuera local?",o:["Que el software siempre es gratuito","Que todos los lenguajes son equivalentes","Que la red es confiable y con latencia cero (falacias de la computación distribuida)","Que los datos siempre caben en memoria"],a:2,e:["Incorrecto: no es una falacia de la computación distribuida.","Incorrecto: no es la falacia en cuestión.","Correcto: una llamada remota puede fallar, tardar o ejecutarse dos veces; esa no es una llamada local.","Incorrecto: no es la falacia que enseña el RPC."]},
{w:2,q:"¿Qué caracteriza a la mensajería (Messaging)?",o:["Llamadas síncronas en las que el cliente espera","Intercambio de archivos por carpeta","Acceso directo a las tablas del otro sistema","Comunicación asíncrona con store-and-forward: el canal guarda el mensaje hasta que el receptor puede procesarlo"],a:3,e:["Incorrecto: eso describe RPC.","Incorrecto: eso describe File Transfer.","Incorrecto: eso describe Shared Database.","Correcto: el canal desacopla en el tiempo al productor y al consumidor."]},
{w:2,q:"Un sistema legacy exporta cada noche las transacciones y otro las carga a primera hora. ¿Qué estilo es?",o:["File Transfer","Shared Database","RPC","Messaging en tiempo real"],a:0,e:["Correcto: intercambio diferido por archivos en un horario acordado.","Incorrecto: no comparten base de datos.","Incorrecto: no hay llamada síncrona.","Incorrecto: no hay un canal de mensajes ni tiempo real."]},
{w:2,q:"El criterio de oportunidad o latencia (timeliness) mide:",o:["Cuántas líneas de código tiene la integración","Qué tan rápido llega un cambio de un sistema al otro","Cuántos usuarios tiene el sistema","El costo de las licencias"],a:1,e:["Incorrecto: no es una medida de tamaño.","Correcto: File Transfer tiene latencia alta; RPC y Shared Database, muy baja.","Incorrecto: eso es carga o escala.","Incorrecto: es un criterio económico, no de oportunidad."]},
{w:2,q:"¿Qué es Apache Camel?",o:["Un sistema operativo para servidores","Una base de datos NoSQL","Un framework de integración que implementa los EIP mediante rutas y componentes","Un gestor de contenedores"],a:2,e:["Incorrecto: no es un sistema operativo.","Incorrecto: no almacena datos como una BD.","Correcto: define rutas from → to con endpoints, procesadores y componentes.","Incorrecto: no gestiona contenedores."]},
{w:2,q:"En el taller de transferencia de archivos con WSO2, ¿qué se implementa?",o:["Leer archivos de una carpeta de entrada, validarlos y transformarlos, y generar salida y errores","Una base de datos compartida entre tres sistemas","Una API GraphQL","Un clúster de Kubernetes"],a:0,e:["Correcto: es el patrón File Transfer con validación y manejo de errores.","Incorrecto: no es Shared Database.","Incorrecto: no hay GraphQL en este taller.","Incorrecto: no es parte del alcance."]},
{w:2,q:"Finanzas es un sistema legacy que solo exporta archivos. ¿Cómo integrarlo con Matrícula con menor riesgo?",o:["Conectarse directamente a su base de datos y escribir sus tablas","Usar File Transfer o un adaptador que publique mensajes, sin acceder directamente a su BD","Reemplazar Finanzas antes de integrar","Integrarlo mediante GraphQL desde el navegador"],a:1,e:["Incorrecto: es acoplarse a su esquema interno y arriesgar su integridad.","Correcto: se respeta su interfaz real y se aísla el legacy con un adaptador.","Incorrecto: no es realista ni necesario.","Incorrecto: el navegador no resuelve la integración de back-end."]},
{w:2,q:"¿Qué estilo expone directamente el modelo interno de datos a todos los participantes?",o:["Messaging","RPC","File Transfer","Shared Database"],a:3,e:["Incorrecto: Messaging intercambia mensajes con un formato acordado.","Incorrecto: RPC expone una interfaz, no las tablas.","Incorrecto: File Transfer expone un archivo acordado.","Correcto: todos acceden al mismo esquema, así que cualquier cambio los afecta."]},
{w:3,q:"¿Qué método HTTP es idempotente y reemplaza completamente un recurso?",o:["POST","PUT","PATCH","GET"],a:1,e:["Incorrecto: POST crea y normalmente no es idempotente.","Correcto: repetir el mismo PUT deja el recurso en el mismo estado.","Incorrecto: PATCH modifica parcialmente y no está garantizado como idempotente.","Incorrecto: GET consulta; no reemplaza nada."]},
{w:3,q:"Si se ejecuta dos veces POST /orders con el mismo cuerpo, lo más probable es que:",o:["Se creen dos pedidos distintos porque POST no es idempotente","Se cree un solo pedido","El servidor devuelva siempre 304","Se elimine el primer pedido"],a:0,e:["Correcto: por eso los POST se protegen con claves de idempotencia ante reintentos.","Incorrecto: eso ocurriría solo si el servidor aplicara una clave de idempotencia.","Incorrecto: 304 es de caché.","Incorrecto: POST no elimina."]},
{w:3,q:"¿Cuál es la respuesta correcta tras crear un pedido con POST /orders?",o:["200 OK con {\"error\": false}","204 No Content","201 Created, con el recurso o la cabecera Location","301 Moved Permanently"],a:2,e:["Incorrecto: funciona, pero 201 expresa con más precisión el resultado.","Incorrecto: sin contenido no informa el id del nuevo recurso.","Correcto: indica que el recurso fue creado y dónde está.","Incorrecto: es una redirección."]},
{w:3,q:"Un cliente intenta crear un pedido con un producto sin stock suficiente. ¿Qué respuesta es más adecuada?",o:["200 OK con {\"error\": true}","409 Conflict o 422 con un error de negocio (code, message, correlationId)","404 Not Found","500 Internal Server Error"],a:1,e:["Incorrecto: oculta el error y obliga al cliente a inspeccionar el cuerpo.","Correcto: es un error del consumidor por regla de negocio, con un error estructurado.","Incorrecto: el recurso no es inexistente.","Incorrecto: no es una falla del servidor."]},
{w:3,q:"¿Cuál de las siguientes URIs está mejor diseñada?",o:["/getOrder?id=O-9831","/executeSPCreateOrder","/database/orders","GET /orders/O-9831"],a:3,e:["Incorrecto: lleva el verbo get en la URL.","Incorrecto: expone un procedimiento almacenado interno.","Incorrecto: expone la implementación interna.","Correcto: sustantivo plural que identifica un recurso; el método expresa la intención."]},
{w:3,q:"¿Para qué sirve components/schemas en OpenAPI?",o:["Declarar modelos reutilizables que se referencian con $ref desde varias operaciones","Definir el servidor de producción","Almacenar los datos de los pedidos","Configurar OAuth2"],a:0,e:["Correcto: evita duplicar estructuras en cada endpoint.","Incorrecto: eso se hace en servers.","Incorrecto: OpenAPI describe la API, no almacena datos.","Incorrecto: OAuth2 se declara en securitySchemes y además está fuera del alcance del taller."]},
{w:3,q:"¿Qué ventaja obtiene el consumidor con un contrato OpenAPI antes de que el proveedor termine la implementación?",o:["Ninguna: debe esperar el backend","Puede leer el código fuente del proveedor","Puede construir y probar su integración en paralelo (mocks, Postman) y detectar ambigüedades temprano","Evita tener que manejar errores"],a:2,e:["Incorrecto: eso es lo que evita el enfoque Contract First.","Incorrecto: leer el código sería acoplarse a la implementación.","Correcto: trabajar contra un contrato acordado reduce la dependencia del cronograma del proveedor.","Incorrecto: los errores deben manejarse; el contrato los documenta."]},
{w:3,q:"¿Qué problema resuelve principalmente GraphQL frente a REST clásico?",o:["La falta de cifrado","Over-fetching y under-fetching: el cliente pide exactamente los campos que necesita en una consulta","La necesidad de usar HTTP","La imposibilidad de usar JSON"],a:1,e:["Incorrecto: el cifrado se resuelve con TLS en ambos casos.","Correcto: el cliente define la forma de la respuesta y evita llamadas extra o datos de más.","Incorrecto: GraphQL normalmente también va sobre HTTP.","Incorrecto: GraphQL usa JSON en sus respuestas."]},
{w:3,q:"gRPC se basa en:",o:["XML sobre SMTP","Archivos CSV por SFTP","Consultas sobre un único endpoint /graphql","Protocol Buffers sobre HTTP/2, con el contrato en un archivo .proto"],a:3,e:["Incorrecto: eso se parece más a SOAP clásico.","Incorrecto: eso es File Transfer.","Incorrecto: eso es GraphQL.","Correcto: serialización binaria tipada, multiplexación y streaming."]},
{w:3,q:"En el taller, ¿qué debe contener como mínimo el modelo de error?",o:["code y message (el correlationId es una buena práctica adicional)","Solo un booleano error","El stack trace completo del servidor","Únicamente el código HTTP"],a:0,e:["Correcto: es el mínimo del taller; el correlationId permite rastrear.","Incorrecto: es justamente el error ambiguo que debe evitarse.","Incorrecto: expone detalles internos y no es un contrato útil.","Incorrecto: el status ya está en HTTP; el cuerpo aporta el detalle."]}
];
let Q=[],qFilter=0;
function initQuiz(shuffle){
  Q=QS.map((q,i)=>({w:q.w,q:q.q,opts:q.o.map((t,j)=>({t,e:q.e[j],ok:j===q.a})),sel:null}));
  if(shuffle){shuf(Q);Q.forEach(q=>shuf(q.opts))}
  renderQuiz();
}
const WC={1:'var(--w1)',2:'var(--w2)',3:'var(--w3)'};
function renderQuiz(){
  const box=$('#qlist');box.innerHTML='';
  Q.forEach((q,qi)=>{
    const d=document.createElement('div');d.className='q';d.style.setProperty('--qc',WC[q.w]);d.dataset.w=q.w;
    d.style.display=(qFilter&&qFilter!==q.w)?'none':'';
    let h='<div class="qh">Semana '+q.w+' · Pregunta '+(qi+1)+'</div><div class="qt">'+esc(q.q)+'</div>';
    d.innerHTML=h;
    q.opts.forEach((o,oi)=>{
      const b=document.createElement('button');b.className='opt';
      const letter=String.fromCharCode(65+oi);
      let inner='<b>'+letter+'.</b> '+esc(o.t);
      if(q.sel!==null){
        b.disabled=true;
        if(o.ok)b.classList.add('ok');
        if(q.sel===oi&&!o.ok)b.classList.add('bad');
        inner+=(q.sel===oi?'<span class="you">'+(o.ok?'✔ tu respuesta':'✘ tu respuesta')+'</span>':'')+'<span class="ex">'+(o.ok?'✔ ':'✘ ')+esc(o.e)+'</span>';
      }
      b.innerHTML=inner;
      b.onclick=()=>{if(q.sel===null){q.sel=oi;renderQuiz();}};
      d.appendChild(b);
    });
    box.appendChild(d);
  });
  const ans=Q.filter(q=>q.sel!==null).length,ok=Q.filter(q=>q.sel!==null&&q.opts[q.sel].ok).length;
  $('#qscore').textContent=ok+' / '+Q.length+' correctas · '+ans+' respondidas';
  const fin=$('#qfinal');
  if(ans===Q.length){
    const pct=Math.round(ok/Q.length*100);
    const msg=pct>=90?'Excelente: dominas el material.':pct>=70?'Bien: repasa las preguntas falladas y el glosario.':pct>=50?'Aceptable: vuelve a las tablas comparativas y a la línea de tiempo.':'Necesitas repasar: empieza por la idea central de cada semana.';
    const bw=[1,2,3].map(w=>{const t=Q.filter(q=>q.w===w);return 'S'+w+': '+t.filter(q=>q.opts[q.sel].ok).length+'/'+t.length}).join(' · ');
    fin.innerHTML='<div class="final"><div class="big">'+pct+' %</div><p><b>'+ok+' de '+Q.length+'</b> correctas ('+bw+')</p><p>'+msg+'</p><button class="btn primary" id="qr2">↺ Reiniciar</button> <button class="btn" id="qs2">🔀 Barajar y reiniciar</button></div>';
    $('#qr2').onclick=()=>initQuiz(false);$('#qs2').onclick=()=>initQuiz(true);
  }else fin.innerHTML='';
}
$$('#qbar [data-f]').forEach(b=>b.onclick=()=>{qFilter=+b.dataset.f;$$('#qbar [data-f]').forEach(x=>x.classList.toggle('on',x===b));renderQuiz()});
$('#qshuf').onclick=()=>initQuiz(true);$('#qreset').onclick=()=>initQuiz(false);
initQuiz(false);

/* ---------- flashcards ---------- */
const FC=[
["¿Qué es el acoplamiento (coupling)?","El grado de dependencia entre componentes. Se busca que sea bajo para poder cambiar uno sin romper al otro."],
["¿Qué es la cohesión (cohesion)?","El grado en que los elementos de un módulo trabajan por un único propósito. Se busca alta."],
["¿Qué es Batch y cuál es su principal límite?","Procesar datos acumulados en bloque en ventanas programadas. Límite: latencia alta y datos desactualizados."],
["¿Qué problema resolvió la EAI?","El espagueti punto a punto: con un hub las conexiones pasan de n(n−1)/2 a n."],
["¿Cuál es la debilidad del hub-and-spoke?","El hub es punto único de fallo y cuello de botella; además suele haber lock-in."],
["¿Qué es SOA?","Un estilo donde la funcionalidad se expone como servicios con contratos (WSDL), reutilizables y componibles."],
["¿Qué hace un ESB?","Media entre servicios: enrutamiento, transformación, mediación de protocolos, seguridad y orquestación."],
["¿Qué es un microservicio?","Un servicio pequeño y autónomo, desplegable por separado, con su propia base de datos."],
["¿Qué es EDA y qué es un evento?","Arquitectura donde los componentes reaccionan a eventos. Evento = hecho pasado e inmutable (PedidoCreado)."],
["File Transfer: ventaja y desventaja","Ventaja: simple y desacoplado en el tiempo. Desventaja: latencia alta y manejo de formatos y errores diferidos."],
["Shared Database: ventaja y desventaja","Ventaja: datos consistentes e inmediatos. Desventaja: acoplamiento al esquema y contención."],
["RPC: ventaja y riesgo","Ventaja: respuesta inmediata y encapsulación. Riesgo: acoplamiento temporal y la ilusión de llamada local."],
["¿Qué ofrece Messaging?","Comunicación asíncrona y confiable con store-and-forward, a costa de más infraestructura y complejidad."],
["¿Qué es la idempotencia?","Repetir la operación deja el mismo estado final. GET, PUT y DELETE lo son; POST normalmente no."],
["PUT vs PATCH","PUT reemplaza el recurso completo; PATCH lo modifica parcialmente."],
["201 vs 204","201 Created: recurso creado (con Location). 204 No Content: éxito sin cuerpo, típico en DELETE."],
["409 vs 422","409 Conflict: choca con el estado actual. 422: la sintaxis es válida pero falla una validación o regla de negocio."],
["¿Qué es OpenAPI?","Un estándar para describir APIs HTTP en YAML o JSON: openapi, info, servers, paths, components/schemas."],
["¿Qué es Contract First?","Diseñar y validar el contrato antes de implementar: necesidad → contrato → validación → implementación."],
["REST vs GraphQL vs gRPC vs webhook","REST: recursos universales. GraphQL: el cliente pide los campos. gRPC: servicio a servicio eficiente. Webhook: notifica eventos a un tercero."]
];
let fcOrder=FC.map((_,i)=>i);
function renderFC(){
  const g=$('#fcg');g.innerHTML='';
  fcOrder.forEach(i=>{
    const d=document.createElement('div');d.className='fc';d.tabIndex=0;
    d.innerHTML='<div class="fci"><div class="fcf">'+esc(FC[i][0])+'</div><div class="fcb">'+esc(FC[i][1])+'</div></div>';
    d.onclick=()=>d.classList.toggle('flip');
    d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.classList.toggle('flip')}};
    g.appendChild(d);
  });
}
$('#fshuf').onclick=()=>{shuf(fcOrder);renderFC()};
$('#freset').onclick=()=>$$('.fc').forEach(f=>f.classList.remove('flip'));
renderFC();

/* ---------- casos ---------- */
const CS=[
{t:"Caso 1 · E-commerce: móvil, inventario y pagos",q:"Un e-commerce debe integrar su app móvil, su sistema interno de inventario y una plataforma externa de pagos. Elija REST, GraphQL o gRPC para cada integración y justifique.",a:"<ul><li><b>App móvil:</b> GraphQL (o REST con BFF). Las pantallas necesitan datos agregados; GraphQL evita over/under-fetching y ahorra ancho de banda. Trade-off: caché y control del costo de consultas.</li><li><b>Inventario interno:</b> gRPC. Es servicio a servicio, de alto volumen y baja latencia; el contrato .proto da tipado fuerte y hay streaming. Si el volumen es bajo, REST también sirve.</li><li><b>Pagos externos:</b> REST, más webhook para el resultado. Es un tercero y REST es el estándar; hay que usar claves de idempotencia y verificar la firma del webhook.</li></ul>"},
{t:"Caso 2 · Universidad: Matrícula, Finanzas y CRM",q:"Matrícula debe generar cobros en Finanzas (legacy sin API) y alimentar al CRM. ¿Qué estilo usa entre cada par y por qué descarta la base de datos compartida?",a:"<ul><li><b>Matrícula → Finanzas:</b> mensajería con el evento MatriculaConfirmada; como Finanzas es legacy, un adaptador o File Transfer batch actúa como puente. Se evita bloquear Matrícula si Finanzas está caída.</li><li><b>Consulta de deuda en tiempo real:</b> invocación síncrona (REST) con timeout.</li><li><b>→ CRM:</b> pub/sub por eventos; el CRM solo lee y tolera consistencia eventual.</li><li><b>Shared Database:</b> descartada porque los sistemas tienen dueños y ritmos distintos y un cambio de esquema rompería a los demás.</li></ul>"},
{t:"Caso 3 · Diseñe la API de citas médicas",q:"Proponga recursos, endpoints, métodos, códigos de éxito y dos errores para una API de citas médicas.",a:"<ul><li><b>Recursos:</b> Appointment, Patient, Doctor.</li><li><code>POST /appointments</code> → 201 (errores: 400 datos inválidos, 409 horario ocupado).</li><li><code>GET /appointments/{appointmentId}</code> → 200 (404 si no existe).</li><li><code>GET /appointments?patientId=P-10&amp;date=2026-11-02</code> → 200.</li><li><code>PATCH /appointments/{appointmentId}</code> con <code>{\"status\":\"CANCELLED\"}</code> → 200 (409 si ya fue atendida).</li><li><b>Modelo de error común:</b> <code>{code, message, correlationId}</code> con un schema Error reutilizable en components.</li></ul>"},
{t:"Caso 4 · Critique esta API",q:"Una API ofrece POST /createAppointment que responde siempre 200 con {\"error\": true} cuando el horario está ocupado, y GET /getAppointment?id=7. Identifique los problemas y corríjalos (ejercicio de exit ticket).",a:"<ul><li><b>Verbos en la URL:</b> usar <code>POST /appointments</code> y <code>GET /appointments/7</code>.</li><li><b>200 siempre:</b> un horario ocupado debe ser <code>409 Conflict</code> (o 422).</li><li><b>Error ambiguo:</b> reemplazar {\"error\": true} por <code>{\"code\":\"SLOT_TAKEN\",\"message\":\"...\",\"correlationId\":\"...\"}</code>.</li><li><b>Contrato:</b> documentarlo en OpenAPI con schemas reutilizables y ejemplos, antes de implementar.</li></ul>"},
{t:"Caso 5 · De 15 sistemas punto a punto hacia APIs y eventos",q:"Una empresa tiene 15 sistemas conectados punto a punto con archivos y quiere modernizarse. ¿Qué riesgos hay y qué ruta gradual propone?",a:"<ul><li><b>Problema:</b> hasta 105 conexiones (15·14/2), cada una con su formato y horario; cambios frágiles.</li><li><b>Ruta:</b> 1) inventariar interfaces y dueños; 2) exponer APIs con contrato OpenAPI para las capacidades más usadas, con adaptadores sobre legacy; 3) introducir eventos (broker) para flujos asíncronos y para sincronizar datos; 4) retirar gradualmente los archivos que ya no hagan falta.</li><li><b>Riesgos:</b> crear un ESB o hub que sea un nuevo cuello de botella, versionado de contratos, consistencia eventual y duplicados (diseñar con idempotencia).</li><li><b>Principio:</b> reducir acoplamiento sin reescribirlo todo de golpe; los estilos antiguos pueden coexistir.</li></ul>"}
];
$('#cases').innerHTML=CS.map(c=>'<details class="case"><summary>'+c.t+'</summary><p>'+c.q+'</p><details><summary style="color:var(--w1)">Ver respuesta modelo</summary><div class="ans">'+c.a+'</div></details></details>').join('');

/* ================= MODO EXPRESS + RESÚMENES ================= */
const TLDR={
 's1-int':["🔌 Hacer que sistemas distintos cooperen en un mismo proceso de negocio. Cuatro retos: la red falla, es lenta, las apps son distintas y el cambio es constante.","🌉 Analogía: construir puentes entre islas que hablan idiomas distintos."],
 's1-coup':["🔗 <b>Acoplamiento</b> = cuánto depende A de B. <b>Cohesión</b> = qué tan enfocado está un módulo. Meta: bajo acoplamiento + alta cohesión.","🧩 Analogía: piezas de LEGO; encajan por la interfaz, no por su interior."],
 's1-batch':["📦 Junta datos y los procesa de golpe en un horario fijo. Simple y eficiente, pero con latencia alta.","🚌 Analogía: un bus que sale a las 2 am; llevas todo junto pero llegas tarde."],
 's1-eai':["🕸️ → ⭐ Pasar del espagueti punto a punto a un hub central con adaptadores. Debilidad: el hub es punto único de fallo.","✈️ Analogía: aeropuerto hub; en vez de vuelos entre todas las ciudades, todas pasan por un centro."],
 's1-soa':["🧱 Capacidades de negocio expuestas como servicios con contrato (SOAP/WSDL), reutilizables y componibles.","🍽️ Analogía: el menú de un restaurante; pides por contrato, no entras a la cocina."],
 's1-esb':["🚍 Bus que enruta, transforma, adapta protocolos y asegura. ⚠️ SOA es un estilo; el ESB es solo una herramienta para implementarlo.","📮 Analogía: oficina de correos central que traduce y reparte."],
 's1-ms':["🔬 Servicios pequeños y autónomos, con su propia BD y despliegue independiente. Costo: complejidad operativa.","🏪 Analogía: un centro comercial de tiendas independientes vs. una sola megatienda."],
 's1-eda':["📣 Alguien publica un hecho (evento) y cada interesado reacciona. El productor no sabe quién escucha.","📻 Analogía: una radio emite sin saber quién la escucha."],
 's1-casos':["🔎 Para cada caso real pregúntate: ¿qué acoplamiento resolvía?, ¿qué límite trajo?, ¿qué estilo convive con él?"],
 's2-crit':["⚖️ No hay estilo «mejor». Elige según el criterio dominante (latencia, acoplamiento, confiabilidad…) y justifica el trade-off."],
 's2-ft':["📄 Un sistema deja un archivo y el otro lo toma después. <b>El archivo ES el contrato</b>: formato, ruta, horario y nombre. Apropiado cuando se tolera el procesamiento por lotes.","📬 Analogía: dejar una carta en un buzón."],
 's2-db':["🗄️ Todas las apps leen y escriben la misma BD. Datos consistentes, pero acoplamiento total al esquema.","📒 Analogía: un cuaderno compartido; si alguien cambia las columnas, todos se rompen."],
 's2-rpc':["📞 Llamar a una función remota como si fuera local (síncrono). Riesgo: la red falla y el servidor debe estar disponible.","☎️ Analogía: una llamada telefónica; ambos deben estar presentes."],
 's2-msg':["✉️ Se envían mensajes por un canal que los guarda hasta que el receptor pueda (store-and-forward). Asíncrono y confiable, pero más complejo.","💬 Analogía: WhatsApp; envías y sigues, llega cuando el otro tenga señal."],
 's2-tools':["🛠️ <b>Camel</b>: rutas from → to que implementan EIP. <b>WSO2</b>: flujo de transferencia de archivos en Integration Studio."],
 's2-role':["🎓 Matrícula, Finanzas y CRM: elige un estilo por cada par y justifícalo con los criterios. Resolución en <a href='practica.html'>Práctica de API</a>."],
 's2-lim':["🏚️ Los estilos viejos no desaparecen: en entornos legacy suelen ser la única opción y conviven con APIs y eventos."],
 's3-contrato':["📜 Una API es un <b>contrato</b>: qué puedes pedir, cómo, qué recibes y qué errores existen. Reemplaza el CSV por request HTTP + schema + status.","🍽️ Analogía: el cliente conoce el menú, no la cocina."],
 's3-evol':["🧬 SOAP → REST → GraphQL / gRPC. El webhook notifica eventos. Elige por <b>interacción</b>, no por moda.","🎯 REST: público · GraphQL: vistas variables · gRPC: servicio a servicio · Webhook: «avísame»."],
 's3-rest':["🧭 La URI es el <b>recurso</b> (sustantivo); el método es la <b>acción</b>. Nada de <code>/createOrder</code>.","📍 Analogía: la dirección de una casa (URI) y lo que le haces (método)."],
 's3-http':["🔁 <b>Seguro</b> = no cambia nada. <b>Idempotente</b> = repetir deja el mismo resultado. GET, PUT y DELETE lo son; POST no.","🛗 Analogía: PUT es poner el piso 5 en el ascensor (da igual repetirlo); POST es pedir un taxi cada vez."],
 's3-status':["🚦 2xx = bien · 4xx = fallaste tú (cliente) · 5xx = falló el servidor. Errores con <code>{code, message, correlationId}</code>."],
 's3-listas':["📑 <b>Path</b> = cuál recurso. <b>Query</b> = cómo filtrar. Agregar un campo opcional es compatible; renombrar o quitar rompe."],
 's3-openapi':["📐 Un YAML/JSON que describe tu API: <code>openapi, info, servers, paths, components/schemas</code>. Documenta, genera mocks y guía la implementación."],
 's3-taller':["🧪 El taller completo (pasos, juego, checklist, plantillas y V/F) está en la sección <a href='taller.html'>Taller (repaso)</a>."],
 's3-gql':["⚡ <b>GraphQL</b>: un endpoint, el cliente pide los campos. <b>gRPC</b>: binario y rápido con .proto. <b>Webhook</b>: te avisan cuando ocurre algo."]
};
Object.keys(TLDR).forEach(id=>{
  const a=document.getElementById(id);if(!a)return;const h=a.querySelector('h3');
  const d=document.createElement('div');d.className='tldr';
  d.innerHTML='<div><b>⚡ En corto:</b> '+TLDR[id][0]+'</div>'+(TLDR[id][1]?'<div class="tl2">'+TLDR[id][1]+'</div>':'')+'<button class="more" type="button">Ver explicación completa ▾</button>';
  h.after(d);
  d.querySelector('.more').onclick=e=>{a.classList.toggle('full');e.target.textContent=a.classList.contains('full')?'Ocultar explicación ▴':'Ver explicación completa ▾'};
});
function setMode(ex){
  document.body.classList.toggle('express',ex);ST.express=ex;saveST();
  $('#mode').textContent=ex?'⚡ Modo express: activado':'📖 Modo completo: activado';
  $('#mode2').textContent=ex?'⚡':'📖';
}
$('#mode').onclick=()=>setMode(!document.body.classList.contains('express'));
$('#mode2').onclick=()=>setMode(!document.body.classList.contains('express'));
setMode(ST.express!==false);

/* ================= TALLER ================= */
// dominios
const DOMS={
 pedidos:{n:'📦 Pedidos',prov:'Sistema de Gestión de Pedidos',cons:'App web de e-commerce',res:'Order, Customer, Product',base:'/orders',id:'orderId',q:'customerId',cr:'Registrar un pedido',pa:'Cambiar estado / cancelar',err:'PRODUCT_NOT_AVAILABLE',http:422},
 matriculas:{n:'🎓 Matrículas',prov:'Sistema Académico de Matrículas',cons:'Portal del estudiante',res:'Enrollment, Student, Course',base:'/enrollments',id:'enrollmentId',q:'studentId',cr:'Matricular a un estudiante',pa:'Retirar / cambiar paralelo',err:'COURSE_FULL',http:409},
 citas:{n:'🩺 Citas médicas',prov:'Sistema de Agenda Clínica',cons:'App de pacientes',res:'Appointment, Patient, Doctor',base:'/appointments',id:'appointmentId',q:'patientId',cr:'Agendar una cita',pa:'Reprogramar / cancelar',err:'SLOT_TAKEN',http:409},
 pagos:{n:'💳 Pagos',prov:'Servicio de Pagos',cons:'Checkout de la tienda',res:'Payment, Invoice, Customer',base:'/payments',id:'paymentId',q:'customerId',cr:'Registrar un pago',pa:'Actualizar / anular estado',err:'INSUFFICIENT_FUNDS',http:422},
 inventario:{n:'🏭 Inventario',prov:'Sistema de Inventario',cons:'Sistema de pedidos',res:'StockItem, Warehouse, Product',base:'/stock-items',id:'stockItemId',q:'warehouseId',cr:'Registrar un ítem de stock',pa:'Ajustar cantidad',err:'OUT_OF_STOCK',http:409}
};
function showDom(k){
  const d=DOMS[k];$$('#domchips .chip').forEach(c=>c.classList.toggle('on',c.dataset.k===k));
  $('#domout').innerHTML=`<div class="tcards"><div class="tcard"><div class="ic">🏢</div><h4>Proveedor</h4>${d.prov}</div><div class="tcard"><div class="ic">📱</div><h4>Consumidor</h4>${d.cons}</div><div class="tcard"><div class="ic">🧱</div><h4>Recursos</h4>${d.res}</div></div>
  <div class="tw"><table><thead><tr><th>Método</th><th>Endpoint</th><th>Para qué</th><th>Éxito</th><th>Errores</th></tr></thead><tbody>
  <tr><td><span class="pill m-post">POST</span></td><td><code>${d.base}</code></td><td>${d.cr}</td><td>201</td><td>400 · ${d.http} ${d.err}</td></tr>
  <tr><td><span class="pill m-get">GET</span></td><td><code>${d.base}/{${d.id}}</code></td><td>Consultar uno</td><td>200</td><td>404</td></tr>
  <tr><td><span class="pill m-get">GET</span></td><td><code>${d.base}?${d.q}=…</code></td><td>Buscar / filtrar</td><td>200</td><td>400</td></tr>
  <tr><td><span class="pill m-patch">PATCH</span></td><td><code>${d.base}/{${d.id}}</code></td><td>${d.pa}</td><td>200</td><td>404 · 409 · 422</td></tr></tbody></table></div>`;
}
Object.keys(DOMS).forEach(k=>{const b=document.createElement('button');b.className='chip';b.dataset.k=k;b.textContent=DOMS[k].n;b.onclick=()=>showDom(k);$('#domchips').appendChild(b)});
showDom('pedidos');

// 9 pasos
const PASOS=[
 ['🔍','Comprender el problema','Define el contexto de integración en <b>máximo 5 líneas</b>: qué necesidad de negocio resuelve la API.','La tienda online necesita registrar pedidos y consultar su estado sin conocer cómo funciona por dentro el sistema de pedidos.'],
 ['🏢','Identificar los sistemas','<b>Proveedor</b>: quién expone la API. <b>Consumidor</b>: quién la usa (al menos uno).','Proveedor: Sistema de Gestión de Pedidos · Consumidor: aplicación web de comercio electrónico.'],
 ['🧱','Identificar los recursos','Busca los <b>sustantivos</b> del dominio, no las acciones.','Order, Customer, Product → <code>/orders</code> y <code>/orders/{orderId}</code>'],
 ['🛣️','Diseñar las operaciones','Mínimo <b>3 endpoints</b> y <b>2 métodos</b>. Por cada uno: propósito, método, endpoint, parámetros, request body, éxito y errores.','<code>POST /orders</code> · <code>GET /orders/{orderId}</code> · <code>GET /orders?customerId=…</code> · <code>PATCH /orders/{orderId}</code>'],
 ['📨','Diseñar request y response','Nombres comprensibles, convención consistente, del dominio y sin detalles técnicos internos.','Request: <code>{customerId, items[{productId, quantity}]}</code> → Response: <code>{id, customerId, status, total}</code>'],
 ['🚨','Diseñar los errores','Una estructura común con <code>code</code> y <code>message</code>; el <code>correlationId</code> es buena práctica.','<code>{"code":"PRODUCT_NOT_AVAILABLE","message":"…","correlationId":"ab23f8b1-…"}</code>'],
 ['📐','Formalizar en OpenAPI','Estructura mínima: <code>openapi, info, servers, paths, components/schemas</code>. Reutiliza con <code>$ref</code> y añade <code>example</code>.','openapi.yaml con Order, CreateOrderRequest y Error en components/schemas.'],
 ['✅','Validar el contrato','Comprueba que la especificación sea válida y consistente <b>antes</b> de implementar. <span class="tag comp">Complemento</span> Puedes usar un editor de OpenAPI para ver los errores.','Sin errores de sintaxis, referencias $ref resueltas y ejemplos coherentes con los schemas.'],
 ['📮','Importar en Postman','Importa el OpenAPI, verifica que reconozca las operaciones, ajusta la colección y prepara al menos <b>3 requests</b>.','POST /orders · GET /orders/{orderId} · GET /orders?customerId=C-1024']
];
let pasoI=0;const seen=new Set([0]);
function showPaso(i){
  pasoI=i;seen.add(i);const p=PASOS[i];
  $$('#stp button').forEach((b,j)=>{b.classList.toggle('on',j===i);b.classList.toggle('seen',seen.has(j)&&j!==i)});
  $('#pdetail').innerHTML=`<h4>${p[0]} Paso ${i+1}: ${p[1]}</h4><div>${p[2]}</div><div class="ex">📌 <b>Ejemplo:</b> ${p[3]}</div><div class="nav2"><button class="btn" ${i===0?'disabled':''} id="pprev">← Anterior</button><button class="btn primary" ${i===PASOS.length-1?'disabled':''} id="pnext">Siguiente →</button></div>`;
  $('#pprev').onclick=()=>showPaso(i-1);$('#pnext').onclick=()=>showPaso(i+1);
}
PASOS.forEach((p,i)=>{const b=document.createElement('button');b.textContent=i+1;b.title=p[1];b.onclick=()=>showPaso(i);$('#stp').appendChild(b)});
showPaso(0);

// juego método + código
const GM=[
 ['Registrar un pedido nuevo',['POST'],[201]],
 ['Consultar el pedido O-9831 (existe)',['GET'],[200]],
 ['Consultar el pedido O-0000 (no existe)',['GET'],[404]],
 ['Cambiar solo el estado de un pedido a CANCELLED',['PATCH'],[200]],
 ['Crear un pedido con un producto sin stock suficiente',['POST'],[409,422]],
 ['Enviar un pedido sin customerId (request inválido)',['POST'],[400]],
 ['Eliminar un pedido',['DELETE'],[204]],
 ['Reemplazar por completo un pedido existente',['PUT'],[200,204]]
];
const METS=['GET','POST','PUT','PATCH','DELETE'],CODS=[200,201,204,400,404,409,422,500];
function renderGame(){
  $('#game').innerHTML=GM.map((g,i)=>`<div class="grow"><div>${i+1}. ${g[0]}</div>
  <select class="sel" id="gm${i}"><option value="">Método…</option>${METS.map(m=>`<option>${m}</option>`).join('')}</select>
  <select class="sel" id="gc${i}"><option value="">Código…</option>${CODS.map(c=>`<option>${c}</option>`).join('')}</select>
  <div class="res" id="gr${i}"></div></div>`).join('');
  $('#gscore').textContent='—';
}
$('#gcheck').onclick=()=>{
  let ok=0;
  GM.forEach((g,i)=>{
    const m=$('#gm'+i).value,c=+$('#gc'+i).value;const good=g[1].includes(m)&&g[2].includes(c);
    if(good)ok++;const r=$('#gr'+i);r.className='res '+(good?'ok':'bad');
    r.textContent=good?'✔ Correcto':'✘ '+g[1][0]+' · '+g[2].join(' o ');
  });
  $('#gscore').textContent=ok+' / '+GM.length+' correctas';
};
$('#greset').onclick=renderGame;renderGame();

// esqueleto openapi mínimo
const YMIN=`openapi: 3.0.3                # versión de la especificación
info:                           # qué es la API
  title: Orders API
  version: 1.0.0
  description: API para la gestión de pedidos
servers:                        # dónde vive
  - url: http://localhost:8080
paths:                          # endpoints y operaciones
components:                     # lo reutilizable
  schemas:                      # modelos (Order, Error...)
    Order:
      type: object
      properties:
        id:
          type: string
        customerId:
          type: string
        status:
          type: string`;
$('#yamlmin').innerHTML=hlYaml(YMIN);

// checklist
const CK=[
 ['🧭 Contexto',['Contexto del problema de integración','Sistema consumidor identificado','Sistema proveedor identificado','Recursos identificados']],
 ['🛣️ Diseño REST',['Mínimo 3 endpoints','Mínimo 2 métodos HTTP diferentes','Mínimo 1 path parameter','Mínimo 1 query parameter','Mínimo 1 request body']],
 ['📐 Contrato',['Modelos reutilizables mediante schemas','Responses exitosos','Mínimo 2 escenarios de error','Modelo común de error','Ejemplos de request','Ejemplos de response','Especificación OpenAPI válida']],
 ['📦 Entrega',['Colección Postman','Mínimo 3 requests preparados en Postman','README con decisiones de diseño']]
];
const ckTotal=CK.reduce((a,g)=>a+g[1].length,0);let ckDone=0;
$('#cklist').innerHTML=CK.map(g=>`<div class="ckg"><h4>${g[0]}</h4>${g[1].map(t=>`<label><input type="checkbox"><span>${t}</span></label>`).join('')}</div>`).join('');
function upCk(){ckDone=$$('#cklist input:checked').length;$('#ckbar').style.width=(ckDone/ckTotal*100)+'%';$('#cktxt').textContent=ckDone+' de '+ckTotal+' requisitos'+(ckDone===ckTotal?' · ¡Listo para entregar! 🎉':'')}
$$('#cklist input').forEach(i=>i.onchange=()=>{i.parentElement.classList.toggle('done',i.checked);upCk()});upCk();

// evaluación
const EV=[['A · Modelado REST',25,'Recursos, endpoints, métodos HTTP, path y query parameters'],['B · Contrato de datos',20,'Request/response, modelos, schemas, consistencia de nombres y tipos'],['C · Respuestas y errores',15,'Códigos HTTP, errores previstos y modelo común de error'],['D · Especificación OpenAPI',25,'Estructura, validez, claridad, completitud, reutilización y ejemplos'],['E · Postman y documentación',15,'Importación, tres requests, README y decisiones de diseño']];
$('#wbars').innerHTML=EV.map(e=>`<div class="wbar"><b>${e[0]}</b><div class="tr"><i style="width:${e[1]*4}%"></i></div><b>${e[1]} %</b><small>${e[2]}</small></div>`).join('')+'<p class="figcap">Se evalúa la calidad del diseño del contrato, no la implementación del servicio.</p>';

// verdadero o falso
const VF=[
 ['Es obligatorio implementar un backend funcional.',false,'El taller evalúa el diseño del contrato, no el servidor.'],
 ['Se requieren como mínimo 3 endpoints y 2 métodos HTTP diferentes.',true,'Es parte del alcance mínimo obligatorio.'],
 ['<code>POST /createOrder</code> es un buen diseño REST.',false,'Lleva un verbo en la URL; lo correcto es <code>POST /orders</code>.'],
 ['El modelo de error debe incluir al menos <code>code</code> y <code>message</code>.',true,'El <code>correlationId</code> es una buena práctica adicional.'],
 ['Puedo responder siempre 200 OK y poner el error en el body.',false,'No se debe usar siempre 200 sin importar el resultado.'],
 ['Los modelos principales se declaran en <code>components/schemas</code> y se reutilizan.',true,'Se evita duplicar estructuras en cada endpoint.'],
 ['OAuth2 y JWT son obligatorios en el taller.',false,'Están explícitamente fuera del alcance.'],
 ['El correlationId es una buena práctica adicional.',true,'Permite rastrear una petición entre sistemas.'],
 ['En Postman deben quedar preparados al menos 3 requests.',true,'Por ejemplo POST /orders, GET /orders/{orderId} y GET /orders?customerId=…'],
 ['El entregable puede ser <code>openapi.json</code> en lugar de <code>openapi.yaml</code>.',true,'Se acepta JSON, aunque se recomienda YAML por su legibilidad.']
];
let vfOk=0,vfAns=0;
function renderVF(){
  vfOk=0;vfAns=0;
  $('#vf').innerHTML=VF.map((v,i)=>`<div class="vfr" id="vf${i}"><div>${i+1}. ${v[0]}</div><div class="b"><button class="btn" data-i="${i}" data-a="1">Verdadero</button><button class="btn" data-i="${i}" data-a="0">Falso</button></div><div class="fb"></div></div>`).join('');
  $$('#vf .btn').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i,row=$('#vf'+i);if(row.dataset.done)return;row.dataset.done=1;
    const good=(b.dataset.a==='1')===VF[i][1];vfAns++;if(good)vfOk++;
    row.classList.add(good?'ok':'bad');row.querySelectorAll('.btn').forEach(x=>x.disabled=true);
    row.querySelector('.fb').innerHTML=(good?'✔ Correcto. ':'✘ Era '+(VF[i][1]?'verdadero':'falso')+'. ')+VF[i][2];
    $('#vfscore').textContent=vfOk+' / '+VF.length+(vfAns===VF.length?' · terminado':'');
  });
  $('#vfscore').textContent='0 / '+VF.length;
}
$('#vfreset').onclick=renderVF;renderVF();


/* ================= PÁGINAS DE CÓDIGO Y SEGURIDAD ================= */
$$('pre[data-yaml]').forEach(p=>{p.innerHTML=hlYaml(p.textContent.replace(/^\n+|\n+$/g,''))});

function copyText(t){
  try{navigator.clipboard.writeText(t)}catch(e){
    const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();
    try{document.execCommand('copy')}catch(_){}x.remove();
  }
}
(function(){
  const box=document.getElementById('fviewer');if(!box)return;
  const srcs=[...document.querySelectorAll('script[type="text/plain"][data-file]')];
  const tabs=document.createElement('div');tabs.className='ftabs';
  const bar=document.createElement('div');bar.className='fbar';
  const pre=document.createElement('pre');pre.className='code fview';
  box.appendChild(tabs);box.appendChild(bar);box.appendChild(pre);
  function show(i){
    const s=srcs[i],name=s.dataset.file,txt=s.textContent.replace(/^\n/,'');
    [...tabs.children].forEach((b,j)=>b.classList.toggle('on',j===i));
    pre.innerHTML=/\.ya?ml$/.test(name)?hlYaml(txt):esc(txt);
    bar.innerHTML='<span><b>'+esc(name)+'</b> <small>'+esc(s.dataset.desc||'')+'</small></span><span><button class="btn" id="fcopy">📋 Copiar</button> <button class="btn primary" id="fdl">⬇ Descargar</button></span>';
    document.getElementById('fcopy').onclick=e=>{copyText(txt);e.target.textContent='✔ Copiado';setTimeout(()=>{e.target.textContent='📋 Copiar'},1500)};
    document.getElementById('fdl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download=name.split('/').pop();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  }
  srcs.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.dataset.tab;b.onclick=()=>show(i);tabs.appendChild(b)});
  show(0);
})();

/* verdadero o falso genérico */
function makeVF(boxSel,scoreSel,resetSel,data){
  const box=document.querySelector(boxSel);if(!box)return;
  const score=document.querySelector(scoreSel);let ok=0,ans=0;
  function render(){
    ok=0;ans=0;
    box.innerHTML=data.map((v,i)=>'<div class="vfr"><div>'+(i+1)+'. '+v[0]+'</div><div class="b"><button class="btn" data-i="'+i+'" data-a="1">Verdadero</button><button class="btn" data-i="'+i+'" data-a="0">Falso</button></div><div class="fb"></div></div>').join('');
    box.querySelectorAll('.btn').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i,row=b.closest('.vfr');if(row.dataset.done)return;row.dataset.done=1;
      const good=(b.dataset.a==='1')===data[i][1];ans++;if(good)ok++;
      row.classList.add(good?'ok':'bad');row.querySelectorAll('.btn').forEach(x=>x.disabled=true);
      row.querySelector('.fb').innerHTML=(good?'✔ Correcto. ':'✘ Era '+(data[i][1]?'verdadero':'falso')+'. ')+data[i][2];
      score.textContent=ok+' / '+data.length+(ans===data.length?' · terminado':'');
    });
    score.textContent='0 / '+data.length;
  }
  const r=document.querySelector(resetSel);if(r)r.onclick=render;
  render();
}
makeVF('#vfs','#vfsscore','#vfsreset',[
 ['401 indica que la persona está autenticada pero no tiene permiso.',false,'Eso es <b>403</b>. 401 significa que falta autenticación o el token es inválido.'],
 ['Un JWT va cifrado, así que puedo guardar secretos en su payload.',false,'Normalmente solo está firmado: el payload se puede leer. No guardes secretos.'],
 ['Las credenciales y tokens deben viajar en la cabecera Authorization, no en la URL.',true,'Las URL quedan en logs, historiales y cabeceras Referer.'],
 ['HTTPS (TLS) protege la confidencialidad de lo que viaja entre cliente y servidor.',true,'Cifra el tráfico y evita que lo lean o alteren en el camino.'],
 ['Si el usuario está autenticado ya no hace falta comprobar si el pedido le pertenece.',false,'Es el riesgo BOLA (API1): hay que verificar la propiedad del objeto.'],
 ['Los errores deben incluir el stack trace para ayudar al consumidor.',false,'Revela detalles internos. Usa un mensaje genérico y un correlationId.'],
 ['El rate limiting ayuda a mitigar el consumo excesivo de recursos y la fuerza bruta (429).',true,'Limita las solicitudes por periodo y responde 429 con Retry-After.'],
 ['OAuth2 y JWT son requisitos obligatorios del taller de la Semana 3.',false,'Están fuera del alcance, aunque conviene conocerlos y mencionarlos.'],
 ['Client Credentials es el flujo típico entre servicios, sin una persona de por medio.',true,'El servicio se identifica con sus propias credenciales para obtener un token.'],
 ['Validar el body contra el schema también es una medida de seguridad.',true,'Rechazar datos mal formados reduce inyecciones y errores inesperados.']
]);

/* checklist de seguridad */
(function(){
  const list=document.getElementById('sklist');if(!list)return;
  const items=['Todo el tráfico va por HTTPS','Autenticación en cada petición (token en la cabecera Authorization)','Autorización por recurso: el usuario solo accede a sus objetos','Validación del body, los parámetros y los tipos contra el schema','Límite de tamaño del body y rate limiting (429)','Errores con el modelo común y sin detalles internos','correlationId en errores y logs, sin datos sensibles','CORS restringido a orígenes conocidos','Secretos fuera del código (variables de entorno)','Versiones antiguas y endpoints olvidados inventariados o retirados'];
  list.innerHTML='<div class="ckg">'+items.map(t=>'<label><input type="checkbox"><span>'+t+'</span></label>').join('')+'</div>';
  const up=()=>{const n=list.querySelectorAll('input:checked').length;document.getElementById('skbar').style.width=(n/items.length*100)+'%';document.getElementById('sktxt').textContent=n+' de '+items.length+' buenas prácticas'+(n===items.length?' · ¡excelente! 🔐':'')};
  list.querySelectorAll('input').forEach(i=>i.onchange=()=>{i.parentElement.classList.toggle('done',i.checked);up()});up();
})();

/* diagrama OAuth */
DG.oauth={w:700,h:230,alt:'Flujo OAuth 2.0 simplificado',boxes:[
 {id:'c',x:20,y:90,w:130,t:'Cliente\n(app)'},
 {id:'a',x:280,y:15,w:170,h:56,t:'Servidor de\nautorización',k:'mid'},
 {id:'p',x:520,y:90,w:160,t:'API de pedidos\n(Resource Server)'}],
 arrows:[{f:'c',t:'a',d:'h',l:'1 · credenciales'},{f:'a',t:'c',d:'h',dash:1,o:24,l:'2 · access_token'},{f:'c',t:'p',l:'3 · Bearer token'}]};
$$('.dg[data-d="oauth"]').forEach(el=>{el.innerHTML=drawDiagram(DG.oauth)});

/* quiz de selección múltiple del artículo */
(function(){
  const box=document.getElementById('art-quiz');if(!box)return;
  const Q=[
   ['¿Cuál fue el objetivo principal del artículo?',['Proponer una nueva ley de transparencia.','Mejorar la interoperabilidad en el control parlamentario.','Aplicar patrones de integración empresarial a procesos legislativos.','Crear un nuevo sistema operativo legislativo.'],[1,2],'El resumen habla de facilitar la interoperabilidad entre sistemas usando patrones de integración empresarial.'],
   ['¿Qué tecnología se utilizó para estructurar semánticamente los documentos legales?',['HTML5','Akoma Ntoso','LEOS','JSON-LD'],[1,2],'Akoma Ntoso es el estándar semántico; LEOS es el editor que trabaja con él.'],
   ['¿Cuál es la función del equipo Hellenic OCR?',['Transformar preguntas parlamentarias en datos abiertos.','Aplicar OCR y validar datos legislativos.','Diseñar leyes nuevas para Grecia.','Crear campañas políticas'],[0,1],'Es el equipo que trata la interoperabilidad de datos parlamentarios: OCR, validación y apertura de datos. No legisla ni hace campañas.'],
   ['¿Por qué se eligieron las preguntas parlamentarias como caso de estudio?',['Por su estructura simple y repetitiva.','Porque ya estaban en formato digital.','Porque son útiles para analizar la dinámica política','Porque no requieren procesamiento.'],[0,2],'Su formato regular facilita automatizar y sirven para estudiar la actividad política. Sí requieren procesamiento.'],
   ['¿Qué tipo de arquitectura se propuso en el artículo?',['Cliente-servidor tradicional.','Plataforma de integración como servicio (iPaaS)','Blockchain descentralizado.','Arquitectura basada en conectores.'],[1,3],'Plataforma de integración construida con conectores. Descarta cliente-servidor clásico y blockchain.'],
   ['¿Qué características tienen los conectores propuestos?',['Son reutilizables.','Pueden configurarse para distintos sistemas','Están escritos en COBOL','Implementan APIs REST con Node.js'],[0,1,3],'Reutilizables, configurables y hechos con Node.js. COBOL no aplica.'],
   ['¿Qué permite el uso del estándar Akoma Ntoso?',['Modelar documentos legislativos con semántica.','Crear páginas web visuales.','Vincular preguntas parlamentarias con otros textos legales.','Reemplazar todos los estándares legales existentes.'],[0,2],'Da significado a los documentos y permite enlazarlos. No es un estándar visual ni sustituye a todos los demás.'],
   ['¿Qué beneficios ofrece convertir preguntas parlamentarias en datos abiertos?',['Fomentar la transparencia','Facilitar análisis político y académico','Eliminar la necesidad de parlamentarios','Incrementar la rendición de cuentas'],[0,1,3],'Transparencia, análisis y rendición de cuentas. Nadie sustituye a los parlamentarios.'],
   ['¿Qué tecnologías se mencionan para implementar los conectores?',['Node.js','mongodb-queue','Oracle Forms','MongoDB'],[0,1,3],'Node.js, MongoDB y la cola mongodb-queue. Oracle Forms no aparece.'],
   ['¿Qué funcionalidades incluyen los conectores propuestos?',['Motor gráfico 3D','Procesador de mensajes','Despachador de mensajes','Receptor de mensajes'],[1,2,3],'Receptor, procesador y despachador de mensajes: el ciclo clásico de Messaging.']
  ];
  let ok;
  function render(){
    ok=0;
    box.innerHTML=Q.map((q,i)=>'<div class="vfr" data-i="'+i+'"><div><b>'+(i+1)+'.</b> '+q[0]+' <small>(elige '+q[2].length+')</small></div><div class="ckg">'+q[1].map((o,j)=>'<label><input type="checkbox" data-j="'+j+'"><span>'+o+'</span></label>').join('')+'</div><div class="b"><button class="btn primary">Comprobar</button></div><div class="fb"></div></div>').join('');
    box.querySelectorAll('.vfr').forEach(row=>{
      const i=+row.dataset.i,q=Q[i];
      row.querySelector('.btn').onclick=e=>{
        if(row.dataset.done)return;row.dataset.done=1;
        const boxes=[...row.querySelectorAll('input')];
        const sel=boxes.filter(b=>b.checked).map(b=>+b.dataset.j);
        const good=sel.length===q[2].length&&q[2].every(j=>sel.includes(j));
        if(good)ok++;
        boxes.forEach(b=>{b.disabled=true;const j=+b.dataset.j;b.parentElement.classList.toggle('done',q[2].includes(j))});
        row.classList.add(good?'ok':'bad');e.target.disabled=true;
        row.querySelector('.fb').innerHTML=(good?'✔ Correcto. ':'✘ Las correctas están resaltadas. ')+q[3];
        document.getElementById('art-score').textContent=ok+' / '+Q.length;
      };
    });
    document.getElementById('art-score').textContent='0 / '+Q.length;
  }
  document.getElementById('art-reset').onclick=render;
  render();
})();
