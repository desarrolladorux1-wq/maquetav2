(function () {
  'use strict';

  const CLAVE_WIKI = 'vale_fise_wiki_autenticada';
  const aplicaciones = [
    ['VF', 'Vale FISE', 'Subsidio GLP, canjes y beneficiarios.', 'actual'],
    ['WF', 'Wiki FISE', 'Guías, procedimientos y documentación institucional FISE.', 'wiki'],
    ['SIF', 'Sistema Integral FISE', 'Acceso institucional y gestión integral.', ''],
    ['GNV', 'Sistema FISE GNV', 'Gestión del programa de gas natural vehicular.', ''],
    ['BG', 'BonoGas 2.0', 'Plataforma de instalaciones y beneficiarios.', ''],
    ['GAS', 'Gestión de Afiliación', 'Actividades de afiliación y seguimiento.', ''],
    ['CST', 'Consulta saldo / Taller', 'Consultas para beneficiarios y talleres.', ''],
    ['API', 'FISE CONSULTAS API', 'Servicios institucionales de consulta.', ''],
    ['API', 'GNV API', 'Integración y consulta de datos GNV.', ''],
    ['FF', 'FISEFORMS API', 'Formularios, evidencias y datos de campo.', ''],
    ['DOC', 'DOC SERVICES API', 'Documentos y expedientes digitales.', '']
  ];

  function estaAutenticada(nombre) {
    if (nombre === 'Vale FISE') return true;
    try { return sessionStorage.getItem(nombre === 'Wiki FISE' ? CLAVE_WIKI : 'vale_app_' + nombre) === '1'; }
    catch (error) { return false; }
  }

  window.addEventListener('load', function () {
    const botonMisApps = document.querySelector('.boton-mis-apps');
    if (!botonMisApps) return;
    document.getElementById('modalMisApps')?.remove();

    const principal = document.createElement('div');
    principal.className = 'vale-apps-modal';
    principal.id = 'modalAutenticarAplicativos';
    principal.innerHTML = '<section class="vale-apps-dialog" role="dialog" aria-modal="true" aria-labelledby="tituloAutenticarAplicativos"><header class="vale-apps-header"><span class="vale-apps-escudo"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg></span><div><h2 id="tituloAutenticarAplicativos">Autenticar aplicativos</h2><p>Selecciona un aplicativo para autenticarte o continuar.</p></div><button class="vale-apps-cerrar" type="button" aria-label="Cerrar">×</button></header><div class="vale-apps-body"><h3>Aplicativos disponibles</h3><p class="vale-apps-intro">11 servicios disponibles para tu cuenta.</p><div class="vale-apps-grid"></div><div class="vale-solicitar"><button type="button">＋ Solicitar acceso</button></div></div></section>';

    const autenticacion = document.createElement('div');
    autenticacion.className = 'vale-apps-modal';
    autenticacion.id = 'modalAutenticacionAplicativo';
    autenticacion.hidden = true;
    autenticacion.innerHTML = '<section class="vale-apps-dialog vale-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="tituloAutenticacionServicio"><header class="vale-apps-header"><div><h2 id="tituloAutenticacionServicio">Autenticación del servicio</h2><p>Ingresa las credenciales asignadas al aplicativo.</p></div><button class="vale-apps-cerrar" type="button" aria-label="Cerrar">×</button></header><div class="vale-auth-body"><h3>Sistema seleccionado</h3><form class="vale-auth-form"><label>Aplicativo<input id="valeAuthServicio" readonly></label><label>Usuario<input id="valeAuthUsuario" autocomplete="username" required></label><label>Contraseña<input id="valeAuthClave" type="password" placeholder="Contraseña del servicio" autocomplete="current-password" required></label><div class="vale-auth-actions"><output class="vale-auth-error" aria-live="polite"></output><button class="vale-auth-volver" type="button">← Volver</button><button class="vale-auth-submit" type="submit">Autenticar</button></div></form></div></section>';

    const wiki = document.createElement('section');
    wiki.className = 'wiki-fise-vista';
    wiki.id = 'vistaWikiFise';
    wiki.hidden = true;
    wiki.innerHTML = '<div class="wiki-fise-cargando">Abriendo Wiki FISE…</div><iframe title="Wiki FISE" src="about:blank"></iframe>';
    document.body.append(principal, autenticacion, wiki);

    const grid = principal.querySelector('.vale-apps-grid');
    let modoMisApps = false;
    const abrirPrincipal = function (desdeMenu) {
      if (typeof desdeMenu === 'boolean') modoMisApps = desdeMenu;
      renderAplicaciones(modoMisApps);
      autenticacion.hidden = true;
      principal.hidden = false;
      principal.querySelector('.vale-apps-dialog').scrollTop = 0;
      document.body.classList.add('vale-apps-bloqueado');
    };
    const cerrarPrincipal = function () {
      principal.hidden = true;
      document.body.classList.remove('vale-apps-bloqueado');
    };
    const renderAplicaciones = function (vistaMisApps) {
      const titulo = principal.querySelector('#tituloAutenticarAplicativos');
      const subtitulo = titulo.nextElementSibling;
      const encabezado = principal.querySelector('.vale-apps-body h3');
      const intro = principal.querySelector('.vale-apps-intro');
      titulo.textContent = vistaMisApps ? 'Mis Apps' : 'Autenticar aplicativos';
      subtitulo.textContent = vistaMisApps ? 'Accede a tus aplicaciones habilitadas.' : 'Selecciona un aplicativo para autenticarte o continuar.';
      encabezado.textContent = vistaMisApps ? 'Aplicaciones habilitadas' : 'Aplicativos disponibles';
      intro.textContent = vistaMisApps ? 'Vale FISE y Wiki FISE se muestran como aplicaciones independientes.' : '11 servicios disponibles para tu cuenta.';
      const visibles = vistaMisApps ? aplicaciones.slice(0, 2) : aplicaciones;
      grid.classList.toggle('vale-apps-grid-resumida', vistaMisApps);
      grid.innerHTML = visibles.map(function (app) {
        const autenticada = estaAutenticada(app[1]);
        const accion = app[1] === 'Vale FISE' ? 'Continuar' : app[1] === 'Wiki FISE' && autenticada ? 'Ingresar a FISE Wiki' : autenticada ? 'Ingresar' : 'Autenticar';
        const estado = app[1] === 'Vale FISE' ? 'Aplicación actual' : autenticada ? 'Autenticado · Conectado' : 'Requiere autenticación';
        return '<article class="vale-app-card ' + app[3] + '"><span class="vale-app-icon">' + app[0] + '</span><strong>' + app[1] + '</strong><p>' + app[2] + '</p><span class="vale-app-status">' + estado + '</span><button class="vale-app-action" type="button" data-app="' + app[1] + '">' + accion + '</button></article>';
      }).join('') + (vistaMisApps ? '<article class="vale-app-card vale-app-solicitud"><span class="vale-app-icon">＋</span><strong>Solicitar acceso</strong><p>Consulta y autentica otros servicios disponibles.</p><span class="vale-app-status">Autoservicio de accesos</span><button class="vale-app-action" type="button" data-solicitar-acceso>Ver servicios</button></article>' : '');
      principal.querySelector('.vale-solicitar').hidden = vistaMisApps;
    };
    const abrirAutenticacion = function (nombre) {
      principal.hidden = true;
      autenticacion.hidden = false;
      autenticacion.querySelector('#valeAuthServicio').value = nombre;
      autenticacion.querySelector('#valeAuthUsuario').value = nombre === 'Wiki FISE' ? 'integralfise' : '';
      autenticacion.querySelector('#valeAuthClave').value = '';
      autenticacion.querySelector('.vale-auth-error').textContent = '';
      setTimeout(function () { autenticacion.querySelector('#valeAuthClave').focus(); }, 40);
    };
    const abrirWiki = function () {
      cerrarPrincipal();
      wiki.hidden = false;
      wiki.classList.remove('cargada');
      document.body.classList.add('vale-apps-bloqueado');
      const iframe = wiki.querySelector('iframe');
      if (!iframe.src.endsWith('/wiki-fise.html')) iframe.src = 'wiki-fise.html';
    };

    botonMisApps.addEventListener('click', function () { abrirPrincipal(true); });
    principal.querySelector('.vale-apps-cerrar').addEventListener('click', cerrarPrincipal);
    principal.addEventListener('click', function (evento) {
      const boton = evento.target.closest('[data-app]');
      if (evento.target.closest('[data-solicitar-acceso]')) { modoMisApps = false; renderAplicaciones(false); return; }
      if (!boton) return;
      const nombre = boton.dataset.app;
      if (nombre === 'Vale FISE') { cerrarPrincipal(); return; }
      if (nombre === 'Wiki FISE' && estaAutenticada(nombre)) { abrirWiki(); return; }
      if (estaAutenticada(nombre)) return;
      abrirAutenticacion(nombre);
    });
    principal.querySelector('.vale-solicitar button').addEventListener('click', function () {
      principal.querySelector('.vale-apps-intro').textContent = 'Selecciona cualquiera de los aplicativos para solicitar su autenticación.';
      principal.querySelector('.vale-apps-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    autenticacion.querySelector('.vale-auth-volver').addEventListener('click', function () { abrirPrincipal(modoMisApps); });
    autenticacion.querySelector('.vale-apps-cerrar').addEventListener('click', function () { autenticacion.hidden = true; abrirPrincipal(modoMisApps); });
    autenticacion.querySelector('form').addEventListener('submit', function (evento) {
      evento.preventDefault();
      const nombre = autenticacion.querySelector('#valeAuthServicio').value;
      const usuario = autenticacion.querySelector('#valeAuthUsuario').value.trim();
      const clave = autenticacion.querySelector('#valeAuthClave').value;
      if (!usuario || !clave) { autenticacion.querySelector('.vale-auth-error').textContent = 'Completa usuario y contraseña.'; return; }
      try { sessionStorage.setItem(nombre === 'Wiki FISE' ? CLAVE_WIKI : 'vale_app_' + nombre, '1'); } catch (error) {}
      abrirPrincipal(modoMisApps);
    });
    wiki.querySelector('iframe').addEventListener('load', function () { if (this.src !== 'about:blank') wiki.classList.add('cargada'); });
    window.addEventListener('message', function (evento) {
      if (evento.origin !== location.origin || evento.data?.type !== 'wiki-fise:volver') return;
      wiki.hidden = true;
      document.body.classList.remove('vale-apps-bloqueado');
    });

    abrirPrincipal(false);
  });
})();
