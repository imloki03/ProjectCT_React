import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';
import './index.css'
//https://primereact.org/dropdown/
const DropDownField = ({ label, name, selected, onChange, options, optionLabel, optionValue, placeholder, disabled, showClear, itemTemplate, valueTemplate, style }) => {
    return (
        <div style={{width: '100%'}}>
            {label?(<FloatLabel>
                    <Dropdown
                        id="dropdown"
                        name={name}
                        value={selected}
                        onChange={(e) => onChange(e)}
                        options={options}
                        optionLabel={optionLabel}
                        optionValue={optionValue}
                        placeholder={placeholder}
                        disabled={disabled}
                        showClear={showClear}
                        itemTemplate={itemTemplate}
                        valueTemplate={valueTemplate}
                        className="w-full md:w-14rem"
                    />
                    <label htmlFor="dropdown">{label}</label>
                </FloatLabel>)
                :
                (<Dropdown
                    id="dropdown"
                    name={name}
                    value={selected}
                    onChange={(e) => onChange(e)}
                    options={options}
                    optionLabel={optionLabel}
                    optionValue={optionValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    itemTemplate={itemTemplate}
                    valueTemplate={valueTemplate}
                    className="w-full md:w-14rem"
                />)
            }
        </div>
    )
}
export default DropDownField;