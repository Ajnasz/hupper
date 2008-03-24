const APP_DISPLAY_NAME = "Hupper";
const APP_NAME = "hupper";
const APP_PACKAGE = "/Koszti Lajos/hupper";
const APP_VERSION = "0.0.5";
const APP_DEFAULTS = "Hupper Defaults";

const APP_JAR_FILE = "hupper.jar";
const APP_CONTENT_FOLDER = "content/hupper/";
const APP_SKIN_FOLDER = "skin/classic/hupper/";

const APP_SUCCESS_MESSAGE = "Hupper installed.\n\n";

var   APP_PLATFORM = ""

// start it all up
initInstall(APP_NAME, APP_PACKAGE, APP_VERSION);

// get user's profile chrome directory
var chromef = getFolder("Profile", "chrome");
var prefDir = getFolder("Program", "defaults/pref")
// add jar file
var err = addFile(APP_PACKAGE, APP_VERSION, "chrome/" + APP_JAR_FILE, chromef, null, true);
if(err == SUCCESS) {
	err = addFile(APP_DEFAULTS, APP_VERSION, "defaults/preferences/hupper.js", prefDir, "hupper.js", true);
// on unixy platforms, global defaults directory is not writable! Ignore this error!
	if(err == ACCESS_DENIED || err == READ_ONLY) {
		err = SUCCESS;
	}
}

if(err == SUCCESS) {
	var jar = getFolder(chromef, APP_JAR_FILE);
	registerChrome(CONTENT | PROFILE_CHROME, jar, APP_CONTENT_FOLDER);
	registerChrome(SKIN    | PROFILE_CHROME, jar, APP_SKIN_FOLDER);

	registerChrome(LOCALE | PROFILE_CHROME, jar, 'locale/en-US/'+APP_NAME+'/');
	registerChrome(LOCALE | PROFILE_CHROME, jar, 'locale/hu-HU/'+APP_NAME+'/');
	err = performInstall();
	if(err == SUCCESS || err == REBOOT_NEEDED) {
    var gPlatform = getPlatform();
		alert("Debug: We think your OS is: " + APP_PLATFORM);
		if(gPlatform == 'unix') {
//			var uxerr = setUnixPermissions();
//			alert("Debug: setUnixPermissions returned with: " + uxerr);
		};
		msg = APP_NAME + " " + APP_VERSION + " has been succesfully installed.\n"
			+APP_SUCCESS_MESSAGE
			+"Please restart your browser to enable hupper.";
		alert(msg);
	}
	else if(err == CHROME_REGISTRY_ERROR) {
		msg = "Install failed. There was a Chrome Registry Error: " + err
			+ ".\nPlease restart Mozilla and try installing "
			+ APP_DISPLAY_NAME + " again.";
		alert(msg);
		resetError();
		cancelInstall(err);
	}
	else {
		alert("Install failed. Could not performInstall. Error code:" + err);
		cancelInstall(err);
	}
}
else {
	alert("Install failed. Could not addFile: " + APP_JAR_FILE + ". Error code:" + err);
	cancelInstall(err);
}

function getPlatform() {
	var platformStr, platformNode;

	if ('platform' in Install) {
		platformStr = new String(Install.platform);
		APP_PLATFORM = platformStr;
		// Mac OS X (aka Darwin) is a real unix system
		if (!platformStr.search(/.*Darwin/))
			platformNode = 'unix';
		else if (!platformStr.search(/^Macintosh/))
			platformNode = 'mac';
		else if (!platformStr.search(/^Win/))
			platformNode = 'win';
		else if (!platformStr.search(/^OS\/2/))
			platformNode = 'win';
		else if (!platformStr.search(/unix|sun|linux/i))
			platformNode = 'unix';
		else if (getFolder("Unix Lib") != null)
			platformNode = 'unix';
		else
			platformNode = 'unknown';
	}
	else
	{
		if (getFolder("Unix Lib") != null)
			platformNode = 'unix';
		else if (getFolder("Mac System")!= null)
			platformNode = 'mac';
		else if(getFolder("Win System")!= null)
			platformNode = 'win';
		else
			platformNode = 'unknown';
	}
	return platformNode;
}

function setUnixPermissions() {
	initInstall(APP_NAME, APP_PACKAGE, APP_VERSION);
	var err, cmdPath;
	var chromeF = getFolder(getFolder("Profile", "chrome"), APP_JAR_FILE);
	var cmdArgs = "u+rwx,go+r ";

	alert("Debug: The next step will try to set unix permissions");

	cmdPath = chromeF;
	if (!File.isFile(cmdPath)) {
		alert("Cannot find :" + cmdPath);
		return DOES_NOT_EXIST;
	} ;

	cmdPath = getFolder("OS Drive");
	if (!File.isDirectory(cmdPath)) {
		alert("Cannot find OS Drive :" + cmdPath);
		return DOES_NOT_EXIST;
	} ;

	cmdPath = getFolder(cmdPath, "bin");
	if (!File.isDirectory(cmdPath)) {
		alert("Cannot find bin directory:" + cmdPath);
		return DOES_NOT_EXIST;
	} ;

	cmdPath = getFolder(cmdPath, "chmod");
	if (!File.isFile(cmdPath)) {
		alert("Cannot find chmod:" + cmdPath);
		return DOES_NOT_EXIST;
	} ;

	cmdArgs = cmdArgs + chromeF;
alert( "Will perform chmod");
	try {
	err = File.execute(cmdPath, cmdArgs );
	} catch(e) { alert("Error executing chmod: " + e) };
	if (err != SUCCESS) {
		alert("chmod didn't work, Error :" + err + " " + cmdPath + " " + cmdArgs);
//		return err;
	} ;

alert( "Will performInstall on setUnixPermissions");
	err = performInstall();
	if(err != SUCCESS) {
		alert("setUnixpermissions Error: "+ err + " " + cmdPath + " " + CmdArgs);
	}
	return err;
}
