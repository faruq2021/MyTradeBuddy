import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <i className="fas fa-store me-2"></i>
                    MyTradeBuddy
                </Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/dashboard') || location.pathname === '/' ? 'active' : ''}`} 
                                to="/dashboard"
                            >
                                <i className="fas fa-tachometer-alt me-1"></i>
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/products') ? 'active' : ''}`} 
                                to="/products"
                            >
                                <i className="fas fa-box me-1"></i>
                                Products
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/sales') ? 'active' : ''}`} 
                                to="/sales"
                            >
                                <i className="fas fa-shopping-cart me-1"></i>
                                Sales
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/expenses') ? 'active' : ''}`} 
                                to="/expenses"
                            >
                                <i className="fas fa-receipt me-1"></i>
                                Expenses
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/reports') ? 'active' : ''}`} 
                                to="/reports"
                            >
                                <i className="fas fa-chart-bar me-1"></i>
                                Reports
                            </Link>
                        </li>
                    </ul>
                    
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <button 
                                className="nav-link dropdown-toggle btn btn-link" 
                                type="button"
                                data-bs-toggle="dropdown"
                                style={{ border: 'none', background: 'none', color: 'inherit' }}
                            >
                                <i className="fas fa-user me-1"></i>
                                Account
                            </button>
                            <ul className="dropdown-menu">
                                <li><button className="dropdown-item" type="button">Profile</button></li>
                                <li><button className="dropdown-item" type="button">Settings</button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" type="button">Logout</button></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;