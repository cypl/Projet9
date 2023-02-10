/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { getByTestId, getByText, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";


beforeEach(() => {
  const html = NewBillUI()
  document.body.innerHTML = html
})

afterEach(() => {
  document.body.innerHTML = ""
})

describe("Given I am connected as an employee", () => {
  describe("When I submit the form", () => {
    test("Then, bill object should be well formatted", () => {
      
      // On remplit le formulaire avec des données de test
      userEvent.type(screen.getByTestId('expense-type'), "") // Select Type de dépense
      userEvent.type(screen.getByTestId('expense-name'), "Test nom de la dépense") // Input Nom de la dépense
      userEvent.type(screen.getByTestId('datepicker'), "") // Input Date
      userEvent.type(screen.getByTestId('amount'), "200") // Input Montant TTC
      userEvent.type(screen.getByTestId('vat'), "40") // Input TVA
      userEvent.type(screen.getByTestId('pct'), "20") // Input TVA %
      userEvent.type(screen.getByTestId('commentary'), "Commentaire test.") // Textarea Commentaire
      userEvent.type(screen.getByTestId('file'), "") // Input file Justificatif
      
      // En simule une adresse email enregistrée dans local storage
      const email = 'test@example.com'
      localStorage.setItem('user', JSON.stringify({ email }))
      
      // Le formulaire devrait retourner cet objet bill :
      const expectedBill = {
        email,
        type: "",
        name: "Test nom de la dépense",
        date: "",
        amount: 200,
        vat: 40,
        pct: 20,
        commentary: "Commentaire test.",
        fileUrl: "",
        fileName: "",
        status: 'pending',
      }

      // C'est là que je coince ?
      const NewBillTest = new NewBill;
      NewBillTest.updateBill = jest.fn()
      NewBillTest.onNavigate = jest.fn()
      NewBillTest.handleSubmit(e)

      // On simule un clic sur le submit
      const formSubmit = getByText(document.body, "Envoyer")
      userEvent.click(formSubmit)
      // On récupère l'objet Bill généré par le formulaire, pour le comparer avec expectedBill
      expect(NewBillTest.updateBill).toHaveBeenCalledWith(expectedBill)
    })

  })

})
