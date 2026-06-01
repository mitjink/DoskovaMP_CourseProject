import React, { useState, useEffect } from 'react';
import { getCoaches, createCoach, updateCoach, deleteCoach } from '../api/coaches';
import { getPools } from '../api/pools';
import { useAuth } from '../context/AuthContext';

const CoachesPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
                setSuccess('Тренер обновлён');
            } else {
                await createCoach(formData);
                setSuccess('Тренер создан');
            }
            setShowForm(false);
            setEditingCoach(null);
            setFormData({ fullName: '', poolId: '', workDays: [] });
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Ошибка сохранения');
            setTimeout(() => setError(''), 3000);
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
                setSuccess('Тренер удалён');
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Ошибка удаления');
                setTimeout(() => setError(''), 3000);
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
                <h1 className="page-title">Тренеры</h1>
                {isAdmin && (
                    <button className="btn" onClick={() => {
                        setEditingCoach(null);
                        setFormData({ fullName: '', poolId: '', workDays: [] });
                        setShowForm(true);
                    }}>
                        Добавить тренера
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="form-container">
                    <h3 className="form-title">{editingCoach ? 'Редактировать' : 'Новый тренер'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>ФИО</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
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
                        <div className="form-row">
                            <label>Дни работы</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                        <div className="form-actions">
                            <button type="submit" className="btn">Сохранить</button>
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setShowForm(false);
                                setEditingCoach(null);
                            }}>Отмена</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="coaches-grid">
                {coaches.map(coach => (
                    <div key={coach.id} className="card">
                        <div className="card-content">
                            <h3 className="card-title">{coach.full_name}</h3>
                            <p className="card-text">Бассейн: {coach.pool_name}</p>
                            <p className="card-text">Дни работы: {coach.work_days?.map(d => getDayName(d)).join(', ')}</p>
                            {isAdmin && (
                                <div className="card-buttons">
                                    <button className="btn btn-edit" onClick={() => handleEdit(coach)}>Редактировать</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(coach.id)}>Удалить</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachesPage;