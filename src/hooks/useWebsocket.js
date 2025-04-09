import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

export const useWebSocketChat = (brokerUrl = "ws://localhost:8888/ws") => { //env + env deploy
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const clientRef = useRef(null);
    const subscriptionsRef = useRef(new Map());

    useEffect(() => {
        const client = new Client({
            brokerURL: brokerUrl,
            reconnectDelay: 5000, // Auto-reconnect after 5 seconds
            onConnect: () => setConnected(true),
            onDisconnect: () => setConnected(false),
            onWebSocketError: (error) => console.error("WebSocket error:", error),
            onStompError: (frame) => console.error("STOMP error:", frame.headers["message"]),
        });

        clientRef.current = client;
        return () => client.deactivate();
    }, [brokerUrl]);

    const connect = () => clientRef.current?.activate();
    const disconnect = () => {
        clientRef.current?.deactivate();
        subscriptionsRef.current.clear();
    };

    const subscribe = (topic, callback) => {
        if (!clientRef.current?.connected) {
            console.warn("Cannot subscribe: WebSocket is not connected.");
            return;
        }

        if (subscriptionsRef.current.has(topic)) {
            console.warn(`Already subscribed to ${topic}`);
            return;
        }

        const subscription = clientRef.current.subscribe(topic, (message) => {
            const parsedMessage = JSON.parse(message.body);
            callback(parsedMessage);
            setMessages((prev) => [...prev, parsedMessage]);
        });

        subscriptionsRef.current.set(topic, subscription);
        console.log(`Subscribed to ${topic}`);
    };

    const unsubscribe = (topic) => {
        subscriptionsRef.current.get(topic)?.unsubscribe();
        subscriptionsRef.current.delete(topic);
    };

    const sendMessage = (message) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/send",
                body: JSON.stringify(message),
            });
        } else {
            console.warn("WebSocket is not connected.");
        }
    };

    const seenMessage = (request) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/read",
                body: JSON.stringify(request),
            });
        } else {
            console.warn("WebSocket is not connected.");
        }
    };

    const typingMessage = (message) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/typing",
                body: JSON.stringify(message),
            });
        } else {
            console.warn("WebSocket is not connected.");
        }
    }

    const pinMessage = (message) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/pin",
                body: JSON.stringify(message),
            });
        } else {
            console.warn("WebSocket is not connected.");
        }
    }

    const storeMediaMessage = (message) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/storage",
                body: JSON.stringify(message),
            });
        } else {
            console.warn("WebSocket is not connected.");
        }
    }

    return { connected, messages, connect, disconnect, subscribe, unsubscribe, sendMessage, seenMessage, typingMessage, pinMessage, storeMediaMessage };
};
