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
  techSpecs: [],
  isActive: true,
  statusTags: []
};

const emptySettings = {
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  heroVideoUrl: '',
  heroTextScale: 1,
  heroTextColor: '#ffffff',
  heroTextOpacity: 0.85,
  webAccessEnabled: true,
  deliveryCdekEnabled: true,
  deliveryYandexEnabled: false,
  paymentYookassaEnabled: true,
  paymentYookassaLabel: 'Оплатить через ЮKassa',
  paymentYookassaImageUrl: '',
  telegramAdminChatId: '',
  telegramAdminChatIds: []
};

const orderStatuses = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'shipped', label: 'Отгружен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'canceled', label: 'Отменен' }
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [activeTab, setActiveTab] = useState('products');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [orderSavingId, setOrderSavingId] = useState('');
  const [clientFilter, setClientFilter] = useState('');
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
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [syncResult, setSyncResult] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [adminChatInput, setAdminChatInput] = useState('');
  const [webLocking, setWebLocking] = useState(false);
  const [webLockMessage, setWebLockMessage] = useState('');

  const normalizeNumber = (value, fallback) => {
    if (value === '' || value === null || value === undefined) return fallback;
    const parsed = Number(String(value).replace(',', '.'));
    if (Number.isNaN(parsed)) return fallback;
    return parsed;
  };

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

  const fetchCustomers = async () => {
    setClientsLoading(true);
    try {
      const res = await api.get('/api/customers');
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map(item => ({
        id: item._id,
        telegramId: item.telegramId || '',
        telegramUsername: item.telegramUsername || '',
        phone: item.phone || '',
        name: [item.firstName, item.lastName].filter(Boolean).join(' ').trim() || item.telegramUsername || 'Клиент',
        totalOrders: item.totalOrders || 0,
        totalAmount: item.totalAmount || 0,
        lastOrderAt: item.lastSeenAt ? new Date(item.lastSeenAt) : null
      }));
      setClients(mapped);
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
      const next = { ...emptySettings, ...(res.data || {}) };
      const list = Array.isArray(next.telegramAdminChatIds) ? next.telegramAdminChatIds : [];
      if (next.telegramAdminChatId && !list.includes(next.telegramAdminChatId)) {
        list.push(next.telegramAdminChatId);
      }
      next.telegramAdminChatIds = list.filter(Boolean).map(String);
      setSettings(next);
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось загрузить настройки');
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await api.get('/api/orders');
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
    } catch (err) {
      console.error(err);
      setOrders([]);
      setOrdersError('Не удалось загрузить заказы');
    } finally {
      setOrdersLoading(false);
    }
  };

  const refundOrder = async (orderId) => {
    if (!orderId) return;
    setOrderSavingId(orderId);
    try {
      await api.post(`/api/orders/${orderId}/refund`);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      setOrdersError('Не удалось выполнить возврат');
    } finally {
      setOrderSavingId('');
    }
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsError('');
    try {
      const payload = {
        ...settings,
        heroTextScale: normalizeNumber(settings.heroTextScale, 1),
        heroTextOpacity: normalizeNumber(settings.heroTextOpacity, 0.85)
      };
      const res = await api.put('/api/settings', payload);
      setSettings({ ...emptySettings, ...(res.data || {}) });
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось сохранить настройки');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleWebLock = async () => {
    setWebLocking(true);
    setWebLockMessage('');
    try {
      const res = await api.put('/api/settings', { webAccessEnabled: false });
      setSettings(prev => ({ ...prev, ...(res.data || {}) }));
      setWebLockMessage('Web доступ выключен');
    } catch (err) {
      console.error(err);
      setWebLockMessage('Не удалось выключить web доступ');
    } finally {
      setWebLocking(false);
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
      let nextUrl = res.data.url;
      try {
        const parsed = new URL(nextUrl, apiBase);
        const base = new URL(apiBase);
        if (parsed.host === base.host) {
          nextUrl = parsed.pathname;
        }
      } catch (err) {
        // keep original
      }
      setSettings(prev => ({ ...prev, heroVideoUrl: nextUrl }));
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось загрузить видео');
    } finally {
      setVideoUploading(false);
    }
  };

  const handlePaymentImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    setSettingsError('');
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const res = await api.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      let nextUrl = res.data.url;
      try {
        const parsed = new URL(nextUrl, apiBase);
        const base = new URL(apiBase);
        if (parsed.host === base.host) {
          nextUrl = parsed.pathname;
        }
      } catch (err) {
        // keep original
      }
      setSettings(prev => ({ ...prev, paymentYookassaImageUrl: nextUrl }));
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось загрузить изображение кнопки');
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

  const syncContacts = async () => {
    setSyncingContacts(true);
    setSyncResult('');
    setBotError('');
    try {
      const res = await api.post('/api/admin/telegram/sync-contacts');
      const count = res.data?.count ?? 0;
      setSyncResult(`Импортировано контактов: ${count}`);
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setBotError('Не удалось синхронизировать контакты');
    } finally {
      setSyncingContacts(false);
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
      fetchCustomers();
    }
    if (activeTab === 'orders') {
      fetchOrders();
      fetchCustomers();
    }
    if (activeTab === 'settings') {
      fetchSettings();
      fetchBotStatus();
    }
    if (activeTab === 'delivery') {
      fetchSettings();
    }
    if (activeTab === 'integrations') {
      fetchSettings();
      fetchBotStatus();
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (!token || activeTab !== 'orders') return undefined;
    const interval = setInterval(() => {
      fetchOrders();
    }, 20000);
    return () => clearInterval(interval);
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

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (clientFilter) {
      const [kind, value] = clientFilter.split(':');
      result = result.filter(order => {
        if (kind === 'tg') {
          return String(order.telegram?.id || '') === value;
        }
        if (kind === 'phone') {
          return String(order.phone || '') === value;
        }
        return true;
      });
    }
    if (!orderQuery) return result;
    const needle = orderQuery.toLowerCase().trim();
    return result.filter(order => {
      const fields = [
        order._id,
        order.phone,
        order.status,
        order.paymentStatus,
        order.telegram?.id,
        order.telegram?.username
      ]
        .filter(Boolean)
        .map(value => String(value).toLowerCase());

      return fields.some(value => value.includes(needle));
    });
  }, [orders, orderQuery, clientFilter]);

  const handleSelect = (product) => {
    setSelectedId(product._id);
    setStatusInput('');
    setForm({
      name: product.name || '',
      price: product.price ?? '',
      description: product.description || '',
      category: product.category || '',
      stock: product.stock ?? '',
      images: product.images || [],
      sizes: product.sizes || [],
      techSpecs: product.techSpecs || [],
      isActive: product.isActive !== false,
      statusTags: product.statusTags || []
    });
  };

  const handleNew = () => {
    setSelectedId(null);
    setStatusInput('');
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
      techSpecs: form.techSpecs,
      isActive: form.isActive,
      statusTags: (form.statusTags || []).map(tag => String(tag || '').trim()).filter(Boolean)
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

  const handleAddStatusTag = () => {
    const nextTag = statusInput.trim();
    if (!nextTag) return;
    setForm(prev => ({
      ...prev,
      statusTags: Array.from(new Set([...(prev.statusTags || []), nextTag]))
    }));
    setStatusInput('');
  };

  const handleAddAdminChatId = (value) => {
    const nextId = String(value || '').trim();
    if (!nextId) return;
    setSettings(prev => ({
      ...prev,
      telegramAdminChatIds: Array.from(new Set([...(prev.telegramAdminChatIds || []), nextId]))
    }));
    setAdminChatInput('');
  };

  const handleRemoveAdminChatId = (value) => {
    setSettings(prev => ({
      ...prev,
      telegramAdminChatIds: (prev.telegramAdminChatIds || []).filter(item => item !== value)
    }));
  };

  const handleRemoveStatusTag = (tag) => {
    setForm(prev => ({
      ...prev,
      statusTags: (prev.statusTags || []).filter(item => item !== tag)
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
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Заказы
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
            className={`admin-tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            Доставка и оплата
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            Интеграции
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
              {activeTab === 'products'
                ? 'Product control'
                : activeTab === 'orders'
                  ? 'Order control'
                : activeTab === 'clients'
                    ? 'Customer control'
                    : activeTab === 'delivery'
                      ? 'Delivery & payment'
                      : activeTab === 'integrations'
                        ? 'Integration keys'
                      : 'Store settings'}
            </p>
            <h1 className="admin-title">
              {activeTab === 'products'
                ? 'Админка товаров'
                : activeTab === 'orders'
                  ? 'История заказов'
                  : activeTab === 'clients'
                    ? 'Клиенты'
                    : activeTab === 'delivery'
                      ? 'Доставка и оплата'
                      : activeTab === 'integrations'
                        ? 'Интеграции'
                      : 'Настройки витрины'}
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
            {(activeTab === 'settings' || activeTab === 'delivery' || activeTab === 'integrations') && (
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
            <div className="admin-grid two">
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Активный товар</span>
              </label>
              <div>
                <div className="admin-panel-head">
                  <h3>Статусы товара</h3>
                </div>
                <div className="admin-status-input">
                  <input
                    type="text"
                    placeholder="Например: new, limited"
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    className="admin-input"
                  />
                  <button type="button" className="admin-btn ghost" onClick={handleAddStatusTag}>
                    Добавить
                  </button>
                </div>
                <div className="admin-status-tags">
                  {(form.statusTags || []).length === 0 && (
                    <p className="admin-muted">Статусы не заданы.</p>
                  )}
                  {(form.statusTags || []).map(tag => (
                    <button
                      type="button"
                      key={tag}
                      className="admin-tag"
                      onClick={() => handleRemoveStatusTag(tag)}
                    >
                      {tag}
                      <span>×</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                    <p className="admin-card-subtitle">
                      {client.lastOrderAt ? `Активен: ${client.lastOrderAt.toLocaleDateString('ru-RU')}` : 'Нет активности'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>История заказов</h2>
              <p className="admin-muted">{filteredOrders.length} заказов</p>
            </div>
            <div className="admin-grid two">
              <input
                type="text"
                placeholder="Поиск: телефон, chat_id, статус"
                value={orderQuery}
                onChange={e => setOrderQuery(e.target.value)}
                className="admin-input"
              />
              <select
                className="admin-input"
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
              >
                <option value="">Все клиенты</option>
                {clients.map(client => {
                  const value = client.telegramId ? `tg:${client.telegramId}` : client.phone ? `phone:${client.phone}` : '';
                  if (!value) return null;
                  return (
                    <option key={client.id} value={value}>
                      {client.name || 'Клиент'} {client.phone ? `· ${client.phone}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            {ordersLoading && <p className="admin-muted">Загрузка...</p>}
            {ordersError && <p className="admin-error">{ordersError}</p>}
            {!ordersLoading && filteredOrders.length === 0 && (
              <p className="admin-muted">Заказов пока нет.</p>
            )}
            <div className="admin-list">
              {filteredOrders.map(order => (
                <div key={order._id} className="admin-card">
                  <div>
                    <p className="admin-card-title">Заказ #{order._id?.slice(-6)}</p>
                    <p className="admin-card-subtitle">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('ru-RU') : '—'}
                    </p>
                    <p className="admin-card-subtitle">Телефон: {order.phone || '—'}</p>
                    {order.telegram?.id && (
                      <p className="admin-card-subtitle">chat_id: {order.telegram.id}</p>
                    )}
                    <p className="admin-card-subtitle">Статус: {order.status}</p>
                    <p className="admin-card-subtitle">Оплата: {order.paymentStatus}</p>
                    <p className="admin-card-subtitle">Доставка: {order.delivery?.status || '—'}</p>
                    {order.products?.length > 0 && (
                      <p className="admin-card-subtitle">
                        Товары: {order.products.map(item => `${item.name} × ${item.quantity}${item.size ? ` (${item.size})` : ''}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="admin-card-price">{Number(order.totalAmount || 0).toLocaleString('ru-RU')} ₽</p>
                    <div className="admin-order-actions">
                      <div className="admin-muted">Статус: {order.status || 'new'}</div>
                      <button
                        type="button"
                        className="admin-btn danger"
                        onClick={() => refundOrder(order._id)}
                        disabled={orderSavingId === order._id || order.status === 'canceled'}
                      >
                        {orderSavingId === order._id ? 'Выполняю...' : 'Оформить возврат'}
                      </button>
                    </div>
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
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-btn primary"
                    onClick={handleSettingsSave}
                    disabled={settingsSaving || settingsLoading}
                  >
                    Сохранить настройки
                  </button>
                </div>
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
                  <div className="admin-grid two">
                    <label className="admin-field">
                      <span className="admin-muted">Размер текста (x)</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Например: 1.2"
                        value={settings.heroTextScale ?? ''}
                        onChange={e => setSettings({ ...settings, heroTextScale: e.target.value })}
                        className="admin-input"
                      />
                    </label>
                    <label className="admin-field">
                      <span className="admin-muted">Прозрачность (0–1)</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Например: 0.85"
                        value={settings.heroTextOpacity ?? ''}
                        onChange={e => setSettings({ ...settings, heroTextOpacity: e.target.value })}
                        className="admin-input"
                      />
                    </label>
                    <label className="admin-field">
                      <span className="admin-muted">Цвет текста</span>
                      <input
                        type="color"
                        value={settings.heroTextColor || '#ffffff'}
                        onChange={e => setSettings({ ...settings, heroTextColor: e.target.value })}
                      />
                    </label>
                    <div className="admin-grid">
                      <div className="admin-muted">
                        Статус: {settings.webAccessEnabled === false ? 'закрыт' : 'открыт'}
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn ghost"
                          onClick={async () => {
                            setWebLocking(true);
                            setWebLockMessage('');
                            try {
                              const res = await api.put('/api/settings', { webAccessEnabled: true });
                              setSettings(prev => ({ ...prev, ...(res.data || {}) }));
                              setWebLockMessage('Web доступ включен');
                            } catch (err) {
                              console.error(err);
                              setWebLockMessage('Не удалось включить web доступ');
                            } finally {
                              setWebLocking(false);
                            }
                          }}
                          disabled={webLocking}
                        >
                          Открыть web
                        </button>
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={handleWebLock}
                          disabled={webLocking}
                        >
                          {webLocking ? 'Закрываю...' : 'Жёстко закрыть web'}
                        </button>
                      </div>
                      {webLockMessage && <div className="admin-muted">{webLockMessage}</div>}
                    </div>
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

            
          </>
        )}

        {activeTab === 'delivery' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Доставка и оплата</h2>
              <p className="admin-muted">Управление способами</p>
            </div>
            <div className="admin-grid two">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(settings.deliveryCdekEnabled)}
                  onChange={e => setSettings({ ...settings, deliveryCdekEnabled: e.target.checked })}
                />
                <span>СДЭК ПВЗ</span>
              </label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(settings.deliveryYandexEnabled)}
                  onChange={e => setSettings({ ...settings, deliveryYandexEnabled: e.target.checked })}
                />
                <span>Яндекс доставка</span>
              </label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(settings.paymentYookassaEnabled)}
                  onChange={e => setSettings({ ...settings, paymentYookassaEnabled: e.target.checked })}
                />
                <span>ЮKassa</span>
              </label>
            </div>
            <div className="admin-grid">
              <input
                type="text"
                placeholder="Текст на кнопке ЮKassa"
                value={settings.paymentYookassaLabel || ''}
                onChange={e => setSettings({ ...settings, paymentYookassaLabel: e.target.value })}
                className="admin-input"
              />
              <div>
                <p className="admin-muted">Картинка на кнопке</p>
                <div className="admin-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handlePaymentImageUpload(Array.from(e.target.files || []))}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Ссылка на картинку"
                  value={settings.paymentYookassaImageUrl || ''}
                  onChange={e => setSettings({ ...settings, paymentYookassaImageUrl: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
            {settings.paymentYookassaImageUrl && (
              <div className="admin-thumb">
                <img src={settings.paymentYookassaImageUrl.startsWith('http') ? settings.paymentYookassaImageUrl : `${apiBase}${settings.paymentYookassaImageUrl}`} alt="YooKassa" />
              </div>
            )}
            <p className="admin-muted">Если выключить метод, кнопки и блоки будут скрыты на витрине.</p>
          </section>
        )}

        {activeTab === 'integrations' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Интеграции</h2>
              <p className="admin-muted">Ключи и уведомления</p>
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
                <button onClick={syncContacts} className="admin-btn ghost" disabled={syncingContacts}>
                  {syncingContacts ? 'Синхронизация...' : 'Синхронизировать контакты'}
                </button>
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
            <div className="admin-grid two">
              <div className="admin-status-input">
                <input
                  type="text"
                  placeholder="Telegram ID или @username"
                  value={adminChatInput}
                  onChange={e => setAdminChatInput(e.target.value)}
                  className="admin-input"
                />
                <button
                  type="button"
                  onClick={() => handleAddAdminChatId(adminChatInput)}
                  className="admin-btn ghost"
                >
                  Добавить
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (chatId) {
                    handleAddAdminChatId(chatId);
                  }
                }}
                className="admin-btn ghost"
              >
                Использовать найденный chat_id
              </button>
            </div>
            <div className="admin-status-tags">
              {(settings.telegramAdminChatIds || []).length === 0 && (
                <p className="admin-muted">Администраторы не добавлены.</p>
              )}
              {(settings.telegramAdminChatIds || []).map(id => (
                <button
                  key={id}
                  type="button"
                  className="admin-tag"
                  onClick={() => handleRemoveAdminChatId(id)}
                >
                  {id}
                  <span>×</span>
                </button>
              ))}
            </div>
            {botStatus?.hasUpdates === false && (
              <p className="admin-muted">Пока нет сообщений. Нажмите «Открыть бота» и отправьте /start.</p>
            )}
            <p className="admin-muted">
              Можно добавить числовой Telegram ID или @username. Для @username пользователь должен отправить /start боту.
            </p>
            {syncResult && <p className="admin-muted">{syncResult}</p>}
            {botError && <p className="admin-error">{botError}</p>}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
