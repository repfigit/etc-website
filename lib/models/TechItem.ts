import mongoose, { Schema, Document } from 'mongoose';

export interface ITechItem extends Document {
  name: string;
  url: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TechItemSchema = new Schema<ITechItem>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TechItemSchema.index({ order: 1 });

export default mongoose.models.TechItem || mongoose.model<ITechItem>('TechItem', TechItemSchema);

