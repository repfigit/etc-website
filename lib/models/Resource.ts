import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  url: string;
  description?: string;
  thumbnail?: {
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
  };
  featured: boolean;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      filename: String,
      data: Buffer,
      contentType: String,
      size: Number
    },
    featured: {
      type: Boolean,
      default: false,
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

ResourceSchema.index({ order: 1 });

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

