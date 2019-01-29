//A JSON object that contains the string translations retrieved according to the user's language setting.
var languageFile = {};
//A JSON object that contains the string translations for the default language file (assumed to be English).
var defaultLanguageFile = {};
// convert-readme.txt file with license informations
var convertReadmeFile = "";
//The number of asynchronous calls that have returned from a given batch of calls.
var returnedCalls = 0;
//The number of asynchronous calls that are expected to be made for a given batch of calls.
var expectedCalls = 0;
// Reload side after overlay dialog has been closed
var setReloadSide = false;
// detect safari browser
var browser = "other";
// detect Mac OS
var os = "other";

//The currently selected left navigation item.
var activeNav;
//A boolean indicating whether or not the user has made any changes to a page of configuration settings.
var changesMade = false;
//A boolean indicating whether or not the user has clicked an input field
var inputFieldClicked = false;
//The handler to be called if the user elects to save the changes he made.
var saveHandler;

//An object containing all the data for the Status page.
var statusData = {};
var statusDataOrig = {};
//The timer that automatically updates the a page at a regular increment.
var updateTimer;
//The interval at which to run the update timer, in milliseconds.
var updateTimerInterval = 30000;
// the status page is updated every 10 seconds 3 times. Then the timer is set to updateTimerInterval.
var updateTimerInterval1 = 2000;
var updateTimerInterval1Count = 0;
// The timer that is initiated after pressing the log in or register button to the myTwonky portal
var portalTimer;
//The interval at which to run the portal timer, in milliseconds. 
//This variable gets the values of portalTimerInterval 1, then 2 and 3.
var portalTimerInterval;
// Counts how many times the timer was called. The value 0 indicates that no timer is started.
var portalTimerIntervalCount = 0;
// First (initial) timer interval and how many times he is called
var portalTimerInterval1 = 40000;
var portalTimerInterval1Count = 1;
// Second timer interval and how many times he is called. The value must be different to 1 and 3.
var portalTimerInterval2 = 15000;
var portalTimerInterval2Count = 3;
// Third timer interval and how many times he is called. The value must be different to 1 and 2.
var portalTimerInterval3 = 30000;
var portalTimerInterval3Count = 5;
// timer which clear the background spinner after 5 seconds
var loadingGraficActiv;

var noMediaFusionServer = false;
var noWebDavServer = false;
var myTwonkyDisabled = false;

// 1: browse shared folder, 2: browse sync folder
var folderBrowseDialogMsg = 1;

//An object containing all the data for the Setup page.
var setup = {};
var setupOrig = {};
//The user's currently selected navigation type for the defaultview property.
var selectedNavType;
//An object containing all the data for the Sharing page.
var sharing = {};
var sharingOrig = {};
//update receiver list
var sharingReceiverChanged = false;
//An object containing all the data for the Aggregation page.
var aggregation = {};
var aggregationOrig = {};
//A list of aggregation servers the user has made modifications to. Tracked for optimization to avoid
//sending updates to TwonkyServer when data is saved except for servers the user has changed.
var changedServers = {};
//An object containing all the data for the Advanced page.
var advanced = {};
var advancedOrig = {};
//A list of media receivers the user has made modifications to. Tracked for optimization to avoid
//sending updates to TwonkyServer when data is saved except for receivers the user has changed.
var changedReceivers = {};
//The last media id (corresponding to video, music, or photo) the user visited.
var lastMediaId;


$(window).bind("hashchange", function(e){
    $("#leftNavContainer").show();
    switch (e.fragment) {
        case "":
        case "status":
            checkChanges("loadStatus();");
            populateSettingsNav();
            break;
        case "setup":
            checkChanges("loadSetup();");
            populateSettingsNav();
            break;
        case "sharing":
            checkChanges("loadSharing();");
            populateSettingsNav();
            break;
        case "aggregation":
            checkChanges("loadAggregation();");
            populateSettingsNav();
            break;
        case "synchronization":
            checkChanges("loadSynchronization();");
            break;
        case "advanced":
            checkChanges("loadAdvanced();");
            populateSettingsNav();
            break;
        case "video":
            loadMediaBrowse("0$3");
            lastMediaId = "0$3";
            break;
        case "music":
            loadMediaBrowse("0$1");
            lastMediaId = "0$1";
            break;
        case "photo":
            loadMediaBrowse("0$2");
            lastMediaId = "0$2";
            break;
        case "licenseinfo":
            $("#leftNavContainer").hide();
            $(".serverSettingsContentWrapper").html(getString("mpeglicense") + "<br /><br />" + getString("copyright") + "<br /><br /><br /><br />" + 
			    convertReadmeFile + "<br /><br />" + 
				"<BR><BR>License information is provided here: <br /><br /> " + 
				"<a class='inlineLink' href='http://jquery.org/license/' >http://jquery.org/license/</a> (click on 'MIT License' link)<br /><br />" +
				"<a class='inlineLink' href='http://benalman.com/about/license/' >http://benalman.com/about/license/</a> <br />");
            break;
        default:
            var paramPieces = e.fragment.split("&");
            var id = paramPieces[0].split("=")[1];
            var startPage = paramPieces[1].split("=")[1];
            var count = paramPieces[2].split("=")[1];
            var mediaId = id.substring(0, 3);
            if (mediaId != lastMediaId) {
                loadMediaBrowse(mediaId, function(){
                    loadMediaContents(id, startPage, count, false);
                });
            }
            else {
                loadMediaContents(id, startPage, count, false);
            }
            lastMediaId = mediaId;
            break;
    }
});

function browserIdentification() {
	browser = "other";
	// special treating for Safari
	if (navigator.userAgent.indexOf("Safari") != -1) browser = "Safari";
	if (navigator.userAgent.indexOf("KHTML") != -1) browser = "Safari";
}
function osIdentification() {
	os = navigator.platform;
	if (navigator.platform.indexOf("Mac") != -1) os = "Mac";
}

function navigateTo(params){
   window.location.href = $.param.fragment(window.location.href, params, 2);
}

function getLanguageFile(){
	// read server language file
    $.ajax("/webconfig/strings-" + statusData["language"] + ".json", {
        "success": function(data){
            languageFile = parseJson(data);
        },
        "error": function(){
            $.ajax("/webconfig/strings-en.json", function(data){
                languageFile = parseJson(data);
            });
        }
    });
}
function getConvertReadmeFile(){
	makeGetRequest("/webconfig/convert-readme.txt", {}, function(data){
		convertReadmeFile = data;
		convertReadmeFile = convertReadmeFile.replace(/(\r\n)|(\r)|(\n)/g, "<BR>");
	});
}

//Get the value of a string given a key from the localized string translations.
//key: The key to retrieve a string for.
//getLong: Default false. If true, retrieve longValue from the translation object rather than value. longValue can be
//used to store longer text that shouldn't necessarily always be displayed.
function getString(key, getLong){
    if (languageFile[key]) {
        return (getLong) ? (languageFile[key].longValue) : (languageFile[key].value);
    } else {
		if (defaultLanguageFile[key]) {
			return (getLong) ? (defaultLanguageFile[key].longValue) : (defaultLanguageFile[key].value);
		} else {
			return "";
		}
	}
}

//Replace the contents of all elements in html that have a "string" attribute with the matching value from the
//translation file.
//html: The HTML to perform the replacement on. 
function replaceStrings(html){
    var stringElements = $("[string]", html);
    
    stringElements.each(function(i){
        $(this).html(getString($(this).attr("string")));
    });
}


// show or hide the content of subheaders. 
// The layout of each page will be saved. If the user comes back to a page the layout has not changed. 
function showToggleButtons(html){
	if (!(document.cookie)) return;
    var buttonElements = $(".toggleButton", html);
    buttonElements.each(function(i){
		var elem = $(this);
		var parent = elem.parents(".boxHeader");
		var nextHeader = $(parent).next();
		var id = elem.attr("id");
        var c = document.cookie;
		var a = c.split(";");
		for (var j=0;j<a.length;j++) {
			var cookieID = a[j].substring(0,a[j].indexOf("="));
			var cookieValue = a[j].substring(a[j].indexOf("=")+1, a[j].length);
			if (cookieID.indexOf(id) >= 0) {
				if (cookieValue.indexOf("show") >= 0) { 
					nextHeader.show();
					if (nextHeader.hasClass("hideSubheaderBody")) nextHeader.removeClass("hideSubheaderBody");	// for I.E.
					$(".toggleText", elem).text(getString("hide"));
					elem.removeClass("hidden");
					elem.addClass("showing");
				}
			}
		}
    });
}

//Call a handler function for each element in html that has a "key" attribute to display data.
//html: The HTML to perform the replacement on.
//responseData: The data object to retrieve the data from.
//handler: The handler that should be called when an element with a "key" attribute is discovered. Handlers should
//have the function signature (element, key, data) where element is the affected element, key is the data's key,
//and data is the data collection object.
function replaceData(html, responseData, handler){
    var dataElements = $("[key]", html);
    dataElements.each(function(i){
        var dataElement = $(this);
        var value = responseData[dataElement.attr("key")];
        if (handler) {
            handler(dataElement, dataElement.attr("key"), value);
        }
        else {
            dataElement.html(value);
        }
        
    });
}

//Split data using a separator character and store the resulting array.
//responseData: The data to split.
//dataCollection: The data object in which to store the data.
//dataKey: The key used to store the data.
//dataSeparator: The separator character.
function parseData(responseData, dataCollection, dataCollectionOrig, dataKey, dataSeparator){
    var responsePieces = responseData.split(dataSeparator);
    dataCollection[dataKey] = responsePieces;
    dataCollectionOrig[dataKey] = responsePieces;
}

//Split a collection of data that is in name/value pair form (e.g. /rpc/get_all) and store it in a data object.
//The key becomes the first part of the split, and the value becomes the second (v=0 would be stored as {"v": 0}).
//responseData: The data to split.
//dataCollection: The data object in which to store the data. The data can be changed by the user.
//dataCollectionOrig: The data object in which to store the data. These data are not changed by the user.
//separatorChar: The character that separates the name/value pairs.
function parseSeparatedData(responseData, dataCollection, dataCollectionOrig, separatorChar){
    var responsePieces = responseData.split("\n");
    $.each(responsePieces, function(i, value){
        var pieceArray = value.split(separatorChar);
        if (pieceArray.length == 2) {
            var cleanedData = pieceArray[1].replace(/\r/g, "");
            dataCollection[pieceArray[0]] = cleanedData;
            dataCollectionOrig[pieceArray[0]] = cleanedData;
        }
        else {
            var responseData = new Array(pieceArray.length - 1);
            $.each(pieceArray, function(i, value){
                if (pieceArray[i + 1]) {
                    var cleanedData = pieceArray[i + 1].replace(/\r/g, "");
                    responseData[i] = cleanedData;
                }
            });
            dataCollection[pieceArray[0]] = responseData;
            dataCollectionOrig[pieceArray[0]] = responseData;
        }
    });
}

//A generic wrapper for making AJAX GET requests.
//url: The url to make the request to.
//params: A collection of objects to be passed as querystring arguments. Use the format {"key": value}. For example,
//[{"uuid": 1234}, {"example": true}] will be passed as ?uuid=1234&example=true in the querystring.
//callback: The callback to be called after the request finishes.
function makeGetRequest(url, params, callback){
    var urlParams = "";
    var separatorChar = "?";
    if (params) {
        $.each(params, function(i, value){
            urlParams += separatorChar + i + "=" + value;
            separatorChar = "&";
        });
    }
    $.get(url + urlParams, function(response){
        if (callback) {
            callback(response);
        }
    });
}

//A generic wrapper for making AJAX POST requests.
//url: The url to make the request to.
//params: A collection of objects to be passed as querystring arguments. Use the format {"key": value}. For example,
//[{"uuid": 1234}, {"example": true}] will be passed as ?uuid=1234&example=true in the querystring.
//data: The data to be passed during the POST request.
//callback: The callback to be called after the request finishes.
function makePostRequest(url, params, data, callback){
    var urlParams = "";
    var separatorChar = "?";
    if (params) {
        $.each(params, function(i, value){
            urlParams += separatorChar + i + "=" + value;
            separatorChar = "&";
        });
    }
    $.post(url + urlParams, data, function(response){
        if (callback) {
            callback(response);
        }
    });
}

function showLoadingGraphic(){
    $(".serverSettingsContentWrapper").addClass("loading");
	if (loadingGraficActiv) window.clearInterval(loadingGraficActiv);
	loadingGraficActiv = window.setInterval("hideLoadingGraphic()", 8000);
}

function hideLoadingGraphic(){
	window.clearInterval(loadingGraficActiv);
	loadingGraficActiv = null;
	if ($(".serverSettingsContentWrapper").hasClass("loading"))
		$(".serverSettingsContentWrapper").removeClass("loading");
}

function onLanguageFetched(){
    replaceStrings($(document));
    $(window).trigger("hashchange");
}

function setVisitLinks() {
	var id1 = document.getElementById("visitLink1");
	var id2 = document.getElementById("visitLink2");
	var id3 = document.getElementById("visitLink3");
	var id4 = document.getElementById("visitLink4");
	var id11 = document.getElementById("legalLink1");
	if (noMediaFusionServer || myTwonkyDisabled) {
		// Twonky
		id1.innerHTML = "<a href='http://www.twonky.com/about.aspx' target='_blank' string='twonky.com'></a>";
		// Mobile Apps
		id2.innerHTML = "<a href='http://www.twonky.com/products/twonkymobile/default.aspx' target='_blank' string='mobileApps'></a>";
		// Help center
		id3.innerHTML = "<a href='http://community.twonky.com/twonky' target='_blank' string='helpCenter'></a>";
		// -
		id4.innerHTML = "";
		// Licensing Information
		id11.innerHTML = "<a href='' onclick='navigateTo(\"licenseinfo\"); return false;' string='licensinginfo'></a>";
	} else {
		// myTwonky
		id1.innerHTML = "<a href='http://my.twonky.com' target='_blank' string='mytwonky.com'></a>";
		// Twonky
		id2.innerHTML = "<a href='http://www.twonky.com/about.aspx' target='_blank' string='twonky.com'></a>";
		// Mobile Apps
		id3.innerHTML = "<a href='http://www.twonky.com/products/twonkymobile/default.aspx' target='_blank' string='mobileApps'></a>";
		// Help center
		id4.innerHTML = "<a href='http://community.twonky.com/twonky' target='_blank' string='helpCenter'></a>";
		// Licensing Information
		id11.innerHTML = "<a href='' onclick='navigateTo(\"licenseinfo\"); return false;' string='licensinginfo'></a>";
	}
}

//Initialize the Settings application by first reading the user's language setting, then loading the language file
//and calling loadStatus.
function initPage(){
	if (top != self) {
		// page is in an iFrame; show no header and footer
		$("#headWrapper").hide();
		$("#footer").hide();
	}
	// identify browser and OS
	browserIdentification();
	osIdentification();
	// get the WebDav server url
    makeGetRequest("/rpc/get_webdav_link", {}, function(response){
		statusData["syncurl"] = response;
		if (statusData["syncurl"].toLowerCase() == "nowebdav") noWebDavServer = true;
    });
	// get the portal links
	makeGetRequest("/rpc/portal_page?login", {}, function(response){
		statusData["portallogin"] = response;
	});
	makeGetRequest("/rpc/portal_page?register", {}, function(response){
		statusData["portalregister"] = response;
	});
	makeGetRequest("/rpc/portal_page?login24", {}, function(response){
		statusData["portallogin24"] = response + "/signin?pvx-orig-url=" + document.URL;
	});
	// connect media fusion server to update the server myTwonky status
	initialPortalCheck();	
	$(".toggleButton").live("click", function(obj){
		toggleContainer($(obj.currentTarget));
	});
	getConvertReadmeFile();
    makeGetRequest("/rpc/get_all", {}, function(response){
        parseSeparatedData(response, statusData, statusDataOrig, "=");
        //Handle the version case separately. 
		//get_all, info_status and version return a "version" property. 
		//get_all.version is only set if the server comes with NMC
        statusData["fullversion"] = statusData.version;
        makeGetRequest("/webconfig/strings-en.json", {}, function(data){
            defaultLanguageFile = parseJson(data);
            languageFile = parseJson(data);
			makeGetRequest("/webconfig/strings-"+statusData["language"]+".json", {}, function(data2){
				languageFile = parseJson(data2);
				onLanguageFetched();
			});
		});
        var mediafusionServerUrl = statusData["mediafusionserverurl"];
        // Setting empty value to 'mediafusionserverurl' is used to indicate 
        // that the MediaFusion is disabled, and must not be shown on the config page.
        if (mediafusionServerUrl.length < 1) noMediaFusionServer = true;
		if (statusData["disablemytwonky"] == 1) myTwonkyDisabled = true;
		setVisitLinks();	// set links to myTwonky and twonky in footer
    });
}

function onEventClick() {
	if (!(changesMade || inputFieldClicked)) {
		inputFieldClicked = true;
		// give "save"-button a new look
		$("#saveButton").addClass("confirm");
	}
}
function onEventChange(){
	if (!changesMade) {
		changesMade = true;
		// give "save"-button a new look
		if (!$("#saveButton").hasClass("confirm")) $("#saveButton").addClass("confirm");
	}
}
function resetChanged(){
	inputFieldClicked = false;
	changesMade = false;
	// reset the look of the "save"-button
	if ($("#saveButton").hasClass("confirm")) $("#saveButton").removeClass("confirm");
}

//If the user has changed any inputs on the page, display a dialog to warn them and prompt them to save changes.
//Otherwise, navigate away.
//navFunctionStr: A string indicating the function that should be called when navigation is performed 
//(e.g. "loadStatus()").
function checkChanges(navFunctionStr){
    if (changesMade) {
        showDialogOverlay(function(){
            return getString("saveprompt");
        }, {}, {
            1: {
                text: getString("savechanges"),
                onclick: saveHandler + " " + "hideDialogOverlay(); " + navFunctionStr
            },
            2: {
                text: getString("discardchanges"),
                onclick: "changesMade = false; hideDialogOverlay(); " + navFunctionStr
            }
        });
    }
    else {
        eval(navFunctionStr);
    }
}

function populateSettingsNav(){
    if ($(".serverSettingsLeftNav").length == 0) {
        makeGetRequest("/webconfig/settings-nav.htm", {}, function(response){
            var responseHtml = $(response);
            replaceStrings(responseHtml);
            $("a", "#nav").removeClass("active");
            $(".serverSettingsContentWrapper").removeClass("contentDisplay");
            $("#leftNavContainer").html(responseHtml);
			if (noWebDavServer) {
				// remove nav-tree synchronization
				$("#nav_synchronization").remove();
			}
        });
    }
}

//Clear the selection on the currently selected left navigation item and highlight the new one. Cancel the
//udpate timer if it exists.
//currentNav: The newly clicked navigation item.
function highlightNav(currentNav){
    if (activeNav) {
        activeNav.removeClass("current");
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
    }
    currentNav.addClass("current");
    activeNav = currentNav;
}

function refreshPortalInfo() {
	var c = document.cookie;
	var a = c.split(";");
	for (var j=0;j<a.length;j++) {
		var cookieID = a[j].substring(0,a[j].indexOf("="));
		var cookieValue = a[j].substring(a[j].indexOf("=")+1, a[j].length);
		if (cookieID.indexOf("login24") >= 0) {
			if (cookieValue.indexOf("true") >= 0) {
				document.cookie = "login24=false;";
				startPortalCheckTimer();
			}
		}
	}
}

// accountingstatus:
//#define ACCOUNTING_TRIAL_VERSION                            1 "TwonkyServer"
//#define ACCOUNTING_REGISTERED_VERSION_TS_ONLY               2
//#define ACCOUNTING_REGISTERED_VERSION_TSTML                 3
//#define ACCOUNTING_REGISTERED_VERSION_TSTMF                 4
//#define ACCOUNTING_PORTAL_VERSION                           5 "TwonkyServer Free"
//#define ACCOUNTING_PREMIUM_VERSION                          6 "TwonkyServer Premium"
//#define ACCOUNTING_OEM_VERSION                              7
function getServerType(accStatus) {
	var str = "TwonkyServer";
	switch (accStatus) {
        case "2": str = "TwonkyServer";
				break;
        case "5": str = "TwonkyServer free";
				break;
        case "6": str = "TwonkyServer Premium";
				break;
	}
	return str;
}

// ------------------------
// status page
// ------------------------
//Load data for the Status page.
//isInitial: Default false. /rpc/get_all is called on application load, so set isInitial to true to avoid a duplicate 
//call.
function loadStatus(isInitial){
    returnedCalls = 0;
    expectedCalls = (isInitial) ? 8 : 10;
    saveHandler = "function(){};"
	inputFieldClicked = false;
    changesMade = false;
	
	showLoadingGraphic();
	refreshPortalInfo();	// check the portal status after a login from a free server after 24 hours
	
    if (!isInitial) {
        makeGetRequest("/rpc/get_all", {}, function(response){
            parseSeparatedData(response, statusData, statusDataOrig, "=");
			statusData["fullversion"] = statusData.version;		// info_status returns the property "version" too
            returnedCalls++;
            if (expectedCalls == returnedCalls) {
                loadStatusHtml();
				hideLoadingGraphic();
            }
        });
		makeGetRequest("/rpc/get_webdav_link", {}, function(response){
			statusData["syncurl"] = response;
			returnedCalls++;
			if (statusData["syncurl"].toLowerCase() == "nowebdav") noWebDavServer = true;
			if (expectedCalls == returnedCalls) {
				loadStatusHtml();
				hideLoadingGraphic();
			}
		});
    }
    
    makeGetRequest("/rpc/info_status", {}, function(response){
        parseSeparatedData(response, statusData, statusDataOrig, "|");
		statusData["serverversion"] = statusData.version;		// get_all returns the property "version" too
		// statusData["servertype"] = getServerType(statusData["licensestatus"]);
		// statusData["servertypepart2"] = statusData["servertype"];
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadStatusHtml();
			hideLoadingGraphic();
        }
    });
	// function get_server_type restored - should be retired again. See also chapter advanced!
	makeGetRequest("/rpc/get_server_type", {}, function(response){
		statusData["servertype"] = response;
		statusData["servertypepart2"] = response;
		advanced["servertype"] = response;
		returnedCalls++;
		if (expectedCalls == returnedCalls) {
			loadStatusHtml();
			hideLoadingGraphic();
		}
	});

	makeGetRequest("/rpc/get_friendlyname", {}, function(response){
		statusData["friendlynamestring"] = response;
		returnedCalls++;
		if (expectedCalls == returnedCalls) {
			loadStatusHtml();
			hideLoadingGraphic();
		}
	});
    
	makeGetRequest("/rpc/info_nics", {}, function(response){
        parseData(response, statusData, statusDataOrig, "nics", "\n");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadStatusHtml();
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/stream_active", {}, function(response){
        parseData(response, statusData, statusDataOrig, "streams", "SA:");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadStatusHtml();
			hideLoadingGraphic();
        }
    });
        
    makeGetRequest("/rpc/get_portal_info", {}, function(response){
        statusData["portalinfo"] = response;
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadStatusHtml();
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/get_option?portalusername", {}, function(response){
        statusData["portalusername"] = response;
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadStatusHtml();
			hideLoadingGraphic();
        }
    });
 
 
    $.ajax({
        url: "/rpc/get_timeout_period",
        success: function(response){
            returnedCalls++;
            statusData["lastlogin"] = response;
            if (expectedCalls == returnedCalls) {
                loadStatusHtml();
				hideLoadingGraphic();
            }
        },
        error: function(response){
            returnedCalls++;
            if (expectedCalls == returnedCalls) {
                loadStatusHtml();
				hideLoadingGraphic();
           }
        }
    });
}

function handleStatusData(element, key, data){
    var returnValue = "";
    switch (key) {
        case "restartpending":
            returnValue = (data == 0) ? (getString("no")) : (getString("yes"));
            break;
        case "wmdrmstatus":
            returnValue = (data) ? (data.toUpperCase()) : ("");
            break;
        case "uptime":
            var days = data[0];
            var timePieces = data[1].split(":");
            returnValue = days + " " + getString("days") + ", " + timePieces[0] + " " + getString("hours") + ", " + timePieces[1] + " " + getString("minutes") + ", " + timePieces[2] + " " + getString("seconds");
            break;
        case "syncurl":
			returnValue = (data.toLowerCase() == "nowebdav") ? ("-") : (data);
            break;
		case "nics":
            if (data) {
                $.each(data, function(i, value){
                    if (value.length > 0 && value.lastIndexOf("127.0.0.1") == -1) {
                        var nicPieces = value.split(",");
                        var mac = (nicPieces[1]) ? (nicPieces[1]) : ("")
                        returnValue += "<span class='nicIp'>" + nicPieces[0] + "</span>" + " " + mac + "<br />";
                    }
                });
            }
            break;
        case "cdkey":
			if (statusData["licensestatus"] == "4") break;	// OEM-version: do not show the key
            if (data && statusData["servertype"].toLowerCase().indexOf("free") == -1) {
                returnValue = '<div class="serverStatusLabel floatL">' + getString("cdkey") + '</div><div class="floatL">' + data + '</div><div class="clear"></div>';
            }
            break;
        case "licensestatus":
            //if ((!statusData["cdkey"] || data < 1) && statusData["servertype"].toLowerCase().indexOf("free") == -1) {
            if (data < 2) {
                //Remove the element's key to prevent it from being overwritten during the automatic update timer.
                element.attr("key", "nothing");
                returnValue += '<div class="boxHeader">\
	    		<span class="titleWrapper">\
	        		<span class="title">' + getString("licensekey") + '</span>\
				</span>\
				<div class="clear" />\
	    		</div>\
				<div><div>' +
                getString("licensekeycaption") +
                '</div><br />';
				if (os != "Mac") {
					// Windows, Linux: show 8 fields for license key
					for (var i = 0; i < 8; i++) {
						returnValue += '<input type="text" class="licenseKeyInput floatL" maxchars="4" onchange="onLicenseInput($(this))" onkeyup="onLicenseInput($(this)); onLicenseInputKeyUp(event)"></input>'
					}
				} else {
					// Mac: show one field for license key
					returnValue += '<input type="text" class="licenseKeyInputMac floatL" maxchars="39" onkeyup="onLicenseInputKeyUp(event)"></input>'
				}
                
                returnValue += '<a class="actionbtn floatL" onclick="saveLicenseKey()" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)">\
						<span class="actionbtn_l"></span>\
						<span class="actionbtn_c">' + getString("enter") + '</span>\
						<span class="actionbtn_r"></span>\
					</a>\
					<div class="clear"></div>'
                
                switch (data) {
                    case 1:
                        returnValue += "<div class='error'>" + statusData["licensedays"] + " " + getString("daysremaining") + "</div>"
                        break;
                    case 2:
                    case 3:
                    case 4:
                        break;
                    default:
                        returnValue += "<div class='error'>" + getString("license" + data) + "</div>"
                        break;
                }
                
                 returnValue += '</div><div class="serverContentSpacer"></div>';
            }
            break;
        case "streams":
            returnValue = (data[1] > 0) ? (getString("activestreams")) : (getString("noactivestreams"));
            break;
        case "servertype":
			// show the server type and version
			// free: Twonky 7.0 (servertype, fullversion)
			// premium: TwonkyServer Premium 7.0  (servertype, fullversion)
			// standard: Twonky 7.0 Special (servertype, fullversion, servertypepart2)
            var serverType = data.toLowerCase();
            if (serverType.lastIndexOf("premium") > -1) {
                returnValue = getString("premiumserver");
            }
            else 
                if (serverType.lastIndexOf("free") > -1) {
                    returnValue = getString("freeserver");
                }
                else {
                    returnValue = getString("twonkyserver");
                }
            break;
        case "servertypepart2":
            var serverType = data.toLowerCase();
            if ((serverType.lastIndexOf("premium") == -1) && (serverType.lastIndexOf("free") == -1)) {
                returnValue = getString("twonkyservertextpart2");
            }
			else return "";
            break;
        case "portalinfo":
            var serverType = statusData["servertype"];
			if (noMediaFusionServer || myTwonkyDisabled) break;
            switch (data) {
                case "notregistered":
                    if (serverType.toLowerCase().lastIndexOf("free") > -1) {
						if (browser == "other") {
							returnValue = '<div>' +
							getString("registrationrequiredcaption") +
							'</div>\
							<div class="smallServerContentSpacer"></div>\
							<div><a class="actionbtnmd bold" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)" onclick="openPortalLink(\'register\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
							getString("registerserver") +
							'</span><span class="actionbtn_r"></span></a></div>\
							<div class="serverContentSpacer"></div>';
						} else {
							// Safari browser
							returnValue = '<div>' +
							getString("registrationrequiredcaption") +
							'</div>\
							<div class="smallServerContentSpacer"></div>\
							<div><a class="actionbtnmd bold" href="' + statusData["portalregister"] + '" target="_blank" onclick="javascript:startPortalCheckTimerOnClick(\'register\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
							getString("registerserver") +
							'</span><span class="actionbtn_r"></span></a></div>\
							<div class="serverContentSpacer"></div>';
						}
                    }
                    else {
						if (browser == "other") {
							returnValue = '<div>' +
							getString("registrationoptionalcaption") +
							'</div>\
							<div class="smallServerContentSpacer"></div>\
							<div><a class="actionbtnmd bold" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)" onclick="openPortalLink(\'register\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
							getString("registerserver") +
							'</span><span class="actionbtn_r"></span></a></div>\
							<div class="serverContentSpacer"></div>';
						} else {
							// Safari browser
							returnValue = '<div>' +
							getString("registrationoptionalcaption") +
							'</div>\
							<div class="smallServerContentSpacer"></div>\
							<div><a class="actionbtnmd bold" href="' + statusData["portalregister"] + '" target="_blank" onclick="javascript:startPortalCheckTimerOnClick(\'register\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
							getString("registerserver") +
							'</span><span class="actionbtn_r"></span></a></div>\
							<div class="serverContentSpacer"></div>';
						}
                    }
                    break;
                case "notloggedin":
					if (browser == "other") {
						returnValue = '<div>' +
						getString("loginneededcaption") + 
						'</div>\
							<div class="smallServerContentSpacer"></div>\
							<div><a class="actionbtnmd bold" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)" onclick="openPortalLink(\'login\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
						getString("login") +
						'</span><span class="actionbtn_r"></span></a></div>\
							<div class="serverContentSpacer"></div>';
					} else {
						// Safari browser
						returnValue = '<div>' +
						getString("loginneededcaption") + 
						'</div>\
							<div class="smallServerContentSpacer"></div>\
							<div><a class="actionbtnmd bold" href="' + statusData["portallogin"] + '" target="_blank" onclick="javascript:startPortalCheckTimerOnClick(\'login\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
						getString("login") +
						'</span><span class="actionbtn_r"></span></a></div>\
							<div class="serverContentSpacer"></div>';
					}
                    break;
                case "portaldisabled":
                    returnValue = getString("portaldisabled") + '<div class="serverContentSpacer"></div>';
                    break;
                case "useronline":
                    var renewStr = "";
                    if (serverType.toLowerCase().lastIndexOf("free") > -1) {
						serverType = "free";
						if (statusData["lastlogin"].indexOf(":") > 0) {
							// format hours:minutes
							var timePieces = statusData["lastlogin"].split(":");
							var hours = timePieces[0];
							var minutes = timePieces[1];
							var timeoutStr = getString("renewlicense");
							renewStr = timeoutStr.replace("{0}", hours).replace("{1}", minutes);
							if (browser == "other") {
								renewStr = renewStr.replace("myTwonky.com", "<a class=\'inlineLink\' href=\"javascript:openPortalLink(\'login\')\">myTwonky.com</a>");
							} else {
								// Safari browser
								renewStr = renewStr.replace("myTwonky.com", "<a class=\'inlineLink\' href=\'" + statusData["portallogin"] + "\' target=\'_blank\' onclick=\'javascript:startPortalCheckTimerOnClick(\"register\")\'>myTwonky.com</a>");
							}
						} else {
							// in seconds
							var seconds1 = statusData["lastlogin"];
							if (seconds1 > 0) {
								var minutes1 = (seconds1 - (seconds1 % 60)) / 60;
								var minutes = minutes1 % 60;
								var hours = (minutes1 - minutes) / 60;
							} else {
								var hours = "0";
								var minutes = "00";
							}
							if (hours > 23) {
								// show remaining days
								var days = (hours - (hours % 24)) / 24;
								var timeoutStr = getString("renewlicenseindays");
								renewStr = timeoutStr.replace("{0}", days);
								if (browser == "other") {
									renewStr = renewStr.replace("myTwonky.com", "<a class=\'inlineLink\' href=\"javascript:openPortalLink(\'login\')\">myTwonky.com</a>");
								} else {
									// Safari browser
									renewStr = renewStr.replace("myTwonky.com", "<a class=\'inlineLink\' href=\'" + statusData["portallogin"] + "\' target=\'_blank\' onclick=\'javascript:startPortalCheckTimerOnClick(\"register\")\'>myTwonky.com</a>");
								}
							} else {
								// show remaining hours and minutes
								var timeoutStr = getString("renewlicense");
								renewStr = timeoutStr.replace("{0}", hours).replace("{1}", minutes);
								if (browser == "other") {
									renewStr = renewStr.replace("myTwonky.com", "<a class=\'inlineLink\' href=\"javascript:openPortalLink(\'login\')\">myTwonky.com</a>");
								} else {
									// Safari browser
									renewStr = renewStr.replace("myTwonky.com", "<a class=\'inlineLink\' href=\'" + statusData["portallogin"] + "\' target=\'_blank\' onclick=\'javascript:startPortalCheckTimerOnClick(\"register\")\'>myTwonky.com</a>");
								}
							}
						}
                    }
                    returnValue = getString("loggedinas") + " " + statusData["portalusername"] + '<br /><div>' + renewStr + '<div class="serverContentSpacer"></div>';
                    break;
                case "connectionissue":
                    returnValue = getString("connectionissue") + '<div class="serverContentSpacer"></div>';
                    break;
                case "connecting":
                    returnValue = getString("portalconnecting") + '<div class="serverContentSpacer"></div>';
                    break;
            }
            break;
        default:
            returnValue = data;
            break;
    }
    element.html(returnValue);
}

function onLicenseInput(input){
    if (input.val().match(/^[A-Z0-9]{4}(-[A-Z0-9]{4}){7}$/)) {
        var keyPieces = input.val().split("-");
        var inputs = $(".licenseKeyInput");
        $.each(inputs, function(i, element){
            $(element).val(keyPieces[i]);
        });
    }
    else {
        if (input.val().length > input.attr("maxchars")) {
            input.val(input.val().substring(0, input.attr("maxchars")));
        }
        if (input.val().length == input.attr("maxchars")) {
            input.next().focus();
        }
    }
}

function onLicenseInputKeyUp(event){
    if (event.which == 13) {
        saveLicenseKey();
    }
}

function saveLicenseKey(){
    var key = "";
    resetChanged();
	if (os != "Mac") {
		var inputs = $(".licenseKeyInput");
		$.each(inputs, function(i, element){
			key += $(element).val();
			if (i != inputs.length - 1) {
				key += "-";
			}
		});
	} else key = $(".licenseKeyInputMac")[0].value;
    var data = "cdkey=" + key + "\n";
    makeGetRequest("/rpc/set_option?"+data, {}, function(response) {});
    //location.reload();
	var timerKey = setTimeout("reloadSide()",30);
}
function reloadSide() {
    location.reload();
}

function initialPortalCheck() {
	// twonky server connect to media fusion server to update the portal data
    makeGetRequest("/rpc/get_portal_info?onlineStatus", {}, function(response) {});	
}
function openPortalLink(arg){
	// login with redirect to config pages if 24 hours are over - only free server
	if (arg == "login24") {
		// call the portal with the current url (server config page) as parameter
		// example call: window.open("http://staging-portal.twonky.com/signin?pvx-orig-url=http://127.0.0.1:9000", ....)
		// set cookie. At restart update server portal data.
		document.cookie = "login24=true;";
		makeGetRequest("/rpc/portal_page?" + arg, {}, function(response){
			window.open(response+"/signin?pvx-orig-url="+document.URL, "_self", 'menubar=yes,scrollbars=yes,status=yes,toolbar=yes,resizable=yes');
		});
	}
	if (arg == "register") {
		makeGetRequest("/rpc/portal_page?" + arg, {}, function(response){
			window.open(response, "PortalPage", 'menubar=yes,scrollbars=yes,status=yes,toolbar=yes,resizable=yes');
		});
	}
	if (arg == "login") {
		makeGetRequest("/rpc/portal_page?" + arg, {}, function(response){
			window.open(response, "PortalPage", 'menubar=yes,scrollbars=yes,status=yes,toolbar=yes,resizable=yes');
		});
	}
	startPortalCheckTimer();
}
function startPortalCheckTimer() {
	if (portalTimerIntervalCount == 0) {
		// start a timer to update the server portal data 
		portalTimerIntervalCount = 1;
		portalTimerInterval = portalTimerInterval1;
		portalTimer = setInterval(checkPortalStatus, portalTimerInterval1);
	}
}
function startPortalCheckTimerOnClick(arg) {
	if (arg == "login24") document.cookie = "login24=true;";
	startPortalCheckTimer();
	return true;
}
function disassociatePortalLink(servertype) {
	if (servertype == "free") var msg = getString("dialog_portaldisassociatefree");
	else var msg = getString("dialog_portaldisassociatepremium");
	confirmDialog(msg,"confirmDisassociatePortalLink()");	
}
function confirmDisassociatePortalLink() {
	hideDialogOverlay();
    makeGetRequest("/rpc/portal_disassociate", {}, function(response){});
	$("#portaldisassociation").hide();
}
function checkPortalStatus() {
	// twonky server calls media fusion server
    makeGetRequest("/rpc/get_portal_info?onlineStatus", {}, function(response){
		if (response == "online") {
			portalTimerInterval = portalTimerInterval3;			
			portalTimerIntervalCount = portalTimerInterval3Count;
		};
	});	
	// update status page
	updateStatus();
	// increase interval counter
	portalTimerIntervalCount ++;
	if (portalTimerInterval == portalTimerInterval1) {
		if (portalTimerIntervalCount > portalTimerInterval1Count) {
			// stop timer and start timer with interval 2
			clearInterval(portalTimer);			
			portalTimerIntervalCount = 1;
			portalTimerInterval = portalTimerInterval2;
			portalTimer = setInterval(checkPortalStatus, portalTimerInterval2);
		}
	}
	if (portalTimerInterval == portalTimerInterval2) {
		if (portalTimerIntervalCount > portalTimerInterval2Count) {
			// stop timer and start timer with interval 3
			clearInterval(portalTimer);			
			portalTimerIntervalCount = 1;
			portalTimerInterval = portalTimerInterval3;
			portalTimer = setInterval(checkPortalStatus, portalTimerInterval3);
		}
	}
	if (portalTimerInterval == portalTimerInterval3) {
		if (portalTimerIntervalCount > portalTimerInterval3Count) {
			// stop portal timer
			clearInterval(portalTimer);	
			portalTimerIntervalCount = 0;
		}
	}
}

function loadStatusHtml(){
    makeGetRequest("/webconfig/status.htm", {}, function(response){
        var responseHtml = $(response);
        replaceStrings(responseHtml);
        replaceData(responseHtml, statusData, handleStatusData);       
		showToggleButtons(responseHtml);
        $(".serverSettingsContentWrapper").html(responseHtml);
		if (noMediaFusionServer || myTwonkyDisabled) {
			$("#portalHeader").addClass("hideSubheader");
		}
		if (noWebDavServer) {
			$("#statusSyncUrl").hide();
		}
        highlightNav($("#nav_status"));
		hideLoadingGraphic();
		if (statusData["portalinfo"] == "connecting") 
			updateTimer = setInterval(updateStatusTimerCheck, updateTimerInterval1);
		else
			updateTimer = setInterval(updateStatus, updateTimerInterval);
    });
}

// special action for status update
// The portal info is updated every 2 seconds. 
// If the portal is "online" the page is updated immediatly and the update timer is set to 30 seconds.
// The page is updated every 10 seconds three times (updateTimerInterval1),
// later every 30 seconds (updateTimerInterval)
function updateStatusTimerCheck() {
    makeGetRequest("/rpc/get_portal_info", {}, function(response){
        statusData["portalinfo"] = response;	
		updateTimerInterval1Count++;
		if (statusData["portalinfo"] != "connecting") {
			clearInterval(updateTimer);
			updateTimer = setInterval(updateStatus, updateTimerInterval);
			updateStatus();
		}
		if (updateTimerInterval1Count >= 30) {
			clearInterval(updateTimer);
			updateTimer = setInterval(updateStatus, updateTimerInterval);
		}
    });
}

function updateStatus(){
    returnedCalls = 0;
    expectedCalls = 5;
	showLoadingGraphic();
	
    makeGetRequest("/rpc/info_status", {}, function(response){
        parseSeparatedData(response, statusData, statusDataOrig, "|");
		statusData["serverversion"] = statusData.version;		// get_all returns the property "version" too
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            replaceData($(".serverSettingsContentWrapper"), statusData, handleStatusData);
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/get_all", {}, function(response){
        parseSeparatedData(response, statusData, statusDataOrig, "=");
		statusData["fullversion"] = statusData.version;		// info_status returns the property "version" too
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            replaceData($(".serverSettingsContentWrapper"), statusData, handleStatusData);
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/get_portal_info", {}, function(response){
        statusData["portalinfo"] = response;
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            replaceData($(".serverSettingsContentWrapper"), statusData, handleStatusData);
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/get_option?portalusername", {}, function(response){
        statusData["portalusername"] = response;
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            replaceData($(".serverSettingsContentWrapper"), statusData, handleStatusData);
			hideLoadingGraphic();
        }
    });
    
    $.ajax({
        url: "/rpc/get_timeout_period",
        success: function(response){
            returnedCalls++;
            statusData["lastlogin"] = response;
            if (expectedCalls == returnedCalls) {
                replaceData($(".serverSettingsContentWrapper"), statusData, handleStatusData);
				hideLoadingGraphic();
            }
        },
        error: function(response){
            returnedCalls++;
            if (expectedCalls == returnedCalls) {
                replaceData($(".serverSettingsContentWrapper"), statusData, handleStatusData);
				hideLoadingGraphic();
            }
        }
    });
}


// ------------------------
// setup page
// ------------------------
function loadSetup(){
    returnedCalls = 0;
    expectedCalls = 2;
    saveHandler = "submitSetupData();"
	inputFieldClicked = false;
    changesMade = false;

	showLoadingGraphic();
    
    makeGetRequest("/rpc/get_all", {}, function(response){
        parseSeparatedData(response, setup, setupOrig, "=");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadSetupHtml();
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/view_names", {}, function(response){
        parseData(response, setup, setupOrig, "viewnames", ",");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadSetupHtml();
			hideLoadingGraphic();
        }
    });
}

function loadSetupHtml(){
    makeGetRequest("/webconfig/setup.htm", {}, function(response){
        var responseHtml = $(response);
        replaceStrings(responseHtml);
        replaceData(responseHtml, setup, handleSetupData);
		showToggleButtons(responseHtml);
        
        $(".serverSettingsContentWrapper").html(responseHtml);
        $("input", "#setupContainer").live("click", onEventClick);
        $("input,select", "#setupContainer").live("change", onEventChange);
        highlightNav($("#nav_setup"));
    });
}

function handleSetupData(element, key, data){
    switch (key) {
        case "friendlyname":
            element.val(data);
            break;
        case "language":
            var matchingLanguage = $("[value=" + data + "]", element);
            matchingLanguage.attr("selected", "yes");
            break;
        case "viewnames":
            html = "";
            $.each(data, function(i, value){
                var selected = "";
                if (setup["defaultview"] == value) {
                    selected = "checked";
                    selectedNavType = value;
                }
                html += '<div class="radioControlWrapper">\
        			<input name="viewname" id="' + value + '" ' + selected + ' type="radio" onclick="setNavType(\'' + value + '\')" />\
        				<div class="radioControlTextWrapper">\
            				<div class="radioHeader">\
                				' +
                getString(value) +
                '\
            				</div>\
            				<div class="smallFont">\
                				' +
                getString(value + "caption") +
                '\
            				</div>\
        				</div>\
        			<div class="clear">\
        			</div>\
    			</div>';
            });
            element.html(html);
            break;
    }
}

function setNavType(navType){
    selectedNavType = navType;
}

function submitSetupData(){
    returnedCalls = 0;
    expectedCalls = 1;
    hideActionButtons();
    resetChanged();
	var data = "";
	if (setupOrig["friendlyname"] != $("#servername").val()) data += "friendlyname=" + $("#servername").val() + "\n";
	var newLanguage = $("#language").val();
	if (setupOrig["language"] != newLanguage) data += "language=" + newLanguage + "\n";
	if (setupOrig["defaultview"] != selectedNavType) data += "defaultview=" + selectedNavType + "\n";
    //var data = "friendlyname=" + $("#servername").val() + "\nlanguage=" + $("#language").val() + "\ndefaultview=" + selectedNavType + "\n";
    makePostRequest("/rpc/set_all", {}, data, function(){
        returnedCalls++;
		if (setupOrig["language"] != newLanguage) {
			setWebDavLanguage($("#language").val());	// set also the WebDav server language
			setReloadSide = true;
		}
        finishSaving();
    });
}

function setWebDavLanguage(lang) {
	var request = loadXMLDoc("/set_language?lang="+lang,"");
}

// ------------------------
// sharing page
// ------------------------
function loadSharing(){
    returnedCalls = 0;
    expectedCalls = 3;
    saveHandler = "submitSharingData();"
	inputFieldClicked = false;
    changesMade = false;

	showLoadingGraphic();
    
    makeGetRequest("/rpc/get_all", {}, function(response){
        parseSeparatedData(response, sharing, sharingOrig, "=");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadSharingHtml();
			hideLoadingGraphic();
        }
    });

    makeGetRequest("/rpc/info_clients", {}, function(response){
        parseData(response, sharing, sharingOrig, "clients", "\n");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadSharingHtml();
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/info_connected_clients", {}, function(response){
        parseData(response, sharing, sharingOrig, "mediareceivers", "##########\n");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadSharingHtml();
			hideLoadingGraphic();
        }
    });
}

function loadSharingHtml(){
    makeGetRequest("/webconfig/sharing.htm", {}, function(response){
        var responseHtml = $(response);
        replaceStrings(responseHtml);
        replaceData(responseHtml, sharing, handleSharingData);
		showToggleButtons(responseHtml);
        
        $(".serverSettingsContentWrapper").html(responseHtml);
        $("input", "#sharingContainer").live("click", onEventClick);
        $("input,select", "#sharingContainer").live("change", onEventChange);
        highlightNav($("#nav_sharing"));
		updateSharing();
        updateTimer = setInterval(updateSharing, updateTimerInterval);
    });
}

function updateSharing(){
    makeGetRequest("/rpc/info_connected_clients", {}, function(response){
        parseData(response, sharing, "mediareceivers", "##########\n");
        updateMediaReceivers($("[key=mediareceivers]"), sharing.mediareceivers)
    });
}

function splitContentDirs(data){
    var delimiter = ",[-\\+\\*][AMVPDamvpd]\\|";
    var contentDirs = new Array();
    var index;
    while ((index = data.search(delimiter)) != -1) {
        contentDirs.push(data.substring(0, index));
        data = data.substring(index + 1);
    }
    contentDirs.push(data);
    return contentDirs;
}

function handleSharingData(element, key, data){
    switch (key) {
        case "rmautoshare":
            if (sharing["platform"] == "WIN32") {
                element.show();
                if (data > 0) {
                    $("input[type=checkbox]", element).attr("checked", "true");
                }
            }
            break;
        case "contentdir":
			folderBrowseDialogMsg = 1;
			updateSharedFolderList(element, data);
            break;
		case "v":
        case "clientautoenable":
            element.attr("checked", data > 0)
            break;
        case "mediareceivers":
            updateMediaReceivers(element, data);
            break;
    }
}

//A utility function used during dynamic HTML generation to determine whether a dropdown option should be selected.
//mediaKey: The value of the input in question.
//compareKey: The string to compare to.
function checkSelectedMediaOption(mediaKey, compareKey){
    return (mediaKey == compareKey) ? ("selected") : ("");
}

function checkShareBox(checkbox){
    if (checkbox.is(":checked")) {
        var shareBox = $(".sharedCheckbox", checkbox.parent());
        shareBox.attr("checked", true);
    }
}

function uncheckAggregationBox(checkbox){
    if (!checkbox.is(":checked")) {
        var aggregationBox = $(".aggregationCheckbox", checkbox.parent());
        aggregationBox.attr("checked", false);
    }
}

//Display a dialog that allows the user to browse folders on his local machine. This can't be a browser control
//because browsers only allow file selection, not folder browsing.
//rowNumber: The number of the selected folder browse row. Used to track which input the user is working with.
function showFolderBrowse(rowNumber){
    showDialogOverlay(createFolderBrowseDialog, {
        onstart: makeGetRequest("/rpc/dir", {
            "path": ""
        }, function(response){
            populateDirs(response, "", "");
        })
    }, {
        1: {
            text: getString("select"),
            onclick: "selectDir('" + rowNumber + "')"
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    }, "folderBrowse");
}

//Hide the folder selection dialog and populate an input with the user's selected directory.
//rowNumber: The number of the selected folder browse row. Used to track which input the user is working with. 
function selectDir(rowNumber){
    if ($("#dirPathDisplay").html()) {
        $("#pathInput" + rowNumber).val($("#dirPathDisplay").html());
		onEventChange();
        hideDialogOverlay();
    }
}

function createFolderBrowseDialog(){
	if (folderBrowseDialogMsg == 1) 
		return '<div>\
				<div class="boxHeader">\
					<span class="titleWrapper">\
						<span class="title">' + getString("selectfolder") + '</span>\
					</span>\
					<div class="clear" />\
				</div>\
				<div id="dirPathDisplay" class="dirPathDisplay"></div>\
				<div id="dirDisplayContainer"></div>\
			</div>';
	else 
		return '<div>\
				<div class="boxHeader">\
					<span class="titleWrapper">\
						<span class="title">' + getString("selectsyncfolder") + '</span>\
					</span>\
					<div class="clear" />\
				</div>\
				<div id="dirPathDisplay" class="dirPathDisplay"></div>\
				<div id="dirDisplayContainer"></div>\
			</div>';
}

//The maximum height of the directory display area before it begins scrolling, in pixels.
function getWindowHeight() {
	var windowHeight = 50;
	 if (typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		windowHeight = window.innerHeight;
	  } else if (document.documentElement && document.documentElement.clientHeight) {
		//IE 6+ in 'standards compliant mode'
		windowHeight = document.documentElement.clientHeight;
	  } else if (document.body && document.body.clientHeight) {
		//IE 4 compatible
		windowHeight = document.body.clientHeight;
	  }		
	  return windowHeight;
}

//Generate HTML to display the list of directories, along with a breadcrumb and a link for the parent directory.
//response: The data containing the directory list.
//rootPath: The path of the previous directory.
//rootId: The id of the previous directory.
function populateDirs(response, rootPath, rootId){
    ($("#dirDisplayContainer")).removeClass("scroll");
	$("#dirDisplayContainer").css("height", "auto"); 
   var html = "";
    var responsePieces = response.split("\n");
    var platformSpecificSeparator = responsePieces[0];
    var dirDisplay = $("#dirPathDisplay");
    dirDisplay.attr("dirid", rootId);
    dirDisplay.html(rootPath);
    if (dirDisplay.attr("dirid") && rootPath && rootId) {
	var lastSlash = rootPath.lastIndexOf(platformSpecificSeparator);
        var lastPipe = rootId.lastIndexOf("|");
        //If rootPath matches the format of a file path (e.g. C:\), parentPath is everything from the start of the string
        //to the last \, beyond which is the id of the current directory.
        var parentPath = (rootPath.match(/^[A-Z]:\\$/)) ? ("") : (rootPath.substring(0, lastSlash));
        //If parentPath is now only a drive designation (e.g. C:), add the \ back on.
        if (parentPath.match(/^[A-Z]:$/)) {
            parentPath += "\\";
        }
        var parentId = rootId.substring(0, lastPipe);
        html += '<div class="parentDirRow" onclick="getDirs(\'' + parentPath.replace(/\\/g, "\\\\") + '\', \'' + parentId + '\', \'' + platformSpecificSeparator.replace(/\\/g, "\\\\") + '\')"><span class="parentDirIcon"></span><span>' + getString("parentdir") + '</span></div>';
    }
    else {
        html += '<div class="parentDirRow"></div>';
    }
    $.each(responsePieces, function(i, value){
        if (value.length > 1) {

	    // directory/file id is 3+ digits long
	    var ii = 3;
	    while ((value.charAt(ii) != "D" && value.charAt(ii) != "F") && ii < value.length) {
		ii = ii + 1;
	    }
			
	    var dirId = value.substring(0, ii);
            var fullId = dirId;
            if (rootId) {
                fullId = rootId + "|" + dirId;
            }

            var dirKey = value.charAt(ii);
            var dirPath = value.substring(ii + 1);
            var fullPath = dirPath;

            if (rootPath) {
                var separatorChar = (rootPath.lastIndexOf(platformSpecificSeparator) != rootPath.length - 1) ? (platformSpecificSeparator) : ("");
                fullPath = rootPath + separatorChar + dirPath;
            }
            if (dirKey == "D") {
                html += '<div class="dirRow" onclick="getDirs(\'' + fullPath.replace(/\\/g, "\\\\") + '\', \'' + fullId + '\', \'' + platformSpecificSeparator.replace(/\\/g, "\\\\") + '\')"><span class="dirIcon"></span><span>' + dirPath + '</span></div>';
	    }
        }
    });
    $("#dirDisplayContainer").html(html);
    //If the container is too tall, add the scroll class to it to prevent it from taking up too much real estate.
	var wHeight = getWindowHeight();
	var dirDisplayMaxHeight = wHeight - Math.round(wHeight/2) - $("#dirPathDisplay").outerHeight() - $("#dialogButtonContainer").outerHeight();
    if (parseInt($("#dirDisplayContainer").css("height")) > dirDisplayMaxHeight) {
        ($("#dirDisplayContainer")).addClass("scroll");
		if (dirDisplayMaxHeight < 150) dirDisplayMaxHeight = 150;
		$(".scroll").css("height", dirDisplayMaxHeight); 
    }
    else {
        ($("#dirDisplayContainer")).removeClass("scroll");
    }
}

//Get the directories under a given directory id.
//dirPath: The path of the previous directory to be used for breadcrumb navigation.
//dirId: The id to use for the new dirs call.
function getDirs(dirPath, dirId, platformSpecificSeparator){
    var passId = dirId.replace(/\|/g, platformSpecificSeparator)
    makeGetRequest("/rpc/dirs", {
        "path": passId
    }, function(response){
        populateDirs(response, dirPath, dirId);
    });
}

//Create a new shared folder row for directory browsing. Do this only if the user hasn't chosen a directory for the last
//existing row to avoid duplicate blank rows getting stacked up.
function createNewSharedFolderRow(){
    if ($(".pathInput:last", "#share_folders_container").val()) {
        var sharingRows = $(".sharingRowWrapper", "#share_folders_container");
        //Unbind the change listener, since only the last row should be listening to add a fresh row when a value is set.
        sharingRows.unbind("change");
        var i = sharingRows.length;
        var html = getNewSharedFolderRowHtml(i+1);
        $("#share_folders_container").append(html);
    }
}

//Get the HTML for a shared folder row.
//i: The row number. Use this to uniquely identify the row.
function getNewSharedFolderRowHtml(i){
	folderBrowseDialogMsg = 1;
    return '<div class="sharingRowWrapper">\
		<input class="sharedCheckbox floatL" onclick="uncheckAggregationBox($(this))" type="checkbox" checked="true"/><input id="pathInput' + i + '" class="longInput pathInput floatL" type="text" onchange="createNewSharedFolderRow()" value=""/>\
		<select class="contentTypeDropdown floatL">\
			<option value="A">'+getString("allcontenttypes")+'</option>\
			<option value="M">'+getString("music")+'</option>\
			<option value="P">'+getString("photos")+'</option>\
			<option value="V">'+getString("videos")+'</option>\
			<option value="m">'+getString("photos")+' & '+getString("videos")+'</option>\
			<option value="p">'+getString("music")+' & '+getString("videos")+'</option>\
			<option value="v">'+getString("music")+' & '+getString("photos")+'</option>\
		</select>\
		<a class="actionbtn floatL" onclick="showFolderBrowse(' +
    i +
    ')" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
    getString("browse") +
    '</span><span class="actionbtn_r"></span></a>\
			<input id="aggCheckbox' +
    i +
    '" class="aggregationCheckbox floatL" onclick="checkShareBox($(this))" type="checkbox"/>' +
    '<label for="aggCheckbox' +
    i +
    '">' +
    getString("shareforagg") +
    '</label>\
		<div class="clear">\
		</div>\
	</div>';
}


// update the receiver list and the aggregation server list
function updateMediaReceivers(element, data){
	// if user has made changes, do not update the receiver and aggregation server list 
	if (sharingReceiverChanged) return;
    if (!data) {
        element.hide();
        elementa.hide();
		return;
    }
	data.pop();	//delete last element
	// count the number of receivers and aggregation server
	var mrec = 0; 
	var aggs = 0;
	for (var key in data) {
		var p = data[key].split("\n");
		if (p[3] == 0) mrec ++;
		else aggs ++;
	}
	// media receivers list
	var html = "";
	// set header if there are receivers
	if (mrec > 0) {
		html = '<tr>\
			<th>\
			</th>\
			<th>\
				<span>' + getString("mac") + '</span>\
			</th>\
			<th>\
				<span>' +
		getString("ip") +
		'</span>\
			</th>\
			<th>\
				<span>' +
		getString("friendlyname") +
		'</span>\
			</th>\
			<th>\
				<span>' +
		getString("receivertype") +
		'</span>\
			</th>\
			<th>\
				<span>' +
		getString("navtype") +
		'</span>\
			</th>\
		</tr>';
	}
	// aggregation server list
	var elementa = $("[key=aggservers]");
	var htmla = "";
	// set header if there are aggregation server
	if (aggs > 0) {
		htmla = '<tr>\
			<th>\
				<span>' + getString("mac") + '</span>\
			</th>\
			<th>\
				<span>' +
		getString("ip") +
		'</span>\
			</th>\
			<th>\
				<span>' +
		getString("friendlyname") +
		'</span>\
			</th>\
		</tr>';
	}
	$.each(data, function(i, value){
		var receiverPieces = value.split("\n");
		var receiver = {};
		receiver["id"] = receiverPieces[0];
		receiver["mac"] = receiverPieces[1];
		receiver["ip"] = receiverPieces[2];
		receiver["isAggregation"] = receiverPieces[3];
		receiver["enabled"] = receiverPieces[4];
		receiver["clientName"] = receiverPieces[5];
		receiver["icon"] = receiverPieces[6];
		receiver["iconMimeType"] = receiverPieces[7];
		receiver["viewName"] = receiverPieces[8];
		receiver["hasDefaultView"] = receiverPieces[9];
		receiver["friendlyname"] = receiverPieces[10];
		var checked = (receiver.enabled == 1) ? ("checked") : ("");
		if (receiver.isAggregation == 0) {
			html += '<tr id="receiverRow' + i + '">\
		<td>\
			<input onchange="receiverChanged(' +
			i +
			')" type="checkbox" ' +
			checked +
			'/>\
		</td>\
		<td>\
			<input class="macInput" type="text" value="' +
			receiver.mac +
			'" disabled="true" style="cursor:default" />\
		</td>\
		<td>\
			<input class="ipInput" type="text" value="' +
			receiver.ip +
			'" disabled="true" style="cursor:default" />\
		</td>\
		<td>\
			<input class="fnameInput" type="text" value="' +
			receiver.friendlyname +
			'" disabled="true" title="' + receiver.friendlyname + '" alt="' + receiver.friendlyname + '" style="cursor:default" />\
		</td>\
		<td>' +
			getReceiverClientDropdown(receiver.clientName, i) +
			'</td>\
		<td>' +
			getReceiverViewDropdown(receiver.viewName, receiver.hasDefaultView == 1, i) +
			'</td>\
	</tr>';
		} else {
			htmla += '<tr id="aggserverRow' + i + '">\
		<td>\
			<input class="macInput" type="text" value="' +
			receiver.mac +
			'" disabled="true" style="cursor:default" />\
		</td>\
		<td>\
			<input class="ipInput" type="text" value="' +
			receiver.ip +
			'" disabled="true" style="cursor:default" />\
		</td>\
		<td>\
			<input class="fnameInput" type="text" value="' +
			receiver.friendlyname +
			'" disabled="true" title="' + receiver.friendlyname + '" alt="' + receiver.friendlyname + '" style="cursor:default" />\
		</td>\
	</tr>';
		}
	});
	element.html("");
	element.show();
	element.append(html);
	elementa.html("");
	elementa.show();
	elementa.append(htmla);
}
function updateSharedFolderList(element, data){
	// shared folder list
	element.html("");
	var html = "";
	var dirPairs = splitContentDirs(data);
	var html = "";
	if ((dirPairs.length == 1) && (dirPairs[0] == "")) {
		element.append(getNewSharedFolderRowHtml(dirPairs.length));
		return;
	}
	// list the content dirs
	$.each(dirPairs, function(i, value){
		var dirPieces = value.split("|");
		var dirPath = dirPieces[1];
		var dirKeys = dirPieces[0];
		var enabledKey = dirKeys.substring(0, 1);
		var mediaKey = dirKeys.substring(1, 2);
		var shared = (enabledKey == "+" || enabledKey == "*") ? ("checked") : ("");
		var enabledForAgg = (enabledKey == "*") ? ("checked") : ("");
		html += '<div class="sharingRowWrapper">\
			<input class="sharedCheckbox floatL" onclick="uncheckAggregationBox($(this))" type="checkbox" ' + shared + '/><input id="pathInput' + i + '" class="longInput pathInput floatL" type="text" value="' + dirPath + '"/>\
			<select class="contentTypeDropdown floatL">\
				<option value="A" ' +
		checkSelectedMediaOption(mediaKey, "A") +
		'>'+getString("allcontenttypes")+'</option>\
				<option value="M" ' +
		checkSelectedMediaOption(mediaKey, "M") +
		'>'+getString("music")+'</option>\
				<option value="P" ' +
		checkSelectedMediaOption(mediaKey, "P") +
		'>'+getString("photos")+'</option>\
				<option value="V" ' +
		checkSelectedMediaOption(mediaKey, "V") +
		'>'+getString("videos")+'</option>\
				<option value="m" ' +
		checkSelectedMediaOption(mediaKey, "m") +
		'>'+getString("photos")+' & '+getString("videos")+'</option>\
				<option value="p" ' +
		checkSelectedMediaOption(mediaKey, "p") +
		'>'+getString("music")+' & '+getString("videos")+'</option>\
				<option value="v" ' +
		checkSelectedMediaOption(mediaKey, "v") +
		'>'+getString("music")+' & '+getString("photos")+'</option>\
			</select>\
			<a class="actionbtn floatL" onclick="showFolderBrowse(' +
		i +
		')" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
		getString("browse") +
		'</span><span class="actionbtn_r"></span></a>\
				<input id="aggCheckbox' +
		i +
		'" class="aggregationCheckbox floatL" onclick="checkShareBox($(this))" type="checkbox" ' +
		enabledForAgg +
		'/>' +
		'<label for="aggCheckbox' +
		i +
		'">' +
		getString("shareforagg") +
		'</label>\
			<div class="clear">\
			</div>\
		</div>';
	});
	element.html(html);
	element.append(getNewSharedFolderRowHtml(dirPairs.length + 1));
}

function submitSharingData(){
	var args = submitSharingData.arguments.length;
    returnedCalls = 0;
    expectedCalls = 1;
	showLoadingGraphic();
    hideActionButtons();
    resetChanged();
    //Only submit client_add requests for receivers that have been changed.
	sharingReceiverChanged = false;
    $.each(changedReceivers, function(key, receiverRow){
        expectedCalls++;
        var enabled = ($("input[type=checkbox]", receiverRow).attr("checked")) ? ("1") : ("0");
        var clientId = $("select[name=clientType]", receiverRow).val();
        var viewName = $("select[name=viewName]", receiverRow).val();
        var mac = $(".macInput", receiverRow).val();
        makeGetRequest("/rpc/client_add", {
            "mac": mac,
            "id": clientId,
            "enabled": enabled,
            "view": viewName
        }, function(){
            returnedCalls++;
            finishSaving();
        });
    });

    var shareFoldersList = $(".sharingRowWrapper", $("#share_folders_container"));
	var emptyPath = false;
	var contentDirKey = "contentdir=";
    var contentDir = "contentdir=";
    $.each(shareFoldersList, function(i, value){
        var dirInput = $(".pathInput", value);
        var dirPath = dirInput.val();
        if (dirPath) {
            var sharedCheckbox = $(".sharedCheckbox", value);
            var aggregationCheckbox = $(".aggregationCheckbox", value);
            var enabledKey;
            if (sharedCheckbox.is(":checked") && aggregationCheckbox.is(":checked")) {
                enabledKey = "*";
            }
            else 
                if (sharedCheckbox.is(":checked")) {
                    enabledKey = "+";
                }
                else {
                    enabledKey = "-";
                }
            var mediaKey = $(".contentTypeDropdown", value).val();
            contentDir += enabledKey + mediaKey + "|" + dirPath + ",";
        }
		else emptyPath = true;
    });
	if (contentDir.length > contentDirKey.length) contentDir = contentDir.substring(0, contentDir.length - 1);
	var data = "";
	data += contentDir + "\n";
    var autoshareCheckbox = $("#autoshareCheckbox", $(".serverSettingsContentWrapper"));
	var autoshareCheckboxValue = ((autoshareCheckbox.is(":checked")) ? (1) : (0));
	if (sharingOrig["rmautoshare"] != autoshareCheckboxValue) data += "rmautoshare=" + autoshareCheckboxValue + "\n";
    var clientautoenable = (($("input[key=clientautoenable]").attr("checked") == true) ? ("1") : ("0"));
	if (sharingOrig["clientautoenable"] != clientautoenable) data += "clientautoenable=" + clientautoenable  + "\n";
    //var data = contentDir + "\n" + autoshareRmEnabled + "\n" + clientautoenable + "\n";
    makePostRequest("/rpc/set_all", {}, data, function(){
        returnedCalls++;
        finishSaving();
		hideLoadingGraphic();
		if ((args > 0) && emptyPath) {
			updateSharedFolderList($("[key=contentdir]"), contentDir.substring(contentDirKey.length, contentDir.length))
		}
    });
}


// ------------------------
// aggregation page
// ------------------------
function loadAggregation(){
    returnedCalls = 0;
    expectedCalls = 2;
    saveHandler = "submitAggregationData();"
	inputFieldClicked = false;
    changesMade = false;

	showLoadingGraphic();
    
    makeGetRequest("/rpc/get_all", {}, function(response){
        parseSeparatedData(response, aggregation, aggregationOrig, "=");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadAggregationHtml();
			hideLoadingGraphic();
        }
    });
    
    //The listaggregatedservers call will fail if aggregation is disabled. If data is returned, handle it as normal.
    //Otherwise, make sure the aggregated servers collection is empty and load the HTML.
    $.ajax("/rpc/listaggregatedservers", {
        success: function(response){
            parseData(response, aggregation, aggregationOrig, "aggregatedservers", "--");
            returnedCalls++;
            if (expectedCalls == returnedCalls) {
                loadAggregationHtml();
				hideLoadingGraphic();
            }
        },
        error: function(){
            aggregation["aggregatedservers"] = null;
            returnedCalls++;
            if (expectedCalls == returnedCalls) {
                loadAggregationHtml();
				hideLoadingGraphic();
            }
        }
    });
}

function loadAggregationHtml(){
    makeGetRequest("/webconfig/aggregation.htm", {}, function(response){
        var responseHtml = $(response);
        replaceStrings(responseHtml);
        replaceData(responseHtml, aggregation, handleAggregationData);
		showToggleButtons(responseHtml);
        
        $(".serverSettingsContentWrapper").html(responseHtml);
        //Show or hide the aggregation server container based on whether or not aggregation is enabled.
        toggleAvailableServers(aggregation["aggregation"] == 1);
        $("input,select", "#aggregationContainer").live("change", onEventChange);
        highlightNav($("#nav_aggregation"));
        updateTimer = setInterval(updateAggregation, updateTimerInterval);
    });
}

function updateAggregation(){
    //Only call to get an updated list of servers if no changes have been made.  This avoids
    //   updating HTML while a user is making changes.
    if(!changesMade) {
       $.ajax("/rpc/listaggregatedservers", {
           success: function(response){
               parseData(response, aggregation, aggregationOrig, "aggregatedservers", "--");
               updateAggregatedServers($("[key=aggregatedservers]"), aggregation.aggregatedservers);
           },
           error: function(){
               aggregation["aggregatedservers"] = null;
           }
       });
    }
}

function handleAggregationData(element, key, data){
    switch (key) {
        case "aggregation":
            if (data == 1) {
                element.attr("checked", true);
            }
            break;
        case "aggmode":
            var matchingInput = $("input[type=radio][name=aggregationMode][value=" + data + "]", element);
            matchingInput.attr("checked", true);
            break;
        case "aggregatedservers":
            updateAggregatedServers(element, data);
            break;
    }
}

function updateAggregatedServers(element, data){
    if (data) {
        var serverHtml = "";
        //Pop the last element of the collection off, since it's an empty piece of data.
        data.pop();
        $.each(data, function(i, value){
            var serverDataPieces = value.split("<br>");
            var serverData = {};
            $.each(serverDataPieces, function(i, value){
                var dataKey = value.substring(0, 1);
                var dataValue = value.substring(2, value.length).replace(/\n/g, "");
                serverData[dataKey] = dataValue;
            });
            var musicChecked = "";
            var photosChecked = "";
            var videosChecked = "";
            switch (serverData["F"]) {
                case "A":
                    musicChecked = "checked";
                    photosChecked = "checked";
                    videosChecked = "checked";
                    break;
                case "M":
                    musicChecked = "checked";
                    break;
                case "P":
                    photosChecked = "checked";
                    break;
                case "V":
                    videosChecked = "checked";
                    break;
                case "m":
                    photosChecked = "checked";
                    videosChecked = "checked";
                    break;
                case "p":
                    musicChecked = "checked";
                    videosChecked = "checked";
                    break;
                case "v":
                    musicChecked = "checked";
                    photosChecked = "checked";
                    break;
            }
            
            serverHtml += '<div uuid="' + serverData["S"] + '" class="availableServerContainer">' +
            serverData["N"] +
            '<div>\
                <span class="serverMediaLabel"><input onclick="onServerChanged(\'' +
            serverData["S"] +
            '\')" name="songs" type="checkbox"' +
            musicChecked +
            '/>' +
            getString("songs") +
            ' ' +
            serverData["M"] +
            '</span><span class="serverMediaLabel"><input onclick="onServerChanged(\'' +
            serverData["S"] +
            '\')" name="photos" type="checkbox"' +
            photosChecked +
            '/>' +
            getString("photos") +
            ' ' +
            serverData["P"] +
            '</span><span class="serverMediaLabel"><input onclick="onServerChanged(\'' +
            serverData["S"] +
            '\')" name="videos" type="checkbox"' +
            videosChecked +
            '/>' +
            getString("videos") +
            ' ' +
            serverData["V"] +
            '</span>\
            </div>\
            <div class="radioControlWrapper">\
                <input onclick="onServerChanged(\'' +
            serverData["S"] +
            '\')" name="' +
            serverData["S"] +
            'aggmode" type="radio" ' +
            checkAggMode(0, serverData["E"]) +
            ' value="0" />\
                <div class="radioControlTextWrapper nocaption">\
                    <div class="radioHeader">' +
            getString("ignore") +
            '</div>\
                </div>\
                <div class="clear">\
                </div>\
            </div>\
            <div class="radioControlWrapper">\
                <input onclick="onServerChanged(\'' +
            serverData["S"] +
            '\')" name="' +
            serverData["S"] +
            'aggmode" type="radio" ' +
            checkAggMode(1, serverData["E"]) +
            ' value="1" />\
                <div class="radioControlTextWrapper nocaption">\
                    <div class="radioHeader">' +
            getString("aggregate") +
            '</div>\
                </div>\
                <div class="clear">\
                </div>\
            </div>\
            <div class="radioControlWrapper">\
                <input onclick="onServerChanged(\'' +
            serverData["S"] +
            '\')" name="' +
            serverData["S"] +
            'aggmode" type="radio" ' +
            checkAggMode(2, serverData["E"]) +
            ' value="2" />\
                <div class="radioControlTextWrapper nocaption">\
                    <div class="radioHeader">' +
            getString("mirror") +
            '</div>\
                </div>\
                <div class="clear">\
                </div>\
            </div>\
		</div>';
        });
        element.show();
        element.html(serverHtml);
    }
    else {
        element.hide();
    }
}

//A utility function to determine whether a checkbox or radio input should be checked.
//aggMode: The value of the input in question.
//compareMode: The string to compare to.
function checkAggMode(aggMode, compareMode){
    return (aggMode == compareMode) ? ("checked") : ("");
}

//When a server is updated, add it to the changedServers collection.
//uuid: The uuid of the changed server.
function onServerChanged(uuid){
    changedServers[uuid] = uuid;
}

function toggleAvailableServers(isAggEnabled){
    (isAggEnabled) ? ($("#availableServersContainer").show()) : ($("#availableServersContainer").hide());
}

function submitAggregationData(){
    hideActionButtons();
    returnedCalls = 0;
    expectedCalls = 1;
	
	showLoadingGraphic();
    resetChanged();
	
    var aggregationEnabledCheckbox = $("#aggregationEnabledCheckbox");
    var enableAggregation = ((aggregationEnabledCheckbox.is(":checked")) ? (1) : (0));
    var aggMode = $("input[name=aggregationMode]:checked").val();
    //var data = enableAggregation + "\n" + aggMode + "\n";
	var data = "";
	if (aggregationOrig["aggregation"] != enableAggregation) data += "aggregation=" + enableAggregation + "\n";
	if (aggregationOrig["aggmode"] != aggMode) data += "aggmode=" + aggMode + "\n";
    
    var aggregationServers = $(".availableServerContainer");
    $.each(aggregationServers, function(i, value){
        var element = $(value);
        //Only submit aggregatedserverswitch and aggregatedservercontent calls for servers that have been changed
        //(are in the changedServers collection).
        if (changedServers[element.attr("uuid")]) {
            expectedCalls += 2;
            var selectedAggregationMode = $("input[type=radio]:checked", element).val();
            var selectedContentTypes = $("input[type=checkbox]:checked", element);
            var musicChecked = false;
            var photosChecked = false;
            var videosChecked = false;
            $.each(selectedContentTypes, function(i, value){
                var checkbox = $(value);
                switch (checkbox.attr("name")) {
                    case "songs":
                        musicChecked = true;
                        break;
                    case "photos":
                        photosChecked = true;
                        break;
                    case "videos":
                        videosChecked = true;
                        break;
                }
            });
            var contentType = "";
            if (musicChecked && photosChecked && videosChecked) {
                contentType = "A";
            }
            else 
                if (musicChecked && photosChecked) {
                    contentType = "v";
                }
                else 
                    if (musicChecked && videosChecked) {
                        contentType = "p";
                    }
                    else 
                        if (photosChecked && videosChecked) {
                            contentType = "m";
                        }
                        else 
                            if (musicChecked) {
                                contentType = "M";
                            }
                            else 
                                if (photosChecked) {
                                    contentType = "P";
                                }
                                else 
                                    if (videosChecked) {
                                        contentType = "V";
                                    }
            makeGetRequest("/rpc/aggregatedserverswitch", {
                "uuid": element.attr("uuid"),
                "enabled": selectedAggregationMode
            }, function(){
                returnedCalls++;
                finishSaving();
            });
            makeGetRequest("/rpc/aggregatedservercontent", {
                "uuid": element.attr("uuid"),
                "cType": contentType
            }, function(){
                returnedCalls++;
                finishSaving();
            });
        }
    });
    makePostRequest("/rpc/set_all", {}, data, function(){
        returnedCalls++;
        finishSaving();
		hideLoadingGraphic();
    });
}

function finishSaving(){
    if (returnedCalls == expectedCalls) {
        showActionButtons();
        makeGetRequest("/rpc/info_status", {}, function(data){
            var dataPieces = data.split("\n");
            $.each(dataPieces, function(i, value){
                var pieces = value.split("|");
                if (pieces[0] == "restartpending") {
                    var restartPending = (pieces[1] == 1);
                    if (restartPending) {
                        showDialogOverlay(function(){
                            return getString("restartprompt")
                        }, {}, [{
                            text: getString("ok"),
                            onclick: "restartServer();"
                        }, {
                            text: getString("cancel"),
                            onclick: "hideDialogOverlay();"
                        }]);
                    }
                    return false;
                }
            });
        });
    }
}


// ------------------------
// advanced page
// ------------------------
function loadAdvanced(){
    returnedCalls = 0;
    expectedCalls = 6;
    saveHandler = "submitAdvancedData();"
	inputFieldClicked = false;
    changesMade = false;

	showLoadingGraphic();
    
    // function get_server_type restored - should be retired again.
	makeGetRequest("/rpc/get_server_type", {}, function(response){
		advanced["servertype"] = response;
		returnedCalls++;
		if (expectedCalls == returnedCalls) {
            loadAdvancedHtml();
			hideLoadingGraphic();
		}
	});
	
	makeGetRequest("/rpc/get_all", {}, function(response){
        parseSeparatedData(response, advanced, advancedOrig, "=");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadAdvancedHtml();
			hideLoadingGraphic();
        }
    });

    makeGetRequest("/rpc/info_status", {}, function(response){
		parseSeparatedData(response, advanced, advancedOrig, "|");
		// advanced["servertype"] = getServerType(advanced["licensestatus"]);
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadAdvancedHtml();
			hideLoadingGraphic();
        }
    });

    makeGetRequest("/rpc/get_portal_info", {}, function(response){
        advanced["portalinfo"] = response;
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadAdvancedHtml();
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/get_option?portalusername", {}, function(response){
        advanced["portalusername"] = response;
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadAdvancedHtml();
			hideLoadingGraphic();
        }
    });
    
    makeGetRequest("/rpc/get_webdav_link", {}, function(response){
        parseData(response, advanced, advancedOrig, "webdavLink", "\n");
        returnedCalls++;
        if (expectedCalls == returnedCalls) {
            loadAdvancedHtml();
			hideLoadingGraphic();
        }
    });
}

function loadAdvancedHtml(){
    makeGetRequest("/webconfig/advanced.htm", {}, function(response){
        var responseHtml = $(response);
        replaceStrings(responseHtml);
        replaceData(responseHtml, advanced, handleAdvancedData);
		showToggleButtons(responseHtml);
        
        $(".serverSettingsContentWrapper").html(responseHtml);
        hideWebdavContainer(advanced["webdavLink"]);
        $("input", "#advancedContainer").live("click", onEventClick);
        $("input,select", "#advancedContainer").live("change", onEventChange);
        highlightNav($("#nav_advanced"));
    });
}

function hideWebdavContainer(data){
	if (data[0].toLowerCase() == "nowebdav") {
		($("#availableWebdavContainer").hide());
	} else {
		($("#availableWebdavContainer").show());
	}
}

function handleAdvancedData(element, key, data){
	var serverType = advanced["servertype"];
    switch (key) {
		case "accessuser":
            element.val(data);
			break;
        case "accesspwd":
			if (data.length > 0) element.val("_twonkypassword_");
			break;
		case "myexperience":
			// Do not show the header "Improve My Experience" if it is the free server
			if (serverType.toLowerCase().lastIndexOf("free") > -1) break;
			// Do not show the header "Improve My Experience" if it is a server with license key
			if ((advanced["licensestatus"] >= 2) && (advanced["cdkey"].length > 1)) break;
			// show this header if it is an OEM server
			if (advanced["reportdevice"])
				element.show();
            break;
		case "reportdevice":
            element.attr("checked", data > 0)
            break;
        case "compilationsdir":
        case "scantime":
            element.val(data);
            break;
		case "nicrestart":
            element.attr("checked", data > 0)
            break;
		case "v":
            element.attr("checked", data > 0)
            break;
         case "webdavLink":
			element.attr("href", data);			
            break;
        case "portaldisassociation":
            if (noMediaFusionServer || myTwonkyDisabled) break;
			if ((advanced["portalinfo"] != "useronline") && (advanced["portalinfo"] != "notloggedin")) break;
			element.show();
			break;
        case "portalinfo":
            if (noMediaFusionServer || myTwonkyDisabled) break;
			if ((data != "useronline") && (data != "notloggedin")) break;
			var renewStr = "";
			var serverTypeShort = "premium";
			if (serverType.toLowerCase().lastIndexOf("free") > -1) {
				serverTypeShort = "free";
			}
			var disLink = '<div><a class="actionbtnmd bold" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)"\
				onclick="disassociatePortalLink(\'' + serverTypeShort + '\')"><span class="actionbtn_l"></span><span class="actionbtn_c">' +
				getString("portaldisassociate") +
				'</span><span class="actionbtn_r"></span></a></div>';					
			switch (data) {
				case "useronline":
					returnValue = getString("loggedinas") + " " + advanced["portalusername"] + '<br /><br />' + disLink + '<div class="serverContentSpacer"></div>';
					element.html(returnValue);
					break;
				case "notloggedin":
					returnValue = getString("loginneededcaption") + '<br /><br />' + disLink + '<div class="serverContentSpacer"></div>';
					element.html(returnValue);
                    break;
			}
	}
}




//Get HTML for the receiver navigation view dropdown.
//selectedView: The currently selected navigation view for the current receiver.
//isDefault: A boolean that indicates whether or not the user is able to update the dropdown. If true, a disabled
//dropdown is returned.
//i: The row number used to uniquely identify the receiver.
function getReceiverViewDropdown(selectedView, isDefault, i){
    var html = "";
    if (!isDefault) {
        html = '<select name="viewName" onchange="receiverChanged(' + i + ')">\
            <option value="mobile" ' +
        checkSelectedMediaOption("mobile", selectedView) +
        '>' +
        getString("mobile") +
        '</option>\
            <option value="simpledefault" ' +
        checkSelectedMediaOption("simpledefault", selectedView) +
        '>' +
        getString("simpledefault") +
        '</option>\
            <option value="ipodlike" ' +
        checkSelectedMediaOption("ipodlike", selectedView) +
        '>' +
        getString("ipodlike") +
        '</option>\
            <option value="byfolder" ' +
        checkSelectedMediaOption("byfolder", selectedView) +
        '>' +
        getString("byfolder") +
        '</option>\
            <option value="advanceddefault" ' +
        checkSelectedMediaOption("advanceddefault", selectedView) +
        '>' +
        getString("advanceddefault") +
        '</option>\
        </select>';
    }
    else {
        html = '';
    }
    return html;
}

//Get HTML for the receiver client type dropdown.
//selectedView: The currently selected navigation view for the current receiver.
//i: The row number used to uniquely identify the receiver.
function getReceiverClientDropdown(selectedClient, i){
    var html = '<select class="clientType" name="clientType" onchange="receiverChanged(' + i + ')">';
    var clientPieces = sharing.clients[0].split(",");
    $.each(clientPieces, function(i, value){
        if (i % 2 == 0) {
            html += '<option value="' + value + '" ';
        }
        else {
            html += checkSelectedMediaOption(value, selectedClient) + '>' + value + '</option>';
        }
    });
    html += "</select>";
    return html;
}

//Add a changed receiver to the changedReceviers collection.
//i: The row number of the changed receiver.
function receiverChanged(i){
	sharingReceiverChanged = true;
    changedReceivers[i] = $("#receiverRow" + i, ".mediaReceiversTable");
}

function clearPassword() {
	$("#password").val("");
}

function submitAdvancedData(){
	var accessCredentialChanged = false;
    hideActionButtons();
    returnedCalls = 0;
    expectedCalls = 1;

	showLoadingGraphic();
    resetChanged();

    var compilations = $("#compilations", ".accountSettingsContainer").val();
    var rescan = $("#rescan", ".accountSettingsContainer").val();
    var nicrestart = (($("#nicRestartEnabledCheckbox").attr("checked") == true) ? ("1") : ("0"));
    var myexperience = (($("#myExperienceEnabledCheckbox").attr("checked") == true) ? ("1") : ("0"));
    var loggingEnabled = (($("#loggingEnabledCheckbox").attr("checked") == true) ? ("4095") : ("0"));
	var data = "";
	if (advancedOrig["compilationsdir"] != compilations) data += "compilationsdir=" + compilations + "\n";
	if (advancedOrig["scantime"] != rescan) data += "scantime=" + rescan + "\n";
	if (advancedOrig["nicrestart"] != nicrestart) data += "nicrestart=" + nicrestart + "\n";
	if (advancedOrig["myexperience"] != myexperience) data += "reportdevice=" + myexperience + "\n";
	if (advancedOrig["v"] != loggingEnabled) data += "v=" + loggingEnabled + "\n";

	if (!($("#password", ".accountSettingsContainer").val() == "_twonkypassword_")) {
		var username = "accessuser=" + $("#username", ".accountSettingsContainer").val();
		var password = "accesspwd=" + $("#password", ".accountSettingsContainer").val();
		if (((username.length > 11) && (password.length > 10)) || ((username.length == 11) && (password.length == 10))) {
			// set new username password
			data += username + "\n" + password + "\n";
			accessCredentialChanged = true;
		} else {
			// reset username and password (only username or password was entered)
			$("#username").val(advancedOrig["accessuser"]);
			if (advancedOrig["accesspwd"].length > 0) $("#password").val("_twonkypassword_");
			else $("#password").val("");
			showDialogOverlay(function(){
				return getString("notchanged")
			}, {}, [{
				text: getString("ok"),
				onclick: "hideDialogOverlay();"
			}]);
		}
	}
	makePostRequest("/rpc/set_all", {}, data, function(){
		returnedCalls++;
		finishSaving();
		hideLoadingGraphic();
		//Refresh the page if the user has changed the username or password to make sure the user is prompted correctly.
		//if ($("#username", ".accountSettingsContainer").val() != advanced["accessuser"] || $("#password", ".accountSettingsContainer").val() != advanced["accesspwd"]) {
		if (accessCredentialChanged) {
			updateWebDavAdmin($("#username", ".accountSettingsContainer").val(), $("#password", ".accountSettingsContainer").val());	// change also the WebDav server admin credentials 
			location.reload();
		}
   });
}

function updateWebDavAdmin(user, pass) {
	var request = loadXMLDoc("/update_admin_account?user="+user+"&pass="+pass,"");
	if (request.status < 200 && request.status > 300)
		showDialog(getString("dialog_admin_acc_could_not_update"));
	else {
		admin_user_name = user;
		admin_password = pass;
	}
}

var restartTest;
function restartServer(){
    makeGetRequest("/rpc/restart", {}, function(){
        showDialogOverlay(function(){
            return "<div class='spinner floatL'></div><div style='padding: 5px 0px 0px 10px;' class='floatL'>" + getString("serverrestarting") + "</div>"
        }, {}, {});
        restartTest = setInterval(function(){
            makeGetRequest("/rpc/get_all", {}, function(){
                clearInterval(restartTest);
                hideDialogOverlay();
                // Update aggregation info after the restart is complete on the Aggregation page to display the list of servers more quickly.
                if(window.location.hash == '#aggregation') {
                    // Callback must be on a short timeout in order to work since rpc call needs a short amount of time to popuplate list of
                    //      aggregation servers after restarting, if call is done without timeout, response is still empty.
                    setTimeout("updateAggregation()", 1500);
                }
            })
        }, 1000);
    });
}

function rescanFolders(){
    makeGetRequest("/rpc/rescan", {}, null);
}

//Display a dialog that prompts the user before completing a server reset.
function promptReset(){
    showDialogOverlay(function(){
        return getString("resetprompt");
    }, null, {
        1: {
            text: getString("ok"),
            onclick: "hideDialogOverlay(); resetServer()"
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    });
}

var resetTest;
function resetServer(){
    makeGetRequest("/rpc/reset", {}, function(){
        showDialogOverlay(function(){
            return "<div class='spinner floatL'></div><div style='padding: 5px 0px 0px 10px;' class='floatL'>" + getString("serverrestarting") + "</div>"
        }, {}, {});
		var t = setTimeout("waitingForServer()", 3000);
    });
}
function waitingForServer() {
	resetTest = setInterval(function(){
		makeGetRequest("/rpc/get_all", {}, function(response){
			if (response != "") {
				clearInterval(resetTest);
				setReloadSide = true;
				hideDialogOverlay();
			}
		})
	}, 2000);
}

function clearCache(){
    makeGetRequest("/rpc/clear_cache", {}, null);
}


var resetTest;
function resetClients(){
    makeGetRequest("/rpc/resetclients", {}, function(){
        showDialogOverlay(function(){
            return "<div class='spinner floatL'></div><div style='padding: 5px 0px 0px 10px;' class='floatL'>" + getString("clientreset") + "</div>"
        }, {}, {});
        resetTest = setInterval(function(){
            makeGetRequest("/rpc/get_all", {}, function(){
                clearInterval(resetTest);
                hideDialogOverlay();
                loadSharing();
            })
        }, 1000);
    });
}

function viewLog(){
    window.open("/rpc/log_getfile", "_blank");
}

function clearLog(){
    makeGetRequest("/rpc/log_clear", {}, null);
}

//Add the active class to a button when the mouse is pressed.
function onButtonMouseDown(button){
    var button = $(button);
    button.addClass("active");
}

//Remove the active class from a button when the mouse is released.
function onButtonMouseUp(button){
    var button = $(button);
    button.removeClass("active");
}

function cancelSettings(){
    resetChanged();
    $(window).trigger("hashchange");
}

function showActionButtons(){
    $("#actionButtonContainer").show();
    $("#spinnerContainer").hide();
}

function hideActionButtons(){
    $("#actionButtonContainer").hide();
    $("#spinnerContainer").show();
}

//Display a dialog overlay and opaque the background to prevent the user from interacting with the page until
//the dialog is closed.
//contentConstructor: The function to be called in order to populate the contents of the dialog.
//contentArgs: Arguments to be passed to the content constructor.
//buttons: A collection of buttons to include in the dialog. Buttons should be in the format {"text": text, "onclick":
//"onClickFunction()"}, where text is the text to be shown on the button and onclick is the function to be called
//when the button is clicked, expressed as a string ("onClickFunction()" rather than onClickFunction). 
function showDialogOverlay(contentConstructor, contentArgs, buttons, widthClass){
    var dialog = $("#dialogOverlay");
    if (dialog) {
        dialog.remove();
    }
    var body = $(document.body);
    var contentHtml = contentConstructor(contentArgs);
    var buttonHtml = makeButtons(buttons);
    var overlay = $("#overlay");
    if (overlay.length < 1) {
        body.append("<div id='overlay' class='overlay'></div>");
    }
    body.append('<div id="dialogOverlay" class="dialogWrapper ' + widthClass + '"> \
	<b class="dialogTop"><b class="d1"></b><b class="d2"></b><b class="d3"></b><b class="d4"></b></b> \
		<div class="dialogContentWrapper">\
			<div class="dialogContent">\
				' +
    contentHtml +
    '\
				<div class="dialogButtonContainer" id ="dialogButtonContainer">\
					' +
    buttonHtml +
    '\
				</div>\
				<div class="clear"></div>\
			</div>\
		</div>\
	<b class="dialogBottom"><b class="d4"></b><b class="d3"></b><b class="d2"></b><b class="d1"></b></b></div>');
    var dialog = $("#dialogOverlay");
    var dialogWidth = dialog.outerWidth();
    var left = (body.width() / 2) - (dialogWidth / 2);
    dialog.css("left", left);
    if (contentArgs && contentArgs.onstart) {
        contentArgs.onstart();
    }
}

//Iterate through the collection of buttons to produce the HTML for them.
//buttons: The collection of button objects.
function makeButtons(buttons){
    var buttonHtml = "";
    $.each(buttons, function(key, button){
        buttonHtml += '\
			<a class="actionbtnmd floatL" onclick="' + button.onclick + '" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)">\
				<span class="actionbtn_l"></span>\
				<span class="actionbtn_c">' +
        button.text +
        '</span>\
				<span class="actionbtn_r"></span>\
			</a>';
    });
    return buttonHtml;
}

//Remove the dialog and opaque overlay.
function hideDialogOverlay(){
    var overlay = $("#overlay");
    overlay.remove();
    var dialog = $("#dialogOverlay");
    dialog.remove();
	if (setReloadSide) reloadSide();
	setReloadSide = false;
}

//A function to wrap retrieved JSON data in parentheses for eval-ing to prevent errors.
function parseJson(jsonData){
    return eval("(" + jsonData + ")");
}

var mediaBrowsePageCount;
//The number of items to display on a page of content.
var smallMediaBrowsePageCount = 25;
var largeMediaBrowsePageCount = 35;

//Clear the center display area and update the left navigation for media browsing.
//id: The id of the media category (music, video, photo) to display.
//callback: An optional callback to be called after the media browse view has been initialized.
function loadMediaBrowse(id, callback){
    //If the left navigation hasn't been populated, fetch the left nav HTML.
    if ($("#leftColumn").length == 0) {
        makeGetRequest("/webconfig/browse-nav.htm", {}, function(response){
            var responseHtml = $(response);
            replaceStrings(responseHtml);
            $("#leftNavContainer").html(responseHtml);
            $(".serverSettingsContentWrapper").html('<div class="breadcrumb"></div><div id="browseContents"></div></div><div class="clear"></div><div id="browsePagination"><div class="browsePages largeFont"></div></div>');
            $(".serverSettingsContentWrapper").addClass("contentDisplay");
            //Call this function again after the essential HTML elements have been created for UI pouplation.
            loadMediaBrowse(id, callback);
        });
    }
    //Otherwise, populate the left nav with the options returned from the server.
    else {
		showLoadingGraphic();
        makeGetRequest("/json/feed/" + id, {}, function(response){
            var html = "";
            //Use the larger page count only for the id 0$2, which corresponds to Photos.
            mediaBrowsePageCount = (id == "0$2") ? (largeMediaBrowsePageCount) : (smallMediaBrowsePageCount);
            var json = parseJson(response);
            $.each(json.containerContents, function(i, data){
				if (data.objId == 0) {
					var title = data.title;
					// replace the myTwonky text with a link to the my.twonky.com web page
					if (title.indexOf("myTwonky") >= 0) {
						if (browser == "other") {
							title = title.replace("myTwonky", "<a class=\'inlineLink\' href=\"javascript:openPortalLink(\'login24\')\">myTwonky</a>");
						} else {
							// Safari
							title = title.replace("myTwonky", "<a class=\'inlineLink\' href=\" " + statusData["portallogin24"] + "\" target=\"_self\" onClick=\"javascript:startPortalCheckTimerOnClick(\'login24\')\">myTwonky</a>");
						}
					}
					html += '<li id="' + data.objId + '" >' + title + '</li>';
				} else
					if (data.title == "myTwonky") {
						// do not show myTwonky in the left navigation tree if disablemytwonky is set
						if (!myTwonkyDisabled)
							html += '<li id="' + data.objId + '" onclick="navigateTo(\'id=' + data.objId + '&startPage=0&count=' + data.childCount + '\')"><a>' + data.title + '</a></li>';
					} else {
						html += '<li id="' + data.objId + '" onclick="navigateTo(\'id=' + data.objId + '&startPage=0&count=' + data.childCount + '\')"><a>' + data.title + '</a></li>';
					}
            });
            $("#browseNav").html(html);
            if (callback) {
                callback();
            }
            else {
                $("#browseContents").html("");
                $(".browsePages").html("");
                $(".breadcrumb").html("");
            }
            //If the fragment has an id property in it, extract the id including and immediately after the slash.
            //Use this to make sure the correct left nav option is highlighted.
            var fragmentPieces = $.param.fragment().split("&");
            if (fragmentPieces.length > 1) {
                var fragmentId = fragmentPieces[0].split("=")[1];
                var activeId = fragmentId.split("$").slice(0, 4);
                var activeIdStr = activeId.join("$");
                $("#" + activeIdStr.replace(/\$/g, "\\$").replace(/\//g, "\\/")).addClass("current");
            }
        });
        //Apply the active class to the relevant top nav item.
        $("a", "#nav").removeClass("active");
        var clickedElement = $("#" + id.replace(/\$/g, "\\$"));
        clickedElement.addClass("active");
		hideLoadingGraphic();
    }
}

//Update the center display area with the selected folder or list of media, along with breadcrumbs and pagination.
//id: The id to have its contents displayed.
//startItem: The index of the first item to display. Used for pagination.
//numItems: The number of child items. Used for building breadcrumb navigation.
function loadMediaContents(id, startItem, numItems, reloadContent){
	showLoadingGraphic();
    var cleanedId = id.replace(/\$/g, "\\$").replace(/\//g, "\\/");
	var nullNodes = 0;
	var nodes = 0;
    //Left nav elements have the same id as their corresponding nodes in the media browse API, so if the id can be
    //matched, highlight that element to indicate that it's the currently selected navigation item.
    var clickedElement = $("#" + cleanedId);
	var clickedElementText = $("a", clickedElement).text();
    if ($("#" + cleanedId, "#browseNav").length > 0) {
        $("li", "#browseNav").removeClass("current");
        $("#" + cleanedId, "#browseNav").addClass("current");
    }
    var html = "";
    var branchHtml = "";
    var leafHtml = "";
    var pageCount = (mediaBrowsePageCount > numItems) ? (numItems) : (mediaBrowsePageCount);
    makeGetRequest("/json/feed/" + id, {
        "start": startItem,
        "count": pageCount
    }, function(response){
        var json = parseJson(response);
        html += '<div class="subHeader"><span class="subheaderTitle">' + json.containerTitle + '</span></div>';
        var photosContainer;
        $.each(json.containerContents, function(i, data){
            if (data.nodeType == "branch") {
                // nodeType is branch - show thumbnail for container if possible
                var thumbnail = "";
				var objType = "";
				if (id.substring(0,3) == "0$1") objType = "M";
				if (id.substring(0,3) == "0$2") objType = "P";
				if (id.substring(0,3) == "0$3") objType = "V";
				// online folders and subfolders have no item count!
				// if the event was triggered by the navigation menue (left side) -> was "myTwonky" selected by the user?
				// otherwise check the breadcrumb (linked header) -> starts with "myTwonky" (e.g. myTwonky / My Channels)?
				var onlineFolder = false;
				var clickedBrowseNavElement = false;
				if (clickedElementText == "myTwonky") {
					onlineFolder = true;
					clickedBrowseNavElement = true;
				} else {
					$("#browseNav li").each(function() {
						if ($(this).text() == clickedElementText) clickedBrowseNavElement = true;
					});
				}
				if (!clickedBrowseNavElement) {
					if ($(".breadcrumb").length > 0) {
						if ($(".breadcrumbItem:first")[0].innerHTML.substring(0, 8) == "myTwonky") onlineFolder = true;
					}
				}
                if (data.thumbnail && objType != "P") {
					// container with thumbnail
					var thumbnailData = getThumbnailLink(data.thumbnail, objType, true);
                    thumbnail = '<img class="folderThumbnail" src="' + thumbnailData.link + thumbnailData.scale + '" onerror="loadDefaultThumbnail($(this), \'' + objType + '\')" />';
					// show no item count for myTwonky folders
					if (onlineFolder)
						branchHtml += '<div class="byFolderContainer" onclick="onMediaNodeClicked(this, ' + data.childCount + ')" id="' + data.objId + '"><div id="title"><a class="truncate">' + data.title + '</a><div class="smallFont">&nbsp;</div></div><div class="folderImageWrapper">'+thumbnail+'</div></div>';
					else
						branchHtml += '<div class="byFolderContainer" onclick="onMediaNodeClicked(this, ' + data.childCount + ')" id="' + data.objId + '"><div id="title"><a class="truncate">' + data.title + '</a><div class="smallFont">' + data.childCount + ' items</div></div><div class="folderImageWrapper">'+thumbnail+'</div></div>';
				} else {
					// container with no thumbnail
					// show no item count for myTwonky folders
					if (onlineFolder)
						branchHtml += '<div class="byFolderContainer" onclick="onMediaNodeClicked(this, ' + data.childCount + ')" id="' + data.objId + '"><a class="truncate">' + data.title + '</a><div class="smallFont">&nbsp;</div><div class="folderImageWrapper"><img class="folderThumbnail" src="/webconfig/spacer.gif" onload="getFolderThumbnail($(this), \'' + data.objId + '\')" /></div></div>';
					else
						branchHtml += '<div class="byFolderContainer" onclick="onMediaNodeClicked(this, ' + data.childCount + ')" id="' + data.objId + '"><a class="truncate">' + data.title + '</a><div class="smallFont">' + data.childCount + ' items</div><div class="folderImageWrapper"><img class="folderThumbnail" src="/webconfig/spacer.gif" onload="getFolderThumbnail($(this), \'' + data.objId + '\')" /></div></div>';
				}
				nodes++;
				if (data.childCount == 0) nullNodes++;
            }
            else {
				// nodeType is leaf
                var thumbnail = "";
                if (data.thumbnail && data.objType != "P") {
                    var thumbnailData = getThumbnailLink(data.thumbnail, data.objType);
                    thumbnail = '<img src="' + thumbnailData.link + thumbnailData.scale + '" onerror="loadDefaultThumbnail($(this), \'' + data.objType + '\')" />';
                }
                switch (data.objType) {
                    case "V":
                        var duration = data.duration.split(".")[0];
						if (duration.length == 0) duration = data.duration;
						if (!(duration.indexOf(":") > 0)) {
							if (duration.length == 0) duration = "00:00";
							if (duration.length == 1) duration = "00:0"+duration;
							if (duration.length == 2) duration = "00:"+duration;
						}
						if (duration.length > 5) {
							if (duration.split(":")[0] == "00") {
								duration = duration.substring(3, duration.length);
							} else {
								if (duration.split(":")[0] == "0") {
									duration = duration.substring(2, duration.length);
								}
							}
						}
                        var timeDisplay = (duration) ? ('<div class="timeDisplay">' + duration + '</div>') : ("")
						var datamime = data.mime;
						//datamime = datamime.replace(/&amp;/g, "&");
						//datamime = datamime.replace(/&quot;/g, "\"");
                        leafHtml += '<div class="myLibraryRow">\
                        <div class="myLibraryMediaIcon floatL">' + thumbnail + timeDisplay + '</div>\
                        <div>\
                            <div class="mediaData"><a class="largeFont" href="' +
                        data.link +
                        '" target="_blank">' +
                        data.title +
                        '</a></div>\
                            <div class="mediaData">' +
                        getString("filesize") +
                        ' ' +
                        Math.round((parseInt(data.contentsize) / 1048576) * 100) / 100 +
                        ' MB</div>\
                            <div class="mediaData">' +
                        getString("format") +
                        ' ' +
                        datamime +
                        '</div>\
                            <div class="mediaData">' +
                        getString("year") +
                        ' ' +
                        data.year +
                        '</div>\
                    </div>\
                    <div class="clear"></div>\
                    </div>';
                        break;
                    case "P":
                        if (!photosContainer) {
                            photosContainer = $('<div><div class="allPhotosContainer"></div></div>');
                        }
                        var resolutionPieces = data.resolution.split("x");
                        var width = parseInt(resolutionPieces[0]);
                        var height = parseInt(resolutionPieces[1]);
                        var thumbnailData = getThumbnailLink(data.thumbnail, 'P', false, width, height);
						// Thumbnails for media fusion feeds are not working because scaling of non local images is not possible
                        if ((thumbnailData.link.indexOf("httpproxy/embedded") > 0) || (thumbnailData.link.indexOf("httpproxy/direct") > 0)) 
							 $(".allPhotosContainer", photosContainer).append('<a href="' + data.link + '" target="_blank"><div class="allPhotosItem"><img src="' + thumbnailData.link + '" onerror="loadDefaultThumbnail($(this), \'P\')" style="' + thumbnailData.clip + '"/></div></a>');
                        else $(".allPhotosContainer", photosContainer).append('<a href="' + data.link + '" target="_blank"><div class="allPhotosItem"><img src="' + thumbnailData.link + thumbnailData.scale + '" onerror="loadDefaultThumbnail($(this), \'P\')" style="' + thumbnailData.clip + '"/></div></a>');
                        break;
                    case "M":
                        var duration = data.duration.split(".")[0];
						if (duration.length == 0) duration = data.duration;
						if (!(duration.indexOf(":") > 0)) {
							if (duration.length == 0) duration = "00:00";
							if (duration.length == 1) duration = "00:0"+duration;
							if (duration.length == 2) duration = "00:"+duration;
						}
						if (duration.length > 5) {
							if (duration.split(":")[0] == "00") {
								duration = duration.substring(3, duration.length);
							} else {
								if (duration.split(":")[0] == "0") {
									duration = duration.substring(2, duration.length);
								}
							}
						}
                        if (duration) {
                            duration = "(" + duration + ")";
                        }
                        leafHtml += '<div class="myLibraryListRow">\
                        <div class="myLibraryListIcon floatL">' + thumbnail + '</div>\
                        <div>\
                            <div class="mediaData"><a class="largeFont" href="' +
                        data.link +
                        '" target="_blank">' +
                        data.title +
                        '</a> <span class="largeFont">' +
                        duration +
                        '</span></div>\
                            <div class="mediaData">' +
                        getString("artist") +
                        ' ' +
                        data.artist +
                        '</div>\
                            <div class="mediaData">' +
                        getString("album") +
                        ' ' +
                        data.album +
                        '</div>\
                            <div class="mediaData">' +
                        getString("genre") +
                        ' ' +
                        data.genre +
                        '</div>\
                        </div>\
                        <div class="clear"></div>\
                    </div>';
                        break;
                }
            }
        });
        //Photos require an additional container for layout purposes, so if it exists, add it to the HTML.
        if (photosContainer) {
            $(".allPhotosContainer", photosContainer).append('<div class="clear"></div>')
            leafHtml += photosContainer.html();
        }
        if (branchHtml) {
            branchHtml = '<div>' + branchHtml + '</div><div class="clear"></div>';
        }
        if (leafHtml) {
            leafHtml = '<div>' + leafHtml + '</div>';
            //If the media type isn't photos, add a div to provide separation between folder and media display.
            //Photos already have a degree of separation because of the extra photos wrapper.
            if (branchHtml && !photosContainer) {
                leafHtml = '<div class="mixedContentSeparator"></div>' + leafHtml;
            }
        }
        if (branchHtml || leafHtml) {
            html += branchHtml + leafHtml;
            if ($(".active", "#nav").attr("id") == "0$1") {
                makeGetRequest("/json/feed/" + json.parentId, null, function(data){
                    data = parseJson(data);
                    $.each(data.containerContents, function(key, value){
                        if (value.objId == json.objId && value.playlist) {
                            $(".subHeader", "#browseContents").after('<a class="actionbtnlg floatL playlistButton" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)" href="' + value.playlist + '" target="_blank"><span class="actionbtn_l actionbtn_ico"><img class="icolg icolg_play" src="/webconfig/spacer.gif" /></span><span class="actionbtn_l"></span><span class="actionbtn_c"> ' + getString("play") + ' </span><span class="actionbtn_r"></span></a><div class="clear"></div>');
                            return false;
                        }
                    });
                });
            }
        }
        else {
            var emptyMessage = "";
            switch ($(".active", "#nav").attr("id")) {
                case "0$1":
                    emptyMessage = getString("nomusic");
                    break;
                case "0$2":
                    emptyMessage = getString("nophotos");
                    break;
                case "0$3":
                    emptyMessage = getString("novideos");
                    break;
            }
            html += emptyMessage;
        }
        $("#browseContents").html(html);
        
        var numPages = Math.ceil(numItems / pageCount);
        var currentPageNum = (startItem / mediaBrowsePageCount) + 1;
        var pagesHtml = "<div>";
        if (numPages > 1) {
            var lowerDisplay;
            var upperDisplay;
            //If there are 9 or less pages, display all of them.
            if (numPages <= 9) {
                lowerDisplay = 1;
                upperDisplay = numPages;
            }
            else {
                //Otherwise, display the current page, plus three pages in each direction.
                lowerDisplay = currentPageNum - 3;
                upperDisplay = currentPageNum + 3;
                var numTooLow = 0;
                var numTooHigh = 0;
                //Determine if lowerDisplay is 0 or lower, since we can't display that.
                if (lowerDisplay < 1) {
                    for (var i = 0; i < Math.abs(1 - lowerDisplay); i++) {
                        if (upperDisplay + 1 <= numPages) {
                            numTooLow++;
                        }
                        else {
                            return;
                        }
                    }
                }
                //Determine if upperDisplay is greater than the number of pages, since we can't display that.
                if (upperDisplay > numPages) {
                    for (var i = 0; i < (upperDisplay - numPages); i++) {
                        if (lowerDisplay - 1 >= 1) {
                            numTooHigh++;
                        }
                        else {
                            return;
                        }
                    }
                }
                //If either display threshold is too low or too high, increment the other so 7 pages are always shown.
                if (numTooLow) {
                    lowerDisplay += numTooLow;
                    upperDisplay += numTooLow;
                }
                if (numTooHigh) {
                    lowerDisplay -= numTooHigh;
                    upperDisplay -= numTooHigh;
                }
            }
            var previousPagesHtml = "";
            //If page 1 and page 2 aren't already displayed, show them.
            if (1 < lowerDisplay) {
                previousPagesHtml += makePaginationLink(id, 0 * pageCount, numItems, 1)
            }
            if (2 < lowerDisplay) {
                previousPagesHtml += makePaginationLink(id, 1 * pageCount, numItems, 2)
            }
            if (previousPagesHtml) {
                previousPagesHtml += " ... ";
                pagesHtml += previousPagesHtml;
            }
            //Show a link for each page in the range of lowerDisplay to upperDisplay.
            for (var i = lowerDisplay - 1; i < upperDisplay; i++) {
                if ((i * pageCount) == startItem) {
                    pagesHtml += '<span>' + (i + 1) + '</span> ';
                }
                else {
                    pagesHtml += makePaginationLink(id, i * pageCount, numItems, i + 1)
                }
            }
            var subsequentPagesHtml = "";
            //If the last two pages aren't already displayed, show them.
            if (numPages - 1 > upperDisplay) {
                subsequentPagesHtml += makePaginationLink(id, (numPages - 2) * pageCount, numItems, numPages - 1)
            }
            if (numPages > upperDisplay) {
                subsequentPagesHtml += makePaginationLink(id, (numPages - 1) * pageCount, numItems, numPages)
            }
            if (subsequentPagesHtml) {
                subsequentPagesHtml = " ... " + subsequentPagesHtml;
                pagesHtml += subsequentPagesHtml;
            }
        }
        pagesHtml += "</div>";
        
        //Display some text to indicate the current range of items and the total number.
        if (numPages > 1) {
            var endItem = (parseInt(startItem) + pageCount)
            pagesHtml += "<div>" + (parseInt(startItem) + 1) + " - " + ((endItem < numItems) ? endItem : numItems) + " " + getString("of") + " " + numItems + "</div>";
        }
        $(".browsePages").html(pagesHtml);
        //To provide a better user experience, when a media browse link is clicked, scroll back to the top of the page. 
        window.scrollTo(0, 0);
        
        var breadcrumb = $(".breadcrumb");
        var lastBreadcrumb = $(".breadcrumb > .breadcrumbItem:last");
        //If there's no breadcrumb yet, add one.
        if (lastBreadcrumb.length == 0) {
            //If an element can be found that matches with the selected element, add inactive text to the breadcrumb.
            if ($("a", clickedElement).length > 0) {
                breadcrumb.append('<span class="breadcrumbItem" pathid="' + id + '" numitems="' + numItems + '">' + $("a", clickedElement).text() + '</span>');
                lastBreadcrumb = $(".breadcrumb > .breadcrumbItem:last");
            }
            //Otherwise, the user has refreshed the page and a fresh breadcrumb needs to be generated.
            else {
                var idPieces = id.split("$");
                //Offset indicates the number of $ + 1 in the id string. 4 is used because that produces an id
                //that matches with the left nav items (e.g. 0$3/0$3$30 for By Date).
                var offset = 3;
                var levels = [];
                var levelsHtml = {};
                //Beginning with a left nav id, successively reconstruct id strings out of the full id by
                //appending additional levels (marked by the $).
                for (var i = 0; i < idPieces.length - offset + 1; i++) {
                    var newId = idPieces.slice(0, offset + i);
                    var newIdStr = newId.join("$");
                    levels.push(newIdStr);
                }
                var numLevels = levels.length;
                var levelsFetched = 0;
                //For each of the reconstructed level strings, build breadcrumb html (a link except for the last item).
                //Store the HTML by id.
                $.each(levels, function(i, value){
                    makeGetRequest("/json/feed" + value, {}, function(data){
                        data = parseJson(data);
                        //For the first level, highlight the matching left-nav item.
                        if (i == 0) {
                            $("#" + value.replace(/\$/g, "\\$").replace(/\//g, "\\/")).addClass("current");
                        }
                        if (i != levels.length - 1) {
                            levelsHtml[value] = '<span class="breadcrumbWrapper" pathid="' + value + '"><a onclick="navigateTo(\'id=' + value + '&startPage=0&count=' + data.containerItemCount + '\')"><span class="breadcrumbItem" pathid="' + value + '" numitems="' + data.containerItemCount + '">' + data.containerTitle + '</span></a> / </span>';
                        }
                        else {
                            levelsHtml[value] = '<span class="breadcrumbItem" pathid="' + value + '" numitems="' + data.containerItemCount + '">' + data.containerTitle + '</span>';
                        }
                        levelsFetched++;
                        //Once breadcrumb data has been fetched for all levels, insert it into the container.
                        if (levelsFetched == numLevels) {
                            $.each(levels, function(j, level){
                                breadcrumb.append(levelsHtml[level]);
                            });
                        }
                    });
                });
            }
        }
        else {
            //Count the number of $ to determine how many levels deep the navigation is.
			// for myTwonky count the M too.
			var lb = lastBreadcrumb.attr("pathid");
            if (lb.length > 0) lb = lb.replace(/M/g, "$");
            var numBreadcrumbLevels = (lb) ? (lb.split("$").length - 1) : (0);
			var id2 = id;
			id2 = id2.replace(/M/g, "$");
            var numIdLevels = id2.split("$").length - 1;
            
            //Compare the number of levels in the breadcrumb to the number of levels of the id. If the id has more levels,
            //add it to the breadcrumb and add a hyperlink to the previous breadcrumb item. 
            if (lastBreadcrumb.length > 0 && numIdLevels > numBreadcrumbLevels && lastBreadcrumb.attr("pathid")) {
                if (lastBreadcrumb.length > 0) {
                    lastBreadcrumb.wrap('<span class="breadcrumbWrapper" pathid="' + lastBreadcrumb.attr("pathid") + '"><a onclick="navigateTo(\'id=' + lastBreadcrumb.attr("pathid") + '&startPage=0&count=' + lastBreadcrumb.attr("numItems") + '\')"></a> / </span>');
                }
                breadcrumb.append('<span class="breadcrumbItem" pathid="' + id + '" numitems="' + numItems + '">' + clickedElementText + '</span>');
            }
            //Otherwise, find the breadcrumb item with the same level as the new item. Replace the old item with the new one
            //at the same level and remove the rest of the breadcrumb after that.
            else {
                var collection = ($(".breadcrumbWrapper", ".breadcrumb").length > 0) ? ($(".breadcrumbWrapper", ".breadcrumb")) : ($(".breadcrumb > .breadcrumbItem:last"));
                $.each(collection, function(i, element){
                    element = $(element);
                    var elementBreadcrumbLevels = 0;
					if (element.attr("pathid")) {
						var p = element.attr("pathid");
						p = p.replace(/M/g, "$");
						elementBreadcrumbLevels = p.split("$").length - 1;
					}
                    if (elementBreadcrumbLevels == numIdLevels) {
                        var newText = (clickedElement.length > 0) ? ($("a", clickedElement).text()) : ($(".breadcrumbItem[pathid=" + cleanedId + "]", ".breadcrumb").text());
                        element.nextAll().remove();
                        element.attr("pathid", id);
                        element.replaceWith('<span class="breadcrumbItem" pathid="' + id + '" numitems="' + numItems + '">' + newText + '</span>');
						hideLoadingGraphic();
                        return false;
                    }
                });
            }
        }
		// start a second http-request if all containers has 0 items
		if ((nullNodes == nodes) && nodes > 0 && !reloadContent) {
			var str = "reloadMediaContent(\'"+id+"\', \'"+startItem+"\', \'"+numItems+"\')";
			var timerReload = setTimeout(str,500);
		} else hideLoadingGraphic();
    });
}
function reloadMediaContent(id, startItem, numItems) {
	loadMediaContents(id, startItem, numItems, true);
}

function onMediaNodeClicked(node, count){
    var id = node.id;
    navigateTo("id=" + id + "&startPage=0&count=" + count);
}

//Get the HTML for a pagination link.
//id: The id of the media node to browse to.
//pageCount: The start item for the media browse call.
//numItems: The number of child items.
//text: The text of the link.
function makePaginationLink(id, pageCount, numItems, text){
    return '<a onclick="navigateTo(\'id=' + id + '&startPage=' + pageCount + '&count=' + numItems + '\')">' + text + '</a> '
}

var videoDefaultImg = "/webconfig/gen_video_100.png";
var videoWidth = 100;
var videoHeight = 100;
var musicDefaultImg = "/webconfig/gen_music_40.png";
var musicWidth = 40;
var musicHeight = 40;
var photoDefaultImg = "/webconfig/gen_photo_100.png";
var photoWidth = 100;
var photoHeight = 100;
var videoFolderDefaultImg = "/webconfig/gen_folder_video.png";
var musicFolderDefaultImg = "/webconfig/gen_folder_music_110.png";
var photoFolderDefaultImg = "/webconfig/gen_folder_photo.png";
var folderWidth = 185;
var musicFolderWidth = 110;
var folderHeight = 110;

//Given a thumbnail tag, separate the link from it by parsing it out from between the quotes of the url attribute.
//thumbnailValue: The <media:thumbnail> tag to parse.
//mediaType: The type of media that a thumbnail is being retrieved for.
//isFolder: Default false. Indicates whether the thumbnail is for a folder display or for media display.
//originalWidth: Populated only for Photos. The original width of the image.
//originalHeight: Populated only for Photos. The original height of the image.
function getThumbnailLink(thumbnailValue, mediaType, isFolder, originalWidth, originalHeight){
    var thumbnailObj = {
        "link": "",
        "scale": "",
        "clip": ""
    };
    if (thumbnailValue) {
        var firstQuote = thumbnailValue.indexOf('"');
        var endChar = (thumbnailValue.lastIndexOf('?') > -1) ? (thumbnailValue.lastIndexOf('?')) : (thumbnailValue.length);
        thumbnailObj.link = thumbnailValue.substring(firstQuote + 1, endChar);
		if (isFolder) {
			if (mediaType == "P") {
				//thumbnailObj.link = photoFolderDefaultImg;
				var scaleData = getImageScale(originalWidth, originalHeight, folderWidth, folderHeight);
				thumbnailObj.scale = "?scale=" + scaleData.x + "x" + scaleData.y;
				thumbnailObj.clip = scaleData.clip;
			}
			else 
				if (mediaType == "M") {
					//thumbnailObj.link = musicFolderDefaultImg;
					thumbnailObj.scale = "?scale=" + musicFolderWidth + "x" + folderHeight;
				}
				else {
					//thumbnailObj.link = videoFolderDefaultImg;
					thumbnailObj.scale = "?scale=" + folderWidth + "x" + folderHeight;
				}
		}
		else {
			switch (mediaType) {
				case "V":
					thumbnailObj.scale = "?scale=" + videoWidth + "x" + videoHeight;
					break;
				case "M":
					thumbnailObj.scale = "?scale=" + musicWidth + "x" + musicHeight;
					break;
				case "P":
					var scaleData = getImageScale(originalWidth, originalHeight, photoWidth, photoHeight);
					thumbnailObj.scale = "?scale=" + scaleData.x + "x" + scaleData.y;
					thumbnailObj.clip = scaleData.clip;
					break;
			}
		}
        return thumbnailObj;
    }
}

//Recursively navigate into a node until the first leaf node is identified, then set the thumbnail of that node
//to an image.
//image: The image to be updated when the thumbnail is identified.
//id: The id to navigate into.
function getFolderThumbnail(image, id){
    makeGetRequest("/json/feed/" + id, {
        "start": 0,
        "count": 1
    }, function(response){
        var json = parseJson(response);
		if (json.containerContents.length == 0) {
			return;
		}
		switch (json.containerContents[0].nodeType) {
			case "branch":
				getFolderThumbnail(image, json.containerContents[0].objId)
				break;
			case "leaf":
				var width;
				var height;
				var thumbnailData;
				if (json.containerContents[0].objType == "P") {
					var resolutionPieces = json.containerContents[0].resolution.split("x");
					width = parseInt(resolutionPieces[0]);
					height = parseInt(resolutionPieces[1]);
					thumbnailData = getThumbnailLink(json.containerContents[0].thumbnail, json.containerContents[0].objType, true, width, height);
				}
				else {
					thumbnailData = getThumbnailLink(json.containerContents[0].thumbnail, json.containerContents[0].objType, true);
				}
				if (thumbnailData.link == videoDefaultImg || thumbnailData.link == musicDefaultImg || thumbnailData.link == photoDefaultImg) {
					loadDefaultThumbnail(image, json.containerContents[0].objType);
				}
				else {
                    //thumbnail = '<img class="folderThumbnail" src="' + data.thumbnail + '" onerror="loadDefaultThumbnail($(this), \'' + objType + '\')" />';
					//image.replaceWith('<img src="' + thumbnailData.link + thumbnailData.scale + '" onerror="loadDefaultThumbnail($(this), \'' + json.containerContents[0].objType + '\')" style="' + thumbnailData.clip + '"/>');
					image.replaceWith('<img class="folderThumbnail" src="' + thumbnailData.link + thumbnailData.scale + '" onerror="loadDefaultThumbnail($(this), \'' + json.containerContents[0].objType + '\')" style="' + thumbnailData.clip + '"/>');
				}
				break;
        }
    });
}

//Load the default thumbnail for an image if the one specified in the media browse API can't be successfully loaded.
//image: The image to change the src of.
//mediaType: The media type of the node (video, music, photo). Used to determine which image to display.
function loadDefaultThumbnail(image, mediaType){
    var imagePath;
    //If the image is a child of an element with the byFolderContainer class, use the larger image.
    //Otherwise, use the smaller image for that content type.
    switch (mediaType) {
        case "V":
            imagePath = (image.parent().is(".byFolderContainer")) ? (videoFolderDefaultImg) : (videoDefaultImg);
            break;
        case "M":
            imagePath = (image.parent().is(".byFolderContainer")) ? (musicFolderDefaultImg) : (musicDefaultImg);
            break;
        case "P":
            imagePath = (image.parent().is(".byFolderContainer")) ? (photoFolderDefaultImg) : (photoDefaultImg);
            break;
    }
    image.attr("src", imagePath);
}

//Given the original dimensions of an image, scale it to a new size and preserve the aspect ratio.
//originalWidth, originalHeight: The dimensions of the image to be scaled.
//desiredWidth, desiredHeight: The dimensions that the image should be scaled to.
function getImageScale(originalWidth, originalHeight, desiredWidth, desiredHeight){
    var scaleObj = {
        "x": "",
        "y": "",
        "clip": ""
    };
    //If the image is a landscape (the width is greater than the height), assign the largest dimension to the width.
    if (originalWidth >= originalHeight) {
        var ratio = originalHeight / originalWidth;
        var scaledHeight = ratio * desiredWidth;
        if (desiredHeight > scaledHeight) {
            var newRatio = desiredHeight / scaledHeight;
            scaleObj.x = Math.round(newRatio * desiredWidth);
            scaleObj.y = Math.round(desiredHeight);
        }
        else {
            scaleObj.x = Math.round(desiredWidth);
            scaleObj.y = Math.round(ratio * desiredWidth);
        }
    }
    //Do the reverse if the image is a portrait (height is greater than width).
    else {
        var ratio = originalWidth / originalHeight;
        var scaledWidth = ratio * desiredHeight;
        if (desiredWidth > scaledWidth) {
            var newRatio = desiredWidth / scaledWidth;
            scaleObj.x = Math.round(desiredWidth);
            scaleObj.y = Math.round(newRatio * desiredHeight);
        }
        else {
            scaleObj.x = Math.round(ratio * desiredHeight);
            scaleObj.y = Math.round(desiredHeight);
        }
    }
    var widthOffset = 0;
    var heightOffset = 0;
    if (scaleObj.x > desiredWidth) {
        widthOffset = (parseInt(scaleObj.x) - desiredWidth) / 2;
    }
    if (scaleObj.y > desiredHeight) {
        heightOffset = (parseInt(scaleObj.y) - desiredHeight) / 2;
    }
    scaleObj.clip = "clip: rect(" + heightOffset + "px " + (scaleObj.x - widthOffset) + "px " + (scaleObj.y - heightOffset) + "px " + widthOffset + "px); left: -" + widthOffset + "px; top: -" + heightOffset + "px;";
    return scaleObj;
}

function toggleContainer(clickedButton)
{
	var parent = clickedButton.parents(".boxHeader");
	var toggleElement = $(parent).next();
	var elementID = clickedButton.attr("id");
	if (toggleElement.css("display") == "none") {
		toggleElement.show();
		$(".toggleText", clickedButton).text(getString("hide"));
		clickedButton.removeClass("hidden");
		clickedButton.addClass("showing");
		document.cookie = elementID + "=show;";
	}
	else {
		toggleElement.hide();
		$(".toggleText", clickedButton).text(getString("show"));
		clickedButton.removeClass("showing");
		clickedButton.addClass("hidden");
		document.cookie = elementID + "=hide;";
	}
}


// ------------------------------------------
// synchronization (WebDav server)
// ------------------------------------------
var shares_alias_array = new Array();
var shares_path_array = new Array();
var shares_user_array = new Array();
var shares_rights_array = new Array();
var user_array = new Array();
var rights_user_array = new Array();
var rights_share_array = new Array();
var rights_mode_array = new Array();

var values_loaded=0;
var reserve_user_name = "Any";

         
function loadSynchronization(){
//	getMetaInfo();
    populateSettingsNav();			
	makeGetRequest("/webconfig/synchronization.htm", {}, function(response){
        var responseHtml = $(response);        	
		replaceStrings(responseHtml);
		showToggleButtons(responseHtml);
		$("#userslist",responseHtml).html(getUserList());        
		$("#sharedlist",responseHtml).html(getShareList());
        $(".serverSettingsContentWrapper").html(responseHtml);		
        highlightNav($("#nav_synchronization")); 
    });
}

function getMetaInfo() {
	if (!getServerDetails()) return;
	var rawdata = getServerDetails().responseText;
	var lines = rawdata.split("\n");
	server_name = lines[0];	
	server_port = lines[1];	
	server_version = lines[2];
	//globalLanguage = lines[3]
	server_start_time = lines[4];
	server_build_date = lines[5];	
}
function getServerDetails() {
	return loadXMLDoc("/get_server_info","");
}

function showDialog(msg, handler){
	showDialogOverlay(function(){
		return msg;
		}, {}, {
			1: {
				text: getString("ok"),
				onclick: "hideDialogOverlay(); " + handler
			}				
	}); 
}
function confirmDialog(msg,handler) {
    showDialogOverlay(function(){
        return msg;
    }, null, {
        1: {
            text: getString("ok"),
            onclick: handler
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    });
}

// status subheader: reload
function reloadConfig() {
	var request = loadXMLDoc("/reload","");
	if (request.status != 200) {
		showDialog(getString("reload_failed"));
	} else {
		window.location.reload();
	}	
    highlightNav($("#nav_synchronization"));       
}

function getUserList() {
	var i;
	var strOut = "";
	var numUsers = 0;
	if (!values_loaded) loadAll();
	numUsers = user_array.length
	
	if (numUsers <= 0) {
		strOut += "<font color=\"red\">" + getString("no_user_added") + "</font>";
	} else {
		strOut += "<select class=\"selectUserInput floatL\" id=\"user\">";
		for (i=0;i<numUsers;i++) {
			strOut += "<option "+((i==0)?"selected ":"")+"value=\""+user_array[i]+"\">"+user_array[i]+"</option>";
		}
		strOut += "</select>";
		strOut += "<a class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onclick=\"deleteUser();\"> <span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">"+getString("delete")+"</span><span class=\"actionbtn_r\"></span></a>";
		strOut += "<div class=\"smallServerContentSpacer\"></div>";
	}	
	return strOut;
}
function loadAll() {
	var rawdata=getShares().responseText;
	if (rawdata == "failed") return;
	var lines=rawdata.split("\n");
	var len = parseInt(lines.length/4);
	shares_alias_array = new Array(len);
	shares_path_array = new Array(len);
	shares_user_array = new Array(len);
	shares_rights_array = new Array(len);
	for (i=0;i<len;i++) {
	    shares_alias_array[i]=lines[4*i];
	    shares_path_array[i]=lines[4*i+1];
	    shares_user_array[i]=lines[4*i+2];
	    shares_rights_array[i]=lines[4*i+3];
	}

	rawdata = getUsers().responseText;
	if (rawdata == "failed") return;
	lines = rawdata.split("\n");
	len = lines.length-1;
	user_array = new Array(len);
	for (i=0;i<len;i++) {
	    user_array[i]=lines[i];
	}

	rawdata=getRights().responseText;
	if (rawdata == "failed") return;
	lines=rawdata.split("\n");
	len = parseInt(lines.length/3);
	rights_user_array = new Array(len); 
	rights_share_array = new Array(len); 
	rights_mode_array = new Array(len); 
	for (i=0;i<len;i++) {
	    rights_user_array[i]=lines[3*i];
	    rights_share_array[i]=lines[3*i+1];
	    rights_mode_array[i]=lines[3*i+2];
	}
	values_loaded=1;
}
function getShares() {
	var request = loadXMLDoc("/get_shares","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		request.responseText = "failed";
	}
	return request;
}
function getUsers() {
	var request = loadXMLDoc("/get_users","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		request.responseText = "failed";
	}
	return request;
}
function getRights() {
	var request = loadXMLDoc("/get_rights","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		request.responseText = "failed";
	}
	return request;
}


// delete and add users
function deleteUser() {
	var user = $("#user").val();
	var msg = formatString(getString("dialog_delete_user"),[user,user]);
	confirmDialog(msg,"confirmDeleteUser()");
}
function confirmDeleteUser() {
	var user = $("#user").val();
	user = encodeURIComponent(user);
	var request = loadXMLDoc("/delete_user?user="+user,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	} else {
		updateSharesForUser(user);
		window.location.reload();
        highlightNav($("#nav_synchronization"));       
	}
}
function updateSharesForUser(user) {
	var len = shares_alias_array.length;
	var i = 0;
	for (i=0;i<len;i++) {
		if (shares_user_array[i].length <= 0) continue;
		if (shares_user_array[i] != user) continue;
		removeRight(shares_alias_array[i]);
	}
}
function removeRight(alias) {
	alias = encodeURIComponent(alias);
	var request = loadXMLDoc("/remove_right?alias="+alias,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		return 0;
	}
	return 1;
}
function highlightText(field) {
	if(field!=null) {
		field.focus();
		field.select();
	}
}

function handleKeyPress(event) {
	// escape key
	if (event.keyCode==27) {
		hideDialogOverlay();
	}
}
function promptUserDialog(msg, handler, ispassword){
var inputtype="text";
var inputvalue=msg;
   if(ispassword) {
         inputtype = "password";
         inputvalue = "";
   }
    showDialogOverlay(function(){
        return "<div>" + msg + "</div>"
			+ "<input  type=\""+inputtype+"\" id=\"promptInput\" align='center' type=\"text\" value=\"" + inputvalue + "\" onkeyup=\"handleKeyPress(event)\" onclick=\"highlightText(this)\"/>";
    }, null, {
        1: {
            text: getString("ok"),
            onclick: handler
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    });
}
function addUser() {	
	promptUserDialog(getString("enter_valid_un"),"userEntered()", false);
}
var validUser;
function userEntered(){	
	var user = $("#promptInput").val();	
	if (user == getString("enter_valid_un")) {
		user = '';
	} else if (user.toLowerCase().replace(/\s/g, "") == reserve_user_name.toLowerCase()) {		
		showDialog(formatString(getString("dialog_reserve_user_name"),[reserve_user_name]));
		return;
	}	
	if (user.length > 0) {
		validUser = encodeURIComponent(user);
		promptUserDialog(getString("enter_valid_pw"),"passwordEntered()", true);	
	} else {
		showDialog(getString("dialog_enter_valid_un"));
	}
}
function passwordEntered () {
	var pw = $("#promptInput").val();	
	if (pw == getString("enter_valid_pw")) {
		pw = '';
	} 
	if (pw.length > 0) {
		pw = encodeURIComponent(pw);
		var request = loadXMLDoc("/add_user?user=" + validUser + "&pass=" +pw,"");
		if (request.status != 200) {
			showDialog(getString("dialog_server_req_failed"));
		} else {
			showDialog(getString("dialog_user_add_success"),"window.location.reload()");			
		}
	} else {
		showDialog(getString("dialog_enter_valid_pw"));
	}
}


// SHARES
function getShareList() {
	folderBrowseDialogMsg = 2;
	var i;
	var strOut = "";
	var newlink = "";
	if (!values_loaded) loadAll();
	var numSharesPresent = shares_alias_array.length;	

	if (numSharesPresent <= 0) {
		strOut += "<font color=\"red\">" + getString("no_syncfolders") + "</font>";
	}
	else {	
		// table columns: share name, share path, user, share rights, button delete share, button view share
		strOut += "<table class='syncTable'><tr>"
				+ "<th>" + getString("syncfolder_name") + "</th>"
				+ "<th>" + getString("local_folder") + "</th>"
				+ "<th style=\"text-align:center\">" + getString("username") + "</th>"					
				+ "<th style=\"text-align:center\">" + getString("rights") + "</th>"
				+ "<th></th>"
				+ "<th></th>"
				+ "</tr>";
		var uname = reserve_user_name;
		// Get the existing shares
		for (i=0;i<shares_alias_array.length;i++) {
   		    if (shares_user_array[i].length > 0)
				uname = shares_user_array[i];
		    else 
				uname = reserve_user_name;
		    strOut += "<tr><td><input class=\"floatL\" type=\"text\" readonly=\"readonly\" disabled=\"true\" value=\"" + shares_alias_array[i] + "\"/>"
						+ "</td><td>" 						
						+ "<input class=\"longInput floatL\" type=\"text\" readonly=\"readonly\" disabled=\"true\" value=\"" + shares_path_array[i] + "\"/>"
						+ "</td><td>"
						+ "<input class=\"webdavuser floatL\" style=\"text-align:center\" type=\"text\" readonly=\"readonly\" disabled=\"true\" value=\"" + uname  + "\"/>"
						+ "</td><td>"
						+ "<input class=\"webdavrights floatL\" style=\"text-align:center\" type=\"text\" readonly=\"readonly\" disabled=\"true\" value=\"" + shares_rights_array[i]  + "\"/>"
						+ "</td><td>"
						+ "<a style=\"width:100%\" class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onClick=\"deleteShare('"+ shares_alias_array[i] +"');\">"
						+ "<span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">" + getString('delete') + "</span><span class=\"actionbtn_r\"></span>"
						+ "</a></td>"
						+ "<td>"
						+ "<a style=\"width:100%\" class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onClick=\"openShare(" + i + ");\">"
						+ "<span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">" + getString('view') + "</span><span class=\"actionbtn_r\"></span>"
						+ "</a></td>"
						+ "</tr>";
		}
		strOut += "</table>";		
	}
	strOut += "<div class=\"smallServerContentSpacer\"/>"
	strOut += "<div><b><span class=\"title\">" + getString("syncfolder_new_share_info") + "</span></div></b>";	
	// table columns: share name, sahre path, button browse path, user, share rights
	strOut += "<table class='syncTable'><tr>"
				+ "<th>" + getString("syncfolder_name") + "</th>"
				+ "<th>" + getString("local_folder") + "</th>"
				+ "<th></th>"
				+ "<th>" + getString("username") + "</th>"					
				+ "<th>" + getString("rights") + "</th>"
				+ "</tr>";
	strOut += "<tr><td>" 						
				+ "<input id=\"shareAlias\" class=\"pathInput floatL\" type=\"text\" value=\"\" />"
				+ "</td><td>"
				+ "<input id=\"pathInput1\" readonly=\"readonly\" class=\"longInput floatL\" type=\"text\" value=\"\"/>"
				+ "</td><td>"
				+ "<a style=\"width:100%\" class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onClick=\"showFolderBrowse('1');\">"
				+ "<span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">" + getString("browse") + "</span><span class=\"actionbtn_r\"></span>"
				+ "</a></td><td>"
				+ "<select class=\"selectUserInput floatL\" id=\"userInput\" onchange=\"updateRight(this.value)\">";
	for (i = 0; i < user_array.length; i++) {
		if (i == 0) strOut += "<option selected=\"selected\" value=\"" + user_array[i] + "\">" + user_array[i] + "</option>";
		else strOut += "<option value=\"" + user_array[i] + "\">" + user_array[i] + "</option>";
	} 
	strOut += "<option value=\"" + reserve_user_name + "\">" + getString("any") + "</option></select>"
				+ "</td><td>";
	if (user_array.length == 0) 
		strOut += "<select class=\"selectRightsInput floatL\" id=\"right\">"
					+ "<option selected=\"selected\" value=\"r/w\">r/w</option>"
					+ "</select></td></tr>";
	else
		strOut += "<select class=\"selectRightsInput floatL\" id=\"right\">"
					+ "<option selected=\"selected\" value=\"r/w\">r/w</option>"
					+ "<option value=\"r/o\">r/o</option>"
					+ "</select></td></tr>";
	strOut += "</table>";
	strOut += "<div class=\"verySmallServerContentSpacer\"></div>";
	return strOut;
}
function updateRight(val) {
	var elem = document.getElementById("right");
	elem.options.length = 0;
	if (val == reserve_user_name) {
		elem.options[0] = new Option("r/w", "r/w",true);
	} else {
		elem.options[0] = new Option("r/w", "r/w",true);
		elem.options[1] = new Option("r/o", "r/o");
	}
}
function getShareUrl(idx) 
{
	var url = shares_alias_array[idx];
	var lines = url.split("/");
	if (lines.length > 1) {		
		url = "/" + encodeURIComponent(lines[1]);
	}
	if (shares_alias_array[idx] != "/") {
	 url += "/";
	}
	return statusData["syncurl"] + url;
}
function openShare(idx) {
	window.open(getShareUrl(idx));
}

// add shares and rights, delete shares
function addShareAndRights() {
	var alias = $("#shareAlias").val();
	var folder = $("#pathInput1").val();
	var user = $("#userInput").val();
	var right = $("#right").val();
	var result = 0;
	var validRights = 0;
	var enableAuth = 1;
	if (user.toLowerCase().replace(/\s/g, "") == reserve_user_name.toLowerCase()) {
		enableAuth = 0;
	}

	result = addShare(alias, folder)
	if (1 == result) {
		if (enableAuth == 1) {
			result = addRight(alias, user, right);
		} else {
			result = removeRight(alias);
		}
		if (1 == result) {
			showDialog(getString("dialog_share_added_success"),"window.location.reload()");				
		}		
	}
}
function addRight(alias,user,mode) {
	if (alias.charAt(0) != '/')
		alias = '/' + alias;
	alias = encodeURIComponent(alias);
	user = encodeURIComponent(user);
	var request = loadXMLDoc("/rpc/webdav/add_right?alias="+alias+"&user="+user+"&mode="+mode,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		return 0;
	}
	return 1;
}
function addShare(alias,path) {
	if (alias==null || alias=="") {
		showDialog(getString("dialog_enter_alias_name"));       	
		return 0;
	}
        	
	var lines = alias.split("\\");
	if (lines.length > 1) {
		showDialog(formatString(getString("dialog_invalid_share_name_2"),["\\"]));
		return 0;
	}

	var lines = alias.split("/");
	if (lines.length > 2) {
		showDialog(formatString(getString("dialog_invalid_share_name_1"),["/","/","/","/","/"]));
		return 0;
	}

	if (path==null || path=="") {
		showDialog(getString("dialog_enter_share_dir"));
		return 0;
	}

	if (alias.charAt(0) != '/')
		alias = '/' + alias;
		
	alias = encodeURIComponent(alias);
	path = encodeURIComponent(path);
	
	var request = loadXMLDoc("/add_share?alias="+alias+"&path="+path,"");
	if (request.status != 200) {
		showDialog(getString("dialog_invalid_share_path"));
		return 0;
	}
	return 1;
}
function deleteShare(share) {
	shareToDelete = encodeURIComponent(share);
	var request = loadXMLDoc("/delete_share?share="+shareToDelete+"&tmp=","");
	if (request.status != 200) {
		showDialog(getString("dialog_failed_delete_share"));
	} else {
		window.location.reload();
        highlightNav($("#nav_synchronization"));       
	}	
}


function formatString(string2Fmt, values){
	if (string2Fmt == null || values == null || values.length == 0)
		return;
	var len = values.length;
	for (i=0;i<=len;i++){
		string2Fmt = string2Fmt.replace("{" + i + "}", values[i]);
	}
	return string2Fmt;	
}

function getWebDavUrl() {
	return "/rpc/webdavproxy?/rpc/webdav";
}

// Helper function that does the actual RPC invocation
function loadXMLDoc(my_url,strData) 
{
	var req;
	req = false;
	// branch for native XMLHttpRequest object
	if(window.XMLHttpRequest) {
		try {
			req = new XMLHttpRequest();
		} catch(e) {
			req = false;
		}
		// branch for IE/Windows ActiveX version
		} else if(window.ActiveXObject) {
		try {
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {
			try {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				req = false;
			}
		}
	}
	if(req) {
		my_url = getWebDavUrl() + my_url;
		if (strData.length>0) {  // post request
			req.open("POST", my_url, false);
			//req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			req.setRequestHeader('Content-Type', 'text/xml; charset=UTF-8');
			req.send(strData);
		}
		else { // get request
			req.open("GET", my_url, false);
			try {
				req.send("");
			} catch(e) {
				req = false;
			}
		}
		return req;
	}
	return "";
}
