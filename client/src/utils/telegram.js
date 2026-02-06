export const normalizeContactPayload = (payload) => {
  if (!payload) return {};
  let data = payload;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof data.response === 'string') {
    try {
      data = { ...data, response: JSON.parse(data.response) };
    } catch {
      // ignore parse errors
    }
  }
  return data || {};
};

export const extractPhoneNumber = (payload) => {
  const data = normalizeContactPayload(payload);
  return (
    data.phone_number ||
    data.contact?.phone_number ||
    data.contact?.phone ||
    data.response?.phone_number ||
    data.response?.contact?.phone_number ||
    data.response?.contact?.phone ||
    data.phone
  );
};

export const isContactSuccess = (payload) => {
  const data = normalizeContactPayload(payload);
  if (!data.status) return true;
  return ['sent', 'ok', 'success'].includes(data.status);
};

export const getTelegramUser = () => {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
};
