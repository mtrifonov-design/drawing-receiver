import React from "react";
import useAppState from "../Hooks/useAppState";

function LayerName({name, onNameChange} : {name : string, onNameChange : (newName : string) => void}) {
    const [editing, setEditing] = React.useState(false);
    const [newName, setNewName] = React.useState(name);

    const handleBlur = () => {
        setEditing(false);
        onNameChange(newName);
    }

    return <div>
        {editing ? <input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleBlur} autoFocus /> : <span onClick={() => setEditing(true)}>{name}</span>}
    </div>
}

export default LayerName;