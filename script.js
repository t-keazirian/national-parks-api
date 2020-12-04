'use strict';

const apiKey = 'fhUAhUKEXcbCy5A8RtsmVQCC7tmRDtyCx9ujlA8h'; 

const searchURL = 'https://developer.nps.gov/api/v1/parks';

function formatSearchParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
// empty results area
  $('#results-list').empty();
// iterate through the response data array and display the object values for each key indicated
  for (let i = 0; i < responseJson.data.length; i++) {
    $('#results-list').append(
      `<li>
      <h3><a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].fullName}</a></h3>
      <p>${responseJson.data[i].description}</p>
      </li>

        <h3>Address:</h3>

        <p>${responseJson.data[i].addresses[0].line1}</p>
        <p>${responseJson.data[i].addresses[0].line2}</p>
        <p>${responseJson.data[i].addresses[0].line3}</p>
        <p>${responseJson.data[i].addresses[0].city}, ${responseJson.data[i].addresses[0].stateCode}</p>
        <p>${responseJson.data[i].addresses[0].postalCode}</p>`);
      
    };
  $('#results').removeClass('hidden');
  $('#address').removeClass('hidden');
};

function getParks(stateCode, searchTerm, limit) {
  let formattedState = stateCode.replace(/\s/g, '');
  let stateArr = formattedState.split(',');

  console.log(stateArr);

  const params = {
    api_key: apiKey,
    limit: limit
  };

  if (searchTerm !== '') {
    params.q = searchTerm;
  }

  const queryString = formatSearchParams(params)

  let url = searchURL + '?' + queryString;

    stateArr.map(state => {
      url += `&stateCode=${encodeURIComponent(state)}`;
    });

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function handleForm() {
  $('form').submit(event => {
    event.preventDefault();

    const stateCode = $('#js-state-code').val();

    const searchTerm = $('#js-search-term').val();

    const limit = $('#js-max-results').val();

    getParks(stateCode, searchTerm, limit);
  });
}

$(function() {
  console.log('App has loaded. Waiting for click!');
  handleForm();
});