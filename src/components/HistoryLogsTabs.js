import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReactApexChart from 'react-apexcharts';

/**
 * A small reusable component to display money values with an icon.
 * Example usage: <MoneyDisplay value={2100} />
 */
const MoneyDisplay = ({ value }) => (
  <Stack direction="row" alignItems="center" spacing={0.5}>
    <AttachMoneyIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
    <Typography variant="body2" component="span">
      {Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </Typography>
  </Stack>
);

/**
 * Main HistoryLogsTabs component
 * @param {Object} props - Component props
 * @param {Object} props.data - The data containing { historylogs: [...] }
 */
function HistoryLogsTabs({ data }) {
  // 'yearly' or 'monthly'
  const [activeTab, setActiveTab] = useState('yearly');

  // data.historylogs is an array of objects like [ { "2024": {...} }, { "2025": {...} }, ... ]
  const yearlyArray = data.historylogs || [];

  /**
   * Switch tabs between 'yearly' and 'monthly'
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Yearly" value="yearly" />
        <Tab label="Monthly" value="monthly" />
        <Tab label="Visualize" value="visualize" />

      </Tabs>

      {/* Render sub-components based on the active tab */}
      {activeTab === 'yearly' && <YearlyView yearlyData={yearlyArray} />}
      {activeTab === 'monthly' && <MonthlyView yearlyData={yearlyArray} />}
      {activeTab === 'visualize' && <VisualizeView yearlyData={yearlyArray} />}


    </Box>
  );
}


/**
 * YearlyView sub-component
 * Sorts the data by descending year, and displays an overview table.
 */
function YearlyView({ yearlyData }) {
  // Copy and sort the array so we don't mutate the original
  const sortedYearlyData = yearlyData.slice().sort((a, b) => {
    const aYear = parseInt(Object.keys(a)[0], 10);
    const bYear = parseInt(Object.keys(b)[0], 10);
    return bYear - aYear; // Higher (newer) year first
  });

  function getMonthNameShort(monthIndex) {
    // monthIndex: 0 for Jan, 1 for Feb, ...
    // But your monthly breakdown uses "JAN", "FEB", ...
    const shortNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return shortNames[monthIndex] || "";
  }
  

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            <TableCell>Total Proposals</TableCell>
            <TableCell>Approved</TableCell>
            <TableCell>Budget Approved</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedYearlyData.map((yearObj, index) => {
            // Each item is like { "2024": { totalProposals, ... } }
            const yearKey = Object.keys(yearObj)[0];
            const stats = yearObj[yearKey];

            return (
              <TableRow key={index}>
                <TableCell>{yearKey}</TableCell>
                <TableCell>{stats.totalProposals}</TableCell>
                <TableCell>{stats.approvedProposals}</TableCell>
                <TableCell>
                  <MoneyDisplay value={stats.budgetApproved} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// /**
//  * MonthlyView sub-component
//  * Loops over each year and displays a monthly breakdown table.
//  */
// function MonthlyView({ yearlyData }) {
//   return (
//     <Box sx={{ mt: 2 }}>
//       {yearlyData.map((yearObj, idx) => {
//         // yearObj => { "2024": { totalProposals, monthlyBreakdown: {...} } }
//         const yearKey = Object.keys(yearObj)[0];
//         const stats = yearObj[yearKey];
//         const monthly = stats.monthlyBreakdown || {};

//         return (
//           <Box key={idx} sx={{ mb: 4 }}>
//             <Typography variant="subtitle1" sx={{ mb: 1 }}>
//               {yearKey}
//             </Typography>

//             <TableContainer component={Paper}>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Month</TableCell>
//                     <TableCell>Total Proposals</TableCell>
//                     <TableCell>Approved</TableCell>
//                     <TableCell>Budget Approved</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(monthly).map(([monthName, mstats]) => (
//                     <TableRow key={monthName}>
//                       <TableCell>{monthName}</TableCell>
//                       <TableCell>{mstats.total}</TableCell>
//                       <TableCell>{mstats.approved}</TableCell>
//                       <TableCell>
//                         <MoneyDisplay value={mstats.budgetApproved} />
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         );
//       })}
//     </Box>
//   );
// }

function MonthlyView({ yearlyData }) {
  return (
    <Box sx={{ mt: 2 }}>
      {yearlyData.map((yearObj, idx) => {
        const yearKey = Object.keys(yearObj)[0];
        const stats = yearObj[yearKey];
        const monthly = stats.monthlyBreakdown || {};

        return (
          <Box key={idx} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {yearKey}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Total Proposals</TableCell>
                    <TableCell>Approved</TableCell>
                    <TableCell>Budget Approved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(monthly).map(([monthName, mstats]) => (
                    <TableRow key={monthName}>
                      <TableCell>{monthName}</TableCell>
                      <TableCell>{mstats.total}</TableCell>
                      <TableCell>{mstats.approved}</TableCell>
                      <TableCell>
                        <MoneyDisplay value={mstats.budgetApproved} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Box>
  );
}

// 4) NEW VisualizeView
function VisualizeView({ yearlyData }) {
  // Build the 6-month array
  const now = new Date();
  const monthYearPairs = [];
  for (let i = 0; i < 6; i++) {
    const temp = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = temp.getFullYear();
    const m = temp.getMonth();
    monthYearPairs.push({ year: y, monthIndex: m });
  }

  // Reverse so the oldest is first
  monthYearPairs.reverse();

  // Convert yearlyData into a lookup
  const yearLookup = {};
  yearlyData.forEach((obj) => {
    const yearKey = Object.keys(obj)[0];
    yearLookup[yearKey] = obj[yearKey];
  });

  const chartLabels = [];
  const chartData = [];

  monthYearPairs.forEach(({ year, monthIndex }) => {
    const labelStr = `${getMonthNameShort(monthIndex)} ${year}`;
    chartLabels.push(labelStr);

    const yearStats = yearLookup[year];
    if (!yearStats) {
      chartData.push(0);
      return;
    }

    const monthName = getMonthNameShort(monthIndex); // e.g. "JAN"
    const monthStats = yearStats.monthlyBreakdown
      ? yearStats.monthlyBreakdown[monthName]
      : null;
    if (!monthStats) {
      chartData.push(0);
    } else {
      chartData.push(monthStats.budgetApproved || 0);
    }
  });

  // ApexCharts config
  const chartOptions = {
    chart: {
      type: 'bar'
    },
    xaxis: {
      categories: chartLabels
    },
    yaxis: {
      title: {
        text: 'Approved Budget ($)'
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    
    colors: ['#1a237e'],
    title: {
      text: 'Last 6 Months - Approved Budget',
      align: 'center'
    }
  };

  const series = [
    {
      name: 'Approved Budget',
      data: chartData
    }
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="bar"
        height={350}
      />
    </Box>
  );
}

// Helper to get 3-letter uppercase month
function getMonthNameShort(index) {
  const shortNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return shortNames[index] || '';
}


export default HistoryLogsTabs;
