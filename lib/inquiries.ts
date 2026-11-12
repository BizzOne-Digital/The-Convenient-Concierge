import 'server-only'
import { connectDB } from '@/lib/mongodb'
import { notifyNewInquiry } from '@/lib/mail'
import { serviceByType } from '@/lib/content'
import { BookingInquiry } from '@/models'
import type { BookingInput } from '@/lib/validations'

export const attachmentUrl = (filename: string) => `/api/admin/attachments/${filename}`

/** Labels shared by the admin view and the notification email. */
export function inquiryFieldLabels(serviceType: string) {
  const moving = serviceType === 'moving'
  return {
    pickupAddress: moving ? 'Pickup address' : serviceType === 'tasks' ? 'Location' : 'Pickup location',
    destinationAddress: moving ? 'Destination address' : 'Delivery location',
    itemDetails: moving ? 'Furniture inventory' : 'Item details',
  }
}

export async function createBookingInquiry(input: BookingInput, attachment = '', photoUrls: string[] = []) {
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
    accessDetails: input.accessDetails,
    packing: input.packing,
    itemDetails: input.itemDetails,
    description: input.description,
    attachmentUrl: attachment,
    photoUrls,
    status: 'new',
  })
  const l = inquiryFieldLabels(input.serviceType)
  const files = [attachment && 'moving checklist', photoUrls.length && `${photoUrls.length} photo(s)`].filter(Boolean).join(', ')
  await notifyNewInquiry({
    serviceLabel: serviceByType(input.serviceType)?.name ?? input.serviceType,
    name: input.name,
    email: input.email,
    phone: input.phone,
    details: [
      ['Preferred date', input.preferredDate],
      [l.pickupAddress, input.pickupAddress],
      [l.destinationAddress, input.destinationAddress],
      ['Property type', input.propertyType],
      ['Stairs / elevator', input.accessDetails],
      ['Packing', input.packing],
      [l.itemDetails, input.itemDetails],
      ['Attachments', files && `${files} (download in the admin portal)`],
    ],
    description: input.description,
  })
}

export async function createContactInquiry(input: { name: string; email: string; phone: string; message: string }) {
  await connectDB()
  await BookingInquiry.create({ ...input, description: input.message, serviceType: 'general', status: 'new' })
  await notifyNewInquiry({ serviceLabel: 'general enquiry', ...input, description: input.message })
}
