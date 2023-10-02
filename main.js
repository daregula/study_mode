document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('startTimer').addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({ startTimer: true });
            window.close()
        });
    });
    
    document.getElementById('stopTimer').addEventListener('click', (event) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (event) => {
            chrome.runtime.sendMessage({ startTimer: false });
            window.close();
        })
    });

    // grabbing changes from the timer form and passing them to the chrome storage api
    document.getElementById('timerform').addEventListener('submit', (event) => {
        event.preventDefault();
        const timevalue = document.getElementById('time').value;
        chrome.runtime.sendMessage({ 'timerform': timevalue });
        window.close();
    })

});

