
// look for beatmaps on page; if none found, alert the user and throw error
if ($('.beatmapset-panel').length === 0) {
  alert('No beatmaps found!')
  throw new Error('Invalid page');
}

// if beatmap listing, alert the user and throw error
if ($('.beatmapsets__item').length > 0) { 
  alert('Filter not recommended for use on beatmap listing. Instead, use stars>/<(=), or visit a userpage.')
  throw new Error('Filter not recommended for use on beatmap listing');
}

//get values
var min;
var max;
var apiKey;
if (beatmapCache == null) {
  var beatmapCache = {};
}

if (limiter == null) {
  var limiter = new Bottleneck({
    maxConcurrent: 20
  });
}

function filterBeatmapset(beatmapSetId, min, max, beatmapCard) {
  let found = false;
  beatmapCache[beatmapSetId].forEach(diff => {
    if (diff >= min && diff <= max){
      $(beatmapCard).show(500);
      found = true;
    }
  });
  if (!found) {
    $(beatmapCard).hide(500);
  }
}

chrome.storage.sync.get({'min': 0, 'max': 10, 'apiKey': ''}).then((result) => {
  // set min and max
  min = parseFloat(result['min']);
  max = parseFloat(result['max']);

  // check if api key is set; if no key is set, alert the user and throw error
  if (result['apiKey'] === '') {
    alert('API key not set! To set the API key, right click the odf! extension icon and select Options. You may need to reload this page for the key to register.')
    throw new Error('API key not set');
  } else {
    apiKey = result['apiKey']
  }

  // check api key; if key invalid, alert the user and throw error
  fetch('https://osu.ppy.sh/api/get_user?k=' + apiKey)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert('Invalid API key! Check to make sure your API key is registered at osu.ppy.sh/p/api')
        throw new Error('Invalid API key');
      }
    });

  console.log('Hiding beatmaps outside of range...');
  $('.osu-layout__col').each(function(key, element) {
    if ($(this).is(':empty') || $(this).children().first().attr('type') === 'button'){
      return; // not beatmap card 
    }

    const audioUrl = $(this).children('.beatmapset-panel').first().attr('data-audio-url')
    const beatmapSetId = audioUrl.match(/\/(\d+)+[\/]?/g)[0].replace(/\//g, '')

    if (beatmapSetId in beatmapCache) {
      filterBeatmapset(beatmapSetId, min, max, this);
    } else {
      limiter.schedule(() => fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${apiKey}&s=${beatmapSetId}`)
      .then((response) => {return response.json()})
      .then((data) => {return data.map(diff => diff.difficultyrating)})
      .then((diffs) => {
        beatmapCache[beatmapSetId] = diffs
        filterBeatmapset(beatmapSetId, min, max, this);
      }))
    }
  });
});