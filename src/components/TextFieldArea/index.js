import React, {useId} from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';

const TextFieldArea = ({className, label, name, value, onChange, rows, cols, keyFilter, helpText, invalid, disabled, onKeyDown }) => {
    const id = useId();

    return (
        <FloatLabel>
            <InputTextarea
                id={id}
                name={name}
                className={className}
                rows={rows}
                cols={cols}
                value={value}
                onChange={(e) => onChange(e)}
                keyfilter={keyFilter}
                invalid={invalid}
                disabled={disabled}
                autoResize
                style={{ width: '100%' }}
                onKeyDown={onKeyDown}
            />
            <label htmlFor={id}>{label}</label>
            {helpText && <small id={`${id}-help`}>{helpText}</small>}
        </FloatLabel>
    );
};

export default TextFieldArea;