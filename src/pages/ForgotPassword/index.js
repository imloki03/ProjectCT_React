import React, { useRef, useState } from "react";
import "./index.css";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/userApi";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import {InputOtp} from "primereact/inputotp";
import {Steps} from "primereact/steps";
import {Divider} from "primereact/divider";

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();
    const showNotification = useNotification();
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleResetPassword = async () => {
        if (newPassword) {
            setIsResettingPassword(true);
            const requestData = {
                newPassword: newPassword
            };
            try {
                const response = await changePassword("congphan", requestData);

                if (response.status === 200) {
                    navigate("/");
                } else {
                    showNotification("error", t("forgotPasswordPage.resetPasswordFailed"), response.desc);
                }
            } catch (error) {
                showNotification("error", t("forgotPasswordPage.resetPasswordFailed"), t("forgotPasswordPage.unexpectedError"));
            } finally {
                setIsResettingPassword(false);
            }
        }
    };

    const steps = [
        { label: "Enter Email" },
        { label: "Verify OTP" },
        { label: "Reset Password" },
    ];

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

    function handleSendOtp() {

    }

    function handleVerifyOtp() {

    }

    return (
        <div className="forgetpassword-container">
            <div className="text-slogan">
                <div className="text-slogan-header">{t("forgotPasswordPage.appName")}</div>
                <div>{t("forgotPasswordPage.letTheGearsSpeedingUp")}</div>
            </div>
            <div className="forgetpassword-card">
                <Steps model={steps} activeIndex={step} />
                {/* Step 1: Enter Email */}
                {step === 0 && (
                    <div className="email-step">
                        <p className="otp-title">Enter Your Email</p>
                        <p className="otp-subtitle">Please provide your registered email address.</p>
                        <InputText
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="email-input"
                        />
                        <div className="otp-footer">
                            <Button
                                label={"Cancel"}
                                onClick={()=>{navigate("/")}}
                                className="next-button"
                            />
                            <Button
                                label={loading ? "Sending..." : "Next"}
                                onClick={handleNext}
                                className="next-button"
                                disabled={!email || loading}
                                loading={loading}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Verify OTP */}
                {step === 1 && (
                    <div className="otp-step">
                        <p className="otp-title">Authenticate Your Account</p>
                        <p className="otp-subtitle">Please enter the code sent to your email.</p>
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
                            <Button label="Resend Code" onClick={handleSendOtp} link disabled={loading}/>
                            <Button
                                label={loading ? "Verifying..." : "Submit Code"}
                                onClick={handleNext}
                                disabled={!otp || loading}
                                loading={loading}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Reset Password */}
                {step === 2 && (
                    <div className="email-step">
                        <p className="otp-title">Reset Your Password</p>
                        <p className="otp-subtitle">Please enter a new password.</p>
                        <Password
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="password-input"
                            feedback={true}
                            header={header}
                            footer={footer}
                        />
                        <Button
                            label={loading ? "Resetting..." : "Reset Password"}
                            onClick={handleResetPassword}
                            className="next-button"
                            disabled={!newPassword || loading}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
