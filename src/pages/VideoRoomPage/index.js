import React, {useCallback, useEffect, useRef, useState} from "react";
import { connectSignaling, sendMessage } from "../../utils/signaling";
import {useSelector} from "react-redux";
import {useFetchProject} from "../../hooks/useFetchProject";
import './index.css'
import {Button} from "primereact/button";
import VideoOnIcon from '../../assets/icons/video_on_icon.png';
import VideoOffIcon from '../../assets/icons/video_off_icon.png';
import VoiceOnIcon from '../../assets/icons/voice_on_icon.png';
import VoiceOffIcon from '../../assets/icons/voice_off_icon.png';
import Avatar from "../../components/Avatar";
import {useNavigate} from "react-router-dom";
import {routeLink} from "../../router/Router";
import {WEBSOCKET_URL} from "../../constants/env";
import {useTranslation} from "react-i18next";

const VideoRoomPage = () => {
    const [peers, setPeers] = useState({});
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const hasLeftRef = useRef(false);
    const socketRef = useRef(null);
    const pendingCandidates = useRef({});

    const peerConnections = useRef({});

    const videoItemRef = useRef();
    const [avatarSize, setAvatarSize] = useState(226);

    const [gridCols , setGridCols ] = useState(0);
    const [widthPercent , setWidthPercent ] = useState(100);
    const [userInfos, setUserInfos] = useState([{}]);
    const [peerCameraStatus, setPeerCameraStatus] = useState({});
    const [peerVoiceStatus, setPeerVoiceStatus] = useState({});

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const fetchProject = useFetchProject();
    const navigate = useNavigate();

    const { t } = useTranslation();

    const roomId = useSelector((state) => state.project.currentProject?.id);
    const user = useSelector((state) => state.user.currentUser);
    const project = useSelector((state) => state.project.currentProject);

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        const updateSize = () => {
            if (videoItemRef.current) {
                const height = videoItemRef.current.offsetHeight;
                setAvatarSize(height * 0.4);
            }
        };

        updateSize(); // gọi khi mounted
        window.addEventListener("resize", updateSize);

        return () => window.removeEventListener("resize", updateSize);
    }, [peers]);

    useEffect(() => {
        // console.log(Object.keys(peers).length)
        const totalVideos = Object.keys(peers).length + 1;

        const getGridCols = (count) => {
            if (count <= 1) return 1;
            if (count <= 2) return 2;
            if (count <= 3) return 2.2;
            if (count <= 4) return 2.2;
            if (count <= 6) return 3;
            if (count <= 9) return 3;
            if (count <= 12) return 4;
            return Math.ceil(Math.sqrt(count));
        };

        const cols = getGridCols(totalVideos);
        const rows = Math.ceil(totalVideos / cols);
        setGridCols(cols);
        setWidthPercent(95 / cols);
    }, [peers]);

    const leaveRoom = () => {
        if (hasLeftRef.current) return;
        hasLeftRef.current = true;

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            sendMessage(socketRef.current, { type: "leave" });
            socketRef.current.close();
        }

        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            localStreamRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        setPeers({});
    };

    useEffect(() => {
        if (!roomId || localStreamRef.current) return;
        // 1. Lấy stream video local
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        });


        // 2. Kết nối signaling
        socketRef.current = connectSignaling(handleMessage);
        socketRef.current.onopen = () => {
            sendMessage(socketRef.current, { type: "join", room: roomId, user: user });
        };

        return () => {
            leaveRoom();
            socketRef.current?.close();
            Object.values(peerConnections.current).forEach(pc => pc.close());
        };
    }, [roomId]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            leaveRoom();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            leaveRoom();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!isVideoOff && localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [isVideoOff]);

    const handleMessage = async (msg) => {
        switch (msg.type) {
            case "peers":
                msg.peers.forEach(p => {
                    createPeerConnection(p.peerId, true);
                    setUserInfos(prev => ({ ...prev, [p.peerId]: p.user }));
                });
                break;

            case "new-peer":
                createPeerConnection(msg.peerId, false);
                setUserInfos(prev => ({ ...prev, [msg.peerId]: msg.user }));
                break;

            case "offer":
                await handleOffer(msg);
                break;

            case "answer":
                await peerConnections.current[msg.from].setRemoteDescription(new RTCSessionDescription(msg.answer));
                break;

            case "candidate":
                const pc = peerConnections.current[msg.from];
                const candidate = new RTCIceCandidate(msg.candidate);
                if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(candidate);
                } else {
                    // Remote chưa sẵn sàng → lưu tạm
                    if (!pendingCandidates.current[msg.from]) {
                        pendingCandidates.current[msg.from] = [];
                    }
                    pendingCandidates.current[msg.from].push(candidate);
                }
                break;
            case "peer-left":
                const peerId = msg.peerId;

                if (peerConnections.current[peerId]) {
                    peerConnections.current[peerId].close();
                    delete peerConnections.current[peerId];
                }

                setPeers(prev => {
                    const updated = { ...prev };
                    delete updated[peerId];
                    return updated;
                });

                if (pendingCandidates.current[peerId]) {
                    delete pendingCandidates.current[peerId];
                }
                break;
            case "camera-off":
            case "camera-on":
                updatePeerCameraStatus(msg.peerId, msg.type === "camera-on");
                break;

            case "voice-off":
            case "voice-on":
                updatePeerVoiceStatus(msg.peerId, msg.type === "voice-on");
                break;
        }
    };

    const updatePeerCameraStatus = (peerId, isOn) => {
        setPeerCameraStatus(prev => ({
            ...prev,
            [peerId]: isOn
        }));
    };

    const updatePeerVoiceStatus = (peerId, isOn) => {
        setPeerVoiceStatus(prev => ({
            ...prev,
            [peerId]: isOn
        }));
    };

    const createPeerConnection = async (peerId, isInitiator) => {
        const pc = new RTCPeerConnection();

        // ICE
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                sendMessage(socketRef.current, {
                    type: "candidate",
                    to: peerId,
                    candidate: e.candidate
                });
            }
        };

        // Track
        pc.ontrack = (e) => {
            setPeers(prev => ({
                ...prev,
                [peerId]: e.streams[0]
            }));
        };

        // Add local tracks (kiểm tra kỹ localStreamRef)
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track =>
                pc.addTrack(track, localStreamRef.current)
            );
        } else {
            console.warn("localStreamRef.current is null!");
        }

        peerConnections.current[peerId] = pc;

        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendMessage(socketRef.current, {
                type: "offer",
                to: peerId,
                offer
            });
        }

        return pc;
    };

    const handleOffer = async (msg) => {
        const pc = await createPeerConnection(msg.from, false);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendMessage(socketRef.current, {
            type: "answer",
            to: msg.from,
            answer
        });

        if (pendingCandidates.current[msg.from]) {
            pendingCandidates.current[msg.from].forEach(c =>
                pc.addIceCandidate(new RTCIceCandidate(c))
            );
            delete pendingCandidates.current[msg.from];
        }
    };

    const toggleVideo = () => {
        const videoTrack = localStreamRef.current?.getVideoTracks()?.[0];

        if (videoTrack && videoTrack.readyState === "live") {
            videoTrack.stop();
            setIsVideoOff(true);
            sendMessage(socketRef.current, { type: "camera-off" });
        } else {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                const newTrack = stream.getVideoTracks()[0];

                // Gán stream mới cho local ref và video element
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Gửi video track mới tới tất cả peers
                Object.values(peerConnections.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === "video");
                    if (sender) {
                        sender.replaceTrack(newTrack);
                    } else {
                        pc.addTrack(newTrack, stream);
                    }
                });

                setIsVideoOff(false);
                sendMessage(socketRef.current, { type: "camera-on" });
            });
        }
    };

    const toggleMute = () => {
        const audioTrack = localStreamRef.current?.getAudioTracks()?.[0];

        if (audioTrack && audioTrack.readyState === "live") {
            audioTrack.stop();
            setIsMuted(true);
            sendMessage(socketRef.current, { type: "voice-off" });
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                const newAudioTrack = stream.getAudioTracks()[0];

                // Gán track mới vào localStreamRef (giữ lại các track video cũ nếu có)
                const oldStream = localStreamRef.current;
                const videoTracks = oldStream?.getVideoTracks() || [];
                const newStream = new MediaStream([...videoTracks, newAudioTrack]);
                localStreamRef.current = newStream;

                // Gán lại srcObject nếu cần
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = newStream;
                }

                // Replace audio track cho các peer
                Object.values(peerConnections.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === "audio");
                    if (sender) {
                        sender.replaceTrack(newAudioTrack);
                    } else {
                        pc.addTrack(newAudioTrack, newStream);
                    }
                });

                setIsMuted(false);
                sendMessage(socketRef.current, { type: "voice-on" });
            });
        }
    };

    const handleLeave = () => {
        leaveRoom();
        socketRef.current?.close();
        Object.values(peerConnections.current).forEach(pc => pc.close());
        navigate(routeLink.project.replace(":ownerUsername", project?.ownerUsername)
            .replace(":projectName", project?.name.replaceAll(" ", "_")));
    };

    return (
        <div style={{ height: "92vh", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflow: "auto", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: `${widthPercent}%`, ...(Object.keys(peers).length === 0 && { height: "100%" }) }}
                    className="video-container"
                >
                    {
                        !isVideoOff ?
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="video-item"
                                style={{transform: "scaleX(-1)"}}
                            /> :
                            <div className="video-item"
                                 ref={videoItemRef}
                                 style={{display: "flex", justifyContent: "center", alignItems: "center"}}
                            >
                                {
                                    avatarSize > 0 &&
                                    <Avatar
                                        label={user?.name}
                                        image={user?.avatarURL}
                                        customSize={`${avatarSize}px`}
                                    />
                                }
                            </div>
                    }
                </div>

                {Object.entries(peers).map(([id, stream]) => {
                    const isCameraOn = peerCameraStatus[id] ?? true;
                    const userInfo = userInfos[id];
                    return (
                        <div key={id} style={{ width: `${widthPercent}%` }} className="video-container">
                            {isCameraOn ? (
                                <video
                                    autoPlay
                                    playsInline
                                    ref={(video) => {
                                        if (video && video.srcObject !== stream) {
                                            video.srcObject = stream;
                                        }
                                    }}
                                    className="video-item"
                                />
                            ) : (
                                <div className="video-item"
                                     ref={videoItemRef}
                                     style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    {
                                        avatarSize>0 &&
                                        <Avatar
                                            label={userInfo?.name}
                                            image={userInfo?.avatarURL}
                                            customSize={`${avatarSize}px`}
                                        />
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
                <Button
                    icon={isVideoOff ?
                        <img
                            src={VideoOffIcon}
                            alt="video off icon"
                            style={{ width: 20, height: 20 }}
                        /> :
                        <img
                            src={VideoOnIcon}
                            alt="video on icon"
                            style={{ width: 20, height: 20 }}
                        />}
                    className={`p-button-rounded ${isVideoOff ? 'p-button-danger' : 'p-button-secondary'}`}
                    onClick={toggleVideo}
                    tooltip={isVideoOff ? t("meetingPage.videoOn") : t("meetingPage.videoOff")}
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon={isMuted ?
                        <img
                            src={VoiceOffIcon}
                            alt="voice icon off"
                            style={{ width: 20, height: 20 }}
                        /> :
                        <img
                            src={VoiceOnIcon}
                            alt="voice icon on"
                            style={{ width: 20, height: 20 }}
                        />}
                    className={`p-button-rounded ${isMuted ? 'p-button-danger' : 'p-button-secondary'}`}
                    onClick={toggleMute}
                    tooltip={isMuted ? t("meetingPage.micOn") : t("meetingPage.micOff")}
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-sign-out"
                    className="p-button-rounded p-button-danger"
                    onClick={handleLeave}
                    tooltip={t("meetingPage.leave")}
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        </div>
    );
};

export default VideoRoomPage;
