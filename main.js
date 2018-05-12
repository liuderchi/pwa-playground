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
  url: 'https://api.darksky.net/forecast',
  key: '501c815982d69b200afd4b1671befbd8'
};

function f2c(f) {
  return Math.ceil((f - 32) * 5 / 9 * 10) / 10;
}

function drawChart({ id, data, label }) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    today = new Date().getDay(),
    backgroundColor = ['rgba(243, 154, 30, 0.2)'],
    borderColor = ['rgba(243, 154, 30, 1)'],
    borderWidth = 1;

  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...weekDays.slice(today), ...weekDays.slice(0, today)],
      datasets: [
        {
          label,
          data,
          backgroundColor,
          borderColor,
          borderWidth
        }
      ]
    }
  });
}

// Update trending giphys
function update() {
  // Toggle refresh state
  $('#update .icon').toggleClass('d-none');

  $.get(`${CORS_ANYWHERE_DOMAIN}/${geoipAPI.url}`, geoipAPI.query).done(res => {
    console.warn(`fetching weather data in ${res.region_name}...`);

    // NOTE add Allow all origins in reponse by hitting cors-anywhere proxy
    $.get(
      `${CORS_ANYWHERE_DOMAIN}/${darkSkyAPI.url}/${darkSkyAPI.key}/${res.latitude},${
        res.longitude
      }`
    )
      .done(function(weatherData) {
        $('#title').empty();
        $('#info').empty();
        var latestWeatherData = [];

        console.warn({ weatherData });

        $('#title').append(`${res.region_name}, ${(new Date()).toDateString().split(' ').slice(1,3).join(' ')}`)
        $('h4#info').append(`
          <span class="large">${f2c(weatherData.currently.apparentTemperature)}</span> &deg;C
          &emsp;<span class="large">${weatherData.currently.precipProbability * 100}</span> %
        `)

        drawChart({
          id: 'temperature',
          data: weatherData.daily.data.map(({ apparentTemperatureMax }) =>
            f2c(apparentTemperatureMax)
          ),
          label: 'Temperature (Celsius)'
          // NOTE do not draw label
        });
        drawChart({
          id: 'precipProbability',
          data: weatherData.daily.data.map(
            ({ precipProbability }) => precipProbability
          ),
          label: 'Precipitation Probability'
        });
        drawChart({
          id: 'uvIndex',
          data: weatherData.daily.data.map(({ uvIndex }) => uvIndex),
          label: 'UV Index'
        });

        latestWeatherData.push(weatherData)

        // Inform the SW (if available) of current Giphys
        if (navigator.serviceWorker) giphyCacheClean(latestWeatherData);
      })
  })
  .fail(function() {
    $('.alert').slideDown();
    setTimeout(function() {
      $('.alert').slideUp();
    }, 2000);
  })
  .always(function() {
    $('#update .icon').toggleClass('d-none');
  });

  // Prevent submission if originates from click
  return false;
}

$('#update a').click(update);
update();
