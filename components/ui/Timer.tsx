import { useEffect, useState } from 'react';

const Timer = ({ start }: { start: boolean }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    let interval: NodeJS.Timeout | null = null;

    if (start) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [start]);

  const formatTime = (time: number) => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = Math.floor(time / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return <div className="text-red-500">{formatTime(time)}</div>;
};

export default Timer;
