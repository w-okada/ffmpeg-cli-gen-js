import "./cardStyle.css";
import React from "react";

export const Card = () => {
    return (
        <div className="m-4 rounded-xl bg-base-100 shadow-lg">
            <div className="m-4">
                <h1 className="text-xl ">Super Simple movie editor</h1>
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
                <h2 className="text-base ">Quick Capture Screen</h2>
                <p className="pl-4"> Capture your screen or window with just only browser</p>
            </div>
        </div>
    );
    return (
        <div className="card">
            <input type="radio" id="page1"></input>
            <label htmlFor="page1">
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            </label>
            <h1>SSME:Super Simple movie editor</h1>
            <div id="desc-page1">
                <h2>step1</h2>
                <p></p>
            </div>
            <div id="desc-page2">
                <h2>step2</h2>
                <p></p>
            </div>
        </div>
    );
};
