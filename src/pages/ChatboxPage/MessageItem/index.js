import React, { useState, useEffect, useRef } from 'react';
import './index.css'
import {getDateAndTime} from "../../../utils/DateTimeUtil";
import {getMessageClass} from "../../../utils/ChatUtil";
import Avatar from "../../../components/Avatar";
import MediaMessageItemCard from "./MediaMessageItemCard";
import thumbtackIcon from '../../../assets/icons/thumbtack_icon.svg';
import thumbtackSlashIcon from '../../../assets/icons/thumbtack_slash_icon.svg'
import {useWebSocketChat} from "../../../hooks/useWebsocket";
import {useDispatch, useSelector} from "react-redux";
import {setShouldReloadPin} from "../../../redux/slices/chatSlice";
import { Avatar as PrimeAvatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import {hasPermission} from "../../../utils/CollabUtil";

const MessageItem = ({ msg, index, reversedMessages, user, project, isLoading, readerList, pinMessage, storeMediaMessage, isFeedback = false }) => {
    const [showTime, setShowTime] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [pinPosition, setPinPosition] = useState(0);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const messageRef = useRef(null);
    const { date, time } = getDateAndTime(msg.sentTime);
    const newerMsg = reversedMessages[index + 1];
    const olderMsg = reversedMessages[index - 1];
    const newerDateTime = newerMsg ? getDateAndTime(newerMsg.sentTime) : {};
    const [isMediaStorable, setIsMediaStorable] = useState(false);
    const functionList = useSelector((state) => state.project.currentCollab?.role?.functionList);

    useEffect(() => {
        setIsMediaStorable(hasPermission(functionList, "ADD_MEDIA_FROM_CHAT"));
    }, [functionList]);

    const isSameDayNewMessage =
        newerDateTime.date ===
        new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

    const isToday =
        date ===
        new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

    const showTimeDivider =
        newerMsg &&
        newerDateTime.time &&
        newerDateTime.time !== time &&
        Math.abs(new Date(newerMsg.sentTime) - new Date(msg.sentTime)) >
        15 * 60 * 1000;

    const messageClass = getMessageClass(olderMsg, msg, newerMsg);
    const shouldShowAvatar = ["m-last", "m-lone"].includes(messageClass) && msg.sender?.username !== user?.username;
    const isOwnMessage = msg.sender?.username === user?.username;
    const dispatch = useDispatch();

    const handleMessageItemMouseEnter = () => {
        setShowPin(true);
    };

    const handleMessageItemMouseLeave = () => {
        setShowPin(false);
    };

    const handleMessageContentMouseEnter = () => {
        const timeout = setTimeout(() => {
            setShowTime(true);
        }, 500);
        setHoverTimeout(timeout);
    };

    const handleMessageContentMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setShowTime(false);
    };

    const handleSendPinMessage = (msg) => {
        if (msg)
        {
            const pinMessageRequest = {
                pinMessageId: msg.id,
                projectId: project?.id,
                authToken: localStorage.getItem("token"),
            };
            pinMessage(pinMessageRequest);
            dispatch(setShouldReloadPin(Date.now()));
        }
    }

    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, [hoverTimeout]);

    useEffect(() => {
        if (showPin && messageRef.current) {
            const contentElement = messageRef.current.querySelector(
                msg.media ? '.media-message-item' : '.normal-message-content'
            );

            if (contentElement) {
                const width = contentElement.offsetWidth;
                const avatarWidth = !isOwnMessage ? 40 : 0;
                setPinPosition(width + avatarWidth + 30);
            }
        }
    }, [showPin]);

    return (
        <React.Fragment key={msg.id || index}>
            {(messageClass === "m-first" || messageClass === "m-lone") && !isOwnMessage && (
                <div className={"name-divider"}>
                    {msg.sender.name}
                </div>
            )}
            <div
                ref={messageRef}
                className={`message-item ${isOwnMessage ? "own-message" : ""} ${messageClass}`}
                onMouseEnter={handleMessageItemMouseEnter}
                onMouseLeave={handleMessageItemMouseLeave}
            >
                {!isOwnMessage && (
                    <div className="avatar-placeholder">
                        {shouldShowAvatar && (
                            <Avatar
                                label={msg.sender?.name}
                                image={msg.sender?.avatarURL}
                                shape="circle"
                                className="avatar"
                                customSize="2.3rem"
                            />
                        )}
                    </div>
                )}
                {msg.media ? (
                    <MediaMessageItemCard message={msg} isLoading={isLoading} isSneakPeak={true} file={msg.media}
                                          storeMediaMessage={storeMediaMessage} isMediaStorable = {isMediaStorable}
                      onMouseEnter={handleMessageContentMouseEnter} onMouseLeave={handleMessageContentMouseLeave}/>
                ) : (
                    <div
                        className="normal-message-content"
                        onMouseEnter={handleMessageContentMouseEnter}
                        onMouseLeave={handleMessageContentMouseLeave}
                    >
                        {showTime && <span className="message-time-hover" data-today={isToday}>
                            {isToday
                                ? `${time}`
                                : `${date.split("/").slice(0, 2).join("/")}, ${time}`}</span>}
                        <p>{msg.content}</p>
                    </div>
                )}
                {showPin && !isFeedback && (
                    <img
                        src={msg.isPinned ? thumbtackSlashIcon : thumbtackIcon}
                        alt="pin"
                        className="message-pin-icon"
                        style={{
                            [isOwnMessage ? 'right' : 'left']: `${pinPosition}px`
                        }}
                        onClick={() => handleSendPinMessage(msg)}
                    />
                )}
            </div>
            {readerList?.length > 0 && (
                <div className="message-read-avatar">
                    {readerList.length > 5 && (
                        <>
                            <PrimeAvatar
                                key="remaining-readers"
                                label={`+${readerList.length - 5}`}
                                style={{ width: '1.3rem', height: '1.3rem', fontSize: '0.8rem' }}
                                shape="circle"
                                className="reader-count"
                                data-pr-tooltip={readerList.slice(5).map(r => r.user.name).join(', ')}
                            />
                            <Tooltip target=".reader-count" />
                        </>
                    )}
                    {readerList.slice(0, 5).map(r => (
                        <div className="reader-avatar" key={r.user.id}>
                            <Avatar
                                label={r.user.name}
                                image={r.user.avatarURL}
                                customSize="1.3rem"
                            />
                        </div>
                    ))}
                </div>
            )}
            {showTimeDivider && (
                <div className="message-item-custom-divider">
                    <span className="time-divider">
                        {isSameDayNewMessage
                            ? `${newerDateTime.time}`
                            : `${newerDateTime.date.split("/").slice(0, 2).join("/")}, ${newerDateTime.time}`}
                    </span>
                </div>
            )}
        </React.Fragment>
    );
};

export default MessageItem;
