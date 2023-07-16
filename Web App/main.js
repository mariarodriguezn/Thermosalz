window.onload = init;
function init(){

  // Map Creation with Layer Groups
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Group({
        title: 'Basemaps',
        fold: 'open',
        layers: [
          new ol.layer.WebGLTile({
            title: 'OSM Standard',
            type: 'base',
            visible: true,
            source: new ol.source.OSM()
          }),
          new ol.layer.WebGLTile({
            title: 'Esri World Imagery',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            })
          })
        ]
      }),
      new ol.layer.Group({
        title: 'Rasters',
        fold: 'open',
        layers: [
          new ol.layer.WebGLTile({
            title: "Anual Median Composite Summer 2018",
            visible: false,
            source: new ol.source.GeoTIFF({
              sources: [
                {
                  url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_18_Masked_cog.tif',
                },
              ],
            }) 
          }),
          new ol.layer.WebGLTile({
            title: "Anual Median Composite Summer 2019",
            visible: false,
            source: new ol.source.GeoTIFF({
              sources: [
                {
                  url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_19_Masked_cog.tif',
                },
              ],
            }) 
          }),
          new ol.layer.WebGLTile({
            title: "Anual Median Composite Summer 2020",
            visible: false,
            source: new ol.source.GeoTIFF({
              sources: [
                {
                  url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_20_Masked_cog.tif',
                },
              ],
            }) 
          }),
          new ol.layer.WebGLTile({
            title: "Anual Median Composite Summer 2021",
            visible: false,
            source: new ol.source.GeoTIFF({
              sources: [
                {
                  url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_21_Masked_cog.tif',
                },
              ],
            }) 
          }),
          new ol.layer.WebGLTile({
            title: "Anual Median Composite Summer 2022",
            source: new ol.source.GeoTIFF({
              sources: [
                {
                  url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_22_Masked_cog.tif',
                },
              ],
            }) 
          })
        ]
      }),
      new ol.layer.Group({
        title: 'Hexagons',
        fold: 'open',
        layers: [
          new ol.layer.Vector({
            title: "Hexagons Summer 2018",
            visible: false,
            source: new ol.source.Vector({
              url: "https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_20000.geojson",
              format: new ol.format.GeoJSON()
            }),
            style: function(feature) {
              return graduatedStyle(feature, 's_mean_2018');
            }
          }),
          new ol.layer.Vector({
            title: "Hexagons Summer 2019",
            visible: false,
            source: new ol.source.Vector({
              url: "https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_20000.geojson",
              format: new ol.format.GeoJSON()
            }),
            style: function(feature) {
              return graduatedStyle(feature, 's_mean_2019');
            }
          }),
          new ol.layer.Vector({
            title: "Hexagons Summer 2020",
            visible: false,
            source: new ol.source.Vector({
              url: "https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_20000.geojson",
              format: new ol.format.GeoJSON()
            }),
            style: function(feature) {
              return graduatedStyle(feature, 's_mean_2020');
            }
          }),
          new ol.layer.Vector({
            title: "Hexagons Summer 2021",
            visible: false,
            source: new ol.source.Vector({
              url: "https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_20000.geojson",
              format: new ol.format.GeoJSON()
            }),
            style: function(feature) {
              return graduatedStyle(feature, 's_mean_2021');
            }
          }),
          new ol.layer.Vector({
            title: "Hexagons Summer 2022",
            visible: true,
            source: new ol.source.Vector({
              url: "https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_20000.geojson",
              format: new ol.format.GeoJSON()
            }),
            style: function(feature) {
              return graduatedStyle(feature, 's_mean_2022');
            }
          })
        ]
      })    
    ],
    view: new ol.View({
      center: [13.0258, 47.8214],
      projection: "EPSG:4326",
      zoom: 12.5,
      maxZoom: 16,
      minZoom:11
    })
  });

  // Layer Switcher for layers management
  var layerSwitcher = new LayerSwitcher({
    activationMode: 'click',
    groupSelectStyle: 'children'
  });
  map.addControl(layerSwitcher);

  // Initial Hexagons Style
  var gradColors = [  [9, 'rgb(12, 9, 119, 0.9)'],
  [22, 'rgb(57, 10, 131, 0.9)'],
  [25, 'rgb(102, 14, 142, 0.9)'],
  [27, 'rgb(142, 42, 135, 0.9)'],
  [28, 'rgb(182, 78, 110, 0.9)'],
  [30, 'rgb(215, 117, 85, 0.9)'],
  [31, 'rgb(241, 160, 63, 0.9)'],
  [35, 'rgb(252, 205, 52, 0.9)']
  ];

  var graduatedStyle = function graduatedColor(feature,field) {
    var mean = feature.get(field);
    var color = gradColors[0][1];
    for (var i = 0; i < gradColors.length; i++) {
      if (mean > gradColors[i][0]) {
        color = gradColors[i][1];
      }
    } 
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: color,
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(30, 30, 30, 0.2)',
        width: 2,
      }),
    });
  }

  // Hexagons Style when hover over
  var highlightedStyle = function highlightColor(feature, field) {
    var mean = feature.get(field);
    var color = gradColors[0][1];
    for (var i = 0; i < gradColors.length; i++) {
      if (mean > gradColors[i][0]) {
        color = gradColors[i][1];
      }
    }
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: color,
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(30, 30, 30, 0.9)',
        width: 4,
      }),
    });
  }

  // Pop Up when clicking Hexagons
  const overlayContainerElement = document.querySelector('.overlay-container');
  const overlayLayer = new ol.Overlay({
    element: overlayContainerElement,
  });
  map.addOverlay(overlayLayer);

  const overlayFeatureGrid = document.getElementById('feature-grid');
  const overlayFeatureMean = document.getElementById('feature-mean');

  map.on('click', function(e){
    overlayLayer.setPosition(undefined)
    map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
      const layerName = layer.get('title');
      const year = layerName.substr(-4);
      const clickedCoordinate = e.coordinate;
      const clickedFeatureGrid = 'Mean LST (°C)';
      const clickedFeatureMean = feature.get(`s_mean_${year}`);

      overlayLayer.setPosition(clickedCoordinate);
      overlayFeatureGrid.innerHTML = clickedFeatureGrid;
      overlayFeatureMean.innerHTML = clickedFeatureMean;
    },
    {
      layerFilter: function(layer){
        const layerName = layer.get('title');
        const visible = layer.getVisible();
        return layerName && layerName.startsWith("Hexagons")&& visible;
      }
    })
  })

  // Click over Hexagons
  var highlightedFeature = null;

  map.on('click', function(e) {
    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);

    if (hit) {
      map.getTargetElement().style.cursor = 'pointer';

      var result = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        const layerName = layer.get('title');
        const visible = layer.getVisible();
        if (layerName && layerName.startsWith("Hexagons")&& visible) {
          return { feature: feature, layer: layer };
        }
      });

      if (result && result.feature !== highlightedFeature) {
        if (highlightedFeature) {
          highlightedFeature.setStyle(highlightedFeature.getStyle()[0]);
        }
        const layerName = result.layer.get('title');
        const year = layerName.substr(-4);
        result.feature.setStyle(highlightedStyle(result.feature, 's_mean_'+year));
        highlightedFeature = result.feature;
      }
    } else {
      map.getTargetElement().style.cursor = '';
      if (highlightedFeature) {
        highlightedFeature.setStyle(highlightedFeature.getStyle()[0]);
        highlightedFeature = null;
      }
    }
  });
}
