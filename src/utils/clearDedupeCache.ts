import { promises } from './dedupeState';

export function clearDedupeCache() {
  promises.clear();
}
