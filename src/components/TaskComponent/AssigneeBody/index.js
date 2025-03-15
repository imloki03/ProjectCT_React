import React from "react";
import DropDownField from "../../DropDownField";
import Avatar from "../../Avatar";

const AssigneeBody = ({ rowData, collabs, setCurrentTaskId, handleAssignTask, isAssigneeEditable }) => {
    const avatarItemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <div style={{marginRight: "0.3rem"}}>
                    <Avatar
                        label={option?.label}
                        image={option?.avatar}
                        customSize="1.2rem"
                    />
                </div>
                <div>{option?.label}</div>
            </div>
        );
    };

    return (
        <div style={{ marginRight: "1rem" }}>
            <DropDownField
                selected={rowData.data.assigneeId}
                options={collabs}
                onChange={(e) => {
                    setCurrentTaskId(rowData.data.id);
                    rowData.data.assigneeId = e.value;
                    handleAssignTask(rowData.data);
                }}
                itemTemplate={avatarItemTemplate}
                valueTemplate={avatarItemTemplate}
                disabled={!isAssigneeEditable}
            />
        </div>
    );
}

export default AssigneeBody;