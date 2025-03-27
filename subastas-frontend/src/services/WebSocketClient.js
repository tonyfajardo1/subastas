class WebSocketClient {
    static socket = null;

    static connect(onMessage) {
        if (!this.socket) {
            this.socket = new WebSocket("ws://localhost:8080");
            this.socket.onmessage = (event) => {
                onMessage(event.data);
            };
        }
    }
}

export default WebSocketClient;
