import React from "react";
import DropDownField from "../../DropDownField";
import {status} from "../../../constants/Status";
import ToDoIcon from '../../../assets/icons/to_do_icon.png'
import InProgressIcon from '../../../assets/icons/in_progress_icon.png'
import DoneIcon from '../../../assets/icons/done_icon.png'


const StatusBody = ({ rowData, setCurrentTaskId, handleUpdateTaskStatus, isStatusUpdatable }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'TODO':
                return ToDoIcon;
            case 'IN_PROGRESS':
                return InProgressIcon;
            case 'DONE':
                return DoneIcon;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'TODO':
                return "#33aef6";
            case 'IN_PROGRESS':
                return "#fcaa20";
            case 'DONE':
                return "#38f842";
        }
    };

    const itemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img alt={option?.value} src={getStatusIcon(option?.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
                <div style={{padding: "0.2rem", borderRadius:"4px", backgroundColor: getStatusColor(option?.value)}}>{option?.label}</div>
            </div>
        );
    };

    return (
        <div style={{ marginRight: "1rem" }}>
            <DropDownField
                selected={rowData.data.status}
                options={status}
                onChange={(e) => {
                    setCurrentTaskId(rowData.data.id);
                    rowData.data.status = e.value;
                    handleUpdateTaskStatus(rowData.data);
                }}
                itemTemplate={itemTemplate}
                valueTemplate={itemTemplate}
                disabled={!isStatusUpdatable}
            />
        </div>
    );
};

export default StatusBody;