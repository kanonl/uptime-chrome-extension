document.addEventListener('DOMContentLoaded', function () {

	chrome.storage.sync.get(function (storage) {
		var accountSpecificAPIKey = document.querySelector('#accountSpecificAPIKey');
		var monitorInterval = document.querySelector('#monitorInterval');
		var alltimeuptimeratio = document.querySelector('#alltimeuptimeratio');
		var responsetime = document.querySelector('#responsetime');
		var logo = document.querySelector('#logo');

		accountSpecificAPIKey.value = storage.APIKey || '';
		monitorInterval.value = storage.monitorInterval || '';
		alltimeuptimeratio.checked = storage.alltimeuptimeratio;
		responsetime.checked = storage.responsetime;
		logo.checked = storage.logo;
	});

});

document.querySelector('form').addEventListener('submit', function (e) {

	e.preventDefault();

	var accountSpecificAPIKey = document.querySelector('#accountSpecificAPIKey').value.trim();
	var monitorInterval = document.querySelector('#monitorInterval').value.trim();
	var alltimeuptimeratio = document.querySelector('#alltimeuptimeratio').checked;
	var responsetime = document.querySelector('#responsetime').checked;
	var logo = document.querySelector('#logo').checked;

	monitorInterval = parseInt(monitorInterval);

	if (accountSpecificAPIKey && monitorInterval) {
		chrome.storage.sync.set({
			'APIKey': accountSpecificAPIKey,
			'monitorInterval': monitorInterval,
			'alltimeuptimeratio': alltimeuptimeratio,
			'responsetime': responsetime,
			'logo': logo
		}, function () {

			chrome.alarms.clear('uptimerobot', function (wasCleared) {
				chrome.alarms.create('uptimerobot', {
					when: Date.now() + monitorInterval * 60000,
					periodInMinutes: monitorInterval
				});
			});

			var status = document.querySelector('#status');
			status.style.display = 'block';
			setTimeout(function () {
				status.style.display = 'none';
			}, 2000);
		});
	}
});

document.querySelector('#btnReset').addEventListener('click', function (e) {

	e.preventDefault();

	chrome.storage.sync.getBytesInUse(function (bytesInUse) {
		chrome.storage.sync.clear(function () {
			console.log('%s bytes cleared', bytesInUse);
		});
	});

});