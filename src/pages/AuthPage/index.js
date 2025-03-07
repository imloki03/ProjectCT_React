import React, { useState } from "react";
import "./index.css";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/userSlice";
import { login } from "../../api/authApi";
import { register } from "../../api/userApi";
import {useNavigate, useSearchParams} from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo_with_name.png"

import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import DropDownField from "../../components/DropDownField";
import { Divider } from "primereact/divider";
import BasicButton from "../../components/Button";
import {routeLink} from "../../router/Router";

const AuthPage = () => {
    const { t } = useTranslation();
    const showNotification = useNotification();
    const dispatch = useDispatch();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get("t") === "sign-up");

    const [loginData, setLoginData] = useState({
        username: "",
        password: ""
    });

    const [registerData, setRegisterData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        gender: "Male"
    });

    const handleLoginChange = (e) => {
        setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegisterChange = (e) => {
        setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateRegister = () => {
        if (!registerData.name || !registerData.username || !registerData.email || !registerData.password) {
            showNotification("error", t("authPage.registrationError"), t("authPage.allFieldsRequired"));
            return false;
        }
        if (!validateEmail(registerData.email)) {
            showNotification("error", t("authPage.invalidEmail"), t("authPage.invalidEmailFormat"));
            return false;
        }
        return true;
    };

    const validateLogin = () => {
        if (!loginData.username || !loginData.password) {
            showNotification("error", t("authPage.loginError"), t("authPage.usernamePasswordRequired"));
            return false;
        }
        return true;
    };

    // Need translation
    const header = <div className="font-bold mb-3">Pick a password</div>;
    const footer = (
        <>
            <Divider/>
            <p className="mt-2">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 6 characters</li>
            </ul>
        </>
    );

    const handleSignUp = async () => {
        if (validateRegister()) {
            setIsSigningUp(true);
            const requestData = {
                username: registerData.username,
                name: registerData.name,
                password: registerData.password,
                email: registerData.email,
                gender: registerData.gender
            };
            try {
                await register(requestData);
                // navigate("/"); nav to workspace
            } catch (error) {
                showNotification("error", t("authPage.signUpFailed"), error.response.data.desc);
            } finally {
                setIsSigningUp(false);
            }
        }
    };

    const handleSignIn = async () => {
        if (validateLogin()) {
            setIsLoggingIn(true);
            try {
                const response = await login(loginData.username, loginData.password);
                localStorage.setItem("token", response.data.token.token);
                dispatch(loginSuccess(response.data));
                navigate(`${routeLink.default}`);
            } catch (error) {
                console.log(error)
                showNotification("error", t("authPage.loginFailed"), error.response.data.desc);
            } finally {
                setIsLoggingIn(false);
            }
        }
    };

    const genderOptions = [
        { label: t("authPage.male"), value: "Male" },
        { label: t("authPage.female"), value: "Female" },
        { label: t("authPage.other"), value: "Other" },
    ];

    const [hasAnimated, setHasAnimated] = useState(false);

    const handleToggle = (state) => {
        setIsSignUp(state);
        setHasAnimated(true); // Enable animations after first interaction
    };

    return (
        <div className="auth-container">
            <div className="text-slogan">
                <img src={logo} alt="Logo" style={{ width: "15rem", height: "auto" }}/>
            </div>
            <div className={`auth-sub-container ${isSignUp ? "right-panel-active" : ""} ${hasAnimated ? "hasAnimated" : ""}`}>
                <div className="form-container sign-up-container">
                    <h1>{t("authPage.createAccount")}</h1>
                    <TextField label={t("authPage.fullName")} name="name" value={registerData.name}
                               onChange={handleRegisterChange}/>
                    <TextField label={t("authPage.username")} name="username" value={registerData.username}
                               onChange={handleRegisterChange}/>
                    <TextField label={t("authPage.email")} name="email" value={registerData.email}
                               onChange={handleRegisterChange}/>
                    <PasswordField label={t("authPage.password")} name="password" value={registerData.password}
                                   onChange={handleRegisterChange} header={header} footer={footer} feedback={true}/>
                    <DropDownField label={t("authPage.gender")} name="gender" options={genderOptions}
                                   onChange={handleRegisterChange} selected={registerData.gender}
                                   style={{width: '100%'}}/>
                    <BasicButton label={t("authPage.signUp")} className="auth-page-button" onClick={handleSignUp}
                                 loading={isSigningUp} style={{width: '100%'}} width="100%"/>
                </div>
                <div className="form-container sign-in-container">
                    <h1>{t("authPage.signIn")}</h1>
                    <TextField label={t("authPage.emailOrUsername")} name="username" value={loginData.username}
                               onChange={handleLoginChange}/>
                    <PasswordField label={t("authPage.password")} name="password" value={loginData.password}
                                   onChange={handleLoginChange}/>
                    <BasicButton label={t("authPage.signIn")} className="auth-page-button" onClick={handleSignIn}
                                 loading={isLoggingIn} style={{width: '100%'}} width="100%"/>
                    <p className={"clickable-text"}
                       onClick={() => navigate("/forgot-password")}>{t("authPage.forgotPassword")} </p>
                </div>
                <div className="side-element-container">
                    <div className="side-element">
                        <div className="side-element-panel side-element-left">
                            <h1>{t("authPage.hello")}</h1>
                            <p>{t("authPage.signUpPrompt")}</p>
                            <BasicButton label={t("authPage.signIn")} className="auth-page-button"
                                         onClick={() => handleToggle(false)}/>
                        </div>
                        <div className="side-element-panel side-element-right">
                            <h1>{t("authPage.welcome")}</h1>
                            <p>{t("authPage.signInPrompt")}</p>
                            <BasicButton label={t("authPage.signUp")} className="auth-page-button"
                                         onClick={() => handleToggle(true)}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-footer text-center">
                © 2025 <strong>ProjectCT</strong>. Graduation Project at HCMUTE.
            </div>
        </div>
    );
};

export default AuthPage;
