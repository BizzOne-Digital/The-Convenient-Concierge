import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader, Panel, StatusBadge } from '@/components/admin/page-header'
import { connectDB } from '@/lib/mongodb'
import { BlogPost } from '@/models'

export const metadata = { title: 'Blog' }

export default async function AdminBlogList() {
  await connectDB()
  const posts = await BlogPost.find().sort({ updatedAt: -1 }).select('title slug status publishedAt updatedAt').lean()
  return (
    <>
      <PageHeader
        title="Blog"
        description="Write articles, save drafts and publish when ready."
        actions={
          <Link href="/admin/blog/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red px-4 text-sm font-semibold text-white hover:bg-red-deep">
            <Plus aria-hidden className="size-4" /> New post
          </Link>
        }
      />
      <Panel>
        {posts.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-muted">No posts yet. Your first article will appear on the public blog once published.</p>
        ) : (
          <ul className="divide-y divide-[#efe8e2]">
            {posts.map((p) => (
              <li key={String(p._id)}>
                <Link href={`/admin/blog/${p._id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-[#faf8f6]">
                  <span>
                    <span className="block font-semibold">{p.title}</span>
                    <span className="text-xs text-muted">/blog/{p.slug} · updated {new Date(p.updatedAt as Date).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</span>
                  </span>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
