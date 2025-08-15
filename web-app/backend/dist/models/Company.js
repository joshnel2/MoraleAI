import mongoose, { Schema } from 'mongoose';
const CompanySchema = new Schema({
    name: { type: String, required: true, unique: true },
    extensionAddonActive: { type: Boolean, default: false },
    extensionSeats: { type: Number, default: 0 }
}, { timestamps: true });
export const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
//# sourceMappingURL=Company.js.map