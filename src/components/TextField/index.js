import React, {useId} from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';

const TextField = ({ label, value, keyFilter, helpText, invalid, disabled, onChange }) => {
    const id = useId();

    return (
        <FloatLabel>
            <InputText
                id={id}
                value={value}
                onChange={onChange}
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