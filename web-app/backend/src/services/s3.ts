import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const region = process.env.AWS_REGION || 'us-east-1';
const s3Client = new S3Client({ region });

export async function uploadTextToS3(bucket: string, key: string, body: string): Promise<void> {
	await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'application/json' }));
}

async function streamToString(stream: any): Promise<string> {
	if (stream && typeof stream.transformToString === 'function') {
		return stream.transformToString();
	}
	const chunks: Buffer[] = [];
	return await new Promise((resolve, reject) => {
		(stream as Readable).on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
		(stream as Readable).once('error', reject);
		(stream as Readable).once('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
	});
}

export async function downloadTextFromS3(bucket: string, key: string): Promise<string | null> {
	try {
		const resp = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
		if (!resp.Body) return null;
		return await streamToString(resp.Body as any);
	} catch (e) {
		return null;
	}
}