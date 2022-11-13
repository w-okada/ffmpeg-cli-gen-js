import { MovieInfo } from "./100_useFrontendManager"
import { FfmpegOptionRect, FilterOutput } from "./102_useFmpegOptions"

export type CropOption = {
    rect: FfmpegOptionRect
}

export const generateCropFilterExpression = (movieInfo: MovieInfo, inputNode: string, cropOption: CropOption | null): FilterOutput => {
    if (!cropOption) {
        return {
            outputNode: inputNode,
            expression: "",
        }
    }
    const startX = Math.floor(cropOption.rect.startXRatio * movieInfo.width)
    const startY = Math.floor(cropOption.rect.startYRatio * movieInfo.height)
    const endX = Math.floor(cropOption.rect.endXRatio * movieInfo.width)
    const endY = Math.floor(cropOption.rect.endYRatio * movieInfo.height)
    const width = endX - startX
    const height = endY - startY

    return {
        outputNode: "cr",
        expression: `[${inputNode}]crop=${width}:${height}:${startX}:${startY}[cr]`
    }

}