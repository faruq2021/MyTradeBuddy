import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ExpenseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [expense, setExpense] = useState({
        description: '',
        category: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        receipt: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const categories = [
        'Inventory Purchase',
        'Transportation',
        'Utilities',
        'Rent',
        'Marketing',
        'Equipment',
        'Supplies',
        'Professional Services',
        'Insurance',
        'Taxes',
        'Other'
    ];

    const paymentMethods = ['Cash', 'Bank Transfer', 'Card', 'Mobile Money', 'Cheque'];

    useEffect(() => {
        if (isEdit) {
            fetchExpense();
        }
    }, [id, isEdit]);

    const fetchExpense = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/expenses/${id}`);
            const expenseData = response.data;
            setExpense({
                ...expenseData,
                expenseDate: new Date(expenseData.expenseDate).toISOString().split('T')[0]
            });
        } catch (error) {
            toast.error('Failed to fetch expense details');
            navigate('/expenses');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!expense.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!expense.category) {
            newErrors.category = 'Category is required';
        }

        if (!expense.amount || expense.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!expense.expenseDate) {
            newErrors.expenseDate = 'Expense date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const expenseData = {
                ...expense,
                amount: parseFloat(expense.amount)
            };

            if (isEdit) {
                await axios.put(`/api/expenses/${id}`, expenseData);
                toast.success('Expense updated successfully');
            } else {
                await axios.post('/api/expenses', expenseData);
                toast.success('Expense created successfully');
            }
            
            navigate('/expenses');
        } catch (error) {
            toast.error(isEdit ? 'Failed to update expense' : 'Failed to create expense');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (loading && isEdit) {
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
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="mb-0">
                                <i className="fas fa-receipt me-2"></i>
                                {isEdit ? 'Edit Expense' : 'Add New Expense'}
                            </h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Description *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                name="description"
                                                value={expense.description}
                                                onChange={handleChange}
                                                placeholder="Enter expense description"
                                            />
                                            {errors.description && (
                                                <div className="invalid-feedback">{errors.description}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Category *</label>
                                            <select
                                                className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                                                name="category"
                                                value={expense.category}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <div className="invalid-feedback">{errors.category}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Amount (₦) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                                                name="amount"
                                                value={expense.amount}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                            />
                                            {errors.amount && (
                                                <div className="invalid-feedback">{errors.amount}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Expense Date *</label>
                                            <input
                                                type="date"
                                                className={`form-control ${errors.expenseDate ? 'is-invalid' : ''}`}
                                                name="expenseDate"
                                                value={expense.expenseDate}
                                                onChange={handleChange}
                                            />
                                            {errors.expenseDate && (
                                                <div className="invalid-feedback">{errors.expenseDate}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Payment Method</label>
                                            <select
                                                className="form-select"
                                                name="paymentMethod"
                                                value={expense.paymentMethod}
                                                onChange={handleChange}
                                            >
                                                {paymentMethods.map(method => (
                                                    <option key={method} value={method}>{method}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Receipt/Reference</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="receipt"
                                                value={expense.receipt}
                                                onChange={handleChange}
                                                placeholder="Receipt number or reference"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        value={expense.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Additional notes about this expense"
                                    ></textarea>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/expenses')}
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                {isEdit ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                {isEdit ? 'Update Expense' : 'Create Expense'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseForm;