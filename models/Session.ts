import { Schema, model, models } from 'mongoose';
import { SessionStatus } from '../utils/types';
import User from '../models/User';

import type { UserDocument, UserDocumentObject } from '../models/User';
import type { ObjectId, Document, Model } from 'mongoose';

interface Session {
  checkoutCompleted: boolean;
  subject: string;
  topic: string;
  hours: number;
  status: SessionStatus;
  price: number;
  date: Date | string;
  tutor: ObjectId | UserDocument | UserDocumentObject | string;
  user: ObjectId | UserDocument | UserDocumentObject | string;
}

export type SessionDocument = Session & Document;

export interface SessionDocumentObject extends Session {
  _id: string;
}

type SessionModel = Model<SessionDocument>;

const SessionSchema = new Schema<SessionDocument, SessionModel>({
  checkoutCompleted: { type: Boolean, default: false },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  hours: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  status: { type: String, default: SessionStatus.NOT_APPROVED },
  tutor: { type: Schema.Types.ObjectId, ref: 'User' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  date: Date,
});

SessionSchema.pre('remove', async function () {
  const [tutor, user] = await Promise.all([
    User.findById(this.tutor),
    User.findById(this.user),
  ]);

  user.bookedSessions = user.bookedSessions.filter(
    (id: ObjectId) => id.toString() !== this._id.toString()
  );
  tutor.requestedSessions = tutor.requestedSessions.filter(
    (id: ObjectId) => id.toString() !== this._id.toString()
  );

  await Promise.all([user.save(), tutor.save()]);
});

export default models.Session ||
  model<SessionDocument, SessionModel>('Session', SessionSchema);
