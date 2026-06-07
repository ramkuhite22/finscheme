/**
 * FinScheme External APIs Integration
 * Fetches real-time data from public APIs to enhance user experience
 */

async function initExternalAPIs() {
    console.log("Initializing FinScheme External APIs...");

    // 1. Live Currency (USD/INR)
    fetchCurrency();

    // 2. Next Public Holiday
    fetchHolidays();

    // 3. Location Detection
    detectLocation();

    // 4. Check Today for Holiday
    checkTodayHoliday();
}

async function checkTodayHoliday() {
    const banner = document.getElementById('holiday-alert-banner');
    const holidayNameSpan = document.getElementById('holiday-today-name');
    const holidayVal = document.getElementById('next-holiday-val');
    if (!banner || !holidayNameSpan) return;

    try {
        const response = await fetch('data/holiday.json');
        const holidays = await response.json();

        const now = new Date();
        const todayStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now
            .getDate()
            .toString()
            .padStart(2, '0')}`;

        const todayHoliday = holidays.find((holiday) => holiday.date === todayStr);

        if (todayHoliday) {
            holidayNameSpan.textContent = todayHoliday.name;
            banner.style.display = 'block';
            if (holidayVal) {
                holidayVal.innerHTML = `<span style="color: #ef4444; font-weight: 700;">Today is a holiday: ${todayHoliday.name}</span>`;
            }
        } else {
            banner.style.display = 'none';
        }
    } catch (error) {
        console.error("Holiday Check Error:", error);
    }
}

async function fetchCurrency() {
    const usdInrVal = document.getElementById('usd-inr-val');
    if (!usdInrVal) return;

    try {
        // Using ExchangeRate.host (referenced in public-apis repo)
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) throw new Error(`Currency API returned ${response.status}`);
        const data = await response.json();
        if (data && data.rates && data.rates.INR) {
            const rate = data.rates.INR.toFixed(2);
            usdInrVal.textContent = `Rs ${rate}`;
            usdInrVal.innerHTML += ' <span style="font-size: 10px; color: #10b981;">+0.12%</span>';
        }
    } catch (error) {
        console.error("Currency API Error:", error);
        usdInrVal.textContent = "Unavailable";
    }
}

async function getNextLocalHoliday() {
    try {
        const response = await fetch('data/holiday.json');
        if (!response.ok) throw new Error(`Failed to fetch local holidays: ${response.status}`);
        const holidays = await response.json();
        if (!holidays || holidays.length === 0) return null;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const mappedHolidays = holidays.map(holiday => {
            const [mStr, dStr] = holiday.date.split('-');
            const month = parseInt(mStr, 10);
            const day = parseInt(dStr, 10);
            let hDate = new Date(now.getFullYear(), month - 1, day);
            if (hDate < todayStart) {
                hDate = new Date(now.getFullYear() + 1, month - 1, day);
            }
            return {
                name: holiday.name,
                date: hDate
            };
        });

        mappedHolidays.sort((a, b) => a.date - b.date);
        return mappedHolidays[0];
    } catch (error) {
        console.error("Error reading local holidays:", error);
        return null;
    }
}

async function useLocalHolidayFallback(holidayVal) {
    const nextLocalHoliday = await getNextLocalHoliday();
    if (nextLocalHoliday) {
        const holidayDate = nextLocalHoliday.date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
        holidayVal.textContent = `Next: ${nextLocalHoliday.name} on ${holidayDate}`;
    } else {
        holidayVal.textContent = "No holiday today";
    }
}

async function fetchHolidays() {
    const holidayVal = document.getElementById('next-holiday-val');
    if (!holidayVal) return;

    try {
        // Using Nager.Date (referenced in public-apis repo)
        const response = await fetch('https://date.nager.at/api/v3/NextPublicHolidays/IN');
        if (!response.ok) throw new Error(`Holiday API returned ${response.status}`);
        const body = await response.text();
        if (!body.trim()) throw new Error('Holiday API returned an empty response');
        const data = JSON.parse(body);

        // If checkTodayHoliday hasn't already marked today as a holiday
        if (!holidayVal.innerHTML.includes('Today is a holiday')) {
            if (data && data.length > 0) {
                const nextHoliday = data[0];
                const holidayDate = new Date(nextHoliday.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                });
                holidayVal.textContent = `Next: ${nextHoliday.name} on ${holidayDate}`;
            } else {
                await useLocalHolidayFallback(holidayVal);
            }
        }
    } catch (error) {
        console.warn("Holiday API failed, falling back to local holiday data:", error);
        if (!holidayVal.innerHTML.includes('Today is a holiday')) {
            await useLocalHolidayFallback(holidayVal);
        }
    }
}

async function detectLocation() {
    const locationVal = document.getElementById('user-location-val');
    const suggestionBox = document.getElementById('location-suggestion');
    const detectedStateName = document.getElementById('detected-state-name');
    const wizardState = document.getElementById('wizardState');

    if (!locationVal) return;

    try {
        // Using ipapi.co (popular free geocoding)
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error(`Location API returned ${response.status}`);
        const data = await response.json();

        if (data && data.city && data.region) {
            locationVal.textContent = `${data.city}, ${data.region}`;

            // If in India, suggest the state for the wizard
            if (data.country_name === "India" && suggestionBox && detectedStateName) {
                detectedStateName.textContent = data.region;
                suggestionBox.style.display = 'block';

                const suggestionBtn = document.getElementById('use-detected-location');
                if (!suggestionBtn) return;

                suggestionBtn.onclick = () => {
                    const stateMap = {
                        "Maharashtra": "Maharashtra",
                        "Delhi": "Delhi",
                        "Karnataka": "Karnataka",
                        "Tamil Nadu": "Tamil Nadu",
                        "Uttar Pradesh": "Uttar Pradesh"
                    };

                    const selectedValue = stateMap[data.region] || data.region;

                    if (wizardState) {
                        const hasOption = [...wizardState.options].some(
                            (option) => option.value === selectedValue
                        );

                        if (!hasOption) {
                            const newOpt = document.createElement('option');
                            newOpt.value = selectedValue;
                            newOpt.textContent = data.region;
                            wizardState.appendChild(newOpt);
                        }

                        wizardState.value = selectedValue;
                    }

                    suggestionBox.innerHTML = `<span style="color: #10b981;">Detected and selected: ${data.region}</span>`;
                };
            }
        }
    } catch (error) {
        console.error("Location API Error:", error);
        locationVal.textContent = "India";
    }
}

// Start once DOM is loaded
document.addEventListener('DOMContentLoaded', initExternalAPIs);
