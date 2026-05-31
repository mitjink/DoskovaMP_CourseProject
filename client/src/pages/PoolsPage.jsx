import React, { useState, useEffect } from 'react';
import { getPools, createPool, updatePool, deletePool } from '../api/pools';
import { useAuth } from '../context/AuthContext';

const PoolsPage = () => {
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPool, setEditingPool] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        type: 'sport'
    });
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchPools();
    }, []);

    const fetchPools = async () => {
        try {
            const response = await getPools();
            setPools(response.data);
        } catch (err) {
            setError('Ошибка загрузки бассейнов');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPool) {
                await updatePool(editingPool.id, formData);
            } else {
                await createPool(formData);
            }
            setShowForm(false);
            setEditingPool(null);
            setFormData({ name: '', address: '', type: 'sport' });
            fetchPools();
        } catch (err) {
            setError('Ошибка сохранения');
        }
    };

    const handleEdit = (pool) => {
        setEditingPool(pool);
        setFormData({
            name: pool.name,
            address: pool.address,
            type: pool.type
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить бассейн?')) {
            try {
                await deletePool(id);
                fetchPools();
            } catch (err) {
                setError('Ошибка удаления');
            }
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Бассейны</h1>
                {isAdmin && (
                    <button onClick={() => {
                        setEditingPool(null);
                        setFormData({ name: '', address: '', type: 'sport' });
                        setShowForm(true);
                    }}>
                        Добавить бассейн
                    </button>
                )}
            </div>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
                    <h3>{editingPool ? 'Редактировать' : 'Новый бассейн'}</h3>
                    <div>
                        <label>Название</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Адрес</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Тип</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="sport">Спортивный</option>
                            <option value="wellness">Оздоровительный</option>
                            <option value="combined">Комбинированный</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit">Сохранить</button>
                        <button type="button" onClick={() => {
                            setShowForm(false);
                            setEditingPool(null);
                        }}>Отмена</button>
                    </div>
                </form>
            )}

            <div>
                {pools.map(pool => (
                    <div key={pool.id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                        <h3>{pool.name}</h3>
                        <p>Адрес: {pool.address}</p>
                        <p>Тип: {pool.type === 'sport' ? 'Спортивный' : pool.type === 'wellness' ? 'Оздоровительный' : 'Комбинированный'}</p>
                        {isAdmin && (
                            <div>
                                <button onClick={() => handleEdit(pool)}>Редактировать</button>
                                <button onClick={() => handleDelete(pool.id)}>Удалить</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PoolsPage;