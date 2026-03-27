import React from 'react';

export default function ExploreBar({ roleData, sendChat }) {
  return (
    <div className="explore-bar">
      {roleData?.chips?.map(q => (
        <div key={q} className="explore-chip" onClick={() => sendChat(q)}>{q}</div>
      ))}
    </div>
  );
}
