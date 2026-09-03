import { useState } from 'react';
import type { OotdEntryInput } from '../types/ootd';
import { resizeImageToSquareDataUrl } from '../imageResize';

interface Props {
  onSubmit: (input: OotdEntryInput) => Promise<void>;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function OotdUploadForm({ onSubmit }: Props) {
  const [entryDate, setEntryDate] = useState(todayStr());
  const [memo, setMemo] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      setPreview(await resizeImageToSquareDataUrl(file));
    } catch {
      alert('사진을 처리하지 못했어요.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      alert('사진을 선택해주세요.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    setSubmitting(true);
    try {
      await onSubmit({ entryDate, imageDataUrl: preview, memo: memo.trim() ? memo.trim() : null, tags });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>날짜</label>
        <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
      </div>

      <div className="form-field">
        <label>사진</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {processing && <div className="wishlist-form__preview-error">처리 중...</div>}

      {preview && (
        <div className="ootd-form__preview">
          <img src={preview} alt="미리보기" />
        </div>
      )}

      <div className="form-field">
        <label>메모</label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="오늘의 코디 메모" rows={3} />
      </div>

      <div className="form-field">
        <label>태그</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="쉼표로 구분 (예: 출근룩, 캐주얼)"
        />
      </div>

      <button type="submit" className="submit-button" disabled={submitting || processing}>
        {submitting ? '저장 중...' : '등록하기'}
      </button>
    </form>
  );
}
