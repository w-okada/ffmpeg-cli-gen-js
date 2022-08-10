import "./components-base.css";
import React, { useEffect, useMemo, useState } from "react";
import { useDeviceManager } from "./hooks/useDeviceManager";
import { ComponentPropsBase } from "./common/const";
import { CommonSelector, CommonSelectorProps } from "./CommonSelector";
import { FileLoaderButton, FileLoaderButtonProps } from "./FileLoaderButton";
import { URLLoaderButton, URLLoaderButtonProps } from "./URLLoaderButton";

export const VideoInputType = {
    Camera: "Camera",
    File: "File",
    Window: "Window",
    Sample: "Sample",
} as const;
export type VideoInputType = typeof VideoInputType[keyof typeof VideoInputType];

export type VideoInputSelectorValue = {
    videoInputType: VideoInputType;
    deviceId?: string;
    resolution?: number[];
    dataURL?: string;
    url?: string;
};
export type VideoInputSelectorSubValue = {};

export type VideoInputSelectorProps = ComponentPropsBase & {
    id: string;
    currentValue?: VideoInputSelectorValue;
    videoInputTypes: VideoInputType[];
    onInputSourceChanged: (value: VideoInputSelectorValue) => void;
    cameraResolutions?: { [name: string]: number[] };
    sampleFilePaths?: { [name: string]: string };
    maxKeyNameLength?: number;
    fileFilter?: string;
};

export const VideoInputSelector = (props: VideoInputSelectorProps) => {
    const { getVideoInputDevices } = useDeviceManager();
    const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        const loadCameraDevice = async () => {
            if (props.videoInputTypes.includes("Camera")) {
                const list = await getVideoInputDevices();
                setCameraDevices(list);
            }
        };
        loadCameraDevice();
    }, []);

    // (1) オプション生成
    const options = useMemo(() => {
        const MaxKeyNameLength = 16;
        const options: { [key: string]: string } = {};
        Object.keys(VideoInputType).forEach((_key: string) => {
            const key = _key as VideoInputType;
            if (key === "Camera") {
                cameraDevices.forEach((device) => {
                    const keyLength = props.maxKeyNameLength ? props.maxKeyNameLength : MaxKeyNameLength;
                    let cameraKey = "";
                    if (device.label.length > keyLength) {
                        cameraKey = device.label.substring(0, keyLength) + "...";
                    } else {
                        cameraKey = device.label;
                    }
                    const label = `${cameraKey}`;
                    const val: VideoInputSelectorValue = {
                        videoInputType: key,
                        deviceId: device.deviceId,
                    };
                    options[label] = JSON.stringify(val);
                });
            } else if (key === "File") {
                const val: VideoInputSelectorValue = {
                    videoInputType: key,
                };
                options[key] = JSON.stringify(val);
            } else if (key === "Window") {
                const val: VideoInputSelectorValue = {
                    videoInputType: key,
                };
                options[key] = JSON.stringify(val);
            } else if (key === "Sample") {
                const val: VideoInputSelectorValue = {
                    videoInputType: key,
                };
                options[key] = JSON.stringify(val);
            } else {
                console.warn("unknwon video input type", key);
            }
        });
        return options;
    }, [props.videoInputTypes, cameraDevices]);

    // (2) セレクタ生成
    const selector = useMemo(() => {
        if (Object.keys(options).length > 1) {
            let currentValue: VideoInputSelectorValue | undefined = undefined;
            if (props.currentValue) {
                currentValue = { ...props.currentValue };
                currentValue.dataURL = undefined;
                currentValue.resolution = undefined;
                currentValue.url = undefined;
            }

            const commonSelectorProps: CommonSelectorProps<string> = {
                id: "video-input-types",
                title: "",
                currentValue: JSON.stringify(currentValue),
                options: options,
                onChange: (jsonValue: string) => {
                    const val = JSON.parse(jsonValue) as VideoInputSelectorValue;
                    props.onInputSourceChanged(val);
                },
                classNameBase: props.classNameBase,
            };
            return <CommonSelector {...commonSelectorProps}></CommonSelector>;
        } else {
            return <></>;
        }
    }, [props.videoInputTypes, cameraDevices]);

    // (3) サブメニュー
    // (3-1) カメラ サブメニュー
    const cameraField = useMemo(() => {
        if (!props.currentValue || props.currentValue.videoInputType !== "Camera") {
            return <></>;
        }
        if (!props.cameraResolutions) {
            return <></>;
        }

        const resolutionButtons = Object.keys(props.cameraResolutions).map((key) => {
            let className = `${props.classNameBase}-button `;
            if (props.currentValue?.resolution) {
                if (props.currentValue?.resolution[0] == props.cameraResolutions![key][0] && props.currentValue?.resolution[1] == props.cameraResolutions![key][1]) {
                    className += `${props.classNameBase}-button-selected`;
                }
            }
            return (
                <div
                    key={key}
                    className={className}
                    onClick={() => {
                        if (!props.currentValue) {
                            return;
                        }
                        props.onInputSourceChanged({ ...props.currentValue, resolution: props.cameraResolutions![key] });
                    }}
                >
                    {key}
                </div>
            );
        });
        return resolutionButtons;
    }, [props.currentValue]);

    const fileField = useMemo(() => {
        if (!props.currentValue || props.currentValue.videoInputType !== "File") {
            return <></>;
        }
        const fileLoaderProps: FileLoaderButtonProps = {
            id: "video-input-selector-file",
            filter: props.fileFilter ? props.fileFilter : null,
            onLoaded: (value: string) => {
                if (!props.currentValue) {
                    return;
                }
                props.onInputSourceChanged({ ...props.currentValue, dataURL: value });
            },
            label: null,
            classNameBase: props.classNameBase,
        };
        return <FileLoaderButton {...fileLoaderProps}></FileLoaderButton>;
    }, [props.currentValue]);

    const windowField = useMemo(() => {
        if (!props.currentValue || props.currentValue.videoInputType !== "Window") {
            return <></>;
        }
        return (
            <div key="window" className={`${props.classNameBase}-button`}>
                window
            </div>
        );
    }, [props.currentValue]);

    const sampleField = useMemo(() => {
        if (!props.currentValue || props.currentValue.videoInputType !== "Sample") {
            return <></>;
        }
        if (!props.sampleFilePaths) {
            return <></>;
        }
        const sampleButtons = Object.keys(props.sampleFilePaths).map((key) => {
            const urlLoaderProps: URLLoaderButtonProps = {
                id: "video-input-selector-file",
                onLoaded: (value: string) => {
                    if (!props.currentValue) {
                        return;
                    }
                    props.onInputSourceChanged({ ...props.currentValue, url: props.sampleFilePaths![key], dataURL: value });
                },
                label: null,
                url: props.sampleFilePaths![key],
                classNameBase: props.classNameBase,
                selected: props.sampleFilePaths![key] === props.currentValue?.url,
            };
            return <URLLoaderButton key={props.sampleFilePaths![key]} {...urlLoaderProps}></URLLoaderButton>;
        });
        return sampleButtons;
    }, [props.currentValue]);

    return (
        <div className={`${props.classNameBase}-video-input-container`}>
            {/* {JSON.stringify(props.currentValue)} */}
            {selector}
            <div className={`${props.classNameBase}-button-container`}>
                {cameraField}
                {fileField}
                {windowField}
                {sampleField}
            </div>
        </div>
    );
};
