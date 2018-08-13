# MoveHQ PDF Converter
-node server.js

-send json post request to localhos:3000/pdf (default)

body {


	{
	
		"requested_report": "{{report lcoation}}",

		"reportID": {{}},

		"data_type": {{'xml or 'json'}},

		"data_xml": "{{xml as a string}}",

		"data_json": {{json}}
	
	}

