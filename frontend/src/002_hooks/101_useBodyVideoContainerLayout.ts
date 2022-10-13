import { useEffect, useRef, useState } from "react";
import { OVERLAY_CANVAS_ID, TARGET_VIDEO_ID } from "../const";
import { FfmpegOptionsState } from "./102_useFmpegOptions";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
export type UseBodyVideoContainerLayoutProps = {
    ffmpegOptions: FfmpegOptionsState
}

export type AreaSelectState = {
    isSelecting: boolean;
    screenStartX: number;
    screenStartY: number;
    screenEndX: number;
    screenEndY: number;

    screenStartXRatio: number;
    screenStartYRatio: number;
    screenEndXRatio: number;
    screenEndYRatio: number;

    realStartX: number;
    realStartY: number;
    realEndX: number;
    realEndY: number;
}



export const useBodyVideoContainerLayout = (props: UseBodyVideoContainerLayoutProps) => {
    const { applicationSettingState } = useAppSetting()
    const fitLayout = () => {
        const bodyVideoContainer = document.getElementById("body-video-container") as HTMLDivElement
        const bodyVideoContainerCS = getComputedStyle(bodyVideoContainer);
        const bodyVideoContainerWidth = parseInt(bodyVideoContainerCS.getPropertyValue("width"));
        const bodyVideoContainerHeight = parseInt(bodyVideoContainerCS.getPropertyValue("height"));

        const bodyVideoControl = document.getElementById("body-video-control") as HTMLDivElement
        const bodyVideoControlCS = getComputedStyle(bodyVideoControl);
        // const bodyVideoSeekerContainerWidth = parseInt(bodyVideoSeekerContainerCS.getPropertyValue("width"));
        const bodyVideoControlHeight = parseInt(bodyVideoControlCS.getPropertyValue("height"));

        const bodyOverlayVideContainerWidth = bodyVideoContainerWidth
        const bodyOverlayVideContainerHeight = bodyVideoContainerHeight - bodyVideoControlHeight
        const bodyOverlayVideContainerAspect = bodyOverlayVideContainerHeight / bodyOverlayVideContainerWidth

        const video = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement;
        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight
        const videoAspect = videoHeight / videoWidth

        let resizeRatio = 0
        if (videoAspect > bodyOverlayVideContainerAspect) {
            // videoの高さが高いのでUpperに合わせる。
            resizeRatio = bodyOverlayVideContainerHeight / videoHeight
        } else {
            resizeRatio = bodyOverlayVideContainerWidth / videoWidth
        }

        const containerWidth = videoWidth * resizeRatio
        const containerHeight = videoHeight * resizeRatio


        const videoOverlayContainer = document.getElementById("body-overlay-video-container") as HTMLDivElement
        videoOverlayContainer.style.width = "" + containerWidth + "px"
        videoOverlayContainer.style.height = "" + containerHeight + "px"
        const overlay = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement
        overlay.width = containerWidth
        overlay.height = containerHeight
        // const ctx = overlay.getContext("2d")!
        // ctx.clearRect(0, 0, overlay.width, overlay.height)
        // ctx.fillStyle = "#88000088"
        // ctx.fillRect(0, 0, overlay.width, overlay.height)
        drawRect()
        bodyVideoControl.style.width = "" + containerWidth + "px"
    }

    const transitionStart = () => {
        const overlay = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement
        const ctx = overlay.getContext("2d")!
        ctx.clearRect(0, 0, overlay.width, overlay.height)
    }

    const transitionEnd = () => {
        fitLayout()
    }
    useEffect(() => {
        document.addEventListener('transitionstart', transitionStart);
        document.addEventListener('transitionend', transitionEnd);

        return () => {
            document.removeEventListener('transitionstart', transitionStart);
            document.removeEventListener('transitionend', transitionEnd);
        }
    }, [props.ffmpegOptions.viewBlurArea, props.ffmpegOptions.viewCropArea, props.ffmpegOptions.ffmpegOptions])

    const areaSelectStateRef = useRef<AreaSelectState>({
        isSelecting: false,
        screenStartX: -1,
        screenStartY: -1,
        screenEndX: -1,
        screenEndY: -1,

        screenStartXRatio: -1,
        screenStartYRatio: -1,
        screenEndXRatio: -1,
        screenEndYRatio: -1,

        realStartX: -1,
        realStartY: -1,
        realEndX: -1,
        realEndY: -1
    })
    const [areaSelectState, setAreaSelectState] = useState<AreaSelectState>(areaSelectStateRef.current)

    const drawRect = () => {
        const overlay = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement

        const startXRatio = areaSelectStateRef.current.screenStartXRatio
        const startYRatio = areaSelectStateRef.current.screenStartYRatio
        const endXRatio = areaSelectStateRef.current.screenEndXRatio
        const endYRatio = areaSelectStateRef.current.screenEndYRatio

        const startX = overlay.width * startXRatio
        const startY = overlay.height * startYRatio
        const endX = overlay.width * endXRatio
        const endY = overlay.height * endYRatio

        const ctx = overlay.getContext("2d")!
        ctx.clearRect(0, 0, overlay.width, overlay.height)

        ctx.fillStyle = applicationSettingState.applicationSetting?.colors.selected_area || "#88000088"
        ctx.fillRect(startX, startY, endX - startX, endY - startY)
        if (props.ffmpegOptions.viewCropArea && props.ffmpegOptions.ffmpegOptions.cropOption) {
            const startXRatio = props.ffmpegOptions.ffmpegOptions.cropOption.rect.startXRatio
            const startYRatio = props.ffmpegOptions.ffmpegOptions.cropOption.rect.startYRatio
            const endXRatio = props.ffmpegOptions.ffmpegOptions.cropOption.rect.endXRatio
            const endYRatio = props.ffmpegOptions.ffmpegOptions.cropOption.rect.endYRatio

            const startX = overlay.width * startXRatio
            const startY = overlay.height * startYRatio
            const endX = overlay.width * endXRatio
            const endY = overlay.height * endYRatio

            ctx.fillStyle = applicationSettingState.applicationSetting?.colors.crop_area || "#00880088"
            ctx.fillRect(startX, startY, endX - startX, endY - startY)
        }
        if (props.ffmpegOptions.viewBlurArea) {
            props.ffmpegOptions.ffmpegOptions.blurOptions.map(x => {
                const startXRatio = x.rect.startXRatio
                const startYRatio = x.rect.startYRatio
                const endXRatio = x.rect.endXRatio
                const endYRatio = x.rect.endYRatio

                const startX = overlay.width * startXRatio
                const startY = overlay.height * startYRatio
                const endX = overlay.width * endXRatio
                const endY = overlay.height * endYRatio

                ctx.fillStyle = applicationSettingState.applicationSetting?.colors.blur_area || "#00008888"
                ctx.fillRect(startX, startY, endX - startX, endY - startY)
            })
        }
    }
    useEffect(() => {
        drawRect()
    }, [props.ffmpegOptions.viewBlurArea, props.ffmpegOptions.viewCropArea, props.ffmpegOptions.ffmpegOptions])

    useEffect(() => {
        const overlay = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement
        const video = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement;
        // register event handler
        overlay.onmousedown = (e: MouseEvent) => {
            if (areaSelectStateRef.current.isSelecting === false) {
                areaSelectStateRef.current.screenStartX = e.offsetX;
                areaSelectStateRef.current.screenStartY = e.offsetY;
                areaSelectStateRef.current.isSelecting = true;

                areaSelectStateRef.current.screenStartXRatio = areaSelectStateRef.current.screenStartX / overlay.width
                areaSelectStateRef.current.screenStartYRatio = areaSelectStateRef.current.screenStartY / overlay.height
                areaSelectStateRef.current.realStartX = Math.floor(areaSelectStateRef.current.screenStartXRatio * video.videoWidth);
                areaSelectStateRef.current.realStartY = Math.floor(areaSelectStateRef.current.screenStartYRatio * video.videoHeight);

                areaSelectStateRef.current.screenEndX = -1;
                areaSelectStateRef.current.screenEndY = -1;
                areaSelectStateRef.current.screenEndXRatio = -1;
                areaSelectStateRef.current.screenEndYRatio = -1;
                areaSelectStateRef.current.realEndX = -1;
                areaSelectStateRef.current.realEndY = -1;
                setAreaSelectState({ ...areaSelectStateRef.current })
            }
        };

        overlay.onmousemove = (e: MouseEvent) => {
            if (areaSelectStateRef.current.isSelecting) {
                areaSelectStateRef.current.screenEndX = e.offsetX > areaSelectStateRef.current.screenStartX ? e.offsetX : areaSelectStateRef.current.screenStartX;
                areaSelectStateRef.current.screenEndY = e.offsetY > areaSelectStateRef.current.screenStartY ? e.offsetY : areaSelectStateRef.current.screenStartY;

                areaSelectStateRef.current.screenEndXRatio = areaSelectStateRef.current.screenEndX / overlay.width
                areaSelectStateRef.current.screenEndYRatio = areaSelectStateRef.current.screenEndY / overlay.height

                areaSelectStateRef.current.realEndX = Math.floor(areaSelectStateRef.current.screenEndXRatio * video.videoWidth);
                areaSelectStateRef.current.realEndY = Math.floor(areaSelectStateRef.current.screenEndYRatio * video.videoHeight);
                setAreaSelectState({ ...areaSelectStateRef.current })
                drawRect()
            }
        };
        overlay.onmouseup = (e: MouseEvent) => {
            if (areaSelectStateRef.current.isSelecting) {

                areaSelectStateRef.current.screenEndX = e.offsetX > areaSelectStateRef.current.screenStartX ? e.offsetX : areaSelectStateRef.current.screenStartX;
                areaSelectStateRef.current.screenEndY = e.offsetY > areaSelectStateRef.current.screenStartY ? e.offsetY : areaSelectStateRef.current.screenStartY;
                areaSelectStateRef.current.isSelecting = false;

                areaSelectStateRef.current.screenEndXRatio = areaSelectStateRef.current.screenEndX / overlay.width
                areaSelectStateRef.current.screenEndYRatio = areaSelectStateRef.current.screenEndY / overlay.height


                areaSelectStateRef.current.realStartX = Math.floor(areaSelectStateRef.current.screenStartXRatio * video.videoWidth);
                areaSelectStateRef.current.realStartY = Math.floor(areaSelectStateRef.current.screenStartYRatio * video.videoHeight);
                areaSelectStateRef.current.realEndX = Math.floor(areaSelectStateRef.current.screenEndXRatio * video.videoWidth);
                areaSelectStateRef.current.realEndY = Math.floor(areaSelectStateRef.current.screenEndYRatio * video.videoHeight);
                setAreaSelectState({ ...areaSelectStateRef.current })
                drawRect()

            }
        };
        overlay.onmouseout = (_e: MouseEvent) => {
            if (areaSelectStateRef.current.isSelecting) {
                areaSelectStateRef.current.isSelecting = false;
                areaSelectStateRef.current.screenStartX = -1;
                areaSelectStateRef.current.screenStartY = -1;
                areaSelectStateRef.current.screenEndX = -1;
                areaSelectStateRef.current.screenEndY = -1;

                areaSelectStateRef.current.screenStartXRatio = -1;
                areaSelectStateRef.current.screenStartYRatio = -1;
                areaSelectStateRef.current.screenEndXRatio = -1;
                areaSelectStateRef.current.screenEndYRatio = -1;

                areaSelectStateRef.current.realStartX = -1;
                areaSelectStateRef.current.realStartY = -1;
                areaSelectStateRef.current.realEndX = -1;
                areaSelectStateRef.current.realEndY = -1;
                drawRect()

                setAreaSelectState({ ...areaSelectStateRef.current })
            }
        };
    }, [props.ffmpegOptions.viewBlurArea, props.ffmpegOptions.viewCropArea, props.ffmpegOptions.ffmpegOptions])


    const [currentTime, setCurrentTime] = useState<number>(0)
    useEffect(() => {
        const video = document.getElementById(TARGET_VIDEO_ID) as HTMLVideoElement;
        video.ontimeupdate = () => {
            video.currentTime
            setCurrentTime(video.currentTime)
        }
    }, [])

    return {
        fitLayout,
        areaSelectState,
        currentTime
    }
}