import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export async function buildTrainingArtifact(outZipPath: string): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const output = fs.createWriteStream(outZipPath);
		const archive = archiver('zip', { zlib: { level: 9 } });
		output.on('close', () => resolve());
		archive.on('error', reject);
		archive.pipe(output);
		archive.file(path.resolve(process.cwd(), '../../ai-model/model/train_sagemaker_entry.py'), { name: 'train_sagemaker_entry.py' });
		archive.file(path.resolve(process.cwd(), '../../ai-model/model/requirements.txt'), { name: 'requirements.txt' });
		archive.finalize();
	});
}