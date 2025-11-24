import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Divider
} from '@mui/material';
import {
  Receipt,
  TrendingUp,
  AttachMoney,
  Token,
  Schedule,
  Upgrade
} from '@mui/icons-material';

const UsageBilling: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
          Usage & Billing
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Monitor your API usage, costs, and manage your subscription
        </Typography>
      </Box>

      {/* Current Plan */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Current Plan
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label="Pro Plan"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  $29/month
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Upgrade />}
              sx={{ color: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Upgrade Plan
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            Your plan renews on January 15, 2024
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  API Calls This Month
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  1,247 / 10,000
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={12.47}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Tokens Used
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  45.2K / 1M
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={4.52}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Storage Used
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  2.1GB / 50GB
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={4.2}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#3b82f6', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                156
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Chat Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Token sx={{ fontSize: 40, color: '#10b981', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                45.2K
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Total Tokens
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: '#f59e0b', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                $12.45
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: '#8b5cf6', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                24.5h
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Total Usage Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Bills */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Recent Bills
          </Typography>
          
          {[
            { date: 'January 2024', amount: '$29.00', status: 'Paid', description: 'Pro Plan - Monthly' },
            { date: 'December 2023', amount: '$29.00', status: 'Paid', description: 'Pro Plan - Monthly' },
            { date: 'November 2023', amount: '$29.00', status: 'Paid', description: 'Pro Plan - Monthly' }
          ].map((bill, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {bill.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {bill.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {bill.amount}
                  </Typography>
                  <Chip
                    label={bill.status}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
              {index < 2 && <Divider />}
            </Box>
          ))}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button variant="outlined" startIcon={<Receipt />}>
              View All Bills
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsageBilling;
