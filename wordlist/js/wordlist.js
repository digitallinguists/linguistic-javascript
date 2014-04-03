/* basic parameters */
var BASICS = [
  "DOCULECT",
  "GLOSS",
  "CONCEPT",
  "IPA",
  "TOKENS",
  "COGID",
  "TAXON",
  "TAXA"
  ];

var WLS = {};
var CFG = {'preview':50};

var db = document.getElementById('db');


/* load qlc-file */
function csvToArrays(allText, separator, comment) {
    var allTextLines = allText.split(/\r\n|\n/);
    var db = document.getElementById('db');
    
    var qlc = {};
    var taxa = {};
    var concepts = {};
    var tIdx = -1;
    var cIdx = -1;
    var selection = [];
    var columns = {};

    var firstLineFound = false;
    for (var i=0; i<allTextLines.length; i++) 
    {
      var data = allTextLines[i].split(separator);
      if (data[0] == "ID") 
      {
        firstLineFound = true;
        
        /* get the header */
        var header = [];
        for(j=1;j<data.length;j++)
        {
          var datum = data[j].toUpperCase();
          header.push(datum);
          if(["TAXA","TAXON","LANGUAGE","DOCULECT"].indexOf(datum) != -1)
          {
            tIdx = j;
          }
          if(datum == 'GLOSS' || datum == "CONCEPT")
          {
            cIdx = j;
          }
          if(BASICS.indexOf(datum) != -1)
          {
            columns[datum] = j;
          }
          else
          {
            columns[datum] = -j;
          }
        }; 
      }
      else if(data[0].charAt(0) == comment || data[0] == ''){}
      else if(firstLineFound)
      {
        var idx = parseInt(data[0]);

        qlc[idx] = data.slice(1,data.length);

        /* check for header */
        var taxon = data[tIdx];
        var concept = data[cIdx];
        if(taxon in taxa)
        {
          taxa[taxon].push(idx);
        }
        else
        {
          taxa[taxon] = [idx];
        }
        if(concept in concepts)
        {
          concepts[concept].push(idx);
        }
        else
        {
          concepts[concept] = [idx];
        }
        selection.push(idx);
      }
    }
    WLS = qlc;
    WLS["header"] = header;
    WLS["taxa"] = taxa;
    WLS['concepts'] = concepts;
    WLS['parsed'] = true;
    WLS['rows'] = selection;
    WLS['columns'] = columns;
 }

function showWLS(start)
{
  if(!WLS['parsed'])
  {
    var store = document.getElementById('store');
    csvToArrays(store.innerText,"\t","#");
  }

  var text = '<table id="qlc_table">';

  // add col-tags to the dable
  text += '<col id="ID" />';
  for(i in WLS["header"])
  {
    var head = WLS['header'][i];
    if(WLS['columns'][head] > 0)
    {
      text += '<col id="'+head+'" />';
    }
    else
    {
      text += '<col id="'+head+'" style="visibility:collapse;" />';
    }
  }

  text += "<tr>";
  text += "<th>ID</th>";
  text += "<th>";
  text += WLS['header'].join("</th><th>");
  text += "</th>";
  text += "</tr>";

  //for(idx in WLS) 
  var count = 1;
  for(i in WLS['rows'])
  {
    var idx = WLS['rows'][i];
    if(!isNaN(idx) && count >= start)
    {
      var rowidx = parseInt(i)+1;
      text += '<tr id="L_'+idx+'">';
      text += '<td class="ID" title="LINE '+rowidx+'">'+idx+"</td>";
      for(j in WLS[idx])
      {
        var jdx = parseInt(j)+1;
        text += '<td class="'+WLS['header'][j]+'" title="MODIFY ENTRY '+idx+"/"+jdx+'" onclick="editEntry('+idx+','+jdx+',0,0)">';
        text += WLS[idx][j];
        text += "</td>";
      }
      text += "</tr>";
      count += 1;
    }
    else{count += 1;}
    if(count >= start+CFG['preview'])
    {
      break;
    }
  }
  text += "</table>";
  qlc.innerHTML = text;
  
  var db=document.getElementById('db');

  // modify previous and next
  var previous = document.getElementById("previous");
  if(parseInt(start)-CFG['preview'] >= 0)
  {
    previous.onclick = function(){showWLS(start-CFG['preview']);};
    var prestart = start-CFG['preview'];
    var startbefore = start-1;
    previous.value = prestart +'-'+startbefore;
    previous.className = previous.className.replace(/inactive/,'active');
  }
  else
  {
    previous.className = previous.className.replace(/ active/,' inactive');
  }

  var next = document.getElementById("next");
  if(WLS['rows'].length > start+CFG['preview'])
  {
    var poststart = start+parseInt(CFG['preview']);
    var postpoststart = start+2 * parseInt(CFG['preview'])-1;
    if(postpoststart >= WLS['rows'].length)
    {
      postpoststart = WLS['rows'].length;
    }
    next.onclick = function(){showWLS(poststart);};
    next.value = poststart+'-'+postpoststart;
    next.className = next.className.replace(/inactive/,'active');
  }
  else
  {
    next.className = next.className.replace(/ active/,' inactive');
  }

  var current = document.getElementById('current');
  var following = start + CFG['preview'] - 1;
  if(following >= WLS['rows'].length-1)
  {
    following = WLS['rows'].length;
  }
  current.innerHTML = "Showing entries "+start + ' - '+following +' of '+parseInt(WLS['rows'].length);
  current.className = current.className.replace(/inactive/,'active');

  var modify = ['taxa','concepts','columns','add_column'];
  for(i in modify)
  {
    tmp = document.getElementById(modify[i]);
    tmp.className = view.className.replace(/inactive/,'active');
  }
  $("#view").removeClass('active');
  $("#view").addClass("inactive");

  $("#settings").removeClass('inactive')
  $("#settings").addClass('active');  
}

function addColumn(event)
{
  var col = document.getElementById('add_column');
  
  if(event.keyCode != 13 )
  {
    return;
  }
  
  var name = col.value.trim();
  if(name == '')
  {
    col.value = '';
    return;
  }
  var base = function(i){return "?"};

  if(name.indexOf('>>') != -1)
  {
    var basename = name.split('>>');
    var basex = basename[0];

    var bases = basex.split(/\+/);
    var base = function(i){
      var new_entry = '';
      for(k in bases)
      {
        var tmp = bases[k];
        if(tmp.charAt(0) == '$')
        {
          var j = WLS['header'].indexOf(tmp.slice(1,tmp.length).toUpperCase());
          if(j != -1)
          {
            new_entry += WLS[i][j];
          }
          else
          {
            new_entry += tmp;
          }
        }
        else if(tmp.charAt(0) == '!')
        {
          try
          {
            var str = 'var x = '+tmp.slice(1,tmp.length)+'('+'"'+new_entry+'"); return x;';
            var F = new Function(str);
            new_entry = F();
          }
          catch(err)
          {
            db = document.getElementById('db');
            db.innerHTML = err;
            db.style.color = "red";
          }
        }
        else if(tmp.indexOf('(') != -1 && tmp.indexOf(')') != -1)
        {
            var str = 'var x = "'+new_entry+'".'+tmp+"; return x;";
            var F = new Function(str);
            new_entry = F();
        }
        else
        {
          new_entry += tmp;
        }
      }
      return new_entry;
    };
    var name = basename[1].toUpperCase();
  }
  
  if(name in WLS['columns'])
  {
    col.value = '';
    return;
  }
  
  for(idx in WLS)
  {
    if(!isNaN(idx))
    {
      WLS[idx].push(base(idx));
    }
  }
  WLS['header'].push(name);
  WLS['columns'][name] = WLS.header.length-1;
  if(BASICS.indexOf(name) == -1)
  {
    BASICS.push(name);
  }
  
  col.value = '';
  showWLS(1);
}

function editEntry(idx,jdx,from_idx,from_jdx)
{
  var line = document.getElementById('L_'+idx);
  var db = document.getElementById('db');
  var entry = line.childNodes[jdx];


  if(typeof entry == 'undefined')
  {
    return
  }
  else if(jdx < 1 || jdx - 1 == WLS["header"].length)
  {
    return
  }

  var col = document.getElementById(entry.className);
  
  if(col.style.visibility == 'collapse')
  {
    if(from_jdx > jdx)
    {
      editEntry(idx,jdx-1,from_idx,from_jdx);
    }
    else if(from_jdx < jdx)
    {
      editEntry(idx,jdx+1,from_idx,from_jdx);
    }
    return;
  }

  entry.onclick = '';
  var value = entry.innerHTML;
  var size = value.length + 5;
  var text = '<input type="text" size="'+size+'" id="modify_'+idx+'_'+jdx+'" value="'+value+'" />';
  entry.innerHTML = text;
  entry.innerText = value;

  modify = document.getElementById('modify_'+idx+'_'+jdx)
  modify.onkeyup = function(event){modifyEntry(event,idx,jdx)};
  modify.focus();
  modify.onblur = function(){unmodifyEntry(idx,jdx);};
}

function modifyEntry(event,idx,jdx)
{
  var process = false;

  /* get current index in the current view */
  var cdx = WLS['rows'].indexOf(idx);
  var bdx = WLS['rows'][cdx - 1];
  var ndx = WLS['rows'][cdx + 1];
  var j = parseInt(jdx) -1;

  if(event.keyCode == 38)
  {
    process = true;
    ni = bdx;
    nj = jdx;
  }
  else if(event.keyCode == 40)
  {
    process = true;
    ni = ndx;
    nj = jdx;
  }
  else if(event.keyCode == 37 && event.ctrlKey)
  {
    process = true;
    ni = idx;
    nj = jdx-1;
  }
  else if(event.keyCode == 39 && event.ctrlKey)
  {
    process = true;
    ni = idx;
    nj = jdx+1;
  }
  else if(event.keyCode == 27)
  {
    unmodifyEntry(idx,jdx);
    return
  }
  else if(event.keyCode != 13)
  {
    return
  }

  var modify = document.getElementById('modify_'+idx+'_'+jdx);
  var entry = modify.parentNode;
  entry.onclick = function(){editEntry(idx,jdx,0,0)};
  WLS[idx][j] = modify.value;
  entry.removeChild(modify);
  entry.innerHTML = modify.value;

  if(process == true)
  {
    editEntry(ni,nj,idx,jdx);
  }
}


function unmodifyEntry(idx,jdx)
{
  var modify = document.getElementById('modify_'+idx+'_'+jdx);
  var entry = modify.parentNode;
  value = entry.innerText;
  entry.onclick = function(){editEntry(idx,jdx,0,0)};
  var j = parseInt(jdx) - 1;
  WLS[idx][j] = value;
  entry.removeChild(modify);
  entry.innerHTML = value;
}


function filterWLS(event,type)
{
  var stuff = Object.keys(WLS[type]);
  
  function split( val ) {
    return val.split( /,\s*/ );
  }
  function extractLast( term ) {
    return split( term ).pop();
  }
  $( "#"+type ).bind( "keydown", function( event ) 
      {
        if ( event.keyCode === $.ui.keyCode.TAB &&  $( this ).data( "ui-autocomplete" ).menu.active ) 
        {
          event.preventDefault();
        }
      }
    ).autocomplete(
    {
      minLength: 0,
      source: function( request, response ) 
      {
        // delegate back to autocomplete, but extract the last term
        response( $.ui.autocomplete.filter(
        stuff, extractLast( request.term ) ) );
      },
      focus: function() 
      {
        // prevent value inserted on focus
        return false;
      },
      select: function( event, ui ) 
      {
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push( ui.item.value );
        // add placeholder to get the comma-and-space at the end
        terms.push( "" );
        this.value = terms.join( ", " );
        return false;
      }
    }
  );
  
  if(event.keyCode == 13)
  {
    applyFilter();
    showWLS(1);
  }
}

function applyFilter()
{
  var db = document.getElementById('db');
  db.innerHTML = '';

  var taxa = document.getElementById('taxa');
  var concepts = document.getElementById('concepts');
  var entries = document.getElementById('columns');

  var trows = [];
  var crows = [];
  var erows = [];

  var tlist = taxa.value.split(/,\s*/);
  var clist = concepts.value.split(/,\s*/);
  var elist = entries.value.toUpperCase().split(/,\s*/);

  if(tlist[0] == '')
  {
    tlist = Object.keys(WLS['taxa']);
  }
  if(clist[0] == '')
  {
    clist = Object.keys(WLS['concepts']);
  }
  if(elist[0] == '')
  {
    elist = [];
  }

  for(i in tlist)
  {
    if(tlist[i] != "")
    {
      trows.push.apply(trows,WLS['taxa'][tlist[i]]);
    }
  }
  for(i in clist)
  {
    if(clist[i] != "")
    {
      crows.push.apply(crows,WLS['concepts'][clist[i]]);
    }
  }
  for(i in WLS['header'])
  {
    var head = WLS['header'][i];
    if(elist.indexOf(head) != -1)
    {
      if(BASICS.indexOf(head) != -1)
      {
        WLS['columns'][head] = -Math.abs(WLS['columns'][head]);
      }
      else
      {
        WLS['columns'][head] = Math.abs(WLS['columns'][head]);
      }
    }
    else
    {
      if(BASICS.indexOf(head) == -1)
      {
        WLS['columns'][head] = -Math.abs(WLS['columns'][head]);
      }
      else
      {
        WLS['columns'][head] = Math.abs(WLS['columns'][head]);
      }
    }
  }

  /* sort both lists */
  trows.sort(function(x,y){return x-y});
  crows.sort(function(x,y){return x-y});

  /* function taken from http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript */
  function intersection_destructive(a, b)
  {
    var result = new Array();
    while( a.length > 0 && b.length > 0 )
    {  
       if      (a[0] < b[0] ){ a.shift(); }
       else if (a[0] > b[0] ){ b.shift(); }
       else /* they're equal */
       {
         result.push(a.shift());
         b.shift();
       }
    }
  
    return result;
  }
  rows = intersection_destructive(trows,crows);
  
  WLS['rows'] = rows.sort(function(x,y){return x-y;});
}

function filterColumns(event)
{
  if(event.keyCode != 13)
  {
    return;
  }
  var fields = document.getElementById('fields').value;
  
  if(fields == "")
  {
    var all_fields = WLS["header"];
  }
  else
  {
    var all_fields = fields.split(',');
    for(i in all_fields)
    {
      all_fields[i] = all_fields[i].trim().toUpperCase();
    }
  }

  for(i in WLS["header"])
  {
    var head = WLS["header"][i];
    var col = document.getElementById(head);
    if(all_fields.indexOf(head) != -1)
    {
      col.style.visibility = "visible";
    }
    else
    {
      col.style.visibility = "collapse";
    }
  }
}



/* file-handler function from http://www.html5rocks.com/de/tutorials/file/dndfiles/ */
function handleFileSelect(evt) 
{
  var files = evt.target.files; /* FileList object */

  var file = files[0];
  var store = document.getElementById('store');
  
  /* create file reader instance */
  var reader = new FileReader();
  //$.get('harry.msa', function(data){document.getElementById('store').innerText = data}, alert("loaded text"), 'text');
  reader.onload = function(e){store.innerText = reader.result;}
  reader.readAsText(file);

  var modify = ['view'];
  for(i in modify)
  {
    tmp = document.getElementById(modify[i]);
    tmp.className = view.className.replace(/inactive/,'active');
  }
  var modify = ["concepts","columns","taxa","add_column","previous","next","current"];
  for(i in modify)
  {
    $("#"+modify[i]).removeClass("active");
    $("#"+modify[i]).addClass("inactive");
  }
  document.getElementById("qlc").innerHTML = '';
}

