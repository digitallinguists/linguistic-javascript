# Bibliography Display on Websites

## Possible workflow

* load bibliography file (by source specification) into object
* add specific output possibilities
  - inline quoting (specific entry, specific styling, etc.)
  - printing bibliography (all entries, filter entries, per entry)

General goal is to create some JS package that is similar in power with bibtex in Latex documents. 

## Angular.js example (angularjs)

A bibliography interface in JavaScript using Angular.js, parse-bibtex.js
and Bootstrap. It features two main views (list and detail view) with 
search and sort functionalities.

* #/ shows a list of all entries in tabular format. Clicking on the column
headers sorts the table according to the respective column (in increasing and
decreasing order)
* #/:bibentry shows a detailed view of a bibliography entry including a cite 
and BibTeX representation of the entry

TODOs:

* write a better cite representation of entries (for different citation styles)
* write representation functions for the entries depending on their views
