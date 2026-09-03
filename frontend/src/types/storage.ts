export type SavedItemType = 'LINK' | 'NOTE';

export const SAVED_ITEM_TYPE_LABELS: Record<SavedItemType, string> = {
  LINK: '링크',
  NOTE: '메모',
};

export interface SavedItem {
  id: number;
  type: SavedItemType;
  title: string;
  url: string | null;
  content: string | null;
  tags: string[];
  createdAt: string;
}

export interface SavedItemInput {
  type: SavedItemType;
  title: string;
  url: string | null;
  content: string | null;
  tags: string[];
}
