import React, {useEffect, useRef, useState, useCallback, useLayoutEffect} from "react";
import { useWebSocketChat } from "../../hooks/useWebsocket";
import { useFetchProject } from "../../hooks/useFetchProject";
import {useDispatch, useSelector} from "react-redux";
import BasicButton from "../../components/Button";
import "./index.css";
import {Card} from "primereact/card"
import TextFieldArea from "../../components/TextFieldArea";
import MediaCard from "../../components/MediaCard";
import MessageItem from "./MessageItem";
import {countFileTypes, formatFileSize, getFileType} from "../../utils/MediaUtil";
import {addMedia} from "../../api/storageApi";
import {uploadFileToFirebase} from "../../config/firebaseConfig";
import { v4 as uuidv4 } from 'uuid';
import Avatar from "../../components/Avatar";
import {getAllCollabOfProject} from "../../api/collabApi";
import {categorizeExtensions} from "../../constants/FileType";
import {
    getLastSeenMessageByProject,
    getNewerMessageByProject,
    getOlderMessageByProject, getPinMessageByProject,
    getSourceMessage
} from "../../api/messageApi";
import {Button} from "primereact/button";
import TypingIndicator from "./TypingIndicator";
import TextareaAutosize from 'react-textarea-autosize';
import MessagePinSection from "./MessagePinSection";
import {useOutletContext} from "react-router-dom";
import MediaMessageList from "./MediaMessageList";
import PinMessageList from "./PinMessageList";
import SearchMessageList from "./SearchMessageList";
import {setShouldMediaReload} from "../../redux/slices/chatSlice";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";
import {routeLink} from "../../router/Router";
import BarProgress from "../../components/BarProgress";
import { Skeleton } from 'primereact/skeleton';
import {hasPermission} from "../../utils/CollabUtil";
import {useTranslation} from "react-i18next";

const ChatBoxPage = () => {
    const {connected, messages: wsMessages, connect, disconnect, subscribe, unsubscribe, sendMessage, seenMessage, typingMessage, pinMessage, storeMediaMessage} = useWebSocketChat();
    const fetchProject = useFetchProject();
    const project = useSelector((state) => state.project.currentProject);
    const user = useSelector((state) => state.user.currentUser);
    const shouldReloadPin = useSelector((state) => state.chat.shouldReloadPin);
    const finding = useSelector((state) => state.chat.finding);
    const findingId = finding.id;
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [messageContent, setMessageContent] = useState("");

    const [messages, setMessages] = useState([]);
    const [findingMessages, setFindingMessages] = useState([]);
    const [lastMessageId, setLastMessageId] = useState(0);
    const [lastNewerMessageId, setLastNewerMessageId] = useState(null);

    const [pinMessages, setPinMessages] = useState([]);
    const [isFindingSourceMsg, setIsFindingSourceMsg] = useState(false);
    const [userMap, setUserMap] = useState({});
    const [lastSeenMap, setLastSeenMap] = useState({});
    const [lastSeenMapReverse, setLastSeenMapReverse] = useState({})
    const [toSeenMessageId, setToSeenMessageId] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isReady, setIsReady] = useState(false);

    const typingTimeoutsRef = useRef({});
    const prevFindingIdRef = useRef(0);

    const [hasMoreOlder, setHasMoreOlder] = useState(true);
    const [hasMoreNewer, setHasMoreNewer] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [collaboratorCount, setCollaboratorCount] = useState(0);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [forFindingScroll, setForFindingScroll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingCollab, setLoadingCollab] = useState(false);

    const messagesContainerRef = useRef(null);
    const isInitialFetch = useRef(false);
    const forFindingScrollRef = useRef(false);
    const messageRefs = useRef({});
    const isHeadDown = useRef(false);
    const hasNewMessage = useRef(false);
    const messagesEndRef = useRef(null);
    const isSourceFindingRef = useRef(false);

    const { setBreadcrumbs } = useBreadcrumb();

    const { openDrawer, closeDrawer, isDrawerOpen } = useOutletContext();

    useEffect(() => {
        connect();
        fetchProject();
        return () => disconnect();
    }, []);

    useEffect(() => {
        if (project){
            const projectPath = routeLink.project.replace(":ownerUsername", project?.ownerUsername)
                .replace(":projectName", project?.name.replaceAll(" ", "_"));

            setBreadcrumbs([
                {label: project?.name, url: projectPath},
                {label: "Chat Box", url: projectPath + "/" + routeLink.projectTabs.chatbox}
            ]);
        }
    }, [project]);

    const handleIncomingMessage = (msg) => {
        msg.fakeId ? setToSeenMessageId(msg.id ? msg.id : -5) : setToSeenMessageId(msg.id);
        if (msg.fakeId && msg.sender.username === user.username) {
            setMessages(prevMessages =>
                prevMessages.map((m) =>
                    m.fakeId === msg.fakeId
                        ? { ...msg, sentTime: m.sentTime }
                        : m
                )
            );
        } else {
            setMessages(prevMessages => [msg, ...prevMessages]);
        }
        hasNewMessage.current = true;
    }

    const handleIncomingPinMessage = (msg) => {
        setPinMessages(prevMessages => {
            const index = prevMessages.findIndex(m => m.id === msg.id);
            return index === -1 && msg.isPinned
                ? [msg, ...prevMessages]
                : prevMessages.filter(m => m.id !== msg.id);
        });

        const index2 = messages.findIndex(m => m.id === msg.id);
        if (index2 !== -1) {
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[index2].isPinned = msg.isPinned;
                return updatedMessages;
            });
        }
    };

    const messagesRef = useRef([]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const handleSeenResponse = (newSeenMap) => {
        setLastSeenMap(prevLastSeenMap => {
            const updatedLastSeenMap = { ...prevLastSeenMap };

            setLastSeenMapReverse(prevLastSeenMapReverse => {
                const updatedReverseMap = { ...prevLastSeenMapReverse };
                Object.entries(newSeenMap.lastSeenMessageMap).forEach(([newMsgId, usernames]) => {
                    usernames = Array.isArray(usernames) ? usernames : [usernames];
                    usernames.forEach(username => {
                        if (username === user?.username) {
                            return;
                        }

                        if (updatedReverseMap[username]) {
                            updatedReverseMap[username].forEach(oldMsgId => {
                                if (updatedLastSeenMap[oldMsgId]) {
                                    updatedLastSeenMap[oldMsgId] = updatedLastSeenMap[oldMsgId]
                                        .filter(u => u !== username);
                                    if (updatedLastSeenMap[oldMsgId].length === 0) {
                                        delete updatedLastSeenMap[oldMsgId];
                                    }
                                }
                            });
                        }

                        const oldestMessageId = messagesRef.current[0]?.id;
                        if (newMsgId > oldestMessageId)
                        {
                            if (!updatedLastSeenMap[oldestMessageId]) {
                                updatedLastSeenMap[oldestMessageId] = [];
                            }
                            if (!updatedLastSeenMap[oldestMessageId].includes(username)) {
                                updatedLastSeenMap[oldestMessageId].push(username);
                            }
                            updatedReverseMap[username] = [oldestMessageId];
                        }
                        else
                        {
                            if (!updatedLastSeenMap[newMsgId]) {
                                updatedLastSeenMap[newMsgId] = [];
                            }
                            updatedLastSeenMap[newMsgId].push(username);
                            updatedReverseMap[username] = [newMsgId];
                        }
                    });
                });
                return updatedReverseMap;
            });

            return updatedLastSeenMap;
        });
    };

    const handleTypingResponse = (typingMsg) => {
        if (typingMsg.username === user?.username) return;

        setQueue((prevQueue) => {
            if (typingTimeoutsRef.current[typingMsg.username]) {
                clearTimeout(typingTimeoutsRef.current[typingMsg.username]);
            }

            if (typingMsg.isStop) {
                return prevQueue.filter((item) => item.userInfor?.user?.username !== typingMsg.username);
            }

            typingTimeoutsRef.current[typingMsg.username] = setTimeout(() => {
                setQueue((prev) => prev.filter((item) => item.userInfor?.user?.username !== typingMsg.username));
                delete typingTimeoutsRef.current[typingMsg.username];
            }, 2000);

            if (prevQueue.some(item => item.userInfor?.user?.username === typingMsg.username)) {
                return prevQueue;
            }

            return [...prevQueue, { userInfor: userMap[typingMsg.username] }];
        });
    };

    const isFindingSourceMsgRef = useRef(false);
    const findingMessagesRef = useRef(false);

    useEffect(() => {
        isFindingSourceMsgRef.current = isFindingSourceMsg;
    }, [isFindingSourceMsg]);

    useEffect(() => {
        findingMessagesRef.current = findingMessages;
    }, [findingMessages]);

    const handleStoreMediaMessage = (storeMsg) => {
        if (storeMsg.success) {
            if (!isFindingSourceMsgRef.current){
                setMessages(
                    messagesRef.current?.map((m) =>
                        m.id === storeMsg.mediaMessageId
                            ? { ...m, inStorage: true }
                            : m
                    )
                );
            }
            else {
                setFindingMessages(
                    findingMessagesRef.current?.map((m) =>
                        m.id === storeMsg.mediaMessageId
                            ? { ...m, inStorage: true }
                            : m
                    )
                );
            }
            dispatch(setShouldMediaReload(Date.now()))
        }
    }

    useEffect(() => {
        if (connected && project?.id && isReady) {
            const topic = `/public/project/${project.id}`;
            const seenMessageTopic = `/public/project/${project.id}/read`;
            const typingMessageTopic = `/public/project/${project.id}/typing`;
            const pinMessageTopic  = `/public/project/${project.id}/pin`;
            const storageMessageTopic =  `/public/project/${project.id}/storage`;

            subscribe(topic, handleIncomingMessage);
            subscribe(seenMessageTopic, handleSeenResponse);
            subscribe(typingMessageTopic, handleTypingResponse);
            subscribe(pinMessageTopic, handleIncomingPinMessage);
            subscribe(storageMessageTopic, handleStoreMediaMessage);

            return () => {
                unsubscribe(topic);
                unsubscribe(seenMessageTopic);
                unsubscribe(typingMessageTopic);
                unsubscribe(pinMessageTopic);
                unsubscribe(storageMessageTopic);
            };
        }
    }, [isReady]);

    useEffect(() => {
        if (messages.length > 0)
        {
            const seenRequest = {
                projectId: project?.id,
                username: user?.username,
                authToken: localStorage.getItem("token"),
                lastSeenMessageId: toSeenMessageId ? toSeenMessageId : messages[0]?.id,
            }
            seenMessage(seenRequest);
        }
    }, [messages])

    useEffect(() => {
        if (messageContent.trim() !== "") {
            const typingRequest = {
                username: user?.username,
                projectId: project?.id,
                authToken: localStorage.getItem("token"),
                isStop: false,
            };

            typingMessage(typingRequest);
            const typingInterval = setInterval(() => {
                typingMessage(typingRequest);
            }, 500);

            return () => clearInterval(typingInterval);
        }
        else {
            if (connected){
                const typingRequest = {
                    username: user?.username,
                    projectId: project?.id,
                    authToken: localStorage.getItem("token"),
                    isStop: true,
                };
                typingMessage(typingRequest);
                setQueue([]);
            }
        }
    }, [messageContent]);

    useEffect(() => {
        return () => {
            Object.values(typingTimeoutsRef.current).forEach(timeout => {
                clearTimeout(timeout);
            });
        };
    }, []);

    useEffect(() => {
        if (project?.id && !isInitialFetch.current) {
            isInitialFetch.current = true;

            loadCollaborators().then((newUserMap) => {
                if (newUserMap && Object.keys(newUserMap).length > 0) {
                    return loadLastSeenMessages(newUserMap);
                }
            });

            Promise.all([fetchOlderMessages(project.id, 0), loadCollaborators(), fetchPinMessages(project.id)])
                .finally(() => setIsReady(true));
        }
    }, [project]);

    useEffect(() => {
        if (!findingId || !project?.id || messages.length === 0) return;

        const messageExists = messages.some(msg => msg.id === findingId);
        const findingMessageExist = findingMessages.some(msg => msg.id === findingId);

        if (prevFindingIdRef.current === findingId) {
            if (messageExists) {
                forFindingScrollRef.current = true;
                setForFindingScroll(!forFindingScroll);
                setLastMessageId(messages[messages.length - 1].id);
                setIsFindingSourceMsg(false);
                setHasMoreNewer(false);
                if (!hasMoreOlder && messages[messages.length - 1].id !== findingMessages[findingMessages.length - 1].id)
                    setHasMoreOlder(true);
                return;
            }
            else if (findingMessageExist && isFindingSourceMsg) {
                forFindingScrollRef.current = true;
                setForFindingScroll(!forFindingScroll);
                return;
            }
        }

        if (!messageExists) {
            setIsFindingSourceMsg(true)
            fetchSourceNearbyMessages(project.id, findingId);
            prevFindingIdRef.current = findingId;
            setForFindingScroll(!forFindingScroll);
        } else {
            forFindingScrollRef.current = true;
            prevFindingIdRef.current = findingId;
            setLastMessageId(messages[messages.length - 1].id);
            setIsFindingSourceMsg(false);
            setHasMoreNewer(false);
            if (!hasMoreOlder && messages[messages.length - 1].id !== findingMessages[findingMessages.length - 1].id)
                setHasMoreOlder(true);
            setForFindingScroll(!forFindingScroll);
        }
    }, [finding]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [messages, hasMoreOlder, hasMoreNewer, findingMessages, showScrollDown, isFindingSourceMsg]);

    useLayoutEffect(() => {
        const scrollToFindingMessage = () => {
            const targetElement = messageRefs.current[findingId];
            if (targetElement && forFindingScrollRef.current) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
                const contentDiv = targetElement.querySelector(".media-message-item, .normal-message-content");
                if (contentDiv) {
                    contentDiv.classList.add("highlight-pulse");
                    setTimeout(() => {
                        contentDiv.classList.remove("highlight-pulse");
                    }, 2000);
                }
                forFindingScrollRef.current = false;
            }
        };
        requestAnimationFrame(() => {
            setTimeout(scrollToFindingMessage, 0);
        });
    }, [Object.keys(messageRefs.current), forFindingScroll]);

    useEffect(() => {
        if (isHeadDown.current) {
            messagesContainerRef.current.scrollTop = 0;
            isHeadDown.current = false;
        }
    }, [isFindingSourceMsg])

    useEffect(() => {
        if (project?.id)
            fetchPinMessages(project.id)
    }, [shouldReloadPin])

    useEffect(() => {
        return () => {
            if (isDrawerOpen) {
                closeDrawer();
            }
        };
    }, [isDrawerOpen]);

    const headDown = () => {
        if (isFindingSourceMsg) {
            isHeadDown.current = true;
            setIsFindingSourceMsg(false);
            setShowScrollDown(false);
            setLastMessageId(messages[messages.length - 1]?.id);
            setHasMoreNewer(false)
            setHasMoreOlder(true)
        } else {
            messagesContainerRef.current.scrollTop = 0;
            setShowScrollDown(false);
        }
    };

    const loadCollaborators = async () => {
        try {
            setLoadingCollab(true);
            const response = await getAllCollabOfProject(project?.id);
            const collaboratorCount = response.data.length;
            const updatedUserMap = {};
            response.data.forEach(u => {
                updatedUserMap[u.user.username] = u;
            });
            setUserMap(updatedUserMap);
            setCollaboratorCount(collaboratorCount)
            return updatedUserMap;
        }
        catch (error) {
            console.error("Error fetching collaborators:", error);
        }
        finally {
            setLoadingCollab(false)
        }
    };

    const loadLastSeenMessages = async (userMap) => {
        try {
            const usernameList = Object.keys(userMap).filter(u => u !== user?.username).join(",");
            if (!usernameList) return;

            const response = await getLastSeenMessageByProject(usernameList, project?.id);
            const map = response.data.lastSeenMessageMap;
            setLastSeenMap(map);

            const reversedMap = {};
            Object.entries(map).forEach(([msgId, usernames]) => {
                usernames.forEach(username => {
                    if (!reversedMap[username]) {
                        reversedMap[username] = [];
                    }
                    reversedMap[username].push(msgId);
                });
            });

            setLastSeenMapReverse(reversedMap);
        } catch (error) {
            console.error("Error fetching last seen messages:", error);
        }
    };

    const fetchPinMessages = async (projectId) => {
        try {
            setLoading(true)
            const response = await getPinMessageByProject(projectId, 0, 5);
            const messages = response.data.content;
            setPinMessages(messages);
        }
        catch (error) {
            console.error("Error fetching messages:", error);
        }
        finally {
            setLoading(false)
        }
    }

    const fetchSourceNearbyMessages = async (projectId, findId) => {
        try {
            setLoading(true);
            isSourceFindingRef.current=true;
            const response = await getSourceMessage(projectId, findId);
            const message = response.data.messages.content;
            forFindingScrollRef.current = true;
            setFindingMessages(message);
            setHasMoreOlder(response.data.hasMoreOlder);
            setHasMoreNewer(response.data.hasMoreNewer);
            if (findId != null) {
                setLastNewerMessageId(message[0].id);
                setLastMessageId(message[message.length-1].id);
            }
            isSourceFindingRef.current=false;
        }
        catch (error) {
            console.error("Error fetching messages:", error);
        }
        finally {
            setLoading(false)
        }
    }

    const fetchOlderMessages = async (projectId, lastMsgId) => {
        try {
            setLoading(true);
            const response = await getOlderMessageByProject(projectId, lastMsgId);
            const oldMessages = response.data.content || [];

            if (isFindingSourceMsg) {
                setFindingMessages(prevMessages => [...prevMessages, ...oldMessages]);
            }

            if (!isFindingSourceMsg || findingMessages.length === messages.length) {
                setMessages(prevMessages => [...prevMessages, ...oldMessages]);
            }

            if (oldMessages.length > 0) {
                setLastMessageId(oldMessages[oldMessages.length - 1].id);
            }

            if (lastMsgId > 0) setIsLoadingMore(true);
            setHasMoreOlder(!response.data.last);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
        finally {
            setLoading(false)
        }
    };

    const fetchNewerMessages = async (projectId, lastMsgId) => {
        if (lastMsgId != null) {
            setLoading(true);
            if (findingMessages.length > 0 && messages.length > 0 &&
                findingMessages[0].id < messages[messages.length - 1].id) {
                try {
                    const response = await getNewerMessageByProject(projectId, lastMsgId);
                    const newMessages = response.data.content || [];

                    setFindingMessages(prevMessages => [...newMessages, ...prevMessages]);

                    if (newMessages.length > 0) {
                        setLastNewerMessageId(newMessages[0].id);
                    }
                    if (lastMsgId > 0) setIsLoadingMore(true);

                    if (response.data.last)
                        mergeMessage();
                    setHasMoreNewer(!response.data.last);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
                finally {
                    setLoading(false)
                }
            } else {
                mergeMessage();
                setLoading(false)
            }
        }
    };

    const uniqueMessages = (messages) => {
        const map = new Map(messages.map((msg) => [msg.id, msg]));
        return Array.from(map.values());
    };

    const mergeMessage = () => {
        const mergedMessages = uniqueMessages([...messages, ...findingMessages]);
        setFindingMessages(mergedMessages);
        setMessages(mergedMessages);
        setLastNewerMessageId(mergedMessages[0].id);
        setHasMoreNewer(false);
        setShowScrollDown(false);
        setIsFindingSourceMsg(false);
        setIsLoadingMore(true);
    }

    const isFetchingNewer = useRef(false);
    const isFetchingOlder = useRef(false);

    useEffect( () => {
        if (isFindingSourceMsg)
            setShowScrollDown(true);
    }, [isFindingSourceMsg])

    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const scrollTop = Math.abs(container.scrollTop);
        const isAtBottom = scrollTop <= 1;
        const shouldShowHeadDown = scrollTop > 500;
        const prevHeight = container.scrollHeight;

        if ((container.scrollHeight - (Math.abs(container.scrollTop) + container.clientHeight)) <= 1
            && hasMoreOlder && !isFetchingOlder.current &&!isSourceFindingRef.current) {
            isFetchingOlder.current = true;
            fetchOlderMessages(project.id, lastMessageId).then(() => {
                requestAnimationFrame(() => {
                    isFetchingOlder.current = false;
                });
            });
        }

        if (isAtBottom && hasMoreNewer && !isFetchingNewer.current && !isSourceFindingRef.current) {
            isFetchingNewer.current = true;
            fetchNewerMessages(project.id, lastNewerMessageId).then(() => {
                requestAnimationFrame(() => {
                    isFetchingNewer.current = false;
                    const newScrollTop = container.scrollHeight - prevHeight;
                    if (newScrollTop > 0) {
                        container.scrollTop = -newScrollTop;
                    }
                });
            });
        }

        if (showScrollDown !== shouldShowHeadDown && !isFindingSourceMsg) {
            setShowScrollDown(shouldShowHeadDown);
        }

    }, [hasMoreOlder, hasMoreNewer, project, messages, findingMessages, isFindingSourceMsg, showScrollDown, lastMessageId, lastNewerMessageId]);

    const handleSendMediaMessage = async (file, fakeId) => {
        try {
            const { fileUrl, fileName, fileSize } = await uploadFileToFirebase(file);

            const mediaRequest = {
                name: fileName,
                description: " ",
                filename: fileName,
                size: typeof fileSize === "number" ? formatFileSize(fileSize) : fileSize,
                link: fileUrl,
            };

            const response = await addMedia(project.id, mediaRequest, false);

            const newMessage = {
                fakeId,
                senderId: user.id,
                projectId: project.id,
                content: fileName,
                mediaId: response.data.id,
                authToken: localStorage.getItem("token"),
            };

            sendMessage(newMessage);
        } catch (error) {
            console.error("Error sending media message:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim() && selectedFiles.length === 0) return;
        if (project?.id) {
            if (messageContent.trim()) {
                const newMessage = {
                    fakeId: null,
                    senderId: user.id,
                    projectId: project.id,
                    content: messageContent,
                    mediaId: null,
                    authToken: localStorage.getItem("token"),
                };
                sendMessage(newMessage);
                setMessageContent("");
                if (isFindingSourceMsg) {
                    headDown();
                }
            }
            if (selectedFiles.length > 0) {
                const fakeMessages = selectedFiles.map((file) => ({
                    fakeId: uuidv4(),
                    sender: user,
                    content: "",
                    projectId: project.id,
                    sentTime: new Date(),
                    readerList: [],
                    isPinned: false,
                    media: {
                        filename: file.name,
                        type: getFileType(file.name),
                    },
                }));

                setMessages(prevMessages => [...fakeMessages.reverse(), ...prevMessages]);

                for (const fakeMsg of fakeMessages) {
                    handleSendMediaMessage(
                        selectedFiles.find(file => file.name === fakeMsg.media.filename),
                        fakeMsg.fakeId
                    );
                }
                setSelectedFiles([]);
            }
        }
    };

    const allowedExtensions = categorizeExtensions()

    const fileInputRef = useRef(null);
    const fileCounts = countFileTypes(selectedFiles);
    const handleFileSelect = (event, mode) => {
        const newFiles = Array.from(event.target.files);
        const validFiles = newFiles.filter(file => {
            const ext = file.name.split(".").pop().toLowerCase();
            return allowedExtensions[mode].includes(ext);
        });

        if (validFiles.length !== newFiles.length) {
            alert(t('chatboxPage.errors.unsupportedFiles'));
        }

        setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
        event.target.value = null;
    };

    const triggerFileInput = (mode) => {
        fileInputRef.current.accept = allowedExtensions[mode].map(ext => `.${ext}`).join(",");
        fileInputRef.current.dataset.mode = mode;
        fileInputRef.current.click();
    };

    const handleDeleteFile = (fileToDelete) => {
        setSelectedFiles((prevFiles) => prevFiles.filter(file => file !== fileToDelete));
    };

    const displayMessages = isFindingSourceMsg ? findingMessages : messages;

    return (
        <div className="chatbox-container">
            <div className="chat-header">
                <div className="chat-header-text-container">
                    {project && collaboratorCount? (
                        <>
                            <Avatar label={project?.name} image={project?.avatarURL} />
                            <div className="chat-header-text">
                                <div>{project?.name}</div>
                                <div className="chat-header-sub-text">
                                    {t('chatboxPage.header.collaborators', { count: collaboratorCount })}
                                </div>
                            </div>
                        </>
                        ) : (
                        <>
                            <Skeleton shape="circle" size="2.5rem" className="mr-2" />
                            <div className="chat-header-text">
                                <Skeleton width="8rem" className="mb-2" />
                                <Skeleton width="6rem" />
                            </div>
                        </>
                    )}
                </div>
                <div className="header-actions">
                    <BasicButton
                        icon="pi pi-search"
                        onClick={() => openDrawer(t('chatboxPage.actions.search'), <SearchMessageList/>)}
                    />
                    <BasicButton
                        icon="pi pi-folder-open"
                        onClick={() => openDrawer(t('chatboxPage.actions.storage'), <MediaMessageList storeMediaMessage={storeMediaMessage}/>)}
                    />
                </div>
            </div>

            {pinMessages.length > 0 && (
                <div className="chat-pin">
                    <MessagePinSection
                        pinMessages={pinMessages}
                        openDrawer={() => openDrawer(t('chatboxPage.actions.pinnedMessages'), <PinMessageList pinMessageFunction={pinMessage} />)}
                    />
                </div>
            )}

            {loading && <BarProgress />}

            <div className="chat-messages" ref={messagesContainerRef}>
                {displayMessages.length > 0 && (
                    <div className="message-list">
                        {[...displayMessages].reverse().map((msg, index, reversedMessages) => {
                            const isFakeMessage = !msg.id;

                            const displayedMessage = isFakeMessage
                                ? { ...msg, isLoading: true }
                                : msg;

                            const readerList = lastSeenMap[msg.id];
                            let readerInfoList = [];
                            if (readerList) {
                                readerInfoList = readerList
                                    .filter(r => r !== null && r !== undefined && userMap[r] !== undefined)
                                    .map(r => userMap[r]);
                            }

                            return (
                                <div
                                    ref={(el) => {
                                        if (el) messageRefs.current[displayedMessage.id] = el;
                                    }}
                                    key={displayedMessage.id || `fake-${index}`}
                                >
                                    <MessageItem
                                        msg={displayedMessage}
                                        index={index}
                                        reversedMessages={reversedMessages}
                                        user={user}
                                        project={project}
                                        pinMessage={pinMessage}
                                        storeMediaMessage={storeMediaMessage}
                                        isLoading={displayedMessage.isLoading}
                                        readerList={readerInfoList}
                                    />
                                </div>
                            );
                        })}

                        <div ref={messagesEndRef} />
                        {queue.length > 0 && <TypingIndicator queue={queue} />}
                    </div>
                )}
            </div>

            {showScrollDown && (
                <Button rounded={true} icon="pi pi-arrow-down" className={"chat-scroll-down-button"} onClick={headDown} />
            )}

            <div className="chat-input">
                <TextareaAutosize
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder={t('chatboxPage.input.placeholder')}
                    className="message-input"
                />
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{display: "none"}}
                    onChange={(e) => handleFileSelect(e, e.target.dataset.mode)}
                />
                <div className={"chat-input-actions"}>
                    <BasicButton
                        icon="pi pi-images"
                        onClick={() => triggerFileInput("media")}
                    />
                    <BasicButton
                        icon="pi pi-paperclip"
                        onClick={() => triggerFileInput("others")}
                    />
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="chat-file-placeholder">
                    <div className="chat-file-header">
                        <div>
                            {t('chatboxPage.files.fileCount', { count: selectedFiles.length })} (
                            {t('chatboxPage.files.documents', { count: fileCounts.documents })}, {}
                            {t('chatboxPage.files.images', { count: fileCounts.images })}, {}
                            {t('chatboxPage.files.videos', { count: fileCounts.videos })}
                            )
                        </div>
                        <div className="chat-file-clear" onClick={() => setSelectedFiles([])}>
                            {t('chatboxPage.input.removeAll')}
                        </div>
                    </div>
                    <div className="chat-file-content">
                        {selectedFiles.map((file, index) => (
                            <MediaCard key={index} file={file} onDelete={handleDeleteFile} />
                        ))}
                        <Card className={"file-upload-add"} onClick={() => fileInputRef.current.click()}>
                            +
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBoxPage;
