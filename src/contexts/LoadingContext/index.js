import { createContext, useContext, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import "./index.css";

const LoadingContext = createContext(null);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={setIsLoading}>
            {isLoading && (
                <div className="loading-overlay">
                    <ProgressSpinner />
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    );
};
