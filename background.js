//TODO: check all ports (now hardcoded)
var ports = [6463, 6473];

function updatePresence(title){
	getPid(function(pid){
		var data = JSON.stringify(
			{
				cmd: "SET_ACTIVITY",
				args: {
					pid: pid,
					activity: {
						details: title,
						timestamps: {
							start: Math.round(+new Date() / 1000)
						},
						assets: {
							large_image: "logo_big_svg"
						}
					}
				},
				nonce: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
			}
		);

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;

		xhr.open("POST", "http://localhost:6463/rpc?v=1&client_id=446985028744904704");
		xhr.send(data);
	});
}

function getPid(callback){
	chrome.tabs.query({ active: true }, function (tabs) {
		chrome.processes.getProcessIdForTab(tabs[0].id, function(pid){
			callback(pid);
		});
	});
}

function onTabUpdate(id, status, tab){
	if(status.status != "complete") return;
	
	// sometimes the tab title isn't updated yet like on youtube so we wait 1 second and then get the tab
	setTimeout(function (){
		chrome.tabs.query({ active: true }, function (tabs) {
			updatePresence(tabs[0].title);
		});
	}, 1000);
}

function spoofHeader(details){	
	var headers = [ {name: "Content-Type", value: "application/json"} ];
	
	return { requestHeaders: headers };
}

chrome.webRequest.onBeforeSendHeaders.addListener(spoofHeader,  {urls: ["http://localhost:6463/*"]}, ["requestHeaders", "blocking"])
chrome.tabs.onUpdated.addListener(onTabUpdate);
