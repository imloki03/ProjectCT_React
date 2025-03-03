import React from "react"
import './index.css'
import AvatarTemp from "../../../assets/images/logo.png"
import {useTranslation} from "react-i18next";
import AvatarPorfolio from "./AvatarPorfolio";
import ClickableImageIcon from "../../../components/ClickableImageIcon";
import FacebookIcon from "../../../assets/icons/facebook_icon.png"
import GmailIcon from "../../../assets/icons/gmail_icon.png"
import GithubIcon from "../../../assets/icons/github_icon.png"

const About = () => {
    const { t } = useTranslation();

    const teamMembers = [
        {
            name: t("landingPage.member1"),
            image: AvatarTemp,
            description: t("landingPage.memberDesc1"),
            facebook: "https://www.facebook.com/xc.lokigod/",
            gmail: "https://mail.google.com/mail/u/0/?fs=1&to=xc.lokigod@gmail.com&tf=cm",
            github: "https://github.com/imloki03",
        },
        {
            name: t("landingPage.member2"),
            image: AvatarTemp,
            description: t("landingPage.memberDesc2"),
            facebook: "https://www.facebook.com/profile.php?id=100009224679040",
            gmail: "https://mail.google.com/mail/u/0/?fs=1&to=phancong16092003@gmail.com&tf=cm",
            github: "https://github.com/phancong1609",
        },
    ];

    return (
        <div className="container relative mx-auto pt-8 lg:pt-16 px-4">
            <div className="about-background"></div>

            <h3 className="text-3xl md:text-7xl font-bold mb-3 text-white-alpha-100 text-center">
                {t("landingPage.whoWeAre")}
            </h3>
            <p className="text-color-secondary text-sm md:text-lg font-normal line-height-3 text-center mb-5"
               style={{padding: "0 25%"}}
            >
                {t("landingPage.whoWeAreDesc")}
            </p>

            <div className="about-container">
                <div className="about-left">
                    <AvatarPorfolio
                        src={teamMembers[0].image}
                    />
                    <h3 className="text-3xl font-bold text-white-alpha-100 text-center m-1">
                        [ {teamMembers[0].name} ]
                    </h3>
                    <div className="about-info">
                        <p className="text-color-secondary text-sm md:text-lg font-normal line-height-3 text-center mt-3">
                            {teamMembers[0].description}
                        </p>
                    </div>
                    <div className="about-contact-left">
                        <ClickableImageIcon
                            imageSrc={FacebookIcon}
                            link={teamMembers[1].facebook}
                        />
                        <ClickableImageIcon
                            imageSrc={GmailIcon}
                            link={teamMembers[1].gmail}
                        />
                        <ClickableImageIcon
                            imageSrc={GithubIcon}
                            link={teamMembers[1].github}
                        />
                    </div>
                </div>
                <div className="about-right">
                    <AvatarPorfolio
                        src={teamMembers[1].image}
                    />
                    <h3 className="text-3xl font-bold text-white-alpha-100 text-center m-2">
                        [ {teamMembers[1].name} ]
                    </h3>
                    <div className="about-info">
                        <p className="text-color-secondary text-sm md:text-lg font-normal line-height-3 text-center mt-3">
                            {teamMembers[1].description}
                        </p>
                    </div>
                    <div className="about-contact-right">
                        <ClickableImageIcon
                            imageSrc={FacebookIcon}
                            link={teamMembers[1].facebook}
                        />
                        <ClickableImageIcon
                            imageSrc={GmailIcon}
                            link={teamMembers[1].gmail}
                        />
                        <ClickableImageIcon
                            imageSrc={GithubIcon}
                            link={teamMembers[1].github}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About;