/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import Bills from "../containers/Bills.js";

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


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("The NewBill button should redirect to NewBill page", () => {
      // on initie le store et les autres paramètres de Bills
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const myStore = null
      const myStorage = window.localStorage
      const MyBills = new Bills( { document, onNavigate, store: myStore, localStorage: myStorage })

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      // On simule un clic sur le bouton “Nouvelle note de frais”
      const handleClickNewBill = jest.fn(MyBills.handleClickNewBill)
      const newbillButton = screen.getByTestId('btn-new-bill')
      newbillButton.addEventListener("click", handleClickNewBill)
      userEvent.click(newbillButton)
      
      // expect(handleClickNewBill).toHaveBeenCalled()
      // On est sensé être renvoyé vers la page NewBill
      expect(screen.getByText("Envoyer une note de frais")).toBeVisible() // = Titre de la page NewBill visible

    })


    test("The Bill icon should open a modal window", () => {
      jest.spyOn(mockStore, "bills")
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      // on initie le store et les autres paramètres de Bills
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const myStore = mockStore
      const myStorage = window.localStorage
      const MyBills = new Bills( { document, onNavigate, store: myStore, localStorage: myStorage })

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      
      // On simule un clic sur un icône oeil
      const iconEyes = screen.getAllByTestId("icon-eye")
      const iconEye = iconEyes[0]
      const handleClickIconEye = jest.spyOn(MyBills, "handleClickIconEye")
      iconEye.addEventListener("click", MyBills.handleClickIconEye(iconEye))
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      // tester si la fenêtre modale est visible
      expect(screen.getByTestId("modale-file")).toBeVisible()
    })

  })

  // Tests erreur 404 et 500
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })


})