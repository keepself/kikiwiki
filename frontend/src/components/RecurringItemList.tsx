import type { RecurringItem } from '../types/recurringItem';

interface Props {
  items: RecurringItem[];
  onApply: (item: RecurringItem) => Promise<void>;
  onEdit: (item: RecurringItem) => void;
  onDelete: (id: number) => Promise<void>;
  // 지정하면 이 개수까지만 보여주고, 넘으면 "더보기"가 onViewAll을 호출함
  limit?: number;
  onViewAll?: () => void;
}

export function RecurringItemList({ items, onApply, onEdit, onDelete, limit, onViewAll }: Props) {
  const handleDelete = async (id: number) => {
    if (confirm('이 고정지출을 해지할까요?')) {
      await onDelete(id);
    }
  };

  if (items.length === 0) {
    return <div className="empty-state">등록된 고정지출/구독이 없어요.</div>;
  }

  const hasMore = limit != null && items.length > limit;
  const visibleItems = limit != null ? items.slice(0, limit) : items;

  return (
    <>
      <div className="recurring-list">
        {visibleItems.map((item) => (
          <div className="recurring-row" key={item.id}>
            <div className="recurring-row__info">
              <span className="recurring-row__name">{item.name}</span>
              <span className="recurring-row__category">
                {item.categoryName}
                {item.dayOfMonth != null ? ` · 매달 ${item.dayOfMonth}일` : ''}
              </span>
            </div>
            <span className="recurring-row__amount tabular-nums">{item.amount.toLocaleString()}원</span>

            {item.appliedThisMonth ? (
              <span className="recurring-row__applied">추가됨</span>
            ) : (
              <button className="action-button" onClick={() => onApply(item)}>
                이번 달 추가
              </button>
            )}

            <button className="recurring-row__edit" onClick={() => onEdit(item)}>
              수정
            </button>
            <button className="recurring-row__delete" onClick={() => handleDelete(item.id)} aria-label="해지">
              ×
            </button>
          </div>
        ))}
      </div>

      {hasMore && (
        <button className="expand-toggle-button" onClick={onViewAll}>
          더보기 ({items.length - (limit ?? 0)})
        </button>
      )}
    </>
  );
}
