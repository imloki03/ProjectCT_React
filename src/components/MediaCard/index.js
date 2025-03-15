import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import "./index.css";
import pdfType from "../../assets/images/pdf_file_type.png";
import docType from "../../assets/images/docx_file_type.png";
import pptType from "../../assets/images/ppt_file_type.png";
import xlsType from "../../assets/images/xls_file_type.png";
import mediaType from "../../assets/images/media_file_type.png";

const fileIcons = new Map([
    ["pdf", pdfType],
    ["doc", docType],
    ["docx", docType],
    ["ppt", pptType],
    ["pptx", pptType],
    ["xls", xlsType],
    ["xlsx", xlsType],
    ["mp4", mediaType],
    ["mp3", mediaType],
    ["jpg", mediaType],
    ["png", mediaType],
    ["gif", mediaType],
]);

const MediaCard = ({ file, onDelete, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!file) return null;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileIcon = fileIcons.get(fileExtension) || mediaType;

    return (
        <div
            className="file-card-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                className="file-card"
                style={{
                    backgroundImage: `url(${fileIcon})`,
                    backgroundSize: "1.8rem",
                    backgroundPosition: "center top 0.7rem",
                    backgroundRepeat: "no-repeat",
                }}
                onClick={onClick}
            >
                <div className="file-name">{file.name}</div>
            </Card>

            {isHovered && onDelete && (
                <Button
                    icon="pi pi-trash"
                    className="delete-button p-button-danger"
                    onClick={() => onDelete(file)}
                />
            )}
        </div>
    );
};

export default MediaCard;
