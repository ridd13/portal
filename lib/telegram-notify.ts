/**
 * Sendet eine Nachricht an Lennerts persönlichen Telegram-Chat.
 * Benötigt: TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_CHAT_ID in den Env-Vars.
 *
 * Chat-ID ermitteln:
 * 1. Bot in Telegram suchen + /start schicken
 * 2. https://api.telegram.org/bot<TOKEN>/getUpdates aufrufen
 * 3. "chat": { "id": XXXXX } aus der Antwort kopieren
 */
export async function notifyAdmin(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[telegram-notify] TELEGRAM_BOT_TOKEN oder TELEGRAM_ADMIN_CHAT_ID nicht gesetzt — Benachrichtigung übersprungen.");
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[telegram-notify] Fehler:", body);
    }
  } catch (err) {
    console.error("[telegram-notify] Netzwerkfehler:", err);
  }
}
