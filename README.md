## Target Features
- validate a meter-id, password combo
- for all meter-ids, fetch the credits everyday (use the minute it was started to determine which ids it fetches)
- worker service to get the average deduction for a day
- API endpoints: 
    1. timeseries data for meterId, 
    2. timeseries data for avg daily deduction