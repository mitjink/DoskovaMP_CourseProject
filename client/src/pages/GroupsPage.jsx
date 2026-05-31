import React, { useState, useEffect } from 'react';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api/groups';
import { getPools } from '../api/pools';
import { getPasses } from '../api/subscriptions';
import { useAuth } from '../context/AuthContext';

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [pools, setPools] = useState([]);
    const [passes, setPasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({
        number: '',
        category: 'beginners',
        poolId: '',
        subscriptionId: ''
    });
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [groupsRes, poolsRes, passesRes] = await Promise.all([
                getGroups(),
                getPools(),
                getPasses()
            ]);
            setGroups(groupsRes.data);
            setPools(poolsRes.data);
            setPasses(passesRes.data);
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, formData);
            } else {
                await createGroup(formData);
            }
            setShowForm(false);
            setEditingGroup(null);
            setFormData({ number: '', category: 'beginners', poolId: '', subscriptionId: '' });
            fetchData();
        } catch (err) {
            setError('Ошибка сохранения');
        }
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setFormData({
            number: group.number,
            category: group.category,
            poolId: group.pool_id,
            subscriptionId: group.subscription_id
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить группу?')) {
            try {
                await deleteGroup(id);
                fetchData();
            } catch (err) {
                setError('Ошибка удаления');
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
                <h1>Группы</h1>
                {isAdmin && (
                    <button onClick={() => {
                        setEditingGroup(null);
                        setFormData({ number: '', category: 'beginners', poolId: '', subscriptionId: '' });
                        setShowForm(true);
                    }}>
                        Добавить группу
                    </button>
                )}
            </div>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
                    <h3>{editingGroup ? 'Редактировать' : 'Новая группа'}</h3>
                    <div>
                        <label>Номер группы</label>
                        <input
                            type="text"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Категория</label>
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
                    <div>
                        <label>Бассейн</label>
                        <select
                            value={formData.poolId}
                            onChange={(e) => setFormData({ ...formData, poolId: parseInt(e.target.value) })}
                            required
                        >
                            <option value="">Выберите бассейн</option>
                            {pools.map(pool => (
                                <option key={pool.id} value={pool.id}>{pool.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Абонемент</label>
                        <select
                            value={formData.subscriptionId}
                            onChange={(e) => setFormData({ ...formData, subscriptionId: parseInt(e.target.value) })}
                            required
                        >
                            <option value="">Выберите абонемент</option>
                            {passes.map(pass => (
                                <option key={pass.id} value={pass.id}>{pass.name} - {pass.price} руб.</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button type="submit">Сохранить</button>
                        <button type="button" onClick={() => {
                            setShowForm(false);
                            setEditingGroup(null);
                        }}>Отмена</button>
                    </div>
                </form>
            )}

            <div>
                {groups.map(group => (
                    <div key={group.id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                        <h3>{group.number}</h3>
                        <p>Категория: {getCategoryName(group.category)}</p>
                        <p>Бассейн: {group.pool_name}</p>
                        <p>Абонемент: {group.subscription_name}</p>
                        {isAdmin && (
                            <div>
                                <button onClick={() => handleEdit(group)}>Редактировать</button>
                                <button onClick={() => handleDelete(group.id)}>Удалить</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupsPage;