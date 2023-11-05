chrome.storage.local.clear();
const checkStorage = async () => {
    try {
        const newStruct_isAlive = await chrome.storage.local.get(['urls_obj'])
        
        // this is our new struct that we are creating in parallel to our old struct
        if (newStruct_isAlive.urls_obj === undefined || newStruct_isAlive.urls_obj == {}){
            await chrome.storage.local.set({ urls_obj : {} }, (() => {
                console.log("local url obj storage space is allocated");
            }))
        }
        else {
            const stored_urls = await chrome.storage.local.get(['urls_obj'])
            console.log("current stored urls: " + stored_urls.urls_obj);
        }
    } catch (error) {
        console.log(error);
    }
}
checkStorage();
// retrieving a message saying open tab true to see if we can open a tab with the chrome api     
chrome.runtime.onMessage.addListener(async (message) => {
    try {
        if (message.toOpen || message.edit_url){
            const current_url = message.user_url           
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
                        
            // the struct in parallel starts here
            let updated_urls_obj = await chrome.storage.local.get(['urls_obj']);

            updated_urls_obj.urls_obj[message.user_url] = 
            {
                address: message.user_url,
                toOpen: message.day_data
            }
            await chrome.storage.local.set({ urls_obj: updated_urls_obj.urls_obj });
            updated_urls_obj = await chrome.storage.local.get(['urls_obj']);

            console.log(updated_urls_obj.urls_obj);
            const focused_window = await chrome.windows.getLastFocused();
            chrome.windows.remove(focused_window.id);
        }
    } catch (error) {
        
    }
});

/* create a function that will validate the urls depending on our current date time
 if valid then we append to an array that we will then map through to create tabs from it
 current stored urls structure
 urls = {
        'url': 
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
    }
 
*/ 
const validateURLs = async () => {
    // in parallel new struct 

    const updated_urls_obj = await chrome.storage.local.get(['urls_obj']);
    // between these comments

    const date = new Date();
    const day = date.toDateString().slice(0,3).toLowerCase();
    const hour = date.getHours();
    const min = date.getMinutes();

    const current_time = hour * 60 + min;

    //here we are essentially doing the same thing above but restructuring it to loop through 
    //our new structure instead of just an array 
    let obj_validUrls = [];
   
    for (const key in updated_urls_obj.urls_obj) {

        if (updated_urls_obj.urls_obj[key].toOpen.hasOwnProperty(day)){
            const current_start_time = Number(updated_urls_obj.urls_obj[key].toOpen[day].start_time.slice(0,2)) * 60 + Number(updated_urls_obj.urls_obj[key].toOpen[day].start_time.slice(3,5));
            
            const current_end_time = Number(updated_urls_obj.urls_obj[key].toOpen[day].end_time.slice(0,2)) * 60 + Number(updated_urls_obj.urls_obj[key].toOpen[day].end_time.slice(3,5));

            if (
                (current_start_time <= current_end_time && current_time >= current_start_time && current_time <= current_end_time) ||
                (current_start_time > current_end_time && (current_time >= current_start_time || current_time <= current_end_time))
            )
            {
                obj_validUrls.push(key);
            }

        }
    }
    // 
    await chrome.storage.local.set({ obj_validUrls: obj_validUrls})

} 

chrome.runtime.onMessage.addListener(async (message) => {
    try {
        if (message.openTab){
        // check if they have saved anything to local storage
        async function checkUrls(){
            
            const obj_userSavedUrls = await chrome.storage.local.get(['obj_validUrls'])

            console.log(obj_userSavedUrls.obj_validUrls, " from new ");
            
            return obj_userSavedUrls.obj_validUrls.length != 0 && obj_userSavedUrls.obj_validUrls != undefined ? 
            { 
                status: true,
                urls: obj_userSavedUrls.obj_validUrls
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

chrome.runtime.onMessage.addListener( async (message) => {
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

            const urls_obj = (await chrome.storage.local.get(['urls_obj'])).urls_obj
            console.log("Before ",urls_obj);
            delete urls_obj[url_ID];
            await chrome.storage.local.set({ urls_obj: urls_obj });
            console.log("after ",urls_obj);
            chrome.runtime.sendMessage({ url_list_status: true });
                        
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

chrome.runtime.onMessage.addListener(async function(request) {
    const timerStat = await chrome.storage.session.get(['timerRunning']);
    let resumeTime = request.timerform

    const isPaused = await chrome.storage.session.get(['pauseTimer']);
    
    if (request.startTimer && resumeTime > 0 && !timerStat.timerRunning) {

        if (isPaused.pauseTimer === true){
            const pausedAt = await chrome.storage.session.get(['pauseValue']);
            resumeTime = pausedAt.pauseValue / 60;
            chrome.storage.session.set({ pauseTimer: false });
        }
        chrome.storage.session.set({ timerRunning: true });
        chrome.action.setBadgeBackgroundColor({ color: [74, 0, 72, 39]});
        
        
        var timer = resumeTime * 60;
        
        // creating an interval to run our timer function that will in realtime set the new time every 1 second
        // we created the call back function 
        var intervalId = setInterval(function() {
            // dont think ill ever need below code but gonna keep for now
            // will reset the timer anytime any other message is recieved
            timer--;
            var minutes = Math.floor(timer/60);
            var seconds = timer % 60;
            var text = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

            chrome.runtime.onMessage.addListener((request) => {
                if (request.stopTimer){
                    clearInterval(intervalId);
                    
                    chrome.storage.session.set({ timerRunning: false});
                    chrome.storage.session.set({ pauseTimer: false });
                    chrome.action.setBadgeText({ text: ''});

                }
            });
            console.log(timer);
            chrome.runtime.onMessage.addListener((message) => {
                if (message.pauseTimer){
                    clearInterval(intervalId);
                    
                    chrome.storage.session.set({ pauseTimer: true, pauseValue: timer, timerRunning: false })
                    chrome.action.setBadgeText({ text: text })
                }
            });
            

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
    
});
