import { Semaphore } from "./helpers"

global.generateThumbnailSemaphore = new Semaphore(3)
global.items = undefined
global.setItems = undefined
global.fetchItemList = undefined
global.currentReceiverId = undefined
global.visibleItems = {}