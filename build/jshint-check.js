var JSHINT = require("./lib/jshint").JSHINT,
	  print = require("sys").print;

if(process.argv.length < 3){
  print("Missing 3rd parameter to file path to run checks on");
  process.exit(1);
}

var src = require("fs").readFileSync(process.argv[2], "utf8");

JSHINT(src, {evil: true, eqeqeq: false, forin: false, maxerr: 100, 'continue':true});

// All of the following are known issues that we think are 'ok'
// (in contradiction with JSLint) more information here:
// http://docs.jquery.com/JQuery_Core_Style_Guidelines
var ok = {
	"Expected an identifier and instead saw 'undefined' (a reserved word).": true,
	"Expected a conditional expression and instead saw an assignment.": true,
	"Insecure '.'.": true,
	"Insecure '^'.": true,
	'Missing "use strict" statement.': true
};

var e = JSHINT.errors, found = 0, w;

for ( var i = 0; i < e.length; i++ ) {
	w = e[i];
	
	if ( !ok[ w.reason ] ) {
		found++;
		print( "\n" + w.evidence + "\n" );
		print( "    Problem at line " + w.line + " character " + w.character + ": " + w.reason );
	}
}

if ( found > 0 ) {
	print( "\n" + found + " Error(s) found.\n" );
	
} else {
	print( "JSLint check passed.\n" );
}

