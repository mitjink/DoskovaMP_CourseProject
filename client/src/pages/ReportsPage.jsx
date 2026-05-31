import React, { useState } from 'react';
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

    const loadCoaches = async () => {
        const response = await getCoaches();
        setCoaches(response.data);
    };

    const fetchReport = async (reportName, apiCall, params = null) => {
        setLoading(true);
        setError('');
        try {
            let response;
            if (params) {
                response = await apiCall(params);
            } else {
                response = await apiCall();
            }
            setData(response.data);
            setActiveReport(reportName);
        } catch (err) {
            setError('Ошибка загрузки отчёта');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleVisitorsByCoach = async () => {
        if (!selectedCoachId) {
            setError('Выберите тренера');
            return;
        }
        await fetchReport('visitors', getVisitorsByCoachReport, selectedCoachId);
    };

    const renderData = () => {
        if (!data) return null;

        switch (activeReport) {
            case 'coachesByPool':
                return (
                    <div>
                        {data.map(pool => (
                            <div key={pool.pool_id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                                <h3>{pool.pool_name}</h3>
                                <ul>
                                    {pool.coaches.map(coach => (
                                        <li key={coach.id}>{coach.fullName}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                );

            case 'profitByCoach':
                return (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Тренер</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Бассейн</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Прибыль</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={`${item.coach_id}-${item.pool_id}`}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.coach_name}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.pool_name}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.total_revenue} руб.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'coachesWithBeginners':
                return (
                    <ul>
                        {data.map(coach => (
                            <li key={coach.id}>{coach.full_name} - {coach.pool_name}</li>
                        ))}
                    </ul>
                );

            case 'visitors':
                return (
                    <div>
                        {data.length === 0 ? (
                            <p>Нет посетителей у этого тренера</p>
                        ) : (
                            <ul>
                                {data.map(visitor => (
                                    <li key={visitor.user_id}>
                                        {visitor.full_name} ({visitor.email}) - группа {visitor.group_number}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );

            case 'groupsByDay':
                return (
                    <div>
                        {data.map(pool => (
                            <div key={pool.poolId} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                                <h3>{pool.poolName}</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f0f0f0' }}>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Пн</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Вт</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ср</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Чт</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Пт</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сб</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Вс</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[1]}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[2]}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[3]}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[4]}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[5]}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[6]}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pool.groupsByDay[7]}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                );

            case 'maxRevenue':
                return (
                    <div style={{ border: '1px solid #ccc', padding: '1rem', background: '#e8f5e9' }}>
                        <h3>{data.pool_name}</h3>
                        <p>Общая выручка: {data.total_revenue} руб.</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <h1>Аналитические отчёты</h1>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button onClick={() => fetchReport('coachesByPool', getCoachesByPoolReport)}>
                    Тренеры по бассейнам
                </button>
                <button onClick={() => fetchReport('profitByCoach', getProfitByCoachReport)}>
                    Прибыль по тренерам
                </button>
                <button onClick={() => fetchReport('coachesWithBeginners', getCoachesWithBeginnersReport)}>
                    Тренеры начинающих
                </button>
                <button onClick={() => {
                    loadCoaches();
                    setActiveReport(null);
                    setSelectedCoachId('');
                    setData(null);
                }}>
                    Посетители тренера
                </button>
                <button onClick={() => fetchReport('groupsByDay', getGroupsByDayReport)}>
                    Группы по дням
                </button>
                <button onClick={() => fetchReport('maxRevenue', getPoolWithMaxRevenueReport)}>
                    Бассейн с макс. выручкой
                </button>
            </div>

            {activeReport === 'visitors' && (
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div>
                        <label>Выберите тренера</label>
                        <select
                            value={selectedCoachId}
                            onChange={(e) => setSelectedCoachId(e.target.value)}
                            style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem', minWidth: '250px' }}
                        >
                            <option value="">-- Выберите тренера --</option>
                            {coaches.map(coach => (
                                <option key={coach.id} value={coach.id}>{coach.full_name} ({coach.pool_name})</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleVisitorsByCoach}>Показать</button>
                </div>
            )}

            {loading && <div>Загрузка...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {renderData()}
        </div>
    );
};

export default ReportsPage;