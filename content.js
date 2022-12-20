
// look for beatmaps on page; if none found, alert the user and throw error
if ($('.beatmapset-panel').length === 0) {
  alert('No beatmaps found!')
  throw new Error('Invalid page');
}

//get values
var min;
var max;
var apiKey;
if (beatmapCache == null) {
  var beatmapCache = {};
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function getBeatmapSet(apiKey, beatmapSetId){
  sleep(80); // not good implementation but I was desperate
  return fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${apiKey}&s=${beatmapSetId}`)
    .then((response) => response.json())
    .then((data) => {return data});
}

async function getDiffs(apiKey, beatmapSetId){
  const data = await getBeatmapSet(apiKey, beatmapSetId);
  return data.map(a => a.difficultyrating);
}

function checkDiffs(beatmapSetId, min, max) {
  var found = false;
  beatmapCache[beatmapSetId].forEach(diff => {
    if (diff >= min && diff <= max){
      found = true;
    }
  });
  return found;
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

  // determine which class name to use
  var beatmapClassName;
  if ($('.beatmapsets__item').length > 0) { 
    beatmapClassName = '.beatmapsets__item'// /beatmaps
    alert('Warning: filter not recommended for use on beatmap listing. Instead, use stars>/<(=)n')
  } else { 
    beatmapClassName = '.osu-layout__col'  // /users
  }

  // find all beatmaps on page
  console.log('Hiding beatmaps outside of range...');
  $(beatmapClassName).each(function(key, element) {
    if ($(this).children().first().attr('type') === 'button'){
      return; // skip show more button
    }

    const audioUrl = $(this).children('.beatmapset-panel').first().attr('data-audio-url')
    const beatmapSetId = audioUrl.match(/\/(\d+)+[\/]?/g)[0].replace(/\//g, '')

    if (beatmapSetId in beatmapCache) {
      let found = checkDiffs(beatmapSetId, min, max);
      if (found){
        $(this).show(500);
      } else {
        $(this).hide(500);
      }
    } else {
      getDiffs(apiKey, beatmapSetId).then((diffs) => {
        beatmapCache[beatmapSetId] = diffs
        let found = checkDiffs(beatmapSetId, min, max);
        if (found){
          $(this).show(500);
        } else {
          $(this).hide(500);
        }
      });
    }
  });
});

