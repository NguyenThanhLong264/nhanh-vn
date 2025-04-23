import React from 'react';
import MappingRow from './MappingRow';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useMemo, useState } from 'react';
import CustomizeSwitch from './Switch';

const ConfigTable = ({ dealFields, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange, onDeleteCustomField, onAddPipelineStageMapping, onDeletePipelineStageMapping, onAddCustomField }) => {
    const productsType = inputTypes['order_products'] === 'map';
    const regularFields = useMemo(() => {
        return dealFields.filter(field =>
            field.name !== 'order_products' &&
            field.name !== 'custom_fields' &&
            field.name !== 'pipeline_id' &&
            field.name !== 'pipeline_stage_id' &&
            field.name !== 'order_status');
    }, [dealFields]);

    const orderProductsField = useMemo(() => ({
        name: 'order_products',
        type: 'array',
        subFields: [
            { name: 'sku', type: 'string' },
            { name: 'is_free', type: 'number' },
            { name: 'unit_price', type: 'number' },
            { name: 'quantity', type: 'number' },
            { name: 'discount_markup', type: 'number' },
            { name: 'discount_value', type: 'number' },
        ]
    }), []);

    const specialFields = useMemo(() => {
        return dealFields.filter(field =>
            field.name === 'pipeline_id' ||
            field.name === 'pipeline_stage_id' ||
            field.name === 'order_status'
        );
    }, [dealFields]);

    const customFields = useMemo(() => {
        const customFieldIndices = new Set(
            Object.keys(mapping)
                .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
                .map(key => key.match(/^custom_fields\.id_(\d+)$/)[1])
        );

        const fields = [];

        customFieldIndices.forEach(index => {
            const idKey = `custom_fields.id_${index}`;
            const valueKey = `custom_fields.value_${index}`;
            if (mapping[idKey] !== undefined || mapping[valueKey] !== undefined) {
                fields.push({
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
        return fields;
    }, [mapping]);
    return (
        <>
            <h2>Bảng Các Trường CareSoft</h2>
            <Table size='small' sx={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', backgroundColor: "#F5F6FA", borderRadius: '12px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
                <TableHead sx={{
                    '& .MuiTableCell-root': {
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        lineHeight: '30px',
                        color: '#333',
                    }
                }}>
                    <TableRow >
                        <TableCell>Tên params</TableCell>
                        <TableCell align='center' sx={{ width: '170px' }}>Loại thông tin</TableCell>
                        <TableCell align='center' sx={{ width: '170px' }}>Loại input</TableCell>
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

            <h2>Bảng Các Trường Đặc Thù</h2>
            <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', backgroundColor: "#F5F6FA", borderRadius: '12px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
                <TableHead sx={{
                    '& .MuiTableCell-root': {
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        lineHeight: '30px',
                        color: '#333',
                    }
                }}>
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

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <h2>Bảng Sản Phẩm</h2>
                <CustomizeSwitch
                    checked={productsType}
                    onChange={() => onInputTypeChange('order_products')}
                    label={productsType ? "Sản phẩm đã nhập trên CareSoft" : "Sản phẩm chưa nhập trên CareSoft"} />
            </Box>
            <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', backgroundColor: "#F5F6FA", borderRadius: '12px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
                <TableHead sx={{
                    '& .MuiTableCell-root': {
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        lineHeight: '30px',
                        color: '#333',
                    }
                }}>
                    <TableRow>
                        <TableCell>Tên params</TableCell>
                        <TableCell>Loại thông tin</TableCell>
                        <TableCell align='center' sx={{ width: '200px' }}>Mảng sản phẩm</TableCell>
                        <TableCell align='center' sx={{ width: '170px' }}>Loại input</TableCell>
                        <TableCell sx={{ width: '370px' }}>Webhook Data / Custom Value</TableCell>
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

            <h2>Bảng Trường Động</h2>
            <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: "#F5F6FA", borderRadius: '12px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
                <TableHead sx={{
                    '& .MuiTableCell-root': {
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        lineHeight: '30px',
                        color: '#333',
                    }
                }}>
                    <TableRow>
                        <TableCell>Tên params</TableCell>
                        <TableCell align='center' sx={{ width: '200px' }}>Loại thông tin</TableCell>
                        <TableCell align='center' sx={{ width: '150px' }} >Id</TableCell>
                        <TableCell align='center' sx={{ width: '300px' }}>Giá trị</TableCell>
                        <TableCell align='center' sx={{ width: '150px' }}>Hành động</TableCell>
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
            <Button
                variant='contained'
                sx={{ my: 2 }}
                onClick={onAddCustomField}
            >Thêm Trường Động</Button>
        </>
    );
}

export default React.memo(ConfigTable);