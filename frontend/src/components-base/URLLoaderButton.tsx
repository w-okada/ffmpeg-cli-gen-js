import "./components-base.css";
import React from "react";
import { ComponentPropsBase } from "./common/const";

export type URLLoaderButtonProps = ComponentPropsBase & {
    id: string;
    label: string | null;
    url: string;
    onLoaded: (value: string) => void;
    selected: boolean;
};

export const URLLoaderButton = (props: URLLoaderButtonProps) => {
    const loadURLClicked = async () => {
        const res = await fetch(props.url);
        const b = await res.blob();

        const reader = new FileReader();
        const p = new Promise<string>((resolve, _reject) => {
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(b);
        });
        const dataURL = await p;
        props.onLoaded(dataURL);
    };

    let className = `${props.classNameBase}-button `;
    if (props.selected) {
        className += `${props.classNameBase}-button-selected`;
    }
    return (
        <div
            key={props.url + "aaa"}
            className={className}
            onClick={() => {
                loadURLClicked();
            }}
        >
            {props.label ? props.label : "load url"}
        </div>
    );
};
