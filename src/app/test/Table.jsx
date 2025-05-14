import { Table as MuiTable, TableBody, TableCell, TableHead, TableRow, Switch, Select, MenuItem, TextField, Paper, Typography } from '@mui/material';
import { webhookFields } from "./newFields";
import CustomizeSwitch from '@/components/Switch';
import CustomTextField from '@/components/customTextField';
import CustomSelection from '@/components/CustomSelection';

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
                                <CustomizeSwitch checked={row.typeInput === 'map'}
                                    onChange={(e) => onUpdateRow(row.originalIndex, {
                                        typeInput: e.target.checked ? 'map' : 'normal',
                                        value: ""
                                    })}
                                    label={"Map with NhanhVN"} />
                            </TableCell>
                            <TableCell>
                                {row.typeInput === 'normal' ? (
                                    <CustomTextField
                                        placeholder="--Please type--"
                                        value={row.value}
                                        onChange={(e) => onUpdateRow(row.originalIndex, { value: e.target.value })}
                                        multiline={row.name === 'comment' || row.name === "comment.body"}
                                        minRows={1}
                                    />
                                ) : (
                                    <CustomSelection
                                        value={row.value}
                                        onChange={(_, newValue) => onUpdateRow(row.originalIndex, { value: newValue })}
                                        option={webhookFields.map(item => item.name)}
                                    />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </Paper>
    );
}
