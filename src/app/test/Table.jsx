import { Table as MuiTable, TableBody, TableCell, TableHead, TableRow, Switch, Select, MenuItem, TextField, Paper, Typography } from '@mui/material';
import { webhookFields } from "./newFields";

export default function NormalTable({ rows, onUpdateRow, title }) {
    return (
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#3D55CC', color: 'white' }}>
                {title}
            </Typography>
            <MuiTable>
                <TableHead>
                    <TableRow>
                        <TableCell>Property</TableCell>
                        <TableCell align="center">Input Type</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, i) => (
                        <TableRow key={i}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align="center">
                                <Switch
                                    checked={row.typeInput === 'map'}
                                    onChange={(e) => onUpdateRow(row.originalIndex, { 
                                        typeInput: e.target.checked ? 'map' : 'normal', 
                                        value: "" 
                                    })}
                                />
                            </TableCell>
                            <TableCell>
                                {row.typeInput === 'normal' ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="--Please type--"
                                        value={row.value}
                                        onChange={(e) => onUpdateRow(row.originalIndex, { value: e.target.value })}
                                    />
                                ) : (
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={row.value}
                                        onChange={(e) => onUpdateRow(row.originalIndex, { value: e.target.value })}
                                    >
                                        <MenuItem value="">--Chọn--</MenuItem>
                                        {webhookFields.map((item, index) => (
                                            <MenuItem value={item.name} key={index}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </Paper>
    );
}
