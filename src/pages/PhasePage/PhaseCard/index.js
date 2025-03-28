import React, { useRef } from "react";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { status } from "../../../constants/Status";
import {useTranslation} from "react-i18next";

export const getStatusBorderColor = (statusValue) => {
    switch (statusValue) {
        case "TODO":
            return "0.2rem solid #0080FF";
        case "IN_PROGRESS":
            return "0.2rem solid #FF8000";
        case "DONE":
            return "0.2rem solid #00FF00";
        default:
            return "0.2rem solid #ccc";
    }
};

export const getStatusDetails = (statusValue) => {
    const foundStatus = status.find((s) => s.value === statusValue);
    return foundStatus ? foundStatus.label : "Unknown";
};

export const getStatusBadgeColor = (statusValue) => {
    switch (statusValue) {
        case "TODO":
            return "blue";
        case "IN_PROGRESS":
            return "orange";
        case "DONE":
            return "green";
        default:
            return "gray";
    }
};

const PhaseCard = ({ phase, onEdit, onDelete, updateCurrentPhase, isEdit, isDelete }) => {
    const menuRef = useRef(null);

    const { t } = useTranslation();

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    const statusLabel = getStatusDetails(phase.status);
    const badgeColor = getStatusBadgeColor(phase.status);

    const menuItems = [
        {
            label: t("backlogPage.edit"),
            icon: "pi pi-pencil",
            command: () => onEdit(),
            visible: isEdit
        },
        {
            label: t("backlogPage.delete"),
            icon: "pi pi-trash",
            command: () => onDelete(),
            visible: isDelete
        },
    ];

    return (
        <Card
            title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0" }}>
                    <span>{phase.name}</span>
                    {
                        (isEdit || isDelete) &&
                        <Button
                            icon="pi pi-ellipsis-v"
                            className="p-button-text"
                            onClick={(e) => {
                                updateCurrentPhase(phase);
                                e.stopPropagation();
                                menuRef.current.toggle(e)
                            }}
                            style={{padding: "0", width:"1.5rem"}}
                        />
                    }
                </div>
            }
            subTitle={
                <>
                    <div style={{ marginBottom: "0.2rem" }}>
                        <Badge value={statusLabel} style={{ backgroundColor: badgeColor, color: "white" }} />
                    </div>
                    <div style={{ color: "#888" }}>
                        {`${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}`}
                    </div>
                </>
            }
            style={{
                border: getStatusBorderColor(phase.status),
                marginBottom: "1rem",
                backgroundColor: "#F9F9F9",
            }}
            headerStyle={{
                marginBottom: "0.5rem",
            }}
        >
            <div style={{ padding: "0.7rem" }}>
                <p>{phase.description}</p>
            </div>

            {/* Popup menu for actions */}
            <Menu model={menuItems} popup ref={menuRef} />
        </Card>
    );
};

export default PhaseCard;