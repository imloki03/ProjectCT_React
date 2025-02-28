import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";
import "./index.css"

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const toast = useRef(null);

    const showNotification = (severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    return (
        <NotificationContext.Provider value={showNotification}>
            <Toast ref={toast} position="bottom-right"/>
            {children}
        </NotificationContext.Provider>
    );
};
