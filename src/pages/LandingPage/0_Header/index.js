"use client";
import { useState, useEffect } from "react";
import './index.css'
import { Link } from "react-router-dom";
import LogoWithName from "../../../assets/images/logo_with_name.png"
import BasicButton from "../../../components/Button";
import {useTranslation} from "react-i18next";
import {changeLanguage} from "../../../config/i18n";
import {Dropdown} from "primereact/dropdown";

const languages = [
    { name: "English", code: "en", flag: "https://flagcdn.com/w40/gb.png" },
    { name: "Tiếng Việt", code: "vi", flag: "https://flagcdn.com/w40/vn.png" },
];

const Header = () => {
    const [sticky, setSticky] = useState(false);
    const { t } = useTranslation();

    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

    useEffect(() => {
        const currentLanguage = localStorage.getItem('language') || 'en';
        if (currentLanguage === "vi"){
            setSelectedLanguage(languages[1]);
        }
    }, []);

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.value);
        changeLanguage(e.value.code);
    };

    const selectedTemplate = (option) => (
        <div className="flex align-items-center">
            <img src={option.flag} alt={option.name} width="30" height="20" />
        </div>
    );

    const languageTemplate = (option) => (
        <div className="flex align-items-center">
            <img src={option.flag} alt={option.name} className="mr-2" width="20" height="15" />
            <span>{option.name}</span>
        </div>
    );

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
                    <Dropdown
                        value={selectedLanguage}
                        options={languages}
                        onChange={handleLanguageChange}
                        optionLabel="name"
                        className="p-0 border-none bg-transparent shadow-none"
                        itemTemplate={languageTemplate}
                        valueTemplate={selectedTemplate}
                        showClear={false}
                    />
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
