import React from 'react'

const DEFAULT_BG_COLOR = "#6b6667"
const DEFAULT_FG_COLOR = "#ffffff"

// Main menu buttons
class HSControl extends React.Component {
    render() {
        return (
            <button
                className="mapControl"
                onClick={this.props.onClick}
                style={{
                    border: "none",

                    left: this.props.left,
                    right: this.props.right,

                    width: this.props.width || "64px",
                    height: this.props.height || "64px",
                    borderRadius: this.props.borderRadius || "0%",
                    bottom: this.props.bottom || "12%",
                    backgroundColor: this.props.backgroundColor || DEFAULT_BG_COLOR,
                    color: this.props.color || DEFAULT_FG_COLOR,
                    padding: this.props.padding || "0px 0px 0px 0px"
                }}>
                {this.props.content}
            </button>
        );
    }
}

export default HSControl;