window.onload = init;
function init(){

  /////////// Colors
  var colorMap = ['rgba(239, 40, 32, 0.55)', 'rgba(249, 162, 72, 0.55)', 'rgba(241, 251, 124, 0.55)', 'rgba(170, 205, 171, 0.55)', 'rgba(56, 161, 208, 0.55)'];

  /////////// Layers
  // Vector Layers - Hexagons
  var hex= new ol.layer.Vector({
    title: "Hexagons",
    source: new ol.source.Vector({
      url: "https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_20000.geojson",
      format: new ol.format.GeoJSON()
    }),
    style: function(feature) {
      // Your style logic here
      // Return the appropriate style for each feature
      return styleFunction(feature,'s_mean_2018');
    }
  })

  // Raster Layers - Composites
  const lst_style = {
    color: [
      'interpolate',
      ['linear'],
      (['band', 1]),
      24.74,
      colorMap[4],
      26.72,
      colorMap[3],
      28.43,
      colorMap[2],
      30.37,
      colorMap[1],
      34.5,
      colorMap[0]
    ],
  };

  var lst = new ol.layer.WebGLTile({
    style: lst_style,
    title: 'Median Annual Composite',
    source: new ol.source.GeoTIFF({
      normalize: false,
      sources: [
        {
          url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_20_Masked_cog.tif',
        },
      ],
    }),
  });
  
  // Basemaps
  var osm= new ol.layer.WebGLTile({
    title: 'OSM Standard',
    type: 'base',
    visible:false,
    source: new ol.source.OSM()
  })

  var world_imagery= new ol.layer.WebGLTile({
    title: 'Esri World Imagery',
    type: 'base',
    visible:true,
    source: new ol.source.OSM({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    })
  })

  var basemaps=new ol.layer.Group({
    title: 'Basemaps',
    fold: 'open',
    layers: [osm, world_imagery]
  })

  /////////// Map
  const map = new ol.Map({
    target: 'map',
    layers: [basemaps, hex, lst],
    view: new ol.View({
      center: [13.0258, 47.8214],
      projection: "EPSG:4326",
      zoom: 12.19,
      maxZoom: 16,
      minZoom:11
    })
  });

   /////////// Hexagons Style
   var gradColors = [  [24.74, colorMap[4]],
                    [26.72, colorMap[3] ],
                    [28.43, colorMap[2]],
                    [30.37, colorMap[1]],
                    [34.5, colorMap[0]]];

  // Create a style function
  var styleFunction = function(feature, field) {
  var value = feature.get(field); // Assuming 'mean' is the field name
  var style;

  // Iterate over the gradient colors and find the appropriate style
  for (var i = 0; i < gradColors.length; i++) {
    var pair = gradColors[i];
    var rangeValue = pair[0];
    var color = pair[1];

    if (value <= rangeValue) {
      style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: color
        }),
        stroke: new ol.style.Stroke({
          color: '#6E6E6E' // Add your desired stroke color here
        })
      });
      break;
    }
  }
  return style;
};

  /////////// Pop Up Hexagons
  // Select  interaction
  var select = new ol.interaction.Select({
    hitTolerance: 5,
    multi: false,
    condition: ol.events.condition.singleClick
  });
  map.addInteraction(select);

  // Select control
  var popup = new ol.Overlay.PopupFeature({
    popupClass: 'default anim',
    closeBox: true,
    select: select,
    canFix: false,
    template: {
        //title: function(f) {
          //return 'Mean LST Title';
        //},
        attributes:
        {
          's_mean_2018': { title: 'Mean LST (°C)' }
        }
    }
  });
  map.addOverlay (popup);

  /////////// Swipe Control
  var ctrl_swipe = new ol.control.Swipe();
  map.addControl(ctrl_swipe);
  // Set stamen on left
  ctrl_swipe.addLayer(lst);
  // OSM on right
  ctrl_swipe.addLayer(hex,true);
    map.addControl (new ol.control.LayerSwitcher());

  /////////// Basemap Switcher
   var layerSwitcher = new LayerSwitcher({
    activationMode: 'click',
    groupSelectStyle: 'children'
  });
  map.addControl(layerSwitcher);

  /////////// Extent Control
  var extent =    [12.958251953125, 47.74658203125, 13.0933837890625, 47.896240234375]; // Replace with your desired extent coordinates
  var ctrl_extent = new ol.control.ZoomToExtent({
    extent: extent,
  });
    map.addControl(ctrl_extent);


  /////////// Year Selection
  var yearDropdown = document.getElementById('yearDropdown');
  yearDropdown.addEventListener('change', function() {
    var selectedYear = yearDropdown.value;
    updateLayers(selectedYear);
  });

  function updateLayers(selectedYear) {
    // Update the source URL of the raster layer
    var lastTwoDigits = selectedYear.slice(-2);
    var newUrl = 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_' + lastTwoDigits + '_Masked_cog.tif';
    // Create a new source with the updated URL
    var newSource = new ol.source.GeoTIFF({
      normalize: false,
      sources: [
        {
          url: newUrl,
        },
      ],
    });
    // Set the new source for the lst layer
    lst.setSource(newSource);

    // Update the field name
    var fieldName = 's_mean_' + selectedYear;
    // Update the style function for the hex layer
    hex.setStyle(function(feature) {
    return styleFunction(feature, fieldName);
    });
    // Update the template for the popup
    popup.setTemplate({
    attributes: {
      [fieldName]: { title: 'Mean LST (°C)' }
    }
    });

  }
  

}
