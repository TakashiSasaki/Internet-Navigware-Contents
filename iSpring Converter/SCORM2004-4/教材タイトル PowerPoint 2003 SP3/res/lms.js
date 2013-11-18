iSpring = {};
iSpring.Logger = {};
iSpring.LMSHacpWrapper = {};
iSpring.LMSApiWrapper = {};
iSpring.LMS = {};

// Utils
CUtils = function() { }
CUtils.__name__ = "CUtils";
CUtils.convertToInt = function(value)
{
	if (value < 0)
	{
		return Math.ceil(value);
	}
	return Math.floor(value);
}
CUtils.makeISO8601TimeStamp = function(timestamp)
{
	var date = new Date(Number(timestamp));

	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var hourUTC = date.getUTCHours();
	var diff = hour - hourUTC;
	var hourDifference = Math.abs(diff);
	var minute = date.getMinutes();
	var minuteUTC = date.getUTCMinutes();
	var minuteDifference;
	var second = date.getSeconds();
	var timezone;

	if (minute != minuteUTC && minuteUTC < 30 && diff < 0)
	{
		hourDifference--;
	}
	if (minute != minuteUTC && minuteUTC > 30 && diff > 0)
	{
		hourDifference--;
	}
	if (minute != minuteUTC)
	{
		minuteDifference = ":30";
	}
	else
	{
		minuteDifference = ":00";
	}
	if (hourDifference < 10)
	{
		timezone = "0" + hourDifference + minuteDifference;
	}
	else
	{
		timezone = "" + hourDifference + minuteDifference;
	}
	if (diff < 0)
	{
		timezone = "-" + timezone;
	}
	else
	{
		timezone = "+" + timezone;
	}
	if (month <= 9) month = "0" + month;
	if (day <= 9) day = "0" + day;
	if (hour <= 9) hour = "0" + hour;
	if (minute <= 9) minute = "0" + minute;
	if (second <= 9) second = "0" + second;

	return year + "-" + month + "-" + day + "T"	+ hour + ":" + minute + ":" + second;
}
CUtils.isEmpty = function(param)
{
	return (param == undefined || param == null || param == "");
}
CUtils.validateIdentifier = function(id)
{
	var result = new String(id);

	result = result.replace(/^\s*/, "");
	result = result.replace(/\s*$/, "");
	//result = result.replace(/[^\w\(\)\+\-\@\;\$\_\!\*\'\.\:\=\%\[\]\,]/g, "_");
	result = result.replace(/[^\w\d\.\[\]\,]/g, "_");

	return result;
}
CUtils.validateText = function(str)
{
	var result = new String(str);
	result = result.replace(/[^\w\_\[\]\,]/g, "_");

	return result;
}
CUtils.getQueryParamValue = function(path, param)
{
	var searchStr = path.substring(1);
	var pairsArray = searchStr.split("&");
	for (var i = 0; i < pairsArray.length; i++)
	{
		var paramArray = pairsArray[i].split("=");
		if (paramArray[0].toLowerCase() == param)
		{
			return paramArray[1];
		}
	}
	return "";
}
CUtils.urlencode = function(text)
{
	var trans = [];
	for (var i = 0x410; i <= 0x44F; i++) trans[i] = i - 0x350;
	trans[0x401] = 0xA8;
	trans[0x451] = 0xB8;
	var ret = [];
	for (i = 0; i < text.length; i++)
	{
		var n = text.charCodeAt(i);
		if (typeof trans[n] != 'undefined') n = trans[n];
		if (n <= 0xFF) ret.push(n);
	}
	var resultStr = escape(String.fromCharCode.apply(null, ret));
	resultStr = resultStr.replace(/%20/g, "+");
	return resultStr;
}
CUtils.trimString = function(str)
{
	return str.replace(/^[\s|\t|\n|\r]*/, "").replace(/[\s|\t|\n|\r]*$/, "");
}
CUtils.prototype.__class__ = CUtils;

// Time formatting
CTimeFormat = function() { }
CTimeFormat.__name__ = "CTimeFormat";
CTimeFormat.formatDuration = function(duration)
{
	var s = duration;
	var h = CUtils.convertToInt(s / 3600);
	s -= h * 3600;
	var m = CUtils.convertToInt(s / 60);
	s -= m * 60;
	return CTimeFormat.intToStr(h) + ":" + CTimeFormat.intToStr(m) + ":" + CTimeFormat.intToStr(s);
}
CTimeFormat.intToStr = function(value)
{
	var data = "";
	if (value < 10)
	{
		data += "0";
	}
	data += value.toString();
	return data;
}
CTimeFormat.prototype.__class__ = CTimeFormat;


// Time controller
iSpring.TimeController = function(duration, interval, listener)
{
	this.m_duration = duration;
	this.m_listener = listener;
	this.m_window = window;
	this.m_interval = interval;
	this.m_time = new Date().getTime();

	var thisPtr = this;
	function onTimeout()
	{
		thisPtr.onEndTime();
	}
	function onTimer()
	{
		thisPtr.onTime();
	}

	this.m_timeoutId = this.m_window.setTimeout(onTimeout, this.m_duration * 1000);
	this.m_intervalId = this.m_window.setInterval(onTimer, this.m_interval * 1000);
	this.m_work = true;
}
iSpring.TimeController.prototype.m_duration = null;
iSpring.TimeController.prototype.m_interval = null;
iSpring.TimeController.prototype.m_intervalId = null;
iSpring.TimeController.prototype.m_listener = null;
iSpring.TimeController.prototype.m_time = null;
iSpring.TimeController.prototype.m_timeoutId = null;
iSpring.TimeController.prototype.m_window = null;
iSpring.TimeController.prototype.m_work = null;
iSpring.TimeController.prototype.__name__ = "iSpring.TimeController";
iSpring.TimeController.prototype = iSpring.TimeController;
iSpring.TimeController.prototype.onEndTime = function()
{
	if (this.m_work)
	{
		this.m_listener.onEndTime();
	}
}
iSpring.TimeController.prototype.onTime = function()
{
	if (this.m_work)
	{
		var duration = new Date().getTime() - this.m_time;
		this.m_listener.onTime(CUtils.convertToInt(duration / 1000));
	}
}
iSpring.TimeController.prototype.stopTimers = function()
{
	if (this.m_work)
	{
		this.m_window.clearInterval(this.m_intervalId);
		this.m_window.clearTimeout(this.m_timeoutId);
		this.m_work = false;
	}
}


// Logger
iSpring.Logger = function() { }
iSpring.Logger.prototype.__name__ = "iSpring.Logger";
iSpring.Logger.prototype = iSpring.Logger;
iSpring.Logger.prototype.log = function(str)
{
	if (iSpring.Logger.debug)
	{
		console.log(str);
	}
}
iSpring.Logger.prototype.logError = function(str)
{
	this.log("ERROR: " + str);
}
iSpring.Logger.debug = false;

// LMS AICC HACP Wrapper
iSpring.LMSHacpWrapper = function()
{
	// check xmlhttp
	this.m_canUseXmlHttp = false;
	if (window.XMLHttpRequest)
	{
		this.m_xmlHttpRequest = new XMLHttpRequest();
		if (this.m_xmlHttpRequest)
		{
			this.m_canUseXmlHttp = true;
		}
	}
	else if (window.ActiveXObject)
	{
		// branch for IE/Windows ActiveX version
		this.m_xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		if (this.m_xmlHttpRequest)
		{
			this.m_canUseXmlHttp = true;
		}
	}

	this.m_logger = new iSpring.Logger();
}
iSpring.LMSHacpWrapper.AICC_SID_PARAM = "aicc_sid";
iSpring.LMSHacpWrapper.AICC_URL_PARAM = "aicc_url";

iSpring.LMSHacpWrapper.AICC_REQ_GETPARAM = "GETPARAM";
iSpring.LMSHacpWrapper.AICC_REQ_PUTPARAM = "PUTPARAM";
iSpring.LMSHacpWrapper.AICC_REQ_EXITAU   = "EXITAU";

iSpring.LMSHacpWrapper.prototype.__name__ = "iSpring.LMSHacpWrapper";
iSpring.LMSHacpWrapper.m_canUseXmlHttp = false;
iSpring.LMSHacpWrapper.m_canUseFrame = true;
iSpring.LMSHacpWrapper.m_xmlHttpRequest = null;
iSpring.LMSHacpWrapper.m_logger = null;

iSpring.LMSHacpWrapper.m_rawScore = "";
iSpring.LMSHacpWrapper.m_maxScore = "";
iSpring.LMSHacpWrapper.m_minScore = "";
iSpring.LMSHacpWrapper.m_time = "";
iSpring.LMSHacpWrapper.m_lessonStatus = "";
iSpring.LMSHacpWrapper.m_suspendData = "";

iSpring.LMSHacpWrapper.m_isError = false;
iSpring.LMSHacpWrapper.m_errorText = "";

iSpring.LMSHacpWrapper.m_checkFrameId = null;
iSpring.LMSHacpWrapper.m_checkFrameTimeout = 30000;

iSpring.LMSHacpWrapper.prototype = iSpring.LMSHacpWrapper;
iSpring.LMSHacpWrapper.prototype.getAICCSid = function()
{
	var sid = CUtils.getQueryParamValue(window.document.location.search, this.AICC_SID_PARAM);
	return sid;
}
iSpring.LMSHacpWrapper.prototype.getAICCUrl = function()
{
	var url = unescape(CUtils.getQueryParamValue(window.document.location.search, this.AICC_URL_PARAM));
	return url;
}
iSpring.LMSHacpWrapper.prototype.extractParamName = function(str)
{
	var result = "";
	var markPos = -1;

	markPos = str.indexOf("=");
	if (markPos > -1 && markPos < str.length)
	{
		result = str.substring(0, markPos);
		result = CUtils.trimString(result);
	}
	else
	{
		markPos = str.indexOf("[");
		if (markPos > -1)
		{
			result = str.replace(/[\[|\]]/g, "");
			result = CUtils.trimString(result);
		}
	}
	result = result.toLowerCase();
	return result;
}
iSpring.LMSHacpWrapper.prototype.extractParamValue = function(str)
{
	var result = "";
	var markPos = -1;

	markPos = str.indexOf("=");
	if (markPos > -1 && markPos < str.length - 1)
	{
		result = str.substring(markPos + 1);
		result = CUtils.trimString(result);
	}
	return result;
}

iSpring.LMSHacpWrapper.prototype.extractResponseData = function(requestType, resp)
{
	var data = new String(CUtils.trimString(unescape(resp)));
	var lines = data.split("\n");

	for (var i = 0; i < lines.length; i++)
	{
		var paramName = "";
		var paramValue = "";

		var nextLine = new String(CUtils.trimString(lines[i]));
		if (nextLine.length > 0 && nextLine.charAt(0) != ";")
		{
			paramName = this.extractParamName(nextLine);
			paramValue = this.extractParamValue(nextLine);
		}
		if (paramName.length > 0)
		{
			switch (paramName)
			{
				case "error":
					if (paramValue != "0")
					{
						this.m_isError = true;
					}
					else
					{
						this.m_isError = false;
					}
					break;
				case "error_text":
					if (this.m_isError == true)
					{
						this.m_errorText = paramValue;
					}
					break;
				case "score":
					// not parsed string
					this.m_rawScore = paramValue;
					break;
				case "lesson_status":
					this.m_lessonStatus = paramValue.toLowerCase();
					break;
				case "time":
					this.m_time = paramValue;
					break;
				case "core_lesson":
					var lessonData = "";
					var lineInc = 1;

					nextLine = "";
					if (i + lineInc < lines.length)
					{
						nextLine = lines[i + lineInc];
					}
					// add new data
					while ((i + lineInc < lines.length) && (nextLine.search(/\[[\w]+\]/) != 0))
					{
						if (nextLine.charAt(0) != ";")
						{
							lessonData += nextLine + "\n";
						}
						lineInc++;
						if (i + lineInc < lines.length)
						{
							nextLine = lines[i + lineInc];
						}
					}
					i += lineInc - 1;
					lessonData = CUtils.trimString(lessonData);
					this.m_suspendData = lessonData;
					break;
			}
		}
	}
}

iSpring.LMSHacpWrapper.prototype.makeAICCDataXmlHttpRequest = function(requestType, aiccSid, aiccUrl, aiccData)
{
	this.m_xmlHttpRequest.open("POST", aiccUrl, false);

	// set request header
	this.m_xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	// add request data
	var postData = "session_id=" + CUtils.urlencode(aiccSid)
		+ "&version=4"
		+ "&command=" + CUtils.urlencode(requestType)
		+ "&aicc_data=" + CUtils.urlencode(aiccData);
	// send data
	this.m_xmlHttpRequest.send(postData);

	// get response
	var response = this.m_xmlHttpRequest.responseText;

	this.extractResponseData(requestType, response);
}
iSpring.LMSHacpWrapper.prototype.makeAICCDataDirectRequest = function(requestType, aiccSid, aiccUrl, aiccData)
{
	document.aiccDataForm.action = aiccUrl;
	document.aiccDataForm.target = "target_frame";
	document.aiccDataForm.session_id.value = aiccSid;
	document.aiccDataForm.command.value = requestType;
	document.aiccDataForm.aicc_data.value = aiccData;
	document.aiccDataForm.submit();
}
iSpring.LMSHacpWrapper.prototype.checkAiccFrame = function(requestType)
{
	if (document.getElementById("aiccFrameLoaded").value == "1")
	{
		document.getElementById("aiccFrameLoaded").value = "0";
		try
		{
			this.extractResponseData(requestType, window.aiccDataFrame.document.body.innerHTML);
		}
		catch (e)
		{
			this.m_logger.logError("Fail getting iframe aicc content");
		}
	}
	else
	{
		if (this.m_checkFrameTimeout <= 0)
		{
			alert("Init LMS failed");
		}
		else
		{
			this.m_logger.logError("next try - left: " + this.m_checkFrameTimeout);
			this.m_checkFrameTimeout -= 500;

			var thisPtr = this;
			function onCheckAiccFrame()
			{
				thisPtr.checkAiccFrame(requestType);
			}
			this.m_checkFrameId = window.setTimeout(onCheckAiccFrame, 500);
		}
	}
}
iSpring.LMSHacpWrapper.prototype.makeAICCDataFrameRequest = function(requestType, aiccSid, aiccUrl, aiccData)
{
	document.getElementById("aiccFrameLoaded").value = "0";
	document.aiccDataForm.action = aiccUrl;
	document.aiccDataForm.target = "aiccDataFrame";
	document.aiccDataForm.session_id.value = aiccSid;
	document.aiccDataForm.command.value = requestType;
	document.aiccDataForm.aicc_data.value = aiccData;
	document.aiccDataForm.submit();

	this.checkAiccFrame(requestType);
}
iSpring.LMSHacpWrapper.prototype.waitRequestExecution = function()
{
	window.emptyFrame.document.open();
	var maxCount = 1024;
	for (var i = 0; i < maxCount; i++)
	{
		window.emptyFrame.document.write("wait for request execution");
	}
	window.emptyFrame.document.close();
}
iSpring.LMSHacpWrapper.prototype.invokeLMSRequest = function(requestType, aiccSid, aiccUrl, aiccData)
{
	if (this.m_canUseXmlHttp)
	{
		try
		{
			this.makeAICCDataXmlHttpRequest(requestType, aiccSid, aiccUrl, aiccData);
		}
		catch (e)
		{
			this.m_canUseXmlHttp = false;
			this.invokeLMSRequest(requestType, aiccSid, aiccUrl, aiccData);
		}
	}
	else if (this.m_canUseFrame)
	{
		try
		{
			this.makeAICCDataFrameRequest(requestType, aiccSid, aiccUrl, aiccData);
			this.waitRequestExecution();
		}
		catch (e)
		{
			this.m_canUseFrame = false;
			this.invokeLMSRequest(requestType, aiccSid, aiccUrl, aiccData);
		}
	}
	else
	{
		this.makeAICCDataDirectRequest(requestType, aiccSid, aiccUrl, aiccData);
		this.waitRequestExecution();
	}
	if (this.m_isError == true)
	{
		alert("AICC request error: " + this.m_errorText);
	}
}
iSpring.LMSHacpWrapper.prototype.invokeGetParam = function()
{
	var sid = this.getAICCSid();
	var url = this.getAICCUrl();

	this.invokeLMSRequest(this.AICC_REQ_GETPARAM, sid, url, "");
}
iSpring.LMSHacpWrapper.prototype.invokePutParam = function(data)
{
	var sid = this.getAICCSid();
	var url = this.getAICCUrl();

	this.invokeLMSRequest(this.AICC_REQ_PUTPARAM, sid, url, data);
}
iSpring.LMSHacpWrapper.prototype.invokeExitAU = function()
{
	var sid = this.getAICCSid();
	var url = this.getAICCUrl();

	this.invokeLMSRequest(this.AICC_REQ_EXITAU, sid, url, "");
}
iSpring.LMSHacpWrapper.prototype.setParam = function(paramName, value)
{
	switch (paramName)
	{
		case "cmi.core.lesson_status":
			this.m_lessonStatus = value;
			break;
		case "cmi.core.exit":
			break;
		case "cmi.core.session_time":
			this.m_time = value;
			break;
		case "cmi.suspend_data":
			this.m_suspendData = value;
			break;
		case "cmi.core.score.raw":
			this.m_rawScore = value;
			break;
		case "cmi.core.score.min":
			this.m_minScore = value;
			break;
		case "cmi.core.score.max":
			this.m_maxScore = value;
			break;
	}
}
iSpring.LMSHacpWrapper.prototype.getParam = function(paramName)
{
	switch (paramName)
	{
		case "cmi.core.lesson_status":
			return this.m_lessonStatus;
		case "cmi.core.session_time":
			return this.m_time;
		case "cmi.suspend_data":
			return this.m_suspendData;
		case "cmi.core.score.raw":
			return this.m_rawScore;
		case "cmi.core.score.min":
			return this.m_minScore;
		case "cmi.core.score.max":
			return this.m_maxScore;
	}
	return "";
}
iSpring.LMSHacpWrapper.prototype.commitData = function()
{
	var aiccData = "";
	aiccData += "[Core]\r\n";
	aiccData += "Lesson_Status=" + this.m_lessonStatus + "\r\n";

	var scoreStr = "";
	if (this.m_rawScore != "")
	{
		scoreStr = this.m_rawScore;
		if (this.m_maxScore != "" || this.m_minScore != "")
		{
			scoreStr += "," + this.m_maxScore + "," + this.m_minScore + "\r\n";
		}
		else
		{
			scoreStr += "\r\n";
		}
	}
	aiccData += "Score=" + scoreStr + "\r\n";
	aiccData += "Time=" + (this.m_time.length > 0 ? this.m_time : "00:00:00") + "\r\n";
	if (this.m_suspendData != "")
	{
		aiccData += "[Core_Lesson]\r\n";
		aiccData += this.m_suspendData;
	}
	this.invokePutParam(aiccData);
}

// LMS API Wrapper
iSpring.LMSApiWrapper = function(version)
{
	this.m_version = version;
	this.m_apiHandle = null;
	this.m_findAPITries = 255;
	this.m_noAPIFound = false;
	this.m_terminated = true;
	this.m_logger = new iSpring.Logger();
	this.m_aiccHacpWrapper = new iSpring.LMSHacpWrapper();
}

iSpring.LMSApiWrapper.SCORM_VERSION_12 = "1.2";
iSpring.LMSApiWrapper.SCORM_VERSION_2004 = "2004";
iSpring.LMSApiWrapper.AICC_VERSION = "aicc";

iSpring.LMSApiWrapper.prototype.__name__ = "iSpring.LMSApiWrapper";
iSpring.LMSApiWrapper.prototype.m_version = null;
iSpring.LMSApiWrapper.prototype.m_apiHandle = null;
iSpring.LMSApiWrapper.prototype.m_findAPITries = null;
iSpring.LMSApiWrapper.prototype.m_noAPIFound = null;
iSpring.LMSApiWrapper.prototype.m_terminated = null;
iSpring.LMSApiWrapper.prototype.m_logger = null;
iSpring.LMSApiWrapper.prototype.m_aiccHacpWrapper = null;
iSpring.LMSApiWrapper.prototype = iSpring.LMSApiWrapper;
iSpring.LMSApiWrapper.prototype.getWindowApi = function(win)
{
	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			return win.API;
		case this.SCORM_VERSION_2004:
			return win.API_1484_11;
	}
}

iSpring.LMSApiWrapper.prototype.findAPI = function(win)
{
	while ((this.getWindowApi(win) == null) && (win.parent != null) && (win.parent != win))
	{
		this.m_findAPITries--;
		if (this.m_findAPITries < 0)
		{
			return null;
		}
		win = win.parent;
	}
	return this.getWindowApi(win);
}

iSpring.LMSApiWrapper.prototype.getAPI = function()
{
	var win = window;
	var theAPI = this.findAPI(win);
	if ((theAPI == null) && (win.opener != null))
	{
		theAPI = this.findAPI(win.opener);
	}
	if (theAPI == null)
	{
		this.m_noAPIFound = true;
	}
	return theAPI;
}

iSpring.LMSApiWrapper.prototype.getApiHandle = function()
{
	if (this.m_apiHandle == null)
	{
		if (this.m_noAPIFound == false)
		{
			this.m_apiHandle = this.getAPI();
		}
	}
	if (!this.m_apiHandle)
	{
		this.m_logger.logError("lms api not found");
	}
	return this.m_apiHandle;
}

iSpring.LMSApiWrapper.prototype.commit = function()
{
	if (this.m_terminated == false)
	{
		var api = this.getApiHandle();
		if (api != null)
		{
			var result = false;
			switch (this.m_version)
			{
				case this.SCORM_VERSION_12:
				case this.AICC_VERSION:
					result = this.strToBool(api.LMSCommit(""));
					break;
				case this.SCORM_VERSION_2004:
					result = this.strToBool(api.Commit(""));
					break;
			}
			if (!result)
			{
				this.m_logger.logError("commit failed");
			}
		}
		else if (this.m_version == this.AICC_VERSION)
		{
			this.m_aiccHacpWrapper.commitData();
		}
	}
}

iSpring.LMSApiWrapper.prototype.getValue = function(paramName)
{
	if (this.m_terminated == false)
	{
		var api = this.getApiHandle();

		if (api != null)
		{
			switch (this.m_version)
			{
				case this.SCORM_VERSION_12:
				case this.AICC_VERSION:
					return api.LMSGetValue(paramName);
				case this.SCORM_VERSION_2004:
					return api.GetValue(paramName);
			}
		}
		else if (this.m_version == this.AICC_VERSION)
		{
			return this.m_aiccHacpWrapper.getParam(paramName);
		}
	}
	return "";
}

iSpring.LMSApiWrapper.prototype.initialize = function()
{
	if (this.m_terminated == true)
	{
		var api = this.getApiHandle();
		if (api != null)
		{
			var result = false;
			switch (this.m_version)
			{
				case this.SCORM_VERSION_12:
				case this.AICC_VERSION:
					result = this.strToBool(api.LMSInitialize(""));
					break;
				case this.SCORM_VERSION_2004:
					result = this.strToBool(api.Initialize(""));
					break;
			}

			if (!result)
			{
				this.m_logger.logError("initialization failed");
			}
			this.m_terminated = false;
		}
		else if (this.m_version == this.AICC_VERSION)
		{
			this.m_aiccHacpWrapper.invokeGetParam();
			this.m_terminated = false;
		}
	}
}

iSpring.LMSApiWrapper.prototype.setValue = function(paramName, value)
{
	if (this.m_terminated == false)
	{
		var api = this.getApiHandle();
		if (api != null)
		{
			if (typeof(value) == "number" && this.m_version != this.SCORM_VERSION_2004)
			{
				// AICC and SCORM1.2 requires only 2 digits after dot
				value = Math.round(value * 100) / 100;
			}
			var result = false;
			paramName = paramName + "";
			value = value + "";
			//this.m_logger.log("setValue name = " + paramName + ", value = " + value);

			switch (this.m_version)
			{
				case this.SCORM_VERSION_12:
				case this.AICC_VERSION:
					result = this.strToBool(api.LMSSetValue(paramName, value));
					break;
				case this.SCORM_VERSION_2004:
					result = this.strToBool(api.SetValue(paramName, value));
					break;
			}
			if (!result)
			{
				this.m_logger.logError("setValue failed - name = " + paramName + ", value = " + value);
			}
		}
		else if (this.m_version == this.AICC_VERSION)
		{
			paramName = paramName + "";
			value = value + "";
			this.m_aiccHacpWrapper.setParam(paramName, value);
		}
	}
}

iSpring.LMSApiWrapper.prototype.terminate = function()
{
	if (this.m_terminated == false)
	{
		var api = this.getApiHandle();
		if (api != null)
		{
			var result = false;
			switch (this.m_version)
			{
				case this.SCORM_VERSION_12:
				case this.AICC_VERSION:
					result = this.strToBool(api.LMSFinish(""));
					break;
				case this.SCORM_VERSION_2004:
					result = this.strToBool(api.Terminate(""));
					break;
			}
			if (!result)
			{
				this.m_logger.logError("terminate failed");
			}
			this.m_terminated = true;
		}
		else if (this.m_version == this.AICC_VERSION)
		{
			this.m_aiccHacpWrapper.invokeExitAU();
			this.m_terminated = true;
		}
	}
}

iSpring.LMSApiWrapper.strToBool = function(str)
{
	switch (str)
	{
		case "true":
		case "1":
		case "yes":
			return true;
		case "false":
		case "0":
		case "no":
		case null:
			return false;
		default:
			return Boolean(str);
	}
}


// iSpring LMS
iSpring.LMS = function (id, version, player, params, debug)
{
	this.m_id = id;
	this.m_version = version;
	this.m_player = player;

	this.m_maxTime = params.limitTime;
	this.m_exitOnTimeout = params.limitTimeExit;
	this.m_showMessageOnTimeout = params.limitTimeShowMessage;
	this.m_messageOnTimeout = params.limitTimeMessage;

	this.m_ratedQuizzes = params.quizzesInfo;
	this.m_quizScores = [];

	this.m_rateSlidesWeight = params.rateSlidesWeight;
	this.m_rateSlidesCount = params.rateSlidesCount;

	this.m_totalScore = params.gradeTotalScore;
	this.m_passingScore = params.gradePassingScore;

	this.m_reportOptions = params.reportOptions;

	this.m_slidesNum = player.presentation().slides().count();

	iSpring.Logger.debug = debug;
	this.m_wrapper = new iSpring.LMSApiWrapper(this.m_version);
	this.initEventHandlers();

	this.m_suspendData = new Array;
	this.m_suspendData.push(true);
	if (this.m_slidesNum > 1)
	{
		for (i = 1; i < this.m_slidesNum; i++)
		{
			this.m_suspendData.push(false);
		}
	}
	this.m_lmsOpened = false;
	this.m_currentSlideIndex = 0;

	this.m_interactionIndexes = {};

	this.openLms(player);
}

iSpring.LMS.SCORM_VERSION_12 = "1.2";
iSpring.LMS.SCORM_VERSION_2004 = "2004";
iSpring.LMS.AICC_VERSION = "aicc";

iSpring.LMS.SCORM_INTERACTION_TRUE_FALSE = "true-false";
iSpring.LMS.SCORM_INTERACTION_CHOICE = "choice";
iSpring.LMS.SCORM_INTERACTION_FILL_IN = "fill-in";
iSpring.LMS.SCORM_INTERACTION_MATCHING = "matching";
iSpring.LMS.SCORM_INTERACTION_SEQUENCING = "sequencing";
iSpring.LMS.SCORM_INTERACTION_NUMERIC = "numeric";
iSpring.LMS.SCORM_INTERACTION_OTHER = "other";

iSpring.LMS.prototype.__name__ = "iSpring.LMS";
iSpring.LMS.prototype.m_id = null;
iSpring.LMS.prototype.m_player = null;

iSpring.LMS.prototype.m_maxTime = null;
iSpring.LMS.prototype.m_exitOnTimeout = null;
iSpring.LMS.prototype.m_showMessageOnTimeout = null;
iSpring.LMS.prototype.m_messageOnTimeout = null;

iSpring.LMS.prototype.m_ratedQuizzes  = null;
iSpring.LMS.prototype.m_quizScores = null;
iSpring.LMS.prototype.m_rateSlidesWeight = null;
iSpring.LMS.prototype.m_rateSlidesCount  = null;

iSpring.LMS.prototype.m_totalScore   = null;
iSpring.LMS.prototype.m_passingScore = null;

iSpring.LMS.prototype.m_reportOptions = null;

iSpring.LMS.prototype.m_slidesNum = null;

iSpring.LMS.prototype.m_wrapper = null;
iSpring.LMS.prototype.m_lmsOpened = null;
iSpring.LMS.prototype.m_currentSlideIndex = null;

iSpring.LMS.prototype.m_suspendData = null;
iSpring.LMS.prototype.m_timeController = null;
iSpring.LMS.prototype.m_version = null;

iSpring.LMS.prototype.m_interactionIndexes = null;

iSpring.LMS.prototype = iSpring.LMS;

iSpring.LMS.prototype._onPptBufferStateChange = function(clock)
{
	if (!clock.buffering())
	{
		clock.bufferStateChangeEvent().removeHandler(this._onPptBufferStateChange, this);
		this._initLmsTimer(clock);
	}
}

iSpring.LMS.prototype._initLmsTimer = function(clock)
{
	//iSpring.Logger.log(clock.buffering());
	if (clock.buffering())
	{
		clock.bufferStateChangeEvent().addHandler(this._onPptBufferStateChange, this);
	}
	else
	{
		// start lms timer after first slide loaded
		this.m_timeController = new iSpring.TimeController(this.m_maxTime, 15, this);
	}
}

iSpring.LMS.prototype.openLms = function(player)
{
	if (!this.m_lmsOpened)
	{
		this.m_wrapper.initialize();
		this.m_lmsOpened = true;

		if (this.m_ratedQuizzes.length > 0 || this.m_rateSlidesCount > 0)
		{
			this.setMinMaxScore(0, this.m_totalScore);
		}

		var clock = player.view().playbackController().clock();
		this._initLmsTimer(clock);

		this.restoreSuspendedData();

		this.updateLearnerProgress();
	}
}

iSpring.LMS.prototype.getId = function()
{
	return this.m_id;
}

iSpring.LMS.prototype.closeLms = function()
{
	this._closeLmsImpl(this.getCompletionStatus());
}

iSpring.LMS.prototype._closeLmsImpl = function(completionStatus)
{
	if (this.m_lmsOpened)
	{
		if (this.m_timeController)
		{
			this.m_timeController.stopTimers();
		}
		if ( completionStatus )
		{
			this.setExitNormal();
		}
		else
		{
			this.setExitSuspend();
		}
		this.saveData();
		this.m_wrapper.terminate();
		this.m_lmsOpened = false;
	}
}

iSpring.LMS.prototype.restoreSuspendedData = function()
{
	var sData = this.getSuspendData().split(",");

	if (sData.length == this.m_suspendData.length)
	{
		for (var i = 0; i < sData.length; ++i)
		{
			this.m_suspendData[i] = (sData[i] == 'true');
		}
	}
}

iSpring.LMS.prototype.getMaxWeightScore = function()
{
	var maxScore = 0;

	var countQuizzes = this.m_ratedQuizzes.length;
	for (var i = 0; i < countQuizzes; ++i)
	{
		maxScore += this.m_ratedQuizzes[i].weight;
	}

	if (this.m_rateSlidesCount > 0)
	{
		maxScore += this.m_rateSlidesWeight;
	}

	return maxScore;
}

iSpring.LMS.prototype.getQuizzesWeightScore = function()
{
	var weightScore = 0;

	var countRatedQuizzes = this.m_ratedQuizzes.length;
	for (var i = 0; i < countRatedQuizzes; ++i)
	{
		var quizInfo = this.m_ratedQuizzes[i];

		var quizIndex = quizInfo.index;
		var weight    = quizInfo.weight;

		if (this.m_quizScores[quizIndex])
		{
			weightScore += this.m_quizScores[quizIndex] * weight;
		}
	}

	return weightScore;
}

iSpring.LMS.prototype.getSlidesWeightScore = function()
{
	if (this.m_rateSlidesCount > 0)
	{
		return this.getViewedSlideCount() / this.m_slidesNum * this.m_rateSlidesWeight;
	}
	return 0;
}

iSpring.LMS.prototype.updateLearnerProgress = function()
{
	var hasRatedCourse = (this.m_rateSlidesCount > 0) || (this.m_ratedQuizzes.length > 0);
	if (hasRatedCourse)
	{
		this.updateScore();
	}

	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			if (hasRatedCourse)
			{
				this.updatePassedStatus();
			}
			else
			{
				this.updateCompletionStatus();
			}
			break;
		case this.SCORM_VERSION_2004:
			this.updateCompletionStatus();
			this.updatePassedStatus();
			break;
	}
}

iSpring.LMS.prototype.updateCompletionStatus = function()
{
	var countViewedSlidesForCompletion = (this.m_rateSlidesCount == 0 ?
		this.m_slidesNum : this.m_rateSlidesCount);
	var slidesViewed = (countViewedSlidesForCompletion <= this.getViewedSlideCount());

	var quizzesViewed = true;
	for (var i = 0; i < this.m_ratedQuizzes.length; ++i)
	{
		var quizIndex = this.m_ratedQuizzes[i].index;
		if ( this.m_quizScores[quizIndex] == undefined )
		{
			quizzesViewed = false;
			break;
		}
	}

	this.setCompletionStatus(slidesViewed && quizzesViewed);
}

iSpring.LMS.prototype.updatePassedStatus = function()
{
	if (this.m_rateSlidesCount > 0 || this.m_ratedQuizzes.length > 0)
	{
		var gainedScore  = this.getPercentScore() * this.m_totalScore;
		this.setPassedStatus(gainedScore >= this.m_passingScore);
	}
	else if (this.m_version == this.SCORM_VERSION_2004)
	{
		this.setPassedStatus(undefined);
	}
}

iSpring.LMS.prototype.getPercentScore = function()
{
	var quizzesScore = this.getQuizzesWeightScore();
	var slidesScore  = this.getSlidesWeightScore();

	var gainedWeightScore = quizzesScore + slidesScore;
	var maxWeightScore = this.getMaxWeightScore();

	return gainedWeightScore / maxWeightScore;
}

iSpring.LMS.prototype.updateScore = function()
{
	var percentScore = this.getPercentScore();
	var gainedScore  = percentScore * this.m_totalScore;

	this.setScaledScore(percentScore);
	this.setRawScore(gainedScore);
}

iSpring.LMS.prototype.saveData = function()
{
	this.setSuspendData(this.m_suspendData.join(","));
	this.m_wrapper.commit();
}

iSpring.LMS.prototype.onCurrentSlideIndexChanged = function(slideIndex)
{
	if (this.m_lmsOpened)
	{
		this.m_currentSlideIndex = slideIndex;
		this.m_suspendData[slideIndex] = true;

		this.updateLearnerProgress();
	}
}

iSpring.LMS.prototype.convertToInt = function(value)
{
	if (value < 0)
	{
		return Math.ceil(value);
	}
	return Math.floor(value);
}

iSpring.LMS.prototype.formatTime = function(value)
{
	var h;
	var m;
	var s = value;
	h = this.convertToInt(s / 3600);
	s -= h * 3600;
	m = this.convertToInt(s / 60);
	s -= m * 60;

	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			return this.format2(h) + ":" + this.format2(m) + ":" + this.format2(s);
		case this.SCORM_VERSION_2004:
			return "PT" + h + "H" + m + "M" + s + "S";
	}
}

iSpring.LMS.prototype.format2 = function(value)
{
	var str = "";
	if (value < 10)
	{
		str += "0";
	}
	return str + value.toString();
}

iSpring.LMS.prototype.getCompletionStatus = function()
{
	var p = this.selectParamVersion("cmi.core.lesson_status", "cmi.completion_status");
	var completionStatus = this.m_wrapper.getValue(p);
	return (completionStatus == "completed" || completionStatus == "passed");
}

iSpring.LMS.prototype.setExitNormal = function()
{
	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			this.m_wrapper.setValue("cmi.core.exit", "");
			break;
		case this.SCORM_VERSION_2004:
			this.m_wrapper.setValue("cmi.exit", "normal");
			this.m_wrapper.setValue("adl.nav.request", "exitAll");
			break;
	}
}

iSpring.LMS.prototype.setExitSuspend = function()
{
	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			this.m_wrapper.setValue("cmi.core.exit", "suspend");
			break;
		case this.SCORM_VERSION_2004:
			this.m_wrapper.setValue("cmi.exit", "suspend");
			this.m_wrapper.setValue("adl.nav.request", "exitAll");
			break;
	}
}

iSpring.LMS.prototype.getAppropriateStatus = function (completed)
{
	var status = "";
	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			// bit operations: 1 - passed/failed, 0 - complete/incomplete
			// So values:
			// ..00 - complete/incomplete
			// ..01 - complete/failed
			// ..10 - passed/incomplete
			// ..11 - passed/failed
			if (completed)
			{
				var reportOption = (this.m_reportOptions & 0x02);
				status = reportOption ? "passed" : "completed";
			}
			else
			{
				var reportOption = (this.m_reportOptions & 0x01);
				status = reportOption ? "failed" : "incomplete";
			}
			break;
		default:
			break;
	}
	return status;
}


iSpring.LMS.prototype.setCompletionStatus = function (completed)
{
	var paramName = this.selectParamVersion("cmi.core.lesson_status", "cmi.completion_status");
	var paramValue = this.getAppropriateStatus(completed);

	switch (this.m_version)
	{
		case this.SCORM_VERSION_2004:
			paramValue = completed ? "completed" : "incomplete";
			break;
	}

	this.m_wrapper.setValue(paramName, paramValue);
}

iSpring.LMS.prototype.setPassedStatus = function (passed)
{
	var paramName = this.selectParamVersion("cmi.core.lesson_status", "cmi.success_status");
	var paramValue = this.getAppropriateStatus(passed);
	switch (this.m_version)
	{
		case this.SCORM_VERSION_2004:
			if (passed !== undefined)
			{
				paramValue = (passed ? "passed" : "failed");
			}
			else
			{
				paramValue = "unknown";
			}
			break;
		default:
			break;
	}
	this.m_wrapper.setValue(paramName, paramValue);
}

iSpring.LMS.prototype.setTime = function(value)
{
	var p = this.selectParamVersion("cmi.core.session_time", "cmi.session_time");
	this.m_wrapper.setValue(p, this.formatTime(value));
}

iSpring.LMS.prototype.getSuspendData = function()
{
	return this.m_wrapper.getValue("cmi.suspend_data");
}

iSpring.LMS.prototype.setSuspendData = function(data)
{
	this.m_wrapper.setValue("cmi.suspend_data", data);

	if (this.m_version == this.SCORM_VERSION_2004)
	{
		this.m_wrapper.setValue("cmi.progress_measure", String(this.getViewedSlideCount() / this.m_slidesNum));
	}
}

iSpring.LMS.prototype.getTimeLimitActions = function()
{
	return "";
}

iSpring.LMS.prototype.onFinalizeQuiz = function(quizId)
{
}

iSpring.LMS.prototype.setQuizScore = function(quizId, pointScore, percentScore, totalScore, totalScoreNormalized, passed, quizIsSurvey)
{
	this.m_quizScores[this.m_currentSlideIndex] = percentScore;

	this.updateLearnerProgress();
}

iSpring.LMS.prototype.validateInteractionResponse = function(type, responseStr)
{
	switch (type)
	{
		case this.SCORM_INTERACTION_CHOICE:
		case this.SCORM_INTERACTION_SEQUENCING:
		case this.SCORM_INTERACTION_MATCHING:
			return CUtils.validateIdentifier(responseStr);
	}
	return responseStr;
}

iSpring.LMS.prototype.getInteractionIndex = function(interactionId)
{
	if (interactionId in this.m_interactionIndexes)
	{
		return this.m_interactionIndexes[interactionId];
	}

	var countInteractions = this.m_wrapper.getValue("cmi.interactions._count");
	if (countInteractions >= 250) //max count of interactions
	{
		return -1;
	}

	this.m_interactionIndexes[interactionId] = countInteractions;
	return countInteractions;
}

iSpring.LMS.prototype.saveInteraction = function(type,
                                                 questionId,
                                                 description,
                                                 correctAnswer,
                                                 userAnswer,
                                                 result,
                                                 latency,
                                                 weight,
                                                 timestamp)
{
	// get interaction index
	var index = this.getInteractionIndex(questionId);
	if (index < 0)
	{
		return;
	}

	this.m_wrapper.setValue("cmi.interactions." + index + ".id", questionId);
	this.m_wrapper.setValue("cmi.interactions." + index + ".type", String(type));

	var p = this.selectParamVersion(".student_response", ".learner_response");
	userAnswer = this.validateInteractionResponse(String(type), userAnswer);
	this.m_wrapper.setValue("cmi.interactions." + index + p, userAnswer);

	if (!CUtils.isEmpty(description) && this.m_version == this.SCORM_VERSION_2004)
	{
		var desc = String(description).replace(/\n/g, " ")
		this.m_wrapper.setValue("cmi.interactions." + index + ".description", desc);
	}

	if (!CUtils.isEmpty(correctAnswer))
	{
		correctAnswer = this.validateInteractionResponse(String(type), correctAnswer);
		this.m_wrapper.setValue("cmi.interactions." + index + ".correct_responses.0.pattern", correctAnswer);
	}

	if (!CUtils.isEmpty(result))
	{
		this.m_wrapper.setValue("cmi.interactions." + index + ".result", result);
	}

	if (!CUtils.isEmpty(latency))
	{
		this.m_wrapper.setValue("cmi.interactions." + index + ".latency", this.formatTime(Math.round(Number(latency) / 1000)));
	}

	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			var date = new Date(Number(timestamp));
			var h = date.getHours();
			var m = date.getMinutes();
			var s = date.getSeconds();
			this.m_wrapper.setValue("cmi.interactions." + index + ".time", this.format2(h) + ":" + this.format2(m) + ":" + this.format2(s));
			break;
		case this.SCORM_VERSION_2004:
			this.m_wrapper.setValue("cmi.interactions." + index + ".timestamp", CUtils.makeISO8601TimeStamp(timestamp));
			break;
	}

	if (!CUtils.isEmpty(weight))
	{
		this.m_wrapper.setValue("cmi.interactions." + index + ".weighting", weight);
	}
}

iSpring.LMS.prototype.setInteractionInfo = function(quizId, questionType, questionId, description, correctAnswer, userAnswer, result, latency, weight, timestamp)
{
	// save interactions
	this.saveInteraction(questionType, questionId, description, String(correctAnswer), String(userAnswer), result, latency, weight, timestamp);
}

iSpring.LMS.prototype.initEventHandlers = function()
{
	var playbackController = this.m_player.view().playbackController();
	playbackController.slideChangeEvent().addHandler(this.onCurrentSlideIndexChanged, this);
}

iSpring.LMS.prototype.setRawScore = function(score)
{
	var p = this.selectParamVersion("cmi.core.score.raw", "cmi.score.raw");
	this.m_wrapper.setValue(p, score);
}

iSpring.LMS.prototype.setMinMaxScore = function(min, max)
{
	var p1 = this.selectParamVersion("cmi.core.score.min", "cmi.score.min");
	var p2 = this.selectParamVersion("cmi.core.score.max", "cmi.score.max");
	this.m_wrapper.setValue(p1, min);
	this.m_wrapper.setValue(p2, max);
}

iSpring.LMS.prototype.setScaledScore = function(score)
{
	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			break;
		case this.SCORM_VERSION_2004:
			this.m_wrapper.setValue("cmi.score.scaled", score);
			break;
	}
}

iSpring.LMS.prototype.selectParamVersion = function(scorm12Param, scorm2004Param)
{
	switch (this.m_version)
	{
		case this.SCORM_VERSION_12:
		case this.AICC_VERSION:
			return scorm12Param;
		case this.SCORM_VERSION_2004:
			return scorm2004Param;
	}
}

iSpring.LMS.prototype.getViewedSlideCount = function()
{
	var count = 0;
	for (i = 0; i < this.m_slidesNum; i++)
	{
		if (this.m_suspendData[i])
		{
			count++;
		}
	}
	return count;
}

iSpring.LMS.prototype.onEndTime = function()
{
	if (this.m_showMessageOnTimeout)
	{
		alert(this.m_messageOnTimeout);
	}
	if (this.m_exitOnTimeout && this.m_lmsOpened)
	{
		this._closeLmsImpl(true);
	}
}

iSpring.LMS.prototype.onTime = function(time)
{
	this.setTime(time);
}
