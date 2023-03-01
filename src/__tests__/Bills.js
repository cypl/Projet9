/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import {within, screen} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)


/**
 * Fonction pour créer une instance de Bills
 * @returns 
 */
function myBills(){
  const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
  const MyBills = new Bills( { document, onNavigate, store: mockStore, localStorage: window.localStorage })
  return MyBills
}


beforeAll(() => {
  // on simule localstorage pour un employé connecté
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  const myUser = {type: "Employee", email: "test@example.com"}
  localStorage.setItem('user',JSON.stringify(myUser))

  jest.spyOn(mockStore, "bills")
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
  window.onNavigate(ROUTES_PATH.Bills)
})


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    

    // Test icône navigation latérale sélectionné 
    test("Then bill icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId('icon-window')
      // L'icône est sensé avoir la classe “active-icon”
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    

    // Test ordre des bills
    test("Then bills should be ordered from earliest to latest", () => {
      // On simule le DOM de la page
      document.body.innerHTML = BillsUI({ data: bills })
      // On crée un tableau avec toutes les dates de la page
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // Fonction pour classer des chaînes de caractères décroissant
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      // On crée un tableau de comparaison, dont les éléments dates sont bien classés par ordre décroissant (anti-chronologique)
      const datesSorted = [...dates].sort(antiChrono)
      // On est sensé avec un tableau dates classé dans le même ordre que le tableau de comparaison
      expect(dates).toEqual(datesSorted)
    })


    // Test redirection en utilisant le bouton pour créer une nouvelle bill
    test("The NewBill button should redirect to NewBill page", () => {
      // On crée une instance de Bills
      const MyBills = myBills()
      // On simule le DOM de la page
      document.body.innerHTML = BillsUI({ data: bills })
      // On simule un clic sur le bouton “Nouvelle note de frais”
      const handleClickNewBill = jest.fn(MyBills.handleClickNewBill)
      const newbillButton = screen.getByTestId('btn-new-bill')
      newbillButton.addEventListener("click", handleClickNewBill)
      userEvent.click(newbillButton)
      // On est sensé être renvoyé vers la page NewBill
      expect(screen.getByText("Envoyer une note de frais")).toBeVisible() // = Titre de la page NewBill visible
    })


    // Test affichage de la modale lorsque l'on clique sur un icône œil
    test("The Bill icon should open a modal window", () => {
      // On crée une instance de Bills
      const MyBills = myBills()
      // On simule le DOM de la page
      document.body.innerHTML = BillsUI({ data: bills })
      // On simule un clic sur un icône oeil
      const iconEyes = screen.getAllByTestId("icon-eye")
      const iconEye = iconEyes[0]
      const handleClickIconEye = jest.spyOn(MyBills, "handleClickIconEye")
      iconEye.addEventListener("click", MyBills.handleClickIconEye(iconEye))
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      // On est sensé être sensé voir la fenêtre modale
      expect(screen.getByTestId("modale-file")).toBeVisible()
    })

  })

  
  
  // Tests d'intégration GET, et des erreurs 404 et 500
  describe("When I am on Bills Page", () => {

    // Tests d'intégration GET
    test("bills are fetched from API mock", async () => {
      const tableBills = screen.getByTestId("tbody")
      // le store mocké contient 4 entrées, donc le tableau de bills devrait avoir 4 lignes
      expect(within(tableBills).getAllByRole("row")).toHaveLength(4)
    })


    // Test lorsque l'on simule une erreur 404
    test("bills fetches from an API, but fails with 404 message error", async () => {
      // on simule le fait que lister les bills depuis le store rejète une erreur 404      
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Dashboard)
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      await new Promise(process.nextTick)
      const message = await screen.getByText("Erreur 404")
      expect(message).toBeTruthy()
    })

    // Test lorsque l'on simule une erreur 500
    test("bills fetches from an API, but fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Dashboard)
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      await new Promise(process.nextTick)
      const message = await screen.getByText("Erreur 500")
      expect(message).toBeTruthy()
    })
  })


})