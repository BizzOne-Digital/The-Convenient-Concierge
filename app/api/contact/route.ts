import { NextResponse } from 'next/server'
import { contactSchema, fieldErrors, looksLikeSpam, pick } from '@/lib/validations'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { createContactInquiry } from '@/lib/inquiries'

export const runtime = 'nodejs'
const MESSAGE = 'Thank you for reaching out. We will get back to you promptly.'

export async function POST(req: Request) {
  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid form submission.' }, { status: 400 })
  }
  try {
    if (!(await rateLimit(`contact:${clientIp(req.headers)}`, 5, 600)).ok)
      return NextResponse.json({ success: false, message: 'Too many messages. Please wait a few minutes.' }, { status: 429 })
    if (looksLikeSpam(fd.get('company'), fd.get('startedAt'))) return NextResponse.json({ success: true, message: MESSAGE })
    const parsed = contactSchema.safeParse(pick(fd, ['name', 'email', 'phone', 'message']))
    if (!parsed.success)
      return NextResponse.json({ success: false, message: 'Please check the highlighted fields.', errors: fieldErrors(parsed.error) }, { status: 422 })
    await createContactInquiry(parsed.data)
    return NextResponse.json({ success: true, message: MESSAGE })
  } catch {
    return NextResponse.json({ success: false, message: 'We could not send your message right now. Please call or email us.' }, { status: 503 })
  }
}
