import React, { useId } from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

const TextFieldIcon = ({
                           label,
                           name,
                           value,
                           keyFilter,
                           helpText,
                           invalid,
                           disabled,
                           onChange,
                           icon,
                           iconPosition = 'left',
                           placeholder,
                       }) => {
    const id = useId();

    return (
        <>
            <IconField iconPosition={iconPosition}>
                {icon && <InputIcon className={`pi ${icon}`} />}
                <InputText
                    id={id}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e)}
                    keyfilter={keyFilter}
                    invalid={invalid}
                    disabled={disabled}
                    onInput={onChange}
                    placeholder={placeholder}
                    style={{ width: '100%' }}
                />
            </IconField>
        </>
    );
};

export default TextFieldIcon;