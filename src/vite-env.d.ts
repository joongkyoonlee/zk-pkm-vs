/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_NOTION_CLIENT_ID: string
  readonly VITE_NOTION_CLIENT_SECRET: string
  readonly VITE_NOTION_REDIRECT_URI: string
  readonly VITE_NOTION_AUTH_URL: string
  readonly VITE_GROK_API_KEY: string
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
