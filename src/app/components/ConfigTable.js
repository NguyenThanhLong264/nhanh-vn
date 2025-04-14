import MappingRow from './MappingRow';

export default function ConfigTable({ dealFields, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange, onDeleteCustomField, onAddPipelineStageMapping, onDeletePipelineStageMapping }) {
    const regularFields = dealFields.filter(field =>
        field.name !== 'order_products' &&
        field.name !== 'custom_fields' &&
        field.name !== 'pipeline_id' &&
        field.name !== 'pipeline_stage_id' &&
        field.name !== 'order_status'
    );
    const orderProductsField = {
        name: 'order_products',
        type: 'array',
        subFields: [
            { name: 'sku', type: 'string' },
            { name: 'unit_price', type: 'number' },
            { name: 'quantity', type: 'number' },
            { name: 'discount_markup', type: 'number' },
            { name: 'discount_value', type: 'number' },
        ]
    };
    const specialFields = dealFields.filter(field =>
        field.name === 'pipeline_id' ||
        field.name === 'pipeline_stage_id' ||
        field.name === 'order_status'
    );

    const customFields = [];
    const customFieldIndices = new Set(
        Object.keys(mapping)
            .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
            .map(key => key.match(/^custom_fields\.id_(\d+)$/)[1])
    );

    customFieldIndices.forEach(index => {
        const idKey = `custom_fields.id_${index}`;
        const valueKey = `custom_fields.value_${index}`;
        if (mapping[idKey] !== undefined || mapping[valueKey] !== undefined) {
            customFields.push({
                name: `custom_fields_${index}`,
                type: 'array',
                subFields: [
                    { name: `id_${index}`, type: 'int' },
                    { name: `value_${index}`, type: 'string' },
                ],
                index: parseInt(index),
            });
        }
    });

    console.log('Custom Fields:', customFields);

    return (
        <>
            <h2>Regular Fields</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>Tên params</th>
                        <th>Loại thông tin</th>
                        <th>Loại input</th>
                        <th>Webhook Data / Custom Value</th>
                    </tr>
                </thead>
                <tbody>
                    {regularFields.map((field) => (
                        <MappingRow
                            key={field.name}
                            field={field}
                            webhookFields={webhookFields}
                            mapping={mapping}
                            inputTypes={inputTypes}
                            onInputTypeChange={onInputTypeChange}
                            onMappingChange={onMappingChange}
                        />
                    ))}
                </tbody>
            </table>

            <h2>Order Products</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>Tên params</th>
                        <th>Loại thông tin</th>
                        <th>Loại input</th>
                        <th>Webhook Data / Custom Value</th>
                    </tr>
                </thead>
                <tbody>
                    <MappingRow
                        key={orderProductsField.name}
                        field={orderProductsField}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={onInputTypeChange}
                        onMappingChange={onMappingChange}
                    />
                </tbody>
            </table>

            <h2>Special Fields</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>Tên params</th>
                        <th>Loại thông tin</th>
                        <th>Loại input</th>
                        <th>Webhook Data / Custom Value</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {specialFields.map((field) => (
                        <MappingRow
                            key={field.name}
                            field={field}
                            webhookFields={webhookFields}
                            mapping={mapping}
                            inputTypes={inputTypes}
                            onInputTypeChange={onInputTypeChange}
                            onMappingChange={onMappingChange}
                            onAddPipelineStageMapping={field.name === 'pipeline_stage_id' ? onAddPipelineStageMapping : null}
                            onDeletePipelineStageMapping={field.name === 'pipeline_stage_id' ? onDeletePipelineStageMapping : null}
                        />
                    ))}
                </tbody>
            </table>

            <h2>Custom Fields</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Tên params</th>
                        <th>Loại thông tin</th>
                        <th>Loại input</th>
                        <th>Webhook Data / Custom Value</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {customFields.length > 0 ? (
                        customFields.map((field) => (
                            <MappingRow
                                key={field.name}
                                field={field}
                                webhookFields={webhookFields}
                                mapping={mapping}
                                inputTypes={inputTypes}
                                onInputTypeChange={onInputTypeChange}
                                onMappingChange={onMappingChange}
                                onDeleteCustomField={() => onDeleteCustomField(field.index)}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">Chưa có custom fields nào được cấu hình.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
}