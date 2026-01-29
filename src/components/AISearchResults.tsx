import React, { useState, useEffect } from 'react'
import { Loader, Sparkles, AlertCircle } from 'lucide-react'
import { grokAPI } from '../lib/api'

interface AISearchResultsProps {
  query: string
  notes: Array<{ title: string; content: string }>
  isLoading?: boolean
}

export const AISearchResults: React.FC<AISearchResultsProps> = ({
  query,
  notes,
  isLoading: initialLoading = false,
}) => {
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (notes.length === 0 || !query) {
      setResponse('')
      return
    }

    const generateResponse = async () => {
      try {
        setLoading(true)
        setError('')
        const aiResponse = await grokAPI.generateSearchResponse(query, notes)
        setResponse(aiResponse)
      } catch (err) {
        setError('AI 응답 생성 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    generateResponse()
  }, [query, notes])

  if (!query || notes.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-[#5E5ADB]/10 to-[#F4A261]/10 rounded-lg p-6 border border-[#5E5ADB]/20 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#5E5ADB]" />
        <h3 className="text-lg font-semibold text-gray-900">AI 인사이트</h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 animate-spin text-[#5E5ADB] mr-2" />
          <span className="text-gray-600">분석 중...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {response && !loading && (
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  )
}
