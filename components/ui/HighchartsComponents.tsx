'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Highcharts from 'highcharts';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), {
  ssr: false,
});

interface LineChartProps {
  title?: string;
  categories: string[];
  seriesData: { name: string; data: number[]; color?: string }[];
  height?: number;
}

export const HighchartsLine: React.FC<LineChartProps> = ({
  title,
  categories,
  seriesData,
  height = 260,
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
      height,
      spacing: [10, 5, 10, 5],
      style: {
        fontFamily: 'inherit',
      },
    },
    accessibility: { enabled: false },
    title: {
      text: title || '',
      style: { color: '#9ca3af', fontSize: '12px', fontWeight: 'bold' },
    },
    credits: { enabled: false },
    xAxis: {
      categories,
      labels: { style: { color: '#9ca3af', fontSize: '11px' } },
      lineColor: 'rgba(156, 163, 175, 0.2)',
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#9ca3af', fontSize: '11px' } },
      gridLineColor: 'rgba(156, 163, 175, 0.1)',
      min: 0,
    },
    legend: {
      itemStyle: { color: '#9ca3af', fontSize: '11px' },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      style: { color: '#f3f4f6' },
      borderRadius: 12,
    },
    plotOptions: {
      spline: {
        lineWidth: 3,
        marker: {
          radius: 4,
          symbol: 'circle',
        },
      },
    },
    series: seriesData.map((s) => ({
      type: 'spline',
      name: s.name,
      data: s.data,
      color: s.color || '#3b82f6',
    })),
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

interface ColumnChartProps {
  title?: string;
  categories: string[];
  seriesData: { name: string; data: number[]; color?: string }[];
  height?: number;
}

export const HighchartsColumn: React.FC<ColumnChartProps> = ({
  title,
  categories,
  seriesData,
  height = 260,
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height,
      style: {
        fontFamily: 'inherit',
      },
    },
    title: {
      text: title || '',
      style: { color: '#9ca3af', fontSize: '12px', fontWeight: 'bold' },
    },
    credits: { enabled: false },
    xAxis: {
      categories,
      labels: { style: { color: '#9ca3af', fontSize: '11px' } },
      lineColor: 'rgba(156, 163, 175, 0.2)',
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#9ca3af', fontSize: '11px' } },
      gridLineColor: 'rgba(156, 163, 175, 0.1)',
      min: 0,
    },
    legend: {
      itemStyle: { color: '#9ca3af', fontSize: '11px' },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      style: { color: '#f3f4f6' },
      borderRadius: 12,
    },
    plotOptions: {
      column: {
        borderRadius: 8,
        borderWidth: 0,
      },
    },
    series: seriesData.map((s) => ({
      type: 'column',
      name: s.name,
      data: s.data,
      color: s.color || '#8b5cf6',
    })),
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

interface DonutChartProps {
  title?: string;
  data: { name: string; y: number; color?: string }[];
  height?: number;
}

export const HighchartsDonut: React.FC<DonutChartProps> = ({ title, data, height = 260 }) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height,
      style: {
        fontFamily: 'inherit',
      },
    },
    title: {
      text: title || '',
      style: { color: '#9ca3af', fontSize: '12px', fontWeight: 'bold' },
    },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      style: { color: '#f3f4f6' },
      borderRadius: 12,
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})',
    },
    plotOptions: {
      pie: {
        innerSize: '65%',
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y}',
          style: { color: '#9ca3af', fontSize: '10px' },
        },
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Share',
        data: data.map((d) => ({
          name: d.name,
          y: d.y,
          color: d.color,
        })),
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

interface AreaChartProps {
  title?: string;
  categories: string[];
  seriesData: { name: string; data: number[]; color?: string }[];
  height?: number;
}

export const HighchartsArea: React.FC<AreaChartProps> = ({
  title,
  categories,
  seriesData,
  height = 260,
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height,
      style: {
        fontFamily: 'inherit',
      },
    },
    title: {
      text: title || '',
      style: { color: '#9ca3af', fontSize: '12px', fontWeight: 'bold' },
    },
    credits: { enabled: false },
    xAxis: {
      categories,
      labels: { style: { color: '#9ca3af', fontSize: '11px' } },
      lineColor: 'rgba(156, 163, 175, 0.2)',
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#9ca3af', fontSize: '11px' } },
      gridLineColor: 'rgba(156, 163, 175, 0.1)',
      min: 0,
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      style: { color: '#f3f4f6' },
      borderRadius: 12,
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.2,
        lineWidth: 2,
      },
    },
    series: seriesData.map((s) => ({
      type: 'areaspline',
      name: s.name,
      data: s.data,
      color: s.color || '#10b981',
    })),
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
