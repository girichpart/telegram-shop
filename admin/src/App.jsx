import { useEffect, useMemo, useState } from 'react';
import api from './api';
import './App.css';

const emptyForm = {
  name: '',
  price: '',
  description: '',
  category: '',
  stock: '',
  images: []
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get('/api/admin/me')
      .catch(() => handleLogout());
  }, [token]);

  const filtered = useMemo(() => {
    if (!query) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    return { totalProducts, totalStock, totalValue };
  }, [products]);

  const handleSelect = (product) => {
    setSelectedId(product._id);
    setForm({
      name: product.name || '',
      price: product.price ?? '',
      description: product.description || '',
      category: product.category || '',
      stock: product.stock ?? '',
      images: product.images || []
    });
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError('Название и цена обязательны');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description,
      category: form.category,
      stock: Number(form.stock) || 0,
      images: form.images
    };

    try {
      if (selectedId) {
        await api.put(`/api/products/${selectedId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      await fetchProducts();
      handleNew();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/api/products/${selectedId}`);
      await fetchProducts();
      handleNew();
    } catch (err) {
      console.error(err);
      setError('Не удалось удалить товар');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/api/products/seed');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Не удалось добавить тестовый товар');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/api/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setForm(prev => ({ ...prev, images: [...prev.images, res.data.url] }));
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить изображение');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (url) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));
  };

  const handleLogin = async () => {
    if (!login || !password) {
      setError('Введите логин и пароль');
      return;
    }
    setError('');
    try {
      const res = await api.post('/api/admin/login', { login, password });
      localStorage.setItem('admin_token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      console.error(err);
      setError('Неверные данные для входа');
    }
  };

  if (!token) {
    return (
      <div className="admin-auth">
        <div className="admin-auth-card">
          <p className="admin-eyebrow">Elements Admin</p>
          <h1 className="admin-title">Вход в админку</h1>
          <div className="admin-form-grid">
            <input
              type="text"
              placeholder="Логин"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="admin-input"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="admin-input"
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button onClick={handleLogin} className="admin-btn primary">Войти</button>
          <p className="admin-hint">Данные берутся из `server/.env` (ADMIN_LOGIN, ADMIN_PASSWORD).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-eyebrow">Elements Admin</p>
          <h2 className="admin-subtitle">Catalog</h2>
        </div>
        <button onClick={handleNew} className="admin-btn ghost">Новый товар</button>
        <button onClick={handleSeed} className="admin-btn ghost">Добавить тестовый</button>
        <input
          type="text"
          placeholder="Поиск по названию"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="admin-input"
        />
        <div className="admin-list">
          {loading && <p className="admin-muted">Загрузка...</p>}
          {!loading && filtered.length === 0 && <p className="admin-muted">Нет товаров</p>}
          {filtered.map(product => (
            <button
              key={product._id}
              onClick={() => handleSelect(product)}
              className={selectedId === product._id ? 'admin-card active' : 'admin-card'}
            >
              <div>
                <p className="admin-card-title">{product.name}</p>
                <p className="admin-card-subtitle">{product.category || 'Без категории'}</p>
              </div>
              <p className="admin-card-price">{product.price} ₽</p>
            </button>
          ))}
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Product control</p>
            <h1 className="admin-title">Админка товаров</h1>
          </div>
          <div className="admin-actions">
            {selectedId && <button onClick={handleDelete} className="admin-btn danger">Удалить</button>}
            <button onClick={handleSave} className="admin-btn primary" disabled={saving}>
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </button>
            <button onClick={handleLogout} className="admin-btn ghost">Выйти</button>
          </div>
        </header>

        <section className="admin-stats">
          <div className="admin-stat">
            <p className="admin-stat-label">Всего товаров</p>
            <p className="admin-stat-value">{stats.totalProducts}</p>
          </div>
          <div className="admin-stat">
            <p className="admin-stat-label">Суммарный остаток</p>
            <p className="admin-stat-value">{stats.totalStock}</p>
          </div>
          <div className="admin-stat">
            <p className="admin-stat-label">Потенциальная выручка</p>
            <p className="admin-stat-value">{stats.totalValue.toLocaleString('ru-RU')} ₽</p>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Карточка товара</h2>
            <p className="admin-muted">{selectedId ? `ID: ${selectedId}` : 'Новый товар'}</p>
          </div>
          <div className="admin-grid">
            <input
              type="text"
              placeholder="Название"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="admin-input"
            />
            <div className="admin-grid two">
              <input
                type="number"
                placeholder="Цена"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="admin-input"
              />
              <input
                type="number"
                placeholder="Остаток"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="admin-input"
              />
            </div>
            <input
              type="text"
              placeholder="Категория"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="admin-input"
            />
            <textarea
              placeholder="Описание"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="admin-input textarea"
            />
            <div>
              <p className="admin-muted">Изображения</p>
              <div className="admin-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleUpload(Array.from(e.target.files || []))}
                />
                {uploading && <span className="admin-muted">Загружаю...</span>}
              </div>
            </div>
          </div>

          {form.images.length > 0 && (
            <div className="admin-images">
              {form.images.map(url => (
                <div key={url} className="admin-image">
                  <img src={url} alt="preview" />
                  <button onClick={() => handleRemoveImage(url)} type="button">Удалить</button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="admin-error">{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default App;
