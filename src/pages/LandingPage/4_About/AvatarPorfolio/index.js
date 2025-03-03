import React from "react";
import "./index.css";

const AvatarPorfolio = ({ src, alt = "Avatar" }) => {
    return (
        <div className="avatar-wrapper" style={{ width: "13rem", height: "13rem" }}>
            <div className="avatar-border">
                <img src={src} alt={alt} className="avatar-img" style={{ width: "12rem", height: "12rem" }} />
            </div>
        </div>
    );
};

export default AvatarPorfolio;