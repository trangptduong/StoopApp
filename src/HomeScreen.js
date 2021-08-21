import React, { useState, useEffect } from "react"
import axios from "axios"
import { GoogleMap, useLoadScript, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api"
import HSControl from './HomeScreenControl'
import RequestFullscreen from './RequestFullscreen'
import NavBar from "./NavigationBar"
import Listing from "./Listing"
import AddListing from "./AddListing"
import Filters from "./Filters"
import mapStyle from "./HomeScreenStyle" // Google Map style JSON
import markersList from "./DefaultMarkers"

import {ReactComponent as RecenterIcon} from "./recenter.svg" // Recenter button icon
import {ReactComponent as AddListingIcon} from "./add_listing.svg" // Add listing button icon

// Temporary variables for holding listing data
var lastAddedTitle = "";
var lastAddedDescription = "";
var lastAddedType = "";
var lastRequestedTitle = "";
var lastRequestedDescription = "";
var lastFilteredType = "";


// This will be tracked in the database later
var listingId = 0;

/*
1: add listing
2: look at listing
*/
const DEFAULT_LISTING_SCREEN_MODE = 0;
const DEFAULT_ZOOM = 10;
const DEFAULT_REQUEST_FULLSCREEN = true;

// Google API Libraries to use
const LIBRARIES = ["places"];

// Container div for Google Map
const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%',
    position: 'absolute'
}

// Map starting lat/long
const DEFAULT_CENTER = {
    lat: 40.71,
    lng: -74.006
};

// Map UI options; disabled to make room for StoopApp UI
const DEFAULT_OPTIONS = {
    styles: mapStyle,
    disableDefaultUI: true,
    gestureHandling: "greedy"
};

function showPos(pos) {
    console.log(pos.coords.latitude + "\n" + pos.coords.longitude);
}

export default function Map({emitTaken}) {
    // Load API
    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: "AIzaSyBX7QahP1yTzu3i5myK8ZztY9BHWGDqRd4",
        libraries: LIBRARIES
    });

    const [fetched, setFetched] = useState(false);
    const [markers, setMarkers] = React.useState([]); // Map markers state
    const [showRequestFS, setShowRequestFS] = React.useState(!DEFAULT_REQUEST_FULLSCREEN); // Fullscreen state
    const [listingScreenMode, setListingScreenMode] = React.useState(DEFAULT_LISTING_SCREEN_MODE); // Current "listing" screen
    const [selectedMarker, setSelected] = React.useState(null);
    const [filterType, setFilter] = React.useState("none");

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback((lat, lng) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(DEFAULT_ZOOM);
    }, []);

    useEffect(() => {
      if (!fetched){
        getAllListings();
        setFetched(true);
      }
    });

    // TODO: Implement error handling
    if (loadError) return "Error loading map";
    if (!isLoaded) return "Loading map..."

    // Add a new marker to the current state once GPS position is retrieved
    function onGetGeoPos(pos) {
        axios.post('/api/addListing', {
          lat: 40.71, //pos.coords.latitude,
          lng: 40.71, //pos.coords.longitude,
          title: lastAddedTitle,
          desc: lastAddedDescription,
          type: lastAddedType
        })
        .then((response) => {
          setMarkers(response.data.dbMarkers);
        })
    }

    // Receive current list of markers and add new one at location
    function handleAddListing() {
        setListingScreenMode(1);
    }

    function onRequestFS() {
        setShowRequestFS(true);
        document.documentElement.requestFullscreen();
    }

    // DEBUG: REMOVE LATER
    function onRecenterMap() {
        panTo(40.71, -74.006);
        setShowRequestFS(true);
        // setListingScreenMode(3);
    }

    function onCloseAddListing() {
        setListingScreenMode(0);
    }

    function onAddListing(name, desc) {
        lastAddedTitle = name;
        lastAddedDescription = desc;
        onGetGeoPos();
        //navigator.geolocation.getCurrentPosition(onGetGeoPos);
        listingId++;
        setListingScreenMode(0);
    }

    function onCloseListing() {
        setListingScreenMode(0);
    }

    function onListingSelectType(event) {
        lastAddedType = event.target.value;
    }

    function onApplyFilters() {
        setListingScreenMode(0);
        setFilter(lastFilteredType);
    }

    function setLastFilteredType(event) {
        lastFilteredType = event.target.value;
    }

    function getAllListings(){
      axios.get('/api/getAllListings')
      .then((response) => {
        setMarkers(response.data.dbMarkers);
      })
    }

    return <div>
        {/* Shows up at the beginning of the user session to request that they turn on fullscreen */}
        {showRequestFS == false &&
        <RequestFullscreen
            onClick={onRequestFS}
        />}

        {listingScreenMode == 1 &&
        <AddListing
            onClickClose={onCloseAddListing}
            onClickAdd={onAddListing}
            onSelectType={onListingSelectType}
        />}
        {/*}*/}

        {listingScreenMode == 2 &&
        <Listing
            emitTaken={emitTaken}
            aid={selectedMarker.id}
            name={selectedMarker.name}
            descText={selectedMarker.desc}
            closeFunc={onCloseListing}
        />}

        {listingScreenMode == 3 &&
        <Filters
            onClickClose={() => {setListingScreenMode(0);}}
            onClickAdd={onApplyFilters}
            onSelectType={setLastFilteredType}
        />}

        <button
            style={{
                position: "absolute",
                zIndex: "3",
                top: "5vh",
                right: "5vh"
            }}
            onClick={() => {setListingScreenMode(3);}}
        >Add Filters</button>

        {/* Add listing button */}
        <HSControl
            onClick={handleAddListing}
            content={<AddListingIcon/>}
            left="5%"
            borderRadius="50%"
        />

        {/* Recenter map button */}
        <HSControl
            onClick={onRecenterMap
    }
            content={<RecenterIcon/>}
            right="5%"
            borderRadius="50%"
            padding="3px 3px 3px 3px"
        />

        {/* Main map */}
        <GoogleMap
            id="HSmap"
            mapContainerStyle={MAP_CONTAINER_STYLE}
            zoom={DEFAULT_ZOOM}
            center={DEFAULT_CENTER}
            options={DEFAULT_OPTIONS}
            onLoad={onMapLoad}
        >
            {markers.map(marker => (filterType == "none" || filterType == marker.type) && <Marker
                key={marker.id}
                position={{lat: marker.lat, lng: marker.lng}}
                onClick={() => {
                    setSelected(marker);
                    setListingScreenMode(2);
                }}
            />)}
        </GoogleMap>
    </div>
}