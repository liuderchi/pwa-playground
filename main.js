// Progressive Enhancement
if (navigator.serviceWorker) {
  // Register SW
  navigator.serviceWorker.register('sw.js').catch(console.error);

  // Giphy cache clean
  function giphyCacheClean(giphys) {
    // Get service worker registration
    navigator.serviceWorker.getRegistration().then(function(reg) {
      // Only post message to active SW
      if (reg.active)
        reg.active.postMessage({ action: 'cleanGiphyCache', giphys: giphys });
    });
  }
}

const geoipAPI = {
  url: 'http://api.ipstack.com/124.11.64.18',
  query: {
    access_key: 'e22e57b562e511b646985a6d79af1344'
  }
};

const CORS_ANYWHERE_DOMAIN = 'https://cors-anywhere.herokuapp.com';

const darkSkyAPI = {
  url: 'https://api.darksky.net/forecast/501c815982d69b200afd4b1671befbd8'
};

function f2c(f) {
  return Math.ceil((f - 32) * 5 / 9 * 100) / 100;
}

// Update trending giphys
function update() {
  // Toggle refresh state
  $('#update .icon').toggleClass('d-none');

  $.get(geoipAPI.url, geoipAPI.query).done(res => {
    console.warn(`fetching weather data in ${res.region_name}...`);

    // NOTE add Allow all origins in reponse by hitting cors-anywhere proxy
    $.get(
      `${CORS_ANYWHERE_DOMAIN}/${darkSkyAPI.url}/${res.latitude},${
        res.longitude
      }`
    )
      .done(function(res) {
        $('#giphys').empty();
        var latestGiphys = [];

        console.warn(
          res.daily.data.map(({ apparentTemperatureMax }) =>
            f2c(apparentTemperatureMax)
          )
        );
        console.warn(res.daily.data.map(({ humidity }) => humidity));
        console.warn(res.daily.data.map(({ pressure }) => pressure));

        drawChart({
          id: 'temperature',
          data: res.daily.data.map(({ apparentTemperatureMax }) =>
            f2c(apparentTemperatureMax)
          ),
          label: 'Temperature',
        })
        drawChart({
          id: 'humidity',
          data: res.daily.data.map(({ humidity }) => humidity),
          label: 'Humidity',
        })
        drawChart({
          id: 'pressure',
          data: res.daily.data.map(({ pressure }) => pressure),
          label: 'Pressure',
        })

        // Inform the SW (if available) of current Giphys
        if (navigator.serviceWorker) giphyCacheClean(latestGiphys);
      })

      // Failure
      .fail(function() {
        $('.alert').slideDown();
        setTimeout(function() {
          $('.alert').slideUp();
        }, 2000);
      })

      // Complete
      .always(function() {
        // Re-Toggle refresh state
        $('#update .icon').toggleClass('d-none');
      });
  });

  // Prevent submission if originates from click
  return false;
}

// Manual refresh
$('#update a').click(update);

// Update trending giphys on load
update();

function drawChart({ id, data, label }) {
  var ctx = document.getElementById(id).getContext('2d');
  // var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          // label: 'Humidity',
          label,
          // data: [12, 19, 3, 5, 2, 3],
          data,
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          borderColor: ['rgba(255,99,132,1)'],
          borderWidth: 1
        }
      ]
    },
  });
}
