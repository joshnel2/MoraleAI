import { SageMakerClient, CreateTrainingJobCommand } from '@aws-sdk/client-sagemaker';

const region = process.env.AWS_REGION || 'us-east-1';
const sm = new SageMakerClient({ region });

export async function startTrainingJob(jobName: string, roleArn: string, inputS3: string, outputS3: string): Promise<string> {
	await sm.send(new CreateTrainingJobCommand({
		TrainingJobName: jobName,
		RoleArn: roleArn,
		AlgorithmSpecification: { TrainingImage: '763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-training:2.3.0-gpu-py310-cu121-ubuntu20.04-sagemaker', TrainingInputMode: 'File' },
		InputDataConfig: [{ ChannelName: 'training', DataSource: { S3DataSource: { S3DataType: 'S3Prefix', S3Uri: inputS3, S3DataDistributionType: 'FullyReplicated' } } }],
		OutputDataConfig: { S3OutputPath: outputS3 },
		ResourceConfig: { InstanceCount: 1, InstanceType: 'ml.m5.xlarge', VolumeSizeInGB: 50 },
		StoppingCondition: { MaxRuntimeInSeconds: 3600 }
	}));
	return jobName;
}