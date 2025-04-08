import React, {useEffect, useRef, useState} from "react";
import "./index.css"
import {useFetchProject} from "../../hooks/useFetchProject";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {deletePhase, getAllPhases} from "../../api/phaseApi";
import {sortPhaseByStartDate} from "../../utils/PhaseUtil";
import {useNotification} from "../../contexts/NotificationContext";
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import BasicButton from "../../components/Button";
import PhaseCard from "./PhaseCard";
import {Timeline} from "primereact/timeline";
import {Toast} from "primereact/toast";
import CreatePhase from "./CreatePhase";
import EditPhase from "./EditPhase";
import {hasPermission} from "../../utils/CollabUtil";
import BarProgress from "../../components/BarProgress";
import {useTranslation} from "react-i18next";
import {routeLink} from "../../router/Router";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";

const PhasePage = () => {
    const toast = useRef(null);
    const navigate = useNavigate();
    const fetchProject = useFetchProject();

    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState(null)

    const [isCreatePhaseModalOpen, setIsCreatePhaseModalOpen] = useState(false)
    const [isEditPhaseModalOpen, setIsEditPhaseModalOpen] = useState(false)

    const [loading, setLoading] = useState(true);

    const showNotification = useNotification();
    const { t } = useTranslation();

    const project = useSelector((state) => state.project.currentProject);
    const functionList = useSelector((state) => state.project.currentCollab?.role?.functionList);

    const [isPhaseCreatable, setIsPhaseCreatable] = useState(false);
    const [isPhaseEditable, setIsPhaseEditable] = useState(false);
    const [isPhaseDeletable, setIsPhaseDeletable] = useState(false);

    const { setBreadcrumbs } = useBreadcrumb();

    const loadPhases = async () => {
        setLoading(true);
        const allPhases = await getAllPhases(project.id).finally(() => setLoading(false));
        setPhases(sortPhaseByStartDate(allPhases.data));
    }

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        setIsPhaseCreatable(hasPermission(functionList, "CREATE_PHASE"));
        setIsPhaseEditable(hasPermission(functionList, "UPDATE_PHASE"));
        setIsPhaseDeletable(hasPermission(functionList, "DELETE_PHASE"));
    }, [functionList]);

    useEffect(() => {
        const projectPath = routeLink.project.replace(":ownerUsername", project?.ownerUsername)
            .replace(":projectName", project?.name.replaceAll(" ", "_"));

        setBreadcrumbs([
            {label: project?.name, url: projectPath},
            {label: t("backlogPage.phase"), url: projectPath + "/" + routeLink.projectTabs.phase}
        ]);

        if (project?.id) {
            loadPhases();
        }
    }, [project]);

    const handleDeletePhase= async () => {
        try {
            const response = await deletePhase(currentPhase.id)
            showNotification("success", t("backlogPage.deletePhase"), response.desc)
            loadPhases();
        } catch (error) {
            showNotification("success", t("backlogPage.deletePhase"), error.response.data.desc)
            loadPhases();
        }
    }
    const accept = () => {
        handleDeletePhase();
    }
    const confirmDelete = () => {
        confirmDialog({
            message: t("phasePage.deleteConfirm"),
            header: t("backlogPage.confirmation"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            defaultFocus: 'reject',
            accept
        });
    };

    const handleCloseAddPhaseModel = () => {
        setIsCreatePhaseModalOpen(false);
        loadPhases();
    }

    const handleCloseEditPhaseModel = () => {
        setIsEditPhaseModalOpen(false);
        loadPhases();
    }

    const renderPhaseCard = (item) => {
        return <div style={{cursor: "pointer"}}
                    onClick={()=>{let id=item.id; navigate(`${id}`)}}>
            <PhaseCard
                key={item.id}
                phase={item}
                onEdit={()=>{setIsEditPhaseModalOpen(true)}}
                onDelete={confirmDelete}
                updateCurrentPhase={setCurrentPhase}
                isEdit={isPhaseEditable}
                isDelete={isPhaseDeletable}
            />
        </div>
    };

    return (
        <div style={{ margin: "2rem"}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Project Timeline</h2>
                <BasicButton
                    label={t("phasePage.newPhase")}
                    icon="pi pi-plus"
                    onClick={() => {setIsCreatePhaseModalOpen(true)}}
                    visible={isPhaseCreatable}
                />
            </div>
            {loading && <BarProgress />}
            <div style={{
                marginTop: "2.5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingLeft: "12%",
                paddingRight: "12%" }}>
                <Timeline
                    value={phases}
                    align="alternate"
                    content={(item) => renderPhaseCard(item)}
                    style={{ marginTop: "1rem" }}
                />
            </div>

            {isCreatePhaseModalOpen && <CreatePhase onClose={handleCloseAddPhaseModel}/>}
            {isEditPhaseModalOpen && <EditPhase onClose={handleCloseEditPhaseModel} phase={currentPhase}/>}

            <Toast ref={toast} />
            <ConfirmDialog />
        </div>
    )
}

export default PhasePage;