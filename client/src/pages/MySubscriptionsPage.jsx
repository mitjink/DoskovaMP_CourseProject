import React, { useState, useEffect } from 'react';
import { getMySubscriptions } from '../api/subscriptions';

const MySubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await getMySubscriptions();
            setSubscriptions(response.data);
            if (response.data.length === 0) {
                setSuccess('У вас пока нет приобретённых абонементов');
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            console.error('Ошибка загрузки покупок:', err);
            setError('Ошибка загрузки покупок');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1 className="page-title">Мои абонементы</h1>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {subscriptions.length === 0 && !success ? (
                <div className="card">
                    <div className="card-content">
                        <p className="card-text">У вас пока нет приобретённых абонементов.</p>
                    </div>
                </div>
            ) : (
                <div className="subscriptions-grid">
                    {subscriptions.map(sub => (
                        <div key={sub.id} className="card">
                            <div className="card-content">
                                <h3 className="card-title">{sub.subscription_name}</h3>
                                <p className="card-text">Группа: {sub.group_number}</p>
                                <p className="card-text">{sub.frequency} раз в неделю</p>
                                <p className="card-text">{sub.price} руб.</p>
                                <p className="card-text">Дата покупки: {formatDate(sub.purchase_date)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscriptionsPage;