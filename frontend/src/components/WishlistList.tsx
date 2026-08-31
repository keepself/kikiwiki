import { useState } from 'react';
import type { WishlistItem, WishlistPriority } from '../types/wishlist';

interface Props {
  items: WishlistItem[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (item: WishlistItem) => void;
  onPurchase: (item: WishlistItem) => void;
}

const PRIORITY_LABEL: Record<WishlistPriority, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

const PRIORITY_ORDER: Record<WishlistPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const VISIBLE_LIMIT = 6;

export function WishlistList({ items, onDelete, onEdit, onPurchase }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showPurchased, setShowPurchased] = useState(false);

  const activeItems = items.filter((item) => !item.purchased);
  const purchasedItems = items
    .filter((item) => item.purchased)
    .sort((a, b) => (b.purchasedAt ?? '').localeCompare(a.purchasedAt ?? ''));

  const handleDelete = async (id: number) => {
    if (confirm('이 항목을 삭제할까요?')) {
      await onDelete(id);
    }
  };

  if (activeItems.length === 0 && purchasedItems.length === 0) {
    return (
      <div className="wishlist-grid">
        <div className="empty-state">위시리스트가 비어있어요.</div>
      </div>
    );
  }

  const sortedItems = [...activeItems].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const hasMore = sortedItems.length > VISIBLE_LIMIT;
  const visibleItems = expanded ? sortedItems : sortedItems.slice(0, VISIBLE_LIMIT);

  return (
    <>
      {activeItems.length === 0 ? (
        <div className="wishlist-grid">
          <div className="empty-state">위시리스트가 비어있어요.</div>
        </div>
      ) : (
        <div className="wishlist-grid">
          {visibleItems.map((item) => (
            <div className="wishlist-card" key={item.id}>
              <div className="wishlist-card__image">
                {item.imageUrl ? (
                  // 일부 쇼핑몰(CDN)은 다른 사이트에서 자기네 이미지 링크를 그대로 가져다 쓰는 걸
                  // Referer 헤더로 감지해 막는데(핫링크 방지), no-referrer로 이를 우회함
                  <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" />
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

                <button
                  className="wishlist-card__purchase"
                  onClick={() => onPurchase(item)}
                  aria-label="구매완료로 표시"
                  title="구매완료로 표시"
                >
                  ✓
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
                <button className="wishlist-card__edit" onClick={() => onEdit(item)}>
                  수정
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button className="expand-toggle-button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '접기' : `더보기 (${sortedItems.length - VISIBLE_LIMIT})`}
          <span className={`expand-toggle-button__arrow ${expanded ? 'expand-toggle-button__arrow--up' : ''}`}>
            ▾
          </span>
        </button>
      )}

      {purchasedItems.length > 0 && (
        <div className="purchased-section">
          <button className="expand-toggle-button" onClick={() => setShowPurchased((v) => !v)}>
            구매완료 내역 ({purchasedItems.length})
            <span className={`expand-toggle-button__arrow ${showPurchased ? 'expand-toggle-button__arrow--up' : ''}`}>
              ▾
            </span>
          </button>

          {showPurchased && (
            <div className="purchased-list">
              {purchasedItems.map((item) => (
                <div className="purchased-row" key={item.id}>
                  <span className="purchased-row__name">{item.name}</span>
                  <span className="purchased-row__price tabular-nums">
                    {item.price != null ? `${item.price.toLocaleString()}원` : ''}
                  </span>
                  <span className="purchased-row__date">
                    {item.purchasedAt ? item.purchasedAt.slice(0, 10) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
