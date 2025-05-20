import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PassportForm from '../components/PassportForm';
import db from '../db/indexedDb';
import dgmBrand from '../assets/dgmBrand.jpg'; // Assure-toi qu'il existe

function Home() {
  const navigate = useNavigate();

  const handleFormSubmit = async (data) => {
    try {
      await db.passports.add(data);
      toast.success('Données enregistrées localement avec succès !');
    } catch {
      toast.error("Erreur lors de l'enregistrement !");
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '40px' }}>
      <Container className="bg-white rounded shadow p-4">
        <div className="d-flex align-items-center mb-4">
          <img src={dgmBrand} alt="DGM Logo" style={{ height: '60px', marginRight: '20px' }} />
          <div>
            <h1 className="mb-0">DGM SUD KIVU</h1>
            <h4 className="text-muted">ENREGISTREMENT DES EXPATRIES</h4>
          </div>
        </div>

        <PassportForm onSubmit={handleFormSubmit} />

        <hr className="my-5" />

        <div className="text-center">
          <Button variant="primary" className="me-3" onClick={() => navigate('/tri-simple')}>
            Aller à Tri Simple
          </Button>
          <Button variant="secondary" onClick={() => navigate('/tri-export')}>
            Aller à Tri + Export
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default Home;
