"use client"
import React from 'react'
import { Box, Button, Container, Table, TableBody, TableHead, TableRow, TableCell } from '@mui/material'
import { useState } from 'react'
import { dealFields, webhookFields } from '../constants/fields'

const TestPage = () => {
    const [ruleSet, setRuleSet] = useState([])


    return (
        <Box>
            <Button>Save config</Button>
            <Container maxWidth="lg">
                <h2>Table 1</h2>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Mapping</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dealFields.map((field, index) => (
                            <TableRow key={index}>
                                <TableCell>{field.name}</TableCell>
                                <TableCell>{field.type}</TableCell>
                                <TableCell>Mapping {index + 1}</TableCell>
                                <TableCell>Value {index + 1}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Container>
        </Box >
    )
}

export default TestPage