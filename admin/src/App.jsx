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

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-admin">
        <div className="mx-auto max-w-md px-6 py-24">
          <div className="panel">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">.solutions</p>
            <h1 className="text-2xl font-semibold mt-2">Вход в админку</h1>
            <div className="mt-6 grid gap-3">
              <input
                type="text"
                placeholder="Логин"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="input"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
              />
            </div>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            <button onClick={handleLogin} className="btn mt-6 w-full">Войти</button>
            <p className="mt-4 text-xs text-black/50">Данные берутся из server/.env (ADMIN_LOGIN, ADMIN_PASSWORD).</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">.solutions</p>
            <h1 className="text-2xl font-semibold">Админка товара</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleNew} className="btn-outline">Новый товар</button>
            <button onClick={handleSeed} className="btn-outline">Добавить тестовый</button>
            <button onClick={handleSave} className="btn" disabled={saving}>
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </button>
            <button onClick={handleLogout} className="btn-outline">Выйти</button>
          </div>
        </header>

        <div className="mt-8 grid lg:grid-cols-[1.1fr_1.4fr] gap-6">
          <aside className="panel">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Товары</h2>
              <span className="tag">{products.length}</span>
            </div>
            <input
              type="text"
              placeholder="Поиск по названию"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input mt-4"
            />

            <div className="mt-4 space-y-3 max-h-[540px] overflow-auto">
              {loading && <p className="text-sm text-black/50">Загрузка...</p>}
              {!loading && filtered.length === 0 && (
                <p className="text-sm text-black/50">Нет товаров</p>
              )}
              {filtered.map(product => (
                <button
                  key={product._id}
                  onClick={() => handleSelect(product)}
                  className={selectedId === product._id ? 'card card-active' : 'card'}
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-black/50">{product.category || 'Без категории'}</p>
                  </div>
                  <p className="text-sm">{product.price} ₽</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="panel">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Карточка товара</h2>
              {selectedId && <button onClick={handleDelete} className="btn-danger">Удалить</button>}
            </div>

            <div className="mt-4 grid gap-4">
              <input
                type="text"
                placeholder="Название"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Цена"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Остаток"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="input"
                />
              </div>
              <input
                type="text"
                placeholder="Категория"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Описание"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input min-h-[120px]"
              />
              <div>
                <label className="text-sm font-medium">Изображения</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleUpload(Array.from(e.target.files || []))}
                  />
                  {uploading && <span className="text-xs text-black/50">Загружаю...</span>}
                </div>
              </div>
            </div>

            {form.images.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-black/50">Превью</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.images.map(url => (
                    <div key={url} className="relative h-28 rounded-2xl overflow-hidden border border-black/10 bg-black/5">
                      <img src={url} alt="preview" className="h-full w-full object-cover" />
                      <button
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-2 right-2 rounded-full bg-white/80 px-2 py-1 text-xs"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
