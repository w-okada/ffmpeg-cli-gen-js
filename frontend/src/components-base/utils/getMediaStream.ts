import { VideoInputSelectorValue } from "../VideoInputSelect";

export const getVideoInputSelectorMediaStream = async (props: VideoInputSelectorValue, enableAudio: boolean) => {
    if (props.videoInputType === "Camera") {
        const constraint: MediaStreamConstraints = {
            audio: enableAudio,
            video: {
                deviceId: props.deviceId,
            },
        }
        if (props.resolution) {
            constraint["video"] = {
                deviceId: props.deviceId,
                width: { ideal: props.resolution[0], max: 1200 },
                height: { ideal: props.resolution[1], max: 1500 },
            }
        }
        return await navigator.mediaDevices.getUserMedia(constraint)
    } else if (props.videoInputType === "File") {
        console.warn("not implemented", props.videoInputType)
        throw Error(`unknwon video input type ${props.videoInputType}`)
    } else if (props.videoInputType === "Window") {
        return navigator.mediaDevices.getDisplayMedia({ audio: enableAudio, video: true })

    } else if (props.videoInputType === "Sample") {
        console.warn("not implemented", props.videoInputType)
        throw Error(`unknwon video input type ${props.videoInputType}`)
    } else {
        console.warn("unknwon video input type", props.videoInputType)
        throw Error(`unknwon video input type ${props.videoInputType}`)
    }
}

