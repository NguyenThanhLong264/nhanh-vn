export function mapToDealFormat(data) {
  // Chuyển đổi dữ liệu từ webhook thành dữ liệu phù hợp để gửi lên API ngoài
  return {
    dealName: `Order-${data.id}`,
    customer: data.customer,
    products: data.products.map(product => ({
      name: product.name,
      quantity: product.quantity,
      price: product.price
    })),
    // Thêm các xử lý khác nếu cần
  };
}
