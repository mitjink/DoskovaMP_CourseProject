import React, { useState, useEffect } from 'react';
import { getCoaches, createCoach, updateCoach, deleteCoach } from '../api/coaches';
import { getPools } from '../api/pools';
import { useAuth } from '../context/AuthContext';

const CoachesPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCoach, setEditingCoach] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        poolId: '',
        workDays: []
    });
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coachesRes, poolsRes] = await Promise.all([
                getCoaches(),
                getPools()
            ]);
            setCoaches(coachesRes.data);
            setPools(poolsRes.data);
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleDayToggle = (day) => {
        setFormData(prev => {
            const days = prev.workDays.includes(day)
                ? prev.workDays.filter(d => d !== day)
                : [...prev.workDays, day];
            return { ...prev, workDays: days.sort((a, b) => a - b) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.workDays.length === 0) {
            setError('Выберите хотя бы один день работы');
            return;
        }
        try {
            if (editingCoach) {
                await updateCoach(editingCoach.id, formData);
            } else {
                await createCoach(formData);
            }
            setShowForm(false);
            setEditingCoach(null);
            setFormData({ fullName: '', poolId: '', workDays: [] });
            fetchData();
        } catch (err) {
            setError('Ошибка сохранения');
        }
    };

    const handleEdit = (coach) => {
        setEditingCoach(coach);
        setFormData({
            fullName: coach.full_name,
            poolId: coach.pool_id,
            workDays: coach.work_days || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить тренера?')) {
            try {
                await deleteCoach(id);
                fetchData();
            } catch (err) {
                setError('Ошибка удаления');
            }
        }
    };

    const getDayName = (day) => {
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        return days[day - 1];
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Тренеры</h1>
                {isAdmin && (
                    <button onClick={() => {
                        setEditingCoach(null);
                        setFormData({ fullName: '', poolId: '', workDays: [] });
                        setShowForm(true);
                    }}>
                        Добавить тренера
                    </button>
                )}
            </div>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
                    <h3>{editingCoach ? 'Редактировать' : 'Новый тренер'}</h3>
                    <div>
                        <label>ФИО</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
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
                        <label>Дни работы</label>
                        <div>
                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                <label key={day} style={{ marginRight: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.workDays.includes(day)}
                                        onChange={() => handleDayToggle(day)}
                                    />
                                    {getDayName(day)}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <button type="submit">Сохранить</button>
                        <button type="button" onClick={() => {
                            setShowForm(false);
                            setEditingCoach(null);
                        }}>Отмена</button>
                    </div>
                </form>
            )}

            <div>
                {coaches.map(coach => (
                    <div key={coach.id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                        <h3>{coach.full_name}</h3>
                        <p>Бассейн: {coach.pool_name}</p>
                        <p>Дни работы: {coach.work_days?.map(d => getDayName(d)).join(', ')}</p>
                        {isAdmin && (
                            <div>
                                <button onClick={() => handleEdit(coach)}>Редактировать</button>
                                <button onClick={() => handleDelete(coach.id)}>Удалить</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachesPage;