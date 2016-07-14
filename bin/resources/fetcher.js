function sendToCorleone(data) {
  var restaurants = data.marker.values.map(function (marker) {
    var $el = marker.data;
    
    return {
      location: {
        lat: marker.latLng[0],
        lng: marker.latLng[1],
      },
      name: $('.title', $el).text(),
      address: $('.address', $el).text(),
      icon: $('img', $el).attr('src'),
      url: $('.more-button', $el).attr('href'),
    };
  });

  $.ajax({
    url: '/feed',
    type: 'POST',
    data: JSON.stringify(restaurants),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  });
}
