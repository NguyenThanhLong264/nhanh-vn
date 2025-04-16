import React from 'react'
import { useState } from 'react'
import { Box, Typography, Switch, FormGroup, FormControlLabel, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material'
import DropdownInputFields from '../new-comp/dropdownInputFields'
import { nhanhParams } from "../test-data/nhanhParams"
import InputField from '../new-comp/inputField'

const NormarTable = ({ data }) => {
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
                            <MappingRow key={index} row={row}
                                nhanhParams={nhanhParams}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default NormarTable

const MappingRow = ({ row, nhanhParams }) => {
    const [checked, setChecked] = useState(false);
    const [label, setLabel] = useState("Nhanh.vn");

    const handleChange = (event) => {
        const newChecked = event.target.checked;
        setChecked(newChecked);
        setLabel(newChecked ? "Tùy chỉnh" : "Nhanh.vn");
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
                {checked ? <InputField /> : <DropdownInputFields options={nhanhParams} />}
            </TableCell>
        </TableRow>
    );
};
