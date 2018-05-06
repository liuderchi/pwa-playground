
// Progressive Enhancement
if (navigator.serviceWorker) {

    // Register SW
    navigator.serviceWorker.register('sw.js').catch(console.error);

    // Giphy cache clean
    function giphyCacheClean(giphys) {

        // Get service worker registration
        navigator.serviceWorker.getRegistration().then(function(reg){

            // Only post message to active SW
            if( reg.active ) reg.active.postMessage({ action: 'cleanGiphyCache', giphys:giphys });
        });
    }
}

// Giphy API object
var giphy = {
    url: 'https://api.giphy.com/v1/gifs/trending',
    query: {
        api_key: '54452c59b31e4d14aca213ec76014baa',
        limit: 12
    }
};

const CORS_ANYWHERE_DOMAIN = 'https://cors-anywhere.herokuapp.com'

var darkSkyAPI = {
  url: 'https://api.darksky.net/forecast/501c815982d69b200afd4b1671befbd8/37.8267,-122.4233'
}

// Update trending giphys
function update() {

    // Toggle refresh state
   $('#update .icon').toggleClass('d-none');

    // Call Giphy API
    // NOTE add Allow all origins in reponse by hitting cors-anywhere proxy
    $.get(`${CORS_ANYWHERE_DOMAIN}/${darkSkyAPI.url}`)

        // Success
        .done( function (res) {

            // Empty Element
            $('#giphys').empty();

            // Populate array of latest Giphys
            var latestGiphys = [];

            console.warn({ temp: res.currently.temperature, daily: res.daily.data});

            // Loop Giphys
            $.each( res.daily.data, (i, data) => {

                // Add to latest Giphys
                // latestGiphys.push( giphy.images.downsized_large.url );

                // Add Giphy HTML
                $('#giphys').prepend(
                  `<div class="col-sm-6 col-md-4 col-lg-3 p-1">
                    ${data.temperatureHigh}, ${data.temperatureLow}
                  </div>`
                );
            });

            // Inform the SW (if available) of current Giphys
            if( navigator.serviceWorker ) giphyCacheClean(latestGiphys);
        })

        // Failure
        .fail(function(){

            $('.alert').slideDown();
            setTimeout( function() { $('.alert').slideUp() }, 2000);
        })

        // Complete
        .always(function() {

            // Re-Toggle refresh state
            $('#update .icon').toggleClass('d-none');
        });

    // Prevent submission if originates from click
    return false;
}

// Manual refresh
$('#update a').click(update);

// Update trending giphys on load
update();
