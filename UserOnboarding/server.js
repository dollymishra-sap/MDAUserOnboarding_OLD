/*eslint no-console: 0*/
"use strict";

const express = require('express');
const passport = require('passport');
const xsenv = require('@sap/xsenv');
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const app = express();



//=======================================================================================
//			HANA HARD Coded values
//=======================================================================================
var hana = require('@sap/hana-client');
var HANA_END_POINT = "5fbfc3dd-3658-4bc2-a256-03b1d668801b.hana.prod-eu10.hanacloud.ondemand.com:443"; //RAJA
var connOptions = {
              serverNode: HANA_END_POINT,
              //serverNode: 'your host:your port',
              UID: 'I065171',
              PWD: 'Abcd@12345',
              encrypt: 'true', //Must be set to true when connecting to SAP HANA Cloud
              sslValidateCertificate: 'false', //Must be set to false when connecting

};
//=======================================================================================





//=======================================================================================
//			Commented for local testing
//=======================================================================================
const services = xsenv.getServices({ uaa:'uaa_MDAUserOnboarding' });
passport.use(new JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));
//=======================================================================================


//=======================================================================================
//			Ping API
//=======================================================================================
app.get('/ping', (req, res) => {

res.send("Hello from UserOnBoarding Service");	
});



//=======================================================================================
//			GET API for checking if user is already onboarded
//=======================================================================================
app.get('/checkuser', function (req, res, next) {
	
	var responseJson = {};
	try{
			var user = req.user;
			var userEmail = user.id;
			// var userEmail = "raja.prasad.gupta@sap.com";
			// responseJson.HARD_CODED_VALUE = true;
			
			responseJson.USER_EMAIL_FROM_SESSION = userEmail;
			userEmail = userEmail.toUpperCase();
			
			//Fetch Data from HANA USER_ONBOARDING TABLE -- START
			var hanaDBConnection = hana.createConnection();
		    hanaDBConnection.connect(connOptions, function (err) {
			        if (err) {
			                console.log("========================= Error connecting to Database========================");
			                responseJson.ERROR = err;
			                responseJson.INFO = "Reached HANA CONENCTION ERROR Block";
			                // return console.error(err); //Error connecting to Database
			        }
					var sql = "select USER_EMAIL, ELEMENT_SECRET, CALENDER_ID, INSTANCE_NAME, USER_PASSCODE from MDA.USER_ONBOARDING WHERE USER_EMAIL = '" + userEmail + "' ;";
					console.log("SQL Statement: " + sql);
					var rows = hanaDBConnection.exec(sql, function (err, rows) {
					        if (err) {
						              console.log("========================= Error connecting to Database========================");
						              responseJson.ERROR = err;
						              responseJson.INFO = "Reached HANA QUERY EXECUTION ERROR Block";
						              //return console.error(err); //Error connecting to Database
					        }
					        else{
						        if (rows.length > 0) {
						        	console.log("RECORD FOUND");
						        		//Record found for given user email, check if element secret and other values exist too
							          	if(	rows[0].ELEMENT_SECRET !== null && rows[0].ELEMENT_SECRET !== ""
							          		&& rows[0].CALENDER_ID !== null && rows[0].CALENDER_ID !== ""
							          		&& rows[0].INSTANCE_NAME !== null && rows[0].INSTANCE_NAME !== ""
							          		){
							          		responseJson.IS_USER_AUTHORIZED = true;
							          		responseJson.TABLE_RECORD = JSON.stringify(rows[0]);
							          		responseJson.USER_PASSCODE = rows[0].USER_PASSCODE;
							          		
							          		console.log("USER is Authorized");
							          	}
						        } else {
						        	console.log("USER is not Authorized");
						        	responseJson.IS_USER_AUTHORIZED = false;
						        	responseJson.TABLE_RECORD = JSON.stringify(rows[0]);
						        }
					        }
					        hanaDBConnection.disconnect(function (err) {
					              if (err) {
					                    console.log("========================= Error disconnecting to Database========================");
					                     responseJson.ERROR = err;
					                     responseJson.INFO = "Reached HANA Connection Disconnect ERROR Block";
					                     //return console.error(err);
					              }
					              console.log("HANA Connection Closed");
					        });
		    		});
		    });
		    //Fetch Data from HANA USER_ONBOARDING TABLE -- END
		
	}
	catch(error){
		console.log("========================= Catch Block========================");
		responseJson.ERROR = error;
		responseJson.INFO = "Reached Catch Block";
	}
	console.log("Time out starts");
	setTimeout(() => {
			res.send(responseJson);
		}, 2000);
	console.log("Time out ends");
	
	
	// //Fetch Data from HANA USER_ONBOARDING TABLE -- START
	// var hanaDBConnection = hana.createConnection();
 //   hanaDBConnection.connect(connOptions, function (err) {
	//         if (err) {
	//                 console.log("========================= Error connecting to Database========================");
	//                 return console.error(err); //Error connecting to Database
	//         }
	// 		var sql = "select ID, USER_EMAIL, USER_PASSCODE from MDA.USER_ONBOARDING;";
	// 		var rows = hanaDBConnection.exec(sql, function (err, rows) {
	// 		        if (err) {
	// 			              console.log("========================= Error connecting to Database========================");
	// 			              return console.error(err); //Error connecting to Database
	// 		        }
	// 		        if (rows.length > 0) {
	// 			          for (var i in rows) {
	// 			          	var userOnboardingRecord = {};
	// 			          	userOnboardingRecord.ID = rows[i].ID;
	// 			          	userOnboardingRecord.USER_EMAIL = rows[i].USER_EMAIL;
	// 			          	userOnboardingRecord.USER_PASSCODE = rows[i].USER_PASSCODE;
	// 			          	userOnboardingDataFromTable.push(userOnboardingRecord);
	// 			          }
	// 		        } else {
	// 		        	//No record found, userOnboardingDataFromTable array would not be filled
	// 		        }
	// 		        hanaDBConnection.disconnect(function (err) {
	// 		              if (err) {
	// 		                    console.log("========================= Error disconnecting to Database========================");
	// 		                     return console.error(err);
	// 		              }
	// 		        });
 //   		});
 //   });
 //   //Fetch Data from HANA USER_ONBOARDING TABLE -- END

});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('app listening on port ' + port);
});