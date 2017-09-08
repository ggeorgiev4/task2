// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var fs         = require('fs');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /messages
// ----------------------------------------------------
router.route('/messages')

	// create a message (accessed at POST http://localhost:8080/messages)
	.post(function(req, res) {
		fs.readFile('broadcast.log', 'utf8', function(err, data) {
			var messageLen = req.body.message.length;
			var freeSpace = 100 - data.length;
			var freeSpaceForNewMessage = 100 - (messageLen + 2); // added 2 (bytes) for the line break

			if (messageLen > 100) {
				res.setHeader('Content-Type', 'application/json');
			    res.write(JSON.stringify({ error: 'Message too long!', message: {
					username: req.body.username,
					recipient: req.body.recipient,
					message: req.body.message
				}}));
				res.end();
				return;
			};

			if (freeSpace < messageLen) {
				//removing the needed space to append the new message on a new line
				var newData = data.substr(data.length - freeSpaceForNewMessage, freeSpaceForNewMessage)
				fs.writeFile('broadcast.log', newData + "\r\n" + req.body.message);
				if (err) throw err;
				res.setHeader('Content-Type', 'application/json');
			    res.write(JSON.stringify({ message: {
					username: req.body.username,
					recipient: req.body.recipient,
					message: req.body.message
				} }));
				res.end();
			}

			//get file content size and check if there is enough space for the comming message
			if (data.length < 100 && (messageLen <= (100 - data.length))) {
				var content = req.body.message;

				if (data.length) {
					content = "\r\n" + req.body.message;
				}
				//appending the new message to the file
				fs.writeFile('broadcast.log', content , function (err) {
				  if (err) throw err;
					res.setHeader('Content-Type', 'application/json');
					res.write(JSON.stringify({ message: {
						username: req.body.username,
						recipient: req.body.recipient,
						message: req.body.message
					}}));
					res.end();
				});
			}
		});	
	})
// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
