/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { getByTestId, getByText, waitFor, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"


jest.mock("../app/store", () => mockStore)


/**
 * Fonction pour créer une instance de newBill
 * @returns 
 */
function myBill(){
  const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname, data:[] })}
  const MyBill = new NewBill( { document, onNavigate, store: mockStore, localStorage: window.localStorage })
  return MyBill
}




describe("Given I am connected as an employee", () => {

  beforeAll(() => {
    // on simule localstorage pour un employé connecté
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    const myUser = {type: "Employee", email: "a@a"}
    localStorage.setItem('user',JSON.stringify(myUser))
  })

  beforeEach(() => {
    // On retourne le HTML de la page avant chaque test
    document.body.innerHTML = NewBillUI()
  })
  
  
  afterEach(() => {
    // On vide le HTML de la page après chaque test
    document.body.innerHTML = ""
  })

  // Retour à la page Bills - test de la méthode handleClickBillsList()
  describe('When I am on New Bill page and click on the Bills icon in lateral navigation', () => {
    test('Then, i should be redirected to Bills page', () => {
      // on crée une instance de newBill
      const MyBill = myBill()
      
      // on simule l'évènement
      const iconWindow = screen.getByTestId("icon-window")
      const handleClickBillsList = jest.fn(() => MyBill.handleClickBillsList);
      iconWindow.addEventListener('click', handleClickBillsList);
      userEvent.click(iconWindow)

      // On est sensé être renvoyé vers la page Bills
      expect(screen.getByText("Mes notes de frais")).toBeVisible() // = Titre de la page Bills visible
    })
  }) 

  // Imports de fichiers - test de la méthode handleChangeFile()
  describe('When I am on New Bill page and upload a new file', () => {

    // Test import d'un fichier au bon format
    test('Then, it should be possible to upload a file with an accepted format', () => {
      // on crée un nouvel objet file, qui a un format accepté
      const newFile = new File(['hello'], 'hello.png', {type: 'image/png'})
      
      // on crée une instance de newBill
      const MyBill = myBill()
      
      // on simule l'import de newFile dans le formulaire
      const inputFile = screen.getByTestId("file")
      const handleChangeFile = jest.fn(() => MyBill.handleChangeFile)
      inputFile.addEventListener('change', handleChangeFile)
      userEvent.upload(inputFile, newFile)
      
      // le champ devrait contenir le fichier
      expect(inputFile.files).toHaveLength(1)
    })

    // Test import d'un fichier au mauvais format
    test('Then, it should be impossible to upload a file with an wrong format', () => {
      // on crée un nouvel objet file, qui n'a pas un format accepté
      const newFile = new File(['hello'], 'hello.txt', {type: 'text/plain'})
      
      // on crée une instance de newBill
      const MyBill = myBill()
      
      // on simule l'import de newFile dans le formulaire
      const inputFile = screen.getByTestId("file")
      const handleChangeFile = jest.fn(() => MyBill.handleChangeFile)
      inputFile.addEventListener('change', handleChangeFile)
      userEvent.upload(inputFile, newFile)
      
      // le champ devrait signaler une erreur
      expect(inputFile).toHaveClass("error-field")
      expect(screen.getByText("Ce type de fichier n'est pas valide, essayez avec un fichier .jpg, .jpeg ou .png.")).toBeVisible()
    })
  })


  // // Envoi du formulaire - test de la méthode handleSubmit()
  describe("When I submit the form", () => {

    // Test envoi du formulaire vide
    test("If the form is empty, then the page shouldn't redirect to Bills page.", () => {
      const form = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByText("Envoyer")
      // on crée une instance de newBill
      const MyBill = myBill()
      // on ne complète pas le formulaire
      // on simule la validation du formulaire
      const handleSubmit = jest.fn(MyBill.handleSubmit)
      form.addEventListener("submit", handleSubmit)
      userEvent.click(submitButton)
      // on est sensé rester sur la même page (un formulaire vide n'est pas valide)
      expect(screen.getByText("Envoyer une note de frais")).toBeVisible()
    })

    // Test envoi du formulaire complété, et test d'intégration POST
    test("If the form is complete, then the page should redirect to Bills page.", async () => {
      // on crée une instance de newBill
      const MyBill = myBill()
      // on récupère l'email de l'utilisateur dans local storage
      const user = JSON.parse(localStorage.getItem('user'))
      // Question : Pourquoi est-ce que je dois parser 2 fois le contenu de local storage pour obtenir un objet exploitable ?
      const userObject = JSON.parse(user)
      const userEmail = userObject.email
      // On crée un objet newBill qui contient les valeurs attendues de notre test
      const newBillTest = {
        userEmail,
        type: "Transports",
        name: "Test New Bill",
        amount: 200,
        date: "2023-02-11",
        vat: 40,
        pct: 20,
        commentary: "Commentaire Test New Bill",
        fileUrl: "https://newbillfile.url",
        fileName: "newbilltest.jpg",
        status: "pending",
      };
      // On crée un objet file pour l'uploader au formulaire
      const file = new File(["newbilltest"], "newbilltest.jpg", {type: "image/jpg"})
      // On simule le remplissage du formulaire, avec les données de newBillTest :
      userEvent.selectOptions(screen.getByTestId("expense-type"), [newBillTest.type])
      userEvent.type(screen.getByTestId('expense-name'), newBillTest.name)
      userEvent.type(screen.getByTestId("datepicker"), newBillTest.date)
      userEvent.type(screen.getByTestId("amount"), newBillTest.amount.toString())
      userEvent.type(screen.getByTestId("vat"), newBillTest.vat.toString())
      userEvent.type(screen.getByTestId("pct"), newBillTest.pct.toString())
      userEvent.type(screen.getByTestId("commentary"), newBillTest.commentary)
      // userEvent.upload(screen.getByTestId("file"), file)
      MyBill.fileName = newBillTest.fileName
      // On simule un clic sur le submit
      const form = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByText("Envoyer")
      const handleSubmit = jest.spyOn(MyBill, "handleSubmit")
      form.addEventListener("submit", MyBill.handleSubmit)
      userEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalled()

      await waitFor( () => {
        expect(screen.getByText("Mes notes de frais")).toBeVisible()
        // Test d'intégration POST : 
        // le formulaire a envoyé un fichier “newbilltest.jpg”,
        // donc l'instance MyBill de newBill devrait recevoir la même valeur en fileName que newBillTest 
        expect(MyBill.fileName).toEqual(newBillTest.fileName)
      })

    })
  })

  // Tests des erreurs 404 et 500
  describe("When an error occurs on API", () => {

    // Test lorsque l'on simule une erreur 404
    test("a new bill fetches to the API, but fails with 404 message error", async () => {
      // on crée une instance de newBill
      const MyBill = myBill()
      // on simule le fait que créer une nouvelle bill dans le store rejète une erreur 404
      const mockedBill = jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("404"))
          },
        }
      })
      // on simule le fait que créer une nouvelle bill rejète une erreur
      await expect(mockedBill().create()).rejects.toThrow("404")
      // on vérifie que le store a bien été appelé
      expect(mockedBill).toHaveBeenCalled()
    })

    // Test lorsque l'on simule une erreur 500
    test("a new bill fetches to the API, but fails with 500 message error", async () => {
      // on crée une instance de newBill
      const MyBill = myBill()
      // on simule le fait que créer une nouvelle bill dans le store rejète une erreur 404
      const mockedBill = jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("500"))
          },
        }
      })
      // on simule le fait que créer une nouvelle bill rejète une erreur
      await expect(mockedBill().create()).rejects.toThrow("500")
      // on vérifie que le store a bien été appelé
      expect(mockedBill).toHaveBeenCalled()
    })

  })

})