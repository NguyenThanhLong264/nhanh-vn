'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Topbar = ({ onSaveConfig }) => { // Nhận prop onSaveConfig
    const handleAddDynamicField = () => {
        console.log('Thêm trường động clicked');
    };

    return (
        <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Cấu hình Webhook
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleAddDynamicField}
                        sx={{ mr: 2 }}
                    >
                        Thêm trường động
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSaveConfig} // Gọi hàm từ props
                    >
                        Lưu cấu hình
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;