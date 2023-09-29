// this function is listening in on the status of the timer while the tabs are active and when it "hears" that the timer has a status of "expired" it will change its color
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.storage.local.set({ timerRunning: false });
        // chrome.action.setBadgeText({ text: '' });
        chrome.action.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
    }

});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.startTimer) {
        chrome.storage.local.set({timerRunning: true });
        // chrome.action.setBadgeText({ text: '5:00' });
        chrome.action.setBadgeBackgroundColor({ color: [74, 0, 72, 39]});
        
        
        var timer = 300;
        // creating an interval to run our timer function that will in realtime set the new time every 1 second
        // we created the call back function 
        var intervalId = setInterval(function() {
            timer--;
            var minutes = Math.floor(timer/60);
            var seconds = timer % 60;
            var text = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            chrome.action.setBadgeText({ text: text });
            if (timer === 0) {
                clearInterval(intervalId);
                chrome.windows.create({
                    'url': 'alert.html',
                    'type': 'popup',
                    'width': 250,
                    'height': 250
                });
                chrome.storage.local.set({ timerRunning: false});
                chrome.action.setBadgeText({ text: ''});
                chrome.action.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
            }
        }, 1000);
    } else if (request.restartTimer){
        chrome.storage.local.set({ timerRunning: false });
        chrome.runtime.sendMessage({ startTimer: true });
    }
})