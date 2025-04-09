'use client';
import { useState, useEffect } from 'react';
import ConfigTable from '../components/ConfigTable';
import { dealFields, webhookFields } from '../constants/fields';
import { 
    Container, 
    Typography, 
    Button,
    Paper,
    Box,
    Snackbar,
    Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function ConfigPage() {
    const [mapping, setMapping] = useState({});
    const [inputTypes, setInputTypes] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

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
                setSnackbar({
                    open: true,
                    message: 'Failed to load configuration',
                    severity: 'error'
                });
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
                setSnackbar({
                    open: true,
                    message: 'Configuration saved successfully',
                    severity: 'success'
                });
            } else {
                const error = await response.json();
                setSnackbar({
                    open: true,
                    message: `Failed to save: ${error.error}`,
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error('Save config error:', error);
            setSnackbar({
                open: true,
                message: 'An error occurred',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Deal Mapping Configuration
                    </Typography>
                    
                    <ConfigTable
                        dealFields={dealFields}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={handleInputTypeChange}
                        onMappingChange={handleMappingChange}
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSubmit}
                            startIcon={<SaveIcon />}
                        >
                            Save Configuration
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}