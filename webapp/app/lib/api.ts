export const getProducts = async () => {
  const res = await fetch('http://localhost:1337/api/products?populate=images');
  return res.json();
};

export const createProduct = async (product: any) => {
  const res = await fetch('http://localhost:1337/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: product }),
  });
  return res.json();
};

export const updateProduct = async (id: number, product: any) => {
  const res = await fetch(`http://localhost:1337/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: product }),
  });
  return res.json();
};

export const deleteProduct = async (id: number) => {
  const res = await fetch(`http://localhost:1337/api/products/${id}`, { method: 'DELETE' });
  return res.json();
};


