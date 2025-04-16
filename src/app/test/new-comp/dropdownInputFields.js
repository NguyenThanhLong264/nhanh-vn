"use client"
import React from 'react'
import { Autocomplete, TextField } from '@mui/material'

const DropdownInputFields = React.memo(({ options }) => {
    return (
        <>
            <Autocomplete
                disablePortal
                options={options}
                sx={{
                    width: 343,
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
                    "& .MuiOutlinedInput-input": {
                        padding: 0, // remove default padding
                        height: "100%", // take full height
                        display: "flex",
                        alignItems: "center", // vertically center placeholder
                    },
                    "& .MuiInputLabel-root": {
                        display: "flex",
                        alignItems: "center", // center label when it's not floating
                        top: "50%",
                        transform: "translateY(-50%)",
                        left: "16px",
                    },
                }}
                renderInput={(params) => <TextField {...params}
                    placeholder="Chọn params trong Nhanh.vn"
                    InputLabelProps={{
                        shrink: false,
                    }} />}
            />
        </>
    )
})

export default DropdownInputFields