import React from 'react'

import {ReactComponent as FullscreenButtonIcon} from "./fullscreen_icon.svg" // Fullscreen button icon

// Prompt asking the user to go fullscreen
class RequestFullscreen extends React.Component {
    render() {
        return (
            <div
                style={{
                    position: "absolute",
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "#f2e9e9",
                    zIndex: 2
                }}>

                    {/* Label requesting to press fullscreen button */}
                    <label style={{
                        position: "absolute",
                        width: "100vw",
                        height: "10%",
                        color: "black",
                        top: "30%",
                        textAlign: "center"
                    }}>Press to turn on fullscreen mode</label>
                    <button
                        onClick={this.props.onClick}
                        style={{
                            position: "absolute",
                            width: "20vw",
                            height: "20vw",
                            top: "40%",
                            left: "40%",
                            padding: "2% 2% 2% 2%",
                            border: "none",
                            backgroundColor: "#6b6667"
                        }}
                    >
                        <FullscreenButtonIcon/>
                    </button>

            </div>
        );
    }
}

export default RequestFullscreen;