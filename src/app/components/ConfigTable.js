import MappingRow from './MappingRow';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

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
    return (
        <>
            <h2>Regular Fields</h2>
            <Table sx={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Tên params</TableCell>
                        <TableCell>Loại thông tin</TableCell>
                        <TableCell>Loại input</TableCell>
                        <TableCell>Webhook Data / Custom Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
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
                </TableBody>
            </Table>

            <h2>Order Products</h2>
            <Table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Tên params</TableCell>
                        <TableCell>Loại thông tin</TableCell>
                        <TableCell>Loại input</TableCell>
                        <TableCell>Webhook Data / Custom Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <MappingRow
                        key={orderProductsField.name}
                        field={orderProductsField}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={onInputTypeChange}
                        onMappingChange={onMappingChange}
                    />
                </TableBody>
            </Table>

            <h2>Special Fields</h2>
            <Table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Tên params</TableCell>
                        <TableCell>Loại thông tin</TableCell>
                        <TableCell>Loại input</TableCell>
                        <TableCell>Webhook Data / Custom Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
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
                </TableBody>
            </Table>

            <h2>Custom Fields</h2>
            <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Tên params</TableCell>
                        <TableCell>Loại thông tin</TableCell>
                        <TableCell>Webhook Data / Custom Value</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
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
                        <TableRow>
                            <td colSpan="5">Chưa có custom fields nào được cấu hình.</td>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}