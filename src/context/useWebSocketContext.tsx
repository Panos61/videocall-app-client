// import { createContext, useContext, useEffect, useRef } from 'react';
// import { ConnectionSocket } from '@/views/Room/signalling';

// interface WebSocketCtxValue {
//   ws: ConnectionSocket | null;
// }

// const WebSocketContext = createContext<WebSocketCtxValue | undefined>(
//   undefined
// );

// export const WebSocketProvider: React.FC<{
//   roomID: string;
//   children: React.ReactNode;
// }> = ({ roomID, children }) => {
//   const wsRef = useRef<ConnectionSocket | null>(null);

//   useEffect(() => {
//     wsRef.current = new ConnectionSocket(
//       `ws://localhost:8080/ws/signalling/${roomID}`
//     );
//     return () => {
//       wsRef.current?.close();
//     };
//   }, [roomID]);

//   return (
//     <WebSocketContext.Provider value={{ ws: wsRef.current }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// // eslint-disable-next-line react-refresh/only-export-components
// export const useWebSocket = (): ConnectionSocket | null => {
//   const context = useContext(WebSocketContext);
//   if (!context) {
//     throw new Error('useWebSocket must be used within a WebSocketProvider');
//   }

//   return context.ws;
// };
