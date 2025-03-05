import React, {useEffect, useState} from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/userSlice";
import { login } from "../../api/authApi";
import {API_BASE_URL} from "../../constants/env";
import {useNavigate} from "react-router-dom";
import {useLoading} from "../../contexts/LoadingContext";
import {useNotification} from "../../contexts/NotificationContext";
import TextField from "../../components/TextField";
import TextFieldArea from "../../components/TextFieldArea";
import OtpField from "../../components/OtpField";
import PasswordField from "../../components/PasswordField";
import BasicButton from "../../components/Button";
import PopupCard from "../../components/PopupCard";
import {useTranslation} from "react-i18next";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";

const TestPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const navigate = useNavigate();
    const setLoading = useLoading();
    const showNotification = useNotification();

    const [test, setTest] = useState("");

    const [num, setNum] = useState("");

    const [showPopup, setShowPopup] = useState(false);

    const { setBreadcrumbs } = useBreadcrumb();

    useEffect(() => {
        setBreadcrumbs([{ label: "Test", url: "/test"}]);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            console.log("API URL:", process.env.REACT_APP_API_BASE_URL);
            const userData = await login(username, password);
            dispatch(loginSuccess(userData));
            console.log(userData);
        } catch (err) {
            console.log(err)
            setError("Đăng nhập thất bại. Vui lòng kiểm tra lại.");
        }
    };

    const handleNavRegister = () => {
        navigate("/register")
    }

    const handleNavFW = () => {
        navigate("/forgot-password")
    }

    const handleLoading = () => {
        setLoading(true)
        showNotification("success", "Success", "This is a success message")
    }

    const handleNoti = () => {
        showNotification("success", "Success", "This is a success message")
    }

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <button onClick={handleNavRegister}>nav register</button>
            <button onClick={handleNavFW}>Forgot-pasword</button>
            <button onClick={handleLoading}>Loading</button>
            <button onClick={handleNoti}>Noti</button>

            <div style={{width: "300px", height: "600px", marginTop: "40px", marginLeft: "50px", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                <TextField
                    label="Test field name"
                    value={test}
                    onChange={(e) => {setTest(e.target.value)}}
                />
                <TextFieldArea
                    label="Test"
                    value={test}
                    rows="5"
                    onChange={(e) => {setTest(e.target.value)}}
                />
                <OtpField
                    value={num}
                    onChange={(e) => {setNum(e.value)}}
                    length="6"
                />
                <PasswordField
                    label="Pass"
                    value={test}
                    onChange={(e) => {setTest(e.target.value)}}
                />
                <BasicButton
                    label="Test"
                    onClick={()=>{setShowPopup(true)}}
                />
            </div>
            {showPopup &&
                <PopupCard
                    title="Test title"
                    subTitle="Test subtitle"
                    style={{width:"500px", margin: "auto" }}
                    onClose={()=>{setShowPopup(false)}}
                >
                    <div>
                        <p>{t("test")}</p>
                        <p>This is content</p>
                        <p>This is content</p>
                        <p>This is content</p>
                    </div>
                </PopupCard>
            }
        </div>
    );
};

export default TestPage;