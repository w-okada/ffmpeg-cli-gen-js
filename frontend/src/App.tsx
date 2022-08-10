import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Controller } from "./Controller";
import { useAppState } from "./provider/AppStateProvider";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { VideoInputSelector, VideoInputSelectorProps, VideoInputSelectorValue } from "./components-base";

const OriginalMediaFile = "org.mp4";
const OutputMediaFile = "out.mp4";
const BlackScreenFile = "black.png";

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

type FfmpegOptions = {
    startTime: number;
    endTime: number; // duration = endTime - startTime
    removeAudio: boolean;
    copyStream: boolean;
    croppingAreaState: CroppingAreaState;
    audioWithBlackScreen: boolean;
};
const initialFfmpegOptions: FfmpegOptions = {
    startTime: 0,
    endTime: 0,
    removeAudio: false,
    copyStream: false,
    croppingAreaState: initialCroppingAreaState,
    audioWithBlackScreen: false,
};

const App = () => {
    const { videoInputSelectorValue, setVideoInputSelectorValue, windowSize } = useAppState();
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    // const [startTime, _setStartTime] = useState(0);
    // const [endTime, _setEndTime] = useState(0);
    // const [removeAudio, _setRemoveAudio] = useState(true);
    // const [croppingAreaState, setCroppingAreaState] = useState<CroppingAreaState>(initialCroppingAreaState);
    // const [copyStream, _setCopyStream] = useState(false);
    // const [blackScreen, _setBlackScreen] = useState(false);

    const [ffmpegOptions, setFfmpegOptions] = useState<FfmpegOptions>(initialFfmpegOptions);
    const [generatedCli, setGeneratedCli] = useState<string>("");

    const [ffmpeg, setFfmpeg] = useState<FFmpeg>();
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    // const [_updateTime, setUpdateTime] = useState(0);

    useEffect(() => {
        const video = document.getElementById("input") as HTMLVideoElement;
        if (videoInputSelectorValue?.videoInputType === "File") {
            if (!videoInputSelectorValue.dataURL) {
                return;
            }
            video.onloadedmetadata = (_ev) => {
                setVideoDuration(video.duration);
                fitLayout();
            };
            video.src = videoInputSelectorValue.dataURL;
        } else {
            console.warn("not implemented for video input type:", videoInputSelectorValue?.videoInputType);
        }
    }, [videoInputSelectorValue]);

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
        setFfmpegOptions({ ...ffmpegOptions, startTime: currentTime });
    };
    ////// (2-1-3) set end time
    const setEndTime = () => {
        setFfmpegOptions({ ...ffmpegOptions, endTime: currentTime });
    };

    //// (2-2) Options
    ////// (2-2-1) audio remove
    const setRemoveAudio = () => {
        setFfmpegOptions({ ...ffmpegOptions, removeAudio: !ffmpegOptions.removeAudio });
    };

    ////// (2-2-2) copy stream
    const setCopyStream = () => {
        setFfmpegOptions({ ...ffmpegOptions, copyStream: !ffmpegOptions.copyStream });
    };

    const setBlackScreen = () => {
        setFfmpegOptions({ ...ffmpegOptions, audioWithBlackScreen: !ffmpegOptions.audioWithBlackScreen });
    };

    // (3) UI Operation (cropping area)
    //// (3-1) cropping area event registration and update area
    useEffect(() => {
        const overlay = document.getElementById("overlay") as HTMLCanvasElement;

        // register event handler
        overlay.onmousedown = (e: MouseEvent) => {
            if (ffmpegOptions.croppingAreaState.isSelecting === false) {
                const newCroppingAreaState = { ...initialCroppingAreaState };
                newCroppingAreaState.screenStartX = e.offsetX;
                newCroppingAreaState.screenStartY = e.offsetY;
                newCroppingAreaState.isSelecting = true;
                ffmpegOptions.croppingAreaState = { ...newCroppingAreaState };
                setFfmpegOptions({ ...ffmpegOptions });
            }
        };

        overlay.onmousemove = (e: MouseEvent) => {
            if (ffmpegOptions.croppingAreaState.isSelecting) {
                ffmpegOptions.croppingAreaState.screenEndX = e.offsetX;
                ffmpegOptions.croppingAreaState.screenEndY = e.offsetY;
                setFfmpegOptions({ ...ffmpegOptions });
            }
        };
        overlay.onmouseup = (e: MouseEvent) => {
            if (ffmpegOptions.croppingAreaState.isSelecting) {
                ffmpegOptions.croppingAreaState.screenEndX = e.offsetX;
                ffmpegOptions.croppingAreaState.screenEndY = e.offsetY;
                ffmpegOptions.croppingAreaState.isSelecting = false;
                console.log(ffmpegOptions.croppingAreaState);

                const video = document.getElementById("input") as HTMLVideoElement;
                ffmpegOptions.croppingAreaState.realStartX = (ffmpegOptions.croppingAreaState.screenStartX / overlay.width) * video.videoWidth;
                ffmpegOptions.croppingAreaState.realEndX = (ffmpegOptions.croppingAreaState.screenEndX / overlay.width) * video.videoWidth;
                ffmpegOptions.croppingAreaState.realStartY = (ffmpegOptions.croppingAreaState.screenStartY / overlay.height) * video.videoHeight;
                ffmpegOptions.croppingAreaState.realEndY = (ffmpegOptions.croppingAreaState.screenEndY / overlay.height) * video.videoHeight;

                setFfmpegOptions({ ...ffmpegOptions });
            }
        };
        overlay.onmouseout = (_e: MouseEvent) => {
            ffmpegOptions.croppingAreaState.isSelecting = false;
            setFfmpegOptions({ ...ffmpegOptions });
        };

        // (a) update area
        const input = document.getElementById("input") as HTMLVideoElement;
        if (input.src) {
            const ctx = overlay.getContext("2d")!;
            ctx.clearRect(0, 0, overlay.width, overlay.height);
            ctx.fillStyle = "#88888888";
            ctx.fillRect(0, 0, overlay.width, overlay.height);
            if (ffmpegOptions.croppingAreaState.screenEndX > 0) {
                ctx.clearRect(ffmpegOptions.croppingAreaState.screenStartX, ffmpegOptions.croppingAreaState.screenStartY, ffmpegOptions.croppingAreaState.screenEndX - ffmpegOptions.croppingAreaState.screenStartX, ffmpegOptions.croppingAreaState.screenEndY - ffmpegOptions.croppingAreaState.screenStartY!);
            }
        }
    }, [ffmpegOptions]);

    // (4) CLI
    ////
    useEffect(() => {
        const cli = document.getElementById("cli") as HTMLDivElement;
        let crop = "";
        if (ffmpegOptions.croppingAreaState.realEndX > 0) {
            const width = (ffmpegOptions.croppingAreaState.realEndX - ffmpegOptions.croppingAreaState.realStartX).toFixed(0);
            const height = (ffmpegOptions.croppingAreaState.realEndY - ffmpegOptions.croppingAreaState.realStartY).toFixed(0);
            const offsetX = ffmpegOptions.croppingAreaState.realStartX.toFixed(0);
            const offsetY = ffmpegOptions.croppingAreaState.realStartY.toFixed(0);
            crop = `-vf crop=${width}:${height}:${offsetX}:${offsetY}`;
        }

        const startTime = `-ss ${ffmpegOptions.startTime}`;
        const endTime = `-t ${(ffmpegOptions.endTime - ffmpegOptions.startTime).toFixed(2)}`;
        const copyStream = ffmpegOptions.copyStream ? "-c copy" : "";
        const removeAudio = ffmpegOptions.removeAudio ? "-an" : "";
        const blackScreen = ffmpegOptions.audioWithBlackScreen ? `-loop 1 -i ${BlackScreenFile}` : ``;

        let generatedCli = `${startTime} -i ${OriginalMediaFile} ${crop} ${endTime} ${copyStream} ${removeAudio} ${OutputMediaFile}`;
        if (ffmpegOptions.audioWithBlackScreen) {
            generatedCli = `${startTime} ${blackScreen} -i ${OriginalMediaFile} ${endTime} -c:v libx264 -tune stillimage -c:a libmp3lame -shortest ${OutputMediaFile}`;
        }

        cli.innerHTML = generatedCli;
        setGeneratedCli(generatedCli);
    }, [ffmpegOptions]);

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
        const orgName = OriginalMediaFile;
        ffmpeg.FS("writeFile", orgName, await fetchFile(src));

        if (ffmpegOptions.audioWithBlackScreen) {
            ffmpeg.FS("writeFile", BlackScreenFile, await fetchFile("./black.png"));
        }

        // run and download from wasm space
        const outName = OutputMediaFile;
        // generate cli

        const cliArgs = generatedCli.split(" ");

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

    const videoInputSelectorProps: VideoInputSelectorProps = {
        id: "video-input-selector",
        currentValue: videoInputSelectorValue,
        videoInputTypes: ["Camera", "File", "Sample", "Window"],
        onInputSourceChanged: (value: VideoInputSelectorValue) => {
            console.log("CHANGE_CAMERA");
            setVideoInputSelectorValue(value);
        },
        cameraResolutions: {
            "640×360": [640, 360],
            "720×480": [720, 480],
            "1280×720": [1280, 720],
        },
        sampleFilePaths: {
            sampleTest1: "sampleTest1",
            sampleTest2: "sampleTest2",
        },
        classNameBase: "components-base",
        fileFilter: "audio/*|image/*|video/*",
    };

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
                <div className="mt-5 ml-5" style={{ display: "flex", flexDirection: "column", width: "70%", height: "100%" }}>
                    <VideoInputSelector {...videoInputSelectorProps}></VideoInputSelector>
                    <div id="video-container" style={{ width: "100%", height: "100%", position: "relative" }}>
                        <video id="input" style={{ position: "absolute", objectFit: "contain", maxHeight: "100%" }}></video>
                        <canvas id="overlay" style={{ position: "absolute", objectFit: "contain" }} />
                    </div>

                    <div id="under-panel" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
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
                                <input type="checkbox" checked={ffmpegOptions.removeAudio} className="checkbox checkbox-sm" onChange={setRemoveAudio} />
                                <div style={{ marginLeft: "5px" }}></div>
                                <span>remove audio</span>
                            </div>
                            <div style={{ marginLeft: "15px" }}></div>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <input type="checkbox" checked={ffmpegOptions.copyStream} className="checkbox checkbox-sm" onChange={setCopyStream} />
                                <div style={{ marginLeft: "5px" }}></div>
                                <span>copy stream</span>
                            </div>
                            <div style={{ marginLeft: "15px" }}></div>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <input type="checkbox" checked={ffmpegOptions.audioWithBlackScreen} className="checkbox checkbox-sm" onChange={setBlackScreen} />
                                <div style={{ marginLeft: "5px" }}></div>
                                <span>audio with black screen</span>
                            </div>
                        </div>

                        <div id="button-container" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                            <div>{convertButton}</div>
                            <div style={{ marginLeft: "5px" }}></div>

                            <div>{progressBar}</div>
                            <div id="cli-container" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                <div id="cli"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="side-panel" style={{ width: "30%" }}>
                    <Controller></Controller>
                </div>
            </div>
        </>
    );
};

export default App;
