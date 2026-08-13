(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const idsFiltros=['filtroDepartamento','filtroDistrito','filtroEstrato','filtroTipo','filtroSubtipo','filtroInstaladora','filtroConcesionaria','filtroDesde','filtroHasta'];
  const coloresEstado={'Liquidado':'#47b67a','Pendiente de liquidación':'#e2a510','Dentro de plazo':'#55aee0','Fuera de plazo':'#dc5a5a'};
  const empresasPenalidades=[
    ['Ancash Gas S.A.C.',0,0,'2026-01-08','S/ 0','Regular'],['Andes Gas Contratistas',2,0,'2026-02-09','S/ 1,450','Regular'],
    ['Cajamarca Gas',4,0,'2026-03-10','S/ 3,200','Regular'],['Centro Gas Peru',3,0,'2026-04-11','S/ 2,625','Regular'],
    ['Consorcio Redes Callao',1,0,'2026-05-12','S/ 950','Regular'],['Consorcio Redes Lima',3,0,'2026-06-13','S/ 3,075','Regular'],
    ['GasSur Instalaciones',2,0,'2026-01-14','S/ 2,200','Regular'],['GasSur Instalaciones S.A.C.',7,6,'2026-02-15','S/ 8,225','Seguimiento crítico'],
    ['Huanuco Gas',2,0,'2026-03-16','S/ 2,500','Regular'],['Instalaciones del Norte S.A.C.',1,0,'2026-04-17','S/ 1,325','Regular'],
    ['Iquitos Gas S.A.C.',3,0,'2026-05-18','S/ 4,200','Regular'],['NorteGas SAC',5,0,'2026-06-19','S/ 7,375','Regular'],
    ['Oriente Gas Peru',0,0,'2026-01-20','S/ 0','Regular'],['Puno Instalaciones S.A.C.',2,0,'2026-02-21','S/ 3,250','Regular'],
    ['RedGas Contratistas',4,0,'2026-03-22','S/ 6,800','Regular'],['RedGas Perú S.A.C.',3,0,'2026-04-23','S/ 5,325','Regular'],
    ['Selva Gas S.A.C.',1,0,'2026-05-24','S/ 1,850','Regular'],['Sur Gas Instalaciones',3,0,'2026-06-25','S/ 5,775','Regular'],
    ['Tacna Gas S.A.C.',2,0,'2026-01-08','S/ 4,000','Regular'],['TecnoGas Arequipa',4,0,'2026-02-09','S/ 8,300','Regular'],
    ['TecnoGas Peru',2,0,'2026-03-10','S/ 4,300','Regular']
  ];
  let datos=[],datosVisibles=[],seleccionExportacion=[],expedientesPago=[],solicitudes=[],paginaValidacion=1,paginaSolicitudes=1,mapa,baseActual,grupoMarcadores,capaEstratos,capaRedTroncal,capaRedResidencial,capaManzanasFise,capaTematica,capaDibujo,pagina259=1,herramienta=null,puntos=[],figuraTemporal=null,centroCirculo=null,temporizadorIA=null;
  const bases={};

  function valoresUnicos(campo,lista=datos){return [...new Set(lista.map(x=>x[campo]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es'));}
  function llenarSelect(id,valores,etiqueta){
    const select=$(id),actual=select.value;
    select.replaceChildren(new Option(etiqueta,''));
    valores.forEach(v=>select.add(new Option(v,v)));
    if([...select.options].some(o=>o.value===actual))select.value=actual;
  }
  function prepararFiltros(){
    llenarSelect('filtroDepartamento',valoresUnicos('departamento'),'Todos');
    const porDepartamento=datos.filter(x=>!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value);
    llenarSelect('filtroDistrito',valoresUnicos('distrito',porDepartamento),'Todos');
    llenarSelect('filtroEstrato',valoresUnicos('estrato'),'Todos');
    llenarSelect('filtroTipo',valoresUnicos('tipo'),'Todos');
    llenarSelect('filtroSubtipo',valoresUnicos('subtipo'),'Todos');
    llenarSelect('filtroInstaladora',valoresUnicos('instaladora'),'Todas');
    llenarSelect('filtroConcesionaria',valoresUnicos('concesionaria'),'Todas');
  }
  function filtrar(){
    const desde=$('filtroDesde').value,hasta=$('filtroHasta').value;
    return datos.filter(x=>
      (!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value)&&
      (!$('filtroDistrito').value||x.distrito===$('filtroDistrito').value)&&
      (!$('filtroEstrato').value||x.estrato===$('filtroEstrato').value)&&
      (!$('filtroTipo').value||x.tipo===$('filtroTipo').value)&&
      (!$('filtroSubtipo').value||x.subtipo===$('filtroSubtipo').value)&&
      (!$('filtroInstaladora').value||x.instaladora===$('filtroInstaladora').value)&&
      (!$('filtroConcesionaria').value||x.concesionaria===$('filtroConcesionaria').value)&&
      (!desde||x.fechaRegistro>=desde)&&(!hasta||x.fechaRegistro<=hasta)
    );
  }
  function iconoRegistro(x){
    return L.divIcon({className:'marcador-bonogas',html:`<span class="punto-bonogas" style="--color:${coloresEstado[x.estadoRegistro]}"></span>`,iconSize:[18,18],iconAnchor:[9,9]});
  }
  function mostrarDetalle(x){
    seleccionExportacion=[x];
    const detalle=$('detalleBeneficiario');
    detalle.hidden=false;
    const enConstruccion=['Dentro de plazo','Fuera de plazo'].includes(x.estadoRegistro);
    const fases=[
      ['Registro','✓',true,false,x.fechaRegistro],
      ['Instalación Interna','•',!enConstruccion,enConstruccion,enConstruccion?'Pendiente':'Completada'],
      ['Habilitación','□',x.fechaHabilitacion!=='Pendiente',false,x.fechaHabilitacion],
      ['Solicitud de Liquidación','□',x.estadoRegistro==='Liquidado',x.estadoRegistro==='Pendiente de liquidación',x.estadoRegistro==='Liquidado'?'Completada':'Pendiente'],
      ['Liquidación','□',x.estadoRegistro==='Liquidado',x.estadoRegistro==='Pendiente de liquidación',x.estadoRegistro],
      ['Recaudación','□',x.suministroActivo==='Sí',false,x.suministroActivo==='Sí'?'En proceso':'Pendiente']
    ];
    const camposSuministro=[
      ['N.° de suministro',x.numeroSuministro],['N.° de instalación',x.numeroInstalacion],['Nombre del beneficiario',x.nombre],
      ['Tipo de beneficiario',x.tipo],['Fecha de registro en portal',x.fechaRegistro],['Fecha de habilitación',x.fechaHabilitacion],
      ['Estrato',x.estratoDescripcion],['Material de instalación',x.material],['Empresa instaladora',`<button class="empresa-detalle" type="button">${x.instaladora}</button>`],
      ['Tipo de acometida',x.acometida],['Tipo de medidor',x.medidor]
    ];
    const camposRecaudacion=[
      ['Costo de instalación (liquidación)',`S/ ${x.costo.toFixed(2)}`],['Monto subsidiado',`S/ ${x.subsidio.toFixed(2)} (${Math.round(x.subsidio/x.costo*100)}%)`],
      ['Monto a financiar',`S/ ${x.montoFinanciado.toFixed(2)}`],['Suministro activo',x.suministroActivo],['Valor de cuota mensual',`S/ ${x.valorCuota.toFixed(2)}`],
      ['Cuotas pagadas',`${x.cuotasPagadas} / ${x.cuotasTotales}`],['Cuotas pendientes',x.cuotasPendientes],['Monto pendiente de recaudación',`S/ ${x.montoPendiente.toFixed(2)}`]
    ];
    const renderCampos=campos=>campos.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('');
    const trazabilidad=$('trazabilidadMapa');
    trazabilidad.hidden=false;
    trazabilidad.innerHTML=`<header><p>Portal de Habilitaciones · BonoGas 2.0 · ${enConstruccion?'En construcción':'Habilitado'}</p><strong>${x.nombre} · ${x.numeroSuministro}</strong></header><div class="trazabilidad-suministro">${fases.map(([nombre,icono,completa,actual,estado])=>`<div class="fase-trazabilidad ${completa?'completa':''} ${actual?'actual':''}"><i>${icono}</i><span>${nombre}</span><small>${estado}</small></div>`).join('')}</div>`;
    detalle.innerHTML=`<button class="cerrar-detalle" type="button">Limpiar</button><small>DETALLE DE SUMINISTRO</small><h3>${x.nombre} · ${x.numeroSuministro}</h3>
      <section class="bloque-detalle"><h4>Datos del Suministro (Portal de Habilitaciones y BonoGas 2.0)</h4><div class="detalle-grid">${renderCampos(camposSuministro)}</div></section>
      <section class="bloque-detalle"><h4>Datos de Recaudación (BonoGas 2.0)</h4><div class="detalle-grid">${renderCampos(camposRecaudacion)}</div></section>`;
    [...$('panelDerecho').children].forEach(el=>{if(el!==detalle&&el.id!=='botonExportarBonogas')el.hidden=true;});
    detalle.querySelector('.cerrar-detalle').onclick=restaurarResumen;
    detalle.querySelector('.empresa-detalle').onclick=()=>abrirRankingEmpresa(x.instaladora);
    $('panelDerecho').scrollTo({top:0,behavior:'smooth'});
  }
  function restaurarResumen(){
    seleccionExportacion=[];
    const detalle=$('detalleBeneficiario');detalle.hidden=true;
    $('trazabilidadMapa').hidden=true;
    [...$('panelDerecho').children].forEach(el=>{if(el!==detalle)el.hidden=false;});
    $('panelDerecho').scrollTo({top:0,behavior:'smooth'});
  }
  function actualizarMapa(ajustar=true){
    seleccionExportacion=[];
    const estadosActivos=new Set([...document.querySelectorAll('[data-capa-estado]:checked')].map(control=>control.dataset.capaEstado));
    datosVisibles=filtrar().filter(x=>estadosActivos.has(x.estadoRegistro));
    grupoMarcadores.clearLayers();
    capaEstratos.clearLayers();
    datosVisibles.forEach((x,indice)=>{
      const marker=L.marker([x.lat,x.lng],{icon:iconoRegistro(x),title:`${x.numeroSuministro} · ${x.nombre}`});
      marker.bindTooltip(`${x.nombre}<br>${x.distrito}`);
      marker.on('click',()=>mostrarDetalle(x));
      grupoMarcadores.addLayer(marker);
      if(indice%3===0){
        const delta=.018+(Number(x.estrato)-1)*.006;
        L.rectangle([[x.lat-delta,x.lng-delta],[x.lat+delta,x.lng+delta]],{className:'lote-bonogas',interactive:false}).addTo(capaEstratos);
      }
    });
    actualizarCapasInfraestructura();
    actualizarDensidad();
    $('contadorMapa').textContent=`${datosVisibles.length} registro${datosVisibles.length===1?'':'s'} visible${datosVisibles.length===1?'':'s'}`;
    if(ajustar&&datosVisibles.length){
      const bounds=L.latLngBounds(datosVisibles.map(x=>[x.lat,x.lng]));
      mapa.fitBounds(bounds,{padding:[35,35],maxZoom:11});
    }
  }
  function actualizarCapasInfraestructura(){
    [capaRedTroncal,capaRedResidencial,capaManzanasFise].forEach(capa=>capa.clearLayers());
    const departamentos=new Map();
    const distritos=new Map();
    datosVisibles.forEach(registro=>{
      if(!departamentos.has(registro.departamento))departamentos.set(registro.departamento,[]);
      departamentos.get(registro.departamento).push(registro);
      const clave=`${registro.departamento}|${registro.distrito}`;
      if(!distritos.has(clave))distritos.set(clave,[]);
      distritos.get(clave).push(registro);
    });
    departamentos.forEach((registros,departamento)=>{
      const puntos=registros.slice().sort((a,b)=>a.lng-b.lng).filter((_,indice)=>indice%Math.max(1,Math.floor(registros.length/7))===0).map(x=>[x.lat,x.lng]);
      if(puntos.length>1)L.polyline(puntos,{className:'red-troncal-fise',color:'#3d70c9',weight:6,opacity:.86,lineCap:'round'}).bindTooltip(`Red troncal · ${departamento}`).addTo(capaRedTroncal);
    });
    distritos.forEach((registros,clave)=>{
      const centro=[registros.reduce((suma,x)=>suma+x.lat,0)/registros.length,registros.reduce((suma,x)=>suma+x.lng,0)/registros.length];
      registros.slice(0,12).forEach(registro=>L.polyline([centro,[registro.lat,registro.lng]],{className:'red-residencial-fise',color:'#40a875',weight:3,opacity:.72,dashArray:'7 5',lineCap:'round'}).addTo(capaRedResidencial));
      const delta=.014+Math.min(.018,registros.length*.0015);
      L.rectangle([[centro[0]-delta,centro[1]-delta],[centro[0]+delta,centro[1]+delta]],{className:'manzana-fise',color:'#8558b7',weight:1.5,fillColor:'#a985ce',fillOpacity:.18}).bindTooltip(`Manzana FISE · ${clave.split('|')[1]}<br>${registros.length} suministro(s)`).addTo(capaManzanasFise);
    });
  }
  function ajustarTablero(){
    const tablero=document.querySelector('.tablero-bonogas');
    if(innerWidth<=1100){
      tablero.style.removeProperty('height');
      requestAnimationFrame(()=>mapa?.invalidateSize({pan:false}));
      return;
    }
    tablero.style.height=`${Math.max(390,innerHeight-tablero.getBoundingClientRect().top-10)}px`;
    requestAnimationFrame(()=>mapa?.invalidateSize({pan:false}));
  }
  function alternarPanel(id,botonId){
    const panel=$(id),abrir=panel.hidden;
    document.querySelectorAll('.panel-mapa').forEach(p=>p.hidden=true);
    document.querySelectorAll('.controles-mapa button').forEach(b=>b.setAttribute('aria-expanded','false'));
    panel.hidden=!abrir;
    $(botonId).setAttribute('aria-expanded',String(abrir));
  }
  function actualizarDensidad(){
    if(!capaTematica)return;
    capaTematica.clearLayers();
    const activar=$('activarTematico')?.checked;
    if(!activar){
      if(mapa.hasLayer(capaTematica))mapa.removeLayer(capaTematica);
      if(!mapa.hasLayer(grupoMarcadores))grupoMarcadores.addTo(mapa);
      return;
    }
    if(mapa.hasLayer(grupoMarcadores))mapa.removeLayer(grupoMarcadores);
    const tipo=document.querySelector('[name="tipoTematico"]:checked')?.value||'cobertura';
    const maxMonto=Math.max(1,...datosVisibles.map(registro=>registro.montoPendiente||0));
    const puntos=datosVisibles.map(registro=>{
      let intensidad=.55;
      if(tipo==='morosidad')intensidad=.2+.8*((registro.montoPendiente||0)/maxMonto);
      if(tipo==='criticas')intensidad=.15+.5*Math.min(1,(registro.cuotasPendientes||0)/12)+.35*((registro.montoPendiente||0)/maxMonto);
      return [registro.lat,registro.lng,Math.min(1,intensidad)];
    });
    const opciones=tipo==='cobertura'
      ?{radius:34,blur:27,maxZoom:11,minOpacity:.28,gradient:{.15:'#3f91d7',.45:'#2fc7c0',.72:'#6556db',1:'#3e287d'}}
      :{radius:tipo==='criticas'?29:36,blur:tipo==='criticas'?20:28,maxZoom:12,minOpacity:.24,gradient:{.15:'#3fb56f',.48:'#f0d23d',.72:'#ef982f',1:'#d83e50'}};
    if(typeof L.heatLayer==='function'){
      L.heatLayer(puntos,opciones).addTo(capaTematica);
    }else{
      puntos.forEach(([lat,lng,intensidad])=>L.circleMarker([lat,lng],{radius:12+intensidad*22,stroke:false,fillColor:tipo==='cobertura'?'#477dde':'#df5a4f',fillOpacity:.2+.35*intensidad}).addTo(capaTematica));
    }
    if(!mapa.hasLayer(capaTematica))capaTematica.addTo(mapa);
  }
  function actualizarInterfazTematica(){
    const tipo=document.querySelector('[name="tipoTematico"]:checked')?.value||'cobertura';
    $('leyendaTematica').className=`leyenda-calor leyenda-${tipo}`;
    $('descripcionTematica').textContent=tipo==='cobertura'
      ?'Concentración geográfica de suministros y beneficiarios conectados. Usa los filtros principales.'
      :tipo==='criticas'
        ?'Rojo: alta morosidad · amarillo: media · verde: baja. Usa los filtros principales.'
        :'Intensidad calculada con deuda y cuotas pendientes. Usa los filtros principales.';
    actualizarDensidad();
  }
  function puntoEnPoligono(registro,vertices){
    let dentro=false;
    for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
      const a=vertices[i],b=vertices[j];
      if((a.lat>registro.lat)!==(b.lat>registro.lat)&&registro.lng<(b.lng-a.lng)*(registro.lat-a.lat)/(b.lat-a.lat)+a.lng)dentro=!dentro;
    }
    return dentro;
  }
  function mostrarSeleccion(lista,titulo){
    seleccionExportacion=[...lista];
    $('trazabilidadMapa').hidden=true;
    const detalle=$('detalleBeneficiario');detalle.hidden=false;
    detalle.innerHTML=`<button class="cerrar-detalle" type="button">Limpiar selección</button><small>SELECCIÓN GEOGRÁFICA</small><h3>${titulo}</h3><p>${lista.length} beneficiario(s) encontrado(s).</p><div class="lista-seleccion">${lista.slice(0,25).map(x=>`<article><b>${x.nombre}</b><small>${x.suministro} · ${x.distrito}</small></article>`).join('')}</div>`;
    [...$('panelDerecho').children].forEach(el=>{if(el!==detalle&&el.id!=='botonExportarBonogas')el.hidden=true;});
    detalle.querySelector('.cerrar-detalle').onclick=limpiarDibujo;
  }
  function limpiarDibujo(){
    puntos=[];figuraTemporal=null;centroCirculo=null;capaDibujo.clearLayers();restaurarResumen();
  }
  const expedientesLiquidacion={
    '2489':{codigo:'FISE-2025-0002489',beneficiario:'Juan Carlos Pérez Gómez',empresa:'Instalaciones del Norte S.A.C.',financiado:1980,subsidio:720,conexion:200,acometida:360,penalidad:0},
    '2418':{codigo:'FISE-2025-0002418',beneficiario:'Luis Alberto Quispe Huamaní',empresa:'Conexiones Seguras S.A.C.',financiado:1700,subsidio:620,conexion:180,acometida:220,penalidad:0}
  };
  const monedaLiquidacion=valor=>`S/ ${Number(valor||0).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  function datosLiquidacionActual(){
    const expediente=expedientesLiquidacion[$('liquidacionExpediente').value];
    const financiado=Number($('liquidacionFinanciado').value)||0,subsidio=Number($('liquidacionSubsidio').value)||0;
    const conexion=Number($('liquidacionConexion').value)||0,acometida=Number($('liquidacionAcometida').value)||0,penalidad=Number($('liquidacionPenalidad').value)||0;
    return {...expediente,financiado,subsidio,conexion,acometida,penalidad,bruto:financiado+conexion+acometida,total:Math.max(0,financiado+conexion+acometida-subsidio-penalidad)};
  }
  function cambiarEstadoLiquidacion(estado){
    $('estadoLiquidacion').textContent=estado;
    $('resumenEstadoLiquidacion').textContent=estado;
    $('estadoLiquidacion').classList.toggle('emitida',estado==='Orden emitida');
    $('resumenEstadoLiquidacion').classList.toggle('emitida',estado==='Orden emitida');
  }
  function calcularLiquidacion(){
    const valores=datosLiquidacionActual();
    $('montoBrutoLiquidacion').textContent=monedaLiquidacion(valores.bruto);
    $('totalPagarLiquidacion').textContent=monedaLiquidacion(valores.total);
    cambiarEstadoLiquidacion('Preliquidación calculada');
    $('generarLiquidacion').disabled=false;
    $('emitirOrdenLiquidacion').disabled=true;
    $('totalPagarLiquidacion').closest('article').classList.remove('liquidacion-exito');
    requestAnimationFrame(()=>$('totalPagarLiquidacion').closest('article').classList.add('liquidacion-exito'));
  }
  function actualizarHistorialLiquidacion(estado){
    const valores=datosLiquidacionActual(),clave=$('liquidacionExpediente').value;
    let fila=document.querySelector(`[data-liquidacion-historial="${clave}"]`);
    if(!fila){
      fila=document.createElement('article');
      fila.dataset.liquidacionHistorial=clave;
      $('listaLiquidaciones').prepend(fila);
    }
    const emitida=estado==='Orden emitida';
    fila.innerHTML=`<i>${[...$('listaLiquidaciones').children].indexOf(fila)+1}</i><div><b>${valores.codigo}</b><span>${emitida?'Orden de pago emitida':'Liquidación generada'}</span></div><strong>${monedaLiquidacion(valores.total)}</strong><small class="${emitida?'emitida':''}">${estado}</small>`;
    $('contadorLiquidaciones').textContent=`${$('listaLiquidaciones').children.length} registros`;
  }
  function abrirLiquidaciones(){
    const clave=$('liquidacionExpediente').value||'2489',expediente=expedientesLiquidacion[clave];
    $('liquidacionEmpresa').value=expediente.empresa;
    $('liquidacionFinanciado').value=expediente.financiado;
    $('liquidacionSubsidio').value=expediente.subsidio;
    $('liquidacionConexion').value=expediente.conexion;
    $('liquidacionAcometida').value=expediente.acometida;
    $('liquidacionPenalidad').value=expediente.penalidad;
    $('generarLiquidacion').disabled=true;$('emitirOrdenLiquidacion').disabled=true;
    cambiarEstadoLiquidacion('Preliquidación');
    calcularLiquidacion();
    abrirModal('modalLiquidacionesBonogas');
    requestAnimationFrame(()=>$('modalLiquidacionesBonogas').scrollTo({top:0}));
  }
  function exportarLiquidacion(){
    const x=datosLiquidacionActual();
    const filas=[
      ['Expediente',x.codigo],['Beneficiario',x.beneficiario],['Empresa instaladora',x.empresa],
      ['Monto financiado',x.financiado],['Derecho de conexión',x.conexion],['Costo de acometida',x.acometida],
      ['Subsidio FISE',x.subsidio],['Penalidad / descuento',x.penalidad],['Monto bruto',x.bruto],
      ['Total a pagar',x.total],['Estado',$('estadoLiquidacion').textContent],['Observación',$('liquidacionObservacion').value]
    ];
    const contenido='\uFEFF'+filas.map(f=>f.map(v=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\r\n');
    const enlace=document.createElement('a');
    enlace.href=URL.createObjectURL(new Blob([contenido],{type:'text/csv;charset=utf-8'}));
    enlace.download=`liquidacion-${x.codigo}.csv`;enlace.click();URL.revokeObjectURL(enlace.href);
  }
  function activarHerramienta(nombre,boton){
    if(nombre==='ampliar'){$('barraHerramientas').classList.toggle('ampliada');return;}
    if(nombre==='validacion-ia'){abrirValidacionIA();return;}
    if(nombre==='liquidaciones'){abrirLiquidaciones();return;}
    if(['opciones','mover'].includes(nombre))return;
    herramienta=herramienta===nombre?null:nombre;
    document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('activo',b===boton&&herramienta));
    limpiarDibujo();
    herramienta?mapa.doubleClickZoom.disable():mapa.doubleClickZoom.enable();
  }
  function mostrarPasoIA(numero){
    document.querySelectorAll('[data-paso-ia]').forEach(paso=>paso.hidden=Number(paso.dataset.pasoIa)!==numero);
    document.querySelectorAll('[data-indicador-ia]').forEach(indicador=>{
      const valor=Number(indicador.dataset.indicadorIa);
      indicador.classList.toggle('activo',valor===numero);
      indicador.classList.toggle('completo',valor<numero);
    });
  }
  function abrirValidacionIA(){
    clearInterval(temporizadorIA);
    mostrarPasoIA(1);
    document.querySelectorAll('[data-archivo-ia]').forEach(input=>{
      input.value='';
      input.closest('label').classList.remove('cargado');
      input.closest('label').querySelector('[data-nombre-archivo]').textContent='Sin archivo';
    });
    $('resultadoGabineteIA').className='observado';
    $('detalleGabineteIA').textContent='Nitidez 42% · imagen borrosa';
    $('estadoGabineteIA').textContent='Reintentar';
    $('totalAprobadasIA').textContent='4';$('totalObservadasIA').textContent='1';
    $('alertaResultadoIA').hidden=false;
    abrirModal('modalValidacionIA');
  }
  function emitirAlertaIA(){
    try{
      const Contexto=window.AudioContext||window.webkitAudioContext;
      if(Contexto){const contexto=new Contexto(),oscilador=contexto.createOscillator(),ganancia=contexto.createGain();oscilador.frequency.value=720;ganancia.gain.setValueAtTime(.035,contexto.currentTime);ganancia.gain.exponentialRampToValueAtTime(.001,contexto.currentTime+.18);oscilador.connect(ganancia).connect(contexto.destination);oscilador.start();oscilador.stop(contexto.currentTime+.18);}
      navigator.vibrate?.(100);
    }catch(_){}
  }
  function iniciarAnalisisIA(){
    mostrarPasoIA(2);
    const filas=[...document.querySelectorAll('[data-analisis-ia]')];
    filas.forEach(fila=>{fila.className='';fila.querySelector('b').textContent='En espera';});
    $('estadoGeneralIA').textContent='Inicializando análisis inteligente…';
    let indice=0;
    temporizadorIA=setInterval(()=>{
      if(indice>0){
        const anterior=filas[indice-1],observado=indice===3;
        anterior.className=observado?'observado':'aprobado';
        anterior.querySelector('b').textContent=observado?'Imagen borrosa':'Validación correcta';
      }
      if(indice<filas.length){
        filas[indice].className='procesando';
        filas[indice].querySelector('b').textContent='Analizando…';
        $('estadoGeneralIA').textContent=`Validando ${filas[indice].querySelector('span').textContent.toLowerCase()}…`;
        indice++;
        return;
      }
      clearInterval(temporizadorIA);
      $('estadoGeneralIA').textContent='Análisis completado';
      setTimeout(()=>{mostrarPasoIA(3);emitirAlertaIA();},450);
    },520);
  }
  function cerrarDibujo(e){
    if(herramienta==='poligono'&&puntos.length>=3){
      L.DomEvent.preventDefault(e.originalEvent);capaDibujo.clearLayers();
      L.polygon(puntos,{color:'#d68b22',weight:3,fillOpacity:.17}).addTo(capaDibujo);
      mostrarSeleccion(datosVisibles.filter(x=>puntoEnPoligono(x,puntos)),'Selección por polígono');puntos=[];figuraTemporal=null;
    }else if(herramienta==='circulo'&&centroCirculo){
      const radio=mapa.distance(centroCirculo,e.latlng);
      mostrarSeleccion(datosVisibles.filter(x=>mapa.distance(centroCirculo,L.latLng(x.lat,x.lng))<=radio),'Selección por círculo');centroCirculo=null;figuraTemporal=null;
    }
  }
  function abrirModal(id){$(id).showModal();}
  function textoBusqueda(id){return $(id).value.trim().toLowerCase();}
  function registrosReporte259(){
    const q=textoBusqueda('buscarReporte259');
    return datos.filter(x=>!q||[x.suministro,x.nombre,x.instaladora,x.estadoInstalacion,x.plazo259].some(v=>String(v).toLowerCase().includes(q)));
  }
  function renderReporte259(){
    const lista=registrosReporte259(),tamano=8,total=Math.max(1,Math.ceil(lista.length/tamano));
    pagina259=Math.min(Math.max(1,pagina259),total);
    $('tablaReporte259').innerHTML=lista.slice((pagina259-1)*tamano,pagina259*tamano).map(x=>`<tr><td>${x.suministro}</td><td>${x.nombre}</td><td>${x.fechaRegistro}</td><td>${x.plazo259==='Habilitado / no aplica'?'—':`${x.diasCalendario} / ${x.limiteDias}`}</td><td>${x.estadoInstalacion}</td><td class="${x.plazo259==='Fuera de plazo'?'estado-critico':''}">${x.plazo259}</td><td>${x.instaladora}</td></tr>`).join('');
    $('pagina259').textContent=`Página ${pagina259} de ${total}`;$('anterior259').disabled=pagina259===1;$('siguiente259').disabled=pagina259===total;
  }
  function renderReporte20(){
    const q=textoBusqueda('buscarReporte20');
    const lista=datos.filter(x=>x.plazo259==='Fuera de plazo'&&(!q||[x.suministro,x.nombre,x.instaladora].some(v=>String(v).toLowerCase().includes(q))));
    $('tablaReporte20').innerHTML=lista.map(x=>`<tr><td>${x.suministro}</td><td>${x.nombre}</td><td>${x.fechaInicio}</td><td><b class="estado-critico">${x.diasHabiles} / 20</b></td><td class="estado-critico">Crítico</td><td>${x.instaladora}</td></tr>`).join('');
  }
  function renderPenalidades(){
    $('tablaPenalidades').innerHTML=empresasPenalidades.map(([empresa,penalidades,fuera,fecha,monto,estado])=>`<tr><td>${empresa}</td><td>GNR-2026 · Vigente</td><td>${penalidades}</td><td>${fuera}</td><td>${fecha}</td><td>${monto}</td><td class="${estado.includes('crítico')?'estado-critico':''}">${estado}</td></tr>`).join('');
  }
  function datosParaExportar(reporte){return reporte==='20'?datos.filter(x=>x.plazo259==='Fuera de plazo'):registrosReporte259();}
  function filasExportacion(reporte){
    return datosParaExportar(reporte).map(x=>reporte==='20'?{
      'N° Suministro':x.suministro,'Beneficiario':x.nombre,'Fecha de inicio':x.fechaInicio,'Días hábiles':x.diasHabiles,'Nivel':'Crítico','Empresa instaladora':x.instaladora
    }:{
      'N° Suministro':x.suministro,'Beneficiario':x.nombre,'Fecha registro':x.fechaRegistro,'Días calendario':x.diasCalendario,'Estado instalación':x.estadoInstalacion,'Plazo Art. 25.9':x.plazo259,'Empresa instaladora':x.instaladora
    });
  }
  function exportarCsv(filas,nombre){
    const columnas=Object.keys(filas[0]||{}),contenido=[columnas.join(','),...filas.map(f=>columnas.map(c=>`"${String(f[c]??'').replaceAll('"','""')}"`).join(','))].join('\n');
    const enlace=document.createElement('a');enlace.href=URL.createObjectURL(new Blob(['\ufeff'+contenido],{type:'text/csv'}));enlace.download=nombre;enlace.click();URL.revokeObjectURL(enlace.href);
  }
  function datosExportacionBonogas(){
    return seleccionExportacion.length?[...seleccionExportacion]:[...datosVisibles];
  }
  function filasExportacionBonogas(registros){
    return registros.map(x=>({
      'N° suministro':x.numeroSuministro||x.suministro,
      'N° instalación':x.numeroInstalacion||x.instalacion,
      'Beneficiario':x.nombre,
      'DNI':x.dni,
      'Departamento':x.departamento,
      'Distrito':x.distrito,
      'Estrato':x.estratoDescripcion||x.estrato,
      'Empresa instaladora':x.instaladora,
      'Concesionaria':x.concesionaria,
      'Estado':x.estadoRegistro,
      'Fecha de registro':x.fechaRegistro,
      'Cuotas pagadas':x.cuotasPagadas,
      'Cuotas pendientes':x.cuotasPendientes,
      'Monto pendiente':`S/ ${Number(x.montoPendiente||0).toFixed(2)}`,
      'Latitud':x.lat,
      'Longitud':x.lng
    }));
  }
  function descripcionFiltrosBonogas(){
    const nombres=[['filtroDepartamento','Departamento'],['filtroDistrito','Distrito'],['filtroEstrato','Estrato'],['filtroTipo','Tipo'],['filtroSubtipo','Subtipo'],['filtroInstaladora','Instaladora'],['filtroConcesionaria','Concesionaria']];
    const activos=nombres.map(([id,nombre])=>$(id).value?`${nombre}: ${$(id).selectedOptions[0].textContent}`:'').filter(Boolean);
    if($('filtroDesde').value)activos.push(`Desde: ${$('filtroDesde').value}`);
    if($('filtroHasta').value)activos.push(`Hasta: ${$('filtroHasta').value}`);
    return activos.length?activos.join(' · '):'Todos los filtros';
  }
  function abrirExportacionBonogas(){
    const registros=datosExportacionBonogas();
    $('alcanceExportacionBonogas').textContent=seleccionExportacion.length===1?'Registro seleccionado':seleccionExportacion.length>1?'Selección realizada en el mapa':'Todos los registros filtrados';
    $('cantidadExportacionBonogas').textContent=registros.length.toLocaleString('es-PE');
    $('resumenExportacionBonogas').textContent=`${descripcionFiltrosBonogas()}. El archivo incluirá únicamente ${registros.length} registro${registros.length===1?'':'s'}.`;
    abrirModal('modalExportacionBonogas');
  }
  function generarExportacionBonogas(){
    const registros=datosExportacionBonogas(),filas=filasExportacionBonogas(registros);
    if(!filas.length)return;
    const formato=document.querySelector('[name="formatoExportacionBonogas"]:checked').value;
    if(formato==='csv')exportarCsv(filas,'reporte_bonogas.csv');
    else if(formato==='xlsx'&&window.XLSX){
      const hoja=XLSX.utils.json_to_sheet(filas),libro=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro,hoja,'BonoGas');
      XLSX.writeFile(libro,'reporte_bonogas.xlsx');
    }else if(formato==='pdf'&&window.jspdf?.jsPDF){
      const doc=new jspdf.jsPDF({orientation:'landscape'}),columnas=Object.keys(filas[0]);
      doc.setFontSize(17);doc.setTextColor(24,37,64);doc.text('BONOGAS · Reporte de selección',14,16);
      doc.setFontSize(9);doc.setTextColor(100,114,136);doc.text(descripcionFiltrosBonogas(),14,23);
      doc.autoTable({startY:29,head:[columnas],body:filas.map(fila=>columnas.map(columna=>fila[columna])),styles:{fontSize:6,cellPadding:2},headStyles:{fillColor:[53,139,174]}});
      doc.save('reporte_bonogas.pdf');
    }
    $('modalExportacionBonogas').close();
  }
  function exportarReporte(formato,reporte){
    const filas=filasExportacion(reporte),nombre=`reporte_bonogas_${reporte}`;
    if(formato==='csv')return exportarCsv(filas,`${nombre}.csv`);
    if(formato==='xlsx'&&window.XLSX){const hoja=XLSX.utils.json_to_sheet(filas),libro=XLSX.utils.book_new();XLSX.utils.book_append_sheet(libro,hoja,'Reporte');return XLSX.writeFile(libro,`${nombre}.xlsx`);}
    if(formato==='pdf'&&window.jspdf?.jsPDF){const doc=new jspdf.jsPDF({orientation:'landscape'}),columnas=Object.keys(filas[0]||{});doc.setFontSize(16);doc.text(reporte==='20'?'Control de 20 días hábiles':'Reporte Art. 25.9',14,16);doc.autoTable({startY:22,head:[columnas],body:filas.map(f=>columnas.map(c=>f[c])),styles:{fontSize:7},headStyles:{fillColor:[67,142,175]}});return doc.save(`${nombre}.pdf`);}
  }
  function datosRanking(){
    return valoresUnicos('instaladora').map((empresa,i)=>{
      const registros=datos.filter(x=>x.instaladora===empresa);
      const score=Math.max(67,94-(i%8)*3);
      return {empresa,score,expedientes:registros.length*17+38,apta:score>=82,conformidad:Math.min(99,score+3),retrabajos:Number(Math.max(.8,(100-score)/3.1).toFixed(1)),plazo:Number((3.8+(i%5)*.45).toFixed(1)),observaciones:Math.max(0,Math.round((92-score)/4))};
    }).sort((a,b)=>b.score-a.score);
  }
  function mostrarDetalleRanking(empresa){
    const ranking=datosRanking(),actual=ranking.find(x=>x.empresa===empresa)||ranking[0];
    $('empresaRankingActual').textContent=actual.empresa;
    document.querySelectorAll('.empresa-ranking').forEach(b=>b.classList.toggle('activa',b.dataset.empresa===actual.empresa));
    const historico=[Math.max(60,actual.score-6),Math.max(62,actual.score-3),Math.max(64,actual.score-1),actual.score];
    $('detalleRankingEmpresa').innerHTML=`<h3>${actual.empresa}</h3><div class="ranking-metricas"><article><span>Score actual</span><strong>${actual.score}/100</strong></article><article><span>Conformidad</span><strong>${actual.conformidad}%</strong></article><article><span>Retrabajos</span><strong>${actual.retrabajos}%</strong></article><article><span>Plazo promedio</span><strong>${actual.plazo} días</strong></article></div><div class="historico-ranking"><h4>Histórico trimestral</h4>${historico.map((v,i)=>`<article><span>2025-${['I','II','III','IV'][i]}</span><i style="width:${v}%"></i><b>${v}</b></article>`).join('')}</div><p class="recomendacion-ranking">${actual.apta?'Empresa recomendada para nuevos agrupamientos por su conformidad técnica y cumplimiento sostenido.':'Empresa observada: requiere seguimiento de plazos y cierre de observaciones antes de nuevas asignaciones.'}</p>`;
  }
  function abrirRankingEmpresa(empresa){
    const ranking=datosRanking();
    $('listaRankingEmpresas').innerHTML=ranking.map((x,i)=>`<button class="empresa-ranking" type="button" data-empresa="${x.empresa.replaceAll('"','&quot;')}"><strong>${i+1}</strong><div><b>${x.empresa}</b><small>${x.apta?'Apta para nuevos agrupamientos':'Observada'} · ${x.expedientes} expedientes</small></div><span>${x.score}</span></button>`).join('');
    $('listaRankingEmpresas').querySelectorAll('.empresa-ranking').forEach(b=>b.onclick=()=>mostrarDetalleRanking(b.dataset.empresa));
    mostrarDetalleRanking(empresa);abrirModal('modalRankingEmpresas');
  }
  function exportarRanking(formato){
    const filas=datosRanking().map((x,i)=>({Posición:i+1,Empresa:x.empresa,Score:x.score,Expedientes:x.expedientes,Estado:x.apta?'Apta':'Observada',Conformidad:`${x.conformidad}%`}));
    if(formato==='csv')return exportarCsv(filas,'ranking_empresas_bonogas.csv');
    if(formato==='xlsx'&&window.XLSX){const hoja=XLSX.utils.json_to_sheet(filas),libro=XLSX.utils.book_new();XLSX.utils.book_append_sheet(libro,hoja,'Ranking');return XLSX.writeFile(libro,'ranking_empresas_bonogas.xlsx');}
    if(formato==='pdf'&&window.jspdf?.jsPDF){const doc=new jspdf.jsPDF({orientation:'landscape'}),cols=Object.keys(filas[0]);doc.setFontSize(16);doc.text('Ranking de empresas instaladoras BonoGas',14,16);doc.autoTable({startY:22,head:[cols],body:filas.map(f=>cols.map(c=>f[c])),styles:{fontSize:8},headStyles:{fillColor:[67,142,175]}});doc.save('ranking_empresas_bonogas.pdf');}
  }
  function claseEstado(valor){
    return String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-');
  }
  function crearDatosGestion(){
    const estadosPago=['Orden emitida','Pendiente de pago','Orden emitida','Observado','Pendiente de pago','Orden emitida','Pendiente de pago','Observado','Pendiente de pago','Orden emitida','Observado','Pendiente de pago'];
    expedientesPago=datos.slice(0,12).map((x,i)=>({
      id:`FISE-2025-${String(2489-i*24).padStart(7,'0')}`,beneficiario:x.nombre,empresa:x.instaladora,distrito:x.distrito,
      fecha:`2025-05-${String(Math.max(8,20-Math.floor(i/2))).padStart(2,'0')}`,monto:1480+(i%5)*40,estado:estadosPago[i],
      convenio:`Convenio FISE-2025-IND-${String(178+i).padStart(4,'0')}`,suministro:x.numeroSuministro||x.suministro
    }));
    const estadosSolicitud=['En validación','Nueva','Aprobada','Observada','En validación','Aprobada','Nueva','Aprobada','Observada','En validación','Aprobada','Nueva','Aprobada','Observada','En validación','Aprobada','Nueva','Aprobada','En validación','Aprobada'];
    solicitudes=datos.slice(0,20).map((x,i)=>({
      id:`SOL-2026-${String(i+1).padStart(4,'0')}`,suministro:String(5208000+i*173),instalacion:`INS-${5208000+i*173}`,
      beneficiario:x.nombre,dni:x.dni,empresa:x.instaladora,distrito:x.distrito,tipo:x.tipo,estado:estadosSolicitud[i],
      fecha:`2026-05-${String(Math.max(1,12-i)).padStart(2,'0')}`,dias:68+(i%7)*7,fuente:i%3===0?'Portal de Habilitaciones':'BonoGas 2.0',
      montoPendiente:x.montoPendiente||0,cuotas:x.cuotasPendientes||0
    }));
    llenarFiltroGestion('empresaValidacion',[...new Set(expedientesPago.map(x=>x.empresa))]);
    llenarFiltroGestion('distritoValidacion',[...new Set(expedientesPago.map(x=>x.distrito))]);
    llenarFiltroGestion('distritoSolicitudes',[...new Set(solicitudes.map(x=>x.distrito))]);
  }
  function llenarFiltroGestion(id,valores){
    const control=$(id);valores.sort((a,b)=>a.localeCompare(b,'es')).forEach(valor=>control.add(new Option(valor,valor)));
  }
  function botoneraPaginas(contenedor,pagina,total,onCambio){
    contenedor.replaceChildren();
    const anterior=document.createElement('button');anterior.type='button';anterior.textContent='‹ Anterior';anterior.disabled=pagina===1;anterior.onclick=()=>onCambio(pagina-1);contenedor.append(anterior);
    for(let i=1;i<=total;i++){const boton=document.createElement('button');boton.type='button';boton.textContent=i;boton.classList.toggle('activo',i===pagina);boton.onclick=()=>onCambio(i);contenedor.append(boton);}
    const siguiente=document.createElement('button');siguiente.type='button';siguiente.textContent='Siguiente ›';siguiente.disabled=pagina===total;siguiente.onclick=()=>onCambio(pagina+1);contenedor.append(siguiente);
  }
  function filtrarValidacion(){
    const texto=$('buscarValidacion').value.trim().toLowerCase(),empresa=$('empresaValidacion').value,estado=$('estadoValidacion').value,fecha=$('fechaValidacion').value,distrito=$('distritoValidacion').value;
    return expedientesPago.filter(x=>(!texto||`${x.id} ${x.beneficiario} ${x.empresa}`.toLowerCase().includes(texto))&&(!empresa||x.empresa===empresa)&&(!estado||x.estado===estado)&&(!fecha||x.fecha===fecha)&&(!distrito||x.distrito===distrito));
  }
  function renderValidacion(){
    const lista=filtrarValidacion(),total=Math.max(1,Math.ceil(lista.length/5));paginaValidacion=Math.min(paginaValidacion,total);
    const inicio=(paginaValidacion-1)*5,visibles=lista.slice(inicio,inicio+5);
    $('tablaValidacion').innerHTML=visibles.map(x=>`<tr data-expediente="${x.id}"><td><b>${x.id}</b></td><td>${x.beneficiario}</td><td>${x.empresa}</td><td>${x.distrito}</td><td>${x.fecha}</td><td><b>S/ ${x.monto.toLocaleString('es-PE')}</b></td><td><span class="etiqueta-estado ${claseEstado(x.estado)}">${x.estado}</span></td><td><button class="boton-ver-fila" type="button">Ver</button></td></tr>`).join('')||'<tr><td colspan="8">No hay expedientes con esos filtros.</td></tr>';
    $('tablaValidacion').querySelectorAll('tr[data-expediente]').forEach(fila=>fila.onclick=()=>mostrarDetalleValidacion(fila.dataset.expediente));
    $('resumenValidacion').textContent=`Mostrando ${lista.length?inicio+1:0}–${Math.min(inicio+5,lista.length)} de ${lista.length} registros`;
    botoneraPaginas($('paginacionValidacion'),paginaValidacion,total,p=>{paginaValidacion=p;renderValidacion();});
  }
  function mostrarDetalleValidacion(id){
    const x=expedientesPago.find(item=>item.id===id);if(!x)return;
    document.querySelectorAll('#tablaValidacion tr').forEach(f=>f.classList.toggle('seleccionada',f.dataset.expediente===id));
    $('detalleValidacion').innerHTML=`<div class="estado-detalle"><div><small>EXPEDIENTE DE PAGO</small><h2>${x.id}</h2></div><span class="etiqueta-estado ${claseEstado(x.estado)}">${x.estado}</span></div>
      <section class="bloque-gestion"><h3>Información del expediente</h3><div class="lista-datos-gestion"><div><span>Beneficiario</span><b>${x.beneficiario}</b></div><div><span>Empresa instaladora</span><b>${x.empresa}</b></div><div><span>Cuenta / convenio</span><b>${x.convenio}</b></div><div><span>Fecha conformidad técnica</span><b>${x.fecha} 09:15</b></div><div><span>Monto financiado</span><b>S/ ${(x.monto+420).toLocaleString('es-PE')}</b></div><div><span>Subsidio FISE</span><b>- S/ 420</b></div><div><span>Monto a pagar</span><b>S/ ${x.monto.toLocaleString('es-PE')}</b></div></div></section>
      <section class="bloque-gestion"><h3>Anexos y documentación</h3><div class="lista-documentos">${['Expediente técnico','Declaración jurada','Fotos de instalación','Acta de conformidad','Validación técnica','Datos bancarios'].map(v=>`<div><span>${v}</span><b>✓ Validado</b></div>`).join('')}</div></section>
      <section class="bloque-gestion"><h3>Validación administrativa</h3><div class="chips-validacion">${['Documentación completa','Monto consistente','Sin duplicidad de pago','Beneficiario elegible','Convenio vigente'].map(v=>`<span>✓ ${v}</span>`).join('')}</div></section>
      <section class="bloque-gestion"><h3>Trazabilidad del expediente</h3><div class="trazabilidad-gestion">${['Revisión técnica','Generación de expediente','Validación administrativa','Orden de pago'].map((v,i)=>`<article><i>${i<3?'✓':'○'}</i><b>${v}</b><small>${i<3?'Completado':'Pendiente'}</small></article>`).join('')}</div></section>
      <div class="acciones-detalle-gestion"><button type="button">Observar documentación</button><button type="button">Devolver expediente</button></div>`;
  }
  function filtrarSolicitudes(){
    const texto=$('buscarSolicitudes').value.trim().toLowerCase(),estado=$('estadoSolicitudes').value,distrito=$('distritoSolicitudes').value,fuente=$('fuenteSolicitudes').value;
    return solicitudes.filter(x=>(!texto||`${x.id} ${x.dni} ${x.beneficiario} ${x.distrito}`.toLowerCase().includes(texto))&&(!estado||x.estado===estado)&&(!distrito||x.distrito===distrito)&&(!fuente||x.fuente===fuente));
  }
  function renderSolicitudes(){
    const lista=filtrarSolicitudes(),total=Math.max(1,Math.ceil(lista.length/5));paginaSolicitudes=Math.min(paginaSolicitudes,total);
    const inicio=(paginaSolicitudes-1)*5,visibles=lista.slice(inicio,inicio+5);
    $('tablaSolicitudes').innerHTML=visibles.map(x=>`<tr data-solicitud="${x.id}"><td><b>${x.id}</b></td><td>${x.suministro}</td><td>${x.instalacion}</td><td><b>${x.beneficiario}</b><br><small>${x.dni}</small></td><td>${x.empresa}</td><td>${x.tipo}</td><td><span class="etiqueta-estado ${claseEstado(x.estado)}">${x.estado}</span></td><td>${x.fecha}</td><td><span class="etiqueta-estado ${x.dias>=90?'observado':'orden-emitida'}">${x.dias} d · ${x.dias>=90?'Fuera':'Dentro'}</span></td><td><button class="boton-ver-fila" type="button">Ver</button></td></tr>`).join('')||'<tr><td colspan="10">No hay solicitudes con esos filtros.</td></tr>';
    $('tablaSolicitudes').querySelectorAll('tr[data-solicitud]').forEach(fila=>fila.onclick=()=>mostrarDetalleSolicitud(fila.dataset.solicitud));
    $('resumenSolicitudes').textContent=`Mostrando ${lista.length?inicio+1:0}–${Math.min(inicio+5,lista.length)} de ${lista.length} registros`;
    botoneraPaginas($('paginacionSolicitudes'),paginaSolicitudes,total,p=>{paginaSolicitudes=p;renderSolicitudes();});
  }
  function mostrarDetalleSolicitud(id){
    const x=solicitudes.find(item=>item.id===id);if(!x)return;
    document.querySelectorAll('#tablaSolicitudes tr').forEach(f=>f.classList.toggle('seleccionada',f.dataset.solicitud===id));
    $('detalleSolicitud').innerHTML=`<div class="estado-detalle"><div><small>DETALLE DE SOLICITUD</small><h2>${x.id}</h2></div><span class="etiqueta-estado ${claseEstado(x.estado)}">${x.estado}</span></div><p>Revisión de elegibilidad, documentos y trazabilidad de instalación.</p>
      <section class="bloque-gestion"><h3>Datos del suministro</h3><div class="lista-datos-gestion"><div><span>Solicitud portal</span><b>${x.id}</b></div><div><span>N° suministro</span><b>${x.suministro}</b></div><div><span>N° instalación</span><b>${x.instalacion}</b></div><div><span>Beneficiario</span><b>${x.beneficiario}</b></div><div><span>DNI / RUC</span><b>${x.dni}</b></div><div><span>Tipo</span><b>${x.tipo}</b></div><div><span>Empresa instaladora</span><b>${x.empresa}</b></div><div><span>Fuente</span><b>${x.fuente}</b></div><div><span>Fecha registro portal</span><b>${x.fecha}</b></div></div></section>
      <section class="bloque-gestion"><h3>Datos de recaudación</h3><div class="lista-datos-gestion"><div><span>Cuotas pendientes</span><b>${x.cuotas}</b></div><div><span>Monto pendiente</span><b>S/ ${Number(x.montoPendiente).toFixed(2)}</b></div></div></section>
      <section class="bloque-gestion"><h3>Control de plazo Art. 25.9</h3><div class="lista-datos-gestion"><div><span>Días en construcción</span><b>${x.dias} días — ${x.dias>=90?'Fuera de plazo':'Dentro de plazo'}</b></div><div><span>Límite regulatorio</span><b>90 días calendario</b></div></div></section>
      <section class="bloque-gestion"><h3>Trazabilidad</h3><div class="trazabilidad-gestion">${['Registro','Validación','Instalación','Habilitación'].map((v,i)=>`<article><i>${i<2?'✓':'○'}</i><b>${v}</b><small>${i<2?'Completado':'Pendiente'}</small></article>`).join('')}</div></section>`;
  }
  function prepararGestion(){
    crearDatosGestion();renderValidacion();renderSolicitudes();
    mostrarDetalleValidacion(expedientesPago[0].id);mostrarDetalleSolicitud(solicitudes[0].id);
    $('filtrosValidacion').onsubmit=e=>{e.preventDefault();paginaValidacion=1;renderValidacion();};
    $('filtrosSolicitudes').onsubmit=e=>{e.preventDefault();paginaSolicitudes=1;renderSolicitudes();};
    $('buscarValidacion').oninput=()=>{paginaValidacion=1;renderValidacion();};
    $('buscarSolicitudes').oninput=()=>{paginaSolicitudes=1;renderSolicitudes();};
    $('exportarValidacion').onclick=()=>exportarCsv(filtrarValidacion(),'expedientes_validacion_bonogas.csv');
    const actualizarControlesFlotantes=esMapa=>{
      $('barraHerramientas').hidden=!esMapa;
      document.querySelector('.boton-asistente-ia')?.toggleAttribute('hidden',!esMapa);
    };
    actualizarControlesFlotantes(!$('satcontrol').hidden);
    requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
    document.addEventListener('seccionmodulo:cambio',e=>{
      window.scrollTo({top:0,behavior:'instant'});
      const esMapa=e.detail.id==='satcontrol';
      actualizarControlesFlotantes(esMapa);
      if(esMapa)setTimeout(()=>{ajustarTablero();mapa.invalidateSize({pan:false});},80);
    });
  }
  function iniciar(){
    mapa=L.map('mapaBonogas',{zoomControl:false}).setView([-10.6,-75.3],5);
    const panelMapa=document.querySelector('.mapa-panel');
    if('ResizeObserver' in window&&panelMapa){
      new ResizeObserver(()=>requestAnimationFrame(()=>mapa?.invalidateSize({pan:false}))).observe(panelMapa);
    }
    L.control.zoom({position:'bottomleft'}).addTo(mapa);
    bases.osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'});
    bases.topografico=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{attribution:'© OpenTopoMap'});
    baseActual=bases.osm.addTo(mapa);
    grupoMarcadores=L.markerClusterGroup({
      maxClusterRadius:65,
      disableClusteringAtZoom:14,
      showCoverageOnHover:false,
      spiderfyOnMaxZoom:true,
      iconCreateFunction(cluster){
        const total=cluster.getChildCount();
        const texto=total>=1000?`${Math.round(total/1000)}k`:total;
        return L.divIcon({html:`<span>${texto}</span>`,className:'marker-cluster-fise marker-cluster-bonogas',iconSize:[52,52]});
      }
    }).addTo(mapa);
    capaEstratos=L.layerGroup();
    capaRedTroncal=L.layerGroup();
    capaRedResidencial=L.layerGroup();
    capaManzanasFise=L.layerGroup();
    capaTematica=L.layerGroup();
    capaDibujo=L.layerGroup().addTo(mapa);
    prepararFiltros();actualizarMapa(false);ajustarTablero();prepararGestion();

    $('filtrosBonogas').addEventListener('submit',e=>{e.preventDefault();actualizarMapa(true);});
    $('filtrosBonogas').addEventListener('reset',()=>setTimeout(()=>{prepararFiltros();actualizarMapa(true);limpiarDibujo();},0));
    $('filtroDepartamento').addEventListener('change',()=>{const lista=datos.filter(x=>!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value);llenarSelect('filtroDistrito',valoresUnicos('distrito',lista),'Todos');});
    $('filtroTipo').addEventListener('change',()=>{const lista=datos.filter(x=>!$('filtroTipo').value||x.tipo===$('filtroTipo').value);llenarSelect('filtroSubtipo',valoresUnicos('subtipo',lista),'Todos');});
    ['panelMapas','panelCapas','panelTematicos'].forEach(id=>{L.DomEvent.disableClickPropagation($(id));L.DomEvent.disableScrollPropagation($(id));});
    $('botonMapas').onclick=()=>alternarPanel('panelMapas','botonMapas');
    $('botonCapas').onclick=()=>alternarPanel('panelCapas','botonCapas');
    $('botonTematicos').onclick=()=>alternarPanel('panelTematicos','botonTematicos');
    document.querySelectorAll('[name="mapaBase"]').forEach(r=>r.onchange=()=>{mapa.removeLayer(baseActual);baseActual=bases[r.value].addTo(mapa);baseActual.bringToBack();});
    document.querySelectorAll('[data-capa-estado]').forEach(control=>control.onchange=()=>actualizarMapa(false));
    $('capaEstratos').onchange=e=>e.target.checked?capaEstratos.addTo(mapa):mapa.removeLayer(capaEstratos);
    [['capaRedTroncal',capaRedTroncal],['capaRedResidencial',capaRedResidencial],['capaManzanasFise',capaManzanasFise]].forEach(([id,capa])=>{
      $(id).onchange=e=>e.target.checked?capa.addTo(mapa):mapa.removeLayer(capa);
    });
    $('activarTematico').onchange=actualizarDensidad;
    document.querySelectorAll('[name="tipoTematico"]').forEach(control=>control.onchange=actualizarInterfazTematica);
    $('botonResumenBonogas').onclick=()=>{const tablero=document.querySelector('.tablero-bonogas'),oculto=tablero.classList.toggle('panel-oculto');$('botonResumenBonogas').setAttribute('aria-label',oculto?'Mostrar panel derecho':'Ocultar panel derecho');setTimeout(()=>mapa.invalidateSize(),280);};
    window.addEventListener('resize',ajustarTablero);
    $('abrirReporte259').onclick=()=>{pagina259=1;renderReporte259();abrirModal('modalReporte259');};
    $('abrirReporte20').onclick=()=>{renderReporte20();abrirModal('modalReporte20');};
    $('botonExportarBonogas').onclick=abrirExportacionBonogas;
    $('confirmarExportacionBonogas').onclick=generarExportacionBonogas;
    document.querySelectorAll('[data-cerrar-modal]').forEach(b=>b.onclick=()=>$(b.dataset.cerrarModal).close());
    document.querySelectorAll('.modal-reporte').forEach(modal=>modal.onclick=e=>{if(e.target===modal)modal.close();});
    $('buscarReporte259').oninput=()=>{pagina259=1;renderReporte259();};$('buscarReporte20').oninput=renderReporte20;
    $('anterior259').onclick=()=>{pagina259--;renderReporte259();};$('siguiente259').onclick=()=>{pagina259++;renderReporte259();};
    document.querySelectorAll('[data-exportar]').forEach(b=>b.onclick=()=>exportarReporte(b.dataset.exportar,b.dataset.reporte));
    document.querySelectorAll('[data-exportar-ranking]').forEach(b=>b.onclick=()=>exportarRanking(b.dataset.exportarRanking));
    document.querySelector('.notificar').onclick=()=>{document.querySelector('.notificar').textContent='Notificaciones preparadas';};
    renderPenalidades();
    $('abrirHerramientas').onclick=()=>{
      const abierto=$('grupoHerramientas').hidden;
      $('grupoHerramientas').hidden=!abierto;
      $('abrirHerramientas').setAttribute('aria-expanded',String(abierto));
    };
    document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>activarHerramienta(b.dataset.tool,b));
    $('liquidacionExpediente').onchange=()=>{
      const expediente=expedientesLiquidacion[$('liquidacionExpediente').value];
      $('liquidacionEmpresa').value=expediente.empresa;
      $('liquidacionFinanciado').value=expediente.financiado;$('liquidacionSubsidio').value=expediente.subsidio;
      $('liquidacionConexion').value=expediente.conexion;$('liquidacionAcometida').value=expediente.acometida;$('liquidacionPenalidad').value=expediente.penalidad;
      $('generarLiquidacion').disabled=true;$('emitirOrdenLiquidacion').disabled=true;cambiarEstadoLiquidacion('Preliquidación');calcularLiquidacion();
    };
    $('calcularLiquidacion').onclick=calcularLiquidacion;
    $('generarLiquidacion').onclick=()=>{
      if(![...document.querySelectorAll('[data-control-liquidacion]')].every(control=>control.checked))return;
      cambiarEstadoLiquidacion('Liquidación generada');actualizarHistorialLiquidacion('Liquidación generada');
      $('emitirOrdenLiquidacion').disabled=false;$('generarLiquidacion').disabled=true;
    };
    $('emitirOrdenLiquidacion').onclick=()=>{
      cambiarEstadoLiquidacion('Orden emitida');actualizarHistorialLiquidacion('Orden emitida');
      $('emitirOrdenLiquidacion').disabled=true;
    };
    document.querySelectorAll('[data-control-liquidacion]').forEach(control=>control.onchange=()=>{
      control.closest('label').querySelector('b').textContent=control.checked?'Validado':'Pendiente';
      $('generarLiquidacion').disabled=![...document.querySelectorAll('[data-control-liquidacion]')].every(item=>item.checked);
    });
    $('sustentoLiquidacion').onchange=()=>$('nombreSustentoLiquidacion').textContent=$('sustentoLiquidacion').files[0]?.name||'Ningún archivo seleccionado';
    $('exportarLiquidacion').onclick=exportarLiquidacion;
    document.querySelectorAll('[data-archivo-ia]').forEach(input=>input.onchange=()=>{
      const nombre=input.files[0]?.name||'Sin archivo';
      input.closest('label').classList.toggle('cargado',Boolean(input.files.length));
      input.closest('label').querySelector('[data-nombre-archivo]').textContent=nombre;
    });
    $('iniciarValidacionIA').onclick=iniciarAnalisisIA;
    $('reintentoGabineteIA').onchange=()=>{
      if(!$('reintentoGabineteIA').files.length)return;
      $('resultadoGabineteIA').className='aprobado';
      $('detalleGabineteIA').textContent='Nitidez 97% · contenido correcto tras reintento';
      $('estadoGabineteIA').textContent='Aprobada';
      $('totalAprobadasIA').textContent='5';$('totalObservadasIA').textContent='0';
      $('alertaResultadoIA').hidden=true;
    };
    $('finalizarValidacionIA').onclick=()=>{$('finalizarValidacionIA').textContent='Validación guardada';setTimeout(()=>{$('modalValidacionIA').close();$('finalizarValidacionIA').textContent='Guardar validación';},650);};
    mapa.on('click',e=>{if(herramienta==='poligono'){puntos.push(e.latlng);figuraTemporal?figuraTemporal.setLatLngs(puntos):figuraTemporal=L.polyline(puntos,{color:'#d68b22',weight:3}).addTo(capaDibujo);}else if(herramienta==='circulo'&&!centroCirculo){centroCirculo=e.latlng;figuraTemporal=L.circle(centroCirculo,{radius:100,color:'#7657c7',fillOpacity:.13}).addTo(capaDibujo);}});
    mapa.on('mousemove',e=>{if(herramienta==='poligono'&&figuraTemporal)figuraTemporal.setLatLngs([...puntos,e.latlng]);if(herramienta==='circulo'&&figuraTemporal)figuraTemporal.setRadius(mapa.distance(centroCirculo,e.latlng));});
    mapa.on('dblclick',cerrarDibujo);
  }
  if(typeof L==='undefined')return;
  fetch('datos_bonogas.json').then(r=>{if(!r.ok)throw new Error('Datos no disponibles');return r.json();}).then(registros=>{datos=registros;iniciar();}).catch(error=>{$('contadorMapa').textContent='No se pudieron cargar los datos';console.error(error);});
})();
