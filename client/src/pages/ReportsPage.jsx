import React, { useState, useEffect } from 'react';
import {
    getCoachesByPoolReport,
    getProfitByCoachReport,
    getCoachesWithBeginnersReport,
    getVisitorsByCoachReport,
    getGroupsByDayReport,
    getPoolWithMaxRevenueReport
} from '../api/reports';
import { getCoaches } from '../api/coaches';

const ReportsPage = () => {
    const [activeReport, setActiveReport] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [coaches, setCoaches] = useState([]);
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [visitorsData, setVisitorsData] = useState(null);
    const [visitorsLoading, setVisitorsLoading] = useState(false);

    useEffect(() => {
        loadCoaches();
    }, []);

    const loadCoaches = async () => {
        try {
            const response = await getCoaches();
            setCoaches(response.data);
        } catch (err) {
            console.error('Ошибка загрузки тренеров:', err);
        }
    };

    // Загружаем посетителей при изменении выбранного тренера
    useEffect(() => {
        if (selectedCoachId && activeReport === 'visitors') {
            loadVisitors();
        }
    }, [selectedCoachId]);

    const loadVisitors = async () => {
        setVisitorsLoading(true);
        setError('');
        try {
            const response = await getVisitorsByCoachReport(selectedCoachId);
            setVisitorsData(response.data);
        } catch (err) {
            console.error('Ошибка загрузки посетителей:', err);
            setError('Ошибка загрузки посетителей');
            setVisitorsData(null);
        } finally {
            setVisitorsLoading(false);
        }
    };

    const fetchReport = async (reportName, apiCall, params = null) => {
        setLoading(true);
        setError('');
        setActiveReport(reportName);
        setVisitorsData(null);
        setSelectedCoachId('');
        
        try {
            let response;
            if (params) {
                response = await apiCall(params);
            } else {
                response = await apiCall();
            }
            setData(response.data);
        } catch (err) {
            console.error('Ошибка загрузки отчёта:', err);
            setError('Ошибка загрузки отчёта');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const renderData = () => {
        if (activeReport === 'visitors') {
            if (visitorsLoading) return <div>Загрузка посетителей...</div>;
            if (!selectedCoachId) return <div>Выберите тренера из списка выше</div>;
            if (!visitorsData || visitorsData.length === 0) return <div>Нет посетителей у этого тренера</div>;
            
            return (
                <div className="coaches-grid">
                    {visitorsData.map(visitor => (
                        <div key={visitor.user_id} className="card">
                            <div className="card-content">
                                <h3 className="card-title">{visitor.full_name}</h3>
                                <p className="card-text">Email: {visitor.email}</p>
                                <p className="card-text">Группа: {visitor.group_number}</p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (!data) return null;

        switch (activeReport) {
            case 'coachesByPool':
                return (
                    <div className="coaches-grid">
                        {data.map(pool => (
                            <div key={pool.pool_id} className="card">
                                <div className="card-content">
                                    <h3 className="card-title">{pool.pool_name}</h3>
                                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                                        {pool.coaches && pool.coaches.map(coach => (
                                            <li key={coach.id} className="card-text">{coach.fullName}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'profitByCoach':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Тренер</th>
                                <th>Бассейн</th>
                                <th>Прибыль</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={`${item.coach_id}-${item.pool_id}`}>
                                    <td>{item.coach_name}</td>
                                    <td>{item.pool_name}</td>
                                    <td>{item.total_revenue} руб.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'coachesWithBeginners':
                return (
                    <div className="coaches-grid">
                        {data.map(coach => (
                            <div key={coach.id} className="card">
                                <div className="card-content">
                                    <h3 className="card-title">{coach.full_name}</h3>
                                    <p className="card-text">Бассейн: {coach.pool_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'groupsByDay':
                return (
                    <div className="pools-grid">
                        {data.map(pool => (
                            <div key={pool.poolId} className="card">
                                <div className="card-content">
                                    <h3 className="card-title">{pool.poolName}</h3>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>Пн</th><th>Вт</th><th>Ср</th><th>Чт</th><th>Пт</th><th>Сб</th><th>Вс</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{pool.groupsByDay[1]}</td>
                                                <td>{pool.groupsByDay[2]}</td>
                                                <td>{pool.groupsByDay[3]}</td>
                                                <td>{pool.groupsByDay[4]}</td>
                                                <td>{pool.groupsByDay[5]}</td>
                                                <td>{pool.groupsByDay[6]}</td>
                                                <td>{pool.groupsByDay[7]}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'maxRevenue':
                return (
                    <div className="card">
                        <div className="card-content">
                            <h3 className="card-title">{data.pool_name}</h3>
                            <p className="card-text">Общая выручка: {data.total_revenue} руб.</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <h1 className="page-title">Аналитические отчёты</h1>

            <div className="report-buttons">
                <button className="btn" onClick={() => fetchReport('coachesByPool', getCoachesByPoolReport)}>
                    Тренеры по бассейнам
                </button>
                <button className="btn" onClick={() => fetchReport('profitByCoach', getProfitByCoachReport)}>
                    Прибыль по тренерам
                </button>
                <button className="btn" onClick={() => fetchReport('coachesWithBeginners', getCoachesWithBeginnersReport)}>
                    Тренеры начинающих
                </button>
                <button className="btn" onClick={() => {
                    setActiveReport('visitors');
                    setData(null);
                    setVisitorsData(null);
                    setSelectedCoachId('');
                    setError('');
                }}>
                    Посетители тренера
                </button>
                <button className="btn" onClick={() => fetchReport('groupsByDay', getGroupsByDayReport)}>
                    Группы по дням
                </button>
                <button className="btn" onClick={() => fetchReport('maxRevenue', getPoolWithMaxRevenueReport)}>
                    Бассейн с макс. выручкой
                </button>
            </div>

            {activeReport === 'visitors' && (
                <div className="form-container" style={{ marginBottom: '1rem' }}>
                    <div className="form-row">
                        <label>Выберите тренера</label>
                        <select
                            value={selectedCoachId}
                            onChange={(e) => setSelectedCoachId(e.target.value)}
                        >
                            <option value="">-- Выберите тренера --</option>
                            {coaches.map(coach => (
                                <option key={coach.id} value={coach.id}>{coach.full_name} ({coach.pool_name})</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {loading && <div>Загрузка...</div>}
            {error && <div className="error-message">{error}</div>}
            {renderData()}
        </div>
    );
};

export default ReportsPage;