var chromeExtension = "momeooiohciaidckmlekamekdgabdmaj";
var edgeExtension = "almhcabepbejobkcmefekbkaokekmpfo";
var productID = "com.cfca.cryptokit.hncx";

var extensionName = productID + ".extension";
var reqEventName  = productID + ".request";
var respEventName = productID + ".response";

Browser = {
    IE:      "Internet Explorer",
    Edge:    "Edge",
    Edg:     "Edge(Chromium)",
    Chrome:  "Chrome",
    Safari:  "Safari",
    Firefox: "Firefox",
};

// Encapsulate Chrome sendMessage callback to Promise
function SendMessageforChrome(request) {
    return new Promise( function (resolve, reject) {
        chrome.runtime.sendMessage(chromeExtension, request, function (response) {
			if (response) {
				if(0 == response.errorcode){ 
                    resolve(response);                                    
				}
				else{
                    reject(response);
				}
			}
			else {
			    var result = new Object();
			    result.errorcode = 1;
			    result.result = chrome.runtime.lastError.message;
			    reject(result);
			}
		});
    });
}

// Encapsulate Edge sendMessage callback to Promise
function SendMessageforEdge(request) {
    return new Promise( function (resolve, reject) {
        chrome.runtime.sendMessage(edgeExtension, request, function (response) {
			if (response) {
				if(0 == response.errorcode){ 
                    resolve(response);                                    
				}
				else{
                    reject(response);
				}
			}
			else {
			    var result = new Object();
			    result.errorcode = 1;
			    result.result = chrome.runtime.lastError.message;
			    reject(result);
			}
		});
    });
}

// Encapsulate Edge&Firefox event to Promise
function SendMessagebyEvent(request) {
    var event = new CustomEvent(reqEventName, { detail: request });
    document.dispatchEvent(event);

    return new Promise( function (resolve, reject) {
	
	    var responseEventName = respEventName;
	    if(request.funcInfo != undefined && request.funcInfo.randomId != undefined)
			responseEventName += ("." + request.funcInfo.randomId);
			
        document.addEventListener(responseEventName, function CallBack(e) {
            document.removeEventListener(e.type, CallBack);
            var eJson = JSON.parse(e.detail);
            if (null != eJson && 0 == eJson.errorcode) {
                resolve(eJson);
            }
            else {
                reject(eJson);
            }
        }, false);
    });
}

function SendMessage(browser, requestJSON) {
    if (Browser.Chrome == browser) {
        return SendMessageforChrome(requestJSON);
    }
    else if(Browser.Edg == browser)
    {
        return SendMessageforEdge(requestJSON);
    }
    else {
        return SendMessagebyEvent(requestJSON);
    }
}


function checkExtension (browser) {
    return new Promise(function (resolve, reject) {
        var result = new Object();
        if (Browser.Chrome == browser || Browser.Edg == browser) {
            // chrome.runtime.sendMessage() could check extension  existence.
            resolve(browser);
        }
        else if (Browser.Firefox == browser) {
            if (document.getElementById(extensionName)) {
                resolve(browser);
            }
            else {
                result.errorcode = 1;
                result.result = "Extension does not exist!";
                reject(result);
            }
        }
        else {
            result.errorcode = 1;
            result.result = "Only support Chrome/Edge/Firefox";
            reject(result);
        }
    });
}

function nmCryptokit(browser) {

    this.browser = browser;
};

function GenerateRandomId() {
    var charstring = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var maxPos = charstring.length;
    var randomId = '';
    for (i = 0; i < 10; i++) {
        randomId += charstring.charAt(Math.floor(Math.random() * maxPos));
    }
    return randomId;
}
	
nmCryptokit.prototype.init = function () {

    var browser = this.browser;

    return checkExtension(browser)
        .then(function (browser) {
            var request = new Object();
            request.action = "connect";
            request.host = productID;
            return SendMessage(browser, request);
        }).then(function () {
            var request = new Object();
            request.action = "checkHost";
            return SendMessage(browser, request);
        });
}


nmCryptokit.prototype.uninit = function () {

    var request = new Object();                   
    request.action = "disconnect";
    request.host = productID;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.selectCertificate = function (strSubjectDNFilter, strIssuerDNFilter, strSerialNo, strCSPList) {
          
    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();
    
    paramArr.push(strSubjectDNFilter);
    paramArr.push(strIssuerDNFilter);
    paramArr.push(strSerialNo);
    paramArr.push(strCSPList);
       
    funcInfo.function = "SelectCertificate";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;
       
    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.getSignCertInfo = function (strInfoType) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();
    
    paramArr.push(strInfoType);
       
    funcInfo.function = "GetSignCertInfo";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;
       
    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.signMsgPKCS1 = function (strSource, strSelectedAlg) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSource);
    paramArr.push(strSelectedAlg);
       
    funcInfo.function = "SignMsgPKCS1";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;
       
    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.signMsgPKCS7 = function (strSource, strSelectedAlg, bAttached) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSource);
    paramArr.push(strSelectedAlg);
    paramArr.push(bAttached);

    funcInfo.function = "SignMsgPKCS7";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.signMsgPKCS1_BySoftCert = function (strSoftCertFileName, strSoftCertPassword, strSoftCertType, strSourceData, strHashAlg) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSoftCertFileName);
    paramArr.push(strSoftCertPassword);
    paramArr.push(strSoftCertType);
    paramArr.push(strSourceData);
    paramArr.push(strHashAlg);

    funcInfo.function = "SignMsgPKCS1_BySoftCert";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.signMsgPKCS7_BySoftCert = function (strSoftCertFileName, strSoftCertPassword, strSoftCertType, strSourceData, strHashAlg, bAttached) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSoftCertFileName);
    paramArr.push(strSoftCertPassword);
    paramArr.push(strSoftCertType);
    paramArr.push(strSourceData);
    paramArr.push(strHashAlg);
    paramArr.push(bAttached);

    funcInfo.function = "SignMsgPKCS7_BySoftCert";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.verifyMsgSignaturePKCS1 = function (strSignature, strSignatureType, strSourceMsg, strHashAlg, strBase64CertContent) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSignature);
    paramArr.push(strSignatureType);
    paramArr.push(strSourceMsg);
    paramArr.push(strHashAlg);
    paramArr.push(strBase64CertContent);

    funcInfo.function = "VerifyMsgSignaturePKCS1";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.verifyMsgSignaturePKCS7Attached = function (strSignature, strSignatureType) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSignature);
    paramArr.push(strSignatureType);

    funcInfo.function = "VerifyMsgSignaturePKCS7Attached";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.verifyMsgSignaturePKCS7Detached = function (strSignature, strSignatureType, strSource) {

    var request = new Object();
    var funcInfo = new Object();
    var paramArr = new Array();
    var randomId = GenerateRandomId();

    paramArr.push(strSignature);
    paramArr.push(strSignatureType);
    paramArr.push(strSource);

    funcInfo.function = "VerifyMsgSignaturePKCS7Detached";
    funcInfo.params = paramArr;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.getVersion = function () {

    var request = new Object();
    var funcInfo = new Object();
    var randomId = GenerateRandomId();

    funcInfo.function = "GetVersion";
    funcInfo.params = null;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}


nmCryptokit.prototype.getLastErrorDesc = function () {

    var request = new Object();
    var funcInfo = new Object();
    var randomId = GenerateRandomId();

    funcInfo.function = "GetLastErrorDesc";
    funcInfo.params = null;
    funcInfo.randomId = randomId;

    request.action = "invoke";
    request.funcInfo = funcInfo;

    return SendMessage(this.browser, request);
}