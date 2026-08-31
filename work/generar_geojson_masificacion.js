const fs = require('fs');
const path = require('path');

const proyectos = [
  ['MAS-001','Ampliación Norte','Lima','Lima','Comas',-11.94,-77.06,'Instalada',84,18.4],
  ['MAS-002','Red Metropolitana Sur','Lima','Lima','Villa El Salvador',-12.21,-76.94,'En ejecución',61,24.8],
  ['MAS-003','Corredor Gas Arequipa','Arequipa','Arequipa','Cerro Colorado',-16.37,-71.56,'Instalada',77,15.2],
  ['MAS-004','Expansión Trujillo','La Libertad','Trujillo','Trujillo',-8.11,-79.03,'Proyectada',32,29.6],
  ['MAS-005','Red Urbana Chiclayo','Lambayeque','Chiclayo','José Leonardo Ortiz',-6.76,-79.84,'En ejecución',58,21.1],
  ['MAS-006','Conexión Cusco','Cusco','Cusco','San Sebastián',-13.53,-71.89,'Proyectada',27,17.8],
  ['MAS-007','Anillo Piura','Piura','Piura','Castilla',-5.19,-80.63,'Instalada',91,13.7],
  ['MAS-008','Expansión Ica','Ica','Ica','Subtanjalla',-14.02,-75.76,'En ejecución',69,16.3],
  ['MAS-009','Red Huancayo','Junín','Huancayo','El Tambo',-12.04,-75.22,'Proyectada',38,19.5],
  ['MAS-010','Conexión Chimbote','Áncash','Santa','Nuevo Chimbote',-9.12,-78.52,'Instalada',88,14.9]
];
const nombres=['María Elena Ramos','Carlos Quispe Flores','Rosa Huamán Soto','Luis Alberto Torres','Ana Lucía Mendoza','Jorge Paredes Díaz'];
const features=[];
proyectos.forEach((p,indice)=>{
  const [codigo,nombre,departamento,provincia,distrito,lat,lng,estado,avance,longitud]=p;
  features.push({type:'Feature',id:codigo,geometry:{type:'Point',coordinates:[lng,lat]},properties:{tipo:'proyecto',codigo,nombre,departamento,provincia,distrito,estado,avance,longitud,elementos:`Válvulas ${8+indice} · Tuberías PE ${12+indice} · Estaciones ${1+indice%3}`}});
  for(let lote=0;lote<3;lote++){
    const py=lat-.039+lote*.045,px=lng+.025;
    features.push({type:'Feature',id:`LOT-${codigo.slice(-3)}-${lote+1}`,geometry:{type:'Polygon',coordinates:[[[px-.015,py-.009],[px+.015,py-.009],[px+.015,py+.009],[px-.015,py+.009],[px-.015,py-.009]]]},properties:{tipo:'lote',proyecto:codigo,numero:lote+1,distrito}});
    const dispersion=[[-.020,-.027],[-.014,.025],[.017,-.022],[.022,.028]];
    dispersion.forEach(([dy,dx],j)=>{
      const numero=lote*4+j;
      features.push({type:'Feature',id:`BEN-${codigo.slice(-3)}-${String(numero+1).padStart(3,'0')}`,geometry:{type:'Point',coordinates:[px+dx,py+dy]},properties:{tipo:'beneficiario',proyecto:codigo,lote:lote+1,nombre:nombres[numero%nombres.length],suministro:`SUM-${592600+numero}`,estado:'Potencial',departamento,provincia,distrito}});
    });
  }
});
const salida={type:'FeatureCollection',name:'Proyectos, lotes y beneficiarios de Masificación',features};
fs.writeFileSync(path.join(__dirname,'..','modulos','MASIFICACION','datos_masificacion.geojson'),JSON.stringify(salida,null,2),'utf8');
