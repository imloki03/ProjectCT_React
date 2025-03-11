import React, {useEffect, useState} from "react";
import "./index.css"
import {useDispatch, useSelector} from "react-redux";
import {createNewPhase, updatePhase} from "../../../api/phaseApi";
import {useNotification} from "../../../contexts/NotificationContext";
import PopupCard from "../../../components/PopupCard";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import DateTimePicker from "../../../components/DateTimePicker";
import {formatTimeZone, isValidDate, parseYYYYMMDDToDate} from "../../../utils/DateTimeUtil";
import BasicButton from "../../../components/Button";
import {status} from "../../../constants/Status";
import DropDownField from "../../../components/DropDownField";
import {useTranslation} from "react-i18next";

const EditPhase = ({ onClose, phase }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [phaseStatus, setPhaseStatus] = useState(status[0].value)

    const [loading, setLoading] = useState(false);

    const projectId = useSelector((state) => state.project.currentProject?.id);
    const dispatch = useDispatch();
    const showNotification = useNotification();
    const { t } = useTranslation();

    useEffect(() => {
        if (phase) {
            setName(phase.name || "");
            setDescription(phase.description || "");
            setStartDate(new Date(phase.startDate) || new Date());
            setEndDate(new Date(phase.endDate) || new Date());
            setPhaseStatus(phase.status || status[0].value);
        }
    }, [phase]);

    const handleUpdatePhase = async () => {
        try {
            const response = await updatePhase(phase.id , {
                name: name,
                description: description,
                startDate: formatTimeZone(startDate),
                endDate: formatTimeZone(endDate),
                status: phaseStatus,
            });
            setLoading(false);
            onClose();
            showNotification("success", t("phasePage.editPhase"), response.desc);
        } catch (error) {
            setLoading(false);
            onClose();
            showNotification("error", t("phasePage.editPhase"), error.response.data.desc);
        }
    };

    return (
        <PopupCard
            title={t("phasePage.editPhase")}
            subTitle={t("phasePage.editPhaseSubtitle")}
            className="edit-phase-card"
            onClose={onClose}
        >
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                <TextField
                    label={t("backlogPage.name")}
                    value={name}
                    onChange={(e) =>{ setName(e.target.value)}}
                />

                <TextFieldArea
                    rows="5"
                    label={t("backlogPage.description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <DateTimePicker
                    label={t("backlogPage.startDate")}
                    value={new Date(startDate)}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        if (isValidDate(newDate)) {
                            setStartDate(newDate);
                            if (newDate>endDate) {
                                setEndDate(newDate);
                            }
                        } else {
                            showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.invalidDate"));
                        }
                    }}
                    timeOnly={false}
                />

                <DateTimePicker
                    label={t("backlogPage.endDate")}
                    value={new Date(endDate)}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        if (isValidDate(newDate)) {
                            setEndDate(newDate);
                        } else {
                            showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.invalidDate"));
                        }
                    }}
                    timeOnly={false}
                />

                <DropDownField
                    label={t("phasePage.status")}
                    selected={phaseStatus}
                    options={status}
                    onChange={(value)=>{setPhaseStatus(value.value)}}
                />

                <BasicButton
                    label={t("backlogPage.update")}
                    width="100%"
                    loading={loading}
                    disabled={loading}
                    onClick={()=>{handleUpdatePhase()}}
                />
            </div>
        </PopupCard>
    )
}

export default EditPhase;