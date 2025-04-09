'use client'; // Đánh dấu là client-side component
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Màu xanh chủ đạo
        },
        secondary: {
            main: '#dc004e', // Màu đỏ phụ
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif', // Font chữ hiện đại
    },
});

export default theme;