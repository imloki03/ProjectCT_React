import React from 'react';
import { InputOtp } from 'primereact/inputotp';

const OtpField = ({ value, onChange, length, mask }) => {
    return (
        <InputOtp
            value={value}
            onChange={onChange}
            length={length}
            mask={mask}
            integerOnly
        />
    )
}

export default OtpField;