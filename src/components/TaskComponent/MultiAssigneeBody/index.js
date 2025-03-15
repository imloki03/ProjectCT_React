import React, {useEffect, useState} from "react";
import Avatar from "../../Avatar";

const MultiAssigneeBody = ({ collabs, assigneeIds, partial }) => {
    const [collabList, setCollabList] = useState(collabs);
    useEffect(() => {
        const assigneeList = collabs?.filter(collab => assigneeIds.includes(collab.value))
        if (partial) {
            setCollabList([...assigneeList, {}]);
        } else {
            setCollabList(assigneeList);
        }
    }, [partial, assigneeIds]);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingRight: "1rem" }}>
            {collabList && collabList.map((collab, index) => (
                <div
                    key={collab.value}
                    style={{
                        marginLeft: index === 0 ? "0px" : "-0.5rem",
                        zIndex: index,
                    }}
                >
                    <Avatar
                        label={collab?.label}
                        image={collab?.avatar}
                        customSize="1.8rem"
                    />
                </div>
            ))}
        </div>
    )
}

export default MultiAssigneeBody;