import React from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
//https://primereact.org/button/
const BasicButton = ({ label, icon, loading, severity, onClick, className, disabled, outlined, size, width, style, type, rounded, text, raised=true, visible }) => {
    return (
        <div style={style}>
            <Button
                label={label}
                icon={icon}
                loading={loading}
                severity={severity}  //color default = primary or secondary, success, info, warning, help, danger
                onClick={onClick}
                className={className}
                disabled={disabled}
                outlined={outlined}
                size={size}  // small, large
                style={{ width: width }}
                rounded={rounded}
                text={text}
                raised={raised}
                type={type}
                visible={visible}
            />
        </div>
    );
};

export default BasicButton;