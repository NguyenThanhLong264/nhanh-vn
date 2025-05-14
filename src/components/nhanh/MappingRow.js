import React from 'react';
import { TableRow, TableCell, Table, TableBody, TableHead, Button, TextField } from '@mui/material';
import CustomizeSwitch from './Switch';
import CustomTextField from './customTextField';
import CustomSelection from './CustomSelection';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomizeIconButton from './CustomizeIconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconTooltip from '../IconTooltip';

const MappingRow = ({ field, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange, onDeleteCustomField, onAddPipelineStageMapping, onDeletePipelineStageMapping }) => {
    const isCustom = inputTypes[field.name] === 'custom';
    const importantFieldsLv1 = ['subject', 'phone', 'email'];
    const importantFieldsLv2 = ['service_id', 'group_id', 'assignee_id'];
    const isImportantField1 = importantFieldsLv1.includes(field.name);
    const isImportantField2 = importantFieldsLv2.includes(field.name);
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
                <TableCell>
                    {field.name}
                    <IconTooltip
                        icon={<HelpOutlineIcon fontSize='small' />}
                        text={field.guide
                            ? `${field.note}\n${field.guide}`
                            : field.note
                        } />
                </TableCell>
                <TableCell align='center'>{field.type}</TableCell>
                <TableCell colSpan={3}>
                    <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Trạng thái CareSoft</TableCell>
                                <TableCell>Trạng thái Nhanh.vn</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderStatusOptions.map((status) => (
                                <TableRow key={status} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{status}</TableCell>
                                    <TableCell>
                                        <CustomSelection
                                            value={mapping[`order_status.${status}`] || ''}
                                            onChange={(event, newValue) => {
                                                onMappingChange(`order_status.${status}`, newValue || '');
                                            }}
                                            option={nhanhStatusOptions}
                                        />
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
                <TableCell>{field.name}
                    <IconTooltip
                        icon={<HelpOutlineIcon fontSize='small' />}
                        text={field.guide
                            ? `${field.note}\n${field.guide}`
                            : field.note
                        } /></TableCell>
                <TableCell align='center'>{field.type}</TableCell>
                <TableCell colSpan={3} align='center' sx={{ p: 0 }}>
                    <Table size='small' style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align='center' sx={{ width: '150px' }}>ID</TableCell>
                                <TableCell align='center'>Trạng thái Nhanh.vn</TableCell>
                                <TableCell align='center' sx={{ width: '150px' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pipelineStageMappings.map(({ status, id }) => (
                                <TableRow key={status}>
                                    <TableCell >
                                        <CustomTextField
                                            value={id || ''}
                                            onChange={(e) => onMappingChange(`pipeline_stage_id.${status}`, e.target.value)}
                                            placeholder="Nhập ID"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <CustomSelection
                                            value={status}
                                            onChange={(event, newValue) => {
                                                const newStatus = newValue || '';
                                                if (newStatus) {
                                                    onMappingChange(`pipeline_stage_id.${newStatus}`, id);
                                                    onMappingChange(`pipeline_stage_id.${status}`, undefined);
                                                }
                                            }}
                                            option={nhanhStatusOptions.filter((option) => {
                                                const key = `pipeline_stage_id.${option}`;
                                                return (
                                                    // Keep if not already selected or is the current status
                                                    !Object.keys(mapping).includes(key) || option === status
                                                );
                                            })}
                                        />
                                    </TableCell>
                                    <TableCell align='center'>
                                        <CustomizeIconButton
                                            icon={<DeleteIcon />}
                                            onClick={() => onDeletePipelineStageMapping(status)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button variant='contained' onClick={onAddPipelineStageMapping} sx={{ mb: '5px', bgcolor: '#3D55CC' }}>Thêm Stage</Button>
                </TableCell>
            </TableRow>
        );
    }

    if (field.type === 'array' && field.subFields) {
        return (
            <TableRow>
                <TableCell>{field.name}
                    {!field.name.startsWith('custom') && <IconTooltip
                        icon={<HelpOutlineIcon fontSize='small' />}
                        text={field.guide
                            ? `${field.note}\n${field.guide}`
                            : field.note
                        }
                    />}
                </TableCell>
                <TableCell align='center'>{field.type}</TableCell>
                <TableCell colSpan={onDeleteCustomField ? 2 : 3} sx={{ p: 0 }}>
                    <Table size='small' style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                        <TableBody sx={{ p: 0 }}>
                            {field.name.startsWith('order_products') ? (
                                field.subFields.map((subField, index) => {
                                    const subFieldKey = `${field.name}.${subField.name}`;
                                    const isSubCustom = inputTypes[subFieldKey] === 'custom';

                                    return (
                                        <TableRow key={subFieldKey}>
                                            <TableCell sx={{ width: '190px' }}>{subField.name}</TableCell>
                                            <TableCell align='center' sx={{ width: '170px' }}>
                                                <CustomizeSwitch
                                                    checked={isSubCustom}
                                                    onChange={() => {
                                                        onInputTypeChange(subFieldKey);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {isSubCustom ? (
                                                    <CustomTextField
                                                        value={mapping[subFieldKey] || ''}
                                                        onChange={(e) => onMappingChange(subFieldKey, e.target.value)}
                                                        placeholder="Nhập giá trị tùy chỉnh"
                                                    />
                                                ) : (
                                                    <CustomSelection
                                                        value={mapping[subFieldKey] || ''}
                                                        onChange={(event, newValue) => {
                                                            onMappingChange(subFieldKey, newValue || '');
                                                        }}
                                                        option={(productFields || [])
                                                            .filter((f) => typeof f === 'string' || !f.subFields)
                                                            .map((f) => typeof f === 'string' ? f : f.name)}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow key={field.name}>
                                    <TableCell align="center" sx={{ width: '150px' }}>
                                        <CustomTextField
                                            value={mapping[`custom_fields.id_${field.index}`] || ""}
                                            onChange={(e) => onMappingChange(`custom_fields.id_${field.index}`, e.target.value)}
                                            placeholder="Nhập ID"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ width: '300px' }}>
                                        <CustomTextField
                                            value={mapping[`custom_fields.value_${field.index}`] || ""}
                                            onChange={(e) => onMappingChange(`custom_fields.value_${field.index}`, e.target.value)}
                                            placeholder="Nhập giá trị"
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableCell>
                {onDeleteCustomField && (
                    <TableCell align='center' >
                        <CustomizeIconButton
                            icon={<DeleteIcon />}
                            onClick={onDeleteCustomField}
                        />
                    </TableCell>
                )}
            </TableRow >
        );
    }

    return (
        <TableRow >
            <TableCell>
                {field.name}
                {isImportantField1 && (" (*)")}
                {isImportantField2 && (" (**)")}
                <IconTooltip
                    icon={<HelpOutlineIcon fontSize='small' />}
                    text={field.guide
                        ? `${field.note}\n${field.guide}`
                        : field.note
                    }
                />
            </TableCell>
            <TableCell align='center'>{field.type}</TableCell>
            <TableCell align='center' >
                <CustomizeSwitch
                    checked={isCustom}
                    onChange={() => {
                        onInputTypeChange(field.name)
                    }}
                />
            </TableCell>
            <TableCell>
                {isCustom ? (
                    field.name === 'comment' || field.name === 'comment.body' ? (
                        <CustomTextField
                            multiline
                            minRows={1}
                            value={mapping[field.name] || ""}
                            onChange={(e) => { onMappingChange(field.name, e.target.value) }}
                            placeholder="Nhập giá trị tùy chỉnh"
                        />
                    )
                        : (<CustomTextField
                            value={mapping[field.name] || ""}
                            onChange={(e) => { onMappingChange(field.name, e.target.value) }}
                            placeholder="Nhập giá trị tùy chỉnh"
                        />)
                ) : (
                    <CustomSelection
                        value={mapping[field.name] || ''}
                        onChange={(event, newValue) => {
                            onMappingChange(field.name, newValue || '');
                        }}
                        option={(webhookFields || [])
                            .filter((f) => typeof f === 'string' || !f.subFields)
                            .map((field) => typeof field === 'string' ? field : field.name)}
                    />
                )}
            </TableCell>
        </TableRow>
    );
}


export default MappingRow;