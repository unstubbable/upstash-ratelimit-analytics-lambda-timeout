import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';
import type {APIGatewayProxyEventV2} from 'aws-lambda';

let ratelimit: Ratelimit;

try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.fixedWindow(5, `10 s`),
    analytics: true,
    prefix: `analytics-timeout-test`,
  });
} catch (error) {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    console.error(error);
  } else {
    console.warn(
      `Unable to create Redis instance, no rate limits are applied.`,
    );
  }
}

export const handler = awslambda.streamifyResponse<APIGatewayProxyEventV2>(
  async (event, responseStream) => {
    console.log(JSON.stringify({event}));
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

    responseStream.end();
  },
);
