import type { DragPayload, Note, ResizePayload } from "../lib/notes";
import { Rnd, type RndDragCallback, type RndResizeCallback } from "react-rnd";

type NoteCardProps = {
  note: Note;
  isDragging: boolean;
  onBringToFront: (noteId: string) => void;
  onMoveStart: (args: { noteId: string }) => void;
  onMove: (args: DragPayload) => void;
  onMoveStop: (args: DragPayload) => void;
  onResizeStart: (args: {
    noteId: string;
  }) => void;
  onResizeStop: (args: ResizePayload) => void;
  onTextChange: (noteId: string, text: string) => void;
};

export function NoteCard({
  note,
  isDragging,
  onBringToFront,
  onMoveStart,
  onMove,
  onMoveStop,
  onResizeStart,
  onResizeStop,
  onTextChange,
}: NoteCardProps) {
  const handleDrag: RndDragCallback = (_, data) => {
    onMove({
      noteId: note.id,
      x: data.x,
      y: data.y,
      width: note.width,
      height: note.height,
    });
  };

  const handleDragStop: RndDragCallback = (_, data) => {
    onMoveStop({
      noteId: note.id,
      x: data.x,
      y: data.y,
      width: note.width,
      height: note.height,
    });
  };

  const handleResizeStop: RndResizeCallback = (_, __, ref, ___, position) => {
    onResizeStop({
      noteId: note.id,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  };

  return (
    <Rnd
      data-note
      data-no-create
      bounds="parent"
      size={{ width: note.width, height: note.height }}
      position={{ x: note.x, y: note.y }}
      dragHandleClassName="note-drag-handle"
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      onDragStart={() => onMoveStart({ noteId: note.id })}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={() => onResizeStart({ noteId: note.id })}
      onResizeStop={handleResizeStop}
      style={{
        zIndex: note.zIndex,
      }}
      className={isDragging ? "opacity-90" : ""}
      onMouseDown={() => onBringToFront(note.id)}
    >
      <article
        data-note
        className="grid h-full w-full grid-rows-[34px_1fr] overflow-hidden rounded-md border border-slate-700/30"
        style={{ backgroundColor: note.color }}
      >
        <header className="note-drag-handle flex cursor-grab items-center border-b border-slate-700/25 px-3 active:cursor-grabbing">
          <span className="text-xs font-medium text-slate-700">NOTE</span>
        </header>

        <textarea
          className="h-full w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-500"
          placeholder="Write your note..."
          value={note.text}
          onFocus={() => onBringToFront(note.id)}
          onChange={(event) => onTextChange(note.id, event.target.value)}
        />
      </article>
    </Rnd>
  );
}
