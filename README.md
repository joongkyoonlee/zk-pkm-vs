# ZK Assistant - AI-Native PKM

> A calm workspace to discover hidden relationships across notes.  
> **Notion meets Linear meets Knowledge Graphs** – but quieter.

## 🎯 Product Vision

ZK Assistant helps educators, consultants, and knowledge workers discover deep links between notes through AI-powered semantic search and interactive knowledge graphs. No intrusive summaries. Just quiet suggestions.

## 📋 Core Features

- ✅ **Smart Note Editor** – Clean, 680px fixed-width workspace with contextual tags/backlinks
- ✅ **Knowledge Graph** – Interactive visualization of note relationships
- ✅ **Notion Sync** – Import pages with one click (serverless sync function)
- ✅ **Semantic Search** – Vector embeddings + pgvector for deep discovery
- ✅ **AI Suggestions** – Concept clusters and link proposals (never pushy)
- ✅ **Multi-source** – Track origin: user-written, Notion, AI-generated
- ✅ **Accessibility** – Keyboard navigation, dark mode, WCAG compliant
- ✅ **PWA-ready** – Offline support, mobile optimized

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- React Router v6
- Zustand (state management)

**Backend:**
- Supabase (Postgres + Auth + Edge Functions)
- pgvector for semantic search
- Deno-based serverless functions

**AI:**
- OpenAI API (embeddings + reasoning)
- Anthropic Claude (matching + microcopy)

**Integrations:**
- Notion OAuth
- Vercel/Cloud Run for async sync

## 📁 Project Structure

```
zk-assistant/
├── src/
│   ├── components/        # React components
│   │   ├── Layout.tsx     # Main layout wrapper
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   └── ...
│   ├── pages/             # Route pages
│   │   ├── Home.tsx       # Editor + sync
│   │   ├── Graph.tsx      # Knowledge graph
│   │   └── Settings.tsx
│   ├── lib/               # Utilities
│   │   ├── auth.tsx       # Auth context
│   │   ├── supabase.ts    # Supabase client
│   │   └── api.ts         # API calls
│   ├── styles/
│   │   └── globals.css    # Global styles + Tailwind
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/        # SQL schema
│   └── functions/
│       └── sync-notion/   # Edge function
├── public/                # Static assets
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)
- OpenAI API key (optional)
- Notion API integration (for sync feature)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

Create `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI
VITE_OPENAI_API_KEY=sk-...

# Notion (optional)
VITE_NOTION_CLIENT_ID=your_client_id
VITE_NOTION_CLIENT_SECRET=your_client_secret
```

### Database Setup

1. Create a new Supabase project
2. Run the migration SQL in `supabase/migrations/001_initial_schema.sql`
3. Enable RLS on all tables

```bash
# Or use Supabase CLI
supabase migration up
```

### Development

```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Lint
npm run lint
```

Visit http://localhost:5173

## 📖 Usage

### 1. **Home / Editor**

- Create new notes with quick title input
- Click "동기화" (Sync) to import Notion pages
- View recent notes list
- Smart suggestions appear inline

### 2. **Knowledge Graph**

- Visual map of all notes + relationships
- Click a node to recenter and see connections
- Muted styling, spring animations

### 3. **Settings**

- Connect Notion OAuth
- Configure sync frequency
- Manage tags and filters

## 🔌 API Endpoints

### Notes CRUD
```
POST /api/notes            # Create
GET /api/notes             # List (user's notes)
GET /api/notes/:id         # Get
PATCH /api/notes/:id       # Update
DELETE /api/notes/:id      # Delete
```

### Links
```
POST /api/notes/:id/links        # Suggest links
GET /api/notes/:id/relationships # Get all links
```

### Search
```
GET /api/search?q=query         # Semantic search
GET /api/search?tags=tag1,tag2  # Filter by tags
```

### Sync
```
POST /functions/v1/sync-notion  # Notion OAuth + import
```

## 🎨 Design System

### Colors
- **Background**: `#F8F9FA`
- **Primary**: `#5E5ADB` (purple)
- **Accent**: `#F4A261` (orange)
- **Success**: `#2A9D8F` (green)
- **Danger**: `#E76F51` (red)

### Motion
- **Fade**: 250ms ease-in-out
- **Slide**: 300ms ease-in-out
- **Spring**: Custom spring for graph nodes

### Spacing (8pt grid)
- Padding: 24px–32px (major containers)
- Gap: 16px–24px (components)

## 📝 Microcopy Examples

- *Welcome state*: "환영합니다. 당신의 생각들이 연결될 준비가 되어있습니다."
- *Sync success*: "모두 동기화됨. 당신의 생각을 탐색해보세요."
- *Empty state*: "아직 노트가 없습니다. 첫 번째 노트를 만들어보세요!"
- *Suggestion*: "이 생각들이 연결될 수 있습니다 →"

## 🔐 Security

- Row-Level Security (RLS) on all tables
- Auth-gated API routes
- Environment variables for secrets
- No client-side API key exposure

## 📦 Deployment

### Vercel (Frontend)

```bash
vercel deploy
```

### Supabase (Backend)

```bash
supabase functions deploy sync-notion
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feat/new-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feat/new-feature`)
5. Open PR

## 📄 License

MIT

## 📞 Support

- Docs: [Wiki](./docs)
- Issues: GitHub Issues
- Discord: [Community](https://discord.gg/zkassistant)

---

Built with ❤️ for curious minds.
