export const specialFields = [
    { name: 'pipeline_id', type: 'int' },
    { name: 'pipeline_stage_id', type: 'int', multi: true, subFields: [] },
    {
        name: 'order_status', type: 'string', multi: false,
        subFields: [
            { name: 'ORDER_STARTED', type: 'string' },
            { name: 'BUYER_CONFIRMED', type: 'string' },
            { name: 'SELLER_CONFIRMED', type: 'string' },
            { name: 'SHIPPING', type: 'string' },
            { name: 'RETURNED', type: 'string' },
            { name: 'CANCELED', type: 'string' },
            { name: 'RECEIVED', type: 'string' },
        ]
    },
    {
        name: 'order_products',
        type: 'array',
        subFields: [
            { name: 'sku', type: 'string' },
            { name: 'is_free', type: 'int' },
            { name: 'unit_price', type: 'float' },
            { name: 'quantity', type: 'int' },
            { name: 'discount_markup', type: 'float' },
            { name: 'discount_value', type: 'float' },
        ],
        multi: false,
    },
]