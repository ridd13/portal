import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_ADDRESS = "Das Portal <hallo@das-portal.online>";
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
  const confirmUrl = `${SITE_URL}/api/confirm?token=${token}`;

  await getResend().emails.send({
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
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: data.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Registration confirmation failed:", error);
  }
}

// ─── Claim Flow ──────────────────────────────────────────────────────

export type ClaimEntityType = "event" | "host" | "location";

const CLAIM_LABELS: Record<ClaimEntityType, { noun: string; verb: string }> = {
  event: { noun: "Event", verb: "das Event" },
  host: { noun: "Profil", verb: "ein Anbieter-Profil" },
  location: { noun: "Raum", verb: "den Raum" },
};

/** Invite the real owner to claim an entry submitted by a third party */
export async function sendClaimInvitation({
  email,
  entityType,
  entityTitle,
  claimToken,
}: {
  email: string;
  entityType: ClaimEntityType;
  entityTitle: string;
  claimToken: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping claim invitation");
    return;
  }

  const { noun, verb } = CLAIM_LABELS[entityType];
  const claimUrl = `${SITE_URL}/claim/${claimToken}`;
  const subject = `${noun} auf Das Portal für dich eingetragen`;

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">${noun} für dich eingetragen</h1>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Hey,<br><br>
      jemand hat ${verb} <strong>${entityTitle}</strong> auf Das Portal eingetragen —
      wir würden den Eintrag gerne dir übergeben, damit du ihn selbst verwalten kannst.
    </p>
    <a href="${claimUrl}"
       style="display: inline-block; background-color: #b5651d; color: white; padding: 14px 28px;
              border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0;">
      Eintrag übernehmen
    </a>
    <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5; margin-top: 30px;">
      Der Link läuft nach 30 Tagen ab. Falls du keinen Eintrag haben möchtest,
      kannst du diese E-Mail ignorieren oder uns antworten.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Claim invitation failed:", error);
  }
}

/** Notify admin (Lennert) about a new claim request for manual review */
export async function sendClaimRequestNotification({
  entityType,
  entityTitle,
  entityId,
  claimerEmail,
  claimerName,
  message,
}: {
  entityType: ClaimEntityType;
  entityTitle: string;
  entityId: string;
  claimerEmail: string;
  claimerName: string;
  message: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping claim request notification");
    return;
  }

  const { noun } = CLAIM_LABELS[entityType];
  const subject = `Neuer Claim-Request: ${entityTitle} (${noun})`;

  const messageBlock = message
    ? `<p style="color: #6b5b4e; font-size: 15px;"><strong>Nachricht:</strong><br><em style="color: #9a8b7a;">"${message}"</em></p>`
    : "";

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">Neuer Claim-Request</h1>
    <div style="background-color: #ffffff; border: 1px solid #e5ddd3; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Typ:</strong> ${noun}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Eintrag:</strong> ${entityTitle}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>ID:</strong> ${entityId}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Name:</strong> ${claimerName}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>E-Mail:</strong> ${claimerEmail}</p>
      ${messageBlock}
    </div>
    <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5;">
      Zum Approven: <code>UPDATE ${entityType === "host" ? "hosts" : entityType === "location" ? "locations" : "events"} SET claim_status='approved', claimed_at=now() WHERE id='${entityId}';</code>
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: "lb@justclose.de",
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Claim request notification failed:", error);
  }
}

/** Confirm to claimer that their request was received */
export async function sendClaimRequestConfirmation({
  email,
  entityType,
  entityTitle,
}: {
  email: string;
  entityType: ClaimEntityType;
  entityTitle: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping claim request confirmation");
    return;
  }

  const { noun } = CLAIM_LABELS[entityType];
  const subject = `Wir prüfen deine Anfrage – Das Portal`;

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">Danke für deine Anfrage</h1>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Wir haben deine Anfrage zur Übernahme von ${noun === "Profil" ? "deinem Profil" : `${noun === "Event" ? "dem Event" : "dem Raum"}`}
      <strong>${entityTitle}</strong> erhalten.
    </p>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Wir prüfen deine Anfrage manuell und melden uns innerhalb von 48 Stunden bei dir.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Claim request confirmation failed:", error);
  }
}

// ─── Auth: Magic Link (branded, bypasses Supabase default template) ──

/** Branded sign-in magic link — use after admin.generateLink(), never signInWithOtp() */
export async function sendMagicLinkEmail(email: string, magicLinkUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping magic link email");
    return;
  }

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">Dein Anmeldelink</h1>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Klick auf den Button, um dich bei Das Portal anzumelden.<br>
      Der Link ist 60 Minuten gültig und kann nur einmal verwendet werden.
    </p>
    <a href="${magicLinkUrl}"
       style="display: inline-block; background-color: #b5651d; color: white; padding: 14px 28px;
              border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0;">
      Jetzt anmelden
    </a>
    <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5; margin-top: 30px;">
      Falls du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.<br>
      Dein Konto bleibt unverändert.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Dein Anmeldelink – Das Portal",
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Magic link email failed:", error);
    throw error;
  }
}

/** Branded claim magic link — use after admin.generateLink() in claim flow */
export async function sendClaimMagicLinkEmail({
  email,
  magicLinkUrl,
  entityTitle,
  entityType,
}: {
  email: string;
  magicLinkUrl: string;
  entityTitle: string;
  entityType: ClaimEntityType;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping claim magic link email");
    return;
  }

  const { noun } = CLAIM_LABELS[entityType];

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">${noun} übernehmen</h1>
    <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
      Hey,<br><br>
      klick auf den Button, um <strong>${entityTitle}</strong> auf Das Portal zu übernehmen
      und das Profil selbst zu verwalten.
    </p>
    <a href="${magicLinkUrl}"
       style="display: inline-block; background-color: #b5651d; color: white; padding: 14px 28px;
              border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0;">
      ${noun} übernehmen
    </a>
    <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5; margin-top: 30px;">
      Der Link ist 60 Minuten gültig und kann nur einmal verwendet werden.<br>
      Falls du keinen Eintrag haben möchtest, kannst du diese E-Mail ignorieren.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `${noun} auf Das Portal übernehmen – ${entityTitle}`,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Claim magic link email failed:", error);
    throw error;
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
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: data.hostEmail,
      subject: `Neue Anmeldung: ${data.eventTitle} – Das Portal`,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Host notification failed:", error);
  }
}
