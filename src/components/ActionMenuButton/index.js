import React, {useEffect, useRef} from 'react';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';
import './index.css'
import {Tooltip} from "primereact/tooltip";

const ActionMenuButton = ({ items, direction, type, customSize }) => {
    const toast = useRef(null);

    useEffect(() => {
        items.forEach((item, index) => {
            const actionButtonSelector = `.p-speeddial-action:nth-child(${index + 1})`;
            const tooltipElement = document.querySelector(actionButtonSelector);
            if (tooltipElement) {
                tooltipElement.setAttribute('data-pr-tooltip', item.label);
                tooltipElement.setAttribute('data-pr-position', 'top');
            }
        });
    }, [items]);

    return (
        <div>
            <Toast ref={toast} />
            <Tooltip target=".p-speeddial-action" position="top" />
            <SpeedDial
                model={items}
                direction={direction}
                type={type}
                buttonStyle={customSize ? {width: customSize, height: customSize} : null}
            />
        </div>
    )
}

export default ActionMenuButton;