import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import db from "../db/indexedDb";

function ImportExcel() {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState("");

  // 🧠 Fonction utilitaire pour normaliser les dates
  const convertDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("📂 Fichier détecté :", file.name);
    setFileName(file.name);
    setLoading(true);
    setPreviewData([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
          toast.error("❌ Aucune feuille trouvée !");
          setLoading(false);
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });
        if (jsonData.length === 0) {
          toast.error("⚠️ Le fichier Excel est vide !");
          setLoading(false);
          return;
        }

        // 🧩 MAPPING complet Excel → IndexedDB
        const preview = jsonData.map((row) => ({
          prenom: row.Prenom || row.prenom || "",
          nom: row.Nom || row.nom || "",
          numero_passport:
            row.NumeroPasseport ||
            row["Numéro Passeport"] ||
            row["Numero Passeport"] ||
            "",
          sexe: row.Sexe || "",
          date_naissance:
            convertDate(row.DateNaissance || row["Date de Naissance"]),
          etat_civil: row.EtatCivil || row["Etat Civil"] || "",
          profession: row.Profession || "",
          nationalite: row.Nationalite || row["Nationalité"] || "",
          en_charge_de: row.EnChargeDe || row["En Charge De"] || "",
          type_visa: row.TypeVisa || row["Type Visa"] || "",
          date_expiration:
            convertDate(row.DateExpiration || row["Date Expiration"]),
          date_entree: convertDate(row.DateEntree || row["Date Entrée"]),
          frontalier: row.Frontalier || "",
          date_retour: convertDate(row.DateRetour || row["Date Retour"]),
          adresse_rdc: row.AdresseRDC || row["Adresse RDC"] || "",
          date_enregistrement: new Date().toISOString(),
          agent_saisi: row.AgentSaisi || row["Agent Saisi"] || "",
        }));

        setPreviewData(preview);
        toast.success("✅ Fichier importé avec succès !");
      } catch (error) {
        console.error("❌ Erreur pendant la lecture :", error);
        toast.error("Erreur lors de la lecture du fichier !");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    if (previewData.length === 0) {
      toast.warn("⚠️ Aucune donnée à importer !");
      return;
    }

    setLoading(true);
    let count = 0;

    try {
      for (const row of previewData) {
        await db.passports.add({
          ...row,
          date_enregistrement: new Date().toISOString(),
        });
        count++;
      }
      toast.success(`✅ ${count} enregistrements ajoutés avec succès !`);
      setPreviewData([]);
      setFileName("");
    } catch (err) {
      console.error("Erreur DB :", err);
      toast.error("Erreur lors de l'importation en base !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4 text-center">
      <input
        type="file"
        accept=".xlsx, .xls"
        id="fileUpload"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      <Button
        variant="success"
        disabled={loading}
        onClick={() => document.getElementById("fileUpload").click()}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Lecture du fichier...
          </>
        ) : (
          "📥 Importer depuis Excel"
        )}
      </Button>

      {fileName && (
        <p className="mt-2 text-muted">
          Fichier sélectionné : <strong>{fileName}</strong>
        </p>
      )}

      {previewData.length > 0 && (
        <div className="mt-4">
          <h5>📋 Données importées ({previewData.length} lignes)</h5>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table striped bordered hover responsive size="sm">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th>Nationalité</th>
                  <th>Numéro Passeport</th>
                  <th>Date Naissance</th>
                  <th>Profession</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{row.prenom}</td>
                    <td>{row.nom}</td>
                    <td>{row.nationalite}</td>
                    <td>{row.numero_passport}</td>
                    <td>{row.date_naissance}</td>
                    <td>{row.profession}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Button
            variant="primary"
            className="mt-3"
            disabled={loading}
            onClick={confirmImport}
          >
            ✅ Confirmer l’importation
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImportExcel;
