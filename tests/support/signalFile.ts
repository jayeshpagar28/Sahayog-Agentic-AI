import * as fs from 'fs';

/**
 * Waits for a file to appear at `filePath`, returns its trimmed contents, then deletes it.
 * Used to hand a live human-supplied value (OTP, reference ID, etc.) into a running test —
 * there is no way to read real SMS delivery programmatically here, and `page.pause()` does
 * not hold for manual interaction in this environment either.
 */
export function waitForSignalFile(filePath: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      if (fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, 'utf8').trim();
        fs.unlinkSync(filePath);
        resolve(value);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out after ${timeoutMs}ms waiting for signal file: ${filePath}`));
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
  });
}

/**
 * Where a single applicant's OTP can come from, in priority order — mirrors the pattern
 * proven in `tests/10_STAFF_TS001/staff-account-creation.spec.ts`: a literal value or a
 * polled endpoint let the flow run unattended in CI; the signal file is the local human-relay
 * fallback.
 */
export interface OtpSource {
  literal?: string;
  url?: string;
  signalFile: string;
}

/** True when this applicant's OTP can be obtained without a person at the keyboard. */
export function hasUnattendedOtp(source: Pick<OtpSource, 'literal' | 'url'>): boolean {
  return !!(source.literal || source.url);
}

/** Polls an endpoint until its body yields a 4-8 digit code. */
async function pollOtpEndpoint(url: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  for (;;) {
    try {
      const response = await fetch(url, { headers: { Accept: 'text/plain, application/json' } });
      if (response.ok) {
        const body = (await response.text()).trim();
        const match = /^\d{4,8}$/.test(body) ? body : body.match(/\b(\d{4,8})\b/)?.[1];
        if (match) return match;
      }
    } catch {
      // Transient failures are expected while the SMS is in flight - keep polling.
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s polling the OTP endpoint ${url}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

/** Obtains one applicant's OTP from whichever source is configured (literal -> endpoint -> signal file). */
export async function resolveOtp(source: OtpSource, timeoutMs: number): Promise<string> {
  if (source.literal) return source.literal.trim();
  if (source.url) return pollOtpEndpoint(source.url, timeoutMs);
  return waitForSignalFile(source.signalFile, timeoutMs);
}
