# Sticky Notes Assessment

This is my implementation of the sticky notes take-home assignment using React + TypeScript.

The app is focused on desktop behavior and supports creating, moving, resizing, and deleting notes through drag interactions. I also added a few quality-of-life extras like editable note text, note stacking (bring to front), colors, and local persistence.

## What is implemented

### Required features

- Create a note by dragging on empty board space (position + size come from the drag area)
- Move a note by dragging the header
- Resize a note from the bottom-right corner
- Delete a note by dragging it onto the trash area

### Bonus features

- Edit note text
- Bring active note to front
- Persist notes in `localStorage`
- Multiple note colors

## Tech choices

- `react-rnd` for drag + resize behavior
- `use-local-storage-state` for persistence
- `tailwindcss` for styling

## Architecture notes (short)

I kept the app split into clear layers so it stays maintainable: domain utilities in `src/lib/notes.ts`, UI state transitions in `src/store/boardUiReducer.ts`, interaction orchestration in `src/hooks/useStickyBoard.ts`, and presentation in `src/components/NoteCard.tsx` plus `src/App.tsx`.

All drag/drop and resize events are funneled through the hook, while pure calculation logic (creation geometry, overlap detection, drop-to-delete rules) lives in utility functions. This keeps logic testable and easier to reason about than spreading calculations across multiple components.

## Running locally

```bash
npm install
npm run dev
```

