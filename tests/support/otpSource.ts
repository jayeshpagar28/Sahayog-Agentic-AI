import * as fs from 'fs';

/**
 * Pluggable OTP resolution for the savings-account creation journeys (Staff, Silver, Normal).
 *
 * The design principle across all these flows: the browser does every UI action, and the
 * WORKFLOW'S OWN STATUS is the source of truth for DigiLocker and liveliness (they are polled,
 * never confirmed by a human's word). The OTP is the one value that must come from outside the
 * browser, and WHERE it comes from is configurable so the same spec serves an attended local
 * run and a CI-supplied run.
 *
 * Sources, in priority order:
 *   1. a literal env var  — the caller / CI injects the code directly.
 *   2. an endpoint env var — the script polls it; the response body carries the code
 *                            (an SMS-receiver webhook or a test-harness relay).
 *   3. a signal file       — a human reads the SMS and writes the code (the local default).
 *
 * Every flow passes its own env-var names and signal-file path, so a Joint journey (two
 * applicants, two OTPs) can point each gate at a different source.
 */
export interface OtpConfig {
  /** Env var holding a literal OTP, e.g. "STAFF_OTP" or "SIL_IND_OTP". */
  literalEnv?: string;
  /** Env var holding an endpoint URL whose body carries the OTP. */
  urlEnv?: string;
  /** Signal-file path a human writes the OTP to (the attended fallback). */
  signalFile: string;
}

/** True when this OTP can be obtained without a person at the keyboard. */
export function hasUnattendedOtpSource(config: OtpConfig): boolean {
  return !!(
    (config.literalEnv && process.env[config.literalEnv]) ||
    (config.urlEnv && process.env[config.urlEnv])
  );
}

export function describeOtpSource(config: OtpConfig): string {
  if (config.literalEnv && process.env[config.literalEnv]) return `literal ${config.literalEnv}`;
  if (config.urlEnv && process.env[config.urlEnv]) return `endpoint ${config.urlEnv}`;
  return `signal file ${config.signalFile}`;
}

/** Obtains the OTP from whichever source is configured. */
export async function resolveOtp(config: OtpConfig, timeoutMs: number): Promise<string> {
  const literal = config.literalEnv ? process.env[config.literalEnv] : undefined;
  if (literal) return literal.trim();

  const url = config.urlEnv ? process.env[config.urlEnv] : undefined;
  if (url) return pollOtpEndpoint(url, timeoutMs);

  return waitForSignalFile(config.signalFile, timeoutMs);
}

async function pollOtpEndpoint(url: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  for (;;) {
    try {
      const response = await fetch(url, { headers: { Accept: 'text/plain, application/json' } });
      if (response.ok) {
        const body = (await response.text()).trim();
        const code = /^\d{4,8}$/.test(body) ? body : body.match(/\b(\d{4,8})\b/)?.[1];
        if (code) return code;
      }
    } catch {
      // Transient failures are expected while the SMS is in flight — keep polling.
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s polling the OTP endpoint ${url}.`);
    }
    await sleep(5000);
  }
}

export function waitForSignalFile(filePath: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = (): void => {
      if (fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, 'utf8').trim();
        fs.unlinkSync(filePath);
        resolve(value);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s waiting for ${filePath}`));
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
  });
}

export function clearSignalFile(filePath: string): void {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function banner(title: string, lines: string[]): void {
  const rule = '='.repeat(78);
  console.log(`\n${rule}\n  ${title}\n${rule}`);
  lines.forEach((line) => console.log(`  ${line}`));
  console.log(`${rule}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
