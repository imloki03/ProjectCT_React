import React, {useEffect, useState} from "react";
import "./index.css"
import {useSelector} from "react-redux";
import {addCollab} from "../../../api/collabApi";
import {useNotification} from "../../../contexts/NotificationContext";
import {useTranslation} from "react-i18next";
import PopupCard from "../../../components/PopupCard";
import TextField from "../../../components/TextField";
import {searchUser} from "../../../api/authApi";
import Avatar from "../../../components/Avatar";

const AddCollabDialog = ({ onClose }) => {
    const [username, setUsername] = useState("");
    const [debouncedUsername, setDebouncedUsername] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    const showNotification = useNotification();
    const { t } = useTranslation();

    const projectId = useSelector((state) => state.project.currentProject?.id);

    const handleAddCollaborator = async (userId) => {
        try {
            const response = await addCollab(projectId, userId);
            onClose();
            showNotification("success", t("collabPage.addCollab"), response.desc);
        } catch (error) {
            showNotification("error", t("collabPage.addCollab"), error.response.data.desc);
            onClose();
        }
    };

    const searchUsers = async () => {
        const response = await searchUser(username);
        setSearchResults(response.data);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedUsername(username);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [username]);

    useEffect(() => {
        if (debouncedUsername && debouncedUsername.trim() !== "") {
            searchUsers();
        } else {
            setSearchResults(null);
        }
    }, [debouncedUsername]);
    //
    // useEffect(() => {
    //     searchUsers();
    // }, [username]);

    return (
        <PopupCard
            title={t("collabPage.addCollab")}
            subTitle={t("collabPage.addCollabSubtitle")}
            style={{width: "25rem"}}
            onClose={onClose}
        >
            <TextField
                label={t("collabPage.usernameOrEmail")}
                value={username || ""}
                onChange={(e) =>{setUsername(e.target.value)}}
            />
            {
                searchResults &&
                searchResults.map((user) => {
                    return (
                        <div>{
                            user ?
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "94%",
                                        marginTop:"1rem",
                                        marginLeft: "3%",
                                        padding: "1rem",
                                        border: "1px solid #ccc",
                                        borderRadius: "0.5rem",
                                        cursor: "pointer",
                                        backgroundColor: "#f1f1f1"
                                    }}
                                    onClick={() => handleAddCollaborator(user.id)}
                                >
                                    <Avatar
                                        label={user.name}
                                        image={user.avatarURL}
                                        customSize="2.5rem"
                                    />

                                    <div style={{ display: "flex", flexDirection: "column", marginLeft: "0.5rem" }}>
                                        <span style={{ fontWeight: "bold" }}>{user.name}</span>
                                        <span style={{ color: "#555", fontSize: "0.85rem" }}>@{user.username}</span>
                                    </div>
                                </div>
                                :
                                <span style={{marginTop: "0.5rem"}}>{t("collabPage.noUser")}</span>
                        }
                        </div>
                    )
                })
            }
        </PopupCard>
    )
}

export default AddCollabDialog;