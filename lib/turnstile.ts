interface TurnstileVerificationResult {
  success: boolean;
  "error-codes"?: string[];
}

export const verifyTurnstileToken = async (
  token: string,
  remoteIp?: string
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Skip Turnstile verification if not configured (development mode)
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not configured - skipping captcha verification");
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: "Captcha token is required" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    if (!response.ok) {
      return { ok: false, error: "Captcha verification request failed" };
    }

    const result = (await response.json()) as TurnstileVerificationResult;
    if (!result.success) {
      const codes = result["error-codes"]?.join(", ") || "unknown_error";
      return { ok: false, error: `Captcha verification failed: ${codes}` };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Captcha verification failed" };
  }
};
