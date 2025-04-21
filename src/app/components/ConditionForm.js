import React from 'react'
import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material'
import conditions from '../data/condition.json'
import { useRouter } from 'next/navigation'

const ConditionForm = () => {
    const router = useRouter()
    const [editMode, setEditMode] = useState(false);
    const [values, setValues] = useState({});
    const [tempValues, setTempValues] = useState({});

    // // Load initial data from the JSON file
    useEffect(() => {
        setValues(conditions.token);
    }, []);

    // Load data from vercel edge config
    // useEffect(() => {
    //     const fetchToken = async () => {
    //         try {
    //             const res = await fetch('/api/get-token-vercel');
    //             const data = await res.json();
    //             setValues(data.token); // assuming the endpoint returns { token: { ... } }
    //         } catch (err) {
    //             console.error('Failed to load token data:', err);
    //         }
    //     };

    //     fetchToken();
    // }, []);

    const handleEdit = () => {
        setTempValues({ ...values });
        setEditMode(true);
    };

    const handleCancel = () => {
        setEditMode(false);
        setTempValues({ left: '', right: '' });
    };

    const handleSave = async () => {
        setValues(tempValues);
        setEditMode(false);

        // Save updated data to backend API or local server endpoint
        await fetch('/api/editable-box', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: tempValues })
        });

        // Save updated data to vercel edge config
        // await fetch('/api/update-token-vercel', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ token: tempValues })
        //   });
    };

    const leftFields = Object.entries(values).filter(([key]) => key.startsWith('NhanhVN'));
    const rightFields = Object.entries(values).filter(([key]) => key.startsWith('CareSoft'));
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '500px', backgroundColor: '#F5F6FA', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{
                height: '50px', bgcolor: '#3D55CC', borderRadius: '8px 8px 0 0', p: '8px', alignItems: 'center', display: 'flex',        // ✨ added
                alignItems: 'center', color: '#D9E1FC', px: '12px'
            }}>Các Token cần thiết
            </Box>
            <Box sx={{ display: 'flex', p: '12px', gap: '12px' }}>
                {/* Left Column */}
                <Box sx={{ flex: 1 }}>
                    {leftFields.map(([key]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{key}</Typography>
                            <input
                                type="text"
                                value={editMode ? tempValues[key] || '' : values[key] || ''}
                                onChange={e => setTempValues({ ...tempValues, [key]: e.target.value })}
                                disabled={!editMode}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </Box>
                    ))}
                </Box>

                {/* Right Column */}
                <Box sx={{ flex: 1 }}>
                    {rightFields.map(([key]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{key}</Typography>
                            <input
                                type="text"
                                value={editMode ? tempValues[key] || '' : values[key] || ''}
                                onChange={e => setTempValues({ ...tempValues, [key]: e.target.value })}
                                disabled={!editMode}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: '8px', gap: '8px' }}>
                {!editMode ? (
                    <>
                        <Button variant="contained" onClick={() => router.push('/config')}>Go Mapping</Button>
                        <Button variant="contained" onClick={handleEdit}>Edit</Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            color='success'
                            onClick={handleSave}>Save</Button>
                        <Button
                            variant="contained"
                            color='error'
                            onClick={handleCancel}>Cancel</Button>
                    </>
                )}
            </Box>
        </Box>
    )
}

export default ConditionForm