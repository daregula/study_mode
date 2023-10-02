document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('startTimer').addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({ startTimer: true });
            window.close()
        });
    });
    
    document.getElementById('stopTimer').addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function() {
            chrome.runtime.sendMessage({ startTimer: false });
            window.close();
        })
    });

});

