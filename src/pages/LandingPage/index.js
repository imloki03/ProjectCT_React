import React, { useEffect, useRef } from "react";
import "./index.css";
import Banner from "./1_Banner";
import Header from "./0_Header";
import Function from "./2_Function";
import Benefit from "./3_Benefit";
import About from "./4_About";
import ThankYou from "./5_ThankYou";

const LandingPage = () => {
    const sectionsRef = useRef([]);

    useEffect(() => {
        const currentSections = sectionsRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        entry.target.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                });
            },
            {
                threshold: [0.5],
            }
        );

        currentSections.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => {
            currentSections.forEach((section) => {
                if (section) observer.unobserve(section);
            });
        };
    }, []);

    return (
        <div className="landing-background">
            <Header />
            <div ref={(el) => (sectionsRef.current[0] = el)}><Banner /></div>
            <div ref={(el) => (sectionsRef.current[1] = el)}><Function /></div>
            <div ref={(el) => (sectionsRef.current[2] = el)}><Benefit /></div>
            <div ref={(el) => (sectionsRef.current[3] = el)}><About /></div>
            <div ref={(el) => (sectionsRef.current[4] = el)}><ThankYou /></div>
        </div>
    );
};

export default LandingPage;
