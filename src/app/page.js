'use client';
import styles from "./styles.module.css";
import { useState } from 'react';
import OrderTable from './components/OrderTable';
import MappingModal from './components/MappingModal';
import { createMappedData } from './utils/orderMapper';

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleFindOrder = async () => {
    console.log('handleFindOrder - Starting fetch');
    try {
      console.log('handleFindOrder - Sending POST request to /api/orders');
      const response = await fetch('/api/orders', {
        method: 'POST'
      });

      console.log('handleFindOrder - Response status:', response.status);
      const data = await response.json();
      console.log('handleFindOrder - Received raw data:', data);

      if (data.code === 1 && data.data.orders) {
        console.log('handleFindOrder - Data is valid, processing orders');
        const formattedOrders = Object.values(data.data.orders).map(order => {
          const formattedOrder = {
            id: order.id,
            privateId: order.privateId,
            customerName: order.customerName,
            customerMobile: order.customerMobile,
            description: order.description,
            privateDescription: order.privateDescription,
            customerAddress: order.customerAddress,
            deliveryDate: order.deliveryDate,
            customerShipFee: order.customerShipFee,
            statusName: order.statusName,
            customerCityId: order.customerCityId,
            customerDistrictId: order.customerDistrictId,
            shipToWardLocationId: order.shipToWardLocationId,
            products: order.products.map(product => ({
              name: product.productName,
              quantity: product.quantity,
              price: product.price,
              productId: product.productId,
              discount: product.discount
            }))
          };
          console.log('handleFindOrder - Formatted order:', formattedOrder);
          return formattedOrder;
        });
        console.log('handleFindOrder - All formatted orders:', formattedOrders);
        setOrders(formattedOrders);
        console.log('handleFindOrder - State updated with orders');
      } else {
        console.log('handleFindOrder - Invalid data or no orders found:', data);
      }
    } catch (error) {
      console.error('handleFindOrder - Error during fetch:', error);
    }
  };

  const handleAdd = (order) => {
    console.log('handleAdd - Starting with order:', order);
    const mappedData = createMappedData(order);
    console.log('handleAdd - Generated mappedData:', mappedData);
    const updatedOrder = { ...order, mappedData };
    console.log('handleAdd - Updated selectedOrder:', updatedOrder);
    setSelectedOrder(updatedOrder);
    setShowModal(true);
    console.log('handleAdd - Modal opened with selectedOrder');
  };

  const handleConfirm = async () => {
    if (selectedOrder) {
      console.log('handleConfirm - Starting with selectedOrder:', selectedOrder);
      const mappedData = createMappedData(selectedOrder);
      console.log('handleConfirm - Recreated mappedData:', mappedData);

      try {
        console.log('handleConfirm - Sending POST request to /api/create-deal with data:', mappedData);
        const response = await fetch('/api/create-deal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mappedData)
        });

        console.log('handleConfirm - Response status:', response.status);
        const result = await response.json();
        console.log('handleConfirm - Received response data:', result);

        if (result.success) {
          console.log('handleConfirm - Deal created successfully:', result.data);
        } else {
          console.error('handleConfirm - Failed to create deal:', result.error);
        }
      } catch (error) {
        console.error('handleConfirm - Error during fetch:', error);
      }
      setShowModal(false);
      console.log('handleConfirm - Modal closed');
    } else {
      console.log('handleConfirm - No selectedOrder available');
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button className={styles.button} onClick={handleFindOrder}>
          Find order
        </button>

        {orders.length > 0 && (
          <OrderTable orders={orders} onAddOrder={handleAdd} />
        )}

        {showModal && (
          <MappingModal
            selectedOrder={selectedOrder}
            onConfirm={handleConfirm}
            onClose={() => {
              console.log('Modal - Closing modal');
              setShowModal(false);
            }}
          />
        )}
      </main>
    </div>
  );
}