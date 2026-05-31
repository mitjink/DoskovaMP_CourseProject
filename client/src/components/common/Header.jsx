import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/" className="logo-link">MyPool</Link>
                </div>
                
                <nav className="nav">
                    <ul className="nav-list">
                        <li><Link to="/pools">Бассейны</Link></li>
                        <li><Link to="/coaches">Тренеры</Link></li>
                        <li><Link to="/groups">Группы</Link></li>
                        <li><Link to="/subscriptions">Абонементы</Link></li>
                        {user && user.role === 'admin' && (
                            <>
                                <li><Link to="/admin">Управление</Link></li>
                                <li><Link to="/reports">Отчёты</Link></li>
                            </>
                        )}
                        {user && user.role === 'client' && (
                            <li><Link to="/my-subscriptions">Мои абонементы</Link></li>
                        )}
                    </ul>
                </nav>

                <div className="user-menu">
                    {user ? (
                        <div className="user-info">
                            <span className="user-name">{user.fullName}</span>
                            <button onClick={handleLogout} className="logout-btn">Выйти</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">Вход</Link>
                            <Link to="/register" className="register-btn">Регистрация</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;