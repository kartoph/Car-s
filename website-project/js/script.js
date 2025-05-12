// Fetch the JSON data
fetch('js/image_sources.json')
    .then(response => response.json())
    .then(carsData => {
        const brandsMenu = document.querySelector('#brands-menu ul');
        const modelsMenu = document.querySelector('#models-menu ul');
        const yearsMenu = document.querySelector('#years-menu ul');
        const gallery = document.querySelector('.gallery');

        // Hide models and years menus on page load
        modelsMenu.parentElement.style.display = 'none';
        yearsMenu.parentElement.style.display = 'none';

        // Populate the brands menu
        const brands = [...new Set(Object.keys(carsData).map(key => key.split('/')[0]))];
        brands.forEach(brand => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = brand;
            a.addEventListener('click', () => {
                populateModels(brand, carsData);
                modelsMenu.parentElement.style.display = 'block'; // Show models menu
                yearsMenu.parentElement.style.display = 'none'; // Hide years menu
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
                    yearsMenu.parentElement.style.display = 'block'; // Show years menu
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
            const images = Object.keys(carsData)
                .filter(key => key.startsWith(`${brand}/${model}/${year}`))
                .map(key => carsData[key]);
            images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${brand} ${model} ${year}`;
                img.loading = 'lazy'; // Lazy loading for performance
                img.classList.add('gallery-image');
                img.addEventListener('error', () => img.remove()); // Remove if image fails to load
                img.addEventListener('load', () => {
                    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
                        img.remove(); // Remove if intrinsic size is 1x1
                    } else {
                        img.classList.add('loaded'); // Add class when loaded
                    }
                });
                img.addEventListener('click', () => openModal(img.src, `${brand} ${model} ${year}`));
                gallery.appendChild(img);
            });
        }

        // Open modal with the selected image
        function openModal(imageSrc, title) {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>${title}</h2>
                    <img src="${imageSrc}" alt="${title}">
                </div>
            `;
            modal.addEventListener('click', () => modal.remove()); // Close modal on click
            document.body.appendChild(modal);
        }
    })
    .catch(error => console.error('Error loading JSON:', error));