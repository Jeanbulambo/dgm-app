import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import PassportForm from '../components/PassportForm';
import db from '../db/indexedDb'; // <- IMPORTATION DE LA DB

function Home() {
  const navigate = useNavigate();

  const handleFormSubmit = async (data) => {
    try {
      await db.passports.add(data);
      alert("Données enregistrées localement avec succès !");
    } catch (error) {
      console.error("Erreur lors de l’enregistrement :", error);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Formulaire d'enregistrement</h1>
      <PassportForm onSubmit={handleFormSubmit} />

      <hr className="my-5" />
      <div>
        <Button variant="primary" className="me-3" onClick={() => navigate('/tri-simple')}>
          Aller à Tri Simple
        </Button>
        <Button variant="secondary" onClick={() => navigate('/tri-export')}>
          Aller à Tri + Export
        </Button>
      </div>
    </Container>
  );
}

export default Home;
