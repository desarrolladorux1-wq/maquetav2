const fs = require('fs');
const path = require('path');

const geoPath = path.join(__dirname, '..', 'geo', 'peru_distritos_gadm41.json');
const geoDistritos = JSON.parse(fs.readFileSync(geoPath, 'utf8'));

function anillosDeGeometria(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function puntoEnAnillo([x, y], anillo) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    const cruza = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

function puntoEnFeature(punto, feature) {
  return anillosDeGeometria(feature.geometry).some((poligono) => {
    if (!puntoEnAnillo(punto, poligono[0])) return false;
    return !poligono.slice(1).some((hueco) => puntoEnAnillo(punto, hueco));
  });
}

function limites(feature) {
  const puntos = anillosDeGeometria(feature.geometry).flat(2);
  return puntos.reduce((b, [x, y]) => ({
    minX: Math.min(b.minX, x), maxX: Math.max(b.maxX, x),
    minY: Math.min(b.minY, y), maxY: Math.max(b.maxY, y)
  }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
}

function puntoInterior(feature) {
  const b = limites(feature);
  const centro = [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
  if (puntoEnFeature(centro, feature)) return centro;

  // Busca una celda interior, lejos de los bordes, para ubicar marcadores seguros.
  for (let resolucion = 9; resolucion <= 45; resolucion += 6) {
    for (let fila = 1; fila < resolucion; fila += 1) {
      for (let columna = 1; columna < resolucion; columna += 1) {
        const candidato = [
          b.minX + (columna / resolucion) * (b.maxX - b.minX),
          b.minY + (fila / resolucion) * (b.maxY - b.minY)
        ];
        if (puntoEnFeature(candidato, feature)) return candidato;
      }
    }
  }
  return feature.geometry.coordinates.flat(3).find((p) => Array.isArray(p) && typeof p[0] === 'number');
}

// Un distrito representativo por departamento garantiza cobertura nacional y nombres exactos.
const porDepartamento = new Map();
for (const feature of geoDistritos.features) {
  const departamento = feature.properties.NAME_1;
  if (!porDepartamento.has(departamento)) porDepartamento.set(departamento, feature);
}

const ubicaciones = [...porDepartamento.values()].map((feature) => ({
  feature,
  centro: puntoInterior(feature),
  limites: limites(feature),
  departamento: feature.properties.NAME_1,
  provincia: feature.properties.NAME_2,
  distrito: feature.properties.NAME_3
}));

const nombres = ['Carlos Paredes Vega','María Quispe Flores','José Huamán Soto','Rosa Chávez Díaz','Luis Torres Rojas','Ana Mendoza Ruiz','Jorge Salazar Peña','Elena Ramos León','Miguel Castillo Cruz','Carmen López Silva','Pedro Valdivia Núñez','Julia Fernández Poma','Víctor Palomino Reyes','Teresa García Meza','Raúl Espinoza Campos','Sonia Vásquez Ríos','Daniel Cárdenas Vera','Lucía Herrera Ortiz','Óscar Medina Luna','Patricia Aguilar Castro','Hugo Navarro Tapia','Mónica Cabrera Paz','Ricardo Sánchez Gil','Beatriz Romero Arias','Edwin Flores Condori'];
const edes = ['Luz del Sur','Enel Distribución Perú','Hidrandina','Electronoroeste','Electrocentro','Electro Sur Este','Electro Oriente','Seal','Electro Puno','Electrosur'];
const canales = ['Distribuidora','Qali Warma','Comedor Popular','Ollas Comunes'];
const estados = ['Activo','Activo','Activo','Activo','Suspendido','Excluido'];
const periodos = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'];

function coordenadaRegistro(ubicacion, repeticion) {
  const [lng, lat] = ubicacion.centro;
  const anguloBase = repeticion * 2.3999632297;
  const ancho = ubicacion.limites.maxX - ubicacion.limites.minX;
  const alto = ubicacion.limites.maxY - ubicacion.limites.minY;
  const escala = Math.max(0.004, Math.min(ancho, alto) * 0.055);
  for (let intento = 0; intento < 18; intento += 1) {
    const radio = escala * (1 + repeticion * .55 + intento * .18);
    const angulo = anguloBase + intento * 0.73;
    const candidato = [lng + Math.cos(angulo) * radio, lat + Math.sin(angulo) * radio];
    if (puntoEnFeature(candidato, ubicacion.feature)) return candidato;
  }
  return [lng, lat];
}

const registros = Array.from({ length: 520 }, (_, indice) => {
  const ubicacion = ubicaciones[indice % ubicaciones.length];
  const repeticion = Math.floor(indice / ubicaciones.length);
  const [lng, lat] = coordenadaRegistro(ubicacion, repeticion);
  const numero = indice + 1;
  const mes = 5 + (indice % 3);
  const dia = String(1 + ((indice * 7) % 27)).padStart(2, '0');
  return {
    id: `FISE-BEN-${String(numero).padStart(4, '0')}`,
    periodo: periodos[indice % periodos.length],
    fechaRegistro: `2026-${String(mes).padStart(2, '0')}-${dia}`,
    nombre: nombres[indice % nombres.length],
    dni: String(40000000 + numero),
    codigoSuministro: `SUM-${String(700000 + numero).padStart(6, '0')}`,
    ede: edes[indice % edes.length],
    departamento: ubicacion.departamento,
    provincia: ubicacion.provincia,
    distrito: ubicacion.distrito,
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    canal: canales[indice % canales.length],
    zona: indice % 4 === 0 ? 'Rural' : 'Urbano',
    estado: estados[indice % estados.length],
    beneficiarios: 1
  };
});

const salida = { actualizado: '2026-07-21', registros };
const destino = path.join(__dirname, '..', 'modulos', 'vale-fise', 'datos_valefise.json');
fs.writeFileSync(destino, JSON.stringify(salida, null, 2) + '\n', 'utf8');
console.log(`Generados ${registros.length} beneficiarios georreferenciados en ${ubicaciones.length} departamentos.`);
