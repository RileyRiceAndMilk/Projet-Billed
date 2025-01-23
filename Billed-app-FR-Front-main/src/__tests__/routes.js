/**
 * @jest-environment jsdom
 */

import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { screen } from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect';




const data = []
const loading = false
const error = null

describe('Given I am connected and I am on some page of the app', () => {
  describe('When I navigate to Login page', () => {
    test(('Then, it should render Login page'), () => {
      const pathname = ROUTES_PATH['Login']
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
       })
       document.body.innerHTML = html
       expect(screen.getAllByText('Administration')).toBeTruthy()
    })
  })
  describe('When I navigate to Bills page', () => {
    test('Then, it should render Bills page with no bills', () => {
      const pathname = ROUTES_PATH['Bills'];
      const data = []; 
      const loading = false;
      const error = null;
  
      const html = ROUTES({ pathname, data, loading, error });
      document.body.innerHTML = html;
  
      
      expect(screen.getByText('Aucune note de frais disponible.')).toBeTruthy();
    });
  
    test('Then, it should render Bills page with bills', () => {
      const pathname = ROUTES_PATH['Bills'];
      const data = [{ id: 1, name: 'Facture 1' }]; 
      const loading = false;
      const error = null;
  
      const html = ROUTES({ pathname, data, loading, error });
      document.body.innerHTML = html;
  

      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
  });
  
  
  describe('When I navigate to NewBill page', () => {
    test(('Then, it should render NewBill page'), () => {
      const pathname = ROUTES_PATH['NewBill']
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
       })
       document.body.innerHTML = html
       expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
  describe('When I navigate to Dashboard', () => {
    test(('Then, it should render Dashboard page'), () => {
      const pathname = ROUTES_PATH['Dashboard']
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
       })
       document.body.innerHTML = html
       expect(screen.getAllByText('Validations')).toBeTruthy()
    })
  })
  describe('When I navigate to anywhere else other than Login, Bills, NewBill, Dashboard', () => {
    test(('Then, it should render Loginpage'), () => {
      const pathname = '/anywhere-else'
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
       })
       document.body.innerHTML = html
       expect(screen.getAllByText('Administration')).toBeTruthy()
    })
  })
})
