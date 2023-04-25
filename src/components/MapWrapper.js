// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import Overlay from 'ol/Overlay.js';
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import '../index.css';
import OSM from 'ol/source/OSM';
import DragPan from 'ol/interaction/DragPan';
import XYZ from 'ol/source/XYZ'
import { transform, fromLonLat, toLonLat } from 'ol/proj'
import { toStringXY } from 'ol/coordinate';

function MapWrapper(props) {

    // set intial state
    const [map, setMap] = useState()
    const [marker, setMarker] = useState()
    const [featuresLayer, setFeaturesLayer] = useState()
    const [selectedCoord, setSelectedCoord] = useState()

    // pull refs
    const mapElement = useRef()

    // create state ref that can be accessed in OpenLayers onclick callback function
    //  https://stackoverflow.com/a/60643670
    const mapRef = useRef()
    mapRef.current = map;

    // initialize map on first render - logic formerly put into componentDidMount
    useEffect(() => {

        var viewport = document.querySelector('.ol-viewport');

        if (!viewport) {
            var marker_el = document.getElementById('marker');

            // create and add vector source layer
            const initalFeaturesLayer = new VectorLayer({
                source: new VectorSource()
            })

            const onChange = props.onChange || (() => { });

            var initialLocation = fromLonLat(props.location);

            // create map
            const initialMap = new Map({
                target: mapElement.current,
                layers: [

                    // USGS Topo
                    new TileLayer({
                        source: new OSM()/*,
                    source: new XYZ({
                        url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                    })*/
                    }),

                    // Google Maps Terrain
                    /* new TileLayer({
                      source: new XYZ({
                        url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
                      })
                    }), */

                    initalFeaturesLayer
                ],
                view: new View({
                    // projection: 'EPSG:3857',
                    center: initialLocation,
                    zoom: 18
                }),
                controls: []
            })

            var marker_el = document.getElementById('marker');
            const marker = new Overlay({
                location: initialLocation,
                positioning: 'center-center',
                element: marker_el,
                stopEvent: false,
                dragging: true,
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
            });

            setMarker(marker);

            var dragPan;
            initialMap.getInteractions().forEach(function (interaction) {
                if (interaction instanceof DragPan) {
                    dragPan = interaction;
                }
            });

            marker_el.addEventListener('mousedown', function (evt) {
                dragPan.setActive(false);
                marker.set('dragging', true);
            });

            initialMap.on('pointermove', function (evt) {
                if (marker.get('dragging') === true) {
                    marker.setPosition(evt.coordinate);
                }
            });
            let getInfo = async (coordinate) => {
                const lonLat = toLonLat(coordinate);
                const transormedCoord = transform(coordinate, 'EPSG:3857', 'EPSG:4326')
                setSelectedCoord(transormedCoord);
                let address = await simpleReverseGeocoding(lonLat[0], lonLat[1]);
                return { lonLat: lonLat, address: address.display_name };
            }
            initialMap.on('pointerup', async (evt) => {
                if (marker.get('dragging') === true) {
                    dragPan.setActive(true);
                    marker.set('dragging', false);
                    onChange(await getInfo(evt.coordinate))
                    //popup.show(evt.coordinate,'Latitude :'+evt.coordinate[0]+', Longitude :'+ evt.coordinate[1]);
                }
            });
            initialMap.on('click', async (evt) => {
                marker.setPosition(evt.coordinate);
                onChange(await getInfo(evt.coordinate));
                //marker.set('dragging', false);
            });

            initialMap.addOverlay(marker);
            // save map and vector layer references to state
            setMap(initialMap)
            setFeaturesLayer(initalFeaturesLayer)
        }
    }, [])

    useEffect(() => {
        if (marker && props.location) {
            marker.setPosition(fromLonLat(props.location));
            console.log(props.location);
        }
    }, [props.location])

    // update map if features prop changes - logic formerly put into componentDidUpdate
    useEffect(() => {

        if (props.features.length) { // may be null on first render

            // set features to map
            featuresLayer.setSource(
                new VectorSource({
                    features: props.features // make sure features is an array
                })
            )

            // fit map to feature extent (with 100px of padding)
            map.getView().fit(featuresLayer.getSource().getExtent(), {
                padding: [100, 100, 100, 100]
            })

        }

    }, [props.features])

    async function simpleReverseGeocoding(lon, lat) {
        let data = await fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat)
        return data.json();
    }

    // render component
    return (
        <div>
            <div style={{ height: 200 }} ref={mapElement} className="map-container"></div>
            <div className="clicked-coord-label">
                <p>{(selectedCoord) ? toStringXY(selectedCoord, 5) : ''}</p>
            </div>
            <div id="marker" title="Marker"></div>
            <div id="popup" className="ol-popup">
                <a href="#" id="popup-closer" className="ol-popup-closer"></a>
                <div id="popup-content"></div>
            </div>
        </div>
    )
}

export default MapWrapper