import alt from "alt-server"
import {
  PLAYER_CUSTOM_HEALTH_SYNC_KEY,
} from "../shared.js"
import { togglePlayerDeadFacialAnim } from "./facial-anim-sync.js"
import "./damage-ragdoll.js"

// by default player health is 0-100, but can be increased
const PLAYER_MAX_HEALTH = 100
// our real health value will be from 7900 to 8000
// if player.health becomes less than 7900 we mark player as "dead"
const INTERNAL_PLAYER_MAX_HEALTH = 8000
const INTERNAL_PLAYER_MIN_HEALTH = INTERNAL_PLAYER_MAX_HEALTH - PLAYER_MAX_HEALTH

export const events = {
  onDeath: null
}

const playersLastDamage = new WeakMap()

alt.on("playerDamage", (player) => {
  // if player is dead we don't care about damage
  if (player.customDead) return

  calculateCustomPlayerHealth(player)

  // alt.log("playerDamage", player.name, player.id, "customHealth:", player.customHealth)

  // now we can work with 0-PLAYER_MAX_HEALTH health value and check if it is still alive
  if (player.customHealth > 0) return
  player.customDead = true

  alt.log("player death")

  player.emit("playerDeathStart")

  togglePlayerDeadFacialAnim(player, true)

  // there are some known cases (and probably some unknown?) when game death can still be triggered
  // see README
  if (!player.health) {
    player.spawn(player.pos)
  }

  const lastDamage = playersLastDamage.get(player)
  events.onDeath?.(player, lastDamage?.source ?? null, lastDamage?.weapon || null)
})

alt.on("weaponDamage", (source, target, weapon) => {
  if (!(target instanceof alt.Player)) return

  playersLastDamage.set(target, { source, weapon })
})

// helper
function clamp(value, min, max) {
  value = Math.max(value, min)
  value = Math.min(value, max)
  return value
}

// for external code
export const spawnPlayer = (player) => {
  if (player.customDead) {
    player.clearBloodDamage()
    player.customDead = false
    togglePlayerDeadFacialAnim(player, false)
  }

  player.emit("playerDeathStop")

  // setting high health to prevent player from *really* killing themselves
  player.maxHealth = INTERNAL_PLAYER_MAX_HEALTH
  player.health = INTERNAL_PLAYER_MAX_HEALTH
  player.customHealth = PLAYER_MAX_HEALTH
  player.setStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY, PLAYER_MAX_HEALTH)
}

function calculateCustomPlayerHealth(player) {
  // health value that is clamped between 0-PLAYER_MAX_HEALTH
  player.customHealth = clamp((player.health - INTERNAL_PLAYER_MIN_HEALTH), 0, PLAYER_MAX_HEALTH)
  player.setStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY, player.customHealth)
}
