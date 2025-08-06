// Initialize AOS (Animate on Scroll)
AOS.init({
    duration: 1000,
    once: true
});

function updatePeopleCounter(callback) {
    const counter = document.getElementById('peopleCounter');
    const apiUrl = '/api/totalcount';  // Use relative path

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

function animateCounter(counter, targetCount, callback) {
    let currentCount = parseInt(counter.textContent.replace(/,/g, '')) || 0;
    console.log('Starting animation from', currentCount, 'to', targetCount); // Log animation start

    const duration = 2000; // Duration of the animation in milliseconds
    const frameRate = 50; // Frame rate of the animation in milliseconds
    const totalFrames = duration / frameRate;
    let frame = 0;

    const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        currentCount = Math.round(currentCount + (targetCount - currentCount) * progress);
        console.log('Current count at frame', frame, ':', currentCount); // Log current count at each frame

        counter.textContent = currentCount.toLocaleString();

        if (frame >= totalFrames) {
            clearInterval(interval);
            counter.textContent = targetCount.toLocaleString();
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
});

function copyToClipboard() {
    // Compute yesterday’s date
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yesterday = `${yyyy}-${mm}-${dd}`;

    // Build URL with yesterday’s date
    const textToCopy = `https://www.crowdcount.tech/api/get_day_data?user_id=Demo&password=password&date=${yesterday}`;

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

// Create a new map with dark mode
const map = new mapkit.Map("map", {
    center: new mapkit.Coordinate(40.01833, -105.28202), // Center the map on CrowdCount HQ
    colorScheme: mapkit.Map.ColorSchemes.Dark // Enable dark mode
});

// Function to fetch locations from the new API
async function fetchLocations() {
    try {
        const response = await fetch('https://crowdcount.tech/api/get_all_location_data_with_extra');
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

    const mapLocations = locations.map(location => {
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

    // Set the map region
    const newCenter = new mapkit.Coordinate(40.00907, -105.27124);
    const newSpan = new mapkit.CoordinateSpan(0.035, 0.035); // Adjust span to fit all annotations
    const newRegion = new mapkit.CoordinateRegion(newCenter, newSpan);

    // Set the new region with animation
    map.setRegionAnimated(newRegion);
}

// Call the initMap function to load the locations and annotations
initMap();

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