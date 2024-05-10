'use client'

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';

import ReadingDataTable from '@/app/common/components/ReadingsDataTable';
import DiscrepancyReport from '@/app/common/components/DiscrepancyReport';
import { getMeterReadings } from '@/server/MeterReadings';
import { sendEmailUsingMailto } from '@/server/Mailer';

export interface MeterData {
  id: number;
  meterId: string;
  createdAt: Date;
  reading: number;
}

export class TooManyEmailRequestsError extends Error {
  constructor(meterId: string) {
    super(`Too many requests for meter ${meterId}`);
    this.name = 'TooManyEmailRequestsError';
  }
}

const MainPage = () => {
  const [meterId, setMeterId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meterData, setMeterData] = useState<MeterData[] | null>(null);
  const [showReadingsTable, setShowReadingsTable] = useState<boolean>(false);
  const [showDiscrepancyReport, setShowDiscrepancyReport] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMeterData(null);
    setShowReadingsTable(false);
    setShowDiscrepancyReport(false);
    setIsLoading(true);

    try {
      const readings = await getMeterReadings(meterId, password);
      setMeterData(readings);
      setShowReadingsTable(true);
      setShowDiscrepancyReport(true);
    } catch (error) {
      setSnackbarSeverity('error');
      if (error instanceof TooManyEmailRequestsError) {
        setSnackbarMessage(`Too many requests for meter ${meterId}`);
      } else {
        setSnackbarMessage('Failed to fetch meter readings. Please try again later.');
      }
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendComplaintEmail = async (emailBody: string) => {
    try {
      const mailtoLink = await sendEmailUsingMailto(emailBody, meterId);
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.error(error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to send email. Please try again later.');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box display='flex' flexDirection='column' alignItems='center'>

      <Card sx={{ mt: 4, width: '400px' }}>
        <CardContent>
          <Typography variant='h5' component='div' gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label='Meter ID'
              variant='outlined'
              fullWidth
              margin='normal'
              value={meterId}
              onChange={(e) => setMeterId(e.target.value)}
            />
            <TextField
              label='Password'
              variant='outlined'
              fullWidth
              margin='normal'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type='submit'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showReadingsTable && meterData && (
        <Box sx={{ mt: 4, width: '400px' }}>
          <ReadingDataTable data={meterData} />
        </Box>
      )}

      {showDiscrepancyReport && (
        <Box sx={{ mt: 4, width: '400px' }}>
          <DiscrepancyReport meterId={meterId} onSendEmail={sendComplaintEmail} />
        </Box>
      )}

      {snackbarOpen && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionProps={{ style: { marginTop: '64px' } }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      )}

    </Box>
  );
};

export default MainPage;
