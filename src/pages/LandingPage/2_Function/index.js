import React from 'react';
import './index.css'
import {Card} from "primereact/card";
import {Carousel} from "primereact/carousel";
import {useTranslation} from "react-i18next";

const Function = () => {
    const { t } = useTranslation();

    const items = [
        { id: 1, title: t("landingPage.funcTitle1"), icon: "pi pi-star", content: t("landingPage.funcDesc1") },
        { id: 2, title: t("landingPage.funcTitle2"), icon: "pi pi-heart", content: t("landingPage.funcDesc2") },
        { id: 3, title: t("landingPage.funcTitle3"), icon: "pi pi-check", content: t("landingPage.funcDesc3") },
        { id: 4, title: t("landingPage.funcTitle4"), icon: "pi pi-check", content: t("landingPage.funcDesc4") },
        { id: 5, title: t("landingPage.funcTitle5"), icon: "pi pi-check", content: t("landingPage.funcDesc5") },
    ];

    const itemTemplate = (item) => {
        return (
            <div className="custom-card-container">
                <div className="custom-function-icon-container">
                    <i className={`pi ${item.icon} custom-function-icon-style`}></i>
                </div>

                <Card className="custom-function-card">
                    <h3 className="title">{item.title}</h3>
                    <p className="content">{item.content}</p>
                </Card>
            </div>
        );
    };

    return (
        <div className="container relative mx-auto pt-8 lg:pt-16 px-4">
            <div className="function-background"></div>

            <h3 className="text-3xl md:text-7xl font-bold mb-3 text-white-alpha-100 text-center">
                {t("landingPage.howItWork")}
            </h3>
            <p className="text-color-secondary text-sm md:text-lg font-normal line-height-3 text-center"
                style={{padding: "0 25%"}}
            >
                {t("landingPage.howItWorkDes")}
            </p>

            <div>
                <Carousel
                    value={items}
                    itemTemplate={itemTemplate}
                    numVisible={3}
                    numScroll={1}
                    circular
                    autoplayInterval={3000}
                    showIndicators={false}
                />
            </div>
        </div>
    )
}

export default Function;