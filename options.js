chrome.storage.sync.get(['apiKey']).then((result) => {
  $('#api-key').val(result['apiKey'])
});

$('#api-key').bind('input', function() {
  chrome.storage.sync.set({'apiKey': this.value});
});