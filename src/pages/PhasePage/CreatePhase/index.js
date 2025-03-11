import React, {useEffect, useState} from "react";
import "./index.css"
import {useDispatch, useSelector} from "react-redux";
import {createNewPhase} from "../../../api/phaseApi";
import {useNotification} from "../../../contexts/NotificationContext";
import PopupCard from "../../../components/PopupCard";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import DateTimePicker from "../../../components/DateTimePicker";
import {isValidDate} from "../../../utils/DateTimeUtil";
import BasicButton from "../../../components/Button";
import {useTranslation} from "react-i18next";

const CreatePhase = ({ onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [loading, setLoading] = useState(false);

    const projectId = useSelector((state) => state.project.currentProject?.id);
    const dispatch = useDispatch();
    const showNotification = useNotification();
    const { t } = useTranslation();

    const handleCreateNewPhase = async () => {
        try {
            const response = await createNewPhase(projectId , {
                name: name,
                description: description,
                startDate: startDate,
                endDate: endDate,
            });
            setLoading(false);
            onClose();
            showNotification("success", t("phasePage.createPhase"), response.desc);
        } catch (error) {
            setLoading(false);
            onClose();
            showNotification("error", t("phasePage.createPhase"), error.response.data.desc);
        }
    };

    return (
        <PopupCard
            title={t("phasePage.createPhase")}
            subTitle={t("phasePage.createPhaseSubtitle")}
            className="create-phase-card"
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
                    value={startDate}
                    minDate={new Date()}
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
                    value={endDate}
                    minDate={startDate}
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

                <BasicButton
                    label={t("backlogPage.create")}
                    width="100%"
                    loading={loading}
                    disabled={loading}
                    onClick={()=>{handleCreateNewPhase()}}
                />
            </div>
        </PopupCard>
    )
}

export default CreatePhase;