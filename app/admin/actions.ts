'use server'

import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, authenticate, createSession, destroySession, sessionCookieOptions } from '@/lib/auth'
import { getCurrentAdmin } from '@/lib/session'
import { clientIp } from '@/lib/rate-limit'
import { loginSchema, pick } from '@/lib/validations'
import * as svc from '@/lib/admin-service'
import { imageSettingKeys } from '@/models'

export type ActionState = { ok?: boolean; message?: string; error?: string; errors?: Record<string, string[] | undefined> } | null

/* ---------- Auth ---------- */
export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(pick(fd, ['email', 'password']))
  if (!parsed.success) return { error: 'Please enter your email and password.' }
  try {
    const res = await authenticate(parsed.data.email, parsed.data.password, clientIp(await headers()))
    if (!res.ok) return { error: res.error }
    const { token, expiresAt } = await createSession(res.admin.id)
    ;(await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt))
  } catch {
    return { error: 'Sign-in is temporarily unavailable. Please try again shortly.' }
  }
  redirect('/admin')
}

export async function logoutAction() {
  const jar = await cookies()
  await destroySession(jar.get(SESSION_COOKIE)?.value).catch(() => {})
  jar.delete(SESSION_COOKIE)
  redirect('/admin/login')
}

/* ---------- Guard: every mutation re-checks the session server-side ---------- */
async function guard() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}
const done = (r: svc.Result, message: string): ActionState => (r.ok ? { ok: true, message } : { error: r.error, errors: r.errors })
const refreshSite = () => revalidatePath('/', 'layout')

/* ---------- Bookings ---------- */
export async function setBookingStatusAction(id: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await guard()
  const r = await svc.updateBookingStatus(id, { status: fd.get('status') })
  revalidatePath('/admin', 'layout')
  return done(r, 'Status updated.')
}

export async function deleteBookingAction(id: string) {
  await guard()
  await svc.deleteBooking(id)
  revalidatePath('/admin', 'layout')
  redirect('/admin/bookings')
}

/* ---------- Blog ---------- */
const BLOG_FIELDS = ['title', 'slug', 'excerpt', 'content', 'featuredImageUrl', 'status', 'publishedAt', 'seoTitle', 'seoDescription'] as const

export async function saveBlogPostAction(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await guard()
  const r = await svc.saveBlogPost(id, pick(fd, BLOG_FIELDS))
  if (!r.ok) return done(r, '')
  refreshSite()
  if (!id && r.id) redirect(`/admin/blog/${r.id}?created=1`)
  return { ok: true, message: 'Post saved.' }
}

export async function deleteBlogPostAction(id: string) {
  await guard()
  await svc.deleteBlogPost(id)
  refreshSite()
  redirect('/admin/blog')
}

/* ---------- FAQ ---------- */
const FAQ_FIELDS = ['question', 'answer', 'sortOrder', 'isPublished'] as const

export async function saveFaqAction(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await guard()
  const r = await svc.saveFaq(id, pick(fd, FAQ_FIELDS))
  if (r.ok) refreshSite()
  return done(r, id ? 'FAQ saved.' : 'FAQ added.')
}
export async function moveFaqAction(id: string, direction: 'up' | 'down') {
  await guard()
  await svc.moveFaq(id, direction)
  refreshSite()
}
export async function deleteFaqAction(id: string) {
  await guard()
  await svc.deleteFaq(id)
  refreshSite()
}

/* ---------- Testimonials ---------- */
const T_FIELDS = ['customerName', 'quote', 'serviceType', 'sortOrder', 'isPublished'] as const

export async function saveTestimonialAction(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await guard()
  const r = await svc.saveTestimonial(id, pick(fd, T_FIELDS))
  if (r.ok) refreshSite()
  return done(r, id ? 'Testimonial saved.' : 'Testimonial added.')
}
export async function deleteTestimonialAction(id: string) {
  await guard()
  await svc.deleteTestimonial(id)
  refreshSite()
}

/* ---------- Limited settings ---------- */
export async function saveContactSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await guard()
  const r = await svc.updateContactSettings(pick(fd, ['contactPhone', 'contactEmail']))
  if (r.ok) refreshSite()
  return done(r, 'Contact details saved.')
}

export async function saveImageSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await guard()
  const input = {
    ...pick(fd, imageSettingKeys),
    galleryImageUrls: fd.getAll('galleryImageUrls').filter((v): v is string => typeof v === 'string' && v !== ''),
  }
  const r = await svc.updateImageSettings(input)
  if (r.ok) refreshSite()
  return done(r, 'Images saved. The website will show them within a few seconds.')
}
