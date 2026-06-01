import React, { useState, useEffect } from 'react';
import { getPasses, createPass, updatePass, deletePass, buySubscription } from '../api/subscriptions';
import { getGroups } from '../api/groups';
import { useAuth } from '../context/AuthContext';

const SubscriptionsPage = () => {
    const [passes, setPasses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedPass, setSelectedPass] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPass, setEditingPass] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        frequency: 1,
        price: ''
    });
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isClient = user?.role === 'client';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [passesRes, groupsRes] = await Promise.all([
                getPasses(),
                getGroups()
            ]);
            setPasses(passesRes.data);
            setGroups(groupsRes.data);
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPass) {
                await updatePass(editingPass.id, formData);
                setSuccess('Абонемент обновлён');
            } else {
                await createPass(formData);
                setSuccess('Абонемент создан');
            }
            setShowForm(false);
            setEditingPass(null);
            setFormData({ name: '', frequency: 1, price: '' });
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Ошибка сохранения');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleEdit = (pass) => {
        setEditingPass(pass);
        setFormData({
            name: pass.name,
            frequency: pass.frequency,
            price: pass.price
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить абонемент?')) {
            try {
                await deletePass(id);
                setSuccess('Абонемент удалён');
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Ошибка удаления');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleBuyClick = (pass) => {
        setSelectedPass(pass);
        setSelectedGroupId('');
        setShowBuyModal(true);
    };

    const handleBuySubmit = async (e) => {
        e.preventDefault();
        if (!selectedGroupId) {
            setError('Выберите группу');
            return;
        }
        try {
            await buySubscription(selectedPass.id, parseInt(selectedGroupId));
            setSuccess(`Абонемент "${selectedPass.name}" оформлен. Оплатите в клубе.`);
            setShowBuyModal(false);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            const msg = err.response?.data?.error || 'Ошибка покупки';
            setError(msg);
            setTimeout(() => setError(''), 5000);
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Абонементы</h1>
                {isAdmin && (
                    <button className="btn" onClick={() => {
                        setEditingPass(null);
                        setFormData({ name: '', frequency: 1, price: '' });
                        setShowForm(true);
                    }}>
                        Добавить абонемент
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="form-container">
                    <h3 className="form-title">{editingPass ? 'Редактировать' : 'Новый абонемент'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>Название</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Частота (раз в неделю)</label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                            >
                                <option value={1}>1 раз в неделю</option>
                                <option value={2}>2 раза в неделю</option>
                                <option value={3}>3 раза в неделю</option>
                                <option value={5}>5 раз в неделю</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Цена (руб.)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn">Сохранить</button>
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setShowForm(false);
                                setEditingPass(null);
                            }}>Отмена</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="subscriptions-grid">
                {passes.map(pass => (
                    <div key={pass.id} className="card">
                        <div className="card-content">
                            <h3 className="card-title">{pass.name}</h3>
                            <p className="card-text">{pass.frequency} раз в неделю</p>
                            <p className="card-text">{pass.price} руб.</p>
                            {isAdmin && (
                                <div className="card-buttons">
                                    <button className="btn btn-edit" onClick={() => handleEdit(pool)}>Редактировать</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(pool.id)}>Удалить</button>
                                </div>
                            )}
                            {isClient && (
                                <button className="btn" onClick={() => handleBuyClick(pass)}>Купить</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showBuyModal && selectedPass && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Покупка абонемента</h3>
                        <p>Абонемент: {selectedPass.name}</p>
                        <p>Цена: {selectedPass.price} руб.</p>
                        <form onSubmit={handleBuySubmit}>
                            <div className="form-row">
                                <label>Выберите группу</label>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Выберите группу --</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.number} - {group.category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn">Оформить</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBuyModal(false)}>Отмена</button>
                            </div>
                        </form>
                        <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
                            После оформления оплатите абонемент в спортивном клубе.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionsPage;