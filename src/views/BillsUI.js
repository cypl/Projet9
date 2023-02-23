import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

const rows = (data) => {
  // Les données de data[] sont classées par défaut dans l'ordre selon lequel elles sont ajoutées par l'utilisateur.
  // On peut les ré-ordonner par date, mais le formatage de la date ne le permet pas.
  // On peut ajouter une propriété date "dateForSort" dans la méthode getBills, qui aura un format permettant de ré-ordonner les données (dans ./containers/Bills.js).
  // On crée une copie de l'array data[] dans lequel on retire les éléments qui ont une propriété name qui est null.
  if(!data || !data.length){
    return ""
  }
  const data2 = data.filter(d => d.name != null);
  if(!data2 || !data2.length){
    return ""
  }
  // On les classe par ordre décroissant, grâce à la propriété dateForSort.
  data2.sort((a, b) => {
    const dateA = a.dateForSort ?? a.date
    const dateB = b.dateForSort ?? b.date
    return new Date(dateB)-new Date(dateA)
  });
  // on remplace "data" par "data2"
  return data2.map(bill => row(bill)).join("")
}

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" data-testid="modale-file" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}