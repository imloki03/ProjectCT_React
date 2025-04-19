import {useDispatch} from "react-redux";
import {useNavigate, useParams} from "react-router-dom";
import {getProjectByOwnerAndName} from "../api/projectApi";
import {updateCurrentCollab, updateCurrentProject} from "../redux/slices/projectSlice";
import {getCurrentCollab} from "../api/collabApi";
import {routeLink} from "../router/Router";

export const useFetchProject = () => {
    const dispatch = useDispatch();
    const { ownerUsername, projectName } = useParams();
    const navigate = useNavigate();

    return async () => {
        try {
            if (!ownerUsername || !projectName) {
                console.error("Project parameters are missing from the URL");
            }
            const fetchedProjects = await getProjectByOwnerAndName(ownerUsername, projectName.replaceAll("_", " "));
            const fetchedCurrentCollab = await getCurrentCollab(fetchedProjects.data.id);
            dispatch(updateCurrentProject(fetchedProjects.data));
            dispatch(updateCurrentCollab(fetchedCurrentCollab.data));
        } catch (error) {
            console.error("Failed to fetch projects", error);
            navigate(routeLink.pageNotFound);
        }
    };
};
