import React, { useRef } from "react";
import { Card } from "primereact/card";
import "./index.css";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import Avatar from "../../../components/Avatar";
import BasicButton from "../../../components/Button";
export const ProjectCard = ({ project }) => {
    const menuRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigateToProjectManagement = () =>
    {
        // dispatch(updateCurrentProject(project))
        // const urlName = project.urlName;
        // navigate(`/project/${urlName}`);
    }

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
                        <strong>Project Owner:</strong> {project.ownerUsername}
                    </div>
                    <div>
                        <strong>Created Date:</strong>{" "}
                        {new Date(project.createdDate).toLocaleDateString("en-GB")}
                    </div>
                    <div>
                        <strong>Collaborators:</strong>{" "}
                        <span className="collaboration-content">
                            {project.collaborators?.length > 0 &&
                                project.collaborators.slice(0, 3).map((collab, index) => (
                                    <span key={index} className="collaborator-avatar">
                                    <Avatar
                                        label={collab.user.username}
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
                                    tooltip="Add Collaborator"
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
