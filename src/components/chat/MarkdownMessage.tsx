import React from 'react';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Import highlight.js CSS

interface MarkdownMessageProps {
  content: string;
  isUser: boolean;
}

// Component to render interactive HTML maps
const InteractiveMapRenderer: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const createDataUri = (html: string) => {
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#1976d2', fontWeight: 600 }}>
        🗺️ Interactive Property Map
      </Typography>
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <iframe
          src={createDataUri(htmlContent)}
          style={{
            width: '100%',
            height: '400px',
            border: 'none',
            borderRadius: '8px'
          }}
          title="Interactive Property Map"
          sandbox="allow-scripts allow-same-origin"
        />
      </Box>
      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666', textAlign: 'center' }}>
        🏠 Click on markers to view property details • 📍 Hover for quick info
      </Typography>
    </Box>
  );
};

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isUser }) => {
  // Detect and extract HTML map content
  const detectInteractiveMap = (text: string): { hasMap: boolean; htmlContent?: string; remainingText?: string } => {
    const htmlCodeBlockRegex = /```html\s*([\s\S]*?)\s*```/g;
    const matches = htmlCodeBlockRegex.exec(text);
    
    if (matches && matches[1]) {
      const htmlContent = matches[1].trim();
      // Check if it's a property map (contains specific indicators)
      if (htmlContent.includes('Property Map') && 
          htmlContent.includes('leaflet') && 
          htmlContent.includes('propertyMap')) {
        
        const remainingText = text.replace(matches[0], '\n🗺️ **Interactive map is displayed above**\n');
        
        return {
          hasMap: true,
          htmlContent: htmlContent,
          remainingText: remainingText
        };
      }
    }
    
    return { hasMap: false };
  };

  const mapDetection = detectInteractiveMap(content);

  // If we detected a map, render it specially
  if (mapDetection.hasMap && mapDetection.htmlContent) {
    return (
      <Box>
        <InteractiveMapRenderer htmlContent={mapDetection.htmlContent} />
        {mapDetection.remainingText && (
          <MarkdownMessage content={mapDetection.remainingText} isUser={isUser} />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          margin: '16px 0 8px 0',
          fontWeight: 600,
          color: isUser ? 'inherit' : '#1f2937',
        },
        '& h1': { fontSize: '1.5rem' },
        '& h2': { fontSize: '1.25rem' },
        '& h3': { fontSize: '1.1rem' },
        '& h4, & h5, & h6': { fontSize: '1rem' },
        '& p': {
          margin: '8px 0',
          lineHeight: 1.6,
          color: isUser ? 'inherit' : '#374151',
        },
        '& ul, & ol': {
          margin: '8px 0',
          paddingLeft: '20px',
          color: isUser ? 'inherit' : '#374151',
        },
        '& li': {
          margin: '4px 0',
          lineHeight: 1.6,
        },
        '& blockquote': {
          margin: '16px 0',
          paddingLeft: '16px',
          borderLeft: `4px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#e5e7eb'}`,
          color: isUser ? 'rgba(255,255,255,0.8)' : '#6b7280',
          fontStyle: 'italic',
        },
        '& code': {
          backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
          color: isUser ? 'inherit' : '#1f2937',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
        '& pre': {
          backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : '#f8fafc',
          border: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          margin: '16px 0',
          overflow: 'auto',
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
            fontSize: '0.875rem',
            color: isUser ? 'inherit' : '#1f2937',
          }
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '16px 0',
          border: `1px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#e5e7eb'}`,
          borderRadius: '8px',
          overflow: 'hidden',
        },
        '& th, & td': {
          padding: '12px',
          textAlign: 'left',
          borderBottom: `1px solid ${isUser ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}`,
        },
        '& th': {
          backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : '#f8fafc',
          fontWeight: 600,
        },
        '& a': {
          color: isUser ? '#93c5fd' : '#2563eb',
          textDecoration: 'underline',
          '&:hover': {
            textDecoration: 'none',
          }
        },
        '& hr': {
          margin: '24px 0',
          border: 'none',
          borderTop: `1px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#e5e7eb'}`,
        },
        '& strong': {
          fontWeight: 600,
          color: isUser ? 'inherit' : '#1f2937',
        },
        '& em': {
          fontStyle: 'italic',
          color: isUser ? 'inherit' : '#374151',
        },
        // Highlight.js theme adjustments for user messages
        ...(isUser && {
          '& .hljs': {
            background: 'rgba(0,0,0,0.2) !important',
            color: 'inherit !important',
          },
          '& .hljs-keyword, & .hljs-selector-tag, & .hljs-title': {
            color: '#93c5fd !important',
          },
          '& .hljs-string, & .hljs-attr': {
            color: '#a7f3d0 !important',
          },
          '& .hljs-number, & .hljs-literal': {
            color: '#fde68a !important',
          },
          '& .hljs-comment': {
            color: 'rgba(255,255,255,0.6) !important',
          },
        }),
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom renderer for paragraphs to handle empty content
          p: ({ children }) => {
            if (!children || (typeof children === 'string' && !children.trim())) {
              return null;
            }
            return <Typography component="p" variant="body2">{children}</Typography>;
          },
          // Custom renderer for headings
          h1: ({ children }) => (
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography component="h2" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography component="h3" variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {children}
            </Typography>
          ),
          // Custom renderer for lists to ensure proper spacing
          ul: ({ children }) => (
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              {children}
            </Typography>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownMessage;