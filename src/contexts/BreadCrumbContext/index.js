import {createContext, useContext, useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";

const BreadcrumbContext = createContext();

export function BreadcrumbProvider({ children }) {
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const location = useLocation();

    useEffect(() => {
        setBreadcrumbs((prev) => {
            const pathnames = location.pathname.split("/").filter((x) => x);

            if (pathnames.length < prev.length) {
                return prev.filter((b) => pathnames.includes(b.url.replace("/", "")));
            }

            return prev;
        });
    }, [location.pathname]);

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    return useContext(BreadcrumbContext);
}

export function Breadcrumbs() {
    const { breadcrumbs } = useBreadcrumb();
    const navigate = useNavigate();

    const home = { icon: "pi pi-home", command: () => navigate("/") };

    const breadcrumbItems = breadcrumbs.map((item) => ({
        label: item.label,
        command: () => navigate(item.url),
    }));

    return <BreadCrumb model={breadcrumbItems} home={home} />;
}
