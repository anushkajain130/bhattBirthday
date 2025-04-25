import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  note: string;
  picturePath: string;
  createdAt: Date;
}

const NoteSchema: Schema = new Schema({
  note: { type: String, required: true },
  picturePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
