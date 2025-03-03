import React from "react"
import './index.css'
import {useTranslation} from "react-i18next";
import { PrimeIcons } from "primereact/api";

const ThankYou = () => {
    const { t } = useTranslation();

    const messages = [
        t("landingPage.thanks1"),
        t("landingPage.thanks2"),
        t("landingPage.thanks3"),
        t("landingPage.thanks4"),
        t("landingPage.thanks5"),
        t("landingPage.thanks6")
    ];


    return (
        <div className="container relative mx-auto pt-8 lg:pt-16 px-4">
            <div className="about-background"></div>

            <h3 className="text-3xl md:text-7xl font-bold mb-3 text-white-alpha-100 text-center">
                {t("landingPage.thankYou")}
            </h3>

            <div className="thank-you-container">
                <ul className="thank-you-list">
                    {messages.map((message, index) => (
                        <li key={index} className="thank-you-item">
                            <i className={`pi ${PrimeIcons.HEART_FILL} thank-you-icon`} /> {message}
                        </li>
                    ))}
                </ul>
            </div>

            <hr className="divider" />

            <div className="copyright  text-center">
                © 2025 <strong>ProjectCT</strong>. Graduation Project at HCMUTE.
            </div>
        </div>
    )
}

export default ThankYou;