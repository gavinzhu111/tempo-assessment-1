import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import useLocalStorageState from "use-local-storage-state";
import {
  type DragPayload,
  MIN_NOTE_HEIGHT,
  MIN_NOTE_WIDTH,
  STORAGE_KEY,
  type ResizePayload,
  buildNoteFromDraft,
  clamp,
  getNextZIndex,
  getCreatePreview,
  getNoteRectOnScreen,
  isDeleteDropHit,
  sanitizeNotes,
  type Note,
} from "../lib/notes";
import {
  boardUiReducer,
  initialBoardUiState,
} from "../store/boardUiReducer";

type PreviewRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type NoteKey = { noteId: string };

export function useStickyBoard() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const trashRef = useRef<HTMLDivElement | null>(null);

  const [notes, setNotes] = useLocalStorageState<Note[]>(STORAGE_KEY, {
    defaultValue: [],
    serializer: {
      stringify: JSON.stringify,
      parse: (value) => sanitizeNotes(JSON.parse(value)),
    },
  });
  const [uiState, dispatch] = useReducer(boardUiReducer, initialBoardUiState);

  const isNoteOverTrash = useCallback(
    (noteX: number, noteY: number, noteWidth: number, noteHeight: number): boolean => {
      if (!boardRef.current || !trashRef.current) {
        return false;
      }

      const boardRect = boardRef.current.getBoundingClientRect();
      const trashRect = trashRef.current.getBoundingClientRect();
      const noteRect = getNoteRectOnScreen(
        noteX,
        noteY,
        noteWidth,
        noteHeight,
        boardRect,
      );
      return isDeleteDropHit(noteRect, trashRect);
    },
    [],
  );

  const updateNote = useCallback((noteId: string, updater: (note: Note) => Note) => {
    setNotes((prevNotes = []) =>
      prevNotes.map((note) => (note.id === noteId ? updater(note) : note)),
    );
  }, [setNotes]);

  const bringToFront = useCallback((noteId: string) => {
    setNotes((prevNotes) => {
      const list = prevNotes ?? [];
      const nextZ = getNextZIndex(list);
      return list.map((note) =>
        note.id === noteId ? { ...note, zIndex: nextZ } : note,
      );
    });
  }, [setNotes]);

  useEffect(() => {
    if (!uiState.createDraft) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!boardRef.current) {
        return;
      }
      const boardRect = boardRef.current.getBoundingClientRect();
      const currentX = clamp(event.clientX - boardRect.left, 0, boardRect.width);
      const currentY = clamp(event.clientY - boardRect.top, 0, boardRect.height);
      dispatch({ type: "create/update", payload: { currentX, currentY } });
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!boardRef.current) {
        dispatch({ type: "create/clear" });
        return;
      }

      const boardRect = boardRef.current.getBoundingClientRect();
      const endX = clamp(event.clientX - boardRect.left, 0, boardRect.width);
      const endY = clamp(event.clientY - boardRect.top, 0, boardRect.height);

      setNotes((prevNotes = []) => {
        if (!uiState.createDraft) {
          return prevNotes;
        }
        return [
          ...prevNotes,
          buildNoteFromDraft(
            uiState.createDraft,
            endX,
            endY,
            boardRect.width,
            boardRect.height,
            prevNotes,
          ),
        ];
      });

      dispatch({ type: "create/clear" });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [setNotes, uiState.createDraft]);

  const startCreate = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !boardRef.current) {
      return;
    }

    const clickedElement = event.target as HTMLElement;
    if (clickedElement.closest("[data-note]") || clickedElement.closest("[data-no-create]")) {
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const startX = clamp(event.clientX - boardRect.left, 0, boardRect.width);
    const startY = clamp(event.clientY - boardRect.top, 0, boardRect.height);

    dispatch({
      type: "create/start",
      payload: {
      type: "create",
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      },
    });
  }, []);

  const startMove = useCallback(({ noteId }: NoteKey) => {
    dispatch({ type: "drag/start", payload: { noteId } });
    bringToFront(noteId);
  }, [bringToFront]);

  const onDrag = useCallback(
    ({ noteId, x, y, width, height }: DragPayload) => {
      updateNote(noteId, (note) => ({ ...note, x, y }));
      dispatch({
        type: "drag/over-trash",
        payload: { isOverTrash: isNoteOverTrash(x, y, width, height) },
      });
    },
    [isNoteOverTrash, updateNote],
  );

  const stopMove = useCallback(
    ({ noteId, x, y, width, height }: DragPayload) => {
      updateNote(noteId, (note) => ({ ...note, x, y }));
      const shouldDelete = isNoteOverTrash(x, y, width, height);
      if (shouldDelete) {
        setNotes((prevNotes = []) => prevNotes.filter((note) => note.id !== noteId));
      }
      dispatch({ type: "drag/stop" });
    },
    [isNoteOverTrash, setNotes, updateNote],
  );

  const startResize = useCallback(({ noteId }: NoteKey) => {
    bringToFront(noteId);
  }, [bringToFront]);

  const stopResize = useCallback(
    ({ noteId, width, height, x, y }: ResizePayload) => {
      updateNote(noteId, (note) => ({
        ...note,
        width: Math.max(width, MIN_NOTE_WIDTH),
        height: Math.max(height, MIN_NOTE_HEIGHT),
        x,
        y,
      }));
    },
    [updateNote],
  );

  const updateText = useCallback(
    (noteId: string, text: string) => {
      updateNote(noteId, (note) => ({ ...note, text }));
    },
    [updateNote],
  );

  const createPreview = useMemo<PreviewRect | null>(() => {
    if (!uiState.createDraft) {
      return null;
    }
    return getCreatePreview(uiState.createDraft);
  }, [uiState.createDraft]);

  return {
    boardRef,
    trashRef,
    notes: notes ?? [],
    isOverTrash: uiState.isOverTrash,
    createPreview,
    draggingNoteId: uiState.draggingNoteId,
    startCreate,
    startMove,
    onDrag,
    stopMove,
    startResize,
    stopResize,
    updateText,
    bringToFront,
  };
}
