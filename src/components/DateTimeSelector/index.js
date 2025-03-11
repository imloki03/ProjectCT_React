import React from "react";
import DateTimePicker from "../DateTimePicker";
import {isValidDate} from "../../utils/DateTimeUtil";
import {useNotification} from "../../contexts/NotificationContext";
import {useTranslation} from "react-i18next";

const DateTimeSelector = ({ type, startDate, setStartDate, endDate, setEndDate }) => {
    const showNotification = useNotification();
    const { t } = useTranslation();

    const updateStartDate = (newDate) => {
        if (isValidDate(newDate)) {
            const updatedDate = new Date(startDate);
            updatedDate.setFullYear(newDate.getFullYear());
            updatedDate.setMonth(newDate.getMonth());
            updatedDate.setDate(newDate.getDate());
            setStartDate(updatedDate);

            if (updatedDate>endDate) {
                setEndDate(updatedDate);
            }
        } else {
            showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.invalidDate"))
        }
    }

    const updateStartTime = (newTime) => {
        if (isValidDate(newTime)) {
            const updatedTime = new Date(startDate);
            updatedTime.setHours(newTime.getHours());
            updatedTime.setMinutes(newTime.getMinutes());
            setStartDate(updatedTime);

            if (updatedTime>endDate) {
                setEndDate(updatedTime);
            }
        } else {
            showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.invalidTime"))
        }
    }

    const updateEndDate = (newDate) => {
        if (isValidDate(newDate)) {
            const updatedDate = new Date(endDate);
            updatedDate.setFullYear(newDate.getFullYear());
            updatedDate.setMonth(newDate.getMonth());
            updatedDate.setDate(newDate.getDate());
            setEndDate(updatedDate);
        } else {
            showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.invalidDate"))
        }
    }

    const updateEndTime = (newTime) => {
        if (isValidDate(newTime)) {
            const updatedTime = new Date(endDate);
            updatedTime.setHours(newTime.getHours());
            updatedTime.setMinutes(newTime.getMinutes());
            if (updatedTime<startDate){
                showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.timeGreater"))
                setEndDate(startDate);
            } else {
                setEndDate(updatedTime);
            }
        } else {
            showNotification("error", t("backlogPage.dateTimeFormat"), t("backlogPage.invalidTime"))
        }
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: "140%"}}>
                <DateTimePicker
                    label={type === "start" ? t("backlogPage.startDate") : t("backlogPage.endDate")}
                    value={type === "start" ? startDate : endDate}
                    minDate={type === "start" ? new Date() : startDate}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        if (type === "start") {
                            updateStartDate(newDate)
                        } else {
                            updateEndDate(newDate)
                        }
                    }}
                    timeOnly={false}
                />
            </div>
            <DateTimePicker
                label={type === "start" ? t("backlogPage.startTime") : t("backlogPage.endTime")}
                value={type === "start" ? startDate : endDate}
                onChange={(e) => {
                    const newTime = e.target.value;
                    if (type === "start") {
                        updateStartTime(newTime)
                    } else {
                        updateEndTime(newTime)
                    }
                }}
                timeOnly={true}
            />
        </div>
    )
}

export default DateTimeSelector;