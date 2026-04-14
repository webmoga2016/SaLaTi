# 🚀 Guide d'installation / Setup Guide

## Étape 1: GitHub Repository

### 1.1 Créer un nouveau repository
1. Allez sur [GitHub](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le `prayer-app` (ou autre nom)
4. Rendez-le Public
5. Cochez "Add a README file" (optionnel)
6. Cliquez "Create repository"

### 1.2 Uploader les fichiers
Option A - Upload direct:
1. Dans votre repository, cliquez sur "Add file" → "Upload files"
2. Glissez-déposez tous les fichiers extraits du ZIP
3. Cliquez "Commit changes"

Option B - Git command line:
```bash
git clone https://github.com/VOTRE_USERNAME/prayer-app.git
cd prayer-app
# Copiez tous les fichiers ici
git add .
git commit -m "Initial commit"
git push origin main
```

## Étape 2: Activer GitHub Pages

1. Dans votre repository, allez dans **Settings**
2. Cliquez sur **Pages** dans le menu de gauche
3. Sous "Source", sélectionnez **Deploy from a branch**
4. Sélectionnez la branche **main** et dossier **/(root)**
5. Cliquez **Save**
6. Attendez 2-3 minutes
7. Votre URL sera: `https://votreusername.github.io/prayer-app`

## Étape 3: Convertir en APK avec PWABuilder

### 3.1 Préparation
1. Assurez-vous que GitHub Pages est actif (étape 2)
2. Visitez [PWABuilder.com](https://www.pwabuilder.com)
3. Entrez votre URL GitHub Pages

### 3.2 Génération de l'APK
1. Cliquez sur **Start**
2. Attendez l'analyse (score devrait être > 80)
3. Cliquez sur **Build My Package**
4. Sélectionnez **Android**
5. Cliquez sur **Generate Package**
6. Téléchargez le fichier `.apk`

### 3.3 Installation sur Android
1. Transférez le fichier APK sur votre téléphone
2. Autorisez l'installation de sources inconnues si demandé
3. Installez l'application
4. Profitez! 🎉

## 🔧 Configuration avancée

### Personnalisation des couleurs
Modifiez les variables CSS dans `index.html`:
```css
:root {
    --primary: #0d7377;      /* Couleur principale */
    --accent: #f39c12;       /* Couleur d'accent */
    --bg-dark: #0a0e27;      /* Fond sombre */
}
```

### Modification des méthodes de calcul
Dans `app.js`, modifiez les angles de calcul:
```javascript
times.fajr = this.getPrayerTime(sunPos, lat, lng, -18); // Angle Fajr
times.isha = this.getPrayerTime(sunPos, lat, lng, -17); // Angle Isha
```

## 📱 Fonctionnalités

- ✅ Bilingue (Arabe/Anglais)
- ✅ Boussole Qibla interactive
- ✅ Calendrier Hijri ajustable (±2 jours)
- ✅ Vue hebdomadaire
- ✅ Compte à rebours
- ✅ Fonctionne hors-ligne
- ✅ Installation sur écran d'accueil

## 🆘 Support

En cas de problème:
1. Vérifiez la console du navigateur (F12)
2. Assurez-vous que la géolocalisation est autorisée
3. Pour la boussole, utilisez HTTPS (obligatoire pour iOS)

---

**Félicitations! Votre application est prête!** 🎊
