import VerticalLayout from './VerticalLayout.js';
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";
import Actions from './Actions.js';

const parseDateString = (dateString) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }

  const months = {
    janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
    juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11
  };

  const [day, monthText, year] = dateString.split(' ');

  if (!day || !monthText || !year) {
    throw new Error(`Date invalide: ${dateString}`);
  }

  const month = months[monthText.toLowerCase()];
  if (month === undefined) {
    throw new Error(`Mois invalide: ${monthText}`);
  }

  return new Date(year, month, parseInt(day, 10));
};

const antiChrono = (a, b) => {
  const dateA = parseDateString(a.date);
  const dateB = parseDateString(b.date);

  return dateB - dateA;
};

const row = (bill) => {
  return (
    `<tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>${Actions(bill.fileUrl)}</td>
    </tr>`
  );
};

const rows = (data) => {
  return (data && data.length) ? data.map(row).join("") : "";
};

const highlightIcon = (element) => {
  if (element) {
    element.classList.add('highlighted');
  } else {
    console.error("L'élément 'icon-window' est introuvable.");
  }
};

export default ({ data: bills, loading, error }) => {
  const modal = () => (
    `<div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body"></div>
        </div>
      </div>
    </div>`
  );

  if (loading) {
    console.log("Chargement en cours...");
    return LoadingPage();
  }

  if (error) {
    return `<div class="content-title">Erreur: ${error.message}</div>`;
  }

  if (!bills || bills.length === 0) {
    return `<div class="content-title">Aucune note de frais disponible.</div>`;
  }

  const sortedBills = [...bills].sort(antiChrono);

  const setupListeners = () => {
    const newBillButton = document.querySelector('[data-testid="btn-new-bill"]');
    const windowIcon = document.getElementById('icon-window');

    if (newBillButton) {
      newBillButton.addEventListener('click', () => {
        highlightIcon(windowIcon);
      });
    } else {
      console.error("Bouton 'Nouvelle note de frais' introuvable.");
    }
  };

  requestAnimationFrame(setupListeners);

  return (
    `<div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'>Mes notes de frais</div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
          <table id="example" class="table table-striped" style="width:100%">
            <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody data-testid="tbody">
              ${rows(sortedBills)}
            </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  );
};


export const handleClickIconEye = (icon) => {
  const url = icon.getAttribute("data-bill-url");
  const modalBody = document.querySelector("#modaleFile .modal-body");

  if (url) {
    const img = document.createElement("img");
    img.setAttribute("src", url);
    img.setAttribute("alt", "Justificatif de la facture");
    modalBody.innerHTML = ""; 
    modalBody.appendChild(img);  
  }

  $('#modaleFile').modal('show');
};

