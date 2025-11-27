import mongoose, { Schema, Model } from 'mongoose';

export interface ISite {
  url: string;
  title: string;
  category: string;
  genres: string[];
  year: number;
  description: string;
  isApproved: boolean;
  addedAt: Date;
}

const SiteSchema = new Schema<ISite>({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
    default: [],
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const Site: Model<ISite> = mongoose.models.Site || mongoose.model<ISite>('Site', SiteSchema);

export default Site;
