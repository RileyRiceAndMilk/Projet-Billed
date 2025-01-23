import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";  
import NewBill from "../containers/NewBill.js";  
import '@testing-library/jest-dom/extend-expect'; 


const newbill = {
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  status: "accepted",
  type: "Hôtel et logement",
  commentAdmin: "ok",
  commentary: "séminaire billed",
  name: "encore",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2004-04-04",
  amount: 400,
  email: "a@a",
  pct: 20
};


const storeMock = {
  bills: jest.fn(() => ({
    create: jest.fn(() => Promise.resolve(newbill)) 
  }))
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    
    test("Then the title Submit an Expense Report must be displayed", () => {
      const html = NewBillUI(newbill);  
      document.body.innerHTML = html;

      new NewBill({
        document: document,
        onNavigate: () => {},
        store: storeMock, 
        localStorage: window.localStorage
      });

      const title = screen.getByText("Envoyer une note de frais");
      expect(title).toBeInTheDocument(); 
    });

  
    test("Then the submit button must be displayed", () => {
      const html = NewBillUI(newbill);  
      document.body.innerHTML = html;

      new NewBill({
        document: document,
        onNavigate: () => {},
        store: storeMock, 
        localStorage: window.localStorage
      });

      const submitButton = screen.getByRole("button", { name: /envoyer/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton.tagName).toBe("BUTTON");
      expect(submitButton.type).toBe("submit");
    });

    
    test("Then the file input must be displayed", () => {
      const html = NewBillUI(newbill);  
      document.body.innerHTML = html;

      new NewBill({
        document: document,
        onNavigate: () => {},
        store: storeMock, 
        localStorage: window.localStorage
      });

      const fileInput = screen.getByTestId("file");
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.tagName).toBe("INPUT");
      expect(fileInput.type).toBe("file");
      expect(fileInput.required).toBe(true);
      expect(fileInput.classList.contains("form-control")).toBe(true);
      expect(fileInput.classList.contains("blue-border")).toBe(true);
    });

    
    test("Displays an error message for an invalid file extension", async () => {
      const html = NewBillUI(newbill);
      document.body.innerHTML = html;

      new NewBill({
        document: document,
        onNavigate: () => {},
        store: storeMock,
        localStorage: window.localStorage
      });


      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      document.body.appendChild(errorElement);

      const inputFile = screen.getByTestId("file");
      const invalidFile = new File([""], "invalidFile.txt", { type: "text/plain" });
      fireEvent.change(inputFile, { target: { files: [invalidFile] } });

      const errorMessage = await waitFor(() =>
        screen.getByText("Seuls les fichiers JPG, JPEG et PNG sont autorisés.")
      );

      expect(errorMessage).toBeInTheDocument(); 
    }); 
    
  
   test("Then the selected date must be logged in the console", () => {

    const newbill = {};  
    const html = NewBillUI(newbill);

  
    document.body.innerHTML = html;

    
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    
    const onNavigate = jest.fn(); 
    const store = {}; 
    const newBillInstance = new NewBill({
      document,
      onNavigate,
      store,
    });

    
    const dateInput = screen.getByTestId('datepicker'); 
    fireEvent.change(dateInput, { target: { value: '2025-01-15' } }); 

    
    const form = screen.getByTestId('form-new-bill'); 
    fireEvent.submit(form);

    
    expect(consoleLogSpy).toHaveBeenCalledWith('Date sélectionnée:', '2025-01-15');

   
    consoleLogSpy.mockRestore();
});
test('Then must submit a file and call the API correctly', async () => {
  
  global.URL.createObjectURL = jest.fn().mockReturnValue('fake_url');

  
  const mockUser = { email: 'employee@example.com' };
  localStorage.setItem("user", JSON.stringify(mockUser));


  const mockUpdate = jest.fn().mockResolvedValue({
    fileUrl: 'fake_url',
    fileName: 'test-image.jpg',
  });

  
  const html = NewBillUI(newbill); 
  document.body.innerHTML = html; 

  
  const newBillInstance = new NewBill({
    document,
    onNavigate: jest.fn(), 
    store: {
      bills: () => ({
        create: jest.fn().mockResolvedValue({
          fileUrl: 'fake_url',
          fileName: 'test-image.jpg',
        }),
        update: mockUpdate, 
      }),
    },
    localStorage: window.localStorage,
  });

  
  const file = new File(['content'], 'test-image.jpg', { type: 'image/jpeg' });

  
  const fileInput = screen.getByTestId('file');
  fireEvent.change(fileInput, { target: { files: [file] } });

  
  fireEvent.change(screen.getByTestId('expense-type'), { target: { value: 'Hôtel et logement' } });
  fireEvent.change(screen.getByTestId('expense-name'), { target: { value: 'encore' } });
  fireEvent.change(screen.getByTestId('datepicker'), { target: { value: '2004-04-04' } });
  fireEvent.change(screen.getByTestId('amount'), { target: { value: 400 } });
  fireEvent.change(screen.getByTestId('vat'), { target: { value: 80 } });
  fireEvent.change(screen.getByTestId('pct'), { target: { value: 20 } });
  fireEvent.change(screen.getByTestId('commentary'), { target: { value: 'séminaire billed' } });

  
  await waitFor(() => {
    const fileNameDisplay = screen.getByText('Nom du fichier : test-image.jpg');
    expect(fileNameDisplay).toBeInTheDocument(); 
  });


  const form = screen.getByTestId('form-new-bill');
  fireEvent.submit(form); 

  
  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalledWith({
      data: JSON.stringify({
        email: 'employee@example.com',
        type: 'Hôtel et logement', 
        name: 'encore',
        amount: 400,
        date: '2004-04-04',
        vat: '80',
        pct: 20,
        commentary: 'séminaire billed',
        fileUrl: 'fake_url',
        fileName: 'test-image.jpg',
        status: 'pending', 
      }),
      selector: undefined, 
    });
  });
});
});
});

