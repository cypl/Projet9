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

// console.log(jest.fn(mockedBills))

beforeAll(() => {
  // on simule localstorage pour un employé connecté
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "test@example.com"
    })
  );
})

beforeEach(() => {
  // On retourne le HTML de la page avant chaque test
  const html = NewBillUI()
  document.body.innerHTML = html
})

afterEach(() => {
  // On vide le HTML de la page après chaque test
  document.body.innerHTML = ""
})


describe("Given I am connected as an employee", () => {

  // Suite de tests pour vérifier que la page contient bien les bons éléments d'interface pour réaliser nos tests
  describe('When I am on New Bill page', () => {
    test('Then, the New Bill page should be displayed', () => {
      expect(screen.getByText("Envoyer une note de frais")).toBeVisible()
    })
    test('Then, the New Bill page form should contain a form with 9 elements', () => {
      expect(screen.getByTestId("form-new-bill").length).toEqual(9)
    })
  })

  describe('When I am on New Bill page and import a new file', () => {
    test('Then, the imported file should have an accepted format', () => {
      const newFile = new File(['hello'], 'hello.png', {type: 'image/png'})
      const inputFile = screen.getByTestId("file")
      // on initie le store et les autres paramètres
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const myStore = null
      const myStorage = window.localStorage
      const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })
      // handle event
      const handleChangeFile = jest.fn(() => MyBill.handleChangeFile);
      inputFile.addEventListener('change', handleChangeFile);
      userEvent.upload(inputFile, newFile)
      expect(inputFile.files).toHaveLength(1)
    })
  })

  describe("When I submit the form", () => {
    
    // test("Then, the imported file should have an accepted format", () => {
    //   const newFile = new File(['hello'], 'hello.png', {type: 'image/png'})
    //   const inputFile = screen.getByTestId("file")
    //   // on initie le store et les autres paramètres
    //   const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
    //   const myStore = null
    //   const myStorage = window.localStorage
    //   const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })
    //   // handle event
    //   const handleChangeFile = jest.fn(() => MyBill.handleChangeFile);
    //   inputFile.addEventListener('change', handleChangeFile);
    //   userEvent.upload(inputFile, newFile)
    //   expect(inputFile.files).toHaveLength(1)
    // })

    test("Then, the created bill object should be well formatted", () => {
      // // on initie le store et les autres paramètres
      // const myStore = null
      // const myStorage = window.localStorage
      // const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })

      // // on récupère l'email de l'utilisateur dans local storage
      // const user = JSON.parse(window.localStorage.getItem('user'))
      // const userObject = JSON.parse(user)
      // // Question : Pourquoi est-ce que je dois parser 2 fois le contenu de local storage pour obtenir un objet exploitable ?
      // const userEmail = userObject.email
      
      // // On simule le remplissage du formulaire :
      // userEvent.type(screen.getByTestId('expense-type').value("Services en ligne")) // Select Type de dépense
      // userEvent.type(screen.getByTestId('expense-name'), "Test nom de la dépense") // Input Nom de la dépense
      // userEvent.type(screen.getByTestId('datepicker').value("2022-11-11")) // Input Date
      // userEvent.type(screen.getByTestId('amount'), "200") // Input Montant TTC
      // userEvent.type(screen.getByTestId('vat'), "40") // Input TVA
      // userEvent.type(screen.getByTestId('pct'), "20") // Input TVA %
      // userEvent.type(screen.getByTestId('commentary'), "Commentaire test.") // Textarea Commentaire
      // userEvent.type(screen.getByTestId('file'), "") // Input file Justificatif (formdata)
      // // On simule un clic sur le submit
      // userEvent.click(getByText(document.body, "Envoyer"))
      
    })
    test("Then, the page is correctly redirected to Bills page", () => {
      const form = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByText("Envoyer")
      // On complète le formulaire
      // ………
      // On crée une nouvelle instance de NewBill
      const myStore = null
      const myStorage = window.localStorage
      // on initie onNavigate
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })
      const handleSubmit = jest.fn(MyBill.handleSubmit);
      // On soumet le formulaire
      form.addEventListener("submit", handleSubmit)
      userEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalled()
      // On est sensé être renvoyé vers la page Bills
      expect(screen.getByText("Mes notes de frais")).toBeVisible() // = Titre de la page Bills visible
    })
    
  })

})