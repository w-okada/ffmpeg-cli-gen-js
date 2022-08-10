import { WindowSize, useWindowStateChangeListener } from "@dannadori/demo-base";
import React, { useContext, useState, ReactNode } from "react";
import { VideoInputSelectorValue } from "../components-base";

type Props = {
    children: ReactNode;
};

type AppStateValue = {
    videoInputSelectorValue: VideoInputSelectorValue | undefined;
    setVideoInputSelectorValue: (val: VideoInputSelectorValue | undefined) => void;
    windowSize: WindowSize;
};

const AppStateContext = React.createContext<AppStateValue | null>(null);

export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

export const AppStateProvider = ({ children }: Props) => {
    const [videoInputSelectorValue, setVideoInputSelectorValue] = useState<VideoInputSelectorValue>();
    const { windowSize } = useWindowStateChangeListener();

    const providerValue = {
        videoInputSelectorValue,
        setVideoInputSelectorValue,
        windowSize,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
