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
import { getMeterReadings, MeterReadingsResponse } from '@/server/MeterReadings';
import { sendEmailUsingMailto } from '@/server/Mailer';

export interface MeterData {
  id: number;
  meterId: string;
  createdAt: Date;
  reading: number;
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
  
	const timeout = new Promise<string>((resolve, _) =>
	  setTimeout(() => resolve("Request timed out. Please try again later."), 20000)
	);
  
	try {
	  const response = await Promise.race([getMeterReadings(meterId, password), timeout]);
  
	  if (typeof response === "string") {
		// Timeout occurred
		setSnackbarSeverity("error");
		setSnackbarMessage(response);
		setSnackbarOpen(true);
	  } else {
		// getMeterReadings resolved
		const { readings, error, message } = response as MeterReadingsResponse;
  
		if (readings && readings.length > 0) {
		  setMeterData(readings);
		  setShowReadingsTable(true);
		  setShowDiscrepancyReport(true);
		} else if (error !== "") {
		  setSnackbarSeverity("error");
		  setSnackbarMessage(error);
		  setSnackbarOpen(true);
		} else if (message !== "") {
		  setSnackbarSeverity("success");
		  setSnackbarMessage(message);
		  setSnackbarOpen(true);
		}
	  }
	} catch (err) {
	  // Other errors
	  setSnackbarSeverity("error");
	  setSnackbarMessage("Failed to fetch data. Please try again later.");
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
    <Box display='flex' flexDirection='column' alignItems='center' sx={{ minWidth: '200px', marginX: '16px', marginBottom: '16px' }}>
      <Card sx={{ mt: 4, minWidth: '200px', maxWidth: '400px' }}>
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
        <Box sx={{ mt: 4, minWidth: '200px', maxWidth: '400px' }}>
          <ReadingDataTable data={meterData} />
        </Box>
      )}

      {showDiscrepancyReport && (
        <Box sx={{ mt: 4, minWidth: '200px', maxWidth: '400px' }}>
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
