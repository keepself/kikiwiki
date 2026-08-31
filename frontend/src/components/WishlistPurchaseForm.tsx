import { useEffect, useState } from 'react';
import type { Category } from '../types/transaction';
import type { WishlistItem, WishlistPurchaseInput } from '../types/wishlist';
import { fetchCategories } from '../api/client';

interface Props {
  item: WishlistItem;
  onSubmit: (input: WishlistPurchaseInput) => Promise<void>;
}

export function WishlistPurchaseForm({ item, onSubmit }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(item.price != null ? String(item.price) : '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories('EXPENSE').then((list) => {
      setCategories(list);
      setCategoryId(list.length > 0 ? String(list[0].id) : '');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    if (!price) {
      alert('가격을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ categoryId: Number(categoryId), price: Number(price) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <p className="wishlist-purchase-form__item-name">{item.name}</p>

      <div className="form-field">
        <label>가격</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
      </div>

      <div className="form-field">
        <label>가계부 카테고리</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '처리 중...' : '구매완료 처리하기'}
      </button>
    </form>
  );
}
