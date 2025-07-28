import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    
    const [reportData, setReportData] = useState({
        totalSales: 0,
        totalExpenses: 0,
        totalProfit: 0,
        salesByMonth: [],
        expensesByCategory: [],
        topProducts: [],
        recentTransactions: []
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            
            // Fetch all required data
            const [salesResponse, expensesResponse, productsResponse] = await Promise.all([
                axios.get('/api/sales'),
                axios.get('/api/expenses'),
                axios.get('/api/products')
            ]);

            const sales = salesResponse.data;
            const expenses = expensesResponse.data;
            const products = productsResponse.data;

            // Filter data by date range
            const filteredSales = sales.filter(sale => {
                const saleDate = new Date(sale.saleDate);
                return saleDate >= new Date(dateRange.startDate) && saleDate <= new Date(dateRange.endDate);
            });

            const filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.expenseDate);
                return expenseDate >= new Date(dateRange.startDate) && expenseDate <= new Date(dateRange.endDate);
            });

            // Calculate totals
            const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const totalProfit = totalSales - totalExpenses;

            // Sales by month
            const salesByMonth = getSalesByMonth(filteredSales);

            // Expenses by category
            const expensesByCategory = getExpensesByCategory(filteredExpenses);

            // Top products (by quantity sold)
            const topProducts = getTopProducts(filteredSales, products);

            // Recent transactions
            const recentTransactions = getRecentTransactions(sales, expenses);

            setReportData({
                totalSales,
                totalExpenses,
                totalProfit,
                salesByMonth,
                expensesByCategory,
                topProducts,
                recentTransactions
            });
        } catch (error) {
            toast.error('Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const getSalesByMonth = (sales) => {
        const monthlyData = {};
        sales.forEach(sale => {
            const month = new Date(sale.saleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + sale.totalAmount;
        });
        return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
    };

    const getExpensesByCategory = (expenses) => {
        const categoryData = {};
        expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });
        return Object.entries(categoryData).map(([category, amount]) => ({ category, amount }));
    };

    const getTopProducts = (sales, products) => {
        const productSales = {};
        sales.forEach(sale => {
            if (sale.saleItems) {
                sale.saleItems.forEach(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        if (!productSales[product.name]) {
                            productSales[product.name] = { quantity: 0, revenue: 0 };
                        }
                        productSales[product.name].quantity += item.quantity;
                        productSales[product.name].revenue += item.totalPrice;
                    }
                });
            }
        });
        
        return Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    };

    const getRecentTransactions = (sales, expenses) => {
        const transactions = [
            ...sales.map(sale => ({ ...sale, type: 'sale', date: sale.saleDate })),
            ...expenses.map(expense => ({ ...expense, type: 'expense', date: expense.expenseDate }))
        ];
        
        return transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
    };

    const salesChartData = {
        labels: reportData.salesByMonth.map(item => item.month),
        datasets: [
            {
                label: 'Sales (₦)',
                data: reportData.salesByMonth.map(item => item.amount),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };

    const expensesChartData = {
        labels: reportData.expensesByCategory.map(item => item.category),
        datasets: [
            {
                data: reportData.expensesByCategory.map(item => item.amount),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384',
                    '#C9CBCF'
                ]
            }
        ]
    };

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
                        <h2><i className="fas fa-chart-bar me-2"></i>Business Reports</h2>
                        <div className="d-flex gap-2">
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            />
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Total Sales</h6>
                                            <h4>₦{reportData.totalSales.toLocaleString()}</h4>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-chart-line fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-danger text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Total Expenses</h6>
                                            <h4>₦{reportData.totalExpenses.toLocaleString()}</h4>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-money-bill-wave fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className={`card ${reportData.totalProfit >= 0 ? 'bg-primary' : 'bg-warning'} text-white`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Net Profit</h6>
                                            <h4>₦{reportData.totalProfit.toLocaleString()}</h4>
                                        </div>
                                        <div className="align-self-center">
                                            <i className={`fas ${reportData.totalProfit >= 0 ? 'fa-trophy' : 'fa-exclamation-triangle'} fa-2x`}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Sales Trend</h5>
                                </div>
                                <div className="card-body">
                                    {reportData.salesByMonth.length > 0 ? (
                                        <Bar data={salesChartData} options={{ responsive: true }} />
                                    ) : (
                                        <p className="text-center text-muted">No sales data available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Expenses by Category</h5>
                                </div>
                                <div className="card-body">
                                    {reportData.expensesByCategory.length > 0 ? (
                                        <Pie data={expensesChartData} options={{ responsive: true }} />
                                    ) : (
                                        <p className="text-center text-muted">No expense data available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products and Recent Transactions */}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Top Products</h5>
                                </div>
                                <div className="card-body">
                                    {reportData.topProducts.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Qty Sold</th>
                                                        <th>Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.topProducts.map((product, index) => (
                                                        <tr key={index}>
                                                            <td>{product.name}</td>
                                                            <td>{product.quantity}</td>
                                                            <td>₦{product.revenue.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted">No product data available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Recent Transactions</h5>
                                </div>
                                <div className="card-body">
                                    {reportData.recentTransactions.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            {reportData.recentTransactions.map((transaction, index) => (
                                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>
                                                            {transaction.type === 'sale' ? transaction.customerName || 'Sale' : transaction.description}
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {new Date(transaction.date).toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                    <span className={`badge ${transaction.type === 'sale' ? 'bg-success' : 'bg-danger'}`}>
                                                        {transaction.type === 'sale' ? '+' : '-'}₦{(transaction.totalAmount || transaction.amount).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted">No recent transactions</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;