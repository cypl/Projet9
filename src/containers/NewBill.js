import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
      const navBillsList = document.querySelector("#layout-icon1")
      if (navBillsList) navBillsList.addEventListener('click', this.handleClickBillsList)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  /**
   * Méthode qui permet de revenir sur la page qui liste des factures
   */
  handleClickBillsList = () => {
    this.onNavigate(ROUTES_PATH['Bills'])
  }


  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    if(!file) return false
    // L'objet file contient une propriété qui permet de définir l'extension.
    // On peut donc lister les extensions que l'on souhaite autoriser :
    const allowedExtensions = ["image/jpg","image/jpeg","image/png"]
    // Et vérifier si file contient une propriété extension autorisée :
    if(allowedExtensions.includes(file.type)){
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)
      // si l'utilisateur a déjà tenté d'importer un fichier mais qu'il avait un mauvais format, on retire le message d'erreur
      if(this.document.querySelector(`input[data-testid="file"]`).classList.contains("error-field")){
        this.document.querySelector(`input[data-testid="file"]`).classList.remove("error-field")
      }
      if(document.getElementById("file-field-error")){document.getElementById("file-field-error").remove()}
    } else {
      // si ce n'est pas le cas, on affiche une alerte avec un message d'erreur.
      const fileFieldContainer = this.document.querySelector(`input[data-testid="file"]`).parentNode
      const fileFieldError = document.createElement("p")
      fileFieldError.textContent = "Ce type de fichier n'est pas valide, essayez avec un fichier .jpg, .jpeg ou .png."
      fileFieldError.setAttribute("id","file-field-error")
      fileFieldContainer.append(fileFieldError)
      const fileField = this.document.querySelector(`input[data-testid="file"]`)
      fileField.classList.add("error-field")
      // On vide le champs
      e.target.value = ""
      return false
    }
  }

  /**
   * Méthode qui permet de d'enregistrer les données au submit, et de créer une nouvelle “bill”
   * @param {*} e correspond au clic sur le bouton submit
   */
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    // this.store
        // .bills()
        // .create({
        //   data: formData,
        //   headers: {
        //     noContentType: true
        //   }
        // })
        // .then(({fileUrl, key}) => {
        //   console.log(fileUrl)
        //   this.billId = key
        //   this.fileUrl = fileUrl
        //   this.fileName = fileName
        // }).catch(error => console.error(error))
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
    return bill;
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}