import { useCallback, useMemo, useReducer, useRef } from 'react';

/**
 * A generic undo/redo container backed by a reducer.
 *
 * The hook keeps a bounded ring of immutable snapshots so that any
 * configurator state (a Pergola spec, a kitchen layout, etc.) can be
 * stepped backwards and forwards without leaking memory.
 */

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> =
  | { type: 'set'; value: T; collapse?: boolean }
  | { type: 'replace'; value: T }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; value: T };

const MAX_HISTORY = 60;

const reducer = <T,>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> => {
  switch (action.type) {
    case 'set': {
      if (Object.is(state.present, action.value)) return state;
      const past = action.collapse ? state.past : [...state.past, state.present].slice(-MAX_HISTORY);
      return { past, present: action.value, future: [] };
    }
    case 'replace':
      return { ...state, present: action.value };
    case 'undo': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future].slice(0, MAX_HISTORY),
      };
    }
    case 'redo': {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present].slice(-MAX_HISTORY),
        present: next,
        future: rest,
      };
    }
    case 'reset':
      return { past: [], present: action.value, future: [] };
    default:
      return state;
  }
};

export interface HistoryControls<T> {
  state: T;
  set: (value: T | ((current: T) => T)) => void;
  replace: (value: T | ((current: T) => T)) => void;
  reset: (value: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryState = <T,>(initial: T): HistoryControls<T> => {
  const [state, dispatch] = useReducer(reducer<T>, {
    past: [],
    present: initial,
    future: [],
  });

  const presentRef = useRef(state.present);
  presentRef.current = state.present;

  const set = useCallback((value: T | ((current: T) => T)) => {
    const next =
      typeof value === 'function' ? (value as (c: T) => T)(presentRef.current) : value;
    dispatch({ type: 'set', value: next });
  }, []);

  const replace = useCallback((value: T | ((current: T) => T)) => {
    const next =
      typeof value === 'function' ? (value as (c: T) => T)(presentRef.current) : value;
    dispatch({ type: 'replace', value: next });
  }, []);

  const reset = useCallback((value: T) => dispatch({ type: 'reset', value }), []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  return useMemo(
    () => ({
      state: state.present,
      set,
      replace,
      reset,
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state.present, state.past.length, state.future.length, set, replace, reset, undo, redo],
  );
};
