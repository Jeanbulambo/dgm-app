import { useEffect, useState } from 'react';
import {
  Container, Table, Form, Button, Row, Col,
} from 'react-bootstrap';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import JsPDF from 'jspdf'; // Correction ici : majuscule pour correspondre à new-cap
import 'jspdf-autotable';
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
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'donnees_exportees.csv');
  };

  const exportPDF = () => {
    const doc = new JsPDF(); // Correction ici
    doc.text('Données Exportées', 14, 15);
    const tableColumn = Object.keys(filteredData[0] || {});
    const tableRows = filteredData.map((row) => tableColumn.map((key) => row[key]));
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('donnees_exportees.pdf');
  };

  return (
    <Container className="my-4">
      <h3 className="mb-4">Tableau des Passeports</h3>

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
            {/* Liste des nationalités */}
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
          <Form.Label>Date enregistrement début</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Date enregistrement fin</Form.Label>
          <Form.Control
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
          <Button variant="danger" onClick={exportPDF} className="me-2">
            Exporter PDF
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
                {Object.keys(filteredData[0] || {}).map((key) => (
                  <th key={key}>{key.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.numero_passport || row.id || JSON.stringify(row)}>
                  {Object.entries(row).map(([key, val]) => (
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
