// Function to fetch and populate data
function fetchAndPopulateData(filePath) {
    fetch(filePath)
        .then(response => response.json())
        .then(carsData => {
            const brandsMenu = document.querySelector('#brands-menu ul');
            const modelsMenu = document.querySelector('#models-menu ul');
            const yearsMenu = document.querySelector('#years-menu ul');
            const gallery = document.querySelector('.gallery');
            let currentImages = []; // Store the current gallery images
            let currentIndex = 0; // Track the current image index

            // Clear previous menus and gallery
            brandsMenu.innerHTML = '';
            modelsMenu.innerHTML = '';
            yearsMenu.innerHTML = '';
            gallery.innerHTML = '';

            // Populate the brands menu
            const brands = [...new Set(Object.keys(carsData).map(key => key.split('/')[0]))];
            brands.forEach(brand => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = brand;
                a.addEventListener('click', () => {
                    populateModels(brand, carsData);
                    gallery.innerHTML = ''; // Clear gallery
                });
                li.appendChild(a);
                brandsMenu.appendChild(li);
            });

            // Populate the models menu based on the selected brand
            function populateModels(brand, carsData) {
                modelsMenu.innerHTML = ''; // Clear previous models
                const models = [...new Set(Object.keys(carsData)
                    .filter(key => key.startsWith(brand))
                    .map(key => key.split('/')[1]))];
                models.forEach(model => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = model;
                    a.addEventListener('click', () => {
                        populateYears(brand, model, carsData);
                    });
                    li.appendChild(a);
                    modelsMenu.appendChild(li);
                });
            }

            // Populate the years menu based on the selected brand and model
            function populateYears(brand, model, carsData) {
                yearsMenu.innerHTML = ''; // Clear previous years
                const years = [...new Set(Object.keys(carsData)
                    .filter(key => key.startsWith(`${brand}/${model}`))
                    .map(key => key.split('/')[2]))];
                years.forEach(year => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = year;
                    a.addEventListener('click', () => {
                        populateGallery(brand, model, year, carsData);
                    });
                    li.appendChild(a);
                    yearsMenu.appendChild(li);
                });
            }

            // Populate the gallery based on the selected brand, model, and year
            function populateGallery(brand, model, year, carsData) {
                gallery.innerHTML = ''; // Clear previous gallery

                // Get unique images for the selected brand, model, and year
                currentImages = [...new Set(
                    Object.keys(carsData)
                        .filter(key => key.startsWith(`${brand}/${model}/${year}`))
                        .map(key => carsData[key])
                )];

                currentImages.forEach((imageUrl, index) => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = `${brand} ${model} ${year}`;
                    img.loading = 'lazy'; // Lazy loading for performance
                    img.classList.add('gallery-image');

                    // Add event listener to handle image loading
                    img.addEventListener('load', () => {
                        if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
                            // Remove image if its size is 1x1
                            img.remove();
                        } else {
                            // Add the image to the gallery if it's valid
                            img.classList.add('loaded'); // Add class when loaded
                            img.addEventListener('click', () => openModal(index));
                            gallery.appendChild(img);
                        }
                    });

                    // Remove image if it fails to load
                    img.addEventListener('error', () => img.remove());
                });
            }

            // Open modal with the selected image
            function openModal(index) {
                currentIndex = index;
                const modal = document.createElement('div');
                modal.classList.add('modal');
                modal.innerHTML = `
                    <div class="modal-content">
                        <img src="${currentImages[currentIndex]}" alt="Image">
                    </div>
                    <button class="modal-prev">&lt;</button>
                    <button class="modal-next">&gt;</button>
                `;
                modal.querySelector('.modal-prev').addEventListener('click', showPrevImage);
                modal.querySelector('.modal-next').addEventListener('click', showNextImage);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove(); // Close modal on background click
                });

                // Add keyboard event listener for navigation
                document.addEventListener('keydown', handleKeyNavigation);

                // Remove modal and keyboard listener on close
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        document.removeEventListener('keydown', handleKeyNavigation);
                    }
                });

                document.body.appendChild(modal);
            }

            // Show the previous image
            function showPrevImage() {
                currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
                updateModalImage();
            }

            // Show the next image
            function showNextImage() {
                currentIndex = (currentIndex + 1) % currentImages.length;
                updateModalImage();
            }

            // Update the modal image
            function updateModalImage() {
                const modalImage = document.querySelector('.modal-content img');
                modalImage.src = currentImages[currentIndex];
            }

            // Handle keyboard navigation
            function handleKeyNavigation(event) {
                if (event.key === 'ArrowLeft') {
                    showPrevImage();
                } else if (event.key === 'ArrowRight') {
                    showNextImage();
                } else if (event.key === 'Escape') {
                    const modal = document.querySelector('.modal');
                    if (modal) {
                        modal.remove();
                        document.removeEventListener('keydown', handleKeyNavigation);
                    }
                }
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Add event listeners to radio buttons
document.querySelectorAll('input[name="data-file"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        const selectedFile = event.target.value;
        fetchAndPopulateData(selectedFile);
    });
});

// Initial fetch with the default file
fetchAndPopulateData('js/image_sources.json');