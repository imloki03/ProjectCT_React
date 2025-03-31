import React, {useEffect, useRef, useState} from "react";
import "./index.css"
import {useDispatch, useSelector} from "react-redux";
import {ScrollPanel} from "primereact/scrollpanel";
import {addMessage} from "../../redux/slices/userSlice";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import AssistantICon from "../../assets/icons/assistant_icon.png";
import AssistantBackground from "../../assets/images/assistant_background.jpg"
import {assistantRequest} from "../../api/geminiApi";
import ReactMarkdown from "react-markdown";
import TypingIndicator from "../TypingIndicator";

const AssistantChat = ({ onClose }) => {
    const messages = useSelector((state) => state.user.assistantMsg);
    const [input, setInput] = useState("");
    const dispatch = useDispatch();
    const scrollRef = useRef(null);

    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.getContent().scrollTop = scrollRef.current.getContent().scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: "user", text: input };
        dispatch(addMessage(userMessage));
        setInput("");

        // setTimeout(() => {
        //     const aiMessage = { sender: "model", text: "Đây là câu trả lời từ AI." };
        //     dispatch(addMessage(aiMessage));
        // }, 1000);
        setIsWaiting(true);
        const msgList = messages.map((msg) => msg.sender + ": "+ msg.text);
        const response = await assistantRequest([...msgList, "user: " + userMessage.text]);
        setIsWaiting(false);

        dispatch(addMessage({
            sender: "model",
            text: response.data,
        }))
    };
    return (
        <div className="assistant-chatbox"
            style={{
                backgroundImage: `url(${AssistantBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="header">
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "92%"
                }}>
                    <div style={{
                        backgroundImage: `url(${AssistantICon})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "50%",
                        width: "2.5rem",
                        height: "2.5rem",
                        marginLeft: "0.3rem",
                        marginRight: "0.3rem"
                    }}>
                    </div>
                    <h3 style={{color: "#282828"}}>AI Assistant</h3>
                </div>
                <i className="pi pi-times" style={{ fontSize: '1.2rem', cursor: "pointer", color: "#d72b2b" }}
                   onClick={onClose}
                ></i>
            </div>
            <ScrollPanel style={{ height: "79%" }}  ref={scrollRef}>
                {
                    messages.length === 0 &&
                    <div className="flex flex-column justify-content-center align-items-center mt-7 mb-2">
                        <div style={{
                            backgroundImage: `url(${AssistantICon})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "50%",
                            width: "8rem",
                            height: "8rem",
                        }}>
                        </div>
                        <p
                            style={{textAlign: "center",  color: "#282828"}}
                        >I am an AI assistant of ProjectCT.<br/> Ask me if you need some help!</p>
                    </div>
                }

                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "user" ? "user-chat" : "ai-chat"}>
                        {msg.sender !== "user" &&
                            <div style={{
                                backgroundImage: `url(${AssistantICon})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "50%",
                                width: "1.8rem",
                                height: "1.8rem",
                                marginLeft: "0.3rem",
                                marginRight: "0.3rem"
                            }}>
                            </div>
                        }
                        <div
                            style={{
                                maxWidth: "80%",
                                display: "inline-block",
                                padding: "0.6rem",
                                borderRadius: "1rem",
                                background: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                                color: msg.sender === "user" ? "white" : "#484848",
                            }}
                        >
                            <div className="message-content">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {
                    isWaiting &&
                    <div className="ai-chat" style={{height: "2.5rem"}}>
                        <div style={{
                            backgroundImage: `url(${AssistantICon})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "50%",
                            width: "1.8rem",
                            height: "1.8rem",
                            marginLeft: "0.3rem",
                            marginRight: "0.3rem"
                        }}>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                padding: "0.6rem",
                                borderRadius: "1rem",
                                background: "#f1f1f1",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <TypingIndicator/>
                        </div>
                    </div>
                }
            </ScrollPanel>
            <div style={{ display: "flex", position: "absolute", bottom: "3.5rem", left: "10px", right: "10px" }}>
                <InputText
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{ flex: 1, marginRight: "5px" }} />
                <Button icon="pi pi-send" onClick={sendMessage} />
            </div>
        </div>
    )
}

export default AssistantChat;