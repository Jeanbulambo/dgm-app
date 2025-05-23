import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container, Form, Button, Row, Col, Image,
} from 'react-bootstrap';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import db from '../db/indexedDb';

const PassportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

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
        toast.error('Enregistrement non trouvé !');
        navigate('/tri-simple');
        return;
      }
      setPassport(data);
      setFormData((prevFormData) => ({ ...prevFormData, ...data }));
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
    }
  };

  const handleExportPDF = async () => {
    const buttons = document.querySelectorAll('.no-print');
    const originalStyles = [];

    buttons.forEach((btn, index) => {
      originalStyles[index] = btn.style.display;
      // eslint-disable-next-line no-param-reassign
      btn.style.display = 'none';
    });

    const input = printRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new JsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`passport_${formData.nom}_${formData.prenom}.pdf`);
    buttons.forEach((btn, index) => {
      // eslint-disable-next-line no-param-reassign
      btn.style.display = originalStyles[index];
    });
  };

  if (!passport) return <p>Chargement...</p>;

  return (
    <Container className="my-3 p-3 border rounded shadow-sm" style={{ maxWidth: '900px' }}>
      <div ref={printRef}>
        <Row className="align-items-center mb-3">
          {formData.photo && (
            <Col md={3} className="text-center mb-2 mb-md-0">
              <Image
                src={formData.photo}
                alt="Photo passeport"
                rounded
                style={{ maxHeight: '150px', maxWidth: '100%' }}
              />
            </Col>
          )}
          <Col md={9} className="d-flex justify-content-md-end justify-content-center flex-wrap gap-2">
            <div className="no-print">
              {!editMode ? (
                <>
                  <Button variant="primary" size="sm" onClick={() => setEditMode(true)}>Modifier</Button>
                  {' '}
                  <Button variant="secondary" size="sm" onClick={() => navigate('/tri-simple')}>Retour</Button>
                  {' '}
                  <Button variant="outline-dark" size="sm" onClick={handleExportPDF}>Exporter en PDF</Button>
                </>
              ) : (
                <>
                  <Button variant="success" size="sm" onClick={handleSave}>Sauvegarder</Button>
                  {' '}
                  <Button variant="danger" size="sm" onClick={() => setEditMode(false)}>Annuler</Button>
                </>
              )}
            </div>
          </Col>
        </Row>

        <h5 className="text-center mb-3">
          Détail sur l’expatrié ID :
          {' '}
          {passport.id}
        </h5>

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
                      disabled={!editMode || key === 'date_enregistrement'}
                      size="sm"
                    />
                  </Form.Group>
                </Col>
              );
            })}
          </Row>
        </Form>
      </div>
    </Container>
  );
};

export default PassportDetail;
