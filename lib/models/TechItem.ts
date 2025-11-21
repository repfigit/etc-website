import mongoose, { Schema, Document } from 'mongoose';

export interface ITechItem extends Document {
  name: string;
  url: string;
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
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// Index on name field is automatically created by unique: true constraint


export default mongoose.models.TechItem || mongoose.model<ITechItem>('TechItem', TechItemSchema);

