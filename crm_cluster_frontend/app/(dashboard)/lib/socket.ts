type status = "connecting" | "open" | "closed" | "error";

let socket: WebSocket | null = null;

export const getSocket = () => {
  if (!socket) {
    console.log("There is not a socket");
    const url = `ws://localhost:4000/ws`;

    socket = new WebSocket(url);

    console.log("Socket is conected:", socket != null);
    console.log("The socket is:", socket);
  }

  return socket;
};

export const closeSocket = () => {
  socket?.close();
  socket = null;
};
