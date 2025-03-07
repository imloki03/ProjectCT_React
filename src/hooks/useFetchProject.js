import {useDispatch} from "react-redux";
import {useParams} from "react-router-dom";
import {getProjectByOwnerAndName} from "../api/projectApi";
import {updateCurrentProject} from "../redux/slices/projectSlice";

export const useFetchProject = () => {
    const dispatch = useDispatch();
    const { ownerUsername, projectName } = useParams(); // Extract values from URL

    return async () => {
        try {
            if (!ownerUsername || !projectName) {
                throw new Error("Project parameters are missing from the URL");
            }
            const fetchedProjects = await getProjectByOwnerAndName(ownerUsername, projectName);
            dispatch(updateCurrentProject(fetchedProjects.data));
        } catch (error) {
            console.error("Failed to fetch projects", error);
            throw error;
        }
    };
};
