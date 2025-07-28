import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    lowStockProducts: [],
    recentSales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const [salesResponse, lowStockResponse] = await Promise.all([
        axios.get(`/api/sales/total?startDate=${startOfMonth.toISOString()}`),
        axios.get('/api/products/low-stock')
      ]);

      const totalSales = salesResponse.data;
      const lowStockProducts = lowStockResponse.data;
      
      setDashboardData({
        totalSales,
        totalExpenses: 0, // Will implement expenses API
        profit: totalSales,
        lowStockProducts,
        recentSales: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const expenseChartData = {
    labels: ['Transport', 'Rent', 'Utilities', 'Supplies', 'Others'],
    datasets: [
      {
        data: [300, 500, 200, 400, 150],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-tachometer-alt me-2"></i>
        Dashboard
      </h2>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-primary mb-2">
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
              <h5 className="card-title">Total Sales</h5>
              <h3 className="text-success">₦{dashboardData.totalSales.toLocaleString()}</h3>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-danger mb-2">
                <i className="fas fa-receipt fa-2x"></i>
              </div>
              <h5 className="card-title">Total Expenses</h5>
              <h3 className="text-danger">₦{dashboardData.totalExpenses.toLocaleString()}</h3>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-info mb-2">
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <h5 className="card-title">Profit</h5>
              <h3 className="text-info">₦{dashboardData.profit.toLocaleString()}</h3>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-warning mb-2">
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <h5 className="card-title">Low Stock</h5>
              <h3 className="text-warning">{dashboardData.lowStockProducts.length}</h3>
              <small className="text-muted">Products</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {dashboardData.lowStockProducts.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Low Stock Alert!
          </Alert.Heading>
          <p>The following products are running low on stock:</p>
          <ul className="mb-0">
            {dashboardData.lowStockProducts.map(product => (
              <li key={product.id}>
                <strong>{product.name}</strong> - Only {product.stockQuantity} {product.unit} left
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Charts */}
      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Sales Trend
              </h5>
            </Card.Header>
            <Card.Body>
              <Line data={salesChartData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Expense Breakdown
              </h5>
            </Card.Header>
            <Card.Body>
              <Doughnut data={expenseChartData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;