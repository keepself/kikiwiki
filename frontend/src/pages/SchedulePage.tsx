import { useEffect, useState } from 'react';
import {
  fetchScheduleItems,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  fetchTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  updateTodoItemStatus,
  fetchArchivedTodoItems,
  restoreTodoItem,
} from '../api/client';
import type { ScheduleItem, ScheduleItemInput } from '../types/scheduleItem';
import type { TodoItem, TodoItemInput, TodoStatus } from '../types/todoItem';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { TodoBoard } from '../components/TodoBoard';
import { ScheduleItemForm } from '../components/ScheduleItemForm';
import { TodoItemForm } from '../components/TodoItemForm';
import { Modal } from '../components/Modal';
import { scheduleColorClass } from '../scheduleColor';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function year(monthStr: string): number {
  return Number(monthStr.slice(0, 4));
}

export function SchedulePage() {
  const [error, setError] = useState<string | null>(null);

  // ---- 캘린더 일정 (날짜 기반) ----
  const [month, setMonth] = useState(currentMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [dayDetail, setDayDetail] = useState<{ date: string; items: ScheduleItem[] } | null>(null);
  const [openScheduleMenuId, setOpenScheduleMenuId] = useState<number | null>(null);

  const loadScheduleItems = () => {
    fetchScheduleItems(month)
      .then(setScheduleItems)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadScheduleItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const handleScheduleCreate = async (input: ScheduleItemInput, addToBoard: boolean) => {
    try {
      const createdScheduleItem = await createScheduleItem(input);
      const targetMonth = input.startDate.slice(0, 7);
      if (targetMonth === month) {
        loadScheduleItems();
      } else {
        setMonth(targetMonth);
      }
      setSelectedDate(input.startDate);

      if (addToBoard) {
        await createTodoItem({ title: input.title, memo: input.memo, linkedScheduleItemId: createdScheduleItem.id });
        loadTodoItems();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 등록 중 오류가 발생했습니다.');
    }
  };

  const handleScheduleUpdate = async (input: ScheduleItemInput, addToBoard: boolean) => {
    if (!editingScheduleItem) return;
    try {
      await updateScheduleItem(editingScheduleItem.id, input);
      loadScheduleItems();

      if (addToBoard) {
        await createTodoItem({ title: input.title, memo: input.memo, linkedScheduleItemId: editingScheduleItem.id });
        loadTodoItems();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 수정 중 오류가 발생했습니다.');
    }
  };

  const handleScheduleDelete = async (id: number) => {
    if (!confirm('이 일정을 삭제할까요?')) return;
    try {
      await deleteScheduleItem(id);
      loadScheduleItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 삭제 중 오류가 발생했습니다.');
    }
  };

  const sortedScheduleItems = [...scheduleItems].sort((a, b) => a.startDate.localeCompare(b.startDate));

  // ---- 할 일 보드 (캘린더와 별개, 날짜 없이 상태로만 관리) ----
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodoItem, setEditingTodoItem] = useState<TodoItem | null>(null);
  const [archivedTodoItems, setArchivedTodoItems] = useState<TodoItem[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  const loadTodoItems = () => {
    fetchTodoItems()
      .then(setTodoItems)
      .catch((err) => setError(err.message));
  };

  const loadArchivedTodoItems = () => {
    fetchArchivedTodoItems()
      .then(setArchivedTodoItems)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadTodoItems();
    loadArchivedTodoItems();
  }, []);

  const handleTodoRestore = async (id: number) => {
    try {
      await restoreTodoItem(id);
      loadTodoItems();
      loadArchivedTodoItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일 복원 중 오류가 발생했습니다.');
    }
  };

  const handleTodoCreate = async (input: TodoItemInput) => {
    try {
      await createTodoItem(input);
      loadTodoItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일 등록 중 오류가 발생했습니다.');
    }
  };

  const handleTodoUpdate = async (input: TodoItemInput) => {
    if (!editingTodoItem) return;
    try {
      await updateTodoItem(editingTodoItem.id, input);
      loadTodoItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일 수정 중 오류가 발생했습니다.');
    }
  };

  const handleTodoStatusChange = async (id: number, status: TodoStatus) => {
    // 낙관적 업데이트: 드래그 놓자마자 바로 반영되게 하고, 실패하면 다시 불러와서 되돌림
    setTodoItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await updateTodoItemStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경 중 오류가 발생했습니다.');
      loadTodoItems();
    }
  };

  // 실제로는 지우는 게 아니라 보관 처리(소프트 삭제)라서, 확인창 없이 바로 진행 - 보관함에서 언제든 복원 가능
  const handleTodoArchive = async (id: number) => {
    try {
      await deleteTodoItem(id);
      loadTodoItems();
      loadArchivedTodoItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '보관 처리 중 오류가 발생했습니다.');
    }
  };

  // 진짜 삭제: 캘린더 일정에서 "할 일 보드에도 추가" 체크박스로 만들어진 카드면, 연결된 일정도 같이 지움
  const handleTodoDelete = async (id: number) => {
    if (!confirm('이 할 일을 삭제할까요? (연결된 캘린더 일정이 있다면 같이 삭제돼요)')) return;
    try {
      await deleteTodoItem(id, true);
      loadTodoItems();
      loadScheduleItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <div className="schedule-layout">
        <div className="card section">
          <div className="gcal-header">
            <button className="icon-button" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="이전 달">
              ‹
            </button>
            <span className="gcal-header__title">{year(month)}년 {Number(month.slice(5, 7))}월</span>
            <button className="icon-button" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="다음 달">
              ›
            </button>
            <button className="gcal-header__today" onClick={() => setMonth(currentMonth())}>
              오늘
            </button>
          </div>

          <ScheduleCalendar
            month={month}
            items={scheduleItems}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              if (date === selectedDate) {
                // 이미 선택된 날짜를 다시 누르면 그때 추가 폼을 염 (한 번은 선택만, 두 번째부터 등록)
                setShowScheduleForm(true);
              } else {
                setSelectedDate(date);
              }
            }}
            onEditItem={setEditingScheduleItem}
            onShowMore={(date, items) => setDayDetail({ date, items })}
          />
        </div>

        <div className="schedule-layout__right">
          <div className="card section">
            <div className="card-header-row">
              <h2 className="section-title">이번 달 일정</h2>
            </div>

            {sortedScheduleItems.length === 0 ? (
              <div className="empty-state">이 달엔 등록된 일정이 없어요.</div>
            ) : (
              <div className="recurring-list">
                {sortedScheduleItems.map((item) => {
                  const isPast = item.endDate < todayStr();
                  return (
                    <div className={`recurring-row ${isPast ? 'recurring-row--past' : ''}`} key={item.id}>
                      <div className="recurring-row__info">
                        <span className="recurring-row__name">
                          <span className={`schedule-color-dot schedule-color-dot--${scheduleColorClass(item.id)}`} />
                          {item.title}
                        </span>
                        <span className="recurring-row__category">
                          {item.startDate === item.endDate
                            ? item.startDate.slice(5).replace('-', '/')
                            : `${item.startDate.slice(5).replace('-', '/')} ~ ${item.endDate.slice(5).replace('-', '/')}`}
                          {item.memo ? ` · ${item.memo}` : ''}
                        </span>
                      </div>
                      <div className="row-menu-wrap">
                        <button
                          className="row-menu-trigger"
                          aria-label="메뉴"
                          onClick={() => setOpenScheduleMenuId((cur) => (cur === item.id ? null : item.id))}
                        >
                          ⋯
                        </button>
                        {openScheduleMenuId === item.id && (
                          <>
                            <div className="menu-backdrop" onClick={() => setOpenScheduleMenuId(null)} />
                            <div className="row-menu-popover">
                              <button
                                className="row-menu-item"
                                onClick={() => {
                                  setEditingScheduleItem(item);
                                  setOpenScheduleMenuId(null);
                                }}
                              >
                                수정
                              </button>
                              <button
                                className="row-menu-item row-menu-item--danger"
                                onClick={() => {
                                  setOpenScheduleMenuId(null);
                                  handleScheduleDelete(item.id);
                                }}
                              >
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card section">
            <div className="card-header-row">
              <h2 className="section-title">할 일 현황</h2>
            </div>
            <div className="summary-card__row">
              <div className="summary-card__stat summary-card__stat--neutral">
                <div className="summary-card__stat-label">할 일</div>
                <div className="summary-card__stat-value tabular-nums">
                  {todoItems.filter((i) => i.status === 'TODO').length}
                </div>
              </div>
              <div className="summary-card__stat summary-card__stat--progress">
                <div className="summary-card__stat-label">진행중</div>
                <div className="summary-card__stat-value tabular-nums">
                  {todoItems.filter((i) => i.status === 'IN_PROGRESS').length}
                </div>
              </div>
              <div className="summary-card__stat summary-card__stat--income">
                <div className="summary-card__stat-label">완료</div>
                <div className="summary-card__stat-value tabular-nums">
                  {todoItems.filter((i) => i.status === 'DONE').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card section">
        <div className="card-header-row">
          <h2 className="section-title">작업 보드</h2>
        </div>
        <TodoBoard
          items={todoItems}
          onStatusChange={handleTodoStatusChange}
          onEdit={setEditingTodoItem}
          onAddClick={() => setShowTodoForm(true)}
          onArchive={(item) => handleTodoArchive(item.id)}
        />

        {archivedTodoItems.length > 0 && (
          <div className="purchased-section">
            <button className="expand-toggle-button" onClick={() => setShowArchive((v) => !v)}>
              보관함 ({archivedTodoItems.length})
              <span className={`expand-toggle-button__arrow ${showArchive ? 'expand-toggle-button__arrow--up' : ''}`}>
                ▾
              </span>
            </button>

            {showArchive && (
              <div className="purchased-list">
                {archivedTodoItems.map((item) => (
                  <div className="purchased-row" key={item.id}>
                    <span className="purchased-row__name">{item.title}</span>
                    <span className="purchased-row__date">
                      {item.deletedAt ? item.deletedAt.slice(0, 10) : ''}
                    </span>
                    <button className="text-button" onClick={() => handleTodoRestore(item.id)}>
                      복원
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {dayDetail && (
        <Modal title={dayDetail.date} onClose={() => setDayDetail(null)}>
          <div className="recurring-list">
            {dayDetail.items.map((item) => (
              <div className="recurring-row" key={item.id}>
                <div className="recurring-row__info">
                  <span className="recurring-row__name">
                    <span className={`schedule-color-dot schedule-color-dot--${scheduleColorClass(item.id)}`} />
                    {item.title}
                  </span>
                  {item.memo && <span className="recurring-row__category">{item.memo}</span>}
                </div>
                <button
                  className="recurring-row__edit"
                  onClick={() => {
                    setEditingScheduleItem(item);
                    setDayDetail(null);
                  }}
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showScheduleForm && (
        <Modal title="일정 추가" onClose={() => setShowScheduleForm(false)}>
          <ScheduleItemForm
            initialValues={{ title: '', startDate: selectedDate, endDate: selectedDate, memo: null }}
            onSubmit={async (input, addToBoard) => {
              await handleScheduleCreate(input, addToBoard);
              setShowScheduleForm(false);
            }}
          />
        </Modal>
      )}

      {editingScheduleItem && (
        <Modal title="일정 수정" onClose={() => setEditingScheduleItem(null)}>
          <ScheduleItemForm
            submitLabel="수정하기"
            initialValues={{
              title: editingScheduleItem.title,
              startDate: editingScheduleItem.startDate,
              endDate: editingScheduleItem.endDate,
              memo: editingScheduleItem.memo,
            }}
            onSubmit={async (input, addToBoard) => {
              await handleScheduleUpdate(input, addToBoard);
              setEditingScheduleItem(null);
            }}
          />
        </Modal>
      )}

      {showTodoForm && (
        <Modal title="할 일 추가" onClose={() => setShowTodoForm(false)}>
          <TodoItemForm
            onSubmit={async (input) => {
              await handleTodoCreate(input);
              setShowTodoForm(false);
            }}
          />
        </Modal>
      )}

      {editingTodoItem && (
        <Modal title="할 일 수정" onClose={() => setEditingTodoItem(null)}>
          <TodoItemForm
            submitLabel="수정하기"
            initialValues={{ title: editingTodoItem.title, memo: editingTodoItem.memo }}
            onSubmit={async (input) => {
              await handleTodoUpdate(input);
              setEditingTodoItem(null);
            }}
          />
          <button
            className="text-button"
            onClick={async () => {
              await handleTodoArchive(editingTodoItem.id);
              setEditingTodoItem(null);
            }}
          >
            이 할 일 보관하기
          </button>
          <button
            className="text-button"
            onClick={async () => {
              const id = editingTodoItem.id;
              setEditingTodoItem(null);
              await handleTodoDelete(id);
            }}
          >
            이 할 일 삭제하기
          </button>
        </Modal>
      )}
    </div>
  );
}
