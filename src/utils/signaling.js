import {RTC_URL} from "../constants/env";

export function connectSignaling(onMessage) {
    const socket = new WebSocket(RTC_URL);

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        onMessage(msg);
    };

    return socket;
}

export function sendMessage(socket, msg) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg));
    }
}
