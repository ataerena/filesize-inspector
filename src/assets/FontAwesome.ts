import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faFolder, faFile, faSpinner } from '@fortawesome/free-solid-svg-icons'

library.add(faFolder, faFile, faSpinner) // Add selected icons to the library

export default FontAwesomeIcon