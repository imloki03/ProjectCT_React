import React, {useId} from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';

const TextFieldArea = ({ label, value, onChange, rows, cols, keyFilter, helpText, invalid, disabled }) => {
    const id = useId();

    return (
        <FloatLabel>
            <InputTextarea
                id={id}
                rows={rows}
                cols={cols}
                value={value}
                onChange={onChange}
                keyfilter={keyFilter}
                invalid={invalid}
                disabled={disabled}
                autoResize
                style={{ width: '100%' }}
            />
            <label htmlFor={id}>{label}</label>
            {helpText && <small id={`${id}-help`}>{helpText}</small>}
        </FloatLabel>
    );
};

export default TextFieldArea;