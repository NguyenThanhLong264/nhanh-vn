export const mapOrderStatus = (status) => {
  const statusMap = {
    'New': 'ORDER_STARTED',
    'Confirming': 'BUYER_CONFIRMED',
    'CustomerConfirming': 'BUYER_CONFIRMED',
    'Confirmed': 'SELLER_CONFIRMED',
    'Packing': 'SHIPPING',
    'Packed': 'SHIPPING',
    'ChangeDepot': 'SHIPPING',
    'Pickup': 'SHIPPING',
    'Shipping': 'SHIPPING',
    'Success': 'RECEIVED',
    'Failed': 'CANCELED',
    'Canceled': 'CANCELED',
    'Aborted': 'CANCELED',
    'CarrierCanceled': 'CANCELED',
    'SoldOut': 'CANCELED',
    'Returning': 'RETURNED',
    'Returned': 'RETURNED'
  };
  return statusMap[status] || 'ORDER_STARTED';
};

export const createMappedData = (order) => ({
  deal: {
    username: order.customerName,
    subject: `${order.customerName} - Nhanh.vn Order`,
    phone: order.customerMobile,
    email: order.customerEmail || "",
    assignee_id: 164796592,
    estimated_closed_date: order.deliveryDate 
      ? `${order.deliveryDate} 23:59:59` 
      : `${new Date().toISOString().split('T')[0]} 23:59:59`,
    deal_label: [],
    custom_fields: [],
    probability: 0,
    value: order.products.reduce((total, product) =>
      total + (parseInt(product.price) * parseInt(product.quantity)), 0),
    order_address_detail: order.customerAddress || "",
    comment: order.privateDescription || "",
    order_buyer_note: order.description || "",
    order_city_id: String(order.customerCityId || ""),
    order_district_id: String(order.customerDistrictId || ""),
    order_ward_id: String(order.shipToWardLocationId || ""),
    order_receiver_name: order.customerName,
    order_receiver_phone: order.customerMobile,
    order_shipping_fee: order.customerShipFee || 0,
    order_status: mapOrderStatus(order.statusName),
    order_tracking_code: "",
    order_tracking_url: "",
    order_products: order.products.map(product => ({
      sku: (product.productId && parseInt(product.productId) > 6) ? "1" : (product.productId || ""),
      is_free: 0,
      unit_price: parseInt(product.price),
      quantity: parseInt(product.quantity),
      discount_markup: product.discount || 0,
      discount_value: 0,
      name: product.name
    }))
  }
});