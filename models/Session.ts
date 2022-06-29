import { Schema, model, models } from 'mongoose';
import type { ISession } from '../types';

const sessionSchema = new Schema<ISession>({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  hours: { type: Number, required: true, default: 1 },
  approved: { type: Boolean, default: false },
  date: Date,
});

export default models.Session || model('Session', sessionSchema);
