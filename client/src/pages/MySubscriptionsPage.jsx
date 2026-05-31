import React, { useState, useEffect } from 'react';
import { getMySubscriptions } from '../api/subscriptions';

const MySubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await getMySubscriptions();
            setSubscriptions(response.data);
        } catch (err) {
            setError('Ошибка загрузки покупок');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>Мои абонементы</h1>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {subscriptions.length === 0 ? (
                <p>У вас пока нет приобретённых абонементов.</p>
            ) : (
                <div>
                    {subscriptions.map(sub => (
                        <div key={sub.id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                            <h3>{sub.subscription_name}</h3>
                            <p>Группа: {sub.group_number}</p>
                            <p>Частота: {sub.frequency} раз в неделю</p>
                            <p>Цена: {sub.price} руб.</p>
                            <p>Дата покупки: {new Date(sub.purchase_date).toLocaleDateString('ru-RU')}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscriptionsPage;