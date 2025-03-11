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
export default getAllCollabsKeyValue;