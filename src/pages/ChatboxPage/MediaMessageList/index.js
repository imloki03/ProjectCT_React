import React, { useEffect, useState } from "react";
import { Paginator } from "primereact/paginator";
import { useSelector } from "react-redux";
import { getMediaMessagesByProject } from "../../../api/messageApi";
import MediaMessageItemCard from "../MessageItem/MediaMessageItemCard";
import { getDateAndTime } from "../../../utils/DateTimeUtil";
import "./index.css"
import BarProgress from "../../../components/BarProgress";
import {hasPermission} from "../../../utils/CollabUtil";
import {useTranslation} from "react-i18next";

const MediaMessagesList = ({storeMediaMessage}) => {
    const project = useSelector((state) => state.project.currentProject);
    const shouldMediaReload = useSelector((state) => state.chat.shouldMediaReload);
    const [mediaMessages, setMediaMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(6);
    const [isMediaStorable, setIsMediaStorable] = useState(false);
    const functionList = useSelector((state) => state.project.currentCollab?.role?.functionList);
    const { t } = useTranslation();

    useEffect(() => {
        setIsMediaStorable(hasPermission(functionList, "ADD_MEDIA_FROM_CHAT"));
    }, [functionList]);

    const fetchMediaMessages = async (page = 0) => {
        if (!project?.id) return;
        setLoading(true);
        try {
            const response = await getMediaMessagesByProject(project.id, page, rows);
            setMediaMessages(response.data.content || []);
            setTotalRecords(response.data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching media messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMediaMessages(first / rows, rows);
    }, [project, first, rows, shouldMediaReload]);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const groupMessagesByDate = () => {
        const groups = {};
        mediaMessages.forEach(message => {
            if (message.sentTime) {
                const { date } = getDateAndTime(message.sentTime);
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(message);
            }
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate();

    return (
        <>
            {loading ? (
                <BarProgress />
            ) : (
                <>
                    <div className="media-message-list">
                        {mediaMessages.length === 0 ? (
                            <div className="empty-media-message">
                                {t('chatboxPage.emptyStates.noMedia')}
                            </div>
                        ) : (
                            Object.entries(messageGroups).map(([date, messages]) => (
                                <div key={date} className="message-group">
                                    <div className="date-divider">{date}</div>
                                    {messages.map((message, index) => {
                                        const file = message.media;
                                        return (
                                            <MediaMessageItemCard
                                                key={message.id || `media-${index}`}
                                                message={message}
                                                file={file}
                                                isSideBar={true}
                                                storeMediaMessage={storeMediaMessage}
                                                isMediaStorable={isMediaStorable}
                                            />
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                    <Paginator
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        onPageChange={onPageChange}
                        pageLinkSize={3}
                    />
                </>
            )}
        </>
    );
};

export default MediaMessagesList;
