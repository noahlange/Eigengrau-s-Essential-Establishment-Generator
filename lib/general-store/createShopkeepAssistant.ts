import { Town } from '../town/_common'
import { generalStoreData } from './generalStoreData'
import { GeneralStore } from './_common'

export function createShopkeepAssistant (town: Town, generalStore: GeneralStore, associatedNPC: NPC, familyType: string): void {
  const profession = random(['shopkeep', "shopkeep's assistant", "shopkeep's assistant", "shopkeep's assistant"])
  const fam = generalStoreData.family(associatedNPC)
  const base = { profession, ...fam[familyType] }
  generalStore.assistant = setup.createNPC(town, base)
  setup.createRelationship(town, associatedNPC, generalStore.assistant, familyType, generalStore.assistant.relationships[associatedNPC.key])
}
