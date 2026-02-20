import { NoteCard } from "./components/NoteCard";
import { useStickyBoard } from "./hooks/useStickyBoard";

export default function App() {
  const {
    boardRef,
    trashRef,
    notes,
    isOverTrash,
    createPreview,
    draggingNoteId,
    startCreate,
    startMove,
    onDrag,
    stopMove,
    startResize,
    stopResize,
    updateText,
    bringToFront,
  } = useStickyBoard();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-5 text-slate-900">
      <header className="mb-4" data-no-create>
        <h1 className="text-3xl font-semibold">Sticky Notes</h1>
        <p className="mt-1 text-sm text-slate-700">
          Drag on the canvas to create. Move via note header, resize via corner,
          and drop on trash to delete.
        </p>
      </header>

      <div
        className="relative min-h-[650px] overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-white"
        ref={boardRef}
        onPointerDown={startCreate}
        role="presentation"
      >
        {createPreview && (
          <div
            className="pointer-events-none absolute border-2 border-blue-500 bg-blue-100"
            style={{
              left: createPreview.x,
              top: createPreview.y,
              width: createPreview.width,
              height: createPreview.height,
            }}
          />
        )}

        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isDragging={draggingNoteId === note.id}
            onBringToFront={bringToFront}
            onMoveStart={startMove}
            onMove={onDrag}
            onMoveStop={stopMove}
            onResizeStart={startResize}
            onResizeStop={stopResize}
            onTextChange={updateText}
          />
        ))}

        <div
          className={`pointer-events-none absolute bottom-4 right-4 grid h-12 w-48 place-items-center rounded-md border-2 text-sm font-semibold ${
            isOverTrash
              ? "border-rose-600 bg-rose-100 text-rose-700"
              : "border-slate-500 bg-white text-slate-700"
          }`}
          ref={trashRef}
          data-no-create
        >
          🗑 Drop here to delete
        </div>
      </div>
    </main>
  );
}
