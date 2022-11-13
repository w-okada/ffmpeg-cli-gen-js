import { MovieInfo } from "./100_useFrontendManager"
import { FfmpegOptionRect, FilterOutput } from "./102_useFmpegOptions"

export type BlurOption = {
    rect: FfmpegOptionRect
    innerBlur: boolean
    strength: number
}


export const generateBlurFilterExpression = (movieInfo: MovieInfo, inputNode: string, blurOptions: BlurOption[]): FilterOutput => {
    const blurAreaCmds = blurOptions.map((x, index) => {
        const startX = Math.floor(x.rect.startXRatio * movieInfo.width)
        const startY = Math.floor(x.rect.startYRatio * movieInfo.height)
        const endX = Math.floor(x.rect.endXRatio * movieInfo.width)
        const endY = Math.floor(x.rect.endYRatio * movieInfo.height)
        const width = endX - startX
        const height = endY - startY
        const cmd = `[${inputNode}]boxblur=${x.strength}[fg],[fg]crop=${width}:${height}:${startX}:${startY}[br${index}]`
        return cmd
    }).reduce((prev, cur) => {
        if (prev.length == 0) {
            return cur
        } else {
            return prev + "," + cur
        }
    }, "")


    const overlayCmds = blurOptions.map((x, index) => {
        const startX = Math.floor(x.rect.startXRatio * movieInfo.width)
        const startY = Math.floor(x.rect.startYRatio * movieInfo.height)
        if (index == 0) {
            return `[0:v][br${index}]overlay=${startX}:${startY}[mg${index}]`
        } else {
            return `[mg${index - 1}][br${index}]overlay=${startX}:${startY}[mg${index}]`
        }
    }).reduce((prev, cur) => {
        if (prev.length == 0) {
            return cur
        } else {
            return prev + "," + cur
        }
    }, "")
    const blurExpression = blurOptions.length > 0 ? blurAreaCmds + "," + overlayCmds : ""
    const outputNode = blurOptions.length > 0 ? `mg${blurOptions.length - 1}` : inputNode
    return {
        outputNode: outputNode,
        expression: blurExpression
    }

}