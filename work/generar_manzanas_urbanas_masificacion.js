const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'modulos', 'MASIFICACION', 'datos_masificacion.geojson');
const outputPath = path.join(root, 'modulos', 'MASIFICACION', 'manzanas_urbanas_masificacion.geojson');

const servicioManzanas = 'https://arcgis.inei.gob.pe:6443/arcgis/rest/services/VISOR_DE_MAPAS/VISOR_DE_INDICADORES_GEOESPACIALES/MapServer/3/query';
const campos = [
  'CODZONA',
  'SUFZONA',
  'UBIGEO',
  'CODCCPP',
  'FUENTE',
  'NOMBCCPP',
  'NOMDIST',
  'NOMPROV',
  'NOMDEP',
  'tipo',
  'LLAVE_IDMANZANA',
  'AREA_CP',
  'LUZ',
  'LUZP',
  'AGUA',
  'AGUAP',
  'TIERRA',
  'TIERRAP',
  'DESAGUE',
  'DESAGUEP',
  'INTERNET',
  'INTERNETP',
  'NACIDOS',
  'DEFUNCION',
  'POBTOTAL',
  'POPH',
  'POBM',
  'VIVIENDA',
  'CODMZ'
].join(',');

const fuente = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const proyectos = fuente.features
  .filter(feature => feature?.properties?.tipo === 'proyecto')
  .map(feature => {
    const lotes = fuente.features.filter(item => item?.properties?.tipo === 'lote' && item.properties.proyecto === feature.properties.codigo);
    const coordenadas = lotes.flatMap(lote => lote.geometry?.coordinates?.[0] || []);
    const longitudes = coordenadas.map(punto => punto[0]);
    const latitudes = coordenadas.map(punto => punto[1]);
    if (!longitudes.length || !latitudes.length) {
      const [lng, lat] = feature.geometry?.coordinates || [0, 0];
      return { codigo: feature.properties.codigo, nombre: feature.properties.nombre, distrito: feature.properties.distrito, bbox: [lng - 0.02, lat - 0.02, lng + 0.02, lat + 0.02] };
    }
    const minLng = Math.min(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLng = Math.max(...longitudes);
    const maxLat = Math.max(...latitudes);
    const margenLng = Math.max((maxLng - minLng) * 0.15, 0.01);
    const margenLat = Math.max((maxLat - minLat) * 0.15, 0.01);
    return {
      codigo: feature.properties.codigo,
      nombre: feature.properties.nombre,
      distrito: feature.properties.distrito,
      bbox: [minLng - margenLng, minLat - margenLat, maxLng + margenLng, maxLat + margenLat]
    };
  });

async function consultarManzanasPorProyecto(proyecto, indiceProyecto) {
  const [xmin, ymin, xmax, ymax] = proyecto.bbox;
  const geometry = encodeURIComponent(JSON.stringify({ xmin, ymin, xmax, ymax, spatialReference: { wkid: 4326 } }));
  const baseQuery = new URLSearchParams({
    geometry,
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: campos,
    returnGeometry: 'true',
    inSR: '4326',
    outSR: '4326',
    orderByFields: 'OBJECTID',
    f: 'geojson'
  });

  const countUrl = `${servicioManzanas}?${baseQuery.toString()}&returnCountOnly=true`;
  const countRespuesta = await fetch(countUrl);
  if (!countRespuesta.ok) {
    throw new Error(`No se pudo consultar conteo para ${proyecto.codigo}: ${countRespuesta.status}`);
  }
  const total = (await countRespuesta.json()).count || 0;
  const pagina = 1000;
  const features = [];

  for (let offset = 0; offset < total; offset += pagina) {
    const url = `${servicioManzanas}?${baseQuery.toString()}&resultOffset=${offset}&resultRecordCount=${pagina}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`No se pudo descargar la página ${offset} de ${proyecto.codigo}: ${respuesta.status}`);
    }
    const geojson = await respuesta.json();
    const paginaFeatures = geojson.features || [];
    paginaFeatures.forEach((feature, indice) => {
      const propiedades = feature.properties || {};
      feature.properties = {
        ...propiedades,
        tipo: 'manzana_inei',
        proyecto: proyecto.codigo,
        codigoProyecto: proyecto.codigo,
        nombreProyecto: proyecto.nombre,
        distritoProyecto: proyecto.distrito,
        ordenProyecto: indiceProyecto + 1,
        indiceManzana: offset + indice + 1,
        fuente: 'INEI - Capa Manzana (CPV resultados)',
        descripcion: 'Manzana censal real del INEI asociada al proyecto de masificación.'
      };
    });
    features.push(...paginaFeatures);
  }

  const deduplicadas = new Map();
  features.forEach(feature => {
    const clave = String(feature.properties?.LLAVE_IDMANZANA || feature.properties?.CODMZ || feature.id || `${proyecto.codigo}-${deduplicadas.size}`);
    if (!deduplicadas.has(clave)) deduplicadas.set(clave, feature);
  });
  return [...deduplicadas.values()];
}

async function main() {
  const features = [];
  for (let i = 0; i < proyectos.length; i += 1) {
    const proyecto = proyectos[i];
    process.stdout.write(`Consultando ${proyecto.codigo} (${proyecto.nombre})...\n`);
    const manzanas = await consultarManzanasPorProyecto(proyecto, i);
    process.stdout.write(`  ${manzanas.length} manzanas\n`);
    features.push(...manzanas);
  }

  const salida = {
    type: 'FeatureCollection',
    name: 'manzanas_urbanas_masificacion',
    metadata: {
      source: 'https://arcgis.inei.gob.pe:6443/arcgis/rest/services/VISOR_DE_MAPAS/VISOR_DE_INDICADORES_GEOESPACIALES/MapServer/3',
      sourceLayer: 'Manzana',
      extractedAt: new Date().toISOString(),
      description: 'Manzanas censales reales del INEI asociadas a los proyectos de masificación.'
    },
    features
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(salida, null, 2)}\n`, 'utf8');
  console.log(`Generado: ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});