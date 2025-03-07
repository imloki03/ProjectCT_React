import React, { useState } from "react";
import "./index.css";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useNavigate } from "react-router-dom";
import {changePassword, checkUserExist, getUserInfo} from "../../api/userApi";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { InputOtp } from "primereact/inputotp";
import { Steps } from "primereact/steps";
import { Divider } from "primereact/divider";
import { sendOtp, verifyOtp } from "../../api/authApi";
import logo from "../../assets/images/logo_with_name.png";
import {routeLink} from "../../router/Router";

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();
    const showNotification = useNotification();
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            return true;
        }
        showNotification("error", t("forgotPasswordPage.invalidEmail"), t("forgotPasswordPage.invalidEmailMessage"));
        return false;
    };

    const steps = [
        { label: t("forgotPasswordPage.enterEmail") },
        { label: t("forgotPasswordPage.verifyOtp") },
        { label: t("forgotPasswordPage.resetPassword") },
    ];

    const handleSendOtp = async () => {
        if (validateEmail(email)) {
            try {
                setLoading(true);
                await checkUserExist(email);
                await sendOtp(email);
                setStep(1);
            } catch (error) {
                showNotification("error", t("forgotPasswordPage.sendOtpFailed"), error.response?.data?.desc || error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 6) {
            setLoading(true);
            try {
                await verifyOtp(email, otp);
                setStep(2);
            } catch (error) {
                showNotification("error", t("forgotPasswordPage.verifyOtpFailed"), error.response?.data?.desc || error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResetPassword = async () => {
        if (newPassword) {
            setLoading(true);
            try {
                const request = {
                    "newPassword": newPassword
                }
                await changePassword(email, request);
                showNotification("success", t("forgotPasswordPage.resetPasswordSuccess"), t("forgotPasswordPage.reDirecting"));
                setTimeout(() => {
                    navigate(routeLink.auth);
                }, 4000); //
            } catch (error) {
                showNotification("error", t("forgotPasswordPage.resetPasswordFailed"), error.response?.data?.desc || error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const header = <div className="font-bold mb-3">{t("forgotPasswordPage.pickAPassword")}</div>;
    const footer = (
        <>
            <Divider/>
            <p className="mt-2">{t("forgotPasswordPage.suggestions")}</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>{t("forgotPasswordPage.lowercaseRequirement")}</li>
                <li>{t("forgotPasswordPage.uppercaseRequirement")}</li>
                <li>{t("forgotPasswordPage.numericRequirement")}</li>
                <li>{t("forgotPasswordPage.minCharacterRequirement")}</li>
            </ul>
        </>
    );

    return (
        <div className="forgetpassword-container">
            <div className="text-slogan">
                <img src={logo} alt="Logo" style={{width: "15rem", height: "auto"}}/>
            </div>
            <div className="forgetpassword-card">
                <Steps model={steps} activeIndex={step}/>
                {step === 0 && (
                    <div className="email-step">
                        <p className="otp-title">{t("forgotPasswordPage.enterYourEmail")}</p>
                        <p className="otp-subtitle">{t("forgotPasswordPage.provideRegisteredEmail")}</p>
                        <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("forgotPasswordPage.emailPlaceholder")} className="email-input" />
                        <div className="otp-footer">
                            <Button label={t("forgotPasswordPage.cancel")} onClick={() => navigate(routeLink.auth)} className="next-button" />
                            <Button label={loading ? t("forgotPasswordPage.sending") : t("forgotPasswordPage.next")} onClick={handleSendOtp} className="next-button" disabled={!email || loading} loading={loading} />
                        </div>
                    </div>
                )}
                {step === 1 && (
                    <div className="otp-step">
                        <p className="otp-title">{t("forgotPasswordPage.authenticateAccount")}</p>
                        <p className="otp-subtitle">{t("forgotPasswordPage.enterOtpSent")}</p>
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
                            <Button label={t("forgotPasswordPage.resendCode")} onClick={handleSendOtp} link disabled={loading}/>
                            <Button label={loading ? t("forgotPasswordPage.verifying") : t("forgotPasswordPage.submitCode")} onClick={handleVerifyOtp} disabled={!otp || loading} loading={loading} className="next-button"/>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="reset-password-step">
                        <p className="otp-title">{t("forgotPasswordPage.resetYourPassword")}</p>
                        <p className="otp-subtitle">{t("forgotPasswordPage.enterNewPassword")}</p>
                        <Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder={t("forgotPasswordPage.newPasswordPlaceholder")}
                                  className="password-input" feedback={true} header={header} footer={footer}/>
                        <div className="otp-footer">
                            <Button
                                label={loading ? t("forgotPasswordPage.resetting") : t("forgotPasswordPage.resetPassword")}
                                onClick={handleResetPassword} className="next-button" disabled={!newPassword || loading}
                                loading={loading}/>
                        </div>
                    </div>
                )}
            </div>
    </div>
    );
};

export default ForgotPasswordPage;
