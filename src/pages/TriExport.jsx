import { useEffect, useState } from 'react';
import {
  Container, Table, Form, Button, Row, Col,
} from 'react-bootstrap';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import db from '../db/indexedDb';

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
        ? item.prenom.toLowerCase().includes(prenomFilter.toLowerCase())
        : true;

      const matchPassport = passportFilter
        ? item.numero_passport.toLowerCase().includes(passportFilter.toLowerCase())
        : true;

      const matchNat = selectedNat ? item.nationalite === selectedNat : true;

      const itemDate = new Date(item.date_enregistrement);
      const matchDate = (startDate ? itemDate >= new Date(startDate) : true)
        && (endDate ? itemDate <= new Date(endDate) : true);

      return matchPrenom && matchPassport && matchNat && matchDate;
    });

    setFilteredData(filtered);
  }, [prenomFilter, passportFilter, selectedNat, startDate, endDate, data]);

  const exportCSV = () => {
    const csv = Papa.unparse(
      filteredData.map(({ photo, id, ...rest }) => rest),
      {
        quotes: false,
        delimiter: ';',
        skipEmptyLines: true,
      },
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'donnees_exportees.csv');
  };

  return (
    <Container className="my-4">
      <h3 className="mb-4">Enregistrements</h3>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label htmlFor="prenomFilter">Filtrer par prénom</Form.Label>
          <Form.Control
            id="prenomFilter"
            name="prenomFilter"
            type="text"
            placeholder="Filtrer par prénom"
            value={prenomFilter}
            onChange={(e) => setPrenomFilter(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Label htmlFor="passportFilter">Filtrer par numéro passeport</Form.Label>
          <Form.Control
            id="passportFilter"
            name="passportFilter"
            type="text"
            placeholder="Filtrer par numéro passeport"
            value={passportFilter}
            onChange={(e) => setPassportFilter(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Label htmlFor="selectedNat">Nationalité</Form.Label>
          <Form.Select
            id="selectedNat"
            name="selectedNat"
            value={selectedNat}
            onChange={(e) => setSelectedNat(e.target.value)}
          >
            <option value="">Toutes les nationalités</option>
            {nationalities.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="mb-3" align="center">
        <Col md={3}>
          <Form.Label htmlFor="startDate">Date enregistrement début</Form.Label>
          <Form.Control
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label htmlFor="endDate">Date enregistrement fin</Form.Label>
          <Form.Control
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md="auto">
          <Button variant="primary" onClick={exportCSV} className="me-2">
            Exporter CSV
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
                {Object.keys(filteredData[0] || {})
                  .filter((key) => key !== 'photo' && key !== 'id')
                  .map((key) => (
                    <th key={key}>{key.toUpperCase()}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.numero_passport || JSON.stringify(row)}>
                  {Object.entries(row)
                    .filter(([key]) => key !== 'photo' && key !== 'id')
                    .map(([key, val]) => (
                      <td key={key}>{String(val)}</td>
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
