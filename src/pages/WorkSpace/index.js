import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import "./index.css";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import {getAllProjects} from "../../api/projectApi";
import CreateProjectPopUp from "./CreateProjectPopUp";
import BasicButton from "../../components/Button";
import {ProjectCard} from "./ProjectCard";
import {getAllCollabOfProject} from "../../api/collabApi";
import TextFieldIcon from "../../components/TextFieldIcon";

// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { fas } from '@fortawesome/free-solid-svg-icons'
const WorkSpacePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Sort by create date");
    const [isAscending, setIsAscending] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [collaborators, setCollaborators] = useState({});
    const [loading, setLoading] = useState(true);
    const username = useSelector((state) => state.user.currentUser?.username);

    // library.add(fas)
    const fetchProjects = async () => {
        try {
            const fetchedProjects = await getAllProjects();
            setProjects(fetchedProjects.data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    const fetchCollaborators = async (projectId) => {
        try {
            const response = await getAllCollabOfProject(projectId);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch collaborators for project ${projectId}`, error);
            return [];
        }
    };


    useEffect(() => {
        if (username) {
            setLoading(true);
            fetchProjects().finally(() => setLoading(false));
        }
    }, [username]);

    useEffect(() => {
        const loadCollaborators = async () => {
            const collabMap = {};
            for (const project of projects) {
                const projectCollabs = await fetchCollaborators(project.id);
                collabMap[project.id] = projectCollabs;
            }
            setCollaborators(collabMap);
        };
        if (projects.length > 0) {
            loadCollaborators();
        }
    }, [projects]);

    const filteredProjects = projects
        .filter((project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;
            if (sortOption === "Sort by create date") {
                comparison = new Date(a.createdDate) - new Date(b.createdDate);
            }
            if (sortOption === "Sort by name") {
                comparison = a.name.localeCompare(b.name);
            }
            return isAscending ? comparison : -comparison;
        });

    const sortOptions = [
        { name: "Created date", value: "Sort by create date", icon: "fa-clock" },
        { name: "Project name", value: "Sort by name", icon: "fa-font" },
    ];

    const handleSortToggle = () => {
        setIsAscending((prev) => !prev);
    };

    const handleOpenModal = () => {
        setIsCreateProjectModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateProjectModalOpen(false);
        setLoading(true);
        fetchProjects().finally(() => setLoading(false))
    };

    const valueTemplate = (option) => {
        return (
            <span>
                <span style={{ fontWeight: "normal" }}>Sort by: </span>
                <span style={{ fontWeight: "bold" }}>{option?.name || "create date"}</span>
            </span>
        );
    };

    const itemTemplate = (option) => {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                {/*<FontAwesomeIcon icon={option.icon} className={"mr-2"} />*/}
                <span style={{ fontWeight: "bold" }}>{option.name}</span>
            </div>
        );
    };

    return (
        <div className="workspace-container">
            {/*{loading && <BarProgress />}*/}
            <div className="workspace-header">
                <h1 className="workspace-title">Projects</h1>
                <div className="workspace-actions">
                    <div className="search-container">
                        <TextFieldIcon
                            label="Search"
                            placeholder={"Search"}
                            name="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="pi-search"
                            iconPosition="left"
                        />
                    </div>
                    <div className="sort-container">
                        <Dropdown
                            value={sortOption}
                            onChange={(e) => setSortOption(e.value)}
                            options={sortOptions}
                            valueTemplate={valueTemplate}
                            itemTemplate={itemTemplate}
                            optionLabel="name"
                            placeholder="Select a sort option"
                            className="w-full md:w-14rem"
                            checkmark
                            highlightOnSelect={false}
                        />
                    </div>
                    <BasicButton
                        icon={isAscending ? "pi pi-sort-amount-up" : "pi pi-sort-amount-down"}
                        className="p-button-text p-button-plain"
                        onClick={handleSortToggle}
                        tooltip={isAscending ? "Ascending" : "Descending"}
                    />
                    <BasicButton label={"+ Project"} onClick={handleOpenModal} />
                </div>
            </div>
            {!loading && (
                <div className="workspace-grid">
                    {filteredProjects.map((project) => {
                        const projectCollaborators = collaborators[project.id] || [];
                        return (
                            <ProjectCard
                                key={project.id}
                                project={{ ...project, collaborators: projectCollaborators }}
                            />
                        );
                    })}
                </div>
            )}

            {isCreateProjectModalOpen && <CreateProjectPopUp onClose={handleCloseModal} />}
        </div>
    );
};

export default WorkSpacePage;
