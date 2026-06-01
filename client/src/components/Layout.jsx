import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div>
            <Header />
            <div className="content-container">
                <div className="content-wrapper">
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;