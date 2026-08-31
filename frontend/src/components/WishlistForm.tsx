import { useState } from 'react';
import type { WishlistItemInput, WishlistPriority } from '../types/wishlist';
import { fetchLinkPreview } from '../api/client';

interface Props {
  initialValues?: WishlistItemInput;
  submitLabel?: string;
  onSubmit: (input: WishlistItemInput) => Promise<void>;
}

export function WishlistForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [name, setName] = useState(initialValues?.name ?? '');
  const [price, setPrice] = useState(initialValues?.price != null ? String(initialValues.price) : '');
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '');
  const [productUrl, setProductUrl] = useState(initialValues?.productUrl ?? '');
  const [priority, setPriority] = useState<WishlistPriority>(initialValues?.priority ?? 'MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleFetchPreview = async () => {
    if (!productUrl) {
      alert('구매 링크를 먼저 입력해주세요.');
      return;
    }

    setFetchingPreview(true);
    setPreviewError(null);
    try {
      const preview = await fetchLinkPreview(productUrl);
      if (preview.title) setName(preview.title);
      if (preview.imageUrl) setImageUrl(preview.imageUrl);
      if (preview.price) setPrice(preview.price);

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

    if (!name) {
      alert('이름은 필수입니다.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        price: price ? Number(price) : null,
        imageUrl: imageUrl || null,
        productUrl: productUrl || null,
        priority,
      });

      if (!isEditing) {
        setName('');
        setPrice('');
        setImageUrl('');
        setProductUrl('');
        setPriority('MEDIUM');
        setPreviewError(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>구매 링크</label>
        <div className="wishlist-form__link-row">
          <input
            type="text"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="상품 링크를 붙여넣으세요"
          />
          <button type="button" className="text-button" onClick={handleFetchPreview} disabled={fetchingPreview}>
            {fetchingPreview ? '가져오는 중...' : '정보 가져오기'}
          </button>
        </div>
        {previewError && <div className="wishlist-form__preview-error">{previewError}</div>}
      </div>

      {imageUrl && (
        <div className="wishlist-form__preview-image">
          <img src={imageUrl} alt="미리보기" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="form-field">
        <label>이름</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="갖고 싶은 것" />
      </div>

      <div className="form-field">
        <label>가격</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
      </div>

      <div className="form-field">
        <label>이미지 URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="자동으로 채워지거나, 직접 입력"
        />
      </div>

      <div className="form-field">
        <label>우선순위</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value as WishlistPriority)}>
          <option value="HIGH">높음</option>
          <option value="MEDIUM">보통</option>
          <option value="LOW">낮음</option>
        </select>
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
