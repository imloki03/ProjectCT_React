import React, { useEffect, useRef } from "react";
import "./index.css";
import { Image } from "primereact/image";
import DemoImage from "../../../assets/images/logo.png";
import { useTranslation } from "react-i18next";

const Benefit = () => {
    const { t } = useTranslation();
    const featureRefs = useRef([]);

    const features = [
        { title: t("landingPage.benefitTitle1"), description: t("landingPage.benefitDesc1"), image: DemoImage },
        { title: t("landingPage.benefitTitle2"), description: t("landingPage.benefitDesc2"), image: DemoImage },
        { title: t("landingPage.benefitTitle3"), description: t("landingPage.benefitDesc3"), image: DemoImage },
    ];

    useEffect(() => {
        const handleScroll = () => {
            featureRefs.current.forEach((el) => {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight - 160) {
                        el.classList.add("visible");
                    } else {
                        el.classList.remove("visible");
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="container relative mx-auto pt-8 lg:pt-16 px-4">
            <div className="benefit-background"></div>

            <h3 className="text-3xl md:text-7xl font-bold mb-3 text-white-alpha-100 text-center">
                {t("landingPage.whyChooseUs")}
            </h3>
            <p className="text-color-secondary text-sm md:text-lg font-normal line-height-3 text-center mb-5"
               style={{padding: "0 25%"}}
            >
                {t("landingPage.whyChooseUsDesc")}
            </p>

            <div className="flex flex-column align-items-center gap-6 mb-3">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        ref={(el) => (featureRefs.current[index] = el)}
                        className={`feature-container flex flex-wrap align-items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                    >
                        <div className="w-12 md:w-6 flex justify-content-center">
                            <Image src={feature.image} alt={feature.title} width="280" />
                        </div>

                        <div className="w-12 md:w-5 text-gray-900">
                            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-md">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Benefit;
