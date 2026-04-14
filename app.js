// Audio/Adhan functionality for Prayer App
const ADHAN_SOURCES = {
    mecca: {
        name: 'مكة المكرمة | Makkah',
        url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
        duration: 52,
        description: 'Adhan de la Mosquée Sacrée de Makkah'
    },
    medina: {
        name: 'المدينة المنورة | Madinah',
        url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
        duration: 48,
        description: 'Adhan de la Mosquée du Prophète'
    },
    morocco: {
        name: 'المغرب التقليدي | Morocco Traditional',
        url: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
        duration: 50,
        description: 'Adhan traditionnel marocain'
    },
    egypt: {
        name: 'مصر | Egypt',
        url: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
        duration: 45,
        description: 'Adhan égyptien classique'
    },
    turkey: {
        name: 'تركيا | Turkey',
        url: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
        duration: 55,
        description: 'Adhan turc traditionnel'
    },
    algeria: {
        name: 'الجزائر | Algeria',
        url: 'https://www.islamcan.com/audio/adhan/azan6.mp3',
        duration: 48,
        description: 'Adhan algérien'
    },
    tunisia: {
        name: 'تونس | Tunisia',
        url: 'https://www.islamcan.com/audio/adhan/azan7.mp3',
        duration: 50,
        description: 'Adhan tunisien'
    },
    andalusia: {
        name: 'الأندلس | Andalusia',
        url: 'https://www.islamcan.com/audio/adhan/azan8.mp3',
        duration: 52,
        description: 'Adhan de style andalou'
    }
};

// Audio Manager Class
class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.selectedAdhan = localStorage.getItem('selectedAdhan') || 'mecca';
        this.volume = parseFloat(localStorage.getItem('adhanVolume')) || 0.8;
        this.isPlaying = false;
    }

    playAdhan(type = this.selectedAdhan) {
        // Stop any current audio
        this.stopAdhan();

        const source = ADHAN_SOURCES[type] || ADHAN_SOURCES.mecca;

        this.currentAudio = new Audio(source.url);
        this.currentAudio.volume = this.volume;
        this.currentAudio.loop = false;

        this.currentAudio.play().catch(e => {
            console.log('Audio play failed (user interaction needed):', e);
        });

        this.isPlaying = true;

        // Auto-stop after duration
        setTimeout(() => {
            this.stopAdhan();
        }, (source.duration + 2) * 1000); // +2s buffer

        return source;
    }

    stopAdhan() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.isPlaying = false;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('adhanVolume', this.volume);
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
    }

    selectAdhan(type) {
        if (ADHAN_SOURCES[type]) {
            this.selectedAdhan = type;
            localStorage.setItem('selectedAdhan', type);
            return ADHAN_SOURCES[type];
        }
        return null;
    }

    getAvailableAdhans() {
        return Object.entries(ADHAN_SOURCES).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }

    // Schedule adhan for next prayer
    scheduleAdhan(prayerTime, adhanType) {
        const now = new Date();
        const [hours, minutes] = prayerTime.split(':').map(Number);
        let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (target < now) {
            target.setDate(target.getDate() + 1);
        }

        const delay = target - now;

        setTimeout(() => {
            this.playAdhan(adhanType);
            this.showNotification('وقت الصلاة | Prayer Time', `حان وقت ${adhanType}`);
        }, delay);

        return target;
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: 'icons/icon-192x192.png' });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Original PrayerApp class continues below...

// Prayer Times Application
// Supports Arabic and English with Qibla direction and Hijri date adjustment

class PrayerApp {
    constructor() {
        this.latitude = null;
        this.longitude = null;
        this.qiblaAngle = 0;
        this.hijriOffset = 0;
        this.prayerTimes = {};
        this.nextPrayer = null;
        this.deferredPrompt = null;

        this.init();
    }

    init() {
        this.loadSettings();
        this.getLocation();
        this.setupEventListeners();
        this.updateDate();
        this.setupPWA();

        // Update every second
        setInterval(() => this.updateCountdown(), 1000);

        // Update times every minute
        setInterval(() => this.calculatePrayerTimes(), 60000);
    }

    loadSettings() {
        const saved = localStorage.getItem('prayerAppSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.hijriOffset = settings.hijriOffset || 0;
            this.latitude = settings.latitude;
            this.longitude = settings.longitude;
        }
        this.updateHijriDisplay();
    }

    saveSettings() {
        const settings = {
            hijriOffset: this.hijriOffset,
            latitude: this.latitude,
            longitude: this.longitude
        };
        localStorage.setItem('prayerAppSettings', JSON.stringify(settings));
    }

    setupEventListeners() {
        // Device orientation for compass
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.handleOrientation(e));
        }

        // Before install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('install-btn').classList.add('show');
        });
    }

    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed'));
        }
    }

    getLocation() {
        if (navigator.geolocation) {
            document.getElementById('location-text').innerHTML = 
                '<span class="loading"></span> جاري تحديد الموقع... | Detecting location...';

            navigator.geolocation.getCurrentPosition(
                (position) => this.handleLocation(position),
                (error) => this.handleLocationError(error),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            this.handleLocationError({ message: 'Geolocation not supported' });
        }
    }

    handleLocation(position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        // Calculate Qibla angle
        this.calculateQibla();

        // Calculate prayer times
        this.calculatePrayerTimes();

        // Get city name (reverse geocoding)
        this.getCityName();

        this.saveSettings();
    }

    handleLocationError(error) {
        console.error('Location error:', error);

        // Default to Mecca if location fails
        this.latitude = 21.4225;
        this.longitude = 39.8262;

        document.getElementById('location-text').innerHTML = 
            '⚠️ تعذر تحديد الموقع - استخدام مكة المكرمة كافتراضي<br>' +
            'Location unavailable - Using Mecca as default';

        this.calculateQibla();
        this.calculatePrayerTimes();
    }

    async getCityName() {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.latitude}&longitude=${this.longitude}&localityLanguage=ar`
            );
            const data = await response.json();
            const city = data.city || data.locality || 'Unknown Location';
            const country = data.countryName || '';

            document.getElementById('location-text').innerHTML = 
                `📍 ${city}, ${country}<br>` +
                `<small>${this.latitude.toFixed(4)}, ${this.longitude.toFixed(4)}</small>`;
        } catch (e) {
            document.getElementById('location-text').innerHTML = 
                `📍 ${this.latitude.toFixed(4)}, ${this.longitude.toFixed(4)}`;
        }
    }

    calculateQibla() {
        // Kaaba coordinates
        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;

        const lat1 = this.toRad(this.latitude);
        const lat2 = this.toRad(kaabaLat);
        const dLng = this.toRad(kaabaLng - this.longitude);

        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - 
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

        let angle = this.toDeg(Math.atan2(y, x));
        angle = (angle + 360) % 360;

        this.qiblaAngle = angle;
        document.getElementById('qibla-degree').textContent = angle.toFixed(1) + '°';

        // Update compass arrow
        this.updateCompass();
    }

    updateCompass() {
        const arrow = document.getElementById('qibla-arrow');
        if (arrow) {
            arrow.style.transform = `translate(-50%, -100%) rotate(${this.qiblaAngle}deg)`;
        }
    }

    handleOrientation(event) {
        let heading = 0;

        if (event.webkitCompassHeading) {
            // iOS
            heading = event.webkitCompassHeading;
        } else if (event.alpha) {
            // Android
            heading = 360 - event.alpha;
        }

        const compassRose = document.getElementById('compass-rose');
        if (compassRose) {
            compassRose.style.transform = `rotate(${-heading}deg)`;
        }

        // Check if facing Qibla (within 10 degrees)
        const diff = Math.abs(heading - this.qiblaAngle);
        const normalizedDiff = Math.min(diff, 360 - diff);

        const status = document.getElementById('qibla-status');
        if (normalizedDiff < 10) {
            status.textContent = '✅ أنت تواجه القبلة! | You are facing Qibla!';
            status.style.background = 'rgba(0, 217, 163, 0.3)';
        } else {
            status.textContent = 'قم بتدوير الجهاز للعثور على القبلة | Rotate to find Qibla';
            status.style.background = 'rgba(0, 217, 163, 0.2)';
        }
    }

    calculatePrayerTimes() {
        if (!this.latitude || !this.longitude) return;

        const date = new Date();
        const times = this.getPrayerTimes(date, this.latitude, this.longitude);

        this.prayerTimes = times;
        this.displayPrayerTimes(times);
        this.calculateWeeklyTimes();
        this.findNextPrayer();
    }

    getPrayerTimes(date, lat, lng) {
        const times = {};

        // Simplified calculation using SunCalc-like algorithm
        const julianDate = this.getJulianDate(date);
        const sunPosition = this.getSunPosition(julianDate);

        // Calculate prayer times
        times.fajr = this.getPrayerTime(sunPosition, lat, lng, -18); // Fajr angle
        times.sunrise = this.getPrayerTime(sunPosition, lat, lng, -0.833);
        times.dhuhr = this.getPrayerTime(sunPosition, lat, lng, 0, true);
        times.asr = this.getAsrTime(sunPosition, lat, lng, 1); // Standard method
        times.maghrib = this.getPrayerTime(sunPosition, lat, lng, -0.833, false, true);
        times.isha = this.getPrayerTime(sunPosition, lat, lng, -17); // Isha angle

        return times;
    }

    getJulianDate(date) {
        return date.getTime() / 86400000 + 2440587.5;
    }

    getSunPosition(julianDate) {
        const D = julianDate - 2451545.0;
        const g = (357.529 + 0.98560028 * D) % 360;
        const q = (280.459 + 0.98564736 * D) % 360;
        const L = (q + 1.915 * Math.sin(this.toRad(g)) + 0.020 * Math.sin(this.toRad(2 * g))) % 360;
        const e = 23.439 - 0.00000036 * D;

        return { declination: Math.asin(Math.sin(this.toRad(e)) * Math.sin(this.toRad(L))) };
    }

    getPrayerTime(sunPos, lat, lng, angle, isDhuhr = false, isMaghrib = false) {
        const latRad = this.toRad(lat);

        if (isDhuhr) {
            const D = this.getJulianDate(new Date()) - 2451545.0;
            const eqTime = 4 * (this.toDeg(Math.atan(Math.tan(this.toRad((D * 0.98564736 + 280.459) % 360)) * Math.cos(this.toRad(23.439)))) - (D * 0.98564736 + 280.459) % 360);
            const solarNoon = 12 + (0 - lng * 4 / 60) - eqTime / 60;
            return this.decimalToTime(solarNoon);
        }

        const cosH = (Math.sin(this.toRad(angle)) - Math.sin(latRad) * Math.sin(sunPos.declination)) / 
                     (Math.cos(latRad) * Math.cos(sunPos.declination));

        if (cosH < -1 || cosH > 1) return null;

        const H = this.toDeg(Math.acos(cosH));
        const D = this.getJulianDate(new Date()) - 2451545.0;
        const eqTime = 4 * (this.toDeg(Math.atan(Math.tan(this.toRad((D * 0.98564736 + 280.459) % 360)) * Math.cos(this.toRad(23.439)))) - (D * 0.98564736 + 280.459) % 360);

        let time;
        if (isMaghrib) {
            const solarNoon = 12 + (0 - lng * 4 / 60) - eqTime / 60;
            time = solarNoon + H / 15;
        } else {
            const solarNoon = 12 + (0 - lng * 4 / 60) - eqTime / 60;
            time = solarNoon - H / 15;
        }

        return this.decimalToTime(time);
    }

    getAsrTime(sunPos, lat, lng, shadowFactor) {
        const latRad = this.toRad(lat);
        const angle = -this.toDeg(Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latRad - sunPos.declination)))));
        return this.getPrayerTime(sunPos, lat, lng, angle);
    }

    decimalToTime(decimal) {
        if (decimal === null) return '--:--';
        decimal = (decimal + 24) % 24;
        const hours = Math.floor(decimal);
        const minutes = Math.floor((decimal - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    displayPrayerTimes(times) {
        const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        prayers.forEach(prayer => {
            const element = document.getElementById(`time-${prayer}`);
            const item = document.querySelector(`[data-prayer="${prayer}"]`);

            if (element && times[prayer]) {
                element.textContent = times[prayer];

                // Parse time for comparison
                const [h, m] = times[prayer].split(':').map(Number);
                const prayerTime = h * 60 + m;

                // Remove old classes
                item.classList.remove('active', 'passed');

                // Add appropriate class
                if (prayerTime < currentTime) {
                    item.classList.add('passed');
                }
            }
        });

        this.highlightNextPrayer();
    }

    findNextPrayer() {
        const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        let nextPrayer = null;
        let minDiff = Infinity;

        prayers.forEach(prayer => {
            if (this.prayerTimes[prayer]) {
                const [h, m] = this.prayerTimes[prayer].split(':').map(Number);
                const prayerTime = h * 60 + m;
                let diff = prayerTime - currentTime;

                if (diff < 0) diff += 24 * 60; // Next day

                if (diff < minDiff) {
                    minDiff = diff;
                    nextPrayer = { name: prayer, time: this.prayerTimes[prayer], diff: diff };
                }
            }
        });

        this.nextPrayer = nextPrayer;

        // Update display
        if (nextPrayer) {
            const names = {
                fajr: 'الفجر | Fajr',
                sunrise: 'الشروق | Sunrise',
                dhuhr: 'الظهر | Dhuhr',
                asr: 'العصر | Asr',
                maghrib: 'المغرب | Maghrib',
                isha: 'العشاء | Isha'
            };
            document.getElementById('next-prayer-name').textContent = names[nextPrayer.name];
        }

        this.highlightNextPrayer();
    }

    highlightNextPrayer() {
        if (!this.nextPrayer) return;

        const item = document.querySelector(`[data-prayer="${this.nextPrayer.name}"]`);
        if (item) {
            // Remove existing badges
            const existingBadge = item.querySelector('.next-prayer-badge');
            if (existingBadge) existingBadge.remove();

            item.classList.add('active');

            // Add "Next" badge
            const nameDiv = item.querySelector('.prayer-info');
            const badge = document.createElement('span');
            badge.className = 'next-prayer-badge';
            badge.textContent = 'التالي | Next';
            nameDiv.appendChild(badge);
        }
    }

    updateCountdown() {
        if (!this.nextPrayer) return;

        const now = new Date();
        const [h, m] = this.nextPrayer.time.split(':').map(Number);
        let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);

        if (target < now) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.getElementById('countdown').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    calculateWeeklyTimes() {
        const tbody = document.getElementById('weekly-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const today = new Date().getDay();

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const times = this.getPrayerTimes(date, this.latitude, this.longitude);
            const isToday = i === 0;

            const row = document.createElement('tr');
            if (isToday) row.classList.add('today');

            row.innerHTML = `
                <td><strong>${days[date.getDay()]}</strong><br><small>${daysEn[date.getDay()]}</small></td>
                <td>${times.fajr || '--:--'}</td>
                <td>${times.sunrise || '--:--'}</td>
                <td>${times.dhuhr || '--:--'}</td>
                <td>${times.asr || '--:--'}</td>
                <td>${times.maghrib || '--:--'}</td>
                <td>${times.isha || '--:--'}</td>
            `;

            tbody.appendChild(row);
        }
    }

    updateDate() {
        const now = new Date();

        // Gregorian date
        const gregorianOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('gregorian-date').textContent = 
            now.toLocaleDateString('ar-SA', gregorianOptions);

        // Hijri date with offset
        this.updateHijriDate();
    }

    updateHijriDate() {
        const now = new Date();
        const hijriDate = this.gregorianToHijri(now);

        const hijriMonths = [
            'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 
            'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 
            'ذو القعدة', 'ذو الحجة'
        ];

        document.getElementById('hijri-date').textContent = 
            `${hijriDate.day} ${hijriMonths[hijriDate.month - 1]} ${hijriDate.year}هـ`;
    }

    gregorianToHijri(date) {
        const gd = date.getDate();
        const gm = date.getMonth() + 1;
        const gy = date.getFullYear();

        let jd = (1461 * (gy + 4800 + (gm - 14) / 12)) / 4 +
                 (367 * (gm - 2 - 12 * ((gm - 14) / 12))) / 12 -
                 (3 * ((gy + 4900 + (gm - 14) / 12) / 100)) / 4 +
                 gd - 32075;

        jd = Math.floor(jd);

        const l = jd - 1948440 + 10632;
        const n = Math.floor((l - 1) / 10631);
        const r = l - 10631 * n + 354;
        const j = (Math.floor((10985 - r) / 5316)) * (Math.floor((50 * r) / 17719)) +
                  (Math.floor(r / 5670)) * (Math.floor((43 * r) / 15238));

        let hd = Math.floor((30 * (j - 1)) / 10631) + j - 29;
        let hm = Math.floor((11 * hd + 330) / 325);
        let hy = Math.floor((3 * (n + j)) / 33) + 5520;

        // Apply offset
        hd += this.hijriOffset;

        // Normalize
        while (hd > 30) {
            hd -= 30;
            hm++;
        }
        while (hd < 1) {
            hd += 30;
            hm--;
        }
        while (hm > 12) {
            hm -= 12;
            hy++;
        }
        while (hm < 1) {
            hm += 12;
            hy--;
        }

        return { day: hd, month: hm, year: hy };
    }

    adjustHijri(delta) {
        this.hijriOffset += delta;

        // Limit to +/- 2 days
        if (this.hijriOffset > 2) this.hijriOffset = 2;
        if (this.hijriOffset < -2) this.hijriOffset = -2;

        this.updateHijriDisplay();
        this.updateHijriDate();
        this.saveSettings();
    }

    updateHijriDisplay() {
        const offset = this.hijriOffset;
        const sign = offset > 0 ? '+' : '';
        document.getElementById('hijri-offset').textContent = 
            `تعديل: ${sign}${offset} | Offset: ${sign}${offset}`;
    }

    toRad(deg) { return deg * Math.PI / 180; }
    toDeg(rad) { return rad * 180 / Math.PI; }
}

// Global instance
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new PrayerApp();
});

// Global functions for HTML onclick
function getLocation() {
    if (app) app.getLocation();
}

function adjustHijri(delta) {
    if (app) app.adjustHijri(delta);
}

function setView(view) {
    const todayView = document.getElementById('today-view');
    const weekView = document.getElementById('week-view');
    const buttons = document.querySelectorAll('.view-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (view === 'today') {
        todayView.style.display = 'flex';
        weekView.classList.remove('active');
        buttons[0].classList.add('active');
    } else {
        todayView.style.display = 'none';
        weekView.classList.add('active');
        buttons[1].classList.add('active');
        if (app) app.calculateWeeklyTimes();
    }
}

function installApp() {
    if (app && app.deferredPrompt) {
        app.deferredPrompt.prompt();
        app.deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                document.getElementById('install-btn').classList.remove('show');
            }
            app.deferredPrompt = null;
        });
    }
}
