import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Row, Col, Button,
} from 'react-bootstrap';
import paysData from '../data/pays.json';
import typesVisa from '../data/typesVisa.json';
import db from '../db/indexedDb.js'; // <-- ajuste ce chemin vers ta base Dexie

// Import du css
import './PassportForm.css';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const initialState = {
  prenom: '',
  nom: '',
  photo: null,
  sexe: '',
  date_naissance: '',
  etat_civil: '',
  numero_passport: '',
  nationalite: '',
  type_visa: '',
  profession: '',
  prise_en_charge: '',
  frontiere: '',
  adresse_rdc: '',
  date_expiration_pp: '',
  date_entree: '',
  date_expiration_visa: '',
  date_enregistrement: getTodayDate(),
  agent_au_poste: '',
};

function PassportForm({ onSubmit }) {
  const [formData, setFormData] = useState(initialState);
  const [paysList, setPaysList] = useState([]);
  const [visaList, setVisaList] = useState([]);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, photo: null }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification doublon numéro_passport dans Dexie
    const existing = await db.passports
      .where('numero_passport')
      .equals(formData.numero_passport.trim())
      .first();

    if (existing) {
      alert(`Le numéro de passeport "${formData.numero_passport}" ce numéro PP existe déjà ! Veuillez entrer un nouveau.`);
      return; // Stop submission
    }

    await onSubmit({
      ...formData,
      date_enregistrement: getTodayDate(),
    });

    setFormData({ ...initialState, date_enregistrement: getTodayDate() });

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="fullscreen-form">
      <Row className="mb-2">
        <Col md={6}>
          <Form.Group controlId="formPhoto">
            <Form.Label>Photo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              ref={fileInputRef}
            />
            {formData.photo && (
              <div className="mt-2">
                <img
                  src={formData.photo}
                  alt="capture expatrie"
                  style={{
                    width: '150px', height: 'auto', borderRadius: '5px', border: '1px solid #ccc',
                  }}
                />
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Nom, Prénom, Sexe */}
      <Row className="mb-2">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Prénom</Form.Label>
            <Form.Control name="prenom" value={formData.prenom} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Nom(s)</Form.Label>
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
      <Row className="mb-2">
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
              <option value="marié">Marié(e)</option>
              <option value="divorcé">Divorcé(e)</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Numéro Passeport</Form.Label>
            <Form.Control name="numero_passport" value={formData.numero_passport} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>

      {/* Nationalité, Type de visa, Date d'expiration visa */}
      <Row className="mb-2">
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
            <Form.Label>Date D&apos;expiration Visa</Form.Label>
            <Form.Control type="date" name="date_expiration_visa" value={formData.date_expiration_visa} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      {/* Dates expiration PP, entrée, frontière */}
      <Row className="mb-2">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date D&apos;expiration PP</Form.Label>
            <Form.Control type="date" name="date_expiration_pp" value={formData.date_expiration_pp} onChange={handleChange} />
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
            <Form.Label>Frontière de</Form.Label>
            <Form.Select name="frontiere" value={formData.frontiere} onChange={handleChange} required>
              <option value="">-- Choisir --</option>
              <option value="Ruzizi 1">Ruzizi 1</option>
              <option value="Ruzizi 2">Ruzizi 2</option>
              <option value="Kamanyola">Kamanyola</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Adresse RDC, prise en charge, profession */}
      <Row className="mb-2">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Adresse en RDC (ville/commune/Quartier/Avenue)</Form.Label>
            <Form.Control name="adresse_rdc" value={formData.adresse_rdc} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Prise en charge</Form.Label>
            <Form.Control name="prise_en_charge" value={formData.prise_en_charge} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Profession</Form.Label>
            <Form.Control name="profession" value={formData.profession} onChange={handleChange} />
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
        <Col md={4}>
          <Form.Group>
            <Form.Label>Agent au poste</Form.Label>
            <Form.Control name="agent_au_poste" value={formData.agent_au_poste || ''} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      {/* Bouton Envoyer */}
      <Row>
        <Col md={12}>
          <Button variant="primary" type="submit" className="mt-2">
            Enregistrer
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

PassportForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default PassportForm;
