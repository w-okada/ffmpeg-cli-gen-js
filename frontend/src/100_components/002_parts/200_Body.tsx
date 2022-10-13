import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useMemo } from "react";

import { useAppState } from "../../003_provider/003_AppStateProvider";
import { OVERLAY_CANVAS_ID, TARGET_VIDEO_ID } from "../../const";

export const Body = () => {
    const { frontendManagerState } = useAppState()

    const timeSlider = useMemo(() => {
        const video = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement
        if (!video || frontendManagerState.fileUrl.length == 0) {
            return <></>
        }
        const playIcon = video.paused ? <FontAwesomeIcon icon={["fas", "play"]} /> : <FontAwesomeIcon icon={["fas", "pause"]} />
        return (
            <>
                <div id="body-video-seeker-container" className="body-video-seeker-container">
                    <div className="body-video-seeker-play" onClick={() => {
                        if (video.paused) {
                            video.play()
                        } else {
                            video.pause()
                        }
                    }}>
                        {playIcon}
                    </div>
                    <input
                        id="body-video-seeker"
                        className="body-video-seeker"
                        type="range"
                        min="0"
                        max={frontendManagerState.movieInfo?.duration || 0}
                        step="0.1"
                        value={frontendManagerState.movieInfo?.currentTime || 0}
                        onChange={(e) =>
                            frontendManagerState.setCurrentTime(Number(e.target.value))
                        }
                    />

                </div>
                <div className="body-video-seeker-other-container">
                    <div className="body-video-label-100">{(frontendManagerState.movieInfo?.currentTime || 0).toFixed(2)}/{(frontendManagerState.movieInfo?.duration || 0).toFixed(2)} </div>
                    <div className="body-video-label-100">{frontendManagerState.movieInfo?.width || 0}x{frontendManagerState.movieInfo?.height || 0}</div>
                    <div className="body-video-volume">
                        <FontAwesomeIcon icon={["fas", "volume-high"]} />
                    </div>
                    <input
                        id="body-video-volume-slider"
                        className="body-video-volume-slider"
                        type="range"
                        min="0"
                        max={1}
                        step="0.1"
                        defaultValue={1}
                        onChange={(e) => {
                            frontendManagerState.setVolume(Number(e.target.value))
                        }}
                    />

                </div>
            </>
        );
    }, [frontendManagerState.movieInfo]);


    // const cli = useMemo(() => {
    //     const movieInfo = frontendManagerState.movieInfo
    //     const inputFile = frontendManagerState.fileName

    //     if (!movieInfo || inputFile.length == 0) {
    //         return ""
    //     }
    //     const params: string[] = []
    //     params.push("ffmpeg")

    //     // cut start
    //     const cutOption = frontendManagerState.ffmpegOptions.ffmpegOptions.cutOption
    //     if (cutOption.startTime > 0) {
    //         params.push("-ss")
    //         params.push("" + cutOption.startTime)
    //     }

    //     // input
    //     params.push("-i")
    //     params.push(inputFile)



    //     // filter complex
    //     const cropOption = frontendManagerState.ffmpegOptions.ffmpegOptions.cropOption
    //     const blurOptions = frontendManagerState.ffmpegOptions.ffmpegOptions.blurOptions
    //     const blurAreaCmds = blurOptions.map((x, index) => {
    //         const startX = Math.floor(x.rect.startXRatio * movieInfo.width)
    //         const startY = Math.floor(x.rect.startYRatio * movieInfo.height)
    //         const endX = Math.floor(x.rect.endXRatio * movieInfo.width)
    //         const endY = Math.floor(x.rect.endYRatio * movieInfo.height)
    //         const width = endX - startX
    //         const height = endY - startY
    //         const cmd = `[0:v]boxblur=${x.strength}[fg],[fg]crop=${width}:${height}:${startX}:${startY}[br${index}]`
    //         return cmd
    //     })
    //         .reduce((prev, cur) => {
    //             if (prev.length == 0) {
    //                 return cur
    //             } else {
    //                 return prev + "," + cur
    //             }
    //         }, "")
    //     console.log("BLUR", blurOptions, blurAreaCmds)
    //     const overlayCmds = blurOptions.map((x, index) => {
    //         const startX = Math.floor(x.rect.startXRatio * movieInfo.width)
    //         const startY = Math.floor(x.rect.startYRatio * movieInfo.height)
    //         if (index == 0) {
    //             return `[0:v][br${index}]overlay=${startX}:${startY}[mg${index}]`
    //         } else {
    //             return `[mg${index - 1}][br${index}]overlay=${startX}:${startY}[mg${index}]`
    //         }
    //     }).reduce((prev, cur) => {
    //         if (prev.length == 0) {
    //             return cur
    //         } else {
    //             return prev + "," + cur
    //         }
    //     }, "")
    //     const blurCmd = blurAreaCmds.length > 0 ? blurAreaCmds + "," + overlayCmds : ""

    //     let cropCmd = ""
    //     let outNode = ""
    //     if (cropOption) {
    //         const startX = Math.floor(cropOption.rect.startXRatio * movieInfo.width)
    //         const startY = Math.floor(cropOption.rect.startYRatio * movieInfo.height)
    //         const endX = Math.floor(cropOption.rect.endXRatio * movieInfo.width)
    //         const endY = Math.floor(cropOption.rect.endYRatio * movieInfo.height)
    //         const width = endX - startX
    //         const height = endY - startY
    //         const blurNum = blurOptions.length
    //         if (blurNum == 0) {
    //             cropCmd = `[0:v]crop=${width}:${height}:${startX}:${startY}[out]`
    //         } else {
    //             cropCmd = `[mg${blurNum - 1}]crop=${width}:${height}:${startX}:${startY}[out]`
    //         }
    //         outNode = "[out]"
    //     } else {
    //         const blurNum = blurOptions.length
    //         outNode = `[mg${blurNum - 1}]`
    //     }

    //     const complexFilter = [blurCmd, cropCmd].reduce((prev, cur) => {
    //         if (prev.length == 0) {
    //             return cur
    //         } else if (cur.length == 0) {
    //             return prev
    //         } else {
    //             return prev + "," + cur
    //         }
    //     }, "")

    //     if (complexFilter.length > 0) {
    //         params.push("-filter_complex")
    //         params.push(`\"${complexFilter}\"`)

    //         params.push("-map")
    //         params.push(`\"${outNode}\"`)
    //     } else {
    //         params.push("-map")
    //         params.push(`0:v`)
    //     }

    //     if (frontendManagerState.ffmpegOptions.ffmpegOptions.removeAudio) {

    //     } else {
    //         params.push("-c:a")
    //         params.push("copy")
    //         params.push("-map")
    //         params.push("0:a")

    //     }

    //     if (cutOption.endTime > 0) {
    //         const duration = cutOption.startTime > 0 ? cutOption.endTime - cutOption.startTime : cutOption.endTime

    //         params.push("-t")
    //         params.push("" + duration)
    //     }

    //     params.push("output.mp4")

    //     const cli = params.reduce((prev, cur) => {
    //         return prev + " " + cur
    //     }, "")
    //     return cli

    // }, [frontendManagerState.ffmpegOptions])

    return (
        <div className="body-content">
            <div className="body-content-upper" id="body-content-upper">
                <div id="body-video-container" className="body-video-container">
                    <div id="body-overlay-video-container" className="body-overlay-video-container">
                        <video id={TARGET_VIDEO_ID} className="body-video"  ></video>
                        <canvas id={OVERLAY_CANVAS_ID} className="body-video-overlay" />
                    </div>
                    <div id="body-video-control" className="body-video-control">
                        {timeSlider}
                    </div>
                </div>
            </div>
            <div className="body-content-lower">
                <div id="body-content-text" className="body-content-text">
                    <p className="body-content-text-fixed">${frontendManagerState.ffmpegCli}</p>
                </div>
            </div>
        </div>
    );
};
