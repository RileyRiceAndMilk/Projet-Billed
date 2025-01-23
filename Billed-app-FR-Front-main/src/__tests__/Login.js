/**
 * @jest-environment jsdom
 */
import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom'; 

describe("Given that I am a user on login page", () => {
  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", async () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );

     
      await waitFor(() => {
        expect(screen.getByText("Billed")).toBeInTheDocument();
      });
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", async () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };
    
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);
    
      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });
      expect(inputPasswordUser.value).toBe(inputData.password);
    
      const form = screen.getByTestId("form-admin");
    
      const setItemMock = jest.fn();
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(),
          setItem: setItemMock,
        },
        writable: true,
      });
    
      const onNavigate = jest.fn();
      const storeMock = {
        login: jest.fn().mockResolvedValue({ jwt: "token123" }),
      };
    
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: "",
        store: storeMock,
      });
    
      const handleSubmit = jest.spyOn(login, "handleSubmitAdmin");
      form.addEventListener("submit", handleSubmit);
    
      fireEvent.submit(form);
    
      expect(handleSubmit).toHaveBeenCalled();
      expect(storeMock.login).toHaveBeenCalledWith(
        JSON.stringify({ email: inputData.email, password: inputData.password })
      );
      expect(setItemMock).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    
      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);
      });
    
      expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");
    });
    
    });
  });
