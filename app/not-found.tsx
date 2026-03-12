import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg mb-8">ページが見つかりませんでした</p>
      <Link
        href="/discover/mapping"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        マップに戻る
      </Link>
    </div>
  )
}

