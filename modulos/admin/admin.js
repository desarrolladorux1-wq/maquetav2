(function () {
  'use strict';

  const PERFILES = [
    'Administrador de Plataforma - Nodo FISE',
    'FISE TIC / Auditor',
    'Coordinador de Programa',
    'Supervisor de Campo',
    'Analista FISE',
    'Operador Mesa de Ayuda',
    'Beneficiario',
    'Concesionaria / Instaladora / Taller',
    'Servicio IA'
  ];
  const REGIONES_USUARIO = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao',
    'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque',
    'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno',
    'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
  ];
  const ICONOS_MODULO = {
    'vale-fise': 'VF', 'ahorro-gnv': 'GNV', 'fotovoltaico': 'FV',
    'electricidad-al-toque': 'EAT', 'masificacion': 'MG', 'mcter': 'MC', 'bonogas': 'BG'
  };
  const SECCIONES_MODULO = {
    'vale-fise': [
      { id: 'satcontrol', nombre: 'SATCONTROL', icono: 'mapa' },
      { id: 'graficas', nombre: 'Gráficas', icono: 'graficas' }
    ],
    'ahorro-gnv': [
      { id: 'satcontrol', nombre: 'SATCONTROL', icono: 'mapa' },
      { id: 'graficas', nombre: 'Gráficas', icono: 'graficas' }
    ],
    'bonogas': [
      { id: 'satcontrol', nombre: 'SATCONTROL', icono: 'mapa' },
      { id: 'validacion', nombre: 'Validaciones', icono: 'validacion' },
      { id: 'solicitudes', nombre: 'Solicitudes', icono: 'solicitudes' }
    ]
  };
  const TITULOS_VISTA = {
    inicio: ['Administración de Plataforma', 'Control centralizado de proyectos, módulos, información geográfica y usuarios.'],
    proyectos: ['Proyectos', 'Estructura transversal para organizar programas, módulos y equipos responsables.'],
    satcontrol: ['SATCONTROL centralizado', ''],
    modulo: ['SATCONTROL del módulo', 'Vista operativa integrada sin abandonar el entorno de Administración.'],
    usuarios: ['Administración de Usuarios', 'Creación, búsqueda, perfiles y control del estado de las cuentas.']
  };
  const CAPAS_POR_MODULO = {
    'vale-fise': [
      { grupo: 'Beneficiarios', items: ['Activos', 'Suspendidos', 'Excluidos'] },
      { grupo: 'Agentes de atención', items: ['Agentes más cercanos'] }
    ],
    'ahorro-gnv': [
      { grupo: 'Capas de conversiones', items: ['Liquidadas', 'Certificadas', 'En proceso'] }
    ],
    fotovoltaico: [
      { grupo: 'Sistemas', items: ['Mostrar operativos', 'Mostrar observados', 'Mostrar inactivos'] }
    ],
    'electricidad-al-toque': [
      { grupo: 'Sistemas', items: ['Mostrar operativos', 'Mostrar observados', 'Mostrar inactivos'] },
      { grupo: 'Capas de intervención', items: ['Capa beneficiarios', 'Capa de hogares sin electricidad', 'Mapa de concesiones'] }
    ],
    masificacion: [
      { grupo: 'Estado de los proyectos', items: ['Red proyectada', 'Red en ejecución', 'Red instalada'] },
      { grupo: 'Beneficiarios potenciales', items: ['Manzanas abastecidas', 'Unidades prediales', 'Áreas de influencia', 'Capas GIS cargadas'] },
      { grupo: 'Capas superpuestas del proyecto', items: ['Estrato / lotes', 'Beneficiarios', 'Cobertura referencial', 'Troncal principal', 'Ramales secundarios', 'Redes por concesionaria'] }
    ],
    mcter: [
      { grupo: 'Capas de beneficiarios', items: ['Beneficiarios compensados', 'Pendientes de compensación', 'Beneficiarios suspendidos'] }
    ],
    bonogas: [
      { grupo: 'Capas superpuestas', items: ['Estrato / lotes'] },
      { grupo: 'Suministros habilitados', items: ['Habilitados - Liquidados', 'Habilitados - Pendientes de liquidación', 'En Construcción - Dentro de Plazo', 'En Construcción - Fuera de Plazo'] },
      { grupo: 'Infraestructura y cobertura FISE', items: ['Redes troncales', 'Redes residenciales', 'Manzanas FISE'] }
    ]
  };
  const TEMATICOS_POR_MODULO = {
    'vale-fise': [
      { grupo: 'Focalización geográfica', items: [{ nombre: 'Densidad por distrito', descripcion: 'Beneficiarios del padrón vigente' }] }
    ],
    'ahorro-gnv': [
      { grupo: 'Consumo y geografía', items: [{ nombre: 'Densidad de recargas', descripcion: 'Consumo semanal por ciudad y región' }] }
    ],
    fotovoltaico: [
      { grupo: 'Inventario y control geográfico', items: [
        { nombre: 'Densidad de sistemas fotovoltaicos', descripcion: 'Concentración territorial de sistemas registrados' },
        { nombre: 'Sistemas inoperativos', descripcion: 'Zonas con mayor presencia de equipos inactivos' }
      ] }
    ],
    'electricidad-al-toque': [
      { grupo: 'Cobertura operativa', items: [
        { nombre: 'Densidad de sistemas', descripcion: 'Concentración de sistemas Electricidad al Toque' },
        { nombre: 'Hogares sin electricidad', descripcion: 'Prioridad territorial de hogares identificados' }
      ] }
    ],
    masificacion: [
      { grupo: 'Vista temática', items: [
        { nombre: 'Avance por estado', descripcion: 'Red proyectada, en ejecución e instalada' },
        { nombre: 'Proyectos por ciudad', descripcion: 'Distribución y avance territorial de proyectos' },
        { nombre: 'Beneficiarios potenciales', descripcion: 'Cruce espacial con predios y manzanas abastecidas' },
        { nombre: 'Áreas de influencia', descripcion: 'Cobertura referencial de las redes financiadas' }
      ] }
    ],
    mcter: [
      { grupo: 'Compensación tarifaria', items: [{ nombre: 'Densidad de suministros compensados', descripcion: 'Cobertura regional, provincial y distrital' }] }
    ],
    bonogas: [
      { grupo: 'Mapas de calor', items: [
        { nombre: 'Recaudación y morosidad', descripcion: 'Deuda acumulada por distrito' },
        { nombre: 'Cobertura y beneficiarios', descripcion: 'Densidad de suministros conectados' },
        { nombre: 'Zonas críticas', descripcion: 'Prioridad de cobranza por manzana' }
      ] }
    ]
  };
  const HERRAMIENTAS_COMUNES_ADMIN = [
    { grupo: 'Selección y análisis', items: [
      { id: 'consultar', icono: '⌖', nombre: 'Seleccionar registro', detalle: 'Consultar un punto del mapa' },
      { id: 'poligono', icono: '⬡', nombre: 'Selección por polígono', detalle: 'Delimitar un área con vértices' },
      { id: 'circulo', icono: '○', nombre: 'Selección por círculo', detalle: 'Analizar registros dentro de un radio' },
      { id: 'distancia', icono: '↔', nombre: 'Medir distancia', detalle: 'Trazar dos o más puntos' },
      { id: 'area', icono: '◇', nombre: 'Medir área', detalle: 'Calcular una superficie dibujada' }
    ] },
    { grupo: 'Visualización', items: [
      { id: 'capas', icono: '▱', nombre: 'Capas', detalle: 'Configurar información visible' },
      { id: 'cluster', icono: '◉', nombre: 'Clusterización', detalle: 'Agrupar o separar registros' },
      { id: 'calor', icono: '◌', nombre: 'Mapa de calor', detalle: 'Mostrar densidad geográfica' },
      { id: 'puntos', icono: '⌾', nombre: 'Mostrar puntos', detalle: 'Alternar registros visibles' }
    ] },
    { grupo: 'Información y exportación', items: [
      { id: 'detalle', icono: 'ⓘ', nombre: 'Ver detalle', detalle: 'Abrir el último registro' },
      { id: 'modulo', icono: '▤', nombre: 'Información del módulo', detalle: 'Resumen del filtro activo' },
      { exportar: 'pdf', icono: 'PDF', nombre: 'Exportar PDF', detalle: 'Informe listo para impresión' },
      { exportar: 'csv', icono: 'CSV', nombre: 'Exportar CSV', detalle: 'Datos tabulares compatibles' },
      { exportar: 'xlsx', icono: 'XLS', nombre: 'Exportar XLSX', detalle: 'Libro compatible con Excel' }
    ] }
  ];
  // Solo contiene acciones ubicadas realmente dentro del carrusel
  // "Herramientas" de cada módulo. Los botones del panel derecho, capas,
  // reportes y tarjetas conservan sus accesos originales fuera de este panel.
  const HERRAMIENTAS_ESPECIALES_ADMIN = {
    'vale-fise': [],
    'ahorro-gnv': [
      { id: 'ia-gnv', icono: 'IA', nombre: 'Validación documental IA', detalle: 'Revisar DNI, TIV, firmas y alteraciones' },
      { id: 'liquidaciones-gnv', icono: 'S/', nombre: 'Liquidaciones y firma', detalle: 'Firma digital individual o por lotes' },
      { id: 'informes-gnv', icono: 'DOC', nombre: 'Informes digitales', detalle: 'Generar plantillas legales y PDF inalterable' }
    ],
    fotovoltaico: [
      { id: 'dger-fotovoltaico', icono: 'XL', nombre: 'Procesamiento DGER', detalle: 'Morosidad, IGV, cargos RER y reporte técnico' },
      { id: 'nuevo-fotovoltaico', icono: '+', nombre: 'Nuevo punto fotovoltaico', detalle: 'Capturar coordenadas y ficha técnica' }
    ],
    'electricidad-al-toque': [
      { id: 'ficef-eat', icono: '✓', nombre: 'Validar Anexo 4 · FICEF', detalle: 'Cruzar suministros, coordenadas e inconsistencias' },
      { id: 'nuevo-eat', icono: '+', nombre: 'Nuevo punto EAT', detalle: 'Registrar punto y enviarlo a supervisión' }
    ],
    masificacion: [
      { id: 'liquidaciones-masificacion', icono: 'VNR', nombre: 'Liquidaciones', detalle: 'Vincular partidas Excel con objetos GIS' },
      { id: 'informes-masificacion', icono: 'DOC', nombre: 'Informes técnicos', detalle: 'Generar documentos Word y PDF' }
    ],
    mcter: [
      { id: 'dger-mcter', icono: 'XL', nombre: 'Procesamiento DGER', detalle: 'Procesar resoluciones y cargos RER' },
      { id: 'nuevo-mcter', icono: '+', nombre: 'Nuevo punto MCTER', detalle: 'Registrar ficha técnica para supervisión' }
    ],
    bonogas: [
      { id: 'ia-bonogas', icono: 'IA', nombre: 'Validación inteligente', detalle: 'Revisar documentos y fotografías con IA' },
      { id: 'liquidaciones-bonogas', icono: 'S/', nombre: 'Liquidaciones BonoGas', detalle: 'Calcular liquidación y orden de pago' }
    ]
  };
  const PORTALES_HERRAMIENTAS_ADMIN = {
    'alertas-vale-fise': {
      ruta: '../vale-fise/valefise.html?adminPortal=1',
      abrir: '#botonGenerarAlertas',
      objetivo: '#modalAlerta'
    },
    'canjes-vale-fise': {
      ruta: '../vale-fise/valefise.html?adminPortal=1',
      objetivo: '#reporteCanjes',
      fragmento: true
    },
    'ia-gnv': {
      ruta: '../AHORRO%20GNV/ahorro-gnv.html?adminPortal=1',
      abrir: '[data-herramienta-gnv="validacion-ia"]',
      objetivo: '#modalValidacionIaGnv'
    },
    'liquidaciones-gnv': {
      ruta: '../AHORRO%20GNV/ahorro-gnv.html?adminPortal=1',
      abrir: '[data-herramienta-gnv="liquidaciones"]',
      objetivo: '#modalLiquidacionesGnv'
    },
    'informes-gnv': {
      ruta: '../AHORRO%20GNV/ahorro-gnv.html?adminPortal=1',
      abrir: '[data-herramienta-gnv="informes-digitales"]',
      objetivo: '#modalInformesDigitalesGnv'
    },
    'morosidad-gnv': {
      ruta: '../AHORRO%20GNV/ahorro-gnv.html?adminPortal=1',
      abrir: '#abrirMorosidadGnv',
      objetivo: '#modalMorosidadGnv'
    },
    'dger-fotovoltaico': {
      ruta: '../FOTOVOLTAICO/fotovoltaico.html?adminPortal=1',
      abrir: '[data-tool="ficef"]',
      objetivo: '#modalHerramientaEat'
    },
    'ubicaciones-fotovoltaico': {
      ruta: '../FOTOVOLTAICO/fotovoltaico.html?adminPortal=1',
      objetivo: '.historial-ubicaciones-fotovoltaico',
      fragmento: true
    },
    'ficef-eat': {
      ruta: '../ELECTRICIDAD%20AL%20TOQUE/electricidad-al-toque.html?adminPortal=1',
      abrir: '[data-tool="ficef"]',
      objetivo: '#modalHerramientaEat'
    },
    'expediente-eat': {
      ruta: '../ELECTRICIDAD%20AL%20TOQUE/electricidad-al-toque.html?adminPortal=1',
      abrir: '#abrirExpedienteEat',
      objetivo: '#modalExpedienteEat'
    },
    'subir-gis': {
      ruta: '../MASIFICACION/masificacion.html?adminPortal=1',
      abrir: '#botonSubir',
      objetivo: '#modalSubirCapa'
    },
    'beneficiarios-potenciales': {
      ruta: '../MASIFICACION/masificacion.html?adminPortal=1',
      abrir: '#abrirPotencial',
      objetivo: '#modalPotencial'
    },
    'liquidaciones-masificacion': {
      ruta: '../MASIFICACION/masificacion.html?adminPortal=1',
      abrir: '[data-herramienta="liquidaciones"]',
      objetivo: '#modalLiquidaciones'
    },
    'informes-masificacion': {
      ruta: '../MASIFICACION/masificacion.html?adminPortal=1',
      abrir: '[data-herramienta="informes"]',
      objetivo: '#modalInformes'
    },
    'trazabilidad-masificacion': {
      ruta: '../MASIFICACION/masificacion.html?adminPortal=1',
      abrir: '[data-herramienta="liquidaciones"]',
      objetivo: '#modalLiquidaciones',
      despues: '[data-tab-liquidacion="trazabilidad"]'
    },
    'dger-mcter': {
      ruta: '../MCTER/mcter.html?adminPortal=1',
      abrir: '[data-tool="dger"]',
      objetivo: '#modalProcesoMcter'
    },
    'resoluciones-mcter': {
      ruta: '../MCTER/mcter.html?adminPortal=1',
      abrir: '[data-tool="dger"]',
      objetivo: '#modalProcesoMcter'
    },
    'ia-bonogas': {
      ruta: '../BONOGAS/bonogas.html?adminPortal=1',
      abrir: '[data-tool="validacion-ia"]',
      objetivo: '#modalValidacionIA'
    },
    'liquidaciones-bonogas': {
      ruta: '../BONOGAS/bonogas.html?adminPortal=1',
      abrir: '[data-tool="liquidaciones"]',
      objetivo: '#modalLiquidacionesBonogas'
    },
    'plazos-bonogas': {
      ruta: '../BONOGAS/bonogas.html?adminPortal=1',
      abrir: '#abrirReporte259',
      objetivo: '#modalReporte259'
    },
    'ranking-bonogas': {
      ruta: '../BONOGAS/bonogas.html?adminPortal=1',
      objetivo: '#modalRankingEmpresas',
      preparar: 'ranking-bonogas'
    }
  };
  const FUENTES_GEOGRAFICAS_MODULO = {
    'vale-fise': '../vale-fise/datos_valefise.json',
    'ahorro-gnv': '../AHORRO%20GNV/datos_ahorro_gnv.json',
    mcter: '../MCTER/datos_mcter.json',
    bonogas: '../BONOGAS/datos_bonogas.json'
  };
  const UBICACIONES_PROYECTO = {
    Amazonas: {
      Chachapoyas: ['Chachapoyas', 'Asunción', 'Balsas', 'Cheto', 'Huancas', 'La Jalca', 'Levanto'],
      Bagua: ['Bagua', 'Aramango', 'Copallín', 'El Parco', 'Imaza', 'La Peca'],
      Bongará: ['Jumbilla', 'Chisquilla', 'Florida', 'Jazán', 'Recta', 'Shipasbamba'],
      Utcubamba: ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande']
    },
    Arequipa: {
      Arequipa: ['Arequipa', 'Cerro Colorado', 'José Luis Bustamante y Rivero', 'Paucarpata', 'Yanahuara'],
      Camaná: ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Nicolás de Piérola'],
      Caravelí: ['Caravelí', 'Acarí', 'Atico', 'Bella Unión', 'Chala']
    },
    Lima: {
      Lima: ['Lima', 'Ate', 'Comas', 'Los Olivos', 'San Juan de Lurigancho', 'Villa El Salvador'],
      Cañete: ['San Vicente de Cañete', 'Asia', 'Chilca', 'Imperial', 'Mala'],
      Huaral: ['Huaral', 'Aucallama', 'Chancay']
    },
    Cusco: {
      Cusco: ['Cusco', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Wanchaq'],
      'La Convención': ['Santa Ana', 'Echarate', 'Kimbiri', 'Quellouno'],
      Urubamba: ['Urubamba', 'Chinchero', 'Machupicchu', 'Ollantaytambo']
    }
  };

  const estado = {
    datos: null,
    vista: 'inicio',
    usuarios: [],
    usuariosFiltrados: [],
    paginaUsuarios: 1,
    porPagina: 6,
    paginaProyectos: 1,
    porPaginaProyectos: 6,
    busquedaProyectos: '',
    ordenUsuarios: { campo: 'nombres', direccion: 1 },
    mapa: null,
    capaBase: null,
    capasBase: {},
    grupoClusters: null,
    gruposClustersModulo: new Map(),
    gruposPuntosModulo: new Map(),
    capasModuloActivas: new Set(),
    capasDetalleActivas: new Map(),
    tematicoActivo: null,
    grupoPuntos: null,
    capaCalor: null,
    capaAnalisis: null,
    capaMalla: null,
    capaLimitesGeograficos: null,
    nivelGeografico: 'departamento',
    seleccionGeografica: { departamento: '', provincia: '', distrito: '' },
    geoDatos: {},
    registrosVisibles: [],
    usarClusters: true,
    mostrarPuntos: true,
    mostrarCalor: false,
    herramientaActiva: '',
    puntosDibujo: [],
    dibujoTemporal: null,
    ultimoRegistro: null,
    formatoExportacion: 'pdf',
    moduloIntegrado: null,
    moduloHerramientas: 'vale-fise',
    herramientaEspecial: null,
    proyectoModal: {
      documentos: [],
      imagenes: [],
      beneficiarios: [],
      geometria: null,
      secuenciaBeneficiario: 0
    }
  };

  const $ = (selector, raiz = document) => raiz.querySelector(selector);
  const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];
  const textoSeguro = valor => String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const unicos = valores => [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const moduloPorId = id => estado.datos.modulos.find(modulo => modulo.id === id);
  const proyectoPorId = id => estado.datos.proyectos.find(proyecto => proyecto.id === id);

  document.addEventListener('DOMContentLoaded', iniciar);

  async function iniciar() {
    try {
      estado.datos = await cargarDatos();
      estado.capasModuloActivas = new Set(estado.datos.modulos.map(modulo => modulo.id));
      estado.capasDetalleActivas = new Map(estado.datos.modulos.map(modulo => [modulo.id, new Set(obtenerNombresCapas(modulo.id))]));
      estado.usuarios = recuperarUsuariosLocales(estado.datos.usuarios);
      prepararSelectores();
      renderizarMenuModulos();
      renderizarInicio();
      renderizarProyectos();
      prepararEventos();
      cerrarGruposMenu();
      history.replaceState(null, '', '#satcontrol');
      navegar('satcontrol');
      $('#fechaActualizacion').textContent = `Actualizado: ${formatearFecha(estado.datos.configuracion.actualizacion)}`;
    } catch (error) {
      console.error(error);
      notificar('No se pudo cargar el módulo de Administración.', 'error');
    }
  }

  async function cargarDatos() {
    const rutas = location.protocol.startsWith('http') ? ['/api/admin', 'admin.json'] : ['admin.json'];
    let ultimoError;
    for (const ruta of rutas) {
      try {
        const respuesta = await fetch(ruta, { cache: 'no-store' });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return await enriquecerDatosGeograficos(await respuesta.json());
      } catch (error) {
        ultimoError = error;
      }
    }
    throw ultimoError || new Error('No se encontraron datos administrativos.');
  }

  function obtenerNombresCapas(moduloId) {
    const grupos = CAPAS_POR_MODULO[moduloId] || [];
    const nombres = grupos.flatMap(grupo => grupo.items || []);
    return nombres.length ? nombres : ['Registros del módulo'];
  }

  function obtenerTematicos(moduloId) {
    return (TEMATICOS_POR_MODULO[moduloId] || []).flatMap(grupo =>
      (grupo.items || []).map(item => typeof item === 'string' ? { nombre: item, descripcion: '' } : item)
    );
  }

  async function enriquecerDatosGeograficos(datos) {
    const originales = Array.isArray(datos.registrosGeograficos) ? datos.registrosGeograficos : [];
    const externos = new Map();
    await Promise.all(Object.entries(FUENTES_GEOGRAFICAS_MODULO).map(async ([moduloId, ruta]) => {
      try {
        const respuesta = await fetch(ruta, { cache: 'no-store' });
        if (!respuesta.ok) return;
        const contenido = await respuesta.json();
        const lista = Array.isArray(contenido) ? contenido : contenido.registros;
        if (Array.isArray(lista) && lista.length) externos.set(moduloId, normalizarRegistrosModulo(moduloId, lista));
      } catch (error) {
        console.warn(`No se pudo ampliar la clusterización de ${moduloId}.`, error);
      }
    }));
    const modulosConFuente = new Set(externos.keys());
    const combinados = [...externos.values()].flat();
    datos.modulos.forEach(modulo => {
      if (modulosConFuente.has(modulo.id)) return;
      const base = originales.filter(registro => registro.modulo === modulo.id);
      combinados.push(...expandirRegistrosDemostrativos(base, 7));
    });
    datos.registrosGeograficos = combinados.length ? combinados : originales;
    return datos;
  }

  function normalizarRegistrosModulo(moduloId, registros) {
    return registros.map((registro, indice) => ({
      id: registro.id || registro.codigo || `${ICONOS_MODULO[moduloId] || 'MOD'}-${String(indice + 1).padStart(5, '0')}`,
      modulo: moduloId,
      proyecto: registro.proyecto || registro.iniciativa || '',
      region: registro.region || regionDeDepartamento(registro.departamento),
      departamento: registro.departamento || '',
      provincia: registro.provincia || '',
      distrito: registro.distrito || '',
      estado: registro.estado || registro.estadoRegistro || registro.estadoInstalacion || 'Registrado',
      empresa: registro.ede || registro.empresa || registro.taller || registro.instaladora || registro.concesionaria || '',
      lat: Number(registro.lat ?? registro.latitud),
      lng: Number(registro.lng ?? registro.longitud),
      nombre: registro.nombre || registro.beneficiario || '',
      suministro: registro.suministro || registro.codigoSuministro || registro.numeroSuministro || ''
    })).filter(registro => Number.isFinite(registro.lat) && Number.isFinite(registro.lng));
  }

  function expandirRegistrosDemostrativos(registros, repeticiones) {
    const expandidos = [];
    registros.forEach((registro, indiceRegistro) => {
      for (let indice = 0; indice < repeticiones; indice += 1) {
        const angulo = ((indice * 137.5) + (indiceRegistro * 31)) * Math.PI / 180;
        const distancia = indice === 0 ? 0 : .025 + ((indice % 4) * .012);
        expandidos.push({
          ...registro,
          id: indice === 0 ? registro.id : `${registro.id}-${indice + 1}`,
          lat: Number(registro.lat) + Math.sin(angulo) * distancia,
          lng: Number(registro.lng) + Math.cos(angulo) * distancia
        });
      }
    });
    return expandidos;
  }

  function regionDeDepartamento(departamento) {
    const valor = normalizar(departamento);
    if (/loreto|ucayali|san martin|madre de dios|amazonas/.test(valor)) return 'Oriente';
    if (/arequipa|moquegua|tacna|puno|cusco|apurimac|ayacucho/.test(valor)) return 'Sur';
    if (/piura|tumbes|lambayeque|la libertad|cajamarca|ancash/.test(valor)) return 'Norte';
    return 'Centro';
  }

  function recuperarUsuariosLocales(usuariosBase) {
    try {
      const locales = JSON.parse(localStorage.getItem('paulet_admin_usuarios') || 'null');
      return Array.isArray(locales) ? locales : usuariosBase;
    } catch {
      return usuariosBase;
    }
  }

  function guardarUsuariosLocales() {
    localStorage.setItem('paulet_admin_usuarios', JSON.stringify(estado.usuarios));
  }

  function prepararSelectores() {
    const selectorPerfilFormulario = $('[name="perfil"]');
    const selectorRegionFormulario = $('[name="region"]');
    PERFILES.forEach(perfil => selectorPerfilFormulario.add(new Option(perfil, perfil)));
    REGIONES_USUARIO.forEach(region => selectorRegionFormulario.add(new Option(region, region)));
    llenarSelect($('#filtrarPerfil'), PERFILES, 'Todos los perfiles');
    llenarSelect($('#filtrarRegion'), REGIONES_USUARIO, 'Todas las regiones');
    llenarSelect($('#filtroModulo'), estado.datos.modulos.map(modulo => ({ valor: modulo.id, texto: modulo.nombre })), 'Todos los módulos');
    llenarSelect($('#filtroProyecto'), estado.datos.proyectos.map(proyecto => ({ valor: proyecto.id, texto: proyecto.nombre })), 'Todos los proyectos');
    actualizarOpcionesGeograficas();
  }

  function llenarSelect(select, opciones, etiquetaVacia, conservar = true) {
    if (!select) return;
    const anterior = conservar ? select.value : '';
    select.innerHTML = `<option value="">${textoSeguro(etiquetaVacia)}</option>`;
    opciones.forEach(opcion => {
      const valor = typeof opcion === 'string' ? opcion : opcion.valor;
      const texto = typeof opcion === 'string' ? opcion : opcion.texto;
      select.add(new Option(texto, valor));
    });
    if ([...select.options].some(opcion => opcion.value === anterior)) select.value = anterior;
  }

  function renderizarMenuModulos() {
    const contenedor = $('#enlacesModulosMenu');
    contenedor.innerHTML = estado.datos.modulos.map(modulo => {
      const secciones = SECCIONES_MODULO[modulo.id] || [{ id: 'satcontrol', nombre: 'SATCONTROL', icono: 'mapa' }];
      const opciones = secciones.map(seccion => `
          <button class="opcion-arbol-admin" type="button"
            data-abrir-modulo="${textoSeguro(modulo.id)}"
            data-ruta-modulo="${textoSeguro(modulo.ruta)}"
            data-seccion-modulo="${textoSeguro(seccion.id)}"
            aria-label="${textoSeguro(modulo.nombre)} · ${textoSeguro(seccion.nombre)}"
            data-etiqueta="${textoSeguro(modulo.nombre)} · ${textoSeguro(seccion.nombre)}">
            <span class="icono-arbol-admin" aria-hidden="true">${iconoSeccionModulo(seccion.icono)}</span>
            <span>${textoSeguro(seccion.nombre)}</span>
          </button>`).join('');
      return `
      <section class="acordeon-admin acordeon-modulo-admin" data-grupo-admin="modulo-${textoSeguro(modulo.id)}">
        <button class="cabecera-acordeon-admin" type="button" data-alternar-grupo="modulo-${textoSeguro(modulo.id)}" aria-expanded="false">
          <span class="icono-arbol-admin" aria-hidden="true"><i class="modulo-menu-punto" style="--modulo-color:${textoSeguro(modulo.color)}"></i></span>
          <span>${textoSeguro(modulo.nombre)}</span><i aria-hidden="true"></i>
        </button>
        <div class="contenido-acordeon-admin">${opciones}</div>
      </section>`;
    }).join('');
  }

  function iconoSeccionModulo(tipo) {
    const iconos = {
      mapa: '<svg viewBox="0 0 24 24"><path d="M4 5.5 9 3l6 2.5L20 3v15.5L15 21l-6-2.5L4 21z"/><path d="M9 3v15.5M15 5.5V21"/></svg>',
      graficas: '<svg viewBox="0 0 24 24"><path d="M4 20V10h4v10H4ZM10 20V4h4v16h-4ZM16 20v-7h4v7h-4Z"/><path d="M3 20h18"/></svg>',
      validacion: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
      solicitudes: '<svg viewBox="0 0 24 24"><path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'
    };
    return iconos[tipo] || iconos.mapa;
  }

  function renderizarInicio() {
    const habilitados = estado.usuarios.filter(usuario => usuario.estado === 'Habilitado').length;
    const regiones = new Set(estado.datos.registrosGeograficos.map(registro => registro.departamento)).size;
    $('#kpisAdmin').innerHTML = [
      ['Módulos integrados', estado.datos.modulos.length, 'Acceso transversal disponible', '#4f7fe5'],
      ['Proyectos', estado.datos.proyectos.length, 'Estructuras activas y planificadas', '#55aaca'],
      ['Usuarios habilitados', habilitados, `${estado.usuarios.length} cuentas registradas`, '#55bd76'],
      ['Cobertura geográfica', regiones, 'Departamentos con registros', '#9b75d6']
    ].map(([titulo, valor, detalle, color]) => `
      <article class="kpi-admin" style="--kpi-color:${color}">
        <span>${titulo}</span><strong>${valor}</strong><small>${detalle}</small>
      </article>`).join('');
    $('#contadorModulos').textContent = `${estado.datos.modulos.length} módulos`;
    $('#rejillaModulos').innerHTML = estado.datos.modulos.map(modulo => `
      <a class="tarjeta-modulo" href="${textoSeguro(modulo.ruta)}" style="--color-modulo:${modulo.color}">
        <i>${ICONOS_MODULO[modulo.id] || 'MD'}</i>
        <span><b>${textoSeguro(modulo.nombre)}</b><small>${textoSeguro(modulo.descripcion)}</small></span>
        <em>→</em>
      </a>`).join('');
    $('#listaActividad').innerHTML = [
      ['✓', 'Servicios disponibles', `${estado.datos.modulos.length} módulos conectados`],
      ['⌖', 'Registros geográficos', `${estado.datos.registrosGeograficos.length} muestras integradas`],
      ['◇', 'Proyectos en ejecución', `${estado.datos.proyectos.filter(p => p.estado === 'En ejecución').length} iniciativas activas`],
      ['◎', 'Cuentas deshabilitadas', `${estado.usuarios.filter(u => u.estado === 'Deshabilitado').length} requieren revisión`]
    ].map(([icono, titulo, detalle]) => `<div class="actividad-item"><i>${icono}</i><span><b>${titulo}</b><small>${detalle}</small></span></div>`).join('');
    $('#proyectosResumen').innerHTML = estado.datos.proyectos.map(proyecto => plantillaProyectoMini(proyecto)).join('');
  }

  function plantillaProyectoMini(proyecto) {
    return `<article class="proyecto-mini">
      <header><h3>${textoSeguro(proyecto.nombre)}</h3><span>${textoSeguro(proyecto.codigo)}</span></header>
      <p>${textoSeguro(proyecto.ambito)}</p>
      <div class="barra-avance"><i style="width:${proyecto.avance}%"></i></div>
      <footer><span>${proyecto.avance}% de avance</span><span>${proyecto.modulos.length - 1} módulos</span></footer>
    </article>`;
  }

  function renderizarProyectos() {
    const consulta = normalizar(estado.busquedaProyectos);
    const filtrados = estado.datos.proyectos.filter(proyecto => !consulta || normalizar(
      `${proyecto.codigo} ${proyecto.nombre} ${proyecto.estado} ${proyecto.tipo || ''}`
    ).includes(consulta));
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / estado.porPaginaProyectos));
    estado.paginaProyectos = Math.min(estado.paginaProyectos, totalPaginas);
    const inicio = (estado.paginaProyectos - 1) * estado.porPaginaProyectos;
    const pagina = filtrados.slice(inicio, inicio + estado.porPaginaProyectos);
    $('#cuerpoProyectos').innerHTML = pagina.length ? pagina.map(proyecto => {
      const cantidadBeneficiarios = Number(proyecto.beneficiariosCount ?? proyecto.beneficiarios?.length ?? 0);
      const claseEstado = normalizar(proyecto.estado).replace(/\s+/g, '-');
      return `<tr>
        <td>${textoSeguro(proyecto.codigo)}</td>
        <td>${textoSeguro(proyecto.nombre)}</td>
        <td><span class="estado-proyecto-tabla ${claseEstado}">${textoSeguro(proyecto.estado)}</span></td>
        <td>${textoSeguro(proyecto.tipo || 'Eléctrico')}</td>
        <td>${cantidadBeneficiarios.toLocaleString('es-PE')} beneficiarios</td>
        <td><button class="boton-tabla-proyecto" type="button" data-ver-documento-proyecto="${textoSeguro(proyecto.id)}">Ver</button></td>
        <td><button class="boton-tabla-proyecto" type="button" data-ver-imagen-proyecto="${textoSeguro(proyecto.id)}">Ver</button></td>
        <td><button class="boton-tabla-proyecto" type="button" data-editar-proyecto="${textoSeguro(proyecto.id)}">Editar</button></td>
      </tr>`;
    }).join('') : '<tr><td colspan="8">No se encontraron proyectos con el nombre o código indicado.</td></tr>';
    $('#paginaProyectoActual').textContent = `Página ${estado.paginaProyectos} de ${totalPaginas}`;
    $('#paginaProyectoAnterior').disabled = estado.paginaProyectos === 1;
    $('#paginaProyectoSiguiente').disabled = estado.paginaProyectos === totalPaginas;
  }

  function cambiarPaginaProyectos(direccion) {
    estado.paginaProyectos = Math.max(1, estado.paginaProyectos + direccion);
    renderizarProyectos();
  }

  function manejarAccionProyecto(evento) {
    const boton = evento.target.closest('[data-ver-documento-proyecto], [data-ver-imagen-proyecto], [data-editar-proyecto]');
    if (!boton) return;
    if (boton.dataset.editarProyecto) {
      abrirEditarProyecto(boton.dataset.editarProyecto);
      return;
    }
    const id = boton.dataset.verDocumentoProyecto || boton.dataset.verImagenProyecto;
    const proyecto = proyectoPorId(id);
    if (!proyecto) return;
    const esDocumento = Boolean(boton.dataset.verDocumentoProyecto);
    const archivos = esDocumento ? proyecto.documentos : proyecto.imagenes;
    const etiqueta = esDocumento ? 'documentos' : 'imágenes';
    notificar(archivos?.length
      ? `${proyecto.nombre}: ${archivos.join(', ')}`
      : `${proyecto.nombre} no tiene ${etiqueta} adjuntos en esta maqueta.`, 'info');
  }

  function exportarProyectosExcel() {
    const filas = estado.datos.proyectos.map(proyecto => ({
      Código: proyecto.codigo,
      Nombre: proyecto.nombre,
      Estado: proyecto.estado,
      'Tipo de proyecto': proyecto.tipo || 'Eléctrico',
      Beneficiarios: Number(proyecto.beneficiariosCount ?? proyecto.beneficiarios?.length ?? 0)
    }));
    if (window.XLSX) {
      const libro = XLSX.utils.book_new();
      const hoja = XLSX.utils.json_to_sheet(filas);
      hoja['!cols'] = [{ wch: 17 }, { wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(libro, hoja, 'Proyectos');
      XLSX.writeFile(libro, 'proyectos-administracion.xlsx');
    } else {
      const encabezado = Object.keys(filas[0] || {}).join(',');
      const cuerpo = filas.map(fila => Object.values(fila).map(valor => `"${String(valor).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      descargarBlob(new Blob(['\ufeff' + encabezado + '\r\n' + cuerpo], { type: 'text/csv;charset=utf-8' }), 'proyectos-administracion.csv');
    }
    notificar('Listado de proyectos exportado.', 'exito');
  }

  function abrirEliminarProyecto(codigo = '') {
    const formulario = $('#formularioEliminarProyecto');
    formulario.reset();
    $('#codigoEliminarProyecto').value = codigo;
    actualizarVistaPreviaEliminacion();
    abrirModal('modalEliminarProyecto');
    setTimeout(() => $('#codigoEliminarProyecto').focus(), 50);
  }

  function actualizarVistaPreviaEliminacion() {
    const codigo = normalizar($('#codigoEliminarProyecto').value.trim());
    const proyecto = estado.datos.proyectos.find(item => normalizar(item.codigo) === codigo);
    const vista = $('#vistaPreviaEliminacion');
    vista.hidden = !proyecto;
    vista.innerHTML = proyecto
      ? `<b>${textoSeguro(proyecto.nombre)}</b><span>${textoSeguro(proyecto.codigo)} · ${textoSeguro(proyecto.estado)}</span>`
      : '';
  }

  function eliminarProyecto(evento) {
    evento.preventDefault();
    const codigo = normalizar(new FormData(evento.currentTarget).get('codigo'));
    const indice = estado.datos.proyectos.findIndex(proyecto => normalizar(proyecto.codigo) === codigo);
    if (indice < 0) {
      notificar('No existe un proyecto con el código indicado.', 'error');
      return;
    }
    const [eliminado] = estado.datos.proyectos.splice(indice, 1);
    estado.paginaProyectos = 1;
    renderizarProyectos();
    renderizarInicio();
    llenarSelect($('#filtroProyecto'), estado.datos.proyectos.map(item => ({ valor: item.id, texto: item.nombre })), 'Todos los proyectos');
    cerrarModal('modalEliminarProyecto');
    notificar(`Proyecto ${eliminado.codigo} eliminado de la maqueta.`, 'exito');
  }

  function prepararEventos() {
    window.addEventListener('hashchange', () => navegar(location.hash.replace('#', '') || 'satcontrol'));
    $$('[data-vista]').forEach(enlace => enlace.addEventListener('click', evento => {
      evento.preventDefault();
      navegar(enlace.dataset.vista);
    }));
    $$('[data-alternar-grupo]').forEach(boton => boton.addEventListener('click', () => {
      const grupo = boton.closest('.acordeon-admin');
      const abierto = !grupo.classList.contains('abierto');
      if (abierto) cerrarGruposMenu(grupo);
      grupo.classList.toggle('abierto', abierto);
      boton.setAttribute('aria-expanded', String(abierto));
    }));
    $$('[data-abrir-modulo]').forEach(boton => boton.addEventListener('click', () => abrirModuloIntegrado(
      boton.dataset.abrirModulo,
      boton.dataset.rutaModulo,
      boton
    )));
    $$('[data-accion-admin]').forEach(boton => boton.addEventListener('click', () => {
      const accion = boton.dataset.accionAdmin;
      $$('[data-accion-admin]').forEach(opcion => opcion.classList.toggle('activo', opcion === boton));
      if (accion === 'crear-proyecto') {
        navegar('proyectos');
        abrirNuevoProyecto();
      } else if (accion === 'listar-proyectos') {
        navegar('proyectos');
        renderizarProyectos();
      } else if (accion === 'eliminar-proyectos') {
        navegar('proyectos');
        abrirEliminarProyecto();
      } else if (accion === 'crear-usuario') {
        navegar('usuarios');
        cambiarPestanaUsuarios('crear');
      } else if (accion === 'listar-usuarios') {
        navegar('usuarios');
        cambiarPestanaUsuarios('lista');
      }
    }));
    $$('[data-ir-vista]').forEach(boton => boton.addEventListener('click', () => navegar(boton.dataset.irVista)));
    $$('[data-pestana-usuario]').forEach(boton => boton.addEventListener('click', () => cambiarPestanaUsuarios(boton.dataset.pestanaUsuario)));
    $('#botonNuevoProyecto').addEventListener('click', abrirNuevoProyecto);
    $('#buscarProyecto').addEventListener('input', evento => {
      estado.busquedaProyectos = evento.target.value;
      estado.paginaProyectos = 1;
      renderizarProyectos();
    });
    $('#paginaProyectoAnterior').addEventListener('click', () => cambiarPaginaProyectos(-1));
    $('#paginaProyectoSiguiente').addEventListener('click', () => cambiarPaginaProyectos(1));
    $('#exportarProyectosExcel').addEventListener('click', exportarProyectosExcel);
    $('#cuerpoProyectos').addEventListener('click', manejarAccionProyecto);
    $('#formularioEliminarProyecto').addEventListener('submit', eliminarProyecto);
    $('#codigoEliminarProyecto').addEventListener('input', actualizarVistaPreviaEliminacion);
    $('#marcoModuloAdmin').addEventListener('load', prepararModuloIntegrado);
    $('#formularioProyecto').addEventListener('submit', crearProyecto);
    prepararFormularioProyecto();
    $$('[data-cerrar-modal]').forEach(boton => boton.addEventListener('click', () => cerrarModal(boton.dataset.cerrarModal)));
    $('#formularioCrearUsuario').addEventListener('submit', crearUsuario);
    $('[data-ver-clave]').addEventListener('click', alternarClave);
    $('#filtrosUsuarios').addEventListener('input', () => { estado.paginaUsuarios = 1; renderizarUsuarios(); });
    $('#filtrosUsuarios').addEventListener('change', () => { estado.paginaUsuarios = 1; renderizarUsuarios(); });
    $('#filtrosUsuarios').addEventListener('reset', () => setTimeout(() => { estado.paginaUsuarios = 1; renderizarUsuarios(); }));
    $$('[data-orden]').forEach(boton => boton.addEventListener('click', () => ordenarUsuarios(boton.dataset.orden)));
    $('#paginaAnterior').addEventListener('click', () => cambiarPaginaUsuarios(-1));
    $('#paginaSiguiente').addEventListener('click', () => cambiarPaginaUsuarios(1));
    $('#cuerpoUsuarios').addEventListener('click', evento => {
      const boton = evento.target.closest('[data-alternar-usuario]');
      if (boton) alternarEstadoUsuario(boton.dataset.alternarUsuario);
    });
    $('#botonColapsarFiltros').addEventListener('click', alternarFiltrosMapa);
    $('#formularioFiltrosMapa').addEventListener('submit', evento => { evento.preventDefault(); aplicarFiltrosMapa(true); });
    $('#formularioFiltrosMapa').addEventListener('reset', () => setTimeout(() => {
      estado.nivelGeografico = 'departamento';
      estado.seleccionGeografica = { departamento: '', provincia: '', distrito: '' };
      actualizarOpcionesGeograficas();
      aplicarFiltrosMapa(true);
      cargarLimitesGeograficos('departamento');
      actualizarIndicadorNivelGeografico();
    }));
    ['filtroModulo','filtroRegion','filtroDepartamento','filtroProvincia','filtroDistrito','filtroProyecto','filtroEstado','filtroEmpresa']
      .forEach(id => $(`#${id}`).addEventListener('change', () => {
        if (['filtroModulo','filtroRegion','filtroDepartamento','filtroProvincia'].includes(id)) actualizarOpcionesGeograficas();
      }));
    prepararPanelesMapa();
    prepararHerramientas();
    prepararExportacion();
    document.addEventListener('keydown', evento => {
      if (evento.key === 'Escape') {
        $$('.modal-admin:not([hidden])').forEach(modal => cerrarModal(modal.id));
        if (!$('#panelHerramientasMapa').hidden) alternarPanelHerramientas(false);
      }
    });
  }

  function navegar(vista) {
    if (!TITULOS_VISTA[vista]) vista = 'satcontrol';
    if (vista === 'modulo' && !estado.moduloIntegrado) vista = 'satcontrol';
    estado.vista = vista;
    document.body.classList.toggle('modo-modulo-integrado', vista === 'modulo');
    document.body.classList.toggle('vista-satcontrol-admin', vista === 'satcontrol');
    if (location.hash !== `#${vista}`) history.replaceState(null, '', `#${vista}`);
    $$('[data-vista]').forEach(enlace => enlace.classList.toggle('activo', enlace.dataset.vista === vista));
    $$('[data-vista-contenido]').forEach(seccion => {
      const activa = seccion.dataset.vistaContenido === vista;
      seccion.hidden = !activa;
      seccion.classList.toggle('activa', activa);
    });
    $('#tituloVista').textContent = TITULOS_VISTA[vista][0];
    $('#descripcionVista').textContent = TITULOS_VISTA[vista][1];
    if (vista === 'satcontrol') {
      if (!estado.mapa) setTimeout(iniciarMapa, 40);
      else setTimeout(() => estado.mapa.invalidateSize(), 40);
    }
    if (vista !== 'modulo') $$('[data-abrir-modulo]').forEach(boton => boton.classList.remove('activo'));
    if (vista === 'usuarios') renderizarUsuarios();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function abrirModuloIntegrado(id, ruta, boton) {
    const modulo = moduloPorId(id);
    if (!modulo || !ruta) return;
    const seccion = boton?.dataset.seccionModulo || 'satcontrol';
    const mismoModulo = estado.moduloIntegrado?.modulo?.id === id;
    estado.moduloIntegrado = { modulo, seccion };
    $$('[data-abrir-modulo]').forEach(opcion => opcion.classList.toggle('activo', opcion === boton));
    abrirGrupoMenu(`modulo-${id}`);
    if (mismoModulo && activarSeccionModuloIntegrado(seccion)) {
      $('#marcoModuloAdmin').contentWindow?.dispatchEvent(new Event('resize'));
    } else {
      $('#marcoModuloAdmin').src = `${ruta.split('#')[0]}#${seccion}`;
    }
    navegar('modulo');
    $('#tituloVista').textContent = boton?.dataset.etiqueta || `${modulo.nombre} · SATCONTROL`;
    $('#descripcionVista').textContent = 'Vista operativa integrada dentro de Administración.';
  }

  function activarSeccionModuloIntegrado(seccion) {
    const marco = $('#marcoModuloAdmin');
    try {
      const documento = marco.contentDocument;
      const enlaceSeccion = documento?.querySelector(`.enlace-menu[href="#${CSS.escape(seccion)}"]`);
      if (!enlaceSeccion) return false;
      enlaceSeccion.click();
      return true;
    } catch {
      return false;
    }
  }

  function prepararModuloIntegrado() {
    const marco = $('#marcoModuloAdmin');
    try {
      const documento = marco.contentDocument;
      if (!documento) return;
      const estilo = documento.createElement('style');
      estilo.dataset.adminIntegrado = 'true';
      estilo.textContent = `
        .menu-lateral, .boton-menu-movil, .velo-menu { display: none !important; }
        .contenido-principal, main { margin-left: 0 !important; }
        body { overflow-x: hidden !important; }
      `;
      documento.head.appendChild(estilo);
      const seccion = estado.moduloIntegrado?.seccion || 'satcontrol';
      activarSeccionModuloIntegrado(seccion);
      marco.contentWindow?.dispatchEvent(new Event('resize'));
    } catch (error) {
      console.warn('No se pudo ajustar la vista integrada del módulo.', error);
    }
  }

  function abrirGrupoMenu(nombre) {
    const grupo = $(`[data-grupo-admin="${nombre}"]`);
    if (!grupo) return;
    cerrarGruposMenu(grupo);
    grupo.classList.add('abierto');
    const boton = $('[data-alternar-grupo]', grupo);
    if (boton) boton.setAttribute('aria-expanded', 'true');
  }

  function cerrarGruposMenu(excepto = null) {
    $$('.acordeon-admin').forEach(grupo => {
      if (grupo === excepto) return;
      grupo.classList.remove('abierto');
      const boton = $('[data-alternar-grupo]', grupo);
      if (boton) boton.setAttribute('aria-expanded', 'false');
    });
  }

  function cambiarPestanaUsuarios(pestana) {
    $$('[data-pestana-usuario]').forEach(boton => {
      const activa = boton.dataset.pestanaUsuario === pestana;
      boton.classList.toggle('activa', activa);
      boton.setAttribute('aria-selected', String(activa));
    });
    $$('[data-panel-usuario]').forEach(panel => {
      const activo = panel.dataset.panelUsuario === pestana;
      panel.hidden = !activo;
      panel.classList.toggle('activo', activo);
    });
    if (pestana === 'lista') renderizarUsuarios();
  }

  function abrirNuevoProyecto() {
    const formulario = $('#formularioProyecto');
    formulario.reset();
    delete formulario.dataset.editarId;
    $('#tituloModalProyecto').textContent = 'Crear proyecto';
    formulario.querySelector('[type="submit"]').textContent = 'Guardar proyecto';
    estado.proyectoModal = {
      documentos: [],
      imagenes: [],
      beneficiarios: [],
      geometria: null,
      secuenciaBeneficiario: 0
    };
    formulario.elements.nombre.value = 'Red de Gas Natural - Sector 010101';
    formulario.elements.codigo.value = 'FISE-2026-007';
    formulario.elements.estadoProyecto.value = 'En evaluación';
    prepararUbicacionesProyecto();
    agregarBeneficiarioProyecto({
      tipoBeneficiario: 'Residencial',
      id: 'BEN-001',
      documento: '20123456789',
      razonSocial: 'Empresa o institución',
      estado: 'Activo',
      combustible: 'GLP'
    });
    actualizarIndicadoresArchivosProyecto();
    actualizarEstadoGeometriaProyecto();
    abrirModal('modalProyecto');
  }

  function abrirEditarProyecto(id) {
    const proyecto = proyectoPorId(id);
    if (!proyecto) return;
    abrirNuevoProyecto();
    const formulario = $('#formularioProyecto');
    formulario.dataset.editarId = id;
    $('#tituloModalProyecto').textContent = 'Editar proyecto';
    formulario.querySelector('[type="submit"]').textContent = 'Guardar cambios';
    formulario.elements.nombre.value = proyecto.nombre || '';
    formulario.elements.codigo.value = proyecto.codigo || '';
    formulario.elements.tipoProyecto.value = proyecto.tipo || '';
    formulario.elements.estadoProyecto.value = proyecto.estado || 'En evaluación';
    formulario.elements.descripcion.value = proyecto.descripcion || '';
    formulario.elements.ubigeo.value = proyecto.ubigeo || '';
    if (proyecto.departamento) {
      formulario.elements.departamento.value = proyecto.departamento;
      actualizarProvinciasProyecto(false);
      formulario.elements.provincia.value = proyecto.provincia || '';
      actualizarDistritosProyecto(false);
      formulario.elements.distrito.value = proyecto.distrito || '';
    }
    estado.proyectoModal.documentos = (proyecto.documentos || []).map(name => ({ name }));
    estado.proyectoModal.imagenes = (proyecto.imagenes || []).map(name => ({ name }));
    estado.proyectoModal.geometria = proyecto.geometria || null;
    actualizarIndicadoresArchivosProyecto();
    actualizarEstadoGeometriaProyecto();
  }

  function crearProyecto(evento) {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    const beneficiarios = leerBeneficiariosProyecto();
    const tipoProyecto = formulario.get('tipoProyecto');
    const modulos = modulosPorTipoProyecto(tipoProyecto);
    const ambito = [formulario.get('departamento'), formulario.get('provincia'), formulario.get('distrito')]
      .filter(Boolean).join(' · ') || 'Ámbito por definir';
    const idEditado = evento.currentTarget.dataset.editarId;
    const existente = idEditado ? proyectoPorId(idEditado) : null;
    const proyecto = {
      id: existente?.id || `PRY-${String(Date.now()).slice(-6)}`,
      nombre: formulario.get('nombre'),
      codigo: formulario.get('codigo'),
      tipo: tipoProyecto,
      ubigeo: formulario.get('ubigeo'),
      ambito,
      departamento: formulario.get('departamento'),
      provincia: formulario.get('provincia'),
      distrito: formulario.get('distrito'),
      zona: formulario.get('zona'),
      centroPoblado: formulario.get('centroPoblado'),
      responsable: formulario.get('distribuidor') || 'Distribuidor por asignar',
      distribuidor: formulario.get('distribuidor'),
      snip: formulario.get('snip'),
      regionNatural: formulario.get('regionNatural'),
      regionAltitud: formulario.get('regionAltitud'),
      tipoRer: formulario.get('tipoRer'),
      descripcion: formulario.get('descripcion'),
      estado: formulario.get('estadoProyecto') || 'En evaluación',
      avance: 0,
      modulos,
      geometria: estado.proyectoModal.geometria,
      documentos: estado.proyectoModal.documentos.map(archivo => archivo.name),
      imagenes: estado.proyectoModal.imagenes.map(archivo => archivo.name),
      beneficiarios
    };
    proyecto.beneficiariosCount = beneficiarios.length || existente?.beneficiariosCount || 0;
    if (existente) {
      estado.datos.proyectos.splice(estado.datos.proyectos.indexOf(existente), 1, proyecto);
    } else {
      estado.datos.proyectos.push(proyecto);
    }
    renderizarProyectos();
    renderizarInicio();
    llenarSelect($('#filtroProyecto'), estado.datos.proyectos.map(item => ({ valor: item.id, texto: item.nombre })), 'Todos los proyectos');
    evento.currentTarget.reset();
    cerrarModal('modalProyecto');
    notificar(existente ? 'Proyecto actualizado correctamente.' : `Proyecto guardado con ${beneficiarios.length} beneficiario(s).`, 'exito');
  }

  function prepararFormularioProyecto() {
    llenarSelect($('#departamentoProyecto'), REGIONES_USUARIO.map(nombre => ({ valor: nombre, texto: nombre })), 'Seleccione');
    $('#departamentoProyecto').addEventListener('change', () => actualizarProvinciasProyecto(true));
    $('#provinciaProyecto').addEventListener('change', () => actualizarDistritosProyecto(true));

    $('#descargarFormatoProyecto').addEventListener('click', descargarFormatoProyecto);
    $('#generarMasivosProyecto').addEventListener('click', () => {
      $('#archivoBeneficiariosProyecto').click();
      notificar('Seleccione el Excel para generar proyectos masivos.', 'info');
    });

    $('#anadirDocumentoProyecto').addEventListener('click', () => $('#archivoDocumentoProyecto').click());
    $('#subirImagenProyecto').addEventListener('click', () => $('#archivoImagenProyecto').click());
    $('#archivoDocumentoProyecto').addEventListener('change', evento => {
      estado.proyectoModal.documentos = [...evento.target.files];
      actualizarIndicadoresArchivosProyecto();
      notificar(`${estado.proyectoModal.documentos.length} documento(s) añadidos.`, 'exito');
    });
    $('#archivoImagenProyecto').addEventListener('change', evento => {
      estado.proyectoModal.imagenes = [...evento.target.files];
      actualizarIndicadoresArchivosProyecto();
      notificar(`${estado.proyectoModal.imagenes.length} imagen(es) añadidas.`, 'exito');
    });
    $('#verDocumentosProyecto').addEventListener('click', () => mostrarArchivosProyecto('documentos'));
    $('#verImagenesProyecto').addEventListener('click', () => mostrarArchivosProyecto('imagenes'));
    $('#abrirGisProyecto').addEventListener('click', registrarGeometriaProyectoDemo);

    $('#agregarBeneficiarioProyecto').addEventListener('click', () => agregarBeneficiarioProyecto());
    $('#importarBeneficiariosProyecto').addEventListener('click', () => $('#archivoBeneficiariosProyecto').click());
    $('#subirExcelBeneficiarios').addEventListener('click', () => $('#archivoBeneficiariosProyecto').click());
    $('#archivoBeneficiariosProyecto').addEventListener('change', importarBeneficiariosProyecto);
    $('#exportarBeneficiariosProyecto').addEventListener('click', exportarBeneficiariosProyecto);
    $('#descargarFormatoBeneficiarios').addEventListener('click', descargarFormatoBeneficiarios);
    $('#listaBeneficiariosProyecto').addEventListener('click', evento => {
      const boton = evento.target.closest('[data-eliminar-beneficiario]');
      if (!boton) return;
      estado.proyectoModal.beneficiarios = estado.proyectoModal.beneficiarios
        .filter(item => String(item.uid) !== String(boton.dataset.eliminarBeneficiario));
      renderizarBeneficiariosProyecto();
    });
  }

  function prepararUbicacionesProyecto() {
    $('#departamentoProyecto').value = 'Amazonas';
    actualizarProvinciasProyecto(false);
    $('#provinciaProyecto').value = '';
    actualizarDistritosProyecto(false);
    $('#ubigeoProyecto').value = '010101';
  }

  function actualizarProvinciasProyecto(limpiarUbigeo) {
    const departamento = $('#departamentoProyecto').value;
    const provincias = Object.keys(UBICACIONES_PROYECTO[departamento] || {});
    llenarSelect($('#provinciaProyecto'), provincias.map(nombre => ({ valor: nombre, texto: nombre })), '-- Seleccione --');
    actualizarDistritosProyecto(false);
    if (limpiarUbigeo) $('#ubigeoProyecto').value = '';
  }

  function actualizarDistritosProyecto(limpiarUbigeo) {
    const departamento = $('#departamentoProyecto').value;
    const provincia = $('#provinciaProyecto').value;
    const distritos = (UBICACIONES_PROYECTO[departamento] || {})[provincia] || [];
    llenarSelect($('#distritoProyecto'), distritos.map(nombre => ({ valor: nombre, texto: nombre })), '-- Seleccione --');
    if (limpiarUbigeo) $('#ubigeoProyecto').value = '';
  }

  function actualizarIndicadoresArchivosProyecto() {
    $('#cantidadDocsProyecto').textContent = estado.proyectoModal.documentos.length;
    $('#cantidadImgsProyecto').textContent = estado.proyectoModal.imagenes.length;
  }

  function mostrarArchivosProyecto(tipo) {
    const archivos = estado.proyectoModal[tipo];
    if (!archivos.length) return notificar(`Aún no se han añadido ${tipo}.`, 'info');
    const nombres = archivos.slice(0, 3).map(archivo => archivo.name).join(', ');
    const extra = archivos.length > 3 ? ` y ${archivos.length - 3} más` : '';
    notificar(`${tipo === 'documentos' ? 'Documentos' : 'Imágenes'}: ${nombres}${extra}.`, 'exito');
  }

  function registrarGeometriaProyectoDemo() {
    estado.proyectoModal.geometria = {
      tipo: 'Polígono',
      centro: [-6.2317, -77.8690],
      puntos: 5,
      fuente: 'Selector GIS administrativo'
    };
    actualizarEstadoGeometriaProyecto();
    notificar('Geometría de demostración registrada en el proyecto.', 'exito');
  }

  function actualizarEstadoGeometriaProyecto() {
    const geometria = estado.proyectoModal.geometria;
    const contenedor = $('.estado-geometria-proyecto');
    contenedor.classList.toggle('registrada', Boolean(geometria));
    $('#textoGeometriaProyecto').textContent = geometria ? `${geometria.tipo} registrado · ${geometria.puntos} vértices` : 'Sin geometría registrada.';
    $('#detalleGeometriaProyecto').textContent = geometria
      ? `${geometria.centro[0].toFixed(5)}, ${geometria.centro[1].toFixed(5)} · ${geometria.fuente}`
      : 'Abra el selector GIS para ubicar el proyecto.';
    $('#abrirGisProyecto').textContent = geometria ? '✓ Editar GIS' : '⌖ Abrir GIS';
  }

  function agregarBeneficiarioProyecto(datos = {}) {
    const uid = ++estado.proyectoModal.secuenciaBeneficiario;
    estado.proyectoModal.beneficiarios.push({
      uid,
      tipoIntervencion: datos.tipoIntervencion || '',
      tipoBeneficiario: datos.tipoBeneficiario || 'Residencial',
      id: datos.id || `BEN-${String(uid).padStart(3, '0')}`,
      documento: datos.documento || '',
      razonSocial: datos.razonSocial || '',
      tipoEntidad: datos.tipoEntidad || '',
      consumo: datos.consumo || '',
      estado: datos.estado || 'Activo',
      montoVale: datos.montoVale || '',
      combustible: datos.combustible || 'GLP'
    });
    renderizarBeneficiariosProyecto();
  }

  function renderizarBeneficiariosProyecto() {
    const lista = $('#listaBeneficiariosProyecto');
    $('#contadorBeneficiariosProyecto').textContent = estado.proyectoModal.beneficiarios.length;
    if (!estado.proyectoModal.beneficiarios.length) {
      lista.innerHTML = '<div class="vacio-beneficiarios-proyecto">No hay beneficiarios agregados. Use “Agregar” o importe un archivo Excel.</div>';
      return;
    }
    lista.innerHTML = estado.proyectoModal.beneficiarios.map((beneficiario, indice) => `
      <article class="beneficiario-proyecto" data-beneficiario-uid="${beneficiario.uid}">
        <header><b>Beneficiario #${indice + 1}</b><button type="button" data-eliminar-beneficiario="${beneficiario.uid}">Eliminar</button></header>
        <div class="rejilla-beneficiario-proyecto">
          ${campoBeneficiarioSelect('tipoIntervencion', 'Tipo de intervención', beneficiario.tipoIntervencion, ['', 'Instalación', 'Conexión', 'Compensación', 'Conversión', 'Ampliación'])}
          ${campoBeneficiarioSelect('tipoBeneficiario', 'Tipo de beneficiario', beneficiario.tipoBeneficiario, ['Residencial', 'Comercial', 'Institucional', 'Productivo'])}
          ${campoBeneficiarioInput('id', 'ID beneficiario', beneficiario.id)}
          ${campoBeneficiarioInput('documento', 'RUC / DNI', beneficiario.documento)}
          ${campoBeneficiarioInput('razonSocial', 'Razón social', beneficiario.razonSocial, 'Empresa o institución')}
          ${campoBeneficiarioSelect('tipoEntidad', 'Tipo de Entidad', beneficiario.tipoEntidad, ['', 'Persona natural', 'Empresa privada', 'Entidad pública', 'Organización social'])}
          ${campoBeneficiarioInput('consumo', 'Consumo 12 meses (kWh)', beneficiario.consumo, '0', 'number')}
          ${campoBeneficiarioSelect('estado', 'Estado beneficiario', beneficiario.estado, ['Activo', 'Pendiente', 'Suspendido', 'Inactivo'])}
          ${campoBeneficiarioInput('montoVale', 'Monto vale (S/)', beneficiario.montoVale, 'Opcional', 'number')}
          ${campoBeneficiarioSelect('combustible', 'Tipo combustible / programa', beneficiario.combustible, ['GLP', 'Gas natural', 'GNV', 'Electricidad', 'Fotovoltaico'])}
        </div>
      </article>`).join('');
  }

  function campoBeneficiarioInput(campo, etiqueta, valor, placeholder = '', tipo = 'text') {
    return `<label class="campo-proyecto"><span>${etiqueta}</span><input data-campo-beneficiario="${campo}" type="${tipo}" value="${textoSeguro(valor)}" placeholder="${textoSeguro(placeholder)}"></label>`;
  }

  function campoBeneficiarioSelect(campo, etiqueta, valor, opciones) {
    const opcionesHtml = opciones.map(opcion => {
      const texto = opcion || '-- Seleccione --';
      return `<option value="${textoSeguro(opcion)}"${opcion === valor ? ' selected' : ''}>${textoSeguro(texto)}</option>`;
    }).join('');
    return `<label class="campo-proyecto"><span>${etiqueta}</span><select data-campo-beneficiario="${campo}">${opcionesHtml}</select></label>`;
  }

  function leerBeneficiariosProyecto() {
    return $$('.beneficiario-proyecto').map(tarjeta => {
      const beneficiario = { uid: tarjeta.dataset.beneficiarioUid };
      $$('[data-campo-beneficiario]', tarjeta).forEach(campo => {
        beneficiario[campo.dataset.campoBeneficiario] = campo.value;
      });
      return beneficiario;
    });
  }

  function importarBeneficiariosProyecto(evento) {
    if (!evento.target.files.length) return;
    agregarBeneficiarioProyecto({
      tipoIntervencion: 'Conexión', tipoBeneficiario: 'Residencial', id: 'BEN-IMP-001',
      documento: '74200101', razonSocial: 'María Quispe Flores', tipoEntidad: 'Persona natural',
      consumo: 1450, estado: 'Activo', montoVale: 43, combustible: 'GLP'
    });
    agregarBeneficiarioProyecto({
      tipoIntervencion: 'Instalación', tipoBeneficiario: 'Institucional', id: 'BEN-IMP-002',
      documento: '20123456001', razonSocial: 'Centro Comunal Amazonas', tipoEntidad: 'Organización social',
      consumo: 2380, estado: 'Pendiente', montoVale: 75, combustible: 'Gas natural'
    });
    notificar('Importación simulada: se añadieron 2 beneficiarios.', 'exito');
    evento.target.value = '';
  }

  function exportarBeneficiariosProyecto() {
    const beneficiarios = leerBeneficiariosProyecto();
    if (!beneficiarios.length) return notificar('No hay beneficiarios para exportar.', 'info');
    descargarCsvBeneficiarios(beneficiarios, 'beneficiarios-proyecto.csv');
  }

  function descargarFormatoBeneficiarios() {
    descargarCsvBeneficiarios([{
      tipoIntervencion: '', tipoBeneficiario: 'Residencial', id: 'BEN-001', documento: '',
      razonSocial: '', tipoEntidad: '', consumo: '', estado: 'Activo', montoVale: '', combustible: 'GLP'
    }], 'formato-beneficiarios-proyecto.csv');
  }

  function descargarCsvBeneficiarios(beneficiarios, nombre) {
    const columnas = ['tipoIntervencion', 'tipoBeneficiario', 'id', 'documento', 'razonSocial', 'tipoEntidad', 'consumo', 'estado', 'montoVale', 'combustible'];
    const escapar = valor => `"${String(valor == null ? '' : valor).replace(/"/g, '""')}"`;
    const contenido = [columnas.join(','), ...beneficiarios.map(item => columnas.map(columna => escapar(item[columna])).join(','))].join('\r\n');
    descargarBlob(new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8' }), nombre);
    notificar('Archivo CSV generado.', 'exito');
  }

  function descargarFormatoProyecto() {
    const columnas = ['nombre', 'tipoProyecto', 'ubigeo', 'departamento', 'provincia', 'distrito', 'zona', 'centroPoblado', 'distribuidor', 'codigoUnico', 'snip', 'regionNatural', 'regionAltitud', 'tipoRer', 'estado'];
    const ejemplo = ['Red de Gas Natural - Sector 010101', 'Masificación de gas natural', '010101', 'Amazonas', '', '', '', '', '', 'FISE-2026-007', '', '', '', '', 'En evaluación'];
    const contenido = `${columnas.join(',')}\r\n${ejemplo.map(valor => `"${valor}"`).join(',')}`;
    descargarBlob(new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8' }), 'formato-creacion-proyectos.csv');
    notificar('Formato de proyectos descargado.', 'exito');
  }

  function modulosPorTipoProyecto(tipo) {
    const mapa = {
      'Masificación de gas natural': ['satcontrol', 'masificacion'],
      'Vale FISE': ['satcontrol', 'vale-fise'],
      'Ahorro GNV': ['satcontrol', 'ahorro-gnv'],
      'Electricidad al Toque': ['satcontrol', 'electricidad-al-toque'],
      Fotovoltaico: ['satcontrol', 'fotovoltaico'],
      MCTER: ['satcontrol', 'mcter'],
      BonoGas: ['satcontrol', 'bonogas']
    };
    return mapa[tipo] || ['satcontrol'];
  }

  async function crearUsuario(evento) {
    evento.preventDefault();
    const boton = evento.submitter;
    const formulario = new FormData(evento.currentTarget);
    const datosUsuario = Object.fromEntries(formulario.entries());
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    try {
      let usuario;
      if (location.protocol.startsWith('http')) {
        try {
          const respuesta = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
          });
          if (respuesta.status === 404) throw new Error('API_ADMIN_NO_DISPONIBLE');
          const resultado = await respuesta.json();
          if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo guardar el usuario.');
          usuario = resultado;
        } catch (errorApi) {
          if (errorApi.message !== 'API_ADMIN_NO_DISPONIBLE' && !(errorApi instanceof TypeError)) throw errorApi;
          usuario = crearUsuarioLocal(datosUsuario);
        }
      } else {
        usuario = crearUsuarioLocal(datosUsuario);
      }
      estado.usuarios.unshift(usuario);
      guardarUsuariosLocales();
      evento.currentTarget.reset();
      renderizarInicio();
      renderizarUsuarios();
      cambiarPestanaUsuarios('lista');
      notificar(`Usuario ${usuario.nombres} ${usuario.apellidos} creado correctamente.`, 'exito');
    } catch (error) {
      notificar(error.message, 'error');
    } finally {
      boton.disabled = false;
      boton.innerHTML = '<span>＋</span> Crear usuario';
    }
  }

  function crearUsuarioLocal(datos) {
    const correo = datos.correo.trim().toLowerCase();
    if (estado.usuarios.some(usuario => usuario.correo.toLowerCase() === correo)) throw new Error('Ya existe un usuario con ese correo.');
    return {
      id: `USR-${String(Date.now()).slice(-8)}`,
      nombres: datos.nombres.trim(), apellidos: datos.apellidos.trim(), direccion: datos.direccion.trim(),
      correo, telefono: datos.telefono.trim(), region: datos.region, perfil: datos.perfil,
      claveConfigurada: Boolean(datos.contrasena), estado: 'Habilitado', creado: new Date().toISOString()
    };
  }

  function alternarClave(evento) {
    const input = evento.currentTarget.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    evento.currentTarget.textContent = input.type === 'password' ? '◉' : '◎';
  }

  function renderizarUsuarios() {
    if (!estado.usuarios.length && !estado.datos) return;
    const busqueda = normalizar($('#buscarUsuario').value);
    const perfil = $('#filtrarPerfil').value;
    const region = $('#filtrarRegion').value;
    const estadoFiltro = $('#filtrarEstado').value;
    estado.usuariosFiltrados = estado.usuarios.filter(usuario => {
      const coincideTexto = !busqueda || normalizar(`${usuario.nombres} ${usuario.apellidos} ${usuario.correo}`).includes(busqueda);
      return coincideTexto && (!perfil || usuario.perfil === perfil) && (!region || usuario.region === region) && (!estadoFiltro || usuario.estado === estadoFiltro);
    }).sort((a, b) => {
      const campo = estado.ordenUsuarios.campo;
      return String(a[campo]).localeCompare(String(b[campo]), 'es', { sensitivity: 'base' }) * estado.ordenUsuarios.direccion;
    });
    const totalPaginas = Math.max(1, Math.ceil(estado.usuariosFiltrados.length / estado.porPagina));
    estado.paginaUsuarios = Math.min(estado.paginaUsuarios, totalPaginas);
    const inicio = (estado.paginaUsuarios - 1) * estado.porPagina;
    const usuariosPagina = estado.usuariosFiltrados.slice(inicio, inicio + estado.porPagina);
    $('#cuerpoUsuarios').innerHTML = usuariosPagina.length ? usuariosPagina.map(usuario => {
      const iniciales = `${usuario.nombres[0] || ''}${usuario.apellidos[0] || ''}`.toUpperCase();
      const habilitado = usuario.estado === 'Habilitado';
      return `<tr>
        <td><span class="usuario-identidad"><i class="usuario-avatar">${textoSeguro(iniciales)}</i><b>${textoSeguro(usuario.nombres)}</b></span></td>
        <td>${textoSeguro(usuario.apellidos)}</td>
        <td>${textoSeguro(usuario.correo)}</td>
        <td>${textoSeguro(usuario.region)}</td>
        <td><span class="etiqueta-perfil">${textoSeguro(usuario.perfil)}</span></td>
        <td><span class="estado-usuario ${habilitado ? 'habilitado' : 'deshabilitado'}">${textoSeguro(usuario.estado)}</span></td>
        <td><button class="accion-estado ${habilitado ? 'deshabilitar' : 'habilitar'}" type="button" data-alternar-usuario="${usuario.id}">${habilitado ? 'Deshabilitar' : 'Habilitar'}</button></td>
      </tr>`;
    }).join('') : '<tr><td colspan="7">No se encontraron usuarios con los filtros seleccionados.</td></tr>';
    $('#contadorUsuarios').textContent = `${estado.usuariosFiltrados.length} usuarios`;
    $('#totalUsuariosPestana').textContent = estado.usuarios.length;
    const fin = Math.min(inicio + estado.porPagina, estado.usuariosFiltrados.length);
    $('#rangoUsuarios').textContent = estado.usuariosFiltrados.length ? `Mostrando ${inicio + 1}–${fin} de ${estado.usuariosFiltrados.length} registros` : 'Mostrando 0 registros';
    $('#paginaAnterior').disabled = estado.paginaUsuarios === 1;
    $('#paginaSiguiente').disabled = estado.paginaUsuarios === totalPaginas;
    $('#paginasUsuarios').innerHTML = Array.from({ length: totalPaginas }, (_, indice) => `<button type="button" data-pagina="${indice + 1}" class="${indice + 1 === estado.paginaUsuarios ? 'activa' : ''}">${indice + 1}</button>`).join('');
    $$('[data-pagina]', $('#paginasUsuarios')).forEach(boton => boton.addEventListener('click', () => {
      estado.paginaUsuarios = Number(boton.dataset.pagina);
      renderizarUsuarios();
    }));
  }

  function ordenarUsuarios(campo) {
    if (estado.ordenUsuarios.campo === campo) estado.ordenUsuarios.direccion *= -1;
    else estado.ordenUsuarios = { campo, direccion: 1 };
    renderizarUsuarios();
  }

  function cambiarPaginaUsuarios(desplazamiento) {
    estado.paginaUsuarios += desplazamiento;
    renderizarUsuarios();
  }

  async function alternarEstadoUsuario(id) {
    const usuario = estado.usuarios.find(item => item.id === id);
    if (!usuario) return;
    const nuevoEstado = usuario.estado === 'Habilitado' ? 'Deshabilitado' : 'Habilitado';
    const anterior = usuario.estado;
    usuario.estado = nuevoEstado;
    renderizarUsuarios();
    try {
      if (location.protocol.startsWith('http')) {
        const respuesta = await fetch(`/api/admin/usuarios/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        if (respuesta.status !== 404) {
          const resultado = await respuesta.json();
          if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo actualizar el usuario.');
        }
      }
      guardarUsuariosLocales();
      renderizarInicio();
      notificar(`${usuario.nombres} ahora está ${nuevoEstado.toLowerCase()}.`, 'exito');
    } catch (error) {
      usuario.estado = anterior;
      renderizarUsuarios();
      notificar(error.message, 'error');
    }
  }

  function actualizarOpcionesGeograficas() {
    if (!estado.datos) return;
    const registros = estado.datos.registrosGeograficos;
    const modulo = $('#filtroModulo').value;
    const baseModulo = registros.filter(registro => !modulo || registro.modulo === modulo);
    llenarSelect($('#filtroRegion'), unicos(baseModulo.map(r => r.region)), 'Todas');
    const region = $('#filtroRegion').value;
    const baseRegion = baseModulo.filter(r => !region || r.region === region);
    llenarSelect($('#filtroDepartamento'), unicos(baseRegion.map(r => r.departamento)), 'Todos');
    const departamento = $('#filtroDepartamento').value;
    const baseDepartamento = baseRegion.filter(r => !departamento || r.departamento === departamento);
    llenarSelect($('#filtroProvincia'), unicos(baseDepartamento.map(r => r.provincia)), 'Todas');
    const provincia = $('#filtroProvincia').value;
    const baseProvincia = baseDepartamento.filter(r => !provincia || r.provincia === provincia);
    llenarSelect($('#filtroDistrito'), unicos(baseProvincia.map(r => r.distrito)), 'Todos');
    llenarSelect($('#filtroEstado'), unicos(baseModulo.map(r => r.estado)), 'Todos');
    llenarSelect($('#filtroEmpresa'), unicos(baseModulo.map(r => r.empresa)), 'Todas');
  }

  function iniciarMapa() {
    if (!window.L || estado.mapa) return;
    estado.mapa = L.map('mapaAdmin', { center: [-9.3, -75.2], zoom: 5, minZoom: 4, preferCanvas: true });
    estado.capasBase.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' });
    estado.capasBase.topografico = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '&copy; OpenTopoMap' });
    estado.capaBase = estado.capasBase.osm.addTo(estado.mapa);
    estado.capaAnalisis = L.layerGroup().addTo(estado.mapa);
    estado.mapa.doubleClickZoom.disable();
    estado.mapa.on('click', manejarClickMapa);
    estado.mapa.on('dblclick', finalizarDibujo);
    cargarLimitesGeograficos('departamento');
    aplicarFiltrosMapa(false);
  }

  function prepararPanelesMapa() {
    renderizarCatalogosMapa();
    const configuraciones = [
      ['botonMapasAdmin','panelMapasAdmin'], ['botonCapasAdmin','panelCapasAdmin'], ['botonTematicosAdmin','panelTematicosAdmin']
    ];
    configuraciones.forEach(([botonId, panelId]) => {
      $(`#${botonId}`).addEventListener('click', evento => {
        const panel = $(`#${panelId}`);
        const abrir = panel.hidden;
        $$('.panel-mapa-flotante').forEach(item => item.hidden = true);
        configuraciones.forEach(([id]) => $(`#${id}`).setAttribute('aria-expanded', 'false'));
        panel.hidden = !abrir;
        evento.currentTarget.setAttribute('aria-expanded', String(abrir));
      });
    });
    $$('[name="mapaBaseAdmin"]').forEach(radio => radio.addEventListener('change', () => {
      if (!estado.mapa) return;
      estado.mapa.removeLayer(estado.capaBase);
      estado.capaBase = estado.capasBase[radio.value].addTo(estado.mapa);
      estado.capaBase.bringToBack();
    }));
    $('#capaPuntos').addEventListener('change', evento => { estado.mostrarPuntos = evento.target.checked; renderizarCapasMapa(); });
    $('#capaClusters').addEventListener('change', evento => { estado.usarClusters = evento.target.checked; renderizarCapasMapa(); });
    $('#capaCalor').addEventListener('change', evento => { estado.mostrarCalor = evento.target.checked; $('#tematicoDensidad').checked = evento.target.checked; renderizarCapasMapa(); });
    $('#tematicoDensidad').addEventListener('change', evento => {
      estado.mostrarCalor = evento.target.checked;
      estado.tematicoActivo = null;
      $('#capaCalor').checked = evento.target.checked;
      $$('[name="tematicoModuloAdmin"]').forEach(radio => radio.checked = false);
      $('#descripcionTematicoAdmin').textContent = evento.target.checked ? 'Densidad conjunta de todos los módulos visibles.' : 'Sin análisis temático activo.';
      renderizarCapasMapa();
    });
    $('#gruposCapasModulos').addEventListener('change', evento => {
      const control = evento.target.closest('[data-capa-modulo]');
      const detalle = evento.target.closest('[data-capa-detalle]');
      if (control) {
        if (control.checked) estado.capasModuloActivas.add(control.dataset.capaModulo);
        else estado.capasModuloActivas.delete(control.dataset.capaModulo);
      } else if (detalle) {
        const activas = estado.capasDetalleActivas.get(detalle.dataset.capaDetalle) || new Set();
        if (detalle.checked) activas.add(detalle.value);
        else activas.delete(detalle.value);
        estado.capasDetalleActivas.set(detalle.dataset.capaDetalle, activas);
      } else return;
      renderizarCapasMapa();
      renderizarLeyendaModulos();
    });
    $('#gruposTematicosModulos').addEventListener('change', evento => {
      const control = evento.target.closest('[data-tematico-modulo]');
      if (!control) return;
      estado.tematicoActivo = { modulo: control.dataset.tematicoModulo, nombre: control.value };
      estado.mostrarCalor = true;
      $('#capaCalor').checked = true;
      $('#tematicoDensidad').checked = false;
      $('#descripcionTematicoAdmin').textContent = `${moduloPorId(estado.tematicoActivo.modulo)?.nombre || ''} · ${estado.tematicoActivo.nombre}`;
      renderizarCapasMapa();
    });
    $('#gruposTematicosModulos').addEventListener('click', evento => {
      if (!evento.target.closest('[data-desactivar-tematico]')) return;
      estado.tematicoActivo = null;
      estado.mostrarCalor = false;
      $('#capaCalor').checked = false;
      $$('[name="tematicoModuloAdmin"]').forEach(radio => radio.checked = false);
      $('#descripcionTematicoAdmin').textContent = 'Sin análisis temático activo.';
      renderizarCapasMapa();
    });
    $('#volverNivelGeografico').addEventListener('click', volverNivelGeografico);
  }

  function renderizarCatalogosMapa() {
    $('#gruposCapasModulos').innerHTML = estado.datos.modulos.map(modulo => `
      <details class="grupo-catalogo-modulo"${modulo.id === 'vale-fise' ? ' open' : ''}>
        <summary><i style="--color-modulo:${modulo.color}"></i><span>${textoSeguro(modulo.nombre)}</span><label onclick="event.stopPropagation()"><input type="checkbox" data-capa-modulo="${modulo.id}" checked> Visible</label></summary>
        <div class="contenido-catalogo-modulo">${(CAPAS_POR_MODULO[modulo.id] || [{ grupo: 'Registros', items: ['Registros del módulo'] }]).map(grupo => `
          <section class="subgrupo-catalogo-admin">
            <small>${textoSeguro(grupo.grupo)}</small>
            ${(grupo.items || []).map(capa => `<label><input type="checkbox" data-capa-detalle="${modulo.id}" value="${textoSeguro(capa)}" checked><span>${textoSeguro(capa)}</span></label>`).join('')}
          </section>`).join('')}
        </div>
      </details>
    `).join('');
    $('#gruposTematicosModulos').innerHTML = `
      ${estado.datos.modulos.map(modulo => `
        <details class="grupo-catalogo-modulo"${modulo.id === 'vale-fise' ? ' open' : ''}>
          <summary><i style="--color-modulo:${modulo.color}"></i><span>${textoSeguro(modulo.nombre)}</span></summary>
          <div class="contenido-catalogo-modulo">${(TEMATICOS_POR_MODULO[modulo.id] || []).map(grupo => `
            <section class="subgrupo-catalogo-admin subgrupo-tematico-admin">
              <small>${textoSeguro(grupo.grupo)}</small>
              ${(grupo.items || []).map(tema => {
                const item = typeof tema === 'string' ? { nombre: tema, descripcion: '' } : tema;
                return `<label><input type="radio" name="tematicoModuloAdmin" data-tematico-modulo="${modulo.id}" value="${textoSeguro(item.nombre)}"><span><b>${textoSeguro(item.nombre)}</b>${item.descripcion ? `<em>${textoSeguro(item.descripcion)}</em>` : ''}</span></label>`;
              }).join('')}
            </section>`).join('')}
          </div>
        </details>
      `).join('')}
      <button class="desactivar-tematico-admin" type="button" data-desactivar-tematico>Desactivar temático</button>`;
    renderizarLeyendaModulos();
  }

  function aplicarFiltrosMapa(ajustar) {
    if (!estado.datos) return;
    const campos = {
      modulo: $('#filtroModulo').value, region: $('#filtroRegion').value,
      departamento: $('#filtroDepartamento').value, provincia: $('#filtroProvincia').value,
      distrito: $('#filtroDistrito').value, proyecto: $('#filtroProyecto').value,
      estado: $('#filtroEstado').value, empresa: $('#filtroEmpresa').value
    };
    estado.registrosVisibles = estado.datos.registrosGeograficos.filter(registro =>
      Object.entries(campos).every(([campo, valor]) => !valor || registro[campo] === valor)
    );
    renderizarCapasMapa();
    renderizarResumenMapa();
    if (ajustar && estado.mapa && estado.registrosVisibles.length) {
      estado.mapa.fitBounds(estado.registrosVisibles.map(r => [r.lat, r.lng]), { padding: [50, 50], maxZoom: 11 });
    }
  }

  function renderizarCapasMapa() {
    if (!estado.mapa) return;
    [...estado.gruposClustersModulo.values(), ...estado.gruposPuntosModulo.values(), estado.capaCalor].forEach(capa => {
      if (capa && estado.mapa.hasLayer(capa)) estado.mapa.removeLayer(capa);
    });
    estado.gruposClustersModulo.clear();
    estado.gruposPuntosModulo.clear();
    const registrosActivos = estado.registrosVisibles.filter(registro =>
      estado.capasModuloActivas.has(registro.modulo) && registroVisiblePorCapa(registro)
    );
    estado.datos.modulos.forEach(modulo => {
      if (!estado.capasModuloActivas.has(modulo.id)) return;
      const registrosModulo = registrosActivos.filter(registro => registro.modulo === modulo.id);
      if (!registrosModulo.length) return;
      const clusters = crearGrupoClusters(modulo);
      const puntos = L.layerGroup();
      registrosModulo.forEach(registro => {
        clusters.addLayer(crearMarcadorRegistro(registro, modulo));
        puntos.addLayer(crearMarcadorRegistro(registro, modulo));
      });
      estado.gruposClustersModulo.set(modulo.id, clusters);
      estado.gruposPuntosModulo.set(modulo.id, puntos);
      if (estado.mostrarPuntos) (estado.usarClusters ? clusters : puntos).addTo(estado.mapa);
    });
    let registrosCalor = registrosActivos;
    if (estado.tematicoActivo) registrosCalor = registrosCalor.filter(registro => registro.modulo === estado.tematicoActivo.modulo);
    if (estado.mostrarCalor && window.L.heatLayer && registrosCalor.length) {
      estado.capaCalor = L.heatLayer(registrosCalor.map(r => [r.lat, r.lng, intensidadTematica(r)]), {
        radius: 34, blur: 28, maxZoom: 11,
        gradient: { .15: '#4faadb', .38: '#56d196', .62: '#f0d43c', .82: '#ef873d', 1: '#d7475b' }
      }).addTo(estado.mapa);
    }
    $('#contadorMapaAdmin').textContent = `${registrosActivos.length} registros visibles`;
    renderizarLeyendaModulos();
  }

  function crearMarcadorRegistro(registro, modulo) {
    const marcador = L.marker([registro.lat, registro.lng], {
      icon: crearIconoMarcador(registro, modulo),
      moduloColor: modulo ? modulo.color : '#4d91b1'
    });
    marcador.registroAdmin = registro;
    marcador.bindTooltip(`${modulo ? modulo.nombre : registro.modulo} · ${registro.id}`, { direction: 'top', offset: [0, -13] });
    marcador.on('click', () => mostrarDetalleRegistro(registro));
    return marcador;
  }

  function crearGrupoClusters(modulo) {
    const indiceModulo = Math.max(0, estado.datos.modulos.findIndex(item => item.id === modulo?.id));
    const angulo = (Math.PI * 2 * indiceModulo) / Math.max(1, estado.datos.modulos.length);
    const desplazamientoX = Math.round(Math.cos(angulo) * 10);
    const desplazamientoY = Math.round(Math.sin(angulo) * 10);
    return L.markerClusterGroup({
      maxClusterRadius: zoom => zoom <= 5 ? 180 : zoom <= 7 ? 105 : 58,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction(cluster) {
        const color = modulo?.color || '#4d8fac';
        const codigo = ICONOS_MODULO[modulo?.id] || 'MD';
        return L.divIcon({
          html: `<div style="--cluster-color:${color};--cluster-x:${desplazamientoX}px;--cluster-y:${desplazamientoY}px"><small>${codigo}</small><strong>${cluster.getChildCount()}</strong></div>`,
          className: 'cluster-admin',
          iconSize: [64, 64]
        });
      }
    });
  }

  function intensidadTematica(registro) {
    const valor = normalizar(`${registro.estado} ${estado.tematicoActivo?.nombre || ''}`);
    if (/fuera|inactiv|mora|critic|excluid/.test(valor)) return 1;
    if (/pendient|observ|proceso|suspend/.test(valor)) return .78;
    if (/liquidad|operativ|activo|compens/.test(valor)) return .55;
    return .68;
  }

  function registroVisiblePorCapa(registro) {
    const activas = estado.capasDetalleActivas.get(registro.modulo);
    if (!activas || !activas.size) return false;
    const estadoRegistro = normalizar(registro.estado);
    const capas = obtenerNombresCapas(registro.modulo);
    let patron = '';
    if (/activ|operativ/.test(estadoRegistro)) patron = 'activ|operativ';
    else if (/suspend/.test(estadoRegistro)) patron = 'suspend';
    else if (/excluid|inactiv/.test(estadoRegistro)) patron = 'excluid|inactiv';
    else if (/observ/.test(estadoRegistro)) patron = 'observ';
    else if (/liquidad/.test(estadoRegistro)) patron = 'liquidad';
    else if (/pendient/.test(estadoRegistro)) patron = 'pendient';
    else if (/fuera/.test(estadoRegistro)) patron = 'fuera';
    else if (/dentro/.test(estadoRegistro)) patron = 'dentro';
    else if (/certific/.test(estadoRegistro)) patron = 'certific';
    else if (/proceso|ejecucion/.test(estadoRegistro)) patron = 'proceso|ejecucion';
    if (patron) {
      const coincidente = capas.find(capa => new RegExp(patron).test(normalizar(capa)));
      if (coincidente) return activas.has(coincidente);
    }
    const capaGeneral = capas.find(capa => /beneficiarios|conversiones|proyectos|sistemas|registros/.test(normalizar(capa)));
    return capaGeneral ? activas.has(capaGeneral) : true;
  }

  function crearIconoMarcador(registro, modulo) {
    return L.divIcon({
      className: 'cluster-punto-admin',
      html: `<span style="--cluster-color:${modulo ? modulo.color : '#4d91b1'}"><small>${ICONOS_MODULO[registro.modulo] || 'MD'}</small><b>1</b></span>`,
      iconSize: [42, 42], iconAnchor: [21, 21]
    });
  }

  function renderizarLeyendaModulos() {
    const contenedor = $('#leyendaModulosAdmin');
    if (!contenedor || !estado.datos) return;
    const conteos = estado.registrosVisibles.reduce((acumulado, registro) => {
      if (estado.capasModuloActivas.has(registro.modulo) && registroVisiblePorCapa(registro)) {
        acumulado[registro.modulo] = (acumulado[registro.modulo] || 0) + 1;
      }
      return acumulado;
    }, {});
    contenedor.innerHTML = `
      <strong>Clusterización por módulo</strong>
      ${estado.datos.modulos.filter(modulo => estado.capasModuloActivas.has(modulo.id)).map(modulo =>
        `<span><i style="--color-modulo:${modulo.color}"></i><b>${textoSeguro(modulo.nombre)}</b><small>${conteos[modulo.id] || 0}</small></span>`
      ).join('')}`;
  }

  async function cargarLimitesGeograficos(nivel) {
    if (!estado.mapa || !window.L) return;
    const rutas = {
      departamento: '../../geo/peru_departamentos_gadm41.json',
      provincia: '../../geo/gadm41_PER_2.json',
      distrito: '../../geo/peru_distritos_gadm41.json'
    };
    try {
      if (!estado.geoDatos[nivel]) {
        const respuesta = await fetch(rutas[nivel], { cache: 'force-cache' });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        estado.geoDatos[nivel] = await respuesta.json();
      }
      if (estado.capaLimitesGeograficos && estado.mapa.hasLayer(estado.capaLimitesGeograficos)) {
        estado.mapa.removeLayer(estado.capaLimitesGeograficos);
      }
      const seleccion = estado.seleccionGeografica;
      const features = estado.geoDatos[nivel].features.filter(feature => {
        const propiedades = feature.properties || {};
        if (nivel === 'provincia') return normalizar(propiedades.NAME_1) === normalizar(seleccion.departamento);
        if (nivel === 'distrito') {
          return normalizar(propiedades.NAME_1) === normalizar(seleccion.departamento)
            && normalizar(propiedades.NAME_2) === normalizar(seleccion.provincia);
        }
        return true;
      });
      estado.capaLimitesGeograficos = L.geoJSON({ type: 'FeatureCollection', features }, {
        style: () => estilosLimiteGeografico(nivel),
        onEachFeature(feature, capa) {
          const nombre = feature.properties?.[nivel === 'departamento' ? 'NAME_1' : nivel === 'provincia' ? 'NAME_2' : 'NAME_3'] || '';
          capa.bindTooltip(nombre, { sticky: true, className: 'etiqueta-limite-admin' });
          capa.on({
            mouseover() { capa.setStyle({ weight: 2.4, fillOpacity: .14 }); },
            mouseout() { capa.setStyle(estilosLimiteGeografico(nivel)); },
            click(evento) {
              if (estado.herramientaActiva) return;
              if (evento.originalEvent) L.DomEvent.stopPropagation(evento.originalEvent);
              avanzarNivelGeografico(nivel, nombre, capa.getBounds());
            }
          });
        }
      }).addTo(estado.mapa);
      estado.capaLimitesGeograficos.bringToBack();
      actualizarIndicadorNivelGeografico();
    } catch (error) {
      console.warn('No se pudieron cargar los límites geográficos', error);
    }
  }

  function estilosLimiteGeografico(nivel) {
    const color = nivel === 'departamento' ? '#397fa6' : nivel === 'provincia' ? '#7d67c7' : '#44a983';
    return { color, weight: nivel === 'departamento' ? 1.35 : 1.7, opacity: .82, fillColor: color, fillOpacity: .035 };
  }

  function avanzarNivelGeografico(nivel, nombre, limites) {
    if (nivel === 'departamento') {
      estado.seleccionGeografica = { departamento: nombre, provincia: '', distrito: '' };
      estado.nivelGeografico = 'provincia';
      seleccionarOpcionGeografica('filtroDepartamento', nombre);
      actualizarOpcionesGeograficas();
      aplicarFiltrosMapa(false);
      cargarLimitesGeograficos('provincia');
    } else if (nivel === 'provincia') {
      estado.seleccionGeografica.provincia = nombre;
      estado.seleccionGeografica.distrito = '';
      estado.nivelGeografico = 'distrito';
      seleccionarOpcionGeografica('filtroProvincia', nombre);
      actualizarOpcionesGeograficas();
      aplicarFiltrosMapa(false);
      cargarLimitesGeograficos('distrito');
    } else {
      estado.seleccionGeografica.distrito = nombre;
      seleccionarOpcionGeografica('filtroDistrito', nombre);
      aplicarFiltrosMapa(false);
    }
    if (limites?.isValid()) estado.mapa.fitBounds(limites, { padding: [28, 28], maxZoom: nivel === 'distrito' ? 13 : 10 });
    actualizarIndicadorNivelGeografico();
  }

  function seleccionarOpcionGeografica(id, nombre) {
    const select = $(`#${id}`);
    const opcion = [...select.options].find(item => normalizar(item.value) === normalizar(nombre));
    if (opcion) select.value = opcion.value;
  }

  function volverNivelGeografico() {
    if (estado.nivelGeografico === 'distrito') {
      estado.nivelGeografico = 'provincia';
      estado.seleccionGeografica.provincia = '';
      estado.seleccionGeografica.distrito = '';
      $('#filtroProvincia').value = '';
      $('#filtroDistrito').value = '';
      actualizarOpcionesGeograficas();
      aplicarFiltrosMapa(false);
      cargarLimitesGeograficos('provincia');
    } else {
      estado.nivelGeografico = 'departamento';
      estado.seleccionGeografica = { departamento: '', provincia: '', distrito: '' };
      $('#filtroDepartamento').value = '';
      $('#filtroProvincia').value = '';
      $('#filtroDistrito').value = '';
      actualizarOpcionesGeograficas();
      aplicarFiltrosMapa(false);
      cargarLimitesGeograficos('departamento');
      estado.mapa.setView([-9.3, -75.2], 5);
    }
    actualizarIndicadorNivelGeografico();
  }

  function actualizarIndicadorNivelGeografico() {
    const contenedor = $('#nivelGeograficoAdmin');
    if (!contenedor) return;
    const seleccion = estado.seleccionGeografica;
    const etiqueta = seleccion.distrito
      ? `${seleccion.departamento} · ${seleccion.provincia} · ${seleccion.distrito}`
      : seleccion.provincia ? `${seleccion.departamento} · ${seleccion.provincia}`
        : seleccion.departamento ? seleccion.departamento : 'Vista nacional';
    $('span', contenedor).textContent = etiqueta;
    $('#volverNivelGeografico').hidden = estado.nivelGeografico === 'departamento';
  }

  function renderizarResumenMapa() {
    const registros = estado.registrosVisibles;
    const moduloFiltro = $('#filtroModulo').value;
    const modulo = moduloFiltro ? moduloPorId(moduloFiltro) : null;
    $('#resumenMapaTitulo').textContent = modulo ? modulo.nombre : 'Información global';
    $('#resumenMapaDescripcion').textContent = modulo ? modulo.descripcion : 'Integración transversal de todos los módulos.';
    $('#resumenMapaSobrelinea').textContent = modulo ? 'MÓDULO SELECCIONADO' : 'RESUMEN GENERAL';
    const departamentos = new Set(registros.map(r => r.departamento)).size;
    const proyectos = new Set(registros.map(r => r.proyecto)).size;
    const empresas = new Set(registros.map(r => r.empresa)).size;
    const gruposModulo = agrupar(registros, 'modulo');
    const maximo = Math.max(1, ...Object.values(gruposModulo));
    const distribucion = Object.entries(gruposModulo).sort((a,b) => b[1]-a[1]).map(([id, cantidad]) => {
      const item = moduloPorId(id);
      return `<div class="fila-distribucion"><span>${textoSeguro(item ? item.nombre : id)}</span><i style="--avance:${cantidad/maximo*100}%;--color:${item ? item.color : '#4d91b1'}"></i><b>${cantidad}</b></div>`;
    }).join('');
    $('#contenidoResumenMapa').innerHTML = `
      <div class="kpis-mapa">
        <article><span>Registros visibles</span><strong>${registros.length}</strong></article>
        <article><span>Departamentos</span><strong>${departamentos}</strong></article>
        <article><span>Proyectos</span><strong>${proyectos}</strong></article>
        <article><span>Empresas</span><strong>${empresas}</strong></article>
      </div>
      <section class="bloque-resumen"><h3>Distribución por módulo</h3><p>Registros incluidos en la vista actual.</p><div class="lista-distribucion">${distribucion || '<span>Sin registros para mostrar.</span>'}</div></section>
      <section class="bloque-resumen"><h3>Alcance SATCONTROL</h3><p>La vista centralizada combina los filtros seleccionados sin duplicar mapas por módulo.</p><button class="boton-principal boton-volver-resumen" type="button" data-exportar-resumen>Exportar vista actual</button></section>`;
    $('[data-exportar-resumen]').addEventListener('click', () => abrirExportacion('pdf'));
  }

  function mostrarDetalleRegistro(registro) {
    estado.ultimoRegistro = registro;
    estado.registrosSeleccionados = [registro];
    const modulo = moduloPorId(registro.modulo);
    const proyecto = proyectoPorId(registro.proyecto);
    $('#resumenMapaSobrelinea').textContent = 'REGISTRO SELECCIONADO';
    $('#resumenMapaTitulo').textContent = registro.id;
    $('#resumenMapaDescripcion').textContent = modulo ? modulo.nombre : registro.modulo;
    $('#contenidoResumenMapa').innerHTML = `
      <section class="bloque-resumen">
        <h3>Información del registro</h3><p>Datos consolidados desde el módulo de origen.</p>
        <dl class="detalle-registro">
          <div><dt>Código</dt><dd>${textoSeguro(registro.id)}</dd></div>
          <div><dt>Módulo</dt><dd>${textoSeguro(modulo ? modulo.nombre : registro.modulo)}</dd></div>
          <div><dt>Proyecto</dt><dd>${textoSeguro(proyecto ? proyecto.nombre : registro.proyecto)}</dd></div>
          <div><dt>Estado</dt><dd>${textoSeguro(registro.estado)}</dd></div>
          <div><dt>Región</dt><dd>${textoSeguro(registro.region)}</dd></div>
          <div><dt>Departamento</dt><dd>${textoSeguro(registro.departamento)}</dd></div>
          <div><dt>Provincia</dt><dd>${textoSeguro(registro.provincia)}</dd></div>
          <div><dt>Distrito</dt><dd>${textoSeguro(registro.distrito)}</dd></div>
          <div><dt>Empresa / concesionaria</dt><dd>${textoSeguro(registro.empresa)}</dd></div>
          <div><dt>Coordenadas</dt><dd>${registro.lat.toFixed(5)}, ${registro.lng.toFixed(5)}</dd></div>
        </dl>
      </section>
      <div class="acciones-seleccion-admin">
        <button class="boton-secundario" type="button" id="volverResumenMapa">Limpiar selección</button>
        <button class="boton-principal" type="button" id="exportarRegistroMapa">Exportar selección</button>
      </div>`;
    $('#volverResumenMapa').addEventListener('click', limpiarAnalisis);
    $('#exportarRegistroMapa').addEventListener('click', () => abrirExportacion('pdf'));
  }

  function agrupar(registros, campo) {
    return registros.reduce((acumulado, registro) => {
      acumulado[registro[campo]] = (acumulado[registro[campo]] || 0) + 1;
      return acumulado;
    }, {});
  }

  function prepararHerramientas() {
    renderizarHerramientasModulo();
    $('#botonHerramientasMapa').addEventListener('click', () => alternarPanelHerramientas($('#panelHerramientasMapa').hidden));
    $('#alternarHerramientas').addEventListener('click', () => {
      const panel = $('#panelHerramientasMapa');
      panel.classList.toggle('compacto');
      $('#alternarHerramientas span').textContent = panel.classList.contains('compacto') ? 'Ampliar' : 'Reducir';
      $('#alternarHerramientas b').textContent = panel.classList.contains('compacto') ? '↗' : '↙';
    });
    $('#cerrarHerramientas').addEventListener('click', () => alternarPanelHerramientas(false));
    $('#carruselHerramientas').addEventListener('click', () => cambiarModuloHerramientas(1));
    $('#herramientasModuloAnterior').addEventListener('click', () => cambiarModuloHerramientas(-1));
    $('#herramientasModuloSiguiente').addEventListener('click', () => cambiarModuloHerramientas(1));
    $('#selectorModuloHerramientas').addEventListener('change', evento => {
      estado.moduloHerramientas = evento.target.value;
      renderizarHerramientasModulo();
    });
    $('#gruposHerramientas').addEventListener('click', evento => {
      const boton = evento.target.closest('button');
      if (!boton) return;
      if (boton.dataset.moduloHerramienta && moduloPorId(boton.dataset.moduloHerramienta)) {
        estado.moduloHerramientas = boton.dataset.moduloHerramienta;
        $('#selectorModuloHerramientas').value = estado.moduloHerramientas;
      }
      if (boton.dataset.herramienta) activarHerramienta(boton.dataset.herramienta, boton);
      if (boton.dataset.exportarHerramienta) abrirExportacion(boton.dataset.exportarHerramienta);
      if (boton.dataset.herramientaEspecial) abrirHerramientaEspecial(boton.dataset.herramientaEspecial);
    });
    $$('[data-herramienta-rapida]').forEach(boton => boton.addEventListener('click', () => activarHerramienta(boton.dataset.herramientaRapida, boton)));
    $('#carruselHerramientasRapido').addEventListener('click', () => {
      cambiarModuloHerramientas(1);
      const modulo = moduloPorId(estado.moduloHerramientas);
      notificar(`Herramientas de ${modulo.nombre}.`);
    });
    $('#ampliarHerramientasRapido').addEventListener('click', () => {
      $('#panelHerramientasMapa').classList.remove('compacto');
      $('#alternarHerramientas span').textContent = 'Reducir';
      $('#alternarHerramientas b').textContent = '↙';
    });
    $('#limpiarAnalisis').addEventListener('click', limpiarAnalisis);
    $('#contenidoHerramientaModulo').addEventListener('click', evento => {
      const accionIa = evento.target.closest('[data-ia-gnv-admin]')?.dataset.iaGnvAdmin;
      if (!accionIa) return;
      if (accionIa === 'analizar') renderizarValidacionIaGnvAdmin(2);
      if (accionIa === 'reintentar') renderizarValidacionIaGnvAdmin(1);
      if (accionIa === 'guardar') {
        cerrarModal('modalHerramientaModulo');
        $('#estadoHerramienta').textContent = 'Validación documental IA · observación guardada';
        notificar('Resultado de validación IA guardado en la maqueta.', 'exito');
      }
    });
    $('#ejecutarHerramientaAdmin').addEventListener('click', () => {
      const seleccion = estado.herramientaEspecial;
      if (!seleccion) return;
      cerrarModal('modalHerramientaModulo');
      $('#estadoHerramienta').textContent = `${seleccion.herramienta.nombre} · ${seleccion.modulo.nombre}`;
      notificar(`${seleccion.herramienta.nombre} activada dentro de SATCONTROL.`, 'exito');
    });
    $('#filtroModulo').addEventListener('change', evento => {
      if (!evento.target.value || !moduloPorId(evento.target.value)) return;
      estado.moduloHerramientas = evento.target.value;
      renderizarHerramientasModulo();
    });
    $$('[data-cerrar-portal-herramienta]').forEach(boton => boton.addEventListener('click', cerrarPortalHerramienta));
    prepararArrastreHerramientas();
  }

  function renderizarHerramientasModulo() {
    const modulos = estado.datos?.modulos || [];
    if (!modulos.length) return;
    if (!moduloPorId(estado.moduloHerramientas)) estado.moduloHerramientas = modulos[0].id;
    const modulo = moduloPorId(estado.moduloHerramientas);
    const selector = $('#selectorModuloHerramientas');
    selector.innerHTML = modulos.map(item => `<option value="${textoSeguro(item.id)}"${item.id === modulo.id ? ' selected' : ''}>${textoSeguro(item.nombre)}</option>`).join('');
    const indice = modulos.findIndex(item => item.id === modulo.id);
    $('#tituloHerramientasModulo').textContent = 'Herramientas por módulo';
    $('#posicionCarruselHerramientas').textContent = `${indice + 1} / ${modulos.length}`;

    const herramientasSeleccion = [
      { id: 'consultar', nombre: 'Seleccionar', detalle: 'Consultar un registro del mapa' },
      { id: 'poligono', nombre: 'Polígono', detalle: 'Seleccionar mediante un área' },
      { id: 'circulo', nombre: 'Círculo', detalle: 'Seleccionar mediante un radio' }
    ];
    $('#gruposHerramientas').innerHTML = modulos.map(itemModulo => {
      const especiales = HERRAMIENTAS_ESPECIALES_ADMIN[itemModulo.id] || [];
      const herramientas = [
        ...herramientasSeleccion.map(item => ({ ...item, especial: false })),
        ...especiales.map(item => ({ ...item, especial: true }))
      ];
      return `<section class="fila-herramientas-modulo${itemModulo.id === modulo.id ? ' activa' : ''}" data-fila-modulo="${textoSeguro(itemModulo.id)}" style="--color-modulo:${textoSeguro(itemModulo.color || '#4f8ead')}">
        <h4><i aria-hidden="true"></i><span>${textoSeguro(itemModulo.nombre)}</span></h4>
        <div class="lista-herramientas-modulo">
          ${herramientas.map(item => {
            const atributo = item.especial
              ? `data-herramienta-especial="${textoSeguro(item.id)}"`
              : `data-herramienta="${textoSeguro(item.id)}"`;
            return `<button type="button" ${atributo} data-modulo-herramienta="${textoSeguro(itemModulo.id)}" title="${textoSeguro(`${item.nombre}: ${item.detalle}`)}">
              <i aria-hidden="true">${iconoHerramientaAdmin(item)}</i>
              <span><b>${textoSeguro(item.nombre)}</b></span>
            </button>`;
          }).join('')}
        </div>
      </section>`;
    }).join('');
  }

  function iconoHerramientaAdmin(item) {
    const clave = normalizar(`${item.id || ''} ${item.exportar || ''}`);
    let dibujo = '<path d="M9.5 4.5a4 4 0 0 0 5 5L20 15l-5 5-5.5-5.5a4 4 0 0 0-5-5l3 2.5 2-2L7 7l2.5-2.5z"/>';
    if (clave.includes('consultar')) dibujo = '<path d="M5 3l13 8-6 2-2 6L5 3Z"/>';
    else if (clave.includes('poligono')) dibujo = '<path d="m5 7 7-3 7 5-2 9-10 1-2-12Z"/><circle cx="5" cy="7" r="1.3"/><circle cx="12" cy="4" r="1.3"/><circle cx="19" cy="9" r="1.3"/><circle cx="17" cy="18" r="1.3"/><circle cx="7" cy="19" r="1.3"/>';
    else if (clave.includes('circulo')) dibujo = '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.2"/>';
    else if (clave.includes('distancia')) dibujo = '<path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3"/>';
    else if (clave.includes('area')) dibujo = '<path d="m4 18 5-12 11 11-16 1Z"/><path d="m9 6 3 12"/>';
    else if (clave.includes('capas')) dibujo = '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/>';
    else if (clave.includes('cluster')) dibujo = '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><circle cx="12" cy="16" r="3"/>';
    else if (clave.includes('calor')) dibujo = '<path d="M13 3c1 4-2 5-2 8 0 2 1 3 3 3 2 0 4-2 4-5 2 2 3 4 3 6a9 9 0 0 1-18 0c0-4 2-7 6-10 0 3 1 4 2 4 2 0 3-3 2-6Z"/>';
    else if (clave.includes('puntos')) dibujo = '<circle cx="6" cy="7" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="12" cy="16" r="2"/><path d="m8 8 3 6m2 0 3-6M8 7h7"/>';
    else if (clave.includes('detalle')) dibujo = '<circle cx="12" cy="12" r="8"/><path d="M12 11v6M12 7h.01"/>';
    else if (clave.includes('modulo')) dibujo = '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>';
    else if (clave.includes('pdf') || clave.includes('csv') || clave.includes('xlsx') || clave.includes('informe') || clave.includes('dger') || clave.includes('liquidacion') || clave.includes('expediente')) dibujo = '<path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v5h5M10 12h5M10 16h5"/>';
    else if (clave.includes('ia')) dibujo = '<rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 4v3M8 12h.01M16 12h.01M9 16h6"/>';
    else if (clave.includes('alerta')) dibujo = '<path d="M6 16h12l-2-3V9a4 4 0 0 0-8 0v4l-2 3ZM10 19h4"/>';
    else if (clave.includes('canje')) dibujo = '<path d="M4 8h14l-3-3M20 16H6l3 3"/>';
    else if (clave.includes('agente') || clave.includes('beneficiario') || clave.includes('ranking')) dibujo = '<circle cx="10" cy="8" r="3"/><path d="M4 19c1-4 3-6 6-6s5 2 6 6M18 9c2 0 3 1 3 3 0 3-3 5-3 5s-3-2-3-5c0-2 1-3 3-3Z"/>';
    else if (clave.includes('nuevo')) dibujo = '<path d="M12 21s6-5 6-11a6 6 0 1 0-12 0c0 6 6 11 6 11Z"/><path d="M12 7v6M9 10h6"/>';
    else if (clave.includes('subir')) dibujo = '<path d="M12 16V4M8 8l4-4 4 4M5 14v6h14v-6"/>';
    else if (clave.includes('ubicacion') || clave.includes('trazabilidad') || clave.includes('resolucion') || clave.includes('plazo')) dibujo = '<path d="M5 6h5v5H5V6Zm9 7h5v5h-5v-5ZM10 8h4a3 3 0 0 1 3 3v2M14 16h-4a3 3 0 0 1-3-3v-2"/>';
    return `<svg viewBox="0 0 24 24" focusable="false">${dibujo}</svg>`;
  }

  function cambiarModuloHerramientas(direccion) {
    const modulos = estado.datos?.modulos || [];
    if (!modulos.length) return;
    const actual = Math.max(0, modulos.findIndex(modulo => modulo.id === estado.moduloHerramientas));
    estado.moduloHerramientas = modulos[(actual + direccion + modulos.length) % modulos.length].id;
    renderizarHerramientasModulo();
  }

  function abrirHerramientaEspecial(id) {
    const modulo = moduloPorId(estado.moduloHerramientas);
    const herramienta = (HERRAMIENTAS_ESPECIALES_ADMIN[estado.moduloHerramientas] || []).find(item => item.id === id);
    if (!modulo || !herramienta) return;
    estado.herramientaEspecial = { modulo, herramienta };
    if (PORTALES_HERRAMIENTAS_ADMIN[id]) {
      abrirPortalHerramienta(herramienta, modulo, PORTALES_HERRAMIENTAS_ADMIN[id]);
      return;
    }
    if (['nuevo-fotovoltaico', 'nuevo-eat', 'nuevo-mcter'].includes(id)) {
      activarCapturaPuntoEspecial(herramienta, modulo);
      return;
    }
    if (id === 'agentes-vale-fise') {
      activarAgentesCercanosAdmin();
      return;
    }
    $('#moduloHerramientaModal').textContent = modulo.nombre;
    $('#tituloHerramientaModuloModal').textContent = herramienta.nombre;
    $('#descripcionHerramientaModuloModal').textContent = herramienta.detalle;
    renderizarContenidoHerramientaModulo(herramienta, modulo);
    abrirModal('modalHerramientaModulo');
  }

  let temporizadorPortalHerramienta = null;
  let observadorPortalHerramienta = null;

  function abrirPortalHerramienta(herramienta, modulo, configuracion) {
    cerrarModal('modalHerramientaModulo');
    const modal = $('#modalPortalHerramienta');
    const marco = $('#iframePortalHerramienta');
    const cargando = $('#cargandoPortalHerramienta');
    modal.classList.toggle('es-fragmento', !!configuracion.fragmento);
    modal.querySelector('section').classList.remove('cargado');
    $('#moduloPortalHerramienta').textContent = modulo.nombre;
    $('#tituloPortalHerramienta').textContent = herramienta.nombre;
    cargando.hidden = false;
    marco.hidden = true;
    marco.onload = () => prepararPortalCargado(configuracion, herramienta, modulo);
    marco.src = `${configuracion.ruta}${configuracion.ruta.includes('?') ? '&' : '?'}t=${Date.now()}`;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function prepararPortalCargado(configuracion, herramienta, modulo) {
    const marco = $('#iframePortalHerramienta');
    let intentos = 0;
    let aperturaSolicitada = false;
    clearInterval(temporizadorPortalHerramienta);
    temporizadorPortalHerramienta = setInterval(() => {
      intentos += 1;
      let documento;
      try {
        documento = marco.contentDocument;
      } catch (error) {
        clearInterval(temporizadorPortalHerramienta);
        return mostrarErrorPortal('No fue posible abrir la herramienta dentro de Administración.');
      }
      if (!documento?.body) return;
      const objetivo = documento.querySelector(configuracion.objetivo);
      if (!objetivo) {
        if (intentos > 50) {
          clearInterval(temporizadorPortalHerramienta);
          mostrarErrorPortal('La herramienta no terminó de cargar. Intente nuevamente.');
        }
        return;
      }
      if (configuracion.preparar === 'ranking-bonogas' && !aperturaSolicitada) {
        prepararRankingBonogasPortal(documento, objetivo);
        aperturaSolicitada = true;
      } else if (configuracion.fragmento) {
        aperturaSolicitada = true;
      } else if (configuracion.abrir) {
        const disparador = documento.querySelector(configuracion.abrir);
        if (disparador && (intentos % 3 === 0 || !aperturaSolicitada)) {
          disparador.click();
          aperturaSolicitada = true;
        }
      }
      const visible = configuracion.fragmento || objetivo.open || (!objetivo.hidden && getComputedStyle(objetivo).display !== 'none');
      if (!visible) {
        if (intentos > 50) {
          clearInterval(temporizadorPortalHerramienta);
          mostrarErrorPortal('No se pudo iniciar el flujo del módulo.');
        }
        return;
      }
      clearInterval(temporizadorPortalHerramienta);
      if (configuracion.despues) documento.querySelector(configuracion.despues)?.click();
      aislarObjetivoPortal(documento, objetivo, configuracion, herramienta, modulo);
    }, 180);
  }

  function aislarObjetivoPortal(documento, objetivo, configuracion, herramienta, modulo) {
    const marco = $('#iframePortalHerramienta');
    const seccionPortal = $('#modalPortalHerramienta > section');
    objetivo.classList.add('objetivo-portal-admin');
    if (configuracion.fragmento) {
      const contenedor = documento.createElement('main');
      contenedor.className = 'fragmento-portal-admin objetivo-portal-admin';
      objetivo.parentNode?.insertBefore(contenedor, objetivo);
      contenedor.appendChild(objetivo);
      objetivo = contenedor;
    }
    const estilo = documento.createElement('style');
    estilo.dataset.portalAdmin = 'true';
    estilo.textContent = `
      html,body{margin:0!important;min-height:100%!important;background:transparent!important}
      body{overflow:auto!important;padding:0!important}
      body> :not(.objetivo-portal-admin):not(script):not(style):not(link){display:none!important}
      .objetivo-portal-admin{box-sizing:border-box!important}
      .fragmento-portal-admin{width:100%!important;min-height:100vh!important;padding:22px!important;background:#eef4f8!important}
      .fragmento-portal-admin>*{display:block!important;position:relative!important;inset:auto!important;width:min(1100px,100%)!important;max-width:none!important;margin:0 auto!important}
      dialog.objetivo-portal-admin,[role="dialog"].objetivo-portal-admin{max-width:calc(100vw - 24px)!important}
    `;
    documento.head.appendChild(estilo);
    $('#cargandoPortalHerramienta').hidden = true;
    marco.hidden = false;
    seccionPortal.classList.add('cargado');
    if (configuracion.fragmento) seccionPortal.classList.add('cargado-fragmento');
    else seccionPortal.classList.remove('cargado-fragmento');
    if (objetivo.tagName === 'DIALOG') {
      if (!objetivo.open) objetivo.showModal();
      objetivo.addEventListener('close', cerrarPortalHerramienta, { once: true });
    }
    observadorPortalHerramienta?.disconnect();
    observadorPortalHerramienta = new MutationObserver(() => {
      if ((objetivo.tagName === 'DIALOG' && !objetivo.open) || objetivo.hidden) cerrarPortalHerramienta();
    });
    observadorPortalHerramienta.observe(objetivo, { attributes: true, attributeFilter: ['hidden', 'open'] });
    $('#estadoHerramienta').textContent = `${herramienta.nombre} · ${modulo.nombre}`;
  }

  function prepararRankingBonogasPortal(documento, modal) {
    const empresas = [
      ['Instalaciones del Norte S.A.C.', 94, 186, 'Apta'],
      ['Conexiones Seguras S.A.C.', 91, 158, 'Apta'],
      ['Gas & Hogar E.I.R.L.', 88, 142, 'Apta'],
      ['GasSur Instalaciones S.A.C.', 86, 121, 'Apta'],
      ['RedGas Perú S.A.C.', 84, 108, 'Apta'],
      ['TecnoGas Arequipa', 79, 83, 'Observada']
    ];
    const lista = documento.querySelector('#listaRankingEmpresas');
    const detalle = documento.querySelector('#detalleRankingEmpresa');
    const actual = documento.querySelector('#empresaRankingActual');
    if (lista) lista.innerHTML = empresas.map((empresa, indice) => `<button class="empresa-ranking" type="button" data-indice="${indice}"><strong>${indice + 1}</strong><div><b>${empresa[0]}</b><small>${empresa[2]} expedientes · ${empresa[3]}</small></div><span>${empresa[1]}</span></button>`).join('');
    const mostrar = indice => {
      const empresa = empresas[indice] || empresas[0];
      if (actual) actual.textContent = empresa[0];
      if (detalle) detalle.innerHTML = `<h3>${empresa[0]}</h3><div class="ranking-metricas"><article><span>Score actual</span><strong>${empresa[1]}/100</strong></article><article><span>Conformidad</span><strong>${Math.min(98, empresa[1] + 3)}%</strong></article><article><span>Retrabajos</span><strong>${Math.max(1, 100 - empresa[1]) / 3}%</strong></article><article><span>Plazo promedio</span><strong>4.2 días</strong></article></div><p class="recomendacion-ranking">${empresa[3] === 'Apta' ? 'Empresa recomendada para nuevos agrupamientos por su desempeño sostenido.' : 'Empresa observada: requiere seguimiento antes de nuevas asignaciones.'}</p>`;
    };
    lista?.querySelectorAll('button').forEach(boton => boton.addEventListener('click', () => mostrar(Number(boton.dataset.indice))));
    mostrar(0);
    if (!modal.open) modal.showModal();
  }

  function mostrarErrorPortal(mensaje) {
    $('#cargandoPortalHerramienta').innerHTML = `<span class="error">!</span><b>No se pudo abrir la herramienta</b><small>${textoSeguro(mensaje)}</small>`;
  }

  function cerrarPortalHerramienta() {
    clearInterval(temporizadorPortalHerramienta);
    observadorPortalHerramienta?.disconnect();
    observadorPortalHerramienta = null;
    const modal = $('#modalPortalHerramienta');
    const marco = $('#iframePortalHerramienta');
    modal.hidden = true;
    marco.onload = null;
    marco.src = 'about:blank';
    marco.hidden = true;
    modal.querySelector('section').classList.remove('cargado', 'cargado-fragmento');
    if (!$$('.modal-admin:not([hidden])').length) document.body.style.overflow = '';
  }

  function activarCapturaPuntoEspecial(herramienta, modulo) {
    estado.herramientaActiva = 'nuevo-punto-especial';
    estado.herramientaPuntoEspecial = { herramienta, modulo };
    estado.mapa.getContainer().style.cursor = 'crosshair';
    alternarPanelHerramientas(false);
    $('#estadoHerramienta').textContent = `${herramienta.nombre}: haga clic en el mapa para capturar las coordenadas.`;
    notificar('Seleccione la ubicación del nuevo punto en el mapa.');
  }

  function mostrarFormularioPuntoEspecial(seleccion, latlng) {
    if (!seleccion) return;
    const { herramienta, modulo } = seleccion;
    const esFotovoltaico = herramienta.id === 'nuevo-fotovoltaico';
    const prefijo = esFotovoltaico ? 'PFV' : herramienta.id === 'nuevo-eat' ? 'EAT' : 'MCT';
    estado.herramientaEspecial = seleccion;
    $('#moduloHerramientaModal').textContent = modulo.nombre;
    $('#tituloHerramientaModuloModal').textContent = herramienta.nombre;
    $('#descripcionHerramientaModuloModal').textContent = 'Punto capturado en el SATCONTROL de Administración. Complete la ficha técnica y envíela a supervisión.';
    $('#accionesHerramientaModulo').hidden = true;
    $('#contenidoHerramientaModulo').innerHTML = `
      <div class="cabecera-flujo-herramienta">
        <i>${iconoHerramientaAdmin(herramienta)}</i>
        <div><small>COORDENADAS CAPTURADAS</small><h3>${prefijo}-${String(Math.floor(Math.random() * 900) + 100).padStart(6, '0')}</h3><p>El registro permanecerá asociado al módulo ${textoSeguro(modulo.nombre)}.</p></div>
      </div>
      <form class="formulario-punto-admin" id="formularioPuntoAdmin">
        <label>Latitud<input value="${latlng.lat.toFixed(5)}" readonly></label>
        <label>Longitud<input value="${latlng.lng.toFixed(5)}" readonly></label>
        <label>Tecnología<select><option>Bifacial</option><option>Monocristalino</option></select></label>
        <label>Capacidad<input value="550 Wp"></label>
        <label>Inversor<input value="3 kVA"></label>
        <label>Batería<input value="5 x 100 Ah"></label>
        <label>Instalación<input type="date" value="2025-12-12"></label>
        <label>Último mantenimiento<input type="date" value="2026-06-10"></label>
        <label>Sincronización<select><option>Sincronizado</option><option>Pendiente de sincronización</option></select></label>
        <label>OPEX<select><option>Pago OPEX habilitado</option><option>Pago bloqueado</option></select></label>
        <label class="campo-ancho">Observación<textarea>Equipo operativo sin incidencias críticas.</textarea></label>
        <label class="campo-ancho">Enviar a usuario<select><option>Seleccionar usuario supervisor</option><option>Supervisor regional</option><option>Coordinador de programa</option></select></label>
        <div class="estado-envio-punto"><span>Estado de envío</span><b>Pendiente de envío</b></div>
        <footer>
          <button class="boton-secundario" type="button" data-cancelar-punto>Guardar borrador</button>
          <button class="boton-principal" type="submit">Enviar a supervisión</button>
        </footer>
      </form>`;
    abrirModal('modalHerramientaModulo');
    $('#formularioPuntoAdmin').addEventListener('submit', evento => {
      evento.preventDefault();
      cerrarModal('modalHerramientaModulo');
      $('#accionesHerramientaModulo').hidden = false;
      notificar(`${herramienta.nombre} enviado a supervisión.`, 'exito');
    });
    $('[data-cancelar-punto]').addEventListener('click', () => {
      cerrarModal('modalHerramientaModulo');
      $('#accionesHerramientaModulo').hidden = false;
      notificar('Borrador guardado en la maqueta.');
    });
  }

  function activarAgentesCercanosAdmin() {
    const filtro = $('#filtroModulo');
    filtro.value = 'vale-fise';
    aplicarFiltrosMapa();
    estado.ultimoRegistro = null;
    renderizarResumenMapa();
    $('#resumenMapaSobrelinea').textContent = 'AGENTES MÁS CERCANOS';
    $('#resumenMapaTitulo').textContent = 'Cobertura de atención';
    $('#resumenMapaDescripcion').textContent = 'Seleccione un beneficiario para consultar los agentes próximos.';
    alternarPanelHerramientas(false);
    activarHerramienta('consultar', $('[data-herramienta-rapida="consultar"]'));
  }

  function renderizarContenidoHerramientaModulo(herramienta, modulo) {
    const contenido = $('#contenidoHerramientaModulo');
    const accion = $('#ejecutarHerramientaAdmin');
    $('#accionesHerramientaModulo').hidden = false;
    accion.hidden = herramienta.id === 'ia-gnv';
    accion.textContent = 'Ejecutar demostración';
    if (herramienta.id === 'ia-gnv') {
      renderizarValidacionIaGnvAdmin(1);
      return;
    }
    contenido.innerHTML = `
      <span class="estado-maqueta-herramienta">Demostración operativa</span>
      <div class="cabecera-flujo-herramienta">
        <i>${iconoHerramientaAdmin(herramienta)}</i>
        <div><small>${textoSeguro(modulo.nombre)}</small><h3>${textoSeguro(herramienta.nombre)}</h3><p>${textoSeguro(herramienta.detalle)}</p></div>
      </div>
      <div class="pasos-herramienta-modulo">
        <span><b>1</b>Configurar datos</span>
        <span><b>2</b>Procesar maqueta</span>
        <span><b>3</b>Revisar resultado</span>
      </div>
      <aside class="nota-herramienta-admin"><b>Uso centralizado</b><span>El flujo se ejecuta aquí mismo, sin abandonar el SATCONTROL de Administración.</span></aside>`;
  }

  function renderizarValidacionIaGnvAdmin(paso) {
    const contenido = $('#contenidoHerramientaModulo');
    const pasos = `
      <ol class="pasos-validacion-ia-admin" aria-label="Flujo de validación">
        <li class="${paso >= 1 ? 'activo' : ''}"><b>1</b><span>Evidencias</span></li>
        <li class="${paso >= 2 ? 'activo' : ''}"><b>2</b><span>Validación IA</span></li>
        <li class="${paso >= 3 ? 'activo' : ''}"><b>3</b><span>Resultados</span></li>
      </ol>`;
    if (paso === 1) {
      contenido.innerHTML = `${pasos}
        <section class="paso-ia-admin">
          <div class="intro-ia-admin"><span>IA</span><div><small>PASO 1 DE 3</small><h3>Documentos del expediente</h3><p>La maqueta utiliza evidencias preparadas; no necesita seleccionar archivos.</p></div></div>
          <div class="evidencias-ia-admin">
            <article><i>${iconoDocumentoAdmin()}</i><span><b>DNI escaneado</b><small>DNI_42180005.pdf · evidencia disponible</small></span><strong>Listo</strong></article>
            <article><i>${iconoDocumentoAdmin()}</i><span><b>Tarjeta de Identificación Vehicular</b><small>TIV_V8A105.pdf · evidencia disponible</small></span><strong>Listo</strong></article>
            <article><i>${iconoFirmaAdmin()}</i><span><b>Firma de respaldo</b><small>Base histórica del beneficiario</small></span><strong>Listo</strong></article>
          </div>
          <aside class="criterios-ia-admin"><b>Criterios automáticos</b><span>Tipografía y zonas editadas</span><span>Numeración documental</span><span>Comparación de firma</span></aside>
          <footer class="acciones-flujo-admin"><button class="boton-secundario" type="button" data-cerrar-modal="modalHerramientaModulo">Cancelar</button><button class="boton-principal" type="button" data-ia-gnv-admin="analizar">Continuar y validar con IA</button></footer>
        </section>`;
      return;
    }
    if (paso === 2) {
      contenido.innerHTML = `${pasos}
        <section class="paso-ia-admin">
          <div class="intro-ia-admin"><span>IA</span><div><small>PASO 2 DE 3</small><h3>Analizando documentos y firmas</h3><p>El asistente contrasta tipografías, numeración y firma con la base histórica.</p></div></div>
          <div class="escaneo-ia-admin"><div class="animacion-ia-admin"><i></i><span>IA</span></div><div><strong>Validación antifraude en curso…</strong><small>Modelo demostrativo · revisión preventiva</small></div></div>
          <div class="lista-analisis-ia-admin">
            <article class="aprobado"><span>DNI escaneado</span><b>Conforme</b></article>
            <article class="procesando"><span>Tarjeta de Identificación Vehicular</span><b>Analizando…</b></article>
            <article><span>Firma de respaldo</span><b>En espera</b></article>
          </div>
        </section>`;
      window.setTimeout(() => {
        if (!$('#modalHerramientaModulo').hidden && estado.herramientaEspecial?.herramienta.id === 'ia-gnv') renderizarValidacionIaGnvAdmin(3);
      }, 950);
      return;
    }
    contenido.innerHTML = `${pasos}
      <section class="paso-ia-admin resultado-ia-admin">
        <header><div><small>PASO 3 DE 3 · RESULTADO DEMOSTRATIVO</small><h3>Revisión con observaciones</h3><p>La evidencia observada puede corregirse sin anular el expediente.</p></div><span>1 alerta</span></header>
        <div class="kpis-ia-admin"><article><span>Analizados</span><strong>3</strong></article><article><span>Conformes</span><strong>2</strong></article><article class="observado"><span>Observados</span><strong>1</strong></article><article><span>Precisión simulada</span><strong>96%</strong></article></div>
        <div class="resultados-documentos-ia-admin">
          <article class="correcto"><span>DNI</span><strong>Documento consistente</strong><small>Numeración y tipografía sin alteraciones visibles.</small></article>
          <article class="alerta"><span>TIV</span><strong>Posible alteración tipográfica</strong><small>El campo “Serie” presenta fuente y espaciado inconsistentes.</small></article>
          <article class="firma"><span>Firma</span><strong>92% de coincidencia</strong><small>Comparada con el registro histórico de respaldo.</small><i><b style="width:92%"></b></i></article>
        </div>
        <aside class="alerta-ia-admin"><i>!</i><div><b>Alerta visual preventiva</b><p>Derivar la TIV a revisión humana antes de aprobar. El DNI y la firma pueden continuar.</p></div></aside>
        <footer class="acciones-flujo-admin"><button class="boton-secundario" type="button" data-ia-gnv-admin="reintentar">Revisar nuevamente</button><button class="boton-principal" type="button" data-ia-gnv-admin="guardar">Guardar observación</button></footer>
      </section>`;
  }

  function iconoDocumentoAdmin() {
    return '<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v5h5M10 12h5M10 16h5"/></svg>';
  }

  function iconoFirmaAdmin() {
    return '<svg viewBox="0 0 24 24"><path d="M4 18c4-5 5-8 7-8 3 0-1 6 2 6 2 0 3-3 5-2M4 20h16"/><path d="m15 6 2-2 3 3-2 2-3-3Z"/></svg>';
  }

  function prepararArrastreHerramientas() {
    const panel = $('#panelHerramientasMapa');
    let arrastre = null;
    const controles = $$('[data-mover-panel]');
    controles.forEach(control => control.addEventListener('pointerdown', evento => {
      evento.preventDefault();
      const caja = panel.getBoundingClientRect();
      arrastre = { dx: evento.clientX - caja.left, dy: evento.clientY - caja.top, control };
      panel.style.position = 'fixed';
      panel.style.left = `${caja.left}px`;
      panel.style.top = `${caja.top}px`;
      panel.style.right = 'auto';
      panel.classList.add('arrastrando');
      control.setPointerCapture(evento.pointerId);
    }));
    controles.forEach(control => control.addEventListener('pointermove', evento => {
      if (!arrastre) return;
      const ancho = panel.offsetWidth;
      const alto = panel.offsetHeight;
      const izquierda = Math.max(8, Math.min(evento.clientX - arrastre.dx, window.innerWidth - ancho - 8));
      const arriba = Math.max(8, Math.min(evento.clientY - arrastre.dy, window.innerHeight - alto - 8));
      panel.style.left = `${izquierda}px`;
      panel.style.top = `${arriba}px`;
    }));
    const terminar = evento => {
      if (!arrastre) return;
      const control = arrastre.control;
      arrastre = null;
      panel.classList.remove('arrastrando');
      if (control.hasPointerCapture(evento.pointerId)) control.releasePointerCapture(evento.pointerId);
    };
    controles.forEach(control => {
      control.addEventListener('pointerup', terminar);
      control.addEventListener('pointercancel', terminar);
    });
  }

  function alternarPanelHerramientas(abrir) {
    $('#panelHerramientasMapa').hidden = !abrir;
    $('#botonHerramientasMapa').setAttribute('aria-expanded', String(abrir));
  }

  function activarHerramienta(herramienta, boton) {
    if (!estado.mapa) return;
    if (herramienta === 'capas') return $('#botonCapasAdmin').click();
    if (herramienta === 'cluster') {
      estado.usarClusters = !estado.usarClusters; $('#capaClusters').checked = estado.usarClusters; renderizarCapasMapa();
      return notificar(`Clusterización ${estado.usarClusters ? 'activada' : 'desactivada'}.`);
    }
    if (herramienta === 'calor') {
      estado.mostrarCalor = !estado.mostrarCalor; $('#capaCalor').checked = estado.mostrarCalor; $('#tematicoDensidad').checked = estado.mostrarCalor; renderizarCapasMapa();
      return notificar(`Mapa de calor ${estado.mostrarCalor ? 'activado' : 'desactivado'}.`);
    }
    if (herramienta === 'puntos') {
      estado.mostrarPuntos = !estado.mostrarPuntos; $('#capaPuntos').checked = estado.mostrarPuntos; renderizarCapasMapa();
      return notificar(`Puntos ${estado.mostrarPuntos ? 'visibles' : 'ocultos'}.`);
    }
    if (herramienta === 'detalle') {
      if (estado.ultimoRegistro) mostrarDetalleRegistro(estado.ultimoRegistro);
      else notificar('Seleccione primero un registro en el mapa.');
      return;
    }
    if (herramienta === 'modulo') {
      estado.ultimoRegistro = null; renderizarResumenMapa(); notificar('Resumen del módulo actualizado.');
      return;
    }
    if (herramienta === 'malla') {
      alternarMalla(); return;
    }
    estado.herramientaActiva = estado.herramientaActiva === herramienta ? '' : herramienta;
    estado.puntosDibujo = [];
    if (estado.dibujoTemporal) { estado.capaAnalisis.removeLayer(estado.dibujoTemporal); estado.dibujoTemporal = null; }
    $$('[data-herramienta], [data-herramienta-rapida]').forEach(item => item.classList.toggle('activa', item === boton && !!estado.herramientaActiva));
    estado.mapa.getContainer().style.cursor = estado.herramientaActiva ? 'crosshair' : '';
    const mensajes = {
      distancia: 'Haga clic en los puntos de la ruta y doble clic para finalizar.',
      area: 'Marque al menos 3 puntos y doble clic para cerrar el área.',
      poligono: 'Marque al menos 3 vértices y doble clic para cerrar el polígono.',
      circulo: 'Haga clic en el centro y luego en el límite del círculo.',
      consultar: 'Seleccione un punto del mapa para consultar sus coordenadas.'
    };
    $('#estadoHerramienta').textContent = estado.herramientaActiva ? mensajes[estado.herramientaActiva] : 'Seleccione una herramienta';
  }

  function manejarClickMapa(evento) {
    const herramienta = estado.herramientaActiva;
    if (!herramienta) return;
    if (herramienta === 'nuevo-punto-especial') {
      const seleccion = estado.herramientaPuntoEspecial;
      estado.herramientaPuntoEspecial = null;
      finalizarHerramienta();
      mostrarFormularioPuntoEspecial(seleccion, evento.latlng);
      return;
    }
    if (herramienta === 'consultar') {
      const cercano = buscarRegistroCercano(evento.latlng);
      if (cercano) mostrarDetalleRegistro(cercano);
      else notificar(`Coordenadas: ${evento.latlng.lat.toFixed(5)}, ${evento.latlng.lng.toFixed(5)}`);
      return;
    }
    estado.puntosDibujo.push(evento.latlng);
    if (herramienta === 'circulo' && estado.puntosDibujo.length === 2) {
      const radio = estado.puntosDibujo[0].distanceTo(estado.puntosDibujo[1]);
      L.circle(estado.puntosDibujo[0], { radius: radio, color: '#4c8eaf', fillColor: '#62bdd7', fillOpacity: .18, weight: 2 }).addTo(estado.capaAnalisis);
      finalizarSeleccionEspacial(`Círculo de ${(radio / 1000).toFixed(2)} km`, registro => estado.puntosDibujo[0].distanceTo([registro.lat, registro.lng]) <= radio);
      return;
    }
    actualizarDibujoTemporal();
  }

  function actualizarDibujoTemporal() {
    if (estado.dibujoTemporal) estado.capaAnalisis.removeLayer(estado.dibujoTemporal);
    const esArea = ['area','poligono'].includes(estado.herramientaActiva);
    estado.dibujoTemporal = esArea
      ? L.polygon(estado.puntosDibujo, { color: '#4f88df', fillColor: '#65bdda', fillOpacity: .15, weight: 2 }).addTo(estado.capaAnalisis)
      : L.polyline(estado.puntosDibujo, { color: '#4f88df', weight: 3 }).addTo(estado.capaAnalisis);
  }

  function finalizarDibujo(evento) {
    if (evento && evento.originalEvent) L.DomEvent.stop(evento.originalEvent);
    const herramienta = estado.herramientaActiva;
    if (!['distancia','area','poligono'].includes(herramienta)) return;
    const minimo = herramienta === 'distancia' ? 2 : 3;
    if (estado.puntosDibujo.length < minimo) return notificar(`Se requieren al menos ${minimo} puntos.`, 'error');
    if (herramienta === 'distancia') {
      const metros = estado.puntosDibujo.slice(1).reduce((total, punto, indice) => total + punto.distanceTo(estado.puntosDibujo[indice]), 0);
      notificar(`Distancia medida: ${(metros / 1000).toFixed(2)} km.`, 'exito');
      finalizarHerramienta();
      return;
    }
    const puntosPoligono = [...estado.puntosDibujo];
    const area = areaAproximada(puntosPoligono);
    finalizarSeleccionEspacial(`${herramienta === 'area' ? 'Área' : 'Polígono'} · ${(area / 1000000).toFixed(2)} km²`, registro => puntoEnPoligono([registro.lat, registro.lng], puntosPoligono));
  }

  function finalizarSeleccionEspacial(titulo, prueba) {
    const seleccionados = estado.registrosVisibles.filter(prueba);
    $('#resumenMapaSobrelinea').textContent = 'ANÁLISIS ESPACIAL';
    $('#resumenMapaTitulo').textContent = titulo;
    $('#resumenMapaDescripcion').textContent = `${seleccionados.length} registros incluidos en la selección.`;
    const porModulo = agrupar(seleccionados, 'modulo');
    $('#contenidoResumenMapa').innerHTML = `
      <section class="bloque-resumen"><h3>Resultado de selección</h3><p>Distribución de registros incluidos.</p>
        <div class="lista-distribucion">${Object.entries(porModulo).map(([id,cantidad]) => {
          const modulo = moduloPorId(id); return `<div class="fila-distribucion"><span>${textoSeguro(modulo ? modulo.nombre : id)}</span><i style="--avance:${seleccionados.length ? cantidad/seleccionados.length*100 : 0}%;--color:${modulo ? modulo.color : '#4d91b1'}"></i><b>${cantidad}</b></div>`;
        }).join('') || '<span>La selección no contiene registros.</span>'}</div>
      </section>
      <div class="acciones-seleccion-admin">
        <button class="boton-secundario" id="limpiarSeleccionEspacial" type="button">Limpiar selección</button>
        <button class="boton-principal" id="exportarSeleccionEspacial" type="button">Exportar selección</button>
      </div>`;
    $('#limpiarSeleccionEspacial').addEventListener('click', limpiarAnalisis);
    $('#exportarSeleccionEspacial').addEventListener('click', () => abrirExportacion('pdf'));
    estado.registrosSeleccionados = seleccionados;
    finalizarHerramienta();
  }

  function finalizarHerramienta() {
    estado.herramientaActiva = '';
    estado.puntosDibujo = [];
    estado.dibujoTemporal = null;
    estado.mapa.getContainer().style.cursor = '';
    $$('[data-herramienta], [data-herramienta-rapida]').forEach(item => item.classList.remove('activa'));
    $('#estadoHerramienta').textContent = 'Seleccione una herramienta';
  }

  function limpiarAnalisis() {
    if (estado.capaAnalisis) estado.capaAnalisis.clearLayers();
    estado.registrosSeleccionados = null;
    estado.puntosDibujo = [];
    estado.dibujoTemporal = null;
    estado.ultimoRegistro = null;
    finalizarHerramienta();
    renderizarResumenMapa();
    notificar('Análisis y selección eliminados.');
  }

  function alternarMalla() {
    if (estado.capaMalla && estado.mapa.hasLayer(estado.capaMalla)) {
      estado.mapa.removeLayer(estado.capaMalla);
      return notificar('Malla desactivada.');
    }
    estado.capaMalla = L.layerGroup();
    for (let lat = -18; lat <= 0; lat += 2) L.polyline([[lat,-82],[lat,-68]], { color: '#5d7fa8', weight: 1, opacity: .35 }).addTo(estado.capaMalla);
    for (let lng = -82; lng <= -68; lng += 2) L.polyline([[-19,lng],[0,lng]], { color: '#5d7fa8', weight: 1, opacity: .35 }).addTo(estado.capaMalla);
    estado.capaMalla.addTo(estado.mapa);
    notificar('Malla geográfica activada.');
  }

  function buscarRegistroCercano(latlng) {
    let mejor = null, distancia = Infinity;
    estado.registrosVisibles.forEach(registro => {
      const actual = latlng.distanceTo([registro.lat, registro.lng]);
      if (actual < distancia) { distancia = actual; mejor = registro; }
    });
    return distancia < 80000 ? mejor : null;
  }

  function areaAproximada(puntos) {
    if (puntos.length < 3) return 0;
    const centroLat = puntos.reduce((total, p) => total + p.lat, 0) / puntos.length * Math.PI / 180;
    const escalaX = 111320 * Math.cos(centroLat), escalaY = 110540;
    let suma = 0;
    puntos.forEach((punto, indice) => {
      const siguiente = puntos[(indice + 1) % puntos.length];
      suma += (punto.lng * escalaX) * (siguiente.lat * escalaY) - (siguiente.lng * escalaX) * (punto.lat * escalaY);
    });
    return Math.abs(suma / 2);
  }

  function puntoEnPoligono([lat, lng], puntos) {
    let dentro = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
      const xi = puntos[i].lng, yi = puntos[i].lat, xj = puntos[j].lng, yj = puntos[j].lat;
      const cruza = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi || 1e-12) + xi);
      if (cruza) dentro = !dentro;
    }
    return dentro;
  }

  function prepararExportacion() {
    $$('[data-exportar]').forEach(boton => boton.addEventListener('click', () => abrirExportacion(boton.dataset.exportar)));
    $$('[data-formato]').forEach(boton => boton.addEventListener('click', () => {
      estado.formatoExportacion = boton.dataset.formato;
      $$('[data-formato]').forEach(item => item.classList.toggle('activo', item === boton));
    }));
    $('#generarExportacion').addEventListener('click', generarExportacion);
  }

  function abrirExportacion(formato) {
    estado.formatoExportacion = formato || 'pdf';
    $$('[data-formato]').forEach(boton => boton.classList.toggle('activo', boton.dataset.formato === estado.formatoExportacion));
    const registros = estado.registrosSeleccionados || estado.registrosVisibles;
    $('#alcanceExportacion').textContent = estado.registrosSeleccionados ? 'Selección espacial activa' : 'Todos los registros filtrados';
    $('#cantidadExportacion').textContent = registros.length;
    abrirModal('modalExportarAdmin');
  }

  function generarExportacion() {
    const registros = estado.registrosSeleccionados || estado.registrosVisibles;
    if (!registros.length) return notificar('No hay registros para exportar.', 'error');
    if (estado.formatoExportacion === 'pdf') exportarPdf(registros);
    else if (estado.formatoExportacion === 'csv') descargarCsv(registros);
    else exportarXlsx(registros);
    cerrarModal('modalExportarAdmin');
    notificar(`Reporte ${estado.formatoExportacion.toUpperCase()} generado.`, 'exito');
  }

  function filasExportacion(registros) {
    return registros.map(registro => {
      const modulo = moduloPorId(registro.modulo);
      const proyecto = proyectoPorId(registro.proyecto);
      return {
        Código: registro.id, Módulo: modulo ? modulo.nombre : registro.modulo,
        Proyecto: proyecto ? proyecto.nombre : registro.proyecto, Región: registro.region,
        Departamento: registro.departamento, Provincia: registro.provincia, Distrito: registro.distrito,
        Estado: registro.estado, 'Empresa / concesionaria': registro.empresa,
        Latitud: registro.lat, Longitud: registro.lng
      };
    });
  }

  function descargarCsv(registros) {
    const filas = filasExportacion(registros);
    const cabeceras = Object.keys(filas[0]);
    const escapar = valor => `"${String(valor).replace(/"/g, '""')}"`;
    const contenido = [cabeceras.map(escapar).join(','), ...filas.map(fila => cabeceras.map(c => escapar(fila[c])).join(','))].join('\r\n');
    descargarBlob(new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8' }), 'satcontrol-administracion.csv');
  }

  function exportarXlsx(registros) {
    const filas = filasExportacion(registros);
    if (window.XLSX) {
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), 'SATCONTROL');
      XLSX.writeFile(libro, 'satcontrol-administracion.xlsx');
      return;
    }
    descargarCsv(registros);
  }

  function exportarPdf(registros) {
    const filas = filasExportacion(registros);
    const ventana = window.open('', '_blank', 'width=1100,height=760');
    if (!ventana) return notificar('Permita las ventanas emergentes para generar el PDF.', 'error');
    const cuerpo = filas.map(fila => `<tr>${Object.values(fila).map(valor => `<td>${textoSeguro(valor)}</td>`).join('')}</tr>`).join('');
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte SATCONTROL</title><style>
      body{font:12px Arial;color:#1a2740;margin:28px}h1{margin:8px 0}.meta{color:#718098;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;font-size:9px}th{background:#157f9c;color:#fff}th,td{padding:7px;border:1px solid #d8e2eb;text-align:left}
      @media print{@page{size:landscape;margin:10mm}.sin-impresion{display:none}}
    </style></head><body><div class="sin-impresion"><button onclick="print()">Imprimir / Guardar como PDF</button></div>
      <h1>Administración · Reporte SATCONTROL</h1><div class="meta">${registros.length} registros · ${new Date().toLocaleString('es-PE')}</div>
      <table><thead><tr>${Object.keys(filas[0]).map(c => `<th>${textoSeguro(c)}</th>`).join('')}</tr></thead><tbody>${cuerpo}</tbody></table>
      <script>setTimeout(()=>print(),350)<\/script></body></html>`);
    ventana.document.close();
  }

  function descargarBlob(blob, nombre) {
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombre;
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  }

  function alternarFiltrosMapa() {
    const contenedor = $('#contenedorFiltrosAdmin');
    const colapsado = contenedor.classList.toggle('colapsado');
    $('#botonColapsarFiltros').setAttribute('aria-expanded', String(!colapsado));
    $('#botonColapsarFiltros').setAttribute('aria-label', colapsado ? 'Mostrar filtros' : 'Ocultar filtros');
    if (estado.mapa) setTimeout(() => estado.mapa.invalidateSize(), 220);
  }

  function abrirModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function cerrarModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.hidden = true;
    if (!$$('.modal-admin:not([hidden])').length) document.body.style.overflow = '';
  }

  function notificar(mensaje, tipo = '') {
    const elemento = $('#notificacionAdmin');
    elemento.textContent = mensaje;
    elemento.className = `notificacion-admin ${tipo}`;
    elemento.hidden = false;
    clearTimeout(notificar.temporizador);
    notificar.temporizador = setTimeout(() => elemento.hidden = true, 3400);
  }

  function formatearFecha(valor) {
    const fecha = new Date(`${valor}T12:00:00`);
    return Number.isNaN(fecha.getTime()) ? valor : fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }
})();
