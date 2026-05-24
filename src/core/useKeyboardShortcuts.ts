import { useEffect } from 'react';

export interface ShortcutBinding {
  combo: string;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

const isEditableTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

const matches = (combo: string, event: KeyboardEvent): boolean => {
  const parts = combo.toLowerCase().split('+');
  const expectedKey = parts.pop();
  const wantMod = parts.includes('mod') || parts.includes('cmd') || parts.includes('ctrl');
  const wantShift = parts.includes('shift');
  const wantAlt = parts.includes('alt');
  const isModPressed = event.metaKey || event.ctrlKey;

  if (wantMod !== isModPressed) return false;
  if (wantShift !== event.shiftKey) return false;
  if (wantAlt !== event.altKey) return false;

  return event.key.toLowerCase() === expectedKey;
};

export const useKeyboardShortcuts = (bindings: ShortcutBinding[]): void => {
  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) return;
      for (const binding of bindings) {
        if (matches(binding.combo, event)) {
          event.preventDefault();
          binding.handler(event);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bindings]);
};
