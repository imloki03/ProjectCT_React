import React, {useState} from 'react';
import PopupCard from "../../../components/PopupCard";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import "./index.css"
import BasicButton from "../../../components/Button";
import {createNewProject} from "../../../api/projectApi";
import {useNotification} from "../../../contexts/NotificationContext";
import {useNavigate} from "react-router-dom";
import {updateCurrentProject} from "../../../redux/slices/projectSlice";
import {useDispatch} from "react-redux";
import {routeLink} from "../../../router/Router";
import { useTranslation } from "react-i18next";

const CreateProjectPopUp = ({onClose}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const showNotification = useNotification();
    const [projectData, setProjectData] = useState({
        name: "",
        description: "",
    });

    const handleChange = (e) => {
        setProjectData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleCreateProject = async () => {
        if (projectData.name.trim()) {
            setLoading(true)
            try {
                const projectRequest = {
                    projectName: projectData.name,
                    projectDescription: projectData.description,
                }
                const response = await createNewProject(projectRequest);
                onClose()
                setLoading(false)
                dispatch(updateCurrentProject(response.data));
                navigate(routeLink.project.replace(":ownerUsername", response.data.ownerUsername)
                    .replace(":projectName",response.data.name));
            }
            catch(err) {
                setLoading(false)
                showNotification("error", t('workspacePage.createProjectPopUp.createFailed'), t('workspacePage.createProjectPopUp.unexpectedError'));
                return;
            }
        }
        setLoading(false)
        showNotification("error", t('workspacePage.createProjectPopUp.validationError'), t('workspacePage.createProjectPopUp.allFieldsRequired'));
    }

    return (
        <div>
            <PopupCard title={t('workspacePage.createProjectPopUp.title')}
                       subTitle={t('workspacePage.createProjectPopUp.subTitle')}
                       onClose={onClose} className={"create-project-popup"}>
                <TextField name="name" label={t('workspacePage.createProjectPopUp.projectName')} value={projectData.name} onChange={handleChange} />
                <TextFieldArea rows="5" name="description" label={t('workspacePage.createProjectPopUp.description')} value={projectData.description} onChange={handleChange} />
                <BasicButton label={t('workspacePage.createProjectPopUp.createButton')} loading={loading} onClick={handleCreateProject} style={{width:'100%'}} width={"100%"} />
            </PopupCard>
        </div>
    );
};

export default CreateProjectPopUp;
