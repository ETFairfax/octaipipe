import { useEffect, useState } from 'react';

const clockTickMs = 250;

export const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), clockTickMs);
    return () => clearInterval(id);
  }, []);
  return now;
};
