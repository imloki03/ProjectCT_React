import React, { useEffect, useRef, useState } from "react";
import { Badge } from "primereact/badge";
import { OverlayPanel } from "primereact/overlaypanel";
import { TabView, TabPanel } from "primereact/tabview";
import { Paginator } from "primereact/paginator";
import { askNotificationPermission, onMessageListener } from "../../config/firebaseConfig";
import {getAllUnReadNotificationsOfUser, getAllReadNotificationsOfUser, readNotification} from "../../api/notiApi";
import { useSelector } from "react-redux";
import './index.css'
import Avatar from "../Avatar";
import {getDateAndTime} from "../../utils/DateTimeUtil";
import {useNavigate} from "react-router-dom";
import BarProgress from "../BarProgress";

const NotificationBell = () => {
    const op = useRef(null);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState([]);
    const [unreadLoading, setUnreadLoading] = useState(false);
    const [readLoading, setReadLoading] = useState(false);

    const [unreadTotalRecords, setUnreadTotalRecords] = useState(0);
    const [unreadFirst, setUnreadFirst] = useState(0);
    const [unreadRows, setUnreadRows] = useState(4);

    const [readTotalRecords, setReadTotalRecords] = useState(0);
    const [readFirst, setReadFirst] = useState(0);
    const [readRows, setReadRows] = useState(4);

    const user = useSelector((state) => state.user.currentUser);
    const navigate = useNavigate();

    useEffect(() => {
        askNotificationPermission();

        const unsubscribe = onMessageListener((payload) => {
            const data = payload?.data;

            if (data) {
                const notification = {
                    id: Number(data.id),
                    sentTime: data.sentTime,
                    isRead: data.isRead === "true",
                    referenceLink: data.referenceLink,
                    relevantName: data.relevantName,
                    relevantAvatarUrl: data.relevantAvatarUrl,
                    title: payload?.notification?.title || "New notification",
                    content: payload?.notification?.body || "",
                };

                setUnreadNotifications(prev => [notification, ...prev]);
                fetchUnreadNotifications(0);

                console.log("New notification:", notification);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUnreadNotifications = async (page = 0) => {
        if (!user?.id) return;
        setUnreadLoading(true);
        try {
            const response = await getAllUnReadNotificationsOfUser(user.id, page, unreadRows);
            setUnreadNotifications(response.data.content || []);
            setUnreadTotalRecords(response.data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching unread notifications:", error);
        } finally {
            setUnreadLoading(false);
        }
    };

    const fetchReadNotifications = async (page = 0) => {
        if (!user?.id) return;
        setReadLoading(true);
        try {
            const response = await getAllReadNotificationsOfUser(user.id, page, readRows);
            setReadNotifications(response.data.content || []);
            setReadTotalRecords(response.data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching read notifications:", error);
        } finally {
            setReadLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchUnreadNotifications(unreadFirst / unreadRows);
        }
    }, [user, unreadFirst, unreadRows]);

    useEffect(() => {
        if (user?.id) {
            fetchReadNotifications(readFirst / readRows);
        }
    }, [user, readFirst, readRows]);

    const onUnreadPageChange = (event) => {
        setUnreadFirst(event.first);
        setUnreadRows(event.rows);
    };

    const onReadPageChange = (event) => {
        setReadFirst(event.first);
        setReadRows(event.rows);
    };

    function BoldTextSafe({ text }) {
        const parts = text.split(/(<b>.*?<\/b>)/g);

        return (
            <div>
                {parts.map((part, index) => {
                    if (part.startsWith("<b>") && part.endsWith("</b>")) {
                        return <b key={index}>{part.slice(3, -4)}</b>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
    }

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await readNotification(notification.id);
                fetchUnreadNotifications(unreadFirst / unreadRows);
            }

            if (notification?.referenceLink) {
                navigate(notification.referenceLink);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
            if (notification?.referenceLink) {
                navigate(notification.referenceLink);
            }
        }
    };

    const getSentTime = (sentTime) => {
        const sentDate = new Date(sentTime);
        const now = new Date();
        const diffInMs = now - sentDate;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        const formatTimeAgo = (value, unit) => {
            const plural = value === 1 ? '' : 's';
            return `${value} ${unit}${plural} ago`;
        };

        if (diffInDays < 1) {
            return <span>Today</span>;
        } else if (diffInDays < 7) {
            return <span>{formatTimeAgo(diffInDays, "day")}</span>;
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return <span>{formatTimeAgo(weeks, "week")}</span>;
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return <span>{formatTimeAgo(months, "month")}</span>;
        } else {
            const years = Math.floor(diffInDays / 365);
            return <span>{formatTimeAgo(years, "year")}</span>;
        }
    };

    return (
        <div className="notification-wrapper">
            <i
                className="pi pi-bell notification-icon"
                onClick={(e) => op.current.toggle(e)}
            />
            {unreadNotifications.length > 0 && (
                <Badge
                    value={unreadTotalRecords}
                    severity="danger"
                    className="notification-badge"
                />
            )}
            <OverlayPanel ref={op} className="notification-panel">
                <TabView>
                    <TabPanel header="Unread">
                        {unreadLoading ? (
                            <BarProgress />
                        ) : (
                            <>
                                {unreadNotifications.length === 0 ? (
                                    <div className="notification-empty">No unread notifications</div>
                                ) : (
                                    <>
                                        <div className="notification-list">
                                            {unreadNotifications.map((n) => (
                                                <div key={n.id} className="notification-item" onClick={() => handleNotificationClick(n)}>
                                                    <div className={"notification-body"}>
                                                        <div className={"notification-avatar"}>
                                                            <Avatar
                                                                image={n?.relevantAvatarUrl}
                                                                label={n?.relevantName}
                                                                customSize="2.5rem"
                                                            />
                                                        </div>
                                                        <div className={"notification-content"}>
                                                            <div className={"notification-title"}>
                                                                {n?.title}
                                                            </div>
                                                            <div className={"notification-body"}>
                                                                <BoldTextSafe text={n?.content} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={"notification-date"}>
                                                        {getSentTime(n?.sentTime)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Paginator
                                            first={unreadFirst}
                                            rows={unreadRows}
                                            totalRecords={unreadTotalRecords}
                                            onPageChange={onUnreadPageChange}
                                            pageLinkSize={3}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </TabPanel>
                    <TabPanel header="Read">
                        {readLoading ? (
                            <BarProgress />
                        ) : (
                            <>
                                {readNotifications.length === 0 ? (
                                    <div className="notification-empty">No read notifications</div>
                                ) : (
                                    <>
                                        <div className="notification-list">
                                            {readNotifications.map((n) => (
                                                <div key={n.id} className="notification-item" onClick={() => handleNotificationClick(n)}>
                                                    <div className={"notification-body"}>
                                                        <div className={"notification-avatar"}>
                                                            <Avatar
                                                                image={n?.relevantAvatarUrl}
                                                                label={n?.relevantName}
                                                                customSize="2.5rem"
                                                            />
                                                        </div>
                                                        <div className={"notification-content"}>
                                                            <div className={"notification-title"}>
                                                                {n?.title}
                                                            </div>
                                                            <div className={"notification-body"}>
                                                                <BoldTextSafe text={n?.content} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={"notification-date"}>
                                                        {getSentTime(n?.sentTime)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Paginator
                                            first={readFirst}
                                            rows={readRows}
                                            totalRecords={readTotalRecords}
                                            onPageChange={onReadPageChange}
                                            pageLinkSize={3}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </TabPanel>
                </TabView>
            </OverlayPanel>
        </div>
    );
};

export default NotificationBell;