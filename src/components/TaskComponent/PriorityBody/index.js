import VeryHighIcon from "../../../assets/icons/very_high_icon.png";
import HighIcon from "../../../assets/icons/high_icon.png";
import MediumIcon from "../../../assets/icons/medium_icon.png";
import LowIcon from "../../../assets/icons/low_icon.png";
import VeryLowIcon from "../../../assets/icons/very_low_icon.png";
import DropDownField from "../../DropDownField";
import {priority} from "../../../constants/Priority";
import React from "react";

const PriorityBody = ({ rowData, setCurrentTaskId, handleUpdateTask, isTaskEditable }) => {
    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'VERY_HIGH':
                return VeryHighIcon;
            case 'HIGH':
                return HighIcon;
            case 'MEDIUM':
                return MediumIcon;
            case 'LOW':
                return LowIcon;
            case 'VERY_LOW':
                return VeryLowIcon;
        }
    }

    const itemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.value} src={getPriorityIcon(option.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
                <div>{option.label}</div>
            </div>
        );
    };

    return (
        <div style={{ marginRight: "1rem" }}>
            <DropDownField
                selected={rowData.data.priority}
                options={priority}
                onChange={(e) => {
                    setCurrentTaskId(rowData.data.id);
                    rowData.data.priority = e.value;
                    handleUpdateTask(rowData.data);
                }}
                itemTemplate={itemTemplate}
                valueTemplate={itemTemplate}
                disabled={!isTaskEditable}
            />
        </div>
    );
};

export default PriorityBody;