import {useDispatch} from "react-redux";
import {useParams} from "react-router-dom";
import {getProjectByOwnerAndName} from "../api/projectApi";
import {updateCurrentCollab, updateCurrentProject} from "../redux/slices/projectSlice";
import {getCurrentCollab} from "../api/collabApi";

export const useFetchProject = () => {
    const dispatch = useDispatch();
    const { ownerUsername, projectName } = useParams(); // Extract values from URL

    return async () => {
        try {
            if (!ownerUsername || !projectName) {
                throw new Error("Project parameters are missing from the URL");
            }
            const fetchedProjects = await getProjectByOwnerAndName(ownerUsername, projectName);
            const fetchedCurrentCollab = await getCurrentCollab(fetchedProjects.data.id);
            dispatch(updateCurrentProject(fetchedProjects.data));
            dispatch(updateCurrentCollab(fetchedCurrentCollab.data));
        } catch (error) {
            console.error("Failed to fetch projects", error);
            throw error;
        }
    };
};
