const fs = require('fs');
const path = require('path');

const origen = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'modulos', 'vale-fise', 'datos_valefise.json'), 'utf8')).registros;
const tecnologias = ['Monocristalino', 'Policristalino', 'Híbrido'];
const capacidades = ['450 Wp', '550 Wp', '650 Wp'];
const inversores = ['1 kVA', '1.5 kVA', '2 kVA'];
const baterias = ['2 x 100 Ah', '4 x 100 Ah', '4 x 150 Ah'];
const estados = ['Operativo', 'Operativo', 'Operativo', 'Observado', 'Inactivo'];
const periodos = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12'];

const registros = origen.slice(0, 180).map((item, indice) => {
  const estado = estados[indice % estados.length];
  const numero = indice + 1;
  const dia = String(1 + (indice * 7) % 27).padStart(2, '0');
  return {
    codigo: `MCT-${String(numero).padStart(6, '0')}`,
    tipo: indice % 7 === 0 ? 'Comunitario' : 'Individual',
    estado,
    departamento: item.departamento,
    provincia: item.provincia,
    distrito: item.distrito,
    empresa: item.ede,
    periodo: periodos[indice % periodos.length],
    lat: item.lat,
    lng: item.lng,
    tecnologia: tecnologias[indice % tecnologias.length],
    capacidad: capacidades[indice % capacidades.length],
    inversor: inversores[indice % inversores.length],
    bateria: baterias[indice % baterias.length],
    instalacion: `${dia}/${String(1 + indice % 12).padStart(2, '0')}/2025`,
    ultimoMantenimiento: estado === 'Inactivo' ? `11/07/2026` : `${dia}/${String(1 + (indice + 3) % 12).padStart(2, '0')}/2026`,
    sincronizacion: estado === 'Operativo' ? 'Sincronizado' : estado === 'Observado' ? 'Revisión requerida' : 'Pendiente de sincronización',
    opex: estado === 'Inactivo' ? 'Pago bloqueado por estado Inactivo' : estado === 'Observado' ? 'Pago sujeto a revisión' : 'Pago habilitado',
    observacion: estado === 'Inactivo' ? 'Equipo inoperativo y marcado como Inactivo.' : estado === 'Observado' ? 'Sistema con observaciones técnicas pendientes.' : 'Sistema operando dentro de los parámetros esperados.'
  };
});

const destino = path.join(__dirname, '..', 'modulos', 'MCTER', 'datos_mcter.json');
fs.writeFileSync(destino, JSON.stringify({ actualizado: '2026-07-22', registros }, null, 2) + '\n', 'utf8');
console.log(`Generados ${registros.length} sistemas MCTER.`);
