import mongoose, { Schema } from 'mongoose';
const KpiRecordSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    kpiName: { type: String, required: true },
    period: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    unit: { type: String }
}, { timestamps: true });
KpiRecordSchema.index({ companyId: 1, kpiName: 1, period: 1 });
export const KpiRecord = mongoose.models.KpiRecord || mongoose.model('KpiRecord', KpiRecordSchema);
//# sourceMappingURL=KpiRecord.js.map