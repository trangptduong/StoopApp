import React from 'react'

class TypeSelector extends React.Component {
    render() {
        return (
            <div style={{
                position: "relative",
                top: "50px",
                left: "20px",
            }}
            onChange={this.props.onSelectType}>
                <input type="radio" value="chair" name="type" /> <label style={{color: "white"}}>Chair</label>
                <input type="radio" value="table" name="type" style={{position: "relative", left: "15px"}}/> <label style={{color: "white", position: "relative", left: "15px"}}>Table</label>
                <input type="radio" value="bed" name="type" style={{position: "relative", left: "30px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "30px"}}>Bed</label>
                <input type="radio" value="functional" name="type" style={{position: "relative", left: "45px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "45px"}}>Functional</label>
                <input type="radio" value="other" name="type" style={{position: "relative", left: "55px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "55px"}}>Other</label>
                <input type="radio" value="none" name="type" style={{position: "relative", left: "65px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "65px"}}>None</label>
            </div>
        );
    }
}

// Select filters screen
class Filters extends React.Component {
    render() {
        return (
            <div style={{
                position: "absolute",
                backgroundColor: "#000000",
                width: "70vw",
                top: "10vh",
                height: "20vh",
                left: "15vw",
                zIndex: 2
            }}>
                <TypeSelector onSelectType={this.props.onSelectType}/>
                {/* Apply filters */}
                <button 
                    style={{
                        position: "relative",
                        left: "10vw",
                        top: "70px",
                        width: "50vw"
                    }}
                    onClick={this.props.onClickAdd}
                >Apply filters
                </button>

                {/* Close filters */}
                <button 
                    style={{
                        position: "relative",
                        left: "10vw",
                        top: "90px",
                        width: "50vw"
                    }}
                    onClick={this.props.onClickClose}
                >Close filters
                </button>
            </div>
        );
    }
}

export default Filters;