import { random } from '../src/random'
import { Town } from '../town/_common'
import { generalStoreData } from './generalStoreData'
import { createShopkeepAssistant } from './createShopkeepAssistant'
import { GeneralStore } from './_common'
import { toTitleCase } from '../src/toTitleCase'

export function createGeneralStoreName (town: Town, generalStore: GeneralStore): void {
  console.log('Creating a name for the general store...')
  const { associatedNPC } = generalStore
  const noun = random(generalStoreData.name.noun)
  const adjective = random(generalStoreData.name.adjective)
  const rider = random(generalStoreData.name.rider)
  const family = random(generalStoreData.name.family)

  switch (random(1, 7)) {
    case 1:
      generalStore.name = `The ${adjective} ${noun}`
      break
    case 2:
      generalStore.name = `${associatedNPC.firstName} and ${toTitleCase(family)}`
      createShopkeepAssistant(town, generalStore, generalStore.associatedNPC, family)
      break
    case 3:
      generalStore.name = `The ${noun} and ${toTitleCase(family)}`
      createShopkeepAssistant(town, generalStore, generalStore.associatedNPC, family)
      break
    case 4:
      generalStore.name = `The ${adjective} ${rider}`
      break
    case 5:
      generalStore.name = `The ${adjective} ${noun}`
      break
    case 6:
      generalStore.name = associatedNPC.firstName + ["'s General Goods", "'s Bric-a-Brac", "'s Trading Goods", "'s Shopping Place", `'s ${rider}`].random()
      break
    case 7:
      generalStore.name = `${associatedNPC.firstName}'s ${adjective} ${rider}`
      break
    default:
      generalStore.name = `The ${adjective} Adventurer's Store`
      break
  }
}
