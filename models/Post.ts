import type { ObjectId, Model, Document } from 'mongoose';
import type { UserDocument, UserDocumentObject } from './User';
import { Schema, model, models } from 'mongoose';
import User from './User';
import { PostType, PostStatus } from '../types';

interface Post {
  subject: string;
  description: string;
  postImages: Array<{ url: string; public_id: string }>;
  answerImages: Array<{ url: string; public_id: string }>;
  status: PostStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  type: PostType;
  creator: ObjectId | UserDocument | UserDocumentObject | string;
  answeredBy: ObjectId | UserDocument | UserDocumentObject | string | null;
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
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: [PostType.GLOBAL, PostType.SPECIFIC] },
  },
  { timestamps: { createdAt: 'created_at' } }
);

PostSchema.pre('remove', async function () {
  const [tutor, user] = await Promise.all([
    User.findOne({ posts: { $in: [this._id] } }),
    User.findOne({ createdPosts: { $in: [this._id] } }),
  ]);
  user.createdPosts = user.createdPosts.filter(
    (pid: ObjectId) => pid.toString() !== this._id.toString()
  );
  tutor.posts = tutor.posts.filter(
    (pid: ObjectId) => pid.toString() !== this._id.toString()
  );
  await Promise.all([tutor.save(), user.save()]);
});

export default models.Post ||
  model<PostDocument, PostModel>('Post', PostSchema);
