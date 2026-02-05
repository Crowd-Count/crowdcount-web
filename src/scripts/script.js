// Initialize AOS (Animate on Scroll)
AOS.init({
    duration: 1000,
    once: true
});

// Sticky Navigation
let lastScrollY = window.scrollY;
let ticking = false;

function updateStickyNav() {
    const stickyNav = document.getElementById('sticky-nav');
    if (!stickyNav) return;

    const scrollY = window.scrollY;
    const threshold = window.innerHeight * 0.5; // Show after scrolling 50% of viewport height

    if (scrollY > threshold) {
        stickyNav.classList.add('visible');
    } else {
        stickyNav.classList.remove('visible');
        // Close mobile menu when nav hides
        const mobileMenu = document.querySelector('.nav-menu-mobile');
        const navToggle = document.querySelector('.nav-toggle');
        if (mobileMenu) mobileMenu.classList.remove('open');
        if (navToggle) navToggle.classList.remove('active');
    }

    lastScrollY = scrollY;
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(updateStickyNav);
        ticking = true;
    }
});

// Mobile nav toggle
function toggleMobileNav() {
    const mobileMenu = document.querySelector('.nav-menu-mobile');
    const navToggle = document.querySelector('.nav-toggle');
    const stickyNav = document.getElementById('sticky-nav');

    if (mobileMenu && navToggle) {
        mobileMenu.classList.toggle('open');
        navToggle.classList.toggle('active');
        if (stickyNav) stickyNav.classList.toggle('mobile-open');
    }
}

function updatePeopleCounter(callback) {
    const counter = document.getElementById('peopleCounter');
    const apiUrl = 'https://api.crowdcount.tech/totalcount';

    console.log('Fetching data from:', apiUrl); // Log the URL

    fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);
        animateCounter(counter, data.total_count, callback);
    })
    .catch(error => {
        console.error('Error fetching total count:', error);
        // Animate to 404 in case of error
        animateCounter(counter, 404, callback);
    });
}

function formatNumberWithCommas(num) {
    return num.toLocaleString('en-US');
}

function scaleCounterFont(counter, count) {
    // Use formatted string length (including commas) for sizing
    const formattedCount = formatNumberWithCommas(count);
    const charCount = formattedCount.length;
    const viewportWidth = window.innerWidth;
    const padding = 20; // Total horizontal padding (10px each side)
    const availableWidth = viewportWidth - padding;

    // Commas are narrower than digits, use weighted average
    // Digits ~0.6em, commas ~0.3em
    const digitCount = count.toString().length;
    const commaCount = charCount - digitCount;
    const effectiveWidth = (digitCount * 0.6) + (commaCount * 0.3);

    // Calculate max font size that fits the available width
    const maxFitSize = availableWidth / effectiveWidth;

    // Cap at reasonable maximum (15rem = 240px at default font size)
    const maxSize = 240;
    const fontSize = Math.min(maxFitSize, maxSize);

    // Set minimum size for readability
    const finalSize = Math.max(fontSize, 24);

    counter.style.fontSize = `${finalSize}px`;
}

function animateCounter(counter, targetCount, callback) {
    // Parse current count, removing commas if present
    let currentCount = parseInt(counter.textContent.replace(/,/g, '')) || 0;
    console.log('Starting animation from', currentCount, 'to', targetCount); // Log animation start

    const duration = 2000; // Duration of the animation in milliseconds
    const frameRate = 50; // Frame rate of the animation in milliseconds
    const totalFrames = duration / frameRate;
    let frame = 0;

    // Scale font for target count at the start
    scaleCounterFont(counter, targetCount);

    const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        currentCount = Math.round(currentCount + (targetCount - currentCount) * progress);
        console.log('Current count at frame', frame, ':', currentCount); // Log current count at each frame

        counter.textContent = formatNumberWithCommas(currentCount);

        if (frame >= totalFrames) {
            clearInterval(interval);
            counter.textContent = formatNumberWithCommas(targetCount);
            console.log('Animation completed with final count:', targetCount); // Log animation completion
            if (callback) callback();
        }
    }, frameRate);
}

function startContinuousUpdate() {
    function update() {
        updatePeopleCounter(() => {
            setTimeout(update, 3000); // Wait 3 seconds before next update
        });
    }

    update(); // Start the first update
}

document.addEventListener('DOMContentLoaded', () => {
    startContinuousUpdate();
    loadPartnerLogos();

    // Recalculate counter font size on window resize
    window.addEventListener('resize', () => {
        const counter = document.getElementById('peopleCounter');
        if (counter && counter.textContent) {
            const count = parseInt(counter.textContent.replace(/,/g, '')) || 0;
            if (count > 0) {
                scaleCounterFont(counter, count);
            }
        }
    });

    // Typewriter animation
    const typewriterConfigurations = [
        { elementId: 'CrowdCountAPI', text: 'CrowdCount API', hideCursorAfter: 3800 },
        { elementId: 'CrowdCountABOUT', text: 'About & Contact', hideCursorAfter: 3800 },
        { elementId: 'CrowdCountPRODUCTS', text: 'CrowdCount Products', hideCursorAfter: 3300 },
        { elementId: 'CrowdCountLEGAL', text: 'Legal Information', hideCursorAfter: 3500 },
        { elementId: 'CrowdCountPRIVACY', text: 'Privacy Policy', hideCursorAfter: 3800 },
        { elementId: 'CrowdCountTOS', text: 'Terms of Service', hideCursorAfter: 3700 },
        { elementId: 'CrowdCountMAP', text: 'CrowdCount Map', hideCursorAfter: 3800 },
        { elementId: 'CrowdCountREPORT', text: 'CrowdCount Report', hideCursorAfter: 2700 },
        { elementId: 'CrowdCountHDWMR', text: 'How do we manage reports?', hideCursorAfter: 4000 },
        { elementId: 'CrowdCountSTATUS', text: 'CrowdCount Server Status', hideCursorAfter: 4000 }
    ];

    typewriterConfigurations.forEach(config => {
        const app = document.getElementById(config.elementId);

        if (app) {
            const typewriter = new Typewriter(app, {
                loop: false,
                delay: 50,
                cursor: '_', // Customize cursor if needed
            });

            typewriter.typeString(config.text)
                .callFunction(() => {
                    // Hide the cursor after typing is complete
                    setTimeout(() => {
                        app.querySelector('.Typewriter__cursor').style.display = 'none';
                    }, config.hideCursorAfter);
                })
                .start();
        }
    });

    // Initialize location list if on map page
    if (window.location.pathname.includes('map.html')) {
        setTimeout(() => {
            populateLocationList();
        }, 1000);
    }
});

function copyToClipboard() {
    // Compute yesterday's date
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yesterday = `${yyyy}-${mm}-${dd}`;

    // Build URL with yesterday's date
    const textToCopy = `https://api.crowdcount.tech/get_day_data?user_id=Demo&password=password&date=${yesterday}`;

    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = textToCopy;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    const button = document.querySelector(".mobile-button");
    const originalText = button.textContent;
    button.textContent = "Link Copied!";
    setTimeout(() => {
        button.textContent = originalText;
    }, 3000);
}

document.querySelectorAll('.ripple').forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');

        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect');

        const rippleEffect = this.querySelector('.ripple-effect');
        if (rippleEffect) {
            rippleEffect.remove();
        }

        this.appendChild(ripple);

        // Store the ripple state in session storage
        sessionStorage.setItem('ripple', JSON.stringify({
            href: this.href,
            x: x,
            y: y,
            size: size,
            page: window.location.pathname
        }));
    });
});

document.querySelectorAll('.text-box').forEach(box => {
    box.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');

        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect');

        const rippleEffect = this.querySelector('.ripple-effect');
        if (rippleEffect) {
            rippleEffect.remove();
        }

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600); // Remove the ripple after the animation
    });
});

const token = 'eyJraWQiOiI3MjJWVVE3WUM1IiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI0NVQ1NlFCMlBZIiwiaWF0IjoxNzIxMzk5MzkzLCJvcmlnaW4iOiJjcm93ZGNvdW50LnRlY2gifQ.ObhQXdcjpuahFJ1ypktveapc5tRbVH6arp7I8sqwU_PKkyIN5jY-DvuLu2c-uo3eL4XnyBvFYazE7xmkkBsjbg';

mapkit.init({
    authorizationCallback: function(done) {
        done(token);
    }
});

// Create a new map with dark mode (initial center will be updated based on user location or markers)
const map = new mapkit.Map("map", {
    center: new mapkit.Coordinate(39.8283, -98.5795), // Initial center on USA (will be updated)
    colorScheme: mapkit.Map.ColorSchemes.Dark // Enable dark mode
});

// Track if initial position has been set
let hasSetInitialPosition = false;

// Function to get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Function to center map on user's location
function centerOnUserLocation(latitude, longitude) {
    const coordinate = new mapkit.Coordinate(latitude, longitude);
    const region = new mapkit.CoordinateRegion(
        coordinate,
        new mapkit.CoordinateSpan(0.01, 0.01) // Tight zoom on user location
    );
    map.setRegionAnimated(region);
    hasSetInitialPosition = true;
}

// Function to fit all markers in the map view
function fitAllMarkers(locations) {
    if (!locations || locations.length === 0) {
        // No markers, keep default USA view
        return;
    }

    // Calculate bounding box
    let minLat = locations[0].location_latitude;
    let maxLat = locations[0].location_latitude;
    let minLon = locations[0].location_longitude;
    let maxLon = locations[0].location_longitude;

    locations.forEach(location => {
        minLat = Math.min(minLat, location.location_latitude);
        maxLat = Math.max(maxLat, location.location_latitude);
        minLon = Math.min(minLon, location.location_longitude);
        maxLon = Math.max(maxLon, location.location_longitude);
    });

    // Calculate center and span with padding
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const spanLat = Math.max((maxLat - minLat) * 1.5, 0.01); // 50% padding, minimum span
    const spanLon = Math.max((maxLon - minLon) * 1.5, 0.01);

    const region = new mapkit.CoordinateRegion(
        new mapkit.Coordinate(centerLat, centerLon),
        new mapkit.CoordinateSpan(spanLat, spanLon)
    );
    map.setRegionAnimated(region);
    hasSetInitialPosition = true;
}

// Function to set initial map position based on user location or fit all markers
async function setInitialMapPosition(locations) {
    if (hasSetInitialPosition) return;

    try {
        // Try to get user's location
        const userLocation = await getUserLocation();
        centerOnUserLocation(userLocation.latitude, userLocation.longitude);
        console.log('Map centered on user location');
    } catch (error) {
        // User denied location or error occurred, fit all markers
        console.log('Could not get user location:', error.message);
        fitAllMarkers(locations);
        console.log('Map fitted to show all markers');
    }
}

// Function to fetch locations from the new API
async function fetchLocations() {
    try {
        const response = await fetch('https://api.crowdcount.tech/get_all_location_data_with_extra');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.locations;
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

// Function to get the comparison symbol
function getComparisonSymbol(comparison) {
    switch (comparison) {
        case "up":
            return "↑";
        case "down":
            return "↓";
        case "neutral":
            return "";
        default:
            return "";
    }
}

// Function to map comparison to color (if you want to use it)
function getComparisonColor(comparison) {
    switch (comparison) {
        case "up":
            return "green";
        case "down":
            return "red";
        case "neutral":
            return "gray";
        default:
            return "gray";
    }
}

function getMarkerColor(colorName) {
    const colorMap = {
        "red": "#FF3B30",
        "orange": "#FF9500",
        "yellow": "#FFCC00",
        "green": "#34C759",
        "mint": "#00C7BE",
        "teal": "#30B0C7",
        "cyan": "#32ADE6",
        "blue": "#007AFF",
        "indigo": "#5856D6",
        "purple": "#AF52DE",
        "pink": "#FF2D55",
        "brown": "#A2845E",
        "primary": "#000000", // Assuming primary is black
        // Add other mappings if needed
    };

    return colorMap[colorName.toLowerCase()] || "#8E8E93"; // Default to gray if not found
}

// Initialize the map with locations from the new API
async function initMap() {
    const locations = await fetchLocations();

    // Remove duplicates based on name and device (same as list view)
    const uniqueLocations = [];
    const seenKeys = new Set();

    locations.forEach(location => {
        const key = `${location.location_name}_${location.location_device}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueLocations.push(location);
        }
    });

    const mapLocations = uniqueLocations.map(location => {
        // Parse the overcrowding count
        let overcrowding = null;
        if (location.location_overcrowding_count !== "N/A") {
            overcrowding = parseInt(location.location_overcrowding_count);
            if (isNaN(overcrowding)) {
                overcrowding = null;
            }
        }

        return {
            coordinate: new mapkit.Coordinate(location.location_latitude, location.location_longitude),
            title: location.location_name,
            currentCount: location.location_current_count,
            comparison: location.location_comparison,
            color: location.location_color,
            overcrowding: overcrowding, // Include overcrowding count
        };
    });

    // Add annotations to the map
    mapLocations.forEach((location) => {
        const comparisonSymbol = getComparisonSymbol(location.comparison);

        // Build the subtitle
        let subtitle = `Count: ${location.currentCount}`;
        if (location.overcrowding !== null) {
            subtitle += ` / ${location.overcrowding}`;
        }
        if (comparisonSymbol) {
            subtitle += ` ${comparisonSymbol}`;
        }

        // Set the marker color based on location color
        const markerColor = getMarkerColor(location.color);

        const annotation = new mapkit.MarkerAnnotation(location.coordinate, {
            title: location.title,
            subtitle: subtitle,
            color: markerColor,
        });

        map.addAnnotation(annotation);
    });

    // Set initial map position based on user location or fit all markers
    await setInitialMapPosition(locations);
}

// Call the initMap function to load the locations and annotations
initMap();
populateLocationList();

function loadPartnerLogos() {
    const partnersTrack = document.querySelector('.partners-track');
    if (!partnersTrack) return;

    // Specifically target partner{i}.png format
    const partnerFolder = 'partners/';
    let maxAttempts = 20; // Try up to 20 possible partners
    let loadedCount = 0;
    
    // Load each partner logo with the specified format
    for (let i = 1; i <= maxAttempts; i++) {
        const img = document.createElement('img');
        img.src = `${partnerFolder}partner${i}.png`;
        img.alt = `Partner ${i}`;
        img.className = 'partner-logo';
        
        // Track loaded images
        img.onload = function() {
            loadedCount++;
            console.log(`Loaded partner${i}.png`);
        };
        
        // Remove images that fail to load
        img.onerror = function() {
            console.log(`Failed to load partner${i}.png`);
            this.remove();
        };
        
        partnersTrack.appendChild(img);
    }
    
    // After allowing time for images to load, duplicate them for scrolling effect
    setTimeout(() => {
        const visibleLogos = Array.from(partnersTrack.querySelectorAll('.partner-logo'));
        console.log(`Found ${visibleLogos.length} partner logos`);
        
        if (visibleLogos.length > 0) {
            // Duplicate all logos multiple times to ensure continuous scrolling
            // We'll duplicate them enough times to ensure the scroll never ends
            const numDuplicates = Math.ceil(window.innerWidth / (visibleLogos.length * 90)) + 2;
            
            for (let i = 0; i < numDuplicates; i++) {
                visibleLogos.forEach(logo => {
                    const clone = logo.cloneNode(true);
                    partnersTrack.appendChild(clone);
                });
            }
            
            // Set the animation duration based on the number of logos
            // More logos = longer animation for smooth scrolling
            const totalLogos = visibleLogos.length * (numDuplicates + 1);
            const animationDuration = Math.max(30, totalLogos * 2);
            partnersTrack.style.animationDuration = `${animationDuration}s`;
        } else {
            console.warn('No partner logos found with pattern: partner{i}.png');
            console.info('Please ensure your partner logos are in the partners/ folder and named as partner1.png, partner2.png, etc.');
        }
    }, 1000); // Wait 1 second for images to load

    // Add event listeners for hover effect on the entire track
    partnersTrack.addEventListener('mouseenter', () => {
        partnersTrack.style.animationPlayState = 'running';
    });
    
    partnersTrack.addEventListener('mouseleave', () => {
        partnersTrack.style.animationPlayState = 'running';
    });
}

// ============================================
// LOCATION LIST FUNCTIONALITY
// ============================================

// Global variable to store locations
let allLocations = [];
let locationsMap = new Map();
let listVisible = true;

// Function to populate the location list
async function populateLocationList() {
    try {
        const response = await fetch('https://api.crowdcount.tech/get_all_location_data_with_extra');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        allLocations = data.locations;
        
        // Store locations in map for quick lookup
        allLocations.forEach(location => {
            const key = `${location.location_name}_${location.location_device}`;
            if (!locationsMap.has(key)) {
                locationsMap.set(key, location);
            }
        });
        
        displayLocations(allLocations);
    } catch (error) {
        console.error('Error fetching locations for list:', error);
        const container = document.getElementById('locations-container');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <p>Unable to load locations</p>
                </div>
            `;
        }
    }
}

// Function to display locations in the list
function displayLocations(locations) {
    const container = document.getElementById('locations-container');
    if (!container) return; // Exit if not on map page
    
    if (!locations || locations.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon"></div>
                <p>No locations found</p>
            </div>
        `;
        return;
    }
    
    // Remove duplicates based on name and device
    const uniqueLocations = [];
    const seenKeys = new Set();
    
    locations.forEach(location => {
        const key = `${location.location_name}_${location.location_device}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueLocations.push(location);
        }
    });
    
    // Sort locations alphabetically by name
    uniqueLocations.sort((a, b) => a.location_name.localeCompare(b.location_name));
    
    // In the displayLocations function, update the HTML generation:
    const html = uniqueLocations.map(location => {
        const comparisonSymbol = getComparisonSymbol(location.location_comparison);
        const comparisonClass = getComparisonClass(location.location_comparison);
        
        // Parse overcrowding count
        let overcrowding = null;
        if (location.location_overcrowding_count && location.location_overcrowding_count !== 'N/A') {
            overcrowding = parseInt(location.location_overcrowding_count);
            if (isNaN(overcrowding)) {
                overcrowding = null;
            }
        }
        
        return `
            <div class="location-item" onclick="centerMapOnLocation(${location.location_latitude}, ${location.location_longitude})">
                <span class="location-name">${escapeHtml(location.location_name)}</span>
                <div class="location-stats">
                    <span class="location-count-label">Count:</span>
                    <span class="location-count-number">${location.location_current_count}</span>
                    ${overcrowding ? `<span class="location-overcrowding"> / ${overcrowding}</span>` : ''}
                    ${comparisonSymbol ? `<span class="${comparisonClass}">${comparisonSymbol}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Function to filter locations based on search input
function filterLocations() {
    const searchInput = document.getElementById('location-search');
    if (!searchInput) return; // Exit if not on map page
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayLocations(allLocations);
        return;
    }
    
    const filteredLocations = allLocations.filter(location => 
        location.location_name.toLowerCase().includes(searchTerm)
    );
    
    displayLocations(filteredLocations);
}

// Function to get comparison class for styling
function getComparisonClass(comparison) {
    switch (comparison) {
        case "up":
            return "comparison-up";
        case "down":
            return "comparison-down";
        default:
            return "";
    }
}

// Function to get icon color based on location color
function getIconColor(colorName) {
    const colorMap = {
        "red": "#FF3B30",
        "orange": "#FF9500",
        "yellow": "#FFCC00",
        "green": "#34C759",
        "mint": "#00C7BE",
        "teal": "#30B0C7",
        "cyan": "#32ADE6",
        "blue": "#007AFF",
        "indigo": "#5856D6",
        "purple": "#AF52DE",
        "pink": "#FF2D55",
        "brown": "#A2845E",
        "gray": "#8E8E93",
        "primary": "#007AFF"
    };
    
    return colorMap[colorName?.toLowerCase()] || "#007AFF";
}

// Function to get icon background color (lighter version)
function getIconBgColor(colorName) {
    const colorMap = {
        "red": "rgba(255, 59, 48, 0.2)",
        "orange": "rgba(255, 149, 0, 0.2)",
        "yellow": "rgba(255, 204, 0, 0.2)",
        "green": "rgba(52, 199, 89, 0.2)",
        "mint": "rgba(0, 199, 190, 0.2)",
        "teal": "rgba(48, 176, 199, 0.2)",
        "cyan": "rgba(50, 173, 230, 0.2)",
        "blue": "rgba(0, 122, 255, 0.2)",
        "indigo": "rgba(88, 86, 214, 0.2)",
        "purple": "rgba(175, 82, 222, 0.2)",
        "pink": "rgba(255, 45, 85, 0.2)",
        "brown": "rgba(162, 132, 94, 0.2)",
        "gray": "rgba(142, 142, 147, 0.2)",
        "primary": "rgba(0, 122, 255, 0.2)"
    };
    
    return colorMap[colorName?.toLowerCase()] || "rgba(0, 122, 255, 0.2)";
}

// Function to center map on a specific location
function centerMapOnLocation(latitude, longitude) {
    if (typeof map !== 'undefined' && map) {
        const coordinate = new mapkit.Coordinate(latitude, longitude);
        const region = new mapkit.CoordinateRegion(
            coordinate,
            new mapkit.CoordinateSpan(0.01, 0.01)
        );
        map.setRegionAnimated(region);
        
        // Smooth scroll to map
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Function to toggle location list visibility
function toggleLocationList() {
    const listContent = document.getElementById('location-list-content');
    const toggleBtn = document.getElementById('toggle-text');
    
    if (!listContent || !toggleBtn) return;
    
    listVisible = !listVisible;
    
    if (listVisible) {
        listContent.style.display = 'block';
        toggleBtn.textContent = 'Hide';
    } else {
        listContent.style.display = 'none';
        toggleBtn.textContent = 'Show';
    }
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (text == null) return '';
    const str = String(text);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}

// Auto-refresh location list every 30 seconds
setInterval(refreshLocationList, 30000);

// Add keyboard shortcut to toggle list (Ctrl/Cmd + L)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        toggleLocationList();
    }
});

// Clear search when Escape is pressed
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('location-search');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            filterLocations();
        }
    }
});

// ============================================
// AD CAROUSEL FUNCTIONALITY
// ============================================

// Global variables for ads
let activeAds = [];
let adCountdownIntervals = [];
let userLocationForAds = null;
let adCarouselInitialized = false;
let adRenderInProgress = false;

// Sample ads for testing - REMOVE THIS WHEN READY FOR PRODUCTION
const SAMPLE_ADS = [
    {
        id: 'test-ad-1',
        title: 'Joe\'s Coffee Shop',
        description: 'Get 20% off your first order! Fresh brewed coffee and pastries daily.',
        imagePath: null,
        deviceId: 'demo-device-1',
        ctaText: 'Get Offer',
        ctaLinkType: 'custom',
        ctaURL: 'https://example.com/joes-coffee',
        expirationDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
    },
    {
        id: 'test-ad-2',
        title: 'Downtown Gym',
        description: 'New Year Special: First month FREE! State-of-the-art equipment.',
        imagePath: null,
        deviceId: 'demo-device-2',
        ctaText: 'Sign Up',
        ctaLinkType: 'default',
        ctaURL: null,
        expirationDate: new Date(Date.now() + 45 * 60 * 1000).toISOString() // 45 mins (expiring soon)
    },
    {
        id: 'test-ad-3',
        title: 'Pizza Palace',
        description: 'Buy one pizza, get one free! Valid for dine-in and takeout.',
        imagePath: null,
        deviceId: 'demo-device-3',
        ctaText: 'Order Now',
        ctaLinkType: 'custom',
        ctaURL: 'https://example.com/pizza-palace',
        expirationDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5 hours from now
    },
    {
        id: 'test-ad-4',
        title: 'Tech Store',
        description: 'Holiday clearance sale! Up to 50% off electronics and accessories.',
        imagePath: null,
        deviceId: 'demo-device-4',
        ctaText: 'Shop Now',
        ctaLinkType: 'custom',
        ctaURL: 'https://example.com/tech-store',
        expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours from now
    }
];

// Set to true to use sample ads for testing
const USE_SAMPLE_ADS = false;

// Function to fetch active ads
async function fetchActiveAds() {
    // Return sample ads for testing
    if (USE_SAMPLE_ADS) {
        console.log('Using sample ads for testing');
        return SAMPLE_ADS;
    }

    try {
        const response = await fetch('https://api.crowdcount.tech/get-active-ads');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Raw API response:', data);

        // Handle different API response structures
        let ads = [];
        if (Array.isArray(data)) {
            // API returned array directly
            ads = data;
        } else if (data.ads && Array.isArray(data.ads)) {
            // API returned { ads: [...] }
            ads = data.ads;
        } else if (data.data && Array.isArray(data.data)) {
            // API returned { data: [...] }
            ads = data.data;
        }

        console.log('Parsed ads array:', ads);

        // Ensure each ad has an id (use device_id as fallback or generate one)
        ads = ads.map((ad, index) => {
            if (!ad.id) {
                const deviceId = ad.device_id || ad.deviceId;
                ad.id = deviceId ? `ad-${deviceId}` : `ad-${index}-${Date.now()}`;
            }
            return ad;
        });

        if (ads.length > 0) {
            console.log('First ad structure:', JSON.stringify(ads[0], null, 2));
        }

        return ads;
    } catch (error) {
        console.error('Error fetching active ads:', error);
        return [];
    }
}

// Helper to get ad field (handles both snake_case from API and camelCase from sample data)
function getAdField(ad, camelCase, snakeCase) {
    return ad[camelCase] !== undefined ? ad[camelCase] : ad[snakeCase];
}

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to sort ads by distance from user
function sortAdsByDistance(ads, userLat, userLon) {
    if (!userLat || !userLon || !allLocations.length) {
        return ads;
    }

    // Create a map of deviceId to location coordinates
    const deviceLocationMap = new Map();
    allLocations.forEach(location => {
        if (location.location_device) {
            deviceLocationMap.set(location.location_device, {
                lat: location.location_latitude,
                lon: location.location_longitude
            });
        }
    });

    // Sort ads by distance
    return [...ads].sort((a, b) => {
        // Use primary_device for location matching (supports grouped devices)
        // Fallback to device_id for backwards compatibility
        const deviceIdA = getAdField(a, 'primaryDevice', 'primary_device') || getAdField(a, 'deviceId', 'device_id');
        const deviceIdB = getAdField(b, 'primaryDevice', 'primary_device') || getAdField(b, 'deviceId', 'device_id');

        const locA = deviceLocationMap.get(deviceIdA);
        const locB = deviceLocationMap.get(deviceIdB);

        if (!locA && !locB) return 0;
        if (!locA) return 1;
        if (!locB) return -1;

        const distA = calculateDistance(userLat, userLon, locA.lat, locA.lon);
        const distB = calculateDistance(userLat, userLon, locB.lat, locB.lon);

        return distA - distB;
    });
}

// Function to parse expiration date (handles multiple formats like iOS)
function parseExpirationDate(dateString) {
    if (!dateString) return null;

    // Try ISO 8601 with fractional seconds
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Try without fractional seconds
    const withoutFraction = dateString.replace(/\.\d+/, '');
    date = new Date(withoutFraction);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null;
}

// Function to format countdown time
function formatCountdown(expirationDate) {
    const now = new Date();
    const expDate = parseExpirationDate(expirationDate);

    if (!expDate) return { text: 'N/A', isExpiringSoon: false };

    const diff = expDate - now;

    if (diff <= 0) {
        return { text: 'Expired', isExpiringSoon: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const isExpiringSoon = hours < 1;

    if (hours >= 1) {
        return {
            text: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            isExpiringSoon: false
        };
    } else {
        return {
            text: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            isExpiringSoon: true
        };
    }
}

// Function to track ad click
async function trackAdClick(adId) {
    try {
        await fetch('https://api.crowdcount.tech/track-ad-click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adId: adId })
        });
    } catch (error) {
        console.error('Error tracking ad click:', error);
    }
}

// Current ad being viewed in modal
let currentModalAd = null;

// Function to handle CTA click by index (more robust than finding by id)
function handleCtaClickByIndex(index, event) {
    event.stopPropagation();

    const ad = activeAds[index];
    if (!ad) {
        console.error('Ad not found at index:', index);
        return;
    }

    // Track the click
    trackAdClick(ad.id);

    // Handle both snake_case (API) and camelCase (sample data)
    const ctaLinkType = getAdField(ad, 'ctaLinkType', 'cta_link_type');
    const ctaURL = getAdField(ad, 'ctaURL', 'cta_url');

    // Open the appropriate URL or modal
    if (ctaLinkType === 'custom' && ctaURL) {
        window.open(ctaURL, '_blank');
    } else {
        // Default: open ad detail modal
        openAdModal(ad);
    }
}

// Legacy function for backwards compatibility
function handleCtaClick(ad, event) {
    if (!ad) {
        console.error('handleCtaClick called with null ad');
        return;
    }
    event.stopPropagation();
    trackAdClick(ad.id);

    const ctaLinkType = getAdField(ad, 'ctaLinkType', 'cta_link_type');
    const ctaURL = getAdField(ad, 'ctaURL', 'cta_url');

    if (ctaLinkType === 'custom' && ctaURL) {
        window.open(ctaURL, '_blank');
    } else {
        openAdModal(ad);
    }
}

// Function to generate reference number from ad ID (like iOS)
function generateReferenceNumber(adId) {
    let hash = 0;
    for (let i = 0; i < adId.length; i++) {
        const char = adId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'REF-' + Math.abs(hash).toString().slice(0, 8).padStart(8, '0');
}

// Function to get ad location from deviceId
function getAdLocation(ad) {
    if (!allLocations || !allLocations.length || !ad) return null;

    // Use primary_device for location matching (supports grouped devices)
    // Fallback to device_id for backwards compatibility
    const deviceId = getAdField(ad, 'primaryDevice', 'primary_device') || getAdField(ad, 'deviceId', 'device_id');
    if (!deviceId) return null;

    const location = allLocations.find(loc => loc.location_device === deviceId);
    if (location) {
        return {
            name: location.location_name,
            lat: location.location_latitude,
            lon: location.location_longitude
        };
    }
    return null;
}

// Function to open ad detail modal
function openAdModal(ad) {
    currentModalAd = ad;

    const overlay = document.getElementById('promo-modal-overlay');
    const imageContainer = document.getElementById('promo-modal-image');
    const title = document.getElementById('promo-modal-title');
    const description = document.getElementById('promo-modal-description');
    const directionsBtn = document.getElementById('promo-modal-directions');
    const reference = document.getElementById('promo-modal-reference');

    // Handle both snake_case (API) and camelCase (sample data)
    const imagePath = getAdField(ad, 'imagePath', 'image_path');

    // Set image
    const imageUrl = getAdImageUrl(imagePath);
    if (imageUrl) {
        imageContainer.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(ad.title)}" onerror="this.parentElement.innerHTML='<div class=\\'promo-modal-image-placeholder\\'>📍</div>'">`;
    } else {
        imageContainer.innerHTML = '<div class="promo-modal-image-placeholder">📍</div>';
    }

    // Set content
    title.textContent = ad.title;
    description.textContent = ad.description;
    reference.textContent = generateReferenceNumber(ad.id);

    // Only show directions button if we have coordinates
    const location = getAdLocation(ad);
    if (location && location.lat && location.lon) {
        directionsBtn.style.display = '';
    } else {
        directionsBtn.style.display = 'none';
    }

    // Show modal
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

// Function to close ad detail modal
function closeAdModal(event) {
    // If called from overlay click, only close if clicking the overlay itself
    if (event && event.target !== event.currentTarget) return;

    const overlay = document.getElementById('promo-modal-overlay');
    overlay.classList.remove('visible');
    document.body.style.overflow = ''; // Restore scrolling
    currentModalAd = null;
}

// Function to open directions to ad location
function openAdDirections() {
    if (!currentModalAd) return;

    const location = getAdLocation(currentModalAd);
    console.log('Opening directions for ad:', currentModalAd.title, 'Location found:', location);

    let mapsUrl;
    if (location && location.lat && location.lon) {
        // Exact coordinates found - use directions mode with coordinates
        // daddr = destination address, dirflg=d for driving directions
        mapsUrl = `https://maps.apple.com/?daddr=${location.lat},${location.lon}&dirflg=d&t=m`;
    } else {
        // Fallback - search by business name
        mapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(currentModalAd.title)}`;
    }

    window.open(mapsUrl, '_blank');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('promo-modal-overlay');
        if (overlay && overlay.classList.contains('visible')) {
            closeAdModal();
        }
    }
});

// Function to build image URL
function getAdImageUrl(imagePath) {
    if (!imagePath) return null;

    // Extract filename from path
    const filename = imagePath.split('/').pop();
    return `https://api.crowdcount.tech/ad-images/${filename}`;
}

// Function to create ad card HTML
function createAdCardHTML(ad, index) {
    try {
        console.log(`Creating card for ad ${index}:`, ad);

        // Handle both snake_case (API) and camelCase (sample data) field names
        const imagePath = getAdField(ad, 'imagePath', 'image_path');
        const expirationDate = getAdField(ad, 'expirationDate', 'expiration_date');
        const ctaText = getAdField(ad, 'ctaText', 'cta_text') || 'View Details';
        const title = ad.title || 'Sponsored';
        const description = ad.description || '';
        const adId = ad.id || `ad-${index}`;

        console.log(`Ad ${index} parsed:`, { title, description, imagePath, ctaText });

        const imageUrl = getAdImageUrl(imagePath);
        const countdown = formatCountdown(expirationDate);

        // Escape HTML to prevent XSS
        const safeAdId = escapeHtml(String(adId));
        const safeTitle = escapeHtml(String(title));
        const safeDescription = escapeHtml(String(description));
        const safeCtaText = escapeHtml(String(ctaText));
        const safeExpiration = escapeHtml(String(expirationDate || ''));

        let imageHtml;
        if (imageUrl) {
            const safeImageUrl = escapeHtml(imageUrl);
            imageHtml = `<img src="${safeImageUrl}" alt="${safeTitle}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div class="promo-card-image-placeholder" style="display:none">📍</div>`;
        } else {
            imageHtml = '<div class="promo-card-image-placeholder">📍</div>';
        }

        const html = `<div class="promo-card" data-promo-id="${safeAdId}" data-promo-index="${index}">
    <div class="promo-card-image">${imageHtml}</div>
    <div class="promo-card-content">
        <div class="promo-card-title">${safeTitle}</div>
        <div class="promo-card-description">${safeDescription}</div>
        <div class="promo-card-actions">
            <button class="promo-card-cta" onclick="handleCtaClickByIndex(${index}, event)">${safeCtaText}</button>
            <div class="promo-card-countdown ${countdown.isExpiringSoon ? 'expiring-soon' : ''}" data-expiration="${safeExpiration}">
                <span class="promo-card-countdown-icon">⏱</span>
                <span class="promo-card-countdown-time">${countdown.text}</span>
            </div>
        </div>
    </div>
</div>`;

        return html;
    } catch (error) {
        console.error('Error creating ad card:', error, error.stack);
        return `<div class="promo-card"><div class="promo-card-content"><div class="promo-card-title">Error</div><div class="promo-card-description">Failed to load ad</div></div></div>`;
    }
}

// Function to render ad carousel
function renderAdCarousel(ads) {
    // Prevent concurrent renders
    if (adRenderInProgress) {
        console.log('Render already in progress, skipping');
        return;
    }
    adRenderInProgress = true;

    console.log('renderAdCarousel called with', ads?.length, 'ads');
    const container = document.getElementById('promo-carousel-container');
    const carousel = document.getElementById('promo-carousel');
    const dotsContainer = document.getElementById('promo-dots-container');

    if (!container || !carousel) {
        console.log('Container or carousel not found');
        adRenderInProgress = false;
        return;
    }

    // Clear existing countdown intervals
    adCountdownIntervals.forEach(interval => clearInterval(interval));
    adCountdownIntervals = [];

    // Hide container if no ads
    if (!ads || ads.length === 0) {
        console.log('No ads to display');
        container.style.display = 'none';
        adRenderInProgress = false;
        return;
    }

    // Show container and render ads - first clear completely
    carousel.innerHTML = '';

    container.style.display = 'block';
    const htmlArray = ads.map((ad, index) => createAdCardHTML(ad, index));
    console.log('Generated HTML for', htmlArray.length, 'ads');
    const fullHtml = htmlArray.join('');
    carousel.innerHTML = fullHtml;
    console.log('Carousel innerHTML set, length:', carousel.innerHTML.length);
    console.log('Number of promo-card elements:', carousel.querySelectorAll('.promo-card').length);

    adRenderInProgress = false;

    // Create dots (using same .dot class as products page) - only if more than 1 ad
    if (dotsContainer) {
        if (ads.length > 1) {
            dotsContainer.innerHTML = ads.map((_, index) =>
                `<span class="dot ${index === 0 ? 'active' : ''}"></span>`
            ).join('');
        } else {
            dotsContainer.innerHTML = '';
        }
    }

    // Initialize gallery controls (same pattern as products page) - only if more than 1 ad
    const galleryControls = document.getElementById('promo-gallery-controls');
    if (galleryControls) {
        galleryControls.style.display = ads.length > 1 ? '' : 'none';
    }

    if (ads.length > 1) {
        initAdGalleryControls();
    }

    // Start countdown timers
    startCountdownTimers();
}

// Function to initialize ad gallery controls (matches products page pattern)
function initAdGalleryControls() {
    const container = document.getElementById('promo-carousel-container');
    if (!container) return;

    const gallery = document.getElementById('promo-carousel');
    const dots = container.querySelectorAll('.dots-container .dot');
    const prevButton = container.querySelector('.prev-button');
    const nextButton = container.querySelector('.next-button');

    if (!gallery || dots.length === 0) return;

    let scrollInterval = null;

    function updateDots() {
        const total = gallery.scrollWidth - gallery.clientWidth;
        const fraction = total > 0 ? (gallery.scrollLeft / total) : 0;
        const active = Math.round(fraction * (dots.length - 1));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    }

    function moveGallery(direction) {
        const total = gallery.scrollWidth - gallery.clientWidth;
        const step = (dots.length > 1) ? total / (dots.length - 1) : total;
        gallery.scrollBy({ left: direction * step, behavior: 'smooth' });
    }

    function startScrolling(direction) {
        if (scrollInterval) return;
        scrollInterval = setInterval(() => moveGallery(direction), 100);
    }

    function stopScrolling() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }

    // Events
    gallery.addEventListener('scroll', updateDots);

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => moveGallery(-1));
        nextButton.addEventListener('click', () => moveGallery(1));

        prevButton.addEventListener('mousedown', () => startScrolling(-1));
        nextButton.addEventListener('mousedown', () => startScrolling(1));
        prevButton.addEventListener('mouseup', stopScrolling);
        nextButton.addEventListener('mouseup', stopScrolling);
        prevButton.addEventListener('mouseleave', stopScrolling);
        nextButton.addEventListener('mouseleave', stopScrolling);
        prevButton.addEventListener('touchend', stopScrolling);
        nextButton.addEventListener('touchend', stopScrolling);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const total = gallery.scrollWidth - gallery.clientWidth;
            const pos = (dots.length > 1) ? (total / (dots.length - 1)) * index : 0;
            gallery.scrollTo({ left: pos, behavior: 'smooth' });
        });
    });

    // Initialize dot state
    updateDots();
}

// Function to update countdown timers
function startCountdownTimers() {
    const countdownElements = document.querySelectorAll('.promo-card-countdown');

    countdownElements.forEach(element => {
        const expirationDate = element.dataset.expiration;

        const interval = setInterval(() => {
            const countdown = formatCountdown(expirationDate);
            const timeElement = element.querySelector('.promo-card-countdown-time');

            if (timeElement) {
                timeElement.textContent = countdown.text;
            }

            if (countdown.isExpiringSoon) {
                element.classList.add('expiring-soon');
            } else {
                element.classList.remove('expiring-soon');
            }

            // Stop interval if expired
            if (countdown.text === 'Expired') {
                clearInterval(interval);
            }
        }, 1000);

        adCountdownIntervals.push(interval);
    });
}

// Function to initialize ad carousel
async function initAdCarousel() {
    // Prevent double initialization
    if (adCarouselInitialized) {
        console.log('Ad carousel already initialized, skipping');
        return;
    }

    // Only run on map page - check if ad carousel container exists
    const container = document.getElementById('promo-carousel-container');
    if (!container) {
        console.log('Ad carousel container not found - not on map page');
        return;
    }

    adCarouselInitialized = true;
    console.log('Initializing ad carousel...');

    // Fetch ads
    activeAds = await fetchActiveAds();

    if (activeAds.length === 0) {
        return;
    }

    // Try to get user location for sorting
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 3000,
                maximumAge: 300000 // Cache for 5 minutes
            });
        });
        userLocationForAds = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
    } catch (error) {
        console.log('Could not get user location for ad sorting');
    }

    // Sort ads by distance if we have user location
    if (userLocationForAds && allLocations.length > 0) {
        activeAds = sortAdsByDistance(activeAds, userLocationForAds.lat, userLocationForAds.lon);
    }

    // Render the carousel
    renderAdCarousel(activeAds);
}

// Function to refresh ads (called when location data is updated)
async function refreshAds() {
    activeAds = await fetchActiveAds();

    if (userLocationForAds && allLocations.length > 0) {
        activeAds = sortAdsByDistance(activeAds, userLocationForAds.lat, userLocationForAds.lon);
    }

    renderAdCarousel(activeAds);
}

// Also refresh location list
function refreshLocationList() {
    populateLocationList();
}

// Initialize ad carousel when DOM is ready and locations are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for locations to load, then init ads
    setTimeout(() => {
        initAdCarousel();
    }, 1500);
});

// Refresh ads along with location list every 30 seconds
setInterval(refreshAds, 30000);