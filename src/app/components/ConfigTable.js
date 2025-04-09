import MappingRow from './MappingRow';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

export default function ConfigTable({ dealFields, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange }) {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Field Type</TableCell>
                    <TableCell>Input Type</TableCell>
                    <TableCell>Webhook Data / Custom Value</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {dealFields.map((field) => (
                    <MappingRow
                        key={typeof field === 'string' ? field : field.name}
                        field={field}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={onInputTypeChange}
                        onMappingChange={onMappingChange}
                    />
                ))}
            </TableBody>
        </Table>
    );
}