import {getAllCollabOfProject} from "../api/collabApi";
import {useSelector} from "react-redux";
import {APP_FUNCTIONS} from "../constants/Function";

const getAllCollabsKeyValue = async (projectId) => {
    try {
        const allCollabs = await getAllCollabOfProject(projectId);
        return allCollabs.data.map(collab => ({
            label: collab.user.name,
            value: collab.id,
            avatar: collab.user.avatarURL
        }));
    } catch (error) {
        console.error('Failed to load collabs:', error);
    }
};


export const hasPermission = (functionList, functionKey) => {
    if (!functionList) {
        return false;
    }
    return functionList.some(func => func.name.valueOf() === APP_FUNCTIONS[functionKey].valueOf());
}

export const countAssignedTasks = (task) => {
    let totalChildren = 0;
    let assignedCount = 0;
    let assigneeIds = new Set();

    const traverse = (node) => {
        if (!node || !node.children) return;

        for (const child of node.children) {
            totalChildren++;
            if (child.data.assigneeId) {
                assignedCount++;
                assigneeIds.add(child.data.assigneeId);
            }
            traverse(child);
        }
    };

    traverse(task);

    return {
        assignedCount,
        totalChildren,
        assigneeIds: Array.from(assigneeIds),
    };
};
export default getAllCollabsKeyValue;