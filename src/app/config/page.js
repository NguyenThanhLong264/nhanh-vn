'use client';
import { useState, useEffect } from 'react';
import ConfigTable from '../components/ConfigTable';
import { dealFields, webhookFields } from '../constants/fields';
import Topbar from '../components/TopBar';
import { Container } from '@mui/material';

export default function ConfigPage() {
    const [mapping, setMapping] = useState({});
    const [inputTypes, setInputTypes] = useState({});

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/save-config', { method: 'GET' });
                if (response.ok) {
                    const { mapping: savedMapping, inputTypes: savedInputTypes } = await response.json();
                    setMapping(savedMapping || {});
                    setInputTypes(savedInputTypes || {});
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
            delete newMapping[field];
            return newMapping;
        });
    };

    const handleMappingChange = (field, value) => {
        setMapping((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const config = { mapping, inputTypes };
            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (response.ok) {
                alert('Cấu hình đã được lưu!');
                console.log('Saved config:', config);
            } else {
                const error = await response.json();
                alert('Lưu thất bại: ' + error.error);
            }
        } catch (error) {
            console.error('Save config error:', error);
            alert('Đã có lỗi xảy ra!');
        }
    };

    return (
        <>
            <Topbar onSaveConfig={handleSubmit} />
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