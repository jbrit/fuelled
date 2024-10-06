import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";

interface OHLCData {
  x: Date;
  y: [number, number, number, number]; // Open, High, Low, Close
}

type Props = {
  getOhlc: (minutes: number) => undefined | OHLCData[]
}

const CandlestickChart: React.FC<Props> = ({getOhlc}) => {

  const [interval, setInterval] = useState<number>(5);
  const series = [{data: (getOhlc(interval) ?? []).toReversed().slice(0, 40).toReversed() }];
  console.log("series changed")
  const [options] = useState<ApexCharts.ApexOptions>({
    chart: {
      type: "candlestick",
      height: 350,
      background: "#000",
      toolbar: {
        show: true,
        tools: {},
      },
    },
    // title: {
    //   text: "Candlestick Chart",
    //   align: "left",
    //   style: {
    //     color: "#fff",
    //   },
    // },
    xaxis: {
      type: "category",
      labels: {
        show: true,
        style: {
          fontSize: "13px",
          colors: "#6b7280",
        },
        formatter: (val) => {
          return moment(val).format("DD MMM HH:mm")
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      max: 5 / 1e9,
      min: 0,
      tooltip: {
        enabled: true,
      },
      labels: {
        show: true,
        style: {
          fontSize: "13px",
          colors: "#9ca3af",
        },
        formatter: (val) => val.toFixed(11)
        // align: "right",
        // offsetX: 50,
      },

      opposite: true,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    grid: {
      show: true,
      borderColor: "#444",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        format: "dd MMM yyyy HH:mm",
      },
      y: {
        formatter: (value: number) => {
          return `Price: ${value.toFixed(2)}`;
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={interval.toString()}
        onValueChange={(value) => {
          console.log(value);
          setInterval(parseInt(value));
        }}
      >
        <SelectTrigger className="w-[120px] h-[30px] bg-[#131722] relative z-[10000] translate-y-[30px]">
          <SelectValue placeholder="Interval" />
        </SelectTrigger>
        <SelectContent
          onChange={(e) => {
            console.log(e);
          }}
          className="bg-[#131722] text-white"
        >
          <SelectItem className="" value="1">
            1 minute
          </SelectItem>
          <SelectItem value="5">5 minutes</SelectItem>
          <SelectItem value="10">10 minutes</SelectItem>
        </SelectContent>
      </Select>
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={350}
      />
    </div>
  );
};

export default CandlestickChart;
