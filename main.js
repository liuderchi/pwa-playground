// Progressive Enhancement
if (navigator.serviceWorker) {
  // Register SW
  navigator.serviceWorker.register('sw.js').catch(console.error);
}

const geoipAPI = {
  url: 'http://api.ipstack.com/124.11.64.18',
  query: {
    access_key: 'e22e57b562e511b646985a6d79af1344',
  },
};

const CORS_ANYWHERE_DOMAIN = 'https://cors-anywhere.herokuapp.com';

const darkSkyAPI = {
  url: 'https://api.darksky.net/forecast',
  key: '501c815982d69b200afd4b1671befbd8',
};

function f2c(f) {
  return Math.ceil((f - 32) * 5 / 9 * 10) / 10;
}

function drawChart({
  id,
  data,
  borderColor = 'rgba(243, 154, 30, 1)',
  backgroundColor = 'rgba(243, 154, 30, 0.2)',
  title,
  yTick = v => v,
}) {
  Chart.defaults.global.defaultFontSize = 14;
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    today = new Date().getDay(),
    options = {
      title: {
        display: true,
        text: title,
        fontSize: 14,
        fontStyle: 'default',
      },
      legend: {
        display: false,
      },
      scales: {
        yAxes: [{ ticks: { callback: yTick } }],
      },
    };

  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...weekDays.slice(today), ...weekDays.slice(0, today)],
      datasets: [
        {
          data,
          backgroundColor: [backgroundColor],
          borderColor: [borderColor],
          borderWidth: 1,
        },
      ],
    },
    options,
  });
}

// Update trending giphys
function update() {
  // Toggle refresh state
  $('#update .icon').toggleClass('d-none');

  // $.get(`${CORS_ANYWHERE_DOMAIN}/${geoipAPI.url}`, geoipAPI.query)
  //   .done(res => {
  navigator.geolocation.getCurrentPosition(res => {
      console.warn(`fetching weather data in ${res.region_name}...`);

      // NOTE add Allow all origins in reponse by hitting cors-anywhere proxy
      $.get(
        `${CORS_ANYWHERE_DOMAIN}/${darkSkyAPI.url}/${darkSkyAPI.key}/${
          res.coords.latitude
        },${res.coords.longitude}`,
      ).done(function(weatherData) {
        $('#title').empty();
        $('#info').empty();
        var latestWeatherData = [];

        console.warn({ weatherData });

        $('#title').append(
          `${new Date()
            .toDateString()
            .split(' ')
            .slice(1, 3)
            .join(' ')}`,
        );
        $('h4#info').append(`
          <span class="large">${f2c(
            weatherData.currently.apparentTemperature,
          )}</span> &deg;C
          &emsp;<span class="large">${weatherData.currently.precipProbability *
            100}</span> %
        `);

        drawChart({
          id: 'temperature',
          data: weatherData.daily.data.map(({ apparentTemperatureMax }) =>
            f2c(apparentTemperatureMax),
          ),
          title: 'Temperature',
          borderColor: 'rgb(40, 167, 69, 1)',
          backgroundColor: 'rgb(40, 167, 69, 0.2)',
          yTick: v => `${v} \u00B0C`,
        });
        drawChart({
          id: 'precipProbability',
          data: weatherData.daily.data.map(
            ({ precipProbability }) => precipProbability,
          ),
          title: 'Precipitation Probability',
          borderColor: 'rgb(23, 162, 184, 1)',
          backgroundColor: 'rgb(23, 162, 184, 0.2)',
          yTick: v => `${v * 100} %`,
        });
        drawChart({
          id: 'uvIndex',
          data: weatherData.daily.data.map(({ uvIndex }) => uvIndex),
          title: 'UV Index',
          borderColor: 'rgb(102, 16, 242, 1)',
          backgroundColor: 'rgb(102, 16, 242, 0.2)',
        });

        latestWeatherData.push(weatherData);
      });
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
