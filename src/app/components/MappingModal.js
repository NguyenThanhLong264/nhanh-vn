import React from 'react';
import styles from '../styles.module.css';

export default function MappingModal({ selectedOrder, onConfirm, onClose }) {
  console.log('MappingModal - Rendering with selectedOrder:', selectedOrder);
  
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.mappingModal}`}>
        <h2>Data Mapping Preview</h2>
        <div className="mappingTableContainer">
          <table className="mappingTable">
            <thead>
              <tr>
                <th>Deal Attributes</th>
                <th>Value</th>
                <th>Order Attributes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>username</td><td>{selectedOrder?.mappedData?.deal?.username}</td><td>customerName</td></tr>
              <tr><td>subject</td><td>{selectedOrder?.mappedData?.deal?.subject}</td><td>customerName</td></tr>
              {/* ... other mapping rows ... */}
              <tr><td>order_products</td><td>
                {selectedOrder?.mappedData?.deal?.order_products.map((product, index) => (
                  <div key={index}>
                    Name: {product.name}<br />
                    SKU: {product.sku}<br />
                    Price: {product.unit_price}đ<br />
                    Quantity: {product.quantity}<br />
                    Is Free: {product.is_free}<br />
                    Discount: {product.discount_value}
                  </div>
                ))}
              </td><td>products</td></tr>
            </tbody>
          </table>
        </div>
        <div className={styles.modalButtons}>
          <button className={styles.confirmButton} onClick={onConfirm}>Confirm</button>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}