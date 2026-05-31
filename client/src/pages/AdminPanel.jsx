import React from 'react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
    return (
        <div>
            <h1>Панель управления</h1>
            <p>Управление справочными данными:</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/pools" style={{ display: 'block', padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
                    <strong>Бассейны</strong>
                    <br />Добавление, редактирование, удаление
                </Link>
                <Link to="/coaches" style={{ display: 'block', padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
                    <strong>Тренеры</strong>
                    <br />Добавление, редактирование, удаление
                </Link>
                <Link to="/groups" style={{ display: 'block', padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
                    <strong>Группы</strong>
                    <br />Добавление, редактирование, удаление
                </Link>
                <Link to="/subscriptions" style={{ display: 'block', padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
                    <strong>Абонементы</strong>
                    <br />Управление тарифами
                </Link>
                <Link to="/reports" style={{ display: 'block', padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
                    <strong>Отчёты</strong>
                    <br />Аналитические отчёты
                </Link>
            </div>
        </div>
    );
};

export default AdminPanel;