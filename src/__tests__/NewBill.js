/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { getByTestId, getByText, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import{mockedBills} from '../__mocks__/store.js';

// on initie onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

// on simule localstorage pour un employé
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee',
    email: "test@example.com",
  })
);


beforeEach(() => {
  // On retourne le HTML de la page avant chaque test
  const html = NewBillUI()
  document.body.innerHTML = html
})

afterEach(() => {
})


describe("Given I am connected as an employee", () => {

  // Suite de tests pour vérifier que la page contient bien les bons éléments d'interface pour réaliser nos tests
  describe('When I am on New Bill page', () => {
    test('Then, the New Bill page should be displayed', () => {
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
    test('Then, the New Bill page form should contain a form with 9 elements', () => {
      // console.log(screen.getByTestId("form-new-bill").length)
      expect(screen.getByTestId("form-new-bill").length).toEqual(9)
    })
  })


})

// describe("Given I am connected as an employee", () => {
//   describe("When I submit the form", () => {
//     test("Then, bill object should be well formatted", () => {
      
//       // on récupère le html de la page
//       const html = NewBillUI()
//       document.body.innerHTML = html
      
//       // on initie le store et les autres paramètres
//       const myStore = null
//       const myStorage = window.localStorage
//       const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })
//       // console.log(MyBill)

//       // On remplit le formulaire avec des données de test
//       let email = 'test@example.com'
//       localStorage.setItem('user', JSON.stringify({ email })) // On simule une adresse email enregistrée dans local storage
//       userEvent.type(screen.getByTestId('expense-type'), "") // Select Type de dépense
//       userEvent.type(screen.getByTestId('expense-name'), "Test nom de la dépense") // Input Nom de la dépense
//       userEvent.type(screen.getByTestId('datepicker'), "") // Input Date
//       userEvent.type(screen.getByTestId('amount'), "200") // Input Montant TTC
//       userEvent.type(screen.getByTestId('vat'), "40") // Input TVA
//       userEvent.type(screen.getByTestId('pct'), "20") // Input TVA %
//       userEvent.type(screen.getByTestId('commentary'), "Commentaire test.") // Textarea Commentaire
//       userEvent.type(screen.getByTestId('file'), "") // Input file Justificatif
//       // On simule un clic sur le submit
//       userEvent.click(getByText(document.body, "Envoyer"))

//       MyBill.email = 'test@example.com';
//       MyBill.type = "";
//       MyBill.name = "Test nom de la dépense";
//       MyBill.date = "";
//       MyBill.amount = 200;
//       MyBill.vat = 40;
//       MyBill.pct = 20;
//       MyBill.commentary = "Commentaire test.";
//       MyBill.fileUrl = "";
//       MyBill.fileName = "";
//       MyBill.status = 'pending';
      
//       // Le formulaire devrait retourner cet objet bill :
//       const expectedBill = {
//         email,
//         type: "",
//         name: "Test nom de la dépense",
//         date: "",
//         amount: 200,
//         vat: 40,
//         pct: 20,
//         commentary: "Commentaire test.",
//         fileUrl: "",
//         fileName: "",
//         status: 'pending',
//       }

//       const spy = jest.spyOn(MyBill, handleSubmit);
//       const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

//       const form = screen.getByTestId("form-new-bill")
//       form.addEventListener("submit", handleSubmit)

//       console.log()

//       // On espionne la méthode updateBill de NewBill
//       // const spy = jest.fn(MyBill, 'updateBill')
//       // const handleSubmit = jest.fn((e) => MyBill.handleSubmit(e));


//       // On récupère l'objet Bill généré par le formulaire, pour le comparer avec expectedBill
//       // expect(handleSubmit).toHaveBeenCalledWith(expectedBill)
//     })

//   })

// })