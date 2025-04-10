'use client';
import { useState, useEffect } from 'react';
import ConfigTable from '../components/ConfigTable';
import { dealFields, webhookFields } from '../constants/fields';
import Topbar from '../components/TopBar';
import { Container } from '@mui/material';

export default function ConfigPage() {
    const [mapping, setMapping] = useState({});
    const [inputTypes, setInputTypes] = useState({});
    const [customFieldCount, setCustomFieldCount] = useState(0);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/save-config', { method: 'GET' });
                if (response.ok) {
                    const { mapping: savedMapping, inputTypes: savedInputTypes } = await response.json();
                    const cleanedMapping = {};
                    const cleanedInputTypes = {};
                    let count = 0;

                    for (const [key, value] of Object.entries(savedMapping || {})) {
                        if (key.startsWith('custom_fields.id_')) {
                            const valueKey = key.replace('id_', 'value_');
                            const idValue = value;
                            const valueValue = savedMapping[valueKey] || '';
                            if (idValue || valueValue) {
                                cleanedMapping[key] = idValue;
                                cleanedInputTypes[key] = savedInputTypes[key] || 'custom';
                                cleanedMapping[valueKey] = valueValue;
                                cleanedInputTypes[valueKey] = savedInputTypes[valueKey] || 'custom';
                                count = Math.max(count, parseInt(key.split('_')[1]) + 1);
                            }
                        } else if (
                            key === 'username' ||
                            key === 'subject' ||
                            key === 'phone' ||
                            key === 'assignee_id' ||
                            key === 'value' ||
                            key === 'comment' ||
                            key === 'order_address_detail' ||
                            key === 'order_buyer_note' ||
                            key === 'order_city_id' ||
                            key === 'order_district_id' ||
                            key === 'order_ward_id' ||
                            key === 'order_receiver_name' ||
                            key === 'order_receiver_phone' ||
                            key === 'order_shipping_fee' ||
                            key === 'order_tracking_url' ||
                            key === 'pipeline_id' ||
                            key === 'pipeline_stage_id' ||
                            key === 'email' ||
                            key.startsWith('order_products.')
                        ) {
                            cleanedMapping[key] = value;
                            cleanedInputTypes[key] = savedInputTypes[key] || 'map';
                        }
                    }

                    setMapping(cleanedMapping);
                    setInputTypes(cleanedInputTypes);
                    setCustomFieldCount(count);
                }
            } catch (error) {
                console.error('Load config error:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleInputTypeChange = (field) => {
        setInputTypes((prev) => ({
            ...prev,
            [field]: prev[field] === 'custom' ? 'map' : 'custom',
        }));
        setMapping((prev) => {
            const newMapping = { ...prev };
            if (newMapping[field] && inputTypes[field] === 'custom') {
                delete newMapping[field];
            }
            return newMapping;
        });
    };

    const handleMappingChange = (field, value) => {
        console.log(`Updating field: ${field} with value: ${value}`);
        setMapping((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const cleanedMapping = {};
            const cleanedInputTypes = {};
            for (const [key, value] of Object.entries(mapping)) {
                // Chỉ giữ các key hợp lệ
                if (key.startsWith('custom_fields.id_')) {
                    const valueKey = key.replace('id_', 'value_');
                    const idValue = value;
                    const valueValue = mapping[valueKey] || '';
                    if (idValue || valueValue) {
                        cleanedMapping[key] = idValue;
                        cleanedInputTypes[key] = inputTypes[key] || 'custom';
                        cleanedMapping[valueKey] = valueValue;
                        cleanedInputTypes[valueKey] = inputTypes[valueKey] || 'custom';
                    }
                } else if (
                    key === 'username' ||
                    key === 'subject' ||
                    key === 'phone' ||
                    key === 'assignee_id' ||
                    key === 'value' ||
                    key === 'comment' ||
                    key === 'order_address_detail' ||
                    key === 'order_buyer_note' ||
                    key === 'order_city_id' ||
                    key === 'order_district_id' ||
                    key === 'order_ward_id' ||
                    key === 'order_receiver_name' ||
                    key === 'order_receiver_phone' ||
                    key === 'order_shipping_fee' ||
                    key === 'order_tracking_url' ||
                    key === 'pipeline_id' ||
                    key === 'pipeline_stage_id' ||
                    key === 'email' ||
                    key.startsWith('order_products.')
                ) {
                    cleanedMapping[key] = value;
                    cleanedInputTypes[key] = inputTypes[key] || 'map';
                }
            }

            const config = { mapping: cleanedMapping, inputTypes: cleanedInputTypes };
            console.log('Saved config:', config);
            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (response.ok) {
                alert('Cấu hình đã được lưu!');
            } else {
                const error = await response.json();
                alert('Lưu thất bại: ' + error.error);
            }
        } catch (error) {
            console.error('Save config error:', error);
            alert('Đã có lỗi xảy ra!');
        }
    };

    const handleAddCustomField = () => {
        const newIdKey = `custom_fields.id_${customFieldCount}`;
        const newValueKey = `custom_fields.value_${customFieldCount}`;
        setMapping((prev) => ({
            ...prev,
            [newIdKey]: '',
            [newValueKey]: '',
        }));
        setInputTypes((prev) => ({
            ...prev,
            [newIdKey]: 'custom',
            [newValueKey]: 'custom',
        }));
        setCustomFieldCount(prev => prev + 1);
        console.log(`Added new custom field: ${newIdKey}, ${newValueKey}`);
    };

    return (
        <>
            <Topbar onSaveConfig={handleSubmit} onAddCustomField={handleAddCustomField} />
            <Container sx={{ mt: 4 }}>
                <div style={{ padding: '20px' }}>
                    <h1>Cấu hình ánh xạ Deal cho Web 2</h1>
                    <ConfigTable
                        dealFields={dealFields}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={handleInputTypeChange}
                        onMappingChange={handleMappingChange}
                    />
                </div>
            </Container>
        </>
    );
}