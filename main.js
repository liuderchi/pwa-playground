// Giphy API object
const giphy = {
  url: 'https://api.giphy.com/v1/gifs/trending',
  query: {
    api_key: '54452c59b31e4d14aca213ec76014baa',
    limit: 12
  }
};

// Update trending giphys
function update() {
  // Toggle refresh state
  $('#update .icon').toggleClass('d-none');

  fetch(new Request(`${giphy.url}?${$.param(giphy.query)}`))
    .then(async (res) => {
      $('#giphys').empty();

      const gifs = await res.clone().json().then(({ data }) => data)

      gifs.forEach(gif => $('#giphys')
        .prepend(`
          <div class="col-sm-6 col-md-4 col-lg-3 p-1">
            <img class="w-100 img-fluid" src="${
              gif.images.downsized_large.url
            }">
          </div>`)
      )
    })
    .catch(console.error)
    .then(() => $('#update .icon').toggleClass('d-none'))

  // Prevent submission if originates from click
  return false;
}

// Register click event
$('#update a').click(update);

// Update trending giphys on load
update();
