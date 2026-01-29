import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { BookOpen, Network, Settings, LogOut, Sparkles } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar() {
  const { signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: BookOpen, label: '노트' },
    { path: '/ai-search', icon: Sparkles, label: 'AI 검색' },
    { path: '/graph', icon: Network, label: '그래프' },
    { path: '/settings', icon: Settings, label: '설정' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">ZK</h1>
        <p className="text-xs text-gray-500 mt-1">지식 연결 공간</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition',
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
