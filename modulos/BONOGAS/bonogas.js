(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const idsFiltros=['filtroDepartamento','filtroDistrito','filtroEstrato','filtroTipo','filtroSubtipo','filtroInstaladora','filtroConcesionaria','filtroProyecto','filtroConsumidor','filtroDesde','filtroHasta'];
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
  let datos=[],datosVisibles=[],seleccionExportacion=[],expedientesPago=[],solicitudes=[],paginaValidacion=1,paginaSolicitudes=1,paginaDinamicaAdministracion=1,mapa,mapaDinamicoAdministracion,capaDinamicaAdministracion,baseActual,grupoMarcadores,grupoInstaladores,grupoHospitales,capaEstratos,capaRedTroncal,capaRedResidencial,capaManzanasFise,capaTematica,capaDibujo,pagina259=1,paginaPenalidades=1,pagina20=1,paginaInstaladores20=1,paginaPacProyectos=1,paginaHistorialLiquidaciones=1,herramienta=null,puntos=[],figuraTemporal=null,centroCirculo=null,temporizadorIA=null;
  const bases={};
  const provinciasPorDistrito={Chimbote:'Santa','Nuevo Chimbote':'Santa',Independencia:'Huaraz',Andahuaylas:'Andahuaylas',Atico:'Caravelí',Camaná:'Camaná','Cerro Colorado':'Arequipa',Paucarpata:'Arequipa',Huanta:'Huanta',Celendín:'Celendín',Jaén:'Jaén','Tingo María':'Leoncio Prado','Chincha Alta':'Chincha',Pisco:'Pisco',Jauja:'Jauja',Chiclayo:'Chiclayo',Pimentel:'Chiclayo',Iquitos:'Maynas',Punchana:'Maynas',Belén:'Maynas',Ilo:'Ilo',Paita:'Paita',Sullana:'Sullana',Azángaro:'Azángaro',Ilave:'El Collao',Juliaca:'San Román',Moyobamba:'Moyobamba',Rioja:'Rioja',Tarapoto:'San Martín',Morales:'San Martín','Aguas Verdes':'Zarumilla',Zarumilla:'Zarumilla'};
  function provinciaRegistro(x){return provinciasPorDistrito[x.distrito]||x.departamento;}

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
    llenarSelect('filtroProyecto',valoresUnicos('proyecto'),'Todos');
    llenarSelect('filtroConsumidor',valoresUnicos('tipoConsumidor'),'Todos');
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
      (!$('filtroProyecto').value||x.proyecto===$('filtroProyecto').value)&&
      (!$('filtroConsumidor').value||x.tipoConsumidor===$('filtroConsumidor').value)&&
      (!desde||x.fechaRegistro>=desde)&&(!hasta||x.fechaRegistro<=hasta)
    );
  }
  function iconoRegistro(x){
    const hospital=x.proyecto==='Proyecto Hospitales FISE';
    const contenido=hospital?'<span class="icono-hospital-mapa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h14v17M3 21h18M9 8h6M12 5v6M8 14h2M14 14h2M8 18h2M14 18h2"/></svg></span>':`<span class="punto-bonogas" style="--color:${coloresEstado[x.estadoRegistro]}"></span>`;
    return L.divIcon({className:`marcador-bonogas ${hospital?'marcador-proyecto-hospital':''}`,html:contenido,iconSize:[hospital?30:18,hospital?30:18],iconAnchor:[hospital?15:9,hospital?15:9]});
  }
  function resumenInstalador(empresa,lista=filtrar()){
    const registros=lista.filter(x=>x.instaladora===empresa),liquidadas=registros.filter(x=>x.estadoRegistro==='Liquidado'),pendientes=registros.filter(x=>x.estadoRegistro==='Pendiente de liquidación');
    const sede=registros[0]||{lat:-10.6,lng:-75.3};
    return {empresa,registros,total:registros.length,liquidadas:liquidadas.length,pendientes:pendientes.length,montoLiquidado:liquidadas.reduce((s,x)=>s+(x.costo||0),0),montoPendiente:pendientes.reduce((s,x)=>s+(x.costo||0),0),lat:sede.lat,lng:sede.lng};
  }
  function iconoInstalador(resumen){const color=resumen.pendientes?'#f28b32':'#d86b20';return L.divIcon({className:'marcador-instalador-bonogas',html:`<span style="--color:${color}"><b>${resumen.pendientes}</b></span>`,iconSize:[34,34],iconAnchor:[17,17]});}
  function mostrarDetalleProyecto(registro){
    const registrosProyecto=datos.filter(x=>x.codigoProyecto===registro.codigoProyecto),liquidadas=registrosProyecto.filter(x=>x.estadoRegistro==='Liquidado'),pendientes=registrosProyecto.filter(x=>x.estadoRegistro==='Pendiente de liquidación'),montoLiquidado=liquidadas.reduce((s,x)=>s+(x.costo||0),0),montoPendiente=pendientes.reduce((s,x)=>s+(x.costo||0),0),detalle=$('detalleBeneficiario');
    seleccionExportacion=[...registrosProyecto];$('trazabilidadMapa').hidden=true;detalle.hidden=false;
    detalle.innerHTML=`<button class="cerrar-detalle" type="button">Limpiar</button><small>PROYECTO FISE · ESTABLECIMIENTO DE SALUD</small><h3>${registro.nombreProyecto}</h3><section class="cabecera-proyecto-hospital"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h14v17M3 21h18M9 8h6M12 5v6M8 14h2M14 14h2M8 18h2M14 18h2"/></svg></i><div><b>${registro.hospital}</b><span>${registro.distrito} · ${registro.departamento}</span><small>${registro.codigoProyecto}</small></div><em>${registro.estadoProyecto}</em></section><section class="resumen-instalador-mapa resumen-proyecto-hospital"><article><span>Avance del proyecto</span><strong>${registro.avanceProyecto}%</strong></article><article><span>Inversión FISE</span><strong>${monedaLiquidacion(registro.montoProyecto)}</strong></article><article><span>Instalaciones</span><strong>${registrosProyecto.length}</strong></article><article class="pendiente"><span>Faltan liquidar</span><strong>${pendientes.length}</strong></article></section><section class="bloque-detalle"><h4>Liquidación del proyecto</h4><div class="detalle-grid"><div><small>Instalaciones liquidadas</small><b>${liquidadas.length}</b></div><div><small>Monto liquidado</small><b>${monedaLiquidacion(montoLiquidado)}</b></div><div><small>Instalaciones pendientes</small><b>${pendientes.length}</b></div><div><small>Monto por liquidar</small><b>${monedaLiquidacion(montoPendiente)}</b></div></div><div class="barra-evolucion-instalador"><i style="width:${registro.avanceProyecto}%"></i></div></section><section class="bloque-detalle"><h4>Información técnica</h4><div class="detalle-grid"><div><small>Tipo de consumidor</small><b>${registro.tipoConsumidor}</b></div><div><small>Empresa instaladora</small><b>${registro.instaladora}</b></div><div><small>Concesionaria</small><b>${registro.concesionaria}</b></div><div><small>Fecha de inicio</small><b>${registro.fechaInicio}</b></div></div></section>`;
    $('panelDerecho').insertBefore(detalle,$('panelDerecho').querySelector('.control-259'));[...$('panelDerecho').children].forEach(el=>{el.hidden=!(el===detalle||el.id==='botonExportarBonogas'||el.classList.contains('tarjeta-control'));});detalle.querySelector('.cerrar-detalle').onclick=restaurarResumen;$('panelDerecho').scrollTo({top:0,behavior:'smooth'});
  }
  function mostrarDetalleInstalador(resumen){
    seleccionExportacion=[...resumen.registros];$('trazabilidadMapa').hidden=true;const detalle=$('detalleBeneficiario'),avance=resumen.total?Math.round(resumen.liquidadas/resumen.total*100):0;detalle.hidden=false;
    detalle.innerHTML=`<button class="cerrar-detalle" type="button">Limpiar</button><small>REGISTRO DE EMPRESA INSTALADORA</small><h3>${resumen.empresa}</h3><section class="resumen-instalador-mapa"><article><span>Instalaciones</span><strong>${resumen.total}</strong></article><article><span>Liquidadas</span><strong>${resumen.liquidadas}</strong></article><article class="pendiente"><span>Faltan liquidar</span><strong>${resumen.pendientes}</strong></article><article><span>Evolución</span><strong>${avance}%</strong></article></section><section class="bloque-detalle"><h4>Liquidación y montos</h4><div class="detalle-grid"><div><small>Monto liquidado</small><b>${monedaLiquidacion(resumen.montoLiquidado)}</b></div><div><small>Monto por liquidar</small><b>${monedaLiquidacion(resumen.montoPendiente)}</b></div></div><div class="barra-evolucion-instalador"><i style="width:${avance}%"></i></div><small class="texto-evolucion-instalador">${resumen.liquidadas} de ${resumen.total} instalaciones liquidadas</small></section><section class="bloque-detalle"><h4>Instalaciones pendientes</h4><div class="lista-seleccion">${resumen.registros.filter(x=>x.estadoRegistro==='Pendiente de liquidación').slice(0,8).map(x=>`<article><b>${x.numeroSuministro||x.suministro}</b><small>${x.nombre} · ${x.distrito} · ${monedaLiquidacion(x.costo)}</small></article>`).join('')||'<p>No tiene instalaciones pendientes de liquidación.</p>'}</div></section>`;
    $('panelDerecho').insertBefore(detalle,$('panelDerecho').querySelector('.control-259'));
    [...$('panelDerecho').children].forEach(el=>{el.hidden=!(el===detalle||el.id==='botonExportarBonogas'||el.classList.contains('tarjeta-control'));});detalle.querySelector('.cerrar-detalle').onclick=restaurarResumen;$('panelDerecho').scrollTo({top:0,behavior:'smooth'});
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
      ['Costo de instalación (liquidación)',`S/ ${x.costo.toFixed(2)}`],['Monto financiado',`S/ ${x.montoFinanciado.toFixed(2)}`],
      ['Aporte FISE',`S/ ${x.subsidio.toFixed(2)} (${Math.round(x.subsidio/x.costo*100)}%)`],['Suministro activo',x.suministroActivo],['Valor de cuota mensual',`S/ ${x.valorCuota.toFixed(2)}`],
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
    mapa?.closePopup();
    if(mapa&&grupoMarcadores)actualizarMapa(true);
  }
  function actualizarMapa(ajustar=true){
    seleccionExportacion=[];
    const estadosActivos=new Set([...document.querySelectorAll('[data-capa-estado]:checked')].map(control=>control.dataset.capaEstado));
    datosVisibles=filtrar().filter(x=>estadosActivos.has(x.estadoRegistro));
    grupoMarcadores.clearLayers();
    grupoInstaladores.clearLayers();
    grupoHospitales.clearLayers();
    capaEstratos.clearLayers();
    datosVisibles.forEach((x,indice)=>{
      const esProyecto=x.proyecto==='Proyecto Hospitales FISE',tituloMarcador=esProyecto?`${x.codigoProyecto} · ${x.hospital}`:`${x.numeroSuministro} · ${x.nombre}`;
      const marker=L.marker([x.lat,x.lng],{icon:iconoRegistro(x),title:tituloMarcador,zIndexOffset:esProyecto?1200:0});
      marker.bindTooltip(`${x.nombre}<br>${x.proyecto} · ${x.tipoConsumidor}<br>${x.distrito}`);
      if(esProyecto)marker.bindTooltip(`<b>${x.hospital}</b><br>${x.nombreProyecto}<br>Avance ${x.avanceProyecto}% · ${x.estadoProyecto}`);
      marker.on('click',()=>esProyecto?mostrarDetalleProyecto(x):mostrarDetalle(x));
      (x.proyecto==='Proyecto Hospitales FISE'?grupoHospitales:grupoMarcadores).addLayer(marker);
      if(indice%3===0){
        const delta=.018+(Number(x.estrato)-1)*.006;
        L.rectangle([[x.lat-delta,x.lng-delta],[x.lat+delta,x.lng+delta]],{className:'lote-bonogas',interactive:false}).addTo(capaEstratos);
      }
    });
    const baseInstaladores=filtrar();
    valoresUnicos('instaladora',baseInstaladores).map(empresa=>resumenInstalador(empresa,baseInstaladores)).forEach(resumen=>{const marker=L.marker([resumen.lat,resumen.lng],{icon:iconoInstalador(resumen),title:`${resumen.empresa} · ${resumen.pendientes} pendientes`});marker.bindTooltip(`<b>${resumen.empresa}</b><br>${resumen.pendientes} por liquidar · ${monedaLiquidacion(resumen.montoPendiente)}`);marker.on('click',()=>mostrarDetalleInstalador(resumen));grupoInstaladores.addLayer(marker);});
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
      if($('capaInstaladoresLiquidacion')?.checked&&!mapa.hasLayer(grupoInstaladores))grupoInstaladores.addTo(mapa);
      if($('capaProyectosHospitalarios')?.checked&&!mapa.hasLayer(grupoHospitales))grupoHospitales.addTo(mapa);
      return;
    }
    [grupoMarcadores,grupoInstaladores,grupoHospitales].forEach(grupo=>{if(grupo&&mapa.hasLayer(grupo))mapa.removeLayer(grupo)});
    const tipo=document.querySelector('[name="tipoTematico"]:checked')?.value||'morosidad';
    const maxMonto=Math.max(1,...datosVisibles.map(registro=>registro.montoPendiente||0));
    const puntos=datosVisibles.map(registro=>{
      let intensidad=.55;
      if(tipo==='morosidad')intensidad=.2+.8*((registro.montoPendiente||0)/maxMonto);
      if(tipo==='recaudacion')intensidad=.15+.85*Math.min(1,(registro.cuotasPagadas||0)/Math.max(1,registro.cuotasTotales||1));
      if(tipo==='estado-pago'){
        const pagado=(registro.cuotasPendientes||0)===0||(registro.montoPendiente||0)===0;
        intensidad=pagado?.18:(registro.cuotasPagadas||0)===0?1:registro.suministroActivo==='Sí'?.42:.72;
      }
      return [registro.lat,registro.lng,Math.min(1,intensidad)];
    });
    const opciones=tipo==='recaudacion'
      ?{radius:34,blur:27,maxZoom:11,minOpacity:.28,gradient:{.15:'#3f91d7',.45:'#2fc7c0',.72:'#6556db',1:'#3e287d'}}
      :tipo==='estado-pago'
        ?{radius:35,blur:25,maxZoom:12,minOpacity:.28,gradient:{.12:'#428bd1',.4:'#47bd68',.7:'#efbe24',1:'#e34951'}}
        :{radius:36,blur:28,maxZoom:12,minOpacity:.24,gradient:{.15:'#3fb56f',.48:'#f0d23d',.72:'#ef982f',1:'#d83e50'}};
    if(typeof L.heatLayer==='function'){
      L.heatLayer(puntos,opciones).addTo(capaTematica);
    }else{
      puntos.forEach(([lat,lng,intensidad])=>L.circleMarker([lat,lng],{radius:12+intensidad*22,stroke:false,fillColor:tipo==='recaudacion'?'#477dde':'#df5a4f',fillOpacity:.2+.35*intensidad}).addTo(capaTematica));
    }
    if(!mapa.hasLayer(capaTematica))capaTematica.addTo(mapa);
  }
  function actualizarInterfazTematica(){
    const tipo=document.querySelector('[name="tipoTematico"]:checked')?.value||'morosidad';
    $('leyendaTematica').className=`leyenda-calor ${tipo==='recaudacion'?'leyenda-cobertura':'leyenda-morosidad'}`;
    const leyenda=$('leyendaTematica');
    if(tipo==='morosidad'){leyenda.innerHTML='<span>Baja</span><i></i><span>Crítica</span>';$('descripcionTematica').textContent='Baja · Media · Crítica. Identifica manzanas y suministros con mayor deuda pendiente de recaudación.'}
    else if(tipo==='recaudacion'){leyenda.innerHTML='<span>Baja</span><i></i><span>Alta</span>';$('descripcionTematica').textContent='Baja · Media · Alta. Representa las zonas según cuotas pagadas y avance de recaudación.'}
    else{leyenda.innerHTML='<span>Estado</span><i></i><span>Pago</span>';$('descripcionTematica').innerHTML='Activo<br>Seguimiento<br>No pagando<br><strong>Los que ya pagaron</strong>'}
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
  function datosHistoricosLiquidaciones(){
    const empresas=['Instalaciones del Norte S.A.C.','Conexiones Seguras S.A.C.','TecnoGas Arequipa','RedGas Perú S.A.C.','Cajamarca Gas','Oriente Gas Perú'];
    const filas=[];
    for(let indice=0;indice<18;indice++){
      const fecha=new Date(2026,7-indice,1),periodo=`${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}`,empresa=empresas[indice%empresas.length],expedientes=18+(indice*7)%31,liquidado=expedientes*(1420+(indice%4)*135),factor=[1,.82,.68,.9][indice%4],pagado=Math.round(liquidado*factor),saldo=liquidado-pagado,estado=factor===1?'Pagada':factor>=.8?'Pago parcial':factor>=.7?'Orden emitida':'Observada';
      filas.push({periodo,empresa,expedientes,liquidado,pagado,saldo,estado,ultimaOrden:`${String(8+(indice%18)).padStart(2,'0')}/${String(fecha.getMonth()+1).padStart(2,'0')}/${fecha.getFullYear()}`});
    }
    return filas;
  }
  function renderHistorialLiquidaciones(){
    const periodo=$('historialPeriodo').value,empresa=$('historialEmpresa').value,estado=$('historialEstado').value;
    const lista=datosHistoricosLiquidaciones().filter(x=>(!periodo||x.periodo.startsWith(periodo))&&(!empresa||x.empresa===empresa)&&(!estado||x.estado===estado));
    const liquidado=lista.reduce((s,x)=>s+x.liquidado,0),pagado=lista.reduce((s,x)=>s+x.pagado,0),saldo=lista.reduce((s,x)=>s+x.saldo,0);
    $('histMontoLiquidado').textContent=monedaLiquidacion(liquidado);$('histMontoPagado').textContent=monedaLiquidacion(pagado);$('histMontoPendiente').textContent=monedaLiquidacion(saldo);$('histEmpresas').textContent=new Set(lista.map(x=>x.empresa)).size;$('histRegistros').textContent=`${lista.length} registro${lista.length===1?'':'s'}`;
    const meses=[...new Set(lista.map(x=>x.periodo))].sort().map(mes=>{const filas=lista.filter(x=>x.periodo===mes),total=filas.reduce((s,x)=>s+x.liquidado,0),pago=filas.reduce((s,x)=>s+x.pagado,0);return {mes,total,pago};}),maximo=Math.max(1,...meses.map(x=>x.total));
    $('graficoHistorialLiquidaciones').innerHTML=meses.map(x=>`<article title="${x.mes}: ${monedaLiquidacion(x.total)}"><div><i style="height:${Math.max(5,x.total/maximo*100)}%"></i><b style="height:${Math.max(3,x.pago/maximo*100)}%"></b></div><span>${x.mes.slice(5)}/${x.mes.slice(2,4)}</span></article>`).join('')||'<p>Sin movimientos para los filtros seleccionados.</p>';
    const tamano=6,totalPaginas=Math.max(1,Math.ceil(lista.length/tamano));paginaHistorialLiquidaciones=Math.min(Math.max(1,paginaHistorialLiquidaciones),totalPaginas);const visibles=lista.slice((paginaHistorialLiquidaciones-1)*tamano,paginaHistorialLiquidaciones*tamano);
    $('tablaHistorialLiquidaciones').innerHTML=visibles.map(x=>`<tr><td>${x.periodo}</td><td><b>${x.empresa}</b></td><td>${x.expedientes}</td><td>${monedaLiquidacion(x.liquidado)}</td><td>${monedaLiquidacion(x.pagado)}</td><td>${monedaLiquidacion(x.saldo)}</td><td><span class="estado-historico ${x.estado.toLowerCase().replace(' ','-')}">${x.estado}</span></td><td>${x.ultimaOrden}</td></tr>`).join('')||'<tr><td colspan="8">No hay liquidaciones para los filtros seleccionados.</td></tr>';
    $('paginaHistorialLiquidaciones').textContent=`Página ${paginaHistorialLiquidaciones} de ${totalPaginas} · ${lista.length} registros`;$('anteriorHistorialLiquidaciones').disabled=paginaHistorialLiquidaciones===1;$('siguienteHistorialLiquidaciones').disabled=paginaHistorialLiquidaciones===totalPaginas;
  }
  function prepararHistorialLiquidaciones(){
    const select=$('historialEmpresa');select.replaceChildren(new Option('Todas las empresas',''));[...new Set(datosHistoricosLiquidaciones().map(x=>x.empresa))].sort((a,b)=>a.localeCompare(b,'es')).forEach(x=>select.add(new Option(x,x)));
    ['historialPeriodo','historialEmpresa','historialEstado'].forEach(id=>$(id).onchange=()=>{paginaHistorialLiquidaciones=1;renderHistorialLiquidaciones();});
    $('limpiarHistorialLiquidaciones').onclick=()=>{['historialPeriodo','historialEmpresa','historialEstado'].forEach(id=>$(id).value='');paginaHistorialLiquidaciones=1;renderHistorialLiquidaciones();};$('anteriorHistorialLiquidaciones').onclick=()=>{if(paginaHistorialLiquidaciones>1){paginaHistorialLiquidaciones--;renderHistorialLiquidaciones();}};$('siguienteHistorialLiquidaciones').onclick=()=>{paginaHistorialLiquidaciones++;renderHistorialLiquidaciones();};renderHistorialLiquidaciones();
  }
  function abrirHistorialLiquidaciones(){paginaHistorialLiquidaciones=1;prepararHistorialLiquidaciones();abrirModal('modalHistorialLiquidaciones');}
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
  function registroFormato259(x,indice){
    const vias=['Av. Los Próceres','Av. Aviación','Jr. San Martín','Calle Comercio','Av. Industrial','Psje. Las Flores'],urbanizaciones=['Santa Rosa','Los Jardines','Villa FISE','San José','Las Palmeras','Nueva Esperanza'];
    const hospital=String(x.tipoConsumidor||'').toLowerCase().includes('hospital'),social=x.subtipo==='Comedor Popular',publica=indice%19===0,mype=x.subtipo==='Comercial',montante=x.subtipo==='Multifamiliar';
    const categoriaProyecto=hospital?'Hospitales':social?'Instituciones de índole social':publica?'Instituciones públicas':mype?'Micro y pequeñas empresas (MYPES)':montante?'Líneas montantes':'Residencial';
    const estados={'Liquidado':'05-Instalación interna iniciada','Pendiente de liquidación':'04-Instalación interna programada','Dentro de plazo':'02-Solicitud de Suministro aprobada','Fuera de plazo':'04.1-Instalación interna programada observada'};
    return {...x,numeroSolicitud:String(3558047-indice*37),estadoSolicitud:estados[x.estadoRegistro]||'02-Solicitud de Suministro aprobada',categoriaProyecto,ventaNoGasificada:indice%11===0?'Sí':'No',direccion:`${vias[indice%vias.length]} ${420+(indice%35)*18}`,urbanizacion:urbanizaciones[indice%urbanizaciones.length],manzana:String.fromCharCode(65+indice%12),lote:String(1+indice%24),fechaPreaprobacion:x.fechaHabilitacion||'',convenioVigente:indice%5===0?'No':'Sí'};
  }
  function registrosReporte259(){
    const q=textoBusqueda('buscarReporte259'),categoria=$('categoriaReporte259').value,departamento=$('departamentoReporte259').value,estado=$('estadoReporte259').value;
    return datos.map(registroFormato259).filter(x=>(!q||[x.suministro,x.numeroSuministro,x.nombre,x.instaladora,x.concesionaria,x.estadoSolicitud,x.direccion,x.urbanizacion,x.manzana,x.lote].some(v=>String(v||'').toLowerCase().includes(q)))&&(!categoria||x.categoriaProyecto===categoria)&&(!departamento||x.departamento===departamento)&&(!estado||x.estadoSolicitud===estado));
  }
  function renderReporte259(){
    const lista=registrosReporte259(),tamano=8,total=Math.max(1,Math.ceil(lista.length/tamano));
    pagina259=Math.min(Math.max(1,pagina259),total);
    $('tablaReporte259').innerHTML=lista.slice((pagina259-1)*tamano,pagina259*tamano).map(x=>`<tr><td>${x.concesionaria}</td><td>${x.instaladora}</td><td>${x.numeroSolicitud}</td><td>${x.estadoSolicitud}</td><td>${x.numeroSuministro||x.suministro}</td><td>${x.categoriaProyecto}</td><td>${x.ventaNoGasificada}</td><td>${x.departamento}</td><td>${x.fechaRegistro}</td><td>${x.fechaPreaprobacion||'—'}</td><td class="${x.diasCalendario>=90?'estado-critico':''}">${x.diasCalendario}</td><td>${x.convenioVigente}</td></tr>`).join('')||'<tr><td colspan="12">No hay registros con los filtros seleccionados.</td></tr>';
    $('kpi259Fuera').textContent=lista.filter(x=>x.diasCalendario>=90).length;$('kpi259Residencial').textContent=lista.filter(x=>x.categoriaProyecto==='Residencial').length;$('kpi259NoResidencial').textContent=lista.filter(x=>x.categoriaProyecto!=='Residencial').length;$('kpi259Total').textContent=lista.length;
    const campo=$('agruparReporte259').value,etiquetas={categoriaProyecto:'categoría de proyecto',departamento:'departamento',instaladora:'empresa instaladora',estadoSolicitud:'estado de solicitud',convenioVigente:'convenio vigente'},grupos=new Map();lista.forEach(x=>{const clave=x[campo]||'Sin información',actual=grupos.get(clave)||{total:0,fuera:0,dias:0};actual.total++;actual.fuera+=x.diasCalendario>=90?1:0;actual.dias+=Number(x.diasCalendario||0);grupos.set(clave,actual)});const filas=[...grupos].sort((a,b)=>b[1].total-a[1].total);
    $('tituloResumen259').textContent=`Resumen por ${etiquetas[campo]}`;$('totalGrupos259').textContent=`${filas.length} grupo${filas.length===1?'':'s'}`;$('contenidoResumen259').innerHTML=filas.slice(0,8).map(([nombre,v])=>`<article><span>${nombre}</span><i><b style="width:${lista.length?Math.max(4,Math.round(v.total/lista.length*100)):0}%"></b></i><strong>${v.total}</strong><small>${v.fuera} fuera de plazo · promedio ${v.total?Math.round(v.dias/v.total):0} días</small></article>`).join('')||'<p>Sin información para resumir.</p>';
    $('pagina259').textContent=`Página ${pagina259} de ${total} · ${lista.length} registros`;$('anterior259').disabled=pagina259===1;$('siguiente259').disabled=pagina259===total;
  }
  function prepararFiltrosReporte259(){
    const base=datos.map(registroFormato259);llenarSelect('categoriaReporte259',[...new Set(base.map(x=>x.categoriaProyecto))].sort((a,b)=>a.localeCompare(b,'es')),'Todas las categorías');llenarSelect('departamentoReporte259',valoresUnicos('departamento'),'Todos los departamentos');llenarSelect('estadoReporte259',[...new Set(base.map(x=>x.estadoSolicitud))].sort((a,b)=>a.localeCompare(b,'es')),'Todos los estados');
    ['categoriaReporte259','departamentoReporte259','estadoReporte259','agruparReporte259'].forEach(id=>$(id).onchange=()=>{pagina259=1;renderReporte259();});$('limpiarReporte259').onclick=()=>{['buscarReporte259','categoriaReporte259','departamentoReporte259','estadoReporte259'].forEach(id=>$(id).value='');$('agruparReporte259').value='categoriaProyecto';pagina259=1;renderReporte259();};
  }
  const columnasDinamicasAdministracion={
    suministro:{titulo:'Suministro',valor:x=>x.numeroSuministro||x.suministro},categoriaProyecto:{titulo:'Tipo de proyecto'},direccion:{titulo:'Dirección'},urbanizacion:{titulo:'Urbanización'},manzana:{titulo:'Mz.'},lote:{titulo:'Lt.'},departamento:{titulo:'Departamento'},distrito:{titulo:'Distrito'},instaladora:{titulo:'Empresa instaladora'},estadoSolicitud:{titulo:'Estado'},diasCalendario:{titulo:'Días'},costo:{titulo:'Monto',valor:x=>monedaLiquidacion(x.costo)}
  };
  function tipoPrincipalProyecto(categoria){return categoria==='Residencial'?'Residencial':categoria==='Líneas montantes'?'Líneas montantes':'No residencial';}
  function registrosDinamicosAdministracion(){
    const q=$('buscarDinamicoAdministracion').value.trim().toLowerCase(),tipo=$('tipoDinamicoAdministracion').value,subtipo=$('subtipoDinamicoAdministracion').value,departamento=$('departamentoDinamicoAdministracion').value;
    return datos.map(registroFormato259).filter(x=>(!q||[x.suministro,x.numeroSuministro,x.nombre,x.direccion,x.urbanizacion,x.manzana,x.lote,x.instaladora,x.distrito,x.departamento].some(v=>String(v||'').toLowerCase().includes(q)))&&(!tipo||tipoPrincipalProyecto(x.categoriaProyecto)===tipo)&&(!subtipo||x.categoriaProyecto===subtipo)&&(!departamento||x.departamento===departamento));
  }
  function columnasSeleccionadasAdministracion(){return [...document.querySelectorAll('[data-columna-dinamica]:checked')].map(x=>x.value);}
  function actualizarPlanoDinamicoAdministracion(lista,ajustar=false){
    if(!mapaDinamicoAdministracion){mapaDinamicoAdministracion=L.map('mapaDinamicoAdministracion',{zoomControl:true,attributionControl:false}).setView([-10.6,-75.3],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(mapaDinamicoAdministracion);capaDinamicaAdministracion=L.layerGroup().addTo(mapaDinamicoAdministracion);}
    capaDinamicaAdministracion.clearLayers();const limites=[];lista.forEach(x=>{if(!Number.isFinite(Number(x.lat))||!Number.isFinite(Number(x.lng)))return;const color=x.categoriaProyecto==='Residencial'?'#4e9fc5':x.categoriaProyecto==='Líneas montantes'?'#8a61dc':'#58b879',p=[Number(x.lat),Number(x.lng)];limites.push(p);L.circleMarker(p,{radius:6,color:'#eef7ff',weight:1.5,fillColor:color,fillOpacity:.88}).bindTooltip(`<b>${x.categoriaProyecto}</b><br>${x.direccion} · Urb. ${x.urbanizacion}<br>Mz. ${x.manzana} · Lt. ${x.lote}<br>${x.distrito}, ${x.departamento}`).addTo(capaDinamicaAdministracion)});$('totalPlanoDinamicoAdministracion').textContent=`${limites.length} ${limites.length===1?'ubicación':'ubicaciones'}`;
    requestAnimationFrame(()=>{mapaDinamicoAdministracion.invalidateSize({pan:false});if((ajustar||mapaDinamicoAdministracion.getZoom()===5)&&limites.length)mapaDinamicoAdministracion.fitBounds(limites,{padding:[22,22],maxZoom:12});});
  }
  function renderTablaDinamicaAdministracion(){
    const lista=registrosDinamicosAdministracion(),columnas=columnasSeleccionadasAdministracion(),grupo=$('grupoDinamicoAdministracion').value,metrica=$('metricaDinamicaAdministracion').value,tamano=10,totalPaginas=Math.max(1,Math.ceil(lista.length/tamano));paginaDinamicaAdministracion=Math.min(Math.max(1,paginaDinamicaAdministracion),totalPaginas);const visibles=lista.slice((paginaDinamicaAdministracion-1)*tamano,paginaDinamicaAdministracion*tamano);
    $('cabeceraDinamicaAdministracion').innerHTML=`<tr>${columnas.map(c=>`<th>${columnasDinamicasAdministracion[c].titulo}</th>`).join('')}</tr>`;
    $('tablaDinamicaAdministracion').innerHTML=visibles.map(x=>`<tr>${columnas.map(c=>`<td>${columnasDinamicasAdministracion[c].valor?columnasDinamicasAdministracion[c].valor(x):(x[c]??'—')}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${Math.max(1,columnas.length)}">No hay registros con los filtros seleccionados.</td></tr>`;
    const agrupados=new Map();lista.forEach(x=>{const clave=x[grupo]||'Sin información',a=agrupados.get(clave)||{registros:0,fueraPlazo:0,monto:0,dias:0};a.registros++;a.fueraPlazo+=x.diasCalendario>=90?1:0;a.monto+=Number(x.costo||0);a.dias+=Number(x.diasCalendario||0);agrupados.set(clave,a)});const maximo=Math.max(1,...[...agrupados.values()].map(x=>metrica==='promedioDias'?(x.registros?x.dias/x.registros:0):x[metrica]));
    const nombresGrupo={categoriaProyecto:'tipo de proyecto',departamento:'departamento',distrito:'distrito',urbanizacion:'urbanización',instaladora:'empresa instaladora',estadoSolicitud:'estado'},nombresMetrica={registros:'registros',fueraPlazo:'fuera de plazo',monto:'monto acumulado',promedioDias:'promedio de días'};
    $('tituloDinamicoAdministracion').textContent=`Resultados por ${nombresGrupo[grupo]} · ${nombresMetrica[metrica]}`;$('resumenDinamicoAdministracion').innerHTML=[...agrupados].sort((a,b)=>b[1].registros-a[1].registros).slice(0,12).map(([nombre,v])=>{const valor=metrica==='promedioDias'?(v.registros?Math.round(v.dias/v.registros):0):v[metrica],texto=metrica==='monto'?monedaLiquidacion(valor):metrica==='promedioDias'?`${valor} días`:valor;return `<article><div><b>${nombre}</b><span>${v.registros} registro${v.registros===1?'':'s'}</span></div><strong>${texto}</strong><i><b style="width:${Math.max(4,Math.round(valor/maximo*100))}%"></b></i></article>`;}).join('')||'<p>Sin información para resumir.</p>';
    $('totalDinamicoAdministracion').textContent=`${lista.length} registro${lista.length===1?'':'s'}`;$('detallePaginaDinamicaAdministracion').textContent=`Mostrando ${visibles.length} de ${lista.length} registros · ${columnas.length} columnas visibles`;$('paginaDinamicaAdministracion').textContent=`Página ${paginaDinamicaAdministracion} de ${totalPaginas}`;$('anteriorDinamicoAdministracion').disabled=paginaDinamicaAdministracion===1;$('siguienteDinamicoAdministracion').disabled=paginaDinamicaAdministracion===totalPaginas;
    actualizarPlanoDinamicoAdministracion(lista);
    const tipoSeleccionado=$('tipoDinamicoAdministracion').value;$('subtipoDinamicoAdministracion').disabled=Boolean(tipoSeleccionado&&tipoSeleccionado!=='No residencial');
  }
  function exportarTablaDinamicaAdministracion(){const columnas=columnasSeleccionadasAdministracion(),filas=registrosDinamicosAdministracion().map(x=>Object.fromEntries(columnas.map(c=>[columnasDinamicasAdministracion[c].titulo,columnasDinamicasAdministracion[c].valor?columnasDinamicasAdministracion[c].valor(x):(x[c]??'')])));if(filas.length)exportarCsv(filas,'tabla_dinamica_bonogas.csv');}
  function prepararTablaDinamicaAdministracion(){
    llenarSelect('departamentoDinamicoAdministracion',valoresUnicos('departamento'),'Todos los departamentos');
    ['tipoDinamicoAdministracion','subtipoDinamicoAdministracion','departamentoDinamicoAdministracion','grupoDinamicoAdministracion','metricaDinamicaAdministracion'].forEach(id=>$(id).onchange=()=>{paginaDinamicaAdministracion=1;renderTablaDinamicaAdministracion();});$('buscarDinamicoAdministracion').oninput=()=>{paginaDinamicaAdministracion=1;renderTablaDinamicaAdministracion();};document.querySelectorAll('[data-columna-dinamica]').forEach(x=>x.onchange=()=>{if(!columnasSeleccionadasAdministracion().length){x.checked=true;return;}paginaDinamicaAdministracion=1;renderTablaDinamicaAdministracion();});
    $('limpiarDinamicoAdministracion').onclick=()=>{$('filtrosDinamicosAdministracion').reset();document.querySelectorAll('[data-columna-dinamica]').forEach((x,i)=>x.checked=i<8);paginaDinamicaAdministracion=1;renderTablaDinamicaAdministracion();};$('anteriorDinamicoAdministracion').onclick=()=>{if(paginaDinamicaAdministracion>1){paginaDinamicaAdministracion--;renderTablaDinamicaAdministracion();}};$('siguienteDinamicoAdministracion').onclick=()=>{paginaDinamicaAdministracion++;renderTablaDinamicaAdministracion();};$('ajustarPlanoDinamicoAdministracion').onclick=()=>actualizarPlanoDinamicoAdministracion(registrosDinamicosAdministracion(),true);$('exportarDinamicoAdministracion').onclick=exportarTablaDinamicaAdministracion;$('abrirFormato90Administracion').onclick=()=>{pagina259=1;renderReporte259();abrirModal('modalReporte259');};renderTablaDinamicaAdministracion();
  }
  function datosPacProyectos(){
    const fuentes=['Fondo de Inclusión Social Energético (FISE)','Recursos directamente recaudados','Transferencias del sector','Saldos de balance'];
    const partidas=['2.6.3.2.9.2 · Instalaciones internas','2.6.3.2.9.1 · Derecho de conexión','2.3.2.7.11.2 · Supervisión técnica','2.6.8.1.4.2 · Equipamiento hospitalario'];
    const destinos=['Instalaciones residenciales','Comedores populares','MYPES y comercios','Hospitales y establecimientos de salud','Supervisión y control'];
    const proyectos=[...new Set(datos.map(x=>x.nombreProyecto||x.proyecto))];
    return proyectos.map((proyecto,indice)=>{const hospital=proyecto.includes('Hospital')||proyecto.includes('hospital'),comedor=proyecto.includes('Comedor'),comercio=proyecto.includes('Comercio'),base=620000+indice*137500,presupuesto=hospital?base+540000:base,porcentaje=48+(indice%7)*7,devengado=Math.round(presupuesto*Math.min(.94,porcentaje/100)),destino=hospital?destinos[3]:comedor?destinos[1]:comercio?destinos[2]:indice%6===5?destinos[4]:destinos[0];return {proyecto,fuente:fuentes[indice%fuentes.length],destino,partida:hospital?partidas[3]:destino===destinos[4]?partidas[2]:partidas[indice%2],presupuesto,devengado,saldo:presupuesto-devengado,porcentaje:Math.round(devengado/presupuesto*100)};});
  }
  function renderPacProyectos(){
    const proyecto=$('pacFiltroProyecto').value,fuente=$('pacFiltroFuente').value,destino=$('pacFiltroDestino').value,partida=$('pacFiltroPartida').value,lista=datosPacProyectos().filter(x=>(!proyecto||x.proyecto===proyecto)&&(!fuente||x.fuente===fuente)&&(!destino||x.destino===destino)&&(!partida||x.partida===partida));
    const presupuesto=lista.reduce((s,x)=>s+x.presupuesto,0),devengado=lista.reduce((s,x)=>s+x.devengado,0),saldo=presupuesto-devengado,ejecucion=presupuesto?Math.round(devengado/presupuesto*100):0;
    $('pacPresupuesto').textContent=monedaLiquidacion(presupuesto);$('pacDevengado').textContent=monedaLiquidacion(devengado);$('pacSaldo').textContent=monedaLiquidacion(saldo);$('pacEjecucion').textContent=`${ejecucion}%`;
    const tamano=5,totalPaginas=Math.max(1,Math.ceil(lista.length/tamano));paginaPacProyectos=Math.min(Math.max(1,paginaPacProyectos),totalPaginas);const visibles=lista.slice((paginaPacProyectos-1)*tamano,paginaPacProyectos*tamano);
    const pintarResumen=(id,campo)=>{const agrupados=[...new Set(lista.map(x=>x[campo]))].map(nombre=>{const filas=lista.filter(x=>x[campo]===nombre),pres=filas.reduce((s,x)=>s+x.presupuesto,0),dev=filas.reduce((s,x)=>s+x.devengado,0);return {nombre,pres,dev,saldo:pres-dev,porcentaje:pres?Math.round(dev/pres*100):0};}).sort((a,b)=>b.pres-a.pres);$(id).innerHTML=agrupados.map(x=>`<article><div><b>${x.nombre}</b><span>${x.porcentaje}% ejecutado</span></div><strong>${monedaLiquidacion(x.saldo)}<small> saldo</small></strong><i><b style="width:${x.porcentaje}%"></b></i></article>`).join('')||'<p>Sin datos para los filtros seleccionados.</p>';};
    pintarResumen('resumenPacFuentes','fuente');pintarResumen('resumenPacDestinos','destino');
    $('tablaPacProyectos').innerHTML=visibles.map(x=>`<tr><td><b>${x.proyecto}</b></td><td>${x.fuente}</td><td>${x.destino}</td><td>${x.partida}</td><td>${monedaLiquidacion(x.presupuesto)}</td><td>${monedaLiquidacion(x.devengado)}</td><td>${monedaLiquidacion(x.saldo)}</td><td><div class="avance-pac-tabla"><i style="width:${x.porcentaje}%"></i></div><strong>${x.porcentaje}%</strong></td></tr>`).join('')||'<tr><td colspan="8">No hay partidas con los filtros seleccionados.</td></tr>';
    $('paginaPacProyectos').textContent=`Página ${paginaPacProyectos} de ${totalPaginas} · ${lista.length} proyectos`;$('anteriorPacProyectos').disabled=paginaPacProyectos===1;$('siguientePacProyectos').disabled=paginaPacProyectos===totalPaginas;
    $('resumenPacProyectos').textContent=`${lista.length} partida${lista.length===1?'':'s'} · ${new Set(lista.map(x=>x.fuente)).size} fuente${new Set(lista.map(x=>x.fuente)).size===1?'':'s'} · ${new Set(lista.map(x=>x.destino)).size} destino${new Set(lista.map(x=>x.destino)).size===1?'':'s'} · saldo ${monedaLiquidacion(saldo)}.`;
  }
  function prepararPacProyectos(){
    const lista=datosPacProyectos(),llenar=(id,valores,etiqueta)=>{const select=$(id);select.replaceChildren(new Option(etiqueta,''));[...new Set(valores)].sort((a,b)=>a.localeCompare(b,'es')).forEach(v=>select.add(new Option(v,v)));};
    llenar('pacFiltroProyecto',lista.map(x=>x.proyecto),'Todos los proyectos');llenar('pacFiltroFuente',lista.map(x=>x.fuente),'Todas las fuentes');llenar('pacFiltroDestino',lista.map(x=>x.destino),'Todos los destinos');llenar('pacFiltroPartida',lista.map(x=>x.partida),'Todas las partidas');
    ['pacFiltroProyecto','pacFiltroFuente','pacFiltroDestino','pacFiltroPartida'].forEach(id=>$(id).onchange=()=>{paginaPacProyectos=1;renderPacProyectos();});$('limpiarPacProyectos').onclick=()=>{['pacFiltroProyecto','pacFiltroFuente','pacFiltroDestino','pacFiltroPartida'].forEach(id=>$(id).value='');paginaPacProyectos=1;renderPacProyectos();};$('anteriorPacProyectos').onclick=()=>{if(paginaPacProyectos>1){paginaPacProyectos--;renderPacProyectos();}};$('siguientePacProyectos').onclick=()=>{paginaPacProyectos++;renderPacProyectos();};renderPacProyectos();
  }
  function renderReporte20(){
    const q=textoBusqueda('buscarReporte20');
    const departamento=$('departamentoReporte20').value,provincia=$('provinciaReporte20').value,distrito=$('distritoReporte20').value,instaladora=$('instaladoraReporte20').value,liquidacion=$('liquidacionReporte20').value;
    const lista=datos.filter(x=>x.diasHabiles>=20&&(!q||[x.suministro,x.nombre,x.instaladora,x.departamento,x.distrito].some(v=>String(v).toLowerCase().includes(q)))&&(!departamento||x.departamento===departamento)&&(!provincia||provinciaRegistro(x)===provincia)&&(!distrito||x.distrito===distrito)&&(!instaladora||x.instaladora===instaladora)&&(!liquidacion||x.estadoRegistro===liquidacion));
    const tamano=10,totalPaginas=Math.max(1,Math.ceil(lista.length/tamano));pagina20=Math.min(Math.max(1,pagina20),totalPaginas);const visibles=lista.slice((pagina20-1)*tamano,pagina20*tamano);
    $('tablaReporte20').innerHTML=visibles.map(x=>`<tr><td>${x.suministro}</td><td>${x.nombre}</td><td>${x.fechaInicio}</td><td><b class="estado-critico">${x.diasHabiles} / 20</b></td><td class="estado-critico">Crítico</td><td>${x.instaladora}</td></tr>`).join('')||'<tr><td colspan="6">No hay registros con los filtros seleccionados.</td></tr>';
    $('pagina20').textContent=`Página ${pagina20} de ${totalPaginas} · ${lista.length} registros`;$('anterior20').disabled=pagina20===1;$('siguiente20').disabled=pagina20===totalPaginas;
    const pendientes=lista.filter(x=>x.estadoRegistro==='Pendiente de liquidación'),liquidados=lista.filter(x=>x.estadoRegistro==='Liquidado');
    $('kpi20Registros').textContent=lista.length;$('kpi20Pendientes').textContent=pendientes.length;$('kpi20Monto').textContent=monedaLiquidacion(pendientes.reduce((s,x)=>s+(x.costo||0),0));$('kpi20Instaladores').textContent=new Set(lista.map(x=>x.instaladora)).size;
    const agrupados=[...new Set(lista.map(x=>x.instaladora))].map(empresa=>{const r=lista.filter(x=>x.instaladora===empresa),l=r.filter(x=>x.estadoRegistro==='Liquidado'),p=r.filter(x=>x.estadoRegistro==='Pendiente de liquidación');return {empresa,total:r.length,liquidadas:l.length,pendientes:p.length,montoLiquidado:l.reduce((s,x)=>s+(x.costo||0),0),montoPendiente:p.reduce((s,x)=>s+(x.costo||0),0)};}).sort((a,b)=>b.pendientes-a.pendientes||b.total-a.total);
    const tamanoInstaladores=5,totalPaginasInstaladores=Math.max(1,Math.ceil(agrupados.length/tamanoInstaladores));paginaInstaladores20=Math.min(Math.max(1,paginaInstaladores20),totalPaginasInstaladores);const instaladoresVisibles=agrupados.slice((paginaInstaladores20-1)*tamanoInstaladores,paginaInstaladores20*tamanoInstaladores);
    $('tablaInstaladores20').innerHTML=instaladoresVisibles.map(x=>{const avance=x.total?Math.round(x.liquidadas/x.total*100):0;return `<tr><td><b>${x.empresa}</b></td><td>${x.total}</td><td>${x.liquidadas}</td><td><b class="${x.pendientes?'estado-critico':''}">${x.pendientes}</b></td><td>${monedaLiquidacion(x.montoLiquidado)}</td><td>${monedaLiquidacion(x.montoPendiente)}</td><td><div class="avance-instalador-20"><i style="width:${avance}%"></i></div><small>${avance}%</small></td></tr>`;}).join('')||'<tr><td colspan="7">No hay empresas con los filtros seleccionados.</td></tr>';
    $('paginaInstaladores20').textContent=`Página ${paginaInstaladores20} de ${totalPaginasInstaladores} · ${agrupados.length} empresas`;$('anteriorInstaladores20').disabled=paginaInstaladores20===1;$('siguienteInstaladores20').disabled=paginaInstaladores20===totalPaginasInstaladores;
    $('resumenInstaladores20').textContent=`${agrupados.length} empresa${agrupados.length===1?'':'s'} · ${liquidados.length} liquidadas`;
  }
  function prepararFiltrosReporte20(){
    llenarSelect('departamentoReporte20',valoresUnicos('departamento'),'Todos');llenarSelect('instaladoraReporte20',valoresUnicos('instaladora'),'Todas');
    const actualizarGeografia=()=>{const dep=$('departamentoReporte20').value,provActual=$('provinciaReporte20').value,base=datos.filter(x=>!dep||x.departamento===dep),provincias=[...new Set(base.map(provinciaRegistro))].sort((a,b)=>a.localeCompare(b,'es'));llenarSelect('provinciaReporte20',provincias,'Todas');if(provincias.includes(provActual))$('provinciaReporte20').value=provActual;const prov=$('provinciaReporte20').value;llenarSelect('distritoReporte20',valoresUnicos('distrito',base.filter(x=>!prov||provinciaRegistro(x)===prov)),'Todos');pagina20=1;paginaInstaladores20=1;renderReporte20();};
    $('departamentoReporte20').onchange=()=>{$('provinciaReporte20').value='';actualizarGeografia();};$('provinciaReporte20').onchange=actualizarGeografia;['distritoReporte20','instaladoraReporte20','liquidacionReporte20'].forEach(id=>$(id).onchange=()=>{pagina20=1;paginaInstaladores20=1;renderReporte20();});
    $('anterior20').onclick=()=>{if(pagina20>1){pagina20--;renderReporte20();}};$('siguiente20').onclick=()=>{pagina20++;renderReporte20();};
    $('anteriorInstaladores20').onclick=()=>{if(paginaInstaladores20>1){paginaInstaladores20--;renderReporte20();}};$('siguienteInstaladores20').onclick=()=>{paginaInstaladores20++;renderReporte20();};
    $('limpiarReporte20').onclick=()=>{['departamentoReporte20','provinciaReporte20','distritoReporte20','instaladoraReporte20','liquidacionReporte20'].forEach(id=>$(id).value='');$('buscarReporte20').value='';actualizarGeografia();};actualizarGeografia();
  }
  function renderPenalidades(){
    const tamano=5,total=Math.max(1,Math.ceil(empresasPenalidades.length/tamano));paginaPenalidades=Math.min(Math.max(1,paginaPenalidades),total);const visibles=empresasPenalidades.slice((paginaPenalidades-1)*tamano,paginaPenalidades*tamano);
    $('tablaPenalidades').innerHTML=visibles.map(([empresa,penalidades,fuera,fecha,monto,estado])=>`<tr><td>${empresa}</td><td>GNR-2026 · Vigente</td><td>${penalidades}</td><td>${fuera}</td><td>${fecha}</td><td>${monto}</td><td class="${estado.includes('crítico')?'estado-critico':''}">${estado}</td></tr>`).join('');
    $('paginaPenalidades').textContent=`Página ${paginaPenalidades} de ${total} · ${empresasPenalidades.length} empresas`;$('anteriorPenalidades').disabled=paginaPenalidades===1;$('siguientePenalidades').disabled=paginaPenalidades===total;
  }
  function datosParaExportar(reporte){return reporte==='20'?datos.filter(x=>x.plazo259==='Fuera de plazo'):registrosReporte259();}
  function filasExportacion(reporte){
    return datosParaExportar(reporte).map(x=>reporte==='20'?{
      'N° Suministro':x.suministro,'Beneficiario':x.nombre,'Fecha de inicio':x.fechaInicio,'Días hábiles':x.diasHabiles,'Nivel':'Crítico','Empresa instaladora':x.instaladora
    }:{
      'Nombre de la Empresa Concesionaria':x.concesionaria,'Nombre de la Empresa Instaladora':x.instaladora,'Número de Solicitud':x.numeroSolicitud,'Estado de Solicitud':x.estadoSolicitud,'Número de Suministro':x.numeroSuministro||x.suministro,'Categoría de proyecto':x.categoriaProyecto,'Venta en zona no gasificada':x.ventaNoGasificada,'Departamento':x.departamento,'Fecha de registro de la Solicitud en el Portal':x.fechaRegistro,'Fecha de pre aprobación del contrato':x.fechaPreaprobacion,'Días transcurridos':x.diasCalendario,'Empresa con Convenio Vigente':x.convenioVigente
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
    const filas=filasExportacion(reporte),nombre=reporte==='259'?'Formato_Reporte_plazo_de_90_dias':`reporte_bonogas_${reporte}`;
    if(formato==='csv')return exportarCsv(filas,`${nombre}.csv`);
    if(formato==='xlsx'&&window.XLSX){const hoja=XLSX.utils.json_to_sheet(filas),libro=XLSX.utils.book_new(),columnas=Object.keys(filas[0]||{});hoja['!autofilter']={ref:`A1:${XLSX.utils.encode_col(Math.max(0,columnas.length-1))}${filas.length+1}`};hoja['!cols']=columnas.map((columna,i)=>({wch:reporte==='259'?[31,38,18,34,20,27,22,17,24,24,18,21][i]||20:Math.max(15,columna.length+2)}));hoja['!freeze']={xSplit:0,ySplit:1,topLeftCell:'A2',activePane:'bottomLeft',state:'frozen'};XLSX.utils.book_append_sheet(libro,hoja,reporte==='259'?'PETROPERU':'Reporte');return XLSX.writeFile(libro,`${nombre}.xlsx`);}
    if(formato==='pdf'&&window.jspdf?.jsPDF){const doc=new jspdf.jsPDF({orientation:'landscape',format:reporte==='259'?'a3':'a4'}),columnas=Object.keys(filas[0]||{});doc.setFontSize(16);doc.text(reporte==='20'?'Control de 20 días hábiles':'Reporte de plazo de 90 días · Art. 25.9',14,16);doc.autoTable({startY:22,head:[columnas],body:filas.map(f=>columnas.map(c=>f[c])),styles:{fontSize:reporte==='259'?5.2:7,cellPadding:1.5},headStyles:{fillColor:[30,111,143]}});return doc.save(`${nombre}.pdf`);}
  }
  function datosRanking(){
    const trimestre=$('trimestreRanking')?.value||'2026-II',filtroZona=$('zonaRanking')?.value||'';
    const desfase={'2026-II':17,'2026-I':11,'2025-IV':7,'2025-III':3}[trimestre]||0,redondear=valor=>Number(valor.toFixed(2));
    const ranking=valoresUnicos('instaladora').map((empresa,i)=>{
      const registros=datos.filter(x=>x.instaladora===empresa),departamentos=registros.map(x=>x.departamento),zona=departamentos.some(d=>['Lima','Callao'].includes(d))?'Lima y Callao':'Otras zonas';
      const semilla=[...empresa].reduce((s,c)=>s+c.charCodeAt(0),0)+desfase+i*13,minimo=zona==='Lima y Callao'?150:75;
      const finalizadas=zona==='Lima y Callao'?132+(semilla%84):62+(semilla%70),habilitaciones=Math.max(0,finalizadas-(semilla%8));
      const dentroPlazo=Math.round(finalizadas*(.70+(semilla%25)/100)),hastaDosIntentos=Math.round(habilitaciones*(.74+((semilla>>1)%24)/100));
      const noResidenciales=5+(semilla%48),dosPuntos=Math.round(habilitaciones*(.12+((semilla>>2)%27)/100));
      const niveles=['Sin incumplimientos','Leve','Moderado','Grave'],nivel=niveles[semilla%4],pti=[100,75,50,0][semilla%4],pienr=noResidenciales<10?0:noResidenciales<20?25:noResidenciales<30?50:noResidenciales<40?75:100;
      const ico=redondear(pti*5),icpc=finalizadas?redondear(dentroPlazo/finalizadas*100*5):0,icir=habilitaciones?redondear(hastaDosIntentos/habilitaciones*100*5):0,ienr=redondear(pienr*3),ieir=habilitaciones?redondear(dosPuntos/habilitaciones*100*2):0,idegnr=redondear(ico+icpc+icir+ienr+ieir);
      return {id:`ranking-${i}`,empresa,zona,minimo,finalizadas,habilitaciones,dentroPlazo,hastaDosIntentos,noResidenciales,dosPuntos,nivel,pti,pienr,ico,icpc,icir,ienr,ieir,idegnr,porcentaje:redondear(idegnr/20),elegible:finalizadas>=minimo,trimestre};
    }).filter(x=>!filtroZona||x.zona===filtroZona).sort((a,b)=>Number(b.elegible)-Number(a.elegible)||b.idegnr-a.idegnr||b.habilitaciones-a.habilitaciones);
    let posicion=0;ranking.forEach(x=>{x.posicion=x.elegible?++posicion:null;});return ranking;
  }
  function actualizarKpisRanking(ranking){
    const evaluadas=ranking.filter(x=>x.elegible),promedio=evaluadas.length?evaluadas.reduce((s,x)=>s+x.idegnr,0)/evaluadas.length:0;
    $('kpiRankingEvaluadas').textContent=evaluadas.length;$('kpiRankingNoElegibles').textContent=ranking.length-evaluadas.length;$('kpiRankingPromedio').textContent=promedio.toFixed(2);$('kpiRankingTrimestre').textContent=$('trimestreRanking').value;
  }
  function mostrarDetalleRanking(id){
    const ranking=datosRanking(),actual=ranking.find(x=>x.id===id||x.empresa===id)||ranking[0];if(!actual)return;
    $('empresaRankingActual').textContent=`${actual.empresa} · ${actual.zona}`;document.querySelectorAll('.empresa-ranking').forEach(b=>b.classList.toggle('activa',b.dataset.rankingId===actual.id));
    const indicadores=[['ICO',actual.ico,'PTI × 5',`${actual.nivel} · PTI ${actual.pti}%`],['ICPC',actual.icpc,'(Dentro de plazo / Ejecutadas) × 100 × 5',`${actual.dentroPlazo} / ${actual.finalizadas}`],['ICIR',actual.icir,'(Hasta 2 intentos / Habilitadas) × 100 × 5',`${actual.hastaDosIntentos} / ${actual.habilitaciones}`],['IENR',actual.ienr,'PIENR × 3',`${actual.noResidenciales} no residenciales · ${actual.pienr}%`],['IEIR',actual.ieir,'(Dos puntos / Habilitadas) × 100 × 2',`${actual.dosPuntos} / ${actual.habilitaciones}`]];
    $('detalleRankingEmpresa').innerHTML=`<header class="cabecera-detalle-ranking"><div><small>${actual.trimestre} · ${actual.zona}</small><h3>${actual.empresa}</h3></div><span class="estado-elegibilidad ${actual.elegible?'elegible':'no-elegible'}">${actual.elegible?'Evaluada':'No elegible'}</span></header><div class="resumen-idegnr"><article><span>IDEGNR</span><strong>${actual.idegnr.toFixed(2)}</strong><small>de 2,000 puntos</small></article><article><span>Resultado normalizado</span><strong>${actual.porcentaje.toFixed(2)}%</strong><small>Referencia visual</small></article><article><span>Instalaciones finalizadas</span><strong>${actual.finalizadas}</strong><small>Mínimo de zona: ${actual.minimo}</small></article><article><span>Desempate</span><strong>${actual.habilitaciones}</strong><small>Habilitaciones trimestrales</small></article></div><div class="tabla-indicadores-ranking"><div class="fila cabecera"><b>Indicador</b><b>Cálculo</b><b>Base</b><b>Puntaje</b></div>${indicadores.map(x=>`<div class="fila"><strong>${x[0]}</strong><span>${x[2]}</span><small>${x[3]}</small><b>${x[1].toFixed(2)}</b></div>`).join('')}<div class="fila total"><strong>IDEGNR</strong><span>ICO + ICPC + ICIR + IENR + IEIR</span><small>Orden descendente</small><b>${actual.idegnr.toFixed(2)}</b></div></div><p class="recomendacion-ranking ${actual.elegible?'':'observada'}">${actual.elegible?`Posición ${actual.posicion} del ranking. En caso de empate se priorizan sus ${actual.habilitaciones} habilitaciones.`:`No participa en el ranking: registra ${actual.finalizadas} instalaciones y requiere ${actual.minimo} en ${actual.zona}.`}</p>`;
  }
  function abrirRankingEmpresa(empresa){
    const ranking=datosRanking();
    actualizarKpisRanking(ranking);$('listaRankingEmpresas').innerHTML=ranking.map(x=>`<button class="empresa-ranking ${x.elegible?'':'no-elegible'}" type="button" data-ranking-id="${x.id}"><strong>${x.posicion||'—'}</strong><div><b>${x.empresa}</b><small>${x.zona} · ${x.finalizadas} finalizadas · mínimo ${x.minimo}</small></div><span>${x.elegible?x.idegnr.toFixed(2):'Fuera'}</span></button>`).join('')||'<p>No existen empresas para la zona seleccionada.</p>';
    $('listaRankingEmpresas').querySelectorAll('.empresa-ranking').forEach(b=>b.onclick=()=>mostrarDetalleRanking(b.dataset.rankingId));mostrarDetalleRanking(ranking.find(x=>x.empresa===empresa)?.id||ranking[0]?.id);if(!$('modalRankingEmpresas').open)abrirModal('modalRankingEmpresas');
  }
  function exportarRanking(formato){
    const filas=datosRanking().map(x=>({Posición:x.posicion||'',Empresa:x.empresa,Zona:x.zona,Trimestre:x.trimestre,'Instalaciones finalizadas':x.finalizadas,'Mínimo exigido':x.minimo,Estado:x.elegible?'Evaluada':'No elegible',ICO:x.ico,ICPC:x.icpc,ICIR:x.icir,IENR:x.ienr,IEIR:x.ieir,IDEGNR:x.idegnr,Habilitaciones:x.habilitaciones}));
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
      // El asistente forma parte del encabezado global y debe estar disponible
      // también en Validaciones y Solicitudes.
      document.querySelector('.boton-asistente-ia')?.removeAttribute('hidden');
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
    grupoInstaladores=L.markerClusterGroup({maxClusterRadius:72,disableClusteringAtZoom:11,showCoverageOnHover:true,spiderfyOnMaxZoom:true,iconCreateFunction(cluster){const total=cluster.getChildCount();return L.divIcon({html:`<span>${total}</span>`,className:'marker-cluster-fise marker-cluster-instaladores',iconSize:[50,50]});}}).addTo(mapa);
    grupoHospitales=L.markerClusterGroup({maxClusterRadius:58,disableClusteringAtZoom:9,showCoverageOnHover:true,spiderfyOnMaxZoom:true,iconCreateFunction(cluster){const total=cluster.getChildCount();return L.divIcon({html:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h14v17M3 21h18M9 8h6M12 5v6M8 14h2M14 14h2M8 18h2M14 18h2"/></svg><b>${total}</b>`,className:'marker-cluster-fise marker-cluster-hospitales',iconSize:[50,50]});}}).addTo(mapa);
    capaEstratos=L.layerGroup();
    capaRedTroncal=L.layerGroup();
    capaRedResidencial=L.layerGroup();
    capaManzanasFise=L.layerGroup();
    capaTematica=L.layerGroup();
    capaDibujo=L.layerGroup().addTo(mapa);
    prepararFiltros();actualizarMapa(false);ajustarTablero();prepararGestion();prepararPacProyectos();prepararFiltrosReporte259();

    $('filtrosBonogas').addEventListener('submit',e=>{e.preventDefault();actualizarMapa(true);});
    $('filtrosBonogas').addEventListener('reset',()=>setTimeout(()=>{prepararFiltros();actualizarMapa(true);limpiarDibujo();},0));
    $('filtroDepartamento').addEventListener('change',()=>{const lista=datos.filter(x=>!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value);llenarSelect('filtroDistrito',valoresUnicos('distrito',lista),'Todos');});
    $('filtroTipo').addEventListener('change',()=>{const lista=datos.filter(x=>!$('filtroTipo').value||x.tipo===$('filtroTipo').value);llenarSelect('filtroSubtipo',valoresUnicos('subtipo',lista),'Todos');});
    ['panelMapas','panelCapas','panelTematicos'].forEach(id=>{L.DomEvent.disableClickPropagation($(id));L.DomEvent.disableScrollPropagation($(id));});
    $('botonMapas').onclick=()=>alternarPanel('panelMapas','botonMapas');
    $('botonCapas').onclick=()=>alternarPanel('panelCapas','botonCapas');
    $('botonTematicos').onclick=()=>alternarPanel('panelTematicos','botonTematicos');
    $('alternarLeyendaBonogas').onclick=()=>{const leyenda=$('leyendaFlotanteBonogas'),colapsada=leyenda.classList.toggle('colapsada');$('alternarLeyendaBonogas').setAttribute('aria-expanded',String(!colapsada));$('alternarLeyendaBonogas').setAttribute('aria-label',colapsada?'Mostrar leyenda':'Ocultar leyenda');$('alternarLeyendaBonogas').title=colapsada?'Mostrar leyenda':'Ocultar leyenda';};
    document.querySelectorAll('[name="mapaBase"]').forEach(r=>r.onchange=()=>{mapa.removeLayer(baseActual);baseActual=bases[r.value].addTo(mapa);baseActual.bringToBack();});
    document.querySelectorAll('[data-capa-estado]').forEach(control=>control.onchange=()=>actualizarMapa(false));
    $('capaInstaladoresLiquidacion').onchange=e=>e.target.checked&&!$('activarTematico').checked?grupoInstaladores.addTo(mapa):mapa.removeLayer(grupoInstaladores);
    $('capaProyectosHospitalarios').onchange=e=>e.target.checked&&!$('activarTematico').checked?grupoHospitales.addTo(mapa):mapa.removeLayer(grupoHospitales);
    $('capaEstratos').onchange=e=>e.target.checked?capaEstratos.addTo(mapa):mapa.removeLayer(capaEstratos);
    const sincronizarRedesFise=()=>{const troncal=$('capaRedTroncal').checked,residencial=$('capaRedResidencial').checked;$('capaRedesFise').checked=troncal&&residencial;$('capaRedesFise').indeterminate=troncal!==residencial;};
    [['capaRedTroncal',capaRedTroncal],['capaRedResidencial',capaRedResidencial]].forEach(([id,capa])=>{
      $(id).onchange=e=>{e.target.checked?capa.addTo(mapa):mapa.removeLayer(capa);sincronizarRedesFise();};
    });
    $('capaRedesFise').onchange=e=>{const activar=e.target.checked;[['capaRedTroncal',capaRedTroncal],['capaRedResidencial',capaRedResidencial]].forEach(([id,capa])=>{$(id).checked=activar;activar?capa.addTo(mapa):mapa.removeLayer(capa);});e.target.indeterminate=false;};
    $('capaManzanasFise').onchange=e=>e.target.checked?capaManzanasFise.addTo(mapa):mapa.removeLayer(capaManzanasFise);
    $('activarTematico').onchange=actualizarDensidad;
    document.querySelectorAll('[name="tipoTematico"]').forEach(control=>control.onchange=actualizarInterfazTematica);
    $('botonResumenBonogas').onclick=()=>{const tablero=document.querySelector('.tablero-bonogas'),oculto=tablero.classList.toggle('panel-oculto');$('botonResumenBonogas').setAttribute('aria-label',oculto?'Mostrar panel derecho':'Ocultar panel derecho');setTimeout(()=>mapa.invalidateSize(),280);};
    window.addEventListener('resize',ajustarTablero);
    $('abrirReporte259').onclick=()=>{pagina259=1;renderReporte259();abrirModal('modalReporte259');};
    $('abrirPacProyectos').onclick=()=>{paginaPacProyectos=1;renderPacProyectos();abrirModal('modalPacProyectos');};
    $('abrirHistorialLiquidaciones').onclick=abrirHistorialLiquidaciones;
    $('abrirHistorialDesdeLiquidaciones').onclick=()=>{$('modalLiquidacionesBonogas').close();abrirHistorialLiquidaciones();};
    $('abrirPresupuestoDesdeLiquidaciones').onclick=()=>{$('modalLiquidacionesBonogas').close();paginaPacProyectos=1;renderPacProyectos();abrirModal('modalPacProyectos');};
    prepararFiltrosReporte20();
    $('abrirReporte20').onclick=()=>{renderReporte20();abrirModal('modalReporte20');};
    $('botonExportarBonogas').onclick=abrirExportacionBonogas;
    $('confirmarExportacionBonogas').onclick=generarExportacionBonogas;
    document.querySelectorAll('[data-cerrar-modal]').forEach(b=>b.onclick=()=>$(b.dataset.cerrarModal).close());
    document.querySelectorAll('.modal-reporte').forEach(modal=>modal.onclick=e=>{if(e.target===modal)modal.close();});
    $('buscarReporte259').oninput=()=>{pagina259=1;renderReporte259();};$('buscarReporte20').oninput=()=>{pagina20=1;paginaInstaladores20=1;renderReporte20();};
    $('anterior259').onclick=()=>{pagina259--;renderReporte259();};$('siguiente259').onclick=()=>{pagina259++;renderReporte259();};
    $('anteriorPenalidades').onclick=()=>{if(paginaPenalidades>1){paginaPenalidades--;renderPenalidades();}};$('siguientePenalidades').onclick=()=>{paginaPenalidades++;renderPenalidades();};
    document.querySelectorAll('[data-exportar]').forEach(b=>b.onclick=()=>exportarReporte(b.dataset.exportar,b.dataset.reporte));
    document.querySelectorAll('[data-exportar-ranking]').forEach(b=>b.onclick=()=>exportarRanking(b.dataset.exportarRanking));
    ['trimestreRanking','zonaRanking'].forEach(id=>$(id).onchange=()=>abrirRankingEmpresa($('empresaRankingActual').textContent.split(' · ')[0]));
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
    const iconoAprobadoIA='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.8"/></svg>';
    document.querySelectorAll('.detalle-resultados-ia article.aprobado i').forEach(icono=>icono.innerHTML=iconoAprobadoIA);
    document.querySelectorAll('[data-archivo-ia]').forEach(input=>input.onchange=()=>{
      const nombre=input.files[0]?.name||'Sin archivo';
      input.closest('label').classList.toggle('cargado',Boolean(input.files.length));
      input.closest('label').querySelector('[data-nombre-archivo]').textContent=nombre;
    });
    $('iniciarValidacionIA').onclick=iniciarAnalisisIA;
    $('reintentoGabineteIA').onchange=()=>{
      if(!$('reintentoGabineteIA').files.length)return;
      $('resultadoGabineteIA').className='aprobado';$('resultadoGabineteIA').querySelector('i').innerHTML=iconoAprobadoIA;
      $('detalleGabineteIA').textContent='Nitidez 97% · contenido correcto tras reintento';
      $('estadoGabineteIA').textContent='Aprobada';
      $('totalAprobadasIA').textContent='5';$('totalObservadasIA').textContent='0';
      $('alertaResultadoIA').hidden=true;
    };
    $('finalizarValidacionIA').onclick=()=>{$('finalizarValidacionIA').textContent='Validación guardada';setTimeout(()=>{$('modalValidacionIA').close();$('finalizarValidacionIA').textContent='Guardar validación';},650);};
    mapa.on('click',e=>{if(herramienta==='poligono'){puntos.push(e.latlng);figuraTemporal?figuraTemporal.setLatLngs(puntos):figuraTemporal=L.polyline(puntos,{color:'#d68b22',weight:3}).addTo(capaDibujo);}else if(herramienta==='circulo'&&!centroCirculo){centroCirculo=e.latlng;figuraTemporal=L.circle(centroCirculo,{radius:100,color:'#7657c7',fillOpacity:.13}).addTo(capaDibujo);}});
    mapa.on('mousemove',e=>{if(herramienta==='poligono'&&figuraTemporal)figuraTemporal.setLatLngs([...puntos,e.latlng]);if(herramienta==='circulo'&&figuraTemporal)figuraTemporal.setRadius(mapa.distance(centroCirculo,e.latlng));});
    mapa.on('dblclick',cerrarDibujo);
    document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;e.preventDefault();document.querySelectorAll('dialog[open]').forEach(modal=>modal.close());limpiarDibujo();herramienta=null;document.querySelectorAll('[data-herramienta]').forEach(b=>b.classList.remove('activo'));mapa.doubleClickZoom.enable();mapa.getContainer().style.cursor='';mapa.setView([-10.6,-75.3],5)});
  }
  if(typeof L==='undefined')return;
  fetch('datos_bonogas.json').then(r=>{if(!r.ok)throw new Error('Datos no disponibles');return r.json();}).then(registros=>{const hospitales=['Hospital Regional del Norte','Hospital Provincial San Martín','Hospital de Apoyo Santa Rosa','Instituto Materno Infantil FISE','Hospital Amazónico','Hospital Regional del Sur','Centro Hospitalario del Altiplano','Hospital Provincial de la Costa','Hospital Intercultural Andino','Hospital General FISE'];datos=registros.map((registro,indice)=>{const hospital=indice%17===0,numeroHospital=Math.floor(indice/17),comedor=registro.subtipo==='Comedor Popular',comercio=registro.subtipo==='Comercial';return {...registro,proyecto:hospital?'Proyecto Hospitales FISE':comedor?'Proyecto Comedores Populares':comercio?'Proyecto Comercio y Servicios':'BonoGas Residencial',tipoConsumidor:hospital?'Hospital / establecimiento de salud':comedor?'Organización social':comercio?'Comercio y servicios':registro.subtipo==='Multifamiliar'?'Vivienda multifamiliar':'Hogar residencial',...(hospital?{hospital:hospitales[numeroHospital]||`Hospital FISE ${numeroHospital+1}`,nombreProyecto:`Conversión a gas natural · ${hospitales[numeroHospital]||`Hospital FISE ${numeroHospital+1}`}`,codigoProyecto:`PRY-HOSP-2026-${String(numeroHospital+1).padStart(3,'0')}`,estadoProyecto:numeroHospital%3===0?'En ejecución':numeroHospital%3===1?'Liquidación parcial':'Instalación en curso',avanceProyecto:48+(numeroHospital%6)*8,montoProyecto:480000+numeroHospital*72500}:{})};});iniciar();}).catch(error=>{$('contadorMapa').textContent='No se pudieron cargar los datos';console.error(error);});
})();
