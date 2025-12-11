import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f7f9fc 0%, #eef2f7 100%)',
        color: '#1b1f2a',
        px: { xs: 3, md: 6 }
      }}
    >
      <Box
        sx={{
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
          bgcolor: '#ffffff',
          border: '1px solid #e5e8ed',
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          boxShadow: '0 15px 45px rgba(0,0,0,0.08)'
        }}
      >
        <Typography variant="overline" sx={{ letterSpacing: 2, color: '#6b7280' }}>
          404
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
          Page not found
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: '#4b5563' }}>
          We can’t seem to find the page you’re looking for. Check the address or head back to Banner17 to continue exploring.
        </Typography>
        <Stack
          direction="column"
          spacing={2}
          sx={{ mt: 4, justifyContent: 'center' }}
        >
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 3,
              boxShadow: '0 10px 25px rgba(64,64,65,0.18)'
            }}
          >
            Back to home
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default NotFoundPage;

