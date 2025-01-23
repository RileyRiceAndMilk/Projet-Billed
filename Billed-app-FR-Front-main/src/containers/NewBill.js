import { ROUTES_PATH } from '../constants/routes.js';
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector('form[data-testid="form-new-bill"]');
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector('input[data-testid="file"]');
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = e => {
    const inputFile = document.querySelector('input[data-testid="file"]');
    const file = inputFile.files[0];
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    const errorElement = document.querySelector('.error-message');
    console.log("Error element found:", errorElement);

    
    if (!allowedExtensions.test(file.name)) {
      if (errorElement) {
        console.log("Setting error message...");
        errorElement.textContent = "Seuls les fichiers JPG, JPEG et PNG sont autorisés.";
      }
      inputFile.value = "";  
      return;
    } else {
      if (errorElement) {
        errorElement.textContent = "";
      }
    }

    
    const fileName = file.name;

    
    const fileNameElement = document.querySelector('.file-name');
    if (fileNameElement) {
      fileNameElement.textContent = `Nom du fichier : ${fileName}`; 
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;

    
    formData.append('file', file);
    formData.append('email', email);

    
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName; 
      })
      .catch(error => console.error(error));
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const dateValue = e.target.querySelector('input[data-testid="datepicker"]').value;
    console.log('Date sélectionnée:', dateValue);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      console.error("Aucun utilisateur connecté ou email manquant");
      return; 
    }
    const email = user.email;   

    const fileInput = e.target.querySelector('input[data-testid="file"]');
    const file = fileInput.files[0]; 

    if (file) {
      this.fileName = file.name;
      this.fileUrl = URL.createObjectURL(file); 
    }

    const bill = {
      email,
      type: e.target.querySelector('select[data-testid="expense-type"]').value,
      name: e.target.querySelector('input[data-testid="expense-name"]').value,
      amount: parseInt(e.target.querySelector('input[data-testid="amount"]').value),
      date: dateValue,
      vat: e.target.querySelector('input[data-testid="vat"]').value,
      pct: parseInt(e.target.querySelector('input[data-testid="pct"]').value) || 20,
      commentary: e.target.querySelector('textarea[data-testid="commentary"]').value,
      fileUrl: this.fileUrl, 
      fileName: this.fileName, 
      status: 'pending'
    };

    
    await this.store.bills().create(bill);

    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH['Bills']);
  }

  // fonction non nécessaire à tester
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch(error => console.error(error));
    }
  }
}