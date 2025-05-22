import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container, Form, Button, Row, Col, Image,
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
    agent_saisi: '',
    photo: '',
  });

  useEffect(() => {
    const fetchPassport = async () => {
      const data = await db.passports.get(Number(id));
      if (!data) {
        toast.error("Enregistrement non trouvé !");
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
        agent_saisi:data.agent_saisi || '',
        photo: data.photo || '',
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
      toast.success('Mise à jour réussie !');
      setEditMode(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour !');
      console.error(error);
    }
  };

  if (!passport) return <p>Chargement...</p>;

  return (
    <Container className="my-3 p-3 border rounded shadow-sm" style={{ maxWidth: '900px' }}>
      <h4 className="text-center mb-3">
        Détail sur l’expatrié ID : {passport.id}
      </h4>

      {formData.photo && (
        <div className="mb-3 text-center">
          <Image
            src={formData.photo}
            alt="Photo passeport"
            rounded
            style={{ maxHeight: '180px', maxWidth: '100%' }}
          />
        </div>
      )}

      <Form>
        <Row className="g-2">
          {Object.entries(formData).map(([key, value]) => {
            if (key === 'photo') return null;
            return (
              <Col md={4} sm={6} xs={12} key={key}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Form.Label>
                  <Form.Control
                    type={key.includes('date') ? 'date' : 'text'}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    disabled={!editMode || key === 'date_enregistrement'} // empêche la modification de date_enregistrement
                    size="sm"
                  />

                </Form.Group>
              </Col>
            );
          })}
        </Row>

        <div className="mt-3 d-flex justify-content-center gap-2 flex-wrap">
          {!editMode ? (
            <>
              <Button variant="primary" size="sm" onClick={() => setEditMode(true)}>
                Modifier
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tri-simple')}>
                Retour
              </Button>
            </>
          ) : (
            <>
              <Button variant="success" size="sm" onClick={handleSave}>
                Sauvegarder
              </Button>
              <Button variant="danger" size="sm" onClick={() => setEditMode(false)}>
                Annuler
              </Button>
            </>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default PassportDetail;
