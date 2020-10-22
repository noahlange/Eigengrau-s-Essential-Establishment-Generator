import { Town } from '../town/_common'
import { generalStoreData } from './generalStoreData'
import { GeneralStore } from './_common'

export function createShopkeepAssistant (town: Town, generalStore: GeneralStore, associatedNPC: NPC, familyType: string): void {
  console.log('Creating an assistant...')
  const fam = generalStoreData.family(associatedNPC)
  const base = { profession: "shopkeep's assistant", ...fam[familyType] }
  generalStore.assistant = setup.createNPC(town, base)
  setup.createRelationship(town, associatedNPC, generalStore.assistant, familyType, generalStore.assistant.relationships[associatedNPC.key])
}
