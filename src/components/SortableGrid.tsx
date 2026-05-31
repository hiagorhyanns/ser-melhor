import { createContext, useContext } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// ── internal context so SortableItem can read disabled without prop-drilling ──

const DisabledCtx = createContext(false);

// ── SortableGrid ─────────────────────────────────────────────────────────────

interface GridProps {
  ids: string[];
  onReorder: (activeId: string, overId: string) => void;
  className?: string;
  children: React.ReactNode;
  /** Disable DnD when search / filters are active */
  disabled?: boolean;
}

export function SortableGrid({
  ids,
  onReorder,
  className,
  children,
  disabled = false,
}: GridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  return (
    <DisabledCtx.Provider value={disabled}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* When disabled, pass empty ids so nothing is draggable */}
        <SortableContext items={disabled ? [] : ids} strategy={rectSortingStrategy}>
          <div className={className}>{children}</div>
        </SortableContext>
      </DndContext>
    </DisabledCtx.Provider>
  );
}

// ── SortableItem ─────────────────────────────────────────────────────────────

interface ItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: ItemProps) {
  const disabled = useContext(DisabledCtx);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.55 : 1,
        position: 'relative',
      }}
      className="group/sortable"
    >
      {/* Drag handle — appears on hover, hidden when disabled */}
      {!disabled && (
        <button
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
          className="absolute -top-px left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white px-2 py-1 text-gray-300 opacity-0 shadow-sm transition-opacity active:cursor-grabbing group-hover/sortable:opacity-100 hover:text-gray-500"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}
      {children}
    </div>
  );
}
