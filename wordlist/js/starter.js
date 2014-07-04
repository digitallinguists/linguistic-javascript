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
document.onkeyup = function(event)
{
  if(event.keyCode == 9)
  {
    var ids = document.getElementsByClassName('ID')[0];
    var idx = parseInt(ids.title.split(' ')[1]);
    editEntry(idx,1,0,0);
    return;
  }
}
document.onkeydown = function (event) {
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
  else if(event.keyCode == 115)
  {
    var cols = document.getElementById('columns');
    if(cols.value != '')
    {
      cols.value = '';
    }
    else
    {
      cols.value = '*';
    }
    applyFilter();
    showCurrent();
  }
  //else if(event.keyCode == 9)
  //{
  //  var ids = document.getElementsByClassName('ID')[0];
  //  var idx = parseInt(ids.title.split(' ')[1]);
  //  editEntry(idx,1,0,0);
  //}
  else if(event.keyCode == 113)
  {
    toggleSettings();
  }
  else if(event.keyCode == 112)
  {
    event.preventDefault();
    toggleHelp();
  }
  else if(event.keyCode == 90 && event.ctrlKey)
  {
    UnDo();
  }
  else if(event.keyCode == 89 && event.ctrlKey)
  {
    ReDo();
  }
  return;
}


function UnDo()
{
  undoManager.undo();
  var idx = undoManager.getindex();
  var ldx = undoManager.lastindex();
  if(idx != -1)
  {
    $('#undo').removeClass('inactive');
    $('#undo').addClass('active');
  }
  else
  {
    $('#undo').removeClass('active');
    $('#undo').addClass('inactive');
  }
  if(ldx-1>idx)
  {
    $('#redo').removeClass('inactive');
    $('#redo').addClass('active');
  }
  else
  {
    $('#redo').removeClass('active');
    $('#redo').addClass('inactive');
  }  
}
function ReDo()
{
  undoManager.redo();
  var idx = undoManager.getindex();
  var ldx = undoManager.lastindex();
  if(idx != -1)
  {
    $('#undo').removeClass('inactive');
    $('#undo').addClass('active');
  }
  else
  {
    $('#undo').removeClass('active');
    $('#undo').addClass('inactive');
  }
  if(ldx-1>idx)
  {
    $('#redo').removeClass('inactive');
    $('#redo').addClass('active');
  }
  else
  {
    $('#redo').removeClass('active');
    $('#redo').addClass('inactive');
  }  
}
