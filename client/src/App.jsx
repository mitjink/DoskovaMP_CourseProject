import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PoolsPage from './pages/PoolsPage';
import CoachesPage from './pages/CoachesPage';
import GroupsPage from './pages/GroupsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import MySubscriptionsPage from './pages/MySubscriptionsPage';
import ReportsPage from './pages/ReportsPage';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Загрузка...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Загрузка...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (user.role !== 'admin') return <Navigate to="/" />;
    
    return children;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Загрузка...</div>;
    
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/pools" element={<Layout><PoolsPage /></Layout>} />
            <Route path="/coaches" element={<Layout><CoachesPage /></Layout>} />
            <Route path="/groups" element={<Layout><GroupsPage /></Layout>} />
            <Route path="/subscriptions" element={<Layout><SubscriptionsPage /></Layout>} />
            
            <Route path="/my-subscriptions" element={
                <ProtectedRoute>
                    <Layout><MySubscriptionsPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
                <AdminRoute>
                    <Layout><ReportsPage /></Layout>
                </AdminRoute>
            } />
            
            <Route path="/" element={<Navigate to="/pools" />} />
        </Routes>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;