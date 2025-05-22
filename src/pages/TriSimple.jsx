import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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

  useEffect(() => {
    const fetchData = async () => {
      const allData = await db.passports.toArray();

      // Convertir le champ photo (Blob) en URL affichable
      const dataWithPhotos = allData.map((item) => {
        if (item.photo && typeof item.photo === 'object') {
          const url = URL.createObjectURL(item.photo);
          return { ...item, photoUrl: url };
        }
        return { ...item, photoUrl: null };
      });

      setData(dataWithPhotos);
      setFilteredData(dataWithPhotos);

      const nats = [...new Set(dataWithPhotos.map((item) => item.nationalite))];
      setNationalities(nats);
    };

    fetchData();
  }, []);

  // Nettoyage des URLs pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      data.forEach((item) => {
        if (item.photoUrl) {
          URL.revokeObjectURL(item.photoUrl);
        }
      });
    };
  }, [data]);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const matchPrenom = item.prenom
        .toLowerCase()
        .includes(prenomFilter.toLowerCase());
      const matchPassport = item.numero_passport
        .toLowerCase()
        .includes(passportFilter.toLowerCase());
      const matchNat = selectedNat ? item.nationalite === selectedNat : true;

      return matchPrenom && matchPassport && matchNat;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [prenomFilter, passportFilter, selectedNat, data]);

  const confirmDelete = () => toast.success('Voulez-vous vraiment supprimer cet enregistrement ?');

  const handleDelete = async (id) => {
    if (confirmDelete()) {
      await db.passports.delete(id);
      const newData = data.filter((item) => item.id !== id);
      setData(newData);
    }
  };

  const handleView = (id) => {
    navigate(`/passport/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/passport/${id}`);
  };

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
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md="auto" className="d-flex align-items-center gap-2">
          <Form.Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="5">5 par page</option>
            <option value="10">10 par page</option>
            <option value="25">25 par page</option>
            <option value="50">50 par page</option>
          </Form.Select>

          <Button variant="secondary" onClick={() => navigate('/')}>
            Retour Accueil
          </Button>
          <Button variant="primary" onClick={() => navigate('/tri-export')}>
            Vers /Export
          </Button>
        </Col>
      </Row>

      {currentItems.length > 0 ? (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Prénom</th>
                <th>Noms</th>
                <th>Numéro Passeport</th>
                <th>Nationalité</th>
                <th>Date de Retour</th>
                <th>Date Enregistrement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={row.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>
                    {row.photoUrl ? (
                      <img
                        src={row.photoUrl}
                        alt="Photo"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '5px',
                        }}
                      />
                    ) : (
                      <span>Aucune</span>
                    )}
                  </td>
                  <td>{row.prenom}</td>
                  <td>{row.nom}</td>
                  <td>{row.numero_passport}</td>
                  <td>{row.nationalite}</td>
                  <td>{row.date_retour}</td>
                  <td>
                    {new Date(row.date_enregistrement).toLocaleDateString()}
                  </td>
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
