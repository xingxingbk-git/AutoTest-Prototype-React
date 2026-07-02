import { seedState } from "./seed";
import type { PrototypeState } from "./types";

export const STORAGE_KEY = "autotest-react-prototype";
export const STORAGE_VERSION = 3;

const cloneSeed = () => structuredClone(seedState);

export function loadPrototypeState(): PrototypeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const envelope = JSON.parse(raw);
    if (envelope.version !== STORAGE_VERSION || !Array.isArray(envelope.data?.cases)) return cloneSeed();
    return envelope.data;
  } catch {
    return cloneSeed();
  }
}

export function savePrototypeState(state: PrototypeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data: state }));
}

export function clearPrototypeState() {
  localStorage.removeItem(STORAGE_KEY);
}
