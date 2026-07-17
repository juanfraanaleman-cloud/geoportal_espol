/** @type {typeof import('ol')} */
// EL PUERTO DEL SERVER ES 5500, NO 8080
const source = "http://200.126.24.171:8080" // Puede ser ip (poner la ip actualizada) o https://localhost:8080


// Coordenadas de puntos del lindero obtenido con Google Maps y transformado a coordenadas GeoJSON con Mapshaper
var lindero_geom = new ol.geom.Polygon([[
    [-79.982435,-2.151406],[-79.982385,-2.147952],[-79.981731,-2.144858],[-79.981156,-2.144333],[-79.968392,-2.13964],[-79.968154,-2.139688],[-79.9674006,-2.1395158],[-79.961451,-2.137411],[-79.9586325,-2.1367511],[-79.955032,-2.136118],[-79.952349,-2.135548],[-79.949207,-2.134686],[-79.947943,-2.1346],[-79.947656,-2.134801],[-79.94661,-2.138208],[-79.947179,-2.139331],[-79.947154,-2.139921],[-79.9469689,-2.1412942],[-79.94705,-2.142129],[-79.946844,-2.142172],[-79.946819,-2.142066],[-79.946667,-2.141856],[-79.946437,-2.141763],[-79.946128,-2.141857],[-79.946136,-2.1442279],[-79.946155,-2.145537],[-79.946202,-2.147717],[-79.946441,-2.14965],[-79.948978,-2.150719],[-79.949852,-2.151076],[-79.951259,-2.151611],[-79.952622,-2.152254],[-79.952839,-2.152379],[-79.954163,-2.152894],[-79.954186,-2.152878],[-79.955498,-2.153403],[-79.956497,-2.153757],[-79.958846,-2.154693],[-79.962863,-2.156287],[-79.967174,-2.157574],[-79.9704073,-2.1547897],[-79.975341,-2.152406],[-79.97591,-2.153082],[-79.977137,-2.153758],[-79.980967,-2.153143],[-79.982435,-2.151406] 
]]);

lindero_geom.transform('EPSG:4326', 'EPSG:3857'); 

const fillStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'black' // No importa el color, funciona como opacity mask
  })
});

// Color del borde del basemap
const borderStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: '#1d1b1c',
    width: 3,         // Grosor en pixeles
  })
});


const lindero_Feature = new ol.Feature({
  geometry: lindero_geom,
  name: 'Lindero',
  status: 'Active' // You can attach custom attributes here just like in PostgreSQL!
});

// 4. Create an empty Vector Source and add your JavaScript feature into it
const lindero_localVectorSource = new ol.source.Vector({
  features: [lindero_Feature] // You can add multiple features inside this array separated by commas
});

// 5. Apply your custom styling
const lindero_vectorStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: '#141313',
    width: 3,
  }),
});

// 6. Define the final layer and attach it to your main map instance
const lindero = new ol.layer.Vector({
  source: lindero_localVectorSource,
  style: lindero_vectorStyle
});








var basemap = new ol.layer.Tile({
  // type: 'base',
  visible: true,
  source: new ol.source.XYZ({
    url: 'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  //source: new ol.source.OSM(),
  //className: 'clipped-basemap-canvas',
})
});

/*basemap.on('postrender', (event) => {
  const vectorContext = ol.render.getVectorContext(event);
  const ctx = event.context;


  ctx.globalCompositeOperation = 'destination-in';
  

  vectorContext.setStyle(fillStyle);
  vectorContext.drawGeometry(lindero);
  

  ctx.globalCompositeOperation = 'source-over';

  vectorContext.setStyle(borderStyle);
  vectorContext.drawGeometry(lindero);
});*/

// Con la capa poligonos se puede hacer que todo un subgrupo tenga el mismo estilo. No debe tener título
/*
const poligonos = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:pg_polig_espol, gis_espol:pg_puntos_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      'STYLES': 'gis_espol:poligonos_grupo, ',
      'CQL_FILTER': "propietario IS NOT NULL; propietario IS NOT NULL",
      //'SRS': 'EPSG:3857'     // Proyecta el layer de 4326 (original) a 3857 (mapa base)
    },
    //crossOrigin: null       // No es necesario null porque se quitó el comentario 'cross origin' en el código base de Geoserver (Program Files\Apache Software Foundation\Tomcat 10.1\webapps\geoserver\WEB-INF\web.xml)
  }),
  visible: false, 
  projection: 'EPSG:4326'
});
*/

const poligonosStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({ 
    color: '#17191a', 
    width: 2 
  })
});


const poligonos = new ol.layer.Vector({
  source: new ol.source.Vector({ url: './capas/lin_espol.geojson', format: new ol.format.GeoJSON() }),
  title: 'Edificaciones',
  visible: false,
  style: function(feature) {
    const attributeValue = feature.get('name'); 
    if (attributeValue && attributeValue.toLowerCase().includes('via')) {
      return viaStyle;
    } else {
      return null; 
    }
  }
});



// Filtrar solo los edificios espol
/*
const polig_espol = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:pg_polig_espol, gis_espol:pg_puntos_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      //'STYLES': 'gis_espol:poligonos_grupo, ',
      'CQL_FILTER': "propietario = 'ESPOL'; propietario = 'ESPOL'",  // Filtro por columna en cada capa
      //'SRS': 'EPSG:3857'     // Proyecta el layer de 4326 (original) a 3857 (mapa base)
    },
    //crossOrigin: null       // No es necesario null porque se quitó el comentario 'cross origin' en el código base de Geoserver (Program Files\Apache Software Foundation\Tomcat 10.1\webapps\geoserver\WEB-INF\web.xml)
  }),
  title: 'ESPOL',
  visible: false, 
  projection: 'EPSG:4326'
});
*/


const polig_espolStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(47, 49, 51, 0.9)'    // El 0.5 se refiere a la opacidad
  }),
  stroke: new ol.style.Stroke({ 
    color: '#17191a', 
    width: 2 
  })
});


const polig_espol= new ol.layer.Vector({
  title: 'ESPOL',
  source: new ol.source.Vector({ url: './capas/polig_espol.geojson', format: new ol.format.GeoJSON() }),
  visible: false,
  style: function(feature) {
    const attributeValue = feature.get('propietario'); 
    if (attributeValue && attributeValue.toLowerCase().includes('espol')) {  // debe estar en minúsculas
      return polig_espolStyle;
    } else {
      return null; 
    }
  }
});




// Filtrar solo los edificios comodato
/*
const polig_comodato = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:pg_polig_espol, gis_espol:pg_puntos_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      'CQL_FILTER': "propietario = 'COMODATO'; propietario = 'COMODATO'",
      //'SRS': 'EPSG:3857'     // Proyecta el layer de 4326 (original) a 3857 (mapa base)
    },
    //crossOrigin: null       // No es necesario null porque se quitó el comentario 'cross origin' en el código base de Geoserver (Program Files\Apache Software Foundation\Tomcat 10.1\webapps\geoserver\WEB-INF\web.xml)
  }),
  title: 'COMODATO',
  visible: false, 
  projection: 'EPSG:4326'
});
*/

const polig_comodatoStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(47, 49, 51, 0.9)' 
  }),
  stroke: new ol.style.Stroke({ 
    color: '#17191a', 
    width: 2 
  })
});


const polig_comodato = new ol.layer.Vector({
  source: new ol.source.Vector({ url: './capas/polig_espol.geojson', format: new ol.format.GeoJSON() }),
  title: 'COMODATO',
  visible: false,
  style: function(feature) {
    const attributeValue = feature.get('propietario'); 
    if (attributeValue && attributeValue.toLowerCase().includes('comodato')) {  // debe estar en minúsculas
      return polig_comodatoStyle;
    } else {
      return null; 
    }
  }
});




// Filtrar solo los edificios arriendo
/*
const polig_arriendo = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:pg_polig_espol, gis_espol:pg_puntos_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      'CQL_FILTER': "propietario = 'ARRIENDO'; propietario = 'ARRIENDO'",
      //'SRS': 'EPSG:3857'     // Proyecta el layer de 4326 (original) a 3857 (mapa base)
    },
    //crossOrigin: null       // No es necesario null porque se quitó el comentario 'cross origin' en el código base de Geoserver (Program Files\Apache Software Foundation\Tomcat 10.1\webapps\geoserver\WEB-INF\web.xml)
  }),
  title: 'ARRIENDO',
  visible: false, 
  projection: 'EPSG:4326'
});
*/

const polig_arriendoStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(47, 49, 51, 0.9)' 
  }),
  stroke: new ol.style.Stroke({ 
    color: '#17191a', 
    width: 2 
  })
});


const polig_arriendo = new ol.layer.Vector({
  source: new ol.source.Vector({ url: './capas/polig_espol.geojson', format: new ol.format.GeoJSON() }),
  title: 'ARRIENDO',
  visible: false,
  style: function(feature) {
    const attributeValue = feature.get('propietario'); 
    if (attributeValue && attributeValue.toLowerCase().includes('arriendo')) {  // debe estar en minúsculas
      return polig_arriendoStyle;
    } else {
      return null; 
    }
  }
});




/*
const puntos = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:pg_puntos_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      //'SRS': 'EPSG:3857'
    },
    //crossOrigin: null,
    projection: 'EPSG:4326'
  }),
});
*/


const puntosStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 3, // Controls the size of the point in pixels
    fill: new ol.style.Fill({
      color: 'rgba(47, 49, 51, 0.9)' 
    }),
    stroke: new ol.style.Stroke({ 
      color: '#17191a', 
      width: 1 
    })
  })
});


const puntos_espol = new ol.layer.Vector({
  source: new ol.source.Vector({ url: './capas/puntos_espol.geojson', format: new ol.format.GeoJSON() }),
  visible: false,
  style: function(feature) {
    const attributeValue = feature.get('propietario'); 
    if (attributeValue && attributeValue.toLowerCase().includes('espol')) {  // debe estar en minúsculas



      const codigo = feature.get('name') || '';
      const codigoAnterior = feature.get('cod_anterior') || '';

      let labelText = codigo; 
      
      if (codigoAnterior) {
        labelText += `\nantes ${codigoAnterior}`;
      }

      puntosStyle.getText().setText(labelText);
      return puntosStyle;
    } else {
      return null; 
    }
  }
});


polig_espol.on('change:visible', () => {
  const isVisible = polig_espol.getVisible();
  puntos_espol.setVisible(isVisible);
});


// No es necesario utilizarias las layer line para edificaciones
/*const edificaciones = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:pg_lin_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      //'SRS': 'EPSG:3857'
    },
    //crossOrigin: null
  }),
  visible: false, 
  projection: 'EPSG:4326',
});
*/

// poligonos debe estar al final
const edificaciones = new ol.layer.Group({
  title: 'Edificaciones',
  layers: [polig_arriendo, polig_comodato, polig_espol, puntos_espol],
  fold: 'close',
});


/*const viasespol = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:vias_espol', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      //'SRS': 'EPSG:3857'
    },
    //crossOrigin: null
  }),
  title: 'Vías Espol',
  visible: false, 
  projection: 'EPSG:4326',
});
*/

const viaStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({ 
    color: '#17191a', 
    width: 2 
  })
});


const viasespol = new ol.layer.Vector({
  source: new ol.source.Vector({ url: './capas/lin_espol.geojson', format: new ol.format.GeoJSON() }),
  title: 'Vías Espol',
  visible: false,
  style: function(feature) {
    const attributeValue = feature.get('name'); 
    if (attributeValue && attributeValue.toLowerCase().includes('via')) {
      return viaStyle;
    } else {
      return null; 
    }
  }
});


/*
var lindero = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: source + '/geoserver/gis_espol/wms',
    params: {
      'LAYERS': 'gis_espol:lindero', 
      'TILED': true,                        
      'FORMAT': 'image/png',
      //'SRS': 'EPSG:3857'
    },
    //crossOrigin: null
  }),
  visible: true,
  projection: 'EPSG:4326',
});
*/

const infraestructura = new ol.layer.Group({
  title: 'Infraestructuras',
  layers: [edificaciones],
  fold: 'close',
});

const vias = new ol.layer.Group({
  title: 'Vías',
  layers: [viasespol],
  fold: 'close'
});



/*
edificaciones.on('change:visible', function() {
  const isSubGroupVisible = edificaciones.getVisible();

  if (isSubGroupVisible) {
    console.log("Subgroup checked! Changing to group style...");
    
    // Loop through layers inside the subgroup and apply the GROUP style
    edificaciones.getLayers().forEach(function(layer) {
      if (layer.getSource && layer.getSource().updateParams) {
        layer.getSource().updateParams({
          'STYLES': 'gis_espol:poligonos_espol, ' // 💡 Different style!
        });
      }
    });

  } else {
    console.log("Subgroup unchecked! Reverting layers to default style...");
    
    // Revert layers back to their individual default styles
    edificaciones.getLayers().forEach(function(layer) {
      if (layer.getSource && layer.getSource().updateParams) {
        layer.getSource().updateParams({
          'STYLES': 'gis_espol:formato_color, ' // 💡 Back to default!
        });
      }
    });
  }
});
*/


/*polig_espol.on('change:visible', function() {
  // If the layer is turned on individually (and not because of the subgroup)
  if (activeStatusLayer.getVisible() && edificaciones.getVisible()) {
    activeStatusLayer.getSource().updateParams({
      'STYLES': 'gis_espol:formato_color'
    });
  }
});
*/






const map = new ol.Map(
    {   
        target: "map",
        layers: [
            basemap,
            vias,
            infraestructura,
        ], 
        view: new ol.View({
            center: new ol.proj.fromLonLat([-79.964506 , -2.148383]),
            zoom: 16
        })
    }
);

map.addLayer(lindero);

const layerSwitcher = new ol.control.LayerSwitcher(
{
  startActive: true,
  activationMode: 'click',
  //groupSelectStyle: 'none'  
}
);

map.addControl(layerSwitcher);


// Para evitar que los layers se activen al hacer click en los labels
document.querySelectorAll('.layer-switcher label').forEach(label => {
  label.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') {
      e.preventDefault();    
      e.stopPropagation();   
    }
  });
});



// Para cambiar el mouse solamente cuando se mueve
map.on('pointermove', function (evt) {
  var viewPort = map.getViewport();

  if (evt.dragging) {
    // Estilo que se muestra al mover
    viewPort.style.cursor = 'all-scroll'; 
  } else {
    
    viewPort.style.cursor = ''; 
  }
});

// Resetea el mouse cuando se deja de mover
map.on('pointerup', function () {
  map.getViewport().style.cursor = '';
});


var overlay = new ol.Overlay({
  element: document.getElementById('popup'),
  autoPan: true
});

// Añadir overlay
map.addOverlay(overlay);

// Añadir el botón de closer
document.getElementById('popup-closer').onclick = function() {
  overlay.setPosition(undefined);
  return false;
};



// Para mostrar información al hacer click en poligonos
map.on('singleclick', function (evt) {

  // Evita que aparezca el popup si la capa está descactivada
  if (!poligonos.getVisible()) {
    overlay.setPosition(undefined); 
    return; 
  }

  var viewResolution = map.getView().getResolution();
  var viewProjection = map.getView().getProjection();
  
  // Colocar url dinámica
  var url = poligonos.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    {
      'INFO_FORMAT': 'application/json',
      'FEATURE_COUNT': '1',
      // Para que GeoServer solo observe la tabla polígonos:
      'QUERY_LAYERS': 'gis_espol:pg_polig_espol' 
    }
  );

  
  if (url) {
    fetch(url)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        // Chequea si se realizó la intersección del polígono
        if (data.features && data.features.length > 0) {
          
          // GeoServer coloca las columnas de la tabla PostgreSQL dentro de features[0].properties
          var props = data.features[0].properties; 
          
          // Colocar todas las columnas disponibles en consola F12
          console.log("Polygon data found: ", props);
          
          // Contruir la tabla con HTML
          var htmlContent = 
          '<table class="popup-table">' + 
          '<tr>'
          + '<td><strong>Ref.</strong></td>' + '<td>'+ (props.referencia_inmueble || 'N/A') + '</td>' + 
          '</tr>' +
          '<tr>'
          + '<td><strong>Área (m2)</strong></td>' + '<td>'+ (props.área_total_construcción || 'N/A') + '</td>' +
          '</tr>' +
          '</table>'
          ;
          
          document.getElementById('popup-content').innerHTML = htmlContent;
          overlay.setPosition(evt.coordinate);
        } else {
          // Esconder popup al hacer click en espacío vacío
          overlay.setPosition(undefined);
        }
      })
      .catch(function (error) {
        console.error('Error fetching data from GeoServer:', error);
      });
  }
});

// Para mostrar información al hacer click en polig_espol
map.on('singleclick', function (evt) {

  // Evita que aparezca el popup si la capa está descactivada
  if (!polig_espol.getVisible()) {
    overlay.setPosition(undefined); 
    return; 
  }

  var viewResolution = map.getView().getResolution();
  var viewProjection = map.getView().getProjection();
  
  // Colocar url dinámica
  var url = polig_espol.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    {
      'INFO_FORMAT': 'application/json',
      'FEATURE_COUNT': '1',
      // Para que GeoServer solo observe la tabla polígonos:
      'QUERY_LAYERS': 'gis_espol:pg_polig_espol' 
    }
  );

  
  if (url) {
    fetch(url)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        // Chequea si se realizó la intersección del polígono
        if (data.features && data.features.length > 0) {
          
          // GeoServer coloca las columnas de la tabla PostgreSQL dentro de features[0].properties
          var props = data.features[0].properties; 
          
          // Colocar todas las columnas disponibles en consola F12
          console.log("Polygon data found: ", props);
          
          // Contruir la tabla con HTML
          var htmlContent = 
          '<table class="popup-table">' + 
          '<tr>'
          + '<td><strong>Ref.</strong></td>' + '<td>'+ (props.referencia_inmueble || 'N/A') + '</td>' + 
          '</tr>' +
          '<tr>'
          + '<td><strong>Área (m2)</strong></td>' + '<td>'+ (props.área_total_construcción || 'N/A') + '</td>' +
          '</tr>' +
          '</table>'
          ;
          
          document.getElementById('popup-content').innerHTML = htmlContent;
          overlay.setPosition(evt.coordinate);
        } else {
          // Esconder popup al hacer click en espacío vacío
          overlay.setPosition(undefined);
        }
      })
      .catch(function (error) {
        console.error('Error fetching data from GeoServer:', error);
      });
  }
});




/*
// Para mostrar información al hacer click en edificaciones
map.on('singleclick', function (evt) {

  // Evita que aparezca el popup si la capa está descactivada
  if (!edificaciones.getVisible()) {
    overlay.setPosition(undefined); 
    return; 
  }

  var viewResolution = map.getView().getResolution();
  var viewProjection = map.getView().getProjection();
  
  // Colocar url dinámica
  var url = edificaciones.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    {
      'INFO_FORMAT': 'application/json',
      'FEATURE_COUNT': '1',
      // Para que GeoServer solo observe la tabla polígonos:
      'QUERY_LAYERS': 'gis_espol:pg_lin_espol' 
    }
  );

  
  if (url) {
    fetch(url)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        // Chequea si se realizó la intersección del polígono
        if (data.features && data.features.length > 0) {
          
          // GeoServer coloca las columnas de la tabla PostgreSQL dentro de features[0].properties
          var props = data.features[0].properties; 
          
          // Colocar todas las columnas disponibles en consola F12
          console.log("Polygon data found: ", props);
          
          // Contruir la tabla con HTML
          var htmlContent = 
          '<table class="popup-table">' + 
          '<tr>'
          + '<td><strong>Ref.</strong></td>' + '<td>'+ (props.name || 'N/A') + '</td>' + 
          '</tr>' +
          '</table>'
          ;
          
          document.getElementById('popup-content').innerHTML = htmlContent;
          overlay.setPosition(evt.coordinate);
        } else {
          // Esconder popup al hacer click en espacío vacío
          overlay.setPosition(undefined);
        }
      })
      .catch(function (error) {
        console.error('Error fetching data from GeoServer:', error);
      });
  }
});
*/




/*const infraestructura = new LayerSwitcher({
  tipLabel: 'Legend', // Optional button tooltip
  groupSelectStyle: 'children' // 'children' allows you to toggle the whole group
});
map.addLayer(infraestructura) */



/*var map = L.map("map").setView([-2.148383, -79.964506], 16)

var osm =L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '© Google Maps'
}).addTo(map);

// Para publicarlo en la misma red se uso Browser Sync, en sus settings se puso "port" : 3000
// Se creó una regla "Geoportal Espol" en Firewall Windows Defender", que permitía los puertos 3000 y 8080
// En "Firewall y protección de red" se permitió pasar a través de Firewall a Geoportal Espol y OpenJDK (la ubicación de java.exe)
// Ingreso localhost como una variable, para reemplazarlo por mi ip 172.20.131.153 (es variable)
// En Firewall de Windows Defender se permitió la conexión de los Apache Server

const source = "http://172.20.132.87:8080" // Puede ser ip (poner la ip actualizada) o https://localhost:8080

var poligonos = L.tileLayer.wms(source + "/geoserver/gis_espol/wms?",{
	Layers: "pg_polig_espol",
	format: "image/png",
	transparent: true
});






// CODIGO PARA MOSTRAR TABLA DE ATRIBUTOS AL HACER CLICK EN POLIGONOS
// OTRO METODO PUEDE SER CON getFeatureInfoUrl
// NECESARIO MODIFICAR CARPETA DE GEOSERVER/WEB-INFO. AHI COLOCAR:
// <context-param>
//    <param-name>geoserver.xframe.shouldSetPolicy</param-name>
//    <param-value>false</param-value>
// </context-param>
// 1. Create your standard, functional WMS Polygon Layer
var espolPolygons = L.tileLayer.wms(source + '/geoserver/gis_espol/wms', {
    layers: 'gis_espol:pg_polig_espol',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    srs: 'EPSG:4326',
    maxZoom: 22,       // The furthest the user can zoom in
    maxNativeZoom: 19
});

// 2. Add the native click handler directly to your Leaflet map object
map.on('click', function(e) {
    var size = map.getSize();
    var pixelPoint = map.latLngToContainerPoint(e.latlng);
    var bounds = map.getBounds();
    
    // Calculates a bounding box string compatible with GeoServer's layout
    var bbox = bounds.getSouthWest().lng + ',' + bounds.getSouthWest().lat + ',' + 
               bounds.getNorthEast().lng + ',' + bounds.getNorthEast().lat;

    // 3. Construct the clean, targeted Feature Information Request Link
    var infoUrl = source + '/geoserver/gis_espol/wms' +
                  '?service=WMS&version=1.1.0&request=GetFeatureInfo' +
                  '&layers=gis_espol:pg_polig_espol&query_layers=gis_espol:pg_polig_espol' +
                  '&info_format=text/html' +       // Instructs GeoServer to build an HTML table
                  '&bbox=' + bbox +
                  '&width=' + size.x + '&height=' + size.y +
                  '&srs=EPSG:4326' +
                  '&x=' + Math.round(pixelPoint.x) + '&y=' + Math.round(pixelPoint.y);

    // 4. Mount the resulting data view inside a standard Leaflet Popup box via an Iframe
    L.popup({maxWidth: 480,  // Forces the white vignette box to be wide enough
    		maxHeight: 400}  // Forces the white vignette box to be tall enough
    	)
        .setLatLng(e.latlng)
        .setContent('<iframe src="' + infoUrl + '" width="380" height="160" style="border:none;"></iframe>')
        .openOn(map);
});





var puntos = L.tileLayer.wms(source + "/geoserver/gis_espol/wms?",{
	Layers: "pg_puntos_espol",
	format: "image/png",
	transparent: true,
	maxZoom: 22,       
    maxNativeZoom: 19
});

var grupozonas = L.layerGroup([espolPolygons, puntos])



var tree = [
    {type: 'leaflet',
    name: 'Infraestructura',
    children: [
        {
            name: 'Zonas',
            layer: grupozonas
        }
        ]
    }
 ];

var control_layers = new L.Control.LayerTreeControl(tree, {
  position: 'topleft',
});
map.addControl(control_layers);

var container = control_layers.getContainer();
L.DomEvent.disableClickPropagation(container);
*/