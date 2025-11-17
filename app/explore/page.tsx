"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import 'bootstrap/dist/css/bootstrap.min.css';

type Product = {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  category: string;
  description: string;
};

export default function ExplorePage() {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const saveItem = async (item: Product) => {
    const quantity = quantities[item.id] || 1;
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: item.title,
          quantity,
          category: item.category,
          notes: item.description,
          unitCost: item.price * 15000,
          photo: item.thumbnail,
        }),
      });
      if (response.ok) {
        window.location.href = '/checklist';
      } else {
        console.error('Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-4 fw-bold">Explore Perlengkapan untuk Acara</h1>
      <p className="text-muted">
        Daftar barang eksternal yang bisa dijadikan referensi sebelum membuat list perlengkapan acara.
      </p>

      <div className="row g-4 mt-3">
        {products.map((item) => (
          <div className="col-md-4" key={item.id}>
            <div className="card h-100 shadow-sm">

              {/* Thumbnail */}
              <Image
                src={item.thumbnail}
                className="card-img-top"
                width={300}
                height={200}
                style={{ objectFit: "cover" }}
                alt={item.title}
              />

              <div className="card-body d-flex flex-column">

                <h5 className="card-title">{item.title}</h5>

                <p className="card-text text-muted small">
                  {item.description.substring(0, 80)}...
                </p>

                <div className="mt-auto">
                  <span className="badge bg-primary text-uppercase">
                    {item.category}
                  </span>

                  <h5 className="mt-2">Rp {item.price * 15000}</h5>

                  <div className="mt-3">
                    <div className="mb-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Jumlah"
                        value={quantities[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.id, Number(e.target.value) || 1)}
                        min="1"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <button className="btn btn-success w-100" onClick={() => saveItem(item)}>
                      Simpan ke List Perlengkapan
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
