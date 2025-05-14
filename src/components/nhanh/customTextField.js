import React from 'react'
import TextField from '@mui/material/TextField'

const CustomTextField = ({ value, onChange, placeholder = '', multiline = false, minRows = 3 }) => {
    return (
        <>
            <TextField
                fullWidth
                multiline={multiline}
                minRows={multiline ? minRows : undefined}
                hiddenLabel
                variant="outlined"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px", // ✅ Rounded border
                        p: multiline ? "8.5px 8px 8.5px 16px" : "12px 8px 12px 16px",
                        display: "flex",
                        height: multiline ? "auto" : "40px",
                        alignItems: "center",
                        // default border
                        "& fieldset": {
                            borderColor: "#DADCE5",
                            borderWidth: "1px",
                        },
                        // on hover
                        "&:hover fieldset": {
                            borderColor: "#3D55CC",
                            borderWidth: "1.5px",
                        },
                        // on focus
                        "&.Mui-focused fieldset": {
                            borderColor: "#3D55CC",
                            borderWidth: "2px",
                        },
                    },
                    "& .MuiInputBase-input": {
                        p: 0
                    },
                }}
            />
        </>
    )
}

export default CustomTextField