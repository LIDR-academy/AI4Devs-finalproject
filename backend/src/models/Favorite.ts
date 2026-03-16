import { Schema, model, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: Schema.Types.ObjectId;
  recipeId: Schema.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para evitar duplicados
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema); 