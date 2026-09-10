// 지도 검색으로 등록한 곳과 지도를 직접 클릭해서 이름을 손으로 입력한 곳이 사실 같은 장소인 경우를
// 잡아내기 위한 공용 중복 판단 로직 - PlaceOverviewMap(지도 검색/클릭)과 PlaceForm(폼 안 검색) 양쪽에서 씀

export interface PlaceForDuplicateCheck {
  title: string;
  placeUrl: string | null;
  lat: number | null;
  lng: number | null;
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, '');
}

// 근사 거리(m) - 중복 판단용으로 수백 m 이내만 구분하면 되니 이 정도 정확도면 충분함
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const avgLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const x = dLng * Math.cos(avgLat);
  const y = dLat;
  return Math.sqrt(x * x + y * y) * R;
}

const DUPLICATE_RADIUS_METERS = 150;

// placeUrl(카카오 고유 상세페이지 링크)이 같으면 확실히 같은 곳. placeUrl이 없는 경우(지도를 직접
// 클릭해서 이름을 손으로 입력한 경우)엔 같은 이름 + 150m 이내 거리로도 같은 곳으로 봄
export function findDuplicatePlace<T extends PlaceForDuplicateCheck>(
  candidate: { title: string; placeUrl: string | null; lat: number | null; lng: number | null },
  existing: T[],
): T | null {
  return (
    existing.find((p) => {
      if (candidate.placeUrl && p.placeUrl === candidate.placeUrl) return true;
      if (!candidate.title.trim() || candidate.lat == null || candidate.lng == null) return false;
      if (p.lat == null || p.lng == null) return false;
      if (normalizeTitle(p.title) !== normalizeTitle(candidate.title)) return false;
      return distanceMeters(candidate.lat, candidate.lng, p.lat, p.lng) < DUPLICATE_RADIUS_METERS;
    }) ?? null
  );
}
