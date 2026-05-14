"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getSocket } from "./socket";

export type ActivityEvent = {
  event: string;
  payload: any;
  timestamp: Date;
};

const SocketContext = createContext<{
  socket: WebSocket | null;
  isConnected: boolean;
  suscribe: (fn: (event: MessageEvent) => void) => () => void;
  events: ActivityEvent[];
}>({
  socket: null,
  isConnected: false,
  suscribe: () => () => {},
  events: [],
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recent_activity");
      try {
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const listenersRef = useRef<Set<(event: MessageEvent) => void>>(new Set());

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const globalHandler = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        setEvents((prev) => {
          const updated = [
            {
              event: parsed.event,
              payload: parsed.payload,
              timestamp: new Date(),
            },
            ...prev,
          ].slice(0, 20);
          localStorage.setItem("recent_activity", JSON.stringify(updated));
          return updated;
        });
      } catch {}
      listenersRef.current.forEach((fn) => fn(event));
    };

    const setConnected = () => setIsConnected(s.readyState === WebSocket.OPEN);
    s.addEventListener("message", globalHandler);
    s.addEventListener("open", setConnected);
    s.addEventListener("close", setConnected);

    return () => {
      s.removeEventListener("message", globalHandler);
      s.removeEventListener("open", setConnected);
      s.removeEventListener("close", setConnected);
    };
  }, []);

  const suscribe = useCallback((fn: (event: MessageEvent) => void) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, suscribe, events }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
