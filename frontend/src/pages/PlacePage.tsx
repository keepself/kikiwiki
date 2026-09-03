import { useEffect, useState } from 'react';
import { fetchPlaces, createPlace, updatePlace, deletePlace } from '../api/client';
import type { Place, PlaceInput, PlaceStatus } from '../types/place';
import { PLACE_STATUS_LABELS } from '../types/place';
import { PlaceForm } from '../components/PlaceForm';
import { PlaceList } from '../components/PlaceList';
import { PlaceOverviewMap } from '../components/PlaceOverviewMap';
import { Modal } from '../components/Modal';

function emptyFormValues(): PlaceInput {
  return {
    title: '',
    address: null,
    lat: null,
    lng: null,
    category: null,
    placeUrl: null,
    status: 'TO_VISIT',
    rating: null,
    review: null,
    tags: [],
  };
}

const STATUSES: PlaceStatus[] = ['TO_VISIT', 'VISITED'];

export function PlacePage() {
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formValues, setFormValues] = useState<PlaceInput | null>(null);
  const [filterStatus, setFilterStatus] = useState<PlaceStatus | ''>('');
  const [focusPlaceId, setFocusPlaceId] = useState<number | null>(null);

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

  const filteredPlaces = filterStatus ? places.filter((place) => place.status === filterStatus) : places;

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <div className="schedule-layout">
        <div className="card section">
          <div className="card-header-row">
            <h2 className="section-title">지도</h2>
          </div>
          <PlaceOverviewMap
            places={filteredPlaces}
            focusPlaceId={focusPlaceId}
            onSelect={(place) => setFocusPlaceId(place.id)}
            onMapClick={({ lat, lng, address }) =>
              setFormValues({
                title: '',
                address,
                lat,
                lng,
                category: null,
                placeUrl: null,
                status: 'TO_VISIT',
                rating: null,
                review: null,
                tags: [],
              })
            }
          />
        </div>

        <div className="schedule-layout__right">
          <div className="card section">
            <div className="card-header-row">
              <h2 className="section-title">플레이스</h2>
            </div>

            <div className="type-filter">
              <button
                type="button"
                className={`chip ${filterStatus === '' ? 'chip--selected' : ''}`}
                onClick={() => setFilterStatus('')}
              >
                전체
              </button>
              {STATUSES.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={`chip ${filterStatus === status ? 'chip--selected' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {PLACE_STATUS_LABELS[status]}
                </button>
              ))}
            </div>

            <PlaceList
              places={filteredPlaces}
              onEdit={setEditingPlace}
              onDelete={handleDelete}
              expandedId={focusPlaceId}
              onToggleExpand={(id) => setFocusPlaceId((cur) => (cur === id ? null : id))}
            />
          </div>
        </div>
      </div>

      <button className="fab" onClick={() => setFormValues(emptyFormValues())} aria-label="장소 추가">
        +
      </button>

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
