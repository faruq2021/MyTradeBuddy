import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Table, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SalesForm = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Cash',
    amountPaid: '',
    notes: ''
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.filter(p => p.isActive && p.stockQuantity > 0));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add this comment above the function
  // eslint-disable-next-line no-unused-vars
  const handleAddProduct = (product) => {
      setSelectedProduct(product);
      setItemQuantity(1);
      setShowProductModal(true);
  };

  const handleConfirmAddProduct = () => {
    if (!selectedProduct || itemQuantity <= 0) return;
    
    if (itemQuantity > selectedProduct.stockQuantity) {
      toast.error(`Only ${selectedProduct.stockQuantity} ${selectedProduct.unit} available in stock`);
      return;
    }

    const existingItemIndex = saleItems.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      const newQuantity = saleItems[existingItemIndex].quantity + itemQuantity;
      if (newQuantity > selectedProduct.stockQuantity) {
        toast.error(`Total quantity cannot exceed ${selectedProduct.stockQuantity} ${selectedProduct.unit}`);
        return;
      }
      
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        totalPrice: newQuantity * selectedProduct.sellingPrice
      };
      setSaleItems(updatedItems);
    } else {
      const newItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unitPrice: selectedProduct.sellingPrice,
        quantity: itemQuantity,
        totalPrice: itemQuantity * selectedProduct.sellingPrice,
        unit: selectedProduct.unit
      };
      setSaleItems([...saleItems, newItem]);
    }
    
    setShowProductModal(false);
    setSelectedProduct(null);
    setItemQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    
    const item = saleItems[index];
    const product = products.find(p => p.id === item.productId);
    
    if (newQuantity > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} ${product.unit} available in stock`);
      return;
    }
    
    const updatedItems = [...saleItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      totalPrice: newQuantity * item.unitPrice
    };
    setSaleItems(updatedItems);
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const balance = totalAmount - amountPaid;
  const paymentStatus = balance <= 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending';

  const validateForm = () => {
    const newErrors = {};
    
    if (saleItems.length === 0) {
      newErrors.items = 'At least one product must be added to the sale';
    }
    
    if (amountPaid < 0) {
      newErrors.amountPaid = 'Amount paid cannot be negative';
    }
    
    if (amountPaid > totalAmount) {
      newErrors.amountPaid = 'Amount paid cannot exceed total amount';
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
      
      const saleData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        totalAmount: totalAmount,
        amountPaid: amountPaid,
        balance: balance,
        paymentMethod: formData.paymentMethod,
        paymentStatus: paymentStatus,
        notes: formData.notes,
        saleItems: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };

      await axios.post('/api/sales', saleData);
      toast.success('Sale recorded successfully!');
      navigate('/sales');
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error('Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-shopping-cart me-2"></i>
          New Sale
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/sales')}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Sales
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            {/* Customer Information */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Customer Information
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Enter customer name (optional)"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="Enter phone number (optional)"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Products */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-box me-2"></i>
                  Products
                </h6>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowProductModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Product
                </Button>
              </Card.Header>
              <Card.Body>
                {errors.items && (
                  <Alert variant="danger">{errors.items}</Alert>
                )}
                
                {saleItems.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-shopping-basket fa-2x text-muted mb-3"></i>
                    <p className="text-muted">No products added yet</p>
                    <Button 
                      variant="primary" 
                      onClick={() => setShowProductModal(true)}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add First Product
                    </Button>
                  </div>
                ) : (
                  <Table responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>₦{item.unitPrice.toLocaleString()}</td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                              style={{ width: '80px' }}
                            />
                            <small className="text-muted">{item.unit}</small>
                          </td>
                          <td>₦{item.totalPrice.toLocaleString()}</td>
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            {/* Sale Summary */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-calculator me-2"></i>
                  Sale Summary
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Amount:</span>
                  <strong>₦{totalAmount.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount Paid:</span>
                  <strong className="text-success">₦{amountPaid.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Balance:</span>
                  <strong className={balance > 0 ? 'text-warning' : 'text-success'}>
                    ₦{balance.toLocaleString()}
                  </strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Status:</span>
                  <span className={`badge ${
                    paymentStatus === 'Paid' ? 'bg-success' : 
                    paymentStatus === 'Partial' ? 'bg-warning' : 'bg-danger'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
              </Card.Body>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-credit-card me-2"></i>
                  Payment Information
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="POS">POS</option>
                    <option value="Card">Card</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Amount Paid (₦)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    isInvalid={!!errors.amountPaid}
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.amountPaid}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes (optional)"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                disabled={loading || saleItems.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Recording Sale...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Record Sale
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline-secondary" 
                onClick={() => navigate('/sales')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Product Selection Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {products.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-box fa-2x text-muted mb-3"></i>
              <p className="text-muted">No products available</p>
            </div>
          ) : (
            <div className="row">
              {products.map(product => (
                <div key={product.id} className="col-md-6 mb-3">
                  <Card 
                    className={`h-100 cursor-pointer ${
                      selectedProduct?.id === product.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body>
                      <h6 className="card-title">{product.name}</h6>
                      <p className="text-muted small mb-2">{product.category}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="h6 text-primary">₦{product.sellingPrice.toLocaleString()}</span>
                        <small className="text-muted">
                          {product.stockQuantity} {product.unit} available
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
          
          {selectedProduct && (
            <div className="mt-3 p-3 bg-light rounded">
              <h6>Selected: {selectedProduct.name}</h6>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={selectedProduct.stockQuantity}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                />
                <Form.Text className="text-muted">
                  Available: {selectedProduct.stockQuantity} {selectedProduct.unit}
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmAddProduct}
            disabled={!selectedProduct || itemQuantity <= 0}
          >
            Add to Sale
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesForm;