import React, { useEffect, useRef } from "react";
import useAppState from "../Hooks/useAppState";

function OnionSkin() {
    const onionSkin = useAppState((state: any) => state.onionSkin);
    const setOnionSkin = useAppState((state: any) => state.setOnionSkin);
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.checked = onionSkin;
            ref.current.addEventListener("change", () => {
                setOnionSkin(!onionSkin);
            });
        }

    });

    return <div>
        <input type="checkbox" ref={ref} />
        <label>Onion Skin</label>
    </div>;
}

export default OnionSkin;