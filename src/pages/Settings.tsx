'use client'

import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Settings() {
  const { user, notionConnected, connectNotion, disconnectNotion } = useAuth()
  const [disconnecting, setDisconnecting] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleNotionConnect = async () => {
    setConnecting(true)
    try {
      connectNotion()
    } catch (error) {
      console.error('Notion 연결 오류:', error)
      setConnecting(false)
    }
  }

  const handleNotionDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnectNotion()
    } catch (error) {
      console.error('Notion 연결 해제 오류:', error)
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">설정</h1>
      <p className="text-gray-600 mb-8">앱 설정을 관리합니다</p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 max-w-2xl">
        {/* 계정 섹션 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">계정</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                <span className="font-medium">이메일:</span> {user.email}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">사용자 ID:</span> {user.id.slice(0, 8)}...
              </p>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">로그인 정보 없음</p>
          )}
        </div>

        {/* Notion 연동 섹션 */}
        <div className="border-t pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notion 연동</h2>
              <p className="text-gray-600 text-sm mb-4">
                {notionConnected
                  ? 'Notion 계정이 연결되어 있습니다. 노트를 자동으로 동기화할 수 있습니다.'
                  : 'Notion 계정을 연결하여 노트를 자동으로 가져옵니다.'}
              </p>
            </div>
          </div>

          {notionConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-700">연결됨</span>
              </div>
              <button
                onClick={handleNotionDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
              >
                {disconnecting ? '해제 중...' : '연결 해제'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleNotionConnect}
              disabled={connecting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {connecting ? '연결 중...' : 'Notion 계정 연결'}
            </button>
          )}
        </div>

        {/* API 키 섹션 */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">개발자</h2>
          <p className="text-gray-600 text-sm mb-4">API 설정 및 토큰 관리</p>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
          >
            API 키 생성 (준비 중)
          </button>
        </div>
      </div>
    </div>
  )
}

