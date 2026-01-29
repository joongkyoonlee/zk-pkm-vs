import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Notes API
export const notesAPI = {
  create: (title: string, content: string) =>
    api.post('/api/notes', { title, content }),
  
  list: () =>
    api.get('/api/notes'),
  
  get: (id: string) =>
    api.get(`/api/notes/${id}`),
  
  update: (id: string, data: { title?: string; content?: string }) =>
    api.patch(`/api/notes/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/notes/${id}`),
}

// Search API
export const searchAPI = {
  semantic: (query: string) =>
    api.get('/api/search', { params: { q: query } }),
  
  byTags: (tags: string[]) =>
    api.get('/api/search', { params: { tags: tags.join(',') } }),
}

// Links API
export const linksAPI = {
  suggest: (noteId: string) =>
    api.post(`/api/notes/${noteId}/links/suggest`),
  
  getRelationships: (noteId: string) =>
    api.get(`/api/notes/${noteId}/relationships`),
}

// Grok AI API
export const grokAPI = {
  chat: async (messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) => {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        messages,
        model: 'grok-4-latest',
        stream: false,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
        },
      }
    )
    return response.data.choices?.[0]?.message?.content || ''
  },

  // 의미 검색 결과에 기반한 AI 답변 생성
  generateSearchResponse: async (query: string, notes: Array<{ title: string; content: string }>) => {
    const notesContext = notes
      .map((n) => `제목: ${n.title}\n내용: ${n.content}`)
      .join('\n\n---\n\n')

    return grokAPI.chat([
      {
        role: 'system',
        content: `당신은 개인 지식 관리 시스템의 AI 어시스턴트입니다. 사용자의 노트들을 분석하고, 의미 있는 인사이트를 제공합니다. 한국어로 답변하세요.`,
      },
      {
        role: 'user',
        content: `사용자가 이렇게 검색했습니다: "${query}"\n\n관련 노트들:\n\n${notesContext}\n\n이 노트들과 검색 쿼리를 바탕으로 사용자에게 도움이 될만한 인사이트와 분석을 제공해주세요.`,
      },
    ])
  },

  // 노트 요약 생성
  summarizeNote: async (title: string, content: string) => {
    return grokAPI.chat([
      {
        role: 'system',
        content: `당신은 노트 요약 전문가입니다. 주어진 노트를 3-5줄로 간결하게 요약하세요. 한국어로 답변하세요.`,
      },
      {
        role: 'user',
        content: `노트 제목: ${title}\n\n내용:\n${content}`,
      },
    ])
  },

  // 태그 자동 추천
  suggestTags: async (title: string, content: string) => {
    const response = await grokAPI.chat([
      {
        role: 'system',
        content: `당신은 태그 추천 전문가입니다. 주어진 노트에 적절한 3-5개의 태그를 JSON 배열 형태로 반환하세요. 예: ["태그1", "태그2", "태그3"]. 오직 JSON 배열만 반환하세요.`,
      },
      {
        role: 'user',
        content: `노트 제목: ${title}\n\n내용:\n${content}`,
      },
    ])
    try {
      return JSON.parse(response)
    } catch {
      return []
    }
  },

  // 노트 간 관계 분석
  analyzeRelationships: async (mainNote: { title: string; content: string }, relatedNotes: Array<{ title: string; content: string }>) => {
    const relatedContext = relatedNotes
      .map((n) => `- ${n.title}: ${n.content.substring(0, 100)}...`)
      .join('\n')

    return grokAPI.chat([
      {
        role: 'system',
        content: `당신은 지식 그래프 분석 전문가입니다. 노트들 간의 관계를 분석하고, 숨겨진 연결고리를 찾아냅니다. 한국어로 답변하세요.`,
      },
      {
        role: 'user',
        content: `주 노트:\n제목: ${mainNote.title}\n내용: ${mainNote.content}\n\n관련 노트들:\n${relatedContext}\n\n이 노트들 간의 관계를 분석하고, 어떤 인사이트를 얻을 수 있을지 설명해주세요.`,
      },
    ])
  },
  
  create: (fromId: string, toId: string, reason: string) =>
    api.post(`/api/notes/${fromId}/links`, { toId, reason }),
}

export default api
