document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('startTimer').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            chrome.runtime.sendMessage({ startTimer: true });
            
        });
    });
    
    document.getElementById('stopTimer').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            chrome.runtime.sendMessage({ startTimer: false });
            window.close();
        })
    });

    // grabbing changes from the timer form and sending a message over to through our runtime interface
    document.getElementById('timerform').addEventListener('submit', (event) => {
        event.preventDefault();
        const timevalue = document.getElementById('time').value;
        chrome.runtime.sendMessage({ 'timerform': timevalue });
        
    });

    // our countdown timer that shows up in the front end of the extension
        
    chrome.runtime.onMessage.addListener((req) => {
        if (req.updateTimer){
            document.getElementById('runningTimer').innerHTML = req.time
        }
        
    })    


});
