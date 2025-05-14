'use client';
import { useState, useEffect } from 'react';
import ConfigTable from '../../components/ConfigTable';
import { dealFields, webhookFields } from '../test/newFields';
import Topbar from '../../components/TopBar';
import { Container } from '@mui/material';
import NormalTable from '../test/Table';
import SpecialTable from '../test/specialTable';
import ProductTable from '../test/productTable';
import CustomFieldsTable from '../test/customFieldTable';

export default function ConfigPage() {
    const [rowsConfig, setRowsConfig] = useState([]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/test/config');
                if (response.ok) {
                    const data = await response.json();
                    setRowsConfig(data);
                }
            } catch (error) {
                console.error('Load config error:', error);
                setRowsConfig([]);
            }
        };
        fetchConfig();
    }, []);

    const handleUpdateRow = (originalIndex, updatedRow) => {
        setRowsConfig(prev => {
            const newRows = [...prev];
            newRows[originalIndex] = { ...newRows[originalIndex], ...updatedRow };
            return newRows;
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/test/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rowsConfig)
            });
            if (response.ok) {
                alert('Configuration saved successfully!');
            }
        } catch (error) {
            console.error('Save config error:', error);
            alert('Failed to save configuration');
        }
    };

    const normalRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter(row => row.typeInput === 'normal' || row.typeInput === 'map');

    const specialRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter(row => row.typeInput === 'pipeline_stage' || row.typeInput === 'status');

    const productRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter(row => row.typeInput === 'product');

    const customRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter(row => row.typeInput === 'custom');

    return (
        <>
            <Topbar onSaveConfig={handleSave} />
            <Container sx={{ mt: 4 }}>
                <div style={{ padding: '20px' }}>
                    <h1>Cấu Trúc Kết Nối Giữa NhanhVN và CareSoft</h1>
                    <NormalTable
                        title="Normal Fields"
                        rows={normalRows}
                        onUpdateRow={handleUpdateRow}
                    />
                    <SpecialTable
                        title="Special Fields"
                        rows={specialRows}
                        onUpdateRow={handleUpdateRow}
                    />
                    <ProductTable
                        title="Order Product Fields"
                        rows={productRows}
                        onUpdateRow={handleUpdateRow}
                    />
                    <CustomFieldsTable
                        title="Custom Fields"
                        rows={customRows}
                        onUpdateRow={handleUpdateRow}
                    />
                </div>
            </Container>
        </>
    );
}