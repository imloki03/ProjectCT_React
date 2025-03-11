import React from "react";
import { Card } from "primereact/card";
import './index.css'
import BasicButton from "../Button";
import {Button} from "primereact/button";

const PopupCard = ({ title, subTitle, children, footer, style, onClose, className }) => {
    return (
        <div className="popup-container ">
            <Card
                title={title}
                subTitle={subTitle}
                style={style}
                className="custom-card"
            >
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-text close-button"
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 1,
                    }}
                />
                <div className={className}>{children}</div>
            </Card>
        </div>
    );
};

export default PopupCard;
