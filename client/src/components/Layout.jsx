import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <div className="content-wrapper">
                <main className="container">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;