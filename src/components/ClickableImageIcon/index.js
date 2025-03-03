import React from "react";
import { Image } from "primereact/image";
import "./index.css";

const ClickableImageIcon = ({ link, imageSrc }) => {
    const handleClick = () => {
        window.open(link, "_blank");
    };

    return (
        <div className="icon-wrapper" onClick={handleClick}>
            <Image src={imageSrc} alt="icon" className="icon-image"/>
        </div>
    );
};

export default ClickableImageIcon;