import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/products/${productToDelete.id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const getStockBadge = (product) => {
    if (product.stockQuantity <= product.minimumStockLevel) {
      return <Badge bg="danger">Low Stock</Badge>;
    } else if (product.stockQuantity <= product.minimumStockLevel * 2) {
      return <Badge bg="warning">Medium Stock</Badge>;
    }
    return <Badge bg="success">In Stock</Badge>;
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-box me-2"></i>
          Products
        </h2>
        <Link to="/products/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Add Product
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {products.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No products found</h5>
              <p className="text-muted">Start by adding your first product</p>
              <Link to="/products/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Add Product
              </Link>
            </div>
          ) : (
            <Table responsive hover>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <div className="text-muted small">{product.description}</div>
                      )}
                    </td>
                    <td>{product.category}</td>
                    <td>₦{product.costPrice.toLocaleString()}</td>
                    <td>₦{product.sellingPrice.toLocaleString()}</td>
                    <td>
                      {product.stockQuantity} {product.unit}
                      <div className="text-muted small">
                        Min: {product.minimumStockLevel} {product.unit}
                      </div>
                    </td>
                    <td>{getStockBadge(product)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link 
                          to={`/products/edit/${product.id}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
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
          Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
          This action cannot be undone.
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

export default ProductList;