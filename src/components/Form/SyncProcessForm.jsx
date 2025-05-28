import React from 'react'
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

const SyncProcessForm = ({ open, progress, total }) => {
    return (
        <Backdrop open={open} sx={{ color: "#fff", zIndex: 1300 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Syncing {progress} of {total} items...
                </Typography>
            </Box>
        </Backdrop>
    )
}

export default SyncProcessForm