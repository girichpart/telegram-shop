const API_URL = 'http://localhost:1337/api';

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
}
