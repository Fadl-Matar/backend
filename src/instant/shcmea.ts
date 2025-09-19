// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    "$files": i.entity({
      "path": i.string().unique().indexed(),
      "url": i.string().optional(),
    }),
    "$users": i.entity({
      "email": i.string().unique().indexed().optional(),
    }),
    "testUsers": i.entity({
      "auth_id": i.string().unique().indexed().optional(),
      "created_at": i.date().optional(),
      "email": i.string().unique().indexed(),
      "password": i.string().unique().indexed(),
    }),
    "testUserSettings": i.entity({
      "auth_id": i.string().unique().indexed().optional(),
      "defaultTeacher": i.string().optional(),
    }),
  },
  links: {
    "testUserSettingsUser": {
      "forward": {
        "on": "testUserSettings",
        "has": "one",
        "label": "user",
        "required": true,
        "onDelete": "cascade"
      },
      "reverse": {
        "on": "testUsers",
        "has": "one",
        "label": "settings"
      }
    }
  },
  rooms: {}
});


type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema }
export default schema;
