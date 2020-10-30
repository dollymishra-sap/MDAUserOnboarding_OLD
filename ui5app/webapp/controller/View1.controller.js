sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/BusyIndicator'
], function (Controller,BusyIndicator) {
	"use strict";

	return Controller.extend("mda.ui5app.controller.View1", {
		onInit: function () {

		},
		onAfterRendering: function () {
			
			var that = this;
			$.ajax({
				url: "../service1/checkuser"
			}).done(function (data, status, jqxhr) {
				//Sample data
				// {
				// USER_EMAIL_FROM_SESSION: "raja.prasad.gupta@sap.com",
				// IS_USER_AUTHORIZED: true,
				// TABLE_RECORD: "{"USER_EMAIL":"RAJA.PRASAD.GUPTA@SAP.COM","ELEMENT_SECRET":"ELEMENT_SECRET_1","CALENDER_ID":"CALENDER_ID_1","INSTANCE_NAME":"INSTANCE_1"}"
				// }
				if(data){
					if(data && data.IS_USER_AUTHORIZED){
						
						
						
						var message = "Welcome " + data.USER_EMAIL_FROM_SESSION + "!\n You are authorized";
						var messagePasscode = "Your passcode is: " + data.USER_PASSCODE;
						that.getView().byId("userAuthorizedMessageBox").setText(message);
						that.getView().byId("userAuthorizedMessageBox").setDescription(messagePasscode);
						
						that.getView().byId("userAuthorizedMessageBox").setVisible(true);
						that.getView().byId("authorizeButton").setVisible(false);
					}
					else{
						that.getView().byId("userAuthorizedMessageBox").setVisible(false);
						
						var message = "Welcome " + data.USER_EMAIL_FROM_SESSION + "!\n You are not authorized";
						that.getView().byId("userUnauthorizedMessageBox").setText(message);
						that.getView().byId("userUnauthorizedMessageBox").setDescription("");
						that.getView().byId("userUnauthorizedMessageBox").setVisible(true);
						that.getView().byId("authorizeButton").setVisible(true);
						
						
					}
				}
				else{
						// var oText = new sap.m.Text({
						// 	text: "Something wrong happened. Contact system admin"
						// });
						// that.getView().byId("userVBox").addItem(oText);
				}
				
			});
		},
		onPress: function(){
			var getTokenURL = "https://74cb6757trial-dev-mdauseronboarding-approuter.cfapps.eu10.hana.ondemand.com/service2/getToken";
			var clientAppID = "7a4c0a66-2cf1-4cb7-8abe-f39c5f65193d";
			
			var redirectUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" + 
							"client_id=" + clientAppID + "&response_type=code" + 
							"&redirect_uri=" + getTokenURL +
							"&response_mode=query&scope=offline_access+Calendars.Read+Calendars.ReadWrite+Contacts.ReadWrite.Shared&state=hardcodeddata&sso_reload=true";
			
			this.getView().byId("redirectURL").setText(redirectUrl);
			BusyIndicator.show();
			sap.m.URLHelper.redirect(redirectUrl, true);
			var that = this;
			var flag= true;
			// while(flag){
			// 	$.ajax({
			// 		url: "../service1/checkuser"
			// 	}).done(function (data, status, jqxhr) {
			// 		if(data){
			// 			if(data && data.IS_USER_AUTHORIZED){
							
			// 				var message = "Welcome " + data.USER_EMAIL_FROM_SESSION + "!\n You are authorized";
			// 				var messagePasscode = "Your passcode is: " + data.USER_PASSCODE;
			// 				that.getView().byId("userAuthorizedMessageBox").setText(message);
			// 				that.getView().byId("userAuthorizedMessageBox").setDescription(messagePasscode);
							
			// 				that.getView().byId("userAuthorizedMessageBox").setVisible(true);
			// 				that.getView().byId("authorizeButton").setVisible(false);
			// 				BusyIndicator.hide();
			// 				flag = false;
			// 			}
			// 		}
			// 	});
			// }
			
			
			
			setTimeout(function() {
				that.onAfterRendering();
				BusyIndicator.hide();
				// setTimeout(function() {
					
	   //         },5000);
            },20000);
			
			
			
			
			
			
			
		}
	});
});