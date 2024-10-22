
export type Stats = {
  novel_count: number,
  chapter_count: number,
  average_rating: number
  rating_dist: [number, number, number, number, number, number, number, number, number, number]
  chapter_dist: { [key: string]: number }
}