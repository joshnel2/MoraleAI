import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { KpiRecord } from '../models/KpiRecord';

async function main() {
	const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-pbt';
	await mongoose.connect(mongoUri);
	console.log('Connected');
	const company = await Company.create({ name: 'DemoCo' });
	const adminPass = await bcrypt.hash('examplePass123', 12);
	await User.create({ email: 'admin@example.com', passwordHash: adminPass, role: 'admin', companyId: company._id });
	await KpiRecord.insertMany([
		{ companyId: company._id, kpiName: 'sales', period: '2025-08', value: 1000 },
		{ companyId: company._id, kpiName: 'sales', period: '2025-09', value: 1200 },
		{ companyId: company._id, kpiName: 'nps', period: '2025-08', value: 42 }
	]);
	console.log('Seeded');
	await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });