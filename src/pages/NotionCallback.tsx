'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function NotionCallback() {
  const navigate = useNavigate()
  const { handleNotionCallback } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const error = params.get('error')

        if (error) {
          console.error('Notion 인증 오류:', error)
          alert('Notion 인증 실패: ' + error)
          navigate('/settings')
          return
        }

        if (!code) {
          console.error('인증 코드 없음')
          navigate('/settings')
          return
        }

        await handleNotionCallback(code)
        // 성공 후 설정 페이지로 이동
        setTimeout(() => {
          navigate('/settings')
        }, 1000)
      } catch (error) {
        console.error('Notion 콜백 처리 오류:', error)
        alert('연결 중 오류가 발생했습니다')
        navigate('/settings')
      }
    }

    handleCallback()
  }, [navigate, handleNotionCallback])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <div className="w-6 h-6 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Notion 연결 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요</p>
      </div>
    </div>
  )
}
