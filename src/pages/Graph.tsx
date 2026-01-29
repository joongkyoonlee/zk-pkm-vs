import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

interface Note {
  id: string
  title: string
  content: string
}

export default function Graph() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [stats, setStats] = useState({ total: 0, fromNotion: 0, fromUser: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, source')
        .order('created_at', { ascending: false })

      if (error) throw error

      const notesList = data as (Note & { source: string })[]
      setNotes(notesList)
      setStats({
        total: notesList.length,
        fromNotion: notesList.filter(n => n.source === 'notion').length,
        fromUser: notesList.filter(n => n.source === 'user').length,
      })
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">지식 그래프</h1>
      <p className="text-gray-600 mb-8">당신의 노트 네트워크를 시각화합니다</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-700">전체 노트</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">{stats.fromNotion}</div>
          <div className="text-sm text-purple-700">Notion 노트</div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="text-3xl font-bold text-green-600">{stats.fromUser}</div>
          <div className="text-sm text-green-700">사용자 노트</div>
        </div>
      </div>

      {/* Graph Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 h-96 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">📊 인터랙티브 그래프</p>
          <p className="text-gray-500">D3.js 그래프 렌더링 중...</p>
          <p className="text-gray-400 text-sm mt-2">노트 간의 연결관계를 시각화합니다</p>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">모든 노트</h2>
        {loading ? (
          <p className="text-gray-600">로딩 중...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">노트가 없습니다</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{note.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
