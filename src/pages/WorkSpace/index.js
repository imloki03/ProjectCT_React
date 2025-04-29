import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import "./index.css";
import { Dropdown } from "primereact/dropdown";
import { getAllProjects } from "../../api/projectApi";
import CreateProjectPopUp from "./CreateProjectPopUp";
import BasicButton from "../../components/Button";
import { ProjectCard } from "./ProjectCard";
import { getAllCollabOfProject } from "../../api/collabApi";
import TextFieldIcon from "../../components/TextFieldIcon";
import BarProgress from "../../components/BarProgress";
import ActivationChecker from "./ActivationChecker";

const WorkSpacePage = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Sort by create date");
    const [isAscending, setIsAscending] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [collaborators, setCollaborators] = useState({});
    const [loading, setLoading] = useState(true);
    const username = useSelector((state) => state.user.currentUser?.username);

    const fetchProjectsAndCollaborators = async () => {
        if (!username) return;

        setLoading(true);
        try {
            const fetchedProjects = await getAllProjects();
            setProjects(fetchedProjects.data);
            const collabMap = {};
            for (const project of fetchedProjects.data) {
                const projectCollabs = await getAllCollabOfProject(project.id);
                collabMap[project.id] = projectCollabs.data;
            }
            setCollaborators(collabMap);
        } catch (error) {
            console.error("Failed to fetch projects or collaborators", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProjectsAndCollaborators();
    }, [username]);

    const filteredProjects = projects
        .filter((project) =>
            project.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
        { name: t("workspacePage.sortByCreateDate"), value: "Sort by create date" },
        { name: t("workspacePage.sortByName"), value: "Sort by name" },
    ];

    return (
        <ActivationChecker>
        <div className="workspace-container">
            <div className="workspace-header">
                <h1 className="workspace-title">{t("workspacePage.projects")}</h1>
                <div className="workspace-actions">
                    <div className="search-container">
                        <TextFieldIcon
                            label={t("workspacePage.searchPlaceholder")}
                            placeholder={t("workspacePage.searchPlaceholder")}
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
                            optionLabel="name"
                            placeholder={t("workspacePage.sortPlaceholder")}
                            className="w-full md:w-14rem"
                            checkmark
                            highlightOnSelect={false}
                        />
                    </div>
                    <BasicButton
                        icon={isAscending ? "pi pi-sort-amount-up" : "pi pi-sort-amount-down"}
                        className="p-button-text p-button-plain"
                        onClick={() => setIsAscending((prev) => !prev)}
                        tooltip={t(isAscending ? "workspacePage.ascending" : "workspacePage.descending")}
                    />
                    <BasicButton label={t("workspacePage.addProject")} onClick={() => setIsCreateProjectModalOpen(true)} />
                </div>
            </div>
            {loading && <BarProgress />}
            {!loading && (
                <div className="workspace-grid">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={{ ...project, collaborators: collaborators[project.id] || [] }}
                        />
                    ))}
                </div>
            )}
            {isCreateProjectModalOpen && <CreateProjectPopUp onClose={() => setIsCreateProjectModalOpen(false)} />}
        </div>
        </ActivationChecker>
    );
};

export default WorkSpacePage;