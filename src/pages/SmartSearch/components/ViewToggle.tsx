import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';

interface ViewToggleProps {
    view: 'map' | 'list';
    onChange: (view: 'map' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
    return (
        <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => {
                if (newView !== null) {
                    onChange(newView);
                }
            }}
            aria-label="view toggle"
            size="small"
            sx={{
                '& .MuiToggleButton-root': {
                    px: 2,
                    py: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                        bgcolor: 'text.primary',
                        color: 'background.paper',
                        borderColor: 'text.primary',
                        '&:hover': {
                            bgcolor: 'text.primary',
                            opacity: 0.9,
                        },
                    },
                    '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                },
            }}
        >
            <ToggleButton value="map" aria-label="map view">
                <MapIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Map
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
                <ViewListIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                List
            </ToggleButton>
        </ToggleButtonGroup>
    );
};

export default ViewToggle;
