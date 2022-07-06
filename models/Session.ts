import { Schema, model, models } from 'mongoose';
import { SessionStatus } from '../types';
import type { ObjectId, Document, Model } from 'mongoose';
import type { UserDocument, UserDocumentObject } from '../models/User';

interface Session {
  subject: string;
  topic: string;
  hours: number;
  status: SessionStatus;
  date: Date | string;
  tutor: ObjectId | UserDocument | UserDocumentObject | string;
  user: ObjectId | UserDocument | UserDocumentObject | string;
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
  status: { type: String, default: SessionStatus.NOT_APPROVED },
  tutor: { type: Schema.Types.ObjectId, ref: 'User' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  date: Date,
});

export default models.Session ||
  model<SessionDocument, SessionModel>('Session', sessionSchema);
