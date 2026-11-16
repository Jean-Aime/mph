import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  villa: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const parsed = inquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid name, email, and message.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destination = process.env.RESORT_INQUIRY_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !destination || !sender || !/^[^<>]+ <[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(sender)) {
    console.error('Inquiry email configuration is incomplete or RESEND_FROM_EMAIL is not in "Name <email@domain>" format.');
    return NextResponse.json({ error: 'Enquiries are temporarily unavailable. Please try again later.' }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const { name, email, message, villa } = parsed.data;
  const { error } = await resend.emails.send({
    from: sender,
    to: destination,
    replyTo: email,
    subject: `Sankore Retreat enquiry${villa ? ` - ${villa}` : ''}`,
    text: `Name: ${name}\nEmail: ${email}\nVilla: ${villa || 'Not specified'}\n\n${message}`,
  });
  if (error) {
    console.error('Resend inquiry delivery failed:', error);
    return NextResponse.json({ error: 'We could not send your enquiry. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
