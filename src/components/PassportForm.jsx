import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Row, Col, Button,
} from 'react-bootstrap';
import paysData from '../data/pays.json';
import typesVisa from '../data/typesVisa.json';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const initialState = {
  prenom: '',
  nom: '',
  sexe: '',
  date_naissance: '',
  etat_civil: '',
  numero_passport: '',
  nationalite: '',
  type_visa: '',
  profession: '',
  en_charge_de: '',
  frontalier: false,
  adresse_rdc: '',
  date_expiration: '',
  date_entree: '',
  date_retour: '',
  date_enregistrement: getTodayDate(),
};

function PassportForm({ onSubmit }) {
  const [formData, setFormData] = useState(initialState);
  const [paysList, setPaysList] = useState([]);
  const [visaList, setVisaList] = useState([]);

  useEffect(() => {
    setPaysList(paysData);
    setVisaList(typesVisa);
  }, []);

  const handleChange = (e) => {
    const {
      name, value, type, checked,
    } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date_enregistrement: getTodayDate(),
    });
    setFormData({ ...initialState, date_enregistrement: getTodayDate() });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Nom, Prénom, Sexe */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Prénom</Form.Label>
            <Form.Control name="prenom" value={formData.prenom} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Nom</Form.Label>
            <Form.Control name="nom" value={formData.nom} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Sexe</Form.Label>
            <Form.Select name="sexe" value={formData.sexe} onChange={handleChange} required>
              <option value="">-- Choisir --</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Date naissance, état civil, numéro de passeport */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date de naissance</Form.Label>
            <Form.Control type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>État civil</Form.Label>
            <Form.Select name="etat_civil" value={formData.etat_civil} onChange={handleChange} required>
              <option value="">-- Choisir --</option>
              <option value="célibataire">Célibataire</option>
              <option value="marié">Marié</option>
              <option value="divorcé">Divorcé</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Numéro de passeport</Form.Label>
            <Form.Control name="numero_passport" value={formData.numero_passport} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>

      {/* Nationalité, Type de visa, Profession */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Nationalité</Form.Label>
            <Form.Select name="nationalite" value={formData.nationalite} onChange={handleChange} required>
              <option value="">-- Choisir --</option>
              {paysList.map((pays) => (
                <option key={pays} value={pays}>
                  {pays}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Type de visa</Form.Label>
            <Form.Select name="type_visa" value={formData.type_visa} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              {visaList.map((visa) => (
                <option key={visa} value={visa}>
                  {visa}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Profession</Form.Label>
            <Form.Control name="profession" value={formData.profession} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      {/* En charge, Frontalier, Adresse RDC */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Personne en charge de</Form.Label>
            <Form.Control name="en_charge_de" value={formData.en_charge_de} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Frontalier de</Form.Label>
            <Form.Select name="frontalier" value={formData.frontalier} onChange={handleChange} required>
              <option value="">-- Choisir --</option>
              <option value="Ruzizi 1">Ruzizi 1</option>
              <option value="Ruzizi 2">Ruzizi 2</option>
              <option value="Kamanyola">Kamanyola</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Adresse en RDC</Form.Label>
            <Form.Control name="adresse_rdc" value={formData.adresse_rdc} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      {/* Dates diverses */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date d&apos;expiration</Form.Label>
            <Form.Control type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date d&apos;entrée</Form.Label>
            <Form.Control type="date" name="date_entree" value={formData.date_entree} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date de retour</Form.Label>
            <Form.Control type="date" name="date_retour" value={formData.date_retour} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date d&apos;enregistrement</Form.Label>
            <Form.Control
              type="date"
              name="date_enregistrement"
              value={formData.date_enregistrement}
              onChange={handleChange}
              readOnly
              disabled
            />
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" variant="success">Enregistrer</Button>
    </Form>
  );
}

// ✅ Validation des props
PassportForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default PassportForm;
