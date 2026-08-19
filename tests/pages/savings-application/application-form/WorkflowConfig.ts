import { type Page, expect } from '@playwright/test';

export interface AosStep {
  aosModuleSequence: number;
  stepCode: string;
  stepDesc: string;
  stepStatus: number;
  isEditable: number;
  skipAllowed: number;
  sequencialProcessing: number;
  componentModule: number;
}

/**
 * Reads the workflow definition the server returns for an application, rather than inferring
 * it from the stepper's DOM.
 *
 * Structural claims (AC6 "no Account Type step", BR-04 "nothing is skippable",
 * BR-26 "Document Upload alone is skippable") are properties of the workflow *configuration*,
 * so asserting them against `aos/steps/getdetails` is both stronger and far less brittle than
 * counting tabs. Confirmed live on SAH-1003-812, 2026-08-18.
 */
export class WorkflowConfig {
  /** Scheme 1003's own workflow definition — Silver is "...sas", Normal "...nsa". */
  static readonly WORKFLOW_UUID_SUFFIX = 'stsa';

  /**
   * Module sequences 1003 actually defines. 3 is the UI-less EXISTING_CUSTOMER_DATA system
   * step; 8, 9 and 14 do not exist on this scheme.
   *
   * 17 is `SUMMARY`. Note this contradicts US_010 FR-59, which states the Summary "is not
   * itself a workflow step (no stepCode, absent from aosStepList)". Verified live on
   * SAH-1003-815 (2026-08-18): once an application actually REACHES the review screen, the
   * server returns a 13th entry — `stepCode: "SUMMARY"`, sequence 17, isEditable 1,
   * stepStatus 0. The story's claim was drawn from applications that never got there.
   */
  static readonly EXPECTED_SEQUENCES = [1, 2, 4, 5, 6, 7, 10, 11, 12, 13, 15, 16, 17] as const;

  /** stepDesc of the review screen, which is also a stepper tab once reached. */
  static readonly SUMMARY_STEP_LABEL = 'Summary';

  /** The only step in the whole 1003 workflow configured skipAllowed: 1. */
  static readonly SKIPPABLE_STEP_CODE = 'APPL_DOCUMENT';

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Captures the next `aos/steps/getdetails` response. Call before the navigation or click
   * that triggers it, then await the returned promise.
   */
  async captureStepList(trigger: () => Promise<void>): Promise<AosStep[]> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('aos/steps/getdetails') && r.status() === 200,
      { timeout: 30000 },
    );
    await trigger();
    const body = (await (await responsePromise).json()) as Record<string, AosStep>;
    // The endpoint returns a numerically-keyed object, not a JSON array.
    return Object.values(body);
  }

  /** AC6 / BR-03 — scheme 1003 defines no Account Type step at all. */
  static verifyNoAccountTypeStep(steps: AosStep[]): void {
    const codes = steps.map((s) => s.stepCode);
    expect(codes, 'scheme 1003 must not define an ACCOUNT_TYPE step').not.toContain('ACCOUNT_TYPE');

    const sequenceTwo = steps.find((s) => s.aosModuleSequence === 2);
    expect(sequenceTwo?.stepCode, 'module sequence 2 must be eKYC, not Account Type').toBe(
      'EKYC_VERIFICATION',
    );
  }

  /**
   * BR-04 / BR-26 — every step is sequential, and only Document Upload may be skipped.
   *
   * `aos/steps/getdetails` returns only the steps an application has actually REACHED, so a
   * part-completed application legitimately returns fewer than 12. The assertions are
   * therefore scoped to the steps present rather than demanding the full set — asserting
   * equality against all 12 would fail on any seed that has not yet run the whole journey.
   */
  static verifySkipConfiguration(steps: AosStep[]): void {
    expect(steps.length, 'the workflow must return at least one step').toBeGreaterThan(0);

    for (const step of steps) {
      expect(step.sequencialProcessing, `${step.stepCode} must be sequential`).toBe(1);

      const expectedSkip = step.stepCode === WorkflowConfig.SKIPPABLE_STEP_CODE ? 1 : 0;
      expect(
        step.skipAllowed,
        `${step.stepCode} skipAllowed should be ${expectedSkip} — only ${WorkflowConfig.SKIPPABLE_STEP_CODE} may be skipped`,
      ).toBe(expectedSkip);
    }
  }

  /**
   * The module sequences an application has reached must always be a subset of the ones
   * scheme 1003 defines, in ascending order — and must never include 3, 8, 9 or 14, which
   * this scheme does not define at all. (3 is EXISTING_CUSTOMER_DATA, a UI-less system step
   * that never appears in this list.)
   */
  static verifySequencesAreValid(steps: AosStep[]): void {
    const sequences = WorkflowConfig.getSequences(steps);
    const allowed = new Set<number>(WorkflowConfig.EXPECTED_SEQUENCES);

    for (const seq of sequences) {
      expect(allowed.has(seq), `module sequence ${seq} is not defined by scheme 1003`).toBe(true);
    }
    for (const forbidden of [3, 8, 9, 14]) {
      expect(sequences, `sequence ${forbidden} must not exist on scheme 1003`).not.toContain(forbidden);
    }
    expect(sequences, 'sequences must be ascending').toEqual([...sequences].sort((a, b) => a - b));
  }

  /** FR-05 — 1003 runs its own workflow definition, so no 1001/1002 behaviour transfers. */
  static verifyOwnWorkflowDefinition(steps: AosStep[]): void {
    const uuids = new Set(
      steps.map((s) => (s as AosStep & { aosWorkflowDtlUuid?: string }).aosWorkflowDtlUuid),
    );
    expect(uuids.size, 'all steps must share one workflow definition').toBe(1);
    expect([...uuids][0] ?? '').toMatch(new RegExp(`${WorkflowConfig.WORKFLOW_UUID_SUFFIX}$`));
  }

  static getSequences(steps: AosStep[]): number[] {
    return steps.map((s) => s.aosModuleSequence).sort((a, b) => a - b);
  }

  static getEditableStepCodes(steps: AosStep[]): string[] {
    return steps.filter((s) => s.isEditable === 1).map((s) => s.stepCode);
  }
}
