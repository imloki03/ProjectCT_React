import React from 'react';
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';

const DateTimePicker = ({ label, value, onChange, dateFormat, locale, minDate, maxDate, timeOnly, invalid}) => {
    return (
        <FloatLabel>
            <Calendar
                id="date-time"
                label={label}
                value={value}
                onChange={onChange}
                dateFormat={dateFormat?dateFormat : "dd/mm/yy"}
                locale={locale}
                minDate={minDate}
                maxDate={maxDate}
                timeOnly={timeOnly}   //set true to use TimePicker, false for DatePicker
                invalid={invalid}
                hourFormat="24"
                showIcon
                style={{width: "100%"}}
            />
            <label htmlFor="date-time">{label}</label>
        </FloatLabel>
    );
};

export default DateTimePicker;