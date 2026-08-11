import type { Metadata } from 'next'

import { ForgotPasswordCard } from '@/components/admin/ForgotPasswordCard'

// Project-owned override of /admin/forgot. Next.js prioritizes this static route segment over
// Payload's generated catch-all at ../[[...segments]]/page.tsx, so this renders instead of
// Payload's stock ForgotPasswordView for this exact path — no Payload core files are modified.
//
// This exists because Payload's stock Admin ForgotPasswordForm (@payloadcms/next) never
// inspects the response status of POST /api/users/forgot-password — it only checks whether the
// body parses as JSON — so it always shows the generic "Email Sent" screen even when the
// backend rejects the request. This project's backend intentionally returns a 400
// "Email not found." validation error for unknown/wrong-tenant emails (see
// validateForgotPasswordEligibility in src/collections/Users.ts), and this page is the only
// supported way to surface that in the Admin UI, since this Payload version has no
// admin.components.views.forgotPassword override slot.
//
// This page still calls the same official POST /api/users/forgot-password endpoint — no new
// backend route, no bypass of Payload's reset-token mechanism.

export const metadata: Metadata = {
  title: 'Forgot Password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordCard />
}
