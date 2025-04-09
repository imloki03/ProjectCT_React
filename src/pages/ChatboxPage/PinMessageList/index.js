import React, {useEffect, useState} from 'react';
import './index.css'
import {Paginator} from "primereact/paginator";
import {getPinMessageByProject} from "../../../api/messageApi";
import {useDispatch, useSelector} from "react-redux";
import {setFinding, setShouldReloadPin} from "../../../redux/slices/chatSlice";
import MessageDrawerItem from "../MessageDrawerItem";
import BarProgress from "../../../components/BarProgress";

const PinMessageList = ({pinMessageFunction}) => {
    const project = useSelector((state) => state.project.currentProject);
    const shouldReload = useSelector((state) => state.chat.shouldReloadPin);
    const [pinMessages, setPinMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(4);
    const dispatch = useDispatch();

    const goToSourceMessage = (messageId) => {
        dispatch(setFinding({ id: messageId, timestamp: Date.now() }));
    };

    const fetchPinMessages = async (page = 0) => {
        if (!project?.id) return;
        setLoading(true);
        try {
            const response = await getPinMessageByProject(project.id, page, rows);
            setPinMessages(response.data.content || []);
            setTotalRecords(response.data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching media messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const handleSendPinMessage = (msg) => {
        if (msg)
        {
            const pinMessageRequest = {
                pinMessageId: msg.id,
                projectId: project?.id,
                authToken: localStorage.getItem("token"),
            };
            pinMessageFunction(pinMessageRequest);
            dispatch(setShouldReloadPin(Date.now()));
        }
    }

    useEffect(() => {
        fetchPinMessages(first / rows);
    }, [project, first, rows, shouldReload])

    return (
        <div>
            {loading ? (
                    <BarProgress />
            ) : (
                <>
                    <div className="pin-message-list">
                        {pinMessages.map((msg) => (
                            <MessageDrawerItem
                                key={msg.id}
                                msg={msg}
                                onGoToSource={goToSourceMessage}
                                onUnpin={handleSendPinMessage}
                            />
                        ))}
                    </div>
                    <Paginator
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        onPageChange={onPageChange}
                        pageLinkSize={3}
                    />
                </>)}
        </div>
    );
};

export default PinMessageList;