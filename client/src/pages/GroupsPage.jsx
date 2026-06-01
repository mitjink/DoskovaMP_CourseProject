import React, { useState, useEffect } from 'react';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api/groups';
import { getPools } from '../api/pools';
import { getPasses } from '../api/subscriptions';
import { getCoaches } from '../api/coaches';
import { useAuth } from '../context/AuthContext';

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [pools, setPools] = useState([]);
    const [passes, setPasses] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({
        number: '',
        category: 'beginners',
        poolId: '',
        subscriptionId: '',
        coachId: ''
    });
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [groupsRes, poolsRes, passesRes, coachesRes] = await Promise.all([
                getGroups(),
                getPools(),
                getPasses(),
                getCoaches()
            ]);
            setGroups(groupsRes.data);
            setPools(poolsRes.data);
            setPasses(passesRes.data);
            setCoaches(coachesRes.data);
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.poolId || !formData.subscriptionId) {
            setError('Заполните все обязательные поля');
            return;
        }
        
        try {
            const dataToSend = {
                number: formData.number,
                category: formData.category,
                poolId: parseInt(formData.poolId),
                subscriptionId: parseInt(formData.subscriptionId),
                coachId: formData.coachId ? parseInt(formData.coachId) : null
            };
            
            if (editingGroup) {
                await updateGroup(editingGroup.id, dataToSend);
                setSuccess('Группа обновлена');
            } else {
                await createGroup(dataToSend);
                setSuccess('Группа создана');
            }
            setShowForm(false);
            setEditingGroup(null);
            setFormData({ number: '', category: 'beginners', poolId: '', subscriptionId: '', coachId: '' });
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setError('Ошибка сохранения');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setFormData({
            number: group.number,
            category: group.category,
            poolId: group.pool_id,
            subscriptionId: group.subscription_id,
            coachId: group.coach_id || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить группу?')) {
            try {
                await deleteGroup(id);
                setSuccess('Группа удалена');
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                console.error('Ошибка удаления:', err);
                setError('Ошибка удаления');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const getCategoryName = (category) => {
        const categories = {
            beginners: 'Начинающие',
            teens: 'Подростки',
            adults: 'Взрослые',
            athletes: 'Спортсмены'
        };
        return categories[category] || category;
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Группы</h1>
                {isAdmin && (
                    <button className="btn" onClick={() => {
                        setEditingGroup(null);
                        setFormData({ number: '', category: 'beginners', poolId: '', subscriptionId: '', coachId: '' });
                        setShowForm(true);
                    }}>
                        Добавить группу
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="form-container">
                    <h3 className="form-title">{editingGroup ? 'Редактировать группу' : 'Новая группа'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>Номер группы *</label>
                            <input
                                type="text"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Категория *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="beginners">Начинающие</option>
                                <option value="teens">Подростки</option>
                                <option value="adults">Взрослые</option>
                                <option value="athletes">Спортсмены</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Бассейн *</label>
                            <select
                                value={formData.poolId}
                                onChange={(e) => setFormData({ ...formData, poolId: e.target.value })}
                                required
                            >
                                <option value="">Выберите бассейн</option>
                                {pools.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Абонемент *</label>
                            <select
                                value={formData.subscriptionId}
                                onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
                                required
                            >
                                <option value="">Выберите абонемент</option>
                                {passes.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - {p.price} руб.</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Тренер</label>
                            <select
                                value={formData.coachId}
                                onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                            >
                                <option value="">-- Не выбран --</option>
                                {coaches.map(c => (
                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn">Сохранить</button>
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setShowForm(false);
                                setEditingGroup(null);
                            }}>Отмена</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="groups-grid">
                {groups.map(group => (
                    <div key={group.id} className="card">
                        <div className="card-content">
                            <h3 className="card-title">{group.number}</h3>
                            <p className="card-text">Категория: {getCategoryName(group.category)}</p>
                            <p className="card-text">Бассейн: {group.pool_name}</p>
                            <p className="card-text">Абонемент: {group.subscription_name}</p>
                            <p className="card-text">Тренер: {group.coach_name || 'Не назначен'}</p>
                            {isAdmin && (
                                <div className="card-buttons">
                                    <button className="btn btn-edit" onClick={() => handleEdit(group)}>Редактировать</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(group.id)}>Удалить</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupsPage;