import { Schema, model, models } from 'mongoose';

interface IReview {
  stars: number;
  text?: string;
}

const reviewSchema = new Schema<IReview>({
  stars: {
    type: Number,
    required: true,
    min: [0, 'You must give at the least ({MIN}) stars'],
    max: [5, 'You can give at the most ({MAX}) stars'],
  },
  text: String,
});

export default models.Review || model('Review', reviewSchema);
