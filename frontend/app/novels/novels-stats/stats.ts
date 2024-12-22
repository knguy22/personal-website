import { Status } from "../novels-list/novel-types"

export type Stats = {
  novel_count: number,
  chapter_count: number,
  average_rating: number,
  volumes_completed: number,
  novels_not_started: number,

  rating_dist: [number, number, number, number, number, number, number, number, number, number]
  status_dist: { [key in Status]: number }
  chapter_dist: { [key: string]: number }
  country_dist: { [key: string]: number }
}

export const AbbreToCountry: {[key: string]: string} = {
  "jp": "Japanese",
  "kr": "Korean",
  "cn": "Chinese",
  "en": "English",
}