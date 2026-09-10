import { useEffect, useState } from 'react';
import { fetchPlaces, createPlace, updatePlace, deletePlace } from '../api/client';
import type { Place, PlaceInput, PlaceStatus } from '../types/place';
import { PLACE_STATUS_LABELS } from '../types/place';
import { PlaceForm } from '../components/PlaceForm';
import { PlaceList } from '../components/PlaceList';
import { PlaceOverviewMap } from '../components/PlaceOverviewMap';
import { Modal } from '../components/Modal';

const STATUSES: PlaceStatus[] = ['TO_VISIT', 'VISITED'];

export function PlacePage() {
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formValues, setFormValues] = useState<PlaceInput | null>(null);
  const [filterStatus, setFilterStatus] = useState<PlaceStatus | ''>('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [focusPlaceId, setFocusPlaceId] = useState<number | null>(null);

  const changeFilterStatus = (status: PlaceStatus | '') => {
    setFilterStatus(status);
    // 상태가 바뀌면 그 상태 안에 없는 태그를 고른 채로 남아있을 수 있어서 태그 선택은 초기화함
    setSelectedTags(new Set());
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const loadPlaces = () => {
    fetchPlaces()
      .then(setPlaces)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleCreate = async (input: PlaceInput) => {
    try {
      await createPlace(input);
      loadPlaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : '장소 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async (input: PlaceInput) => {
    if (!editingPlace) return;
    try {
      await updatePlace(editingPlace.id, input);
      loadPlaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : '장소 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlace(id);
      loadPlaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : '장소 삭제 중 오류가 발생했습니다.');
    }
  };

  const statusFilteredPlaces = filterStatus ? places.filter((place) => place.status === filterStatus) : places;

  // 태그 칩 목록은 지금 상태 필터 안에 실제로 쓰인 태그만, 많이 쓰인 순으로 보여줌
  const tagCounts = new Map<string, number>();
  statusFilteredPlaces.forEach((place) => {
    place.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  });
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  // 태그를 하나도 안 골랐으면 상태 필터 결과 그대로, 골랐으면 그중 하나라도 겹치는 장소만 보여줌(OR)
  const filteredPlaces =
    selectedTags.size === 0
      ? statusFilteredPlaces
      : statusFilteredPlaces.filter((place) => place.tags.some((tag) => selectedTags.has(tag)));

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <div className="schedule-layout">
        <div className="card section">
          <PlaceOverviewMap
            places={filteredPlaces}
            focusPlaceId={focusPlaceId}
            onSelect={(place) => setFocusPlaceId(place.id)}
            onMapClick={({ lat, lng, address, title }) =>
              setFormValues({
                title: title ?? '',
                address,
                lat,
                lng,
                category: null,
                placeUrl: null,
                status: 'TO_VISIT',
                rating: null,
                review: null,
                tags: [],
                visitedAt: null,
              })
            }
            onQuickCreate={handleCreate}
            onSearchResultPick={(result) =>
              setFormValues({
                title: result.placeName,
                address: result.address,
                lat: result.lat,
                lng: result.lng,
                category: result.category,
                placeUrl: result.placeUrl,
                status: 'TO_VISIT',
                rating: null,
                review: null,
                tags: [],
                visitedAt: null,
              })
            }
          />
        </div>

        <div className="schedule-layout__right">
          <div className="card section">
            <div className="type-filter">
              <button
                type="button"
                className={`chip ${filterStatus === '' ? 'chip--selected' : ''}`}
                onClick={() => changeFilterStatus('')}
              >
                전체
              </button>
              {STATUSES.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={`chip ${filterStatus === status ? 'chip--selected' : ''}`}
                  onClick={() => changeFilterStatus(status)}
                >
                  {PLACE_STATUS_LABELS[status]}
                </button>
              ))}
            </div>

            {sortedTags.length > 0 && (
              <>
                <p className="tag-filter-label">태그로 좁혀보기</p>
                <div className="tag-filter-row">
                  {sortedTags.map(([tag, count]) => (
                    <button
                      type="button"
                      key={tag}
                      className={`tag-chip ${selectedTags.has(tag) ? 'tag-chip--selected' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag} <span className="tag-chip__count">{count}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <PlaceList
              places={filteredPlaces}
              selectedTags={selectedTags}
              onEdit={setEditingPlace}
              onDelete={handleDelete}
              expandedId={focusPlaceId}
              onToggleExpand={(id) => setFocusPlaceId((cur) => (cur === id ? null : id))}
            />
          </div>
        </div>
      </div>

      {formValues && (
        <Modal title="장소 추가" onClose={() => setFormValues(null)}>
          <PlaceForm
            initialValues={formValues}
            existingPlaces={places}
            onSubmit={async (input) => {
              await handleCreate(input);
              setFormValues(null);
            }}
          />
        </Modal>
      )}

      {editingPlace && (
        <Modal title="장소 수정" onClose={() => setEditingPlace(null)}>
          <PlaceForm
            isEditing
            submitLabel="수정하기"
            initialValues={{
              title: editingPlace.title,
              address: editingPlace.address,
              lat: editingPlace.lat,
              lng: editingPlace.lng,
              category: editingPlace.category,
              placeUrl: editingPlace.placeUrl,
              status: editingPlace.status,
              rating: editingPlace.rating,
              review: editingPlace.review,
              tags: editingPlace.tags,
              visitedAt: editingPlace.visitedAt,
            }}
            existingPlaces={places.filter((p) => p.id !== editingPlace.id)}
            onSubmit={async (input) => {
              await handleUpdate(input);
              setEditingPlace(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
