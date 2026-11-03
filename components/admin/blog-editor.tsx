'use client'

import { useEffect, useState } from 'react'
import type { ActionState } from '@/app/admin/actions'
import { slugify } from '@/lib/validations'
import { AdminField, AdminForm, SubmitButton, adminInput } from './ui'
import { LocalImageField } from './local-image-field'

export type EditablePost = {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImageUrl: string
  status: 'draft' | 'published'
  /** ISO timestamp or '' */
  publishedAt: string
  seoTitle: string
  seoDescription: string
}

export function BlogEditor({ post, action }: { post: EditablePost; action: (prev: ActionState, fd: FormData) => Promise<ActionState> }) {
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [slugTouched, setSlugTouched] = useState(Boolean(post.slug))
  const [image, setImage] = useState(post.featuredImageUrl)
  const [seoTitle, setSeoTitle] = useState(post.seoTitle)
  const [seoDescription, setSeoDescription] = useState(post.seoDescription)
  const [pubLocal, setPubLocal] = useState('')
  useEffect(() => {
    if (!post.publishedAt) return
    const d = new Date(post.publishedAt)
    // Browser timezone is only known on the client, so this cannot be computed during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPubLocal(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
  }, [post.publishedAt])

  return (
    <AdminForm action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5 rounded-2xl border border-[#e8e0da] bg-white p-6">
        <AdminField name="title" label="Title">
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
            className={`${adminInput} text-lg`}
            required
          />
        </AdminField>
        <AdminField name="slug" label="URL slug" hint={`theconvenientconcierge.ca/blog/${slug || '…'}`}>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            onBlur={() => setSlug(slugify(slug))}
            className={adminInput}
          />
        </AdminField>
        <AdminField name="excerpt" label="Excerpt" hint="One or two sentences shown on the blog listing.">
          <textarea id="excerpt" name="excerpt" defaultValue={post.excerpt} rows={2} maxLength={400} className={adminInput} />
        </AdminField>
        <AdminField
          name="content"
          label="Article"
          hint="Formatting: ## Heading, ### Subheading, - list item, **bold**, *italic*, [link text](https://…). Leave a blank line between paragraphs."
        >
          <textarea id="content" name="content" defaultValue={post.content} rows={22} className={`${adminInput} font-mono text-sm leading-relaxed`} />
        </AdminField>
      </div>

      <div className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-[#e8e0da] bg-white p-5">
          <AdminField name="status" label="Status">
            <select id="status" name="status" defaultValue={post.status} className={adminInput}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
          </AdminField>
          <AdminField name="publishedAt" label="Publication date" hint="Leave empty to use the moment you publish.">
            <input id="publishedAt" type="datetime-local" value={pubLocal} onChange={(e) => setPubLocal(e.target.value)} className={adminInput} />
            {/* Browser converts its local time to an absolute ISO timestamp, so server timezone never matters. */}
            <input type="hidden" name="publishedAt" value={pubLocal ? new Date(pubLocal).toISOString() : ''} />
          </AdminField>
          <SubmitButton className="w-full">Save post</SubmitButton>
        </div>
        <div className="rounded-2xl border border-[#e8e0da] bg-white p-5">
          <LocalImageField label="Featured image" value={image} onChange={setImage} folder="pages" name="featuredImageUrl" />
        </div>
        <div className="space-y-4 rounded-2xl border border-[#e8e0da] bg-white p-5">
          <p className="text-sm font-semibold">Search engine preview</p>
          <AdminField name="seoTitle" label={`SEO title (${seoTitle.length}/70)`}>
            <input id="seoTitle" name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} className={adminInput} placeholder={title} />
          </AdminField>
          <AdminField name="seoDescription" label={`SEO description (${seoDescription.length}/170)`}>
            <textarea id="seoDescription" name="seoDescription" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={170} rows={3} className={adminInput} />
          </AdminField>
          <div className="rounded-lg bg-[#faf8f6] p-3">
            <p className="truncate text-[0.95rem] text-[#1a0dab]">{seoTitle || title || 'Post title'}</p>
            <p className="truncate text-xs text-emerald-800">theconvenientconcierge.ca/blog/{slug}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted">{seoDescription || 'Add a description to control how this post appears in search results.'}</p>
          </div>
        </div>
      </div>
    </AdminForm>
  )
}
