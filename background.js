// this function is listening in on the status of the timer while the tabs are active and when it "hears" that the timer has a status of "expired" it will change its color
// const testing = async () => {
//     try {
//         // this is storing in local storage
//         await chrome.storage.local.set({ test: 'this is a test ' }, (() => {
//             console.log('value is set');
//         }));
        
//         // this is retrieving in local storage
//         const bs = await chrome.storage.local.get(['test'])

//         // this is removing in local storage
//         chrome.storage.local.remove(['test'], (() => {
//             console.log('value '+ bs.test +' is removed');
//         }));


//     } catch (error) {
//         console.error();
//     }
// }
// testing();
const checkStorage = async () => {
    try {
        const isAlive = await chrome.storage.local.get(['urls'])

        if (isAlive === undefined || isAlive == {}){
            await chrome.storage.local.set({ urls: [] }, (() => {
                console.log("local url storage space is allocated");
            }));
        }
    } catch (error) {
        console.log(error);
    }
}
checkStorage();

try {
    chrome.runtime.onMessage.addListener(async (message) => {
        // await chrome.storage.local.get()
    })
} catch (error) {
    console.error();
}



// retrieving a message saying open tab true to see if we can open a tab with the chrome api

chrome.runtime.onMessage.addListener((message) => {
    if (message.openTab){
        chrome.tabs.create({
            url: 'https://www.youtube.com/'
        })
    }
})


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
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
