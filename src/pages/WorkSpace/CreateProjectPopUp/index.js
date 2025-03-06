import React, {useState} from 'react';
import PopupCard from "../../../components/PopupCard";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import "./index.css"
import BasicButton from "../../../components/Button";
import {createNewProject} from "../../../api/projectApi";
import {useNotification} from "../../../contexts/NotificationContext";
import {useNavigate} from "react-router-dom";

const CreateProjectPopUp = ({onClose}) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
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
                await createNewProject(projectRequest);
                onClose()
                setLoading(false)
                return;
                // navigate
            }
            catch(err) {
                setLoading(false)
                showNotification("error", "Create Project Failed", "Unexpected error occurred");
                return;
            }
        }
        setLoading(false)
        showNotification("error", "Validation Error", "All fields are required.");
    }

    return (
        <div>
            <PopupCard title="Create New Project"
                       subTitle="Provide the details for your new project!"
                        onClose={onClose} className={"create-project-popup"}>
                <TextField name="name" label="Project Name" value={projectData.name} onChange={handleChange} />
                <TextFieldArea name="description" label="Description" value={projectData.description} onChange={handleChange} />
                <BasicButton label={"Create Project"} loading={loading} onClick={handleCreateProject} style={{width:'100%'}} width={"100%"} />
            </PopupCard>
        </div>
    );
};

export default CreateProjectPopUp;