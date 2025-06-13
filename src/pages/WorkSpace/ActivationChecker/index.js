import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import { useTranslation } from "react-i18next";
import { InputOtp } from "primereact/inputotp";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { useNotification } from "../../../contexts/NotificationContext";
import logo from "../../../assets/images/logo_with_name.png";
import {sendOtp, verifyOtp} from "../../../api/authApi";
import './index.css'
import {loginSuccess, logout} from "../../../redux/slices/userSlice";
import {routeLink} from "../../../router/Router";
import {useNavigate} from "react-router-dom";
import {getUserInfo, updateUserStatus} from "../../../api/userApi";

const AccountActivationOverlay = ({ onActivationComplete }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const showNotification = useNotification();
    const currentUser = useSelector((state) => state.user.currentUser);
    const email = currentUser?.email || "";
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // const steps = [
    //     { label: t("accountActivation.verifyOtp") },
    //     { label: t("accountActivation.activationComplete") }
    // ];

    const handleResendOtp = async () => {
        try {
            setLoading(true);
            await sendOtp(email);
            showNotification("info", t("accountActivation.otpSent"), t("accountActivation.checkEmail"));
        } catch (error) {
            showNotification("error", t("accountActivation.sendOtpFailed"), error.response?.data?.desc || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 6) {
            setLoading(true);
            try {
                await verifyOtp(email, otp);
                try {
                    await updateUserStatus({
                        isNew: false,
                        isActive: true
                    });
                    try {
                        const updatedUserInfo = await getUserInfo(currentUser?.username).data;
                        dispatch(loginSuccess({
                            userData: updatedUserInfo,
                            token: localStorage.getItem("token"),
                        }));
                        showNotification("success", t("accountActivation.activationSuccess"), t("accountActivation.accountActivated"));
                        setTimeout(() => {
                            onActivationComplete();
                        }, 3000);
                    } catch (getUserError) {
                        showNotification("error", t("accountActivation.getUserInfoFailed"), getUserError.response?.data?.desc || getUserError.message);
                    }
                } catch (updateError) {
                    showNotification("error", t("accountActivation.updateStatusFailed"), updateError.response?.data?.desc || updateError.message);
                }
            } catch (error) {
                showNotification("error", t("accountActivation.verificationFailed"), error.response?.data?.desc || error.message);
            } finally {
                setLoading(false);
            }
        } else {
            showNotification("warn", t("accountActivation.invalidOtp"), t("accountActivation.enterComplete"));
        }
    };

    useEffect(() => {
        handleResendOtp();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("token");
        navigate(routeLink.default)
    }

    return (
        <div className="activation-overlay">
            <div className="activation-card">

                <div className="logo-container">
                    <img src={logo} alt="Logo" style={{ width: "15rem", height: "auto" }} />
                </div>

                <div className="otp-step">
                    <div className="logout-button-container">
                        <Button
                            icon="pi pi-sign-out"
                            label={t("accountActivation.logout")}
                            severity="secondary"
                            outlined
                            size="small"
                            onClick={handleLogout}
                            className="logout-button"
                        />
                    </div>
                    <p className="otp-title">{t("accountActivation.activateAccount")}</p>
                    <p className="otp-subtitle">{t("accountActivation.enterOtpSent")} {email}</p>

                    <InputOtp
                        value={otp}
                        onChange={(e) => setOtp(e.value)}
                        length={6}
                        inputTemplate={({events, props}) => (
                            <input
                                {...events}
                                {...props}
                                type="text"
                                className="custom-otp-input-sample"
                            />
                        )}
                    />

                    <div className="otp-buttons">
                        <Button
                            label={t("accountActivation.resendCode")}
                            onClick={handleResendOtp}
                            link
                            disabled={loading}
                        />
                        <Button
                            label={loading ? t("accountActivation.verifying") : t("accountActivation.submitCode")}
                            onClick={handleVerifyOtp}
                            disabled={otp.length !== 6 || loading}
                            loading={loading}
                            className="next-button"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivationChecker = ({ children }) => {
    const currentUser = useSelector((state) => state.user.currentUser);
    const [showActivation, setShowActivation] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.status && currentUser.status.activated === false) {
            setShowActivation(true);
        } else {
            setShowActivation(false);
        }
    }, [currentUser]);

    const handleActivationComplete = () => {
        setShowActivation(false);
    };

    return (
        <div className="activation-checker-container">
            {children}

            {showActivation && (
                <AccountActivationOverlay onActivationComplete={handleActivationComplete} />
            )}
        </div>
    );
};

export default ActivationChecker;