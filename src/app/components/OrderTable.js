import React from 'react';
import styles from '../styles.module.css';

export default function OrderTable({ orders, onAddOrder }) {
  console.log('OrderTable - Rendering with orders:', orders);
  
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Private ID</th>
            <th>Customer Name</th>
            <th>Mobile</th>
            <th>Products</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            console.log('OrderTable - Rendering order:', order);
            return (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.privateId}</td>
                <td>{order.customerName}</td>
                <td>{order.customerMobile}</td>
                <td>
                  {order.products.map((product, index) => (
                    <div key={index}>
                      {product.name} (x{product.quantity}) - {product.price}đ
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    className={styles.addButton}
                    onClick={() => onAddOrder(order)}
                  >
                    Add
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}