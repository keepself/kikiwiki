export interface OotdEntry {
  id: number;
  entryDate: string;
  imageUrl: string;
  memo: string | null;
  tags: string[];
  createdAt: string;
}

export interface OotdEntryInput {
  entryDate: string;
  imageDataUrl: string;
  memo: string | null;
  tags: string[];
}
