# The Convenient Concierge: Website & Admin Portal

Next.js 16 (App Router, TypeScript strict) · Tailwind CSS 4 · MongoDB Atlas (Mongoose) · Zod · Argon2id auth.

## Quick start

```bash
npm install
cp .env.example .env.local          # fill in MONGODB_URI and AUTH_SECRET
npm run hash-password -- "<strong password>"   # paste the output into ADMIN_PASSWORD_HASH (single quotes)
npm run seed                        # verified settings, FAQs, organisations, indexes (safe to re-run)
npm run create-admin                # creates/updates the admin from ADMIN_EMAIL + ADMIN_PASSWORD_HASH
npm run dev                         # http://localhost:3000, admin at /admin
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop / production build / serve |
| `npm run lint` · `typecheck` | ESLint · `tsc --noEmit` |
| `npm run test` · `test:watch` | Vitest unit + integration (in-memory MongoDB, never a real DB) |
| `npm run test:e2e` | Playwright smoke tests (run `npm run build` first) |
| `npm run seed` | Idempotent seed. Upserts only, never deletes, no fake reviews/posts/bookings |
| `npm run create-admin` · `hash-password` | Secure admin bootstrap (no passwords in source) |

## Environment variables

See `.env.example`. Required: `MONGODB_URI`, `AUTH_SECRET` (32+ chars). Admin bootstrap: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.
Optional: `BOOKING_NOTIFICATION_EMAIL` + `SMTP_*` (email alerts), `MAX_UPLOAD_BYTES` (default 4 MB), `NEXT_PUBLIC_SITE_URL`.

## Structure

```
app/(website)/      public pages: /, /services, /services/[slug], /about, /testimonials, /blog, /blog/[slug], /faq, /contact, /booking
app/admin/          /admin/login + protected portal (bookings, blog, faqs, testimonials, images, settings); actions.ts = server actions
app/api/            bookings, contact, upload, uploads/[folder]/[filename], admin/attachments/[filename]
components/         layout, home, sections, forms, admin, ui
lib/content.ts      source-controlled business content (services, areas, organisations, copy). Not admin-editable by design
lib/                auth, session, rate-limit, validations (Zod), uploads, upload-store, admin-service, data, seo, markdown
models/index.ts     all Mongoose models
scripts/            seed, create-admin, hash-password
tests/              unit, integration, e2e
```

## Key decisions

- **Limited CMS.** Admins manage only: booking inquiries, blog, FAQs, testimonials, five site images + gallery, phone/email. Services, layouts, colours, areas and the organisation list live in code. Server handlers enforce this with strict Zod schemas, not just the UI.
- **Uploads live in MongoDB** (`StoredUpload`), never on disk, so they survive Vercel redeploys. Real file signatures are checked (JPEG/PNG/WebP/GIF only; SVG/HTML rejected). Max 4 MB because Vercel Functions cap request bodies at 4.5 MB. Replaced images are deleted only after the content save succeeds and only when nothing else references them. Customer checklist attachments go to a private folder served only to admins.
- **Auth.** Server-side sessions (hashed tokens, 8 h expiry, real logout), Argon2id passwords, HTTP-only `SameSite=Strict` cookies (`__Host-` prefixed + Secure in production), active-status checks on every request, and persistent MongoDB rate limiting (login, bookings, uploads).
- **Public forms.** Zod validation on client and server, honeypot + timing checks, per-IP rate limits. Bookings are stored as *requests*, never shown as confirmed.
- **No fabricated content.** Testimonials and blog start empty with designed empty states; FAQs, services and the 27 organisations come from the existing site.
- **CSP** uses `'unsafe-inline'` for scripts (required by statically rendered Next.js pages). Move to a nonce CSP if a stricter policy is mandated; it forces dynamic rendering.

## Deployment (Vercel)

Set the env vars in the project, deploy, then run `npm run seed` and `npm run create-admin` once against the Atlas database (locally with production env vars). Use an Atlas database user scoped to this database with `readWrite` only.

## Image credits

Client photos are from the existing website. Toronto skyline, aerial, Etobicoke and lifestyle photos are from Unsplash (Unsplash License): `MP6jMrXcnpE`, `s0grRYEDaL4`, `qlKaN7eqay8`, `Obm3MF93c9A`, `QUYTz7c0dos` (`https://unsplash.com/photos/<id>`).

## Needs client confirmation

- Show "Marc Williams" as the named contact / click-and-collect pickup person? (Kept off the public site until confirmed.)
- Facebook/Instagram URLs were taken from the current site. Confirm they are still active.
- Real photos of the team and vehicle (current client photos are 1024px stock images), plus approved testimonials.
