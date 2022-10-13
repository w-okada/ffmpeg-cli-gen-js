import React, { useMemo } from "react";
import { useAppState } from "../../003_provider/003_AppStateProvider";
import { useFileInput } from "../003_hooks/useFileInput";

export const EditorController = () => {
    const { frontendManagerState } = useAppState()
    const { click } = useFileInput()

    const fileChooserRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label  sidebar-content-row-label-title">File:</div>
                <div className="sidebar-content-row-select">
                    <div className="sidebar-content-row-buttons">
                        <div className="sidebar-content-row-button" onClick={() => onChooseFileClicked()}>Load File</div>
                    </div>
                </div>
            </div>
        )
    }, [])

    const filenameRow = useMemo(() => {
        return (
            <>
                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label sidebar-content-row-label-title">Name:</div>
                    <div className="sidebar-content-row-label">{frontendManagerState.fileName || ""}</div>
                </div>
            </>
        )
    }, [frontendManagerState.fileName])

    const currentTimeRow = useMemo(() => {
        return (
            <>
                <div className="sidebar-content-row-5-5">
                    <div className="sidebar-content-row-label  sidebar-content-row-label-title">Current time:</div>
                    <div className="sidebar-content-row-label">{frontendManagerState.movieInfo?.currentTime || -1}</div>
                </div>
            </>
        )
    }, [frontendManagerState.movieInfo?.currentTime])

    const areaSelectStateRow = useMemo(() => {
        const startX = frontendManagerState.areaSelectState.screenStartXRatio.toFixed(2)
        const startY = frontendManagerState.areaSelectState.screenStartYRatio.toFixed(2)
        const endX = frontendManagerState.areaSelectState.screenEndXRatio.toFixed(2)
        const endY = frontendManagerState.areaSelectState.screenEndYRatio.toFixed(2)
        const realStartX = frontendManagerState.areaSelectState.realStartX
        const realStartY = frontendManagerState.areaSelectState.realStartY
        const realEndX = frontendManagerState.areaSelectState.realEndX
        const realEndY = frontendManagerState.areaSelectState.realEndY

        return (
            <>
                <div className="sidebar-content-row-7-3">
                    <div className="sidebar-content-row-label  sidebar-content-row-label-title">Selected Area</div>
                    <div className="sidebar-content-row-label"></div>
                </div>
                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label pad-left-1">ratio:</div>
                    <div className="sidebar-content-row-label">{`[${startX}, ${startY}, ${endX}, ${endY}]`}</div>
                </div>
                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label pad-left-1">real:</div>
                    <div className="sidebar-content-row-label">{`[${realStartX}, ${realStartY}, ${realEndX}, ${realEndY}]`}</div>
                </div>
            </>
        )
    }, [frontendManagerState.areaSelectState, frontendManagerState.movieInfo])



    const removeAudioRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-7-3">
                <div className="sidebar-content-row-label  sidebar-content-row-label-title">Remove audio:</div>

                <div className="sidebar-content-row-buttons">
                    <input type="checkbox" defaultChecked={frontendManagerState.ffmpegOptions.ffmpegOptions.removeAudio} onClick={() => { onRemoveAudioClicked(frontendManagerState.ffmpegOptions.ffmpegOptions.removeAudio) }} />
                    <div className="sidebar-content-row-label">remove</div>
                </div>
            </div>

        )
    }, [frontendManagerState.ffmpegOptions])




    const cutRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label  sidebar-content-row-label-title">Cut:</div>

                <div className="sidebar-content-row-buttons">
                    <div className="sidebar-content-row-button" onClick={() => onSetStartClicked()}>set start</div>
                    <div className="sidebar-content-row-button" onClick={() => onSetEndClicked()}>set end</div>
                </div>
            </div>

        )
    }, [frontendManagerState.movieInfo?.currentTime, frontendManagerState.movieInfo?.duration, frontendManagerState.ffmpegOptions])

    const cutSettingRow = useMemo(() => {
        const start = Math.max(frontendManagerState.ffmpegOptions.ffmpegOptions.cutOption.startTime, 0)
        const end = frontendManagerState.ffmpegOptions.ffmpegOptions.cutOption.endTime == -1 ? frontendManagerState.movieInfo?.duration : frontendManagerState.ffmpegOptions.ffmpegOptions.cutOption.endTime
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label pad-left-1">
                    range:
                </div>

                <div className="sidebar-content-row-label">
                    [{start} - {end}]
                </div>
            </div >
        )
    }, [frontendManagerState.movieInfo?.duration, frontendManagerState.ffmpegOptions])

    const cropRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label  sidebar-content-row-label-title">Crop:</div>
                <div className="sidebar-content-row-buttons">
                    <div className="sidebar-content-row-button" onClick={() => onSetCropClicked()}>set</div>
                    <div className="sidebar-content-row-label pad-left-1"></div>
                    <input type="checkbox" defaultChecked={frontendManagerState.ffmpegOptions.viewCropArea} onClick={() => { onViewCropAreaClicked(frontendManagerState.ffmpegOptions.viewCropArea) }} />
                    <div className="sidebar-content-row-label">view</div>
                </div>
            </div>

        )
    }, [frontendManagerState.ffmpegOptions])

    const cropSettingRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label pad-left-1">
                    area:
                </div>
                <div className="sidebar-content-row-label">[
                    {frontendManagerState.ffmpegOptions.ffmpegOptions.cropOption?.rect.startXRatio.toFixed(2) || 0},
                    {frontendManagerState.ffmpegOptions.ffmpegOptions.cropOption?.rect.startYRatio.toFixed(2) || 0},
                    {frontendManagerState.ffmpegOptions.ffmpegOptions.cropOption?.rect.endXRatio.toFixed(2) || 0},
                    {frontendManagerState.ffmpegOptions.ffmpegOptions.cropOption?.rect.endYRatio.toFixed(2) || 0}
                    ]
                    <div className="sidebar-content-row-buttons">
                        <div className="sidebar-content-row-button" onClick={() => onRemoveCropClicked()}>remove</div>
                    </div>
                </div>
            </div>
        )
    }, [frontendManagerState.ffmpegOptions])

    const blurRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label  sidebar-content-row-label-title">Blur:</div>
                <div className="sidebar-content-row-buttons">
                    <div className="sidebar-content-row-button" onClick={() => onAddBlurClicked()}>add</div>
                    <div className="sidebar-content-row-label pad-left-1"></div>
                    <input type="checkbox" defaultChecked={frontendManagerState.ffmpegOptions.viewBlurArea} onClick={() => { onViewBlurAreaClicked(frontendManagerState.ffmpegOptions.viewBlurArea) }} />
                    <div className="sidebar-content-row-label">view</div>
                </div>
            </div>
        )
    }, [frontendManagerState.ffmpegOptions])
    const blurSettingRow = useMemo(() => {
        const blurOptions = frontendManagerState.ffmpegOptions.ffmpegOptions.blurOptions.map((x, index) => {
            return (
                <div className="sidebar-content-row-3-7" key={`blur-option-${index}`}>
                    <div className="sidebar-content-row-label pad-left-1">
                        area:
                    </div>
                    <div className="sidebar-content-row-label">[
                        {x.rect.startXRatio.toFixed(2) || 0},
                        {x.rect.startYRatio.toFixed(2) || 0},
                        {x.rect.endXRatio.toFixed(2) || 0},
                        {x.rect.endYRatio.toFixed(2) || 0}
                        ]
                        <div className="sidebar-content-row-buttons">
                            <div className="sidebar-content-row-button" onClick={() => onRemoveBlurClicked(index)}>remove</div>
                        </div>
                    </div>

                </div>
            )
        })
        return (
            <>
                {blurOptions}
            </>
        )
    }, [frontendManagerState.ffmpegOptions])

    const execRow = useMemo(() => {
        let buttonMessage = ""
        if (frontendManagerState.isConverting) {
            buttonMessage = `converting... (${frontendManagerState.convertProgress.toFixed(1)})`
        } else {
            buttonMessage = "convert"
        }
        return (
            <>
                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label  sidebar-content-row-label-title">Convert</div>
                    <div className="sidebar-content-row-buttons">
                        <div className="sidebar-content-row-button" onClick={() => onConvertClicked()}>{buttonMessage}</div>
                    </div>
                </div>
            </>
        )
    }, [frontendManagerState.ffmpegOptions])



    const onChooseFileClicked = async () => {
        try {
            const { name, url } = await click("video")
            frontendManagerState.setFileName(name)
            frontendManagerState.setFileUrl(url)
        } catch (exception) {
            alert(exception)
        }
    }
    const onSetStartClicked = () => {
        frontendManagerState.ffmpegOptions.setCutStartTime(frontendManagerState.movieInfo?.currentTime || 0)
    }
    const onSetEndClicked = () => {
        frontendManagerState.ffmpegOptions.setCutEndTime(frontendManagerState.movieInfo?.currentTime || -1)
    }
    const onSetCropClicked = () => {
        frontendManagerState.ffmpegOptions.setCropArea({
            startXRatio: frontendManagerState.areaSelectState.screenStartXRatio,
            startYRatio: frontendManagerState.areaSelectState.screenStartYRatio,
            endXRatio: frontendManagerState.areaSelectState.screenEndXRatio,
            endYRatio: frontendManagerState.areaSelectState.screenEndYRatio,
        })
    }
    const onRemoveCropClicked = () => {
        frontendManagerState.ffmpegOptions.removeCropArea()
    }
    const onAddBlurClicked = () => {
        frontendManagerState.ffmpegOptions.addBlurArea({
            startXRatio: frontendManagerState.areaSelectState.screenStartXRatio,
            startYRatio: frontendManagerState.areaSelectState.screenStartYRatio,
            endXRatio: frontendManagerState.areaSelectState.screenEndXRatio,
            endYRatio: frontendManagerState.areaSelectState.screenEndYRatio,
        }, true, 10)
    }
    const onRemoveBlurClicked = (index: number) => {
        frontendManagerState.ffmpegOptions.removeBlurArea(index)
    }
    const onRemoveAudioClicked = (current: boolean) => {
        frontendManagerState.ffmpegOptions.setRemoveAudio(!current)
    }
    const onConvertClicked = () => {
        frontendManagerState.convert()
    }
    const onViewCropAreaClicked = (current: boolean) => {
        frontendManagerState.ffmpegOptions.setViewCropArea(!current)
    }
    const onViewBlurAreaClicked = (current: boolean) => {
        frontendManagerState.ffmpegOptions.setViewBlurArea(!current)

    }
    return (
        <div className="sidebar-content">
            <div className="sidebar-content-row-label-header">
                Select Movie File
            </div>
            {fileChooserRow}

            <div className="sidebar-content-row-dividing"></div>

            <div className="sidebar-content-row-label-header">
                Movie Information
            </div>
            {filenameRow}
            {currentTimeRow}
            {areaSelectStateRow}

            <div className="sidebar-content-row-dividing"></div>

            <div className="sidebar-content-row-label-header">
                Options
            </div>
            {removeAudioRow}
            {cutRow}
            {cutSettingRow}
            {cropRow}
            {cropSettingRow}
            {blurRow}
            {blurSettingRow}


            <div className="sidebar-content-row-dividing"></div>
            <div className="sidebar-content-row-label-header">
                Exec.
            </div>
            {execRow}
        </div>
    );
};
