import { useState } from 'react';
import type { SavedItemInput, SavedItemType } from '../types/storage';
import { SAVED_ITEM_TYPE_LABELS } from '../types/storage';

interface Props {
  initialValues?: SavedItemInput;
  submitLabel?: string;
  onSubmit: (input: SavedItemInput) => Promise<void>;
}

const TYPES: SavedItemType[] = ['LINK', 'NOTE'];

export function SavedItemForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [type, setType] = useState<SavedItemType>(initialValues?.type ?? 'LINK');
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [url, setUrl] = useState(initialValues?.url ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(', ') ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목은 필수입니다.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        url: type === 'LINK' && url.trim() ? url.trim() : null,
        content: content.trim() ? content.trim() : null,
        tags,
      });

      if (!isEditing) {
        setType('LINK');
        setTitle('');
        setUrl('');
        setContent('');
        setTagsInput('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>종류</label>
        <div className="weekday-picker">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t}
              className={`weekday-picker__day ${type === t ? 'weekday-picker__day--selected' : ''}`}
              onClick={() => setType(t)}
            >
              {SAVED_ITEM_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
      </div>

      {type === 'LINK' && (
        <div className="form-field">
          <label>링크</label>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
      )}

      <div className="form-field">
        <label>메모</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" rows={4} />
      </div>

      <div className="form-field">
        <label>태그</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="쉼표로 구분 (예: 개발, 나중에읽기)"
        />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
