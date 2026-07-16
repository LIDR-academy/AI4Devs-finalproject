import { createContext, useContext } from 'react';

export const ApiKeyGateCanCreateContext = createContext(false);

/** Create/upload affordances under `ApiKeyGate`. False while loading, on error, or when gated. */
export const useApiKeyGateCanCreate = (): boolean => useContext(ApiKeyGateCanCreateContext);
