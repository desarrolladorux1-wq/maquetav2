(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const coloresEstado={Liquidada:'#4db77e',Certificada:'#557fe1','En proceso':'#e69a13'};
  let registros=[],visibles=[],mapa,baseActual,grupoMarcadores,capaCalor,modoTematico=false,paginaMorosidad=1,seleccionActual=null,observadorMapaGnv;
  let herramientaActiva=null,puntosHerramienta=[],centroCirculo=null,capaHerramienta=null,guiaHerramienta=null,arrastreHerramientas=null;
  let firmaDibujadaGnv=false,trazandoFirmaGnv=false,firmaInformeDibujadaGnv=false,trazandoFirmaInformeGnv=false;
  let correlativoInformeGnv=45,documentosGeneradosGnv=18;
  const conversionesSeleccionadas=new Map();
  const bases={};
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

  const unicos=(campo,lista=registros)=>[...new Set(lista.map(x=>x[campo]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
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
    if(nombre==='informes-digitales'){abrirInformesDigitalesGnv();return}
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
        this._canvas=L.DomUtil.create('canvas','heatmap-canvas-gnv');
        this._canvas.style.pointerEvents='none';
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
    const maxBarra=Math.max(...barras),minLinea=Math.min(...linea),maxLinea=Math.max(...linea);
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
    llenarSelect('graficaDepartamento',unicos('departamento'),'Todos');
    llenarSelect('graficaProvincia',unicos('provincia'),'Todas');
    llenarSelect('graficaDistrito',unicos('distrito'),'Todos');
    llenarSelect('graficaGrifo',unicos('taller'),'Todos');
    llenarSelect('graficaCombustible',unicos('combustible'),'Todos');
    llenarSelect('graficaCilindros',unicos('cilindros').map(String),'Todos');
  }
  function filtrarGraficas(){
    const departamento=$('graficaDepartamento').value,provincia=$('graficaProvincia').value,distrito=$('graficaDistrito').value,grifo=$('graficaGrifo').value,combustible=$('graficaCombustible').value,cilindros=$('graficaCilindros').value;
    const desde=$('graficaDesde').value,hasta=$('graficaHasta').value;
    return registros.filter(x=>(!departamento||x.departamento===departamento)&&(!provincia||x.provincia===provincia)&&(!distrito||x.distrito===distrito)&&(!grifo||x.taller===grifo)&&(!combustible||x.combustible===combustible)&&(!cilindros||String(x.cilindros)===cilindros)&&(!desde||x.fecha>=desde)&&(!hasta||x.fecha<=hasta));
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
  }
  function abrirModal(id){$(id).hidden=false;document.body.classList.add('modal-abierto-gnv')}
  function cerrarModal(id){$(id).hidden=true;if(!document.querySelector('.modal-gnv:not([hidden])'))document.body.classList.remove('modal-abierto-gnv')}
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
    requestAnimationFrame(()=>{prepararFirmaDigitalGnv();actualizarConteoFirmaGnv();$('modalLiquidacionesGnv').scrollTo({top:0})});
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
    const filas=[['Evento','Documento','Estado','Sello de tiempo','Hash blockchain'],['Firma digital masiva','Liquidaciones Ahorro GNV',$('estadoBlockchainGnv').textContent,new Date().toLocaleString('es-PE'),$('hashFirmaGnv').textContent]];
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
    $('tablaMorosidadGnv').innerHTML=actual.map(x=>`<tr><td><strong>${x.placa}</strong></td><td>${x.beneficiario}</td><td>${x.taller}</td><td>${x.cuotas}</td><td>${x.monto?`S/ ${x.monto.toFixed(2)}`:'—'}</td><td><span class="estado-mora-gnv estado-${x.estado.toLowerCase().replaceAll(' ','-')}">${x.estado}</span></td><td>${x.monto?`<button class="boton-mensaje-gnv" type="button" data-placa="${x.placa}">Mensaje</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="7">No se encontraron beneficiarios.</td></tr>';
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
    $('mensajeBeneficiarioGnv').textContent=x?.beneficiario||'Todos los beneficiarios con mora';
    $('mensajePlacaGnv').textContent=x?.placa||'Envío masivo';
    $('mensajeMontoGnv').textContent=x?`S/ ${x.monto.toFixed(2)}`:'Según cada registro';
    $('mensajeCuotasGnv').textContent=x?`${x.cuotas} cuota${x.cuotas===1?'':'s'}`:'Según cada registro';
    $('textoMensajeGnv').value=textoCobranza(x);
    abrirModal('modalMensajeGnv');
  }
  function renderGraficas(){
    const meses=['jun-25','jul-25','ago-25','sep-25','oct-25','nov-25','dic-25','ene-26','feb-26','mar-26','abr-26','may-26'];
    crearGraficoMixto('graficoConversiones',meses,[2439,2575,2425,1769,2209,2141,1779,1750,1547,1102,1156,2801],[2439,5034,7459,9228,11437,13578,15357,17107,18654,19756,20912,23713]);
    actualizarGraficoMetaReal();
    crearGraficoMixto('graficoLiquidaciones',meses,[2609,2251,2654,1949,2051,3041,1823,1755,1654,1375,1001,3799],[2609,4860,7514,9463,11514,14555,16378,18133,19787,21162,22163,25962],'liquidacion');
    $('graficaCombustibles').innerHTML=barraLista([['Gasolina',126184],['GLP',44746],['GLP con Bono',32180],['Diésel',1015]]);
    $('graficaMorosidad').innerHTML=barraLista([['Lima',56919470],['Callao',4274856],['Ica',4161754],['Cusco',2115855],['La Libertad',1541545],['Piura',1167888]]);
    $('graficaRegiones').innerHTML=barraLista([['Lima',135879],['Callao',10205],['Ica',9935],['Cusco',5051],['La Libertad',3680],['Piura',2788]]);
    $('graficaServicios').innerHTML=barraLista([['Uso particular',145412],['Taxi',16441],['Transporte',6182],['Colectivo',3279],['Taxi cofinanciado',912],['Movilidad escolar',203]]);
    $('graficaTalleres').innerHTML=barraLista([['AGN Ingenieros - Surquillo I',9785],['GM Conversiones - Lima I',4047],['Rufigas - VES I',3867],['Autogas Jireh - Jesús María I',3765],['AGN Ingenieros - SJL I',3012],['Corporación Perú Gas',2885]]);
    $('graficaRiesgo').innerHTML=barraLista([['Alto riesgo',6109000,'S/ 6,109,000'],['Riesgo medio',5066000,'S/ 5,066,000'],['Bajo riesgo',3725000,'S/ 3,725,000']]);
    const total=172429,estados=[['Liquidada',171087,'#55bddc'],['Certificada',858,'#587fe4'],['Proceso de conversión',484,'#e98c16']];
    $('graficaEstados').innerHTML=`<div class="total-estados-gnv"><span>TOTAL</span><strong>${total.toLocaleString('es-PE')}</strong></div><div>${estados.map(([n,v,c])=>`<div class="estado-linea-gnv"><span>${n}</span><i style="--ancho:${Math.max(8,v/total*100)}%;--color:${c}"></i><strong>${v.toLocaleString('es-PE')} · ${(v/total*100).toFixed(v>1000?1:2)}%</strong></div>`).join('')}</div>`;
  }
  function exportarResumen(){
    const contenido='\uFEFFIndicador;Valor\r\nConversiones;23713\r\nConversiones liquidadas;25962\r\nTotal desembolsado;853346519\r\nMorosidad;14900000\r\nTalleres;354\r\nAvance de meta;10.8%';
    const enlace=document.createElement('a');enlace.href=URL.createObjectURL(new Blob([contenido],{type:'text/csv;charset=utf-8'}));enlace.download='resumen-ahorro-gnv.csv';enlace.click();URL.revokeObjectURL(enlace.href);
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
  function enlazarEventos(){
    $('filtrosGnv').onsubmit=evento=>{evento.preventDefault();actualizarMapa(true)};
    $('filtrosGnv').onreset=()=>setTimeout(()=>{prepararFiltros();actualizarMapa(true)},0);
    $('filtroDepartamento').onchange=()=>{const lista=registros.filter(x=>!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value);llenarSelect('filtroProvincia',unicos('provincia',lista),'Todas');llenarSelect('filtroDistrito',unicos('distrito',lista),'Todos')};
    $('filtroProvincia').onchange=()=>{const lista=registros.filter(x=>(!$('filtroDepartamento').value||x.departamento===$('filtroDepartamento').value)&&(!$('filtroProvincia').value||x.provincia===$('filtroProvincia').value));llenarSelect('filtroDistrito',unicos('distrito',lista),'Todos')};
    document.querySelectorAll('[data-estado]').forEach(control=>control.onchange=()=>actualizarMapa(false));
    $('botonFiltrosGnv').onclick=()=>{const contenedor=$('contenedorFiltrosGnv'),colapsado=contenedor.classList.toggle('colapsado');$('botonFiltrosGnv').setAttribute('aria-expanded',String(!colapsado));$('botonFiltrosGnv').setAttribute('aria-label',colapsado?'Mostrar filtros':'Ocultar filtros');requestAnimationFrame(()=>mapa.invalidateSize({pan:false}));setTimeout(()=>mapa.invalidateSize({pan:false}),250)};
    $('botonMapas').onclick=evento=>{L.DomEvent.stopPropagation(evento);alternarPanel('panelMapas',$('botonMapas'))};
    $('botonCapas').onclick=evento=>{L.DomEvent.stopPropagation(evento);alternarPanel('panelCapas',$('botonCapas'))};
    $('botonTematicos').onclick=evento=>{L.DomEvent.stopPropagation(evento);alternarPanel('panelTematicos',$('botonTematicos'))};
    $('activarCalor').onchange=()=>{
      modoTematico=$('activarCalor').checked;
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
    const canvasFirma=$('canvasFirmaGnv');
    canvasFirma.addEventListener('pointerdown',evento=>{
      evento.preventDefault();trazandoFirmaGnv=true;canvasFirma.setPointerCapture(evento.pointerId);
      const punto=puntoFirmaGnv(evento),contexto=canvasFirma.getContext('2d');contexto.beginPath();contexto.moveTo(punto.x,punto.y);
    });
    canvasFirma.addEventListener('pointermove',evento=>{
      if(!trazandoFirmaGnv)return;const punto=puntoFirmaGnv(evento),contexto=canvasFirma.getContext('2d');
      contexto.lineTo(punto.x,punto.y);contexto.stroke();firmaDibujadaGnv=true;$('ayudaFirmaGnv').hidden=true;
      $('textoEstadoFirmaGnv').textContent='Firma digital registrada';$('hashFirmaGnv').textContent='Firma local · lista para sellar';
    });
    const terminarFirma=()=>{trazandoFirmaGnv=false};
    canvasFirma.addEventListener('pointerup',terminarFirma);canvasFirma.addEventListener('pointercancel',terminarFirma);
    $('limpiarFirmaGnv').onclick=()=>prepararFirmaDigitalGnv();
    $('firmaDemoGnv').onclick=dibujarFirmaDemoGnv;
    $('firmarLoteGnv').onclick=firmarLiquidacionesGnv;
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
    $('filtrosGraficasGnv').onsubmit=evento=>{evento.preventDefault();actualizarAmbitoGraficas()};
    $('filtrosGraficasGnv').onreset=()=>setTimeout(()=>{prepararFiltrosGraficas();actualizarAmbitoGraficas()},0);
    $('graficaDepartamento').onchange=()=>{
      const lista=registros.filter(x=>!$('graficaDepartamento').value||x.departamento===$('graficaDepartamento').value);
      llenarSelect('graficaProvincia',unicos('provincia',lista),'Todas');llenarSelect('graficaDistrito',unicos('distrito',lista),'Todos');
    };
    $('graficaProvincia').onchange=()=>{
      const lista=registros.filter(x=>(!$('graficaDepartamento').value||x.departamento===$('graficaDepartamento').value)&&(!$('graficaProvincia').value||x.provincia===$('graficaProvincia').value));
      llenarSelect('graficaDistrito',unicos('distrito',lista),'Todos');
    };
    $('abrirMorosidadGnv').onclick=()=>{paginaMorosidad=1;renderMorosidad();abrirModal('modalMorosidadGnv')};
    document.querySelectorAll('[data-cerrar-modal]').forEach(boton=>boton.onclick=()=>cerrarModal(boton.dataset.cerrarModal));
    $('buscarMorosoGnv').oninput=()=>{paginaMorosidad=1;renderMorosidad()};
    $('estadoMorosoGnv').onchange=()=>{paginaMorosidad=1;renderMorosidad()};
    $('paginaAnteriorMorosidad').onclick=()=>{if(paginaMorosidad>1){paginaMorosidad--;renderMorosidad()}};
    $('paginaSiguienteMorosidad').onclick=()=>{paginaMorosidad++;renderMorosidad()};
    $('mensajeTodosGnv').onclick=()=>abrirMensaje();
    $('enviarMensajeGnv').onclick=()=>{cerrarModal('modalMensajeGnv');$('mensajeTodosGnv').textContent='Mensajes preparados';setTimeout(()=>$('mensajeTodosGnv').textContent='Enviar mensajes a todos',1800)};
    document.addEventListener('keydown',evento=>{if(evento.key==='Escape'){document.querySelectorAll('.modal-gnv:not([hidden])').forEach(modal=>cerrarModal(modal.id))}});
    window.addEventListener('resize',()=>mapa.invalidateSize());
    actualizarVisibilidadHerramientas();
  }
  function iniciar(){
    prepararFiltros();prepararFiltrosGraficas();iniciarMapa();enlazarEventos();actualizarMapa(true);renderGraficas();renderMorosidad();
  }
  if(typeof L==='undefined')return;
  fetch('datos_ahorro_gnv.json').then(respuesta=>{if(!respuesta.ok)throw new Error('No se pudieron cargar los registros');return respuesta.json()}).then(datos=>{registros=datos;iniciar()}).catch(error=>{console.error(error);$('contadorMapa').textContent='Datos no disponibles'});
})();
