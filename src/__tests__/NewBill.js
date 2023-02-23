/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { getByTestId, getByText, fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import{mockedBills} from '../__mocks__/store.js';
import mockStore from "../__mocks__/store"


import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)


beforeAll(() => {
  // on simule localstorage pour un employé connecté
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  const myUser = {type: "Employee", email: "test@example.com"}
  localStorage.setItem('user',JSON.stringify(myUser))
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

  // Retour à la page Bills - test de la méthode handleClickBillsList()
  describe('When I am on New Bill page and click on the Bills icon in lateral navigation', () => {
    test('Then, i should be redirected to Bills page', () => {
      const iconWindow = screen.getByTestId("icon-window")
      // on initie le store et les autres paramètres
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const myStore = null
      const myStorage = window.localStorage
      const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })
      // handle event
      const handleClickBillsList = jest.fn(() => MyBill.handleClickBillsList);
      iconWindow.addEventListener('click', handleClickBillsList);
      userEvent.click(iconWindow)
      expect(handleClickBillsList).toHaveBeenCalled()
      // On est sensé être renvoyé vers la page Bills
      expect(screen.getByText("Mes notes de frais")).toBeVisible() // = Titre de la page Bills visible
    })
  }) 

  // Imports de fichiers - test de la méthode handleChangeFile()
  describe('When I am on New Bill page and upload a new file', () => {
    test('Then, it should be possible to upload a file with an accepted format', () => {
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
    test('Then, it should be impossible to upload a file with an wrong format', () => {
      const newFile = new File(['hello'], 'hello.txt', {type: 'text/plain'})
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
      expect(inputFile).toHaveClass("error-field")
      expect(screen.getByText("Ce type de fichier n'est pas valide, essayez avec un fichier .jpg, .jpeg ou .png.")).toBeVisible()
    })
  })

  // Envoi du formulaire - test de la méthode handleSubmit()
  describe("When I submit the form", () => {
    test("Then, the created bill object should be well formatted", () => {
      // on initie le store et les autres paramètres
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const myStore = null
      const myStorage = window.localStorage
      const MyBill = new NewBill( { document, onNavigate, store: myStore, localStorage: myStorage })

      // on récupère l'email de l'utilisateur dans local storage
      const user = JSON.parse(localStorage.getItem('user'))
      // Question : Pourquoi est-ce que je dois parser 2 fois le contenu de local storage pour obtenir un objet exploitable ?
      const userObject = JSON.parse(user)
      const userEmail = userObject.email

      const newBillTest = {
        userEmail,
        type: "Transports",
        name: "Test New Bill",
        amount: "200",
        date: "2023-02-11",
        vat: "40",
        pct: "20",
        commentary: "Commentaire Test New Bill",
        fileUrl: "https://newbillfile.url",
        fileName: "newbilltest.jpg",
        status: "pending",
      };
      
      const file = new File(["newbilltest"], "newbilltest.jpg", {type: "image/jpg"})

      // On simule le remplissage du formulaire, avec les données de newBillTest :
      userEvent.selectOptions(screen.getByTestId("expense-type"), newBillTest.type)
      userEvent.type(screen.getByTestId('expense-name'), newBillTest.name)
      userEvent.type(screen.getByTestId("datepicker"), newBillTest.date)
      userEvent.type(screen.getByTestId("amount"), newBillTest.amount)
      userEvent.type(screen.getByTestId("vat"), newBillTest.vat)
      userEvent.type(screen.getByTestId("pct"), newBillTest.pct)
      userEvent.upload(screen.getByTestId("file"), file)
      userEvent.type(screen.getByTestId("commentary"), newBillTest.commentary)

      // On simule un clic sur le submit
      const form = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByText("Envoyer")
      const handleSubmit = jest.fn(MyBill.handleSubmit)
      const updateBill = jest.fn(MyBill.updateBill)
      form.addEventListener("submit", handleSubmit)
      userEvent.click(submitButton)

      // L'object bill construit par la méthode handleSubmit devrait correspondre à l'objet newBillTest
      expect(handleSubmit).toHaveBeenCalledWith(newBillTest)
      // On devrait ensuite être redirigé vers la page Bills
      //expect(screen.getByText("Mes notes de frais")).toBeVisible()
      
    })
    test("Then, the page shouldn't redirect to Bills page if the form is empty", () => {
      const form = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByText("Envoyer")
      // On ne complète pas le formulaire
      // On crée une nouvelle instance de NewBill
      const myStore = null
      const myStorage = window.localStorage
      // on initie onNavigate
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const MyBill = new NewBill( { 
        document, 
        onNavigate, 
        store: myStore, 
        localStorage: myStorage,
      })
      const handleSubmit = jest.fn(MyBill.handleSubmit)
      // On soumet le formulaire
      form.addEventListener("submit", handleSubmit)
      userEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalled()
      // On est sensé rester sur la même page
      expect(screen.getByText("Envoyer une note de frais")).toBeVisible()
    })
  })


  describe("When there is an error API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("Then, the new bill is send but API fetch throw error", async () => {
      

    })
  })


})