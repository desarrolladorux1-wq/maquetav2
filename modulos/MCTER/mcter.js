(function () {
  const $ = id => document.getElementById(id);
  const elementos = {
    formulario: $('filtrosMcter'), buscar: $('buscarCodigoMcter'), regional: $('filtroRegional'), provincial: $('filtroProvincial'), distrital: $('filtroDistrital'),
    empresa: $('filtroEmpresa'), periodo: $('filtroPeriodo'), estado: $('filtroEstado'), contador: $('contadorMcter'),
    resumenGeneral: $('resumenGeneralMcter'), fichaSistema: $('fichaSistemaMcter'), cerrarDetalle: $('cerrarDetalleMcter'),
    fichaHogar: $('fichaHogarMcter'), cerrarHogar: $('cerrarHogarMcter'), hogarCodigo: $('hogarCodigo'), hogarFamilia: $('hogarFamilia'),
    fichaBeneficiario: $('fichaBeneficiarioMcter'), cerrarBeneficiario: $('cerrarBeneficiarioMcter'), datosBeneficiario: $('datosBeneficiarioMcter'),
    hogarDepartamento: $('hogarDepartamento'), hogarProvincia: $('hogarProvincia'), hogarDistrito: $('hogarDistrito'), hogarIntegrantes: $('hogarIntegrantes'), hogarPrioridad: $('hogarPrioridad'), hogarCoordenadas: $('hogarCoordenadas'),
    resumenTotal: $('resumenTotal'), resumenOperativos: $('resumenOperativos'), resumenObservados: $('resumenObservados'), resumenInactivos: $('resumenInactivos'),
    resumenCompensados: $('resumenCompensados'), resumenZonas: $('resumenZonas'), resumenSuministros: $('resumenSuministros'),
    botonMapas: $('botonMapasMcter'), botonCapas: $('botonCapasMcter'), botonTematicos: $('botonTematicosMcter'),
    panelMapas: $('panelMapasMcter'), panelCapas: $('panelCapasMcter'), panelTematicos: $('panelTematicosMcter'), activarCalor: $('activarCalorMcter'),
    tablero: document.querySelector('.tablero-mcter'), detallePanel: $('detalleMcter'), alternarPanel: $('alternarPanelMcter'), herramientas: $('herramientasMcter'), abrirHerramientas: $('abrirHerramientasMcter'), panelHerramientas: $('panelHerramientasMcter'),
    modalProceso: $('modalProcesoMcter'), tituloModal: $('tituloModalMcter'), descripcionModal: $('descripcionModalMcter'), sobrelineaModal: $('sobrelineaModalMcter'), contenidoModal: $('contenidoModalMcter'),
    generarReporte: $('generarReporteMcter'), modalExportacion: $('modalExportacionMcter'), resumenExportacion: $('resumenExportacionMcter'),
    alcanceExportacion: $('alcanceExportacionMcter'), cantidadExportacion: $('cantidadExportacionMcter'), confirmarExportacion: $('confirmarExportacionMcter'),
    datosDetalle: $('datosDetalleMcter'), tipo: $('detalleTipo'), codigo: $('detalleCodigo'), estadoDetalle: $('detalleEstadoMcter'),
    departamento: $('detalleDepartamentoMcter'), provincia: $('detalleProvinciaMcter'), distrito: $('detalleDistritoMcter'), coordenadas: $('detalleCoordenadasMcter'),
    tecnologia: $('detalleTecnologia'), capacidad: $('detalleCapacidad'), inversor: $('detalleInversor'), bateria: $('detalleBateria'), instalacion: $('detalleInstalacion'),
    mantenimiento: $('detalleMantenimiento'), sincronizacion: $('detalleSincronizacion'), opex: $('detalleOpex'), observacion: $('detalleObservacion')
  };
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  let registros = [];
  let mapa;
  let marcadores;
  let capaBaseActual;
  let capaCalor;
  let capaSeleccion;
  let seleccionExportacion = [];
  let haySeleccionExportacion = false;
  let herramientaMapa = '';
  let puntosPoligono = [];
  let centroCirculo = null;
  let trazoTemporal = null;
  const bases = {};
  const estadosVisibles = new Set(['Compensado','Pendiente','Suspendido']);
  const capasExtra = { beneficiarios: null, hogares: null, concesiones: null };
  const capasExtraActivas = new Set();

  function unicos(datos, propiedad) { return [...new Set(datos.map(item => item[propiedad]))].sort((a,b) => a.localeCompare(b, 'es')); }
  function llenar(select, valores, inicial, formatear = valor => valor) {
    const actual = select.value;
    select.replaceChildren(new Option(inicial, ''));
    valores.forEach(valor => select.add(new Option(formatear(valor), valor)));
    if (valores.includes(actual)) select.value = actual;
  }
  function nombreMes(valor) { const [anio, mes] = valor.split('-'); return `${meses[Number(mes)-1]} ${anio}`; }

  function actualizarGeografia() {
    llenar(elementos.regional, unicos(registros, 'departamento'), 'Todos los departamentos');
    const provincias = registros.filter(item => !elementos.regional.value || item.departamento === elementos.regional.value);
    llenar(elementos.provincial, unicos(provincias, 'provincia'), 'Todas las provincias');
    const distritos = provincias.filter(item => !elementos.provincial.value || item.provincia === elementos.provincial.value);
    llenar(elementos.distrital, unicos(distritos, 'distrito'), 'Todos los distritos');
  }

  function filtrar() {
    const busqueda = elementos.buscar.value.trim().toLocaleLowerCase('es');
    return registros.filter(item =>
      (!busqueda || [item.codigo, item.nombre, item.dni, item.suministro, item.departamento, item.provincia, item.distrito].some(valor => String(valor).toLocaleLowerCase('es').includes(busqueda))) &&
      (!elementos.regional.value || item.departamento === elementos.regional.value) &&
      (!elementos.provincial.value || item.provincia === elementos.provincial.value) &&
      (!elementos.distrital.value || item.distrito === elementos.distrital.value) &&
      (!elementos.empresa.value || item.empresa === elementos.empresa.value) &&
      (!elementos.periodo.value || item.periodo === elementos.periodo.value) &&
      (!elementos.estado.value || item.estado === elementos.estado.value)
    );
  }

  function puntoEnPoligono(lat,lng,puntos) {
    let dentro=false;
    for(let i=0,j=puntos.length-1;i<puntos.length;j=i++){
      const xi=puntos[i].lng, yi=puntos[i].lat, xj=puntos[j].lng, yj=puntos[j].lat;
      const cruza=((yi>lat)!==(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi)+xi);
      if(cruza)dentro=!dentro;
    }
    return dentro;
  }

  function limpiarTrazoTemporal() {
    if(trazoTemporal){ capaSeleccion.removeLayer(trazoTemporal); trazoTemporal=null; }
  }

  function mostrarSeleccionMapa(datos, tipo) {
    if (!document.getElementById('resultadoSeleccionMcter')) {
      elementos.resumenGeneral.insertAdjacentHTML('afterend', '<section class="resultado-seleccion-mapa" id="resultadoSeleccionMcter" hidden><header><div><small>SELECCIÓN EN EL MAPA</small><h2>Beneficiarios encontrados</h2><p id="textoSeleccionMcter">—</p></div><button id="limpiarSeleccionMcter" type="button">Limpiar</button></header><div class="kpis-resumen-mcter"><article><span>Total seleccionado</span><strong id="totalSeleccionMcter">0</strong></article><article><span>Compensados</span><strong id="operativosSeleccionMcter">0</strong></article><article><span>Pendientes</span><strong id="observadosSeleccionMcter">0</strong></article><article><span>Suspendidos</span><strong id="inactivosSeleccionMcter">0</strong></article></div></section>');
      document.getElementById('limpiarSeleccionMcter').addEventListener('click', limpiarSeleccionMapa);
    }
    const contar = estado => datos.filter(item => item.estado === estado).length;
    document.getElementById('textoSeleccionMcter').textContent = `${datos.length} beneficiarios dentro de la selección por ${tipo}.`;
    document.getElementById('totalSeleccionMcter').textContent = datos.length;
    document.getElementById('operativosSeleccionMcter').textContent = contar('Operativo');
    document.getElementById('observadosSeleccionMcter').textContent = contar('Observado');
    document.getElementById('inactivosSeleccionMcter').textContent = contar('Inactivo');
    elementos.resumenGeneral.hidden = true;
    document.getElementById('resultadoSeleccionMcter').hidden = false;
    elementos.detallePanel.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpiarSeleccionMapa() {
    capaSeleccion.clearLayers(); seleccionExportacion=[]; haySeleccionExportacion=false; herramientaMapa=''; centroCirculo=null; puntosPoligono=[];
    mapa.getContainer().style.cursor='';
    const resultado = document.getElementById('resultadoSeleccionMcter');
    if (resultado) resultado.hidden = true;
    elementos.resumenGeneral.hidden = false;
  }

  function activarHerramientaMapa(tipo,boton) {
    if(capaSeleccion)capaSeleccion.clearLayers();
    seleccionExportacion=[];haySeleccionExportacion=false;
    herramientaMapa=tipo;
    puntosPoligono=[];
    centroCirculo=null;
    limpiarTrazoTemporal();
    mapa.getContainer().style.cursor='crosshair';
    if(tipo==='poligono')mapa.doubleClickZoom.disable();else mapa.doubleClickZoom.enable();
    elementos.panelHerramientas.querySelectorAll('[data-tool="seleccionar"],[data-tool="poligono"],[data-tool="circulo"]').forEach(item=>item.classList.toggle('activo',item===boton));
  }

  function seleccionarRegistro(item,acumular=false) {
    haySeleccionExportacion=true;
    if(acumular){
      const indice=seleccionExportacion.findIndex(registro=>registro.codigo===item.codigo);
      if(indice>=0)seleccionExportacion.splice(indice,1);else seleccionExportacion.push(item);
    } else seleccionExportacion=[item];
  }

  function configurarSeleccionMapa() {
    capaSeleccion=L.layerGroup().addTo(mapa);
    mapa.on('click',evento=>{
      if(herramientaMapa==='poligono'){
        puntosPoligono.push(evento.latlng);
        limpiarTrazoTemporal();
        trazoTemporal=L.polyline(puntosPoligono,{color:'#397fa7',weight:3,dashArray:null}).addTo(capaSeleccion);
      } else if(herramientaMapa==='circulo'){
        if(!centroCirculo){centroCirculo=evento.latlng;return;}
        const radio=centroCirculo.distanceTo(evento.latlng);
        limpiarTrazoTemporal();
        L.circle(centroCirculo,{radius:radio,color:'#397fa7',weight:3,fillColor:'#55add0',fillOpacity:.16}).addTo(capaSeleccion);
        seleccionExportacion=filtrar().filter(item=>centroCirculo.distanceTo(L.latLng(item.lat,item.lng))<=radio);
        haySeleccionExportacion=true;
        mostrarSeleccionMapa(seleccionExportacion, 'círculo');
        centroCirculo=null;herramientaMapa='';mapa.getContainer().style.cursor='';
      }
    });
    mapa.on('mousemove',evento=>{
      if(herramientaMapa==='poligono'&&puntosPoligono.length){
        limpiarTrazoTemporal();
        trazoTemporal=L.polyline([...puntosPoligono,evento.latlng],{color:'#397fa7',weight:3}).addTo(capaSeleccion);
      } else if(herramientaMapa==='circulo'&&centroCirculo){
        limpiarTrazoTemporal();
        trazoTemporal=L.circle(centroCirculo,{radius:centroCirculo.distanceTo(evento.latlng),color:'#397fa7',weight:3,fillOpacity:.08}).addTo(capaSeleccion);
      }
    });
    mapa.on('dblclick',evento=>{
      if(herramientaMapa!=='poligono'||puntosPoligono.length<3)return;
      L.DomEvent.stop(evento);
      limpiarTrazoTemporal();
      L.polygon(puntosPoligono,{color:'#397fa7',weight:3,fillColor:'#55add0',fillOpacity:.16}).addTo(capaSeleccion);
      seleccionExportacion=filtrar().filter(item=>puntoEnPoligono(item.lat,item.lng,puntosPoligono));
      haySeleccionExportacion=true;
      mostrarSeleccionMapa(seleccionExportacion, 'polígono');
      puntosPoligono=[];herramientaMapa='';mapa.getContainer().style.cursor='';
      mapa.doubleClickZoom.enable();
    });
  }

  function mostrarDetalle(item) {
    elementos.resumenGeneral.hidden = true;
    elementos.fichaHogar.hidden = true;
    elementos.fichaBeneficiario.hidden = true;
    elementos.fichaSistema.hidden = false;
    elementos.tipo.textContent = item.codigo;
    elementos.tipo.nextElementSibling.textContent = `${item.nombre} · ${item.empresa} · ${nombreMes(item.periodo)}`;
    elementos.datosDetalle.hidden = false;
    elementos.codigo.textContent = item.codigo;
    elementos.estadoDetalle.textContent = item.estado;
    elementos.estadoDetalle.className = item.estado === 'Compensado' ? 'estado-operativo' : item.estado === 'Pendiente' ? 'estado-observado' : 'estado-inactivo';
    elementos.departamento.textContent = item.departamento;
    elementos.provincia.textContent = item.provincia;
    elementos.distrito.textContent = item.distrito;
    elementos.coordenadas.textContent = `${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}`;
    elementos.tecnologia.textContent = item.nombre;
    elementos.capacidad.textContent = item.dni;
    elementos.inversor.textContent = item.suministro;
    elementos.bateria.textContent = item.empresa;
    elementos.instalacion.textContent = nombreMes(item.periodo);
    elementos.mantenimiento.textContent = item.fechaCompensacion;
    elementos.sincronizacion.textContent = item.tarifa;
    elementos.opex.textContent = `S/ ${item.montoCompensado.toFixed(2)}`;
    elementos.observacion.textContent = item.observacion;
    document.getElementById('detalleMcter').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarHogar(item, lat, lng) {
    const numero = Number(item.codigo.replace(/\D/g, ''));
    const apellidos = ['Ramos','Quispe','Flores','Mendoza','Huamán','Torres','Chávez','Paredes'];
    elementos.resumenGeneral.hidden = true;
    elementos.fichaSistema.hidden = true;
    elementos.fichaBeneficiario.hidden = true;
    elementos.fichaHogar.hidden = false;
    elementos.hogarCodigo.textContent = `HSE-${String(numero).padStart(5,'0')}`;
    elementos.hogarFamilia.textContent = `Familia ${apellidos[numero % apellidos.length]}`;
    elementos.hogarDepartamento.textContent = item.departamento;
    elementos.hogarProvincia.textContent = item.provincia;
    elementos.hogarDistrito.textContent = item.distrito;
    elementos.hogarIntegrantes.textContent = 2 + (numero % 6);
    elementos.hogarPrioridad.textContent = ['Alta','Media','Baja'][numero % 3];
    elementos.hogarCoordenadas.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    document.getElementById('detalleMcter').scrollTo({ top:0, behavior:'smooth' });
  }

  function mostrarBeneficiario(item, lat, lng) {
    const numero = Number(item.codigo.replace(/\D/g,''));
    const paternos = ['QUISPE','RAMOS','MENDOZA','FLORES','HUAMÁN','TORRES'];
    const maternos = ['FLORES','ROJAS','SOTO','DÍAZ','CASTRO','VARGAS'];
    const nombres = ['LUCIA ANDREA','MARÍA ELENA','CARLOS ALBERTO','JOSÉ LUIS','ROSA MILAGROS','ANA SOFÍA'];
    const conexion = 320 + (numero % 9) * 18.42;
    const datos = [
      ['Suministro', String(592000 + numero)], ['Apellido paterno', paternos[numero % paternos.length]], ['Apellido materno', maternos[numero % maternos.length]],
      ['Nombres', nombres[numero % nombres.length]], ['Dirección', `AA.HH. ${item.distrito} MZ ${1 + numero % 8} LT ${1 + numero % 15} SECTOR LOS ÁNGELES`],
      ['DNI', String(74200000 + numero)], ['Celular', String(950700000 + numero * 17).slice(0,9)], ['Localidad', item.distrito], ['Distrito', item.distrito],
      ['Provincia', item.provincia], ['Departamento', item.departamento], ['Código sistema de distribución eléctrica', `SED${String(100 + numero % 900).padStart(3,'0')}`],
      ['Tipo de conexión', numero % 2 ? 'Aérea' : 'Subterránea'], ['Número de hilos medidor', String(1 + numero % 3)], ['Potencia conectada kW', String(1 + numero % 4)],
      ['Fecha de emisión', `${String(1 + numero % 27).padStart(2,'0')}/${String(1 + numero % 12).padStart(2,'0')}/2025`], ['Comprobante de venta N°', `${10 + numero % 80}-${315000 + numero}`],
      ['Conexión', conexion.toFixed(2)], ['Rotura y resane de vereda', numero % 4 === 0 ? '85.00' : '0.00'], ['Murete', numero % 5 === 0 ? '120.00' : '0.00'],
      ['Mástil', numero % 6 === 0 ? '75.00' : '0.00'], ['Total', (conexion + (numero % 4 === 0 ? 85 : 0) + (numero % 5 === 0 ? 120 : 0) + (numero % 6 === 0 ? 75 : 0)).toFixed(2)],
      ['Coordenadas', `${lat.toFixed(5)}, ${lng.toFixed(5)}`]
    ];
    elementos.resumenGeneral.hidden = true;
    elementos.fichaSistema.hidden = true;
    elementos.fichaHogar.hidden = true;
    elementos.fichaBeneficiario.hidden = false;
    elementos.datosBeneficiario.replaceChildren();
    datos.forEach(([titulo,valor]) => {
      const bloque=document.createElement('div');
      if(['Dirección','Coordenadas'].includes(titulo)) bloque.className='dato-ancho';
      const dt=document.createElement('dt'); const dd=document.createElement('dd'); dt.textContent=titulo; dd.textContent=valor; bloque.append(dt,dd); elementos.datosBeneficiario.append(bloque);
    });
    document.getElementById('detalleMcter').scrollTo({ top:0, behavior:'smooth' });
  }

  function actualizarResumen(datos) {
    const contar = estado => datos.filter(item => item.estado === estado).length;
    const operativos = contar('Compensado');
    const observados = contar('Pendiente');
    const inactivos = contar('Suspendido');
    elementos.resumenTotal.textContent = datos.length;
    elementos.resumenOperativos.textContent = operativos;
    elementos.resumenObservados.textContent = observados;
    elementos.resumenInactivos.textContent = inactivos;
    elementos.resumenCompensados.textContent = operativos;
    elementos.resumenZonas.textContent = new Set(datos.map(item => item.distrito)).size;
    elementos.resumenSuministros.textContent = datos.length;
  }

  function actualizarMapa(ajustar = true) {
    const datos = filtrar();
    marcadores.clearLayers();
    datos.filter(item => estadosVisibles.has(item.estado)).forEach(item => {
      const clase = item.estado === 'Compensado' ? 'operativo' : item.estado === 'Pendiente' ? 'observado' : 'inactivo';
      const icono = L.divIcon({ className: `marker-mcter ${clase}`, iconSize: [18,18], iconAnchor: [9,9] });
      const marcador = L.marker([item.lat, item.lng], { icon: icono, registro: item });
      marcador.bindTooltip(`${item.codigo} · ${item.estado}`, { direction: 'top', offset: [0,-8] });
      marcador.on('click', evento => { seleccionarRegistro(item,evento.originalEvent?.ctrlKey); mostrarDetalle(item); });
      marcadores.addLayer(marcador);
    });
    elementos.contador.textContent = `${datos.length} beneficiarios visibles`;
    actualizarResumen(datos);
    actualizarCapasAdicionales(datos);
    actualizarMapaCalor(datos);
    if (ajustar && datos.length) {
      const limites = marcadores.getBounds();
      if (limites.isValid()) mapa.fitBounds(limites, { padding: [30,30], maxZoom: 12 });
    }
  }

  function iniciarMapa() {
    mapa = L.map('mapaMcter', { zoomControl: false }).setView([-9.2,-75.2], 5);
    L.control.zoom({ position: 'bottomleft' }).addTo(mapa);
    bases.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' });
    bases.satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom:18, attribution:'Imágenes &copy; Esri' });
    capaBaseActual = bases.osm.addTo(mapa);
    marcadores = L.markerClusterGroup({ maxClusterRadius: 58, disableClusteringAtZoom: 13, iconCreateFunction(cluster) {
      return L.divIcon({ html: `<span>${cluster.getChildCount()}</span>`, className: 'cluster-mcter', iconSize: [46,46] });
    }});
    mapa.addLayer(marcadores);
    capaCalor = L.heatLayer([], {
      radius: 38,
      blur: 28,
      maxZoom: 11,
      minOpacity: .32,
      gradient: {
        0.15: '#315fc7',
        0.35: '#38a9df',
        0.55: '#42cf9a',
        0.72: '#f3d24b',
        0.86: '#f29a38',
        1: '#df3f4d'
      }
    });
    capasExtra.beneficiarios = L.layerGroup();
    capasExtra.hogares = L.layerGroup();
    fetch('../../geo/peru_departamentos_gadm41.json').then(r => r.json()).then(geo => {
      capasExtra.concesiones = L.geoJSON(geo, { interactive:false, style:{ color:'#735fc6', weight:2, fillColor:'#9278dc', fillOpacity:.1 } });
      if (capasExtraActivas.has('concesiones')) capasExtra.concesiones.addTo(mapa);
    });
    configurarSeleccionMapa();
  }

  function actualizarMapaCalor(datos) {
    if (!capaCalor) return;
    const puntos = datos.map(item => {
      const pesoEstado = item.estado === 'Compensado' ? .9 : item.estado === 'Pendiente' ? .68 : .45;
      return [Number(item.lat), Number(item.lng), pesoEstado];
    }).filter(punto => Number.isFinite(punto[0]) && Number.isFinite(punto[1]));
    capaCalor.setLatLngs(puntos);

    if (elementos.activarCalor.checked) {
      if (mapa.hasLayer(marcadores)) mapa.removeLayer(marcadores);
      if (!mapa.hasLayer(capaCalor)) capaCalor.addTo(mapa);
    } else {
      if (mapa.hasLayer(capaCalor)) mapa.removeLayer(capaCalor);
      if (!mapa.hasLayer(marcadores)) marcadores.addTo(mapa);
    }
  }

  function actualizarCapasAdicionales(datos) {
    if (!mapa || !capasExtra.beneficiarios) return;
    capasExtra.beneficiarios.clearLayers();
    capasExtra.hogares.clearLayers();
    const iconoBeneficiario = L.divIcon({ className:'icono-capa-mcter icono-beneficiario-mcter', html:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M6.5 19c.8-4 2.6-6 5.5-6s4.7 2 5.5 6"/></svg>', iconSize:[26,26], iconAnchor:[13,13] });
    const iconoHogar = L.divIcon({ className:'icono-capa-mcter icono-hogar-mcter', html:'<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3Z"/><path d="m13 7-3 5h3l-2 5 5-7h-3l2-3Z"/></svg>', iconSize:[30,30], iconAnchor:[15,15] });
    datos.forEach(item => {
      const lat=item.lat+.016; const lng=item.lng+.014;
      const marcador=L.marker([lat,lng],{icon:iconoBeneficiario,interactive:true}).bindTooltip(`Beneficiario · ${item.estado}`);
      marcador.on('click',()=>mostrarBeneficiario(item,lat,lng)); marcador.addTo(capasExtra.beneficiarios);
    });
    datos.filter(item => item.estado === 'Inactivo').forEach(item => {
      const lat = item.lat - .011;
      const lng = item.lng - .008;
      const marcador = L.marker([lat,lng], { icon:iconoHogar, interactive:true }).bindTooltip('Hogar sin electricidad');
      marcador.on('click', () => mostrarHogar(item,lat,lng));
      marcador.addTo(capasExtra.hogares);
    });
    ['beneficiarios','hogares'].forEach(nombre => {
      if (capasExtraActivas.has(nombre) && !mapa.hasLayer(capasExtra[nombre])) mapa.addLayer(capasExtra[nombre]);
    });
  }

  function cerrarPaneles(excepto) {
    [[elementos.panelMapas,elementos.botonMapas],[elementos.panelCapas,elementos.botonCapas],[elementos.panelTematicos,elementos.botonTematicos]].forEach(([panel,boton]) => {
      if (panel !== excepto) { panel.hidden=true; boton.setAttribute('aria-expanded','false'); }
    });
  }
  function alternarPanel(panel, boton) { const abrir=panel.hidden; cerrarPaneles(panel); panel.hidden=!abrir; boton.setAttribute('aria-expanded',String(abrir)); }

  elementos.regional.addEventListener('change', function () { elementos.provincial.value=''; elementos.distrital.value=''; actualizarGeografia(); actualizarMapa(); });
  elementos.provincial.addEventListener('change', function () { elementos.distrital.value=''; actualizarGeografia(); actualizarMapa(); });
  elementos.distrital.addEventListener('change', () => actualizarMapa());
  elementos.buscar.addEventListener('input', () => actualizarMapa(false));
  [elementos.empresa, elementos.periodo, elementos.estado].forEach(select => select.addEventListener('change', () => actualizarMapa()));
  elementos.formulario.addEventListener('submit', function (evento) { evento.preventDefault(); actualizarMapa(); });
  function posicionarAlternador(){
    if(elementos.tablero.classList.contains('panel-oculto')||innerWidth<=1100)return;
    const tableroRect=elementos.tablero.getBoundingClientRect();
    const mapaRect=elementos.tablero.querySelector('.mapa-mcter-panel').getBoundingClientRect();
    const panelRect=elementos.detallePanel.getBoundingClientRect();
    const centroSeparacion=((mapaRect.right+panelRect.left)/2)-tableroRect.left;
    elementos.alternarPanel.style.right='auto';
    elementos.alternarPanel.style.left=`${centroSeparacion}px`;
  }
  function ajustarAlturaTablero(){
    if(innerWidth<=1100){
      elementos.tablero.style.removeProperty('height');
      if(mapa) requestAnimationFrame(()=>mapa.invalidateSize());
      return;
    }
    const parteSuperior=elementos.tablero.getBoundingClientRect().top;
    const alturaDisponible=Math.max(460,Math.floor(innerHeight-parteSuperior-10));
    elementos.tablero.style.height=`${alturaDisponible}px`;
    if(mapa) requestAnimationFrame(()=>{
      mapa.invalidateSize();
      posicionarAlternador();
    });
  }
  elementos.alternarPanel.addEventListener('click',function(){const oculto=elementos.tablero.classList.toggle('panel-oculto');if(oculto){elementos.alternarPanel.style.removeProperty('left');elementos.alternarPanel.style.removeProperty('right');}else requestAnimationFrame(posicionarAlternador);elementos.alternarPanel.setAttribute('aria-expanded',String(!oculto));elementos.alternarPanel.setAttribute('aria-label',oculto?'Mostrar panel derecho':'Ocultar panel derecho');setTimeout(()=>{mapa.invalidateSize();posicionarAlternador();},280);});
  window.addEventListener('resize',()=>{ajustarAlturaTablero();posicionarAlternador();});
  new ResizeObserver(posicionarAlternador).observe(elementos.tablero);
  const observadorAltura=new ResizeObserver(ajustarAlturaTablero);
  observadorAltura.observe(document.querySelector('.filtros-mcter'));
  observadorAltura.observe(document.querySelector('.cabecera-modulo'));
  elementos.botonMapas.addEventListener('click', () => alternarPanel(elementos.panelMapas,elementos.botonMapas));
  elementos.botonCapas.addEventListener('click', () => alternarPanel(elementos.panelCapas,elementos.botonCapas));
  elementos.botonTematicos.addEventListener('click', () => alternarPanel(elementos.panelTematicos,elementos.botonTematicos));
  elementos.activarCalor.addEventListener('change', function () {
    actualizarMapaCalor(filtrar());
    elementos.botonTematicos.classList.toggle('activo', this.checked);
  });
  elementos.panelMapas.addEventListener('change', function(evento){ if(!evento.target.matches('input[type="radio"]')) return; mapa.removeLayer(capaBaseActual); capaBaseActual=bases[evento.target.value].addTo(mapa); capaBaseActual.bringToBack(); });
  elementos.panelCapas.addEventListener('change', function(evento){
    const estado=evento.target.dataset.estado; const capa=evento.target.dataset.capa;
    if(estado){ evento.target.checked ? estadosVisibles.add(estado) : estadosVisibles.delete(estado); actualizarMapa(false); }
    if(capa){ evento.target.checked ? capasExtraActivas.add(capa) : capasExtraActivas.delete(capa); const layer=capasExtra[capa]; if(layer){ evento.target.checked ? layer.addTo(mapa) : mapa.removeLayer(layer); } }
  });
  document.addEventListener('click', evento => { if(!evento.target.closest('.controles-mapa-mcter,.panel-capa-mcter')) cerrarPaneles(); });
  elementos.cerrarDetalle.addEventListener('click', function () {
    elementos.fichaSistema.hidden = true;
    elementos.resumenGeneral.hidden = false;
    document.getElementById('detalleMcter').scrollTo({ top: 0, behavior: 'smooth' });
  });
  elementos.cerrarHogar.addEventListener('click', function () {
    elementos.fichaHogar.hidden = true;
    elementos.resumenGeneral.hidden = false;
    document.getElementById('detalleMcter').scrollTo({ top:0, behavior:'smooth' });
  });
  elementos.cerrarBeneficiario.addEventListener('click', function () {
    elementos.fichaBeneficiario.hidden = true;
    elementos.resumenGeneral.hidden = false;
    document.getElementById('detalleMcter').scrollTo({ top:0, behavior:'smooth' });
  });

  function abrirSeguimientoResoluciones() {
    elementos.sobrelineaModal.textContent = 'SEGUIMIENTO DIGITAL DE RESOLUCIONES';
    elementos.tituloModal.textContent = 'Resoluciones y desembolsos';
    elementos.descripcionModal.textContent = 'Registro de resoluciones de Osinergmin, vinculación de desembolsos y control de saldos por distribuidora.';
    elementos.contenidoModal.innerHTML = `
      <div class="seguimiento-resoluciones-mcter">
        <section class="bloque-proceso-mcter carga-resolucion-mcter">
          <div class="cabecera-bloque-mcter"><div><small>NUEVO REGISTRO</small><h3>Registrar resolución</h3></div><span>Base integrada</span></div>
          <div class="form-resolucion-mcter">
            <label>Número de resolución<input id="numeroResolucion" class="campo-modal-mcter" value="OSINERGMIN-184-2026"></label>
            <label>Fecha<input id="fechaResolucion" class="campo-modal-mcter" type="date" value="2026-07-18"></label>
            <label>Empresa distribuidora<select id="empresaResolucion" class="campo-modal-mcter"><option>SEAL</option><option>Electro Sur Este</option><option>Electrocentro</option><option>Hidrandina</option></select></label>
            <label>Monto aprobado (S/)<input id="montoResolucion" class="campo-modal-mcter" type="number" value="245000"></label>
          </div>
          <div class="acciones-proceso-mcter"><button class="boton-proceso-mcter" data-registrar-resolucion type="button">Registrar resolución</button></div>
        </section>
        <section class="bloque-proceso-mcter">
          <div class="cabecera-bloque-mcter"><div><small>VINCULACIÓN</small><h3>Registrar desembolso</h3></div><span>Control financiero</span></div>
          <div class="form-resolucion-mcter tres-columnas">
            <label>Resolución<select id="resolucionDesembolso" class="campo-modal-mcter"><option>OSINERGMIN-178-2026</option><option>OSINERGMIN-172-2026</option><option>OSINERGMIN-165-2026</option></select></label>
            <label>Fecha de desembolso<input class="campo-modal-mcter" type="date" value="2026-07-21"></label>
            <label>Monto desembolsado (S/)<input id="montoDesembolso" class="campo-modal-mcter" type="number" value="45000"></label>
          </div>
          <div class="acciones-proceso-mcter"><button class="boton-proceso-mcter secundario" data-vincular-desembolso type="button">Vincular desembolso</button></div>
        </section>
        <section class="bloque-proceso-mcter reporte-saldos-mcter">
          <div class="cabecera-bloque-mcter"><div><small>REPORTE CONTABLE</small><h3>Saldos por empresa</h3></div><button type="button" data-exportar-saldos>Exportar reporte</button></div>
          <div class="resultados-mcter resumen-resoluciones-mcter"><div><span>Resoluciones</span><strong id="totalResoluciones">12</strong></div><div><span>Monto aprobado</span><strong>S/ 1,840,000</strong></div><div><span>Desembolsado</span><strong>S/ 1,235,000</strong></div><div><span>Saldo pendiente</span><strong id="saldoTotal">S/ 605,000</strong></div></div>
          <div class="tabla-resoluciones-mcter"><table><thead><tr><th>Empresa</th><th>Resoluciones</th><th>Aprobado</th><th>Desembolsado</th><th>Saldo</th><th>Estado</th></tr></thead><tbody id="tablaSaldosResoluciones"><tr><td>SEAL</td><td>4</td><td>S/ 620,000</td><td>S/ 465,000</td><td>S/ 155,000</td><td><span class="estado-resolucion-mcter vigente">Vigente</span></td></tr><tr><td>Electro Sur Este</td><td>3</td><td>S/ 480,000</td><td>S/ 310,000</td><td>S/ 170,000</td><td><span class="estado-resolucion-mcter parcial">Parcial</span></td></tr><tr><td>Electrocentro</td><td>3</td><td>S/ 440,000</td><td>S/ 290,000</td><td>S/ 150,000</td><td><span class="estado-resolucion-mcter parcial">Parcial</span></td></tr><tr><td>Hidrandina</td><td>2</td><td>S/ 300,000</td><td>S/ 170,000</td><td>S/ 130,000</td><td><span class="estado-resolucion-mcter pendiente">Pendiente</span></td></tr></tbody></table></div>
          <p class="nota-modal-mcter" id="estadoSeguimiento">Información preparada para revisión contable.</p>
        </section>
      </div>`;
    elementos.modalProceso.hidden = false;
  }

  function abrirModalProceso(tipo, coordenada) {
    if (tipo === 'dger') { abrirSeguimientoResoluciones(); return; }
    // DGER y FICEF no proporcionan coordenadas; este valor evita que la
    // plantilla de "Nuevo punto" interrumpa la apertura de esos modales.
    coordenada = coordenada || { lat: 0, lng: 0 };
    const plantillas={
      dger:{sobrelinea:'PROCESAMIENTO DE RESOLUCIONES DGER',titulo:'Importación de datos',descripcion:'Carga de archivos Excel para automatizar morosidad y cargos RER.',contenido:`<div class="contenido-proceso-mcter"><div class="bloque-proceso-mcter"><h3>Excel</h3><div class="archivo-mcter"><label>Archivo Excel de resoluciones DGER<input id="archivoDger" type="file" accept=".xlsx,.xls"></label><button class="boton-proceso-mcter" data-procesar="dger" type="button">Procesar archivo</button></div></div><div class="bloque-proceso-mcter"><h3>Resultados del procesamiento · Automático</h3><div class="resultados-mcter"><div><span>Morosidad</span><strong id="dgerMorosidad">S/ 0</strong></div><div><span>Cargo RER</span><strong id="dgerCargo">S/ 0</strong></div><div><span>Registros</span><strong id="dgerRegistros">0</strong></div></div><p class="nota-modal-mcter" id="notaDger">Selecciona un archivo Excel para iniciar el procesamiento.</p></div></div>`},
      ficef:{sobrelinea:'ANEXO 4 · FICEF',titulo:'Validación automática para reembolso',descripcion:'Validación del Excel Anexo 4 contra los datos de FICEF.',contenido:`<div class="contenido-proceso-mcter"><div class="bloque-proceso-mcter"><h3>Carga del Excel Anexo 4 · SEAL Arequipa</h3><div class="archivo-mcter"><label>Archivo Excel Anexo 4<input id="archivoFicef" type="file" accept=".xlsx,.xls"></label><button class="boton-proceso-mcter" data-procesar="ficef" type="button">Validar contra FICEF</button></div><p class="nota-modal-mcter">Base de referencia: Sociedad Eléctrica del Sur Oeste S.A. - SEAL · Arequipa · FICEF.</p></div><div class="bloque-proceso-mcter"><h3>Resultados de validación · Automático</h3><div class="resultados-mcter"><div><span>Registros</span><strong id="ficefRegistros">0</strong></div><div><span>Coinciden</span><strong id="ficefCoinciden">0</strong></div><div><span>Observados</span><strong id="ficefObservados">0</strong></div><div><span>Diferencia</span><strong id="ficefDiferencia">S/ 0.00</strong></div></div><p class="nota-modal-mcter">Empresa: SEAL Arequipa · Regla: Suministro + Código sistema + Total S/ · Estado: <b id="estadoFicef">Pendiente de carga</b></p></div><div class="acciones-proceso-mcter"><button type="button" data-cerrar-modal>Cerrar</button><button type="button">Generar sustento</button></div></div>`},
      punto:{sobrelinea:'NUEVO PUNTO',titulo:'Electricidad al Toque',descripcion:'Completa la ficha técnica y envíala a un usuario para supervisión.',contenido:`<form class="contenido-proceso-mcter" id="formNuevoPunto"><div class="form-punto-mcter"><label>Latitud<input class="campo-modal-mcter" value="${coordenada.lat.toFixed(5)}" readonly></label><label>Longitud<input class="campo-modal-mcter" value="${coordenada.lng.toFixed(5)}" readonly></label><label>Tecnología<select class="campo-modal-mcter"><option>Bifacial</option><option>Monocristalino</option></select></label><label>Capacidad<input class="campo-modal-mcter" value="550 Wp"></label><label>Inversor<input class="campo-modal-mcter" value="3 kVA"></label><label>Batería<input class="campo-modal-mcter" value="5 x 100 Ah"></label><label>Instalación<input class="campo-modal-mcter" type="date" value="2025-12-12"></label><label>Último mantenimiento<input class="campo-modal-mcter" type="date" value="2026-06-10"></label><label>Sincronización<select class="campo-modal-mcter"><option>Sincronizado</option><option>Pendiente</option></select></label><label>OPEX<select class="campo-modal-mcter"><option>Pago OPEX habilitado</option><option>Pago bloqueado</option></select></label><label class="ancho">Observación<textarea class="campo-modal-mcter">Equipo operativo sin incidencias críticas.</textarea></label><label class="ancho">Enviar a usuario<select class="campo-modal-mcter"><option>Seleccionar usuario supervisor</option><option>Supervisor regional</option><option>Coordinador técnico</option></select></label><label class="ancho">Estado de envío<input class="campo-modal-mcter" value="Pendiente de envío" readonly></label></div><p class="nota-modal-mcter">Punto capturado. Completa la información técnica y envíala a un usuario supervisor.</p><div class="acciones-proceso-mcter"><button type="button">Guardar borrador</button><button type="submit">Enviar a supervisión</button></div></form>`}
    };
    const p=plantillas[tipo];elementos.sobrelineaModal.textContent=p.sobrelinea;elementos.tituloModal.textContent=p.titulo;elementos.descripcionModal.textContent=p.descripcion;elementos.contenidoModal.innerHTML=p.contenido;elementos.modalProceso.hidden=false;
  }
  function cerrarModalProceso(){elementos.modalProceso.hidden=true;}
  const columnasExportacion=[
    ['Código MCTER','codigo'],['Beneficiario','nombre'],['DNI','dni'],['N.° suministro','suministro'],
    ['Estado de compensación','estado'],['Empresa distribuidora','empresa'],['Período','periodo'],
    ['Departamento','departamento'],['Provincia','provincia'],['Distrito','distrito'],['Latitud','lat'],['Longitud','lng'],
    ['Tarifa','tarifa'],['Monto compensado','montoCompensado'],['Fecha de compensación','fechaCompensacion'],['Observación','observacion']
  ];
  function datosParaExportar(){
    const filtrados=filtrar();
    if(!haySeleccionExportacion)return filtrados;
    const codigos=new Set(seleccionExportacion.map(item=>item.codigo));
    return filtrados.filter(item=>codigos.has(item.codigo));
  }
  function descripcionFiltrosExportacion(){
    const filtros=[elementos.regional.value&&`Departamento: ${elementos.regional.value}`,elementos.provincial.value&&`Provincia: ${elementos.provincial.value}`,elementos.distrital.value&&`Distrito: ${elementos.distrital.value}`,elementos.empresa.value&&`Empresa: ${elementos.empresa.value}`,elementos.periodo.value&&`Período: ${nombreMes(elementos.periodo.value)}`,elementos.estado.value&&`Estado: ${elementos.estado.value}`].filter(Boolean);
    return filtros.length?filtros.join(' · '):'Todos los filtros';
  }
  function abrirExportacion(){
    const datos=datosParaExportar();
    elementos.alcanceExportacion.textContent=!haySeleccionExportacion?'Todos los registros filtrados':seleccionExportacion.length===1?'Registro seleccionado':'Selección realizada en el mapa';
    elementos.cantidadExportacion.textContent=datos.length.toLocaleString('es-PE');
    elementos.resumenExportacion.textContent=`${descripcionFiltrosExportacion()}. El archivo incluirá únicamente ${datos.length} registro${datos.length===1?'':'s'}.`;
    elementos.modalExportacion.hidden=false;document.body.style.overflow='hidden';
  }
  function cerrarExportacion(){elementos.modalExportacion.hidden=true;document.body.style.overflow='';}
  function filasExportacion(datos){return datos.map(item=>Object.fromEntries(columnasExportacion.map(([titulo,clave])=>[titulo,item[clave]??''])));}
  function descargarBlob(contenido,tipo,nombre){const enlace=document.createElement('a');enlace.href=URL.createObjectURL(new Blob([contenido],{type:tipo}));enlace.download=nombre;enlace.click();setTimeout(()=>URL.revokeObjectURL(enlace.href),1000);}
  function exportarCsv(datos){const filas=[columnasExportacion.map(([titulo])=>titulo),...datos.map(item=>columnasExportacion.map(([,clave])=>item[clave]??''))];const contenido=filas.map(fila=>fila.map(valor=>`"${String(valor).replaceAll('"','""')}"`).join(',')).join('\n');descargarBlob('\ufeff'+contenido,'text/csv;charset=utf-8','reporte_mcter.csv');}
  function exportarXlsx(datos){if(!window.XLSX){exportarCsv(datos);return;}const libro=XLSX.utils.book_new(),hoja=XLSX.utils.json_to_sheet(filasExportacion(datos));hoja['!cols']=columnasExportacion.map(([titulo])=>({wch:Math.max(14,titulo.length+2)}));XLSX.utils.book_append_sheet(libro,hoja,'MCTER');XLSX.writeFile(libro,'reporte_mcter.xlsx');}
  function cargarImagenReporte(ruta){return fetch(ruta).then(r=>r.blob()).then(blob=>new Promise(resolve=>{const lector=new FileReader();lector.onload=()=>resolve(lector.result);lector.readAsDataURL(blob);}));}
  async function exportarPdf(datos){
    if(!window.jspdf?.jsPDF){window.print();return;}
    const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    try{const [fise,paulet]=await Promise.all([cargarImagenReporte('../../img/logo_fise.png'),cargarImagenReporte('../../img/logo_paulet.png')]);doc.addImage(fise,'PNG',15,8,18,18);doc.addImage(paulet,'PNG',43,8,30,18);}catch(_){}
    doc.setDrawColor(44,158,198);doc.setLineWidth(1.2);doc.line(15,30,282,30);doc.setFontSize(17);doc.setTextColor(25,35,55);doc.text('MCTER · Reporte de beneficiarios',15,40);doc.setFontSize(9);doc.setTextColor(105,120,145);doc.text(descripcionFiltrosExportacion(),15,47);
    doc.autoTable({startY:53,head:[columnasExportacion.map(([titulo])=>titulo)],body:datos.map(item=>columnasExportacion.map(([,clave])=>item[clave]??'')),styles:{fontSize:5.2,cellPadding:1.2,overflow:'linebreak'},headStyles:{fillColor:[28,125,154],textColor:255},alternateRowStyles:{fillColor:[239,247,250]},margin:{left:7,right:7}});
    doc.save('reporte_mcter.pdf');
  }
  elementos.modalProceso.addEventListener('click',function(evento){
    if(evento.target.closest('[data-cerrar-modal]')) cerrarModalProceso();
    if(evento.target.closest('[data-registrar-resolucion]')) {
      const numero=$('numeroResolucion').value.trim(); const empresa=$('empresaResolucion').value; const monto=Number($('montoResolucion').value||0);
      if(!numero||!monto){$('estadoSeguimiento').textContent='Completa el número y el monto de la resolución.';return;}
      $('totalResoluciones').textContent=String(Number($('totalResoluciones').textContent)+1);
      $('resolucionDesembolso').add(new Option(numero,numero),0); $('resolucionDesembolso').value=numero;
      $('estadoSeguimiento').textContent=`Resolución ${numero} registrada para ${empresa} por S/ ${monto.toLocaleString('es-PE')}.`;
    }
    if(evento.target.closest('[data-vincular-desembolso]')) {
      const resolucion=$('resolucionDesembolso').value; const monto=Number($('montoDesembolso').value||0);
      $('estadoSeguimiento').textContent=monto ? `Desembolso de S/ ${monto.toLocaleString('es-PE')} vinculado a ${resolucion}.` : 'Ingresa un monto de desembolso válido.';
    }
    if(evento.target.closest('[data-exportar-saldos]')) $('estadoSeguimiento').textContent='Reporte de saldos generado para revisión de contabilidad.';
  });
  elementos.modalProceso.addEventListener('submit',function(evento){evento.preventDefault();cerrarModalProceso();});
  elementos.generarReporte.addEventListener('click',abrirExportacion);
  elementos.modalExportacion.querySelectorAll('[data-cerrar-exportacion]').forEach(boton=>boton.addEventListener('click',cerrarExportacion));
  elementos.confirmarExportacion.addEventListener('click',async function(){
    const datos=datosParaExportar(),formato=document.querySelector('input[name="formatoExportacionMcter"]:checked').value;
    elementos.confirmarExportacion.disabled=true;elementos.confirmarExportacion.textContent='Generando…';
    try{if(formato==='csv')exportarCsv(datos);else if(formato==='xlsx')exportarXlsx(datos);else await exportarPdf(datos);cerrarExportacion();}
    finally{elementos.confirmarExportacion.disabled=false;elementos.confirmarExportacion.textContent='Generar reporte';}
  });
  elementos.abrirHerramientas.addEventListener('click',function(){const abrir=elementos.panelHerramientas.hidden;elementos.panelHerramientas.hidden=!abrir;elementos.abrirHerramientas.setAttribute('aria-expanded',String(abrir));});
  elementos.panelHerramientas.addEventListener('click',function(evento){
    const boton=evento.target.closest('[data-tool]');if(!boton)return;const tool=boton.dataset.tool;
    if(['seleccionar','poligono','circulo'].includes(tool)){activarHerramientaMapa(tool,boton);return;}
    if(tool==='carrusel'){
      elementos.panelHerramientas.classList.remove('ampliado');
      elementos.panelHerramientas.querySelectorAll('[data-tool="ampliar"]').forEach(b=>{b.title='Ampliar';b.classList.remove('activo');});
      elementos.panelHerramientas.querySelectorAll('.pagina-herramientas-mcter').forEach(p=>p.classList.toggle('activa'));
      return;
    }
    if(tool==='ampliar'){
      const ampliado=elementos.panelHerramientas.classList.toggle('ampliado');
      elementos.panelHerramientas.querySelectorAll('[data-tool="ampliar"]').forEach(b=>{b.title=ampliado?'Contraer':'Ampliar';b.classList.toggle('activo',ampliado);});
      return;
    }
    if(tool==='mover'){boton.classList.add('activo');return;}
    if(tool==='dger'){abrirModalProceso(tool);return;}
    if(tool==='nuevo-punto'){elementos.panelHerramientas.hidden=true;mapa.getContainer().style.cursor='crosshair';mapa.once('click',e=>{mapa.getContainer().style.cursor='';abrirModalProceso('punto',e.latlng);});return;}
    boton.classList.toggle('activo');
  });
  let arrastreHerramientas=null;
  elementos.panelHerramientas.addEventListener('pointerdown',function(evento){const boton=evento.target.closest('[data-tool="mover"]');if(!boton)return;const rect=elementos.panelHerramientas.getBoundingClientRect();elementos.panelHerramientas.style.position='fixed';elementos.panelHerramientas.style.left=`${rect.left}px`;elementos.panelHerramientas.style.top=`${rect.top}px`;elementos.panelHerramientas.style.right='auto';arrastreHerramientas={x:evento.clientX-rect.left,y:evento.clientY-rect.top};boton.classList.add('activo');elementos.panelHerramientas.setPointerCapture(evento.pointerId);evento.preventDefault();});
  elementos.panelHerramientas.addEventListener('pointermove',function(evento){if(!arrastreHerramientas)return;elementos.panelHerramientas.style.left=`${Math.max(0,Math.min(innerWidth-elementos.panelHerramientas.offsetWidth,evento.clientX-arrastreHerramientas.x))}px`;elementos.panelHerramientas.style.top=`${Math.max(0,Math.min(innerHeight-elementos.panelHerramientas.offsetHeight,evento.clientY-arrastreHerramientas.y))}px`;});
  elementos.panelHerramientas.addEventListener('pointerup',function(){arrastreHerramientas=null;});

  fetch('datos_mcter.json').then(respuesta => respuesta.json()).then(datos => {
    const nombres = ['María Quispe Flores','Carlos Huamán Rojas','Rosa Torres Mendoza','José Vargas Soto','Ana Paredes Castro','Luis Condori Chávez','Elena Mamani Díaz','Jorge Cáceres Ramos'];
    const estados = { Operativo:'Compensado', Observado:'Pendiente', Inactivo:'Suspendido' };
    registros = datos.registros.map((item, indice) => ({
      ...item,
      tipo: 'Beneficiario MCTER',
      estado: estados[item.estado] || item.estado,
      nombre: item.nombre || nombres[indice % nombres.length],
      dni: item.dni || String(41000000 + indice * 137),
      suministro: item.suministro || `SUM-${String(730000 + indice).padStart(7,'0')}`,
      tarifa: item.tarifa || ['BT5B Residencial','BT5B No residencial','BT5C Rural'][indice % 3],
      montoCompensado: Number(item.montoCompensado ?? (18.5 + (indice % 12) * 2.35).toFixed(2)),
      fechaCompensacion: item.fechaCompensacion || `${String(3 + indice % 25).padStart(2,'0')}/${String(Number(item.periodo.slice(5,7))).padStart(2,'0')}/${item.periodo.slice(0,4)}`,
      observacion: item.observacion || (item.estado === 'Inactivo' ? 'Beneficio suspendido hasta actualizar la validación del suministro.' : item.estado === 'Observado' ? 'Compensación pendiente de validación por la empresa distribuidora.' : 'Beneficiario incluido en el padrón de compensación tarifaria.')
    }));
    llenar(elementos.empresa, unicos(registros, 'empresa'), 'Todas las empresas distribuidoras');
    llenar(elementos.periodo, unicos(registros, 'periodo').reverse(), 'Todos los meses', nombreMes);
    actualizarGeografia();
    iniciarMapa();
    ajustarAlturaTablero();
    posicionarAlternador();
    actualizarMapa();
  }).catch(error => { elementos.contador.textContent = 'No se pudo cargar el padrón MCTER'; console.error(error); });
})();
