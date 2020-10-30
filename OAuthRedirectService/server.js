//TEST Prachi
//Microsoft link  followed :https://docs.microsoft.com/en-us/graph/auth-v2-user
// authentication URL 
//https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=c4cf925c-250b-4a99-be47-cbf18a0cd618&response_type=code&redirect_uri=https://hujnncu11fw60bsisoftauthuser-test.cfapps.eu10.hana.ondemand.com/getToken&response_mode=query&scope=offline_access+Calendars.Read+Calendars.ReadWrite+Contacts.ReadWrite.Shared&state=hardcodeddata&sso_reload=true

/*eslint no-console: 0*/
"use strict";

//DOLLY's Calendar

var USER_SECRET = "HYC2ZTo7n9Y/bswqclpeDOloVavNCIhQtbD8fj22kWg=";
var ORGANIZATIONAL_SECRET = "b631338a8784bed7f583b4a644c21ba3";
var ELEMENT_SECRET = "CMeqRRHhG/R4JUo82oarf103011V/cik0/Apw5Ed/Ew="; // this is user token after successful MS authentication PIuj2/bZca05+BJfEVfYHuQ5zNXk9JiqJ76ysvPu6YE=
var ELEMENT_SECRET_OUTLOOKMAIL = "vFkWOI08AJQ9XQ5GI1kuPAGWnJ2ry2eGaZ94M/RSspc=";
var CALENDAR_ID = "";
var payloadToken = "";
var util = require('util');

var GET_TOKEN_SERVICE_URL = "https://74cb6757trial-dev-mdauseronboarding-approuter.cfapps.eu10.hana.ondemand.com/service2/getToken";
// var GET_TOKEN_SERVICE_URL = "https://ywumcutwfexogh18thredirectservice.cfapps.eu10.hana.ondemand.com/getToken";


var AZURE_APP_ID = "7a4c0a66-2cf1-4cb7-8abe-f39c5f65193d";
var AZURE_SECRET_KEY = "pWzhLiL0AJs.wcro96~RwcZ_oa2.c6ex8N";




//=======================================================================================
//				HANA HARD Coded values
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

// import express (after npm install express)
const express = require('express');
const https = require('https');
const axios = require('axios');
const {
	URLSearchParams
} = require('url');
const params = new URLSearchParams();
const app = express();

// server configuration
const PORT = process.env.PORT || 8080;
var token = "";
var userPasscode = "";
// https://nodejs.dev/learn/making-http-requests-with-nodejs GET request in node.js
var getCalendarId = function (token, userOnboardingArray) {
		// var finalPassCode = "";
	console.log("=======Entering getCalendarID method========== for token == " + token);
	let optionsForGetCalendarAPI = {
		host: "api.openconnectors.ext.hanatrial.ondemand.com",
		path: "/elements/api-v2/calendars",
		method: "GET",
		headers: {
			"content-type": 'application/json',
			"authorization": `User ${USER_SECRET}, Organization ${ORGANIZATIONAL_SECRET}, Element ${token}`
		}
	}; // closing of optionsForGetCalendarAPI
	var payloadCalendarResult = "";
	const req = https.request(optionsForGetCalendarAPI, res => {
		console.log(`statusCode: ${res.statusCode}`)

		res.on('data', calendarIdReponse => {

			payloadCalendarResult += calendarIdReponse;
		})

		res.on('end', () => { ////the whole response has been received, so we just print it out here

			//another chunk of data has been received, so append it to `payloadToken`
			console.log("======================DONE response from CalendariD================================================");

			var calendarIdReponseJson = JSON.parse(payloadCalendarResult);
			// var calendarIdReponseJsontemp ;
			console.log("calendarIdReponse ===================" + calendarIdReponseJson);
			//           console.log("calendarIdReponseJsontemp ===================" + JSON.stringify(calendarIdReponseJsontemp););

			for (let i = 0; i < calendarIdReponseJson.length; i++) {

				console.log("======================INSIDE LOOP =====================" + i);
				console.log(calendarIdReponseJson[i]);
				if (calendarIdReponseJson[i].name === "Calendar") {
					userOnboardingArray.USER_EMAIL = calendarIdReponseJson[i].owner.address.toUpperCase();
					userOnboardingArray.CALENDAR_ID = calendarIdReponseJson[i].id;
					var name = calendarIdReponseJson[i].owner.name.toLowerCase();
					var firstName = name.split(",")[name.split(",").length - 1];
					var firstNameTrimmed = firstName.split(" ")[firstName.split(" ").length - 1];
					userOnboardingArray.FIRSTNAME = firstNameTrimmed;
					userOnboardingArray.NAME = calendarIdReponseJson[i].owner.name.toLowerCase();
					console.log("==========================USER_EMAIL=========================");
					console.log(userOnboardingArray.USER_EMAIL);
					console.log("==========================CALENDAR_ID=========================");
					console.log(userOnboardingArray.CALENDAR_ID);
					break;
				}

			}
			// check 

			//generate random number
			var number = getRandomInt(100, 1000);
			console.log("Number generated " + number);
			var firstname = userOnboardingArray.FIRSTNAME;
			userPasscode = firstname + number;
			userOnboardingArray.USER_PASSCODE = userPasscode;
			console.log("Dolly================" + number);
			// check if this passcode already 
			insertRecordsInHANA(userOnboardingArray);
			//
		})
	})

	req.on('error', error => {
		console.log("==================Couldnt get calendarID from open connector API================")
		console.error(error);
	})

	req.end();

	console.log("=======Exiting getCalendarID method==========");
}






//============================================================================================
//====================         getCalendarID method  - END        ==============================
//============================================================================================

//=======================================================================================
//                                        Ping API
//=======================================================================================
app.get('/ping', (req, res) => {

res.send("Hello from OAuthRedirect Service");   
});



// create a route for the app
app.get('/getToken', (req, res) => {
	
	console.log("Request Parameter " + JSON.stringify(req.query));
	console.log("Request Parameter 2 " + req.query.code);
	console.log("==================");
		var userOnboardingArray = {};
		userPasscode = "";
	var instanceName = getUUID();
	console.log("instanceName: " + instanceName);
	let payload = JSON.stringify({
		"element": {
			"key": "microsoftgraph"
		},
		"providerData": {
			"code": req.query.code
		},
		"configuration": {
			"oauth.api.key": AZURE_APP_ID,
			"oauth.api.secret": AZURE_SECRET_KEY,
			"oauth.callback.url": GET_TOKEN_SERVICE_URL
		},
		"tags": [
			"MDA"
		],
		"name": instanceName
	});
	// creating instance
	let options = {
		 host: "api.openconnectors.trial.eu10.ext.hana.ondemand.com", 
	//	host: "api.openconnectors.ext.hanatrial.ondemand.com",
		path: "/elements/api-v2/instances",
		//port: 443,
		method: "POST",
		headers: {
			"content-type": 'application/json',
			"Content-Length": Buffer.byteLength(payload, 'utf8'),
			//"authorization": 'User 4U2LUpEvI0/IOTJAp0pMyCwWosi/GHKKJnuS6s2iZog=, Organization b44c5f0581bedcedb8932430fe0cbda4, Element PIuj2/bZca05+BJfEVfYHuQ5zNXk9JiqJ76ysvPu6YE='
			                                           "authorization": `User ${USER_SECRET}, Organization ${ORGANIZATIONAL_SECRET}, Element ${ELEMENT_SECRET}`
		}
	};
	//console.log(payload);    
	let reqPost = https.request(options, (res) => {
		
		var payloadToken = "";
		var jsonPayloadToken = "";
		console.log("status code: " +  res.statusCode);
		res.on('data', (chunks) => {
			payloadToken += chunks; //another chunk of data has been received, so append it to `payloadToken`
		});
		res.on('end', () => { ////the whole response has been received, so we just print it out here

			console.log("======================DONE================================================");
			try {
				jsonPayloadToken = JSON.parse(payloadToken);
			} catch (e) {
				console.log("JSON PARSE ERROR: " + e);
			}

			console.log("jsonPayloadfromMS: ", jsonPayloadToken); // token
			token = jsonPayloadToken.token;
			//console.log("NAME: ", jsonPayloadToken.name); // instance name
			// console.log("emailAddress: ", jsonPayloadToken.user.emailAddress); //i065180@43745.20995.generated coming from MS so we just need to store inumber
			var inumber = jsonPayloadToken.user.emailAddress.split("@");
			console.log("inumber: ", inumber[0]);
			console.log("firstName: ", jsonPayloadToken.user.firstName);
			console.log("lastName: ", jsonPayloadToken.user.lastName);

			userOnboardingArray.instanceName = instanceName;
			userOnboardingArray.TOKEN = jsonPayloadToken.token;
			userOnboardingArray.USER_ID = inumber[0].toUpperCase();
			userOnboardingArray.firstName = jsonPayloadToken.user.firstName;
			userOnboardingArray.lastName = jsonPayloadToken.user.lastName;
			console.log("userOnboardingArray: ", JSON.stringify(userOnboardingArray)); // instance name
			getCalendarId(token, userOnboardingArray);
		});
	});

	console.log("Time out starts");
	setTimeout(() => {
		reqPost.write(payload);
		reqPost.end();
		reqPost.on('error', (err) => {
			console.error("====Error while authenticating the user , User cant be authenticated");
			console.error(err);
		});
		console.log("USER_ONBOARDING_ARRAY:" + userPasscode);
		res.send('Authentication done successfully, Please close the window.');
			console.log("Time out ends");
	}, 5000);


});
// make the server listen to requests
app.listen(PORT, () => {
	console.log(`Server running at port ${PORT}/`);
});
// for unique instance name creation 
function getUUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

// select from "MDA"."USER_ONBOARDING"
// var selectUserOnboardingInfo = function () {
//                         console.log("==========================entering selectUserOnboardingInfo=========== ")
//                         var hanaDBConnection = hana.createConnection();
//                         hanaDBConnection.connect(connOptions, function (err) {
//                                        if (err) {
//                                                      return console.error(err);
//                                        }

//                                        var sql = "insert into MDA.USER_CONTACTS (USER_EMAIL,USER_ID, CONTACT_EMAIL,CONTACT_NAME) VALUES ('" + userEmail + "', '" + userID +
//                                                      "', '" + contactEmail + "','" + contactName + "');";
//                                        console.log("SQL QUERY: " + sql);

//                                        var rows = hanaDBConnection.exec(sql, function (err, rows) {
//                                                      if (err) {
//                                                                     return console.error(err);
//                                                      }
//                                                      for (var i in rows) {
//                                                                     console.log('====INSERT RESULT===: ', rows[i].userEmail + rows[i].contactName);
//                                                      }
//                                                      console.log(rows);
//                                                      hanaDBConnection.disconnect(function (err) {
//                                                                     if (err) {
//                                                                                   return console.error(err);
//                                                                     }
//                                                      });
//                                        });
//                         });

//           }
/*
userOnboardingArray.USER_EMAIL
userOnboardingArray.CALENDAR_ID
userOnboardingArray.TOKEN 
userOnboardingArray.NAME 
userOnboardingArray.USER_ID
*/
var insertRecordsInHANA = function (userOnboardingArray) {
	console.log("==========================entering user infor into  MDA.USER_ONBOARDING table  =========== ")
	var hanaDBConnection = hana.createConnection();
	hanaDBConnection.connect(connOptions, function (err) {
		if (err) {
			return console.error(err);
		}
		// to prevenr 

		var sql =
			"upsert MDA.USER_ONBOARDING (USER_EMAIL, ELEMENT_SECRET,CALENDER_ID, INSTANCE_NAME, USER_PASSCODE )  VALUES ('" +
			userOnboardingArray.USER_EMAIL + "', " +
			// "'" + userOnboardingArray.USER_ID + "', " +
			"'" + userOnboardingArray.TOKEN + "', " +
			"'" + userOnboardingArray.CALENDAR_ID + "', " +
			// "'" + userOnboardingArray.firstName + "', " +
			// "'" + userOnboardingArray.lastName + "', " +
			"'" + userOnboardingArray.instanceName + "', " +
			"'" + userOnboardingArray.USER_PASSCODE + "')" + 
			"where  USER_EMAIL = '" + userOnboardingArray.USER_EMAIL + "';";

		console.log("SQL QUERY: " + sql);

		var rows = hanaDBConnection.exec(sql, function (err, rowsAffected) {
			if (err) {
				return console.error(err);
			}

			console.log(rowsAffected);
			if (rowsAffected === 1) {
				console.log("RECORD INSERTED SUCCESSFULLY");
				sendMail(userOnboardingArray.USER_EMAIL, userOnboardingArray.USER_PASSCODE) ;
			}
			hanaDBConnection.disconnect(function (err) {
				if (err) {
					return console.error(err);
				}
			});
		});
	});

}

var getPasscode = function (userPasscode) {
	console.log("==============Start of  getSenderInfo method===============================================");

	var userPasscodeUpperCase = userPasscode.toLowerCase(); // passcode always in lower case
	var hanaDBConnection = hana.createConnection();
	hanaDBConnection.connect(connOptions, function (err) {
		if (err) {
			//              console.log("========================= Error connecting to Database========================");
			// resolve({
			//           replies: ` ${DATABASE_CONNECTION_ISSUE.toString()} ${SYSTEM_ADMIN_EMAILID.toString()}`,
			//           conversation: NOT_OK
			// });
			return console.error(err); //Error connecting to Database
			//TODO:LOG - implement reject -- update UserLog
		}
		//                                                      var userEmail =  userEmail.toUpperCase();           

		var sql = "select USER_PASSCODE from MDA.USER_ONBOARDING where USER_PASSCODE = '" + userPasscodeUpperCase + "';";

		var rows = hanaDBConnection.exec(sql, function (err, rows) {
			if (err) {
				//TODO:LOG --handle reject, insert log and send error message to user 
				console.log("========================= Error connecting to Database========================");
				// resolve({
				//           replies: ` ${DATABASE_CONNECTION_ISSUE.toString()} ${SYSTEM_ADMIN_EMAILID.toString()}`,
				//           conversation: NOT_OK
				// });
				return console.error(err); //Error connecting to Database
			}

			//TODO:LOG - just add rows to UserLog
			if (rows.length > 0) {
				for (var i in rows) {
					//TODO: Need code cleanup -- why multiple assignments??
					USER_PASSCODE = rows[i].PASSCODE;
					console.log("========================= Success get passcode========================");
					// var tempLogObject = {
					//           "Function": "getSenderInfo",
					//               "ELEMENT_SECRET": ELEMENT_SECRET,
					//               "CALENDER_ID": calendarid,
					//               "LOG_INFO": "Select from onboarding table, RECORD FOUND"
					// }
					// userLogObject.GET_SENDER_INFO_CALL_SUCCESS = tempLogObject;
					// userLogObject.loginfotype = "SUCCESS";
					// resolve({
					//           replies: 'GetSenderInfo call Successful',
					//               conversation: OK
					// });
				}

			} else {
				// var tempLogObject = {
				//           "Function": "getSenderInfo",
				//               "ELEMENT_SECRET": ELEMENT_SECRET,
				//           "CALENDER_ID": calendarid,
				//           "LOG_INFO": "SELECT FROM THE ONBOARDING TABLE, No RECORD FOUND",
				//           "email": userEmail
				// }
				// userLogObject.GET_SENDER_INFO_CALL_FAIL = tempLogObject;
				// userLogObject.loginfotype = "ERROR";
				// resolve({
				//           replies: `${USER_NOT_AUTHENTICATED.toString()}`,
				//           conversation: NOT_OK
				// });
			}
			//TODO: implement else condition
			//User data not found in onboarding table, -- send reject

			hanaDBConnection.disconnect(function (err) {
				if (err) {
					console.log("========================= Error disconnecting to Database========================");
					// resolve({
					//           replies: ` ${DATABASE_CONNECTION_ISSUE.toString()} ${SYSTEM_ADMIN_EMAILID.toString()}`,
					//               conversation: NOT_OK
					// });

					return console.error(err);

				}
			});
			// promise return KANCHAN
			//TODO: WHY RESOlVE HERE? send resolve in loop above
			// resolve({
			//           replies: 'GetSenderInfo call Successful',
			//           conversation: 'NOT_OK'
			// });
		});
	});
	console.log("==============End of  getSenderInfo============ ");

}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function sendMail(userEmail, passcode) {
   console.log("================sendMail================"+userEmail + passcode );
             var message = "My Digital Assistant- Authentication Successful. Here is your passcode: "+  passcode +"\n";
              let payload = JSON.stringify({
                             "Subject": message,
                             "Body": {
                             "ContentType": "html",
                             "Content": "<p><strong>Welcome to My Digital Assistant(MDA)!!!</strong></p><p></p><p>Your authentication is done successfully. Your passcode is&nbsp; xyz.</p><p>Please visit  jam <a href='https: //jam4.sapjam.com/groups/buzw6Z7QCpvub60Rt4mhQ3/overview_page/dYke2gw8xiTqYdXgshMX23'>link</a> for all the details about My Digital Assistant(MDA).You can find details on :</p><ol><li>Current feature of MDA version 1.0</li><li>Future scope list</li><li>Demo of how MDA&nbsp; works</li></ol><p></p><p>For any issues/queries/suggestions, please write to us on <a href='mailto:dolly.mishra@sap.com'>dolly.mishra@sap.com</a></p><p></p><p>Thanks and Best Regards</p><p>MyDigitalAssitant Team</p>\r\n"
              },
                             "ToRecipients": [{
                                           "EmailAddress": {
                                                          "Address": userEmail
                                           }
                             }]
              });

              let options = {
                             host: "api.openconnectors.trial.eu10.ext.hana.ondemand.com",
                             path: "/elements/api-v2/messages",
                             method: "POST",
                             headers: {
                                           "content-type": "application/json",
                                           "Content-Length": Buffer.byteLength(payload, 'utf8'),
                                           "authorization": `User ${USER_SECRET}, Organization ${ORGANIZATIONAL_SECRET}, Element ${ELEMENT_SECRET_OUTLOOKMAIL}`
                             }
              };

              let reqPost = https.request(options, (res) => {
                             console.log("status code hello: ", res.statusCode);
                            res.on('data', (chunks) => {
                                           console.log("SENT");
                                           process.stdout.write(chunks);
                             });
              });
              reqPost.write(payload);
              reqPost.end();
              reqPost.on('error', (err) => {
                             console.error(err);
              });

}


// function sendMail(userEmail, passcode) {
//   console.log("================sendMail================"+userEmail + passcode );
//               var message = "User Authentication done successfully for MyDigitalAssistant. Here is your passcode: "+  passcode +"\n";
//               let payload = JSON.stringify({
//                              "Subject": message,
//                              "Body": {
//         "ContentType": "html",
//         "Content":  "<html>\r\n<head>\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\r\n<meta content=\"text/html; charset=us-ascii\">\r\n</head>\r\n<body>\r\n<p> Important Points: </p>\r\n<ul> <li>As a prerequisite: Participants Name must be added in your outlook contact</li>  <li>Always enter your preferred time intervals within which you want to book a meeting.</li>  <li>Currently only the IST time zone is considered  while entering the preferred time intervals.</li></ul>\r\n</body>\r\n</html>\r\n"
//     },
//                              // "Body": {
//                              //           "ContentType": "html",
//                              //           "Content":  "<html>\r\n<head>\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\r\n<meta content=\"text/html; charset=us-ascii\">\r\n</head>\r\n<body>\r\n"<ul> <li>As a prerequisite: Participants Name must be added in your outlook contact</li>  <li>Always enter your preferred time intervals within which you want to book a meeting.</li>  <li>Currently only the IST time zone is considered  while entering the preferred time intervals.</li></ul>"\r\n</body>\r\n</html>\r\n"
//                              // },
//                              "ToRecipients": [{
//                                           "EmailAddress": {
//                                                           "Address": userEmail
//                                           }
//                              }]
//                              // ,
//                              // "Attachments": [{
//                              //           "@odata.type": "#Microsoft.OutlookServices.FileAttachment",
//                              //           "Name": "menu.txt",
//                              //           "ContentBytes": "bWFjIGFuZCBjaGVlc2UgdG9kYXk="
//                              // }]
//               });

//               let options = {
//                              host: "api.openconnectors.trial.eu10.ext.hana.ondemand.com",
//                              path: "/elements/api-v2/messages",
//                              method: "POST",
//                              headers: {
//                                           "content-type": "application/json",
//                                           "Content-Length": Buffer.byteLength(payload, 'utf8'),
//                                           "authorization": `User ${USER_SECRET}, Organization ${ORGANIZATIONAL_SECRET}, Element ${ELEMENT_SECRET_OUTLOOKMAIL}`
//                              }
//               };

//               let reqPost = https.request(options, (res) => {
//                              console.log("status code hello: ", res.statusCode);
//                              res.on('data', (chunks) => {
//                                           console.log("SENT");
//                                           process.stdout.write(chunks);
//                              });
//               });
//               reqPost.write(payload);
//               reqPost.end();
//               reqPost.on('error', (err) => {
//                              console.error(err);
//               });

// }

