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
