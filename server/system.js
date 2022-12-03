import alt from "alt-server"
import {
  PLAYER_CUSTOM_HEALTH_SYNC_KEY,
  PLAYER_MALE_MODEL
} from "../shared"
import { togglePlayerDeadFacialAnim } from "./facial-anim-sync"
import './facial-anim-sync'

// our real health value will be from 7900 to 8000
// if player.health becomes less than 7900 we mark player as "dead"
const PLAYER_MAX_HEALTH = 8000
const PLAYER_MIN_HEALTH = PLAYER_MAX_HEALTH - 100

const SPAWN_POS = new alt.Vector3(0, 0, 72)

alt.on("playerDamage", (player) => {
  // health value that is clamped between 0-100
  player.customHealth = clamp((player.health - PLAYER_MIN_HEALTH), 0, 100)
  player.setStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY, player.customHealth)

  alt.log("playerDamage", player.name, player.id, "customHealth:", player.customHealth)

  // now we can work with 0-100 health value and check if it is still alive
  if (player.customHealth > 0) return

  // player is dead now, we don't care about damage now
  if (player.customDead) return
  player.customDead = true

  alt.log("player death")

  player.emit("playerDeathStart")

  togglePlayerDeadFacialAnim(player, true)
})

// helper
function clamp(value, min, max) {
  value = Math.max(value, min)
  value = Math.min(value, max)
  return value
}

// for external code
export const spawnPlayer = (
  player,
  model = PLAYER_MALE_MODEL,
  pos = SPAWN_POS,
) => {
  if (player.customDead) {
    player.clearBloodDamage()
    player.customDead = false
    togglePlayerDeadFacialAnim(player, false)
  }
  player.spawn(model, pos)

  // setting high health to prevent player from *really* killing themselves
  player.maxHealth = PLAYER_MAX_HEALTH
  player.health = PLAYER_MAX_HEALTH
  player.customHealth = 100
  player.setStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY, 100)
}
