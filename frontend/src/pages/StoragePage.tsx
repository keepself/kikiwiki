import { useEffect, useState } from 'react';
import { fetchSavedItems, createSavedItem, updateSavedItem, deleteSavedItem } from '../api/client';
import type { SavedItem, SavedItemInput, SavedItemType } from '../types/storage';
import { SAVED_ITEM_TYPE_LABELS } from '../types/storage';
import { SavedItemForm } from '../components/SavedItemForm';
import { SavedItemList } from '../components/SavedItemList';
import { Modal } from '../components/Modal';

function emptyFormValues(): SavedItemInput {
  return { type: 'LINK', title: '', url: null, content: null, tags: [] };
}

const TYPES: SavedItemType[] = ['LINK', 'NOTE'];

export function StoragePage() {
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [editingItem, setEditingItem] = useState<SavedItem | null>(null);
  const [formValues, setFormValues] = useState<SavedItemInput | null>(null);
  const [filterType, setFilterType] = useState<SavedItemType | ''>('');

  const loadItems = () => {
    fetchSavedItems()
      .then(setItems)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (input: SavedItemInput) => {
    try {
      await createSavedItem(input);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 항목 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async (input: SavedItemInput) => {
    if (!editingItem) return;
    try {
      await updateSavedItem(editingItem.id, input);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 항목 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSavedItem(id);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 항목 삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredItems = filterType ? items.filter((item) => item.type === filterType) : items;

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <div className="card section">
        <div className="card-header-row">
          <h2 className="section-title">정보 저장소</h2>
        </div>

        <div className="type-filter">
          <button
            type="button"
            className={`chip ${filterType === '' ? 'chip--selected' : ''}`}
            onClick={() => setFilterType('')}
          >
            전체
          </button>
          {TYPES.map((type) => (
            <button
              type="button"
              key={type}
              className={`chip ${filterType === type ? 'chip--selected' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {SAVED_ITEM_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <SavedItemList items={filteredItems} onEdit={setEditingItem} onDelete={handleDelete} />
      </div>

      <button className="fab" onClick={() => setFormValues(emptyFormValues())} aria-label="저장 항목 추가">
        +
      </button>

      {formValues && (
        <Modal title="저장 항목 추가" onClose={() => setFormValues(null)}>
          <SavedItemForm
            initialValues={formValues}
            onSubmit={async (input) => {
              await handleCreate(input);
              setFormValues(null);
            }}
          />
        </Modal>
      )}

      {editingItem && (
        <Modal title="저장 항목 수정" onClose={() => setEditingItem(null)}>
          <SavedItemForm
            submitLabel="수정하기"
            initialValues={{
              type: editingItem.type,
              title: editingItem.title,
              url: editingItem.url,
              content: editingItem.content,
              tags: editingItem.tags,
            }}
            onSubmit={async (input) => {
              await handleUpdate(input);
              setEditingItem(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
