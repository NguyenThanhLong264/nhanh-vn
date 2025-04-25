import { loadConfig, replacePlaceholders, mapOrderStatus } from '../services/webhookUtils';

export async function mapToDealFormat(orderData) {
  const config = await loadConfig();

  const orderId = orderData.orderId;
  const deal = {};

  // Bước 1: Mapping thông thường & custom
  for (const [dealField, value] of Object.entries(config.mapping)) {
    if (
      !dealField.startsWith('order_products.') &&
      !dealField.startsWith('custom_fields.') &&
      !dealField.startsWith('order_status') &&
      dealField !== 'pipeline_stage_id'
    ) {
      if (config.inputTypes[dealField] === 'custom') {
        const placeholderData = { ...orderData };
        Object.keys(placeholderData).forEach(key => {
          if (placeholderData[key] === null) {
            placeholderData[key] = 'Không có dữ liệu';
          }
        });

        if (value.includes('{{products}}') && Array.isArray(orderData.products)) {
          const productLines = orderData.products.map((p, i) =>
            `#${i + 1} ID sản phẩm: ${p.id} - SL: ${p.quantity}, Giá: ${p.price}, Giảm: ${p.discount}`
          ).join('\n');
          placeholderData.products = productLines;
        }

        deal[dealField] = replacePlaceholders(value, placeholderData);
      } else {
        deal[dealField] = orderData[value] ?? null;
      }
    }
  }

  // Bước 2: order_status
  if (config.mapping['order_status'] && config.inputTypes['order_status'] === 'custom') {
    deal['order_status'] = replacePlaceholders(config.mapping['order_status'], { ...orderData, orderId });
  } else if (orderData.status) {
    deal['order_status'] = mapOrderStatus(orderData.status || '', config);
  }

  // Bước 3: pipeline_stage_id
  if ('pipeline_stage_id' in config.mapping) {
    if (config.inputTypes['pipeline_stage_id'] === 'custom') {
      deal['pipeline_stage_id'] = replacePlaceholders(config.mapping['pipeline_stage_id'], { ...orderData, orderId });
    } else if (orderData.status) {
      const statusKey = orderData.status.trim();
      const key = `pipeline_stage_id.${statusKey}`;
      if (config.mapping[key]) {
        deal['pipeline_stage_id'] = config.mapping[key];
      }
    }

    // Xóa các key phụ không cần thiết
    for (const key in deal) {
      if (key.startsWith('pipeline_stage_id.') || key === '') {
        delete deal[key];
      }
    }
  }

  // Bước 4: products
  if (orderData.products && Array.isArray(orderData.products)) {
    if (config.inputTypes['order_products'] === 'map') {
      deal.order_products = orderData.products.map(product => {
        const productMapped = {};
        for (const [dealField, value] of Object.entries(config.mapping)) {
          if (dealField.startsWith('order_products.')) {
            const subField = dealField.replace('order_products.', '');
            const inputType = config.inputTypes[dealField];

            if (inputType === 'custom') {
              productMapped[subField] = replacePlaceholders(value, { ...orderData, ...product });
            } else if (inputType === 'map') {
              productMapped[subField] = product[value] ?? null;
            } else if (value.startsWith('products.')) {
              const productSubField = value.replace('products.', '');
              productMapped[subField] = product[productSubField] ?? null;
            }
          }
        }
        return productMapped;
      });
    }
  }

  // Bước 5: custom_fields
  const customFieldsMapping = [];
  const customFieldKeys = Object.keys(config.mapping).filter(key => key.startsWith('custom_fields.id_'));
  customFieldKeys.forEach(idKey => {
    const valueKey = idKey.replace('id_', 'value_');
    const idValue = config.inputTypes[idKey] === 'custom'
      ? replacePlaceholders(config.mapping[idKey], orderData)
      : (orderData[config.mapping[idKey]] || '');

    const valueValue = config.mapping[valueKey] !== undefined
      ? (config.inputTypes[valueKey] === 'custom'
        ? replacePlaceholders(config.mapping[valueKey], { ...orderData, orderId })
        : (orderData[config.mapping[valueKey]] || null))
      : null;

    if (idValue && valueValue) {
      customFieldsMapping.push({ id: idValue, value: valueValue });
    }
  });
  deal.custom_fields = customFieldsMapping;

  // Loại bỏ các giá trị null
  for (const key in deal) {
    if (deal[key] === null) {
      delete deal[key];
    }
  }

  return deal;
}
