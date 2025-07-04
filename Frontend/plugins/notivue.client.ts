import { createNotivue } from 'notivue'

export default defineNuxtPlugin((nuxtApp) => {
  const notivue = createNotivue({
    position: 'top-right',
    limit: 4,
    enqueue: true,
    avoidDuplicates: true,
    teleportTo: 'body'
  })

  nuxtApp.vueApp.use(notivue)
})