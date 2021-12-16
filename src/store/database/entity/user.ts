import { User } from "mixin-node-sdk/dist/types"
import { EntitySchema } from "typeorm"

export const UserEntity = new EntitySchema<User>({
  name: "user",
  columns: {
    user_id: { type: String, primary: true },
    identity_number: { type: String },
    phone: { type: String },
    full_name: { type: String },
    biography: { type: String },
    avatar_url: { type: String },
    relationship: { type: String },
    mute_until: { type: String },
    created_at: { type: String },
    is_verified: { type: Boolean },
    // app: { type: Object, nullable: true},
    session_id: { type: String, nullable: true },
    pin_token: { type: String, nullable: true },
    pin_token_base64: { type: String, nullable: true },
    code_id: { type: String, nullable: true },
    code_url: { type: String, nullable: true },
    has_pin: { type: Boolean, nullable: true },
    has_emergency_contact: { type: Boolean, nullable: true },
    receive_message_source: { type: String, nullable: true },
    accept_conversation_source: { type: String, nullable: true },
    accept_search_source: { type: String, nullable: true },
    fiat_currency: { type: String, nullable: true },
    device_status: { type: String, nullable: true },
    publick_key: { type: String, nullable: true },
    private_key: { type: String, nullable: true },
  },
})
