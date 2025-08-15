import 'source-map-support/register';
import { App, Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Role, ServicePrincipal, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

class AiModelStack extends Stack {
	constructor(scope: App, id: string, props?: StackProps) {
		super(scope, id, props);

		const dataBucket = new Bucket(this, 'DatasetsBucket', { encryption: BucketEncryption.S3_MANAGED, enforceSSL: true });
		const modelsBucket = new Bucket(this, 'ModelsBucket', { encryption: BucketEncryption.S3_MANAGED, enforceSSL: true });

		const sagemakerRole = new Role(this, 'SageMakerRole', {
			assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
			managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess')]
		});
		sagemakerRole.addToPolicy(new PolicyStatement({
			actions: ['s3:GetObject','s3:PutObject','s3:ListBucket'],
			resources: [dataBucket.bucketArn, `${dataBucket.bucketArn}/*`, modelsBucket.bucketArn, `${modelsBucket.bucketArn}/*`]
		}));

		new Function(this, 'InferenceLambda', {
			runtime: Runtime.PYTHON_3_12,
			code: Code.fromInline('def handler(event, context):\n  return {"statusCode": 200, "body": "ok"}') ,
			handler: 'index.handler',
			environment: {
				MODELS_BUCKET: modelsBucket.bucketName
			},
			timeout: Duration.seconds(30)
		});
	}
}

const app = new App();
new AiModelStack(app, 'AiModelStack');