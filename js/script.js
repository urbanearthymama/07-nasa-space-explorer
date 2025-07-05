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

  // Show loading message before images load
  gallery.innerHTML = '<p>🔄 Loading space photos…</p>';

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
        // Show images
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
          // Add click event to open modal
          div.querySelector('img').addEventListener('click', () => {
            showModal(item.url, item.title, item.date, item.explanation, 'image');
          });
          gallery.appendChild(div);
        }
        // Show videos (e.g., YouTube)
        else if (item.media_type === 'video') {
          const div = document.createElement('div');
          div.className = 'gallery-item';
          // Check if it's a YouTube video
          let videoEmbed = '';
          if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
            // Embed YouTube video
            videoEmbed = `
              <div class="video-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin-bottom:10px;">
                <iframe src="${item.url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;"></iframe>
              </div>
            `;
          } else {
            // For other videos, provide a clickable link
            videoEmbed = `
              <a href="${item.url}" target="_blank" rel="noopener" style="display:block;color:#fc3d21;font-weight:bold;margin-bottom:10px;text-decoration:underline;">
                ▶ Watch Video
              </a>
            `;
          }
          div.innerHTML = `
            ${videoEmbed}
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
            <p>${item.explanation}</p>
          `;
          // Add click event to open modal with video
          div.addEventListener('click', () => {
            showModal(item.url, item.title, item.date, item.explanation, 'video');
          });
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

// Function to create and show the modal
// Add a new parameter: type ('image' or 'video')
function showModal(url, title, date, explanation, type = 'image') {
  // Find the modal elements
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitleDate = document.getElementById('modalTitleDate');
  const modalExplanation = document.getElementById('modalExplanation');
  // For video support, create or find a video container
  let modalVideo = document.getElementById('modalVideo');
  if (!modalVideo) {
    modalVideo = document.createElement('div');
    modalVideo.id = 'modalVideo';
    modalVideo.style.width = '100%';
    modalVideo.style.marginBottom = '12px';
    modalVideo.style.display = 'none';
    modalImg.parentNode.insertBefore(modalVideo, modalImg);
  }

  // Set the modal content based on type
  if (type === 'image') {
    modalImg.src = url;
    modalImg.alt = title;
    modalImg.style.display = '';
    modalVideo.style.display = 'none';
    modalVideo.innerHTML = '';
  } else if (type === 'video') {
    modalImg.style.display = 'none';
    // If YouTube, embed, else show link
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.includes('embed/')
        ? url
        : url.replace('watch?v=', 'embed/');
      modalVideo.innerHTML = `
        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;">
          <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;"></iframe>
        </div>
      `;
    } else {
      modalVideo.innerHTML = `
        <a href="${url}" target="_blank" rel="noopener" style="display:block;color:#fc3d21;font-weight:bold;text-decoration:underline;">
          ▶ Watch Video
        </a>
      `;
    }
    modalVideo.style.display = '';
  }

  modalTitleDate.textContent = `${title} (${date})`;
  modalExplanation.textContent = explanation;

  // Remove any previous large class
  modalImg.classList.remove('large-image');

  // Show the modal
  modal.style.display = 'flex';
  modal.focus();

  // Make sure the close "X" button is clickable to close the modal
  const closeBtn = document.getElementById('closeModal');
  closeBtn.onclick = hideModal;

  // Add event listener for Escape key and Tab key to close modal (each time modal opens)
  function escListener(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      hideModal();
    }
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      document.activeElement === closeBtn
    ) {
      hideModal();
    }
    if (event.key === 'Tab') {
      closeBtn.focus();
      event.preventDefault();
    }
  }
  document.addEventListener('keydown', escListener);

  // Store the listener so we can remove it later
  modal._escListener = escListener;
}

// Function to hide the modal
function hideModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
  // Remove Escape key listener when modal closes
  if (modal._escListener) {
    document.removeEventListener('keydown', modal._escListener);
    modal._escListener = null;
  }
}

// Fun "Did You Know?" space facts
const spaceFacts = [
  "Did you know? One million Earths could fit inside the Sun!",
  "Did you know? A day on Venus is longer than a year on Venus.",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has 95 known moons as of 2023.",
  "Did you know? Space is completely silent—there is no atmosphere to carry sound.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? The International Space Station travels at about 28,000 km/h.",
  "Did you know? Saturn could float in water because it is mostly made of gas."
];

// Function to show a random space fact
function showRandomFact() {
  const factSection = document.getElementById('spaceFact');
  // Pick a random fact from the array
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factSection.textContent = randomFact;
}

// Show a random fact when the page loads
document.addEventListener('DOMContentLoaded', () => {
  showRandomFact();
  const modal = document.getElementById('imageModal');
  const closeBtn = document.getElementById('closeModal');
  const modalImg = document.getElementById('modalImg');
  const modalContent = modal.querySelector('.modal-content');

  // Close when clicking the close button
  closeBtn.addEventListener('click', hideModal);

  // Also close when pressing Enter or Space on the close button (for accessibility)
  closeBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      hideModal();
    }
  });

  // Close when clicking outside the modal content
  modal.addEventListener('mousedown', (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });

  // Also close when double-clicking anywhere on the modal overlay
  modal.addEventListener('dblclick', (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });

  // Toggle image size when clicking the modal image
  modalImg.addEventListener('click', () => {
    modalImg.classList.toggle('large-image');
  });
});
