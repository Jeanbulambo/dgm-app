import { useEffect, useState } from 'react';
import JsPDF from 'jspdf'; // eslint-disable-line new-cap
import autoTable from 'jspdf-autotable';
import {
  Container, Table, Form, Button, Row, Col, Pagination,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import db from '../db/indexedDb';

const TriSimple = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [prenomFilter, setPrenomFilter] = useState('');
  const [passportFilter, setPassportFilter] = useState('');
  const [nationalities, setNationalities] = useState([]);
  const [selectedNat, setSelectedNat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const exportPDF = () => {
    const doc = new JsPDF();
    const tableColumn = [
      'PRENOM', 'NOM&POST-NOM', 'NATIONALITE', 'NUME. PP',
      'EXP. PP', 'D. ENTREE', 'EXP. VISA',
    ];
    const tableRows = [];

    filteredData.forEach((item) => {
      tableRows.push([
        item.prenom,
        item.nom,
        item.nationalite,
        item.numero_passport,
        item.date_expiration,
        item.date_entree,
        item.date_retour,
        new Date(item.date_enregistrement).toLocaleDateString(),
      ]);
    });

    doc.text('Liste des Expatriés Filtrés', 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('expatries_filtres.pdf');
  };

  useEffect(() => {
    const fetchData = async () => {
      const allData = await db.passports.toArray();
      setData(allData);
      setFilteredData(allData);
      const nats = [...new Set(allData.map((item) => item.nationalite))];
      setNationalities(nats);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const matchPrenom = item.prenom.toLowerCase().includes(prenomFilter.toLowerCase());
      const matchPassport = item.numero_passport.toLowerCase().includes(passportFilter
        .toLowerCase());
      const matchNat = selectedNat ? item.nationalite === selectedNat : true;
      return matchPrenom && matchPassport && matchNat;
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [prenomFilter, passportFilter, selectedNat, data]);

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    const isConfirmed = window.confirm('Voulez-vous vraiment supprimer cet enregistrement ?'); // no-alert géré
    if (isConfirmed) {
      await db.passports.delete(id);
      const newData = data.filter((item) => item.id !== id);
      setData(newData);
    }
  };

  const handleView = (id) => navigate(`/passport/${id}`);
  const handleEdit = (id) => navigate(`/passport/${id}`);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const renderPagination = () => {
    const items = [];
    for (let number = 1; number <= totalPages; number += 1) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>,
      );
    }

    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Container className="my-4">
      <h3 className="mb-4">LISTE COMPLETE DES EXPATRIES</h3>
      <Row className="mb-3 align-items-end">
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
            placeholder="Filtrer par numéro de passeport"
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
        <Col md={3} className="d-flex flex-wrap gap-2">
          <Form.Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="5">5 par page</option>
            <option value="10">10 par page</option>
            <option value="25">25 par page</option>
            <option value="50">50 par page</option>
          </Form.Select>
          <Button variant="secondary" onClick={() => navigate('/')}>Accueil</Button>
          <Button variant="primary" onClick={() => navigate('/tri-export')}>/Export</Button>
          <Button variant="success" onClick={exportPDF}>Exporter en PDF</Button>
        </Col>
      </Row>

      {currentItems.length > 0 ? (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Nationalité</th>
                <th>Numéro PP</th>
                <th>Validité PP</th>
                <th>Entrée</th>
                <th>Validité visa</th>
                <th>Enregistrement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={row.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{row.prenom}</td>
                  <td>{row.nom}</td>
                  <td>{row.nationalite}</td>
                  <td>{row.numero_passport}</td>
                  <td>{row.date_expiration}</td>
                  <td>{row.date_entree}</td>
                  <td>{row.date_retour}</td>
                  <td>{new Date(row.date_enregistrement).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      className="me-1"
                      onClick={() => handleDelete(row.id)}
                    >
                      Supprimer
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(row.id)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleView(row.id)}
                    >
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {renderPagination()}
        </div>
      ) : (
        <p>Aucun enregistrement trouvé.</p>
      )}
    </Container>
  );
};

export default TriSimple;
