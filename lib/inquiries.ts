import 'server-only'
import { connectDB } from '@/lib/mongodb'
import { notifyNewInquiry } from '@/lib/mail'
import { serviceByType } from '@/lib/content'
import { BookingInquiry } from '@/models'
import type { BookingInput } from '@/lib/validations'

export const attachmentUrl = (filename: string) => `/api/admin/attachments/${filename}`

export async function createBookingInquiry(input: BookingInput, attachment = '') {
  await connectDB()
  await BookingInquiry.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    serviceType: input.serviceType,
    preferredDate: input.preferredDate ? new Date(`${input.preferredDate}T12:00:00`) : null,
    pickupAddress: input.pickupAddress,
    destinationAddress: input.destinationAddress,
    propertyType: input.propertyType,
    itemDetails: input.itemDetails,
    description: input.description,
    attachmentUrl: attachment,
    status: 'new',
  })
  await notifyNewInquiry({
    serviceLabel: serviceByType(input.serviceType)?.name ?? input.serviceType,
    name: input.name,
    email: input.email,
    phone: input.phone,
    description: input.description,
  })
}

export async function createContactInquiry(input: { name: string; email: string; phone: string; message: string }) {
  await connectDB()
  await BookingInquiry.create({ ...input, description: input.message, serviceType: 'general', status: 'new' })
  await notifyNewInquiry({ serviceLabel: 'general enquiry', ...input, description: input.message })
}
