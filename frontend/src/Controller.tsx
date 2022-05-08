import React from "react";
import { Credit, VideoInputSelector, VideoInputSelectorProps } from "@dannadori/demo-base";
import { useAppState } from "./provider/AppStateProvider";

export const Controller = () => {
    const { inputSourceType, setInputSourceType, setInputSource } = useAppState();

    const videoInputSelectorProps: VideoInputSelectorProps = {
        id: "video-input-selector",
        currentValue: inputSourceType || "File",
        onInputSourceTypeChanged: setInputSourceType,
        onInputSourceChanged: setInputSource,
        onlyFile: true,
    };

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Credit></Credit>

            <VideoInputSelector {...videoInputSelectorProps}></VideoInputSelector>
        </div>
    );
};
