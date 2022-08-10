import "./cardStyle.css";
import React from "react";

export const Card = () => {
    return (
        <div className="m-4 rounded-xl bg-base-100 shadow-lg">
            <div className="m-4">
                <h1 className="text-xl ">Super Simple movie editor with ffmpeg-wasm</h1>
                <h2 className="text-base underline font-black pt-4">Usage</h2>
                <p className="m-1">(1) push load file button and select movie file</p>
                <p className="m-1">(2) select crop area from movie. set start time and end time by using time slide bar.</p>
                <p className="m-1">(3) push convert button.</p>

                <h2 className="text-base underline font-black pt-4">Please support me</h2>
                <p className="m-1">You can support coffee here.</p>
                <p>
                    <a href="https://www.buymeacoffee.com/wokad" target="_blank">
                        <img src="coffee.png" alt="Buy Me A Coffee" height="41" width="174" />
                    </a>
                </p>

                <h2 className="text-base underline font-black pt-4">link</h2>
                <h2 className="text-base underline">
                    <a className="text-base underline" href="https://screen-recorder-ts.herokuapp.com/frontend/index.html">
                        Screen Capture with ffmpeg-wasm
                    </a>
                </h2>
                <p className="pl-4">Capture your screen or window with just only browser </p>
            </div>
        </div>
    );
};