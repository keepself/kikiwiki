import { useEffect, useState } from 'react';
import type { Category, Transaction, TransactionInput, TransactionType } from '../types/transaction';
import { fetchCategories } from '../api/client';

interface Props {
  transactions: Transaction[];
  onUpdate: (id: number, input: TransactionInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TransactionList({ transactions, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  if (transactions.length === 0) {
    return <p>등록된 거래가 없습니다.</p>;
  }

  const handleDelete = async (id: number) => {
    if (confirm('이 거래를 삭제할까요?')) {
      await onDelete(id);
    }
  };

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '700px' }}>
      <thead>
        <tr>
          <th style={cellStyle}>날짜</th>
          <th style={cellStyle}>구분</th>
          <th style={cellStyle}>카테고리</th>
          <th style={cellStyle}>금액</th>
          <th style={cellStyle}>메모</th>
          <th style={cellStyle}></th>
        </tr>
      </thead>
      <tbody>
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
            <tr key={t.id}>
              <td style={cellStyle}>{t.transactionDate}</td>
              <td style={cellStyle}>{t.type === 'EXPENSE' ? '지출' : '수입'}</td>
              <td style={cellStyle}>{t.categoryName}</td>
              <td style={{ ...cellStyle, color: t.type === 'EXPENSE' ? 'crimson' : 'seagreen' }}>
                {t.type === 'EXPENSE' ? '-' : '+'}
                {t.amount.toLocaleString()}원
              </td>
              <td style={cellStyle}>{t.description}</td>
              <td style={cellStyle}>
                <button onClick={() => setEditingId(t.id)}>수정</button>
                <button onClick={() => handleDelete(t.id)}>삭제</button>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
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

  // 구분이 바뀔 때마다 카테고리 목록 갱신 (처음엔 기존 카테고리를 유지)
  useEffect(() => {
    fetchCategories(type).then((list) => {
      setCategories(list);
      // 현재 선택된 카테고리가 새 목록에 없으면 (구분을 바꾼 경우) 첫 번째로 초기화
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
    <tr>
      <td style={cellStyle}>
        <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
      </td>
      <td style={cellStyle}>
        <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="EXPENSE">지출</option>
          <option value="INCOME">수입</option>
        </select>
      </td>
      <td style={cellStyle}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td style={cellStyle}>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </td>
      <td style={cellStyle}>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </td>
      <td style={cellStyle}>
        <button onClick={handleSave}>저장</button>
        <button onClick={onCancel}>취소</button>
      </td>
    </tr>
  );
}

const cellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '0.5rem',
  textAlign: 'left',
};
