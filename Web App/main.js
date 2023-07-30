window.onload = init;
function init(){

  /////////// Colors and Interval Marks
  var colorMap = ['rgba(239, 40, 32, 0.8)',
  'rgba(246, 113, 47, 0.8)',
  'rgba(249, 162, 72, 0.8)',
  'rgba(241, 251, 124, 0.8)',
  'rgba(207, 228, 150, 0.8)',
  'rgba(170, 205, 171, 0.8)',
  'rgba(127, 183, 190, 0.8)',
  'rgba(56, 161, 208, 0.8)'];

  var marks = [38,35,32,29,27,25,23,12]

  /////////// Layers
  // Vector Layers - Hexagons
  var hex= new ol.layer.Vector({
    title: "Hexagons",
    source: new ol.source.Vector({
      url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Hexagons_Salzburg_10.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: function(feature) {
      return styleFunction(feature,'s_mean_18');
    }
  })

  // Raster Layers - Composites
  var lst_style = {
    color: [
      'interpolate',
      ['linear'],
      ['band', 1],
    ],
  };
  
  for (let i = 0; i < marks.length; i++) {
    lst_style.color.push(marks[i]);
    lst_style.color.push(colorMap[i]);
  }
  
  var lst = new ol.layer.WebGLTile({
    style: lst_style,
    title: 'Median Annual Composite',
    source: new ol.source.GeoTIFF({
      normalize: false,
      sources: [
        {
          url: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_18_Masked_cog.tif',
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
  var styleFunction = function(feature, field) {
    var value = feature.get(field);
    var style;
    for (var i = 0; i < marks.length; i++) {
      if (value <= marks[i]) {
        style = new ol.style.Style({
          fill: new ol.style.Fill({
            color: colorMap[i]
          }),
          stroke: new ol.style.Stroke({

            color: '#6e6e6e',
            width: 0.7
          })
        });
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
          's_mean_18': { title: 'Mean LST (°C)' }
        }
    }
  });
  map.addOverlay (popup);

  /////////// Swipe Control
  var ctrl_swipe = new ol.control.Swipe();
  map.addControl(ctrl_swipe);
  // Left
  ctrl_swipe.addLayer(lst);
  // Right
  ctrl_swipe.addLayer(hex,true);
    map.addControl (new ol.control.LayerSwitcher());

  /////////// Basemap Switcher
   var layerSwitcher = new LayerSwitcher({
    activationMode: 'click',
    groupSelectStyle: 'children'
  });
  map.addControl(layerSwitcher);

  /////////// Extent Control
  var extent = [12.952366079558944, 47.7148606236224, 13.099233920441057, 47.927939376377594];
  var ctrl_extent = new ol.control.ZoomToExtent({
    extent: extent,
  });
    map.addControl(ctrl_extent);

  /////////// Legend
  var legend = new ol.legend.Legend({ 
    maxWidth: 200
  });
  var legendCtrl = new ol.control.Legend({
    legend: legend,
    collapsed: true
  });
  map.addControl(legendCtrl);
  
  var imageItem = new ol.legend.Image({
    src: 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Legend_Salzburg.jpg',
    width: 200
  });
  legend.addItem(imageItem);

  /////////// Year Selection
  var yearDropdown = document.getElementById('yearDropdown');
  yearDropdown.addEventListener('change', function() {
    var selectedYear = yearDropdown.value;
    updateLayers_Year(selectedYear);
  });

  function updateLayers_Year(selectedYear) {
    // Update the source URL of the raster layer
    var newUrl = 'https://ecostress.s3.eu-central-1.amazonaws.com/summer/Median_Salzburg_Summer_' + selectedYear + '_Masked_cog.tif';
    var newSource = new ol.source.GeoTIFF({
      normalize: false,
      sources: [
        {
          url: newUrl,
        },
      ],
    });
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

  /////////// Bookmark
  var bm = new ol.control.GeoBookmark({	
    marks: {
      'Salzburg Airport': {pos:[13.0025976,  47.7935844], projection: "EPSG:4326", zoom:18, permanent: true },
      'Salzburg Hauptbahnhof': {pos:[13.0478668,  47.8163289], projection: "EPSG:4326", zoom:18, permanent: true },
      'Salzach River - North': {pos:[12.9899677,  47.8662063], projection: "EPSG:4326", zoom:18, permanent: true },
      'Kapuzinerberg': {pos:[13.0577319,  47.8042712], projection: "EPSG:4326", zoom:18, permanent: true },
      'Freilassing': {pos:[12.9750304, 47.8427681], projection: "EPSG:4326", zoom:15, permanent: true }
    },
    editable: false
  });
  map.addControl(bm);

  /////////// Search
  var searchNominatim = new ol.control.SearchNominatim (
    {   //target: $(".options").get(0),
    //  polygon: $("#polygon").prop("checked"),
        reverse: true,
        position: true, // Search, with priority to geo position
    });
  var requestData = searchNominatim.requestData.bind(searchNominatim);
  searchNominatim.requestData = function (s) {
      var data = requestData(s);
      data.countrycodes = '43,662';
      return data;
  };
  map.addControl (searchNominatim);
};
