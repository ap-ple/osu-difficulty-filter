let min = 0;
let max = 10;

function update() {
  if (this.id.includes('min')) {
    if (parseFloat(this.value) > max) {
      this.value = max;
    }
    min = this.value;
  } else { // max
    if (parseFloat(this.value) < min) {
      this.value = min;
    }
    max = this.value;
  }
  
  if (this.className.includes('slider')) {
    var changeType = '-text';
  } else { // text
    var changeType = '-slider';
  }

  document.getElementById(this.id.slice(0, 3) + changeType).value = this.value;
}

Array.from(document.getElementsByTagName('input')).forEach(function (element) {
  if (element.className.includes('slider')) {
    $(element).bind('input', update);
  } else { // text
    $(element).bind('change', update);
  }
});