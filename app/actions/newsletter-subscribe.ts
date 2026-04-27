"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

export type NewsletterResult = {
  ok: boolean;
  error: string | null;
};

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.de",
  "guerrillamailblock.com",
  "throwam.com",
  "throwam.com",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "dispostable.com",
  "fakeinbox.com",
  "spamgourmet.com",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "maildrop.cc",
  "sharklasers.com",
  "spam4.me",
  "yopmail.com",
  "yopmail.fr",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
]);

// Module-level rate limiter: IP → array of timestamps
// Resets per serverless instance cold start — acceptable for pre-launch traffic.
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDisposableDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

export async function subscribeToNewsletter(
  _prev: NewsletterResult,
  formData: FormData
): Promise<NewsletterResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const consent = formData.get("consent_dsgvo") === "on";
  const honeypot = formData.get("website")?.toString() ?? "";
  const source = formData.get("source")?.toString() ?? "unknown";

  // Honeypot: silent success
  if (honeypot) return { ok: true, error: null };

  if (!consent) {
    return { ok: false, error: "Bitte stimme dem Erhalt des Newsletters zu." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Bitte prüfe deine E-Mail-Adresse." };
  }

  if (isDisposableDomain(email)) {
    return {
      ok: false,
      error: "Bitte verwende eine echte E-Mail-Adresse.",
    };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return {
      ok: false,
      error: "Zu viele Versuche. Bitte warte ein paar Minuten.",
    };
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  // If Mailerlite is not yet configured, act as if it worked (form is live, keys pending)
  if (!apiKey || !groupId) {
    console.warn("[newsletter] MAILERLITE_API_KEY or MAILERLITE_GROUP_ID not set — skipping API call");
    return { ok: true, error: null };
  }

  try {
    const res = await fetch(
      `https://api.mailerlite.com/api/v2/groups/${groupId}/subscribers`,
      {
        method: "POST",
        headers: {
          "X-MailerLite-ApiKey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          resubscribe: true,
          fields: { city: "Hamburg", source },
        }),
      }
    );

    if (res.status === 200 || res.status === 201) {
      return { ok: true, error: null };
    }

    if (res.status === 409) {
      return { ok: false, error: "Du bist bereits angemeldet. Vielen Dank!" };
    }

    Sentry.captureException(new Error(`Mailerlite API error: ${res.status}`), {
      extra: { source, status: res.status },
    });
    return {
      ok: false,
      error: "Da ist gerade was schief. Bitte versuch's in einem Moment nochmal.",
    };
  } catch (err) {
    Sentry.captureException(err, { extra: { source } });
    return {
      ok: false,
      error: "Da ist gerade was schief. Bitte versuch's in einem Moment nochmal.",
    };
  }
}
