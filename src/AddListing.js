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
                <input type="radio" value="table" name="type" style={{position: "relative", left: "20px"}}/> <label style={{color: "white", position: "relative", left: "20px"}}>Table</label>
                <input type="radio" value="bed" name="type" style={{position: "relative", left: "35px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "35px"}}>Bed</label>
                <input type="radio" value="functional" name="type" style={{position: "relative", left: "50px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "50px"}}>Functional</label>
                <input type="radio" value="other" name="type" style={{position: "relative", left: "65px"}}/> <label style={{color: "white", color: "white", position: "relative", left: "65px"}}>Other</label>
            </div>
        );
    }
}

// Add listing screen
class AddListing extends React.Component {
    render() {
        return (
            <div style={{
                position: "absolute",
                backgroundColor: "#000000",
                width: "70vw",
                top: "10vh",
                height: "70vh",
                left: "15vw",
                zIndex: 2
            }}>
                {/* Listing name */}
                <label style={{
                    position: "relative",
                    color: "white",
                    left: "20px",
                    top: "35px"
                }}>Name</label>
                <form>
                    <textarea
                        id="name"
                        rows="1"
                        style={{
                            position: "relative",
                            top: "0px",
                            left: "90px",
                            width: "350px"
                        }}
                    />
                </form>

                {/* Listing description */}
                <label style={{
                    position: "relative",
                    color: "white",
                    left: "20px",
                    top: "35px"
                }}>Description</label>
                <form>
                    <textarea
                        id="description"
                        rows="1"
                        style={{
                            position: "relative",
                            top: "0px",
                            left: "130px",
                            width: "310px"
                        }}
                    />
                </form>

                {/* Upload photos */}
                <label style={{
                    position: "relative",
                    color: "white",
                    left: "20px",
                    top: "35px"
                }}>Upload photos</label>
                <input 
                    style={{
                        position: "relative",
                        left: "30px",
                        top: "35px",
                        width: "100px"
                    }}
                    type="file" 
                    id="img" 
                    name="img" 
                    accept="image/*">
                </input>

                <TypeSelector onSelectType={this.props.onSelectType}/>

                {/* Add listing */}
                <button 
                    style={{
                        position: "relative",
                        left: "10vw",
                        top: "70px",
                        width: "50vw"
                    }}
                    onClick={() => this.props.onClickAdd(document.getElementById("name").value, document.getElementById("description").value)}
                >Add listing
                </button>

                {/* Close add listing */}
                <button 
                    style={{
                        position: "relative",
                        left: "10vw",
                        top: "105px",
                        width: "50vw"
                    }}
                    onClick={this.props.onClickClose}
                >Close listing
                </button>
            </div>
        );
    }
}

export default AddListing;