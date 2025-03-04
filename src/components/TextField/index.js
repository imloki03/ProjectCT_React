import React, {useId} from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';

const TextField = ({ label, name, value, keyFilter, helpText, invalid, disabled, onChange }) => {
    const id = useId();

    return (
        <FloatLabel>
            <InputText
                id={id}
                name={name}
                value={value}
                onChange={(e) => onChange(e)}
                keyfilter={keyFilter}
                invalid={invalid}
                disabled={disabled}
                onInput={onChange}
                style={{ width: '100%' }}
            />
            <label htmlFor={id}>{label}</label>
            {helpText && <small id={`${id}-help`}>{helpText}</small>}
        </FloatLabel>
    );
};

export default TextField;