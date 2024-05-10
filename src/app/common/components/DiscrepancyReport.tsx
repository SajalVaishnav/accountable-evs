import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

interface DiscrepancyReportProps {
  meterId: string;
  onSendEmail: (emailBody: string) => Promise<string | void>;
}

const generateEmailBody = (meterId: string, discrepancyDate: Dayjs | null) => {
  const formattedDate = discrepancyDate?.toDate().toLocaleDateString();
  return `Dear EVS Operator,\n\nThank you for your continued services towards the NUS community!\n\nThis email is to report a discrepancy in the meter credits for meter ${meterId} on ${formattedDate}\n\nYour prompt action, as always, is appreciated.`;
};

const DiscrepancyReport = React.memo(
  React.forwardRef<HTMLDivElement, DiscrepancyReportProps>(({ meterId, onSendEmail }, ref) => {
    const [discrepancyDate, setDiscrepancyDate] = useState<Dayjs | null>(dayjs(new Date()));
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const emailBody = generateEmailBody(meterId, discrepancyDate);
    const emailContent = `To: evs_operator@yahoo.com.sg\nSubject: Discrepancy in Meter Credits\n\n${emailBody}`;

    const handleDateChange = (date: Dayjs | null) => {
      setDiscrepancyDate(date);
    };

    const handleSendEmail = async () => {
      setIsLoading(true);
      try {
        await onSendEmail(emailBody);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Box ref={ref} border={1} borderColor="grey.400" borderRadius={2} paddingY={2}>
        <Typography variant="h5" color="text.primary" marginX={2}>
          Discrepancy in the readings?
        </Typography>
        <Typography variant="body1" color="text.secondary" marginX={2}>
          Send a complaint email to EVS!
        </Typography>
        <Box mt={2} display="flex" alignItems="center" marginX={2}>
          <Typography variant="body1" mr={1} color="text.primary">
            Discrepancy on:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker value={discrepancyDate} onChange={handleDateChange} />
          </LocalizationProvider>
        </Box>
        <Box mt={4} sx={{ overflowX: 'auto' }} marginX={2}>
          <Typography
            variant="overline"
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              lineHeight: 1,
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {emailContent}
          </Typography>
        </Box>
        <Box marginX={2} mt={4}>
          <Button variant="contained" onClick={handleSendEmail} fullWidth disabled={isLoading}>
            Send Email
          </Button>
        </Box>
      </Box>
    );
  })
);

DiscrepancyReport.displayName = 'DiscrepancyReport';

export default DiscrepancyReport;