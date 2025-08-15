import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const s3Client = new S3Client({ region });

export async function uploadTextToS3(bucket: string, key: string, body: string): Promise<void> {
	await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'application/json' }));
}