import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { BlogEditor } from '@/components/admin/blog-editor'
import { saveBlogPostAction } from '@/app/admin/actions'

export const metadata = { title: 'New post' }

export default function NewPostPage() {
  return (
    <>
      <Link href="/admin/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text">
        <ArrowLeft aria-hidden className="size-4" /> All posts
      </Link>
      <PageHeader title="New post" />
      <BlogEditor
        action={saveBlogPostAction.bind(null, null)}
        post={{ title: '', slug: '', excerpt: '', content: '', featuredImageUrl: '', status: 'draft', publishedAt: '', seoTitle: '', seoDescription: '' }}
      />
    </>
  )
}
