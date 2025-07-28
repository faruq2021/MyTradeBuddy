import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import SalesList from './components/Sales/SalesList';
import SalesForm from './components/Sales/SalesForm';
import ExpensesList from './components/Expenses/ExpensesList';
import ExpenseForm from './components/Expenses/ExpenseForm';
import Reports from './components/Reports/Reports';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <main className="container-fluid mt-4">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/new" element={<ProductForm />} />
                        <Route path="/products/edit/:id" element={<ProductForm />} />
                        
                        <Route path="/sales" element={<SalesList />} />
                        <Route path="/sales/new" element={<SalesForm />} />
                        <Route path="/sales/edit/:id" element={<SalesForm />} />
                        
                        <Route path="/expenses" element={<ExpensesList />} />
                        <Route path="/expenses/new" element={<ExpenseForm />} />
                        <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
                        
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </main>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        </Router>
    );
}

export default App;