'use client'

import React, { useState, useMemo } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MeterData } from '@/app/page';
import dayjs, { Dayjs } from 'dayjs';


const ReadingDataTable = ({ data }: { data: MeterData[] }) => {
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  const filteredData = React.useMemo(() => {
	  if (startDate || endDate) {
	   	return data.filter((entry) => {
		  if (startDate && new Date(entry.createdAt).valueOf() < startDate.valueOf()) {
	        return false;
	  	  }
	  	  if (endDate && new Date(entry.createdAt).valueOf() > endDate.valueOf()) {
		    return false;
	      }
	      return true;
		}).sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf());
	  }
	  return data.sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf());
	}, [data, startDate, endDate]);

  return (
    <Box border={1} borderColor="grey.400" borderRadius={2} paddingTop={2}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2} paddingX={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            sx={{ mr: 2 }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />
        </LocalizationProvider>
      </Box>
      <Box maxHeight={400} overflow="auto">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Reading At</TableCell>
              <TableCell>Reading</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{dayjs(entry.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>{entry.reading}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default ReadingDataTable;