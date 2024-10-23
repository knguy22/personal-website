import { Bar, BarChart, CartesianGrid, Label, LabelList, XAxis, YAxis} from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  rating: {
    label: "rating",
    color: "#4e3196",
  },
  chapter: {
    label: "chapter",
    color: "#4e3196",
  },
  country: {
    label: "country",
    color: "#4e3196",
  },
} satisfies ChartConfig

interface NovelBarChartProps {
  title: string
  chartData: any[]
  chartConfigKey: keyof typeof chartConfig
  XAxisLabel: string,
  XAxisKey: string,
  YAxisKey: string,
}
 
export function NovelBarChart( {title, chartData, chartConfigKey, XAxisLabel, XAxisKey, YAxisKey}: NovelBarChartProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-xl text-center font-bold">{title}</div>
      <ChartContainer config={chartConfig} className="h-56 w-1/2">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, bottom: 20, left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={XAxisKey} tickLine={false}>
            <Label value={XAxisLabel} offset={-10} position="bottom"/>
          </XAxis>
          <YAxis></YAxis>
          <Bar dataKey={YAxisKey} fill={"var(--color-" + chartConfigKey + ")"} radius={4}>
            <LabelList dataKey={YAxisKey} position="top" />
        </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
