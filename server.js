const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer(port = 3100) {
  const raiz = __dirname;
  const archivoAdmin = path.join(raiz, 'modulos', 'admin', 'admin.json');
  const tipos = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml'
  };

  function responderJson(respuesta, estado, contenido) {
    respuesta.writeHead(estado, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    respuesta.end(JSON.stringify(contenido));
  }

  function leerAdmin(callback) {
    fs.readFile(archivoAdmin, 'utf8', (error, contenido) => {
      if (error) return callback(error);
      try {
        callback(null, JSON.parse(contenido));
      } catch (errorJson) {
        callback(errorJson);
      }
    });
  }

  function guardarAdmin(datos, callback) {
    fs.writeFile(archivoAdmin, JSON.stringify(datos, null, 2) + '\n', 'utf8', callback);
  }

  function leerCuerpoJson(solicitud, respuesta, callback) {
    let cuerpo = '';
    solicitud.on('data', fragmento => {
      cuerpo += fragmento;
      if (cuerpo.length > 1024 * 1024) solicitud.destroy();
    });
    solicitud.on('end', () => {
      try {
        callback(JSON.parse(cuerpo || '{}'));
      } catch {
        responderJson(respuesta, 400, { error: 'El contenido JSON no es válido.' });
      }
    });
  }

  return http.createServer((solicitud, respuesta) => {
    const ruta = decodeURIComponent(solicitud.url.split('?')[0]);

    if (ruta === '/api/admin' && solicitud.method === 'GET') {
      leerAdmin((error, datos) => {
        if (error) return responderJson(respuesta, 500, { error: 'No se pudo leer la información administrativa.' });
        responderJson(respuesta, 200, datos);
      });
      return;
    }

    if (ruta === '/api/admin/usuarios' && solicitud.method === 'POST') {
      leerCuerpoJson(solicitud, respuesta, nuevoUsuario => {
        leerAdmin((error, datos) => {
          if (error) return responderJson(respuesta, 500, { error: 'No se pudo leer la información administrativa.' });
          const camposObligatorios = ['nombres', 'apellidos', 'direccion', 'correo', 'telefono', 'region', 'perfil'];
          const incompleto = camposObligatorios.some(campo => !String(nuevoUsuario[campo] || '').trim());
          if (incompleto) return responderJson(respuesta, 400, { error: 'Complete todos los campos obligatorios.' });
          const correo = String(nuevoUsuario.correo).trim().toLowerCase();
          if (datos.usuarios.some(usuario => usuario.correo.toLowerCase() === correo)) {
            return responderJson(respuesta, 409, { error: 'Ya existe un usuario con ese correo.' });
          }
          const usuario = {
            id: `USR-${String(Date.now()).slice(-8)}`,
            nombres: String(nuevoUsuario.nombres).trim(),
            apellidos: String(nuevoUsuario.apellidos).trim(),
            direccion: String(nuevoUsuario.direccion).trim(),
            correo,
            telefono: String(nuevoUsuario.telefono).trim(),
            region: String(nuevoUsuario.region).trim(),
            perfil: String(nuevoUsuario.perfil).trim(),
            claveConfigurada: Boolean(String(nuevoUsuario.contrasena || '').trim()),
            estado: 'Habilitado',
            creado: new Date().toISOString()
          };
          datos.usuarios.unshift(usuario);
          guardarAdmin(datos, errorGuardado => {
            if (errorGuardado) return responderJson(respuesta, 500, { error: 'No se pudo guardar el usuario.' });
            responderJson(respuesta, 201, usuario);
          });
        });
      });
      return;
    }

    const coincidenciaUsuario = ruta.match(/^\/api\/admin\/usuarios\/([^/]+)$/);
    if (coincidenciaUsuario && solicitud.method === 'PATCH') {
      leerCuerpoJson(solicitud, respuesta, cambios => {
        leerAdmin((error, datos) => {
          if (error) return responderJson(respuesta, 500, { error: 'No se pudo leer la información administrativa.' });
          const usuario = datos.usuarios.find(item => item.id === coincidenciaUsuario[1]);
          if (!usuario) return responderJson(respuesta, 404, { error: 'Usuario no encontrado.' });
          if (cambios.estado && ['Habilitado', 'Deshabilitado'].includes(cambios.estado)) usuario.estado = cambios.estado;
          guardarAdmin(datos, errorGuardado => {
            if (errorGuardado) return responderJson(respuesta, 500, { error: 'No se pudo actualizar el usuario.' });
            responderJson(respuesta, 200, usuario);
          });
        });
      });
      return;
    }

    const archivo = path.resolve(raiz, '.' + (ruta === '/' ? '/index.html' : ruta));
    if (!archivo.startsWith(raiz)) {
      respuesta.writeHead(403).end('Acceso denegado');
      return;
    }
    fs.readFile(archivo, (error, contenido) => {
      if (error) {
        respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        respuesta.end('Archivo no encontrado');
        return;
      }
      respuesta.writeHead(200, { 'Content-Type': tipos[path.extname(archivo).toLowerCase()] || 'application/octet-stream' });
      respuesta.end(contenido);
    });
  }).listen(port, '127.0.0.1', () => console.log(`Proyecto disponible en http://127.0.0.1:${port}`));
}

module.exports = { startServer };

if (require.main === module) {
  startServer(3100);
}
