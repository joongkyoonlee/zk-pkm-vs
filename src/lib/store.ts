import { create } from 'zustand'

interface Note {
  id: string
  title: string
  content: string
  source: 'user' | 'notion' | 'ai'
  created_at: string
  updated_at: string
}

interface NotesStore {
  notes: Note[]
  selectedNoteId: string | null
  loading: boolean
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, note: Partial<Note>) => void
  deleteNote: (id: string) => void
  selectNote: (id: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  selectedNoteId: null,
  loading: false,
  
  setNotes: (notes) => set({ notes }),
  
  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),
  
  updateNote: (id, partial) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...partial } : n
      ),
    })),
  
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),
  
  selectNote: (id) => set({ selectedNoteId: id }),
  
  setLoading: (loading) => set({ loading }),
}))
