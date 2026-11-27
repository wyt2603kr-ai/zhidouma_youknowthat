import { useEffect, useSyncExternalStore } from 'react';

import { getSaved, setSaved } from '@/lib/storage';
import type { KnowledgeCard } from '@/lib/types';

// 一个很小的全局收藏状态：首页和收藏页共用，任一处修改另一处立即更新。
let saved: KnowledgeCard[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  saved = await getSaved();
  emit();
}

export function toggleSaved(card: KnowledgeCard) {
  const exists = saved.some((c) => c.id === card.id);
  saved = exists ? saved.filter((c) => c.id !== card.id) : [card, ...saved];
  emit();
  void setSaved(saved);
}

export function useSaved() {
  useEffect(() => {
    void ensureLoaded();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => saved,
    () => saved,
  );
}
