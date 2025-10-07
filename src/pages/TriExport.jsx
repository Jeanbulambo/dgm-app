import { useEffect, useState } from 'react';
import {
  Container, Table, Form, Button, Row, Col,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import db from '../db/indexedDb';

const columnMapping = {
  prenom: 'Prénom',
  nom: 'Nom',
  numero_passport: 'Numéro Passeport',
  sexe: 'Sexe',
  date_naissance: 'Date de Naissance',
  etat_civil: 'Etat Civil',
  profession: 'Profession',
  nationalite: 'Nationalité',
  en_charge_de: 'En Charge De',
  type_visa: 'Type Visa',
  date_expiration: 'Date Expiration',
  date_entree: 'Date Entrée',
  frontalier: 'Frontalier',
  date_retour: 'Date Retour',
  adresse_rdc: 'Adresse RDC',
  date_enregistrement: 'Date Enregistrement',
  agent_saisi: 'Agent Saisi',
};

const TriExport = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [prenomFilter, setPrenomFilter] = useState('');
  const [passportFilter, setPassportFilter] = useState('');
  const [selectedNat, setSelectedNat] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nationalities, setNationalities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allData = await db.passports.toArray();
      const sortedData = allData.sort(
        (a, b) => new Date(b.date_enregistrement) - new Date(a.date_enregistrement),
      );
      const lastTen = sortedData.slice(0, 10);
      setData(lastTen);
      setFilteredData(lastTen);

      const nats = [...new Set(allData.map((item) => item.nationalite))];
      setNationalities(nats);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const matchPrenom = prenomFilter
        ? (item.prenom || '').toLowerCase().includes(prenomFilter.toLowerCase())
        : true;

      const matchPassport = passportFilter
        ? (item.numero_passport || '').toLowerCase().includes(passportFilter.toLowerCase())
        : true;

      const matchNat = selectedNat ? item.nationalite === selectedNat : true;

      const itemDate = new Date(item.date_enregistrement);
      const matchDate = (startDate ? itemDate >= new Date(startDate) : true)
        && (endDate ? itemDate <= new Date(endDate) : true);

      return matchPrenom && matchPassport && matchNat && matchDate;
    });

    setFilteredData(filtered);
  }, [prenomFilter, passportFilter, selectedNat, startDate, endDate, data]);

  const exportExcel = () => {
    const worksheetData = filteredData.map((item) => {
      const row = {};
      Object.keys(columnMapping).forEach((key) => {
        if (key === 'photo') return; // Ignorer les photos
        let value = item[key] || '';
        if (key.includes('date') && value) value = new Date(value);
        // Tronquer si trop long (optionnel)
        if (typeof value === 'string' && value.length > 32767) {
          value = value.substring(0, 32767);
        }
        row[columnMapping[key]] = value;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Mettre les en-têtes en gras
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = { font: { bold: true } };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expatriés');
    XLSX.writeFile(workbook, 'expatries.xlsx');
  };

  return (
    <Container className="my-4">
      <h3 className="mb-4">Enregistrements</h3>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrer par prénom"
            value={prenomFilter}
            onChange={(e) => setPrenomFilter(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filtrer par numéro passeport"
            value={passportFilter}
            onChange={(e) => setPassportFilter(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Select
            value={selectedNat}
            onChange={(e) => setSelectedNat(e.target.value)}
          >
            <option value="">Toutes les nationalités</option>
            {nationalities.map((nat) => (
              <option key={nat} value={nat}>{nat}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="mb-3" align="center">
        <Col md={3}>
          <Form.Label>Date début</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Date fin</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md="auto">
          <Button variant="success" className="me-2" onClick={exportExcel}>
            Exporter Excel
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Retour
          </Button>
        </Col>
      </Row>

      {filteredData.length > 0 ? (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                {Object.values(columnMapping)
                  .filter((val) => val !== 'Photo')
                  .map((val) => (
                    <th key={val}>{val}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id}>
                  {Object.keys(columnMapping)
                    .filter((key) => key !== 'photo')
                    .map((key) => (
                      <td key={key}>
                        {key.includes('date') && row[key]
                          ? new Date(row[key]).toLocaleDateString()
                          : row[key]}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <p>Aucune donnée à afficher.</p>
      )}
    </Container>
  );
};

export default TriExport;
