(()=>{'use strict';
  const $=id=>document.getElementById(id);
  const talleres=[
    {nombre:'GNV Lima Norte',distrito:'Los Olivos',direccion:'Av. Universitaria 5280',lat:-11.9757,lng:-77.0716,distancia:'1.2 km'},
    {nombre:'Taller Gas & Green',distrito:'Independencia',direccion:'Av. Túpac Amaru 1490',lat:-11.9917,lng:-77.0542,distancia:'2.4 km'},
    {nombre:'EcoMotor GNV',distrito:'Comas',direccion:'Av. Metropolitana 811',lat:-11.9438,lng:-77.0581,distancia:'3.1 km'},
    {nombre:'Conversión Lima Este',distrito:'San Juan de Lurigancho',direccion:'Av. Próceres 2245',lat:-12.0105,lng:-76.9985,distancia:'4.6 km'},
    {nombre:'Estación GNV Centro',distrito:'Lima',direccion:'Av. Colonial 1640',lat:-12.0492,lng:-77.0673,distancia:'5.0 km'}
  ];
  const cuotas=Array.from({length:12},(_,i)=>({numero:i+1,fecha:new Date(2026,3+i,15),monto:385,pagada:i<6}));
  let mapa,capaTalleres,mapaInicio,marcadoresInicio=[];
  function mostrarPortal(){ $('vistaAcceso').hidden=true;$('portalCliente').hidden=false;mostrarVista('inicioCliente') }
  function mostrarVista(id){document.querySelectorAll('.vista-cliente').forEach(v=>{v.hidden=v.id!==id;v.classList.toggle('activa',v.id===id)});document.querySelectorAll('[data-vista]').forEach(b=>b.classList.toggle('activo',b.dataset.vista===id));if(id==='inicioCliente')setTimeout(iniciarMapaInicio,60);if(id==='talleresCliente')setTimeout(iniciarMapa,60)}
  function renderPagos(){$('listaPagosCliente').innerHTML=cuotas.map(c=>`<article class="fila-pago ${c.pagada?'':'pendiente'}"><div><span>Cuota ${String(c.numero).padStart(2,'0')}</span><small>${c.fecha.toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'})}</small></div><strong>S/ ${c.monto.toFixed(2)}</strong><em>${c.pagada?'Pagada':'Pendiente'}</em></article>`).join('')}
  function renderTalleres(){const texto=$('buscarTallerCliente').value.toLowerCase(),distrito=$('distritoTallerCliente').value;const lista=talleres.filter(t=>(!texto||`${t.nombre} ${t.distrito} ${t.direccion}`.toLowerCase().includes(texto))&&(!distrito||t.distrito===distrito));$('totalTalleresCliente').textContent=`${lista.length} guardados`;$('tarjetasTalleresCliente').innerHTML=lista.map(t=>`<article class="taller-card"><div><span>${t.nombre}</span><em>★ Guardado</em><small>${t.distancia} · ${t.distrito}<br>${t.direccion}</small></div><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${t.lat},${t.lng}">Abrir mapa</a></article>`).join('');if(capaTalleres){capaTalleres.clearLayers();lista.forEach(t=>L.marker([t.lat,t.lng]).bindPopup(`<b>${t.nombre}</b><br>Taller guardado<br>${t.direccion}`).addTo(capaTalleres));if(lista.length)mapa.fitBounds(lista.map(t=>[t.lat,t.lng]),{padding:[35,35],maxZoom:13})}}
  function iniciarMapa(){if(mapa){mapa.invalidateSize();renderTalleres();return}if(typeof L==='undefined')return;mapa=L.map('mapaCliente',{zoomControl:true}).setView([-12.02,-77.04],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapa);capaTalleres=L.layerGroup().addTo(mapa);renderTalleres()}
  function iniciarMapaInicio(){
    if(mapaInicio){mapaInicio.invalidateSize();return}if(typeof L==='undefined')return;
    const ubicacion=[-12.0464,-77.0428];mapaInicio=L.map('mapaInicioCliente',{zoomControl:true}).setView(ubicacion,12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapaInicio);
    L.circleMarker(ubicacion,{radius:9,color:'#fff',weight:3,fillColor:'#e5484d',fillOpacity:1}).bindPopup('<b>Tu ubicación referencial</b><br>Lima').addTo(mapaInicio);
    marcadoresInicio=talleres.map(t=>L.marker([t.lat,t.lng]).bindPopup(`<b>${t.nombre}</b><br>${t.distrito}<br>${t.direccion}`).addTo(mapaInicio));
    mapaInicio.fitBounds([ubicacion,...talleres.map(t=>[t.lat,t.lng])],{padding:[45,45],maxZoom:12});
  }
  function renderSliderTalleres(){
    $('contadorSliderTalleres').textContent=String(talleres.length);
    $('listaTalleresInicio').innerHTML=talleres.map((t,i)=>`<article data-taller-inicio="${i}" tabindex="0"><span>${i+1}</span><div><strong>${t.nombre}</strong><small>${t.distancia} · ${t.distrito}</small><p>${t.direccion}</p></div><b>›</b></article>`).join('');
    document.querySelectorAll('[data-taller-inicio]').forEach(item=>item.onclick=()=>{const i=Number(item.dataset.tallerInicio),t=talleres[i];mapaInicio?.flyTo([t.lat,t.lng],15,{duration:.6});marcadoresInicio[i]?.openPopup();document.querySelectorAll('[data-taller-inicio]').forEach(x=>x.classList.toggle('activo',x===item))});
  }
  $('formularioCliente').onsubmit=e=>{e.preventDefault();const ok=$('usuarioCliente').value.trim().toLowerCase()==='cliente'&&$('claveCliente').value==='123456';$('errorAcceso').textContent=ok?'':'Usuario o contraseña incorrectos.';if(ok)mostrarPortal()};
  $('verClaveCliente').onclick=()=>{$('claveCliente').type=$('claveCliente').type==='password'?'text':'password'};
  $('cerrarSesionCliente').onclick=()=>{$('portalCliente').hidden=true;$('vistaAcceso').hidden=false;$('claveCliente').value=''};
  document.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>mostrarVista(b.dataset.vista));document.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>mostrarVista(b.dataset.ir));
  $('buscarTallerCliente').oninput=renderTalleres;$('distritoTallerCliente').onchange=renderTalleres;
  $('tallerAnteriorCliente').onclick=()=>$('listaTalleresInicio').scrollBy({top:-110,left:-280,behavior:'smooth'});$('tallerSiguienteCliente').onclick=()=>$('listaTalleresInicio').scrollBy({top:110,left:280,behavior:'smooth'});
  renderPagos();renderSliderTalleres();
})();
