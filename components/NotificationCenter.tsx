import React, { useEffect, useState } from 'react';
import { initSocket, subscribeToNewArticles } from '../services/socketService';
const NotificationCenter: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(()=> {
    initSocket();
    const unsub = subscribeToNewArticles((data:any) => setNotes(n => [{ id: Date.now(), ...data }, ...n].slice(0,10)));
    return () => unsub();
  },[]);
  return (
    <div className="notifications">
      <h4>Live Updates</h4>
      <ul>{notes.map(n => <li key={n.id}>{n.insertedCount ? `${n.insertedCount} new articles` : 'New content'}</li>)}</ul>
    </div>
  );
};
export default NotificationCenter;
