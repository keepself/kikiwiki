import type { WishlistItem, WishlistPriority } from '../types/wishlist';

interface Props {
  items: WishlistItem[];
  onDelete: (id: number) => Promise<void>;
}

const PRIORITY_LABEL: Record<WishlistPriority, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

export function WishlistList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="wishlist-grid">
        <div className="empty-state">위시리스트가 비어있어요.</div>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (confirm('이 항목을 삭제할까요?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="wishlist-grid">
      {items.map((item) => (
        <div className="wishlist-card" key={item.id}>
          <div className="wishlist-card__image">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} />
            ) : (
              <div className="wishlist-card__image-placeholder">이미지 없음</div>
            )}

            <span
              className={`wishlist-card__priority-badge wishlist-card__priority-badge--${item.priority.toLowerCase()}`}
            >
              {PRIORITY_LABEL[item.priority]}
            </span>

            <button className="wishlist-card__delete" onClick={() => handleDelete(item.id)} aria-label="삭제">
              ×
            </button>
          </div>

          <div className="wishlist-card__body">
            <div className="wishlist-card__name">
              {item.productUrl ? (
                <a href={item.productUrl} target="_blank" rel="noreferrer">
                  {item.name}
                </a>
              ) : (
                item.name
              )}
            </div>
            <div className="wishlist-card__price tabular-nums">
              {item.price != null ? `${item.price.toLocaleString()}원` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
