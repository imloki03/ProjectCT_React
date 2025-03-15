import { format, toZonedTime } from "date-fns-tz";
export const timeZone = "Asia/Ho_Chi_Minh";

export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
};

export const formatTimeZone = (date) => {
    if (!isValidDate(date)){
        return date;
    }
    const toTime = toZonedTime(date, timeZone);
    const formattedTime = format(toTime, "yyyy-MM-dd'T'HH:mm", {
        timeZone,
    });
    return formattedTime;
}

export const getDateAndTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    return { date: formattedDate, time: formattedTime };
};