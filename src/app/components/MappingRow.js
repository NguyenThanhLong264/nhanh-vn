export default function MappingRow({ field, webhookFields, mapping, inputTypes, onInputTypeChange, onMappingChange }) {
    const isCustom = inputTypes[field.name] === 'custom';
    const productFields = webhookFields && Array.isArray(webhookFields)
        ? (webhookFields.find((f) => f.name === 'products' && f.type === 'array')?.subFields || [])
        : [];

    if (field.type === 'array' && field.subFields) {
        return (
            <>
                <tr>
                    <td>{field.name}</td>
                    <td>{field.type}</td>
                    <td colSpan="2">
                        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
                            <thead>
                                <tr>
                                    <th>Tên trường</th>
                                    <th>Loại thông tin</th>
                                    <th>Loại input</th>
                                    <th>Webhook Data / Custom Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {field.subFields.map((subField) => {
                                    // Key đầy đủ trong mapping: custom_fields.id_0, custom_fields.value_0
                                    const subFieldKey = field.name.startsWith('order_products')
                                        ? `${field.name}.${subField.name}`
                                        : `custom_fields.${subField.name}`;
                                    const isSubCustom = inputTypes[subFieldKey] === 'custom';
                                    console.log(`Field: ${subFieldKey}, Value: ${mapping[subFieldKey]}`);
                                    return (
                                        <tr key={subFieldKey}>
                                            <td>{subField.name}</td>
                                            <td>{subField.type}</td>
                                            <td>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSubCustom}
                                                        onChange={() => onInputTypeChange(subFieldKey)}
                                                    />
                                                    {isSubCustom ? 'Custom' : 'Map with Nhanh'}
                                                </label>
                                            </td>
                                            <td>
                                                {isSubCustom ? (
                                                    <input
                                                        type="text"
                                                        value={mapping[subFieldKey] || ''}
                                                        onChange={(e) => onMappingChange(subFieldKey, e.target.value)}
                                                        placeholder="Nhập giá trị tùy chỉnh"
                                                        style={{ width: '100%' }}
                                                    />
                                                ) : (
                                                    <select
                                                        value={mapping[subFieldKey] || ''}
                                                        onChange={(e) => onMappingChange(subFieldKey, e.target.value)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <option value="">Chọn param từ webhook</option>
                                                        {(field.name === 'order_products' ? productFields : (webhookFields || []))
                                                            .filter((f) => typeof f === 'string' || !f.subFields)
                                                            .map((webhookField) => (
                                                                <option key={webhookField.name || webhookField} value={webhookField.name || webhookField}>
                                                                    {webhookField.name || webhookField}
                                                                </option>
                                                            ))}
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </td>
                </tr>
            </>
        );
    }

    return (
        <tr>
            <td>{field.name}</td>
            <td>{field.type}</td>
            <td>
                <label>
                    <input
                        type="checkbox"
                        checked={isCustom}
                        onChange={() => onInputTypeChange(field.name)}
                    />
                    {isCustom ? 'Custom' : 'Map with Nhanh'}
                </label>
            </td>
            <td>
                {isCustom ? (
                    <input
                        type="text"
                        value={mapping[field.name] || ''}
                        onChange={(e) => onMappingChange(field.name, e.target.value)}
                        placeholder="Nhập giá trị tùy chỉnh"
                        style={{ width: '100%' }}
                    />
                ) : (
                    <select
                        value={mapping[field.name] || ''}
                        onChange={(e) => onMappingChange(field.name, e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="">Chọn param từ webhook</option>
                        {(webhookFields || [])
                            .filter((f) => typeof f === 'string' || !f.subFields)
                            .map((webhookField) => (
                                <option key={webhookField.name || webhookField} value={webhookField.name || webhookField}>
                                    {webhookField.name || webhookField}
                                </option>
                            ))}
                    </select>
                )}
            </td>
        </tr>
    );
}