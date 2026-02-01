export interface Note {
  id: string;
  title: string;
  content: any; // BlockNote content
  createdAt: string;
  updatedAt: string;
  userId: number;
  isStarred?: boolean;
  isRemoved?: boolean;
  tags?: string[];
}

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  selectedNoteId: string | number | null;
}
