import React from "react";
import "./index.css";

const Drawer = ({ isOpen, title, content, onClose }) => {
    return (
        <div className={`project-layout-drawer ${isOpen ? 'open' : ''}`}>
            <div className="drawer-header">
                <h3 className="drawer-title">{title}</h3>
                <button className="drawer-close-button" onClick={onClose}>
                    <i className="pi pi-times"></i>
                </button>
            </div>
            <div className="drawer-content">
                {content}
            </div>
        </div>
    );
};

export default Drawer;
