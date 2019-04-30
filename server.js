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
/*
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
*/
app.get('/', function(req, res) {
  userName = req.query.user;
  password = req.query.pass;
  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {
  db.collection("registeration").findOne({email:userName, password:password},{}, function(err, result) {
    if (err) throw err;
    data = result;
    console.log(result);
    db.close();
  });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers Authorization, Autho, X-Requested-With');
  res.send(JSON.stringify(data));
  
};



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

app.get('/formSubmit', function(req, res) {
 
  var state = req.query.state;
  var localGovt = req.query.localGovt;
  var disability = req.query.disability;
  var schoolName = req.query.schoolName;
  var dob = req.query.dob;
  var coreSubject1 = req.query.coreSubject1;
  var coreSubject2 = req.query.coreSubject2;
  var coreSubject3 = req.query.coreSubject3;
  var es1 = req.query.es1;
  var es2 = req.query.es2;
  var es3 = req.query.es3;
  var es4 = req.query.es4;
  var es5 = req.query.es5;
  var es6 = req.query.es6;
  var s11 = req.query.s11;
  var s12 = req.query.s12;
  var s13 = req.query.s13;
  var s14 = req.query.s14;
  var s15 = req.query.s15;
  var s16 = req.query.s16;
  var s17 = req.query.s17;
  var s18 = req.query.s18;
  var s19 = req.query.s19;
  var s21 = req.query.s21;
  var s22 = req.query.s22;
  var s23 = req.query.s23;
  var s24 = req.query.s24;
  var s25 = req.query.s25;
  var s26 = req.query.s26;
  var s27 = req.query.s27;
  var s28 = req.query.s28;
  var s29 = req.query.s29;
  var s31 = req.query.s31;
  var s32 = req.query.s32;
  var s33 = req.query.s33;
  var s34 = req.query.s34;
  var s35 = req.query.s35;
  var s36 = req.query.s36;
  var s37 = req.query.s37;
  var s38 = req.query.s38;
  var s39 = req.query.s39;
  var email = req.query.email;
  


  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {

  var myobj = 
    { state: state,
      localGovt: localGovt, 
      disability: disability, 
      schoolName: schoolName,
      dob: dob,
      coreSubject1: coreSubject1,
      coreSubject2: coreSubject2,
      coreSubject3: coreSubject3,
      es1: es1,
      es2: es2,
      es3: es3,
      es4: es4,
      es5: es5,
      es6: es6, 
      s11: s11,
      s12: s12,
      s13: s13, 
      s14: s14,
      s15: s15,
      s16: s16,
      s17: s17,
      s18: s18,
      s19: s19,
      s21: s21,
      s22: s22,
      s23: s23,
      s24: s24,
      s25: s25,
      s26: s26,
      s27: s27,
      s28: s28,
      s29: s29,
      s31: s31,
      s32: s32,
      s33: s33,
      s34: s34,
      s35: s35,
      s36: s36,
      s37: s37,
      s38: s38,
      s39: s39,
      email: email,
      submission: "submitted" };
  db.collection("forms").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 form inserted");
    console.log(req.query.schoolName)
    console.log(schoolName);
    
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers Authorization, Autho, X-Requested-With');
  res.send('{"form":"inserted"}');
};
  
});



app.get('/checkSubmission', function(req, res) {
  var email = req.query.email;
  var data = "";
  if (!db) {
    initDb(function(err){});
  }
 
  if (db) {
  console.log(email);
  db.collection("forms").findOne({email:email},{}, function(err, result) {
    if (err) throw err;
    if(result){
    data = result;
    console.log(result);
    console.log("Form Already Submitted");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers Authorization, Autho, X-Requested-With');
//  res.send("Hellow World");
    res.send(JSON.stringify(data));
    
    }
    else{
      data = {submission:"not submitted"};
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers Authorization, Autho, X-Requested-With');
//  res.send("Hellow World");
      res.send(JSON.stringify(data));
      console.log("Form is not Submitted");
      
    }
    
  });
};
//  res.send(userName);


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
