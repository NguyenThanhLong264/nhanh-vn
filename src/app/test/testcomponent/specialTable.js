import React, { useState } from 'react';
import {
    Box, Typography, Switch, FormGroup, FormControlLabel,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, IconButton, Collapse,
    Tab
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DropdownInputFields from '../new-comp/dropdownInputFields';
import InputField from '../new-comp/inputField';
import { nhanhParams } from "../test-data/nhanhParams";
import { nhanhProduct } from '../test-data/nhanhProduct';
import { nhanhStatus } from '../test-data/nhanhStatus';
import SubTable1 from './subTable1';

const SpecialTable = ({ data }) => {
    const [localData, setLocalData] = useState(() => [...data]);
    const [rowStates, setRowStates] = useState(
        localData.map(row => {
            if ('multi' in row) {
                return {
                    open: true,
                }
            };
            if (row.subFields) {
                return {
                    sub: row.subFields.map(() => ({
                        checked: false,
                        label: "Nhanh.vn"
                    }))
                };
            }
            return {
                checked: false,
                label: "Nhanh.vn"
            };
        })
    );


    const handleRowSwitchChange = (index) => (event) => {
        const isChecked = event.target.checked;
        setRowStates((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, checked: isChecked, label: isChecked ? "Tùy chỉnh" : "Nhanh.vn" }
                    : item
            )
        );
    };

    const handleSubRowSwitchChange = (parentIndex, subIndex) => (event) => {
        const isChecked = event.target.checked;
        setRowStates(prev =>
            prev.map((row, i) => {
                if (i !== parentIndex) return row;
                return {
                    ...row,
                    sub: row.sub.map((subItem, j) =>
                        j === subIndex
                            ? {
                                ...subItem,
                                checked: isChecked,
                                label: isChecked ? "Tùy chỉnh" : "Nhanh.vn",
                            }
                            : subItem
                    )
                };
            })
        );
    };

    const toggleCollapse = (index) => {
        setRowStates((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, open: !item.open }
                    : item
            )
        );
    };

    const handleAddSubRow = (parentIndex) => {
        const newSub = { name: '', type: '', checked: false, label: 'Nhanh.vn' };

        setLocalData(prevData => {
            const newData = [...prevData];
            if (!newData[parentIndex].subFields) {
                newData[parentIndex].subFields = [];
            }
            newData[parentIndex].subFields.push({ name: '', type: '' }); // add default empty field
            return newData;
        });

        setRowStates(prevStates => {
            const newStates = [...prevStates];
            if (!newStates[parentIndex].sub) {
                newStates[parentIndex].sub = [];
            }
            newStates[parentIndex].sub.push({ checked: false, label: 'Nhanh.vn' });
            return newStates;
        });
    };


    return (
        <>
            <Typography variant="h4">Bảng Tính Năng Đặc Thù</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Params</TableCell>
                            <TableCell align="center">Loại thông tin</TableCell>
                            <TableCell align="center">Cách nhập</TableCell>
                            <TableCell align="center">Giá trị</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {localData.map((row, index) => (
                            <React.Fragment key={index}>
                                <TableRow>
                                    <TableCell>
                                        {'multi' in row ? (
                                            <IconButton onClick={() => toggleCollapse(index)}>
                                                {rowStates[index]?.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell align="center">{row.type}</TableCell>
                                    {!('multi' in row) && (
                                        <><TableCell align="center">
                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={rowStates[index]?.checked || false}
                                                            onChange={handleRowSwitchChange(index)}
                                                        />
                                                    }
                                                    label={rowStates[index]?.label || "Nhanh.vn"}
                                                />
                                            </FormGroup>
                                        </TableCell>
                                            <TableCell align="center" sx={{ display: "flex", justifyContent: "center" }}>
                                                {rowStates[index]?.checked === false ? (
                                                    <DropdownInputFields options={nhanhParams} />
                                                ) : (
                                                    <InputField />
                                                )}
                                            </TableCell>
                                        </>)}
                                </TableRow>

                                {'multi' in row && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ p: 0 }}>
                                            <Collapse in={rowStates[index]?.open} timeout="auto" unmountOnExit>
                                                <Box sx={{ m: 2 }}>
                                                    {/* Replace with sub-fields UI later */}
                                                    {(row.multi === false) ? (
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Tên</TableCell>
                                                                    <TableCell>Loại</TableCell>
                                                                    <TableCell align='center'>Cách nhập</TableCell>
                                                                    <TableCell align='center'>Giá trị</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody align="center">
                                                                {row.subFields?.map((sub, subIndex) => (
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
                                                                        <TableCell align='center' sx={{ display: "flex", justifyContent: "center" }}>
                                                                            {rowStates[index]?.sub?.[subIndex]?.checked === false ? (
                                                                                <DropdownInputFields options={row.name === 'order_status' ? nhanhStatus : nhanhProduct} />
                                                                            ) : (
                                                                                <InputField />
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <SubTable1
                                                            subFields={row.subFields}
                                                            onAddRow={handleAddSubRow}
                                                            index={index}
                                                            rowStates={rowStates}
                                                            handleSubRowSwitchChange={handleSubRowSwitchChange}
                                                            nhanhProduct={nhanhProduct}
                                                        />
                                                    )}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer >
        </>
    );
};

export default SpecialTable;
