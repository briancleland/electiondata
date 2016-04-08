var request = new XMLHttpRequest();
request.open('GET', 'full-constituency-candidates-list.json', true);

request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    candidatesData = JSON.parse(request.responseText);
    console.log(candidatesData);
  } else {
    candidates.innerHTML = 'We reached our target server, but it returned an error'
  }
};

request.onerror = function () {
  candidates.innerHTML = 'Connection error retrieving data from the server'
};

request.send();

function getObjects(obj, key, val) {
  var objects = [];
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
      objects = objects.concat(getObjects(obj[i], key, val));
    } else
    //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
    if (i == key && obj[i] == val || i == key && val == '') { //
      objects.push(obj);
    } else if (obj[i] == val && key == '') {
      //only add if the object is not already in the array
      if (objects.lastIndexOf(obj) == -1) {
        objects.push(obj);
      }
    }
  }
  return objects;
}

var layerStyle = {
  weight: 2,
  color: 'blue',
  fillOpacity: 0.1,
};

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    color: '#cc0066',
    fillOpacity: 0.7
  });
  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

var boundaries;

function resetHighlight(e) {
  boundaries.resetStyle(e.target);
  info.update();
}

function zoomAndDisplay(e) {
  //map.fitBounds(e.target.getBounds());
  candidates.update(e.target.feature.properties.Constituency_Number);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomAndDisplay
  });
}

var boundaries = new L.GeoJSON.AJAX('OSNI_Constituencies.geojson', {
  style: layerStyle,
  onEachFeature: onEachFeature
});

console.log(boundaries);

var map = L.map('map').setView([54.593346, -6.416200], 8);
mapLink =
  '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);

boundaries.addTo(map);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML = '<h4>Constituency</h4>' + (props ?
    '<b>' + props.Constituency_Name + '</b><br />' : 'Hover over a constituency');
};

info.addTo(map);

var candidates = document.getElementById('candidates');

candidates.update = function (constituency_id) {
  var constituency = getObjects(candidatesData, 'Constituency_Number', constituency_id);
  var candidates = constituency[0].Candidates;
  console.log(candidates);
  this.innerHTML = '<h2>' + constituency[0].Constituency_Name + '<h2>';
  for (i = 0; i < candidates.length; i++) {
    this.innerHTML += '<div id="' + candidates[i].Candidate_Id + '" class="tooltip ' + candidates[
        i].Party_Name.replace(/\s+/g, "-") + '_label">' + candidates[i].Firstname + ' ' +
      candidates[i].Surname + '<span class="tooltiptext">' + candidates[i].Party_Name +
      '</span></div></br>';
  }
};