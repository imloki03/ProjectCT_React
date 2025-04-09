import React, { useEffect, useState } from 'react';
import './index.css'
import searchIcon from '../../../assets/icons/search_icon_placeholder.svg'
import TextFieldIcon from "../../../components/TextFieldIcon";
import { TabView, TabPanel } from 'primereact/tabview';
import { searchMessage } from "../../../api/messageApi";
import {useDispatch, useSelector} from "react-redux";
import { Paginator } from "primereact/paginator";
import MessageDrawerItem from "../MessageDrawerItem";
import {setFinding} from "../../../redux/slices/chatSlice";
import BarProgress from "../../../components/BarProgress";
import {useTranslation} from "react-i18next";

const SearchMessageList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const project = useSelector((state) => state.project.currentProject);
    const [loading, setLoading] = useState(false);
    const [mediaResult, setMediaResult] = useState([]);
    const [messageResult, setMessageResult] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const {t} = useTranslation();
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(4);

    const [totalRecords2, setTotalRecords2] = useState(0);
    const [first2, setFirst2] = useState(0);
    const [rows2, setRows2] = useState(4);

    const dispatch = useDispatch();

    const goToSourceMessage = (messageId) => {
        dispatch(setFinding({ id: messageId, timestamp: Date.now() }));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!project?.id || !debouncedQuery) return;
        setLoading(true);
        try {
            if (activeIndex === 0) {
                const response = await searchMessage(project.id, first / rows, rows, "sentTime,DESC", debouncedQuery, "message");
                setMessageResult(response.data.content || []);
                setTotalRecords(response.data.totalElements || 0);
            } else {
                const response = await searchMessage(project.id, first2 / rows2, rows2, "sentTime,DESC", debouncedQuery, "media");
                setMediaResult(response.data.content || []);
                setTotalRecords2(response.data.totalElements || 0);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const onPageChange2 = (event) => {
        setFirst2(event.first);
        setRows2(event.rows);
    };

    useEffect(() => {
        handleSearch();
    }, [debouncedQuery, activeIndex, first, rows, first2, rows2]);

    return (
        <div className="search-message-list">
            <div className="drawer-search-bar">
                <TextFieldIcon
                    icon="pi pi-search"
                    placeholder={t('chatboxPage.search.placeholder')}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setFirst(0);
                        setFirst2(0);
                    }}
                />
            </div>
            {debouncedQuery ? (
                <div className="tabview-wrapper">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header={t('chatboxPage.search.tabs.messages')}>
                            {loading ? <BarProgress /> :
                                <>
                                    <div className="tab-panel-content">
                                        {messageResult.length > 0 ? (
                                            messageResult.map((msg) => (
                                                <MessageDrawerItem
                                                    key={msg.id}
                                                    msg={msg}
                                                    onGoToSource={goToSourceMessage}
                                                />
                                            ))
                                        ) : !loading ? (
                                            <div className="empty-result">
                                                {t('chatboxPage.search.emptyStates.noMessages', { query: debouncedQuery })}
                                            </div>
                                        ) : null}
                                    </div>
                                    <Paginator
                                        first={first}
                                        rows={rows}
                                        totalRecords={totalRecords}
                                        onPageChange={onPageChange}
                                        pageLinkSize={3}
                                    />
                                </>
                            }
                        </TabPanel>
                        <TabPanel header={t('chatboxPage.search.tabs.files')}>
                            {loading ? <BarProgress/> :
                                <>
                                    <div className="tab-panel-content">
                                        {mediaResult.length > 0 ? (
                                            mediaResult.map((msg) => (
                                                <MessageDrawerItem
                                                    key={msg.id}
                                                    msg={msg}
                                                    onGoToSource={goToSourceMessage}
                                                />
                                            ))
                                        ) : !loading ? (
                                            <div className="empty-result">
                                                {t('chatboxPage.search.emptyStates.noFiles', { query: debouncedQuery })}
                                            </div>
                                        ) : null}
                                    </div>
                                    <Paginator
                                        first={first2}
                                        rows={rows2}
                                        totalRecords={totalRecords2}
                                        onPageChange={onPageChange2}
                                        pageLinkSize={3}
                                    />
                                </>
                            }
                        </TabPanel>
                    </TabView>
                </div>
            ) : (
                <>
                    <img src={searchIcon} alt="Search Icon" className="drawer-search-icon" />
                    <div className="drawer-search-placeholder-text">
                        {t('chatboxPage.search.emptyStates.initial')}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchMessageList;
