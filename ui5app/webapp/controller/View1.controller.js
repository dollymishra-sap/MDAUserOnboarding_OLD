sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/BusyIndicator',
	'sap/m/MessageToast'
], function (Controller,BusyIndicator,MessageToast) {
	"use strict";

	return Controller.extend("mda.ui5app.controller.View1", {
		onInit: function () {
			this.showBusyIndicator(4000, 0);

		},
		showBusyIndicator : function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function() {
					// this.hideBusyIndicator();
				}.bind(this), iDuration);
			}
		},
		hideBusyIndicator : function() {
			BusyIndicator.hide();
		},
		onAfterRendering: function () {
			// BusyIndicator.show(4000);
			
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
						
						
						
						var message = "Welcome " + data.USER_EMAIL_FROM_SESSION + "!\n You are authorized. \n Your passcode is: " + data.USER_PASSCODE;
						// var messagePasscode = "Your passcode is: " + data.USER_PASSCODE;
						that.getView().byId("userAuthorizedMessageBox").setText(message);
						// that.getView().byId("userAuthorizedMessageBox").setDescription(messagePasscode);
						
						that.getView().byId("userAuthorizedMessageBox").setVisible(true);
						that.getView().byId("authorizeButton").setVisible(false);
					}
					else{
						that.getView().byId("userAuthorizedMessageBox").setVisible(false);
						
						var message = "Welcome " + data.USER_EMAIL_FROM_SESSION + "!\n You are not authorized";
						that.getView().byId("userUnauthorizedMessageBox").setText(message);
						// that.getView().byId("userUnauthorizedMessageBox").setDescription("");
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
			
			$.ajax({
				url: "../service1/getDL"
			}).done(function (data, status, jqxhr) {
					if(data && data.USER_DL && data.USER_DL.length >0){
						var oForm = that.getView().byId("dlListForm");
        				var oFormContainer = oForm.getFormContainers()[0];
        				for(var i=0; i<data.USER_DL.length ; i++){
        					
        					if(i == 0){
        						oFormContainer.getFormElements()[0].getFields()[0].setValue(data.USER_DL[i].DL_NAME);
        						oFormContainer.getFormElements()[0].getFields()[1].setSelected(data.USER_DL[i].IS_DEFAULT);
        						oFormContainer.getFormElements()[1].getFields()[0].setValue(data.USER_DL[i].DL_EMAIL);
        					}
        					else{
        						var oLength = oFormContainer.getFormElements().length;
						        var dlNameElement = that.getView().byId("dlName");
						          var dlNameElementCopy = dlNameElement.clone();
						          dlNameElementCopy.getFields()[0].setValue(data.USER_DL[i].DL_NAME);
						          dlNameElementCopy.getFields()[1].setSelected(data.USER_DL[i].IS_DEFAULT);
						          
						          oFormContainer.insertFormElement(dlNameElementCopy, oLength + 1);
						          
						          var dlEmailElement = that.getView().byId("dlEmail");
						          var dlEmailElementCopy = dlEmailElement.clone();
						          dlEmailElementCopy.getFields()[0].setValue(data.USER_DL[i].DL_EMAIL);
						          oFormContainer.insertFormElement(dlEmailElementCopy, oLength + 2);
        					}
        				}
        				that.hideBusyIndicator();
					}
					else{
						that.hideBusyIndicator();
					}
			});
		},
		onPressAuthorizeButton: function(){
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
		},


        onDLElementAdd: function(oEvent) {
          var oForm = this.getView().byId("dlListForm");
          var oFormContainer = oForm.getFormContainers()[0];
          var oLength = oFormContainer.getFormElements().length;
          
          var dlNameElement = this.getView().byId("dlName");
          var dlNameElementCopy = dlNameElement.clone();
          dlNameElementCopy.getFields()[0].setValue("");
          oFormContainer.insertFormElement(dlNameElementCopy, oLength + 1);
          
          var dlEmailElement = this.getView().byId("dlEmail");
          var dlEmailElementCopy = dlEmailElement.clone();
          dlEmailElementCopy.getFields()[0].setValue("");
          oFormContainer.insertFormElement(dlEmailElementCopy, oLength + 2);
        },
        
        onPressSaveDL: function(oEvent){
        	
        	var that = this;
        	var oButton = oEvent.getSource();
        	var csrfToken = null;
        	var requestObj = [];
     //   	{       
     //   			"USER_EMAIL" : "RAJA.PRASAD.GUPTA@SAP.COM",
					// "DL_NAME" : "DL_PLS",
					// "DL_EMAIL" : "plsabc@sap.com",
					// "IS_DEFAULT" : "true"
					// };
        		
        	
    		var oForm = that.getView().byId("dlListForm");
    		var oFormContainer = oForm.getFormContainers()[0];
    		var oFormElements = oFormContainer.getFormElements();
    		for(var i=0; i<oFormElements.length ; i++){
    			
    			var objTemp = {};
    			
    			objTemp.DL_NAME = oFormElements[i].getFields()[0].getValue();
    			objTemp.IS_DEFAULT = oFormElements[i++].getFields()[1].getSelected();
    			objTemp.DL_EMAIL = oFormElements[i].getFields()[0].getValue();
    			requestObj.push(objTemp);
 			}
        	
        	
        	
        	
        		
        	jQuery.ajax("../service1/ping",{
			  type: "GET",
			  contentType: 'application/json',
			  dataType: 'json',
			  beforeSend: function(xhr){
			    xhr.setRequestHeader('X-CSRF-Token', 'fetch');
			  },
			  complete : function(response) {
				  	csrfToken = response.getResponseHeader('X-CSRF-Token');
				    // jQuery.ajaxSetup({
				    //   beforeSend: function(xhr) {
				    //     xhr.setRequestHeader("X-CSRF-Token",response.getResponseHeader('X-CSRF-Token'));
				    //   }
				    // });
				    
				    $.ajax({
				    url : "../service1/saveDL",
				    type: "POST",
				    data : JSON.stringify(requestObj),
				    // data: '{"data": "TEST"}',
				    datatype: "json",
				    contentType: "application/json",
				     beforeSend: function(xhr){
					    xhr.setRequestHeader('X-CSRF-Token', csrfToken);
					  },
				    // headers: 
				    // {
				    //     'X-CSRF-TOKEN': csrfToken
				    // },
				    success: function(data, textStatus, jqXHR)
				    {
				        var response = data;
				        MessageToast.show(response.INFO);
				    },
				    error: function (jqXHR, textStatus, errorThrown)
				    {
						var response = errorThrown;
				        MessageToast.show(response.INFO);
				    }
				});  
			    
			    
			  }
			});	
        	
			      	
        	
        }
	});
});