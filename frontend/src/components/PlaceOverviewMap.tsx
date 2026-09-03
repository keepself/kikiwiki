import { useEffect, useRef } from 'react';
import type { Place } from '../types/place';
import { loadKakaoMaps } from '../loadKakaoMaps';

interface Props {
  places: Place[];
  onSelect?: (place: Place) => void;
  onMapClick?: (point: { lat: number; lng: number; address: string | null }) => void;
  focusPlaceId?: number | null;
}

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.978 };

export function PlaceOverviewMap({ places, onSelect, onMapClick, focusPlaceId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kakaoRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markersByIdRef = useRef<Map<number, any>>(new Map());
  const infoWindowRef = useRef<any>(null);
  const placesRef = useRef<Place[]>(places);
  const onSelectRef = useRef(onSelect);
  const onMapClickRef = useRef(onMapClick);
  placesRef.current = places;
  onSelectRef.current = onSelect;
  onMapClickRef.current = onMapClick;

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
      const marker = new kakao.maps.Marker({ position, map });
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
        if (!onMapClickRef.current) return;
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
          const address =
            status === kakao.maps.services.Status.OK
              ? result[0]?.road_address?.address_name ?? result[0]?.address?.address_name ?? null
              : null;
          onMapClickRef.current?.({ lat, lng, address });
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
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.relayout();
        render();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
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

  return <div className="place-overview-map" ref={containerRef} />;
}
