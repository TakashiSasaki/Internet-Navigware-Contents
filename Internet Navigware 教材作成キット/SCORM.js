// SCORM サポートライブラリ

var API = null;

function GetAPI()
{
	if (API != null)
		return API;

	var win = window;
	while (win.API == null && win.parent != null && win.parent != win) {
		win = win.parent;
	}
	API = win.API;

	return API;
}

function LMSInitialize()
{
	var api = GetAPI();
	if (api == null) {
		if (window.parent == null)
			alert("LMS Communication API の初期化に失敗しました。");
		return "false";
	}
	var strResult = GetAPI().LMSInitialize("");
	return strResult;
}

function LMSGetValue(strParam)
{
	var strResult = GetAPI().LMSGetValue(strParam);
	return strResult;
}

function LMSSetValue(strParam, strValue)
{
	var strResult = GetAPI().LMSSetValue(strParam, strValue);
	return strResult;
}

function LMSCommit()
{
	var strResult = GetAPI().LMSCommit("");
	return strResult;
}

function LMSFinish()
{
	strResult = GetAPI().LMSFinish("");
	return strResult;
}

function GetLastError()
{
	var strResult = GetAPI().LMSGetLastError();

	// GetAPI().LMSGetErrorString(strResult);
	// GetAPI().LMSGetDiagnostic(strResult);

	return strResult;
}
