import alt from "alt-server"
import {
  PLAYER_FACIAL_ANIM_SYNC_KEY, 
  PLAYER_MALE_MODEL
} from "../shared"

const DEAD_FACIAL_ANIMS = {
  male: {
    dict: "facials@gen_male@base",
    name: "dead_1",
  },
  female: {
    dict: "facials@gen_female@base",
    name: "dead_1",
  },
}

export function togglePlayerDeadFacialAnim(player, toggle) {
  if (!toggle) {
    player.deleteStreamSyncedMeta(PLAYER_FACIAL_ANIM_SYNC_KEY)
    return
  }

  const anim = player.model === PLAYER_MALE_MODEL
    ? DEAD_FACIAL_ANIMS.male
    : DEAD_FACIAL_ANIMS.female

  player.setStreamSyncedMeta(PLAYER_FACIAL_ANIM_SYNC_KEY, [anim.name, anim.dict])
}
