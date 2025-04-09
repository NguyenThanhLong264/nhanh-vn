import MappingRow from './MappingRow';

export default function ConfigTable({ dealFields, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange }) {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th>Tên params</th>
                    <th>Loại thông tin</th>
                    <th>Loại input</th>
                    <th>Webhook Data / Custom Value</th>
                </tr>
            </thead>
            <tbody>
                {dealFields.map((field) => (
                    <MappingRow
                        key={field.name}
                        field={field}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={onInputTypeChange}
                        onMappingChange={onMappingChange}
                    />
                ))}
            </tbody>
        </table>
    );
}