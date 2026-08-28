import { useEffect, useState } from 'react';
import type { Category, Transaction, TransactionInput, TransactionType } from '../types/transaction';
import { fetchCategories } from '../api/client';

interface Props {
  transactions: Transaction[];
  hasMore: boolean;
  onLoadMore: () => void;
  onUpdate: (id: number, input: TransactionInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TransactionList({ transactions, hasMore, onLoadMore, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="transaction-list">
        <div className="empty-state">조건에 맞는 거래가 없어요.</div>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (confirm('이 거래를 삭제할까요?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="transaction-list">
      {transactions.map((t) =>
        editingId === t.id ? (
          <EditRow
            key={t.id}
            transaction={t}
            onSave={async (input) => {
              await onUpdate(t.id, input);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div className="transaction-row" key={t.id}>
            <span
              className={`transaction-row__category-badge transaction-row__category-badge--${t.type.toLowerCase()}`}
            >
              {t.categoryName}
            </span>

            <div className="transaction-row__info">
              {t.description && <div className="transaction-row__description">{t.description}</div>}
              <div className="transaction-row__date">{t.transactionDate}</div>
            </div>

            <div
              className={`transaction-row__amount tabular-nums ${
                t.type === 'EXPENSE' ? 'text-expense' : 'text-income'
              }`}
            >
              {t.type === 'EXPENSE' ? '-' : '+'}
              {t.amount.toLocaleString()}원
            </div>

            <div className="transaction-row__actions">
              <button className="text-button" onClick={() => setEditingId(t.id)}>
                수정
              </button>
              <button className="text-button" onClick={() => handleDelete(t.id)}>
                삭제
              </button>
            </div>
          </div>
        )
      )}

      {hasMore && (
        <button className="load-more-button" onClick={onLoadMore}>
          더보기
        </button>
      )}
    </div>
  );
}

interface EditRowProps {
  transaction: Transaction;
  onSave: (input: TransactionInput) => Promise<void>;
  onCancel: () => void;
}

function EditRow({ transaction, onSave, onCancel }: EditRowProps) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(String(transaction.categoryId));
  const [description, setDescription] = useState(transaction.description ?? '');
  const [transactionDate, setTransactionDate] = useState(transaction.transactionDate);

  useEffect(() => {
    fetchCategories(type).then((list) => {
      setCategories(list);
      if (!list.some((c) => c.id === Number(categoryId))) {
        setCategoryId(list.length > 0 ? String(list[0].id) : '');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleSave = () => {
    onSave({
      amount: Number(amount),
      type,
      categoryId: Number(categoryId),
      description,
      transactionDate,
    });
  };

  return (
    <div className="edit-row">
      <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
      <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <option value="EXPENSE">지출</option>
        <option value="INCOME">수입</option>
      </select>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '90px' }} />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="메모" />
      <button className="text-button" onClick={handleSave}>
        저장
      </button>
      <button className="text-button" onClick={onCancel}>
        취소
      </button>
    </div>
  );
}
