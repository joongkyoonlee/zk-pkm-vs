import React, { useState, useMemo } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import { useNotesStore } from '../lib/store'
import { AISearchResults } from '../components/AISearchResults'
import { NoteInsights } from '../components/NoteInsights'

export const AISearch: React.FC = () => {
  const notes = useNotesStore((s) => s.notes)
  const [query, setQuery] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState<string>('')

  // 검색 쿼리 기반 노트 필터링
  const filteredNotes = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    )
  }, [query, notes])

  // 선택된 노트 찾기
  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // 선택된 노트와 관련된 노트들 찾기 (제목/내용에서 단어 공유)
  const relatedNotes = useMemo(() => {
    if (!selectedNote) return []
    
    const selectedWords = new Set(
      selectedNote.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)
    )

    return notes
      .filter((n) => n.id !== selectedNote.id)
      .map((n) => {
        const noteWords = new Set(
          n.content.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
        )
        const commonWords = [...selectedWords].filter((w) => noteWords.has(w)).length
        return { note: n, relevance: commonWords }
      })
      .filter((item) => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map((item) => item.note)
  }, [selectedNote, notes])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI 검색</h1>
          <p className="text-gray-600">
            노트를 검색하고 AI 기반 인사이트를 얻으세요
          </p>
        </div>

        {/* 검색 입력 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedNoteId('')
            }}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#5E5ADB] focus:ring-2 focus:ring-[#5E5ADB]/20 transition"
          />
        </div>

        {/* 검색 결과 */}
        {query.trim() ? (
          <div className="space-y-6">
            {/* AI 분석 */}
            {filteredNotes.length > 0 && (
              <AISearchResults
                query={query}
                notes={filteredNotes}
              />
            )}

            {/* 검색 결과 목록 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  검색 결과 ({filteredNotes.length})
                </h2>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">검색 결과가 없습니다</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`text-left p-4 rounded-lg border transition ${
                        selectedNoteId === note.id
                          ? 'bg-[#5E5ADB]/10 border-[#5E5ADB] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-[#5E5ADB]/50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {note.source}
                        </span>
                        <span>
                          {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 선택된 노트 상세 분석 */}
            {selectedNote && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedNote.title}
                </h2>
                <div className="prose prose-sm max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedNote.content}
                  </p>
                </div>

                {/* 노트 인사이트 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    AI 분석
                  </h3>
                  <NoteInsights
                    title={selectedNote.title}
                    content={selectedNote.content}
                    relatedNotes={relatedNotes.map((n) => ({
                      title: n.title,
                      content: n.content,
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              검색어를 입력하여 시작하세요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AISearch
