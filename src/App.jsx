import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TriSimple from './pages/TriSimple';
import TriExport from './pages/TriExport';
import PassportDetail from './pages/PassportDetail';

const dummyData = [
  {
    prenom: 'Jean',
    nom: 'Bulambo',
    numero_passport: 'CD123456',
    sexe: 'Masculin',
    date_naissance: '1990-01-01',
    etat_civil: 'Célibataire',
    profession: 'Ingénieur',
    nationalite: 'Congolaise',
    prise_en_charge: 'Projet A',
    type_visa: 'Touristique',
    date_expiration_pp: '2030-01-01',
    date_entree: '2024-05-01',
    frontiere: 'Non',
    date_expiration_visa: '2024-06-01',
    adresse_rdc: 'Goma',
    date_enregistrement: '2025-05-19',
  },
  {
    prenom: 'Amina',
    nom: 'Ngoma',
    numero_passport: 'CD654321',
    sexe: 'Féminin',
    date_naissance: '1995-03-15',
    etat_civil: 'Mariée',
    profession: 'Médecin',
    nationalite: 'Rwandaise',
    prise_en_charge: 'Projet B',
    type_visa: 'Affaires',
    date_expiration_pp: '2029-09-01',
    date_entree: '2024-04-15',
    frontiere: 'Oui',
    date_expiration_visa: '2024-05-30',
    adresse_rdc: 'Bukavu',
    date_enregistrement: '2025-05-19',
  },
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tri-simple" element={<TriSimple />} />
        <Route path="/tri-export" element={<TriExport data={dummyData} />} />
        <Route path="/passport/:id" element={<PassportDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
