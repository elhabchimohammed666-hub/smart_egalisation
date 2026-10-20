# Mo9ata3a Smart (المقاطعة الذكية)
### Plateforme Numérique Intelligente des Services Administratifs Communaux
**Architecture MERN Stack (MongoDB, Express.js, React, Node.js) • Module IA & Reconnaissance Optique CIN**

---

## 🏛️ 1. Présentation du Projet

**Mo9ata3a Smart** est une plateforme numérique citoyenne et administrative conçue pour dématérialiser et fluidifier les interactions entre les citoyens marocains et les bureaux de l'arrondissement communal (*lmo9ata3at*).

La plateforme résout les défis récurrents du service public local : déplacements physiques répétés, files d'attente aux guichets, documents papier égarés, manque de visibilité sur l'avancement des dossiers, et surcharge des agents administratifs.

### 🌟 Fonctionnalités Clés & Architecture Deux Espaces :
1. **Portail Citoyen (Public & Sécurisé)** :
   - **Enrôlement & Inscription IA par CIN** : Détection automatique des deux faces de la Carte d'Identité Nationale marocaine (CIN), évaluation de la lisibilité/netteté de l'image, et extraction optique des données d'état civil.
   - **Décision Automatique Accept / Reject** : Application stricte des 6 règles de conformité officielles sans intervention manuelle obligatoire.
   - **Catalogue des Services** : Consultation des démarches (Certificat de résidence, Attestation de célibat, Légalisation de signature, etc.), exigences documentaires et délais de traitement.
   - **Dépôt & Sauvegarde de Brouillon** : Téléversement sécurisé des justificatifs avec numéro de dossier unique (`REQ-YYYY-XXXX`).
   - **Suivi en Direct & Compléments** : Notification en temps réel et interface interactive pour ré-émettre une pièce manquante suite à une demande d'action de l'agent.
   - **Retrait par Code Unique** : Délivrance au guichet contre présentation de la CIN physique et du code de retrait (`COL-XXXXXX`).

2. **Espace Administratif (Agents & Administrateurs)** :
   - **Tableau de Bord Opérationnel** : Indicateurs KPI (total citoyens, dossiers en cours, actions requises, délais moyens réels, ventilation par service, journaux récents).
   - **Machine à États Finis (Workflow Stricte)** : Transitions contrôlées interdisant les sauts d'étapes non conformes (`Draft` ➔ `Submitted` ➔ `Under Review` ➔ `Action Required` ➔ `Approved` ➔ `Ready for Collection` ➔ `Issued`).
   - **Registre des Citoyens** : Consultation des profils certifiés, protection absolue contre les doublons de CIN, et traçabilité des modifications de coordonnées.
   - **Configuration du Catalogue** : Ajout/mise à jour des services communaux, modification des pièces exigées et délais (Admin).
   - **Gestion des Agents & Habilitations** : Création, gestion et désactivation des comptes d'agents administratifs (Admin).
   - **Journaux d'Audit & Sécurité** : Historique inaltérable de toutes les décisions de validation, transitions de statuts et opérations sensibles (Admin).

---

## 🛠️ 2. Stack Technologique (Conforme Spécifications)

Conformément à la spécification (Section 5.1 du guide), la plateforme est construite **exclusivement** avec la stack MERN :

| Composant | Technologie | Rôle dans l'Architecture |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Interface réactive, bilingue (Français / العربية RTL), upload & capture caméra |
| **Backend Principal** | Node.js, Express.js (ES Modules) | API RESTful, authentification JWT, hachage bcrypt, téléversement Multer |
| **Base de Données** | MongoDB & Mongoose | Collections : `User`, `CitizenProfile`, `Service`, `Request`, `Notification`, `AuditLog` |
| **Moteur IA & OCR** | Node.js OCR Service (`Jimp` & `Tesseract.js`) | Analyse de contraste, netteté/flou, parsing optique des CIN marocaines |
| **Tests & Fiabilité** | Node.js Test Runner Natif (`node:test`) | Tests unitaires OCR, règles de validation des CIN et machine à états finis |

---

## 🤖 3. Fonctionnement du Module IA / OCR (Moroccan CIN Engine)

Le module d'analyse d'images et de validation est implémenté nativement en JavaScript/Node.js à l'intérieur du backend Express (sans micro-service Python externe) :

### Flux de Traitement :
1. **Évaluation de la Qualité de l'Image** :
   - Contrôle de la résolution minimale (≥ 320x200px).
   - Calcul de la luminance relative (rejet si trop sombre `< 25` ou éblouie/surexposée `> 245`).
   - Analyse du gradient laplacien / contraste pour détecter les images floues ou uniformes.
2. **Extraction Optique (OCR)** :
   - Reconnaissance du texte sur les deux faces (Recto et Verso).
   - Parsing par expressions régulières marocaines :
     - Identifiant CIN : `[A-Z]{1,2}[0-9]{5,7}` (ex: `BK789456`, `AB654321`).
     - Nom, Prénom, Nom arabe, Date de naissance, Sexe, Nationalité, Adresse, Validité, Ligne MRZ.
3. **Application des 6 Résultats Officiels (Accept / Reject)** :
   - `Accepted` : Extraction fiable, conformité des champs et carte non enregistrée.
   - `Rejected: Missing Image` : Absence de l'une ou des deux faces.
   - `Rejected: Poor Quality` : Image trop floue, sombre ou éblouie.
   - `Rejected: Incomplete Extraction` : Données essentielles illisibles ou tronquées.
   - `Rejected: Invalid Information` : Format de CIN non marocain ou incohérence Recto/Verso.
   - `Rejected: Duplicate CIN` : Numéro de CIN déjà associé à un compte citoyen existant.

---

## 🚀 4. Guide d'Installation & Lancement Rapide

### Prérequis :
- **Node.js** (v18+ ou v20+)
- **npm** (inclus avec Node.js)
- *MongoDB* : Soit un cluster MongoDB Atlas (via `MONGODB_URI`), soit MongoDB local. **Si aucune base n'est configurée, le serveur démarre automatiquement une base de données en mémoire (`mongodb-memory-server`) pour un fonctionnement 100% autonome et immédiat !**

### Étapes d'installation :

1. **Cloner ou ouvrir le répertoire du projet** :
   ```bash
   cd c:\Users\RANIA\Desktop\project\mo9ata3a_smart
   ```

2. **Installer les dépendances** :
   ```bash
   # Dépendances du serveur
   npm --prefix server install

   # Dépendances du client React
   npm --prefix client install
   ```

3. **Générer les données de démonstration & images synthétiques** :
   ```bash
   node server/seed/generateSyntheticCards.js
   node server/seed/seedData.js
   ```

4. **Lancer les serveurs Backend et Frontend** :
   - **Backend (Port 5000)** :
     ```bash
     cd server
     node server.js
     ```
   - **Frontend (Port 5173)** :
     ```bash
     cd client
     npm run dev
     ```
   - Ouvrez votre navigateur sur **http://localhost:5173**.

---

## 👥 5. Comptes de Démonstration (1-Clic sur la page d'accueil)

| Rôle | Email | Mot de Passe | CIN / Particularité |
| :--- | :--- | :--- | :--- |
| **Citoyen (Démonstration)** | `citizen@mo9ata3a.ma` | `citizenPassword123!` | CIN: `BK789456` (Yassine El Amrani) |
| **Agent / Manager Mo9ata3a** | `manager@mo9ata3a.ma` | `managerPassword123!` | Division de l'État Civil |
| **Administrateur Système** | `admin@mo9ata3a.ma` | `adminPassword123!` | Gestion catalogue, agents & audit |

*Astuce* : Sur la page de connexion ou la page d'accueil, des boutons de pré-remplissage 1-clic permettent de se connecter instantanément à chaque profil.

---

## 🧪 6. Exécution des Tests Automatisés

Le projet inclut une suite de tests unitaires couvrant les cas limites de l'OCR, les 6 issues de validation et la machine à états finis des démarches :

```bash
# Exécuter l'ensemble des tests
npm test

# Ou exécuter spécifiquement les tests OCR et validation :
node --test server/tests/ocr_and_validation.test.js

# Ou exécuter les tests de la machine à états et sécurité :
node --test server/tests/workflow_and_auth.test.js
```

---

## 🌐 7. Déploiement en Production

La structure est prête pour un déploiement gratuit ou à faible coût selon les recommandations du guide :
- **Frontend React** : Déploiement sur **Vercel** ou **Netlify** (dossier `client/`, commande de build `npm run build`, dossier de sortie `dist`).
- **Backend Express** : Déploiement sur **Render** ou **Railway** (dossier `server/`, commande de démarrage `node server.js`).
- **Base de Données** : **MongoDB Atlas** (cluster M0 gratuit). Il suffit de renseigner la variable d'environnement `MONGODB_URI`.

---

## 🔒 8. Protection des Données & Conformité (Loi 09-08)
- Les mots de passe sont hachés de manière irréversible avec `bcryptjs` (salt 10).
- Les données d'identité extraites de la CIN sont en lecture seule pour les citoyens et ne peuvent pas être altérées manuellement.
- Les documents justificatifs téléversés sont isolés et protégés contre les liens prévisibles.
- Chaque accès, rejet ou mise à jour de statut génère une trace d'audit consultable par les administrateurs.
