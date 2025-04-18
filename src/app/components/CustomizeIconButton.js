import React from 'react'
import IconButton from '@mui/material/IconButton'

const CustomizeIconButton = ({ icon, onClick }) => {
    return (
        <div>
            <IconButton aria-label="" onClick={onClick}>
                {icon}
            </IconButton>
        </div>
    )
}

export default CustomizeIconButton