let cidModulePromise: Promise<typeof import("multiformats/cid")> | null = null;

const CID_V0_PATTERN = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
const CID_V1_PATTERN = /^b[abcdefghijklmnopqrstuvwxyz234567]{10,}$/;

async function loadCidModule() {
  if (!cidModulePromise) {
    cidModulePromise = import("multiformats/cid");
  }

  return cidModulePromise;
}

export async function normalizeCid(input: string): Promise<string | null> {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const { CID } = await loadCidModule();
    return CID.parse(trimmed).toString();
  } catch {
    // Fallback for CommonJS-only test runners where ESM parser imports are blocked.
    if (CID_V0_PATTERN.test(trimmed) || CID_V1_PATTERN.test(trimmed)) {
      return trimmed;
    }

    return null;
  }
}

export async function isValidCid(input: string): Promise<boolean> {
  return (await normalizeCid(input)) !== null;
}
