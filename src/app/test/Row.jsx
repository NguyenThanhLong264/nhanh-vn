import { webhookFields } from "./newFields";

export default function Row({ index, property, rowConfig, onUpdate }) {
    const { useDropdown, value } = rowConfig;

    return (
        <tr>
            <td
                style={{
                    border: '1px solid black',
                    padding: '8px',
                }}
            >
                {property}
            </td>
            <td
                style={{
                    border: '1px solid black',
                    padding: '8px',
                    textAlign: 'center',
                }}
            >
                <input
                    type="checkbox"
                    checked={useDropdown}
                    onChange={(e) => onUpdate(index, { useDropdown: e.target.checked })}
                />
            </td>
            <td
                style={{
                    border: '1px solid black',
                    padding: '8px',
                }}
            >
                {useDropdown ? (
                    <select
                        value={value}
                        onChange={(e) => onUpdate(index, { value: e.target.value })}
                        style={{
                            border: '1px solid black',
                            borderRadius: '4px',
                            padding: '4px',
                            width: '100%',
                        }}
                    >
                        <option value="">--Chọn--</option>
                        {webhookFields.map((item, index) => (<option value={item.name} key={index}>{item.name}</option>))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onUpdate(index, { value: e.target.value })}
                        style={{
                            border: '1px solid black',
                            borderRadius: '4px',
                            padding: '4px',
                            width: '100%',
                        }}
                    />
                )}
            </td>
        </tr>
    );
}
