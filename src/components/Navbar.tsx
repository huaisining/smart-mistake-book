import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-primary-600">智能错题本</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              仪表盘
            </Link>
            <Link href="/mistakes" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              错题本
            </Link>
            <Link href="/review" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              复习
            </Link>
            <Link href="/add" className="btn-primary">
              + 添加错题
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
