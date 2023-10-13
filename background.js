
chrome.storage.local.clear();
const checkStorage = async () => {
    try {
        const isAlive = await chrome.storage.local.get(['urls'])
        if (isAlive.urls === undefined || isAlive.urls == {}){
            await chrome.storage.local.set({ urls: [] }, (() => {
                console.log("local url storage space is allocated");
            }));
        }
        else {
            const bs = await chrome.storage.local.get(['urls'])
            console.log('current list of urls in local storage: ' + bs.urls);
        }
    } catch (error) {
        console.log(error);
    }
}
checkStorage();

// retrieving a message saying open tab true to see if we can open a tab with the chrome api
chrome.runtime.onMessage.addListener(async (message) => {
    try {
        if (message.toOpen){
            let bs = await chrome.storage.local.get(['urls'])
            bs.urls.push('https://'+message.user_url)
            await chrome.storage.local.set({ urls: bs.urls })
            const updatedArr = await chrome.storage.local.get(['urls'])
            console.log(updatedArr.urls);
            
        }
    } catch (error) {
        console.log(error);
    }
})

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.openTab){
        // check if they have saved anything to local storage
        async function checkUrls(){
            const userSavedUrls = await chrome.storage.local.get(['urls'])
            console.log(userSavedUrls.urls);
            return userSavedUrls.urls.length != 0 && userSavedUrls.urls != undefined ? true : false

        }
        
        // now we need to map through the urls and create a url tab for each one
        const hasURls = await checkUrls();
        console.log(hasURls);
        if (hasURls){
            chrome.tabs.create({
            url: 'https://www.youtube.com/'
            })
        }
        else {
            chrome.runtime.sendMessage({ hasUrls: hasURls })
        }
        
    }
})

chrome.runtime.onMessage.addListener((message) => {
    if (message.seeSites){
        chrome.windows.create({
            'url': 'savedSites.html',
            'type': 'popup',
            'width': 250,
            'height': 250
        });
    }
})

// grabbing the url to delete and popping it from storage
chrome.runtime.onMessage.addListener((message) => {
    if (message.confirm_delete){
        const url_ID = message.remove_url;
        console.log(url_ID);
        // const removeFromStorage = async url_ID => {

        // };
    }
})


chrome.tabs.onUpdated.addListener(function(changeInfo) {
    if (changeInfo.status === 'complete') {
        chrome.storage.session.set({ timerRunning: false });
        chrome.action.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
    }
        
});

chrome.runtime.onMessage.addListener((message) => {
    chrome.storage.session.set({ timerValue: message.timerform });
})



chrome.runtime.onMessage.addListener(async function(request) {
    if (request.startTimer) {
        
        chrome.storage.session.set({ timerRunning: true });
        chrome.action.setBadgeBackgroundColor({ color: [74, 0, 72, 39]});
        
        // using promises to get the timer value from our front end
        const res = await chrome.storage.session.get(["timerValue"]);

        var timer = parseInt(res.timerValue) * 60;
        
        // creating an interval to run our timer function that will in realtime set the new time every 1 second
        // we created the call back function 
        var intervalId = setInterval(function() {
            chrome.runtime.onMessage.addListener(function(request){
                if (!request.startTimer){
                    clearInterval(intervalId);
                    
                    chrome.storage.session.set({ timerRunning: false});
                    chrome.action.setBadgeText({ text: ''});
                }
            })
            
            timer--;
            var minutes = Math.floor(timer/60);
            var seconds = timer % 60;
            var text = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

            // for now keep this commented out

            // const finalTest = async () => {
            //     try {
            //         await chrome.runtime.sendMessage({ updateTimer: true, time: text });
                    
            //     } catch (error) {
            //         console.log("hate this -> " + error);
            //     }
            // }
            
            // finalTest();
            
            
            chrome.action.setBadgeText({ text: text });
            if (timer === 0) {
                clearInterval(intervalId);
                chrome.windows.create({
                    'url': 'alert.html',
                    'type': 'popup',
                    'width': 250,
                    'height': 250
                });
                chrome.storage.session.set({ timerRunning: false});
                chrome.action.setBadgeText({ text: ''});
                chrome.action.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
                // this is tied to above bug same shit
                // chrome.runtime.sendMessage({ updateTimer: false, time: '0:00' });
            }
            
            
        }, 1000 );
    } 
    
    else if (request.restartTimer){
        chrome.storage.session.set({ timerRunning: false });
        
        // chrome.runtime.sendMessage({ startTimer: true });
    } 

});
