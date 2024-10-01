import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

// Define the type for the OHLC data structure
interface OHLCData {
  x: Date;
  y: [number, number, number, number]; // Open, High, Low, Close
}

// Function to generate random OHLC data for candlestick chart
const generateOHLCData = (
  startTime: number,
  numberOfCandles: number
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
    currentTime += 5 * 60 * 1000;
  }

  return data;
};

const ApexChart: React.FC = () => {
  // Set start time for the data (e.g., starting from a fixed date)
  const startTime = new Date("2024-10-01T00:00:00").getTime();

  // Number of candlesticks to generate
  const numberOfCandles = 100; // Adjust this number to generate more or fewer intervals

  const [series] = useState([
    {
      data: generateOHLCData(startTime, numberOfCandles),
    },
  ]);

  const [options] = useState<ApexCharts.ApexOptions>({
    chart: {
      type: "candlestick",
      height: 350,
      background: "#000", // Sets chart background to black
      toolbar: {
        show: false, // Hides the toolbar
      },
    },
    title: {
      text: "Candlestick Chart",
      align: "left",
      style: {
        color: "#fff", // Title color white for visibility on black background
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false, // Hides the x-axis labels
      },
      axisBorder: {
        show: false, // Hides the axis line
      },
      axisTicks: {
        show: false, // Removes the ticks from the x-axis
      },
    },
    yaxis: {
      tooltip: {
        enabled: true, // Keeps tooltip enabled
      },
      labels: {
        show: false, // Hides y-axis labels
      },
      axisBorder: {
        show: false, // Hides the axis line
      },
      axisTicks: {
        show: false, // Removes the ticks from the y-axis
      },
    },
    grid: {
      show: true,
      borderColor: "#444", // Grid line color (grayish for contrast)
      xaxis: {
        lines: {
          show: true, // Displays grid lines along the x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Displays grid lines along the y-axis
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark", // Dark theme tooltip for consistency
      x: {
        format: "dd MMM yyyy HH:mm", // Custom tooltip format for datetime
      },
      y: {
        formatter: (value: number) => {
          return `Price: ${value.toFixed(2)}`; // Custom format for y values
        },
      },
    },
  });

  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={350}
      />
    </div>
  );
};

export default ApexChart;
