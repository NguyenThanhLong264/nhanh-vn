"use client"

import React from 'react'
import { useState } from 'react'
import Topbar from '../components/TopBar'
import { Box, Typography, Switch, FormGroup, FormControlLabel, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from '@mui/material'
import NormarTable from './testcomponent/normalTable'
import SpecialTable from './testcomponent/specialTable'
import CustomFieldsTable from './testcomponent/customFieldsTable'
import { dealFields } from './test-data/caresofrParamsNormal'
import { specialFields } from './test-data/caresoftParamsSpecial'
const testingPage = () => {
    const [data1, setData1] = useState(dealFields)
    const [data2, setData2] = useState(specialFields)
    const [data3, setData3] = useState([])


    const handleSaveConfig = () => {
        const finalRule = [
            ...data1,
            ...data2,
            ...data3
        ]
        console.log("Save config clicked", finalRule)
    }
    return (
        <>
            <Topbar />
            <Button onClick={handleSaveConfig}>Lưu cấu hình</Button>
            <Container maxWidth="lg" sx={{ marginTop: "20px" }}>
                <Box sx={{ my: 4 }}>
                    <NormarTable data={data1} setData={setData1} />
                </Box >
                <Box sx={{ my: 4 }}>
                    <SpecialTable data={data2} setData={setData2} />
                </Box>
                <Box>
                    <CustomFieldsTable data={data3} setData={setData3} />
                </Box>
            </Container >
        </>
    )
}

export default testingPage