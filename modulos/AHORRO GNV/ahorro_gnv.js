(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const coloresEstado={Liquidada:'#4db77e',Certificada:'#557fe1','En proceso':'#e69a13'};
  let registros=[],visibles=[],mapa,baseActual,grupoMarcadores,grupoTalleresGnv,grupoGrifosGnv,capaCalor,mapaCalorGraficasGnv,capaRecargasGnv,modoTematico=false,paginaMorosidad=1,paginaReporteRecargas=1,seleccionActual=null,observadorMapaGnv;
  let herramientaActiva=null,puntosHerramienta=[],centroCirculo=null,capaHerramienta=null,guiaHerramienta=null,arrastreHerramientas=null;
  let firmaDibujadaGnv=false,trazandoFirmaGnv=false,firmaInformeDibujadaGnv=false,trazandoFirmaInformeGnv=false;
  let correlativoInformeGnv=45,documentosGeneradosGnv=18,destinatarioMensajeActual=null;
  const reglaBonoPredeterminada={activa:true,diasRiesgo:21,diasPerdida:30,departamento:'',provincia:'',actualizado:'Configuración predeterminada'};
  let reglaBonoGnv={...reglaBonoPredeterminada};
  const conversionesSeleccionadas=new Map();
  const bases={};
  const grifosGnv=[
    {id:'GRF-001',nombre:'Grifo Aviación GNV',direccion:'Av. Aviación 1550',distrito:'San Borja',provincia:'Lima',departamento:'Lima',lat:-12.0947,lng:-77.0018,nivel:'alerta',estado:'Alerta de tanqueo',placas:[{placa:'C6R-214',detalle:'Historial de tanqueo en otras ubicaciones · alerta activa'},{placa:'A8K-392',detalle:'Historial de tanqueo en otras ubicaciones · alerta activa'},{placa:'B7P-102',detalle:'Historial de tanqueo en otras ubicaciones · alerta activa'}]},
    {id:'GRF-005',nombre:'Grifo Arequipa Norte',direccion:'Av. Aviación 602',distrito:'Cerro Colorado',provincia:'Arequipa',departamento:'Arequipa',lat:-16.3668,lng:-71.5745,nivel:'normal',estado:'Tanqueo normal',placas:[]},
    {id:'GRF-007',nombre:'Grifo Trujillo Norte',direccion:'Av. Nicolás de Piérola 1260',distrito:'Trujillo',provincia:'Trujillo',departamento:'La Libertad',lat:-8.0905,lng:-79.0288,nivel:'alerta',estado:'Alerta de tanqueo',placas:[{placa:'T3N-628',detalle:'Tanqueos reiterados en tres ubicaciones durante 24 horas'}]},
    {id:'GRF-009',nombre:'Grifo Cusco Sur',direccion:'Av. de la Cultura 2950',distrito:'San Sebastián',provincia:'Cusco',departamento:'Cusco',lat:-13.5358,lng:-71.9324,nivel:'observacion',estado:'En observación',placas:[{placa:'X8C-521',detalle:'Cambio inusual del punto habitual de recarga'}]}
  ];
  const morosos=[
    {placa:'ABC-123',beneficiario:'Carlos Quispe Huamaní',taller:'AutoGas Norte S.A.C.',cuotas:3,monto:840,estado:'Atrasado'},
    {placa:'DEF-456',beneficiario:'María Torres Flores',taller:'GNV Conversiones E.I.R.L.',cuotas:1,monto:280,estado:'Con mora'},
    {placa:'GHI-789',beneficiario:'Luis Paredes Vega',taller:'Taller Central GNV S.A.C.',cuotas:0,monto:0,estado:'Al día'},
    {placa:'JKL-012',beneficiario:'Rosa Mamani Ccori',taller:'Mecánica Trujillo GNV',cuotas:5,monto:1400,estado:'Atrasado'},
    {placa:'MNO-345',beneficiario:'Jorge Salazar Ríos',taller:'AGN Ingenieros',cuotas:2,monto:560,estado:'Con mora'},
    {placa:'PQR-678',beneficiario:'Elena Vargas Soto',taller:'Rufigas VES',cuotas:4,monto:1120,estado:'Atrasado'},
    {placa:'STU-901',beneficiario:'Miguel Condori Luna',taller:'Autogas Jireh',cuotas:0,monto:0,estado:'Al día'},
    {placa:'VWX-234',beneficiario:'Ana López Peña',taller:'GM Conversiones',cuotas:2,monto:560,estado:'Con mora'},
    {placa:'YZA-567',beneficiario:'Pedro Huamán Díaz',taller:'Corporación Perú Gas',cuotas:5,monto:1400,estado:'Atrasado'},
    {placa:'BCD-890',beneficiario:'Lucía Ramos Poma',taller:'Taller Sur GNV',cuotas:0,monto:0,estado:'Al día'}
  ];
  morosos.forEach((x,i)=>{x.mensajeEnviado=x.cuotas>=1;x.ultimoEnvio=x.mensajeEnviado?`${i%2?'Hoy':'Ayer'} · ${String(8+i).padStart(2,'0')}:15`:'';x.canalEnvio=x.mensajeEnviado?'SMS + correo':''});

  const unicos=(campo,lista=registros)=>[...new Set(lista.map(x=>x[campo]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
  const regionDeDepartamento=departamento=>({Lima:'Costa',Callao:'Costa',Ica:'Costa','La Libertad':'Costa',Piura:'Costa','Áncash':'Costa',Arequipa:'Costa',Cusco:'Sierra','Junín':'Sierra',Cajamarca:'Sierra'}[departamento]||'Selva');
  function llenarSelect(id,valores,etiqueta){
    const select=$(id),valor=select.value;
    select.replaceChildren(new Option(etiqueta,''));
    valores.forEach(item=>select.add(new Option(item,item)));
    if([...select.options].some(opcion=>opcion.value===valor))select.value=valor;
  }
  function prepararFiltros(){
    llenarSelect('filtroDepartamento',unicos('departamento'),'Todos');
    const departamento=$('filtroDepartamento').value;
    const listaProvincia=registros.filter(x=>!departamento||x.departamento===departamento);
    llenarSelect('filtroProvincia',unicos('provincia',listaProvincia),'Todas');
    const provincia=$('filtroProvincia').value;
    const listaDistrito=listaProvincia.filter(x=>!provincia||x.provincia===provincia);
    llenarSelect('filtroDistrito',unicos('distrito',listaDistrito),'Todos');
    llenarSelect('filtroCombustible',unicos('combustible'),'Todos');
    llenarSelect('filtroCilindros',unicos('cilindros').map(String),'Todos');
  }
  function obtenerVisibles(){
    const desde=$('filtroDesde').value,hasta=$('filtroHasta').value;
    const estados=[...document.querySelectorAll('[data-estado]:checked')].map(x=>x.dataset.estado);
    return registros.filter(x=>
      (!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value)&&
      (!$('filtroProvincia').value||x.provincia===$('filtroProvincia').value)&&
      (!$('filtroDistrito').value||x.distrito===$('filtroDistrito').value)&&
      (!$('filtroCombustible').value||x.combustible===$('filtroCombustible').value)&&
      (!$('filtroCilindros').value||String(x.cilindros)===$('filtroCilindros').value)&&
      (!desde||x.fecha>=desde)&&(!hasta||x.fecha<=hasta)&&estados.includes(x.estado)
    );
  }
  function iconoRegistro(registro){
    return L.divIcon({className:'marcador-conversion',html:`<span style="--color:${coloresEstado[registro.estado]}"></span>`,iconSize:[18,18],iconAnchor:[9,9]});
  }
  function iconoCluster(cluster){
    return L.divIcon({className:'cluster-gnv',html:`<div>${cluster.getChildCount()}</div>`,iconSize:[48,48]});
  }
  function iconoTallerGnv(){
    return L.divIcon({className:'marcador-taller-gnv',html:'<span><svg viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(2 3)" d="M14.7 6.4 18 3.1a4.5 4.5 0 0 1-5.8 5.7l-6.7 6.7a2.2 2.2 0 1 1-3.1-3.1l6.7-6.7A4.5 4.5 0 0 1 14.9 0l-3.3 3.3 3.1 3.1Z"/></svg></span>',iconSize:[44,52],iconAnchor:[22,52],tooltipAnchor:[0,-43]});
  }
  function datosTalleresGnv(){
    const grupos=new Map();
    registros.filter(x=>x.distrito!=='Cerro Colorado').forEach(x=>{const clave=x.taller,actual=grupos.get(clave)||{operador:x.taller,distrito:x.distrito,provincia:x.provincia,departamento:x.departamento,lat:0,lng:0,cantidad:0,monto:0,desembolsado:0};actual.lat+=x.lat;actual.lng+=x.lng;actual.cantidad++;actual.monto+=Number(x.monto||x.desembolsado||0);actual.desembolsado+=Number(x.desembolsado||0);grupos.set(clave,actual)});
    const talleres=[...grupos.values()].sort((a,b)=>b.cantidad-a.cantidad).slice(0,5).map((x,i)=>({...x,codigo:`TALL-${String(x.departamento||'PER').slice(0,3).toUpperCase()}-${String(i+1).padStart(2,'0')}`,lat:x.lat/x.cantidad,lng:x.lng/x.cantidad,conversiones:x.cantidad}));
    talleres.unshift({codigo:'TALL-ARQ-02',operador:'GNV Red Andina',distrito:'Cerro Colorado',provincia:'Arequipa',departamento:'Arequipa',lat:-16.37,lng:-71.56,conversiones:101,monto:413090,desembolsado:359388});
    return talleres;
  }
  function exportarTallerGnv(taller){
    const cabeceras=['Código','Operador','Distrito','Conversiones 2026','Monto de conversión','Desembolsado'],fila=[taller.codigo,taller.operador,taller.distrito,taller.conversiones,taller.monto,taller.desembolsado];
    descargarBlob('\uFEFF'+[cabeceras,fila].map(f=>f.map(v=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\r\n'),'text/csv;charset=utf-8',`${taller.codigo.toLowerCase()}-informacion.csv`);
  }
  function abrirReporteDesdeTallerGnv(taller){
    abrirReporteRecargasGnv();$('reporteDepartamentoGnv').value=taller.departamento;actualizarProvinciasReporteRecargasGnv();
    if([...$('reporteProvinciaGnv').options].some(x=>x.value===taller.provincia))$('reporteProvinciaGnv').value=taller.provincia;
    paginaReporteRecargas=1;renderReporteRecargasGnv();
  }
  function mostrarDetalleTallerGnv(taller){
    seleccionActual=null;$('resumenGeneralGnv').hidden=true;
    const detalle=$('detalleConversionGnv');detalle.hidden=false;detalle.className='detalle-conversion-gnv detalle-taller-gnv';
    const campos=[['Código',taller.codigo],['Operador',taller.operador],['Distrito',taller.distrito],['Conversiones 2026',taller.conversiones.toLocaleString('es-PE')],['Monto de conversión',`S/ ${taller.monto.toLocaleString('es-PE')}`],['Desembolsado',`S/ ${taller.desembolsado.toLocaleString('es-PE')}`]];
    detalle.innerHTML=`<button type="button">Limpiar</button><small>TALLER AUTORIZADO</small><h3>Información del taller</h3><div class="detalle-grid-gnv">${campos.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div><div class="acciones-detalle-taller-gnv"><button type="button" data-accion-taller="exportar">Exportar información</button><button type="button" data-accion-taller="recargas">Reporte de recargas</button></div>`;
    detalle.querySelector(':scope > button').onclick=restaurarResumen;detalle.querySelector('[data-accion-taller="exportar"]').onclick=()=>exportarTallerGnv(taller);detalle.querySelector('[data-accion-taller="recargas"]').onclick=()=>abrirReporteDesdeTallerGnv(taller);$('panelDerechoGnv').scrollTo({top:0,behavior:'smooth'});
  }
  function prepararTalleresGnv(){
    grupoTalleresGnv=L.layerGroup().addTo(mapa);datosTalleresGnv().forEach(taller=>{const marcador=L.marker([taller.lat,taller.lng],{icon:iconoTallerGnv(),title:`Taller ${taller.operador}`});marcador.bindTooltip(`<strong>${taller.operador}</strong><br>${taller.distrito}`);marcador.on('click',evento=>{L.DomEvent.stopPropagation(evento);mostrarDetalleTallerGnv(taller)});grupoTalleresGnv.addLayer(marcador)});
  }
  function iconoGrifoGnv(grifo){
    return L.divIcon({className:`marcador-grifo-gnv nivel-${grifo.nivel}`,html:'<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h9v18H5zM7.5 6h4M4 21h12M14 8h2l3 3v7a2 2 0 0 0 2 2V9l-2-2"/></svg></span>',iconSize:[44,50],iconAnchor:[22,48],tooltipAnchor:[0,-40]});
  }
  function mostrarDetalleGrifoGnv(grifo){
    seleccionActual=null;$('resumenGeneralGnv').hidden=true;
    const detalle=$('detalleConversionGnv'),alerta=grifo.nivel==='alerta';detalle.hidden=false;detalle.className=`detalle-conversion-gnv detalle-grifo-gnv nivel-${grifo.nivel}`;
    const placas=grifo.placas.length?grifo.placas.map(item=>`<article><b>${item.placa}</b><span>${item.detalle}</span></article>`).join(''):'<p class="sin-alertas-grifo-gnv">No se detectaron placas con patrones anormales en este grifo.</p>';
    detalle.innerHTML=`<button type="button">Limpiar</button><small>GRIFO GNV · ${grifo.id}</small><h3>Información del grifo</h3><div class="detalle-grid-gnv"><div><span>Estado</span><b class="estado-grifo-gnv">${grifo.estado}</b></div><div><span>Dirección</span><b>${grifo.direccion}</b></div><div><span>Ubicación</span><b>${grifo.distrito}, ${grifo.departamento}</b></div><div><span>Placas asociadas</span><b>${grifo.placas.length}</b></div></div>${alerta?'<aside class="alerta-tanqueo-gnv"><strong>Alerta de tanqueo</strong><p>Última carga registrada en este grifo después de tanqueos reiterados en otras localizaciones.</p></aside>':''}<section class="placas-grifo-gnv"><h4>${grifo.placas.length?'Placas con seguimiento':'Estado del monitoreo'}</h4>${placas}</section><div class="acciones-detalle-grifo-gnv"><button type="button" data-accion-grifo="reporte">Reporte de recargas</button><button type="button" data-accion-grifo="bono">Pérdida de Bono Provincia</button></div>`;
    detalle.querySelector(':scope > button').onclick=restaurarResumen;detalle.querySelector('[data-accion-grifo="reporte"]').onclick=()=>{abrirReporteRecargasGnv();$('reporteDepartamentoGnv').value=grifo.departamento;actualizarProvinciasReporteRecargasGnv();if([...$('reporteProvinciaGnv').options].some(x=>x.value===grifo.provincia))$('reporteProvinciaGnv').value=grifo.provincia;paginaReporteRecargas=1;renderReporteRecargasGnv()};detalle.querySelector('[data-accion-grifo="bono"]').onclick=abrirReglasBonoGnv;$('panelDerechoGnv').scrollTo({top:0,behavior:'smooth'});
  }
  function prepararGrifosGnv(){
    grupoGrifosGnv=L.layerGroup().addTo(mapa);grifosGnv.forEach(grifo=>{const marcador=L.marker([grifo.lat,grifo.lng],{icon:iconoGrifoGnv(grifo),title:`${grifo.nombre} · ${grifo.estado}`});marcador.bindTooltip(`<strong>${grifo.nombre}</strong><br>${grifo.estado}`);marcador.on('click',evento=>{L.DomEvent.stopPropagation(evento);mostrarDetalleGrifoGnv(grifo)});grupoGrifosGnv.addLayer(marcador)});
  }
  function porcentaje(valor,total){return total?Math.round(valor/total*100):0}
  function filasBarras(datos,total){
    return datos.map(item=>`<div class="barra-resumen"><span>${item[0]}</span><i style="--ancho:${porcentaje(item[1],total)}%"></i><b>${item[1]}</b></div>`).join('');
  }
  function actualizarResumen(){
    const total=visibles.length,liquidadas=visibles.filter(x=>x.estado==='Liquidada').length;
    $('kpiConversiones').textContent=total.toLocaleString('es-PE');
    $('kpiLiquidadas').textContent=liquidadas.toLocaleString('es-PE');
    $('kpiBeneficiarios').textContent=new Set(visibles.map(x=>x.dni)).size.toLocaleString('es-PE');
    $('kpiDesembolsado').textContent=`S/ ${visibles.reduce((s,x)=>s+x.desembolsado,0).toLocaleString('es-PE')}`;
    $('totalTablaGnv').textContent=`${total} registro${total===1?'':'s'}`;
    $('tablaResumenGnv').innerHTML=visibles.slice(0,12).map(x=>`<tr data-id="${x.id}"><td><strong>${x.id}</strong><small>${x.placa}</small></td><td>${x.beneficiario}</td><td><span class="estado-tabla-gnv estado-${x.estado.toLowerCase().replaceAll(' ','-')}">${x.estado}</span></td></tr>`).join('')||'<tr><td colspan="3">No existen conversiones con los filtros seleccionados.</td></tr>';
    $('tablaResumenGnv').querySelectorAll('tr[data-id]').forEach(fila=>fila.onclick=()=>mostrarDetalle(visibles.find(x=>x.id===fila.dataset.id)));
  }
  function mostrarDetalle(x){
    seleccionActual=x;
    $('resumenGeneralGnv').hidden=true;
    const detalle=$('detalleConversionGnv');detalle.hidden=false;detalle.className='detalle-conversion-gnv';
    const campos=[
      ['Código',x.id],['Beneficiario',x.beneficiario],['DNI',x.dni],['Placa',x.placa],
      ['Estado',x.estado],['Combustible',x.combustible],['Cilindros',x.cilindros],['Servicio',x.servicio],
      ['Taller autorizado',x.taller],['Fecha de conversión',x.fecha],['Ubicación',`${x.distrito}, ${x.departamento}`],
      ['Monto desembolsado',`S/ ${x.desembolsado.toLocaleString('es-PE')}`]
    ];
    detalle.innerHTML=`<button type="button">Limpiar</button><small>CONVERSIÓN SELECCIONADA</small><h3>${x.id} · ${x.placa}</h3><div class="detalle-grid-gnv">${campos.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div><button class="boton-exportar-detalle-gnv" type="button"><span>Exportar reporte</span></button>`;
    detalle.querySelector(':scope > button:first-child').onclick=restaurarResumen;
    detalle.querySelector('.boton-exportar-detalle-gnv').onclick=abrirExportacion;
    $('panelDerechoGnv').scrollTo({top:0,behavior:'smooth'});
  }
  function restaurarResumen(){
    seleccionActual=null;$('detalleConversionGnv').hidden=true;$('resumenGeneralGnv').hidden=false;
  }
  function limpiarDibujoHerramienta(restaurar=true){
    if(capaHerramienta){mapa.removeLayer(capaHerramienta);capaHerramienta=null}
    if(guiaHerramienta){mapa.removeLayer(guiaHerramienta);guiaHerramienta=null}
    puntosHerramienta=[];centroCirculo=null;conversionesSeleccionadas.clear();
    if(restaurar)restaurarResumen();
  }
  function mostrarSeleccionHerramienta(lista,titulo){
    seleccionActual=null;
    $('resumenGeneralGnv').hidden=true;
    const detalle=$('detalleConversionGnv');detalle.hidden=false;
    detalle.className='detalle-conversion-gnv seleccion-herramienta-gnv';
    detalle.innerHTML=`<button type="button">Limpiar</button><small>SELECCIÓN GEOGRÁFICA</small><h3>${titulo}</h3><p>${lista.length} conversión${lista.length===1?'':'es'} dentro de la selección.</p><div class="lista-seleccion-gnv">${lista.slice(0,30).map(x=>`<article><b>${x.id}</b><span>${x.estado}</span><small>${x.beneficiario} · ${x.placa} · ${x.distrito}</small></article>`).join('')||'<p>No hay conversiones dentro del área seleccionada.</p>'}</div>`;
    detalle.querySelector('button').onclick=()=>limpiarDibujoHerramienta(true);
    $('panelDerechoGnv').scrollTo({top:0,behavior:'smooth'});
  }
  function puntoEnPoligono(lat,lng,poligono){
    let dentro=false;
    for(let i=0,j=poligono.length-1;i<poligono.length;j=i++){
      const xi=poligono[i].lng,yi=poligono[i].lat,xj=poligono[j].lng,yj=poligono[j].lat;
      if(((yi>lat)!==(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi||1e-12)+xi))dentro=!dentro;
    }
    return dentro;
  }
  function finalizarPoligono(){
    if(puntosHerramienta.length<3)return;
    if(guiaHerramienta){mapa.removeLayer(guiaHerramienta);guiaHerramienta=null}
    if(capaHerramienta)mapa.removeLayer(capaHerramienta);
    capaHerramienta=L.polygon(puntosHerramienta,{color:'#438dac',weight:3,fillColor:'#55aec8',fillOpacity:.16}).addTo(mapa);
    const seleccion=visibles.filter(x=>puntoEnPoligono(x.lat,x.lng,puntosHerramienta));
    mostrarSeleccionHerramienta(seleccion,'Área poligonal');
    puntosHerramienta=[];
  }
  function finalizarCirculo(){
    if(!centroCirculo||!capaHerramienta)return;
    const radio=capaHerramienta.getRadius();
    const seleccion=visibles.filter(x=>mapa.distance(centroCirculo,L.latLng(x.lat,x.lng))<=radio);
    mostrarSeleccionHerramienta(seleccion,'Área circular');
    centroCirculo=null;
  }
  function seleccionarConversion(registro){
    conversionesSeleccionadas.set(registro.id,registro);
    mostrarSeleccionHerramienta([...conversionesSeleccionadas.values()],'Conversiones seleccionadas');
  }
  function activarHerramienta(nombre,boton){
    if(nombre==='ampliar'){$('barraHerramientasGnv').classList.toggle('ampliada');return}
    if(nombre==='mover'){$('barraHerramientasGnv').classList.toggle('movible');boton.classList.toggle('activo');return}
    if(nombre==='opciones'){$('barraHerramientasGnv').classList.toggle('ampliada');return}
    if(nombre==='liquidaciones'){abrirLiquidacionesGnv();return}
    if(nombre==='validacion-ia'){reiniciarValidacionIa();abrirModal('modalValidacionIaGnv');return}
    herramientaActiva=herramientaActiva===nombre?null:nombre;
    limpiarDibujoHerramienta(false);
    document.querySelectorAll('[data-herramienta-gnv]').forEach(item=>{
      if(!['ampliar','mover','opciones'].includes(item.dataset.herramientaGnv))item.classList.toggle('activo',item.dataset.herramientaGnv===herramientaActiva);
    });
    mapa.getContainer().style.cursor=herramientaActiva?'crosshair':'';
  }
  function actualizarVisibilidadHerramientas(){
    const visible=!$('satcontrol').hidden;
    $('barraHerramientasGnv').hidden=!visible;
    if(!visible){$('grupoHerramientasGnv').hidden=true;$('abrirHerramientasGnv').setAttribute('aria-expanded','false')}
  }
  function crearCapaCalorLocal(puntos){
    const CapaCalor=L.Layer.extend({
      onAdd(mapaActual){
        this._map=mapaActual;
        this._canvas=L.DomUtil.create('canvas','leaflet-layer leaflet-zoom-animated heatmap-canvas-gnv');
        this._canvas.style.cssText='position:absolute;z-index:450;pointer-events:none;mix-blend-mode:multiply';
        mapaActual.getPanes().overlayPane.appendChild(this._canvas);
        mapaActual.on('moveend zoomend resize',this._dibujar,this);
        this._dibujar();
      },
      onRemove(mapaActual){
        mapaActual.off('moveend zoomend resize',this._dibujar,this);
        this._canvas?.remove();
      },
      _dibujar(){
        const mapaActual=this._map,tamano=mapaActual.getSize(),escala=window.devicePixelRatio||1;
        const canvas=this._canvas,radio=42*escala;
        canvas.width=tamano.x*escala;canvas.height=tamano.y*escala;
        canvas.style.width=`${tamano.x}px`;canvas.style.height=`${tamano.y}px`;
        L.DomUtil.setPosition(canvas,mapaActual.containerPointToLayerPoint([0,0]));
        const auxiliar=document.createElement('canvas');auxiliar.width=canvas.width;auxiliar.height=canvas.height;
        const contexto=auxiliar.getContext('2d');contexto.globalCompositeOperation='lighter';
        puntos.forEach(([lat,lng,peso])=>{
          const punto=mapaActual.latLngToContainerPoint([lat,lng]).multiplyBy(escala);
          const gradiente=contexto.createRadialGradient(punto.x,punto.y,0,punto.x,punto.y,radio);
          gradiente.addColorStop(0,`rgba(0,0,0,${Math.min(.42,.16+peso*.2)})`);
          gradiente.addColorStop(.45,`rgba(0,0,0,${Math.min(.24,.08+peso*.11)})`);
          gradiente.addColorStop(1,'rgba(0,0,0,0)');
          contexto.fillStyle=gradiente;contexto.fillRect(punto.x-radio,punto.y-radio,radio*2,radio*2);
        });
        const imagen=contexto.getImageData(0,0,auxiliar.width,auxiliar.height),datos=imagen.data;
        for(let i=0;i<datos.length;i+=4){
          const intensidad=datos[i+3]/255;
          if(!intensidad)continue;
          const color=intensidad<.25?[72,139,224]:intensidad<.48?[70,190,205]:intensidad<.68?[91,193,111]:intensidad<.84?[241,195,60]:[226,75,67];
          datos[i]=color[0];datos[i+1]=color[1];datos[i+2]=color[2];datos[i+3]=Math.min(215,70+intensidad*210);
        }
        canvas.getContext('2d').putImageData(imagen,0,0);
      }
    });
    return new CapaCalor();
  }
  function actualizarMapa(ajustar=false){
    visibles=obtenerVisibles();
    grupoMarcadores.clearLayers();
    if(capaCalor){mapa.removeLayer(capaCalor);capaCalor=null}
    if(modoTematico){
      const puntos=visibles.map(registro=>[
        registro.lat,
        registro.lng,
        Math.min(1,.3+(Number(registro.cilindros)||1)*.12+(registro.morosidad>0?.12:0))
      ]);
      capaCalor=typeof L.heatLayer==='function'
        ?L.heatLayer(puntos,{radius:34,blur:27,maxZoom:12,minOpacity:.36,gradient:{.18:'#4e8fe6',.42:'#52c5d4',.64:'#69c875',.82:'#f2c94c',1:'#e65a4f'}})
        :crearCapaCalorLocal(puntos);
      capaCalor.addTo(mapa);
    }else visibles.forEach(registro=>{
      const marcador=L.marker([registro.lat,registro.lng],{icon:iconoRegistro(registro),title:`${registro.id} · ${registro.placa}`});
      marcador.bindTooltip(`${registro.id}<br>${registro.distrito}`);
      marcador.on('click',evento=>{
        L.DomEvent.stopPropagation(evento);
        if(herramientaActiva==='seleccionar')seleccionarConversion(registro);
        else mostrarDetalle(registro);
      });
      grupoMarcadores.addLayer(marcador);
    });
    $('contadorMapa').textContent=modoTematico?`Mapa de calor · ${visibles.length} recargas visibles`:`${visibles.length} conversiones visibles`;
    actualizarResumen();restaurarResumen();
    if(ajustar&&visibles.length){
      const limites=L.latLngBounds(visibles.map(x=>[x.lat,x.lng]));
      mapa.fitBounds(limites,{padding:[35,35],maxZoom:12});
    }
  }
  function alternarPanel(id,boton){
    ['panelMapas','panelCapas','panelTematicos'].forEach(panelId=>{if(panelId!==id)$(panelId).hidden=true});
    [$('botonMapas'),$('botonCapas'),$('botonTematicos')].forEach(x=>{x.classList.remove('activo');x.setAttribute('aria-expanded','false')});
    $(id).hidden=!$(id).hidden;boton.classList.toggle('activo',!$(id).hidden);
    boton.setAttribute('aria-expanded',String(!$(id).hidden));
  }
  function iniciarMapa(){
    mapa=L.map('mapaGnv',{zoomControl:false,minZoom:4}).setView([-10.2,-75.2],5);
    L.control.zoom({position:'bottomleft'}).addTo(mapa);
    bases.osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
    bases.topografico=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenTopoMap'});
    baseActual=bases.osm.addTo(mapa);
    grupoMarcadores=L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:55,spiderfyOnMaxZoom:true,iconCreateFunction:iconoCluster}).addTo(mapa);
    prepararTalleresGnv();
    prepararGrifosGnv();
    const ajustarTamanoMapa=()=>{
      if(!mapa||!$('mapaGnv').offsetParent)return;
      mapa.invalidateSize({pan:false,debounceMoveend:true});
    };
    if(typeof ResizeObserver!=='undefined'){
      observadorMapaGnv=new ResizeObserver(()=>{
        requestAnimationFrame(ajustarTamanoMapa);
        setTimeout(ajustarTamanoMapa,120);
      });
      observadorMapaGnv.observe($('mapaGnv'));
    }
    mapa.on('click',evento=>{
      ['panelMapas','panelCapas','panelTematicos'].forEach(id=>$(id).hidden=true);
      [$('botonMapas'),$('botonCapas'),$('botonTematicos')].forEach(x=>{x.classList.remove('activo');x.setAttribute('aria-expanded','false')});
      if(herramientaActiva==='poligono'){
        puntosHerramienta.push(evento.latlng);
        if(capaHerramienta)mapa.removeLayer(capaHerramienta);
        capaHerramienta=L.polyline(puntosHerramienta,{color:'#438dac',weight:3}).addTo(mapa);
        if((evento.originalEvent?.detail||0)>=2)finalizarPoligono();
      }else if(herramientaActiva==='circulo'){
        if(!centroCirculo){centroCirculo=evento.latlng;capaHerramienta=L.circle(centroCirculo,{radius:1,color:'#438dac',weight:3,fillColor:'#55aec8',fillOpacity:.16}).addTo(mapa)}
        else finalizarCirculo();
      }
    });
    mapa.on('mousemove',evento=>{
      if(herramientaActiva==='poligono'&&puntosHerramienta.length){
        if(guiaHerramienta)mapa.removeLayer(guiaHerramienta);
        guiaHerramienta=L.polyline([puntosHerramienta.at(-1),evento.latlng],{color:'#438dac',weight:2,opacity:.7}).addTo(mapa);
      }else if(herramientaActiva==='circulo'&&centroCirculo&&capaHerramienta)capaHerramienta.setRadius(mapa.distance(centroCirculo,evento.latlng));
    });
    mapa.on('dblclick',evento=>{
      if(evento.originalEvent)L.DomEvent.stop(evento.originalEvent);
      if(herramientaActiva==='poligono')finalizarPoligono();
      else if(herramientaActiva==='circulo')finalizarCirculo();
    });
    mapa.getContainer().addEventListener('dblclick',evento=>{
      if(herramientaActiva!=='poligono')return;
      evento.preventDefault();evento.stopPropagation();
      finalizarPoligono();
    },true);
  }
  function barraLista(datos){
    const maximo=Math.max(...datos.map(x=>x[1]),1);
    return datos.map(([nombre,valor,formato])=>`<div class="barra-grafica"><span>${nombre}</span><i style="--ancho:${Math.max(4,valor/maximo*100)}%"></i><strong>${formato||Number(valor).toLocaleString('es-PE')}</strong></div>`).join('');
  }
  function crearGraficoMixto(id,etiquetas,barras,linea,clase=''){
    const ancho=1000,alto=280,margen={izq:35,der:25,arr:32,ab:38},w=ancho-margen.izq-margen.der,h=alto-margen.arr-margen.ab;
    const maxBarra=Math.max(...barras,1),minLinea=Math.min(...linea),maxLinea=Math.max(...linea);
    const paso=w/etiquetas.length,barWidth=Math.min(42,paso*.48);
    const puntos=linea.map((valor,i)=>{
      const x=margen.izq+paso*(i+.5),normal=(valor-minLinea)/(maxLinea-minLinea||1),y=margen.arr+h-(normal*.72+.14)*h;
      return {x,y,valor};
    });
    const grid=[.2,.5,.8].map(n=>`<line class="grid" x1="${margen.izq}" x2="${ancho-margen.der}" y1="${margen.arr+h*n}" y2="${margen.arr+h*n}"/>`).join('');
    const rects=barras.map((valor,i)=>{
      const bh=Math.max(12,valor/maxBarra*h*.33),x=margen.izq+paso*(i+.5)-barWidth/2,y=margen.arr+h-bh;
      return `<rect class="barra ${clase?'secundaria':''}" x="${x}" y="${y}" width="${barWidth}" height="${bh}" rx="7"/><text x="${x+barWidth/2}" y="${y-7}" text-anchor="middle">${valor.toLocaleString('es-PE')}</text><text x="${x+barWidth/2}" y="${alto-10}" text-anchor="middle">${etiquetas[i]}</text>`;
    }).join('');
    const poly=`<polyline class="linea ${clase}" points="${puntos.map(p=>`${p.x},${p.y}`).join(' ')}"/>`+puntos.map(p=>`<circle class="punto ${clase}" cx="${p.x}" cy="${p.y}" r="4"/><text class="valor-linea ${clase}" x="${p.x}" y="${p.y-10}" text-anchor="middle">${p.valor.toLocaleString('es-PE')}</text>`).join('');
    $(id).innerHTML=`<svg viewBox="0 0 ${ancho} ${alto}" preserveAspectRatio="none">${grid}${rects}${poly}</svg>`;
  }
  function crearGraficoMetaReal(etiquetas,metas,reales){
    const ancho=1000,alto=265,margen={izq:35,der:25,arr:26,ab:38},w=ancho-margen.izq-margen.der,h=alto-margen.arr-margen.ab;
    const maximo=Math.max(...metas,...reales,1),paso=w/Math.max(etiquetas.length,1),anchoGrupo=Math.min(58,paso*.7),anchoBarra=anchoGrupo/2-3;
    const grid=[.2,.5,.8,1].map(n=>`<line class="grid" x1="${margen.izq}" x2="${ancho-margen.der}" y1="${margen.arr+h*n}" y2="${margen.arr+h*n}"/>`).join('');
    const columnas=etiquetas.map((etiqueta,i)=>{
      const centro=margen.izq+paso*(i+.5),altoMeta=metas[i]/maximo*h*.88,altoReal=reales[i]/maximo*h*.88;
      const xMeta=centro-anchoBarra-3,xReal=centro+3,yMeta=margen.arr+h-altoMeta,yReal=margen.arr+h-altoReal;
      return `<rect class="barra-meta" x="${xMeta}" y="${yMeta}" width="${anchoBarra}" height="${altoMeta}" rx="5"/>
        <rect class="barra-real" x="${xReal}" y="${yReal}" width="${anchoBarra}" height="${altoReal}" rx="5"/>
        <text class="valor-meta" x="${xMeta+anchoBarra/2}" y="${Math.max(14,yMeta-6)}" text-anchor="middle">${metas[i].toLocaleString('es-PE')}</text>
        <text class="valor-real" x="${xReal+anchoBarra/2}" y="${Math.max(14,yReal-6)}" text-anchor="middle">${reales[i].toLocaleString('es-PE')}</text>
        <text x="${centro}" y="${alto-10}" text-anchor="middle">${etiqueta}</text>`;
    }).join('');
    $('graficoMetaRealGnv').innerHTML=`<svg viewBox="0 0 ${ancho} ${alto}" preserveAspectRatio="none">${grid}${columnas}</svg>`;
  }
  function actualizarGraficoMetaReal(){
    const periodos=['2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05'];
    const etiquetas=['jun-25','jul-25','ago-25','sep-25','oct-25','nov-25','dic-25','ene-26','feb-26','mar-26','abr-26','may-26'];
    const metasBase=[2500,2600,2500,2100,2250,2300,2000,1900,1800,1500,1600,2500];
    const realesBase=[2439,2575,2425,1769,2209,2141,1779,1750,1547,1102,1156,2801];
    const desde=$('graficaDesde')?.value?.slice(0,7)||'',hasta=$('graficaHasta')?.value?.slice(0,7)||'';
    const indices=periodos.map((periodo,i)=>({periodo,i})).filter(x=>(!desde||x.periodo>=desde)&&(!hasta||x.periodo<=hasta)).map(x=>x.i);
    const activos=indices.length?indices:periodos.map((_,i)=>i);
    const factor=filtrarGraficas().length/Math.max(registros.length,1);
    const metas=activos.map(i=>Math.max(0,Math.round(metasBase[i]*factor)));
    const reales=activos.map(i=>Math.max(0,Math.round(realesBase[i]*factor)));
    const totalMeta=metas.reduce((a,b)=>a+b,0),totalReal=reales.reduce((a,b)=>a+b,0),brecha=Math.max(0,totalMeta-totalReal);
    const cumplimiento=totalMeta?totalReal/totalMeta*100:0;
    crearGraficoMetaReal(activos.map(i=>etiquetas[i]),metas,reales);
    $('totalMetaGnv').textContent=totalMeta.toLocaleString('es-PE');
    $('totalRealGnv').textContent=totalReal.toLocaleString('es-PE');
    $('brechaMetaGnv').textContent=brecha.toLocaleString('es-PE');
    $('etiquetaCumplimientoMetaGnv').textContent=`${cumplimiento.toFixed(1)}% de cumplimiento`;
  }
  function prepararFiltrosGraficas(){
    llenarSelect('graficaCombustible',unicos('combustible'),'Todos');
    llenarSelect('graficaCilindros',unicos('cilindros').map(String),'Todos');
    llenarSelect('graficaEntidad',unicos('entidadFinanciera'),'Todas');
    prepararRangoFechasGnv();
  }
  function prepararRangoFechasGnv(){
    const fechas=registros.map(x=>x.fecha).sort(),inicio=fechas[0],fin=fechas.at(-1),total=Math.max(1,Math.round((new Date(`${fin}T00:00:00`)-new Date(`${inicio}T00:00:00`))/86400000));
    const desde=$('graficaDesdeSlider'),hasta=$('graficaHastaSlider');
    desde.max=hasta.max=String(total);desde.value='0';hasta.value=String(total);
    $('graficaDesdeCalendario').min=$('graficaHastaCalendario').min=inicio;$('graficaDesdeCalendario').max=$('graficaHastaCalendario').max=fin;
    desde.dataset.inicio=inicio;hasta.dataset.inicio=inicio;actualizarRangoFechasGnv();
  }
  function fechaDesdeIndiceGnv(indice){
    const fecha=new Date(`${$('graficaDesdeSlider').dataset.inicio}T00:00:00`);fecha.setDate(fecha.getDate()+Number(indice));return fecha.toISOString().slice(0,10);
  }
  function actualizarRangoFechasGnv(origen){
    const desde=$('graficaDesdeSlider'),hasta=$('graficaHastaSlider'),separacion=1;
    if(Number(hasta.value)-Number(desde.value)<separacion){if(origen===hasta)hasta.value=String(Number(desde.value)+separacion);else desde.value=String(Number(hasta.value)-separacion)}
    const fechaDesde=fechaDesdeIndiceGnv(desde.value),fechaHasta=fechaDesdeIndiceGnv(hasta.value),max=Number(desde.max)||1;
    $('graficaDesde').value=fechaDesde;$('graficaHasta').value=fechaHasta;
    $('graficaDesdeCalendario').value=fechaDesde;$('graficaHastaCalendario').value=fechaHasta;
    $('progresoFechasGnv').parentElement.style.setProperty('--desde',`${Number(desde.value)/max*100}%`);$('progresoFechasGnv').parentElement.style.setProperty('--hasta',`${100-Number(hasta.value)/max*100}%`);
  }
  function indiceDeFechaGnv(fecha){return Math.round((new Date(`${fecha}T00:00:00`)-new Date(`${$('graficaDesdeSlider').dataset.inicio}T00:00:00`))/86400000)}
  function arrastrarControlFechaGnv(evento,tipo){
    evento.preventDefault();const contenedor=$('progresoFechasGnv').parentElement,slider=tipo==='desde'?$('graficaDesdeSlider'):$('graficaHastaSlider');evento.currentTarget.setPointerCapture(evento.pointerId);
    const mover=movimiento=>{const rect=contenedor.getBoundingClientRect(),proporcion=Math.max(0,Math.min(1,(movimiento.clientX-rect.left)/rect.width));slider.value=String(Math.round(proporcion*Number(slider.max)));actualizarRangoFechasGnv(slider)};
    mover(evento);evento.currentTarget.onpointermove=mover;evento.currentTarget.onpointerup=()=>{evento.currentTarget.onpointermove=null;actualizarAmbitoGraficas()};
  }
  function filtrarGraficas(){
    const region=$('graficaRegion').value,entidad=$('graficaEntidad').value,combustible=$('graficaCombustible').value,cilindros=$('graficaCilindros').value;
    const desde=$('graficaDesde').value,hasta=$('graficaHasta').value;
    return registros.filter(x=>(!region||x.region===region)&&(!entidad||x.entidadFinanciera===entidad)&&(!combustible||x.combustible===combustible)&&(!cilindros||String(x.cilindros)===cilindros)&&(!desde||x.fecha>=desde)&&(!hasta||x.fecha<=hasta));
  }
  function actualizarAmbitoGraficas(){
    const lista=filtrarGraficas(),factor=lista.length/Math.max(registros.length,1);
    const valores=[23713,25962,853346519,14900000,354,10.8];
    const tarjetas=[...document.querySelectorAll('.kpis-graficas-gnv article strong')];
    tarjetas[0].textContent=Math.round(valores[0]*factor).toLocaleString('es-PE');
    tarjetas[1].textContent=Math.round(valores[1]*factor).toLocaleString('es-PE');
    tarjetas[2].textContent=`S/ ${(valores[2]*factor/1000000).toFixed(1)} M`;
    tarjetas[3].textContent=`S/ ${(valores[3]*factor/1000000).toFixed(1)} M`;
    tarjetas[4].textContent=Math.max(0,Math.round(valores[4]*factor)).toLocaleString('es-PE');
    tarjetas[5].textContent=`${(valores[5]*factor).toFixed(1)}%`;
    actualizarGraficoMetaReal();
    actualizarGraficasFiltradasGnv(lista);
  }
  function abrirModal(id){$(id).hidden=false;document.body.classList.add('modal-abierto-gnv')}
  function cerrarModal(id){$(id).hidden=true;if(!document.querySelector('.modal-gnv:not([hidden])'))document.body.classList.remove('modal-abierto-gnv')}
  function actualizarEstadosConfiguracionMovilGnv(){
    const sms=$('habilitarSmsMovilGnv').checked,biometria=$('habilitarBiometriaMovilGnv').checked;
    $('estadoSmsMovilGnv').textContent=sms?'Habilitado':'Deshabilitado';$('estadoSmsMovilGnv').classList.toggle('habilitado',sms);$('detalleSmsMovilGnv').textContent=sms?'Servicio habilitado para todos los usuarios.':'No se enviarán códigos ni alertas mediante SMS.';
    $('estadoBiometriaMovilGnv').textContent=biometria?'Habilitada':'Deshabilitada';$('estadoBiometriaMovilGnv').classList.toggle('habilitado',biometria);$('detalleBiometriaMovilGnv').textContent=biometria?'Validación facial disponible en dispositivos compatibles.':'Acceso mediante contraseña y código de seguridad.';
  }
  function cargarConfiguracionMovilGnv(){
    let configuracion={sms:true,biometria:false,actualizado:'Sin cambios registrados'};try{configuracion={...configuracion,...JSON.parse(localStorage.getItem('ahorroGnvConfiguracionMovil')||'{}')}}catch{}
    $('habilitarSmsMovilGnv').checked=Boolean(configuracion.sms);$('habilitarBiometriaMovilGnv').checked=Boolean(configuracion.biometria);$('ultimaActualizacionMovilGnv').textContent=configuracion.actualizado;actualizarEstadosConfiguracionMovilGnv();
  }
  function guardarConfiguracionMovilGnv(){
    const ahora=new Date(),actualizado=`${ahora.toLocaleDateString('es-PE')} · ${ahora.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}`,configuracion={sms:$('habilitarSmsMovilGnv').checked,biometria:$('habilitarBiometriaMovilGnv').checked,actualizado};localStorage.setItem('ahorroGnvConfiguracionMovil',JSON.stringify(configuracion));$('ultimaActualizacionMovilGnv').textContent=actualizado;const boton=$('guardarConfiguracionMovilGnv'),texto=boton.textContent;boton.textContent='Configuración guardada';setTimeout(()=>{boton.textContent=texto;cerrarModal('modalConfiguracionMovilGnv')},700);
  }
  function reiniciarValidacionIa(){
    ['archivoDniIaGnv','archivoTivIaGnv','archivoFirmaIaGnv'].forEach(id=>{$(id).value=''});
    $('nombreDniIaGnv').textContent='Ningún archivo seleccionado';
    $('nombreTivIaGnv').textContent='Ningún archivo seleccionado';
    $('nombreFirmaIaGnv').textContent='Ningún archivo seleccionado';
    $('avisoValidacionIaGnv').textContent='';
    $('cargaValidacionIaGnv').hidden=false;$('procesoValidacionIaGnv').hidden=true;$('resultadoValidacionIaGnv').hidden=true;
    document.querySelectorAll('[data-paso-ia]').forEach((paso,i)=>paso.classList.toggle('activo',i===0));
  }
  function ejecutarValidacionIa(){
    $('avisoValidacionIaGnv').textContent='';
    $('cargaValidacionIaGnv').hidden=true;$('procesoValidacionIaGnv').hidden=false;
    document.querySelectorAll('[data-paso-ia]').forEach((paso,i)=>paso.classList.toggle('activo',i<=1));
    const filas=[...document.querySelectorAll('[data-analisis-ia-gnv]')];
    filas.forEach(fila=>{fila.className='';fila.querySelector('b').textContent='En espera'});
    $('estadoGeneralIaGnv').textContent='Inicializando análisis inteligente…';
    let indice=0;
    const avanzar=()=>{
      if($('modalValidacionIaGnv').hidden)return;
      if(indice>0){
        const anterior=filas[indice-1],observado=indice===2;
        anterior.className=observado?'observado':'aprobado';
        anterior.querySelector('b').textContent=observado?'Alteración posible':'Validación correcta';
      }
      if(indice<filas.length){
        filas[indice].className='procesando';
        filas[indice].querySelector('b').textContent='Analizando…';
        $('estadoGeneralIaGnv').textContent=`Validando ${filas[indice].querySelector('span').textContent.toLowerCase()}…`;
        indice++;setTimeout(avanzar,430);return;
      }
      $('estadoGeneralIaGnv').textContent='Análisis completado';
      setTimeout(()=>{
        if($('modalValidacionIaGnv').hidden)return;
        $('procesoValidacionIaGnv').hidden=true;$('resultadoValidacionIaGnv').hidden=false;
        document.querySelectorAll('[data-paso-ia]').forEach(paso=>paso.classList.add('activo'));
        try{
          const Contexto=window.AudioContext||window.webkitAudioContext;
          if(Contexto){const contexto=new Contexto(),oscilador=contexto.createOscillator(),ganancia=contexto.createGain();oscilador.frequency.value=720;ganancia.gain.setValueAtTime(.03,contexto.currentTime);ganancia.gain.exponentialRampToValueAtTime(.001,contexto.currentTime+.18);oscilador.connect(ganancia).connect(contexto.destination);oscilador.start();oscilador.stop(contexto.currentTime+.18)}
          navigator.vibrate?.([80,50,80]);
        }catch(_){}
      },320);
    };
    avanzar();
  }
  function prepararFirmaDigitalGnv(limpiar=true){
    const lienzo=$('canvasFirmaGnv'),rect=lienzo.getBoundingClientRect(),ratio=Math.max(1,window.devicePixelRatio||1);
    if(rect.width<10||rect.height<10)return;
    lienzo.width=Math.round(rect.width*ratio);lienzo.height=Math.round(rect.height*ratio);
    const contexto=lienzo.getContext('2d');
    contexto.setTransform(ratio,0,0,ratio,0,0);
    contexto.lineWidth=2.4;contexto.lineCap='round';contexto.lineJoin='round';contexto.strokeStyle='#183b63';
    if(limpiar){
      contexto.clearRect(0,0,rect.width,rect.height);
      firmaDibujadaGnv=false;$('ayudaFirmaGnv').hidden=false;
      $('textoEstadoFirmaGnv').textContent='Sin firma registrada';$('hashFirmaGnv').textContent='—';
    }
  }
  function puntoFirmaGnv(evento){
    const rect=$('canvasFirmaGnv').getBoundingClientRect();
    return {x:evento.clientX-rect.left,y:evento.clientY-rect.top};
  }
  function dibujarFirmaDemoGnv(){
    const lienzo=$('canvasFirmaGnv'),rect=lienzo.getBoundingClientRect(),contexto=lienzo.getContext('2d');
    contexto.clearRect(0,0,rect.width,rect.height);
    contexto.beginPath();contexto.moveTo(rect.width*.16,rect.height*.66);
    contexto.bezierCurveTo(rect.width*.25,rect.height*.13,rect.width*.29,rect.height*.91,rect.width*.38,rect.height*.48);
    contexto.bezierCurveTo(rect.width*.45,rect.height*.2,rect.width*.42,rect.height*.78,rect.width*.55,rect.height*.5);
    contexto.bezierCurveTo(rect.width*.64,rect.height*.3,rect.width*.67,rect.height*.73,rect.width*.78,rect.height*.48);
    contexto.stroke();contexto.beginPath();contexto.moveTo(rect.width*.22,rect.height*.74);contexto.quadraticCurveTo(rect.width*.52,rect.height*.9,rect.width*.83,rect.height*.68);contexto.stroke();
    firmaDibujadaGnv=true;$('ayudaFirmaGnv').hidden=true;$('textoEstadoFirmaGnv').textContent='Firma digital registrada para demostración';$('hashFirmaGnv').textContent='Firma local · lista para sellar';
  }
  function actualizarConteoFirmaGnv(){
    const controles=[...document.querySelectorAll('[data-firma-lote]:not(:disabled)')],seleccionados=controles.filter(x=>x.checked).length;
    $('kpiSeleccionFirmaGnv').textContent=seleccionados;
    $('checkTodasLiquidacionesGnv').checked=seleccionados===controles.length&&controles.length>0;
    $('checkTodasLiquidacionesGnv').indeterminate=seleccionados>0&&seleccionados<controles.length;
    return seleccionados;
  }
  function abrirLiquidacionesGnv(){
    abrirModal('modalLiquidacionesGnv');
    requestAnimationFrame(()=>{actualizarConteoFirmaGnv();$('modalLiquidacionesGnv').scrollTo({top:0})});
  }
  function hashBlockchainGnv(){
    const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);
    return `0x${[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()}`;
  }
  function firmarLiquidacionesGnv(){
    const filas=[...document.querySelectorAll('[data-firma-lote]:checked')].map(control=>control.closest('tr'));
    if(!filas.length){$('textoEstadoFirmaGnv').textContent='Seleccione al menos una liquidación para firmar';return}
    if(!firmaDibujadaGnv){$('textoEstadoFirmaGnv').textContent='Dibuje la firma o use la firma de demostración';return}
    $('kpiSeleccionFirmaGnv').textContent='0';
    const ahora=new Date(),sello=ahora.toLocaleString('es-PE'),hash=hashBlockchainGnv();
    filas.forEach(fila=>{
      fila.classList.add('firmada');const estado=fila.querySelector('.estado-firma-gnv');
      estado.textContent='Firmada';estado.className='estado-firma-gnv firmado';
      const control=fila.querySelector('[data-firma-lote]');control.checked=false;control.disabled=true;
    });
    $('kpiFirmadasGnv').textContent=Number($('kpiFirmadasGnv').textContent)+filas.length;
    $('kpiPendientesFirmaGnv').textContent=document.querySelectorAll('[data-firma-lote]:not(:disabled)').length;
    $('textoEstadoFirmaGnv').textContent=`${filas.length} liquidación(es) firmada(s) y sellada(s)`;
    $('hashFirmaGnv').textContent=hash;
    $('estadoBlockchainGnv').textContent='Registro blockchain confirmado';$('estadoBlockchainGnv').classList.add('confirmado');
    ['pasoFirmaAuditoriaGnv','pasoBlockchainGnv'].forEach(id=>{const paso=$(id);paso.classList.add('completo');paso.querySelector('i').textContent='✓'});
    $('pasoFirmaAuditoriaGnv').querySelector('small').textContent=`${filas.length} documento(s) aprobados`;
    $('pasoBlockchainGnv').querySelector('small').textContent='Inalterabilidad verificada';
    $('detalleAuditoriaGnv').innerHTML=`<span>Último evento</span><strong>Firma masiva de ${filas.length} liquidación(es)</strong><span>Sello de tiempo</span><strong>${sello}</strong><span>Hash blockchain</span><strong>${hash}</strong><span>Firmante</span><strong>Director Ejecutivo FISE</strong>`;
    $('trazabilidad-firma-gnv').classList.remove('firma-confirmada-gnv');requestAnimationFrame(()=>$('trazabilidad-firma-gnv').classList.add('firma-confirmada-gnv'));
    actualizarConteoFirmaGnv();
    $('kpiSeleccionFirmaGnv').textContent=document.querySelectorAll('[data-firma-lote]:checked').length;
  }
  function exportarAuditoriaFirmaGnv(){
    const filas=[['Evento','Documento','Estado','Sello de tiempo'],['Auditoría de liquidaciones','Liquidaciones Ahorro GNV',$('estadoBlockchainGnv').textContent,new Date().toLocaleString('es-PE')]];
    const blob=new Blob([filas.map(f=>f.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')],{type:'text/csv;charset=utf-8'});
    const enlace=document.createElement('a');enlace.href=URL.createObjectURL(blob);enlace.download='auditoria-firmas-ahorro-gnv.csv';enlace.click();URL.revokeObjectURL(enlace.href);
  }
  const datosInformesGnv={
    'GNV-000041':{beneficiario:'Carlos Quispe Huamaní',dni:'43567891',placa:'ABC-123',monto:'S/ 3,850.00'},
    'GNV-000042':{beneficiario:'María Torres Flores',dni:'45678912',placa:'DEF-456',monto:'S/ 4,120.00'},
    'GNV-000043':{beneficiario:'Rosa Mamani Ccori',dni:'46789123',placa:'JKL-012',monto:'S/ 3,640.00'}
  };
  const plantillasInformesGnv={
    resolucion:{prefijo:'RD',titulo:'Resolución Directoral de Liquidación',encabezado:'RESOLUCIÓN DIRECTORAL'},
    contrato:{prefijo:'CT',titulo:'Contrato de financiamiento GNV',encabezado:'CONTRATO DE FINANCIAMIENTO GNV'},
    informe:{prefijo:'IT',titulo:'Informe técnico de conformidad',encabezado:'INFORME TÉCNICO DE CONFORMIDAD'}
  };
  function fechaLegalGnv(valor){
    if(!valor)return '';
    return new Intl.DateTimeFormat('es-PE',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${valor}T12:00:00Z`));
  }
  function cargarRegistroInformeGnv(){
    const dato=datosInformesGnv[$('registroInformeGnv').value]||datosInformesGnv['GNV-000041'];
    $('beneficiarioInformeGnv').value=dato.beneficiario;$('dniInformeGnv').value=dato.dni;
    $('placaInformeGnv').value=dato.placa;$('montoInformeGnv').value=dato.monto;
    actualizarVistaInformeGnv(false);
  }
  function numeroLegalGnv(){
    const plantilla=plantillasInformesGnv[$('plantillaLegalGnv').value];
    return `${plantilla.prefijo}-FISE-GNV-2026-${String(correlativoInformeGnv).padStart(4,'0')}`;
  }
  function generarNumeracionInformeGnv(){
    correlativoInformeGnv++;
    $('numeroDocumentoGnv').value=numeroLegalGnv();
    $('kpiNumeracionGnv').textContent=String(correlativoInformeGnv).padStart(4,'0');
    $('estadoInformeDigitalGnv').textContent='Numeración generada';$('estadoInformeDigitalGnv').classList.remove('generado');
    actualizarVistaInformeGnv(false);
  }
  function actualizarVistaInformeGnv(mostrarConfirmacion=true){
    const plantilla=plantillasInformesGnv[$('plantillaLegalGnv').value],registro=$('registroInformeGnv').value;
    const numeroEsperado=numeroLegalGnv();
    if(!$('numeroDocumentoGnv').value||!$('numeroDocumentoGnv').value.startsWith(`${plantilla.prefijo}-`))$('numeroDocumentoGnv').value=numeroEsperado;
    $('tituloVistaInformeGnv').textContent=plantilla.titulo;
    $('vistaTituloDocumentoGnv').textContent=plantilla.encabezado;
    $('vistaNumeroInformeGnv').textContent=$('numeroDocumentoGnv').value;
    $('vistaFechaInformeGnv').textContent=fechaLegalGnv($('fechaInformeGnv').value);
    $('vistaRegistroInformeGnv').textContent=registro;
    $('vistaBeneficiarioInformeGnv').textContent=$('beneficiarioInformeGnv').value;
    $('vistaPlacaInformeGnv').textContent=$('placaInformeGnv').value;
    $('vistaMontoInformeGnv').textContent=$('montoInformeGnv').value;
    const firmar=$('adjuntarFirmaInformeGnv').checked;
    $('firmaLegalGnv').classList.toggle('oculta',!firmar);
    $('estadoFirmaInformeGnv').textContent=firmar?'✓ Firma preparada':'Firma no adjunta';
    $('estadoFirmaInformeGnv').classList.toggle('completo',firmar);
    $('adjuntarFirmaInformeGnv').closest('label').querySelector('strong').textContent=firmar?'Habilitado':'Deshabilitado';
    $('estadoPdfInformeGnv').textContent='PDF pendiente';$('estadoPdfInformeGnv').classList.remove('generado');
    $('huellaPdfGnv').textContent='Huella digital pendiente';
    if(mostrarConfirmacion){
      $('estadoInformeDigitalGnv').textContent='Vista actualizada';
      setTimeout(()=>{if($('estadoInformeDigitalGnv').textContent==='Vista actualizada')$('estadoInformeDigitalGnv').textContent='Borrador'},1300);
    }
  }
  function abrirInformesDigitalesGnv(){
    cargarRegistroInformeGnv();
    abrirModal('modalInformesDigitalesGnv');
    requestAnimationFrame(()=>{prepararFirmaInformeGnv(false);$('modalInformesDigitalesGnv').scrollTo({top:0})});
  }
  function prepararFirmaInformeGnv(limpiar=true){
    const lienzo=$('canvasFirmaInformeGnv'),rect=lienzo.getBoundingClientRect(),ratio=Math.max(1,window.devicePixelRatio||1);
    if(rect.width<10||rect.height<10)return;
    lienzo.width=Math.round(rect.width*ratio);lienzo.height=Math.round(rect.height*ratio);
    const contexto=lienzo.getContext('2d');contexto.setTransform(ratio,0,0,ratio,0,0);
    contexto.lineWidth=2.3;contexto.lineCap='round';contexto.lineJoin='round';contexto.strokeStyle='#183b63';
    if(limpiar){
      contexto.clearRect(0,0,rect.width,rect.height);firmaInformeDibujadaGnv=false;
      $('ayudaFirmaInformeGnv').hidden=false;$('textoFirmaInformeGnv').textContent='Sin firma registrada';$('hashFirmaInformeGnv').textContent='—';
    }
  }
  function puntoFirmaInformeGnv(evento){
    const rect=$('canvasFirmaInformeGnv').getBoundingClientRect();
    return{x:evento.clientX-rect.left,y:evento.clientY-rect.top};
  }
  function generarPdfLegalGnv(){
    actualizarVistaInformeGnv(false);
    const plantilla=plantillasInformesGnv[$('plantillaLegalGnv').value],numero=$('numeroDocumentoGnv').value;
    const hash=hashBlockchainGnv(),ahora=new Date();
    $('estadoPdfInformeGnv').textContent='PDF inalterable generado';$('estadoPdfInformeGnv').classList.add('generado');
    $('estadoInformeDigitalGnv').textContent='Documento emitido';$('estadoInformeDigitalGnv').classList.add('generado');
    $('huellaPdfGnv').textContent=`SHA-256 · ${hash}`;
    documentosGeneradosGnv++;$('kpiDocumentosGeneradosGnv').textContent=documentosGeneradosGnv;
    const articulo=document.createElement('article');
    articulo.innerHTML=`<i>PDF</i><div><b>${numero}</b><span>${plantilla.titulo} · ${$('registroInformeGnv').value}</span></div><strong>${$('adjuntarFirmaInformeGnv').checked?'Firmado':'Emitido'}</strong><small>${ahora.toLocaleDateString('es-PE')} · ${ahora.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}</small>`;
    $('listaInformesGnv').prepend(articulo);
    $('contadorInformesGnv').textContent=`${$('listaInformesGnv').children.length} registros`;
    const boton=$('generarPdfLegalGnv'),texto=boton.textContent;boton.textContent='PDF generado correctamente';boton.disabled=true;
    setTimeout(()=>{boton.textContent=texto;boton.disabled=false},1600);
  }
  function morososFiltrados(){
    const texto=$('buscarMorosoGnv').value.trim().toLocaleLowerCase('es'),estado=$('estadoMorosoGnv').value;
    return morosos.filter(x=>(!texto||`${x.placa} ${x.beneficiario} ${x.taller}`.toLocaleLowerCase('es').includes(texto))&&(!estado||x.estado===estado));
  }
  function renderMorosidad(){
    const lista=morososFiltrados(),porPagina=4,paginas=Math.max(1,Math.ceil(lista.length/porPagina));
    paginaMorosidad=Math.min(paginaMorosidad,paginas);
    const inicio=(paginaMorosidad-1)*porPagina,actual=lista.slice(inicio,inicio+porPagina);
    $('tablaMorosidadGnv').innerHTML=actual.map(x=>`<tr><td><strong>${x.placa}</strong></td><td>${x.beneficiario}</td><td>${x.taller}</td><td>${x.cuotas}</td><td>${x.monto?`S/ ${x.monto.toFixed(2)}`:'—'}</td><td><span class="estado-mora-gnv estado-${x.estado.toLowerCase().replaceAll(' ','-')}">${x.estado}</span></td><td>${x.mensajeEnviado?`<span class="mensaje-enviado-gnv"><b>Automático · Administración</b><small>${x.ultimoEnvio}<br>${x.canalEnvio}</small></span>`:'<span class="mensaje-no-aplica-gnv">Sin cuotas vencidas</span>'}</td><td>${x.monto?`<button class="boton-mensaje-gnv" type="button" data-placa="${x.placa}">Revisar / reenviar</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="8">No se encontraron beneficiarios.</td></tr>';
    $('resumenPaginaMorosidad').textContent=`Mostrando ${lista.length?inicio+1:0}–${Math.min(inicio+porPagina,lista.length)} de ${lista.length}`;
    $('numerosPaginaMorosidad').innerHTML=Array.from({length:paginas},(_,i)=>`<button type="button" data-pagina="${i+1}" class="${paginaMorosidad===i+1?'activo':''}">${i+1}</button>`).join('');
    $('paginaAnteriorMorosidad').disabled=paginaMorosidad===1;$('paginaSiguienteMorosidad').disabled=paginaMorosidad===paginas;
    $('tablaMorosidadGnv').querySelectorAll('.boton-mensaje-gnv').forEach(boton=>boton.onclick=()=>abrirMensaje(morosos.find(x=>x.placa===boton.dataset.placa)));
    $('numerosPaginaMorosidad').querySelectorAll('button').forEach(boton=>boton.onclick=()=>{paginaMorosidad=Number(boton.dataset.pagina);renderMorosidad()});
  }
  function textoCobranza(x){
    const nombre=x?.beneficiario||'beneficiario(a) del Programa Ahorro GNV',monto=x?`S/ ${x.monto.toFixed(2)}`:'el monto pendiente indicado en su estado de cuenta',placa=x?.placa||'registrada';
    return `Estimado(a) ${nombre}:\n\nLe comunicamos que presenta un monto atrasado de ${monto}, correspondiente al financiamiento otorgado para la conversión a GNV de su vehículo con placa ${placa}.\n\nPara conocer el detalle de su deuda, ingrese a la plataforma de Consultas de Pagos FISE. Puede efectuar el pago mediante los canales autorizados BCP o Interbank.\n\nSi ya realizó el pago, por favor omita este mensaje.`;
  }
  function abrirMensaje(x=null){
    destinatarioMensajeActual=x;
    $('mensajeBeneficiarioGnv').textContent=x?.beneficiario||'Todos los beneficiarios con mora';
    $('mensajePlacaGnv').textContent=x?.placa||'Envío masivo';
    $('mensajeMontoGnv').textContent=x?`S/ ${x.monto.toFixed(2)}`:'Según cada registro';
    $('mensajeCuotasGnv').textContent=x?`${x.cuotas} cuota${x.cuotas===1?'':'s'}`:'Según cada registro';
    $('textoMensajeGnv').value=textoCobranza(x);
    abrirModal('modalMensajeGnv');
  }
  function agruparConteosGnv(lista,campo){
    const conteos=new Map();lista.forEach(x=>{const clave=typeof campo==='function'?campo(x):x[campo];conteos.set(clave,(conteos.get(clave)||0)+1)});return [...conteos].sort((a,b)=>b[1]-a[1]);
  }
  function actualizarTendenciaConversionesGnv(lista){
    const modo=$('graficaAgrupacion').value;
    const clave=modo==='anio'?x=>x.fecha.slice(0,4):modo==='region'?x=>x.region:x=>x.fecha.slice(0,7);
    let datos=agruparConteosGnv(lista,clave);
    if(modo!=='region')datos.sort((a,b)=>a[0].localeCompare(b[0]));
    const etiquetas=datos.map(([nombre])=>modo==='mes'?new Date(`${nombre}-01T00:00:00`).toLocaleDateString('es-PE',{month:'short',year:'2-digit'}):nombre);
    const barras=datos.map(x=>x[1]),acumuladas=[];barras.reduce((s,n)=>{acumuladas.push(s+n);return s+n},0);
    crearGraficoMixto('graficoConversiones',etiquetas.length?etiquetas:['Sin datos'],barras.length?barras:[0],acumuladas.length?acumuladas:[0]);
  }
  function iniciarMapaCalorGraficasGnv(){
    if(mapaCalorGraficasGnv)return;
    mapaCalorGraficasGnv=L.map('mapaCalorRecargasGnv',{zoomControl:true,attributionControl:true}).setView([-10.2,-75.2],5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(mapaCalorGraficasGnv);
    capaRecargasGnv=L.layerGroup().addTo(mapaCalorGraficasGnv);
  }
  function actualizarMapaCalorGraficasGnv(lista){
    const contenedorMapa=$('mapaCalorRecargasGnv');
    // Leaflet no puede calcular bien el lienzo mientras Gráficas está oculto.
    // Se crea la capa solamente cuando el panel ya tiene dimensiones reales.
    if(!contenedorMapa||contenedorMapa.offsetWidth===0||contenedorMapa.offsetHeight===0)return;
    iniciarMapaCalorGraficasGnv();capaRecargasGnv.clearLayers();
    const totalRecargas=lista.reduce((s,x)=>s+(Number(x.recargas)||0),0);
    $('totalRecargasGnv').textContent=`${totalRecargas.toLocaleString('es-PE')} recargas`;
    const ciudades=new Map();lista.forEach(x=>{const clave=`${x.provincia}|${x.region}`,actual=ciudades.get(clave)||{ciudad:x.provincia,region:x.region,lat:0,lng:0,n:0,recargas:0};actual.lat+=x.lat;actual.lng+=x.lng;actual.n++;actual.recargas+=x.recargas;ciudades.set(clave,actual)});
    const valores=[...ciudades.values()],max=Math.max(...valores.map(x=>x.recargas),1),limites=[];
    const puntosCalor=[];
    valores.forEach(x=>{const lat=x.lat/x.n,lng=x.lng/x.n,intensidad=Math.max(.18,x.recargas/max);puntosCalor.push([lat,lng,intensidad]);L.circleMarker([lat,lng],{radius:12,color:'transparent',weight:0,fillColor:'#fff',fillOpacity:.01}).bindTooltip(`<b>${x.ciudad}</b><br>${x.region} · ${x.recargas.toLocaleString('es-PE')} recargas`).addTo(capaRecargasGnv);limites.push([lat,lng])});
    if(puntosCalor.length&&contenedorMapa.offsetWidth>0&&contenedorMapa.offsetHeight>0){
      mapaCalorGraficasGnv.invalidateSize({pan:false});
      const calor=typeof L.heatLayer==='function'?L.heatLayer(puntosCalor,{radius:38,blur:30,maxZoom:10,minOpacity:.38,gradient:{.15:'#397de0',.38:'#39c7c1',.58:'#55c878',.78:'#ffd34e',1:'#ef4f3e'}}):crearCapaCalorLocal(puntosCalor);
      calor.addTo(capaRecargasGnv);
    }
    setTimeout(()=>{mapaCalorGraficasGnv.invalidateSize();if(limites.length)mapaCalorGraficasGnv.fitBounds(limites,{padding:[18,18],maxZoom:7})},80);
  }
  function actualizarGraficasFiltradasGnv(lista=filtrarGraficas()){
    actualizarTendenciaConversionesGnv(lista);
    $('graficaRegiones').innerHTML=barraLista(agruparConteosGnv(lista,'departamento').slice(0,6));
    $('graficaCombustibles').innerHTML=barraLista(agruparConteosGnv(lista,'combustible'));
    $('graficaPorCilindros').innerHTML=barraLista(agruparConteosGnv(lista,x=>`${x.cilindros} cilindro${x.cilindros===1?'':'s'}`));
    $('graficaEntidades').innerHTML=barraLista(agruparConteosGnv(lista,'entidadFinanciera'));
    actualizarMapaCalorGraficasGnv(lista);
    actualizarTablasGraficasGnv(lista);
  }
  function datosDetallePapGnv(){return[
    ['ago-26','2026.08.S3',3042425,117319728,68587272],['ago-26','2026.08.S2',1620285,114277303,71629697],['ago-26','2026.08.S1',3602100,112657018,73249982],
    ['jul-26','2026.07.S3',1590814,109054918,76852082],['jul-26','2026.07.S2',2374322,107464104,78442896],['jul-26','2026.07.S1',3217102,105089782,80817218],['jul-26','2026.06.S5',1885527,101872680,84034320],
    ['jun-26','2026.06.S4',2517376,99987153,85919847],['jun-26','2026.06.S3',3542591,97469777,88437223],['jun-26','2026.06.S2',2805393,93927186,91979814],['jun-26','2026.06.S1',1562310,91121793,94785207],
    ['may-26','2026.05.S4',4345607,89559483,96347517],['may-26','2026.05.S3',1453438,85213876,100693124],['may-26','2026.05.S2',1786071,83760438,102146562],['may-26','2026.05.S1',2095906,81974367,103932633],
    ['abr-26','2026.04.S4',2756560,79878461,106028539],['abr-26','2026.04.S3',5368536,77121901,108785099],['abr-26','2026.04.S2',3135060,71753365,114153635],['abr-26','2026.04.S1',6083542,68618305,117288695],
    ['mar-26','2026.03.S4',2624368,62534763,123372237],['mar-26','2026.03.S3',4410274,59910395,125996605],['mar-26','2026.03.S2',4822100,55500121,130406879],['mar-26','2026.03.S1',2264484,50678021,135228979],
    ['feb-26','2026.02.S4',1851599,52413537,133493463],['feb-26','2026.02.S3',3131086,50561938,135345062]
  ]}
  function datosMensualesPapGnv(){
    const orden=['feb-26','mar-26','abr-26','may-26','jun-26','jul-26','ago-26'];
    return orden.map(mes=>{const filas=datosDetallePapGnv().filter(x=>x[0]===mes);return[mes.slice(0,3).replace(/^./,x=>x.toUpperCase()),filas.reduce((s,x)=>s+x[2],0),Math.max(...filas.map(x=>x[3]))]});
  }
  function datosTablaGraficaGnv(tarjeta,lista){
    const titulo=tarjeta.querySelector('h2')?.textContent.trim()||'Gráfica';
    if(titulo.includes('conversiones por mes')){
      const modo=$('graficaAgrupacion').value,clave=modo==='anio'?x=>x.fecha.slice(0,4):modo==='region'?x=>x.region:x=>x.fecha.slice(0,7),datos=agruparConteosGnv(lista,clave);let acumulado=0;
      return [['Período','Conversiones','Acumulado'],datos.map(([nombre,valor])=>[nombre,valor,acumulado+=valor])];
    }
    if(titulo.includes('Meta vs.'))return [['Indicador','Valor'],[...tarjeta.querySelectorAll('.resumen-meta-real-gnv article')].map(x=>[x.querySelector('span')?.textContent,x.querySelector('strong')?.textContent])];
    if(titulo.includes('región'))return [['Departamento','Conversiones'],agruparConteosGnv(lista,'departamento').slice(0,10)];
    if(titulo.includes('combustible'))return [['Combustible','Vehículos'],agruparConteosGnv(lista,'combustible')];
    if(titulo.includes('cilindros'))return [['Configuración','Vehículos'],agruparConteosGnv(lista,x=>`${x.cilindros} cilindro${x.cilindros===1?'':'s'}`)];
    if(titulo.includes('financiera'))return [['Entidad financiera','Operaciones'],agruparConteosGnv(lista,'entidadFinanciera')];
    if(titulo.includes('Mapa de calor')){
      const ciudades=new Map();lista.forEach(x=>{const clave=`${x.provincia}|${x.region}`,actual=ciudades.get(clave)||[x.provincia,x.region,0];actual[2]+=Number(x.recargas)||0;ciudades.set(clave,actual)});
      return [['Ciudad','Región','Recargas'],[...ciudades.values()].sort((a,b)=>b[2]-a[2])];
    }
    if(titulo.includes('PAP 2025')){
      const moneda=valor=>`S/ ${valor.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})}`,montoPap=185907000,filas=datosDetallePapGnv().map(([mes,periodo,liquidado,acumulado,saldo])=>[mes,periodo,moneda(montoPap),moneda(liquidado),moneda(acumulado),moneda(saldo)]);
      filas.push(['Total','',moneda(montoPap),moneda(117319728),moneda(117319728),moneda(68587272)]);
      return [['Año/Mes','Período','Monto PAP 2025','Monto liquidado','Monto acumulado','Saldo PAP'],filas];
    }
    if(titulo.includes('Morosidad'))return [['Ámbito','Monto'],[['Lima',56919470],['Callao',4274856],['Ica',4161754],['Cusco',2115855],['La Libertad',1541545],['Piura',1167888]]];
    return [['Indicador','Valor'],[]];
  }
  function renderTablaGraficaGnv(tarjeta,lista){
    let tabla=tarjeta.querySelector('.tabla-alternativa-grafica-gnv');if(!tabla)return;
    const [cabeceras,filas]=datosTablaGraficaGnv(tarjeta,lista);
    tabla.classList.toggle('tabla-pap-detallada-gnv',tarjeta.querySelector('h2')?.textContent.includes('PAP 2025'));
    tabla.innerHTML=`<div><table><thead><tr>${cabeceras.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${filas.map(fila=>`<tr>${fila.map(valor=>`<td>${typeof valor==='number'?valor.toLocaleString('es-PE'):valor}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${cabeceras.length}">Sin datos para los filtros seleccionados.</td></tr>`}</tbody></table></div>`;
  }
  function actualizarTablasGraficasGnv(lista=filtrarGraficas()){document.querySelectorAll('#graficas .tarjeta-grafica-gnv.vista-tabla-gnv').forEach(tarjeta=>renderTablaGraficaGnv(tarjeta,lista))}
  function prepararAlternanciaGraficasGnv(){
    document.querySelectorAll('#graficas .tarjeta-grafica-gnv').forEach(tarjeta=>{
      const cabecera=tarjeta.querySelector(':scope>header');if(!cabecera||cabecera.querySelector('.alternar-tabla-grafica-gnv'))return;
      const boton=document.createElement('button');boton.type='button';boton.className='alternar-tabla-grafica-gnv';boton.textContent='Ver tabla';
      const tabla=document.createElement('section');tabla.className='tabla-alternativa-grafica-gnv';tarjeta.appendChild(tabla);
      boton.onclick=()=>{
        const mostrar=!tarjeta.classList.contains('vista-tabla-gnv');
        if(mostrar){tarjeta.dataset.alturaGraficaGnv=tarjeta.style.height||'';tarjeta.style.height=`${tarjeta.getBoundingClientRect().height}px`;tarjeta.classList.add('vista-tabla-gnv');renderTablaGraficaGnv(tarjeta,filtrarGraficas())}
        else{tarjeta.classList.remove('vista-tabla-gnv');tarjeta.style.height=tarjeta.dataset.alturaGraficaGnv||'';delete tarjeta.dataset.alturaGraficaGnv;if(tarjeta.classList.contains('grafica-calor-recargas-gnv'))setTimeout(()=>mapaCalorGraficasGnv?.invalidateSize(),50)}
        boton.textContent=mostrar?'Ver gráfica':'Ver tabla';
      };
      cabecera.appendChild(boton);
    });
  }
  function renderGraficas(){
    actualizarGraficoMetaReal();
    const mensualPap=datosMensualesPapGnv();crearGraficoMixto('graficoPap2025Gnv',mensualPap.map(x=>x[0]),mensualPap.map(x=>x[1]),mensualPap.map(x=>x[2]),'pap');
    $('graficaMorosidad').innerHTML=barraLista([['Lima',56919470],['Callao',4274856],['Ica',4161754],['Cusco',2115855],['La Libertad',1541545],['Piura',1167888]]);
    actualizarGraficasFiltradasGnv();
    prepararAlternanciaGraficasGnv();
  }
  function exportarResumen(){
    const formato=$('formatoExportarGraficas')?.value||'pdf',lista=filtrarGraficas();
    if(formato==='csv'){
      const columnas=['Código','Beneficiario','Departamento','Provincia','Distrito','Fecha','Combustible','Cilindros','Estado','Desembolsado'];
      const filas=lista.map(x=>[x.id,x.beneficiario,x.departamento,x.provincia,x.distrito,x.fecha,x.combustible,x.cilindros,x.estado,x.desembolsado]);
      const contenido='\uFEFF'+[columnas,...filas].map(f=>f.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\r\n');
      const enlace=document.createElement('a');enlace.href=URL.createObjectURL(new Blob([contenido],{type:'text/csv;charset=utf-8'}));enlace.download='graficas-ahorro-gnv.csv';enlace.click();setTimeout(()=>URL.revokeObjectURL(enlace.href),0);return;
    }
    if(formato==='xlsx'){
      const filas=lista.map(x=>({Código:x.id,Beneficiario:x.beneficiario,Departamento:x.departamento,Provincia:x.provincia,Distrito:x.distrito,Fecha:x.fecha,Combustible:x.combustible,Cilindros:x.cilindros,Estado:x.estado,Desembolsado:x.desembolsado}));
      if(window.XLSX){
        const libro=XLSX.utils.book_new(),hoja=XLSX.utils.json_to_sheet(filas);
        hoja['!cols']=[14,28,18,18,18,13,18,11,18,16].map(wch=>({wch}));
        XLSX.utils.book_append_sheet(libro,hoja,'Gráficas GNV');
        XLSX.writeFile(libro,'graficas-ahorro-gnv.xlsx');
      }else{
        const columnas=Object.keys(filas[0]||{Código:'',Beneficiario:'',Departamento:'',Provincia:'',Distrito:'',Fecha:'',Combustible:'',Cilindros:'',Estado:'',Desembolsado:''});
        const escapar=valor=>String(valor??'').replace(/[&<>]/g,caracter=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[caracter]));
        const contenido=`\uFEFF<html><head><meta charset="utf-8"><style>body,table{background:#fff;color:#17203a;font-family:Arial}table{border-collapse:collapse}th,td{padding:7px;border:1px solid #cfd9e5}th{font-weight:700;background:#eef3f8}</style></head><body><table><thead><tr>${columnas.map(columna=>`<th>${escapar(columna)}</th>`).join('')}</tr></thead><tbody>${filas.map(fila=>`<tr>${columnas.map(columna=>`<td>${escapar(fila[columna])}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
        descargarBlob(contenido,'application/vnd.ms-excel;charset=utf-8','graficas-ahorro-gnv.xls');
      }
      return;
    }
    const ventana=window.open('','_blank','width=1200,height=850');if(!ventana)return;
    const nodosReporte=[...document.querySelectorAll('#graficas .kpis-graficas-gnv,#graficas .tarjeta-grafica-gnv')];
    nodosReporte.sort((a,b)=>{const orden=nodo=>nodo.classList.contains('kpis-graficas-gnv')?0:nodo.classList.contains('grafica-calor-recargas-gnv')?1:2;return orden(a)-orden(b)});
    const graficas=nodosReporte.map(nodo=>{
      const clon=nodo.cloneNode(true),lienzosOriginales=[...nodo.querySelectorAll('canvas')],lienzosClon=[...clon.querySelectorAll('canvas')];
      lienzosClon.forEach((lienzo,i)=>{try{const original=lienzosOriginales[i],imagen=document.createElement('img');imagen.src=original.toDataURL('image/png');imagen.className=`${lienzo.className||''} captura-canvas-exportacion-gnv`;imagen.style.cssText=lienzo.style.cssText;imagen.style.width=`${original.offsetWidth||original.width}px`;imagen.style.height=`${original.offsetHeight||original.height}px`;lienzo.replaceWith(imagen)}catch(error){lienzo.remove()}});
      return clon.outerHTML;
    }).join('');
    const estilos=[...document.querySelectorAll('link[rel="stylesheet"]')].filter(link=>!link.href.includes('tema_oscuro')).map(link=>`<link rel="stylesheet" href="${link.href}">`).join('');
    const logoFise=new URL('../../img/logo_fise.png',location.href).href,fechaReporte=new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
    ventana.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reporte de Gráficas · Ahorro GNV</title>${estilos}<style>
      @page{size:A4 portrait;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}html,body{margin:0;background:#fff!important;color:#17203a!important;font-family:Arial,sans-serif}.papeleria-fise-cabecera{position:fixed;z-index:20;top:10mm;right:15mm;width:42mm;text-align:right}.papeleria-fise-cabecera img{display:block;width:100%;height:auto}.papeleria-fise-pie{position:fixed;z-index:20;right:0;bottom:0;left:0;height:32mm;background:#fff!important}.contacto-fise{position:absolute;bottom:11mm;left:15mm;color:#222;font-size:8pt;line-height:1.35}.contacto-fise::before{content:"";display:block;width:47mm;margin-bottom:2mm;border-top:.4mm solid #333}.franja-fise{position:absolute;right:0;bottom:0;left:0;height:9mm;background:#41689a!important;border-left:27mm solid #35aeb9!important}.reporte-graficas{padding:31mm 15mm 34mm}.encabezado-reporte{margin-bottom:7mm;padding-bottom:4mm;border-bottom:.6mm solid #41689a}.encabezado-reporte small{color:#e36f35;font-size:8pt;font-weight:700;letter-spacing:.08em}.encabezado-reporte h1{margin:2mm 0 1mm;color:#123b76;font-size:19pt}.encabezado-reporte p{margin:0;color:#5d6878;font-size:9pt}.reporte-grid{display:grid!important;grid-template-columns:1fr 1fr!important;grid-auto-flow:row!important;grid-auto-rows:auto!important;gap:4mm}.reporte-grid>*{grid-row:auto!important;grid-column:auto!important;position:relative!important}.reporte-grid>.kpis-graficas-gnv,.reporte-grid>.grafica-calor-recargas-gnv,.reporte-grid>.grafica-pap-gnv,.reporte-grid>.grafica-morosidad-gnv{grid-column:1/-1!important}.reporte-grid .kpis-graficas-gnv{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:3mm!important}.reporte-grid .kpis-graficas-gnv article,.reporte-grid .tarjeta-grafica-gnv,.reporte-grid .resumen-pap-gnv article,.reporte-grid .resumen-meta-real-gnv article{color:#17203a!important;border:1px solid #ccd8e5!important;background:#fff!important;box-shadow:none!important}.reporte-grid .kpis-graficas-gnv article{min-height:18mm;padding:3mm!important}.reporte-grid .kpis-graficas-gnv span,.reporte-grid .tarjeta-grafica-gnv p,.reporte-grid .barra-grafica span,.reporte-grid .leyenda-grafica-gnv,.reporte-grid .leyenda-meta-real-gnv{color:#68758a!important}.reporte-grid .kpis-graficas-gnv strong,.reporte-grid .tarjeta-grafica-gnv h2,.reporte-grid .resumen-pap-gnv strong{color:#173f7a!important}.reporte-grid .tarjeta-grafica-gnv{height:auto!important;min-height:58mm;margin:0!important;padding:4mm!important;break-inside:avoid;page-break-inside:avoid;visibility:visible!important;opacity:1!important}.reporte-grid .grafica-calor-recargas-gnv{min-height:80mm}.reporte-grid .grafica-calor-recargas-gnv #mapaCalorRecargasGnv{position:relative!important;height:65mm!important;min-height:65mm!important;visibility:visible!important}.reporte-grid .grafica-calor-recargas-gnv .leaflet-pane,.reporte-grid .grafica-calor-recargas-gnv .leaflet-map-pane{visibility:visible!important;opacity:1!important}.captura-canvas-exportacion-gnv{display:block!important;max-width:none!important;object-fit:fill}.reporte-grid .grafica-pap-gnv{min-height:82mm}.reporte-grid .grafica-morosidad-gnv{min-height:55mm}.reporte-grid .grafico-svg-gnv,.reporte-grid .lista-barras-gnv,.reporte-grid svg{display:block!important;visibility:visible!important;opacity:1!important}.reporte-grid svg text{fill:#536176!important}.reporte-grid .leaflet-control-container{display:none!important}@media print{.papeleria-fise-cabecera,.papeleria-fise-pie{display:block!important}.reporte-graficas{padding-top:31mm;padding-bottom:34mm}.reporte-grid .tarjeta-grafica-gnv{break-inside:avoid;page-break-inside:avoid}}
    </style></head><body><header class="papeleria-fise-cabecera"><img src="${logoFise}" alt="FISE"></header><footer class="papeleria-fise-pie"><div class="contacto-fise">Dirección: Av. San Borja Sur 417, San Borja.<br>Teléfono: (01) 5100300 Anexo 7101<br>Web: www.fise.gob.pe</div><div class="franja-fise"></div></footer><main class="reporte-graficas"><section class="encabezado-reporte"><small>FONDO DE INCLUSIÓN SOCIAL ENERGÉTICO</small><h1>Programa Ahorro GNV · Reporte de gráficas</h1><p>Fecha de emisión: ${fechaReporte} · ${lista.length} registros según los filtros seleccionados</p></section><div class="reporte-grid">${graficas}</div></main><script>window.onload=()=>{const imagenes=[...document.images];Promise.all(imagenes.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve}))).then(()=>setTimeout(()=>window.print(),500))}<\/script></body></html>`);ventana.document.close();
    ventana.document.body?.classList.add('pagina-acceso');
    ventana.document.head?.insertAdjacentHTML('beforeend',`<style>
      html,html body.pagina-acceso,html body.pagina-acceso .reporte-graficas{background:#fff!important;background-color:#fff!important;color:#17203a!important}
      html body.pagina-acceso::before,html body.pagina-acceso::after{display:none!important;background:none!important}
      html body.pagina-acceso .encabezado-reporte,html body.pagina-acceso .reporte-grid,html body.pagina-acceso .reporte-grid>*{background:#fff!important;background-color:#fff!important}
      html body.pagina-acceso .papeleria-fise-cabecera{width:25mm!important;top:11mm!important;right:15mm!important;background:#fff!important}
      html body.pagina-acceso .alternar-tabla-grafica-gnv{display:none!important}
      html body.pagina-acceso .grafica-morosidad-gnv button{display:none!important}
      html body.pagina-acceso .reporte-grid>.grafica-calor-recargas-gnv{order:1!important;grid-column:1/-1!important;margin-top:5mm!important;margin-bottom:6mm!important}
      html body.pagina-acceso .reporte-grid>.kpis-graficas-gnv{order:0!important}
      html body.pagina-acceso .reporte-grid>.tarjeta-grafica-gnv:not(.grafica-calor-recargas-gnv){order:2!important;margin-bottom:4mm!important}
      @media print{
        @page{size:A4 portrait;margin:0!important}
        html,html body.pagina-acceso,html body.pagina-acceso .reporte-graficas{background:#fff!important;background-color:#fff!important}
        html body.pagina-acceso .reporte-graficas{padding:28mm 15mm 34mm!important}
        html body.pagina-acceso .papeleria-fise-cabecera{position:fixed!important;top:4mm!important;right:15mm!important;width:23mm!important;height:20mm!important;display:flex!important;align-items:flex-start!important;justify-content:flex-end!important;background:#fff!important}
        html body.pagina-acceso .papeleria-fise-cabecera img{width:23mm!important;max-height:22mm!important;object-fit:contain!important}
        html body.pagina-acceso .papeleria-fise-pie{position:fixed!important;right:auto!important;bottom:0!important;left:0!important;width:100vw!important;height:32mm!important;overflow:hidden!important;background:#fff!important}
        html body.pagina-acceso .papeleria-fise-pie .franja-fise{right:auto!important;left:0!important;width:100vw!important}
        html body.pagina-acceso .reporte-grid .tarjeta-grafica-gnv{break-inside:avoid!important;page-break-inside:avoid!important;box-decoration-break:clone;-webkit-box-decoration-break:clone}
        html body.pagina-acceso .reporte-grid>.grafica-calor-recargas-gnv{break-before:auto!important;break-after:page!important;page-break-after:always!important;page-break-inside:avoid!important}
        html body.pagina-acceso .reporte-grid>.grafica-calor-recargas-gnv+.grafica-tendencia-gnv{margin-top:25mm!important}
        html body.pagina-acceso .reporte-grid>.grafica-pap-gnv{break-before:page!important;page-break-before:always!important;margin-top:25mm!important}
      }
    </style>`);
  }
  function registrosExportacion(){return seleccionActual?[seleccionActual]:visibles}
  function abrirExportacion(){
    const lista=registrosExportacion(),seleccion=Boolean(seleccionActual);
    $('tituloExportacionGnv').textContent=seleccion?`Reporte ${seleccionActual.id}`:'Reporte Ahorro GNV';
    $('descripcionExportacionGnv').textContent=seleccion?'El reporte incluirá únicamente la conversión seleccionada.':'El reporte incluirá las conversiones visibles según los filtros aplicados.';
    $('alcanceExportacionGnv').textContent=seleccion?'Conversión seleccionada':'Registros filtrados';
    $('cantidadExportacionGnv').textContent=lista.length.toLocaleString('es-PE');
    abrirModal('modalExportacionGnv');
  }
  function contenidoExportacion(lista,separador=';'){
    const cabeceras=['Código','Beneficiario','DNI','Placa','Estado','Combustible','Cilindros','Servicio','Taller','Fecha','Departamento','Provincia','Distrito','Desembolsado'];
    const filas=lista.map(x=>[x.id,x.beneficiario,x.dni,x.placa,x.estado,x.combustible,x.cilindros,x.servicio,x.taller,x.fecha,x.departamento,x.provincia,x.distrito,x.desembolsado]);
    return '\uFEFF'+[cabeceras,...filas].map(fila=>fila.map(valor=>`"${String(valor??'').replaceAll('"','""')}"`).join(separador)).join('\r\n');
  }
  function descargarBlob(contenido,tipo,nombre){
    const enlace=document.createElement('a'),url=URL.createObjectURL(new Blob([contenido],{type:tipo}));
    enlace.href=url;enlace.download=nombre;document.body.appendChild(enlace);enlace.click();enlace.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  function generarExportacion(){
    const lista=registrosExportacion(),formato=document.querySelector('[name="formatoExportacionGnv"]:checked').value,nombreBase=seleccionActual?seleccionActual.id.toLowerCase():'ahorro-gnv';
    if(formato==='csv')descargarBlob(contenidoExportacion(lista), 'text/csv;charset=utf-8',`${nombreBase}.csv`);
    else if(formato==='xlsx')descargarBlob(contenidoExportacion(lista,'\t'),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',`${nombreBase}.xlsx`);
    else{
      const filas=lista.map(x=>`<tr><td>${x.id}</td><td>${x.beneficiario}</td><td>${x.placa}</td><td>${x.estado}</td><td>${x.departamento}</td><td>S/ ${x.desembolsado.toLocaleString('es-PE')}</td></tr>`).join('');
      const ventana=window.open('','_blank','width=1000,height=760');
      if(ventana){ventana.document.write(`<!doctype html><html><head><title>Reporte Ahorro GNV</title><style>body{font-family:Arial;padding:28px;color:#17203a}h1{font-size:24px;border-bottom:5px solid #3aa0c7;padding-bottom:12px}p{color:#65758a}table{width:100%;border-collapse:collapse;font-size:12px}th{color:white;background:#287f9e}th,td{padding:9px;border:1px solid #d7e1e8;text-align:left}</style></head><body><h1>AHORRO GNV · Reporte de conversiones</h1><p>${seleccionActual?'Conversión seleccionada':'Registros filtrados'} · ${lista.length} registro(s)</p><table><thead><tr><th>Código</th><th>Beneficiario</th><th>Placa</th><th>Estado</th><th>Departamento</th><th>Desembolsado</th></tr></thead><tbody>${filas}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);ventana.document.close()}
    }
    cerrarModal('modalExportacionGnv');
  }
  function cargarReglaBonoGnv(){
    try{reglaBonoGnv={...reglaBonoPredeterminada,...JSON.parse(localStorage.getItem('ahorroGnvReglaBonoProvincia')||'{}')}}catch{reglaBonoGnv={...reglaBonoPredeterminada}}
  }
  function aplicaUbicacionReglaBonoGnv(registro){return(!reglaBonoGnv.departamento||registro.departamento===reglaBonoGnv.departamento)&&(!reglaBonoGnv.provincia||registro.provincia===reglaBonoGnv.provincia)}
  function textoAmbitoReglaBonoGnv(){return reglaBonoGnv.provincia?`${reglaBonoGnv.provincia}, ${reglaBonoGnv.departamento}`:reglaBonoGnv.departamento?`el departamento de ${reglaBonoGnv.departamento}`:'todo el país'}
  function actualizarResumenReglaBonoGnv(){
    const activa=$('reglaBonoActivaGnv').checked,dias=Number($('reglaDiasPerdidaGnv').value)||30,departamento=$('reglaDepartamentoGnv').value,provincia=$('reglaProvinciaGnv').value;
    const lugar=provincia?`${provincia}, ${departamento}`:departamento?`el departamento de ${departamento}`:'todo el país';
    $('resumenReglaBonoGnv').textContent=activa?`El bono se perderá con más de ${dias} días sin recarga en ${lugar}.`:'La regla está desactivada; ningún registro será clasificado como bono perdido.';
  }
  function llenarProvinciasReglaBonoGnv(valor=''){
    const departamento=$('reglaDepartamentoGnv').value,select=$('reglaProvinciaGnv');
    llenarSelect('reglaProvinciaGnv',unicos('provincia',registros.filter(x=>!departamento||x.departamento===departamento)),'Todas las provincias');
    select.disabled=!departamento;if([...select.options].some(x=>x.value===valor))select.value=valor;
  }
  function abrirReglasBonoGnv(){
    cargarReglaBonoGnv();llenarSelect('reglaDepartamentoGnv',unicos('departamento'),'Todo el país');
    $('reglaDepartamentoGnv').value=reglaBonoGnv.departamento;$('reglaBonoActivaGnv').checked=reglaBonoGnv.activa;$('reglaDiasRiesgoGnv').value=reglaBonoGnv.diasRiesgo;$('reglaDiasPerdidaGnv').value=reglaBonoGnv.diasPerdida;
    llenarProvinciasReglaBonoGnv(reglaBonoGnv.provincia);$('actualizacionReglaBonoGnv').textContent=reglaBonoGnv.actualizado;actualizarResumenReglaBonoGnv();abrirModal('modalReglasBonoGnv');
  }
  function guardarReglasBonoGnv(evento){
    evento.preventDefault();const diasRiesgo=Number($('reglaDiasRiesgoGnv').value),diasPerdida=Number($('reglaDiasPerdidaGnv').value);
    if(diasRiesgo>=diasPerdida){$('reglaDiasRiesgoGnv').setCustomValidity('La alerta preventiva debe comenzar antes de la pérdida del bono.');$('reglaDiasRiesgoGnv').reportValidity();return}
    $('reglaDiasRiesgoGnv').setCustomValidity('');const ahora=new Date();reglaBonoGnv={activa:$('reglaBonoActivaGnv').checked,diasRiesgo,diasPerdida,departamento:$('reglaDepartamentoGnv').value,provincia:$('reglaProvinciaGnv').value,actualizado:`${ahora.toLocaleDateString('es-PE')} · ${ahora.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}`};
    localStorage.setItem('ahorroGnvReglaBonoProvincia',JSON.stringify(reglaBonoGnv));cerrarModal('modalReglasBonoGnv');
    if(!$('modalReporteRecargasGnv').hidden)renderReporteRecargasGnv();
  }
  function datosReporteRecargasGnv(){
    return registros.map((registro,indice)=>{
      const diasSinRecarga=(indice*7+Number(String(registro.placa||'').replace(/\D/g,'').slice(-2)||0))%46;
      const aplica=reglaBonoGnv.activa&&aplicaUbicacionReglaBonoGnv(registro),estado=aplica&&diasSinRecarga>reglaBonoGnv.diasPerdida?'Bono perdido':aplica&&diasSinRecarga>=reglaBonoGnv.diasRiesgo?'En riesgo':'Vigente';
      const recargas=Math.max(1,(registro.recargas||3)+(indice%5)-2);
      return {...registro,semana:`Semana ${27+(indice%5)}`,diasSinRecarga,estadoRecarga:estado,recargasSemana:recargas,volumen:recargas*(11+(indice%7))};
    });
  }
  function filtrarReporteRecargasGnv(){
    const semana=$('reporteSemanaGnv').value,departamento=$('reporteDepartamentoGnv').value,provincia=$('reporteProvinciaGnv').value,estado=$('reporteEstadoGnv').value;
    return datosReporteRecargasGnv().filter(x=>(!semana||x.semana===semana)&&(!departamento||x.departamento===departamento)&&(!provincia||x.provincia===provincia)&&(!estado||x.estadoRecarga===estado));
  }
  function prepararFiltrosReporteRecargasGnv(){
    llenarSelect('reporteSemanaGnv',['Semana 27','Semana 28','Semana 29','Semana 30','Semana 31'],'Todas');
    llenarSelect('reporteDepartamentoGnv',unicos('departamento'),'Todos');
    actualizarProvinciasReporteRecargasGnv();
  }
  function actualizarProvinciasReporteRecargasGnv(){
    const departamento=$('reporteDepartamentoGnv').value;
    llenarSelect('reporteProvinciaGnv',unicos('provincia',registros.filter(x=>!departamento||x.departamento===departamento)),'Todas');
  }
  function renderReporteRecargasGnv(){
    const lista=filtrarReporteRecargasGnv(),porPagina=6,totalPaginas=Math.max(1,Math.ceil(lista.length/porPagina));
    paginaReporteRecargas=Math.min(paginaReporteRecargas,totalPaginas);
    const inicio=(paginaReporteRecargas-1)*porPagina,filas=lista.slice(inicio,inicio+porPagina);
    $('kpiVehiculosRecargasGnv').textContent=lista.length.toLocaleString('es-PE');
    $('kpiRecargasGnv').textContent=lista.reduce((total,x)=>total+x.recargasSemana,0).toLocaleString('es-PE');
    $('kpiBonoPerdidoGnv').textContent=lista.filter(x=>x.estadoRecarga==='Bono perdido').length.toLocaleString('es-PE');
    $('kpiRiesgoRecargasGnv').textContent=lista.filter(x=>x.estadoRecarga==='En riesgo').length.toLocaleString('es-PE');
    $('tablaReporteRecargasGnv').innerHTML=filas.map(x=>`<tr><td>${x.semana}</td><td><strong>${x.placa}</strong></td><td>${x.departamento}</td><td><strong>${x.provincia}</strong><small>${x.taller}</small></td><td>${x.recargasSemana}</td><td>${x.volumen} m³</td><td>${x.diasSinRecarga} días</td><td><span class="estado-recarga-gnv estado-${x.estadoRecarga.toLowerCase().replaceAll(' ','-')}">${x.estadoRecarga}</span></td></tr>`).join('')||'<tr><td colspan="8" class="sin-datos-recargas-gnv">No hay registros para los filtros seleccionados.</td></tr>';
    $('resumenPaginacionRecargasGnv').textContent=lista.length?`Mostrando ${inicio+1}–${Math.min(inicio+porPagina,lista.length)} de ${lista.length} registros`:'Mostrando 0 registros';
    $('paginaRecargasGnv').textContent=`Página ${paginaReporteRecargas} de ${totalPaginas}`;
    $('anteriorRecargasGnv').disabled=paginaReporteRecargas===1;$('siguienteRecargasGnv').disabled=paginaReporteRecargas===totalPaginas;
  }
  function abrirReporteRecargasGnv(){cargarReglaBonoGnv();prepararFiltrosReporteRecargasGnv();$('kpiBonoPerdidoGnv').nextElementSibling.textContent=reglaBonoGnv.activa?`Más de ${reglaBonoGnv.diasPerdida} días · ${textoAmbitoReglaBonoGnv()}`:'Regla desactivada';paginaReporteRecargas=1;renderReporteRecargasGnv();abrirModal('modalReporteRecargasGnv')}
  function exportarReporteRecargasGnv(){
    const cabeceras=['Semana','Placa','Departamento','Provincia','Grifo','Recargas','Volumen m3','Días sin recarga','Estado'];
    const filas=filtrarReporteRecargasGnv().map(x=>[x.semana,x.placa,x.departamento,x.provincia,x.taller,x.recargasSemana,x.volumen,x.diasSinRecarga,x.estadoRecarga]);
    descargarBlob('\uFEFF'+[cabeceras,...filas].map(f=>f.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\r\n'),'text/csv;charset=utf-8','reporte-recargas-bono-provincia.csv');
  }
  function estadoCofideGnv(){
    const ahora=new Date(),hora=ahora.toLocaleTimeString('es-PE',{hour12:false}),base={registros:1248,ultima:`Hoy · ${hora}`,logs:[
      {tipo:'exito',texto:`${hora} · Sincronización exitosa · 36 recaudos y 12 financiamientos actualizados.`},
      {tipo:'exito',texto:'Conexión autenticada con Amazon COFIDE.'},
      {tipo:'error',texto:'Tiempo de espera excedido · reintento automático completado.'}
    ]};
    try{return{...base,...JSON.parse(localStorage.getItem('ahorroGnvEstadoCofide')||'{}')}}catch{return base}
  }
  function renderApiCofideGnv(estado=estadoCofideGnv()){
    $('ultimaSincronizacionCofideGnv').textContent=estado.ultima;$('procesamientoCofideGnv').textContent=`${Number(estado.registros).toLocaleString('es-PE')} registros`;
    $('logsApiCofideGnv').innerHTML=estado.logs.slice(0,4).map(log=>`<li class="${log.tipo}"><i></i><span>${log.texto}</span></li>`).join('');
  }
  function sincronizarApiCofideGnv(){
    const boton=$('sincronizarApiCofideGnv'),estado=estadoCofideGnv(),ahora=new Date(),hora=ahora.toLocaleTimeString('es-PE',{hour12:false});
    boton.disabled=true;boton.textContent='Sincronizando…';$('estadoApiCofideGnv').textContent='Sincronizando';$('estadoApiCofideGnv').classList.add('sincronizando');
    setTimeout(()=>{const actualizado={registros:estado.registros+48,ultima:`Hoy · ${hora}`,logs:[{tipo:'exito',texto:`${hora} · Sincronización exitosa · 36 recaudos y 12 financiamientos actualizados.`},...estado.logs].slice(0,4)};localStorage.setItem('ahorroGnvEstadoCofide',JSON.stringify(actualizado));renderApiCofideGnv(actualizado);$('estadoApiCofideGnv').textContent='Conectado';$('estadoApiCofideGnv').classList.remove('sincronizando');boton.disabled=false;boton.textContent='Sincronizar ahora'},900);
  }
  function enlazarEventos(){
    $('filtrosGnv').onsubmit=evento=>{evento.preventDefault();actualizarMapa(true)};
    $('alternarLeyendaGnv').onclick=()=>{const leyenda=$('leyendaMapaGnv'),cerrar=!leyenda.classList.contains('colapsada');leyenda.classList.toggle('colapsada',cerrar);$('alternarLeyendaGnv').setAttribute('aria-expanded',String(!cerrar));$('alternarLeyendaGnv').setAttribute('aria-label',cerrar?'Mostrar leyenda':'Ocultar leyenda');$('alternarLeyendaGnv').title=cerrar?'Mostrar leyenda':'Ocultar leyenda';};
    $('filtrosGnv').onreset=()=>setTimeout(()=>{prepararFiltros();actualizarMapa(true)},0);
    $('filtroDepartamento').onchange=()=>{const lista=registros.filter(x=>!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value);llenarSelect('filtroProvincia',unicos('provincia',lista),'Todas');llenarSelect('filtroDistrito',unicos('distrito',lista),'Todos')};
    $('filtroProvincia').onchange=()=>{const lista=registros.filter(x=>(!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value)&&(!$('filtroProvincia').value||x.provincia===$('filtroProvincia').value));llenarSelect('filtroDistrito',unicos('distrito',lista),'Todos')};
    document.querySelectorAll('[data-estado]').forEach(control=>control.onchange=()=>actualizarMapa(false));
    $('capaTalleresGnv').onchange=evento=>evento.target.checked?grupoTalleresGnv.addTo(mapa):mapa.removeLayer(grupoTalleresGnv);
    $('capaGrifosGnv').onchange=evento=>evento.target.checked?grupoGrifosGnv.addTo(mapa):mapa.removeLayer(grupoGrifosGnv);
    $('botonFiltrosGnv').onclick=()=>{const contenedor=$('contenedorFiltrosGnv'),colapsado=contenedor.classList.toggle('colapsado');$('botonFiltrosGnv').setAttribute('aria-expanded',String(!colapsado));$('botonFiltrosGnv').setAttribute('aria-label',colapsado?'Mostrar filtros':'Ocultar filtros');requestAnimationFrame(()=>mapa.invalidateSize({pan:false}));setTimeout(()=>mapa.invalidateSize({pan:false}),250)};
    $('botonMapas').onclick=evento=>{L.DomEvent.stopPropagation(evento);alternarPanel('panelMapas',$('botonMapas'))};
    $('botonCapas').onclick=evento=>{L.DomEvent.stopPropagation(evento);alternarPanel('panelCapas',$('botonCapas'))};
    $('botonTematicos').onclick=evento=>{L.DomEvent.stopPropagation(evento);alternarPanel('panelTematicos',$('botonTematicos'))};
    $('activarCalor').onchange=()=>{
      modoTematico=$('activarCalor').checked;
      const leyendaBase=$('leyendaMapaGnv');
      if(leyendaBase){
        leyendaBase.hidden=modoTematico;
        leyendaBase.style.display=modoTematico?'none':'';
        leyendaBase.setAttribute('aria-hidden',String(modoTematico));
      }
      actualizarMapa(false);
    };
    ['panelMapas','panelCapas','panelTematicos'].forEach(id=>{L.DomEvent.disableClickPropagation($(id));L.DomEvent.disableScrollPropagation($(id))});
    document.querySelectorAll('[name="mapaBase"]').forEach(control=>control.onchange=()=>{mapa.removeLayer(baseActual);baseActual=bases[control.value].addTo(mapa);baseActual.bringToBack()});
    $('botonPanelGnv').onclick=()=>{const tablero=document.querySelector('.tablero-gnv'),oculto=tablero.classList.toggle('panel-oculto');$('botonPanelGnv').setAttribute('aria-label',oculto?'Mostrar panel derecho':'Ocultar panel derecho');requestAnimationFrame(()=>mapa.invalidateSize({pan:false}));setTimeout(()=>mapa.invalidateSize({pan:false}),250)};
    $('abrirHerramientasGnv').onclick=()=>{
      const abrir=$('grupoHerramientasGnv').hidden;
      $('grupoHerramientasGnv').hidden=!abrir;
      $('abrirHerramientasGnv').setAttribute('aria-expanded',String(abrir));
    };
    document.querySelectorAll('[data-herramienta-gnv]').forEach(boton=>boton.onclick=()=>activarHerramienta(boton.dataset.herramientaGnv,boton));
    [['archivoDniIaGnv','nombreDniIaGnv'],['archivoTivIaGnv','nombreTivIaGnv'],['archivoFirmaIaGnv','nombreFirmaIaGnv']].forEach(([entrada,nombre])=>{
      $(entrada).onchange=()=>{$(nombre).textContent=$(entrada).files[0]?.name||'Ningún archivo seleccionado'};
    });
    $('iniciarValidacionIaGnv').onclick=ejecutarValidacionIa;
    $('reintentarValidacionIaGnv').onclick=reiniciarValidacionIa;
    document.querySelectorAll('[data-firma-lote]').forEach(control=>control.onchange=actualizarConteoFirmaGnv);
    $('checkTodasLiquidacionesGnv').onchange=()=>{
      document.querySelectorAll('[data-firma-lote]:not(:disabled)').forEach(control=>control.checked=$('checkTodasLiquidacionesGnv').checked);
      actualizarConteoFirmaGnv();
    };
    $('seleccionarLoteGnv').onclick=()=>{
      document.querySelectorAll('[data-firma-lote]:not(:disabled)').forEach(control=>control.checked=true);
      actualizarConteoFirmaGnv();
    };
    $('generarPdfLoteGnv').onclick=()=>{
      const cantidad=document.querySelectorAll('[data-firma-lote]:checked').length||document.querySelectorAll('[data-firma-lote]:not(:disabled)').length;
      $('kpiPdfGnv').textContent=cantidad;$('generarPdfLoteGnv').textContent='PDF listos para firma';
      setTimeout(()=>$('generarPdfLoteGnv').textContent='Generar PDF',1600);
    };
    $('verPdfFirmadoGnv').onclick=()=>{
      const boton=$('verPdfFirmadoGnv'),texto=boton.textContent;boton.textContent='PDF verificado · listo para publicar';setTimeout(()=>boton.textContent=texto,1800);
    };
    $('exportarAuditoriaGnv').onclick=exportarAuditoriaFirmaGnv;
    $('plantillaLegalGnv').onchange=()=>actualizarVistaInformeGnv(false);
    $('registroInformeGnv').onchange=cargarRegistroInformeGnv;
    $('fechaInformeGnv').onchange=()=>actualizarVistaInformeGnv(false);
    $('asuntoInformeGnv').oninput=()=>actualizarVistaInformeGnv(false);
    $('adjuntarFirmaInformeGnv').onchange=()=>actualizarVistaInformeGnv(false);
    $('generarNumeracionGnv').onclick=generarNumeracionInformeGnv;
    $('actualizarVistaInformeGnv').onclick=()=>actualizarVistaInformeGnv(true);
    $('generarPdfLegalGnv').onclick=generarPdfLegalGnv;
    const canvasFirmaInforme=$('canvasFirmaInformeGnv');
    canvasFirmaInforme.addEventListener('pointerdown',evento=>{
      evento.preventDefault();trazandoFirmaInformeGnv=true;canvasFirmaInforme.setPointerCapture(evento.pointerId);
      const punto=puntoFirmaInformeGnv(evento),contexto=canvasFirmaInforme.getContext('2d');contexto.beginPath();contexto.moveTo(punto.x,punto.y);
    });
    canvasFirmaInforme.addEventListener('pointermove',evento=>{
      if(!trazandoFirmaInformeGnv)return;
      const punto=puntoFirmaInformeGnv(evento),contexto=canvasFirmaInforme.getContext('2d');contexto.lineTo(punto.x,punto.y);contexto.stroke();
      firmaInformeDibujadaGnv=true;$('ayudaFirmaInformeGnv').hidden=true;
      $('textoFirmaInformeGnv').textContent='Firma digital registrada';$('hashFirmaInformeGnv').textContent='Firma local · lista para adjuntar';
    });
    const terminarFirmaInforme=()=>{trazandoFirmaInformeGnv=false};
    canvasFirmaInforme.addEventListener('pointerup',terminarFirmaInforme);canvasFirmaInforme.addEventListener('pointercancel',terminarFirmaInforme);
    $('limpiarFirmaInformeGnv').onclick=()=>prepararFirmaInformeGnv(true);
    document.querySelectorAll('.enlace-menu[href^="#"]').forEach(enlace=>enlace.addEventListener('click',()=>setTimeout(actualizarVisibilidadHerramientas,0)));
    const mover=document.querySelector('[data-herramienta-gnv="mover"]');
    mover.addEventListener('pointerdown',evento=>{
      if(!$('barraHerramientasGnv').classList.contains('movible'))return;
      evento.preventDefault();
      const grupo=$('grupoHerramientasGnv'),rect=grupo.getBoundingClientRect();
      grupo.style.position='fixed';grupo.style.left=`${rect.left}px`;grupo.style.top=`${rect.top}px`;grupo.style.right='auto';
      arrastreHerramientas={x:evento.clientX-rect.left,y:evento.clientY-rect.top};
      mover.setPointerCapture(evento.pointerId);
    });
    mover.addEventListener('pointermove',evento=>{
      if(!arrastreHerramientas)return;
      const grupo=$('grupoHerramientasGnv');
      grupo.style.left=`${Math.max(0,Math.min(innerWidth-grupo.offsetWidth,evento.clientX-arrastreHerramientas.x))}px`;
      grupo.style.top=`${Math.max(0,Math.min(innerHeight-grupo.offsetHeight,evento.clientY-arrastreHerramientas.y))}px`;
    });
    mover.addEventListener('pointerup',()=>{arrastreHerramientas=null});
    $('exportarGraficas').onclick=exportarResumen;
    $('abrirExportacionGnv').onclick=abrirExportacion;
    $('generarExportacionGnv').onclick=generarExportacion;
    $('abrirReporteRecargasGnv').onclick=abrirReporteRecargasGnv;
    $('reporteDepartamentoGnv').onchange=()=>{actualizarProvinciasReporteRecargasGnv();paginaReporteRecargas=1;renderReporteRecargasGnv()};
    ['reporteSemanaGnv','reporteProvinciaGnv','reporteEstadoGnv'].forEach(id=>$(id).onchange=()=>{paginaReporteRecargas=1;renderReporteRecargasGnv()});
    $('anteriorRecargasGnv').onclick=()=>{if(paginaReporteRecargas>1){paginaReporteRecargas--;renderReporteRecargasGnv()}};
    $('siguienteRecargasGnv').onclick=()=>{paginaReporteRecargas++;renderReporteRecargasGnv()};
    $('exportarRecargasCsvGnv').onclick=exportarReporteRecargasGnv;
    $('reglaDepartamentoGnv').onchange=()=>{llenarProvinciasReglaBonoGnv();actualizarResumenReglaBonoGnv()};
    $('reglaProvinciaGnv').onchange=actualizarResumenReglaBonoGnv;
    ['reglaBonoActivaGnv','reglaDiasRiesgoGnv','reglaDiasPerdidaGnv'].forEach(id=>$(id).oninput=actualizarResumenReglaBonoGnv);
    $('formularioReglasBonoGnv').onsubmit=guardarReglasBonoGnv;
    $('filtrosGraficasGnv').onsubmit=evento=>{evento.preventDefault();actualizarAmbitoGraficas()};
    $('filtrosGraficasGnv').onreset=()=>setTimeout(()=>{prepararFiltrosGraficas();actualizarAmbitoGraficas()},0);
    $('alternarFiltrosGraficasGnv').onclick=()=>{
      const formulario=$('filtrosGraficasGnv'),boton=$('alternarFiltrosGraficasGnv'),cerrar=!formulario.classList.contains('filtros-cerrados');
      formulario.classList.toggle('filtros-cerrados',cerrar);boton.setAttribute('aria-expanded',String(!cerrar));boton.setAttribute('aria-label',cerrar?'Abrir filtros de gráficas':'Cerrar filtros de gráficas');
      requestAnimationFrame(()=>mapaCalorGraficasGnv?.invalidateSize({pan:false}));
      setTimeout(()=>mapaCalorGraficasGnv?.invalidateSize({pan:false}),180);
    };
    $('graficaDesdeSlider').oninput=evento=>actualizarRangoFechasGnv(evento.currentTarget);
    $('graficaHastaSlider').oninput=evento=>actualizarRangoFechasGnv(evento.currentTarget);
    document.querySelector('.control-fecha-inicio-gnv').onpointerdown=evento=>arrastrarControlFechaGnv(evento,'desde');
    document.querySelector('.control-fecha-fin-gnv').onpointerdown=evento=>arrastrarControlFechaGnv(evento,'hasta');
    $('graficaDesdeCalendario').onchange=()=>{$('graficaDesdeSlider').value=String(indiceDeFechaGnv($('graficaDesdeCalendario').value));actualizarRangoFechasGnv($('graficaDesdeSlider'));actualizarAmbitoGraficas()};
    $('graficaHastaCalendario').onchange=()=>{$('graficaHastaSlider').value=String(indiceDeFechaGnv($('graficaHastaCalendario').value));actualizarRangoFechasGnv($('graficaHastaSlider'));actualizarAmbitoGraficas()};
    ['graficaAgrupacion','graficaRegion','graficaCombustible','graficaCilindros','graficaEntidad'].forEach(id=>$(id).onchange=actualizarAmbitoGraficas);
    const refrescarMapaCalorVisible=()=>setTimeout(()=>{if(!$('graficas').hidden){mapaCalorGraficasGnv?.invalidateSize({pan:false});actualizarAmbitoGraficas()}},120);
    window.addEventListener('hashchange',()=>{if(location.hash==='#graficas')refrescarMapaCalorVisible()});
    document.querySelector('a[href="#graficas"]')?.addEventListener('click',refrescarMapaCalorVisible);
    $('abrirMorosidadGnv').onclick=()=>{paginaMorosidad=1;renderMorosidad();abrirModal('modalMorosidadGnv')};
    $('abrirGestionMorosidadAdminGnv').onclick=()=>{paginaMorosidad=1;renderMorosidad();abrirModal('modalMorosidadGnv')};
    const botonConfiguracionMovil=$('abrirConfiguracionMovilGnv');
    if(botonConfiguracionMovil){
      const esAdministrador=new URLSearchParams(location.search).get('adminPortal')==='1';
      $('grupoAdministracionGnv').hidden=!esAdministrador;
      botonConfiguracionMovil.hidden=!esAdministrador;
      botonConfiguracionMovil.onclick=()=>{cargarConfiguracionMovilGnv();abrirModal('modalConfiguracionMovilGnv')};
      $('abrirReglasBonoGnv').hidden=!esAdministrador;$('abrirReglasBonoGnv').onclick=abrirReglasBonoGnv;
      $('configurarMovilDesdeAdminGnv').onclick=()=>{cargarConfiguracionMovilGnv();abrirModal('modalConfiguracionMovilGnv')};
      $('configurarReglasDesdeAdminGnv').onclick=abrirReglasBonoGnv;
      $('tarjetaApiCofideGnv').hidden=!esAdministrador;if(esAdministrador){renderApiCofideGnv();$('sincronizarApiCofideGnv').onclick=sincronizarApiCofideGnv}
    }
    $('habilitarSmsMovilGnv').onchange=actualizarEstadosConfiguracionMovilGnv;$('habilitarBiometriaMovilGnv').onchange=actualizarEstadosConfiguracionMovilGnv;$('guardarConfiguracionMovilGnv').onclick=guardarConfiguracionMovilGnv;
    document.querySelectorAll('[data-cerrar-modal]').forEach(boton=>boton.onclick=()=>cerrarModal(boton.dataset.cerrarModal));
    $('buscarMorosoGnv').oninput=()=>{paginaMorosidad=1;renderMorosidad()};
    $('estadoMorosoGnv').onchange=()=>{paginaMorosidad=1;renderMorosidad()};
    $('paginaAnteriorMorosidad').onclick=()=>{if(paginaMorosidad>1){paginaMorosidad--;renderMorosidad()}};
    $('paginaSiguienteMorosidad').onclick=()=>{paginaMorosidad++;renderMorosidad()};
    $('mensajeTodosGnv').onclick=()=>abrirMensaje();
    $('enviarMensajeGnv').onclick=()=>{const ahora=new Date(),marca=`Hoy · ${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;if(destinatarioMensajeActual){destinatarioMensajeActual.mensajeEnviado=true;destinatarioMensajeActual.ultimoEnvio=marca;destinatarioMensajeActual.canalEnvio='SMS + correo'}else morosos.filter(x=>x.cuotas>=1).forEach(x=>{x.mensajeEnviado=true;x.ultimoEnvio=marca;x.canalEnvio='SMS + correo'});cerrarModal('modalMensajeGnv');renderMorosidad();const boton=$('mensajeTodosGnv'),texto='Reenviar desde Administración';boton.textContent='Mensajes reenviados';setTimeout(()=>boton.textContent=texto,1800)};
    document.addEventListener('keydown',evento=>{if(evento.key==='Escape'){evento.preventDefault();document.querySelectorAll('.modal-gnv:not([hidden])').forEach(modal=>cerrarModal(modal.id));limpiarDibujoHerramienta(true);herramientaActiva=null;document.querySelectorAll('[data-herramienta-gnv]').forEach(item=>item.classList.remove('activo'));mapa.getContainer().style.cursor='';mapa.doubleClickZoom.enable();mapa.setView([-10.2,-75.2],5)}});
    window.addEventListener('resize',()=>mapa.invalidateSize());
    actualizarVisibilidadHerramientas();
  }
  function iniciar(){
    cargarReglaBonoGnv();prepararFiltros();prepararFiltrosGraficas();iniciarMapa();enlazarEventos();actualizarMapa(true);renderGraficas();renderMorosidad();
  }
  if(typeof L==='undefined')return;
  fetch('datos_ahorro_gnv.json').then(respuesta=>{if(!respuesta.ok)throw new Error('No se pudieron cargar los registros');return respuesta.json()}).then(datos=>{const entidades=['BCP','Interbank','Caja Arequipa'];registros=datos.map((registro,i)=>({...registro,region:regionDeDepartamento(registro.departamento),entidadFinanciera:entidades[i%entidades.length],recargas:Math.max(2,Math.round((registro.desembolsado||registro.monto)/420)+(registro.estado==='Liquidada'?5:1)+(registro.cilindros||1)*2)}));iniciar()}).catch(error=>{console.error(error);$('contadorMapa').textContent='Datos no disponibles'});
})();
