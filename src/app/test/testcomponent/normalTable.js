import React from 'react'
import { useState, useCallback } from 'react'
import { Box, Typography, Switch, FormGroup, FormControlLabel, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material'
import DropdownInputFields from '../new-comp/dropdownInputFields'
import InputField from '../new-comp/inputField'
import { nhanhParams } from "../test-data/nhanhParams"

const NormarTable = ({ data, setData }) => {
    const handleChange = (index, field, value) => {
        const updated = [...data];
        updated[index] = { ...updated[index], [field]: String(value) };
        setData(updated);
    }
    const handleValueChange = useCallback((index) => (value) => {
        handleChange(index, 'inputValue', value);
    }, [data]);

    const handleInputTypeChange = useCallback((index) => (value) => {
        handleChange(index, 'inputType', value);
    }, [data]);
    return (
        <>
            <Typography variant="h3" color="initial">Bảng Tính Năng Thường</Typography>
            <TableContainer component={Paper}>
                <Table sx={{
                    width: '100%',
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Params</TableCell>
                            <TableCell align='center'>Loại thông tin</TableCell>
                            <TableCell align='center'>Cách nhập</TableCell>
                            <TableCell align='center'>Giá trị</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <MappingRow
                                key={index}
                                row={row}
                                nhanhParams={nhanhParams}
                                onValueChange={handleValueChange(index)}
                                onInputTypeChange={handleInputTypeChange(index)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default NormarTable

const MappingRow = React.memo(({ row, nhanhParams, onValueChange, onInputTypeChange }) => {
    const [checked, setChecked] = useState(false);
    const [label, setLabel] = useState(!checked ? "Nhanh.vn" : "Tùy chỉnh");

    const handleChange = (event) => {
        const isCustom = event.target.checked;
        setChecked(isCustom);
        const newType = isCustom ? "tuy chinh" : "nhanh";
        setLabel(isCustom ? "Tùy chỉnh" : "Nhanh.vn");
        onInputTypeChange(newType);
    };

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell sx={{ width: "25%" }}>{row.name}</TableCell>
            <TableCell align="center">{row.type}</TableCell>
            <TableCell sx={{ pl: 4 }} align="center">
                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={checked} onChange={handleChange} />}
                        label={label}
                    />
                </FormGroup>
            </TableCell>
            <TableCell sx={{ display: "flex", justifyContent: "center" }}>
                {checked ? <InputField value={row.inputValue || ""} onChange={(val) => onValueChange(val)} />
                    : <DropdownInputFields options={nhanhParams} value={row.inputValue || ""} onChange={(val) => onValueChange(val)} />}
            </TableCell>
        </TableRow>
    );
});
