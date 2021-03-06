'use strict';

const apiKey = 'fhUAhUKEXcbCy5A8RtsmVQCC7tmRDtyCx9ujlA8h'; 

const searchURL = 'https://developer.nps.gov/api/v1/';

// function to format the search parameters for API
function formatSearchParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

// create address template for parks, taking into account if there is no address in the responseJson data
function addressTemplate(data) {
  let line1 = '';
  let city = '';
  let stateCode = '';
  let postalCode = '';

  if (data.addresses.length > 0) {
    line1 = data.addresses[0].line1;
    city = data.addresses[0].city;
    stateCode = data.addresses[0].stateCode;
    postalCode = data.addresses[0].postalCode;
  } else {
    return `
      <p>There is no address to display for this park.</p>
    `
  }

  return (
    `<h4 class="address">Address:</h4>
    <ul class="address-list">
    <li>${line1}</li>
    <li>${city}, ${stateCode} ${postalCode}</li>
    </ul>`
  )
}


// HTML to render in DOM to display all parks with their info, and the "show campgrounds" button below each park
function displayParksResults(responseJson) {
  $('#results-list').empty();

  // total parks to display from API
  $('#search-header').html(`<p id="total-parks">Total Parks: ${responseJson.total}</p>`);

  for (let i = 0; i < responseJson.data.length; i++) {
  $('#results-list').append(
      `<section class="park-list">
        <li>
          <h3><a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].fullName}</a></h3>
          <h4 class="park-num">Park ${i+1} of ${responseJson.data.length}</h4>
          <p>${responseJson.data[i].description}</p>
          </li>

          ${addressTemplate(responseJson.data[i])}
            
          <button type="button" class="camp-btn" value="${responseJson.data[i].parkCode}">Show Campgrounds</button>
            
          <p id="camps-err-message-${responseJson.data[i].parkCode}" class="error-message"></p>

          <section id="campgrounds-${responseJson.data[i].parkCode}" class="hidden">
            <h3 id="camps-list-header-${responseJson.data[i].parkCode}" class="hidden camp-header">Campgrounds List:</h3>
            <ul id="camps-list-${responseJson.data[i].parkCode}">
            </ul>
          </section>
      </section>
        `);
    };
  $('#results').removeClass('hidden');
  handleCampBtn();
  handleScrollToTopBtn();
}

// HTML to render in DOM to display all campgrounds info corresponding to each park (display underneath park info)
function displayCampgrounds(responseJson, parkCode) {

  let total = responseJson.total;

  if (total === "0") {
    let noCamps = '';
      noCamps = `<p class="no-camps" class="hidden">Sorry, there are no campgrounds in this park. Please try a different park!</p>`;
      $(`#camps-list-${parkCode}`).html(
        `<li>${noCamps}</li>`
      );
      $('.no-camps').removeClass('hidden');
      $(`#camps-list-header-${parkCode}`).addClass('hidden');
    } else {
      $(`#camps-list-header-${parkCode}`).removeClass('hidden');
    };

  for (let i = 0; i < responseJson.data.length; i++) {

    $(`#camps-list-${parkCode}`).append(
      `<li>
        ${responseJson.data[i].url !== '' ? `<h3><a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].name}</a></h3>` : `<h3>${responseJson.data[i].name}</h3>`}
        <h4 class="num-of-campgrounds">Campground ${i+1} of ${responseJson.data.length}</h4>
        <div class="img-container">
          ${responseJson.data[i].images.length > 0 ? `<img class="camp-img" src="${responseJson.data[i].images[0].url}" alt="${responseJson.data[i].images[0].altText}">` : `<img class="no-image" src="images/no-image-available-icon.jpg" alt="no image available">`}
        </div>
        <h4>Description:</h4>
          <p>${responseJson.data[i].description}</p> 
        <h4>Total Campsites: </h4> 
          <p>${responseJson.data[i].campsites.totalSites}</p>
        <h4>Directions Information:</h4>
          ${responseJson.data[i].directionsOverview !== '' ? `<p>${responseJson.data[i].directionsOverview}</p>` : `<p>No directions information available.</p>`}
        <h4>Reservation Information:</h4>
          ${responseJson.data[i].reservationInfo !== '' ? `<p>${responseJson.data[i].reservationInfo}</p>` : `<p>No reservation information available.</p>`}
      </li>`
    );
  };
  $(`#campgrounds-${parkCode}`).removeClass('hidden');
}

// format parks URL from API, takes in search parameters
function getParks(stateCode, searchTerm) {
  const params = {
    api_key: apiKey,
    stateCode: stateCode
  };

  // if search term is not empty, include that as a parameter
  if (searchTerm !== '') {
    params.q = searchTerm;
  }

  const queryString = formatSearchParams(params)

  let parksUrl = searchURL + 'parks?' + queryString;

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
  $('#results').removeClass('hidden');
}


// get campgrounds information from camps API 
function getCampgrounds(parkCode) {
  const campParams = {
    api_key: apiKey,
    parkCode: parkCode,
  };

  const campQueryString = formatSearchParams(campParams)

  let campsUrl = searchURL + 'campgrounds?' + campQueryString;

  fetch(campsUrl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayCampgrounds(responseJson, parkCode))
    .catch(err => {
      $(`#camps-err-message-${parkCode}`).text(`Something went wrong: ${err.message}`)
    })
}

// handle "show campgrounds" button click
function handleCampBtn() {
  $('.camp-btn').one('click', function(event) {
    const parkCode = $(this).attr("value");

    getCampgrounds(parkCode);
    toggleCampgrounds(parkCode);
    $(event.currentTarget).text('Hide Campgrounds');
  });
}

function toggleCampgrounds(parkCode) {
  $('.camp-btn[value='+parkCode+']').on('click', function(event) {
    
    if ($(`#campgrounds-${parkCode}`).hasClass('hidden')) {
      $(`#campgrounds-${parkCode}`).removeClass('hidden');
      $(event.currentTarget).text('Hide Campgrounds');
    } else {
      $(`#campgrounds-${parkCode}`).addClass('hidden');
      $(event.currentTarget).text('Show Campgrounds');
    }
  })
}

// hide or show scroll to top button
function handleScrollToTopBtn() {
  $(window).scroll(function() {
    if ($(this).scrollTop() > 300) {
      $('#scroll-to-top-btn').show();
    } else {
      $('#scroll-to-top-btn').hide();
    }
  });
}

// handle form submission (Show Parks)
function handleForm() {
  $('form').submit(event => {
    event.preventDefault();
    const stateCode = $('#js-states-list').val();
    const searchTerm = $('#search-term').val().toLowerCase();
    getParks(stateCode, searchTerm);
  });
}

function scrollToTopBtnClick() {
  $('#scroll-to-top-btn').on('click', event => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  })
}

// call back function
$(function() {
  scrollToTopBtnClick();
  handleForm();
})