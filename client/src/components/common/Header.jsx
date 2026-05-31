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
            <div className="header-top">
                <div className="header-top-container">
                    {user && (
                        <button onClick={handleLogout} className="logout-top-btn">
                            Выйти
                        </button>
                    )}
                </div>
            </div>

            <div className="header-main">
                <div className="header-container">
                    <div className="logo">
                        <Link to="/" className="logo-link">MyPool</Link>
                    </div>
                    <nav className="nav">
                        <ul className="nav-list">
                            <li><Link to="/pools" className="nav-link">Бассейны</Link></li>
                            <li><Link to="/coaches" className="nav-link">Тренеры</Link></li>
                            <li><Link to="/groups" className="nav-link">Группы</Link></li>
                            <li><Link to="/subscriptions" className="nav-link">Абонементы</Link></li>
                            {user && user.role === 'admin' && (
                                <>
                                    <li><Link to="/admin" className="nav-link">Управление</Link></li>
                                    <li><Link to="/reports" className="nav-link">Отчёты</Link></li>
                                </>
                            )}
                            {user && user.role === 'client' && (
                                <li><Link to="/my-subscriptions" className="nav-link">Мои абонементы</Link></li>
                            )}
                        </ul>
                    </nav>
                    <div className="auth-buttons">
                        {!user && (
                            <>
                                <Link to="/login" className="login-btn">Вход</Link>
                                <Link to="/register" className="register-btn">Регистрация</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;