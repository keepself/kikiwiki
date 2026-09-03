import type { SavedItem } from '../types/storage';

interface Props {
  items: SavedItem[];
  onEdit: (item: SavedItem) => void;
  onDelete: (id: number) => Promise<void>;
}

const TYPE_ICON: Record<SavedItem['type'], string> = {
  LINK: '🔗',
  NOTE: '📝',
};

export function SavedItemList({ items, onEdit, onDelete }: Props) {
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
            <div className={`item-icon ${item.type === 'LINK' ? 'link' : 'note'}`}>{TYPE_ICON[item.type]}</div>

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
            <button type="button" className="text-button" onClick={() => onEdit(item)}>
              수정
            </button>
            <button type="button" className="item-row__delete" onClick={() => handleDelete(item.id)} aria-label="삭제">
              ×
            </button>
          </div>
      ))}
    </div>
  );
}
