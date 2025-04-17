import React from 'react'
import TextField from '@mui/material/TextField'

const InputField = React.memo(({ value, onChange }) => {
    return (
        <>
            <TextField
                id="outlined-basic"
                hiddenLabel
                variant="outlined"
                placeholder='Giá trị tùy chỉnh'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px", // ✅ Rounded border
                        p: "12px 8px 12px 16px",
                        display: "flex",
                        height: "40px",
                        alignItems: "center",
                        // default border
                        "& fieldset": {
                            borderColor: "#DADCE5",
                            borderWidth: "1px",
                        },
                        // on hover
                        "&:hover fieldset": {
                            borderColor: "#3D55CC", // teal (or any color you like)
                            borderWidth: "1.5px",
                        },
                        // on focus
                        "&.Mui-focused fieldset": {
                            borderColor: "#3D55CC", // darker teal (focus color)
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
})

export default InputField