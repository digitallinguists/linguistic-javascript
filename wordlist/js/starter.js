/* http://www.phpied.com/sleep-in-javascript/ */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function startWordlist()
{
  try
  {
    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    if(typeof localStorage.text == 'undefined'){}
    else
    {
      document.getElementById('store').innerText = localStorage.text;
      $("#last").removeClass("inactive");
      $("#last").addClass("active");
      var last = document.getElementById('last');
      last.value = "VIEW "+"<"+localStorage.filename+">";
      document.getElementById('filename').innerHTML = '<'+localStorage.filename+'>';
      CFG['filename'] = localStorage.filename;
    }
    return 1;
  }
  catch (e)
  {
    return 0;
  }
}

startWordlist();



document.onkeyup = function (event) {
  if(event.keyCode == 34)
  {
    var next = document.getElementById('next').value;
    var idx = parseInt(next.split('-')[0]);
    showWLS(idx);
  }
  else if(event.keyCode == 33)
  {
    var previous = document.getElementById('previous').value;
    var idx = parseInt(previous.split('-')[0]);
    showWLS(idx);
  }
}
