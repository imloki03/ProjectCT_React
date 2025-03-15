import StoryIcon from "../../../assets/icons/story_icon.png";
import TaskIcon from "../../../assets/icons/task_icon.png";
import BugIcon from "../../../assets/icons/bug_icon.png";
import DropDownField from "../../DropDownField";
import {taskType} from "../../../constants/TaskType";
import React from "react";

const TypeBody = ({ rowData, setCurrentTaskId, handleUpdateTask, isTaskEditable }) => {
    const getTypeIcon = (type) => {
        switch(type) {
            case 'STORY':
                return StoryIcon;
            case 'TASK':
                return TaskIcon;
            case 'BUG':
                return BugIcon;
        }
    }

    const itemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.value} src={getTypeIcon(option.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
                <div>{option.label}</div>
            </div>
        );
    };

    return (
        <div style={{marginRight: "1rem"}}>
            <DropDownField
                selected={rowData.data.type}
                options={taskType}
                onChange={(e) => {
                    setCurrentTaskId(rowData.data.id);
                    rowData.data.type = e.value;
                    handleUpdateTask(rowData.data);
                }}
                itemTemplate={itemTemplate}
                valueTemplate={itemTemplate}
                disabled={!isTaskEditable}
            />
        </div>
    );
};

export default TypeBody;