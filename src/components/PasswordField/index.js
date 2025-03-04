import React, {useId} from 'react';
import { Password } from 'primereact/password';
import { FloatLabel } from 'primereact/floatlabel';
import './index.css'

const PasswordField = ({ label, name, value, onChange, header, footer, invalid, disabled, feedback }) => {
    const id = useId();

    return (
        <FloatLabel>
            <Password
                inputId={id}
                name={name}
                value={value}
                onChange={(e) => onChange(e)}
                toggleMask
                header={header}
                footer={footer}
                invalid={invalid}
                disabled={disabled}
                feedback={feedback}
                style={{ width: '100%' }}
            />
            <label htmlFor={id}>{label}</label>
        </FloatLabel>
    );
};

export default PasswordField;