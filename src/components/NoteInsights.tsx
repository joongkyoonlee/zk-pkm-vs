import React, { useState } from 'react'
import { Loader, Sparkles, Tags, Zap, AlertCircle } from 'lucide-react'
import { grokAPI } from '../lib/api'

interface NoteInsightsProps {
  title: string
  content: string
  relatedNotes?: Array<{ title: string; content: string }>
}

export const NoteInsights: React.FC<NoteInsightsProps> = ({
  title,
  content,
  relatedNotes = [],
}) => {
  const [summary, setSummary] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [relationships, setRelationships] = useState<string>('')
  const [loading, setLoading] = useState({ summary: false, tags: false, relationships: false })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateSummary = async () => {
    try {
      setLoading((p) => ({ ...p, summary: true }))
      setErrors((p) => ({ ...p, summary: '' }))
      const result = await grokAPI.summarizeNote(title, content)
      setSummary(result)
    } catch (err) {
      setErrors((p) => ({ ...p, summary: '요약 생성 중 오류 발생' }))
    } finally {
      setLoading((p) => ({ ...p, summary: false }))
    }
  }

  const generateTags = async () => {
    try {
      setLoading((p) => ({ ...p, tags: true }))
      setErrors((p) => ({ ...p, tags: '' }))
      const result = await grokAPI.suggestTags(title, content)
      setTags(result)
    } catch (err) {
      setErrors((p) => ({ ...p, tags: '태그 추천 중 오류 발생' }))
    } finally {
      setLoading((p) => ({ ...p, tags: false }))
    }
  }

  const generateRelationships = async () => {
    if (relatedNotes.length === 0) {
      setErrors((p) => ({ ...p, relationships: '관련 노트가 없습니다.' }))
      return
    }

    try {
      setLoading((p) => ({ ...p, relationships: true }))
      setErrors((p) => ({ ...p, relationships: '' }))
      const result = await grokAPI.analyzeRelationships(
        { title, content },
        relatedNotes
      )
      setRelationships(result)
    } catch (err) {
      setErrors((p) => ({ ...p, relationships: '관계 분석 중 오류 발생' }))
    } finally {
      setLoading((p) => ({ ...p, relationships: false }))
    }
  }

  return (
    <div className="space-y-4">
      {/* 요약 섹션 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#5E5ADB]/30 transition">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5E5ADB]" />
            <h4 className="font-semibold text-gray-900">요약</h4>
          </div>
          <button
            onClick={generateSummary}
            disabled={loading.summary}
            className="px-3 py-1 text-sm bg-[#5E5ADB] text-white rounded hover:bg-[#5E5ADB]/90 disabled:opacity-50 transition"
          >
            {loading.summary ? <Loader className="w-4 h-4 animate-spin" /> : '생성'}
          </button>
        </div>
        {summary && <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>}
        {errors.summary && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.summary}
          </p>
        )}
      </div>

      {/* 태그 섹션 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#2A9D8F]/30 transition">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-[#2A9D8F]" />
            <h4 className="font-semibold text-gray-900">추천 태그</h4>
          </div>
          <button
            onClick={generateTags}
            disabled={loading.tags}
            className="px-3 py-1 text-sm bg-[#2A9D8F] text-white rounded hover:bg-[#2A9D8F]/90 disabled:opacity-50 transition"
          >
            {loading.tags ? <Loader className="w-4 h-4 animate-spin" /> : '생성'}
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-sm bg-[#2A9D8F]/10 text-[#2A9D8F] rounded-full border border-[#2A9D8F]/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.tags}
          </p>
        )}
      </div>

      {/* 관계 분석 섹션 */}
      {relatedNotes.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#F4A261]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F4A261]" />
              <h4 className="font-semibold text-gray-900">관계 분석</h4>
            </div>
            <button
              onClick={generateRelationships}
              disabled={loading.relationships}
              className="px-3 py-1 text-sm bg-[#F4A261] text-white rounded hover:bg-[#F4A261]/90 disabled:opacity-50 transition"
            >
              {loading.relationships ? <Loader className="w-4 h-4 animate-spin" /> : '분석'}
            </button>
          </div>
          {relationships && (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {relationships}
            </p>
          )}
          {errors.relationships && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.relationships}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
