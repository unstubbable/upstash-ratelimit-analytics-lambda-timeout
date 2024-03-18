import type {LambdaFunctionURLHandler} from 'aws-lambda';
import {Hono} from 'hono';
import {streamHandle} from 'hono/aws-lambda';
import {ratelimitMiddleware} from './ratelimit-middleware.js';

export const app = new Hono();

app.use(ratelimitMiddleware);
app.get(`/`, (context) => context.text(`test`));

export const handler: LambdaFunctionURLHandler = streamHandle(app);
