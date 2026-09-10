import { useEffect, useRef, useState } from 'react';
import type { PlaceInput, PlaceSearchResult, PlaceStatus } from '../types/place';
import { PLACE_STATUS_LABELS } from '../types/place';
import { searchPlaces } from '../api/client';
import { findDuplicatePlace, type PlaceForDuplicateCheck } from '../placeDuplicate';

interface Props {
  initialValues?: PlaceInput;
  submitLabel?: string;
  onSubmit: (input: PlaceInput) => Promise<void>;
  // 중복 저장 경고에 쓸, 이미 저장된 장소 목록 (수정 중이면 자기 자신은 제외하고 넘겨줘야 함)
  existingPlaces?: PlaceForDuplicateCheck[];
  // 신규 등록도 지도에서 넘어올 때 주소/좌표를 미리 채워서(initialValues) 열리는 경우가 있어서,
  // "이미 있는 값으로 채워졌는지"가 아니라 "실제로 기존 장소를 고치는 중인지"를 명시적으로 받음
  isEditing?: boolean;
}

const STATUSES: PlaceStatus[] = ['TO_VISIT', 'VISITED'];
const RATING_VALUES = [1, 2, 3, 4, 5];

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function PlaceForm({ initialValues, submitLabel, onSubmit, existingPlaces = [], isEditing = false }: Props) {

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
  const [visitedAt, setVisitedAt] = useState(initialValues?.visitedAt ?? '');
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(', ') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 지도 검색과 마찬가지로 현재 위치를 알면 가까운 곳부터 우선순위로 나오게 넘겨줌
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocationRef.current = { lat: position.coords.latitude, lng: position.coords.longitude };
      },
      () => {},
    );
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const results = await searchPlaces(query.trim(), userLocationRef.current ?? undefined);
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
  };

  // 검색으로 골랐든, 이름/주소를 손으로 입력했든(지도 클릭 후 "자세히 입력"으로 넘어온 경우 포함)
  // 이름+위치가 바뀔 때마다 이미 저장된 장소와 겹치는지 다시 확인함
  useEffect(() => {
    const duplicate = findDuplicatePlace({ title, placeUrl, lat, lng }, existingPlaces);
    setDuplicateWarning(duplicate ? `이미 저장된 장소예요: "${duplicate.title}"` : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, placeUrl, lat, lng]);

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
        visitedAt: status === 'VISITED' ? visitedAt || null : null,
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
        setVisitedAt('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      {/* 이미 저장된 장소를 고쳐 쓰는 중에는 다른 장소를 찾을 이유가 없어서 검색은 신규 등록일 때만 보여줌 */}
      {!isEditing && (
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
          {(searchError || searchResults.length > 0) && (
            <div
              className="menu-backdrop"
              onClick={() => {
                setSearchError(null);
                setSearchResults([]);
              }}
            />
          )}

          {searchError && <div className="wishlist-form__preview-error">{searchError}</div>}
          {searchResults.length > 0 && (
            <div className="place-search-results">
              {searchResults.map((result, index) => (
                <div className="place-search-results__item" key={index}>
                  <button type="button" className="place-search-results__pick" onClick={() => handlePickResult(result)}>
                    <span className="place-search-results__name">
                      {result.placeName}
                      {result.placeUrl && existingPlaces.some((p) => p.placeUrl === result.placeUrl) && (
                        <span className="place-search-results__saved-badge">저장됨</span>
                      )}
                    </span>
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
        </div>
      )}

      <div className="form-field">
        <label>이름</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="장소 이름" />
        {duplicateWarning && <div className="wishlist-form__preview-error">{duplicateWarning}</div>}
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
              onClick={() => {
                setStatus(s);
                // 가본 곳으로 처음 바꿀 때만 오늘 날짜를 기본으로 채워줌 (이미 적어둔 방문일은 안 건드림)
                if (s === 'VISITED' && !visitedAt) setVisitedAt(today());
              }}
            >
              {PLACE_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className={`place-form__reveal ${status === 'VISITED' ? 'place-form__reveal--open' : ''}`}>
        <div>
          <div className="form-field">
            <label>방문일</label>
            <div className="visitdate-row">
              <input type="date" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)} />
              <button type="button" className="chip visitdate-today" onClick={() => setVisitedAt(today())}>
                오늘
              </button>
            </div>
          </div>

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
