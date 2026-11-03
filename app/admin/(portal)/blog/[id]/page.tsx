import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Types } from 'mongoose'
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { BlogEditor } from '@/components/admin/blog-editor'
import { ConfirmButton } from '@/components/admin/ui'
import { deleteBlogPostAction, saveBlogPostAction } from '@/app/admin/actions'
import { connectDB } from '@/lib/mongodb'
import { BlogPost } from '@/models'

export const metadata = { title: 'Edit post' }

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  if (!Types.ObjectId.isValid(id)) notFound()
  await connectDB()
  const p = await BlogPost.findById(id).lean()
  if (!p) notFound()
  return (
    <>
      <Link href="/admin/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text">
        <ArrowLeft aria-hidden className="size-4" /> All posts
      </Link>
      <PageHeader
        title="Edit post"
        description={sp.created ? 'Post created. Keep editing, or publish when ready.' : undefined}
        actions={
          <>
            {p.status === 'published' && (
              <Link href={`/blog/${p.slug}`} target="_blank" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#e3dad3] bg-white px-3.5 text-sm font-semibold hover:bg-cream">
                <ExternalLink aria-hidden className="size-4" /> View
              </Link>
            )}
            <ConfirmButton action={deleteBlogPostAction.bind(null, id)} message="Delete this post permanently?">
              <Trash2 aria-hidden className="size-4" /> Delete
            </ConfirmButton>
          </>
        }
      />
      <BlogEditor
        action={saveBlogPostAction.bind(null, id)}
        post={{
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? '',
          content: p.content ?? '',
          featuredImageUrl: p.featuredImageUrl ?? '',
          status: p.status as 'draft' | 'published',
          publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : '',
          seoTitle: p.seoTitle ?? '',
          seoDescription: p.seoDescription ?? '',
        }}
      />
    </>
  )
}
