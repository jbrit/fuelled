import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OHLCData {
  x: Date;
  y: [number, number, number, number]; // Open, High, Low, Close
}

// Function to generate random OHLC data for candlestick chart
const generateOHLCData = (
  startTime: number,
  numberOfCandles: number,
  interval?: number | null
): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentTime = startTime;

  for (let i = 0; i < numberOfCandles; i++) {
    const open = parseFloat((Math.random() * (10000 - 6500) + 6500).toFixed(2));
    const close = parseFloat(
      (Math.random() * (10000 - 6500) + 6500).toFixed(2)
    );
    const high = Math.max(
      open,
      close,
      parseFloat((Math.random() * (10000 - 6500) + 6500).toFixed(2))
    );
    const low = Math.min(
      open,
      close,
      parseFloat((Math.random() * (10000 - 6500) + 6500).toFixed(2))
    );

    data.push({
      x: new Date(currentTime),
      y: [open, high, low, close],
    });

    // Increment time by 5 minutes (5 * 60 * 1000 ms)
    currentTime += (interval ?? 5) * 60 * 1000;
  }

  return data;
};

const CandlestickChart: React.FC = () => {
  const startTime = new Date().getTime();

  const [interval, setInterval] = useState<number | null>(null);

  const numberOfCandles = 100;

  const [series, setSeries] = useState([
    {
      data: generateOHLCData(startTime, numberOfCandles, interval),
    },
  ]);

  useEffect(() => {
    setSeries([
      { data: generateOHLCData(startTime, numberOfCandles, interval) },
    ]);
  }, [interval]);

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
      type: "datetime",
      labels: {
        show: true,
        style: {
          fontSize: "13px",
          colors: "#6b7280",
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
      tooltip: {
        enabled: true,
      },
      labels: {
        show: true,
        style: {
          fontSize: "13px",
          colors: "#9ca3af",
        },
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
