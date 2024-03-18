Reproducing a task timeout in a response-streaming Lambda function, when using
analytics for `@upstash/ratelimit`.

## Start Dev Server

```
npm start
```

## Deploy a Lambda with a Function URL

Required environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

```
npm run deploy
```
