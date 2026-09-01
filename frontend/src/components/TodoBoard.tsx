import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import type { TodoItem, TodoStatus } from '../types/todoItem';

function celebrateCompletion() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

interface Props {
  items: TodoItem[];
  onStatusChange: (id: number, status: TodoStatus) => void;
  onEdit: (item: TodoItem) => void;
  onAddClick: () => void;
  onArchive: (item: TodoItem) => void;
}

const COLUMNS: { status: TodoStatus; label: string }[] = [
  { status: 'TODO', label: '할 일' },
  { status: 'IN_PROGRESS', label: '진행 중' },
  { status: 'DONE', label: '완료' },
];

function CardContent({ item }: { item: TodoItem }) {
  return (
    <span className="board-card__body">
      <span className="board-card__title">{item.title}</span>
      {item.memo && <span className="board-card__memo">{item.memo}</span>}
    </span>
  );
}

function BoardCard({
  item,
  onEdit,
  onArchive,
}: {
  item: TodoItem;
  onEdit: (item: TodoItem) => void;
  onArchive: (item: TodoItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`board-card ${isDragging ? 'board-card--dragging' : ''}`}
      onClick={() => onEdit(item)}
    >
      <CardContent item={item} />
      {item.status === 'DONE' && (
        <button
          type="button"
          className="board-card__archive"
          onClick={(e) => {
            e.stopPropagation();
            onArchive(item);
          }}
        >
          보관
        </button>
      )}
    </div>
  );
}

function BoardColumn({
  status,
  label,
  items,
  onEdit,
  onArchive,
  onAddClick,
}: {
  status: TodoStatus;
  label: string;
  items: TodoItem[];
  onEdit: (item: TodoItem) => void;
  onArchive: (item: TodoItem) => void;
  onAddClick?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`board-column ${isOver ? 'board-column--over' : ''}`}>
      <div className="board-column__header">
        <span className={`board-column__dot board-column__dot--${status.toLowerCase()}`} />
        {label}
        <span className="board-column__count">{items.length}</span>
      </div>
      <div className="board-column__cards">
        {items.length === 0 ? (
          <div className="board-column__empty">비어있어요</div>
        ) : (
          items.map((item) => <BoardCard key={item.id} item={item} onEdit={onEdit} onArchive={onArchive} />)
        )}
      </div>
      {onAddClick && (
        <button type="button" className="board-column__add" onClick={onAddClick}>
          + 카드 추가
        </button>
      )}
    </div>
  );
}

export function TodoBoard({ items, onStatusChange, onEdit, onAddClick, onArchive }: Props) {
  const [activeItem, setActiveItem] = useState<TodoItem | null>(null);
  // 살짝만 움직이면 드래그로 인식 안 하게 해서, 그냥 클릭(수정 열기)이랑 구분되게 함
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(items.find((item) => item.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as TodoStatus;
    const item = items.find((i) => i.id === active.id);
    if (item && item.status !== newStatus) {
      onStatusChange(item.id, newStatus);
      if (newStatus === 'DONE') {
        celebrateCompletion();
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="board">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            items={items.filter((item) => item.status === col.status)}
            onEdit={onEdit}
            onArchive={onArchive}
            onAddClick={col.status === 'TODO' ? onAddClick : undefined}
          />
        ))}
      </div>

      <DragOverlay>{activeItem ? <div className="board-card board-card--overlay"><CardContent item={activeItem} /></div> : null}</DragOverlay>
    </DndContext>
  );
}
