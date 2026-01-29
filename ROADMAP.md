# ZK Assistant - Implementation Roadmap

## Phase 1: MVP Scaffolding ✅ COMPLETE

### Completed
- [x] Project structure (Vite + React + TypeScript)
- [x] Tailwind CSS with Korean design system colors
- [x] Supabase auth context (email + password)
- [x] Database schema with RLS policies
- [x] Core pages with Korean UI:
  - [x] Login page (회원가입 / 로그인)
  - [x] Home page (노트 / 최근 노트)
  - [x] Graph page stub (그래프)
  - [x] Settings page stub (설정)
- [x] Sidebar navigation (한글 메뉴)
- [x] TypeScript compilation verified
- [x] Production build working
- [x] API layer (Zustand + Axios)

### Deliverables
```
✅ src/App.tsx (router setup)
✅ src/components/Layout.tsx (main layout)
✅ src/components/Sidebar.tsx (nav with Korean labels)
✅ src/pages/Login.tsx (auth UI)
✅ src/pages/Home.tsx (note editor + sync button)
✅ src/lib/auth.tsx (Supabase auth context)
✅ src/lib/supabase.ts (client initialization)
✅ supabase/migrations/001_initial_schema.sql (DB)
✅ supabase/functions/sync-notion/index.ts (skeleton)
✅ package.json (dependencies)
✅ tailwind.config.js (design tokens)
✅ BUILD_GUIDE.md (setup instructions)
```

---

## Phase 2: Rich Editor & Note Management (Next)

### 2.1 Rich Text Editor
- **Component:** `src/components/NoteEditor.tsx`
- **Library:** TipTap or Slate
- **Features:**
  - Markdown support (## heading, **bold**, etc.)
  - Backlink syntax [[note-title]]
  - Real-time autosave to Supabase
  - Keyboard shortcuts (Cmd+S, Cmd+K)
  - Code blocks with syntax highlighting

```typescript
// Usage in Home.tsx
<NoteEditor 
  value={noteContent} 
  onChange={handleSave}
  onLinkDetected={handleBacklink}
/>
```

### 2.2 Note List with Filters
- **Component:** `src/components/NoteList.tsx`
- **Features:**
  - Search by title/content
  - Filter by source (user, notion, ai)
  - Sort by date / title / updated
  - Pagination or infinite scroll
  - Tag filtering

### 2.3 Tag Management
- **Component:** `src/components/TagInput.tsx`
- **Features:**
  - Add/remove tags
  - Tag autocomplete
  - Tag cloud view
  - Filter notes by tag combination

### Files to Create
```
src/components/
├── NoteEditor.tsx
├── NoteList.tsx
├── TagInput.tsx
└── NotePreview.tsx

src/lib/
└── editor.ts (utilities for text processing)
```

---

## Phase 3: Knowledge Graph Visualization

### 3.1 Interactive Graph
- **Component:** `src/components/Graph.tsx`
- **Library:** Three.js or D3.js
- **Features:**
  - Render nodes (notes) and edges (links)
  - Click node → recenter + zoom
  - Spring physics simulation
  - Node labels (title or summary)
  - Color coding by source (notion=blue, user=purple, ai=green)

```typescript
interface GraphNode {
  id: string
  title: string
  source: 'user' | 'notion' | 'ai'
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
  reason: string
  score: number
}
```

### 3.2 Graph Data Fetching
- **Function:** `src/lib/graph.ts`
- **API Calls:**
  - `GET /api/notes` → all notes
  - `GET /api/notes/:id/relationships` → links

### Files to Create
```
src/components/
├── Graph.tsx (main viewer)
├── GraphNode.tsx (visual node)
├── GraphLegend.tsx (color legend)
└── GraphControls.tsx (zoom/pan)

src/lib/
└── graph.ts (force simulation)
```

---

## Phase 4: Semantic Search & Embeddings

### 4.1 Embedding Pipeline
- **API:** OpenAI `text-embedding-3-small` (1536 dimensions)
- **Storage:** `note_embeddings` table (pgvector)
- **Timing:** On note create/update

```typescript
// src/lib/embeddings.ts
export async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000), // Max tokens
  })
  return response.data[0].embedding
}
```

### 4.2 Semantic Search
- **Component:** `src/components/SearchBar.tsx`
- **Features:**
  - Input query
  - Vector similarity search via pgvector
  - Return top 10 relevant notes
  - Debounce search input

```sql
-- Query example
SELECT * FROM notes
WHERE user_id = current_user_id
ORDER BY embedding <-> query_embedding
LIMIT 10
```

### 4.3 Search Results Page
- **Component:** `src/pages/Search.tsx`
- **Features:**
  - Display search results ranked by relevance
  - Show snippets with highlighted matches
  - Filters (date, source, tags)
  - View count & timestamp

### Files to Create
```
src/components/
├── SearchBar.tsx
├── SearchResults.tsx
└── ResultCard.tsx

src/lib/
└── embeddings.ts (OpenAI integration)

src/pages/
└── Search.tsx
```

---

## Phase 5: AI Suggestions Panel

### 5.1 Link Suggestions
- **Component:** `src/components/SuggestionsPanel.tsx`
- **Logic:**
  - User opens a note
  - System finds similar notes via embeddings
  - Groups by concept cluster
  - Shows link proposals

```typescript
interface Suggestion {
  noteId: string
  title: string
  reason: string // "이 개념이 연결될 수 있습니다"
  score: number // 0-1
  tags: string[]
}
```

### 5.2 Suggestion Actions
- **User Can:**
  - "지금 연결" → Create link immediately
  - "무시" → Dismiss suggestion
  - "확장" → Show more similar notes

### 5.3 Concept Clustering
- **Logic:**
  - Group embeddings using K-means
  - Label each cluster (via Claude)
  - Show as "concept cards"

```
📌 원리 & 실제
  - Knowledge management
  - Personal knowledge graph
  - Link: Paper A, Paper B, Note C
```

### Files to Create
```
src/components/
├── SuggestionsPanel.tsx
├── SuggestionCard.tsx
└── ConceptCluster.tsx

src/lib/
└── suggestions.ts (clustering + ranking)
```

---

## Phase 6: Notion Integration

### 6.1 OAuth Connection
- **Component:** `src/components/NotionConnect.tsx`
- **Flow:**
  1. User clicks "Notion 연결"
  2. Redirects to Notion OAuth (https://api.notion.com/v1/oauth/authorize)
  3. Returns auth code
  4. Exchange code for token (Edge Function)
  5. Store token in `user_integrations` table

```typescript
// supabase/functions/sync-notion/index.ts
async function handleNotionOAuth(code: string, userId: string) {
  // 1. Exchange code for token
  const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://zk-assistant.vercel.app/settings',
    }),
    headers: {
      'Authorization': `Basic ${base64(CLIENT_ID + ':' + CLIENT_SECRET)}`,
      'Content-Type': 'application/json',
    },
  })

  // 2. Store token
  const { access_token } = await tokenResponse.json()
  await supabase
    .from('user_integrations')
    .upsert({ user_id: userId, provider: 'notion', token: access_token })

  // 3. Start sync
  return fetchNotionPages(access_token, userId)
}
```

### 6.2 Page Fetching & Parsing
- **Logic:**
  - Get all database pages user has access to
  - Extract title + content
  - Create notes with `source: 'notion'`
  - Track `notion_page_id` for updates

```typescript
async function fetchNotionPages(token: string, userId: string) {
  const notionClient = new Client({ auth: token })
  
  // 1. Get all databases
  const search = await notionClient.search({
    filter: { value: 'database', property: 'object' },
  })
  
  // 2. For each database, get pages
  for (const db of search.results) {
    const pages = await notionClient.databases.query({ database_id: db.id })
    
    // 3. Parse and create notes
    for (const page of pages.results) {
      const content = parseNotionBlocks(page.id)
      await supabase.from('notes').insert({
        user_id: userId,
        title: page.properties.Name.title[0].plain_text,
        content,
        source: 'notion',
        notion_page_id: page.id,
      })
    }
  }
}
```

### 6.3 Periodic Sync
- **Edge Function:** `supabase/functions/sync-notion`
- **Trigger:** Manual or scheduled (once per hour)
- **Logic:**
  - Check for new/modified pages in Notion
  - Update existing notes if changed
  - Handle deletions

### Files to Create
```
src/components/
├── NotionConnect.tsx
└── SyncStatus.tsx

supabase/functions/
└── sync-notion/
    ├── index.ts (main handler)
    └── notion-client.ts (Notion API wrapper)

src/lib/
└── notion.ts (parsing utilities)
```

---

## Phase 7: Settings & User Preferences

### 7.1 Settings Page Layout
- **Sections:**
  - Account (email, password change)
  - Integrations (Notion connect/disconnect)
  - Preferences (theme, sync frequency)
  - Privacy (data export, deletion)

### 7.2 Notion Management
- Show connected Notion workspace
- Last sync timestamp
- Sync frequency selector (manual, hourly, daily)
- Disconnect button (revoke token)

### 7.3 User Profile
- Edit display name
- Avatar upload (optional)
- Auto-sync toggle

### Files to Create
```
src/pages/
└── Settings.tsx (full implementation)

src/components/
├── AccountSettings.tsx
├── IntegrationSettings.tsx
├── PreferenceSettings.tsx
└── DataSettings.tsx

src/lib/
└── settings.ts (preference management)
```

---

## Phase 8: PWA & Offline Support

### 8.1 PWA Manifest
- **File:** `public/manifest.json`
- **Features:**
  - App icon
  - Splash screen
  - Install prompt
  - Display mode: standalone

### 8.2 Service Worker
- **File:** `src/service-worker.ts`
- **Features:**
  - Cache app shell
  - Offline fallback page
  - Background sync (notes created offline)

### 8.3 Install Prompt
- **Component:** `src/components/InstallPrompt.tsx`
- **Trigger:** On mobile, show "앱으로 설치" button

### Files to Create
```
public/
└── manifest.json

src/
├── service-worker.ts
└── components/InstallPrompt.tsx
```

---

## Phase 9: Testing & Polish

### 9.1 Unit Tests
- **Framework:** Vitest
- **Coverage:**
  - Auth context
  - API layer
  - Utility functions

### 9.2 E2E Tests
- **Framework:** Playwright
- **Flows:**
  - Sign up → Create note → Create link
  - Notion sync → View in graph
  - Search → Filter results

### 9.3 Performance
- Core Web Vitals: LCP < 2.5s, CLS < 0.1
- Bundle size: < 200KB gzip
- Graph rendering: < 100ms

### 9.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios

---

## Phase 10: Deployment & Monitoring

### 10.1 Frontend Deployment (Vercel)
```bash
npm run build
vercel deploy
```

### 10.2 Backend Deployment
```bash
# Edge Functions
supabase functions deploy sync-notion

# Database migrations
supabase db push
```

### 10.3 Analytics & Monitoring
- Sentry for error tracking
- PostHog for usage analytics
- Supabase analytics dashboard

---

## 📋 Checklist Template

For each phase:
- [ ] Design mockups
- [ ] Component structure
- [ ] Data model updates
- [ ] API endpoints
- [ ] Integration tests
- [ ] Documentation
- [ ] Code review
- [ ] Deployment

---

## 🎯 Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1: Scaffolding | 1 day | ✅ Done |
| 2: Rich Editor | 3 days | ⏳ Next |
| 3: Graph | 3 days | - |
| 4: Embeddings | 2 days | - |
| 5: AI Suggestions | 2 days | - |
| 6: Notion Sync | 2 days | - |
| 7: Settings | 1 day | - |
| 8: PWA | 1 day | - |
| 9: Testing | 2 days | - |
| 10: Deploy | 1 day | - |
| **Total** | **18 days** | - |

---

**Last Updated:** 2026-01-27  
**Next Phase:** Rich Text Editor & Note Management
