function editDist()
{
  var stringA = document.getElementById("stringA").value;
  var stringB = document.getElementById("stringB").value;

  if(stringA == '' || stringB == '')
  {
    return;
  }

  var alen = stringA.length;
  var blen = stringB.length;

  var matrix = [];
  for(var i=0;i<alen+1;i++)
  {
    var inline = [];
    for(var j=0;j<blen+1;j++)
    {
      inline.push(0);
    }
    matrix.push(inline);
  }
  
  
  // initialize matrix
  for(i=1;i<blen+1;i++)
  {
    matrix[0][i] = i;
  }
  for(i=1;i<alen+1;i++)
  {
    matrix[i][0] = i;
  }

  var traceback = [];
  for(var i=0;i<alen+1;i++)
  {
    var inline = [];
    for(var j=0;j<blen+1;j++)
    {
      inline.push(0);
    }
    traceback.push(inline);
  }
  

  // initialize traceback
  for(i=1;i<blen+1;i++)
  {
    traceback[0][i] = 2;
  }
  for(i=1;i<alen+1;i++)
  {
    traceback[i][0] = 1;
  }

  var db = document.getElementById('db');
  db.innerHTML = '';

  // iterate
  for(i=1;i<alen+1;i++)
  {
    for(j=1;j<blen+1;j++)
    {
      var a = stringA.slice(i-1,i);
      var b = stringB.slice(j-1,j);
      
      if(a == b)
      {
        var dist = matrix[i-1][j-1];
      }
      else
      {
        var dist = matrix[i-1][j-1]+1;
      }
      
      var gapA = matrix[i-1][j]+1;
      var gapB = matrix[i][j-1]+1;

      if(dist < gapA && dist < gapB)
      {
        matrix[i][j] = dist;
      }
      else if(gapA < gapB)
      {
        matrix[i][j] = gapA ;
        traceback[i][j] = 1;
      }
      else
      {
        matrix[i][j] = gapB;
        traceback[i][j] = 2;
      }
      
      // debug
      db.innerHTML += matrix[i][j] + ' ';
    }
    db.innerHTML += "<br>";
  }
  
  // no other stupid language needs this line apart from JS!!!
  var i = matrix.length-1;
  var j = matrix[0].length-1;

  db.innerHTML += i+' '+j+"<br>";

  // get edit-dist
  var ED = matrix[i][j];

  // get the alignment //
  var almA = [];
  var almB = [];

  while(i > 0 || j > 0)
  {
    if(traceback[i][j] == 0)
    {
      almA.push(stringA.slice(i-1,i));
      almB.push(stringB.slice(j-1,j));
      i--;
      j--
    }
    else if(traceback[i][j] == 1)
    {
      almA.push(stringA.slice(i-1,i));
      almB.push("-");
      i--;
    }
    else
    {
      almA.push("-");
      almB.push(stringB.slice(j-1,j));
      j--
    }   
  }
  
  /* reverse alignments */
  almA = almA.reverse();
  almB = almB.reverse();

  var db = document.getElementById('db');
  db.innerHTML += "<pre><code>"
  for(i in traceback)
  {
    db.innerHTML += traceback[i].join("\t")+"<br>";
  }
  db.innerHTML += "</code></pre>";
  
  /* get index for identical elements */
  var almas = '';
  var almbs = '';
  var idx = [];
  for(i=0;i<almA.length;i++)
  {
    var charA = almA[i];
    var charB = almB[i];
    if(charA == charB)
    {
      almas += '<td class="alm match">'+charA+'</td>';
      almbs += '<td class="alm match">'+charB+'</td>';
    }
    else if(charA == "-" || charB == "-")
    {
      almas += '<td class="alm gap">'+charA+"</td>";
      almbs += '<td class="alm gap">'+charB+"</td>";
    }
    else
    {
      almas += '<td class="alm mismatch">'+charA+"</td>";
      almbs += '<td class="alm mismatch">'+charB+"</td>";
    }
  }
  var output = '';
  output = '<br>';
  output += "<b>Edit-Distance: "+ED+"</b><br><br>";
  output += "<b>Alignment:</b><br><br>";
  output += "<table>";
  output += "<tr>"+almas+"</tr>";
  output += "<tr>"+almbs+"</tr>";
  output += "</table>";

  document.getElementById('output').innerHTML = output; 
  
   
}
