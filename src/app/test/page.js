"use client"

import React from 'react'
import { useState } from 'react'
import Topbar from '../components/TopBar'
import { Box, Typography, Switch, FormGroup, FormControlLabel, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material'
import DropdownInputFields from './new-comp/dropdownInputFields'
import { nhanhParams } from "./test-data/nhanhParams"
import { dealFields } from './test-data/caresofrParams'
import InputField from './new-comp/inputField'

const testingPage = () => {
    const [rowStates, setRowStates] = useState(
        dealFields.map(() => ({ checked: false, label: "Nhanh.vn" }))
    );

    const handleRowSwitchChange = (index) => (event) => {
        const isChecked = event.target.checked;
        setRowStates((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        checked: isChecked,
                        label: isChecked ? "Tùy chỉnh" : "Nhanh.vn",
                    }
                    : item
            )
        );
    };


    return (
        <>
            <Topbar />
            <Container maxWidth="lg" sx={{ marginTop: "20px" }}>
                <Box sx={{}}>
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
                                    <TableCell align='center    '>Giá trị</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dealFields.map((row, index) => (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ width: "25%", }}>{row.name}</TableCell>
                                        <TableCell align='center'>{row.type}</TableCell>
                                        <TableCell sx={{ pl: 4 }} align='center'>
                                            < FormGroup >
                                                <FormControlLabel control={<Switch checked={rowStates[index]?.checked || false} onChange={handleRowSwitchChange(index)} />} label={rowStates[index]?.label || "Nhanh.vn"} />
                                            </FormGroup>
                                        </TableCell>
                                        <TableCell sx={{ display: "flex", justifyContent: "center" }}>
                                            {rowStates[index]?.checked === false ?
                                                <DropdownInputFields options={nhanhParams} /> :
                                                <InputField />}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box >
                <Box><InputField /></Box>
                <Box>Table 3</Box>
            </Container >
        </>
    )
}

export default testingPage