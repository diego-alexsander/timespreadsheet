
/**
* Check if current user has authorized this application.
*/
function checkAuth() {
		console.log('000');

	gapi.auth.authorize(
	{	
		'client_id': CLIENT_ID,
		'scope': SCOPES.join(' '),
		'immediate': true
	}, handleAuthResult);
}

/**
* Handle response from authorization server.
*
* @param {Object} authResult Authorization result.
*/
function handleAuthResult(authResult) {
	var authorizeDiv = document.getElementById('authorize-div');
	if (authResult && !authResult.error) {
// Hide auth UI, then load client library.
authorizeDiv.style.display = 'none';
loadSheetsApi();
} else {
// Show auth UI, allowing the user to initiate authorization by
// clicking authorize button.
authorizeDiv.style.display = 'inline';
}
}

/**
* Initiate auth flow in response to user clicking authorize button.
*
* @param {Event} event Button click event.
*/
function handleAuthClick(event) {
	gapi.auth.authorize(
		{client_id: CLIENT_ID, scope: SCOPES, immediate: false},
		handleAuthResult);
	return false;
}
/**
* Load Sheets API client library.
*/
function loadSheetsApi() {

	var discoveryUrl =
	'https://sheets.googleapis.com/$discovery/rest?version=v4';
	gapi.client.load(discoveryUrl).then(listMajors);
}

/**
* Print the names and majors of students in a sample spreadsheet:
* https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
*/
function listMajors() {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: '1iIcuhbi5jJ1ZBw9-HJqo1GrSoCYx4TbQCp84-XcoFfM',
		range: 'F:J',
		valueRenderOption: 'UNFORMATTED_VALUE'
// range: 'Backlog!F2:G',
}).then(function(response) {
	var range = response.result;
	createTitles(range);
}, function(response) {
	appendPre('Error: ' + response.result.error.message);
});
}

/**
* Append a pre element to the body containing the given message
* as its text node.
*
* @param {string} message Text to be placed in pre element.
*/
function createTitles(titles) {
	var listTitles = document.getElementById('listTitles');
	var listTasks = document.getElementById('list-tasks');
	var item = document.createElement('li');


	if (titles.values.length > 0) {
		var header = titles.values[0];

		// listTitles.innerHTML = '<li>'+ '<div>' + titles.values[0][1] + '</div>' + '<div>' + titles.values[0][2] + '</div>' + '<div>' + titles.values[0][3] + '</div>' + '<div>' + titles.values[0][4] + '</div>' + '</li>';

		for (i = 1; i < titles.values.length; i++) {
			listTasks.innerHTML += '	<article class="task" id="'+ titles.values.length +'"> <section class="header"> <div class="status"> status: <strong class="current"> '+ titles.values[i][4] +'</strong> </div> <div class="owner"> responsável: <strong class="current">'+ titles.values[i][3] +'</strong> </div> </section> <section class="content"> <h1 class="title"> '+ titles.values[i][0] +'</h1> <a href="#!" class="btn-start"> Iniciar </a> <a href="#!" class="btn-end is-hide"> Finalizar tarefa </a> </section> </article>';
		}

	}
}

function saveTime(spreadsheetId, task, start, end) {
	return gapi.client.sheets.spreadsheets.values.append({
		spreadsheetId,
		valueInputOption: 'USER_ENTERED',
		range: 'Timesheet!A2:C',
		values: [
		[task, start, end]
		],
	}).then(function(response) {
		console.log(response);
	}, function(response) {
		console.log('Error: ' + response.result.error.message);
	});
}

$(document).ready(function($) {

	$('body').on('click', 'a', function(event) {
		event.preventDefault();
		var taskId = $(event.target).attr('data-task');
		var taskName = $('#'+ taskId).text();
		localStorage.setItem('taskName', taskName);
		$("#modal").iziModal({
			width: 500
		});

	});
});

$(document).on('opened', '#modal', function (e) {
	$('body').on('click', '#btn-envia-task', function(event) {
		event.preventDefault();
		var taskName = localStorage.getItem('taskName');
		var start = $('#inp-start').val();
		var end = $('#inp-end').val();

		saveTime('1iIcuhbi5jJ1ZBw9-HJqo1GrSoCYx4TbQCp84-XcoFfM', taskName, start, end);
	});
});