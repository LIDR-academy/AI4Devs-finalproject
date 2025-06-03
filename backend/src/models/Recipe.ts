import { Schema, model, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: string;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
}

const recipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    type: String,
    required: true
  }],
  cookingTime: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Fácil', 'Media', 'Difícil']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Recipe = model<IRecipe>('Recipe', recipeSchema); 