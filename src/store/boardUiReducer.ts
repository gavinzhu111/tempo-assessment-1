import type { CreateDraft } from "../lib/notes";

export type BoardUiState = {
  createDraft: CreateDraft | null;
  draggingNoteId: string | null;
  isOverTrash: boolean;
};

type BoardUiAction =
  | { type: "create/start"; payload: CreateDraft }
  | { type: "create/update"; payload: Pick<CreateDraft, "currentX" | "currentY"> }
  | { type: "create/clear" }
  | { type: "drag/start"; payload: { noteId: string } }
  | { type: "drag/over-trash"; payload: { isOverTrash: boolean } }
  | { type: "drag/stop" };

export const initialBoardUiState: BoardUiState = {
  createDraft: null,
  draggingNoteId: null,
  isOverTrash: false,
};

export function boardUiReducer(
  state: BoardUiState,
  action: BoardUiAction,
): BoardUiState {
  switch (action.type) {
    case "create/start":
      return { ...state, createDraft: action.payload };
    case "create/update":
      return state.createDraft
        ? {
            ...state,
            createDraft: { ...state.createDraft, ...action.payload },
          }
        : state;
    case "create/clear":
      return { ...state, createDraft: null };
    case "drag/start":
      return { ...state, draggingNoteId: action.payload.noteId };
    case "drag/over-trash":
      return { ...state, isOverTrash: action.payload.isOverTrash };
    case "drag/stop":
      return { ...state, draggingNoteId: null, isOverTrash: false };
    default:
      return state;
  }
}
