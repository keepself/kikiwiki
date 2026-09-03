export type PlaceStatus = 'TO_VISIT' | 'VISITED';

export const PLACE_STATUS_LABELS: Record<PlaceStatus, string> = {
  TO_VISIT: '가볼 곳',
  VISITED: '가본 곳',
};

export interface Place {
  id: number;
  title: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  placeUrl: string | null;
  status: PlaceStatus;
  rating: number | null;
  review: string | null;
  tags: string[];
  createdAt: string;
}

export interface PlaceInput {
  title: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  placeUrl: string | null;
  status: PlaceStatus;
  rating: number | null;
  review: string | null;
  tags: string[];
}

export interface PlaceSearchResult {
  placeName: string;
  address: string;
  category: string;
  placeUrl: string;
  lat: number;
  lng: number;
}
