import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from "../../../components/Avatar";
import {getDateAndTime} from "../../../utils/DateTimeUtil";
import {getIconForType} from "../../../utils/MediaUtil";
import './index.css';

const MessageDrawerItem = ({ msg, onGoToSource, onUnpin }) => {
    const { t } = useTranslation();
    const { date, time } = getDateAndTime(msg.sentTime);

    return (
        <div className="message-drawer-item">
            <div className="message-drawer-header">
                <div className="message-drawer-header-information">
                    <Avatar
                        image={msg.sender?.avatarURL}
                        label={msg.sender?.name}
                        customSize="2.3rem"
                    />
                    <div className="message-drawer-header-content">
                        <div className="message-drawer-header-name">
                            {msg.sender.name}
                        </div>
                        <div className="message-drawer-content-type">
                            {msg.media
                                ? t('chatboxPage.messageDrawer.contentType.file')
                                : t('chatboxPage.messageDrawer.contentType.text')
                            }
                        </div>
                    </div>
                </div>
                <div className="message-drawer-header-time">
                    {t('chatboxPage.messageDrawer.dateTime.format', { date, time })}
                </div>
            </div>
            <div className="message-drawer-content">
                <div>
                    {msg.media ? (
                        <div className="message-file-container">
                            <div
                                className="file-type-img"
                                style={{backgroundImage: `url(${getIconForType(msg.media)})`}}
                            />
                            <div className="file-content">
                                <div>{msg.media.filename}</div>
                                <div className="file-sub-text">
                                    {t('chatboxPage.messageDrawer.fileInfo.format', {
                                        size: msg.media.size,
                                        type: msg.media.type
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : msg.content}
                </div>
            </div>
            <div className="message-drawer-action">
                <div
                    style={{color: "blue", cursor: "pointer"}}
                    onClick={() => onGoToSource(msg.id)}
                >
                    {t('chatboxPage.messageDrawer.actions.goToSource')}
                </div>
                {onUnpin && (
                    <div
                        style={{color: "red", cursor: "pointer"}}
                        onClick={() => onUnpin(msg)}
                    >
                        {t('chatboxPage.messageDrawer.actions.unpin')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageDrawerItem;