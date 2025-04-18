import React, {useState, useEffect, useRef} from 'react';
import "./index.css"
import {useDispatch, useSelector} from "react-redux";
import {Message} from "primereact/message";
import {Card} from "primereact/card";
import Avatar from "../../components/Avatar";
import {FileUpload} from "primereact/fileupload";
import {Dialog} from "primereact/dialog";
import BasicButton from "../../components/Button";
import {Image} from "primereact/image";
import {uploadFileToCloudinary} from "../../api/storageApi";
import {useNotification} from "../../contexts/NotificationContext";
import {updateUser} from "../../redux/slices/userSlice";
import {editProfile} from "../../api/userApi";
import {useTranslation} from "react-i18next";
import TextField from "../../components/TextField";
import {Chip} from "primereact/chip";
import DropDownField from "../../components/DropDownField";
import {tagList} from "../../constants/Tag";

const UserProfilePage = () => {
    const user = useSelector((state) => state.user?.currentUser || null);
    const fileUploadRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState();
    const showNotification = useNotification();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const [selectedTags, setSelectedTags] = useState(user?.tagList || []);
    const [selectingTags, setSelectingTags] = useState([]);
    const [tagDialogVisible, setTagDialogVisible] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [tagDialogTitle, setTagDialogTitle] = useState("");
    const [tagDialogSubtitle, setTagDialogSubtitle] = useState("");

    const [userData, setUserData] = useState({
        name: "",
        username: "",
        email: "",
        gender: "",
        avatarURL: "",
        tagList: []
    });

    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        setUserData(user);
    }, [user]);

    const validateUserData = () => {
        if (userData.name.trim()==="") {
            showNotification("error", t("userProfile.updateAvatar"), t("userProfile.nameRequired"));
            return false;
        }
        return true;
    };

    const handleProfileChange = (e) => {
        setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarClick = () => {
        fileUploadRef.current?.click();
    };

    const handleSelectFile = async (e) => {
        const file = e.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewVisible(true);
        }
    }

    const handleUploadFile = async () => {
        try {
            setIsLoading(true);
            const file = await uploadFileToCloudinary(avatarFile);
            try {
                const result = await editProfile({
                    "avatarURL": file.data.url
                });
                showNotification("success", t("userProfile.updateAvatar"), result.desc);
            } catch (e) {
                showNotification("error", t("userProfile.updateAvatar"), e.response?.data?.desc);
            }
        } catch (e) {
            showNotification("error", t("userProfile.uploadFailed"), t("authPage.unexpectedError"));
        } finally {
            setPreviewVisible(false);
            setIsLoading(false);
        }
    }

    const handleEditProfile = async () => {
        try {
            if (validateUserData()) {
                const result = await editProfile({"name": userData.name, "gender": userData.gender});
                showNotification("success", t("userProfile.updateAvatar"), result.desc);
                dispatch(updateUser(result.data));
            }
        } catch (e) {
            showNotification("error", t("userProfile.updateAvatar"), e.response?.data?.desc);
        }
    }

    const generateColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const h = Math.abs(hash % 360);
        const s = 80 + Math.abs(hash % 30);
        const l = 30 + Math.abs(hash % 20);

        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const tagSections = [
        { type: 'SKILLSET', title: t("userProfile.skillsetTitle"), subtitle: t("userProfile.skillsetSubtitle") },
        { type: 'ROLE', title: t("userProfile.roleTitle"), subtitle: t("userProfile.roleSubtitle") },
    ];

    const saveSelectedTags = async () => {
        try {
            setIsLoading(true);
            const selectedTagIds = [...selectedTags.map(tag => tag.id), ...selectingTags.map(tag => tag.id)];
            const response = await editProfile({"tagList": selectedTagIds});
            dispatch(updateUser(response.data));
            showNotification("success", t("userProfile.updateTag"), t("userProfile.updateTagSuccess"));
        } catch (error) {
            console.error("Error save tag:", error);
            showNotification("error", t("userProfile.updateTag"), error.response?.data?.desc);
        } finally {
            setTagDialogVisible(false);
            setIsLoading(false);
        }
    };

    const handleTagSelection = (tag) => {
        if (!selectingTags.some((selectedTag) => selectedTag.id === tag.id)) {
            setSelectingTags((prev) => [...prev, tag]);
        }
    };

    const handleTagRemoval = (tag) => {
        setSelectingTags(selectingTags.filter((selectedTag) => selectedTag.id !== tag.id));
    };

    const handleAddTag = async (type) => {
        setAvailableTags(tagList.filter((tag) => tag.type === type && !selectedTags.some((selectedTag) => selectedTag.id === tag.id))); // Filter by type
        const tagSection = tagSections.find((section) => section.type === type);
        if (tagSection) {
            setTagDialogTitle(tagSection.title);
            setTagDialogSubtitle(tagSection.subtitle);
        }
        setTagDialogVisible(true); // Show the dialog
    };

    const onRemoveTag = async (tagId) => {
        try {
            const updatedTags = selectedTags.filter(tag => tag.id !== tagId); // Remove tag
            setSelectedTags(updatedTags);

            const selectedTagIds = updatedTags.map((tag) => tag.id);
            const response = await editProfile({"tagList": selectedTagIds});
            dispatch(updateUser(response.data));
            showNotification("success", t("userProfile.updateTag"), t("userProfile.updateTagSuccess"));

        } catch (error) {
            console.error("Error save tag:", error);
            showNotification("error", t("userProfile.updateTag"), error.response?.data?.desc);
        }
    };

    const genderOptions = [
        { label: t("authPage.male"), value: "MALE" },
        { label: t("authPage.female"), value: "FEMALE" },
        { label: t("authPage.other"), value: "OTHER" },
    ];

    const cardHeader = (
        <div className="user-card-header">
            <h2>Profile</h2>
        </div>
    );
    return (
        <div className={"user-profile-container"}>
            {user?.tagList?.length === 0 && (
                <div className="user-warning-section">
                    <Message
                        severity="warn"
                        text={t("userProfile.profileWarning")}
                    />
                </div>
            )}
            <Card className="user-profile-card" header={cardHeader}>
                <div className="user-profile-content">
                    <div className="user-avatar-container"
                         onMouseEnter={() => {}}
                         onMouseLeave={() => {}}>
                        <Avatar
                            label={user?.name}
                            image={user?.avatarURL}
                            customSize="10rem"
                            onClick={handleAvatarClick}
                        />
                        <div
                            className="user-avatar-hover-icon"
                            onClick={handleAvatarClick}
                        >
                            <i className="pi pi-pencil" style={{ fontSize: "1.5rem" }} />
                        </div>
                    </div>
                    <TextField
                        label={t("userProfile.fullName")}
                        name="name"
                        value={userData?.name}
                        onChange={handleProfileChange}
                    />
                    <TextField
                        label={t("userProfile.username")}
                        name="username"
                        value={userData?.username}
                        onChange={handleProfileChange}
                        disabled={true}
                    />
                    <TextField
                        label={t("userProfile.email")}
                        name="email"
                        value={userData?.email}
                        onChange={handleProfileChange}
                        disabled={true}
                    />
                    <DropDownField
                        label={t("userProfile.gender")}
                        name="gender"
                        options={genderOptions}
                        selected={userData?.gender}
                        onChange={handleProfileChange}
                        style={{width: "100%"}}
                    />

                    <div className="tags-section">
                        <h3>User Tags</h3>

                        {/* Skillset Tags */}
                        <div className="tag-category">
                            <div className={"tag-header"}>
                                <h4>Skillset</h4>
                                <BasicButton label="+ Tag" className="add-button" onClick={() => handleAddTag("SKILLSET")}/>
                            </div>
                            {user?.tagList?.some((tag) => tag.type === "SKILLSET") ? (
                                <div className="chips-container">
                                    {user?.tagList
                                        ?.filter((tag) => tag.type === "SKILLSET")
                                        .map((tag) => (
                                            <Chip
                                                key={tag.id}
                                                label={tag.name}
                                                style={{
                                                    backgroundColor: generateColor(tag.name),
                                                    color: '#fff',
                                                }}
                                                className="chip"
                                                removable
                                                onRemove={() => onRemoveTag(tag.id)}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <p className="empty-category">{t("userProfile.noSkillset")}</p>
                            )}
                        </div>
                        {/* Role Tags */}
                        <div className="tag-category">
                            <div className={"tag-header"}>
                                <h4>Role</h4>
                                <BasicButton label="+ Tag" className="add-button" onClick={() => handleAddTag("ROLE")}/>
                            </div>
                            {user?.tagList?.some((tag) => tag.type === "ROLE") ? (
                                <div className="chips-container">
                                    {user?.tagList
                                        ?.filter((tag) => tag.type === "ROLE")
                                        .map((tag) => (
                                            <Chip
                                                key={tag.id}
                                                label={tag.name}
                                                style={{
                                                    backgroundColor: generateColor(tag.name),
                                                    color: '#fff',
                                                }}
                                                className="chip"
                                                removable
                                                onRemove={() => onRemoveTag(tag.id)}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <p className="empty-category">{t("userProfile.noRole")}</p>
                            )}
                        </div>
                    </div>

                    <BasicButton
                        label={t("userProfile.update")}
                        style={{margin: "auto"}}
                        onClick={handleEditProfile}
                        disabled={isLoading}
                        loading={isLoading}
                    />

                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileUploadRef}
                        onChange={(e) => handleSelectFile({ files: e.target.files })}
                    />
                </div>
            </Card>

            <Dialog
                header={tagDialogTitle}
                visible={tagDialogVisible}
                style={{ width: '30vw' }}
                onHide={() => {
                    setTagDialogVisible(false);
                }}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <BasicButton
                            label={t("userProfile.save")}
                            onClick={saveSelectedTags}
                            loading={isLoading}
                            disabled={isLoading}
                        />
                    </div>
                }
            >
                <div className="dialog-subtitle">{tagDialogSubtitle}</div>
                <div className="chips-container">
                    {availableTags.map((tag) => {
                        const isSelected = selectingTags.some(selectedTag => selectedTag.id === tag.id);
                        return(
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                style={{
                                    backgroundColor: isSelected ? generateColor(tag.name) : '#ddd',
                                    color: isSelected ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    margin: '5px',
                                }}
                                className={`chip ${isSelected ? 'p-chip-selected' : ''}`}
                                onClick={() => {
                                    if (selectingTags.some(selectedTag => selectedTag.id === tag.id)) {
                                        console.log(tag)
                                        handleTagRemoval(tag);
                                    } else {
                                        handleTagSelection(tag);
                                    }
                                }}
                            >
                            </Chip>
                        )
                    })}
                </div>
            </Dialog>

            <Dialog
                header="Avatar Preview"
                visible={previewVisible}
                style={{width: '30vw'}}
                onHide={() => setPreviewVisible(false)}
            >
                <div className="flex flex-column align-items-center">
                    {avatarFile && (
                        <div className="avatar-preview">
                            <Image src={URL.createObjectURL(avatarFile)} alt="Preview Avatar" width="100%"/>
                        </div>
                    )}
                    <BasicButton
                        className="mt-3"
                        label={t("userProfile.confirm")}
                        loading={isLoading}
                        disabled={isLoading}
                        onClick={handleUploadFile}
                    />
                </div>
            </Dialog>
        </div>
    )
}

export default UserProfilePage;