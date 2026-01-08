export interface Note {
  id: string;
  title: string;
  content: any; // BlockNote content
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  selectedNoteId: string | number | null;
}
