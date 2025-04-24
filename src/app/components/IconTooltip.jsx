import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

const IconTooltip = ({ icon, text }) => {
    return (
        <Tooltip
            title={
                <Typography
                    sx={{
                        whiteSpace: 'pre-line',
                        fontSize: '0.85rem',       // Adjust font size
                        lineHeight: 1.6,           // Line spacing
                        color: 'white',             // Text color
                    }}
                >
                    {text}
                </Typography>
            }
            arrow
            slotProps={{
                tooltip: {
                    sx: {
                        backgroundColor: '#3D55CC',
                        color: '#333',
                        fontSize: '0.85rem',
                        boxShadow: 2,
                        '& .MuiTooltip-arrow': {
                            color: '#3D55CC',
                        },
                    },
                },
            }}
        >
            <IconButton size="small">
                {icon}
            </IconButton>
        </Tooltip>
    );
};

export default IconTooltip;
