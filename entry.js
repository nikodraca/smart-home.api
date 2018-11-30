'use strict';

const Tradfri = require('./util/tradfri');
const Hapi = require('hapi');
const each = require('lodash/each');
const routes = require('./routes');

(async () => {
  await Tradfri.tradfriInit();

  // init hapi server
  const server = Hapi.server({
    port: 8000,
    routes: {
      cors: true,
      payload: { maxBytes: 52428800 }
    }
  });

  // Setup the routes
  each(routes, r => server.route(r));

  try {
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
})();
