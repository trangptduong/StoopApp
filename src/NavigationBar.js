import React from 'react'
import { BrowserRouter as Router, NavLink } from 'react-router-dom'

const NUM_NAVBAR_ITEMS = 3

// One menu item to go on the navigation bar
class NavBarItem extends React.Component {
    render() {
        return (
            <div
                className="navBtn"
                style={{
                    position: "absolute",
                    backgroundColor: "black",
                    width: String(100 / NUM_NAVBAR_ITEMS) + "%",
                    left: String(100 / NUM_NAVBAR_ITEMS * this.props.num) + "%",
                    height: this.props.height || "8vh",
                }}
            >
                <NavLink
                  exact to={this.props.url}
                  activeStyle={{color:"#FE7569"}}
                  style={{color: "white"}}
                >
                  {this.props.children}
                </NavLink>
            </div>
        )
    }
}

// Navigation bar at the bottom of the screen
class NavBar extends React.Component {
    render() {
        return (
            <div
                style={{
                    position: "fixed",
                    backgroundColor: "black",
                    width: "100%",
                    bottom: "0",
                    height: this.props.height || "8vh",
                    zIndex: 1,
                    borderTop: "1px white solid"
                }}
            >
                {/* First navbar option; instead of the placeholder text put in buttons that are useful */}
                <NavBarItem
                    num={0}
                    url="/"
                >
                    Home
                </NavBarItem>

                {/* Second navbar option */}
                <NavBarItem
                    num={1}
                    url="/settings"
                >
                    Settings
                </NavBarItem>

                {/* Third navbar option */}
                <NavBarItem
                    num={2}
                    url="/logout"
                >
                    Logout
                </NavBarItem>

                {/* Temp */}
                /*<NavBarItem
                    num={3}
                    url="/login"
                >
                    Login
                </NavBarItem>*/

                {/* Temp */}
                /*<NavBarItem
                    num={4}
                    url="/register"
                >
                    Register
                </NavBarItem>*/
            </div>
        )
    }
}

export default NavBar;