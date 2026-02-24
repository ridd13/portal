import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: Eigene Domain verifizieren und Absender ändern auf z.B. hallo@das-portal.online
const FROM_ADDRESS = "Das Portal <onboarding@resend.dev>";

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
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
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
        <hr style="border: none; border-top: 1px solid #e5ddd3; margin: 30px 0;" />
        <p style="color: #9a8b7a; font-size: 12px;">
          Das Portal — Sichtbarkeit für Coaches, Heiler:innen &amp; Facilitators<br>
          Schleswig-Holstein &amp; Hamburg
        </p>
      </div>
    `,
  });
}
