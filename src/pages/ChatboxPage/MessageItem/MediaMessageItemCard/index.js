import BarProgress from "../../../../components/BarProgress";
import {Button} from "primereact/button";
import {downloadMedia, getIconForType} from "../../../../utils/MediaUtil";
import React, {useState} from "react";
import MediaPreviewDialog from "../../../../components/MediaPreviewDialog";
import './index.css'
import {useDispatch, useSelector} from "react-redux";
import {
    setFinding,
    setFindingId,
} from "../../../../redux/slices/chatSlice";
import {Skeleton} from "primereact/skeleton";
import { Tooltip } from 'primereact/tooltip';
import {useTranslation} from "react-i18next";

const MediaMessageItemCard = ({message, isLoading, isSneakPeak, file, isSideBar, storeMediaMessage, isMediaStorable}) => {
    const project = useSelector((state) => state.project.currentProject);
    const [previewVisible, setPreviewVisible] = useState(false);
    const dispatch = useDispatch();
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [imageSize, setImageSize] = useState({ width: "100%", height: "200px" }); // Default height
    const {t} = useTranslation()
    const handleImageLoad = (event) => {
        setImageSize({
            width: event.target.naturalWidth + "px",
            height: event.target.naturalHeight + "px",
        });
        setMediaLoaded(true);
    };

    const goToSourceMessage = () => {
        dispatch(setFinding({ id: message.id, timestamp: Date.now() }));
    };

    const handleStoreMediaMessage = () => {
        const storeMediaMessageRequest = {
            mediaMessageId: message.id,
            mediaId: file.id,
            projectId: project?.id,
            authToken: localStorage.getItem("token"),
        }
        storeMediaMessage(storeMediaMessageRequest);
    }

    return (
        <div className="media-message-item">
            {/* Sneakpeak container remains unchanged */}
            {(file.type === "IMAGE" || file.type === "VIDEO") && isSneakPeak && !isLoading && (
                <div className="file-sneakpeak-container">
                    {file.type === "IMAGE" && !mediaLoaded && (
                        <Skeleton width={imageSize.width} height={imageSize.height} borderRadius="8px" />
                    )}
                    {file.type === "IMAGE" ? (
                        <img
                            src={file.link}
                            alt={file.name}
                            className="file-sneakpeak"
                            onLoad={handleImageLoad}
                            style={{display: mediaLoaded ? "block" : "none"}}
                        />
                    ) : null}
                    {file.type === "VIDEO" ? (
                        <video
                            src={file.link}
                            controls
                            className="file-sneakpeak"
                        />
                    ) : null}
                </div>
            )}
            <div className={`message-file-container`}>
                <div
                    className="file-type-img"
                    style={{backgroundImage: `url(${getIconForType(file)})`}}
                />
                <div className="file-content">
                    <div>{file.filename}</div>
                    {!isLoading && (
                        <div className="file-sub-text">
                            {t('chatboxPage.mediaCard.fileInfo.format', {
                                size: file.size,
                                type: file.type
                            })}
                            <i
                                className={`pi ${message.inStorage ? 'pi-check-circle' : 'pi-times-circle'}`}
                                style={{
                                    marginLeft: '4px',
                                    color: message.inStorage ? 'green' : 'red',
                                    position: 'relative',
                                    top: '2.5px'
                                }}
                                data-pr-tooltip={
                                    message.inStorage
                                        ? t('chatboxPage.mediaCard.fileStatus.stored')
                                        : t('chatboxPage.mediaCard.fileStatus.notStored')
                                }
                            />
                            <Tooltip target=".file-sub-text .pi" />
                        </div>
                    )}
                    {isLoading && <BarProgress/>}
                </div>
                {!isLoading && (
                    <div className={`${isSideBar? 'file-actions-instore' : 'file-actions'}`}>
                        <Button
                            icon="pi pi-eye"
                            className="chat-file-custom-button"
                            tooltip={t('chatboxPage.mediaCard.actions.preview')}
                            onClick={() => setPreviewVisible(true)}
                        />
                        <Button
                            icon="pi pi-download"
                            className="chat-file-custom-button"
                            tooltip={t('chatboxPage.mediaCard.actions.download')}
                            onClick={() => downloadMedia(file)}
                        />
                        {isSideBar && (
                            <Button
                                icon="pi pi-link"
                                className="chat-file-custom-button"
                                tooltip={t('chatboxPage.mediaCard.actions.toSource')}
                                onClick={goToSourceMessage}
                            />
                        )}
                        {!message.inStorage && isMediaStorable && (
                            <Button
                                icon="pi pi-file-import"
                                className="chat-file-custom-button"
                                tooltip={t('chatboxPage.mediaCard.actions.addToStorage')}
                                tooltipOptions={{ position: 'left' }}
                                onClick={handleStoreMediaMessage}
                            />
                        )}
                    </div>
                )}
            </div>
            <MediaPreviewDialog
                visible={previewVisible}
                onHide={() => setPreviewVisible(false)}
                media={file}
            />
        </div>
    );
};

export default MediaMessageItemCard;