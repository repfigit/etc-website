import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  date: Date;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  presentations?: Array<{
    filename: string;
    url: string; // Vercel Blob URL
    contentType: string;
    size: number;
    uploadedAt: Date;
  }>;
  images?: Array<{
    filename: string;
    url: string; // Vercel Blob URL
    contentType: string;
    size: number;
    uploadedAt: Date;
    order?: number;
  }>;
  isVisible: boolean;
  content?: string; // Markdown content for detailed notes
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    presenter: {
      type: String,
    },
    presenterUrl: {
      type: String,
    },
    topic: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    locationUrl: {
      type: String,
    },
    presentations: [{
      filename: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      contentType: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    images: [{
      filename: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      contentType: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      order: {
        type: Number,
      },
    }],
    isVisible: {
      type: Boolean,
      default: true,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ date: -1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

