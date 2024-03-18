import * as cdk from 'aws-cdk-lib';
import './env.js';
import {Stack} from './stack.js';

const app = new cdk.App();

new Stack(app, `upstash-ratelimit-analytics-lambda-timeout`);
