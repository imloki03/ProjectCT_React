"use client";
import { useState, useEffect } from "react";
import './index.css'
import { Link } from "react-router-dom";
import LogoWithName from "../../../assets/images/logo_with_name.png"
import BasicButton from "../../../components/Button";
import {useTranslation} from "react-i18next";

const Header = () => {
    const [sticky, setSticky] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setSticky(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 w-full z-50 ${sticky ? "sticky-header" : ""}`}>
            <div className="container mx-auto flex align-items-center justify-content-between px-6">
                <Link to="/">
                    <img src={LogoWithName} alt="Logo" className="w-11rem h-auto" />
                </Link>

                <div className="flex align-items-center gap-3">
                    <Link to="/login">
                        <BasicButton label={t("landingPage.signin")} className="p-button-outlined p-button-sm text-white border-white" />
                    </Link>
                    <Link to="/register">
                        <BasicButton label={t("landingPage.signup")} className="p-button p-button-sm p-button-primary sign-up-btn" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
