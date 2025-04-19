import React from 'react';
import './index.css'
import teamIcon from "../../../assets/icons/team_icon.png"
import workingIcon from "../../../assets/icons/working_icon.png"
import planningIcon from "../../../assets/icons/planning_icon.png"
import completeIcon from "../../../assets/icons/complete_task_icon.png"
import { useTranslation } from 'react-i18next'; // Import the translation hook

const DashboardCollabAndTaskStatus = ({collaborators, rawTaskStatus}) => {
    const { t } = useTranslation(); // Initialize the translation hook

    return (
        <div className={"dashboard-collab-task-status-container"}>
            <div className={"dashboard-collab-task-status-grid"}>
                <div className="dashboard-collab-task-box">
                    <div className={"dashboard-collab-task-box-content"}>
                        <div className={"dashboard-collab-task-box-value"}>
                            {collaborators?.length}
                        </div>
                        <div className={"dashboard-collab-task-box-value-desc"}>
                            {t('dashboardPage.collabStatus.totalCollaborators')}
                        </div>
                    </div>
                    <img src={teamIcon} alt={t('dashboardPage.collabStatus.altText.team')} className={"dashboard-collab-task-box-icon"}/>
                </div>
                <div className="dashboard-collab-task-box">
                    <div className={"dashboard-collab-task-box-content"}>
                        <div className={"dashboard-collab-task-box-value"}>
                            {rawTaskStatus?.upcoming}
                        </div>
                        <div className={"dashboard-collab-task-box-value-desc"}>
                            {t('dashboardPage.collabStatus.upcomingTasks')}
                        </div>
                    </div>
                    <img src={planningIcon} alt={t('dashboardPage.collabStatus.altText.upcoming')} className={"dashboard-collab-task-box-icon"}/>
                </div>
                <div className="dashboard-collab-task-box">
                    <div className={"dashboard-collab-task-box-content"}>
                        <div className={"dashboard-collab-task-box-value"}>
                            {rawTaskStatus?.inProgress}
                        </div>
                        <div className={"dashboard-collab-task-box-value-desc"}>
                            {t('dashboardPage.collabStatus.inProgressTasks')}
                        </div>
                    </div>
                    <img src={workingIcon} alt={t('dashboardPage.collabStatus.altText.working')} className={"dashboard-collab-task-box-icon"}/>
                </div>
                <div className="dashboard-collab-task-box">
                    <div className={"dashboard-collab-task-box-content"}>
                        <div className={"dashboard-collab-task-box-value"}>
                            {rawTaskStatus?.completed}
                        </div>
                        <div className={"dashboard-collab-task-box-value-desc"}>
                            {t('dashboardPage.collabStatus.completedTasks')}
                        </div>
                    </div>
                    <img src={completeIcon} alt={t('dashboardPage.collabStatus.altText.completed')} className={"dashboard-collab-task-box-icon"}/>
                </div>
            </div>
        </div>
    );
};

export default DashboardCollabAndTaskStatus;