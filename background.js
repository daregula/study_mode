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
            const current_url = 'https://'+message.user_url           
            console.log(current_url);
            chrome.windows.create({
                'url': 'add_url.html',
                'type': 'popup',
                'width': 250,
                'height': 250
            });
            chrome.runtime.onMessage.addListener((message) => {
                if (message.popUpOpen){
                    chrome.runtime.sendMessage({ display_url: true, current_url: current_url })
                }
            })
            
        }
    } catch (error) {
        console.log(error);
    }
})
//grabbing all of the days data and saving it to local storage
// need to structure the days data and tie it to a url
chrome.runtime.onMessage.addListener(async (message) => {
    try {
        if(message.res_day_data){
            let bs = await chrome.storage.local.get(['urls'])
            bs.urls.push(
                {
                    address: message.user_url,
                    toOpen: message.day_data
                }
            )
            await chrome.storage.local.set({ urls: bs.urls })
            const updatedArr = await chrome.storage.local.get(['urls'])
            console.log(updatedArr.urls);
            

        }
    } catch (error) {
        
    }
});

/* create a function that will validate the urls depending on our current date time
 if valid then we append to an array that we will then map through to create tabs from it
 current stored urls structure
 urls = [
    {
        address: 'url',
        toOpen: 
        {
            day_of_the_week(mon): 
            {
                startTime: '12:00',
                endTime: '14:00'
            },
            day_of_the_week(wed): 
            {
                startTime: '15:00',
                endTime: '18:00'
            }
        }
    }
 ]
 
*/ 
const validateURLs = async () => {
    const updatedArr = await chrome.storage.local.get(['urls']);
    const date = new Date();
    const day = date.toDateString().slice(0,3).toLowerCase();
    const hour = date.getHours();
    const min = date.getMinutes();

    const current_time = hour * 60 + min;

    let validUrls = [];
    updatedArr.urls.map((urlOBJ) => {
        if (urlOBJ.toOpen.hasOwnProperty(day)){
            const current_start_time = Number(urlOBJ.toOpen[day].start_time.slice(0,2)) * 60 + Number(urlOBJ.toOpen[day].start_time.slice(3,5));

            const current_end_time = Number(urlOBJ.toOpen[day].end_time.slice(0,2)) * 60 + Number(urlOBJ.toOpen[day].end_time.slice(3,5));

            if (
                (current_start_time <= current_end_time && current_time >= current_start_time && current_time <= current_end_time) ||
                (current_start_time > current_end_time && (current_time >= current_start_time || current_time <= current_end_time))
            )
            {
                validUrls.push(urlOBJ.address);
            }
        } 
    });

    await chrome.storage.local.set({ valid_urls: validUrls})
    
} 

chrome.runtime.onMessage.addListener(async (message) => {
    try {
        if (message.openTab){
        // check if they have saved anything to local storage
        async function checkUrls(){
            const userSavedUrls = await chrome.storage.local.get(['valid_urls'])
            console.log(userSavedUrls.valid_urls);
            return userSavedUrls.valid_urls.length != 0 && userSavedUrls.valid_urls != undefined ? 
            { 
                status: true,
                urls: userSavedUrls.valid_urls 
            } : false

        }
        
        // now we need to map through the urls and create a url tab for each one
        await validateURLs();
        const hasURls = await checkUrls();
        // map through our urls that are saved in local storage
        if (hasURls.status){
            hasURls.urls.map((url) => {
                chrome.tabs.create({
                    url: `${url}`
                }) 
            })            
        }
        else {
            chrome.runtime.sendMessage({ url_msg: true, hasUrls: hasURls, test: true })
        }
        
        }
    } catch (error) {
        console.log(error);
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
chrome.runtime.onMessage.addListener(async (message) => {
    try {
        if (message.confirm_delete) {
            const url_ID = message.remove_url;
            console.log(url_ID);
            const urls = (await chrome.storage.local.get(['urls'])).urls
            urls.splice(url_ID, 1)
            await chrome.storage.local.set({ urls: urls })
            const updatedArr = await chrome.storage.local.get(['urls'])
            console.log("new arr: "+updatedArr.urls);
        }
    } catch (error) {
        console.log(error);
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

            // dont think ill ever need below code but gonna keep for now
            // will reset the timer anytime any other message is recieved
            chrome.runtime.onMessage.addListener((request) => {
                if (request.stopTimer){
                    clearInterval(intervalId);
                    
                    chrome.storage.session.set({ timerRunning: false});
                    chrome.action.setBadgeText({ text: ''});

                }
            })
            
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
                chrome.storage.session.set({ timerRunning: false});
                chrome.action.setBadgeText({ text: ''});
                chrome.action.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
                
            }
            
            
        }, 1000 );
    } 
    
    else if (request.restartTimer){
        chrome.storage.session.set({ timerRunning: false });        
    } 
    
});
