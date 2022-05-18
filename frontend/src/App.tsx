import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Controller } from "./Controller";
import { useAppState } from "./provider/AppStateProvider";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { VideoInputSelector, VideoInputSelectorProps } from "@dannadori/demo-base";

type CroppingAreaState = {
    isSelecting: boolean;
    screenStartX: number;
    screenStartY: number;
    screenEndX: number;
    screenEndY: number;
    realStartX: number;
    realStartY: number;
    realEndX: number;
    realEndY: number;
};
const initialCroppingAreaState: CroppingAreaState = {
    isSelecting: false,
    screenStartX: -1,
    screenStartY: -1,
    screenEndX: -1,
    screenEndY: -1,
    realStartX: -1,
    realStartY: -1,
    realEndX: -1,
    realEndY: -1,
};

const App = () => {
    const { inputSource, windowSize } = useAppState();
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [startTime, _setStartTime] = useState(0);
    const [endTime, _setEndTime] = useState(0);
    const [removeAudio, _setRemoveAudio] = useState(true);
    const [croppingAreaState, setCroppingAreaState] = useState<CroppingAreaState>(initialCroppingAreaState);
    const [copyStream, _setCopyStream] = useState(false);

    const [ffmpeg, setFfmpeg] = useState<FFmpeg>();
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    // const [_updateTime, setUpdateTime] = useState(0);

    useEffect(() => {
        const video = document.getElementById("input") as HTMLVideoElement;
        if (typeof inputSource === "string") {
            video.onloadedmetadata = (_ev) => {
                setVideoDuration(video.duration);
                fitLayout();
            };
            video.src = inputSource;
        }
    }, [inputSource]);

    // (1) Layout
    //// (1-1) Fitting
    useEffect(() => {
        fitLayout();
    }, [windowSize]);

    const fitLayout = () => {
        const video = document.getElementById("input") as HTMLVideoElement;
        const videoCS = getComputedStyle(video);
        const videoWidth = parseInt(videoCS.getPropertyValue("width"));
        const videoHeight = parseInt(videoCS.getPropertyValue("height"));

        const overlayCanvas = document.getElementById("overlay") as HTMLCanvasElement;
        overlayCanvas.width = videoWidth;
        overlayCanvas.height = videoHeight;
    };

    //// (1-2) Time Slider
    const timeSlider = useMemo(() => {
        return (
            <input
                type="range"
                min="0"
                max={videoDuration}
                step="0.1"
                value={currentTime}
                className="range"
                onChange={(e) => {
                    changeCurrentTime(e);
                }}
            />
        );
    }, [videoDuration, currentTime]);

    // (2) UI Operation (not cropping area)
    //// (2-1) slider bar
    ////// (2-1-1) slider bar time
    const changeCurrentTime = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const video = document.getElementById("input") as HTMLVideoElement;
        video.currentTime = Number(ev.target.value);
        setCurrentTime(Number(ev.target.value));
    };
    ////// (2-1-2) set start time
    const setStartTime = () => {
        _setStartTime(currentTime);
    };
    ////// (2-1-3) set end time
    const setEndTime = () => {
        _setEndTime(currentTime);
    };

    //// (2-2) Options
    ////// (2-2-1) audio remove
    const setRemoveAudio = () => {
        _setRemoveAudio(!removeAudio);
    };

    ////// (2-2-2) copy stream
    const setCopyStream = () => {
        _setCopyStream(!copyStream);
    };

    // (3) UI Operation (cropping area)
    //// (3-1) cropping area event registration and update area
    useEffect(() => {
        const overlay = document.getElementById("overlay") as HTMLCanvasElement;

        // register event handler
        overlay.onmousedown = (e: MouseEvent) => {
            if (croppingAreaState.isSelecting === false) {
                const newCroppingAreaState = { ...initialCroppingAreaState };
                newCroppingAreaState.screenStartX = e.offsetX;
                newCroppingAreaState.screenStartY = e.offsetY;
                newCroppingAreaState.isSelecting = true;
                setCroppingAreaState(newCroppingAreaState);
            }
        };

        overlay.onmousemove = (e: MouseEvent) => {
            if (croppingAreaState.isSelecting) {
                croppingAreaState.screenEndX = e.offsetX;
                croppingAreaState.screenEndY = e.offsetY;
                setCroppingAreaState({ ...croppingAreaState });
            }
        };
        overlay.onmouseup = (e: MouseEvent) => {
            if (croppingAreaState.isSelecting) {
                croppingAreaState.screenEndX = e.offsetX;
                croppingAreaState.screenEndY = e.offsetY;
                croppingAreaState.isSelecting = false;
                console.log(croppingAreaState);

                const video = document.getElementById("input") as HTMLVideoElement;
                croppingAreaState.realStartX = (croppingAreaState.screenStartX / overlay.width) * video.videoWidth;
                croppingAreaState.realEndX = (croppingAreaState.screenEndX / overlay.width) * video.videoWidth;
                croppingAreaState.realStartY = (croppingAreaState.screenStartY / overlay.height) * video.videoHeight;
                croppingAreaState.realEndY = (croppingAreaState.screenEndY / overlay.height) * video.videoHeight;

                setCroppingAreaState({ ...croppingAreaState });
            }
        };
        overlay.onmouseout = (_e: MouseEvent) => {
            croppingAreaState.isSelecting = false;
            setCroppingAreaState({ ...croppingAreaState });
        };

        // (a) update area
        const input = document.getElementById("input") as HTMLVideoElement;
        if (input.src) {
            const ctx = overlay.getContext("2d")!;
            ctx.clearRect(0, 0, overlay.width, overlay.height);
            ctx.fillStyle = "#88888888";
            ctx.fillRect(0, 0, overlay.width, overlay.height);
            if (croppingAreaState.screenEndX > 0) {
                ctx.clearRect(croppingAreaState.screenStartX, croppingAreaState.screenStartY, croppingAreaState.screenEndX - croppingAreaState.screenStartX, croppingAreaState.screenEndY - croppingAreaState.screenStartY!);
            }
        }
    }, [croppingAreaState]);

    // (4) CLI
    ////
    useEffect(() => {
        const cli = document.getElementById("cli") as HTMLDivElement;
        let crop = "";
        if (croppingAreaState.realEndX > 0) {
            const width = (croppingAreaState.realEndX - croppingAreaState.realStartX).toFixed(0);
            const height = (croppingAreaState.realEndY - croppingAreaState.realStartY).toFixed(0);
            const offsetX = croppingAreaState.realStartX.toFixed(0);
            const offsetY = croppingAreaState.realStartY.toFixed(0);
            crop = `-vf crop=${width}:${height}:${offsetX}:${offsetY}`;
        }

        let copyStreamText = copyStream ? "-c copy" : "";

        cli.innerHTML = `ffmpeg -ss ${startTime} -i a.mp4 ${crop} -t ${(endTime - startTime).toFixed(2)} ${copyStreamText} ${removeAudio ? "-an" : ""} out.mp4`;
    }, [videoDuration, startTime, endTime, removeAudio, copyStream, croppingAreaState]);

    // (5) FFMPEG WASM
    //// (5-1)
    useEffect(() => {
        const ffmpeg = createFFmpeg({
            log: true,
            corePath: "./ffmpeg/ffmpeg-core.js",
        });
        const loadFfmpeg = async () => {
            await ffmpeg!.load();
            ffmpeg!.setProgress(({ ratio }) => {
                console.log("progress:", ratio);
                setProgress(ratio);
            });
            setFfmpeg(ffmpeg);
        };
        loadFfmpeg();
    }, []);

    const convert = async () => {
        if (!ffmpeg) {
            console.log("ffmpeg is null", ffmpeg);
            return;
        }

        if (isConverting) {
            console.log("already converting");
            return;
        }
        setIsConverting(true);

        // upload to wasm space
        const video = document.getElementById("input") as HTMLVideoElement;
        const src = video.src;
        const orgName = "org.mp4";
        ffmpeg.FS("writeFile", orgName, await fetchFile(src));

        // run and download from wasm space
        const outName = "out.mp4";
        // generate cli
        let crop = "";
        if (croppingAreaState.realEndX > 0) {
            const width = (croppingAreaState.realEndX - croppingAreaState.realStartX).toFixed(0);
            const height = (croppingAreaState.realEndY - croppingAreaState.realStartY).toFixed(0);
            const offsetX = croppingAreaState.realStartX.toFixed(0);
            const offsetY = croppingAreaState.realStartY.toFixed(0);
            crop = `-vf crop=${width}:${height}:${offsetX}:${offsetY}`;
        }

        let copyStreamText = copyStream ? "-c copy" : "";

        const cli = `-ss ${startTime} -i ${orgName} ${crop} -t ${(endTime - startTime).toFixed(2)} ${copyStreamText} ${removeAudio ? "-an" : ""} ${outName}`;

        const cliArgs = cli.split(" ");

        await ffmpeg.run(...cliArgs);
        const data = ffmpeg.FS("readFile", outName);

        // download to local pc
        const a = document.createElement("a");
        a.download = outName;
        a.href = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
        a.click();
        setIsConverting(false);
    };

    const progressBar = useMemo(() => {
        const level = Math.ceil(progress * 100);
        const style = { "--value": level } as React.CSSProperties;
        return (
            <div className="radial-progress" style={style}>
                {level}%
            </div>
        );
    }, [progress]);

    const convertButton = (() => {
        if (isConverting) {
            return <div>converting...</div>;
        } else {
            return (
                <button className="btn btn-sm btn-outline btn-accent" onClick={convert}>
                    convert
                </button>
            );
        }
    })();

    const { inputSourceType, setInputSourceType, setInputSource } = useAppState();
    const videoInputSelectorProps: VideoInputSelectorProps = {
        id: "video-input-selector",
        currentValue: inputSourceType || "File",
        onInputSourceTypeChanged: setInputSourceType,
        onInputSourceChanged: setInputSource,
        onlyFile: true,
    };

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "70%" }}>
                <div id="video-container" style={{ width: "70%", height: "100%", position: "relative" }}>
                    <video id="input" style={{ position: "absolute", objectFit: "contain", maxHeight: "100%" }}></video>
                    <canvas id="overlay" style={{ position: "absolute", objectFit: "contain" }} />
                </div>
                <div id="side-panel" style={{ width: "30%" }}>
                    <Controller></Controller>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "30%" }}>
                <div id="under-panel" style={{ display: "flex", flexDirection: "column", width: "70%", height: "100%" }}>
                    <div id="time-slider-container" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                        <div>Time</div>
                        <div style={{ marginLeft: "5px" }}></div>
                        <div style={{ width: "70%", height: "100%" }}>{timeSlider}</div>
                        <div style={{ marginLeft: "5px" }}></div>
                        <div>
                            {currentTime}/{videoDuration}
                        </div>
                        <div style={{ marginLeft: "5px" }}></div>
                        <div>
                            <button className="btn btn-sm" onClick={setStartTime}>
                                set start
                            </button>
                        </div>
                        <div style={{ marginLeft: "5px" }}></div>
                        <div>
                            <button className="btn btn-sm" onClick={setEndTime}>
                                set end
                            </button>
                        </div>
                    </div>

                    <div id="option-container" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <input type="checkbox" checked={removeAudio} className="checkbox checkbox-sm" onChange={setRemoveAudio} />
                            <div style={{ marginLeft: "5px" }}></div>
                            <span>remove audio</span>
                        </div>
                        <div style={{ marginLeft: "15px" }}></div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <input type="checkbox" checked={copyStream} className="checkbox checkbox-sm" onChange={setCopyStream} />
                            <div style={{ marginLeft: "5px" }}></div>
                            <span>copy stream</span>
                        </div>
                    </div>

                    <div id="button-container" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                        <VideoInputSelector {...videoInputSelectorProps}></VideoInputSelector>

                        <div>{convertButton}</div>
                        <div style={{ marginLeft: "5px" }}></div>

                        <div>{progressBar}</div>
                    </div>
                    <div id="cli-container" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                        <div id="cli"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
