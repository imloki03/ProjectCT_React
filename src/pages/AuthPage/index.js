import React, { useState } from "react";
import "./index.css";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/userSlice";
import { login, loginWithSocialProvider } from "../../api/authApi"; // Updated import
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
import {API_BASE_URL} from "../../constants/env";

const AuthPage = () => {
    const { t } = useTranslation();
    const showNotification = useNotification();
    const dispatch = useDispatch();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isProcessingSocial, setIsProcessingSocial] = useState(false);
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
                try {
                    const loginResponse = await login(registerData.username, registerData.password);
                    localStorage.setItem("token", loginResponse.data.token.token);
                    dispatch(loginSuccess(loginResponse.data));
                    navigate(`${routeLink.default}`);
                } catch (loginError) {
                    console.log(loginError)
                    showNotification("error", t("authPage.loginFailed"), loginError.response.data.desc);
                }
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

    // Handle social login insert code here bro
    const handleSocialLogin = async () => {

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

                    <div className="social-login-container">
                        <Divider align="center">
                            <span className="social-divider-text">{t("authPage.orSignInWith")}</span>
                        </Divider>
                        <div className="social-buttons">
                            <button
                                className="social-login-button google-button"
                                onClick={() => window.location.href = `${API_BASE_URL}oauth2/authorization/google`}
                                disabled={isProcessingSocial}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                <span>Google</span>
                            </button>
                            <button
                                className="social-login-button github-button"
                                onClick={() => window.location.href = `${API_BASE_URL}oauth2/authorization/github`}
                                disabled={isProcessingSocial}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" className="social-icon">
                                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10"/>
                                </svg>
                                <span>GitHub</span>
                            </button>
                        </div>
                    </div>

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