import React, { useEffect, useMemo } from "react";
import { useAppState } from "../../003_provider/003_AppStateProvider";
import { useStateControlCheckbox } from "../003_hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./101_HeaderButton";
import { EditorController } from "./310_EditorController";

export const RightSidebar = () => {
    const { frontendManagerState } = useAppState()
    const sidebarAccordionEditorControllerCheckBox = useStateControlCheckbox("editor-controller");

    const accodionButtonForEditorController = useMemo(() => {
        const accodionButtonForEditorControllerProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionEditorControllerCheckBox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForEditorControllerProps}></HeaderButton>;
    }, []);



    useEffect(() => {
        sidebarAccordionEditorControllerCheckBox.updateState(true);
    }, []);
    return (
        <>
            <div className="right-sidebar">
                {sidebarAccordionEditorControllerCheckBox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title">Movie Editor</div>
                        <div className="sidebar-header-caret"> {accodionButtonForEditorController}</div>
                    </div>
                    <EditorController />
                </div>
                <div className="sidebar-content-row-button" onClick={() => {
                    frontendManagerState.stateControls.generalDialogCheckbox.updateState(true)
                }}>
                    edit
                </div>
            </div>
        </>
    );
};
