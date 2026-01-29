import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Plus, Search, Trash2, Save, X, RotateCw } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const { user, notionConnected, connectNotion } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  
  // 새 노트 생성
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  
  // 노트 수정
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  // 검색 필터링
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const createNote = async () => {
    if (!newNoteTitle.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: newNoteTitle,
          content: newNoteContent,
          source: 'user',
          user_id: user.id,
        }])
        .select()

      if (error) throw error
      setNotes([data?.[0] as Note, ...notes])
      setNewNoteTitle('')
      setNewNoteContent('')
      setShowCreateForm(false)
      alert('✅ 노트가 생성되었습니다!')
    } catch (err) {
      console.error('Failed to create note:', err)
      alert('노트 생성 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    }
  }

  const updateNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: editingTitle,
          content: editingContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)

      if (error) throw error
      
      setNotes(notes.map(n => n.id === noteId 
        ? { ...n, title: editingTitle, content: editingContent }
        : n
      ))
      setSelectedNote(null)
      alert('✅ 노트가 저장되었습니다!')
    } catch (err) {
      console.error('Failed to update note:', err)
      alert('노트 저장 실패')
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
      setNotes(notes.filter(n => n.id !== noteId))
      setSelectedNote(null)
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const syncNotion = async () => {
    if (!notionConnected) {
      connectNotion()
      return
    }

    setSyncStatus('syncing')
    try {
      // 개발 환경에서는 Edge Function이 배포되지 않으므로 건너뜁니다
      if (import.meta.env.DEV) {
        alert('⚠️ 개발 환경에서는 Notion 동기화가 지원되지 않습니다.\n프로덕션 배포 후 사용 가능합니다.')
        setSyncStatus('idle')
        return
      }

      const { error } = await supabase.functions.invoke('sync-notion')
      
      if (error) throw error
      
      setSyncStatus('done')
      setTimeout(() => setSyncStatus('idle'), 3000)
      await fetchNotes()
    } catch (err) {
      console.error('Sync failed:', err)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  // 수정 모드
  if (selectedNote) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={() => setSelectedNote(null)}
          className="mb-6 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
        >
          ← 돌아가기
        </button>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="w-full text-3xl font-bold text-gray-900 mb-4 outline-none p-2 rounded border border-transparent hover:border-gray-200"
          />

          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            placeholder="노트 내용을 입력하세요..."
            className="w-full h-96 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E5ADB]/20 resize-none"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => updateNote(selectedNote.id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#5E5ADB] text-white rounded-lg hover:bg-[#5E5ADB]/90 transition"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={() => deleteNote(selectedNote.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            생성: {new Date(selectedNote.created_at).toLocaleString('ko-KR')}
            <br />
            수정: {new Date(selectedNote.updated_at).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    )
  }

  // 새 노트 생성 폼
  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={() => setShowCreateForm(false)}
          className="mb-6 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
        >
          ← 돌아가기
        </button>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">새 노트 생성</h2>

          <input
            type="text"
            placeholder="노트 제목을 입력하세요..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E5ADB]/20"
          />

          <textarea
            placeholder="노트 내용을 입력하세요..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E5ADB]/20 resize-none"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={createNote}
              disabled={!newNoteTitle.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-[#5E5ADB] text-white rounded-lg hover:bg-[#5E5ADB]/90 disabled:opacity-50 transition"
            >
              <Plus className="w-4 h-4" />
              생성
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 메인 화면
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">내 노트</h1>
        <p className="text-gray-600">생각을 정리하고 연결하세요</p>
      </div>

      {/* Notion 미연결 경고 */}
      {!notionConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-1">Notion 계정 연결</h3>
          <p className="text-sm text-blue-800 mb-3">Notion에서 노트를 동기화하려면 먼저 계정을 연결해야 합니다.</p>
          <button
            onClick={connectNotion}
            className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
          >
            지금 연결하기 →
          </button>
        </div>
      )}

      {/* 액션 바 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 검색 바 */}
        <div className="col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="노트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E5ADB]/20"
          />
        </div>

        {/* 새 노트 버튼 */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#5E5ADB] text-white rounded-lg hover:bg-[#5E5ADB]/90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          새 노트
        </button>
      </div>

      {/* 동기화 버튼 */}
      <div className="mb-8">
        <button
          onClick={syncNotion}
          disabled={syncStatus === 'syncing' || !notionConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            syncStatus === 'syncing'
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : syncStatus === 'done'
              ? 'bg-green-500 text-white'
              : syncStatus === 'error'
              ? 'bg-red-500 text-white'
              : !notionConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? '동기화 중...' : syncStatus === 'done' ? '완료됨' : syncStatus === 'error' ? '실패' : 'Notion 동기화'}
        </button>
      </div>

      {/* 노트 목록 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {searchQuery ? `검색 결과 (${filteredNotes.length})` : `모든 노트 (${notes.length})`}
        </h2>

        {loading ? (
          <p className="text-gray-600 text-center py-12">로딩 중...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {searchQuery ? '검색 결과가 없습니다' : '아직 노트가 없습니다. 첫 번째 노트를 만들어보세요!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNote(note)
                  setEditingTitle(note.title)
                  setEditingContent(note.content)
                }}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#5E5ADB] transition cursor-pointer"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{note.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16">{note.content || '(내용 없음)'}</p>
                <p className="text-xs text-gray-400">
                  {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
