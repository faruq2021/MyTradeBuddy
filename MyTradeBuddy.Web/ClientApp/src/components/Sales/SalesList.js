import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentStatus: ''
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/sales/${saleToDelete.id}`);
      toast.success('Sale deleted successfully');
      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Failed to delete sale');
    } finally {
      setShowDeleteModal(false);
      setSaleToDelete(null);
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'partial':
        return <Badge bg="warning">Partial</Badge>;
      case 'pending':
        return <Badge bg="danger">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredSales = sales.filter(sale => {
    if (filters.startDate && new Date(sale.saleDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(sale.saleDate) > new Date(filters.endDate)) return false;
    if (filters.paymentStatus && sale.paymentStatus.toLowerCase() !== filters.paymentStatus.toLowerCase()) return false;
    return true;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaid = filteredSales.reduce((sum, sale) => sum + sale.amountPaid, 0);
  const totalBalance = filteredSales.reduce((sum, sale) => sum + sale.balance, 0);

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-shopping-cart me-2"></i>
          Sales
        </h2>
        <Link to="/sales/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          New Sale
        </Link>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-primary mb-2">
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <h6 className="card-title">Total Sales</h6>
              <h4 className="text-primary">₦{totalSales.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-success mb-2">
                <i className="fas fa-money-bill-wave fa-2x"></i>
              </div>
              <h6 className="card-title">Amount Paid</h6>
              <h4 className="text-success">₦{totalPaid.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-warning mb-2">
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <h6 className="card-title">Outstanding</h6>
              <h4 className="text-warning">₦{totalBalance.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-info mb-2">
                <i className="fas fa-receipt fa-2x"></i>
              </div>
              <h6 className="card-title">Total Transactions</h6>
              <h4 className="text-info">{filteredSales.length}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({ startDate: '', endDate: '', paymentStatus: '' })}
                className="w-100"
              >
                <i className="fas fa-times me-2"></i>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sales Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {filteredSales.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No sales found</h5>
              <p className="text-muted">Start by recording your first sale</p>
              <Link to="/sales/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Record Sale
              </Link>
            </div>
          ) : (
            <Table responsive hover>
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td>
                      {new Date(sale.saleDate).toLocaleDateString()}
                      <div className="text-muted small">
                        {new Date(sale.saleDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <strong>{sale.customerName || 'Walk-in Customer'}</strong>
                      {sale.customerPhone && (
                        <div className="text-muted small">{sale.customerPhone}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {sale.saleItems?.length || 0} items
                      </span>
                    </td>
                    <td>₦{sale.totalAmount.toLocaleString()}</td>
                    <td>₦{sale.amountPaid.toLocaleString()}</td>
                    <td>
                      {sale.balance > 0 ? (
                        <span className="text-warning">₦{sale.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted">₦0</span>
                      )}
                    </td>
                    <td>{getPaymentStatusBadge(sale.paymentStatus)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(sale)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this sale record?
          <div className="mt-2">
            <strong>Customer:</strong> {saleToDelete?.customerName || 'Walk-in Customer'}<br/>
            <strong>Amount:</strong> ₦{saleToDelete?.totalAmount.toLocaleString()}<br/>
            <strong>Date:</strong> {saleToDelete && new Date(saleToDelete.saleDate).toLocaleDateString()}
          </div>
          <div className="text-danger mt-2">
            <small>This action cannot be undone.</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesList;