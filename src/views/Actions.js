import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (billUrl) => {
  // Si l'url du fichier est "…/null" on ajoute une classe CSS pour préciser qu'il y a une erreur (mauvais format)
  return (
    `<div class="icon-actions">
      <div id="eye"${billUrl.endsWith('null') ? (` class="eye_error"`) : ("")} data-testid="icon-eye" data-bill-url=${billUrl} >
      ${eyeBlueIcon}
      </div>
    </div>`
  )
}