import type { OotdEntry } from '../types/ootd';
import { API_BASE_URL } from '../api/client';

interface Props {
  entries: OotdEntry[];
  onSelect: (entry: OotdEntry) => void;
}

export function OotdGrid({ entries, onSelect }: Props) {
  if (entries.length === 0) {
    return <div className="empty-state">아직 등록된 사진이 없어요.</div>;
  }

  return (
    <div className="ootd-grid">
      {entries.map((entry) => (
        <button type="button" className="ootd-grid__tile" key={entry.id} onClick={() => onSelect(entry)}>
          <img src={`${API_BASE_URL}${entry.imageUrl}`} alt={entry.entryDate} loading="lazy" />
          <span className="ootd-grid__date">{entry.entryDate.slice(5).replace('-', '/')}</span>
        </button>
      ))}
    </div>
  );
}
