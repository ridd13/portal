import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: Eigene Domain verifizieren und Absender ändern auf z.B. hallo@das-portal.online
const FROM_ADDRESS = "Das Portal <onboarding@resend.dev>";

const SITE_URL = "https://das-portal.online";

/** Shared email wrapper with portal branding */
function portalEmailLayout(content: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf6f1;">
      <div style="margin-bottom: 30px;">
        <a href="${SITE_URL}" style="color: #2c2418; text-decoration: none; font-size: 20px; font-weight: 700;">Das Portal</a>
      </div>
      ${content}
      <hr style="border: none; border-top: 1px solid #e5ddd3; margin: 30px 0;" />
      <p style="color: #9a8b7a; font-size: 12px;">
        Das Portal — Sichtbarkeit für Coaches, Heiler:innen &amp; Facilitators<br>
        Schleswig-Holstein &amp; Hamburg
      </p>
    </div>
  `;
}

/** Helper: Format date in German */
function formatDateDE(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Waitlist Confirmation ───────────────────────────────────────────

export async function sendConfirmationEmail(
  email: string,
  name: string | null,
  token: string
) {
  const siteUrl = getSiteUrl();
  const confirmUrl = `${siteUrl}/api/confirm?token=${token}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Bitte bestätige deine Anmeldung – Das Portal",
    html: portalEmailLayout(`
      <h1 style="color: #2c2418; font-size: 24px;">Willkommen bei Das Portal!</h1>
      <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
        Hallo${name ? ` ${name}` : ""},<br><br>
        schön, dass du dabei sein willst! Bitte bestätige deine E-Mail-Adresse mit einem Klick:
      </p>
      <a href="${confirmUrl}"
         style="display: inline-block; background-color: #b5651d; color: white; padding: 14px 28px;
                border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0;">
        E-Mail bestätigen
      </a>
      <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5; margin-top: 30px;">
        Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.<br>
        Kein Spam. Nur Updates zum Launch.
      </p>
    `),
  });
}

// ─── Event Registration: Confirmation to Participant ─────────────────

export type RegistrationEmailData = {
  firstName: string;
  lastName: string;
  email: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  locationName: string | null;
  address: string | null;
  status: "confirmed" | "waitlisted";
  message: string | null;
};

/** Send registration confirmation email to participant */
export async function sendRegistrationConfirmation(data: RegistrationEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping registration confirmation");
    return;
  }

  const isWaitlisted = data.status === "waitlisted";
  const subject = isWaitlisted
    ? `Warteliste: ${data.eventTitle} – Das Portal`
    : `Anmeldung bestätigt: ${data.eventTitle} – Das Portal`;

  const dateFormatted = formatDateDE(data.eventDate);
  const eventUrl = `${SITE_URL}/events/${data.eventSlug}`;

  const locationHtml = data.locationName
    ? `<p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;">
        <strong>Ort:</strong> ${data.locationName}${data.address ? ` — ${data.address}` : ""}
       </p>`
    : "";

  const statusBlock = isWaitlisted
    ? `<div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #92400e; font-size: 15px; margin: 0;">
          <strong>Du stehst auf der Warteliste.</strong><br>
          Wir benachrichtigen dich per E-Mail, sobald ein Platz frei wird.
        </p>
       </div>`
    : `<div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #065f46; font-size: 15px; margin: 0;">
          <strong>Dein Platz ist bestätigt!</strong>
        </p>
       </div>`;

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">
      ${isWaitlisted ? "Du stehst auf der Warteliste" : "Deine Anmeldung ist bestätigt"}
    </h1>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Hallo ${data.firstName},
    </p>
    ${statusBlock}
    <div style="background-color: #ffffff; border: 1px solid #e5ddd3; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #2c2418; font-size: 18px; margin: 0 0 12px 0;">${data.eventTitle}</h2>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;">
        <strong>Datum:</strong> ${dateFormatted}
      </p>
      ${locationHtml}
    </div>
    <a href="${eventUrl}"
       style="display: inline-block; background-color: #b5651d; color: white; padding: 12px 24px;
              border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 10px 0;">
      Event ansehen
    </a>
    <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5; margin-top: 30px;">
      Falls du nicht teilnehmen kannst, gib bitte dem Veranstalter Bescheid,
      damit jemand anderes nachrücken kann.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Registration confirmation failed:", error);
  }
}

// ─── Event Registration: Notification to Host ────────────────────────

export type HostNotificationData = {
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  eventDate: string;
  participantFirstName: string;
  participantLastName: string;
  participantEmail: string;
  participantMessage: string | null;
  status: "confirmed" | "waitlisted";
  currentCount: number;
  capacity: number | null;
};

/** Send notification email to host about new registration */
export async function sendHostRegistrationNotification(data: HostNotificationData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping host notification");
    return;
  }

  const dateFormatted = formatDateDE(data.eventDate);
  const statusText = data.status === "waitlisted" ? "Warteliste" : "Bestätigt";
  const capacityText = data.capacity
    ? `${data.currentCount} / ${data.capacity}`
    : `${data.currentCount} Anmeldungen`;
  const dashboardUrl = `${SITE_URL}/konto/anmeldungen`;

  const messageBlock = data.participantMessage
    ? `<p style="color: #6b5b4e; font-size: 15px;">
        <strong>Nachricht:</strong><br>
        <em style="color: #9a8b7a;">"${data.participantMessage}"</em>
       </p>`
    : "";

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">Neue Anmeldung</h1>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Hallo ${data.hostName},
    </p>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      <strong>${data.participantFirstName} ${data.participantLastName}</strong> hat sich für dein Event angemeldet.
    </p>
    <div style="background-color: #ffffff; border: 1px solid #e5ddd3; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #2c2418; font-size: 18px; margin: 0 0 12px 0;">${data.eventTitle}</h2>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Datum:</strong> ${dateFormatted}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Status:</strong> ${statusText}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>E-Mail:</strong> ${data.participantEmail}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Anmeldungen:</strong> ${capacityText}</p>
      ${messageBlock}
    </div>
    <a href="${dashboardUrl}"
       style="display: inline-block; background-color: #b5651d; color: white; padding: 12px 24px;
              border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 10px 0;">
      Anmeldungen verwalten
    </a>
  `);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.hostEmail,
      subject: `Neue Anmeldung: ${data.eventTitle} – Das Portal`,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Host notification failed:", error);
  }
}
