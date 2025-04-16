"use client"

import React from 'react'
import { useState } from 'react'
import Topbar from '../components/TopBar'
import { Box, Typography, Switch, FormGroup, FormControlLabel, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material'
import DropdownInputFields from './new-comp/dropdownInputFields'
import { nhanhParams } from "./test-data/nhanhParams"
import { specialFields } from './test-data/caresoftParamsSpecial'
import { dealFields } from './test-data/caresofrParamsNormal'
import InputField from './new-comp/inputField'
import NormarTable from './testcomponent/normalTable'
import SpecialTable from './testcomponent/specialTable'

const testingPage = () => {
    

    return (
        <>
            <Topbar />
            <Container maxWidth="lg" sx={{ marginTop: "20px" }}>
                <Box sx={{my: 4}}>
                    <NormarTable data={dealFields}/>
                </Box >
                <Box sx={{my: 4}}>
                    <SpecialTable data={specialFields}/>
                </Box>
                <Box>
                    Bảng Trường Động
                </Box>
            </Container >
        </>
    )
}

export default testingPage