import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container, Form, Button, Row, Col,
} from 'react-bootstrap';
import db from '../db/indexedDb';

const PassportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [passport, setPassport] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    numero_passport: '',
    sexe: '',
    date_naissance: '',
    etat_civil: '',
    profession: '',
    nationalite: '',
    en_charge_de: '',
    type_visa: '',
    date_expiration: '',
    date_entree: '',
    frontalier: '',
    date_retour: '',
    adresse_rdc: '',
    date_enregistrement: '',
  });

  useEffect(() => {
    const fetchPassport = async () => {
      const data = await db.passports.get(Number(id));
      if (!data) {
        toast.success('Enregitsrement non trouvé !');
        navigate('/tri-simple');
        return;
      }
      setPassport(data);
      setFormData({
        prenom: data.prenom || '',
        nom: data.nom || '',
        numero_passport: data.numero_passport || '',
        sexe: data.sexe || '',
        date_naissance: data.date_naissance || '',
        etat_civil: data.etat_civil || '',
        profession: data.profession || '',
        nationalite: data.nationalite || '',
        en_charge_de: data.en_charge_de || '',
        type_visa: data.type_visa || '',
        date_expiration: data.date_expiration || '',
        date_entree: data.date_entree || '',
        frontalier: data.frontalier || '',
        date_retour: data.date_retour || '',
        adresse_rdc: data.adresse_rdc || '',
        date_enregistrement: data.date_enregistrement || '',
      });
    };
    fetchPassport();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await db.passports.update(Number(id), formData);
      toast.success('Mise à jour reussie !');
      setEditMode(false);
    } catch (error) {
      toast.success('Erreure lors de la mise a jour !');
    }
  };

  if (!passport) return <p>Chargement...</p>;

  return (
    <Container className="my-4">
      <h3>
        Détail de l’expatrié ID :
        {passport.id}
      </h3>
      <Form>
        <Row>
          {Object.entries(formData).map(([key, value]) => (
            <Col md={6} key={key} className="mb-3">
              <Form.Label>{key.replace(/_/g, ' ').toUpperCase()}</Form.Label>
              <Form.Control
                type={key.includes('date') ? 'date' : 'text'}
                name={key}
                value={value}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Col>
          ))}
        </Row>

        {!editMode ? (
          <>
            <Button variant="primary" onClick={() => setEditMode(true)} className="me-2">
              Modifier
            </Button>
            <Button variant="secondary" onClick={() => navigate('/tri-simple')}>
              Retour
            </Button>
          </>
        ) : (
          <>
            <Button variant="success" onClick={handleSave} className="me-2">
              Sauvegarder
            </Button>
            <Button variant="danger" onClick={() => setEditMode(false)}>
              Annuler
            </Button>
          </>
        )}
      </Form>
    </Container>
  );
};

export default PassportDetail;
