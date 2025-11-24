import React from 'react';
import { Dialog, DialogContent, IconButton, Box, useMediaQuery, useTheme } from '@mui/material';
import { Close, Launch } from '@mui/icons-material';
import PropertyDetailDialogEnhanced from './PropertyDetailDialogEnhanced';

interface PropertyItem {
  id?: string;
  [key: string]: any;
}

interface PropertyDetailOverlayProps {
  open: boolean;
  property: PropertyItem | null;
  properties?: PropertyItem[];
  currentIndex?: number;
  onClose: () => void;
  onPropertyChange?: (property: PropertyItem, index: number) => void;
  onBookmarkToggle?: (property: PropertyItem) => void;
  onIgnoreToggle?: (property: PropertyItem) => void;
  bookmarkedProperties?: Set<string>;
  ignoredProperties?: Set<string>;
  enableNavigation?: boolean;
  lazyLoadProperty?: (propertyId: string) => Promise<PropertyItem>;
}

const PropertyDetailOverlay: React.FC<PropertyDetailOverlayProps> = ({
  open,
  property,
  properties = [],
  currentIndex = 0,
  onClose,
  onPropertyChange,
  onBookmarkToggle,
  onIgnoreToggle,
  bookmarkedProperties = new Set(),
  ignoredProperties = new Set(),
  enableNavigation = true,
  lazyLoadProperty
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpenInNewTab = () => {
    if (property?.id) {
      window.open(`/property/detail/${property.id}`, '_blank');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      PaperProps={{
        sx: fullScreen
          ? { width: '100vw', height: '100vh', m: 0, borderRadius: 0 }
          : { width: '96vw', height: '96vh', m: '2vh auto', borderRadius: 2, overflow: 'hidden' }
      }}
    >
      {/* Overlay header with actions (kept minimal to avoid layout regressions) */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5, zIndex: 2 }}>
        {/* QUICK TOGGLE NOTE: To revert back to window.open flow globally, set USE_POPUP_OVERLAY=false in EnhancedPropertyListRefined.tsx */}
        <IconButton aria-label="Open in new tab" onClick={handleOpenInNewTab} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
          <Launch fontSize="small" />
        </IconButton>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
        {/* Shared content component (page and popup) */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <PropertyDetailDialogEnhanced
            property={property}
            properties={properties}
            currentIndex={currentIndex}
            onPropertyChange={onPropertyChange}
            onBookmarkToggle={onBookmarkToggle}
            onIgnoreToggle={onIgnoreToggle}
            bookmarkedProperties={bookmarkedProperties}
            ignoredProperties={ignoredProperties}
            enableNavigation={enableNavigation}
            lazyLoadProperty={lazyLoadProperty}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailOverlay;


