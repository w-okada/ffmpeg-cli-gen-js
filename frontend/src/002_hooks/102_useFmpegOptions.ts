import { useState } from "react";
import { BlurOption } from "./102-1_filter_blur";
import { CropOption } from "./102-2_filter_crop";

export type FfmpegOptionRect = {
    startXRatio: number
    startYRatio: number
    endXRatio: number
    endYRatio: number
}
export type FilterOutput = {
    outputNode: string
    expression: string
}


export type CutOption = {
    startTime: number
    endTime: number
}

export type KeepLastFrame = {
    duration: number
}

export type FfmpegOption = {
    cutOption: CutOption
    cropOption: CropOption | null
    blurOptions: BlurOption[]
    keepLastFrame: KeepLastFrame | null
    removeAudio: boolean
    blackBackground: boolean
}

export type FfmpegOptionsState = {
    ffmpegOptions: FfmpegOption
    viewCropArea: boolean
    viewBlurArea: boolean
    setCutStartTime: (startTime: number) => void
    setCutEndTime: (endTime: number) => void
    setCropArea: (area: FfmpegOptionRect) => void
    removeCropArea: () => void
    addBlurArea: (area: FfmpegOptionRect, innerBlur: boolean, strength: number) => void
    removeBlurArea: (index: number) => void
    updateBlurArea: (index: number, area: FfmpegOptionRect, innerBlur: boolean, strength: number) => void
    setRemoveAudio: (val: boolean) => void

    setViewCropArea: (val: boolean) => void
    setViewBlurArea: (val: boolean) => void
}

export const useFfmpegOptions = (): FfmpegOptionsState => {
    const [viewCropArea, setViewCropArea] = useState<boolean>(false)
    const [viewBlurArea, setViewBlurArea] = useState<boolean>(false)

    const [ffmpegOptions, setFfmpegOptions] = useState<FfmpegOption>({
        cutOption: {
            startTime: -1,
            endTime: -1
        },
        cropOption: null,
        blurOptions: [],
        keepLastFrame: null,
        removeAudio: false,
        blackBackground: false,
    })

    const setCutStartTime = (startTime: number) => {
        ffmpegOptions.cutOption.startTime = startTime
        ffmpegOptions.cutOption = { ...ffmpegOptions.cutOption }
        setFfmpegOptions({ ...ffmpegOptions })
    }
    const setCutEndTime = (endTime: number) => {
        ffmpegOptions.cutOption.endTime = endTime
        ffmpegOptions.cutOption = { ...ffmpegOptions.cutOption }
        setFfmpegOptions({ ...ffmpegOptions })
    }

    const setCropArea = (area: FfmpegOptionRect) => {
        ffmpegOptions.cropOption = {
            rect: area
        }
        setFfmpegOptions({ ...ffmpegOptions })
    }

    const removeCropArea = () => {
        ffmpegOptions.cropOption = null
        setFfmpegOptions({ ...ffmpegOptions })
    }

    const addBlurArea = (area: FfmpegOptionRect, innerBlur: boolean, strength: number) => {
        ffmpegOptions.blurOptions.push({
            rect: area,
            innerBlur,
            strength
        })
        ffmpegOptions.blurOptions = [...ffmpegOptions.blurOptions]
        setFfmpegOptions({ ...ffmpegOptions })
    }
    const removeBlurArea = (index: number) => {
        ffmpegOptions.blurOptions = ffmpegOptions.blurOptions.filter((_x, i) => { return i != index })
        ffmpegOptions.blurOptions = [...ffmpegOptions.blurOptions]
        setFfmpegOptions({ ...ffmpegOptions })
    }
    const updateBlurArea = (index: number, area: FfmpegOptionRect, innerBlur: boolean, strength: number) => {
        ffmpegOptions.blurOptions[index] = {
            rect: area,
            innerBlur,
            strength
        }
        ffmpegOptions.blurOptions = [...ffmpegOptions.blurOptions]
        setFfmpegOptions({ ...ffmpegOptions })
    }
    const setRemoveAudio = (val: boolean) => {
        setFfmpegOptions({ ...ffmpegOptions, removeAudio: val })
    }

    return {
        ffmpegOptions,
        viewCropArea,
        viewBlurArea,

        setCutStartTime,
        setCutEndTime,
        setCropArea,
        removeCropArea,
        addBlurArea,
        removeBlurArea,
        updateBlurArea,
        setRemoveAudio,

        setViewCropArea,
        setViewBlurArea,
    }
}