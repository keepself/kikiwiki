import type { ScheduleItem } from '../types/scheduleItem';
import { scheduleColorClass } from '../scheduleColor';

interface Props {
  month: string; // 'YYYY-MM'
  items: ScheduleItem[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onEditItem: (item: ScheduleItem) => void;
  onShowMore: (date: string, items: ScheduleItem[]) => void;
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const VISIBLE_ITEMS_PER_CELL = 3;

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function ScheduleCalendar({ month, items, selectedDate, onSelectDate, onEditItem, onShowMore }: Props) {
  const [year, monthNum] = month.split('-').map(Number);
  const firstOfMonth = new Date(year, monthNum - 1, 1);
  const firstWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, monthNum - 1, 1 - firstWeekday);

  const today = new Date();
  const todayStr = toDateStr(today);

  // 6주(42칸) 고정 그리드 - 지난달/다음달 남는 날짜도 흐리게 채움
  const cellDates: string[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return toDateStr(d);
  });

  return (
    <div className="gcal-grid">
      <div className="gcal-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="gcal-cells">
        {cellDates.map((dateStr, i) => {
          const day = Number(dateStr.slice(8, 10));
          const inMonth = dateStr.startsWith(month);
          const rowStart = cellDates[Math.floor(i / 7) * 7];
          const rowEnd = cellDates[Math.floor(i / 7) * 7 + 6];

          const dayItems = items.filter((item) => item.startDate <= dateStr && dateStr <= item.endDate);
          const visibleItems = dayItems.slice(0, VISIBLE_ITEMS_PER_CELL);
          const hiddenCount = dayItems.length - visibleItems.length;

          return (
            <div
              key={dateStr}
              role="button"
              tabIndex={0}
              className={[
                'gcal-cell',
                !inMonth ? 'gcal-cell--muted' : '',
                dateStr === todayStr ? 'gcal-cell--today' : '',
                dateStr === selectedDate ? 'gcal-cell--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDate(dateStr)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectDate(dateStr);
              }}
            >
              <span className="gcal-cell__day">{day}</span>
              {visibleItems.map((item) => {
                // 이번 주(행) 안에서만 봤을 때의 시작/끝 - 여러 주에 걸친 일정도 행마다 막대가
                // 끊어지고, 그 행에서 계속 이어지면 둥근 모서리 없이 옆 칸과 붙어 보이게 함
                const effectiveStart = item.startDate > rowStart ? item.startDate : rowStart;
                const effectiveEnd = item.endDate < rowEnd ? item.endDate : rowEnd;
                const isStart = dateStr === effectiveStart;
                const isEnd = dateStr === effectiveEnd;
                const shape = isStart && isEnd ? '' : isStart ? 'gcal-chip--start' : isEnd ? 'gcal-chip--end' : 'gcal-chip--mid';

                return (
                  <span
                    key={item.id}
                    className={`gcal-chip gcal-chip--${scheduleColorClass(item.id)} ${shape} ${
                      item.routineId != null ? 'gcal-chip--routine' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                  >
                    {isStart ? item.title : ' '}
                  </span>
                );
              })}
              {hiddenCount > 0 && (
                <span
                  className="gcal-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowMore(dateStr, dayItems);
                  }}
                >
                  +{hiddenCount}개 더보기
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
