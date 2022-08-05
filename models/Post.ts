import { PostType, PostStatus, CloudFile } from '../utils/types';
import cloudinary from '../utils/cloudinary-config';
import { Schema, model, models } from 'mongoose';
import User from './User';

import type { UserDocument, UserDocumentObject } from './User';
import type { ObjectId, Model, Document } from 'mongoose';

interface Post {
  checkoutCompleted: boolean;
  subject: string;
  description: string;
  price: number;
  status: PostStatus;
  answer: string;
  type: PostType;
  creator: ObjectId | UserDocument | UserDocumentObject | string;
  answeredBy: ObjectId | UserDocument | UserDocumentObject | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  attachments: Array<CloudFile>;
  answerAttachments: Array<CloudFile>;
}

export type PostDocument = Post & Document;

export interface PostDocumentObject extends Post {
  _id: string;
}
type PostModel = Model<PostDocument>;

const PostSchema = new Schema<PostDocument, PostModel>(
  {
    checkoutCompleted: { type: Boolean, default: false },
    subject: { type: String, required: true },
    price: { type: Number, default: 20 },
    description: { type: String, required: true },
    status: {
      type: String,
      default: PostStatus.NOT_ANSWERED,
      enum: [PostStatus.ANSWERED, PostStatus.NOT_ANSWERED, PostStatus.CLOSED],
    },
    answer: { type: String, default: '' },
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: [PostType.GLOBAL, PostType.SPECIFIC] },
    attachments: { type: [{ url: String, public_id: String }], default: [] },
    answerAttachments: {
      type: [{ url: String, public_id: String }],
      default: [],
    },
  },
  { timestamps: { createdAt: 'createdAt' } }
);

PostSchema.pre('remove', async function () {
  const user = await User.findById(this.creator);
  user.createdPosts = user.createdPosts.filter(
    (pid: ObjectId) => pid.toString() !== this._id.toString()
  );
  const promises: Array<Promise<UserDocument>> = [user.save()];

  if (this.attachments.length)
    this.attachments.forEach(({ public_id }) => {
      promises.push(cloudinary.uploader.destroy(public_id));
    });

  if (this.answerAttachments.length)
    this.answerAttachments.forEach(({ public_id }) => {
      promises.push(cloudinary.uploader.destroy(public_id));
    });

  if (this.answeredBy) {
    const tutor = await User.findById(this.answeredBy);
    tutor.posts = tutor.posts.filter(
      (pid: ObjectId) => pid.toString() !== this._id.toString()
    );
    promises.push(tutor.save());
  }

  await Promise.all(promises);
});

export default models.Post ||
  model<PostDocument, PostModel>('Post', PostSchema);
