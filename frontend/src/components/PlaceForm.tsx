import { useState } from 'react';
import type { PlaceInput, PlaceSearchResult, PlaceStatus } from '../types/place';
import { PLACE_STATUS_LABELS } from '../types/place';
import { searchPlaces } from '../api/client';

interface Props {
  initialValues?: PlaceInput;
  submitLabel?: string;
  onSubmit: (input: PlaceInput) => Promise<void>;
  // 중복 저장 경고에 쓸, 이미 저장된 장소 목록 (수정 중이면 자기 자신은 제외하고 넘겨줘야 함)
  existingPlaces?: { placeUrl: string | null; title: string }[];
}

const STATUSES: PlaceStatus[] = ['TO_VISIT', 'VISITED'];
const RATING_VALUES = [1, 2, 3, 4, 5];

export function PlaceForm({ initialValues, submitLabel, onSubmit, existingPlaces = [] }: Props) {
  const isEditing = !!initialValues;

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [lat, setLat] = useState<number | null>(initialValues?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialValues?.lng ?? null);
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [placeUrl, setPlaceUrl] = useState<string | null>(initialValues?.placeUrl ?? null);
  const [status, setStatus] = useState<PlaceStatus>(initialValues?.status ?? 'TO_VISIT');
  const [rating, setRating] = useState<number | null>(initialValues?.rating ?? null);
  const [review, setReview] = useState(initialValues?.review ?? '');
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(', ') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const results = await searchPlaces(query.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('검색 결과가 없어요.');
      }
    } catch {
      setSearchError('장소 검색에 실패했어요.');
    } finally {
      setSearching(false);
    }
  };

  const handlePickResult = (result: PlaceSearchResult) => {
    setTitle(result.placeName);
    setAddress(result.address);
    setLat(result.lat);
    setLng(result.lng);
    setCategory(result.category);
    setPlaceUrl(result.placeUrl);
    setSearchResults([]);
    setQuery('');

    const duplicate = existingPlaces.find((p) => p.placeUrl === result.placeUrl);
    setDuplicateWarning(duplicate ? `이미 저장된 장소예요: "${duplicate.title}"` : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('이름은 필수입니다.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        address: address || null,
        lat,
        lng,
        category: category || null,
        placeUrl,
        status,
        rating: status === 'VISITED' ? rating : null,
        review: status === 'VISITED' && review.trim() ? review.trim() : null,
        tags,
      });

      if (!isEditing) {
        setTitle('');
        setAddress('');
        setLat(null);
        setLng(null);
        setCategory('');
        setPlaceUrl(null);
        setStatus('TO_VISIT');
        setRating(null);
        setReview('');
        setTagsInput('');
        setDuplicateWarning(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>장소 검색</label>
        <div className="wishlist-form__link-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소 이름으로 검색"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <button type="button" className="text-button" onClick={handleSearch} disabled={searching}>
            {searching ? '검색 중...' : '검색'}
          </button>
        </div>
        {searchError && <div className="wishlist-form__preview-error">{searchError}</div>}
        {searchResults.length > 0 && (
          <div className="place-search-results">
            {searchResults.map((result, index) => (
              <div className="place-search-results__item" key={index}>
                <button type="button" className="place-search-results__pick" onClick={() => handlePickResult(result)}>
                  <span className="place-search-results__name">{result.placeName}</span>
                  <span className="place-search-results__address">{result.address}</span>
                </button>
                {result.placeUrl && (
                  <a
                    className="place-search-results__link"
                    href={result.placeUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    상세보기 ›
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {duplicateWarning && <div className="wishlist-form__preview-error">{duplicateWarning}</div>}
      </div>

      <div className="form-field">
        <label>이름</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="장소 이름" />
      </div>

      <div className="form-field">
        <label>주소</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="주소" />
      </div>

      <div className="form-field">
        <label>상태</label>
        <div className="weekday-picker">
          {STATUSES.map((s) => (
            <button
              type="button"
              key={s}
              className={`weekday-picker__day ${status === s ? 'weekday-picker__day--selected' : ''}`}
              onClick={() => setStatus(s)}
            >
              {PLACE_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className={`place-form__reveal ${status === 'VISITED' ? 'place-form__reveal--open' : ''}`}>
        <div>
          <div className="form-field">
            <label>별점</label>
            <div className="rating-picker">
              {RATING_VALUES.map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`rating-picker__star ${rating != null && value <= rating ? 'rating-picker__star--selected' : ''}`}
                  onClick={() => setRating(value)}
                  aria-label={`별점 ${value}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>후기</label>
            <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="다녀온 소감" rows={4} />
          </div>
        </div>
      </div>

      <div className="form-field">
        <label>태그</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="쉼표로 구분 (예: 카페, 가보고싶음)"
        />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
