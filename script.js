'use strict';

const apiKey = 'fhUAhUKEXcbCy5A8RtsmVQCC7tmRDtyCx9ujlA8h'; 

const searchURL = 'https://developer.nps.gov/api/v1/';

// all state codes to ensure user enters a valid state code
const stateCodes = [
"al", "ak", "az", "ar", "ca", "co", "ct", "de", "dc", "fl", "ga", "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd", "oh", "ok" ,"or", "pa", "ri", "sc", "sd", "tn", "ut", "vt", "wa", "wi", "wy"
];

// function to format the search parameters for API
function formatSearchParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

// HTML to render in DOM to display all parks with their info, and the "show campgrounds" button
function displayParksResults(responseJson, parkCode) {
  $('#results-list').empty();

  console.log(responseJson);

  // display how many parks total from API
  $('#search-header').append(`<p id="total-parks">Total Parks: ${responseJson.total}</p>`);

  // loop through response data to get info about each park
  for (let i = 0; i < responseJson.data.length; i++) {
  $('#results-list').append(
      `<li>
      <h3><a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].fullName}</a></h3>
      <p>${responseJson.data[i].description}</p>
      </li>

        <h3 class="address">Address:</h3>
        <li>${responseJson.data[i].addresses[0].line1}</li>
        <li>${responseJson.data[i].addresses[0].city}, ${responseJson.data[i].addresses[0].stateCode} ${responseJson.data[i].addresses[0].postalCode}</li>
        
        <button type="button" class="camp-btn" value="${responseJson.data[i].parkCode}">Show Campgrounds</button>
        
        <p id="camp-err-message" class="error-message"></p>

        <section id="campgrounds-${responseJson.data[i].parkCode}" class="hidden">
          <h3 id="camps-list-header" class="hidden">Campgrounds List:</h3>
          <ul id="camps-list-${responseJson.data[i].parkCode}">
          </ul>
        </section>`);
    };
  $('#results').removeClass('hidden');
  handleCampBtn();
};

// HTML to render in DOM to display all campgrounds info corresponding to each park (display underneath park info)
function displayCampgrounds(responseJson, parkCode) {
  console.log(`displayCampgrounds ran`);
  console.log(responseJson);

    let total = responseJson.total;

    console.log(total);

    if (total === "0") {
    let noCamps = '';
      noCamps = `<p class="no-camps" class="hidden">Sorry, there are no campgrounds in this park. Please try a different park!</p>`;
      $(`#camps-list-${parkCode}`).append(
        `<li>${noCamps}</li>`
      );
      $('.no-camps').removeClass('hidden');
      $('#camps-list-header').addClass('hidden');
    };

    // loop through campgrounds data and render info in DOM
  for (let i = 0; i < responseJson.data.length; i++) {
    
      // console.log(i+1);

      $(`#camps-list-${parkCode}`).append(
        `<li>

          <h3><a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].name}</a></h3>

          <p class="num-of-campgrounds">Campground ${i+1} of ${responseJson.data.length}</p>

          <img class="camp-img" src="${responseJson.data[i].images[0].url}" alt="${responseJson.data[i].images[0].altText} width="300" height="300">

          <h4>Description:</h4>
            <p>${responseJson.data[i].description}</p>
          <h4>Directions Information:</h4>
            <p>${responseJson.data[i].directionsOverview}</p>

          <h4>Total Campsites: </h4> 
            <p>${responseJson.data[i].campsites.totalSites}</p>

        </li>`
      );
    };
  $(`#campgrounds-${parkCode}`).removeClass('hidden');
  $('#camps-list-header').removeClass('hidden');
};

// format parks URL from API, takes in search parameters
function getParks(stateCode, searchTerm, limit) {
  const params = {
    api_key: apiKey,
    limit: limit,
    stateCode: stateCode
  };

  // if search term is not empty, include that as a parameter
  if (searchTerm !== '') {
    params.q = searchTerm;
  }

  const queryString = formatSearchParams(params)

  let parksUrl = searchURL + 'parks?' + queryString;

   console.log(parksUrl); 

  //  check if state code entered is valid (compare to stateCodes array)
  if (stateCodes.includes(stateCode)) {
    fetch(parksUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayParksResults(responseJson))
      .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      });
    $('.invalid-code').hide();
    $('#results').removeClass('hidden');
  } else {
    $('.invalid-code').append(`</p>Please choose a valid two-character state code and try again! Refer to <a href="https://abbreviations.yourdictionary.com/articles/state-abbrev.html" target="_blank">this list</a> for all US state codes.</p>`);
    $('#results').addClass('hidden');
};
}

// get campgrounds information from API
function getCampgrounds(parkCode) {
  const campParams = {
    api_key: apiKey,
    parkCode: parkCode,
  };

  const campQueryString = formatSearchParams(campParams)

  let campsUrl = searchURL + 'campgrounds?' + campQueryString;

  console.log(campsUrl);

  fetch(campsUrl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayCampgrounds(responseJson, parkCode))
    .catch(err => {
      $('#camps-err-message').text(`Something went wrong: ${err.message}`)
    })
}

// handle "show campgrounds" button click
function handleCampBtn() {
  $('.camp-btn').on('click', function() {
    const parkCode = $(this).attr("value");

    console.log(parkCode);

    getCampgrounds(parkCode);
  });
}

// handle form submission (Show Parks button)
function handleForm() {
  $('form').submit(event => {
    event.preventDefault();

    const stateCode = $('#js-state-code').val();

    const searchTerm = $('#js-search-term').val();

    const limit = $('#js-max-results').val();

    getParks(stateCode, searchTerm, limit);
  });
}

// call back function
$(function() {
  console.log('App has loaded. Waiting for click!');
  handleForm();
});

// There needs to be #camps_lists section near each button in parks result list, but it needs named something like #camps_lists1 or #camps_list_yellowstone

// then append to that one when that park's button is clicked

// Well, you have a choice - only one section in the html to display results

// or a section with each park that is added to the dom in displayParksResults

// I think one global campground section would be fine if you put it over on the left or right side

// so that it is visible

// and then have your displaycampgrounds function modify that section's html instead of appending ot it so that the previous campground data is overwritten

// under the button, put an html section whose id is something like camps_list_parkcode, where the parkcode is the actual parkcode

// then have getCampgrounds also pass the parkCode as a parameter to displayCampgrounds

// In displayCampgrounds append to / overwrite the html of camps_list_parkcode

// So once you get that park code, you can use it to identify the `<li>` that the whole park is being wrapped inside.

// So then you should have constructed the `<li>` for each park as `<li id=<park code> />`

// and then use $('park code') to location that <li>

// and then append the campground info there.