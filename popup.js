var min;
var max;

chrome.storage.sync.get({'min': 0, 'max': 10}).then((result) => {
  min = parseFloat(result['min']);
  max = parseFloat(result['max']);
  $('input').each(function(key, element) {
    if (element.id.includes('min')) {
      element.value = parseFloat(min)
    } else { // max
      element.value = parseFloat(max)
    }
  });
});

function update() {
  if (this.id.includes('min')) {
    if (parseFloat(this.value) > max) {
      this.value = max;
    }
    min = parseFloat(this.value);
  } else { // max
    if (parseFloat(this.value) < min) {
      this.value = min;
    }
    max = parseFloat(this.value);
  }

  let limitType = this.id.slice(0, 3);
  let changeType;

  if (this.className.includes('slider')) {
    changeType = '-text';
  } else { // text
    changeType = '-slider';
  }

  $('#' + limitType + changeType).val(this.value);
}

$('.difficulty-slider').each(function(key, element) {
  $(element).bind('input', update);
});

$('.difficulty-text').each(function(key, element) {
  $(element).bind('change', update);
});

$('#filter').click(function() {
  chrome.storage.sync.set({'min': min, 'max': max});
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['bottleneck.js', 'jquery-3.6.2.min.js', 'content.js']
    });
  });
});