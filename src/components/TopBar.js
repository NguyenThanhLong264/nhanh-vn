'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import CustomizeIconButton from './CustomizeIconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useRouter } from 'next/navigation';

const Topbar = ({ onSaveConfig }) => {
    const router = useRouter();
    return (
        <AppBar position="sticky" sx={{ top: 0, zIndex: 1100, backgroundColor: '#3D55CC' }}>
            <Toolbar>
                <CustomizeIconButton
                    icon={<ArrowBackIosIcon sx={{ color: 'white' }} />}
                    onClick={() => router.push('/')}
                />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Cấu hình Webhook
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        color='success'
                        onClick={onSaveConfig}
                    >
                        Lưu cấu hình
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;