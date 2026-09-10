import { useState } from 'react';
import type { SavedItem } from '../types/storage';
import { LinkTypeIcon, NoteTypeIcon } from './ItemTypeIcons';

interface Props {
  items: SavedItem[];
  onEdit: (item: SavedItem) => void;
  onDelete: (id: number) => Promise<void>;
}

export function SavedItemList({ items, onEdit, onDelete }: Props) {
  // 수정/삭제를 각각 따로 보여주던 버튼을 다른 목록(플레이스 등)이랑 똑같이 "..." 메뉴 하나로 통일함
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
    <div className="saved-item-list">
      {items.map((item) => (
          <div className="item-row" key={item.id}>
            <div className={`item-icon ${item.type === 'LINK' ? 'link' : 'note'}`}>
              {item.type === 'LINK' ? <LinkTypeIcon /> : <NoteTypeIcon />}
            </div>

            <div className="item-main">
              <div className="item-title">
                {item.type === 'LINK' && item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </div>
              {item.tags.length > 0 && (
                <div className="item-meta">
                  {item.tags.map((tag) => (
                    <span className="tag-pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <span className="item-date">{item.createdAt.slice(5, 10).replace('-', '/')}</span>

            <div className="row-menu-wrap" onClick={(e) => e.stopPropagation()}>
              <button
                className="row-menu-trigger"
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
          </div>
      ))}
    </div>
  );
}
