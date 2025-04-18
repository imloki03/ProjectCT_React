import React, {useEffect, useState} from 'react'
import PopupCard from "../PopupCard";
import TextField from "../TextField";
import DropDownField from "../DropDownField";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {useNotification} from "../../contexts/NotificationContext";
import BasicButton from "../Button";
import {updateOAuthUser} from "../../api/authApi";
import {updateOauth, updateUser} from "../../redux/slices/userSlice";

const UpdateOAuth = () => {
    const [name, setName] = useState();
    const [username, setUsername] = useState("");
    const [gender, setGender] = useState();
    const [email, setEmail] = useState();
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const showNotification = useNotification();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user?.currentUser);

    const genderOptions = [
        { label: t("authPage.male"), value: "MALE" },
        { label: t("authPage.female"), value: "FEMALE" },
        { label: t("authPage.other"), value: "OTHER" },
    ];

    useEffect(() => {
        setName(user?.name);
        setGender(user?.gender || genderOptions[0].value);
        setEmail(user?.email);
    }, [user]);

    const handleClose = () => {
        showNotification("error", "Warning", "Please update your information!")
    }

    const handleUpdateOAuth = async () => {
        try {
            setLoading(true);
            const response = await updateOAuthUser({
                "name": name,
                "username": username,
                "gender": gender
            });
            console.log(username)
            dispatch(updateUser(response.data));
            dispatch(updateOauth(true));
            localStorage.removeItem("updated");
        } catch (e) {
            showNotification("error", "Warning", e.response?.data?.desc);
        } finally {
            setLoading(false);
        }
    }

    return (
        <PopupCard
            title="Update Your Account"
            style={{width: "25rem"}}
            onClose={handleClose}
        >
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                <TextField label={t("authPage.fullName")} value={name}
                           onChange={(e)=> setName(e.target.value)}/>
                <TextField label={t("authPage.username")} value={username}
                           onChange={(e)=> setUsername(e.target.value)}/>
                <TextField label={t("authPage.email")} value={email}
                           disabled={true}/>
                <DropDownField label={t("authPage.gender")} options={genderOptions}
                               onChange={(value) => setGender(value.value)} selected={gender}
                               style={{width: '100%'}}/>
                <BasicButton
                    label={t("userProfile.save")}
                    onClick={handleUpdateOAuth}
                    loading={loading}
                    disabled={loading || username?.trim()===""}
                    width="100%"
                />
            </div>
        </PopupCard>
    );
}

export default UpdateOAuth;