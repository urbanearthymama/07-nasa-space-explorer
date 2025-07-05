// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA APOD API endpoint and demo key
const apiUrl = 'https://api.nasa.gov/planetary/apod';
// Use your provided API key for more requests
const apiKey = 'EeQMv60iH1yDY9rRC1dqGDbuTAn2hypvUlweOWTs';

// Listen for button click to fetch images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Only fetch if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  // Build the API URL with the selected dates
  const url = `${apiUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  // Show loading message
  gallery.innerHTML = '<p>Loading images...</p>';

  // Fetch data from NASA's APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // If only one result, make it an array for consistency
      const images = Array.isArray(data) ? data : [data];

      // Clear the gallery
      gallery.innerHTML = '';

      // If no images, show a message
      if (images.length === 0) {
        gallery.innerHTML = '<p>No images found for this date range.</p>';
        return;
      }

      // Loop through each image and add to the gallery
      images.forEach(item => {
        // Only show if media_type is 'image'
        if (item.media_type === 'image') {
          // Create a div for each gallery item
          const div = document.createElement('div');
          div.className = 'gallery-item';
          // Add image and title/explanation
          div.innerHTML = `
            <img src="${item.url}" alt="${item.title}" />
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
            <p>${item.explanation}</p>
          `;
          gallery.appendChild(div);
        }
      });

      // If no images were added (e.g., only videos), show a message
      if (!gallery.hasChildNodes()) {
        gallery.innerHTML = '<p>No image results for this date range.</p>';
      }
    })
    .catch(error => {
      gallery.innerHTML = '<p>Error fetching images. Please try again later.</p>';
      console.error('Error fetching data from NASA API:', error);
    });
});
