import { PageHero } from '@/components/layout/page-hero'
import { Markdown } from '@/lib/markdown'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How The Convenient Concierge MJM3 Inc. collects, uses, discloses, safeguards and retains personal information provided through our website and services.',
  path: '/privacy-policy',
})

// Client-supplied wording (2026-11-13), proposed and subject to confirming data-handling practices before publication.
// Headings are shown in sentence case; the text is otherwise verbatim.
const EFFECTIVE_DATE = 'Proposed Effective Date: November 12, 2026'

const policy = `
## 1. Introduction

The Convenient Concierge MJM3 Inc. (“we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information you provide when using our website or services.

This Privacy Policy explains how we collect, use, disclose, safeguard and retain personal information.

## 2. Information we collect

Depending on how you interact with us, we may collect:

- Your name, telephone number and email address.
- Pickup, delivery and service addresses.
- Moving dates, booking details and service instructions.
- Photographs or videos voluntarily submitted for quotations.
- Information relating to furniture, belongings and service requirements.
- Payment and transaction records relating to services provided, but not payment card information through our website.
- Website usage and technical information, where collected.

We request only information reasonably necessary for identified business purposes.

## 3. How we use your information

We use personal information to:

- Respond to inquiries and prepare quotations.
- Schedule and provide moving, delivery and concierge services.
- Communicate booking confirmations and service updates.
- Arrange payment for completed services outside the website.
- Address customer concerns and service-related claims.
- Maintain website functionality and security.
- Comply with applicable legal obligations.

We will identify any additional purposes and obtain consent where required.

## 4. Photographs and uploaded files

Customers may voluntarily submit photographs or videos of furniture, belongings or service locations to help us assess service requirements and prepare accurate quotations.

These materials are used for legitimate service-related purposes and are not published as promotional content without appropriate permission.

## 5. Consent

We collect, use and disclose personal information with consent where required by applicable law.

You may withdraw consent, subject to legal or contractual restrictions and reasonable notice.

## 6. Sharing personal information

We do not sell customer personal information.

We may share necessary information with authorized employees, contractors, service partners, payment processors and technology providers to deliver our services.

We may also disclose information when required or permitted by law.

We take reasonable steps to ensure service providers protect personal information appropriately.

## 7. Information security

We use reasonable administrative, technical and organizational safeguards appropriate to the sensitivity of the information.

However, no electronic transmission or storage system can be guaranteed completely secure.

## 8. Information retention

We retain personal information only as long as reasonably necessary for the purposes for which it was collected, or as required by applicable law.

When no longer required, information will be securely deleted, destroyed or anonymized, as appropriate.

## 9. Website cookies and analytics

Our website may use cookies or similar technologies to support functionality, security and performance.

Where analytics or other tracking technologies are used, we will provide relevant information and consent choices as required by applicable law.

## 10. Access and corrections

You may request access to personal information we hold about you and ask that inaccurate information be corrected, subject to applicable legal exceptions.

We will respond to privacy requests within applicable legal timeframes.

## 11. Third-party services

Our website may contain links to third-party websites or use external booking, payment or communication services.

Those providers may maintain their own privacy practices. We encourage customers to review their applicable privacy policies.

## 12. Privacy incidents

We maintain procedures to assess and respond to privacy incidents, including notification and recordkeeping where required by applicable law.

## 13. Changes to this policy

We may update this Privacy Policy to reflect changes in our services, business practices or legal requirements.

The latest version will be made available on our website with its effective date.

## 14. Contact us

**The Convenient Concierge MJM3 Inc.**

Privacy Contact: Marc Williams

Email: [info@theconvenientconcierge.ca](mailto:info@theconvenientconcierge.ca)

Website: [https://theconvenientconcierge.ca](/)

For questions, access requests, corrections or privacy concerns, please contact us using the information above.
`

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow={EFFECTIVE_DATE}
        title="Privacy Policy"
        lead="The Convenient Concierge MJM3 Inc."
        image="/images/photos/toronto-skyline-sunset.jpg"
        crumbs={[{ name: 'Privacy Policy', path: '/privacy-policy' }]}
      />
      <article className="section-y bg-cream">
        <div className="container-x prose-tcc max-w-[50rem]">
          <Markdown source={policy} />
        </div>
      </article>
    </>
  )
}
