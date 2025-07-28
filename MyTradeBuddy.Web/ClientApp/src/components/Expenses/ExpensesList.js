import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ExpensesList = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', startDate: '', endDate: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        fetchExpenses();
        fetchTotalExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('/api/expenses');
            setExpenses(response.data);
        } catch (error) {
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalExpenses = async () => {
        try {
            const response = await axios.get('/api/expenses/total');
            setTotalExpenses(response.data);
        } catch (error) {
            console.error('Failed to fetch total expenses');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/expenses/${expenseToDelete.id}`);
            setExpenses(expenses.filter(e => e.id !== expenseToDelete.id));
            setShowDeleteModal(false);
            setExpenseToDelete(null);
            toast.success('Expense deleted successfully');
            fetchTotalExpenses();
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = !filter.category || expense.category.toLowerCase().includes(filter.category.toLowerCase());
        const matchesStartDate = !filter.startDate || new Date(expense.expenseDate) >= new Date(filter.startDate);
        const matchesEndDate = !filter.endDate || new Date(expense.expenseDate) <= new Date(filter.endDate);
        return matchesCategory && matchesStartDate && matchesEndDate;
    });

    const categories = [...new Set(expenses.map(e => e.category))];
    const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2><i className="fas fa-receipt me-2"></i>Expenses</h2>
                        <Link to="/expenses/new" className="btn btn-primary">
                            <i className="fas fa-plus me-2"></i>Add Expense
                        </Link>
                    </div>

                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card bg-danger text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Total Expenses</h6>
                                            <h4>₦{totalExpenses.toLocaleString()}</h4>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-money-bill-wave fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card bg-warning text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Filtered Total</h6>
                                            <h4>₦{filteredTotal.toLocaleString()}</h4>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-filter fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h6 className="card-title">Filters</h6>
                            <div className="row">
                                <div className="col-md-4">
                                    <label className="form-label">Category</label>
                                    <select 
                                        className="form-select"
                                        value={filter.category}
                                        onChange={(e) => setFilter({...filter, category: e.target.value})}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Start Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        value={filter.startDate}
                                        onChange={(e) => setFilter({...filter, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">End Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        value={filter.endDate}
                                        onChange={(e) => setFilter({...filter, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expenses Table */}
                    <div className="card">
                        <div className="card-body">
                            {filteredExpenses.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
                                    <h5 className="text-muted">No expenses found</h5>
                                    <p className="text-muted">Start by adding your first expense</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Category</th>
                                                <th>Amount</th>
                                                <th>Payment Method</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExpenses.map(expense => (
                                                <tr key={expense.id}>
                                                    <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <div>
                                                            <strong>{expense.description}</strong>
                                                            {expense.notes && (
                                                                <small className="d-block text-muted">{expense.notes}</small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">{expense.category}</span>
                                                    </td>
                                                    <td className="fw-bold text-danger">₦{expense.amount.toLocaleString()}</td>
                                                    <td>{expense.paymentMethod}</td>
                                                    <td>
                                                        <Link 
                                                            to={`/expenses/edit/${expense.id}`} 
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                                setExpenseToDelete(expense);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete the expense "{expenseToDelete?.description}"?</p>
                                <p className="text-muted">This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesList;