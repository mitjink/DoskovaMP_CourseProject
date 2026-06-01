import React, { useState, useEffect } from 'react';
import { getPools, createPool, updatePool, deletePool } from '../api/pools';
import { useAuth } from '../context/AuthContext';

const PoolsPage = () => {
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
            console.error('Ошибка загрузки бассейнов:', err);
            setError('Ошибка загрузки бассейнов');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingPool) {
                await updatePool(editingPool.id, formData);
                setSuccess('Бассейн обновлён');
            } else {
                await createPool(formData);
                setSuccess('Бассейн создан');
            }
            setShowForm(false);
            setEditingPool(null);
            setFormData({ name: '', address: '', type: 'sport' });
            fetchPools();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setError('Ошибка сохранения');
            setTimeout(() => setError(''), 3000);
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
                setSuccess('Бассейн удалён');
                fetchPools();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                console.error('Ошибка удаления:', err);
                setError('Ошибка удаления');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const getTypeName = (type) => {
        const types = {
            sport: 'Спортивный',
            wellness: 'Оздоровительный',
            combined: 'Комбинированный'
        };
        return types[type] || type;
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Бассейны</h1>
                {isAdmin && (
                    <button className="btn" onClick={() => {
                        setEditingPool(null);
                        setFormData({ name: '', address: '', type: 'sport' });
                        setShowForm(true);
                    }}>
                        Добавить бассейн
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="form-container">
                    <h3 className="form-title">{editingPool ? 'Редактировать бассейн' : 'Новый бассейн'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>Название *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Адрес *</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Тип *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="sport">Спортивный</option>
                                <option value="wellness">Оздоровительный</option>
                                <option value="combined">Комбинированный</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn">Сохранить</button>
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setShowForm(false);
                                setEditingPool(null);
                            }}>Отмена</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="pools-grid">
                {pools.map(p => (
                    <div key={p.id} className="card">
                        <div className="card-content">
                            <h3 className="card-title">{p.name}</h3>
                            <p className="card-text">Адрес: {p.address}</p>
                            <p className="card-text">Тип: {getTypeName(p.type)}</p>
                            {isAdmin && (
                                <div className="card-buttons">
                                    <button className="btn btn-edit" onClick={() => handleEdit(p)}>Редактировать</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(p.id)}>Удалить</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PoolsPage;