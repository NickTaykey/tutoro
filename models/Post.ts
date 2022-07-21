import type { ObjectId, Model, Document } from 'mongoose';
import type { UserDocument, UserDocumentObject } from './User';
import { Schema, model, models } from 'mongoose';
import User from './User';
import { PostType, PostStatus, ImageObject } from '../types';

interface Post {
  subject: string;
  description: string;
  postImages: Array<ImageObject>;
  answerImages: Array<ImageObject>;
  status: PostStatus;
  answer: string;
  type: PostType;
  creator: ObjectId | UserDocument | UserDocumentObject | string;
  answeredBy: ObjectId | UserDocument | UserDocumentObject | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export type PostDocument = Post & Document;

export interface PostDocumentObject extends Post {
  _id: string;
}
type PostModel = Model<PostDocument>;

const PostSchema = new Schema<PostDocument, PostModel>(
  {
    subject: { type: String, required: true },
    description: { type: String, required: true },
    postImages: { type: [{ url: String, public_id: String }], default: [] },
    answerImages: { type: [{ url: String, public_id: String }], default: [] },
    status: {
      type: String,
      default: PostStatus.NOT_ANSWERED,
      enum: [PostStatus.ANSWERED, PostStatus.NOT_ANSWERED, PostStatus.CLOSED],
    },
    answer: { type: String, default: '' },
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: [PostType.GLOBAL, PostType.SPECIFIC] },
  },
  { timestamps: { createdAt: 'createdAt' } }
);

PostSchema.pre('remove', async function () {
  const [tutor, user] = await Promise.all([
    User.findOne({ posts: { $in: [this._id] } }),
    User.findOne({ createdPosts: { $in: [this._id] } }),
  ]);
  user.createdPosts = user.createdPosts.filter(
    (pid: ObjectId) => pid.toString() !== this._id.toString()
  );
  const promises: Array<Promise<UserDocument>> = [user.save()];
  if (tutor) {
    tutor.posts = tutor.posts.filter(
      (pid: ObjectId) => pid.toString() !== this._id.toString()
    );
    promises.push(tutor.save());
  }
  await Promise.all(promises);
});

export default models.Post ||
  model<PostDocument, PostModel>('Post', PostSchema);
