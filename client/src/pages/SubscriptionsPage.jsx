import React, { useState, useEffect } from 'react';
import { getPasses, buySubscription } from '../api/subscriptions';
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
    const { user } = useAuth();
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
            <h1>Абонементы</h1>

            {error && <div style={{ color: 'red', padding: '0.5rem', background: '#ffebee' }}>{error}</div>}
            {success && <div style={{ color: 'green', padding: '0.5rem', background: '#e8f5e9' }}>{success}</div>}

            <div>
                {passes.map(pass => (
                    <div key={pass.id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
                        <h3>{pass.name}</h3>
                        <p>Частота: {pass.frequency} раз в неделю</p>
                        <p>Цена: {pass.price} руб.</p>
                        {isClient && (
                            <button onClick={() => handleBuyClick(pass)}>Купить абонемент</button>
                        )}
                    </div>
                ))}
            </div>

            {showBuyModal && selectedPass && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px' }}>
                        <h3>Покупка абонемента</h3>
                        <p>Абонемент: {selectedPass.name}</p>
                        <p>Цена: {selectedPass.price} руб.</p>
                        <form onSubmit={handleBuySubmit}>
                            <div>
                                <label>Выберите группу</label>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Выберите группу --</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.number} - {group.category} ({group.pool_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <button type="submit">Оформить</button>
                                <button type="button" onClick={() => setShowBuyModal(false)}>Отмена</button>
                            </div>
                        </form>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                            После оформления оплатите абонемент в спортивном клубе.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionsPage;