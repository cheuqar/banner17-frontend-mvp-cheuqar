import React from 'react';
import { Box, Typography } from '@mui/material';

interface Property {
  id: string;
  title: string;
}

interface MinimalListProps {
  properties: Property[];
}

const EnhancedPropertyListMinimal: React.FC<MinimalListProps> = ({
  properties
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">Test Component</Typography>
      {properties.length > 0 && (
        <Box>
          {properties.map((property) => (
            <Box key={property.id}>
              <Typography>{property.title}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedPropertyListMinimal;
