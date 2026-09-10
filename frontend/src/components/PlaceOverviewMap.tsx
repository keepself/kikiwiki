import { useEffect, useRef, useState } from 'react';
import type { Place, PlaceInput, PlaceSearchResult, PlaceStatus } from '../types/place';
import { loadKakaoMaps } from '../loadKakaoMaps';
import { searchPlaces, searchNearbyPlaces } from '../api/client';
import { findDuplicatePlace } from '../placeDuplicate';
import { PinIcon } from './NavIcons';

interface Props {
  places: Place[];
  onSelect?: (place: Place) => void;
  onMapClick?: (point: { lat: number; lng: number; address: string | null; title?: string }) => void;
  onQuickCreate?: (input: PlaceInput) => Promise<void>;
  onSearchResultPick?: (result: PlaceSearchResult) => void;
  focusPlaceId?: number | null;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m16.5 16.5-3.5-3.5" />
    </svg>
  );
}

// 주변 탐색 칩 아이콘 - 앱 전반의 선(line) 아이콘 톤(strokeWidth 1.6~1.8)에 맞춤
function FoodIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h14a7 7 0 0 1-14 0Z" />
      <path d="M3.2 9.3a1 1 0 0 1 .8-.3h12a1 1 0 0 1 .8 1.7" />
      <path d="M7 5.2c0 .7.8.9.8 1.6S7 8.2 7 8.2M10 4.2c0 .7.8.9.8 1.6s-.8.8-.8.8M13 5.2c0 .7.8.9.8 1.6S13 8.2 13 8.2" />
    </svg>
  );
}

function CafeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 6h10v6a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z" />
      <path d="M13.5 7.5h1.2a2 2 0 0 1 0 4h-1.2" />
      <path d="M6.2 3c0 .6-.7.8-.7 1.5S6.2 6 6.2 6M9.2 3c0 .6-.7.8-.7 1.5s.7.9.7.9" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l1-4h12l1 4" />
      <path d="M3 8v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M8 16.5v-4a2 2 0 0 1 4 0v4" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.8" y="2.8" width="14.4" height="14.4" rx="4" />
      <path d="M7.8 6.2v7.6M7.8 6.2h2.4a2.4 2.4 0 0 1 0 4.8H7.8" />
    </svg>
  );
}

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.978 };

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// 가볼 곳/가본 곳/검색-클릭 임시 마커를 색으로 구분함 (기본 카카오 핀은 전부 파란색이라 구분이 안 됐음)
const PIN_COLORS = {
  TO_VISIT: '#FFFFFF',
  VISITED: '#3D8A6E',
  SEARCH: '#E5484D',
  NEARBY: '#E8A33D',
} as const;

// 주변 탐색 칩 - 카카오 카테고리 그룹 코드 (백엔드 화이트리스트와 맞춰야 함)
const CATEGORY_CHIPS = [
  { code: 'FD6', label: '음식점', Icon: FoodIcon },
  { code: 'CE7', label: '카페', Icon: CafeIcon },
  { code: 'CS2', label: '편의점', Icon: StoreIcon },
  { code: 'PK6', label: '주차장', Icon: ParkingIcon },
] as const;

function buildPinSvg(color: string): string {
  // 흰색 핀은 기존 흰 테두리/흰 점 그대로 쓰면 안 보여서, 흰색일 때만 회색 테두리+점으로 대비를 줌
  const isWhite = color.toLowerCase() === '#ffffff';
  const strokeColor = isWhite ? '#8A9A93' : 'white';
  const dotColor = isWhite ? '#8A9A93' : 'white';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">` +
    `<path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="${color}" stroke="${strokeColor}" stroke-width="1.5"/>` +
    `<circle cx="14" cy="14" r="5" fill="${dotColor}"/>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function PlaceOverviewMap({ places, onSelect, onMapClick, onQuickCreate, onSearchResultPick, focusPlaceId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kakaoRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markersByIdRef = useRef<Map<number, any>>(new Map());
  const searchMarkerRef = useRef<any>(null);
  const searchResultMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const pinImageCacheRef = useRef<Map<string, any>>(new Map());

  const getPinImage = (kakao: any, color: string) => {
    if (!pinImageCacheRef.current.has(color)) {
      const size = new kakao.maps.Size(28, 40);
      const image = new kakao.maps.MarkerImage(buildPinSvg(color), size, {
        offset: new kakao.maps.Point(14, 40),
      });
      pinImageCacheRef.current.set(color, image);
    }
    return pinImageCacheRef.current.get(color);
  };
  const placesRef = useRef<Place[]>(places);
  const onSelectRef = useRef(onSelect);
  placesRef.current = places;
  onSelectRef.current = onSelect;

  // 현재 위치를 알면 검색할 때 가까운 곳부터 우선순위로 나오게 넘겨줌 - 못 구해도(권한 거부 등)
  // 검색 자체는 그냥 위치 없이 동작하면 되니 조용히 무시함
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

  // 지도 위에서 바로 검색 - 카카오 키워드 검색으로 결과를 찾고, 고르면 지도가 그 위치로 이동하며
  // 이름/카테고리/전화까지 채워진 정보 카드가 뜸
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);

  // 검색어 없이 지도 중심 기준으로 카테고리 결과를 바로 찾는 "주변 탐색" 칩 - 평소엔 접혀 있다가
  // 토글 버튼을 눌러야 펼쳐짐
  const [showCategoryChips, setShowCategoryChips] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // 지도를 클릭하거나(주소만 앎, 이름은 직접 입력) 검색 결과를 고르면(이름/카테고리/전화까지 앎)
  // 카카오맵처럼 정보 카드를 띄우고 그 자리에서 가볼 곳/가본 곳으로 바로 저장할 수 있게 함
  interface CardInfo {
    lat: number;
    lng: number;
    address: string | null;
    title: string;
    category: string | null;
    phone: string | null;
    placeUrl: string | null;
    editableTitle: boolean;
  }

  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // 검색으로 고른 곳이 이미 저장돼 있는지 확인 (자세한 판단 기준은 placeDuplicate.ts 참고 -
  // placeUrl이 같거나, 지도를 직접 클릭해서 이름을 손으로 입력한 경우엔 이름+거리로 판단)
  const isAlreadySaved = (placeUrl: string) => places.some((p) => p.placeUrl === placeUrl);
  const duplicatePlace = cardInfo
    ? findDuplicatePlace(
        {
          title: cardInfo.editableTitle ? quickTitle : cardInfo.title,
          placeUrl: cardInfo.placeUrl,
          lat: cardInfo.lat,
          lng: cardInfo.lng,
        },
        places,
      )
    : null;

  const clearClickMarker = () => {
    searchMarkerRef.current?.setMap(null);
    searchMarkerRef.current = null;
  };

  const closeInfoCard = () => {
    setCardInfo(null);
    clearClickMarker();
  };

  const dropMarkerAt = (lat: number, lng: number) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;
    clearClickMarker();
    const position = new kakao.maps.LatLng(lat, lng);
    searchMarkerRef.current = new kakao.maps.Marker({ position, map, image: getPinImage(kakao, PIN_COLORS.SEARCH) });
  };

  const clearSearchResultMarkers = () => {
    searchResultMarkersRef.current.forEach((marker) => marker.setMap(null));
    searchResultMarkersRef.current = [];
  };

  // 검색 결과 목록에 있는 후보들을 전부 지도 위에도 핀으로 찍어줌 - 리스트에서 골라도 되고
  // 핀을 바로 클릭해도 동일하게 그 장소를 고른 것으로 처리함
  const renderSearchResultMarkers = (results: PlaceSearchResult[], color: string = PIN_COLORS.SEARCH) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    clearSearchResultMarkers();
    if (!kakao || !map) return;
    results.forEach((result) => {
      const position = new kakao.maps.LatLng(result.lat, result.lng);
      const marker = new kakao.maps.Marker({ position, map, image: getPinImage(kakao, color) });
      kakao.maps.event.addListener(marker, 'click', () => handlePickSearchResultRef.current(result));
      searchResultMarkersRef.current.push(marker);
    });
  };

  const handleMapPoint = (point: { lat: number; lng: number; address: string | null }) => {
    dropMarkerAt(point.lat, point.lng);
    setCardInfo({
      lat: point.lat,
      lng: point.lng,
      address: point.address,
      title: '',
      category: null,
      phone: null,
      placeUrl: null,
      editableTitle: true,
    });
    setQuickTitle('');
    setQuickError(null);
  };

  // 지도 클릭 리스너는 최초 마운트 시 한 번만 등록되므로, 매 렌더 최신 핸들러를 참조하도록 ref로 감쌈
  const handleMapPointRef = useRef(handleMapPoint);
  handleMapPointRef.current = handleMapPoint;

  const handleQuickCreate = async (status: PlaceStatus) => {
    if (!cardInfo) return;
    const title = cardInfo.editableTitle ? quickTitle.trim() : cardInfo.title;
    if (!title) {
      setQuickError('이름을 입력해주세요.');
      return;
    }
    setQuickSubmitting(true);
    try {
      await onQuickCreate?.({
        title,
        address: cardInfo.address,
        lat: cardInfo.lat,
        lng: cardInfo.lng,
        category: cardInfo.category,
        placeUrl: cardInfo.placeUrl,
        status,
        rating: null,
        review: null,
        tags: [],
        visitedAt: status === 'VISITED' ? today() : null,
      });
      closeInfoCard();
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      // 지도에서 검색할 땐 내 실제 위치가 아니라, 지도를 옮겨서 보고 있는 그 위치를 기준으로
      // 우선순위를 매김 (예: 지도를 군자로 쪽으로 이동시켜놓고 "라멘"을 검색하면 그 근처가 먼저 나옴)
      const center = mapRef.current?.getCenter();
      const near = center ? { lat: center.getLat(), lng: center.getLng() } : userLocationRef.current ?? undefined;
      const results = await searchPlaces(searchQuery.trim(), near);
      setActiveCategory(null);
      setSearchResults(results);
      renderSearchResultMarkers(results);
      if (results.length === 0) {
        setSearchError('검색 결과가 없어요.');
      }
    } catch {
      setSearchError('장소 검색에 실패했어요.');
      clearSearchResultMarkers();
    } finally {
      setSearching(false);
    }
  };

  // 카테고리 칩을 누르면 지도 중심 기준 반경 안에서 바로 찾아서, 키워드 검색과 똑같이
  // 목록/핀/상세카드 흐름을 그대로 재사용함 (핀 색만 다르게 구분)
  const handleCategorySearch = async (categoryCode: string) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;
    const center = map.getCenter();

    setActiveCategory(categoryCode);
    setSearching(true);
    setSearchError(null);
    setSearchQuery('');
    // 검색어 검색과 달리 결과 목록 드롭다운은 띄우지 않고, 지도 위 핀으로만 보여줌
    setSearchResults([]);
    try {
      const results = await searchNearbyPlaces(categoryCode, center.getLat(), center.getLng());
      renderSearchResultMarkers(results, PIN_COLORS.NEARBY);
      if (results.length === 0) {
        setSearchError('주변에서 결과를 찾지 못했어요.');
      }
    } catch {
      setSearchError('주변 탐색에 실패했어요.');
      clearSearchResultMarkers();
    } finally {
      setSearching(false);
    }
  };

  // 결과를 고르면 지도가 그 위치로 움직이면서, 이름/카테고리/전화번호까지 이미 아는 채로
  // 정보 카드가 바로 뜸 (지도 클릭과 달리 이름을 직접 입력할 필요가 없음)
  const handlePickSearchResult = (result: PlaceSearchResult) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (kakao && map) {
      const position = new kakao.maps.LatLng(result.lat, result.lng);
      // 줌 레벨을 먼저 바꾸고 나서 이동해야 정확한 위치로 감 - panTo 중간에 setLevel을 하면
      // 아직 이동 중인(도착 전) 중심 기준으로 확대/축소해버려서 최종 위치가 살짝 어긋났음
      map.setLevel(4);
      map.panTo(position);
    }
    dropMarkerAt(result.lat, result.lng);
    setCardInfo({
      lat: result.lat,
      lng: result.lng,
      address: result.address || null,
      title: result.placeName,
      category: result.category || null,
      phone: result.phone || null,
      placeUrl: result.placeUrl || null,
      editableTitle: false,
    });
    setQuickError(null);

    clearSearchResultMarkers();
    setSearchResults([]);
    setSearchQuery('');
    setActiveCategory(null);
  };

  // renderSearchResultMarkers가 먼저 정의돼서 아래쪽의 handlePickSearchResult를 직접 참조할 수
  // 없으므로(마커 클릭은 항상 마운트 이후에나 일어나 최신 값이면 되니) ref로 우회함
  const handlePickSearchResultRef = useRef(handlePickSearchResult);
  handlePickSearchResultRef.current = handlePickSearchResult;

  const openInfoWindow = (place: Place, marker: any) => {
    infoWindowRef.current.setContent(
      `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;">${place.title}</div>`
    );
    infoWindowRef.current.open(mapRef.current, marker);
  };

  // 지도/마커를 현재 places 상태에 맞게 다시 그림 - 데이터가 바뀔 때도, 숨겨진 탭이 다시 보일 때도 호출됨
  const render = () => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    markersByIdRef.current = new Map();

    const withCoords = placesRef.current.filter((place) => place.lat != null && place.lng != null);

    withCoords.forEach((place) => {
      const position = new kakao.maps.LatLng(place.lat as number, place.lng as number);
      const pinColor = place.status === 'VISITED' ? PIN_COLORS.VISITED : PIN_COLORS.TO_VISIT;
      const marker = new kakao.maps.Marker({ position, map, image: getPinImage(kakao, pinColor) });
      kakao.maps.event.addListener(marker, 'click', () => {
        openInfoWindow(place, marker);
        onSelectRef.current?.(place);
      });
      markersRef.current.push(marker);
      markersByIdRef.current.set(place.id, marker);
    });

    if (withCoords.length === 1) {
      map.setCenter(new kakao.maps.LatLng(withCoords[0].lat as number, withCoords[0].lng as number));
      map.setLevel(4);
    } else if (withCoords.length > 1) {
      const bounds = new kakao.maps.LatLngBounds();
      withCoords.forEach((place) => bounds.extend(new kakao.maps.LatLng(place.lat as number, place.lng as number)));
      map.setBounds(bounds);
    } else {
      map.setCenter(new kakao.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng));
      map.setLevel(6);
    }
  };

  // 지도 최초 생성 - 항상 마운트된 탭 구조상 처음엔 숨겨진(display:none) 상태로 만들어질 수 있어서,
  // 그때의 0크기를 기준으로 타일이 깨지는 걸 막으려고 ResizeObserver로 실제 크기가 잡힐 때 relayout함
  useEffect(() => {
    let cancelled = false;

    loadKakaoMaps().then((kakao) => {
      if (cancelled || !containerRef.current) return;
      kakaoRef.current = kakao;
      mapRef.current = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng),
        level: 6,
      });
      infoWindowRef.current = new kakao.maps.InfoWindow({ removable: true });

      const geocoder = new kakao.maps.services.Geocoder();
      kakao.maps.event.addListener(mapRef.current, 'click', (mouseEvent: any) => {
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
          const address =
            status === kakao.maps.services.Status.OK
              ? result[0]?.road_address?.address_name ?? result[0]?.address?.address_name ?? null
              : null;
          handleMapPointRef.current({ lat, lng, address });
        });
      });

      render();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // 사이드바 접기/펴기 애니메이션처럼 크기가 짧은 시간 동안 연속으로 바뀔 때
    // 매 프레임 relayout+render하면 지도가 계속 재중심되며 깜빡이므로, 크기 변화가
    // 멈춘 뒤 한 번만 반영되도록 디바운스함
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.relayout();
          render();
        }
      }, 150);
    });
    observer.observe(containerRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // 리스트에서 항목을 골랐을 때 - 지도를 그 장소로 이동시키고 말풍선을 띄움
  useEffect(() => {
    if (focusPlaceId == null) return;
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    const marker = markersByIdRef.current.get(focusPlaceId);
    const place = placesRef.current.find((p) => p.id === focusPlaceId);
    if (!kakao || !map || !marker || !place || place.lat == null || place.lng == null) return;

    map.panTo(new kakao.maps.LatLng(place.lat, place.lng));
    openInfoWindow(place, marker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPlaceId]);

  return (
    <div className="place-overview-map-wrap">
      <div className="place-map-search">
        <div className="place-map-search__box">
          <SearchIcon />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="지도에서 장소 검색"
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
          <button
            type="button"
            className={`place-map-search__nearby-toggle ${showCategoryChips ? 'place-map-search__nearby-toggle--active' : ''}`}
            onClick={() => setShowCategoryChips((prev) => !prev)}
          >
            <PinIcon />
            주변
          </button>
        </div>

        {showCategoryChips && (
          <div className="place-map-search__chip-row">
            {CATEGORY_CHIPS.map(({ code, label, Icon }) => (
              <button
                type="button"
                key={code}
                className={`chip ${activeCategory === code ? 'chip--selected' : ''}`}
                onClick={() => handleCategorySearch(code)}
                disabled={searching}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        )}

        {(searchError || searchResults.length > 0) && (
          <div
            className="menu-backdrop"
            onClick={() => {
              setSearchError(null);
              setSearchResults([]);
              setActiveCategory(null);
              clearSearchResultMarkers();
            }}
          />
        )}

        {searchError && <div className="place-map-search__error">{searchError}</div>}

        {searchResults.length > 0 && (
          <div className="place-search-results place-map-search__results">
            {searchResults.map((result, index) => (
              <div className="place-search-results__item" key={index}>
                <button
                  type="button"
                  className="place-search-results__pick"
                  onClick={() => handlePickSearchResult(result)}
                >
                  <span className="place-search-results__name">
                    {result.placeName}
                    {result.placeUrl && isAlreadySaved(result.placeUrl) && (
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

      <div className="place-overview-map" ref={containerRef} />

      {cardInfo && (
        <div className="place-map-info-card">
          <button type="button" className="place-map-info-card__close" onClick={closeInfoCard} aria-label="닫기">
            ×
          </button>

          {cardInfo.editableTitle ? (
            <input
              type="text"
              className="place-map-info-card__title-input"
              value={quickTitle}
              onChange={(e) => {
                setQuickTitle(e.target.value);
                setQuickError(null);
              }}
              placeholder="장소 이름을 입력하세요"
              autoFocus
            />
          ) : (
            <>
              <div className="place-map-info-card__title">{cardInfo.title}</div>
              {cardInfo.category && <div className="place-map-info-card__category">{cardInfo.category}</div>}
            </>
          )}

          <div className="place-map-info-card__address">{cardInfo.address ?? '주소를 찾을 수 없어요'}</div>

          {cardInfo.phone && (
            <a className="place-map-info-card__phone" href={`tel:${cardInfo.phone}`}>
              {cardInfo.phone}
            </a>
          )}

          {cardInfo.placeUrl && (
            <a className="place-map-info-card__link" href={cardInfo.placeUrl} target="_blank" rel="noreferrer">
              상세보기 ›
            </a>
          )}

          {duplicatePlace && (
            <div className="place-map-info-card__warning">이미 저장된 장소예요: "{duplicatePlace.title}"</div>
          )}

          {quickError && <div className="place-map-info-card__error">{quickError}</div>}

          <div className="place-map-info-card__actions">
            <button
              type="button"
              className="chip"
              onClick={() => handleQuickCreate('TO_VISIT')}
              disabled={quickSubmitting}
            >
              + 가볼 곳
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => handleQuickCreate('VISITED')}
              disabled={quickSubmitting}
            >
              + 가본 곳
            </button>
            <button
              type="button"
              className="text-button place-map-info-card__more"
              onClick={() => {
                if (cardInfo.editableTitle) {
                  onMapClick?.({
                    lat: cardInfo.lat,
                    lng: cardInfo.lng,
                    address: cardInfo.address,
                    title: quickTitle.trim() || undefined,
                  });
                } else {
                  onSearchResultPick?.({
                    placeName: cardInfo.title,
                    address: cardInfo.address ?? '',
                    category: cardInfo.category ?? '',
                    placeUrl: cardInfo.placeUrl ?? '',
                    phone: cardInfo.phone ?? '',
                    lat: cardInfo.lat,
                    lng: cardInfo.lng,
                  });
                }
                closeInfoCard();
              }}
            >
              자세히 입력 ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
