import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  cancelAutoSearchCountdown,
  updateAutoSearchCountdown,
  searchByBounds,
} from '../../../store/slices/smartSearchSlice';

const AutoSearchCountdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const countdown = useAppSelector((state) => state.smartSearch.autoSearchState.countdown);
  const isActive = useAppSelector((state) => state.smartSearch.autoSearchState.isActive);
  const mapBounds = useAppSelector((state) => state.smartSearch.mapBounds);

  // Update countdown every 1 second
  useEffect(() => {
    if (!isActive || countdown === null || !mapBounds) return;

    const timer = setInterval(() => {
      const newCountdown = countdown - 1000;

      if (newCountdown <= 0) {
        // Trigger search (lock flag set automatically by searchByBounds thunk)
        dispatch(cancelAutoSearchCountdown());
        dispatch(searchByBounds(mapBounds));
      } else {
        dispatch(updateAutoSearchCountdown(newCountdown));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, countdown, mapBounds, dispatch]);

  // Click handler for manual trigger
  const handleClick = () => {
    if (!mapBounds) return;
    dispatch(cancelAutoSearchCountdown());
    // Lock flag set automatically by searchByBounds thunk
    dispatch(searchByBounds(mapBounds));
  };

  if (!isActive || countdown === null) return null;

  const seconds = Math.ceil(countdown / 1000);

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={handleClick}
      sx={{
        ml: 1,
        color: 'black',
        borderColor: 'rgba(0, 0, 0, 0.23)',
        '&:hover': {
          borderColor: 'black',
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      Search this area ({seconds}s)
    </Button>
  );
};

export default AutoSearchCountdown;
