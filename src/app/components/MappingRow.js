import {
    TableRow,
    TableCell,
    Switch,
    TextField,
    MenuItem,
    FormControlLabel,
    Table,
    TableHead,
    TableBody,
    Collapse,
    Box,
    IconButton,
    Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';

export default function MappingRow({ field, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange }) {
    const [expanded, setExpanded] = useState(false);
    const fieldName = typeof field === 'string' ? field : field.name;
    const fieldType = typeof field === 'string' ? 'string' : field.type;
    const renderWebhookOptions = () => {
        return webhookFields.map((wField) => {
            if (typeof wField === 'string') {
                return (
                    <MenuItem key={wField} value={wField}>
                        {wField}
                    </MenuItem>
                );
            }
            // Skip array fields in main dropdown
            return null;
        });
    };

    const renderArraySubFields = () => {
        if (!isArray || !field.subFields) return null;

        const productsField = webhookFields.find(f =>
            typeof f === 'object' && f.name === 'products'
        );

        return field.subFields.map((subField) => (
            <TableRow key={`${fieldName}.${subField.name}`}>
                <TableCell style={{ paddingLeft: 32 }}>
                    {subField.name}
                </TableCell>
                <TableCell>{subField.type}</TableCell>
                <TableCell>
                    <Switch
                        checked={inputTypes[`${fieldName}.${subField.name}`] === 'custom'}
                        onChange={() => onInputTypeChange(`${fieldName}.${subField.name}`)}
                    />
                </TableCell>
                <TableCell>
                    {inputTypes[`${fieldName}.${subField.name}`] === 'custom' ? (
                        <TextField
                            fullWidth
                            value={mapping[`${fieldName}.${subField.name}`] || ''}
                            onChange={(e) => onMappingChange(`${fieldName}.${subField.name}`, e.target.value)}
                        />
                    ) : (
                        <Select
                            fullWidth
                            value={mapping[`${fieldName}.${subField.name}`] || ''}
                            onChange={(e) => onMappingChange(`${fieldName}.${subField.name}`, e.target.value)}
                        >
                            <MenuItem value="">Select field</MenuItem>
                            {productsField?.subFields.map(pField => (
                                <MenuItem key={pField.name} value={`products.${pField.name}`}>
                                    products.{pField.name}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </TableCell>
            </TableRow>
        ));
    };

    const isCustom = inputTypes[field.name] === 'custom';
    const isArray = field.type === 'array';

    const arrayFields = isArray ? [
        { name: 'sku', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'price', type: 'number' },
        { name: 'total', type: 'number' }
    ] : [];

    const getWebhookMenuItems = () => {
        return webhookFields.map((webhookField) => {
            if (typeof webhookField === 'string') {
                return (
                    <MenuItem key={webhookField} value={webhookField}>
                        {webhookField}
                    </MenuItem>
                );
            }
            // Skip array type fields in the main dropdown
            return null;
        }).filter(Boolean);
    };

    const getProductWebhookFields = () => {
        const productsField = webhookFields.find(field =>
            typeof field === 'object' && field.name === 'products'
        );
        return productsField?.subFields.map(subField => `products.${subField.name}`) || [];
    };

    return (
        <>
            <TableRow>
                <TableCell>
                    {isArray && (
                        <IconButton
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                    {field.name}
                </TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isCustom}
                                onChange={() => onInputTypeChange(field.name)}
                            />
                        }
                        label={isCustom ? 'Custom' : 'Map'}
                    />
                </TableCell>
                <TableCell>
                    {isCustom ? (
                        <TextField
                            fullWidth
                            size="small"
                            value={mapping[field.name] || ''}
                            onChange={(e) => onMappingChange(field.name, e.target.value)}
                            placeholder="Enter custom value"
                        />
                    ) : (
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={mapping[field.name] || ''}
                            onChange={(e) => onMappingChange(field.name, e.target.value)}
                        >
                            <MenuItem value="">Select webhook parameter</MenuItem>
                            {getWebhookMenuItems()}
                        </TextField>
                    )}
                </TableCell>
            </TableRow>
            {isArray && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Array Item Fields
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Field Name</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Input Type</TableCell>
                                            <TableCell>Mapping</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {arrayFields.map((arrayField) => (
                                            <TableRow key={arrayField.name}>
                                                <TableCell>{arrayField.name}</TableCell>
                                                <TableCell>{arrayField.type}</TableCell>
                                                <TableCell>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                size="small"
                                                                checked={inputTypes[`${field.name}.${arrayField.name}`] === 'custom'}
                                                                onChange={() => onInputTypeChange(`${field.name}.${arrayField.name}`)}
                                                            />
                                                        }
                                                        label={inputTypes[`${field.name}.${arrayField.name}`] === 'custom' ? 'Custom' : 'Map'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {inputTypes[`${field.name}.${arrayField.name}`] === 'custom' ? (
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={mapping[`${field.name}.${arrayField.name}`] || ''}
                                                            onChange={(e) => onMappingChange(`${field.name}.${arrayField.name}`, e.target.value)}
                                                            placeholder="Enter value"
                                                        />
                                                    ) : (
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            size="small"
                                                            value={mapping[`${field.name}.${arrayField.name}`] || ''}
                                                            onChange={(e) => onMappingChange(`${field.name}.${arrayField.name}`, e.target.value)}
                                                        >
                                                            <MenuItem value="">Select field</MenuItem>
                                                            {getProductWebhookFields().map((webhookField) => (
                                                                <MenuItem key={webhookField} value={webhookField}>
                                                                    {webhookField}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}