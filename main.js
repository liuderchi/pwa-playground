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

const openWeatherMapAPI = {
  url: 'http://api.openweathermap.org/data/2.5',
  query: {
    q: 'Taipei',
    appid: 'c50accef3c5022b54a605268032345fd',
  },
}

function f2c(f) {
  return Math.ceil((f - 32) * 5 / 9 * 10) / 10;
}

function k2c(k) {
  return Math.ceil((k - 273) * 10) / 10;
}

function drawChart({
  id,
  data,
  labels,
  borderColor = 'rgba(243, 154, 30, 1)',
  backgroundColor = 'rgba(243, 154, 30, 0.2)',
  title,
  yTick = v => v,
}) {
  Chart.defaults.global.defaultFontSize = 14;
  // const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //   today = new Date().getDay(),
  const options = {
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
      // labels: [...weekDays.slice(today), ...weekDays.slice(0, today)],
      labels,
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

  $.get(`${CORS_ANYWHERE_DOMAIN}/${geoipAPI.url}`, geoipAPI.query)
    .done(res => {
      console.warn(`fetching weather data in ${res.region_name}...`);

      // $.get(`${CORS_ANYWHERE_DOMAIN}/${openWeatherMapAPI.url}/forecast`, openWeatherMapAPI.query)
      //   .done(console.warn);
      // NOTE add Allow all origins in reponse by hitting cors-anywhere proxy
      // $.get(
      //   `${CORS_ANYWHERE_DOMAIN}/${darkSkyAPI.url}/${darkSkyAPI.key}/${
      //     res.latitude
      //   },${res.longitude}`,
      $.get(`${CORS_ANYWHERE_DOMAIN}/${openWeatherMapAPI.url}/forecast`, openWeatherMapAPI.query
      ).done(function(weatherData) {
        $('#title').empty();
        $('#info').empty();
        var latestWeatherData = [];

        console.warn({ weatherData });

        $('#title').append(
          `${openWeatherMapAPI.query.q}, ${new Date()
            .toDateString()
            .split(' ')
            .slice(1, 3)
            .join(' ')}`,
        );
        $.get(`${CORS_ANYWHERE_DOMAIN}/${openWeatherMapAPI.url}/weather`, openWeatherMapAPI.query)
          .done(res => {
            console.error({ res });
            $('h4#info').append(`
              <span class="large">${k2c(
                res.main.temp
              )}</span> &deg;C
              &emsp;<span class="large">${res.main.humidity}</span> %`
            );
          })

        drawChart({
          id: 'temperature',
          data: weatherData.list.map(({ main: { temp } }) =>
            k2c(temp),
          ),
          labels: weatherData.list.map(({ dt }) =>
            (new Date(dt*1000)).toString().slice(0,3)
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
        // NOTE WIP

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
