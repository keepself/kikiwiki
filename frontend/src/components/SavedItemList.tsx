import { useState } from 'react';
import type { SavedItem } from '../types/storage';
import defaultThumb from '../assets/storage-thumb-default.jpg';

interface Props {
  items: SavedItem[];
  onEdit: (item: SavedItem) => void;
  onDelete: (id: number) => Promise<void>;
}

// URL에서 도메인만 뽑아냄(www. 는 빼고) - 잘못된 URL이면 그냥 원본을 보여줌
function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SavedItemList({ items, onEdit, onDelete }: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (confirm('이 항목을 삭제할까요?')) {
      await onDelete(id);
    }
  };

  if (items.length === 0) {
    return <div className="empty-state">저장된 항목이 없어요.</div>;
  }

  return (
    <div className="storage-grid">
      {items.map((item) => (
        <div className={`s-card ${item.type === 'NOTE' ? 's-card--note' : ''}`} key={item.id}>
          <div className="s-card__menu-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              className="s-card__menu"
              aria-label="메뉴"
              onClick={() => setOpenMenuId((cur) => (cur === item.id ? null : item.id))}
            >
              ⋯
            </button>
            {openMenuId === item.id && (
              <>
                <div className="menu-backdrop" onClick={() => setOpenMenuId(null)} />
                <div className="row-menu-popover">
                  <button
                    className="row-menu-item"
                    onClick={() => {
                      onEdit(item);
                      setOpenMenuId(null);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="row-menu-item row-menu-item--danger"
                    onClick={() => {
                      setOpenMenuId(null);
                      handleDelete(item.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>

          {item.type === 'LINK' ? (
            <div className="s-card__thumb">
              <img src={item.imageUrl ?? defaultThumb} alt="" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="s-card__note-icon">📝</div>
          )}

          <div className="s-card__body">
            <div className="s-card__title">
              {item.type === 'LINK' && item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </div>

            {item.type === 'LINK' && item.url ? (
              <div className="s-card__domain">{domainOf(item.url)}</div>
            ) : (
              item.content && <div className="s-card__snippet">{item.content}</div>
            )}

            <div className="s-card__footer">
              {item.tags.length > 0 && <span className="s-card__tag">{item.tags[0]}</span>}
              <span className="s-card__date">{item.createdAt.slice(5, 10).replace('-', '/')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
