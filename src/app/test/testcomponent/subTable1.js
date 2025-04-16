import React from 'react'
import { Box, Typography, Switch, FormGroup, FormControlLabel, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';


const SubTable1 = ({ subFields, onAddRow, index, rowStates, handleSubRowSwitchChange, nhanhProduct }) => {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Tên</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Cách nhập</TableCell>
                    <TableCell align='center'>Giá trị</TableCell>
                    <TableCell align='center'>Hành động <IconButton aria-label="Add" onClick={onAddRow}>
                        <LibraryAddIcon color='success' />
                    </IconButton></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {subFields.map((sub, subIndex) => (
                    <TableRow key={subIndex}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell>{sub.type}</TableCell>
                        <TableCell>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={rowStates[index]?.sub?.[subIndex]?.checked || false}
                                            onChange={handleSubRowSwitchChange(index, subIndex)}
                                        />
                                    }
                                    label={rowStates[index]?.sub?.[subIndex]?.label || "Nhanh.vn"}
                                />
                            </FormGroup>
                        </TableCell>
                        <TableCell align="center">
                            {rowStates[index]?.sub?.[subIndex]?.checked === false ? (
                                <DropdownInputFields options={nhanhProduct} />
                            ) : (
                                <InputField />
                            )}
                        </TableCell>
                        <TableCell align="center">Delete</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default SubTable1