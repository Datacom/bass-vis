$(function() {
  $('#theme-toggle input').change(function() {
    var checked = $(this).prop('checked');
    localStorage.setItem('theme', checked? 'light':'dark');
    setTheme(checked);
  });

  theme = localStorage.getItem('theme');
  if(theme==="dark") {
    $('#theme-toggle input').bootstrapToggle('off');
  }

  function setTheme(lightTheme) {
    $('body').attr('id',lightTheme?'':'dark');
    $('.navbar').addClass(lightTheme? 'navbar-default':'navbar-inverse')
                .removeClass(lightTheme? 'navbar-inverse':'navbar-default');
  }
});
(function() {
  // Change D3's SI prefix to more business friendly units
  //      K = thousands
  //      M = millions
  //      B = billions
  //      T = trillion
  //      P = quadrillion
  //      E = quintillion
  // small decimals are handled with e-n formatting.
  var d3_formatPrefixes = ["e-24","e-21","e-18","e-15","e-12","e-9","e-6","e-3","","K","M","B","T","P","E","Z","Y"].map(d3_formatPrefix);

  // Override d3's formatPrefix function
  d3.formatPrefix = function(value, precision) {
      var i = 0;
      if (value) {
          if (value < 0) {
              value *= -1;
          }
          if (precision) {
              value = d3.round(value, d3_format_precision(value, precision));
          }
          i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
          i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
      }
      return d3_formatPrefixes[8 + i / 3];
  };

  function d3_formatPrefix(d, i) {
      var k = Math.pow(10, Math.abs(8 - i) * 3);
      return {
          scale: i > 8 ? function(d) { return d / k; } : function(d) { return d * k; },
          symbol: d
      };
  }

  function d3_format_precision(x, p) {
      return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
})();
