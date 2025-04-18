import React from 'react';
import { TableRow, TableCell, Table, TableBody, TableHead } from '@mui/material';
import { useEffect, useRef } from 'react';
import CustomizeSwitch from './Switch';

export default function MappingRow({ field, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange, onDeleteCustomField, onAddPipelineStageMapping, onDeletePipelineStageMapping }) {
    const isCustom = inputTypes[field.name] === 'custom';

    const productFields = webhookFields && Array.isArray(webhookFields)
        ? (webhookFields.find((f) => f.name === 'products' && f.type === 'array')?.subFields || [])
        : [];

    // Danh sách trạng thái cố định của Web 2 cho order_status
    const orderStatusOptions = [
        'ORDER_STARTED',
        'BUYER_CONFIRMED',
        'SELLER_CONFIRMED',
        'SHIPPING',
        'RETURNED',
        'CANCELED',
        'RECEIVED',
        'COMPLETED'
    ];

    // Danh sách trạng thái từ Nhanh.vn
    const nhanhStatusOptions = [
        'New',
        'Confirming',
        'CustomerConfirming',
        'Confirmed',
        'Packing',
        'Packed',
        'ChangeDepot',
        'Pickup',
        'Shipping',
        'Success',
        'Failed',
        'Canceled',
        'Aborted',
        'CarrierCanceled',
        'SoldOut',
        'Returning',
        'Returned'
    ];

    if (field.name === 'order_status') {
        return (
            <TableRow>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell colSpan={3}>
                    <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Trạng thái Web 2</TableCell>
                                <TableCell>Trạng thái Nhanh.vn</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderStatusOptions.map((status) => (
                                <TableRow key={status} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{status}</TableCell>
                                    <TableCell>
                                        <select
                                            value={mapping[`order_status.${status}`] || ''}
                                            onChange={(e) => onMappingChange(`order_status.${status}`, e.target.value)}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">Chọn trạng thái Nhanh.vn</option>
                                            {nhanhStatusOptions.map((nhanhStatus) => (
                                                <option key={nhanhStatus} value={nhanhStatus}>
                                                    {nhanhStatus}
                                                </option>
                                            ))}
                                        </select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableCell>
            </TableRow>
        );
    }

    if (field.name === 'pipeline_stage_id') {
        const pipelineStageMappings = Object.keys(mapping)
            .filter(key => key.startsWith('pipeline_stage_id.') && key !== 'pipeline_stage_id')
            .map(key => ({
                status: key.replace('pipeline_stage_id.', ''),
                id: mapping[key]
            }));

        return (
            <TableRow>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell colSpan={3}>
                    <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Trạng thái Nhanh.vn</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pipelineStageMappings.map(({ status, id }) => (
                                <TableRow key={status}>
                                    <TableCell>
                                        <input
                                            type="text"
                                            value={id || ''}
                                            onChange={(e) => onMappingChange(`pipeline_stage_id.${status}`, e.target.value)}
                                            placeholder="Nhập ID"
                                            style={{ width: '100%' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <select
                                            value={status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;

                                                if (newStatus) {
                                                    onMappingChange(`pipeline_stage_id.${newStatus}`, id);
                                                    onMappingChange(`pipeline_stage_id.${status}`, undefined);
                                                }
                                            }}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">Chọn trạng thái Nhanh.vn</option>
                                            {nhanhStatusOptions.map((nhanhStatus) => (
                                                <option key={nhanhStatus} value={nhanhStatus}>
                                                    {nhanhStatus}
                                                </option>
                                            ))}
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                        <button onClick={() => onDeletePipelineStageMapping(status)}>Xóa</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <button onClick={onAddPipelineStageMapping}>Thêm ánh xạ</button>
                </TableCell>
                <TableCell></TableCell>
            </TableRow>
        );
    }

    if (field.type === 'array' && field.subFields) {
        return (
            <TableRow>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell colSpan={onDeleteCustomField ? 2 : 3}>
                    <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
                        {/* <TableRow>
                           <TableCell>Tên trường</TableCell>
                            <TableCell>Loại thông tin</TableCell> 
                            <TableCell>Loại input</TableCell>
                            <TableCell>Webhook Data / Custom Value</TableCell>
                        </TableRow> */}
                        <TableBody>
                            {field.subFields.map((subField) => {
                                const subFieldKey = field.name.startsWith('order_products')
                                    ? `${field.name}.${subField.name}`
                                    : `custom_fields.${subField.name}`;
                                const isSubCustom = inputTypes[subFieldKey] === 'custom';
                                return (
                                    <TableRow key={subFieldKey}>
                                        <TableCell>{subField.name}</TableCell>
                                        {field.name.startsWith('order_products') && (
                                            <TableCell>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSubCustom}
                                                        onChange={() => {
                                                            onInputTypeChange(subFieldKey)
                                                        }}
                                                    />
                                                    {isSubCustom ? 'Tùy chỉnh' : 'Nhanh.vn'}
                                                </label>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {isSubCustom ? (
                                                <input
                                                    type="text"
                                                    value={mapping[subFieldKey] || ''}
                                                    onChange={(e) => onMappingChange(subFieldKey, e.target.value)}
                                                    placeholder="Nhập giá trị tùy chỉnh"
                                                    style={{ width: '100%' }}
                                                />
                                            ) : isCustom ? (
                                                <input
                                                    type="text"
                                                    value={mapping[subFieldKey] || ''}
                                                    onChange={(e) => onMappingChange(subFieldKey, e.target.value)}
                                                    placeholder="Nhập giá trị tùy chỉnh"
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                <select
                                                    value={mapping[subFieldKey] || ''}
                                                    onChange={(e) => onMappingChange(subFieldKey, e.target.value)}
                                                    style={{ width: '100%' }}
                                                >
                                                    <option value="">Chọn param từ webhook</option>
                                                    {(field.name === 'order_products' ? productFields : (webhookFields || []))
                                                        .filter((f) => typeof f === 'string' || !f.subFields)
                                                        .map((webhookField) => (
                                                            <option
                                                                key={webhookField.name || webhookField}
                                                                value={webhookField.name || webhookField}
                                                            >
                                                                {webhookField.name || webhookField}
                                                            </option>
                                                        ))}
                                                </select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableCell>
                {
                    onDeleteCustomField && (
                        <TableCell>
                            <button onClick={onDeleteCustomField}>Xóa</button>
                        </TableCell>
                    )
                }
            </TableRow >
        );
    }

    return (
        <TableRow >
            <TableCell>{field.name}</TableCell>
            <TableCell align='center'>{field.type}</TableCell>
            <TableCell>
                <CustomizeSwitch
                    checked={isCustom}
                    onChange={() => {
                        onInputTypeChange(field.name)
                    }}
                />
            </TableCell>
            <TableCell>
                {isCustom ? (
                    <input
                        type="text"
                        value={mapping[field.name] || ''}
                        onChange={(e) => {
                            onMappingChange(field.name, e.target.value)

                        }}
                        placeholder="Nhập giá trị tùy chỉnh"
                        style={{ width: '100%' }}
                    />
                ) : (
                    <select
                        value={mapping[field.name] || ''}
                        onChange={(e) => {
                            onMappingChange(field.name, e.target.value)

                        }}
                        style={{ width: '100%' }}
                    >
                        <option value="">Chọn param từ webhook</option>
                        {(webhookFields || [])
                            .filter((f) => typeof f === 'string' || !f.subFields)
                            .map((webhookField) => (
                                <option key={webhookField.name || webhookField} value={webhookField.name || webhookField}>
                                    {webhookField.name || webhookField}
                                </option>
                            ))}
                    </select>
                )}
            </TableCell>
        </TableRow>
    );
}