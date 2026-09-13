import { useState } from 'react';
import type { SavedItemInput, SavedItemType } from '../types/storage';
import { SAVED_ITEM_TYPE_LABELS } from '../types/storage';
import { fetchLinkPreview } from '../api/client';

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
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '');
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(', ') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 링크를 붙여넣고 이 버튼을 누르면 제목/썸네일을 자동으로 가져와서 채워줌(위시리스트 기능 재사용) -
  // 못 가져와도 직접 입력하면 되니 실패해도 크게 문제 없음
  const handleFetchPreview = async () => {
    if (!url) {
      alert('링크를 먼저 입력해주세요.');
      return;
    }

    setFetchingPreview(true);
    setPreviewError(null);
    try {
      const preview = await fetchLinkPreview(url);
      if (preview.title) setTitle(preview.title);
      if (preview.imageUrl) setImageUrl(preview.imageUrl);

      if (!preview.title && !preview.imageUrl) {
        setPreviewError('이 링크에서는 정보를 못 가져왔어요. 직접 입력해주세요.');
      }
    } catch {
      setPreviewError('링크에서 정보를 가져오지 못했어요. 직접 입력해주세요.');
    } finally {
      setFetchingPreview(false);
    }
  };

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
        imageUrl: type === 'LINK' && imageUrl.trim() ? imageUrl.trim() : null,
        tags,
      });

      if (!isEditing) {
        setType('LINK');
        setTitle('');
        setUrl('');
        setContent('');
        setImageUrl('');
        setTagsInput('');
        setPreviewError(null);
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

      {type === 'LINK' && (
        <div className="form-field">
          <label>링크</label>
          <div className="wishlist-form__link-row">
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            <button type="button" className="text-button" onClick={handleFetchPreview} disabled={fetchingPreview}>
              {fetchingPreview ? '가져오는 중...' : '정보 가져오기'}
            </button>
          </div>
          {previewError && <div className="wishlist-form__preview-error">{previewError}</div>}
        </div>
      )}

      {type === 'LINK' && imageUrl && (
        <div className="wishlist-form__preview-image">
          <img src={imageUrl} alt="미리보기" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="form-field">
        <label>제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
      </div>

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
