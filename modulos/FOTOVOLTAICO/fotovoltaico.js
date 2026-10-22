(function(){
  const $=id=>document.getElementById(id);
  const ubicaciones=[
    ['Madre de Dios','Tambopata','Laberinto',-12.71,-69.59],['Lima','Lima','Lurín',-12.27,-76.87],['Arequipa','Arequipa','Yura',-16.25,-71.68],['Cusco','La Convención','Echarati',-12.77,-72.58],['Puno','Puno','Acora',-15.98,-69.80],['Loreto','Maynas','Iquitos',-3.75,-73.25],['Piura','Piura','Catacaos',-5.27,-80.67],['Junín','Satipo','Mazamari',-11.33,-74.53],['Ucayali','Coronel Portillo','Callería',-8.38,-74.55],['Ayacucho','Huamanga','Vinchos',-13.24,-74.35]
  ];
  const estados=[...Array(162).fill('Operativo'),...Array(28).fill('Observado'),...Array(10).fill('Inactivo')];
  const beneficiarios=['Rosa Quispe Huamán','Víctor Mamani Condori','Juana Flores Quispe','Eusebio Cárdenas Rojas','María Sucari Choque'];
  const registros=estados.map((estado,i)=>{const u=ubicaciones[i%ubicaciones.length],n=i+1;return{codigo:`EAT-${String(n).padStart(6,'0')}`,beneficiario:beneficiarios[i%beneficiarios.length],dni:String(74200000+n),suministro:String(592643+n),estado,departamento:u[0],provincia:u[1],distrito:u[2],lat:u[3]+(((i*17)%19)-9)*.045,lng:u[4]+(((i*23)%19)-9)*.045,tecnologia:n%2?'Monocristalino':'Bifacial',capacidad:`${330+(n%4)*110} Wp`,inversor:`${1+n%3} kVA`,bateria:`${2+n%4} x 100 Ah`,instalacion:`${String(1+n%27).padStart(2,'0')}/${String(1+n%12).padStart(2,'0')}/${2021+n%5}`,mantenimiento:`${String(1+n%27).padStart(2,'0')}/${String(1+n%12).padStart(2,'0')}/2026`,sincronizacion:n%3?'Pendiente de sincronización':'Sincronizado',opex:estado==='Inactivo'?'Pago OPEX bloqueado':'Pago OPEX habilitado',observacion:estado==='Operativo'?'Equipo operativo sin incidencias críticas.':estado==='Observado'?'Equipo con observaciones pendientes de atención.':'Equipo inoperativo pendiente de intervención.'}});
  registros[0]=Object.assign(registros[0],{codigo:'EAT-000001',beneficiario:'Rosa Quispe Huamán',estado:'Operativo',departamento:'Madre de Dios',provincia:'Tambopata',distrito:'Laberinto',lat:-10.30562,lng:-75.72508,tecnologia:'Monocristalino',capacidad:'330 Wp',inversor:'1 kVA',bateria:'2 x 100 Ah',instalacion:'01/01/2021',mantenimiento:'01/01/2026',sincronizacion:'Pendiente de sincronización',opex:'Pago OPEX habilitado',observacion:'Equipo operativo sin incidencias críticas.'});
  registros.forEach((registro,indice)=>registro.codigo=`PFV-${String(indice+1).padStart(6,'0')}`);
  // Usuarios que trabajan con la aplicación móvil de campo.
  const personalMovil=[
    {id:'MOV-001',nombre:'María Quispe',zona:'Madre de Dios · Tambopata'},
    {id:'MOV-002',nombre:'Jorge Huamán',zona:'Cusco · La Convención'},
    {id:'MOV-003',nombre:'Rosa Mamani',zona:'Puno · Acora'},
    {id:'MOV-004',nombre:'Luis Cárdenas',zona:'Lima · Lurín'}
  ];
  const llaveGestiones='paulet-fotovoltaico-gestiones-v1';
  const escapar=valor=>String(valor??'').replace(/[&<>"']/g,caracter=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[caracter]));
  function guardarGestiones(){
    try{localStorage.setItem(llaveGestiones,JSON.stringify(registros.map(({codigo,estado,observacion,asignacion,observaciones})=>({codigo,estado,observacion,asignacion,observaciones}))))}catch(error){}
  }
  function cargarGestiones(){
    try{const guardado=JSON.parse(localStorage.getItem(llaveGestiones)||'[]');guardado.forEach(cambio=>{const registro=registros.find(item=>item.codigo===cambio.codigo);if(registro)Object.assign(registro,cambio)})}catch(error){}
  }
  cargarGestiones();
  let mapa,capaBase,clusters,capaDibujo,herramientaActiva=null,figuraTemporal=null,centroCirculo=null;
  let puntosDibujo=[];
  const bases={},estadosVisibles=new Set(['Operativo','Observado','Inactivo']),extras={};const extrasActivas=new Set();
  function filtrar(){const c=$('buscarCodigoEat').value.trim().toLowerCase();return registros.filter(r=>!c||r.codigo.toLowerCase().includes(c));}
  function resumen(datos){const factor=208145/200,n=e=>Math.round(datos.filter(x=>x.estado===e).length*factor);$('totalEat').textContent=Math.round(datos.length*factor).toLocaleString('es-PE');$('operativosEat').textContent=n('Operativo').toLocaleString('es-PE');$('observadosEat').textContent=n('Observado').toLocaleString('es-PE');$('inactivosEat').textContent=n('Inactivo').toLocaleString('es-PE');}
  function mostrarSeleccion(datos,tipo){
    $('resumenEat').hidden=true;$('fichaEat').hidden=false;$('tituloFichaEat').textContent=tipo;
    $('cerrarFichaEat').textContent='Limpiar';$('cerrarFichaEat').classList.add('limpiar-seleccion-fotovoltaico');$('cerrarFichaEat').setAttribute('aria-label','Limpiar selección geográfica');
    const conteo=estado=>datos.filter(r=>r.estado===estado).length;
    const resumen=`<div class="resumen-seleccion-fotovoltaico dato-ancho"><dt>Sistemas encontrados</dt><dd>${datos.length} sistemas · ${conteo('Operativo')} operativos · ${conteo('Observado')} observados · ${conteo('Inactivo')} inactivos</dd></div>`;
    const lista=datos.length?`<div class="lista-sistemas-seleccion-fotovoltaico dato-ancho">${datos.map(r=>`<button type="button" data-sistema-seleccionado="${r.codigo}"><span><b>${r.codigo}</b><small>${r.departamento} · ${r.provincia} · ${r.distrito}</small></span><em>${r.estado}</em></button>`).join('')}</div>`:`<p class="sin-resultados-seleccion-fotovoltaico">No se encontraron sistemas dentro del área seleccionada.</p>`;
    $('datosFichaEat').innerHTML=resumen+lista;$('detalleEat').scrollTo({top:0,behavior:'smooth'});
  }
  function abrirDetalleSistemaModal(r){
    if(r.estado==='Observado')return abrirFichaObservacionLectura(r);
    const campos=[['Código',r.codigo],['Estado',r.estado],['Departamento',r.departamento],['Provincia',r.provincia],['Distrito',r.distrito],['Coordenadas',`${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`],['Tecnología',r.tecnologia],['Capacidad',r.capacidad],['Inversor',r.inversor],['Batería',r.bateria],['Instalación',r.instalacion],['Último mantenimiento',r.mantenimiento],['Sincronización',r.sincronizacion],['OPEX',r.opex],['Observación',r.observacion]];
    $('sobrelineaHerramientaEat').textContent='INFORMACIÓN DEL SISTEMA';$('tituloHerramientaEat').textContent=r.codigo;$('descripcionHerramientaEat').textContent=`${r.departamento} · ${r.provincia} · ${r.distrito}`;
    $('contenidoHerramientaEat').innerHTML=`<dl class="detalle-sistema-modal-fotovoltaico">${campos.map(([etiqueta,valor])=>`<div${['Sincronización','OPEX','Observación'].includes(etiqueta)?' class="ancho"':''}><dt>${etiqueta}</dt><dd>${valor}</dd></div>`).join('')}</dl><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cerrar</button></div>`;
    $('modalHerramientaEat').hidden=false;
  }
  function abrirFichaObservacionLectura(r){
    const tieneObservacion=r.estado==='Observado'||(r.observaciones&&r.observaciones.length);
    const observaciones=(r.observaciones&&r.observaciones.length?r.observaciones:tieneObservacion?[{campo:'Estado',valor:r.estado,texto:r.observacion,fecha:'Registro de sistema',reportadoPor:'Supervisor FISE'}]:[]);
    const nota=tieneObservacion?r.observacion:'Sin observaciones registradas.';
    const datos=[['Código',r.codigo,'Sin observación'],['Estado',r.estado,nota],['Ubicación',`${r.departamento} / ${r.provincia} / ${r.distrito}`,tieneObservacion?'Validar ubicación en visita de campo':'Sin observación'],['Coordenadas',`${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`,'Sin observación'],['Tecnología',r.tecnologia,'Sin observación'],['Capacidad',r.capacidad,'Sin observación']];
    $('sobrelineaHerramientaEat').textContent='SOLO LECTURA · REGISTRO MÓVIL';
    $('tituloHerramientaEat').textContent=`Observaciones · ${r.codigo}`;
    $('descripcionHerramientaEat').textContent=`${r.beneficiario} · DNI ${r.dni}. Información reportada desde campo.`;
    const registros=observaciones.length?observaciones.map(item=>`<article><div><strong>${escapar(item.reportadoPor||'Supervisor FISE')}</strong><time>${escapar(item.fecha||'Registro de sistema')}</time></div><p>${escapar(item.texto)}</p></article>`).join(''):'<article><p>Este panel no tiene observaciones registradas.</p></article>';
    $('contenidoHerramientaEat').innerHTML=`<div class="ficha-lectura-observaciones"><section><h3>Datos registrados en sistema</h3><div class="campos-lectura-observacion">${datos.map(([campo,valor,observacion])=>`<article><small>${campo}</small><strong>${escapar(valor)}</strong><span>Observación</span><p>${escapar(observacion)}</p></article>`).join('')}</div></section><section class="registro-lectura-observacion"><h3>Observaciones reportadas</h3>${registros}</section><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cerrar</button></div></div>`;
    $('modalHerramientaEat').hidden=false;
  }
  function puntoEnPoligono(r,p){let dentro=false,x=r.lng,y=r.lat;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i].lng,yi=p[i].lat,xj=p[j].lng,yj=p[j].lat;if((yi>y)!==(yj>y)&&x<((xj-xi)*(y-yi))/(yj-yi)+xi)dentro=!dentro;}return dentro;}
  function limpiarDibujo(){puntosDibujo=[];centroCirculo=null;figuraTemporal=null;if(capaDibujo)capaDibujo.clearLayers();}
  function activarDibujo(nombre){
    herramientaActiva=herramientaActiva===nombre?null:nombre;limpiarDibujo();
    $('panelHerramientasEat').querySelectorAll('[data-tool]').forEach(b=>{if(['seleccionar','poligono','circulo'].includes(b.dataset.tool))b.classList.toggle('activo',b.dataset.tool===herramientaActiva)});
    const activo=['poligono','circulo'].includes(herramientaActiva);mapa.getContainer().style.cursor=activo?'crosshair':'';activo?mapa.doubleClickZoom.disable():mapa.doubleClickZoom.enable();
  }
  function clickDibujo(e){if(herramientaActiva==='poligono'){const u=puntosDibujo[puntosDibujo.length-1];if(u&&mapa.distance(u,e.latlng)<4)return;puntosDibujo.push(e.latlng);if(figuraTemporal)figuraTemporal.setLatLngs(puntosDibujo);else figuraTemporal=L.polyline(puntosDibujo,{color:'#4d8fb5',weight:3,lineCap:'round',lineJoin:'round'}).addTo(capaDibujo)}else if(herramientaActiva==='circulo'&&!centroCirculo){centroCirculo=e.latlng;figuraTemporal=L.circle(centroCirculo,{radius:40,color:'#7657c7',fillColor:'#9a7de0',fillOpacity:.18,weight:3}).addTo(capaDibujo)}}
  function moverDibujo(e){if(herramientaActiva==='poligono'&&puntosDibujo.length&&figuraTemporal)figuraTemporal.setLatLngs([...puntosDibujo,e.latlng]);else if(herramientaActiva==='circulo'&&centroCirculo&&figuraTemporal)figuraTemporal.setRadius(mapa.distance(centroCirculo,e.latlng));}
  function cerrarDibujo(e){
    if(herramientaActiva==='poligono'&&puntosDibujo.length>=3){const p=[...puntosDibujo];capaDibujo.clearLayers();L.polygon(p,{color:'#4d8fb5',fillColor:'#62b9d6',fillOpacity:.2,weight:3}).addTo(capaDibujo);mostrarSeleccion(filtrar().filter(r=>puntoEnPoligono(r,p)),'Seleccion por poligono');puntosDibujo=[];figuraTemporal=null}
    else if(herramientaActiva==='circulo'&&centroCirculo){const c=centroCirculo,radio=Math.max(40,mapa.distance(c,e.latlng));figuraTemporal.setRadius(radio);mostrarSeleccion(filtrar().filter(r=>mapa.distance(c,L.latLng(r.lat,r.lng))<=radio),'Seleccion por circulo');centroCirculo=null;figuraTemporal=null}
    if(e.originalEvent)L.DomEvent.stopPropagation(e.originalEvent);
  }
  function ficha(r){
    $('resumenEat').hidden=true;$('fichaEat').hidden=false;$('tituloFichaEat').textContent=r.codigo;
    const filas=[['Código',r.codigo],['Estado',r.estado],['Beneficiario',r.beneficiario],['DNI',r.dni],['Departamento',r.departamento],['Provincia',r.provincia],['Distrito',r.distrito],['Coordenadas',`${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`],['Tecnología',r.tecnologia],['Capacidad',r.capacidad],['Inversor',r.inversor],['Batería',r.bateria],['Instalación',r.instalacion],['Último mantenimiento',r.mantenimiento],['Sincronización',r.sincronizacion],['OPEX',r.opex],['Observación',r.observacion]];
    const detalle=filas.map(([a,b])=>`<div data-campo="${a==='Estado'?'estado':a==='Código'?'codigo':''}"${['Sincronización','OPEX','Observación','Asignado a'].includes(a)?' class="dato-ancho"':''}><dt>${a}</dt><dd>${escapar(b)}</dd></div>`).join('');
    const cantidadObservaciones=(r.observaciones||[]).length;
    const accionObservacion=`<div class="acciones-ficha-fotovoltaico dato-ancho"><small>SEGUIMIENTO DE CAMPO</small><button type="button" data-ver-observaciones>Observaciones${cantidadObservaciones?` (${cantidadObservaciones})`:''}</button></div>`;
    $('datosFichaEat').innerHTML=detalle+accionObservacion;
    $('expedienteCodigoEat').value=r.codigo;$('expedienteDistritoEat').value=r.distrito;$('notaExpedienteEat').textContent=`Sede vinculada a ${r.codigo}. Adjunte PDF del expediente y fotografías de soporte.`;$('detalleEat').scrollTo({top:0,behavior:'smooth'});
  }
  function actualizar(ajustar=true){const datos=filtrar();clusters.clearLayers();datos.filter(r=>estadosVisibles.has(r.estado)).forEach(r=>{const icon=L.divIcon({className:`marker-mcter ${r.estado.toLowerCase()}`,iconSize:[18,18],iconAnchor:[9,9]});const m=L.marker([r.lat,r.lng],{icon}).bindTooltip(`${r.codigo} · ${r.estado}`);m.on('click',()=>{$('cerrarFichaEat').textContent='×';$('cerrarFichaEat').classList.remove('limpiar-seleccion-fotovoltaico');$('cerrarFichaEat').setAttribute('aria-label','Cerrar ficha');ficha(r)});clusters.addLayer(m)});$('contadorEat').textContent=`${datos.length} sistemas visibles`;resumen(datos);actualizarExtras(datos);if(ajustar&&datos.length){const b=clusters.getBounds();if(b.isValid())mapa.fitBounds(b,{padding:[28,28],maxZoom:13})}}
  function actualizarExtras(datos){extras.beneficiarios.clearLayers();extras.hogares.clearLayers();datos.forEach((r,i)=>{L.circleMarker([r.lat+.018,r.lng+.014],{radius:5,color:'#fff',weight:2,fillColor:'#4389cf',fillOpacity:1}).bindTooltip(`Beneficiario · ${r.dni}`).addTo(extras.beneficiarios);if(r.estado==='Inactivo')L.marker([r.lat-.015,r.lng-.012],{icon:L.divIcon({className:'icono-capa-mcter icono-hogar-mcter',html:'⌂',iconSize:[26,26]})}).bindTooltip('Hogar sin electricidad').addTo(extras.hogares)});['beneficiarios','hogares'].forEach(k=>{if(extrasActivas.has(k)&&!mapa.hasLayer(extras[k]))mapa.addLayer(extras[k])})}
  function iniciar(){mapa=L.map('mapaEat',{zoomControl:false}).setView([-9.2,-75.2],5);L.control.zoom({position:'bottomleft'}).addTo(mapa);bases.osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap'});bases.topografico=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'&copy; OpenTopoMap'});capaBase=bases.osm.addTo(mapa);clusters=L.markerClusterGroup({maxClusterRadius:58,disableClusteringAtZoom:13,iconCreateFunction:c=>L.divIcon({html:`<span>${c.getChildCount()}</span>`,className:'cluster-mcter',iconSize:[46,46]})});mapa.addLayer(clusters);capaDibujo=L.layerGroup().addTo(mapa);mapa.on('click',clickDibujo);mapa.on('mousemove',moverDibujo);mapa.on('dblclick',cerrarDibujo);extras.beneficiarios=L.layerGroup();extras.hogares=L.layerGroup();fetch('../../geo/peru_departamentos_gadm41.json').then(r=>r.json()).then(g=>{extras.concesiones=L.geoJSON(g,{interactive:false,style:{color:'#735fc6',weight:2,fillColor:'#9278dc',fillOpacity:.09}});if(extrasActivas.has('concesiones'))extras.concesiones.addTo(mapa)});actualizar()}
  function cerrarFichaFotovoltaico(){
    limpiarDibujo();herramientaActiva=null;mapa.doubleClickZoom.enable();mapa.getContainer().style.cursor='';
    $('panelHerramientasEat').querySelectorAll('[data-tool="seleccionar"],[data-tool="poligono"],[data-tool="circulo"]').forEach(b=>b.classList.remove('activo'));
    $('cerrarFichaEat').textContent='×';$('cerrarFichaEat').classList.remove('limpiar-seleccion-fotovoltaico');
    $('fichaEat').hidden=true;$('resumenEat').hidden=false;
  }
  function restablecerFotovoltaico(){
    $('buscarCodigoEat').value='';
    estadosVisibles.clear();['Operativo','Observado','Inactivo'].forEach(estado=>estadosVisibles.add(estado));
    $('panelCapasEat').querySelectorAll('[data-estado]').forEach(control=>control.checked=true);
    cerrarFichaFotovoltaico();
    $('panelMapasEat').hidden=true;$('panelCapasEat').hidden=true;
    $('botonMapasEat').setAttribute('aria-expanded','false');$('botonCapasEat').setAttribute('aria-expanded','false');
    actualizar(true);
  }
  function alternar(panel,boton){const abrir=panel.hidden;[$('panelMapasEat'),$('panelCapasEat')].forEach(p=>p.hidden=true);[$('botonMapasEat'),$('botonCapasEat')].forEach(b=>b.setAttribute('aria-expanded','false'));panel.hidden=!abrir;boton.setAttribute('aria-expanded',String(abrir))}
  $('botonMapasEat').onclick=()=>alternar($('panelMapasEat'),$('botonMapasEat'));$('botonCapasEat').onclick=()=>alternar($('panelCapasEat'),$('botonCapasEat'));
  $('panelMapasEat').onchange=e=>{if(!e.target.matches('input[type=radio]'))return;mapa.removeLayer(capaBase);capaBase=bases[e.target.value].addTo(mapa);capaBase.bringToBack()};
  $('panelCapasEat').onchange=e=>{const estado=e.target.dataset.estado,capa=e.target.dataset.capa,base=e.target.dataset.base;if(base){mapa.removeLayer(capaBase);capaBase=bases[base].addTo(mapa);capaBase.bringToBack();const selectorBase=document.querySelector('[name="baseEat"][value="'+base+'"]');if(selectorBase)selectorBase.checked=true;return}if(estado){e.target.checked?estadosVisibles.add(estado):estadosVisibles.delete(estado);actualizar(false)}if(capa){e.target.checked?extrasActivas.add(capa):extrasActivas.delete(capa);const l=extras[capa];if(l)e.target.checked?l.addTo(mapa):mapa.removeLayer(l)}};
  $('filtrosEat').onsubmit=e=>{e.preventDefault();actualizar()};$('buscarCodigoEat').oninput=()=>actualizar(false);$('cerrarFichaEat').onclick=cerrarFichaFotovoltaico;$('restablecerFotovoltaico').onclick=restablecerFotovoltaico;
  const tarjetaObservados=$('observadosEat').closest('article');
  tarjetaObservados.classList.add('tarjeta-observados-consulta');tarjetaObservados.tabIndex=0;tarjetaObservados.setAttribute('role','button');tarjetaObservados.setAttribute('aria-label','Ver paneles observados');
  const verObservados=()=>mostrarSeleccion(registros.filter(item=>item.estado==='Observado'),'Paneles observados');
  tarjetaObservados.onclick=verObservados;tarjetaObservados.onkeydown=evento=>{if(evento.key==='Enter'||evento.key===' '){evento.preventDefault();verObservados()}};
  $('datosFichaEat').addEventListener('click',evento=>{const item=evento.target.closest('[data-sistema-seleccionado]');if(!item)return;const sistema=registros.find(r=>r.codigo===item.dataset.sistemaSeleccionado);if(sistema)abrirDetalleSistemaModal(sistema)});
  $('datosFichaEat').addEventListener('click',evento=>{if(!evento.target.closest('[data-ver-observaciones]'))return;const sistema=registros.find(item=>item.codigo===$('tituloFichaEat').textContent);if(sistema)abrirFichaObservacionLectura(sistema)});
  function posicionar(){
    if(innerWidth<=1100||$('tableroEat').classList.contains('panel-oculto'))return;
    const t=$('tableroEat').getBoundingClientRect(),m=$('mapaEat').parentElement.getBoundingClientRect(),p=$('detalleEat').getBoundingClientRect();
    $('alternarPanelEat').style.right='auto';
    $('alternarPanelEat').style.left=`${((m.right+p.left)/2)-t.left}px`;
  }
  let marcoAjusteMapa;
  function ajustarMapa(){
    posicionar();
    cancelAnimationFrame(marcoAjusteMapa);
    marcoAjusteMapa=requestAnimationFrame(()=>mapa.invalidateSize({pan:false}));
  }
  $('alternarPanelEat').onclick=()=>{const o=$('tableroEat').classList.toggle('panel-oculto');if(o){$('alternarPanelEat').style.removeProperty('left');$('alternarPanelEat').style.removeProperty('right')}else requestAnimationFrame(posicionar);$('alternarPanelEat').setAttribute('aria-expanded',String(!o));$('alternarPanelEat').setAttribute('aria-label',o?'Mostrar panel derecho':'Ocultar panel derecho');setTimeout(ajustarMapa,280)};window.addEventListener('resize',ajustarMapa);new ResizeObserver(ajustarMapa).observe($('tableroEat'));
  $('abrirExpedienteEat').onclick=()=>$('modalExpedienteEat').hidden=false;$('modalExpedienteEat').onclick=e=>{if(e.target.closest('[data-cerrar-expediente]'))$('modalExpedienteEat').hidden=true};$('registrarExpedienteEat').onclick=()=>{$('notaExpedienteEat').textContent='Expediente registrado correctamente en la maqueta.'};
  function abrirAsignacionPaneles(){
    $('sobrelineaHerramientaEat').textContent='DISTRIBUCIÓN DE TRABAJO';
    $('tituloHerramientaEat').textContent='Asignar paneles a personal móvil';
    $('descripcionHerramientaEat').textContent='Una persona puede recibir varios paneles. Ingrese un código por línea o separados por coma.';
    const opciones=personalMovil.map(persona=>`<option value="${persona.id}">${persona.nombre} — ${persona.zona}</option>`).join('');
    const selectorPaneles=registros.map(sistema=>`<label class="opcion-panel-asignacion" data-texto-panel="${sistema.codigo} ${sistema.distrito} ${sistema.estado}"><input type="checkbox" data-panel-asignable value="${sistema.codigo}"><span><b>${sistema.codigo}</b><small>${sistema.distrito} · ${sistema.estado}</small></span></label>`).join('');
    $('contenidoHerramientaEat').innerHTML=`<form class="contenido-proceso-mcter asignacion-multiple-pfv" data-form-asignacion-multiple-pfv><div class="bloque-proceso-mcter"><label>Personal móvil<select class="campo-modal-mcter" id="usuarioMultiplePfv" required><option value="">Seleccionar persona</option>${opciones}</select></label><label>Fecha límite<input class="campo-modal-mcter" id="fechaMultiplePfv" type="date"></label><div class="selector-paneles-asignacion ancho"><div><label for="buscarPanelMultiplePfv">Seleccionar paneles</label><strong id="conteoPanelesMultiplePfv">0 seleccionados</strong></div><input class="campo-modal-mcter" id="buscarPanelMultiplePfv" type="search" placeholder="Buscar por código, distrito o estado"><div class="lista-paneles-asignacion" id="listaPanelesMultiplePfv">${selectorPaneles}</div><small>Marca todos los paneles que deseas asignar a esta persona.</small></div><label class="ancho">Instrucción para campo<textarea class="campo-modal-mcter" id="instruccionMultiplePfv" required placeholder="Ej.: Verificar la instalación y registrar las evidencias."></textarea></label></div><p class="nota-modal-mcter" id="resultadoAsignacionMultiplePfv">Las asignaciones quedarán disponibles para el personal en la aplicación móvil.</p><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cancelar</button><button type="submit">Asignar paneles</button></div></form>`;
    $('modalHerramientaEat').hidden=false;
  }
  $('asignarPanelesEat').onclick=abrirAsignacionPaneles;
  $('modalHerramientaEat').addEventListener('input',evento=>{
    if(evento.target.id==='buscarPanelMultiplePfv'){const busqueda=evento.target.value.trim().toLowerCase();document.querySelectorAll('.opcion-panel-asignacion').forEach(opcion=>opcion.hidden=!!busqueda&&!opcion.dataset.textoPanel.toLowerCase().includes(busqueda))}
    if(evento.target.matches('[data-panel-asignable]')){$('conteoPanelesMultiplePfv').textContent=`${document.querySelectorAll('[data-panel-asignable]:checked').length} seleccionados`}
  });
  function abrirHerramienta(tipo,coordenada){
    const modal=$('modalHerramientaEat'),contenido=$('contenidoHerramientaEat');
    modal.classList.remove('modal-reporte-eat');
    if(tipo==='ficef'){
      $('sobrelineaHerramientaEat').textContent='PROCESAMIENTO DGER';$('tituloHerramientaEat').textContent='Procesamiento de data de instalaciones DGER';$('descripcionHerramientaEat').textContent='Cargue el Excel de resoluciones DGER para calcular automáticamente la morosidad, el IGV y los cargos RER de la transferencia.';
      contenido.innerHTML=`<div class="contenido-proceso-mcter"><div class="bloque-proceso-mcter"><div class="cabecera-bloque-eat"><h3>Carga del Excel Anexo 4</h3><span>SEAL Arequipa</span></div><div class="archivo-mcter"><label>Archivo Excel Anexo 4<input id="archivoFicefEat" type="file" accept=".xlsx,.xls"></label><button class="boton-proceso-mcter" data-validar-ficef type="button">Validar contra FICEF</button></div><p class="nota-modal-mcter">Base de referencia: Sociedad Eléctrica del Sur Oeste S.A. - SEAL · Arequipa · FICEF.</p></div><div class="bloque-proceso-mcter"><div class="cabecera-bloque-eat"><h3>Resultados de validación</h3><span>Automático</span></div><div class="resultados-mcter"><div><span>Registros</span><strong id="ficefRegistrosEat">0</strong></div><div><span>Coinciden</span><strong id="ficefCoincidenEat">0</strong></div><div><span>Observados</span><strong id="ficefObservadosEat">0</strong></div><div><span>Diferencia</span><strong id="ficefDiferenciaEat">S/ 0.00</strong></div></div><dl class="detalle-validacion-eat"><div><dt>Empresa</dt><dd>SEAL Arequipa</dd></div><div><dt>Regla de validación</dt><dd>Suministro + Código sistema + Total S/</dd></div><div><dt>Estado</dt><dd id="ficefEstadoEat">Pendiente de carga</dd></div><div><dt>Detalle de registros</dt><dd>Checklist</dd></div></dl><p class="nota-modal-mcter" id="notaFicefEat">Carga el Excel para visualizar la validación automática.<br>El resultado permite sustentar el reembolso y observar diferencias antes de enviar.</p></div><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cerrar</button><button type="button">Generar sustento</button></div></div>`;
    }else{
      const c=coordenada||{lat:-12.03932,lng:-71.98242};$('sobrelineaHerramientaEat').textContent='NUEVO PUNTO';$('tituloHerramientaEat').textContent='Nuevo punto fotovoltaico';$('descripcionHerramientaEat').textContent='Selecciona un punto en el mapa para capturar la latitud y longitud. Luego completa la ficha técnica y envíala a un usuario para supervisión.';
      contenido.innerHTML=`<form class="contenido-proceso-mcter"><div class="form-punto-mcter"><label>Latitud<input class="campo-modal-mcter" value="${c.lat.toFixed(5)}" readonly></label><label>Longitud<input class="campo-modal-mcter" value="${c.lng.toFixed(5)}" readonly></label><label>Tecnología<select class="campo-modal-mcter"><option>Bifacial</option><option>Monocristalino</option></select></label><label>Capacidad<input class="campo-modal-mcter" value="550 Wp"></label><label>Inversor<input class="campo-modal-mcter" value="3 kVA"></label><label>Batería<input class="campo-modal-mcter" value="5 x 100 Ah"></label><label>Instalación<input class="campo-modal-mcter" type="date" value="2025-12-12"></label><label>Último mantenimiento<input class="campo-modal-mcter" type="date" value="2026-06-10"></label><label>Sincronización<select class="campo-modal-mcter"><option>Sincronizado</option><option>Pendiente</option></select></label><label>OPEX<select class="campo-modal-mcter"><option>Pago OPEX habilitado</option><option>Pago bloqueado</option></select></label><label class="ancho">Observación<textarea class="campo-modal-mcter">Equipo operativo sin incidencias críticas.</textarea></label><label class="ancho">Enviar a usuario<select class="campo-modal-mcter"><option>Seleccionar usuario supervisor</option><option>Supervisor regional</option><option>Coordinador técnico</option></select></label><label class="ancho">Estado de envío<input class="campo-modal-mcter" value="Pendiente de envío" readonly></label></div><p class="nota-modal-mcter">Punto capturado. Completa la información técnica y envíala a un usuario supervisor.</p><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Guardar borrador</button><button type="submit">Enviar a supervisión</button></div></form>`;
    }
    modal.hidden=false;
  }
  $('abrirHerramientasEat').onclick=()=>{const a=$('panelHerramientasEat').hidden;$('panelHerramientasEat').hidden=!a;$('abrirHerramientasEat').setAttribute('aria-expanded',String(a))};
  $('panelHerramientasEat').onclick=e=>{const b=e.target.closest('[data-tool]');if(!b)return;const t=b.dataset.tool;if(t==='carrusel'){$('panelHerramientasEat').classList.remove('ampliado');$('panelHerramientasEat').querySelectorAll('.pagina-herramientas-mcter').forEach(p=>p.classList.toggle('activa'));return}if(t==='ampliar'){$('panelHerramientasEat').classList.toggle('ampliado');return}if(t==='ficef'){abrirHerramienta('ficef');return}if(t==='nuevo-punto'){$('panelHerramientasEat').hidden=true;const contenedor=mapa.getContainer();contenedor.style.cursor='crosshair';const capturar=evento=>{evento.preventDefault();evento.stopPropagation();contenedor.style.cursor='';abrirHerramienta('punto',mapa.mouseEventToLatLng(evento))};contenedor.addEventListener('click',capturar,{once:true,capture:true});return}if(['seleccionar','poligono','circulo'].includes(t)){activarDibujo(t);return}b.classList.toggle('activo')};
  document.querySelector('.generar-reporte-mcter').onclick=()=>{$('sobrelineaHerramientaEat').textContent='EXPORTACIÓN DE DATOS';$('tituloHerramientaEat').textContent='Reporte Fotovoltaico';$('descripcionHerramientaEat').textContent='Seleccione el formato del reporte del inventario visible.';$('contenidoHerramientaEat').innerHTML=`<div class="contenido-proceso-mcter"><fieldset class="formatos-exportacion-eat"><legend>Selecciona el formato</legend><label><input type="radio" name="formatoReporteEat" value="pdf" checked><span><b>PDF</b><small>Informe listo para imprimir</small></span></label><label><input type="radio" name="formatoReporteEat" value="csv"><span><b>CSV</b><small>Datos tabulares compatibles</small></span></label><label><input type="radio" name="formatoReporteEat" value="xlsx"><span><b>XLSX</b><small>Libro de Microsoft Excel</small></span></label></fieldset><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cancelar</button><button type="button" data-generar-reporte-eat>Generar reporte</button></div></div>`;$('modalHerramientaEat').hidden=false;};
  $('modalHerramientaEat').onclick=e=>{if(e.target.closest('[data-cerrar-herramienta]'))$('modalHerramientaEat').hidden=true;if(e.target.closest('[data-validar-ficef]')){const a=$('archivoFicefEat');if(!a.files.length){a.click();return}$('ficefRegistrosEat').textContent='148';$('ficefCoincidenEat').textContent='139';$('ficefObservadosEat').textContent='9';$('ficefDiferenciaEat').textContent='S/ 1,284.50';$('ficefEstadoEat').textContent='Validación completada';$('notaFicefEat').textContent='Validación automática completada. Revise los registros observados antes de generar el sustento.'}if(e.target.closest('[data-generar-reporte-eat]')){const formato=document.querySelector('[name="formatoReporteEat"]:checked').value;if(formato==='pdf')window.print();else{const enlace=document.createElement('a');enlace.href=URL.createObjectURL(new Blob(['\ufeffCódigo,Estado\nPFV-000001,Operativo'],{type:'text/csv;charset=utf-8'}));enlace.download=`reporte-fotovoltaico.${formato==='xlsx'?'xlsx':'csv'}`;enlace.click();setTimeout(()=>URL.revokeObjectURL(enlace.href),0);}}};
  $('modalHerramientaEat').onsubmit=e=>{e.preventDefault();$('modalHerramientaEat').hidden=true};
  const barraHerramientasEat=$('herramientasEat'),panelHerramientasEat=$('panelHerramientasEat');panelHerramientasEat.addEventListener('click',evento=>{const mover=evento.target.closest('[data-tool="mover"]');if(!mover)return;barraHerramientasEat.classList.add('movible');mover.classList.add('activo');});let arrastre=null;const moverPanelHerramientas=evento=>{if(!arrastre)return;panelHerramientasEat.style.setProperty('left',`${Math.max(8,Math.min(innerWidth-panelHerramientasEat.offsetWidth-8,evento.clientX-arrastre.x))}px`,'important');panelHerramientasEat.style.setProperty('top',`${Math.max(8,Math.min(innerHeight-panelHerramientasEat.offsetHeight-8,evento.clientY-arrastre.y))}px`,'important')};const finalizarArrastreHerramientas=()=>{arrastre=null;window.removeEventListener('pointermove',moverPanelHerramientas);window.removeEventListener('pointerup',finalizarArrastreHerramientas)};panelHerramientasEat.addEventListener('pointerdown',evento=>{if(!barraHerramientasEat.classList.contains('movible'))return;const rect=panelHerramientasEat.getBoundingClientRect();panelHerramientasEat.style.setProperty('position','fixed','important');panelHerramientasEat.style.setProperty('right','auto','important');panelHerramientasEat.style.setProperty('left',`${rect.left}px`,'important');panelHerramientasEat.style.setProperty('top',`${rect.top}px`,'important');arrastre={x:evento.clientX-rect.left,y:evento.clientY-rect.top};window.addEventListener('pointermove',moverPanelHerramientas);window.addEventListener('pointerup',finalizarArrastreHerramientas);});
  const botonDger=document.querySelector('[data-tool="ficef"]');if(botonDger){botonDger.title='DGER';botonDger.setAttribute('aria-label','Procesar instalaciones DGER');botonDger.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v5h5M10 13h5M10 17h5"/></svg>';}
  $('panelHerramientasEat').addEventListener('click',evento=>{if(!evento.target.closest('[data-tool="ficef"]'))return;setTimeout(()=>{$('contenidoHerramientaEat').innerHTML=`<div class="contenido-proceso-mcter"><div class="bloque-proceso-mcter"><div class="cabecera-bloque-eat"><h3>Importación de datos</h3><span>Excel</span></div><div class="archivo-mcter"><label>Archivo Excel de resoluciones DGER<input id="archivoDgerPfv" type="file" accept=".xlsx,.xls"></label><button class="boton-proceso-mcter" type="button">Procesar archivo</button></div></div><div class="bloque-proceso-mcter"><div class="cabecera-bloque-eat"><h3>Resultados del procesamiento</h3><span>Automático</span></div><div class="resultados-mcter"><div><span>Morosidad</span><strong>S/ 0</strong></div><div><span>IGV (18%)</span><strong>S/ 0</strong></div><div><span>Cargo RER</span><strong>S/ 0</strong></div><div><span>Registros</span><strong>0</strong></div></div><h3>Detalle de instalaciones procesadas · DGER</h3><p class="nota-modal-mcter">Seleccione y procese un archivo para visualizar el detalle.<br>Selecciona un archivo Excel para iniciar el procesamiento.</p></div><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cerrar</button><button type="button">Exportar reporte técnico</button></div></div>`;},0)});
  function abrirRegistroObservacion(sistema){
    $('sobrelineaHerramientaEat').textContent='SEGUIMIENTO DE CAMPO';
    $('tituloHerramientaEat').textContent=`Ficha de observación · ${sistema.codigo}`;
    $('descripcionHerramientaEat').textContent='Complete la incidencia con los mismos datos que revisa el personal en la aplicación móvil.';
    const historial=(sistema.observaciones||[]).slice(0,3).map(item=>`<li><div><b>${escapar(item.reportadoPor||'Supervisor FISE')}</b><time>${escapar(item.fecha)}</time></div><em>${escapar(item.categoria||'Incidencia general')} · ${escapar(item.prioridad)}</em><span>${escapar(item.texto)}</span>${item.evidencia?`<small>Adjunto: ${escapar(item.evidencia)}</small>`:''}</li>`).join('')||'<li class="sin-observaciones-pfv">Aún no hay observaciones registradas.</li>';
    $('contenidoHerramientaEat').innerHTML=`<form class="contenido-proceso-mcter ficha-observacion-pfv" data-form-observacion-pfv><section class="bloque-proceso-mcter resumen-observacion-pfv"><div class="cabecera-bloque-eat"><h3>Datos del sistema</h3><span>${escapar(sistema.estado)}</span></div><div class="datos-observacion-pfv"><div><small>Beneficiario</small><strong>${escapar(sistema.beneficiario)}</strong><span>DNI ${escapar(sistema.dni)}</span></div><div><small>Ubicación</small><strong>${escapar(sistema.distrito)}</strong><span>${escapar(sistema.provincia)} · ${escapar(sistema.departamento)}</span></div><div><small>Equipo</small><strong>${escapar(sistema.tecnologia)} · ${escapar(sistema.capacidad)}</strong><span>${sistema.lat.toFixed(5)}, ${sistema.lng.toFixed(5)}</span></div></div></section><section class="bloque-proceso-mcter"><div class="cabecera-bloque-eat"><h3>Registro de incidencia</h3><span>Campo</span></div><div class="form-observacion-pfv"><label>Nombre de quien registra<input class="campo-modal-mcter" id="responsableObservacionPfv" value="Supervisor regional FISE" required></label><label>Fecha y hora<input class="campo-modal-mcter" id="fechaObservacionPfv" type="datetime-local" value="${new Date().toISOString().slice(0,16)}" required></label><label>Tipo de observación<select class="campo-modal-mcter" id="categoriaObservacionPfv"><option>Incidencia técnica</option><option>Verificación de campo</option><option>Dato por corregir</option><option>Mantenimiento requerido</option></select></label><label>Prioridad<select class="campo-modal-mcter" id="prioridadObservacionPfv"><option>Media</option><option>Alta</option><option>Baja</option></select></label><label class="ancho">Detalle de la observación<textarea class="campo-modal-mcter" id="textoObservacionPfv" required placeholder="Describa lo encontrado, la acción requerida y cualquier dato que deba validar el personal móvil."></textarea></label><label class="ancho">Evidencia de campo <input class="campo-modal-mcter" id="evidenciaObservacionPfv" type="file" accept="image/*,.pdf" multiple><small>Fotos o PDF de respaldo (opcional).</small></label></div><label class="marcar-observado-pfv"><input id="marcarObservadoPfv" type="checkbox" checked> Marcar el sistema como observado</label></section><section class="bloque-proceso-mcter historial-observaciones-pfv"><div class="cabecera-bloque-eat"><h3>Historial de observaciones</h3><span>${(sistema.observaciones||[]).length}</span></div><ul>${historial}</ul></section><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cancelar</button><button type="submit">Guardar ficha</button></div></form>`;
    $('modalHerramientaEat').hidden=false;
  }
  function abrirAsignacionMovil(sistema){
    const asignacion=sistema.asignacion||{};
    $('sobrelineaHerramientaEat').textContent='ASIGNACIÓN DE CAMPO';
    $('tituloHerramientaEat').textContent=`Asignar ${sistema.codigo}`;
    $('descripcionHerramientaEat').textContent='La tarea quedará disponible para la persona seleccionada en la aplicación móvil.';
    const opciones=personalMovil.map(persona=>`<option value="${persona.id}"${persona.id===asignacion.usuarioId?' selected':''}>${persona.nombre} — ${persona.zona}</option>`).join('');
    $('contenidoHerramientaEat').innerHTML=`<form class="contenido-proceso-mcter" data-form-asignacion-pfv><div class="bloque-proceso-mcter"><label>Personal móvil<select class="campo-modal-mcter" id="usuarioAsignadoPfv" required><option value="">Seleccionar persona</option>${opciones}</select></label><label>Fecha límite<input class="campo-modal-mcter" id="fechaAsignacionPfv" type="date" value="${asignacion.fechaLimite||''}"></label><label class="ancho">Instrucción para campo<textarea class="campo-modal-mcter" id="instruccionAsignacionPfv" required placeholder="Indique qué debe revisar la persona en campo.">${escapar(asignacion.instruccion||sistema.observacion||'')}</textarea></label></div><p class="nota-modal-mcter">Al guardar, el panel quedará asignado y con estado de atención pendiente en el móvil.</p><div class="acciones-proceso-mcter"><button type="button" data-cerrar-herramienta>Cancelar</button><button type="submit">Asignar panel</button></div></form>`;
    $('modalHerramientaEat').hidden=false;
  }
  $('datosFichaEat').addEventListener('click',evento=>{
    const sistema=registros.find(item=>item.codigo===$('tituloFichaEat').textContent);
    if(!sistema)return;
    if(evento.target.closest('[data-registrar-observacion]'))abrirRegistroObservacion(sistema);
    if(evento.target.closest('[data-asignar-movil]'))abrirAsignacionMovil(sistema);
  });
  $('modalHerramientaEat').addEventListener('submit',evento=>{
    const sistema=registros.find(item=>item.codigo===$('tituloFichaEat').textContent);
    if(!sistema)return;
    if(evento.target.matches('[data-form-observacion-pfv]')){
      evento.preventDefault();
      const texto=$('textoObservacionPfv').value.trim();
      if(!texto)return;
      const fecha=$('fechaObservacionPfv').value?new Date($('fechaObservacionPfv').value).toLocaleString('es-PE'):new Date().toLocaleString('es-PE');
      const evidencia=[...$('evidenciaObservacionPfv').files].map(archivo=>archivo.name).join(', ');
      sistema.observaciones=[{texto,prioridad:$('prioridadObservacionPfv').value,categoria:$('categoriaObservacionPfv').value,reportadoPor:$('responsableObservacionPfv').value.trim(),fecha,evidencia} ,...(sistema.observaciones||[])];
      sistema.observacion=texto;
      if($('marcarObservadoPfv').checked){sistema.estado='Observado';sistema.opex='Pago OPEX habilitado'}
      guardarGestiones();ficha(sistema);actualizar(false);$('modalHerramientaEat').hidden=true;
    }
    if(evento.target.matches('[data-form-asignacion-pfv]')){
      evento.preventDefault();
      const usuarioId=$('usuarioAsignadoPfv').value,instruccion=$('instruccionAsignacionPfv').value.trim();
      if(!usuarioId||!instruccion)return;
      sistema.asignacion={usuarioId,instruccion,fechaLimite:$('fechaAsignacionPfv').value,estado:'Pendiente de atención'};
      guardarGestiones();ficha(sistema);$('modalHerramientaEat').hidden=true;
    }
  },true);
  $('modalHerramientaEat').addEventListener('submit',evento=>{
    if(!evento.target.matches('[data-form-asignacion-multiple-pfv]'))return;
    evento.preventDefault();evento.stopPropagation();
    const usuarioId=$('usuarioMultiplePfv').value,instruccion=$('instruccionMultiplePfv').value.trim();
    const codigos=[...document.querySelectorAll('[data-panel-asignable]:checked')].map(control=>control.value);
    if(!usuarioId||!instruccion||!codigos.length)return;
    const encontrados=codigos.map(codigo=>registros.find(item=>item.codigo===codigo)).filter(Boolean);
    const noEncontrados=codigos.filter(codigo=>!registros.some(item=>item.codigo===codigo));
    encontrados.forEach(sistema=>sistema.asignacion={usuarioId,instruccion,fechaLimite:$('fechaMultiplePfv').value,estado:'Pendiente de atención'});
    guardarGestiones();
    const persona=personalMovil.find(item=>item.id===usuarioId);
    $('resultadoAsignacionMultiplePfv').textContent=`${encontrados.length} panel(es) asignados a ${persona.nombre}.${noEncontrados.length?` No encontrados: ${noEncontrados.join(', ')}.`:''}`;
  },true);
  document.addEventListener('keydown',evento=>{if(evento.key!=='Escape')return;evento.preventDefault();cerrarFichaFotovoltaico();$('panelMapasEat').hidden=true;$('panelCapasEat').hidden=true;document.querySelectorAll('dialog[open]').forEach(modal=>modal.close());mapa.setView([-9.2,-75.2],5)});
  iniciar();bases.satelite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Imágenes &copy; Esri'});posicionar();
})();
