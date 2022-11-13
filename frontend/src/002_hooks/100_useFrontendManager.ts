import { useEffect, useState } from "react";
import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/003_hooks/useStateControlCheckbox";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { TARGET_VIDEO_ID } from "../const";
import { AreaSelectState, useBodyVideoContainerLayout } from "./101_useBodyVideoContainerLayout";
import { FfmpegOptionsState, useFfmpegOptions } from "./102_useFmpegOptions";
import { ARIAL_TTF } from "./arial.ttf";
import { generateBlurFilterExpression } from "./102-1_filter_blur";
import { generateCropFilterExpression } from "./102-2_filter_crop";


export const RECORDING_STATUS = {
    initializing: "initializing",
    stop: "stop",
    recording: "recording",
    converting: "converting",
} as const
export type RECORDING_STATUS = typeof RECORDING_STATUS[keyof typeof RECORDING_STATUS]

export type MovieInfo = {
    duration: number
    currentTime: number
    width: number
    height: number
}

export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
    generalDialogCheckbox: StateControlCheckbox
}

type FrontendManagerState = {
    stateControls: StateControls
    fileName: string
    fileUrl: string
    movieInfo: MovieInfo | null
    isConverting: boolean
    convertProgress: number

    areaSelectState: AreaSelectState
    ffmpegOptions: FfmpegOptionsState
    ffmpegCli: string

};

export type FrontendManagerStateAndMethod = FrontendManagerState & {
    setFileUrl: (url: string) => void;
    setFileName: (filename: string) => void;
    setCurrentTime: (val: number) => void
    setVolume: (val: number) => void
    convert: () => Promise<void>
}

export const useFrontendManager = (): FrontendManagerStateAndMethod => {
    const [ffmpeg, setFfmpeg] = useState<FFmpeg>();
    const [isConverting, setIsConverting] = useState<boolean>(false)
    const [convertProgress, setConvertProgress] = useState(0);

    const [fileName, _setFileName] = useState<string>("")
    const [fileUrl, setFileUrl] = useState<string>("")
    const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null)

    const ffmpegOptions = useFfmpegOptions()
    const { fitLayout, areaSelectState, currentTime } = useBodyVideoContainerLayout({ ffmpegOptions: ffmpegOptions })
    const [ffmpegCli, setFfmpegCli] = useState<string>("")

    // const requestIdRef = useRef(0)

    // (1) Controller Switch
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");
    // (2) Dialog
    const generalDialogCheckbox = useStateControlCheckbox("general-dialog-checkbox");



    // (2) initialize
    useEffect(() => {
        const ffmpeg = createFFmpeg({
            log: true,
            // corePath: "./assets/ffmpeg/ffmpeg-core.js",
        });
        const loadFfmpeg = async () => {
            await ffmpeg!.load();

            ffmpeg!.setProgress(({ ratio }) => {
                console.log("progress:", ratio);
                setConvertProgress(ratio);
            });
            setFfmpeg(ffmpeg);
        };
        loadFfmpeg();
    }, []);


    //  Operation
    useEffect(() => {
        if (fileUrl.length == 0) {
            return
        }
        const videoElem = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement
        videoElem.onloadedmetadata = () => {
            fitLayout()

            setMovieInfo({
                duration: videoElem.duration,
                width: videoElem.videoWidth,
                height: videoElem.videoHeight,
                currentTime: 0
            })
        }
        videoElem.src = fileUrl
    }, [fileUrl])

    useEffect(() => {
        setMovieInfo({
            ...movieInfo!, currentTime
        })
    }, [currentTime])

    const setCurrentTime = (val: number) => {
        const videoElem = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement
        videoElem.currentTime = val
        setMovieInfo({
            ...movieInfo!, currentTime: val
        })

    }
    const setVolume = (val: number) => {
        const videoElem = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement
        videoElem.volume = val
    }

    const b64ToUint8Array = (str: string) => (Uint8Array.from(atob(str), c => c.charCodeAt(0)));
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
        const video = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement;
        const src = video.src;
        ffmpeg.FS("writeFile", fileName, await fetchFile(src));


        ffmpeg.FS("writeFile", 'arial.ttf', b64ToUint8Array(ARIAL_TTF));

        // if (ffmpegOptions.audioWithBlackScreen) {
        //     ffmpeg.FS("writeFile", BlackScreenFile, await fetchFile("./black.png"));
        // }

        const outName = "output.mp4";
        const cliArgs = ffmpegCli.split(" ");
        cliArgs.shift()
        await ffmpeg.run(...cliArgs);
        const data = ffmpeg.FS("readFile", outName);

        const a = document.createElement("a");
        a.download = outName;
        a.href = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
        a.click();
        setIsConverting(false);
    };



    useEffect(() => {

        if (!movieInfo || fileName.length == 0) {
            return
        }
        const params: string[] = []
        params.push("ffmpeg")

        // cut start
        const cutOption = ffmpegOptions.ffmpegOptions.cutOption
        if (cutOption.startTime > 0) {
            params.push("-ss")
            params.push("" + cutOption.startTime)
        }

        // input
        params.push("-i")
        params.push(fileName)



        // filter complex
        const blurOptions = ffmpegOptions.ffmpegOptions.blurOptions
        const blurExpression = generateBlurFilterExpression(movieInfo, "0:v", blurOptions)
        const cropOption = ffmpegOptions.ffmpegOptions.cropOption
        const cropExpression = generateCropFilterExpression(movieInfo, blurExpression.outputNode, cropOption)

        /////////////////
        // test
        ////////////////
        // const drawtext = "drawtext=enable='between(t\,1\,2)':fontfile=/arial.ttf:text=\'Artist日本語AA\':fontcolor=white:fontsize=24:x=10:y=10"

        let complexFilter = [blurExpression, cropExpression].reduce((prev, cur) => {
            if (prev.length == 0) {
                return cur.expression
            } else if (cur.expression.length == 0) {
                return prev
            } else {
                return prev + "," + cur.expression
            }
        }, "")



        if (complexFilter.length > 0) {
            params.push("-filter_complex")
            params.push(`${complexFilter}`)
        }
        params.push("-map")
        params.push(`[${cropExpression.outputNode}]`)


        if (ffmpegOptions.ffmpegOptions.removeAudio) {

        } else {
            params.push("-c:a")
            params.push("copy")
            params.push("-map")
            params.push("0:a")

        }

        if (cutOption.endTime > 0) {
            const duration = cutOption.startTime > 0 ? cutOption.endTime - cutOption.startTime : cutOption.endTime

            params.push("-t")
            params.push("" + duration)
        }

        params.push("output.mp4")

        const cli = params.reduce((prev, cur) => {
            if (prev.length == 0) {
                return cur
            } else {
                return prev + " " + cur
            }
        }, "")
        setFfmpegCli(cli)
    }, [ffmpegOptions.ffmpegOptions])

    const setFileName = (_name: string) => {
        _setFileName("input.mp4")
    }

    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            // (1) Controller Switch
            openRightSidebarCheckbox,
            generalDialogCheckbox,
        },
        fileUrl,
        fileName,
        movieInfo,
        isConverting,

        convertProgress,
        areaSelectState,
        setCurrentTime,
        setVolume,
        setFileUrl,
        setFileName,
        convert,
        ffmpegOptions,
        ffmpegCli,
    };
    return returnValue;
};
