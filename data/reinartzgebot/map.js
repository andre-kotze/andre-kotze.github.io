Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZmFkYTY0My1mM2E1LTQ5NjctODRiOC05MmM3M2NkYmFjMTUiLCJpZCI6MTQwNjI4LCJpYXQiOjE2ODQ3ODgxMzN9.AC9hT6lu2yQLppnxOhkBWEToPtD8qfvC9kd-mQvR5zU';
// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    baseLayerPicker: false,
    timeline: false,
    animation: false
});
const scene = viewer.scene;
const globe = scene.globe;
globe.terrainExaggeration = 2.0;

var imageryLayers = viewer.imageryLayers;

const viewModel = {
    layers: [],
    baseLayers: [],
    upLayer: null,
    downLayer: null,
    selectedLayer: null,
    isSelectableLayer: function (layer) {
        return this.baseLayers.indexOf(layer) >= 0;
    },
    raise: function (layer, index) {
        imageryLayers.raise(layer);
        viewModel.upLayer = layer;
        viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
        updateLayerList();
        window.setTimeout(function () {
            viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    lower: function (layer, index) {
        imageryLayers.lower(layer);
        viewModel.upLayer =
            viewModel.layers[
            Math.min(viewModel.layers.length - 1, index + 1)
            ];
        viewModel.downLayer = layer;
        updateLayerList();
        window.setTimeout(function () {
            viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    canRaise: function (layerIndex) {
        return layerIndex > 0;
    },
    canLower: function (layerIndex) {
        return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
    },
    exaggeration: globe.terrainExaggeration,
};
const baseLayers = viewModel.baseLayers;

Cesium.knockout.track(viewModel);

function setupLayers() {
    // Create base layers!!!
    addBaseLayerOption(
        "Bing Maps Aerial",
        Cesium.createWorldImageryAsync()
    );
    addBaseLayerOption(
        "Bing Maps Road",
        Cesium.createWorldImageryAsync({
            style: Cesium.IonWorldImageryStyle.ROAD,
        })
    );
    addBaseLayerOption(
        "ArcGIS World Street Map",
        Cesium.ArcGisMapServerImageryProvider.fromUrl(
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
        )
    );
    addBaseLayerOption(
        "OpenStreetMap",
        new Cesium.OpenStreetMapImageryProvider()
    );
    addBaseLayerOption(
        "OpenTopoMap",
        new Cesium.OpenStreetMapImageryProvider("https://tile.opentopomap.org")
    );
    addBaseLayerOption(
        "Stamen Watercolor",
        Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl("https://tiles.stadiamaps.com/tiles/stamen_watercolor")
            //maxZoom: 20,
            //credit:
            //    "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
        )
    );
    addBaseLayerOption(
        "Natural Earth II (local)",
        Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII")
        )
    );
    //addBaseLayerOption(
    //    "USGS Shaded Relief (via WMTS)",
    //    new Cesium.WebMapTileServiceImageryProvider({
    //    url:
    //        "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS",
    //    layer: "USGSShadedReliefOnly",
    //    style: "default",
    //    format: "image/jpeg",
    //    tileMatrixSetID: "default028mm",
    //    maximumLevel: 19,
    //    credit: "U. S. Geological Survey",
    //    })
    //);

    // Create additional layers, ja!!!
    addAdditionalLayerOption(
        "CORINE Land Cover 2018",
        Cesium.ArcGisMapServerImageryProvider.fromUrl(
            "https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_WM/MapServer"
        )
    );
    addAdditionalLayerOption(
        "CORINE Land Cover WMS (no use, no work!!!)",
        new Cesium.WebMapServiceImageryProvider({
            url:
                "https://image.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer?",
            layers: "1",
            credit: "CORINE",
            parameters: {
                transparent: "true",
                format: "image/png",
            },
        })
    );
    //addAdditionalLayerOption(
    //    "TileMapService Image",
    //    Cesium.TileMapServiceImageryProvider.fromUrl(
    //    "../images/cesium_maptiler/Cesium_Logo_Color"
    //    ),
    //    0.2
    //);
    //addAdditionalLayerOption(
    //    "Single Image",
    //    Cesium.SingleTileImageryProvider.fromUrl(
    //    "../images/Cesium_Logo_overlay.png",
    //    {
    //        rectangle: Cesium.Rectangle.fromDegrees(
    //        -115.0,
    //        38.0,
    //        -107,
    //        39.75
    //        ),
    //    }
    //    ),
    //    1.0
    //);
    addAdditionalLayerOption(
        "Grid",
        new Cesium.GridImageryProvider(),
        1.0,
        false
    );
}

async function addBaseLayerOption(name, imageryProviderPromise) {
    try {
        const imageryProvider = await Promise.resolve(
            imageryProviderPromise
        );

        const layer = new Cesium.ImageryLayer(imageryProvider);
        layer.name = name;
        baseLayers.push(layer);
        updateLayerList();
    } catch (error) {
        console.error(
            `There was an error while creating ${name}. ${error}`
        );
    }
}

async function addAdditionalLayerOption(
    name,
    imageryProviderPromise,
    alpha,
    show
) {
    try {
        const imageryProvider = await Promise.resolve(
            imageryProviderPromise
        );
        const layer = new Cesium.ImageryLayer(imageryProvider);
        layer.alpha = Cesium.defaultValue(alpha, 0.5);
        layer.show = Cesium.defaultValue(show, true);
        layer.name = name;
        imageryLayers.add(layer);
        Cesium.knockout.track(layer, ["alpha", "show", "name"]);
        updateLayerList();
    } catch (error) {
        console.error(
            `There was an error while creating ${name}. ${error}`
        );
    }
}

function updateLayerList() {
    const numLayers = imageryLayers.length;
    viewModel.layers.splice(0, viewModel.layers.length);
    for (let i = numLayers - 1; i >= 0; --i) {
        viewModel.layers.push(imageryLayers.get(i));
    }
}

setupLayers();

//Bind the viewModel to the DOM elements of the UI that call for it.
const toolbar = document.getElementById("LayersToolbar");
Cesium.knockout.applyBindings(viewModel, toolbar);

Cesium.knockout
    .getObservable(viewModel, "selectedLayer")
    .subscribe(function (baseLayer) {
        // Handle changes to the drop-down base layer selector.
        let activeLayerIndex = 0;
        const numLayers = viewModel.layers.length;
        for (let i = 0; i < numLayers; ++i) {
            if (viewModel.isSelectableLayer(viewModel.layers[i])) {
                activeLayerIndex = i;
                break;
            }
        }
        const activeLayer = viewModel.layers[activeLayerIndex];
        const show = activeLayer.show;
        const alpha = activeLayer.alpha;
        imageryLayers.remove(activeLayer, false);
        imageryLayers.add(baseLayer, numLayers - activeLayerIndex - 1);
        baseLayer.show = show;
        baseLayer.alpha = alpha;
        updateLayerList();
        globe.terrainExaggeration = Number(viewModel.exaggeration);
    });

styleDict = {
    "Gewalttour 2023": Cesium.Color.MAROON,
    "Bodensee_Koenigssee_Radweg": Cesium.Color.INDIGO,
    "Donau": Cesium.Color.RED,
    "Kattegattleden Helsingborg - Göteborg": Cesium.Color.GREEN,
    "Rheinradweg": Cesium.Color.DARKSLATEGREY
}

//viewer.scene.globe.depthTestAgainstTerrain = true;
Cesium.GeoJsonDataSource.clampToGround = true;
function startTripping(){
    const promise = Cesium.GeoJsonDataSource.load('tracks5.geojson');
    promise
        .then(function (tracks) {
            viewer.dataSources.add(tracks);
            const entities = tracks.entities.values;
            entities.forEach(function (entity) {
                const name = entity.name;
                const colour = styleDict[name];
                entity.polyline.width = 5;
                entity.polyline.material = new Cesium.PolylineOutlineMaterialProperty({
                    color: colour,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.BLACK,
                  })
            })
        })
        .catch(function(error){
            console.error("General Error")
            window.alert(error)
        })
    return promise
};

viewer.camera.lookAt(
    Cesium.Cartesian3.fromDegrees(-10.0, 48.4),
    new Cesium.Cartesian3(0.0, -4790000.0, 3930000.0)
);
viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

tracks = startTripping();
viewer.zoomTo(tracks);

imgCZML = [
    {
      id: "document",
      name: "CZML Rectangle",
      version: "1.0",
    },
    {
    id: "textureRectangle",
    name: "hallo hond",
    rectangle: {
      coordinates: {
        wsenDegrees: [125, -60, -125, 60],
      },
      //height: 600000,
      fill: true,
      material: {
        image: {
          image: { uri: "hoerhond.png" },
          color: {
            rgba: [255, 255, 255, 196],//[255, 255, 255, 128]
          },
        },
      },
    },
  }]
const dataSourcePromise = Cesium.CzmlDataSource.load(imgCZML);
viewer.dataSources.add(dataSourcePromise);