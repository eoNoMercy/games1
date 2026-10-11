"use client";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

type Item = { id: string };

function Row<T extends Item>({ item, disabled, children }: { item: T; disabled?: boolean; children: (item: T, handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled });
  // O ícone é a única área que "pega" o toque: o resto da tela rola normalmente no celular e no tablet.
  const handle = (
    <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners} disabled={disabled} aria-label="Arrastar para reordenar"
      className="flex size-11 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-xl text-ink/40 transition hover:bg-black/5 hover:text-ink active:cursor-grabbing disabled:opacity-40">
      <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden>
        <circle cx="7" cy="5" r="1.6" /><circle cx="13" cy="5" r="1.6" /><circle cx="7" cy="10" r="1.6" /><circle cx="13" cy="10" r="1.6" /><circle cx="7" cy="15" r="1.6" /><circle cx="13" cy="15" r="1.6" />
      </svg>
    </button>
  );
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, position: "relative", zIndex: isDragging ? 20 : undefined }}
      className={isDragging ? "rounded-3xl opacity-95 shadow-xl" : ""}>
      {children(item, handle)}
    </div>
  );
}

export default function SortableList<T extends Item>({ items, onReorder, children, disabled }: { items: T[]; onReorder: (next: T[]) => void; children: (item: T, handle: ReactNode) => ReactNode; disabled?: boolean }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function end({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id), to = items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{items.map((item) => <Row key={item.id} item={item} disabled={disabled}>{children}</Row>)}</div>
      </SortableContext>
    </DndContext>
  );
}
