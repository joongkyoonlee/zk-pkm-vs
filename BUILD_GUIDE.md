# ZK Assistant - Build & Deployment Guide

## ✅ Current Status

**Phase 1 Complete:** Core infrastructure scaffolding
- ✅ Vite + React + TypeScript setup
- ✅ Tailwind CSS configured with design system colors
- ✅ Supabase auth context (OAuth-ready)
- ✅ Korean UI throughout (모든 메뉴 한글화)
- ✅ Database schema with RLS
- ✅ TypeScript compilation verified
- ✅ Production build successful

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd "c:\Users\joong\study\vs code\ai native pkm"
npm install
```

### 2. Set Up Environment

Create `.env.local`:

```env
# Supabase (create free account at https://supabase.com)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI (optional, for embeddings)
VITE_OPENAI_API_KEY=sk-...

# Notion OAuth (optional, for sync)
VITE_NOTION_CLIENT_ID=your_client_id
VITE_NOTION_CLIENT_SECRET=your_client_secret
```

### 3. Set Up Database

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create new project
3. Go to SQL Editor → New Query
4. Run the SQL from `supabase/migrations/001_initial_schema.sql`
5. Verify tables are created with RLS enabled

### 4. Run Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main layout wrapper
│   └── Sidebar.tsx         # Navigation sidebar
├── pages/
│   ├── Login.tsx           # Auth page (Korean UI)
│   ├── Home.tsx            # Note editor + sync
│   ├── Graph.tsx           # Knowledge graph (stub)
│   └── Settings.tsx        # User settings (stub)
├── lib/
│   ├── auth.tsx            # Auth context + hooks
│   ├── supabase.ts         # Supabase client
│   ├── api.ts              # API layer
│   ├── store.ts            # Zustand state
│   └── utils.ts            # Utilities
├── styles/
│   └── globals.css         # Tailwind + custom
├── App.tsx                 # Router setup
└── main.tsx                # Entry point

supabase/
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
└── functions/
    └── sync-notion/            # Edge function (Deno)
```

## 🎨 Design System

### Colors (Tailwind extended)

```
Primary:   #5E5ADB (purple)
Accent:    #F4A261 (orange)
Success:   #2A9D8F (teal)
Danger:    #E76F51 (red)
Background: #F8F9FA (light gray)
```

### Spacing (8pt grid)

```
px-4 = 16px
py-2 = 8px
p-6 = 24px
p-8 = 32px
gap-3 = 12px
```

### Motion

```
Fade: 250ms ease-in-out
Slide: 300ms ease-in-out
Spin: infinite for loading
```

## 🔐 Authentication Flow

```
1. User visits /login
2. Sign up or login with email/password
3. Supabase creates session + JWT
4. Stored in browser (managed by @supabase/supabase-js)
5. Auth context provides `useAuth()` hook
6. RLS policies enforce user isolation
```

## 💾 Database Tables

### notes
```sql
id (uuid), user_id (uuid fk), title, content, 
source (user|notion|ai), created_at, updated_at
```

### note_tags
```sql
id (uuid), note_id (uuid fk), tag (text)
```

### note_links
```sql
id (uuid), from_note_id (uuid fk), to_note_id (uuid fk),
reason (text), score (float), created_at
```

### note_embeddings
```sql
note_id (uuid pk fk), embedding (vector[1536]),
model (text), updated_at
```

## 📡 API Endpoints (Future)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/notes` | Create note |
| GET | `/api/notes` | List user's notes |
| PATCH | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/search?q=query` | Semantic search |
| POST | `/api/notes/:id/links` | Create link |
| POST | `/functions/v1/sync-notion` | Notion sync |

## 🔄 State Management

Using Zustand (`src/lib/store.ts`):

```typescript
const { notes, selectedNoteId, addNote, updateNote } = useNotesStore()
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 📦 Deployment

### Frontend (Vercel)

```bash
# Connect to Vercel
vercel link

# Set environment variables in Vercel dashboard
# Deploy
vercel deploy
```

### Backend (Supabase Edge Functions)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy function
supabase functions deploy sync-notion
```

### Database (Supabase)

Already hosted on Supabase (no additional deployment needed)

## 🚨 Common Issues

### "Missing Supabase environment variables"

**Fix:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`

### Auth not persisting

**Fix:** Check browser localStorage/sessionStorage not disabled

### Database queries returning empty

**Fix:** Verify RLS policies allow your user_id

### Build error: "Module not found"

**Fix:** Run `npm install` again, clear node_modules if needed

## 📝 Next Phase (Kanban)

1. **Rich Text Editor**
   - Add TipTap or Slate
   - Markdown support
   - Real-time sync

2. **Knowledge Graph**
   - Three.js or D3.js visualization
   - Node click → recenter animation
   - Label shows title/summary

3. **Semantic Search + Embeddings**
   - OpenAI embeddings pipeline
   - pgvector search
   - Suggestion clustering

4. **Notion Integration**
   - OAuth flow
   - Page parsing
   - Auto-sync option

5. **AI Suggestions**
   - Link proposals
   - Concept extraction
   - Microcopy generation

6. **PWA & Offline**
   - Service worker
   - Offline storage (IndexedDB)
   - Mobile app shell

## 🔗 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)

## 🎯 Architecture Decisions

### Why Vite?
- Instant HMR (hot reload)
- Smaller bundle size vs CRA
- Native ESM support

### Why Supabase?
- Postgres + Auth + Functions in one
- pgvector for semantic search
- RLS for security

### Why Tailwind?
- Utility-first CSS
- Consistent spacing/colors
- Minimal custom CSS

### Why React Router v6?
- Modern hook-based API
- Better TypeScript support
- Nested routes ready

## 📞 Support

For issues:
1. Check `.env.local` is properly configured
2. Verify Supabase project is active
3. Check browser console for errors
4. Review RLS policies in Supabase dashboard

---

**Last Updated:** 2026-01-27  
**Status:** MVP Phase 1 ✅ Complete  
**Ready for:** Phase 2 (Rich Editor + Graph)
