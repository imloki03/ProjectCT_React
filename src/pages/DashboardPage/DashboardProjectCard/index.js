import React from 'react';
import {ProgressBar} from "primereact/progressbar";
import {Avatar as PrimeAvatar} from "primereact/avatar";
import {Tooltip} from "primereact/tooltip";
import Avatar from "../../../components/Avatar";
import Lottie from "lottie-react";
import fireIcon from "../../../assets/icons/fire_icon.json";
import clockIcon from "../../../assets/icons/clock_icon.json";
import alarmIcon from "../../../assets/icons/alarm_icon.json"
import "./index.css"
import {useNavigate} from "react-router-dom";
import {routeLink} from "../../../router/Router";
import { useTranslation } from 'react-i18next'; // Import the translation hook

const DashboardProjectCard = ({ project, collaborators, rawTaskStatus, phases = [], user }) => {
    const { t } = useTranslation(); // Initialize the translation hook
    const totalTasks = rawTaskStatus?.totalTask || 0;
    const completedTasks = rawTaskStatus?.completed || 0;
    const completionRate = totalTasks > 0
        ? ((completedTasks / totalTasks) * 100).toFixed(2)
        : "0.00";

    const visibleCollaborators = collaborators.slice(0, 3);
    const remainingCount = collaborators.length - visibleCollaborators.length;
    const remainingNames = collaborators.slice(3).map(c => c.user?.name).join(', ');

    let remainingDays = 0;
    let deadlineText = t('dashboardPage.projectCard.deadline.daysLeft', { days: 0 });

    if (phases.length > 0) {
        const projectDeadline = new Date(Math.max(...phases.map(p => new Date(p.endDate))));
        const remainingMs = projectDeadline - Date.now();
        remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        deadlineText = remainingDays >= 0
            ? t('dashboardPage.projectCard.deadline.daysLeft', { days: remainingDays })
            : t('dashboardPage.projectCard.deadline.daysOverdue', { days: Math.abs(remainingDays) });
    }

    const shouldShowEdit = user?.username === project?.ownerUsername;

    let iconData = fireIcon;
    let iconClass = "fire";

    if (remainingDays > 30) {
        iconData = clockIcon;
        iconClass = "clock";
    } else if (remainingDays < 0) {
        iconData = alarmIcon;
        iconClass = "alarm";
    }

    const navigate = useNavigate()
    const handleNavEditProject = () => {
        navigate(routeLink.projectTabs.editProject)
    }

    return (
        <div className={"dashboard-project-card"}>
            <div className={"dashboard-project-card-content"}>
                <div className="dashboard-project-card-title">
                    <h1>{project?.name}</h1>
                    {shouldShowEdit && <div className={"dashboard-project-card-edit-button"} onClick={handleNavEditProject}>
                        {t('dashboardPage.projectCard.editButton')}
                    </div>}
                </div>

                <div className={"dashboard-project-card-description"}>
                    {project?.description}
                </div>

                <div className={"dashboard-project-card-collab-deadline"}>
                    <div className={"dashboard-project-card-collab-avatar"}>
                        {visibleCollaborators.map((c, idx) => (
                            <Avatar key={idx} label={c.user.name} image={c.user.avatarURL} customSize="2rem" />
                        ))}

                        {remainingCount > 0 && (
                            <>
                                <PrimeAvatar
                                    label={`+${remainingCount}`}
                                    style={{
                                        width: '2rem',
                                        height: '2rem',
                                        fontSize: '1rem',
                                        backgroundColor: '#3e2502'
                                    }}
                                    shape="circle"
                                    data-pr-tooltip={remainingNames}
                                />
                                <Tooltip target=".p-avatar" position={'left'} />
                            </>
                        )}
                    </div>

                    {phases.length > 0 && (
                        <div className={`dashboard-project-card-deadline ${iconClass}`}>
                            <Lottie animationData={iconData} loop autoplay className={"deadline-icon"} />
                            {deadlineText}
                        </div>
                    )}
                </div>

                <div className={"dashboard-project-card-progress-value"}>
                    {t('dashboardPage.projectCard.progress.tasksCount', { completionRate, totalTasks })}
                </div>

                <div className={"dashboard-project-card-progress"}>
                    <ProgressBar
                        value={parseFloat(completionRate)}
                        displayValueTemplate={() => `${totalTasks}%`}
                        className={"dashboard-project-card-progress-bar"}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardProjectCard;