// Load source.csv in startup

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "sources.csv",
        dataType: "text",
        success: function(data) { processSources(data); }
     });
});

$('select#sourceSelector').change(function () {
    var qlcId = $(this).val();
    if (qlcId != 'None') {
        $.ajax({
            type: "GET",
            url: "sources.csv",
            dataType: "text",
            success: function(data) { processFiles(qlcId, data); }
         });
    }
});

$('select#fileSelector').change(function () {
    var csvFile = $(this).val();
    if (csvFile != 'None') {
        $('div#downloadFile').html('<a href="' + csvFile + '">download source as CSV</a>')
        $.ajax({
            type: "GET",
            url: csvFile,
            dataType: "text",
            success: function(data) { processFile(data); }
         });
    }
});

function createList() {
    var options = {
        valueNames: [
            'QLCID',
            'HEAD',
            'HEAD_DOCULECT',
            'TRANSLATION',
            'TRANSLATION_DOCULECT',
            'POS'
        ],
        page : 500,
        plugins: [
            ListPagination({
                outerWindow: 1,
                innerWindow: 5
            })
        ]
    };
    var entriesList = new List('entries', options);
    return entriesList
}

function processFile(allText) {
    //var entries = $.csv.toArrays(allText, { separator : '\t', startIndex : 32 });
    var entries = csvToArrays(allText, '\t');
    var firstLineFound = false;
    var items = []
    entries.forEach(function (entry) {
        // here comes the data
        if (entry.length >= 6) {
            items.push({
                QLCID: entry[0],
                HEAD: entry[1],
                HEAD_DOCULECT: entry[2],
                TRANSLATION: entry[3],
                TRANSLATION_DOCULECT: entry[4],
                POS: entry[5] });
        }
    });
    var entriesList = createList();
    entriesList.clear();
    entriesList.add(items);
    entriesList.update();
}

function processFiles(qlcID, allText) {
    //var sources = $.csv.toArrays(allText, { separator : '\t' });
    var sources = csvToArrays(allText, '\t');
    sources.forEach(function (source) {
        if (source[0] == qlcID) {
            files = source[6].split(",")
            // remove all options
            var filesSelect = $("select#fileSelector");
            filesSelect.find('option').remove();
            filesSelect.append(new Option("...", "None"));
            files.forEach(function (file) {
                filesSelect.append(new Option(file, file));
            });
        }
    });
}

function processSources(allText) {
    //var sources = $.csv.toArrays(allText, { separator : '\t' });
    var sources = csvToArrays(allText, '\t');
    sources.forEach(function (source) {
        if ( (source[0] != 'QLCID') && (source[1] == 'dictionary') )
            $("select#sourceSelector").append(new Option(source[4], source[0]));
    });
}

function csvToArrays(allText, separator) {
    var allTextLines = allText.split(/\r\n|\n/);
    var lines = [];
    var firstLineFound = false;
    for (var i=0; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(separator);
        if (data[0] == "QLCID") {
            //var headers = allTextLines[0].split(',');
            firstLineFound = true;
        } else if (firstLineFound) {
            lines.push(data);
        }
    }
    return lines;
}