(function () {
  const formatoNumero = new Intl.NumberFormat('es-PE');
  const elementos = {
    periodo: document.getElementById('filtroPeriodo'),
    busqueda: document.getElementById('filtroBusqueda'),
    ede: document.getElementById('filtroEde'),
    departamento: document.getElementById('filtroDepartamento'),
    provincia: document.getElementById('filtroProvincia'),
    distrito: document.getElementById('filtroDistrito'),
    formulario: document.getElementById('filtrosFise'),
    contenedorFiltros: document.getElementById('contenedorFiltrosFise'),
    botonFiltros: document.getElementById('botonFiltrosFise'),
    seccionSatcontrol: document.getElementById('satcontrol'),
    contador: document.getElementById('mapaContador'),
    fecha: document.getElementById('fechaActualizacion'),
    beneficiarios: document.getElementById('kpiBeneficiarios'),
    registros: document.getElementById('kpiRegistros'),
    departamentos: document.getElementById('kpiDepartamentos'),
    canal: document.getElementById('graficoCanal'),
    zona: document.getElementById('graficoZona'),
    estado: document.getElementById('graficoEstado')
    ,periodoGrafico: document.getElementById('graficoPeriodo')
    ,edeGrafico: document.getElementById('graficoEde')
    ,departamentosGrafico: document.getElementById('graficoDepartamentos')
    ,canalAmpliado: document.getElementById('graficoCanalAmpliado')
    ,zonaAmpliada: document.getElementById('graficaZonaAmpliada')
    ,estadoAmpliado: document.getElementById('graficaEstadoAmpliada')
    ,botonResumen: document.getElementById('botonResumen')
    ,tablero: document.querySelector('.tablero-fise')
    ,panelResumen: document.getElementById('panelResumen')
    ,ficha: document.getElementById('fichaBeneficiario')
    ,cerrarFicha: document.getElementById('cerrarFicha')
    ,detalleId: document.getElementById('detalleId')
    ,detalleNombre: document.getElementById('detalleNombre')
    ,detalleDni: document.getElementById('detalleDni')
    ,detalleSuministro: document.getElementById('detalleSuministro')
    ,detalleEntidad: document.getElementById('detalleEntidad')
    ,detalleZona: document.getElementById('detalleZona')
    ,detalleDepartamento: document.getElementById('detalleDepartamento')
    ,detalleEstado: document.getElementById('detalleEstado')
    ,detalleFecha: document.getElementById('detalleFecha')
    ,detalleCoordenadas: document.getElementById('detalleCoordenadas')
    ,fichaTerritorial: document.getElementById('fichaTerritorial')
    ,territorioTitulo: document.getElementById('territorioTitulo')
    ,territorioRuta: document.getElementById('territorioRuta')
    ,territorioBeneficiarios: document.getElementById('territorioBeneficiarios')
    ,territorioRegistros: document.getElementById('territorioRegistros')
    ,territorioUnidadEtiqueta: document.getElementById('territorioUnidadEtiqueta')
    ,territorioUnidades: document.getElementById('territorioUnidades')
    ,territorioAyuda: document.getElementById('territorioAyuda')
    ,territorioLista: document.getElementById('territorioLista')
    ,volverTerritorio: document.getElementById('volverTerritorio')
    ,resumenSobrelinea: document.getElementById('resumenSobrelinea')
    ,resumenTitulo: document.getElementById('resumenTitulo')
    ,resumenDescripcion: document.getElementById('resumenDescripcion')
    ,botonMapas: document.getElementById('botonMapas')
    ,botonCapas: document.getElementById('botonCapas')
    ,panelMapas: document.getElementById('panelMapas')
    ,panelCapas: document.getElementById('panelCapas')
    ,activarAgentes: document.getElementById('activarAgentes')
    ,botonExportar: document.getElementById('botonExportar')
    ,modalExportacion: document.getElementById('modalExportacion')
    ,resumenExportacion: document.getElementById('resumenExportacion')
    ,alcanceExportacion: document.getElementById('alcanceExportacion')
    ,cantidadExportacion: document.getElementById('cantidadExportacion')
    ,confirmarExportacion: document.getElementById('confirmarExportacion')
    ,fichaAgente: document.getElementById('fichaAgente')
    ,cerrarFichaAgente: document.getElementById('cerrarFichaAgente')
    ,agenteNombre: document.getElementById('agenteNombre')
    ,agenteDireccion: document.getElementById('agenteDireccion')
    ,agenteDepartamento: document.getElementById('agenteDepartamento')
    ,agenteProvincia: document.getElementById('agenteProvincia')
    ,agenteDistrito: document.getElementById('agenteDistrito')
    ,agenteLatitud: document.getElementById('agenteLatitud')
    ,agenteLongitud: document.getElementById('agenteLongitud')
    ,botonTematicos: document.getElementById('botonTematicos')
    ,panelTematicos: document.getElementById('panelTematicos')
    ,activarCalor: document.getElementById('activarCalor')
    ,botonGenerarAlertas: document.getElementById('botonGenerarAlertas')
    ,modalAlerta: document.getElementById('modalAlerta')
    ,formularioAlerta: document.getElementById('formularioAlerta')
    ,pasoAlerta1: document.getElementById('pasoAlerta1')
    ,pasoAlerta2: document.getElementById('pasoAlerta2')
    ,tituloModalAlerta: document.getElementById('tituloModalAlerta')
    ,descripcionModalAlerta: document.getElementById('descripcionModalAlerta')
    ,siguienteAlerta: document.getElementById('siguienteAlerta')
    ,volverAlerta: document.getElementById('volverAlerta')
    ,mensajeAlerta: document.getElementById('mensajeAlerta')
    ,barraHerramientas: document.getElementById('barraHerramientasFise')
    ,abrirHerramientas: document.getElementById('abrirHerramientasFise')
    ,grupoHerramientas: document.getElementById('grupoHerramientasFise')
    ,fichaSeleccionMapa: document.getElementById('fichaSeleccionMapa')
    ,tituloSeleccionMapa: document.getElementById('tituloSeleccionMapa')
    ,resumenSeleccionMapa: document.getElementById('resumenSeleccionMapa')
    ,listaSeleccionMapa: document.getElementById('listaSeleccionMapa')
    ,cerrarSeleccionMapa: document.getElementById('cerrarSeleccionMapa')
    ,limpiarSeleccionMapa: document.getElementById('limpiarSeleccionMapa')
    ,filtrosAnalitica: document.getElementById('filtrosAnalitica')
    ,analiticaEde: document.getElementById('analiticaEde')
    ,analiticaPeriodo: document.getElementById('analiticaPeriodo')
    ,analiticaActivos: document.getElementById('analiticaActivos')
    ,analiticaSuspendidos: document.getElementById('analiticaSuspendidos')
    ,analiticaExcluidos: document.getElementById('analiticaExcluidos')
    ,analiticaCobertura: document.getElementById('analiticaCobertura')
    ,graficoEvolucionBeneficiarios: document.getElementById('graficoEvolucionBeneficiarios')
    ,graficoEvolucionVales: document.getElementById('graficoEvolucionVales')
    ,analiticaRegiones: document.getElementById('analiticaRegiones')
    ,analiticaSuministro: document.getElementById('analiticaSuministro')
  };

  let registros = [];
  let mapa;
  let grupoMarcadores;
  let capaTerritorial;
  let capaBaseActual;
  let capaCalor;
  let capaAgentes;
  let beneficiarioSeleccionado = null;
  let seleccionExportacion = [];
  let calorActivo = false;
  const capasBase = {};
  const estadosVisibles = new Set(['Activo', 'Suspendido', 'Excluido']);
  let herramientaActiva = null;
  let puntosDibujo = [];
  let centroCirculo = null;
  let capaDibujo;
  let figuraTemporal;
  let cuadroAnimacionCirculo = 0;
  const geoCache = {};
  const territorio = { nivel: 'pais', departamento: null, provincia: null, distrito: null, unidades: [] };

  function ajustarAlturaTablero() {
    if (!elementos.tablero) return;
    if (innerWidth <= 980) {
      elementos.tablero.style.removeProperty('height');
      return;
    }
    const inicio = elementos.tablero.getBoundingClientRect().top;
    const alturaDisponible = Math.max(480, Math.floor(innerHeight - inicio - 14));
    elementos.tablero.style.height = `${alturaDisponible}px`;
    if (mapa) mapa.invalidateSize();
  }

  window.addEventListener('resize', ajustarAlturaTablero);
  requestAnimationFrame(ajustarAlturaTablero);
  const agentes = [
    {nombre:'Agente FISE Lima Centro',direccion:'Av. Arequipa 1645',departamento:'Lima',provincia:'Lima',distrito:'Lince',lat:-12.0841,lng:-77.0349},
    {nombre:'Agente FISE Lima Norte',direccion:'Av. Túpac Amaru 3380',departamento:'Lima',provincia:'Lima',distrito:'Comas',lat:-11.9518,lng:-77.0557},
    {nombre:'Agente FISE Lima Sur',direccion:'Av. Revolución 1180',departamento:'Lima',provincia:'Lima',distrito:'Villa El Salvador',lat:-12.2132,lng:-76.9374},
    {nombre:'Agente FISE Callao',direccion:'Av. Sáenz Peña 118',departamento:'Callao',provincia:'Callao',distrito:'Callao',lat:-12.0611,lng:-77.1405},
    {nombre:'Agente FISE Piura',direccion:'Jr. Arequipa 945',departamento:'Piura',provincia:'Piura',distrito:'Piura',lat:-5.1945,lng:-80.6328},
    {nombre:'Agente FISE Chiclayo',direccion:'Av. Balta 512',departamento:'Lambayeque',provincia:'Chiclayo',distrito:'Chiclayo',lat:-6.7714,lng:-79.8409},
    {nombre:'Agente FISE Trujillo',direccion:'Jr. Pizarro 610',departamento:'La Libertad',provincia:'Trujillo',distrito:'Trujillo',lat:-8.1119,lng:-79.0288},
    {nombre:'Agente FISE Chimbote',direccion:'Av. José Pardo 820',departamento:'Áncash',provincia:'Santa',distrito:'Chimbote',lat:-9.0745,lng:-78.5931},
    {nombre:'Agente FISE Ica',direccion:'Av. Municipalidad 234',departamento:'Ica',provincia:'Ica',distrito:'Ica',lat:-14.0678,lng:-75.7286},
    {nombre:'Agente FISE Arequipa',direccion:'Calle San José 308',departamento:'Arequipa',provincia:'Arequipa',distrito:'Arequipa',lat:-16.3988,lng:-71.5369},
    {nombre:'Agente FISE Cusco',direccion:'Av. El Sol 742',departamento:'Cusco',provincia:'Cusco',distrito:'Cusco',lat:-13.5226,lng:-71.9673},
    {nombre:'Agente FISE Huancayo',direccion:'Jr. Real 760',departamento:'Junín',provincia:'Huancayo',distrito:'Huancayo',lat:-12.0683,lng:-75.2105},
    {nombre:'Agente FISE Pucallpa',direccion:'Jr. Ucayali 525',departamento:'Ucayali',provincia:'Coronel Portillo',distrito:'Callería',lat:-8.3791,lng:-74.5539},
    {nombre:'Agente FISE Iquitos',direccion:'Jr. Próspero 410',departamento:'Loreto',provincia:'Maynas',distrito:'Iquitos',lat:-3.7491,lng:-73.2538}
  ];

  function normalizarTexto(valor) {
    return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
  }

  function valoresUnicos(datos, propiedad) {
    return [...new Set(datos.map(item => item[propiedad]))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  function llenarSelector(selector, valores, etiquetaInicial) {
    const valorActual = selector.value;
    selector.replaceChildren(new Option(etiquetaInicial, ''));
    valores.forEach(valor => selector.add(new Option(valor, valor)));
    if (valores.includes(valorActual)) selector.value = valorActual;
  }

  function mostrarMesesEnSelector(selector) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    [...selector.options].forEach(opcion => {
      const coincidencia = /^(\d{4})-(\d{2})$/.exec(opcion.value);
      if (coincidencia) opcion.textContent = `${meses[Number(coincidencia[2]) - 1]} ${coincidencia[1]}`;
    });
  }

  function sumarPor(datos, propiedad) {
    return datos.reduce((resultado, item) => {
      resultado[item[propiedad]] = (resultado[item[propiedad]] || 0) + item.beneficiarios;
      return resultado;
    }, {});
  }

  function totalBeneficiarios(datos) {
    return datos.reduce((total, item) => total + item.beneficiarios, 0);
  }

  function obtenerFiltrados() {
    const consulta = elementos.busqueda.value.trim().toLocaleLowerCase('es');
    return registros.filter(item =>
      (!consulta || [item.id, item.dni, item.codigoSuministro, item.nombre].some(valor => String(valor).toLocaleLowerCase('es').includes(consulta))) &&
      (!elementos.periodo.value || item.periodo === elementos.periodo.value) &&
      (!elementos.ede.value || item.ede === elementos.ede.value) &&
      (!elementos.departamento.value || item.departamento === elementos.departamento.value) &&
      (!elementos.provincia.value || item.provincia === elementos.provincia.value) &&
      (!elementos.distrito.value || item.distrito === elementos.distrito.value) &&
      (!territorio.departamento || normalizarTexto(item.departamento) === normalizarTexto(territorio.departamento.nombre)) &&
      (!territorio.provincia || normalizarTexto(item.provincia) === normalizarTexto(territorio.provincia.nombre)) &&
      (!territorio.distrito || normalizarTexto(item.distrito) === normalizarTexto(territorio.distrito.nombre))
    );
  }

  function actualizarFiltrosGeograficos() {
    const porDepartamento = registros.filter(item =>
      (!elementos.ede.value || item.ede === elementos.ede.value) &&
      (!elementos.periodo.value || item.periodo === elementos.periodo.value)
    );
    llenarSelector(elementos.departamento, valoresUnicos(porDepartamento, 'departamento'), 'Todos');

    const porProvincia = porDepartamento.filter(item =>
      !elementos.departamento.value || item.departamento === elementos.departamento.value
    );
    llenarSelector(elementos.provincia, valoresUnicos(porProvincia, 'provincia'), 'Todas');

    const porDistrito = porProvincia.filter(item =>
      !elementos.provincia.value || item.provincia === elementos.provincia.value
    );
    llenarSelector(elementos.distrito, valoresUnicos(porDistrito, 'distrito'), 'Todos');
  }

  function crearBarras(contenedor, agrupados) {
    contenedor.replaceChildren();
    const entradas = Object.entries(agrupados).sort((a, b) => b[1] - a[1]);
    const maximo = Math.max(...entradas.map(([, valor]) => valor), 1);

    entradas.forEach(([nombre, valor]) => {
      const fila = document.createElement('div');
      fila.className = 'barra-fila';
      const etiqueta = document.createElement('span');
      etiqueta.textContent = nombre;
      const pista = document.createElement('div');
      pista.className = 'barra-pista';
      const barra = document.createElement('div');
      barra.className = 'barra-valor';
      barra.style.width = `${(valor / maximo) * 100}%`;
      const numero = document.createElement('span');
      numero.className = 'barra-numero';
      numero.textContent = formatoNumero.format(valor);
      pista.append(barra);
      fila.append(etiqueta, pista, numero);
      contenedor.append(fila);
    });
  }

  function crearDona(contenedor, agrupados, colores) {
    contenedor.replaceChildren();
    const entradas = Object.entries(agrupados).sort((a, b) => b[1] - a[1]);
    const total = entradas.reduce((suma, [, valor]) => suma + valor, 0);
    let acumulado = 0;
    const segmentos = entradas.map(([, valor], indice) => {
      const inicio = acumulado;
      acumulado += total ? (valor / total) * 100 : 0;
      return `${colores[indice % colores.length]} ${inicio}% ${acumulado}%`;
    });

    const envoltura = document.createElement('div');
    envoltura.className = 'dona-envoltura';
    const dona = document.createElement('div');
    dona.className = 'dona';
    dona.style.background = `conic-gradient(${segmentos.join(',') || '#263455 0 100%'})`;
    const centro = document.createElement('div');
    centro.className = 'dona-centro';
    const textoTotal = document.createElement('span');
    textoTotal.textContent = 'TOTAL';
    const cifra = document.createElement('strong');
    cifra.textContent = formatoNumero.format(total);
    centro.append(textoTotal, cifra);
    envoltura.append(dona, centro);

    const leyenda = document.createElement('div');
    leyenda.className = 'leyenda';
    entradas.forEach(([nombre, valor], indice) => {
      const fila = document.createElement('div');
      fila.className = 'leyenda-item';
      const color = document.createElement('span');
      color.className = 'leyenda-color';
      color.style.background = colores[indice % colores.length];
      const etiqueta = document.createElement('span');
      etiqueta.textContent = nombre;
      const numero = document.createElement('span');
      numero.textContent = total ? `${Math.round(valor / total * 100)}%` : '0%';
      fila.append(color, etiqueta, numero);
      leyenda.append(fila);
    });
    contenedor.append(envoltura, leyenda);
  }

  function iniciarMapa() {
    if (!window.L) {
      document.getElementById('mapaFise').innerHTML = '<div class="estado-vacio">No fue posible cargar el mapa. Verifique la conexión a Internet.</div>';
      return;
    }

    mapa = L.map('mapaFise', { zoomControl: false }).setView([-9.2, -75.2], 5);
    L.control.zoom({ position: 'bottomleft' }).addTo(mapa);
    capasBase.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    });
    capasBase.satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Imágenes &copy; Esri'
    });
    capaBaseActual = capasBase.osm.addTo(mapa);

    [elementos.panelMapas, elementos.panelCapas, elementos.panelTematicos].forEach(panel => {
      L.DomEvent.disableClickPropagation(panel);
      L.DomEvent.disableScrollPropagation(panel);
    });
    document.querySelectorAll('.controles-mapa button').forEach(boton => L.DomEvent.disableClickPropagation(boton));

    grupoMarcadores = L.markerClusterGroup({
      maxClusterRadius: 65,
      disableClusteringAtZoom: 14,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (cluster) {
        const total = cluster.getAllChildMarkers().reduce((suma, marcador) => suma + marcador.options.datos.beneficiarios, 0);
        const texto = total >= 1000 ? `${Math.round(total / 1000)}k` : total;
        return L.divIcon({ html: `<span>${texto}</span>`, className: 'marker-cluster-fise', iconSize: [52, 52] });
      }
    });
    mapa.addLayer(grupoMarcadores);
    capaAgentes = L.featureGroup();
    capaDibujo = L.layerGroup().addTo(mapa);
    document.dispatchEvent(new CustomEvent('mapafise:listo'));
  }

  async function cargarGeo(clave, ruta) {
    if (!geoCache[clave]) {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) throw new Error(`No se pudo cargar el nivel territorial: ${clave}`);
      geoCache[clave] = await respuesta.json();
    }
    return geoCache[clave];
  }

  function nombrePropiedad(feature, nivel) {
    return feature.properties[nivel === 'departamento' ? 'NAME_1' : nivel === 'provincia' ? 'NAME_2' : 'NAME_3'];
  }

  function estiloTerritorial(feature, nivel) {
    const paletas = {
      departamento: ['#2f91bd', '#45a8c8', '#397faf', '#55aab6', '#3479a2'],
      provincia: ['#e58a3a', '#d85f68', '#dfa92f', '#39a681', '#487fce', '#b26bb5', '#db7044', '#6f9e42'],
      distrito: ['#7657c7', '#b05291', '#378eb7', '#de7851', '#5aa05c', '#c09a35', '#4c72c7', '#a65d5d', '#4f9b91']
    };
    const nombre = nombrePropiedad(feature, nivel) || '';
    const indice = [...nombre].reduce((total, letra) => total + letra.charCodeAt(0), 0) % paletas[nivel].length;
    const color = paletas[nivel][indice];
    return {
      color,
      fillColor: color,
      fillOpacity: nivel === 'departamento' ? .16 : .22,
      weight: nivel === 'distrito' ? 1.7 : 2,
      opacity: .9,
      className: 'limite-territorial'
    };
  }

  function actualizarCapaTerritorial(features, nivel) {
    if (capaTerritorial) mapa.removeLayer(capaTerritorial);
    capaTerritorial = L.geoJSON({ type: 'FeatureCollection', features }, {
      style: feature => estiloTerritorial(feature, nivel),
      onEachFeature: function (feature, layer) {
        const nombre = nombrePropiedad(feature, nivel);
        layer.bindTooltip(nombre, {
          permanent: nivel !== 'departamento',
          sticky: nivel === 'departamento',
          direction: 'center',
          className: `etiqueta-territorial etiqueta-${nivel}`
        });
        layer.on({
          mouseover: function () { layer.setStyle({ fillOpacity: .32, weight: 2.8 }); },
          mouseout: function () { capaTerritorial.resetStyle(layer); },
          click: async function (evento) {
            if (evento.originalEvent) L.DomEvent.stopPropagation(evento.originalEvent);
            if (herramientaActiva === 'poligono' || herramientaActiva === 'circulo') {
              manejarClickDibujo(evento);
              return;
            }
            mapa.getContainer().classList.add('mapa-cargando-territorio');
            try {
              if (nivel === 'departamento') await navegarDepartamento(feature);
              if (nivel === 'provincia') await navegarProvincia(feature);
              if (nivel === 'distrito') navegarDistrito(feature);
            } finally {
              mapa.getContainer().classList.remove('mapa-cargando-territorio');
            }
          },
          dblclick: function (evento) {
            if (herramientaActiva === 'poligono' || herramientaActiva === 'circulo') cerrarDibujo(evento);
          }
        });
      }
    }).addTo(mapa);
    capaTerritorial.bringToBack();
  }

  function ajustarVistaCapa(maxZoom) {
    const limites = capaTerritorial?.getBounds();
    if (limites?.isValid()) {
      mapa.stop();
      mapa.fitBounds(limites, { padding: [24, 24], maxZoom });
    }
  }

  function enfocarTerritorio(feature, minZoom, maxZoom) {
    if (!mapa || !feature) return;
    const limites = L.geoJSON(feature).getBounds();
    if (!limites.isValid()) return;
    const zoomNatural = mapa.getBoundsZoom(limites, false, L.point(34, 34));
    const zoomDestino = Math.min(maxZoom, Math.max(minZoom, zoomNatural));
    mapa.stop();
    mapa.flyTo(limites.getCenter(), zoomDestino, { animate: true, duration: .65 });
  }

  function contarRegistrosUnidad(nombre, nivel) {
    const propiedad = nivel === 'provincia' ? 'provincia' : nivel === 'distrito' ? 'distrito' : 'departamento';
    return obtenerFiltrados().filter(item => normalizarTexto(item[propiedad]) === normalizarTexto(nombre)).length;
  }

  function mostrarPanelTerritorial(nivel, unidades) {
    territorio.unidades = unidades;
    const datos = obtenerFiltrados();
    const nombres = {
      departamento: territorio.departamento?.nombre,
      provincia: territorio.provincia?.nombre,
      distrito: territorio.distrito?.nombre
    };
    const titulo = nombres[nivel] || 'Perú';
    const ruta = [territorio.departamento?.nombre, territorio.provincia?.nombre, territorio.distrito?.nombre].filter(Boolean).join(' / ');
    const siguiente = nivel === 'departamento' ? 'Provincias' : nivel === 'provincia' ? 'Distritos' : 'Nivel';

    elementos.resumenSobrelinea.textContent = nivel === 'departamento' ? 'RESUMEN DEPARTAMENTAL' : nivel === 'provincia' ? 'RESUMEN PROVINCIAL' : 'RESUMEN DISTRITAL';
    elementos.resumenTitulo.textContent = titulo;
    elementos.resumenDescripcion.textContent = ruta.toLocaleUpperCase('es');
    elementos.volverTerritorio.hidden = false;

    elementos.territorioTitulo.textContent = titulo;
    elementos.territorioRuta.textContent = ruta;
    elementos.territorioBeneficiarios.textContent = formatoNumero.format(totalBeneficiarios(datos));
    elementos.territorioRegistros.textContent = formatoNumero.format(datos.length);
    elementos.territorioUnidadEtiqueta.textContent = siguiente;
    elementos.territorioUnidades.textContent = nivel === 'distrito' ? 'Distrito' : formatoNumero.format(unidades.length);
    elementos.territorioAyuda.textContent = nivel === 'departamento'
      ? 'Selecciona una provincia en el mapa para continuar.'
      : nivel === 'provincia'
        ? 'Selecciona un distrito en el mapa para llegar al nivel más detallado.'
        : 'Has llegado al nivel distrital. Los marcadores corresponden a este territorio.';
    elementos.territorioLista.replaceChildren();

    if (nivel === 'distrito') {
      datos.forEach(item => {
        const fila = document.createElement('div');
        fila.className = 'territorio-item';
        const nombre = document.createElement('span');
        nombre.textContent = item.nombre;
        const cantidad = document.createElement('b');
        cantidad.textContent = item.dni;
        fila.append(nombre, cantidad);
        elementos.territorioLista.append(fila);
      });
    } else {
      unidades.forEach(feature => {
        const nombreUnidad = nombrePropiedad(feature, nivel === 'departamento' ? 'provincia' : 'distrito');
        const fila = document.createElement('div');
        fila.className = 'territorio-item';
        const nombre = document.createElement('span');
        nombre.textContent = nombreUnidad;
        const cantidad = document.createElement('b');
        cantidad.textContent = `${contarRegistrosUnidad(nombreUnidad, nivel === 'departamento' ? 'provincia' : 'distrito')} reg.`;
        fila.append(nombre, cantidad);
        elementos.territorioLista.append(fila);
      });
    }

    elementos.ficha.hidden = true;
    elementos.fichaAgente.hidden = true;
    elementos.fichaTerritorial.hidden = true;
    elementos.panelResumen.classList.remove('beneficiario-seleccionado');
    elementos.panelResumen.classList.add('territorio-seleccionado');
    if (elementos.tablero.classList.contains('resumen-oculto')) elementos.botonResumen.click();
    elementos.panelResumen.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function mostrarPais() {
    const geo = await cargarGeo('departamentos', '../../geo/peru_departamentos_gadm41.json');
    territorio.nivel = 'pais';
    territorio.departamento = null;
    territorio.provincia = null;
    territorio.distrito = null;
    territorio.unidades = geo.features;
    actualizarCapaTerritorial(geo.features, 'departamento');
    elementos.fichaTerritorial.hidden = true;
    elementos.resumenSobrelinea.textContent = 'RESUMEN GENERAL';
    elementos.resumenTitulo.textContent = 'Información general';
    elementos.resumenDescripcion.textContent = 'CONSOLIDADO DE BENEFICIARIOS VALE FISE';
    elementos.volverTerritorio.hidden = true;
    elementos.panelResumen.classList.remove('territorio-seleccionado', 'beneficiario-seleccionado');
    elementos.ficha.hidden = true;
    elementos.fichaAgente.hidden = true;
    actualizarTablero();
    ajustarVistaCapa(5);
  }

  async function navegarDepartamento(feature) {
    enfocarTerritorio(feature, 6, 8);
    const geo = await cargarGeo('provincias', '../../geo/gadm41_PER_2.json');
    territorio.nivel = 'departamento';
    territorio.departamento = { id: feature.properties.GID_1, nombre: feature.properties.NAME_1, feature };
    territorio.provincia = null;
    territorio.distrito = null;
    const provincias = geo.features.filter(item => item.properties.GID_1 === feature.properties.GID_1);
    actualizarCapaTerritorial(provincias, 'provincia');
    actualizarTablero();
    mostrarPanelTerritorial('departamento', provincias);
    enfocarTerritorio(feature, 6, 8);
  }

  async function navegarProvincia(feature) {
    enfocarTerritorio(feature, 8, 11);
    const geo = await cargarGeo('distritos', '../../geo/peru_distritos_gadm41.json');
    territorio.nivel = 'provincia';
    territorio.provincia = { id: feature.properties.GID_2, nombre: feature.properties.NAME_2, feature };
    territorio.distrito = null;
    const distritos = geo.features.filter(item => item.properties.GID_2 === feature.properties.GID_2);
    actualizarCapaTerritorial(distritos, 'distrito');
    actualizarTablero();
    mostrarPanelTerritorial('provincia', distritos);
    enfocarTerritorio(feature, 8, 11);
  }

  function navegarDistrito(feature) {
    territorio.nivel = 'distrito';
    territorio.distrito = { id: feature.properties.GID_3, nombre: feature.properties.NAME_3, feature };
    actualizarCapaTerritorial([feature], 'distrito');
    actualizarTablero();
    mostrarPanelTerritorial('distrito', [feature]);
    enfocarTerritorio(feature, 11, 15);
  }

  function mostrarBeneficiario(item) {
    beneficiarioSeleccionado = item;
    seleccionExportacion = [item];
    elementos.detalleId.textContent = item.id;
    elementos.detalleNombre.textContent = item.nombre;
    elementos.detalleDni.textContent = item.dni;
    elementos.detalleSuministro.textContent = item.codigoSuministro;
    elementos.detalleEntidad.textContent = item.canal;
    elementos.detalleZona.textContent = item.zona;
    elementos.detalleDepartamento.textContent = item.departamento;
    elementos.detalleEstado.textContent = item.estado;
    elementos.detalleEstado.className = `estado-${item.estado.toLocaleLowerCase('es')}`;
    elementos.detalleFecha.textContent = item.fechaRegistro;
    elementos.detalleCoordenadas.textContent = `${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}`;
    elementos.ficha.hidden = false;
    elementos.fichaAgente.hidden = true;
    elementos.fichaTerritorial.hidden = true;
    elementos.fichaSeleccionMapa.hidden = true;
    elementos.panelResumen.classList.remove('territorio-seleccionado');
    elementos.panelResumen.classList.add('beneficiario-seleccionado');

    if (elementos.tablero.classList.contains('resumen-oculto')) {
      elementos.botonResumen.click();
    }
    elementos.panelResumen.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarAgente(agente) {
    beneficiarioSeleccionado = null;
    seleccionExportacion = [];
    elementos.agenteNombre.textContent = agente.nombre;
    elementos.agenteDireccion.textContent = agente.direccion;
    elementos.agenteDepartamento.textContent = agente.departamento;
    elementos.agenteProvincia.textContent = agente.provincia;
    elementos.agenteDistrito.textContent = agente.distrito;
    elementos.agenteLatitud.textContent = agente.lat.toFixed(5);
    elementos.agenteLongitud.textContent = agente.lng.toFixed(5);
    elementos.ficha.hidden = true;
    elementos.fichaTerritorial.hidden = true;
    elementos.fichaSeleccionMapa.hidden = true;
    elementos.fichaAgente.hidden = false;
    elementos.panelResumen.classList.remove('territorio-seleccionado');
    elementos.panelResumen.classList.add('beneficiario-seleccionado');
    if (elementos.tablero.classList.contains('resumen-oculto')) elementos.botonResumen.click();
    elementos.panelResumen.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function actualizarCapaAgentes() {
    if (!mapa || !capaAgentes) return;
    capaAgentes.clearLayers();
    const referencia = beneficiarioSeleccionado
      ? L.latLng(beneficiarioSeleccionado.lat, beneficiarioSeleccionado.lng)
      : mapa.getCenter();
    const cercanos = agentes
      .map(agente => ({ ...agente, distancia: referencia.distanceTo(L.latLng(agente.lat, agente.lng)) }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, beneficiarioSeleccionado ? 6 : agentes.length);
    cercanos.forEach(agente => {
      const icono = L.divIcon({ className: 'marker-agente-fise', html: '<span aria-hidden="true"></span>', iconSize: [38, 42], iconAnchor: [19, 40] });
      L.marker([agente.lat, agente.lng], { icon: icono })
        .bindTooltip(`${agente.nombre}${beneficiarioSeleccionado ? ` · ${(agente.distancia / 1000).toFixed(1)} km` : ''}`, { direction: 'top' })
        .on('click', () => mostrarAgente(agente))
        .addTo(capaAgentes);
    });
    elementos.contador.textContent = beneficiarioSeleccionado
      ? `${cercanos.length} agentes más cercanos a ${beneficiarioSeleccionado.nombre}`
      : `${cercanos.length} agentes de atención`;
  }

  function establecerCapaAgentes(activa) {
    if (!mapa || !capaAgentes) return;
    const controlesEstado = [...elementos.panelCapas.querySelectorAll('input[type="checkbox"][value]')];
    if (activa) {
      controlesEstado.forEach(control => { control.checked = false; estadosVisibles.delete(control.value); });
      if (mapa.hasLayer(grupoMarcadores)) mapa.removeLayer(grupoMarcadores);
      actualizarCapaAgentes();
      capaAgentes.addTo(mapa);
      if (capaAgentes.getLayers().length) mapa.fitBounds(capaAgentes.getBounds(), { padding: [35, 35], maxZoom: 10 });
    } else {
      if (mapa.hasLayer(capaAgentes)) mapa.removeLayer(capaAgentes);
      controlesEstado.forEach(control => { control.checked = true; estadosVisibles.add(control.value); });
      mapa.addLayer(grupoMarcadores);
      actualizarMapa(obtenerFiltrados(), false);
    }
    setTimeout(() => mapa.invalidateSize(), 40);
  }

  function mostrarSeleccionMapa(datos, tipo) {
    beneficiarioSeleccionado = null;
    seleccionExportacion = [...datos];
    elementos.ficha.hidden = true;
    elementos.fichaAgente.hidden = true;
    elementos.fichaTerritorial.hidden = true;
    elementos.fichaSeleccionMapa.hidden = false;
    elementos.tituloSeleccionMapa.textContent = tipo;
    elementos.resumenSeleccionMapa.textContent = `${datos.length} beneficiario${datos.length === 1 ? '' : 's'} seleccionado${datos.length === 1 ? '' : 's'}`;
    elementos.listaSeleccionMapa.replaceChildren();
    datos.forEach(item => {
      const fila=document.createElement('button'); fila.type='button';
      const nombre=document.createElement('span'); nombre.textContent=item.nombre;
      const codigo=document.createElement('small'); codigo.textContent=item.id;
      fila.append(nombre,codigo); fila.addEventListener('click',()=>mostrarBeneficiario(item)); elementos.listaSeleccionMapa.append(fila);
    });
    elementos.panelResumen.classList.remove('territorio-seleccionado');
    elementos.panelResumen.classList.add('beneficiario-seleccionado');
    if(elementos.tablero.classList.contains('resumen-oculto')) elementos.botonResumen.click();
    elementos.panelResumen.scrollTo({top:0,behavior:'smooth'});
  }

  function actualizarMapa(datos, ajustarVista = true) {
    if (!mapa || !grupoMarcadores) return;
    if (elementos.activarAgentes?.checked) {
      actualizarCapaAgentes();
      return;
    }
    grupoMarcadores.clearLayers();

    const datosVisibles = datos.filter(item => estadosVisibles.has(item.estado));
    datosVisibles.forEach(item => {
      const estado = normalizarTexto(item.estado).replace(/[^a-z0-9]+/g, '-');
      const icono = L.divIcon({
        className: `marker-fise marker-${estado}`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      const marcador = L.marker([item.lat, item.lng], { icon: icono, datos: item });
      marcador.bindTooltip(item.nombre, { direction: 'top', offset: [0, -8] });
      marcador.on('click', function (evento) {
        if (herramientaActiva === 'poligono' || herramientaActiva === 'circulo') {
          if (evento.originalEvent) L.DomEvent.stopPropagation(evento.originalEvent);
          manejarClickDibujo(evento);
          return;
        }
        if (herramientaActiva === 'seleccionar') {
          const mantener = Boolean(evento.originalEvent?.ctrlKey || evento.originalEvent?.metaKey);
          const actuales = mantener && !elementos.fichaSeleccionMapa.hidden
            ? [...elementos.listaSeleccionMapa.querySelectorAll('small')].map(nodo => registros.find(registro => registro.id === nodo.textContent)).filter(Boolean)
            : [];
          if (!actuales.some(registro => registro.id === item.id)) actuales.push(item);
          mostrarSeleccionMapa(actuales, 'Selección de beneficiarios');
          return;
        }
        mostrarBeneficiario(item);
      });
      grupoMarcadores.addLayer(marcador);
    });

    actualizarMapaCalor(datosVisibles);

    if (ajustarVista && grupoMarcadores.getLayers().length) {
      const limites = grupoMarcadores.getBounds();
      if (limites.isValid()) mapa.fitBounds(limites, { padding: [28, 28], maxZoom: 7 });
    }
    setTimeout(() => mapa.invalidateSize(), 50);
  }

  function actualizarMapaCalor(datos) {
    if (!mapa || !window.L?.heatLayer) return;
    if (capaCalor) mapa.removeLayer(capaCalor);
    capaCalor = L.heatLayer(datos.map(item => [item.lat, item.lng, 1]), {
      radius: 30,
      blur: 24,
      minOpacity: .32,
      maxZoom: 14,
      gradient: { .2: '#3e7ee8', .4: '#30c9bd', .62: '#f1d23d', .8: '#ed6b35', 1: '#c52f52' }
    });
    if (calorActivo) capaCalor.addTo(mapa);
  }

  function establecerMapaCalor(activo) {
    calorActivo = activo && Boolean(window.L?.heatLayer);
    if (!mapa || !grupoMarcadores) return;
    if (calorActivo) {
      if (mapa.hasLayer(grupoMarcadores)) mapa.removeLayer(grupoMarcadores);
      actualizarMapaCalor(obtenerFiltrados().filter(item => estadosVisibles.has(item.estado)));
    } else {
      if (capaCalor && mapa.hasLayer(capaCalor)) mapa.removeLayer(capaCalor);
      if (!mapa.hasLayer(grupoMarcadores)) mapa.addLayer(grupoMarcadores);
    }
  }

  function crearGraficoEvolucion(contenedor, meses, series, barras) {
    const ancho = 1000;
    const alto = 300;
    const margen = { x: 46, y: 28, abajo: 42 };
    const valores = series.flatMap(serie => serie.valores).concat(barras?.valores || []);
    const maximo = Math.max(...valores, 1) * 1.12;
    const paso = (ancho - margen.x * 2) / Math.max(meses.length - 1, 1);
    const x = indice => margen.x + indice * paso;
    const y = valor => alto - margen.abajo - (valor / maximo) * (alto - margen.y - margen.abajo);
    const rejilla = [0, .25, .5, .75, 1].map(p => `<line x1="${margen.x}" y1="${y(maximo * p)}" x2="${ancho - margen.x}" y2="${y(maximo * p)}"/>`).join('');
    const columnas = barras ? barras.valores.map((valor, i) => `<rect x="${x(i) - 18}" y="${y(valor)}" width="36" height="${alto - margen.abajo - y(valor)}" rx="5" fill="${barras.color}" opacity=".72"/><text x="${x(i)}" y="${y(valor) - 7}" text-anchor="middle">${formatoNumero.format(valor)}</text>`).join('') : '';
    const lineas = series.map(serie => {
      const puntos = serie.valores.map((valor, i) => `${x(i)},${y(valor)}`).join(' ');
      const nodos = serie.valores.map((valor, i) => `<circle cx="${x(i)}" cy="${y(valor)}" r="4" fill="${serie.color}"/><text x="${x(i)}" y="${y(valor) - 9}" text-anchor="middle" fill="${serie.color}">${formatoNumero.format(valor)}</text>`).join('');
      return `<polyline points="${puntos}" fill="none" stroke="${serie.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${nodos}`;
    }).join('');
    const etiquetas = meses.map((mes, i) => `<text x="${x(i)}" y="${alto - 13}" text-anchor="middle">${mes}</text>`).join('');
    const leyenda = [...(barras ? [barras] : []), ...series].map(item => `<span><i style="background:${item.color}"></i>${item.nombre}</span>`).join('');
    contenedor.innerHTML = `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Gráfico de evolución mensual"><g class="rejilla-svg">${rejilla}</g><g class="datos-svg">${columnas}${lineas}</g><g class="meses-svg">${etiquetas}</g></svg><div class="leyenda-svg">${leyenda}</div>`;
  }

  function crearBarrasResumen(contenedor, datos, color) {
    const maximo = Math.max(...datos.map(item => item.valor), 1);
    contenedor.innerHTML = datos.map(item => `<div><span>${item.nombre}</span><i><b style="width:${item.valor / maximo * 100}%;background:${color}"></b></i><strong>${formatoNumero.format(item.valor)}</strong></div>`).join('');
  }

  function actualizarAnalitica() {
    if (!elementos.analiticaEde) return;
    const datos = registros.filter(item =>
      (!elementos.analiticaEde.value || item.ede === elementos.analiticaEde.value) &&
      (!elementos.analiticaPeriodo.value || item.periodo === elementos.analiticaPeriodo.value)
    );
    const estados = sumarPor(datos, 'estado');
    elementos.analiticaActivos.textContent = formatoNumero.format(estados.Activo || 0);
    elementos.analiticaSuspendidos.textContent = formatoNumero.format(estados.Suspendido || 0);
    elementos.analiticaExcluidos.textContent = formatoNumero.format(estados.Excluido || 0);
    elementos.analiticaCobertura.textContent = `${Math.round(new Set(datos.map(item => item.departamento)).size / 26 * 100)}%`;
    crearDona(elementos.estadoAmpliado, estados, ['#39a875', '#e0a329', '#cf5c5c']);

    const mesesTodos = ['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','dic'];
    const mesSeleccionado = elementos.analiticaPeriodo.value ? Number(elementos.analiticaPeriodo.value.slice(-2)) - 1 : -1;
    const rango = mesSeleccionado >= 0 ? [mesSeleccionado, mesSeleccionado + 1] : [0, 12];
    const meses = mesesTodos.slice(...rango);
    const total = Math.max(datos.length, 1);
    const activos = estados.Activo || 0;
    const generar = (base, variaciones) => variaciones.slice(...rango).map((factor, i) => Math.max(1, Math.round(base * factor + i * base * .012)));
    crearGraficoEvolucion(elementos.graficoEvolucionBeneficiarios, meses, [
      { nombre: 'Beneficiarios activos', color: '#3c8fba', valores: generar(activos, [.72,.75,.78,.8,.82,.84,.87,.9,.92,.94,.97,1]) },
      { nombre: 'Vales canjeados', color: '#e5a51b', valores: generar(total * .58, [.9,.82,.76,.8,.88,.94,.85,.78,.83,.91,.96,.89]) }
    ], { nombre: 'Nuevos beneficiarios', color: '#8cb7dd', valores: generar(total * .11, [.7,.78,.74,.82,.9,.76,.8,.88,.92,.86,.94,1]) });
    crearGraficoEvolucion(elementos.graficoEvolucionVales, meses, [
      { nombre: 'Vales emitidos', color: '#596fd2', valores: generar(total * .92, [.92,.95,.94,.9,.87,.85,.88,.91,.95,.98,1,.99]) },
      { nombre: 'Vales canjeados', color: '#47a5c8', valores: generar(total * .78, [.88,.82,.8,.86,.91,.94,.9,.86,.84,.9,.96,1]) }
    ]);

    const costa = ['Lima','Callao','Ica','Arequipa','Moquegua','Tacna','Tumbes','Piura','Lambayeque','La Libertad','Áncash'];
    const selva = ['Loreto','Ucayali','Madre de Dios','San Martín','Amazonas'];
    const regiones = datos.reduce((r, item) => { const clave = costa.includes(item.departamento) ? 'Costa' : selva.includes(item.departamento) ? 'Selva' : 'Sierra'; r[clave]++; return r; }, { Costa: 0, Sierra: 0, Selva: 0 });
    crearBarrasResumen(elementos.analiticaRegiones, Object.entries(regiones).map(([nombre, valor]) => ({ nombre, valor })), 'linear-gradient(90deg,#7259d9,#9b72ea)');
    crearBarrasResumen(elementos.analiticaSuministro, [{ nombre: 'Con suministro', valor: Math.round(total * .78) }, { nombre: 'Sin suministro', valor: Math.round(total * .22) }], 'linear-gradient(90deg,#3979d7,#52b9e9)');
  }

  function actualizarTablero() {
    const datos = obtenerFiltrados();
    const total = totalBeneficiarios(datos);
    if (elementos.beneficiarios) elementos.beneficiarios.textContent = formatoNumero.format(total);
    if (elementos.registros) elementos.registros.textContent = formatoNumero.format(datos.length);
    if (elementos.departamentos) elementos.departamentos.textContent = formatoNumero.format(new Set(datos.map(item => item.departamento)).size);
    elementos.contador.textContent = `${formatoNumero.format(total)} beneficiarios · ${datos.length} marcadores`;
    crearBarras(elementos.canal, sumarPor(datos, 'canal'));
    crearDona(elementos.zona, sumarPor(datos, 'zona'), ['#52b9e9', '#355cdd']);
    crearDona(elementos.estado, sumarPor(datos, 'estado'), ['#52b9e9', '#3d64dc', '#f0a313']);
    actualizarAnalitica();
    actualizarMapa(datos);
  }

  const columnasExportacion = [
    ['ID','id'],['Período','periodo'],['Fecha de registro','fechaRegistro'],['Beneficiario','nombre'],
    ['DNI','dni'],['Código de suministro','codigoSuministro'],['Empresa distribuidora','ede'],
    ['Departamento','departamento'],['Provincia','provincia'],['Distrito','distrito'],
    ['Canal','canal'],['Zona','zona'],['Estado','estado'],['Latitud Y','lat'],['Longitud X','lng']
  ];

  function datosParaExportar() {
    const filtrados = obtenerFiltrados();
    if (!seleccionExportacion.length) return filtrados;
    const ids = new Set(seleccionExportacion.map(item => item.id));
    return filtrados.filter(item => ids.has(item.id));
  }

  function descripcionFiltrosExportacion() {
    const filtros = [
      elementos.periodo.value && `Período: ${elementos.periodo.options[elementos.periodo.selectedIndex].text}`,
      elementos.ede.value && `EDE: ${elementos.ede.value}`,
      elementos.departamento.value && `Departamento: ${elementos.departamento.value}`,
      elementos.provincia.value && `Provincia: ${elementos.provincia.value}`,
      elementos.distrito.value && `Distrito: ${elementos.distrito.value}`
    ].filter(Boolean);
    return filtros.length ? filtros.join(' · ') : 'Todos los filtros';
  }

  function abrirExportacion() {
    const datos = datosParaExportar();
    const alcance = seleccionExportacion.length === 1
      ? 'Registro seleccionado'
      : seleccionExportacion.length > 1 ? 'Selección realizada en el mapa' : 'Todos los registros filtrados';
    elementos.alcanceExportacion.textContent = alcance;
    elementos.cantidadExportacion.textContent = formatoNumero.format(datos.length);
    elementos.resumenExportacion.textContent = `${descripcionFiltrosExportacion()}. El archivo incluirá únicamente ${datos.length} registro${datos.length === 1 ? '' : 's'}.`;
    elementos.modalExportacion.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function cerrarExportacion() {
    elementos.modalExportacion.hidden = true;
    document.body.style.overflow = '';
  }

  function filasExportacion(datos) {
    return datos.map(item => Object.fromEntries(columnasExportacion.map(([titulo, clave]) => [titulo, item[clave] ?? ''])));
  }

  function descargarBlob(contenido, tipo, nombre) {
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    enlace.download = nombre;
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  }

  function exportarCsv(datos) {
    const encabezado = columnasExportacion.map(([titulo]) => titulo);
    const lineas = [encabezado, ...datos.map(item => columnasExportacion.map(([, clave]) => item[clave] ?? ''))]
      .map(fila => fila.map(valor => `"${String(valor).replaceAll('"','""')}"`).join(',')).join('\n');
    descargarBlob('\ufeff' + lineas, 'text/csv;charset=utf-8', 'reporte_vale_fise.csv');
  }

  function exportarXlsx(datos) {
    if (!window.XLSX) { exportarCsv(datos); return; }
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(filasExportacion(datos));
    hoja['!cols'] = columnasExportacion.map(([titulo]) => ({ wch: Math.max(14, titulo.length + 2) }));
    XLSX.utils.book_append_sheet(libro, hoja, 'Vale FISE');
    XLSX.writeFile(libro, 'reporte_vale_fise.xlsx');
  }

  function cargarImagenReporte(ruta) {
    return fetch(ruta).then(respuesta => respuesta.blob()).then(blob => new Promise(resolve => {
      const lector = new FileReader(); lector.onload = () => resolve(lector.result); lector.readAsDataURL(blob);
    }));
  }

  async function exportarPdf(datos) {
    if (!window.jspdf?.jsPDF) { window.print(); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
    try {
      const [fise,paulet] = await Promise.all([cargarImagenReporte('../../img/logo_fise.png'),cargarImagenReporte('../../img/logo_paulet.png')]);
      doc.addImage(fise,'PNG',15,8,18,18); doc.addImage(paulet,'PNG',43,8,30,18);
    } catch (_) {}
    doc.setDrawColor(44,158,198); doc.setLineWidth(1.2); doc.line(15,30,282,30);
    doc.setFontSize(17); doc.setTextColor(25,35,55); doc.text('VALE FISE · Reporte de selección',15,40);
    doc.setFontSize(9); doc.setTextColor(105,120,145); doc.text(descripcionFiltrosExportacion(),15,47);
    doc.autoTable({
      startY:53,
      head:[columnasExportacion.map(([titulo])=>titulo)],
      body:datos.map(item=>columnasExportacion.map(([,clave])=>item[clave]??'')),
      styles:{fontSize:5.8,cellPadding:1.5,overflow:'linebreak'},
      headStyles:{fillColor:[28,125,154],textColor:255},
      alternateRowStyles:{fillColor:[239,247,250]},
      margin:{left:10,right:10}
    });
    doc.save('reporte_vale_fise.pdf');
  }

  async function cargarDatos() {
    try {
      const respuesta = await fetch('datos_valefise.json');
      if (!respuesta.ok) throw new Error('No se pudo leer el archivo de datos');
      const datos = await respuesta.json();
      registros = datos.registros;
      if (elementos.fecha) elementos.fecha.textContent = '';
      llenarSelector(elementos.periodo, valoresUnicos(registros, 'periodo').reverse(), 'Todos los meses');
      mostrarMesesEnSelector(elementos.periodo);
      llenarSelector(elementos.ede, valoresUnicos(registros, 'ede'), 'Todas las EDE');
      llenarSelector(elementos.analiticaEde, valoresUnicos(registros, 'ede'), 'Todas las EDE');
      actualizarFiltrosGeograficos();
      iniciarMapa();
      await mostrarPais();
    } catch (error) {
      elementos.contador.textContent = 'No se pudieron cargar los datos';
      document.getElementById('mapaFise').innerHTML = `<div class="estado-vacio">${location.protocol === 'file:' ? 'Para leer el archivo JSON, abra el proyecto mediante un servidor local.' : 'Ocurrió un problema al cargar la información.'}</div>`;
      console.error(error);
    }
  }

  [elementos.periodo, elementos.ede, elementos.departamento, elementos.provincia, elementos.distrito].forEach(selector => {
    selector.addEventListener('change', function () {
      actualizarFiltrosGeograficos();
      actualizarTablero();
    });
  });

  elementos.busqueda.addEventListener('input', actualizarTablero);

  [elementos.analiticaEde, elementos.analiticaPeriodo].forEach(selector => selector.addEventListener('change', actualizarAnalitica));
  elementos.filtrosAnalitica.addEventListener('reset', function () { setTimeout(actualizarAnalitica); });

  elementos.formulario.addEventListener('reset', function () {
    setTimeout(async function () {
      seleccionExportacion = [];
      elementos.activarAgentes.checked = false;
      establecerCapaAgentes(false);
      beneficiarioSeleccionado = null;
      actualizarFiltrosGeograficos();
      await mostrarPais();
    });
  });

  elementos.botonFiltros.addEventListener('click', function () {
    const ocultar = !elementos.formulario.hidden;
    elementos.formulario.hidden = ocultar;
    elementos.contenedorFiltros.classList.toggle('colapsado', ocultar);
    elementos.seccionSatcontrol.classList.toggle('filtros-ocultos', ocultar);
    elementos.botonFiltros.setAttribute('aria-expanded', String(!ocultar));
    elementos.botonFiltros.setAttribute('aria-label', ocultar ? 'Mostrar filtros' : 'Ocultar filtros');
    setTimeout(function () {
      ajustarAlturaTablero();
    }, 180);
  });

  elementos.botonResumen.addEventListener('click', function () {
    const oculto = elementos.tablero.classList.toggle('resumen-oculto');
    elementos.botonResumen.setAttribute('aria-expanded', String(!oculto));
    elementos.botonResumen.setAttribute('aria-label', oculto ? 'Mostrar resumen' : 'Ocultar resumen');
    setTimeout(function () {
      if (mapa) mapa.invalidateSize();
    }, 300);
  });

  elementos.cerrarFicha.addEventListener('click', function () {
    seleccionExportacion = [];
    beneficiarioSeleccionado = null;
    elementos.ficha.hidden = true;
    elementos.panelResumen.classList.remove('beneficiario-seleccionado');
    if (territorio.nivel !== 'pais') mostrarPanelTerritorial(territorio.nivel, territorio.unidades);
    elementos.panelResumen.scrollTo({ top: 0, behavior: 'smooth' });
  });

  elementos.cerrarFichaAgente.addEventListener('click', function () {
    elementos.fichaAgente.hidden = true;
    elementos.panelResumen.classList.remove('beneficiario-seleccionado');
    if (territorio.nivel !== 'pais') mostrarPanelTerritorial(territorio.nivel, territorio.unidades);
    elementos.panelResumen.scrollTo({ top: 0, behavior: 'smooth' });
  });

  elementos.cerrarSeleccionMapa.addEventListener('click', function () {
    seleccionExportacion = [];
    elementos.fichaSeleccionMapa.hidden = true;
    elementos.panelResumen.classList.remove('beneficiario-seleccionado');
    if (territorio.nivel !== 'pais') mostrarPanelTerritorial(territorio.nivel, territorio.unidades);
  });

  function limpiarSeleccionMapaCompleta() {
    seleccionExportacion = [];
    beneficiarioSeleccionado = null;
    limpiarDibujo();
    elementos.fichaSeleccionMapa.hidden = true;
    elementos.panelResumen.classList.remove('beneficiario-seleccionado');
    if (territorio.nivel !== 'pais') mostrarPanelTerritorial(territorio.nivel, territorio.unidades);
    else elementos.panelResumen.scrollTo({top:0,behavior:'smooth'});
  }
  elementos.limpiarSeleccionMapa.addEventListener('click', limpiarSeleccionMapaCompleta);

  elementos.botonExportar.addEventListener('click', abrirExportacion);
  elementos.modalExportacion.querySelectorAll('[data-cerrar-exportacion]').forEach(boton => boton.addEventListener('click', cerrarExportacion));
  elementos.confirmarExportacion.addEventListener('click', async function () {
    const datos = datosParaExportar();
    const formato = document.querySelector('input[name="formatoExportacion"]:checked').value;
    elementos.confirmarExportacion.disabled = true;
    elementos.confirmarExportacion.textContent = 'Generando…';
    try {
      if (formato === 'csv') exportarCsv(datos);
      else if (formato === 'xlsx') exportarXlsx(datos);
      else await exportarPdf(datos);
      cerrarExportacion();
    } finally {
      elementos.confirmarExportacion.disabled = false;
      elementos.confirmarExportacion.textContent = 'Generar reporte';
    }
  });

  const eventosAlertas = {
    canjes: [
      { clase:'alerta-alta', texto:'Agente A-1042 superó 50 canjes/hora (63 canjes)', fecha:'Hoy 11:20' },
      { clase:'alerta-alta', texto:'Agente A-0871 registró 57 canjes en la última hora', fecha:'Hoy 09:42' }
    ],
    beneficiario: [
      { clase:'alerta-alta', texto:'DNI 45213674 con 2 canjes en menos de 30 días', fecha:'Ayer 16:05' },
      { clase:'alerta-alta', texto:'DNI 40728519 registra canjes consecutivos en 18 días', fecha:'22/07 14:30' }
    ],
    correo: [
      { clase:'alerta-info', texto:'Notificación mensual enviada a coordinadores', fecha:'01/07 08:00' },
      { clase:'alerta-info', texto:'Resumen de alertas remitido a supervisión regional', fecha:'30/06 17:45' }
    ]
  };

  function prepararHistorialAlertas() {
    const historial = document.getElementById('historialAlertas');
    historial.replaceChildren();

    const aviso = document.createElement('li');
    aviso.className = 'historial-alertas-vacio';
    aviso.dataset.avisoAlertas = '';
    aviso.hidden = true;
    aviso.innerHTML = '<strong>Reglas pausadas</strong><span>Se conserva el histórico completo. Activa una regla para filtrar sus eventos.</span>';
    historial.append(aviso);

    Object.entries(eventosAlertas).forEach(([regla, eventos]) => {
      eventos.forEach(evento => {
        const item = document.createElement('li');
        item.className = evento.clase;
        item.dataset.eventoAlerta = regla;
        const texto = document.createElement('strong'); texto.textContent = evento.texto;
        const fecha = document.createElement('time'); fecha.textContent = evento.fecha;
        item.append(texto, fecha);
        historial.append(item);
      });
    });
  }

  function actualizarHistorialAlertas() {
    const historial = document.getElementById('historialAlertas');
    const activas = new Set(
      [...document.querySelectorAll('[data-regla-alerta]:checked')]
        .map(control => control.dataset.reglaAlerta)
    );
    const mostrarTodo = activas.size === 0;
    historial.querySelector('[data-aviso-alertas]').hidden = !mostrarTodo;
    historial.querySelectorAll('[data-evento-alerta]').forEach(item => {
      item.hidden = !mostrarTodo && !activas.has(item.dataset.eventoAlerta);
    });
  }

  prepararHistorialAlertas();
  actualizarHistorialAlertas();
  document.querySelectorAll('[data-regla-alerta]').forEach(control => {
    control.addEventListener('change', function (evento) {
      evento.stopPropagation();
      actualizarHistorialAlertas();
      asegurarSeccionVisible();
    });
  });
  document.getElementById('limpiarAlertas').addEventListener('click', function () {
    const historial = document.getElementById('historialAlertas');
    historial.querySelectorAll('li').forEach(item => { item.hidden = true; });
    const aviso = historial.querySelector('[data-aviso-alertas]');
    aviso.innerHTML = '<strong>Historial limpiado</strong><span>Los nuevos eventos aparecerán cuando cambie una regla.</span>';
    aviso.hidden = false;
  });

  const botonMenuLateral = document.querySelector('[data-accion="alternar-menu"]');
  botonMenuLateral?.addEventListener('click', function () {
    setTimeout(function () {
      const secciones = [...document.querySelectorAll('[data-seccion-modulo]')];
      let activa = secciones.find(seccion => !seccion.hidden);
      if (!activa) {
        const idSolicitado = location.hash.slice(1);
        activa = secciones.find(seccion => seccion.id === idSolicitado) || document.getElementById('satcontrol');
        secciones.forEach(seccion => { seccion.hidden = seccion !== activa; });
      }
      const maximoScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      if (scrollY > maximoScroll) scrollTo({ top: maximoScroll, behavior: 'auto' });
      if (mapa && activa?.id === 'satcontrol') mapa.invalidateSize();
    }, 280);
  });

  function asegurarSeccionVisible() {
    const secciones = [...document.querySelectorAll('[data-seccion-modulo]')];
    if (!secciones.length || secciones.some(seccion => !seccion.hidden)) return;
    const solicitada = secciones.find(seccion => seccion.id === location.hash.slice(1));
    (solicitada || document.getElementById('satcontrol') || secciones[0]).hidden = false;
  }

  const observadorSecciones = new MutationObserver(asegurarSeccionVisible);
  document.querySelectorAll('[data-seccion-modulo]').forEach(seccion => {
    observadorSecciones.observe(seccion, { attributes: true, attributeFilter: ['hidden'] });
  });
  window.addEventListener('pageshow', asegurarSeccionVisible);

  document.addEventListener('seccionmodulo:cambio', function (evento) {
    const secciones = [...document.querySelectorAll('[data-seccion-modulo]')];
    const activa = secciones.find(seccion => seccion.id === evento.detail?.id) || document.getElementById('satcontrol');
    secciones.forEach(seccion => { seccion.hidden = seccion !== activa; });
    elementos.barraHerramientas.hidden = activa.id !== 'satcontrol';
    if (activa.id !== 'satcontrol') {
      elementos.grupoHerramientas.hidden = true;
      elementos.abrirHerramientas.setAttribute('aria-expanded', 'false');
    }
    scrollTo({ top: 0, behavior: 'auto' });
    if (mapa && activa.id === 'satcontrol') setTimeout(() => mapa.invalidateSize(), 60);
  });

  function puntoDentroPoligono(item, puntos) {
    let dentro=false; const x=item.lng; const y=item.lat;
    for(let i=0,j=puntos.length-1;i<puntos.length;j=i++){
      const xi=puntos[i].lng, yi=puntos[i].lat, xj=puntos[j].lng, yj=puntos[j].lat;
      if((yi>y)!==(yj>y) && x<((xj-xi)*(y-yi))/(yj-yi)+xi) dentro=!dentro;
    }
    return dentro;
  }

  function limpiarDibujo() {
    if(cuadroAnimacionCirculo){cancelAnimationFrame(cuadroAnimacionCirculo);cuadroAnimacionCirculo=0;}
    puntosDibujo=[]; centroCirculo=null; figuraTemporal=null;
    if(capaDibujo) capaDibujo.clearLayers();
  }

  function activarHerramienta(nombre, boton) {
    if(nombre==='ampliar'){elementos.barraHerramientas.classList.toggle('ampliada');return;}
    if(nombre==='mover'){elementos.barraHerramientas.classList.add('movible');boton.classList.add('activo');return;}
    if(nombre==='opciones') return;
    const desactivar=herramientaActiva===nombre;
    herramientaActiva=desactivar?null:nombre;
    elementos.grupoHerramientas.querySelectorAll('[data-herramienta]').forEach(item=>{if(!['ampliar','mover'].includes(item.dataset.herramienta))item.classList.toggle('activo',item.dataset.herramienta===herramientaActiva);});
    limpiarDibujo();
    if(mapa){
      const dibujando=herramientaActiva==='poligono'||herramientaActiva==='circulo';
      dibujando?mapa.doubleClickZoom.disable():mapa.doubleClickZoom.enable();
      mapa.getContainer().classList.toggle('modo-dibujo-fise',dibujando);
      mapa.getContainer().style.cursor=dibujando?'crosshair':'';
    }
  }

  function manejarClickDibujo(evento) {
    if(herramientaActiva==='poligono'){
      if(cuadroAnimacionCirculo){cancelAnimationFrame(cuadroAnimacionCirculo);cuadroAnimacionCirculo=0;}
      const ultimo=puntosDibujo[puntosDibujo.length-1];
      if(ultimo&&mapa.distance(ultimo,evento.latlng)<5)return;
      puntosDibujo.push(evento.latlng);
      if(figuraTemporal) figuraTemporal.setLatLngs(puntosDibujo);
      else figuraTemporal=L.polyline(puntosDibujo,{color:'#d98b24',weight:3,lineCap:'round',lineJoin:'round'}).addTo(capaDibujo);
    } else if(herramientaActiva==='circulo'&&!centroCirculo){
      centroCirculo=evento.latlng;
      figuraTemporal=L.circle(centroCirculo,{radius:50,color:'#7657c7',fillColor:'#9a7de0',fillOpacity:.16,weight:3}).addTo(capaDibujo);
    }
  }

  function manejarMovimientoDibujo(evento){
    if(herramientaActiva==='poligono'&&puntosDibujo.length&&figuraTemporal){
      if(cuadroAnimacionCirculo)cancelAnimationFrame(cuadroAnimacionCirculo);
      const posicion=evento.latlng;
      cuadroAnimacionCirculo=requestAnimationFrame(()=>{if(figuraTemporal&&puntosDibujo.length)figuraTemporal.setLatLngs([...puntosDibujo,posicion]);cuadroAnimacionCirculo=0;});
      return;
    }
    if(herramientaActiva!=='circulo'||!centroCirculo||!figuraTemporal)return;
    if(cuadroAnimacionCirculo)cancelAnimationFrame(cuadroAnimacionCirculo);
    const posicion=evento.latlng;
    cuadroAnimacionCirculo=requestAnimationFrame(()=>{if(figuraTemporal&&centroCirculo)figuraTemporal.setRadius(mapa.distance(centroCirculo,posicion));cuadroAnimacionCirculo=0;});
  }

  function cerrarDibujo(evento){
    if(herramientaActiva==='poligono'&&puntosDibujo.length>=3){
      capaDibujo.clearLayers(); L.polygon(puntosDibujo,{color:'#d98b24',fillColor:'#f2ad50',fillOpacity:.18,weight:3}).addTo(capaDibujo);
      mostrarSeleccionMapa(obtenerFiltrados().filter(item=>puntoDentroPoligono(item,puntosDibujo)),'Selección por polígono');
      puntosDibujo=[]; figuraTemporal=null;
    } else if(herramientaActiva==='circulo'&&centroCirculo){
      const radio=mapa.distance(centroCirculo,evento.latlng); figuraTemporal.setRadius(radio);
      mostrarSeleccionMapa(obtenerFiltrados().filter(item=>mapa.distance(centroCirculo,L.latLng(item.lat,item.lng))<=radio),'Selección por círculo');
      centroCirculo=null; figuraTemporal=null;
    }
    if(evento.originalEvent)L.DomEvent.stopPropagation(evento.originalEvent);
  }

  elementos.abrirHerramientas.addEventListener('click',function(){const abrir=elementos.grupoHerramientas.hidden;elementos.grupoHerramientas.hidden=!abrir;elementos.abrirHerramientas.setAttribute('aria-expanded',String(abrir));});
  elementos.grupoHerramientas.querySelectorAll('[data-herramienta]').forEach(boton=>boton.addEventListener('click',()=>activarHerramienta(boton.dataset.herramienta,boton)));
  document.addEventListener('mapafise:listo',function(){ mapa.on('click',manejarClickDibujo); mapa.on('mousemove',manejarMovimientoDibujo); mapa.on('dblclick',cerrarDibujo); });

  let arrastre=null;
  const moverPanelHerramientas=evento=>{
    if(!arrastre)return;
    const panel=elementos.grupoHerramientas;
    panel.style.setProperty('left',`${Math.max(0,Math.min(innerWidth-panel.offsetWidth,evento.clientX-arrastre.x))}px`,'important');
    panel.style.setProperty('top',`${Math.max(0,Math.min(innerHeight-panel.offsetHeight,evento.clientY-arrastre.y))}px`,'important');
  };
  const finalizarArrastreHerramientas=()=>{arrastre=null;window.removeEventListener('pointermove',moverPanelHerramientas);window.removeEventListener('pointerup',finalizarArrastreHerramientas);};
  elementos.grupoHerramientas.addEventListener('pointerdown',function(evento){
    if(!elementos.barraHerramientas.classList.contains('movible'))return;
    const panel=elementos.grupoHerramientas,rect=panel.getBoundingClientRect();
    panel.style.setProperty('position','fixed','important');
    panel.style.setProperty('right','auto','important');
    panel.style.setProperty('left',`${rect.left}px`,'important');
    panel.style.setProperty('top',`${rect.top}px`,'important');
    arrastre={x:evento.clientX-rect.left,y:evento.clientY-rect.top};
    window.addEventListener('pointermove',moverPanelHerramientas);
    window.addEventListener('pointerup',finalizarArrastreHerramientas);
  });

  elementos.volverTerritorio.addEventListener('click', async function () {
    if (territorio.nivel === 'distrito' && territorio.provincia?.feature) {
      await navegarProvincia(territorio.provincia.feature);
      return;
    }
    if (territorio.nivel === 'provincia' && territorio.departamento?.feature) {
      await navegarDepartamento(territorio.departamento.feature);
      return;
    }
    await mostrarPais();
  });

  function cerrarPanelesMapa(excepto) {
    [[elementos.panelMapas, elementos.botonMapas], [elementos.panelCapas, elementos.botonCapas], [elementos.panelTematicos, elementos.botonTematicos]].forEach(([panel, boton]) => {
      if (panel !== excepto) {
        panel.hidden = true;
        boton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function alternarPanelMapa(panel, boton) {
    const abrir = panel.hidden;
    cerrarPanelesMapa(panel);
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
  }

  elementos.botonMapas.addEventListener('click', () => alternarPanelMapa(elementos.panelMapas, elementos.botonMapas));
  elementos.botonCapas.addEventListener('click', () => alternarPanelMapa(elementos.panelCapas, elementos.botonCapas));
  elementos.botonTematicos.addEventListener('click', () => alternarPanelMapa(elementos.panelTematicos, elementos.botonTematicos));

  elementos.panelMapas.addEventListener('change', function (evento) {
    if (!evento.target.matches('input[name="mapaBase"]') || !mapa) return;
    if (capaBaseActual) mapa.removeLayer(capaBaseActual);
    capaBaseActual = capasBase[evento.target.value];
    capaBaseActual.addTo(mapa);
    capaBaseActual.bringToBack();
  });

  elementos.panelCapas.addEventListener('change', function (evento) {
    if (!evento.target.matches('input[type="checkbox"]')) return;
    if (evento.target === elementos.activarAgentes) {
      establecerCapaAgentes(evento.target.checked);
      return;
    }
    if (elementos.activarAgentes.checked) {
      elementos.activarAgentes.checked = false;
      establecerCapaAgentes(false);
    }
    if (evento.target.checked) estadosVisibles.add(evento.target.value);
    else estadosVisibles.delete(evento.target.value);
    actualizarMapa(obtenerFiltrados(), false);
    const visibles = grupoMarcadores?.getLayers().length || 0;
    elementos.contador.textContent = `${formatoNumero.format(visibles)} beneficiarios visibles · ${visibles} marcadores`;
  });

  elementos.activarCalor.addEventListener('change', function () {
    establecerMapaCalor(elementos.activarCalor.checked);
  });

  document.addEventListener('click', function (evento) {
    if (!evento.target.closest('.controles-mapa, .panel-control-mapa')) cerrarPanelesMapa();
  });

  function mostrarPasoAlerta(paso) {
    const primero = paso === 1;
    elementos.pasoAlerta1.hidden = !primero;
    elementos.pasoAlerta2.hidden = primero;
    elementos.tituloModalAlerta.textContent = `Generar alerta · Paso ${paso} de 2`;
    elementos.descripcionModalAlerta.textContent = primero
      ? 'Configure la cantidad de vales y el rango de vigencia de la alerta.'
      : 'Seleccione los canales de notificación.';
  }

  function cerrarModalAlerta() {
    elementos.modalAlerta.hidden = true;
    document.body.classList.remove('modal-abierto');
  }

  elementos.botonGenerarAlertas.addEventListener('click', function () {
    mostrarPasoAlerta(1);
    elementos.modalAlerta.hidden = false;
    document.body.classList.add('modal-abierto');
    document.getElementById('alertaMinimo').focus();
  });

  elementos.modalAlerta.querySelectorAll('[data-cerrar-alerta]').forEach(boton => boton.addEventListener('click', cerrarModalAlerta));

  elementos.siguienteAlerta.addEventListener('click', function () {
    const minimo = document.getElementById('alertaMinimo');
    const maximo = document.getElementById('alertaMaximo');
    const desde = document.getElementById('alertaDesde');
    const hasta = document.getElementById('alertaHasta');
    if (![minimo, maximo, desde, hasta].every(campo => campo.reportValidity())) return;
    if (Number(minimo.value) > Number(maximo.value)) {
      maximo.setCustomValidity('El máximo debe ser mayor o igual al mínimo.');
      maximo.reportValidity();
      maximo.setCustomValidity('');
      return;
    }
    mostrarPasoAlerta(2);
  });

  elementos.volverAlerta.addEventListener('click', () => mostrarPasoAlerta(1));

  elementos.formularioAlerta.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const canales = elementos.formularioAlerta.querySelectorAll('input[name="canalAlerta"]:checked');
    if (!canales.length) {
      elementos.formularioAlerta.querySelector('input[name="canalAlerta"]').setCustomValidity('Seleccione al menos un canal.');
      elementos.formularioAlerta.querySelector('input[name="canalAlerta"]').reportValidity();
      elementos.formularioAlerta.querySelector('input[name="canalAlerta"]').setCustomValidity('');
      return;
    }
    cerrarModalAlerta();
    elementos.mensajeAlerta.hidden = false;
    setTimeout(() => { elementos.mensajeAlerta.hidden = true; }, 2800);
  });

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && !elementos.modalAlerta.hidden) cerrarModalAlerta();
  });


  document.addEventListener('seccionmodulo:cambio', function (evento) {
    if (evento.detail.id === 'satcontrol' && mapa) {
      setTimeout(function () {
        mapa.invalidateSize();
        const limites = grupoMarcadores?.getBounds();
        if (limites?.isValid()) mapa.fitBounds(limites, { padding: [28, 28], maxZoom: 7 });
      }, 80);
    }
  });

  cargarDatos();
})();
