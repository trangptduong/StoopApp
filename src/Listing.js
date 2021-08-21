import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Listing({ emitTaken, aid, name, descText, closeFunc }) {
  const [fetched, setFetched] = useState(false);
  const [id, setId] = useState(String(aid));
  const [title, setTitle] = useState("Title");
  const [desc, setDesc] = useState("Description");
  const [photos, setPhotos] = useState({1: null, 2: null, 3: null, 4: null});
  const [commentList, setCommentList] = useState({});

  const [taken, setTaken] = useState(null);
  const [comment, setComment] = useState('');

  function trackListing(){
    if (taken == false){
      axios.post('/api/trackListing', {
        listingID: id
      })
      .then(() => {
        toast.info("Listing is being tracked.")
      })
      .catch(function (error) {
        toast.error(
          error.response
            ? error.response.data
            : "Error trying to track listing."
        )
      })
    }
    else {
      toast.error("Listing is already taken.")
    }
  }

  function markTaken(){
    if (taken == false){
      axios.post('/api/markTaken', {
        listingID: id
      })
      .then((response) => {
        emitTaken(id);
        setTaken(true);
      })
      .catch(function (error) {
        toast.error(
          error.response
            ? error.response.data
            : "Error trying to mark listing."
        )
      })
    }
    else {
      toast.error("Listing is already taken.")
    }
  }

  function reportListing(){
    axios.post('/api/reportListing', {
      listingID: id
    })
    .then((response) => {
      toast.info(response.data.message);
    })
    .catch(function (error) {
      toast.error(
        error.response
          ? error.response.data
          : "Error trying to report listing."
      )
    })
  }

  function getListing(){
     axios.post('/api/listing', {
       listingID: id
     })
     .then((response) => {
       setTitle(response.data.title);
       setDesc(response.data.desc);
       setPhotos(response.data.photos);
       setCommentList(response.data.commentList);
       if (response.data.taken == "Yes"){
         setTaken(true);
       }
       else {setTaken(false);}
     })
     //.catch(function (error) {
     //   toast.error(
     //     error.response
     //       ? error.response.data
     //       : "Error trying to get listing."
     //   )
     // })
    setTitle(name);
    setDesc(descText);
  }

  function renderPhotos(){
    return Object.entries(photos).map(([key, value]) => {
      if (value){
        return <img src={value} class="img-fluid"/>
      }
    });
  }

  function renderComments(){
    return Object.entries(commentList).map(([key, value]) => {
      return <li class="list-group-item"><b>{value.author}:</b> {value.content}</li>
    });
  }

  useEffect(() => {
    if (!fetched){
      getListing();
      setFetched(true);
    }
  });

  function addComment(event){
    event.preventDefault();

    axios.post("/api/addComment", {
      listingID: id,
      comment
    })
    .then((response) => {
      toast.info(response.data.message)
      setCommentList(response.data.commentList);
      setComment('');
    })
    .catch(function (error) {
      toast.error(
        error.response
          ? error.response.data
          : "Error adding comment to listing."
      )
    })
  }

  return (
    <div
      className="container"
      style={{
        position: "absolute",
        zIndex: 3,
        left: "10vw",
        width: "50w"
      }}>
      <div className="form-box">
      {/*info*/}
      <div className="header" style={{color: "white"}}>{title}</div>
      <div className="content text-left my-2" style={{color: "white"}}>{desc}</div>
      {renderPhotos()}
      {/*mark taken + report*/}
      <div>
        <button className="btn btn-info btn-block my-2" onClick={trackListing}>Track</button>
        <button className="btn btn-info btn-block my-2" onClick={markTaken}>Mark Taken</button>
        <button className="btn btn-danger btn-block my-2" onClick={reportListing}>Report</button>
      </div>
      {/*comment*/}
      <form onSubmit={addComment}>
        <div className="input-group my-2">
          <textarea
            className="form-control"
            placeholder="Comment"
            value={comment}
            rows="3"
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
        <button className="btn btn-success btn-block my-2">Add Comment</button>
      </form>
      <div className="card text-dark my-2">
        <ul class="list-group list-group-flush">
          {renderComments()}
        </ul>
      </div>
      <button className="btn btn-info btn-block my-2" onClick={closeFunc}>Close Listing</button>
      </div>
    </div>
  );
}
