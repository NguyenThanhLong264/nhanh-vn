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

const SpecialTable = ({ data, setData }) => {
    const [checked, setChecked] = useState(false); // local toggle
    const [label, setLabel] = useState("Nhanh.vn");

    const handleSwitch = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setLabel(isChecked ? "Tùy chỉnh" : "Nhanh.vn");
    };

    const toggleCollapse = (index) => {
        const newData = [...data];
        newData[index].open = !newData[index].open;
        setData(newData);
    }
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
                        {data.map((row, index) => (
                            <React.Fragment key={index}>
                                <TableRow>
                                    <TableCell sx={{ width: "50px" }}>
                                        {"multi" in row ? (
                                            <IconButton onClick={() => toggleCollapse(index)}>
                                                {row[index]?.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell align="center">{row.type}</TableCell>
                                    {!('multi' in row) ? (
                                        <>
                                            <TableCell align="center" sx={{ width: "180px" }}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={checked}
                                                                onChange={handleSwitch}
                                                            />
                                                        }
                                                        label={label}
                                                    />
                                                </FormGroup>
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "380px" }}>
                                                {!checked ? (
                                                    <DropdownInputFields options={nhanhStatus} />
                                                ) : (
                                                    <InputField />
                                                )}
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell />
                                            <TableCell />
                                        </>
                                    )}
                                </TableRow>

                                {'multi' in row && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ p: 0 }}>
                                            <Collapse in={row.open} timeout="auto" unmountOnExit>
                                                <Box sx={{ m: 2 }}>
                                                    {row.multi === false ? (
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Tên</TableCell>
                                                                    <TableCell>Loại</TableCell>
                                                                    <TableCell align="center">Cách nhập</TableCell>
                                                                    <TableCell align="center">Giá trị</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {row.subFields?.map((sub, subIndex) => (
                                                                    <TableRow key={subIndex}>
                                                                        <TableCell>{sub.name}</TableCell>
                                                                        <TableCell>{sub.type}</TableCell>
                                                                        <TableCell>
                                                                            <FormGroup>
                                                                                <FormControlLabel
                                                                                    control={
                                                                                        <Switch
                                                                                            checked={checked}
                                                                                            onChange={handleSwitch}
                                                                                        />
                                                                                    }
                                                                                    label={label}
                                                                                />
                                                                            </FormGroup>
                                                                        </TableCell>
                                                                        <TableCell align="center" sx={{width: "380px"}}>
                                                                            {!checked ? (
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
                                                            onAddRow={null}
                                                            index={index}
                                                            row={row}
                                                            null={null}
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
