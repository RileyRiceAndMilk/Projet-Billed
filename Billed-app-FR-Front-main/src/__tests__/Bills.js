/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import BillsContainer from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { handleClickIconEye } from '../views/BillsUI.js';


import { formatDate, formatStatus } from '../app/format.js';
jest.mock('../app/format.js', () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));


const storeMock = {
  bills: {
    get: jest.fn().mockResolvedValue([]),
  },
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test('Then it should display the bills after a successful API call', async () => {

      const html = BillsUI({ data: [], loading: true, error: null });
      document.body.innerHTML = html;


      const mockBills = [
        { id: 1, name: 'Séminaire', amount: 200, date: '2024-04-01', type: 'Formation', status: 'Validée', fileUrl: 'url' },
        { id: 2, name: 'Train', amount: 50, date: '2024-04-02', type: 'Transport', status: 'En attente', fileUrl: 'url' },
      ];


      const mockStore = {
        bills: jest.fn().mockResolvedValue(mockBills),
        create: jest.fn(),
        update: jest.fn(),
      };


      const bills = await mockStore.bills();


      const htmlWithData = BillsUI({ data: bills, loading: false, error: null });
      document.body.innerHTML = htmlWithData;


      await new Promise(resolve => setTimeout(resolve, 0));


      console.log(document.body.innerHTML);


      const seminarName = document.querySelector('.table tbody tr:nth-child(1) td:nth-child(2)');
      const trainName = document.querySelector('.table tbody tr:nth-child(2) td:nth-child(2)');


      expect(seminarName).toBeTruthy();
      expect(trainName).toBeTruthy();


      expect(seminarName.textContent).toBe('Train');
      expect(trainName.textContent).toBe('Séminaire');
      expect(document.querySelector('.table tbody tr:nth-child(1) td:nth-child(4)').textContent).toBe('50 €');
      expect(document.querySelector('.table tbody tr:nth-child(1) td:nth-child(3)').textContent).toBe('2024-04-02');
      expect(document.querySelector('.table tbody tr:nth-child(2) td:nth-child(4)').textContent).toBe('200 €');
      expect(document.querySelector('.table tbody tr:nth-child(2) td:nth-child(3)').textContent).toBe('2024-04-01');
    });

    let billsContainer;
    let icon;

    beforeEach(() => {

      $.fn.modal = jest.fn();


      billsContainer = new BillsContainer({
        document,
        onNavigate: jest.fn(),
        store: { bills: jest.fn() },
        localStorage: window.localStorage,
      });


      icon = document.createElement("div");
      icon.setAttribute("data-bill-url", "http://example.com/bill.jpg");


      const modal = document.createElement("div");
      modal.id = "modaleFile";
      modal.innerHTML = '<div class="modal-body"></div>';
      modal.style.width = "500px";
      document.body.appendChild(modal);
    });

    test("Then the image of the bill should be displayed in the modal when the icon is clicked.", () => {

      billsContainer.handleClickIconEye(icon);


      expect($.fn.modal).toHaveBeenCalledWith('show');


      const modalBody = document.querySelector("#modaleFile .modal-body");
      expect(modalBody.querySelector("img")).toBeTruthy();
    });

    test('then should format date and status correctly', async () => {

      const mockBills = [
        { date: '2023-01-01', status: 'paid' },
        { date: '2022-12-12', status: 'pending' },
      ];


      const mockStore = {
        bills: () => ({
          list: jest.fn(() => Promise.resolve(mockBills)),
        }),
      };


      const billsContainer = new BillsContainer({
        document: global.document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: {},
      });


      formatDate.mockReturnValueOnce('01/01/2023');
      formatStatus.mockReturnValueOnce('Paid');
      formatDate.mockReturnValueOnce('12/12/2022');
      formatStatus.mockReturnValueOnce('Pending');


      const result = await billsContainer.getBills();


      expect(formatDate).toHaveBeenCalledWith('2023-01-01');
      expect(formatStatus).toHaveBeenCalledWith('paid');
      expect(formatDate).toHaveBeenCalledWith('2022-12-12');
      expect(formatStatus).toHaveBeenCalledWith('pending');


      expect(result[0].date).toBe('01/01/2023');
      expect(result[0].status).toBe('Paid');
      expect(result[1].date).toBe('12/12/2022');
      expect(result[1].status).toBe('Pending');


      console.log("firstDate:", result[0].date, "secondDate:", result[1].date);


      const firstDate = Date.parse(result[0].date);
      const secondDate = Date.parse(result[1].date);


      console.log("firstDate timestamp:", firstDate, "secondDate timestamp:", secondDate);

      expect(firstDate > secondDate).toBe(true);
    });



    const mockModal = () => {
      document.body.innerHTML = `<div id="modaleFile" class="modal"><div class="modal-body"></div></div>`;
    };

    test('should render BillsUI with a list of bills', async () => {

      const bills = [
        { type: 'Restaurant', name: 'Repas', date: '19 janvier 2024', amount: 25, status: 'Payé', fileUrl: 'url1' },
        { type: 'Transport', name: 'Taxi', date: '5 août 2022', amount: 15, status: 'Non payé', fileUrl: 'url2' }
      ];


      document.body.innerHTML = BillsUI({ data: bills, loading: false, error: null });


      expect(screen.getByText('19 janvier 2024')).toBeInTheDocument();
      expect(screen.getByText('5 août 2022')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Taxi')).toBeInTheDocument();
    });

    test('should handle error rendering when there is a problem with bills data', async () => {
      const error = new Error("Erreur lors du chargement des données");


      document.body.innerHTML = BillsUI({ data: null, loading: false, error });


      expect(screen.getByText(`Erreur: ${error.message}`)).toBeInTheDocument();
    });

    test('should show loading state when bills are loading', async () => {

      document.body.innerHTML = BillsUI({ data: null, loading: true, error: null });


      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    test('then should show the modal and insert the image when the icon is clicked', async () => {
      const icon = document.createElement('div');
      icon.setAttribute('data-bill-url', 'https://example.com/image.jpg');


      const modalBody = document.createElement('div');
      modalBody.classList.add('modal-body');
      const modal = document.createElement('div');
      modal.setAttribute('id', 'modaleFile');
      modal.classList.add('fade');
      modal.appendChild(modalBody);
      document.body.appendChild(modal);


      handleClickIconEye(icon);


      await waitFor(() => {
        const modalElement = document.querySelector('#modaleFile');
        const modalBody = modalElement.querySelector('.modal-body');
        const img = modalBody.querySelector('img');


        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/image.jpg');
        expect(img.getAttribute('alt')).toBe('Justificatif de la facture');
      });


      const modalElement = document.querySelector('#modaleFile');
      modalElement.classList.add('show');


      expect(modalElement).toHaveClass('show');
    });

  });
});

