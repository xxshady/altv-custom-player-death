import alt from "alt-server"
import {
  PLAYER_CUSTOM_HEALTH_SYNC_KEY,
  PLAYER_MALE_MODEL
} from "../shared"
import { togglePlayerDeadFacialAnim } from "./facial-anim-sync"
import "./facial-anim-sync"
import "./damage-ragdoll"

// by default player health is 0-100, but can be increased
const PLAYER_MAX_HEALTH = 100
// our real health value will be from 7900 to 8000
// if player.health becomes less than 7900 we mark player as "dead"
const INTERNAL_PLAYER_MAX_HEALTH = 8000
const INTERNAL_PLAYER_MIN_HEALTH = INTERNAL_PLAYER_MAX_HEALTH - PLAYER_MAX_HEALTH

const SPAWN_POS = new alt.Vector3(0, 0, 72)

alt.on("playerDamage", (player) => {
  // if player is dead we don't care about damage
  if (player.customDead) return

  // health value that is clamped between 0-PLAYER_MAX_HEALTH
  player.customHealth = clamp((player.health - INTERNAL_PLAYER_MIN_HEALTH), 0, PLAYER_MAX_HEALTH)
  player.setStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY, player.customHealth)

  // alt.log("playerDamage", player.name, player.id, "customHealth:", player.customHealth)

  // now we can work with 0-PLAYER_MAX_HEALTH health value and check if it is still alive
  if (player.customHealth > 0) return
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
  player.maxHealth = INTERNAL_PLAYER_MAX_HEALTH
  player.health = INTERNAL_PLAYER_MAX_HEALTH
  player.customHealth = PLAYER_MAX_HEALTH
  player.setStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY, PLAYER_MAX_HEALTH)
}
