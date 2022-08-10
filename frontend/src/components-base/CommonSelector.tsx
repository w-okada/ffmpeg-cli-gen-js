import "./components-base.css";
import React, { useMemo } from "react";
import { ComponentPropsBase } from "./common/const";

export type CommonSelectorProps<T extends string | number> = ComponentPropsBase & {
    id: string;
    title: string;
    currentValue: T;
    options: { [label: string]: T };
    onChange: (value: T) => void;
};
export const CommonSelector = <T extends string | number>(props: CommonSelectorProps<T>) => {
    const onChange = (value: T) => {
        props.onChange(value);
    };
    const select = useMemo(() => {
        const options = Object.keys(props.options).map((x) => {
            const value = props.options[x];
            return (
                <option key={value} value={value} className={`${props.classNameBase}-select-option`}>
                    {x}
                </option>
            );
        });
        if (!props.currentValue) {
            options.unshift(
                <option key="select input" value="" disabled className={`${props.classNameBase}-select-option ${props.classNameBase}-select-option-disabled`}>
                    select input
                </option>
            );
        }

        const title = props.title.length == 0 ? <></> : <p className={`${props.classNameBase}-select-title`}>{props.title}</p>;

        return (
            <div className={`${props.classNameBase}-select-container`}>
                {title}
                <select
                    className={`${props.classNameBase}-select`}
                    onChange={(val: React.ChangeEvent<HTMLSelectElement>) => {
                        onChange(val.currentTarget.value as unknown as T);
                    }}
                    value={props.currentValue || ""}
                >
                    {options}
                </select>
            </div>
        );
    }, [props]);

    return select;
};
