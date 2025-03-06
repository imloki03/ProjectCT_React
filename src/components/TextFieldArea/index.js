    import React, {useId} from 'react';
    import { InputTextarea } from 'primereact/inputtextarea';
    import { FloatLabel } from 'primereact/floatlabel';
    
    const TextFieldArea = ({ label, name, value, onChange, rows, cols, keyFilter, helpText, invalid, disabled }) => {
        const id = useId();
    
        return (
            <FloatLabel>
                <InputTextarea
                    id={id}
                    name={name}
                    rows={rows}
                    cols={cols}
                    value={value}
                    onChange={(e) => onChange(e)}
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