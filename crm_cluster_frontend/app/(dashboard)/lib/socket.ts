type status = "connecting" | "open" | "closed" | "error";

let socket: WebSocket | null = null;

export const getSocket = () => {
  if (!socket) {
    const url = `ws://localhost:4000/ws`;

    socket = new WebSocket(url);
  }

  return socket;
};

export const closeSocket = () => {
  socket?.close();
  socket = null;
};
