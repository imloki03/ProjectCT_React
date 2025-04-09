import React from 'react';
import './index.css'
import ChatIcon from '../../../assets/icons/chat_icon.png'

const MessagePinSection = ({ pinMessages, openDrawer }) => {
    if (!pinMessages || pinMessages.length === 0) {
        return null;
    }

    const pinnedMsg = pinMessages[0];

    return (
        <div className={"message-pin-section-container"} onClick={openDrawer}>
            <img src={ChatIcon} alt="pin" className="pin-chat-icon"/>
            <div className={"message-pin-content"}>
                <div>{pinnedMsg?.sender?.name}</div>
                <div style={{ fontWeight: "bold" }}>{pinnedMsg.media? "Attached file" : pinnedMsg?.content}</div>
            </div>
            <i className={"pi pi-angle-down"}/>
        </div>
    );
};

export default MessagePinSection;