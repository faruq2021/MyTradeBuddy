import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minimumStockLevel: '',
    unit: 'pieces'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        stockQuantity: product.stockQuantity.toString(),
        minimumStockLevel: product.minimumStockLevel.toString(),
        unit: product.unit
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required';
    }
    if (!formData.minimumStockLevel || parseInt(formData.minimumStockLevel) < 0) {
      newErrors.minimumStockLevel = 'Valid minimum stock level is required';
    }
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    
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
      
      const productData = {
        ...formData,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockQuantity: parseInt(formData.stockQuantity),
        minimumStockLevel: parseInt(formData.minimumStockLevel)
      };

      if (isEdit) {
        productData.id = parseInt(id);
        await axios.put(`/api/products/${id}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/products', productData);
        toast.success('Product created successfully!');
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const profitMargin = formData.costPrice && formData.sellingPrice ? 
    (((parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100).toFixed(2) : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-box me-2"></i>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/products')}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Products
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        placeholder="Enter product name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!errors.category}
                        placeholder="e.g., Electronics, Clothing, Food"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description (optional)"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cost Price (₦) *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        isInvalid={!!errors.costPrice}
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.costPrice}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Selling Price (₦) *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleChange}
                        isInvalid={!!errors.sellingPrice}
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.sellingPrice}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        isInvalid={!!errors.stockQuantity}
                        placeholder="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.stockQuantity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Stock Level *</Form.Label>
                      <Form.Control
                        type="number"
                        name="minimumStockLevel"
                        value={formData.minimumStockLevel}
                        onChange={handleChange}
                        isInvalid={!!errors.minimumStockLevel}
                        placeholder="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.minimumStockLevel}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit *</Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        isInvalid={!!errors.unit}
                      >
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="liters">Liters</option>
                        <option value="meters">Meters</option>
                        <option value="boxes">Boxes</option>
                        <option value="packs">Packs</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.unit}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {isEdit ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary" 
                    onClick={() => navigate('/products')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-calculator me-2"></i>
                Profit Calculator
              </h6>
            </Card.Header>
            <Card.Body>
              {formData.costPrice && formData.sellingPrice ? (
                <>
                  <div className="mb-3">
                    <small className="text-muted">Profit per unit:</small>
                    <div className="h5 text-success">
                      ₦{(parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)).toFixed(2)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Profit margin:</small>
                    <div className="h5 text-info">
                      {profitMargin}%
                    </div>
                  </div>
                  {formData.stockQuantity && (
                    <div>
                      <small className="text-muted">Total potential profit:</small>
                      <div className="h5 text-primary">
                        ₦{((parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)) * parseInt(formData.stockQuantity)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted text-center py-3">
                  <i className="fas fa-info-circle mb-2"></i>
                  <div>Enter cost and selling prices to see profit calculations</div>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {parseFloat(profitMargin) < 20 && formData.costPrice && formData.sellingPrice && (
            <Alert variant="warning" className="mt-3">
              <Alert.Heading className="h6">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Low Profit Margin
              </Alert.Heading>
              <small>
                Consider increasing your selling price. A profit margin of at least 20% is recommended for sustainable business.
              </small>
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductForm;