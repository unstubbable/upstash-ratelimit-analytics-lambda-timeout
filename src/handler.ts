import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';
import type {APIGatewayProxyEventV2} from 'aws-lambda';

export const handler = awslambda.streamifyResponse<APIGatewayProxyEventV2>(
  async (event, responseStream) => {
    console.log(JSON.stringify({event}));

    try {
      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.fixedWindow(5, `10 s`),
        analytics: true, // disable to prevent task timeouts
        prefix: `analytics-timeout-test`,
      });

      const {success, reset, remaining} = await ratelimit.limit(`test`);
      console.debug(`Rate limit result`, {success, remaining});

      if (success) {
        responseStream = awslambda.HttpResponseStream.from(responseStream, {
          statusCode: 200,
          headers: {
            'Content-Type': `text/plain; charset=utf-8`,
            'Cache-Control': `no-store`,
          },
        });

        responseStream.write(`Success`, `utf-8`);
      } else {
        console.warn(`Too Many Requests`);

        responseStream = awslambda.HttpResponseStream.from(responseStream, {
          statusCode: 429,
          headers: {
            'Content-Type': `text/plain; charset=utf-8`,
            'Cache-Control': `no-store`,
            'Retry-After': ((reset - Date.now()) / 1000).toFixed(),
          },
        });

        responseStream.write(`Too Many Requests`, `utf-8`);
      }
    } catch (error) {
      console.error(error);

      responseStream = awslambda.HttpResponseStream.from(responseStream, {
        statusCode: 500,
        headers: {
          'Content-Type': `text/plain; charset=utf-8`,
          'Cache-Control': `no-store`,
        },
      });

      responseStream.write(`Error`, `utf-8`);
    } finally {
      responseStream.end();
    }
  },
);
