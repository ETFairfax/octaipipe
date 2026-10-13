import { useDebounceCallback } from '@siberiacancode/reactuse';
import { useEffect, useRef, useState } from 'react';

const defaultDelayMs = 300;

type Options = {
  /** The committed value, usually read from the URL. */
  value: string;
  /** Called once the user pauses typing. */
  onCommit: (value: string) => void;
  delayMs?: number;
};

/**
 * Local state for a text input whose committed value lives elsewhere (typically the URL), so typing
 * doesn't push a history entry or fire a request per keystroke.
 *
 * `value` changing from outside (back/forward, a shared link) replaces the input text and drops any
 * pending commit. A change that is our own commit coming back is ignored, because the user may have
 * typed further while it round-tripped and resetting would lose that.
 */
function useDebouncedInput({ value, onCommit, delayMs = defaultDelayMs }: Options) {
  const [text, setText] = useState(value);

  // The value we last committed and haven't yet seen come back through `value`.
  const awaitingEcho = useRef<string | null>(null);

  const commit = useDebounceCallback((next: string) => {
    awaitingEcho.current = next;
    onCommit(next);
  }, delayMs);

  useEffect(() => {
    if (awaitingEcho.current === value) {
      awaitingEcho.current = null;
      return;
    }
    awaitingEcho.current = null;
    setText(value);
    commit.cancel();
  }, [value, commit]);

  // Don't commit after unmount.
  useEffect(() => commit.cancel, [commit]);

  return {
    text,
    onTextChange: (next: string) => {
      setText(next);
      commit(next);
    }
  };
}

export { useDebouncedInput };
