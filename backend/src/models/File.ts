// models/File.ts

// --- 1. Import Dependencies ---
import { Schema, model, Document } from 'mongoose';

// --- 2. Define the Interface for the Document ---
// This interface describes the properties that a File document will have.
export interface IFile extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: Schema.Types.ObjectId;
  category: 'general' | 'image' | 'avatar' | 'document';
  createdAt: Date;
  updatedAt: Date;
}

// --- 3. Create the Mongoose Schema ---
// This schema defines the structure and rules for the 'files' collection in MongoDB.
const FileSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // This creates a reference to the 'User' model
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'image', 'avatar', 'document'], // Restrict to specific values
      default: 'general',
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

// --- 4. Create and Export the Model ---
// Mongoose compiles the schema into a model, which is a constructor for creating documents.
const File = model<IFile>('File', FileSchema);

export default File;
