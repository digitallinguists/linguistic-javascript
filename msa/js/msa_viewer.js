if (window.File && window.FileReader && window.FileList && window.Blob) 
{
}
else
{
  alert("The File APIs are not fully supported in this browser.");
}

var MSA = {};
MSA['taxa'] = {};
MSA['sequences'] = {};
MSA['ans'] = {};
MSA['width'] = 0;
MSA["type"] = 'basic';
MSA['taxlen'] = 0;

var msa_status = {};
msa_status['parsed'] = false;
msa_status['edited'] = false;
msa_status['mode'] = 'basic';

function parseMSA()
{
  var store = document.getElementById('store');
  var text = store.innerText;
  var display = document.getElementById('msa');
  
  //var db = document.getElementById('db');

  var lines = text.split(/\r\n|\n/);

  /* define a sequence index */
  var sid = 1;

  /* define array of unique sequences */
  var uniques = [];
  var unique_taxa = [];
  var sequences = {};

  for (var i = 0; i < lines.length; i++)
  {
    var start = lines[i].slice(0,1);

    if (start == '#'){}
    else if (start == ':'){} /* nothing for the moment */
    else if (start == '@')
    {
      keyval = lines[i].split(':');
      key = keyval[0].replace(/@/,'');
      val = keyval[1].replace(/^\s*/,'').replace(/\s*$/,'');
      MSA[key] = val;
    }
    else
    {
      taxalignments = lines[i].split('\t');
      if (taxalignments[0].replace(/\./g,'') in keywords)
      {
	      MSA['ans'][taxalignments[0].replace(/\./g,'')] = taxalignments.slice(1,taxalignments.length);
      }
      else if (taxalignments.length == 1)
      {
	      if (i == 0)
	      {
	        MSA['dataset'] = lines[i];
	      }
	      else if (i == 1)
	      {
	        MSA['alignment'] = lines[i];
	      }
      }
      else
      {
	      /* check if MSA is in the typical ID system */
	      if(isNaN(taxalignments[0]))
	      {
          var alignment = taxalignments.slice(1,taxalignments.lenght);
          var taxon = taxalignments[0].replace(/\./g,'')+'_'+sid;
          
          /* modify taxon length */
          if(taxalignments[0].length > MSA['taxlen']){MSA['taxlen'] = taxalignments[0].length;}

          var sequence = alignment.join('').replace(/-/g,'');

          MSA['taxa'][taxon] = alignment;

          if(alignment.length > MSA['width']){MSA['width'] = alignment.length;}

          var idx = uniques.indexOf(sequence);
          if(idx == -1)
          {
            var tmp_taxa = [taxon];
            sequences[sequence] = tmp_taxa;
            uniques.push(sequence);
            unique_taxa.push(taxon);
          }
          else
          {
            sequences[sequence].push(taxon);
          }
          sid += 1;

	      }
	      else
	      {
          MSA["type"] = 'with_id';
          
	        if(taxalignments[0] == '0')
	        {
	          MSA['ans'][taxalignments[1].replace(/\./g,'')] = taxalignments.slice(2,taxalignments.length);
	        }
	        else
	        {
            var taxon = taxalignments[1].replace(/\./g,'')+'_'+taxalignments[0];
            
            /* modify taxon length */
            if(taxalignments[1].length > MSA['taxlen']){MSA['taxlen'] = taxalignments[1].length;}

            var alignment = taxalignments.slice(2,taxalignments.length);
            var sequence = alignment.join('').replace(/-/g,'');
            sid = taxalignments[0];

            MSA['taxa'][taxon] = alignment;

            var idx = uniques.indexOf(sequence);
            if(idx == -1)
            {
              var tmp_taxa = [taxon];
              sequences[sequence] = tmp_taxa;
              uniques.push(sequence);
              unique_taxa.push(taxon);
            }
            else
            {
              sequences[sequence].push(taxon);
            }

            if(alignment.length > MSA['width']){MSA['width'] = alignment.length;}
            
	        }
	      }
      }
    }
  }

  /* append uniques to MSA to make it global */
  MSA['uniques'] = unique_taxa;
  MSA['sequences'] = sequences;
  msa_status['parsed'] = true;
}

function showMSA(unique)
{
  /* parse MSA files */
  if(msa_status['parsed'] == false) 
  {
    parseMSA();
  }

  var msa = document.getElementById('msa');
  msa.innerHTML = '';
  
  var text = '<table id="msa_table">';
  if ("dataset" in MSA)
  {
    text += '<tbody id="msa_head"><tr class="header"><th id="dataset" class="header" colspan="'+(MSA['width']+1)+'">DATASET: '+MSA['dataset']+"</th></tr>";
  }
  if ("alignment" in MSA)
  {
    text += '<tr class="header"><th id="alignment" class="header" colspan="'+(MSA['width']+1)+'">ALIGNMENT: '+MSA['alignment']+'</th></tr></tbody>';
  }
  //text += '<table id="msa">';
  
  if(unique)
  {
    var taxa = MSA['uniques'];
    msa_status['mode'] = 'edit';
    document.getElementById('refresh').className = "submit active";
  }
  else
  {
    var taxa = [];
    for (key in MSA['taxa']){taxa.push(key)}
    msa_status['mode'] = 'show';
    var refresh = document.getElementById('refresh').className = "submit inactive";
  }
  
  /* no clics for show-mode */
  /* current solution is not nice in terms of modularity, it should be modified later on! */
  if(unique)
  {
    /* append tbodies */
    text += '<tbody id="msa_body">';
    
    var idx = 1;

    for (var i in taxa.sort())
    {
      var taxon = taxa[i].replace(/_[0-9]+$/,'');

      text += '<tr id="'+taxa[i]+'" class="alm_row"><th class="taxon">'+taxon+'</th>';
      var k = 1;
      var gap = 0;
      for (var j in MSA['taxa'][taxa[i]])
      {
        var phon = MSA['taxa'][taxa[i]][j];

        /* now try to find the column */
        var dolgo = "dolgo_ERROR";
        if (phon in DOLGO){dolgo = "dolgo_"+DOLGO[phon]}
        else if (phon.slice(0,2) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(0,2)];}
        else if (phon.slice(0,1) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(0,1)];}
        else if (phon.slice(1,3) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(1,3)];}
        else if (phon.slice(1,2) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(1,2)];}
        else if (phon == "-"){dolgo = "dolgo_GAP";}
        
        if(phon != '-')
        {            
	        text += '<td title="insert gap" id="'+taxa[i]+'_'+k+'" onclick="addGap('+"'"+taxa[i]+'_'+k+"'"+')" class="residue '+dolgo+'">'+phon+'</td>';
	        k += 1;
	        gap = 0;
              }
              else
              {
	        gap += 1;
	        text += '<td title="delete gap" id="'+taxa[i]+'_'+k+'_gap" onclick="deleteGap('+"'"+taxa[i]+'_'+k+'_gap'+"'"+')" class="residue '+dolgo+'">'+phon+'</td>';
        }
      }
      text += '<td id="'+taxa[i]+'_last'+'" class="new_gap" title="insert gap" onclick="addGap('+"'"+taxa[i]+'_last'+"'"+')"></tr>';
    }
    text += '</tbody>';
  }
  else
  {
    /* append tbodies */
    text += '<tbody id="msa_body">';

    for (var i in taxa.sort())
    {
      var taxon = taxa[i].replace(/_[0-9]+$/,'');

      text += '<tr id="'+taxa[i]+'" class="alm_row"><th class="taxon">'+taxon+'</th>';
      var k = 1;
      var gap = 0;
      for (var j in MSA['taxa'][taxa[i]])
      {
        var phon = MSA['taxa'][taxa[i]][j];

        /* now try to find the column */
        var dolgo = "dolgo_ERROR";
        if (phon in DOLGO){dolgo = "dolgo_"+DOLGO[phon]}
        else if (phon.slice(0,2) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(0,2)];}
        else if (phon.slice(0,1) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(0,1)];}
        else if (phon.slice(1,3) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(1,3)];}
        else if (phon.slice(1,2) in DOLGO){dolgo = "dolgo_"+DOLGO[phon.slice(1,2)];}
        else if (phon == "-"){dolgo = "dolgo_GAP";}
        
        if(phon != '-')
        {
	        text += '<td id="'+taxa[i]+'_'+k+'" class="residue_show '+dolgo+'">'+phon+'</td>';
	        k += 1;
	        gap = 0;
              }
              else
              {
	        gap += 1;
	        text += '<td id="'+taxa[i]+'_'+k+'_gap"  class="residue_show '+dolgo+'">'+phon+'</td>';
        }
      }
      text += '</tr>';
    }
    text += '</tbody>';
  }

  //if(MSA['ans'].length >= 1){
  text += '<tbody id="msa_annotation"><tr><td colspan="'+(MSA['width']+1)+'"></td></tr>'; //}
  
  for (annotation in MSA['ans'])
  {
    text += '<tr class="annotation_row">';
    text += '<td class="annotation_type">'+annotation+'</td>';
    
    var ans = MSA['ans'][annotation];
    for (var j in ans)
    {
      if(ans[j] != '.')
      {
	text += '<td class="annotation">'+MSA['ans'][annotation][j]+'</td>';
      }
      else
      {
	text += '<td class="annotation"></td>';
      }
    }
    text += '</tr>';
  }
  //if(MSA['ans'].length >= 1){
  text += '</tbody>'; //}

  text += '</table>';

  msa.innerHTML = text;

  if(msa_status['mode'] == 'edit')
  {
    document.getElementById('msa_body').rows[0].childNodes[0].className += ' active';
var active;
$(document).keydown(function(e){
    active = $('td.active').removeClass('active');
    var x = active.index();
    var y = active.closest('tr').index();
    if (e.keyCode == 37) { 
       x--;
    }
    if (e.keyCode == 38) {
        y--;
    }
    if (e.keyCode == 39) { 
        x++
    }
    if (e.keyCode == 40) {
        y++
    }
    active = $('tr').eq(y).find('td').eq(x).addClass('active');
});}
}


function initialize()
{
  msa_status['edited'] = false;
  msa_status['parsed'] = false;
  for(i in params)
  {
    document.getElementById(params[i]).className = "submit inactive";
  }
}

/* file-handler function from http://www.html5rocks.com/de/tutorials/file/dndfiles/ */
function handleFileSelect(evt) 
{
  var files = evt.target.files; /* FileList object */

  var file = files[0];
  var store = document.getElementById('store');
  
  /* clean inner text */
  //store.innerText = '';

  /* clean MSA reference */
  for (key in MSA)
  {
    if (key != 'taxa' && key != 'ans')
    {
      MSA[key] = '';
    }
    else
    {
      MSA[key] = {};
    }
  }
  MSA['filename'] = file.name;

  /* create file reader instance */
  var reader = new FileReader();
  //$.get('harry.msa', function(data){document.getElementById('store').innerText = data}, alert("loaded text"), 'text');
  reader.onload = function(e){store.innerText = reader.result;}
  reader.readAsText(file);
  
  /* toggle activity of other buttons */
  var view = document.getElementById('view').className = "submit active";
  var view = document.getElementById('edit').className = "submit active";
}


/* idea from http://stackoverflow.com/questions/4492678/to-swap-rows-with-columns-of-matrix-in-javascript-or-jquery */
function transpose(a) {
    return Object.keys(a[0]).map(
        function (c) { return a.map(function (r) { return r[c]; }); }
        );
    }


function normalizeMSA()
{
  /* disallow refreshing in show-mode */
  if(msa_status['mode'] == 'show'){return}

  /* get the table first */
  var rows = document.getElementById('msa_body').rows;
  
  //var matrix = createArray(rows.length,rows[0].length);
  //

  /* get longest sequence in rows */
  var maxlen = 0;
  
  for(i=0;i<rows.length;i++)
  {
    var len = rows[i].childNodes.length;

    if(len > maxlen)
    {
      maxlen = len;
    }
  }
  
  /* iterate over rows and store gapped columns in a matrix */
  var matrix = [];
  for(var i=0;i<rows.length; i++)
  {
    var tmp = [];
    for(var j=1;j<maxlen-1;j++)
    {
      if(typeof rows[i].childNodes[j] == 'undefined')
      {
        tmp.push(-1);
      }
      else
      {
        if(rows[i].childNodes[j].innerHTML == '-')
        {
          tmp.push(0);
        }
        else if(rows[i].childNodes[j].className.indexOf('residue') != -1)
        {
          tmp.push(1);
        }
        else
        {
          tmp.push(-1);
        }
      }
    }
    matrix.push(tmp);
  }

  /* transpose the matrix */
  var tmatrix = transpose(matrix);

  /* now iterate over tmatrix and identify 
   * a) the cases of gapped columns, and
   * b) the cases of undefined values (they should be gapped)
   */
  var db = document.getElementById('db');
  db.innerHTML = '';
  //for(i in tmatrix)
  //{
  //  db.innerHTML += tmatrix[i].join(' ')+'<br>';
  //}

  var gaps = [];
  for(i in tmatrix) //var i=tmatrix.length-1;i>-1;i--)// in tmatrix)
  {
    for(j=tmatrix[0].length-1;j>-1;j--)
    {
      if(tmatrix[i][j] == -1)
      {
        var idx = rows[j].childNodes.length -1;
        var sid = rows[j].childNodes[idx].id;
        addGap(sid);
        tmatrix[i][j] = 0;
      }
    }
  }

  for(i in tmatrix) 
  {
    if(tmatrix[i].reduce(function(p,c){return p+c;}) == 0)
    {
      gaps.push(i);
    }
  }
  
  /* reduce the gaps */
  for(i=0;i<rows.length;i++)
  {
    for(j=gaps.length-1;j>-1;j--) //<gaps.length;j++)
    {
      var idx = parseInt(gaps[j]) + 1;
      rows[i].deleteCell(idx);
    }
  }
  
  // append the date to MSA object
  MSA['modified'] = getDate();

  /* update the hidden button */
  var store = document.getElementById('store');
  store.innerText = '';
  for(key in MSA)
  {
    if(key != 'taxa' && key != 'ans' && privates.indexOf(key) == -1)
    {
      store.innerText += '@'+key+': '+MSA[key]+'\n';
    }
  }

  for(i=0;i<rows.length;i++)
  {
    var row = rows[i].childNodes;
    var alm = [];
    for(j=0;j<row.length-1;j++)
    {
      alm.push(row[j].innerHTML);
    }

    /* modify MSA['taxa'] */
    var alignment = alm.slice(1,alm.length);
    var sequence = alignment.join('').replace(/-/g,'');

    //db.innerHTML += ' x '+sequence;
    //db.innerHTML = 'MODE: '+MSA["type"];

    for(j in MSA['sequences'][sequence])
    {
      var idx = MSA['sequences'][sequence][j];
      MSA['taxa'][idx] = alignment;
      
      var seqid = idx.replace(/^.*_/,'');
      var taxon = idx.replace(/_[0-9]+$/,'');

      /* append data to store */
      if(MSA["type"] == 'with_id')
      {
        store.innerText += seqid + '\t' + fillWithDots(taxon,MSA['taxlen']) + '\t' + alignment.join('\t') + '\n';
      }
      else
      {
        store.innerText += fillWithDots(taxon, MSA['taxlen']) + '\t' + alignment.join('\t')+'\n';
      }
    }
  }

  /* change MSA width */
  MSA['width'] = alignment.length;
  showMSA(true);
  undoManager.clear();

  /* toggle activity of other buttons */
  document.getElementById('undo_button').className = "submit inactive";
  document.getElementById('redo_button').className = "submit inactive";
  document.getElementById('save').className = "submit active";

  msa_status['edited'] = true;

}

function addGap(sid)
{
  var phon = document.getElementById(sid);
  
  /* get the parent node */
  var tr = phon.parentNode;

  /* insert new td element */
  var new_cell = tr.insertCell(phon.cellIndex);
  new_cell.className = "residue";
  new_cell.className += " dolgo_Gap";
  new_cell.innerHTML = "-";
  new_cell.id = sid+'_gap';
  new_cell.onclick = function(){deleteGap(sid+'_gap')};
  new_cell.title = 'delete gap';

  /* add stuff to undo-manager */
  undoManager.add(
      {
        undo: function(){deleteGap(sid+'_gap');},
        redo: function(){addGap(sid);}
      });

  /* toggle activity of buttons */
  document.getElementById('undo_button').className = "submit active";
  document.getElementById('redo_button').className = "submit active";
}

function deleteGap(sid)
{
  var gap = document.getElementById(sid);
  var tr = gap.parentNode;
  tr.deleteCell(gap.cellIndex);

  /* make undoable */
  undoManager.add(
      {
        undo: function(){addGap(sid.replace(/_gap/,''));},
        redo: function(){deleteGap(sid);}
      });
  /* toggle activity of buttons */
  document.getElementById('undo_button').className = "submit active";
  document.getElementById('redo_button').className = "submit active";

}


// content is the data you'll write to file<br/>
// filename is the filename<br/>
// what I did is use iFrame as a buffer, fill it up with text
function exportFile()
{
  /* disallow safing when document was not edited */
  if(msa_status['edited'] == false){return}
  
  var store = document.getElementById('store');
  var blob = new Blob([store.innerText], {type: "text/plain;charset=utf-8"});
  saveAs(blob, MSA['filename']);  
 
}

function getDate()
{
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var hh = today.getHours();
  var mins = today.getMinutes();
  
  if(dd<10) {
      dd='0'+dd
  } 
  
  if(mm<10) {
      mm='0'+mm
  } 
  
  today = [yyyy,mm,dd].join('-')+' '+hh+':'+mins;
  return today;
}

/* fill string with dots */
function fillWithDots(name,len)
{
  var dots = '.......................................';
  return name + dots.substring(0,len-name.length);
}

