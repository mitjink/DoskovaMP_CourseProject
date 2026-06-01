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

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Загрузка...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout>
                        <div>Главная страница</div>
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/pools" element={
                <ProtectedRoute>
                    <Layout><PoolsPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/coaches" element={
                <ProtectedRoute>
                    <Layout><CoachesPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/groups" element={
                <ProtectedRoute>
                    <Layout><GroupsPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/subscriptions" element={
                <ProtectedRoute>
                    <Layout><SubscriptionsPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/my-subscriptions" element={
                <ProtectedRoute>
                    <Layout><MySubscriptionsPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
                <ProtectedRoute adminOnly={true}>
                    <Layout><ReportsPage /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                    <Layout><AdminPanel /></Layout>
                </ProtectedRoute>
            } />
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