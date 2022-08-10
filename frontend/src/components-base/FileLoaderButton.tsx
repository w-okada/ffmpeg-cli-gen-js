import "./components-base.css";
import React from "react";
import { ComponentPropsBase } from "./common/const";

export type FileLoaderButtonProps = ComponentPropsBase & {
    id: string;
    label: string | null;
    filter: string | null;
    onLoaded: (value: string) => void;
};

export const FileLoaderButton = (props: FileLoaderButtonProps) => {
    const loadFileClicked = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        console.log(fileInput, props);
        fileInput.onchange = (event: Event) => {
            console.log(event);
            if (!event || !event.target) {
                return;
            }
            if (!(event.target instanceof HTMLInputElement)) {
                return;
            }
            if (!event.target.files) {
                console.warn("[components] target file is null");
                return;
            }
            if (props.filter && !event.target.files[0].type.match(props.filter)) {
                console.log("[components] file type is not match", event.target.files[0].type, props.filter);
                return;
            }
            console.log(event.target.files[0]);
            const reader = new FileReader();
            reader.onload = () => {
                // console.log("read image", reader.result);
                props.onLoaded(reader.result as string);
            };
            reader.readAsDataURL(event.target.files[0]);
        };
        fileInput.click();
    };

    return (
        <div
            className={`${props.classNameBase}-button`}
            onClick={() => {
                loadFileClicked();
            }}
        >
            {props.label ? props.label : "load file"}
        </div>
    );
};
