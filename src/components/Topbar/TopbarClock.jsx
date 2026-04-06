import React, { useState, useEffect } from 'react';

export default function TopbarClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = `${days[time.getDay()]} ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()} · IST`;

  return (
    <div className="tb-clk">
      <span className="tb-clk-main" id="clk">{timeStr}</span>
      <span className="tb-clk-sub" id="clk-date">{dateStr}</span>
    </div>
  );
}
