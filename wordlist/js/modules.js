var requirements = [
  "jquery-1.10.2.js",
  "jquery-ui-1.10.4.custom.js",
  "FileSaver.js",
  "dighl/sampa2ipa.js",
  "dighl/highlight.js",
  "wordlist.js", 
  "starter.js"
  ];

for(var i=0;i<requirements.length;i++)
{
  var r=requirements[i];
  var script = document.createElement('script');
  script.src = 'js/'+r;
  script.async = false;
  script.type="text/javascript";
  document.head.appendChild(script);
}

