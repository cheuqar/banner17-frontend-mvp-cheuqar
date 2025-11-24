import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  IconButton,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import { 
  CloudUpload, 
  Image, 
  VideoFile, 
  Close, 
  CheckCircle,
  OpenInNew,
  Link as LinkIcon
} from '@mui/icons-material';

interface MediaInputControlProps {
  onComplete: (data: any[]) => void;
  onPanelUpdate: (panelId: string, data: any) => void;
  onExpandToCanvas?: (data: any) => void;
  isExpanded?: boolean;
  isActive?: boolean;
}

const MediaInputControl: React.FC<MediaInputControlProps> = ({ 
  onComplete, 
  onPanelUpdate,
  onExpandToCanvas,
  isExpanded = false,
  isActive = true
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsAnalyzing(true);

    // Simulate file processing and AI analysis
    setTimeout(() => {
      const processedFiles = files.map((file, index) => ({
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        analysis: {
          confidence: 0.92 + (Math.random() * 0.08),
          features: [
            'Modern Kitchen',
            'Natural Light',
            'Polished Floors',
            'Built-in Storage',
            'Open Plan Living',
            'Quality Fixtures'
          ].slice(0, 3 + Math.floor(Math.random() * 3)),
          roomType: ['Kitchen', 'Living Room', 'Bedroom', 'Bathroom'][Math.floor(Math.random() * 4)],
          suggestedDescription: `Beautiful ${['modern', 'spacious', 'bright', 'elegant'][Math.floor(Math.random() * 4)]} space with excellent natural light and quality finishes.`
        }
      }));

      setUploadedFiles(prev => [...prev, ...processedFiles]);
      setIsAnalyzing(false);

      // Update panels
      onPanelUpdate('media-gallery', { files: [...uploadedFiles, ...processedFiles] });
    }, 2000);
  };

  const handleRemoveFile = (fileId: string) => {
    if (!isActive) return;
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleComplete = () => {
    if (uploadedFiles.length > 0) {
      onComplete(uploadedFiles);
    }
  };

  const handleExpandToCanvas = () => {
    if (onExpandToCanvas && uploadedFiles.length > 0) {
      onExpandToCanvas({
        id: 'media-input',
        title: 'Media Gallery',
        type: 'media',
        data: uploadedFiles,
        isActive: isActive
      });
    }
  };

  // If expanded to canvas, show link button state
  if (isExpanded) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          bgcolor: '#f8fafc',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#2563eb',
            bgcolor: '#eff6ff'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinkIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ 
              color: '#2563eb',
              fontWeight: 500,
              mb: 0.5
            }}>
              Media Gallery - Expanded in Canvas
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {uploadedFiles.length > 0 ? `${uploadedFiles.length} files uploaded` : 'Click to focus canvas tab'}
            </Typography>
          </Box>
          <Chip 
            label="Canvas" 
            size="small"
            sx={{ 
              bgcolor: '#2563eb',
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with Expand Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
          Property Media
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {uploadedFiles.length > 0 && (
            <IconButton
              size="small"
              onClick={handleExpandToCanvas}
              sx={{ 
                color: '#6b7280',
                '&:hover': { color: '#2563eb' }
              }}
              title="Expand to Canvas"
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Upload Area */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderColor: '#cbd5e1',
          bgcolor: isActive ? '#fafbfc' : '#f9fafb',
          cursor: isActive ? 'pointer' : 'default',
          '&:hover': isActive ? {
            borderColor: '#2563eb',
            bgcolor: '#eff6ff'
          } : {}
        }}
        onClick={() => isActive && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={!isActive}
        />
        
        <CloudUpload sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
        <Typography variant="body2" sx={{ color: '#1f2937', mb: 1 }}>
          {isActive ? 'Click to upload photos and videos' : 'Upload complete'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Support for JPG, PNG, MP4, MOV files
        </Typography>
      </Paper>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            🤖 AI analyzing images...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
            Analyzed Media ({uploadedFiles.length})
          </Typography>
          
                     <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
             {uploadedFiles.map(file => (
               <Box key={file.id}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb', position: 'relative' }}>
                  {isActive && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(file.id)}
                      sx={{ 
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {file.type.startsWith('image/') ? (
                      <Image sx={{ fontSize: 16, color: '#6b7280' }} />
                    ) : (
                      <VideoFile sx={{ fontSize: 16, color: '#6b7280' }} />
                    )}
                    <Typography variant="caption" sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {file.analysis.roomType}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {file.analysis.features.slice(0, 2).map((feature: string) => (
                      <Chip
                        key={feature}
                        label={feature}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 18 }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 12, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: '#10b981' }}>
                      {Math.round(file.analysis.confidence * 100)}% confident
                    </Typography>
                  </Box>
                                 </Paper>
               </Box>
             ))}
           </Box>
        </Box>
      )}

      {/* Action Button */}
      {uploadedFiles.length > 0 && (
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={!isActive}
          sx={{ alignSelf: 'flex-start', mt: 1 }}
        >
          Confirm Media
        </Button>
      )}

      {/* Inactive State Notice */}
      {!isActive && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="caption">
            ℹ️ Media upload has been completed and is no longer editable
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default MediaInputControl; 