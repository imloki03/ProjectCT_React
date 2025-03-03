import React from 'react';
import './index.css'
import BannerImage from '../../../assets/images/banner.png'
import {useTranslation} from "react-i18next";
import BasicButton from "../../../components/Button";
import {Link} from "react-router-dom";

const Banner = () => {
    const { t } = useTranslation();

    return (
        <div className="container relative mx-auto pt-8 lg:pt-16 px-4">
            <div className="banner-background"></div>
            <div className="relative z-10 banner-wrapper">
                <div className="banner-left">
                    <h1 className="text-4xl lg:text-7xl font-bold mb-5 text-white">
                        {t("landingPage.header")}
                    </h1>
                    <p className="text-white text-lg font-normal mb-6"
                        style={{width: "80%"}}
                    >
                        {t("landingPage.description")}
                    </p>
                    <div className="flex justify-content-center lg:justify-content-start align-items-center">
                        <Link to="/register">
                            <BasicButton
                                className="text-xl font-semibold text-white py-3 px-5 lg:px-6 get-started-btn"
                                label={t("landingPage.getStarted")}
                            />
                        </Link>
                    </div>
                </div>
                <div className="banner-right">
                    <img src={BannerImage} alt="Banner" className="banner-img" />
                </div>
            </div>
        </div>
    );
}

export default Banner;
