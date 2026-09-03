import { useEffect, useRef, useState } from 'react';
import type { Place } from '../types/place';

interface Props {
  places: Place[];
  onEdit: (place: Place) => void;
  onDelete: (id: number) => Promise<void>;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
}

const PAGE_SIZE = 8;

export function PlaceList({ places, onEdit, onDelete, expandedId, onToggleExpand }: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const totalPages = Math.max(1, Math.ceil(places.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePlaces = places.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 지도에서 마커를 클릭해 펼쳐진 항목이 지금 페이지에 없으면, 그 항목이 있는 페이지로 먼저 넘겨줌
  useEffect(() => {
    if (expandedId == null) return;
    const index = places.findIndex((p) => p.id === expandedId);
    if (index === -1) return;
    const targetPage = Math.floor(index / PAGE_SIZE) + 1;
    setPage((cur) => (cur === targetPage ? cur : targetPage));
  }, [expandedId, places]);

  // 페이지가 바뀌어 실제로 리스트에 그 항목이 렌더링된 뒤에 스크롤함
  useEffect(() => {
    if (expandedId == null) return;
    rowRefs.current.get(expandedId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [expandedId, currentPage]);

  const handleDelete = async (id: number) => {
    if (confirm('이 장소를 삭제할까요?')) {
      await onDelete(id);
    }
  };

  if (places.length === 0) {
    return <div className="empty-state">저장된 장소가 없어요.</div>;
  }

  return (
    <>
      <div className="saved-item-list">
        {visiblePlaces.map((place) => {
          const isExpanded = expandedId === place.id;
          return (
            <div
              className="item-row-wrap"
              key={place.id}
              ref={(el) => {
                if (el) rowRefs.current.set(place.id, el);
                else rowRefs.current.delete(place.id);
              }}
            >
              <div className="item-row item-row--clickable" onClick={() => onToggleExpand(place.id)}>
                <div className={`item-icon ${place.status === 'VISITED' ? 'note' : 'link'}`}>
                  {place.status === 'VISITED' ? '✅' : '📍'}
                </div>

                <div className="item-main">
                  <div className="item-title">{place.title}</div>
                  <div className="item-meta">
                    {place.status === 'VISITED' && place.rating != null && (
                      <span className="tag-pill">{'★'.repeat(place.rating)}</span>
                    )}
                    {place.category && <span className="tag-pill">{place.category}</span>}
                    {place.tags.map((tag) => (
                      <span className="tag-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="item-date">{place.createdAt.slice(5, 10).replace('-', '/')}</span>

                <div className="row-menu-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="row-menu-trigger"
                    aria-label="메뉴"
                    onClick={() => setOpenMenuId((cur) => (cur === place.id ? null : place.id))}
                  >
                    ⋯
                  </button>
                  {openMenuId === place.id && (
                    <>
                      <div className="menu-backdrop" onClick={() => setOpenMenuId(null)} />
                      <div className="row-menu-popover">
                        <button
                          className="row-menu-item"
                          onClick={() => {
                            onEdit(place);
                            setOpenMenuId(null);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="row-menu-item row-menu-item--danger"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDelete(place.id);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="item-row__expand">
                  {place.address && <div className="item-row__expand-address">{place.address}</div>}
                  {place.status === 'VISITED' ? (
                    place.review ? (
                      <div className="item-row__expand-review">{place.review}</div>
                    ) : (
                      <div className="item-row__expand-review item-row__expand-review--empty">아직 후기가 없어요.</div>
                    )
                  ) : (
                    <div className="item-row__expand-review item-row__expand-review--empty">아직 가보지 않았어요.</div>
                  )}
                  {place.placeUrl && (
                    <a
                      className="item-row__expand-link"
                      href={place.placeUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      카카오맵에서 보기 ›
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination__arrow"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`pagination__page ${p === currentPage ? 'pagination__page--active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="pagination__arrow"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
