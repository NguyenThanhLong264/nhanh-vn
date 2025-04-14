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
    const [pipelineStageCount, setPipelineStageCount] = useState(0);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/save-config', { method: 'GET' });
                if (response.ok) {
                    const { mapping: savedMapping, inputTypes: savedInputTypes } = await response.json();
                    const cleanedMapping = {};
                    const cleanedInputTypes = {};
                    let maxCustomIndex = -1;
                    let maxPipelineStageIndex = -1;

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
                                const index = parseInt(key.split('_')[2]);
                                if (!isNaN(index)) maxCustomIndex = Math.max(maxCustomIndex, index);
                            }
                        } else if (key.startsWith('pipeline_stage_id.') && key !== 'pipeline_stage_id') {
                            cleanedMapping[key] = value;
                            cleanedInputTypes[key] = savedInputTypes[key] || 'map';
                            const index = parseInt(key.split('.')[1] || '0');
                            if (!isNaN(index)) maxPipelineStageIndex = Math.max(maxPipelineStageIndex, index);
                        } else {
                            cleanedMapping[key] = value;
                            cleanedInputTypes[key] = savedInputTypes[key] || 'map';
                        }
                    }

                    setMapping(cleanedMapping);
                    setInputTypes(cleanedInputTypes);
                    setCustomFieldCount(maxCustomIndex + 1);
                    setPipelineStageCount(maxPipelineStageIndex + 1);
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
                if (key === 'order_status' || key === 'pipeline_stage_id') {
                    continue;
                }
                if (key.startsWith('custom_fields.id_')) {
                    const valueKey = key.replace('id_', 'value_');
                    const idValue = value;
                    const valueValue = mapping[valueKey] || '';
                    if (idValue !== undefined || valueValue !== undefined) {
                        cleanedMapping[key] = idValue;
                        cleanedInputTypes[key] = inputTypes[key] || 'custom';
                        if (valueValue !== undefined) {
                            cleanedMapping[valueKey] = valueValue;
                            cleanedInputTypes[valueKey] = inputTypes[valueKey] || 'custom';
                        }
                    }
                } else {
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
        const existingIndices = Object.keys(mapping)
            .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
            .map(key => parseInt(key.match(/^custom_fields\.id_(\d+)$/)[1]));

        const maxIndex = existingIndices.length > 0 ? Math.max(...existingIndices) : -1;
        const nextIndex = maxIndex + 1;

        const newIdKey = `custom_fields.id_${nextIndex}`;
        const newValueKey = `custom_fields.value_${nextIndex}`;
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
        setCustomFieldCount(nextIndex + 1);
        console.log(`Added new custom field: ${newIdKey}, ${newValueKey}`);
    };

    const handleDeleteCustomField = (index) => {
        const idKey = `custom_fields.id_${index}`;
        const valueKey = `custom_fields.value_${index}`;

        setMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[idKey];
            delete newMapping[valueKey];

            const remainingFields = Object.keys(newMapping)
                .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
                .map(key => parseInt(key.match(/^custom_fields\.id_(\d+)$/)[1]))
                .sort((a, b) => a - b);

            const reorderedMapping = {};
            remainingFields.forEach((oldIndex, newIndex) => {
                const oldIdKey = `custom_fields.id_${oldIndex}`;
                const oldValueKey = `custom_fields.value_${oldIndex}`;
                const newIdKey = `custom_fields.id_${newIndex}`;
                const newValueKey = `custom_fields.value_${newIndex}`;
                if (newMapping[oldIdKey] !== undefined) {
                    reorderedMapping[newIdKey] = newMapping[oldIdKey];
                }
                if (newMapping[oldValueKey] !== undefined) {
                    reorderedMapping[newValueKey] = newMapping[oldValueKey];
                }
            });

            Object.keys(newMapping).forEach(key => {
                if (!key.startsWith('custom_fields.')) {
                    reorderedMapping[key] = newMapping[key];
                }
            });

            return reorderedMapping;
        });

        setInputTypes((prev) => {
            const newInputTypes = { ...prev };
            delete newInputTypes[idKey];
            delete newInputTypes[valueKey];

            const remainingFields = Object.keys(newInputTypes)
                .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
                .map(key => parseInt(key.match(/^custom_fields\.id_(\d+)$/)[1]))
                .sort((a, b) => a - b);

            const reorderedInputTypes = {};
            remainingFields.forEach((oldIndex, newIndex) => {
                const oldIdKey = `custom_fields.id_${oldIndex}`;
                const oldValueKey = `custom_fields.value_${oldIndex}`;
                const newIdKey = `custom_fields.id_${newIndex}`;
                const newValueKey = `custom_fields.value_${newIndex}`;
                if (newInputTypes[oldIdKey] !== undefined) {
                    reorderedInputTypes[newIdKey] = newInputTypes[oldIdKey];
                }
                if (newInputTypes[oldValueKey] !== undefined) {
                    reorderedInputTypes[newValueKey] = newInputTypes[oldValueKey];
                }
            });

            Object.keys(newInputTypes).forEach(key => {
                if (!key.startsWith('custom_fields.')) {
                    reorderedInputTypes[key] = newInputTypes[key];
                }
            });

            return reorderedInputTypes;
        });

        const remainingCount = Object.keys(mapping)
            .filter(key => key.match(/^custom_fields\.id_(\d+)$/)).length;
        setCustomFieldCount(remainingCount);

        console.log(`Deleted custom field: ${idKey}, ${valueKey}`);
    };

    const handleAddPipelineStageMapping = () => {
        const existingIndices = Object.keys(mapping)
            .filter(key => key.match(/^pipeline_stage_id\.(.+)$/))
            .map(key => {
                const match = key.match(/^pipeline_stage_id\.(\d+)$/);
                return match ? parseInt(match[1]) : 0;
            });

        const maxIndex = existingIndices.length > 0 ? Math.max(...existingIndices) : -1;
        const nextIndex = maxIndex + 1;

        setMapping((prev) => ({
            ...prev,
            [`pipeline_stage_id.New`]: ''
        }));
        setInputTypes((prev) => ({
            ...prev,
            [`pipeline_stage_id.New`]: 'map'
        }));
        setPipelineStageCount(nextIndex + 1);
        console.log(`Added new pipeline stage mapping: pipeline_stage_id.New`);
    };

    const handleDeletePipelineStageMapping = (status) => {
        setMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[`pipeline_stage_id.${status}`];

            return newMapping;
        });

        setInputTypes((prev) => {
            const newInputTypes = { ...prev };
            delete newInputTypes[`pipeline_stage_id.${status}`];

            return newInputTypes;
        });

        const remainingCount = Object.keys(mapping)
            .filter(key => key.match(/^pipeline_stage_id\.(.+)$/)).length;
        setPipelineStageCount(remainingCount);

        console.log(`Deleted pipeline stage mapping: pipeline_stage_id.${status}`);
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
                        onDeleteCustomField={handleDeleteCustomField}
                        onAddPipelineStageMapping={handleAddPipelineStageMapping}
                        onDeletePipelineStageMapping={handleDeletePipelineStageMapping}
                    />
                </div>
            </Container>
        </>
    );
}