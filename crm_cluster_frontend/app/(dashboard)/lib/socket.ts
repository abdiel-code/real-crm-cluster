type status = "connecting" | "open" | "closed" | "error";

let socket: WebSocket | null = null;

export const getSocket = () => {
  if (
    !socket ||
    socket.readyState === WebSocket.CLOSED ||
    socket.readyState === WebSocket.CLOSING
  ) {
    const url =
      process.env
        .NEXT_PUBLIC_API_URL!.replace("https://", "wss://")
        .replace("http://", "ws://") + "/ws";

    socket = new WebSocket(url);
  }

  return socket;
};

export const closeSocket = () => {
  socket?.close();
  socket = null;
};
