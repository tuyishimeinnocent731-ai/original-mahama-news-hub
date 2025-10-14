import { io, Socket } from 'socket.io-client';
let socket: Socket|null = null;
export function initSocket() {
  if (socket) return socket;
  const url = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';
  socket = io(url, { transports: ['websocket'] });
  socket.on('connect', () => console.log('socket connected', socket?.id));
  socket.on('disconnect', () => console.log('socket disconnected'));
  return socket;
}
export function subscribeToNewArticles(cb: (data:any)=>void) { const s = initSocket(); s.on('new-articles', cb); return () => s.off('new-articles', cb); }
export function subscribeToCategory(category: string) { const s = initSocket(); s.emit('subscribe-category', category); }
