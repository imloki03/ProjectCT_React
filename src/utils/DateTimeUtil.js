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