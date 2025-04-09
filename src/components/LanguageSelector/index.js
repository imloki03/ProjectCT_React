import React, {useEffect, useState} from "react";
import {languages} from "../../constants/Languages";
import {changeLanguage} from "../../config/i18n";
import {Dropdown} from "primereact/dropdown";

const LanguageSelector = () => {
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

    return (
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
    );
}

export default LanguageSelector;