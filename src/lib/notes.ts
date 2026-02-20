export type Note = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  zIndex: number;
};

export type CreateDraft = {
  type: "create";
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

export type DragPayload = {
  noteId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ResizePayload = {
  noteId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export const STORAGE_KEY = "sticky-notes-app-state-v1";
export const MIN_NOTE_WIDTH = 140;
export const MIN_NOTE_HEIGHT = 120;
export const NOTE_COLORS = ["#fff59a", "#ffd5a4", "#b9fbc0", "#a8dadc", "#cdb4db"];

export function createId(): string {
  return crypto.randomUUID();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getNextZIndex(notes: Note[]): number {
  return notes.reduce((max, note) => Math.max(max, note.zIndex), 0) + 1;
}

export function sanitizeNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is Note => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const maybe = item as Record<string, unknown>;
    return (
      typeof maybe.id === "string" &&
      typeof maybe.x === "number" &&
      typeof maybe.y === "number" &&
      typeof maybe.width === "number" &&
      typeof maybe.height === "number" &&
      typeof maybe.text === "string" &&
      typeof maybe.color === "string" &&
      typeof maybe.zIndex === "number"
    );
  });
}

export function getCreatePreview(draft: CreateDraft): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: Math.min(draft.startX, draft.currentX),
    y: Math.min(draft.startY, draft.currentY),
    width: Math.abs(draft.startX - draft.currentX),
    height: Math.abs(draft.startY - draft.currentY),
  };
}

export function buildNoteFromDraft(
  draft: CreateDraft,
  endX: number,
  endY: number,
  boardWidth: number,
  boardHeight: number,
  existingNotes: Note[],
): Note {
  const x = Math.min(draft.startX, endX);
  const y = Math.min(draft.startY, endY);
  const width = Math.max(Math.abs(draft.startX - endX), MIN_NOTE_WIDTH);
  const height = Math.max(Math.abs(draft.startY - endY), MIN_NOTE_HEIGHT);

  return {
    id: createId(),
    x,
    y,
    width: Math.min(width, boardWidth - x),
    height: Math.min(height, boardHeight - y),
    text: "",
    color: NOTE_COLORS[existingNotes.length % NOTE_COLORS.length],
    zIndex: getNextZIndex(existingNotes),
  };
}

export function getNoteRectOnScreen(
  noteX: number,
  noteY: number,
  noteWidth: number,
  noteHeight: number,
  boardRect: DOMRect,
): Rect {
  return {
    left: boardRect.left + noteX,
    top: boardRect.top + noteY,
    right: boardRect.left + noteX + noteWidth,
    bottom: boardRect.top + noteY + noteHeight,
  };
}

export function isDeleteDropHit(noteRect: Rect, trashRect: DOMRect): boolean {
  const overlapWidth =
    Math.min(noteRect.right, trashRect.right) - Math.max(noteRect.left, trashRect.left);
  const overlapHeight =
    Math.min(noteRect.bottom, trashRect.bottom) - Math.max(noteRect.top, trashRect.top);

  if (overlapWidth <= 0 || overlapHeight <= 0) {
    return false;
  }

  const overlapArea = overlapWidth * overlapHeight;
  const noteArea = (noteRect.right - noteRect.left) * (noteRect.bottom - noteRect.top);
  const trashArea = trashRect.width * trashRect.height;
  const overlapToNoteRatio = overlapArea / noteArea;
  const overlapToTrashRatio = overlapArea / trashArea;

  const noteCenterX = (noteRect.left + noteRect.right) / 2;
  const noteCenterY = (noteRect.top + noteRect.bottom) / 2;
  const centerInsideTrash =
    noteCenterX >= trashRect.left &&
    noteCenterX <= trashRect.right &&
    noteCenterY >= trashRect.top &&
    noteCenterY <= trashRect.bottom;

  return centerInsideTrash || overlapToNoteRatio >= 0.2 || overlapToTrashRatio >= 0.5;
}
