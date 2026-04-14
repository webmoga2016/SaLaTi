// Configuration des Adhan (Appels à la prière)
const ADHAN_SOURCES = {
    mecca: {
        name: 'مكة المكرمة | Makkah',
        url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_afaasee/adhan.mp3',
        duration: 52,
        description: 'Adhan de la Mosquée Sacrée de Makkah'
    },
    medina: {
        name: 'المدينة المنورة | Madinah',
        url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_afaasee/adhan_madina.mp3',
        duration: 48,
        description: 'Adhan de la Mosquée du Prophète à Madinah'
    },
    morocco: {
        name: 'المغرب التقليدي | Morocco Traditional',
        url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
        duration: 50,
        description: 'Adhan traditionnel marocain'
    },
    egypt: {
        name: 'مصر | Egypt',
        url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
        duration: 45,
        description: 'Adhan égyptien classique'
    },
    turkey: {
        name: 'تركيا | Turkey',
        url: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
        duration: 55,
        description: 'Adhan turc traditionnel'
    },
    algeria: {
        name: 'الجزائر | Algeria',
        url: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
        duration: 48,
        description: 'Adhan algérien'
    },
    tunisia: {
        name: 'تونس | Tunisia',
        url: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
        duration: 50,
        description: 'Adhan tunisien'
    },
    andalusia: {
        name: 'الأندلس | Andalusia',
        url: 'https://www.islamcan.com/audio/adhan/azan6.mp3',
        duration: 52,
        description: 'Adhan de style andalou'
    },
    short: {
        name: 'مختصر | Short (30s)',
        url: 'https://www.islamcan.com/audio/adhan/azan_short.mp3',
        duration: 30,
        description: 'Version courte pour tests'
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADHAN_SOURCES;
}
