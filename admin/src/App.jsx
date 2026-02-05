import { useEffect, useMemo, useState } from 'react';
import api from './api';
import './App.css';

const emptyForm = {
  name: '',
  price: '',
  description: '',
  category: '',
  stock: '',
  images: [],
  sizes: [],
  techSpecs: []
};

const emptySettings = {
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  heroVideoUrl: ''
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [activeTab, setActiveTab] = useState('products');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [settings, setSettings] = useState(emptySettings);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cdekStatus, setCdekStatus] = useState(null);
  const [botStatus, setBotStatus] = useState(null);
  const [botLoading, setBotLoading] = useState(false);
  const [botError, setBotError] = useState('');
  const [chatId, setChatId] = useState('');

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

  const buildClients = (ordersList) => {
    const map = new Map();
    ordersList.forEach(order => {
      const telegramId = order.telegram?.id || '';
      const phone = order.phone || '';
      const key = telegramId ? `tg:${telegramId}` : `phone:${phone}`;
      const name = [order.telegram?.firstName, order.telegram?.lastName].filter(Boolean).join(' ').trim();
      const existing = map.get(key) || {
        id: key,
        telegramId,
        telegramUsername: order.telegram?.username || '',
        phone,
        name: name || order.telegram?.username || 'Клиент',
        totalOrders: 0,
        totalAmount: 0,
        lastOrderAt: null
      };

      existing.totalOrders += 1;
      existing.totalAmount += Number(order.totalAmount || 0);
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      if (createdAt && (!existing.lastOrderAt || createdAt > existing.lastOrderAt)) {
        existing.lastOrderAt = createdAt;
      }

      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (!a.lastOrderAt) return 1;
      if (!b.lastOrderAt) return -1;
      return b.lastOrderAt - a.lastOrderAt;
    });
  };

  const fetchOrders = async () => {
    setClientsLoading(true);
    try {
      const res = await api.get('/api/orders');
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
      setClients(buildClients(list));
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const res = await api.get('/api/settings');
      setSettings({ ...emptySettings, ...(res.data || {}) });
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось загрузить настройки');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsError('');
    try {
      const res = await api.put('/api/settings', settings);
      setSettings({ ...emptySettings, ...(res.data || {}) });
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось сохранить настройки');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleVideoUpload = async (files) => {
    if (!files || files.length === 0) return;
    setVideoUploading(true);
    setSettingsError('');
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const res = await api.post('/api/uploads/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(prev => ({ ...prev, heroVideoUrl: res.data.url }));
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось загрузить видео');
    } finally {
      setVideoUploading(false);
    }
  };

  const fetchBotStatus = async () => {
    setBotLoading(true);
    setBotError('');
    try {
      const res = await api.get('/api/admin/telegram/status');
      setBotStatus(res.data);
      if (res.data?.lastChatId) {
        setChatId(String(res.data.lastChatId));
      }
    } catch (err) {
      console.error(err);
      setBotError('Не удалось получить статус бота');
    } finally {
      setBotLoading(false);
    }
  };

  const fetchChatId = async () => {
    setBotError('');
    try {
      const res = await api.get('/api/admin/telegram/last-chat');
      if (res.data?.chatId) {
        setChatId(String(res.data.chatId));
      }
    } catch (err) {
      console.error(err);
      setBotError(err.response?.data?.error || 'Не удалось получить chat_id');
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

  useEffect(() => {
    if (!token) return;
    api.get('/api/delivery/status')
      .then(res => setCdekStatus(res.data))
      .catch(() => setCdekStatus(null));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'clients') {
      fetchOrders();
    }
    if (activeTab === 'settings') {
      fetchSettings();
      fetchBotStatus();
    }
  }, [token, activeTab]);

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
      images: product.images || [],
      sizes: product.sizes || [],
      techSpecs: product.techSpecs || []
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
      images: form.images,
      sizes: form.sizes,
      techSpecs: form.techSpecs
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

  const handleAddSize = () => {
    setForm(prev => ({ ...prev, sizes: [...prev.sizes, { label: '', stock: 0 }] }));
  };

  const handleSizeChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, idx) =>
        idx === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const handleRemoveSize = (index) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddSpec = () => {
    setForm(prev => ({
      ...prev,
      techSpecs: [...prev.techSpecs, { label: '', value: '' }]
    }));
  };

  const handleSpecChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      techSpecs: prev.techSpecs.map((spec, idx) =>
        idx === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const handleRemoveSpec = (index) => {
    setForm(prev => ({
      ...prev,
      techSpecs: prev.techSpecs.filter((_, idx) => idx !== index)
    }));
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

  const botUsername = botStatus?.bot?.username || '';
  const botLink = botUsername ? `https://t.me/${botUsername}` : '';
  const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const heroPreviewUrl = settings.heroVideoUrl
    ? settings.heroVideoUrl.startsWith('http')
      ? settings.heroVideoUrl
      : `${apiBase}${settings.heroVideoUrl.startsWith('/') ? '' : '/'}${settings.heroVideoUrl}`
    : '';

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-eyebrow">Elements Admin</p>
          <h2 className="admin-subtitle">Control</h2>
        </div>
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Товары
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            Клиенты
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Настройки
          </button>
        </div>
        {activeTab === 'products' ? (
          <>
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
          </>
        ) : (
          <p className="admin-muted">Выберите раздел для редактирования данных.</p>
        )}
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">
              {activeTab === 'products' ? 'Product control' : activeTab === 'clients' ? 'Customer control' : 'Store settings'}
            </p>
            <h1 className="admin-title">
              {activeTab === 'products' ? 'Админка товаров' : activeTab === 'clients' ? 'Клиенты' : 'Настройки витрины'}
            </h1>
          </div>
          <div className="admin-actions">
            {activeTab === 'products' && selectedId && (
              <button onClick={handleDelete} className="admin-btn danger">Удалить</button>
            )}
            {activeTab === 'products' && (
              <button onClick={handleSave} className="admin-btn primary" disabled={saving}>
                {saving ? 'Сохраняю...' : 'Сохранить'}
              </button>
            )}
            {activeTab === 'settings' && (
              <button
                onClick={handleSettingsSave}
                className="admin-btn primary"
                disabled={settingsSaving || settingsLoading}
              >
                {settingsSaving ? 'Сохраняю...' : 'Сохранить настройки'}
              </button>
            )}
            <button onClick={handleLogout} className="admin-btn ghost">Выйти</button>
          </div>
        </header>

        {activeTab === 'products' && (
          <>
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
                <div>
                  <div className="admin-panel-head">
                    <h3>Размеры и остаток</h3>
                    <button type="button" className="admin-btn ghost" onClick={handleAddSize}>Добавить размер</button>
                  </div>
                  {form.sizes.length === 0 && (
                    <p className="admin-muted">Размеры не заданы. Можно использовать общий остаток.</p>
                  )}
                  {form.sizes.length > 0 && (
                    <div className="admin-grid">
                      {form.sizes.map((size, index) => (
                        <div key={`${size.label}-${index}`} className="admin-grid two">
                          <input
                            type="text"
                            placeholder="Размер (S, M, L)"
                            value={size.label}
                            onChange={e => handleSizeChange(index, 'label', e.target.value)}
                            className="admin-input"
                          />
                          <div className="admin-grid two">
                            <input
                              type="number"
                              placeholder="Остаток"
                              value={size.stock}
                              onChange={e => handleSizeChange(index, 'stock', Number(e.target.value))}
                              className="admin-input"
                            />
                            <button type="button" className="admin-btn danger" onClick={() => handleRemoveSize(index)}>
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="admin-panel-head">
                    <h3>Технические характеристики</h3>
                    <button type="button" className="admin-btn ghost" onClick={handleAddSpec}>Добавить характеристику</button>
                  </div>
                  {form.techSpecs.length === 0 && (
                    <p className="admin-muted">Пока нет характеристик.</p>
                  )}
                  {form.techSpecs.length > 0 && (
                    <div className="admin-grid">
                      {form.techSpecs.map((spec, index) => (
                        <div key={`${spec.label}-${index}`} className="admin-grid two">
                          <input
                            type="text"
                            placeholder="Заголовок"
                            value={spec.label}
                            onChange={e => handleSpecChange(index, 'label', e.target.value)}
                            className="admin-input"
                          />
                          <div className="admin-grid two">
                            <input
                              type="text"
                              placeholder="Значение"
                              value={spec.value}
                              onChange={e => handleSpecChange(index, 'value', e.target.value)}
                              className="admin-input"
                            />
                            <button type="button" className="admin-btn danger" onClick={() => handleRemoveSpec(index)}>
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          </>
        )}

        {activeTab === 'clients' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Клиенты</h2>
              <p className="admin-muted">{clients.length} клиентов</p>
            </div>
            {clientsLoading && <p className="admin-muted">Загрузка...</p>}
            {!clientsLoading && clients.length === 0 && (
              <p className="admin-muted">Пока нет клиентов.</p>
            )}
            <div className="admin-list">
              {clients.map(client => (
                <div key={client.id} className="admin-card">
                  <div>
                    <p className="admin-card-title">{client.name || 'Клиент'}</p>
                    <p className="admin-card-subtitle">{client.phone || 'Телефон не указан'}</p>
                    {client.telegramId && (
                      <p className="admin-card-subtitle">chat_id: {client.telegramId}</p>
                    )}
                  </div>
                  <div>
                    <p className="admin-card-price">{client.totalAmount.toLocaleString('ru-RU')} ₽</p>
                    <p className="admin-card-subtitle">{client.totalOrders} заказ(а)</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <>
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Главная страница</h2>
                <p className="admin-muted">Видео и текст</p>
              </div>
              {settingsLoading ? (
                <p className="admin-muted">Загрузка...</p>
              ) : (
                <div className="admin-grid">
                  <input
                    type="text"
                    placeholder="Заголовок"
                    value={settings.heroTitle}
                    onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="admin-input"
                  />
                  <input
                    type="text"
                    placeholder="Подзаголовок"
                    value={settings.heroSubtitle}
                    onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="admin-input"
                  />
                  <textarea
                    placeholder="Описание"
                    value={settings.heroDescription}
                    onChange={e => setSettings({ ...settings, heroDescription: e.target.value })}
                    className="admin-input textarea"
                  />
                  <div>
                    <p className="admin-muted">Видео</p>
                    <div className="admin-upload">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={e => handleVideoUpload(Array.from(e.target.files || []))}
                      />
                      {videoUploading && <span className="admin-muted">Загружаю...</span>}
                    </div>
                    <input
                      type="text"
                      placeholder="Ссылка на видео"
                      value={settings.heroVideoUrl}
                      onChange={e => setSettings({ ...settings, heroVideoUrl: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
              )}
              {heroPreviewUrl && (
                <div className="admin-video">
                  <video src={heroPreviewUrl} controls muted />
                </div>
              )}
              {settingsError && <p className="admin-error">{settingsError}</p>}
            </section>

            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Интеграции</h2>
                <p className="admin-muted">Статусы сервисов</p>
              </div>
              <div className="admin-grid two">
                <div className="admin-stat">
                  <p className="admin-stat-label">СДЭК</p>
                  <p className="admin-stat-value">{cdekStatus?.enabled ? 'ON' : 'OFF'}</p>
                </div>
                <div className="admin-stat">
                  <p className="admin-stat-label">Telegram бот</p>
                  <p className="admin-stat-value">{botStatus?.ok ? 'ON' : 'OFF'}</p>
                </div>
              </div>
              {cdekStatus && (
                <div className="admin-stat">
                  <p className="admin-stat-label">СДЭК API</p>
                  <p className="admin-stat-value">
                    auth {cdekStatus.hasAuth ? 'ok' : 'missing'} · calc {cdekStatus.hasCalc ? 'ok' : 'missing'} · pvz {cdekStatus.hasPvz ? 'ok' : 'missing'}
                  </p>
                </div>
              )}
              <div className="admin-panel-head">
                <h3>Telegram настройки</h3>
                <div className="admin-actions">
                  <button onClick={fetchBotStatus} className="admin-btn ghost" disabled={botLoading}>
                    {botLoading ? 'Проверяю...' : 'Проверить'}
                  </button>
                  <button onClick={fetchChatId} className="admin-btn ghost">Получить chat_id</button>
                  {botLink && (
                    <a href={botLink} target="_blank" rel="noreferrer" className="admin-btn ghost">Открыть бота</a>
                  )}
                </div>
              </div>
              <div className="admin-grid two">
                <div className="admin-stat">
                  <p className="admin-stat-label">Bot username</p>
                  <p className="admin-stat-value">{botUsername || '—'}</p>
                </div>
                <div className="admin-stat">
                  <p className="admin-stat-label">chat_id</p>
                  <p className="admin-stat-value">{chatId || '—'}</p>
                </div>
              </div>
              {botStatus?.hasUpdates === false && (
                <p className="admin-muted">Пока нет сообщений. Нажмите «Открыть бота» и отправьте /start.</p>
              )}
              {botError && <p className="admin-error">{botError}</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
