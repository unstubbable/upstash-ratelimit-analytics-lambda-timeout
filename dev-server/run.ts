// eslint-disable-next-line import/order
import './stub-awslambda.js';
import {serve} from '@hono/node-server';
import {Hono} from 'hono';
import {app as handlerApp} from '../src/handler.js';

const app = new Hono();

app.route(`/`, handlerApp);

serve({fetch: app.fetch, port: 3000}, ({address, port}) => {
  const serverUrl = `http://${address.replace(`0.0.0.0`, `localhost`)}:${port}`;

  return console.log(`Started dev server at ${serverUrl}`);
});
