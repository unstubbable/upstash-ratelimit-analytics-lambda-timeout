import path from 'path';
import * as cdk from 'aws-cdk-lib';
import type {Construct} from 'constructs';

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      `function`,
      {
        entry: path.join(import.meta.dirname, `../src/handler.ts`),
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        bundling: {format: cdk.aws_lambda_nodejs.OutputFormat.ESM},
        timeout: cdk.Duration.seconds(5),
        environment: {
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        },
      },
    );

    const functionUrl = new cdk.aws_lambda.FunctionUrl(this, `function-url`, {
      function: lambdaFunction,
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
    });

    new cdk.CfnOutput(this, `function-url-output`, {
      value: functionUrl.url,
    });
  }
}
