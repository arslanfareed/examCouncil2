//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});


app.get('/createCollectionRegisteration', function(req, res) {
  
  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {
    db.createCollection("registeration", function(err, res) {
      if (err) throw err;
      console.log("Collection registeration created!");
      
      res.send("Collection registeration Created");
    });
    res.send("Collection registeration Created")
  }
});



app.get('/createCollectionForm', function(req, res) {
  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {
    db.createCollection("registeration", function(err, res) {
      if (err) throw err;
      console.log("Collection members created!");
      
    });
      res.send("Collection Created")
  }

  
});


app.get('/insertDocument', function(req, res) {
 
  var firstName = req.query.firstName;
  var lastName = req.query.lastName;
  var userName = req.query.userName;
  var email = req.query.email;
  var password = req.query.password;
  var gender = req.query.gender;
  var category = req.query.category;
  var dob = req.query.dob;
  var schoolName = req.query.schoolName;
  var contactNo = req.query.contactNo;

  var emailverification = "";
  ///////////////////////////////////////////////////



  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {
db.collection("registeration").findOne({email:email, password:password},{}, function(err, result) {
if (err) throw err;
if(result){
emailverification = result;
console.log(result );
}
if(emailverification.email != email ){

  //////////////////////////////////////////////////
  
  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {
      var myobj = 
        { firstName:firstName,
          lastName:lastName,
          userName:userName,
          email:email,
          password:password,
          gender:gender,
          category:category,
          dob:dob,
          schoolName:schoolName,
          contactNo:contactNo };
      db.collection("registeration").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        
      });
    };
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers Authorization, Autho, X-Requested-With');
      console.log("Account Created");
      res.send('{"document":"inserted"}');
    }
    else{
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers Authorization, Autho, X-Requested-With');
      console.log("Email Already Exist");
      res.send('{"document":"Email Already Exist"}');
  
    }


});
};


});


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
