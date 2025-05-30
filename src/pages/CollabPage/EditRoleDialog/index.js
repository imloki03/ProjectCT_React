import React, {useEffect, useState} from "react";
import "./index.css"
import PopupCard from "../../../components/PopupCard";
import {useNotification} from "../../../contexts/NotificationContext";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import {Checkbox} from "primereact/checkbox";
import {Card} from "primereact/card";
import {getAllFunctions} from "../../../api/functionApi";
import TextField from "../../../components/TextField";
import BasicButton from "../../../components/Button";
import {createNewRole, updateRole} from "../../../api/roleApi";

const EditRoleDialog = ({ onClose, currentRole }) => {
    const [selectedFunctions, setSelectedFunctions] = useState(currentRole.functionList.map((func) => (func.id)) || []);
    const [functionList, setFunctionList] = useState([]);
    const [groupedFunctions, setGroupedFunctions] = useState([]);

    const [roleName, setRoleName] = useState(currentRole?.name);

    const [loading, setLoading] = useState(false);

    const showNotification = useNotification();
    const { t } = useTranslation();

    const projectId = useSelector((state) => state.project.currentProject?.id);

    const getFunctionList = async () => {
        try {
            const response = await getAllFunctions();
            setFunctionList(response.data);
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getFunctionList();
    }, []);

    useEffect(() => {
        setGroupedFunctions(functionList.reduce((acc, func) => {
            acc[func.type] = acc[func.type] || [];
            acc[func.type].push(func);
            return acc;
        }, {}));
    }, [functionList]);

    const handleUpdateRole = async () => {
        try {
            setLoading(true);
            const response = await updateRole(currentRole.id,{
                name: roleName,
                projectId: projectId,
                functionList: selectedFunctions,
            });
            onClose();
            showNotification("success", t("collabPage.updateRole"), response.desc);
        } catch (e) {
            showNotification("error", t("collabPage.updateRole"), e.response.data.desc);
        } finally {
            setLoading(false)
        }
    }

    const handleChangeFunctionList = (id) => {
        setSelectedFunctions((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    return (
        <PopupCard
            title={t("collabPage.updateRole")}
            className="update-role-card"
            onClose={onClose}
        >
            <div style={{width: "20rem", marginBottom: "2rem"}}>
                <TextField
                    label={t("collabPage.roleName")}
                    value={roleName}
                    onChange={(e) =>{setRoleName(e.target.value)}}
                />
            </div>
            <div className="grid">
                {Object.entries(groupedFunctions).map(([type, functions]) => (
                    <div key={type} className="col-12 md:col-3">
                        <Card header={<span style={{ fontSize: "1rem", fontWeight: "bold", marginLeft: "1rem", marginTop: "1rem" }}>{type}</span>}
                              className="p-shadow-3">
                            {functions.map((func) => (
                                <div key={func.id} className="p-field-checkbox mb-2">
                                    <Checkbox
                                        inputId={func.id.toString()}
                                        checked={selectedFunctions.includes(func.id)}
                                        onChange={() => handleChangeFunctionList(func.id)}
                                    />
                                    <label
                                        htmlFor={func.id.toString()}
                                        className="ml-2 cursor-pointer"
                                    >
                                        {func.name}
                                    </label>
                                </div>
                            ))}
                        </Card>
                    </div>
                ))}
            </div>
            <BasicButton
                label={t("backlogPage.update")}
                width="15%"
                loading={loading}
                disabled={loading}
                style={{marginTop: "1.4rem"}}
                onClick={() => {handleUpdateRole()}}
            />
        </PopupCard>
    )
}

export default EditRoleDialog;