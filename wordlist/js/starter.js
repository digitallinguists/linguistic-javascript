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

function handleFileSelect2(evt) 
{  
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; /* FileList object */
  var file = files[0];
  //var store = document.getElementById('store');
  CFG['filename'] = file.name;
  localStorage.filename = file.name;

  /* create file reader instance */
  var reader = new FileReader({async:false});
  //$.get('harry.msa', function(data){document.getElementById('store').innerText = data}, alert("loaded text"), 'text');
  reader.onload = function(e){STORE = reader.result;}
  reader.readAsText(file);

  var modify = ['view'];
  for(i in modify)
  {
    tmp = document.getElementById(modify[i]);
    tmp.style.display = 'block';
  }
  var modify = ["concepts","columns","taxa","add_column","previous","next","current",'save'];
  for(i in modify)
  {
    $("#"+modify[i]).removeClass("active");
    $("#"+modify[i]).addClass("inactive");
  }
  document.getElementById("qlc").innerHTML = '';

  var fn = document.getElementById('filename');
  fn.innerHTML = '&lt;'+CFG['filename']+'&gt;';
  var dropZone = document.getElementById('drop_zone');
  dropZone.style.display = "none";

}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect2, false);
dropZone.style.backgroundColor = "#2e5ca8";

