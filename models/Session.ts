import { Schema, model, models } from 'mongoose';
import type { ObjectId, Document, Model } from 'mongoose';

interface Session {
  subject: string;
  topic: string;
  hours: number;
  approved: boolean;
  tutorId: ObjectId | string;
  date: Date | string;
}

export type SessionDocument = Session & Document;

export interface SessionDocumentObject extends Session {
  _id: string;
}

type SessionModel = Model<SessionModel>;

const sessionSchema = new Schema<SessionDocument, SessionModel>({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  hours: { type: Number, required: true, default: 1 },
  approved: { type: Boolean, default: false },
  tutorId: { type: Schema.Types.ObjectId, ref: 'User' },
  date: Date,
});

export default models.Session ||
  model<SessionDocument, SessionModel>('Session', sessionSchema);
