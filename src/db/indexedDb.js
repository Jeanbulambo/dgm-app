import Dexie from 'dexie';

// Création de la base de données
const db = new Dexie('PassportDB');

// Définition du schéma de la table
db.version(1).stores({
  passports: '++id, prenom, nom, numero_passport, nationalite, date_enregistrement, sexe, date_naissance, etat_civil, type_visa, profession, photo, date_entree, date_expiration_pp, date_expiration_visa, agent_au_poste, prise_en_charge, frontiere', // index
});

export default db;
