import alt from "alt-client"
import native from "natives"
import { PLAYER_FACIAL_ANIM_SYNC_KEY } from "../shared"

const playersActiveFacialAnim = new Map()

new alt.Utils.EveryTick(() => {
  for (const [player, [animName, animDict]] of playersActiveFacialAnim) {
    if (!(player.valid && player.isSpawned)) continue
    native.playFacialAnim(player, animName, animDict)
  }
})

const playFacialAnim = async (player, anim) => {
  // alt.log("play player facial anim of player", player.id)

  const [animName, animDict] = anim

  await alt.Utils.requestAnimDict(animDict)

  // async shit validation
  if (!(player.valid && player.getStreamSyncedMeta(PLAYER_FACIAL_ANIM_SYNC_KEY)?.[0] === animName)) return

  playersActiveFacialAnim.set(player, anim)
}

alt.on("streamSyncedMetaChange", (player, key, anim) => {
  if (key !== PLAYER_FACIAL_ANIM_SYNC_KEY) return
  if (!(player instanceof alt.Player)) return
  
  // altv stream synced meta bug workaround https://github.com/altmp/altv-issues/issues/1398
  if (!(player.isSpawned)) return

  if (!anim) {
    // alt.log("clear facial anim of player:", player.id)
    playersActiveFacialAnim.delete(player)
    return
  }
  playFacialAnim(player, anim)
    .catch(e => alt.logError(e))
})

alt.on("gameEntityCreate", (player) => {
  if (!(player instanceof alt.Player)) return

  const anim = player.getStreamSyncedMeta(PLAYER_FACIAL_ANIM_SYNC_KEY)
  if (!anim) return
  playFacialAnim(player, anim)
    .catch(e => alt.logError(e))
})

alt.on("gameEntityDestroy", (player) => {
  if (!(player instanceof alt.Player)) return

  if (!player.hasStreamSyncedMeta(PLAYER_FACIAL_ANIM_SYNC_KEY)) return
  playersActiveFacialAnim.delete(player)
})
