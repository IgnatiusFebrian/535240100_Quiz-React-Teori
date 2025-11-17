"use client";

import { useState, useEffect } from "react";

type Item = {
  id: string;
  label: string;
  quantity: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  notes: string;
  unitCost: number;
  dueDate?: string;
  photo?: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function ChecklistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState("");
  const [unitCost, setUnitCost] = useState<number>(0);
  const [dueDate, setDueDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'pending'>('all');

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async () => {
    if (!text.trim()) return;
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: text.trim(),
          quantity,
          category: category || null,
          priority,
          notes: notes || null,
          unitCost,
          dueDate: dueDate || null,
          photo: null,
          done: false,
        }),
      });
      if (response.ok) {
        fetchItems();
        setText("");
        setQuantity(1);
        setCategory("");
        setPriority('medium');
        setNotes("");
        setUnitCost(0);
        setDueDate("");
      } else {
        console.error('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const toggleItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          done: !item.done,
        }),
      });
      if (response.ok) {
        fetchItems();
      } else {
        console.error('Failed to toggle item');
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const item = items.find(item => item.id === id);
    if (!item) return;
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...item, ...updates }),
      });
      if (response.ok) {
        fetchItems(); 
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchItems();
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'done' && item.done) ||
                         (filterStatus === 'pending' && !item.done);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCost = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const completedCost = items.filter(item => item.done).reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);

  return (
    <div>
      <h2 className="mb-3">Checklist Perlengkapan Acara</h2>

      {/* Progress Tracking */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>Progress: {items.filter(item => item.done).length}/{items.length} items completed</span>
          <span className="badge bg-primary">
            {items.length > 0 ? Math.round((items.filter(item => item.done).length / items.length) * 100) : 0}%
          </span>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${items.length > 0 ? (items.filter(item => item.done).length / items.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {[...new Set(items.map(item => item.category).filter(Boolean))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'done' | 'pending')}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Belum Selesai</option>
            <option value="done">Selesai</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-outline-secondary w-100" onClick={() => {
            setSearchTerm("");
            setFilterCategory("");
            setFilterStatus('all');
          }}>
            Reset
          </button>
        </div>
      </div>

      {/* Form Input */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Tambah Barang Baru</h5>
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Nama barang (contoh: Kursi)"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <small className="text-muted">Masukkan nama barang</small>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Jumlah"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                min="1"
              />
              <small className="text-muted">Masukkan jumlah barang</small>
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Kategori (contoh: Furniture)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <small className="text-muted">Masukkan kategori</small>
            </div>
          </div>
          <div className="row g-2 mt-2">
            <div className="col-md-3">
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              >
                <option value="low">Prioritas Rendah</option>
                <option value="medium">Prioritas Sedang</option>
                <option value="high">Prioritas Tinggi</option>
              </select>
              <small className="text-muted">Masukkan prioritas barang</small>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Biaya per unit (Rp)"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
                min="0"
              />
              <small className="text-muted">Masukkan harga per unit</small>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                placeholder="Tanggal jatuh tempo"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <small className="text-muted">Masukkan tanggal masuk</small>
            </div>
            <div className="col-md-3">
              <button className="btn btn-success w-100" onClick={addItem}>
                Tambah
              </button>
            </div>
          </div>
          <div className="row g-2 mt-2">
            <div className="col-12">
              <textarea
                className="form-control"
                placeholder="Catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Biaya</h5>
              <p className="card-text fs-4 text-primary">Rp {totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Biaya Selesai</h5>
              <p className="card-text fs-4 text-success">Rp {completedCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Sisa Biaya</h5>
              <p className="card-text fs-4 text-warning">Rp {(totalCost - completedCost).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="mb-3">
        <h5>Daftar Barang ({filteredItems.length} dari {items.length})</h5>
      </div>
      <ul className="list-group">
        {filteredItems.map(item => (
          <li
            key={item.id}
            className={`list-group-item ${item.done ? 'list-group-item-success' : ''}`}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-start">
                <input
                  type="checkbox"
                  className="form-check-input me-3 mt-1"
                  checked={item.done}
                  onChange={() => toggleItem(item.id)}
                />

                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <span
                      className={`fw-bold ${item.done ? 'text-decoration-line-through text-muted' : ''}`}
                    >
                      {item.label}
                    </span>
                    <span className={`badge ms-2 ${
                      item.priority === 'high' ? 'bg-danger' :
                      item.priority === 'medium' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {item.priority === 'high' ? 'Tinggi' :
                       item.priority === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                    {item.dueDate && new Date(item.dueDate) < new Date() && !item.done && (
                      <span className="badge bg-danger ms-1">Terlambat</span>
                    )}
                  </div>

                  <div className="row g-2 text-muted small">
                    <div className="col-md-3">
                      <i className="bi bi-hash"></i> Jumlah: {item.quantity}
                      <button
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={() => {
                          const newQuantity = item.quantity - 1;
                          if (newQuantity > 0) {
                            updateItem(item.id, { quantity: newQuantity });
                          } else {
                            deleteItem(item.id);
                          }
                        }}
                      >
                        -
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary ms-1"
                        onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                      >
                        +
                      </button>
                    </div>
                    <div className="col-md-3">
                      <i className="bi bi-tag"></i> {item.category || "Tidak ada kategori"}
                    </div>
                    <div className="col-md-3">
                      <i className="bi bi-cash"></i> Rp {(item.unitCost * item.quantity).toLocaleString()}
                    </div>
                    {item.dueDate && (
                      <div className="col-md-3">
                        <i className="bi bi-calendar"></i> {new Date(item.dueDate).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="bi bi-sticky"></i> {item.notes}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteItem(item.id)}
              >
                <i className="bi bi-trash"></i> Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">Tidak ada barang yang sesuai dengan filter pencarian.</p>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center mt-5">
          <p className="text-muted">Belum ada barang yang ditambahkan. Mulai dengan menambah barang baru!</p>
        </div>
      )}
    </div>
  );
}
