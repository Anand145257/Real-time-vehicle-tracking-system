import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import ErrorBoundary from './ErrorBoundary';

/**
 * AppLayout — shared shell for all authenticated pages.
 * Renders the persistent NavBar above the current page (via Outlet).
 */
const AppLayout = () => {
    return (
        <div className="app-shell">
            <ErrorBoundary>
                <NavBar />
            </ErrorBoundary>
            <main className="page-content">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default AppLayout;
