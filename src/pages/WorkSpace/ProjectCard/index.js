import React, { useRef } from "react";
import { Card } from "primereact/card";
import "./index.css";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import Avatar from "../../../components/Avatar";
import BasicButton from "../../../components/Button";
import {updateCurrentProject} from "../../../redux/slices/projectSlice";
import {routeLink} from "../../../router/Router";
import {useTranslation} from "react-i18next";

export const ProjectCard = ({ project }) => {
    const user = useSelector((state) => state.user.currentUser);
    const menuRef = useRef(null);
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigateToProjectManagement = () => {
        dispatch(updateCurrentProject(project));
        navigate(routeLink.project.replace(":ownerUsername", project.ownerUsername)
                                    .replace(":projectName", project.name.replaceAll(" ", "_")));
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        // dispatch(updateCurrentProject(project))
        // const urlName = project.urlName;
        // navigate(`/project/${urlName}/edit`);
    };

    function handleAddCollaborator(e) {
        e.stopPropagation();
        // dispatch(updateCurrentProject(project))
        // const urlName = project.urlName;
        // navigate(`/project/${urlName}/collaborators`);
    }

    return (
        <Card className="card_container" onClick={navigateToProjectManagement}>
            <div className="project_card">
                <div className="card_avatar">
                    <Avatar label={project.name} image={project.avatarURL} shape={"square"} customSize="6.5rem"/>
                </div>

                <div className="card_body">
                    <div className="card_name" title={project.name}>
                        {project.name}
                    </div>
                    <div>
                        <strong>{t("workspacePage.projectCard.projectOwner")}</strong> {project?.ownerUsername === user?.username ? user?.name : project?.collaborators.find((c) => (c.user.username === project?.ownerUsername))?.user.name}
                    </div>
                    <div>
                        <strong>{t("workspacePage.projectCard.createdDate")}</strong>{" "}
                        {new Date(project.createdDate).toLocaleDateString("en-GB")}
                    </div>
                    <div>
                        <strong>{t("workspacePage.projectCard.collaborators")}</strong>{" "}
                        <span className="collaboration-content">
                            {project.collaborators?.length > 0 &&
                                project.collaborators.slice(0, 3)
                                    .filter((collab) => (collab?.user.username !== project?.ownerUsername))
                                    .map((collab, index) => (
                                    <span key={index} className="collaborator-avatar">
                                    <Avatar
                                        label={collab.user.name}
                                        image={collab.user.avatarURL}
                                        shape="circle"
                                        customSize="1.5rem"
                                    />
                                    </span>
                                ))
                            }
                            {project.collaborators.length > 3 && (
                                <span className="extra-count">
                                    +{project.collaborators.length - 3}
                                </span>
                            )}
                            <div onClick={(e) => e.stopPropagation()}>
                                <BasicButton
                                    icon="pi pi-plus"
                                    className="p-button-rounded p-button-secondary p-button-outlined add-collaborator-button"
                                    onClick={handleAddCollaborator}
                                    tooltip={t("workspacePage.projectCard.addCollaborator")}
                                    tooltipOptions={{ position: "top" }}
                                />
                            </div>
                        </span>
                    </div>
                </div>

                <div className="card_more" onClick={(e) => e.stopPropagation()}>
                    <i
                        className="pi pi-pencil more_icon"
                        aria-label="Options"
                        onClick={handleMenuClick}
                        style={{cursor: "pointer"}}
                    />
                </div>
            </div>
        </Card>
    );
};
