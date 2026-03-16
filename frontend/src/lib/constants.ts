export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "IPFS Gateway";
// Keep client requests same-origin by default; compose/nginx or rewrites handle backend proxying.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const REQUEST_TIMEOUT_MS = 30000;
