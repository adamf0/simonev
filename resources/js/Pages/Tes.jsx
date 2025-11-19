import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, Filler, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Chart, Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useDispatch, useSelector } from 'react-redux';

ChartJS.register(ArcElement, Tooltip, Legend, Title, Filler, ChartDataLabels, CategoryScale, LinearScale, BarElement);

export default function Tes() {
  const dispatch = useDispatch();
  const { chart, action_type, loading, error } = useSelector(s => s.chartV2);

  function buildOptionsChart(source, hiddenLegend = false){
      return {
          responsive: true,
          plugins: {
              tooltip: {
                  callbacks: {
                      title: function(tooltipItem) {
                          return source.labels[tooltipItem[0].dataIndex];
                      },
                      label: function(tooltipItem) {
                          const total = source.datasets[0].data.reduce((acc, val) => acc + val, 0);
                          const value = source.datasets[0].data[tooltipItem.dataIndex];
                          const percentage = ((value / total) * 100).toFixed(2);
                          return `Total: ${value} | Persentase: ${percentage}%`;
                      }
                  }
              },
              legend: {
                  display: !hiddenLegend
              },
              datalabels: {
                  formatter: function(value, context) {
                      const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${percentage}%`;  // Display percentage only
                  },
                  color: '#000',  // White color for labels on the chart
                  font: {
                      weight: 'bold',
                      size: 14
                  }
              }
          }
      }
  }
  function RataRataRatingChart({ data }) {
      const ratingCharts = data.filter(item => item.jenis_pilihan === "rating5");

      const totalRatings = ratingCharts.reduce((acc, curr) => {
          const values = curr.chart.datasets[0].data;
          values.forEach((val, idx) => {
              acc[idx] = (acc[idx] || 0) + val;
          });
          return acc;
      }, []);

      const avgRatings = (totalRatings.length > 0 ? totalRatings : [0, 0, 0, 0, 0])
                              .map(val => Number((val / (ratingCharts.length || 1)).toFixed(3)));


      const chartData = {
          labels: ["1", "2", "3", "4", "5"],
          datasets: [
              {
                  label: "Rata-rata Rating",
                  data: avgRatings,
                  backgroundColor: "rgba(54, 162, 235, 0.7)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
              },
          ],
      };

      const options = {
          responsive: true,
          plugins: { 
              title: { 
                  display: false 
              }, 
              legend: {
                  display: false
              },
              datalabels: {
                  formatter: function(value, context) {
                      const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${percentage}%`;  // Display percentage only
                  },
                  color: '#000',  // White color for labels on the chart
                  font: {
                      weight: 'bold',
                      size: 14
                  }
              },
          },
          scales: { y: { beginAtZero: true } },
      };

      return (
          <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 text-center text-success">
                  Rata-rata Rating
              </div>
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <Bar data={chartData} options={options} />
              </div>
          </div>
      );
  }
  function renderChart() {

    if (action_type === FETCH_CHART_REQUEST || loading) {
      return (
        <div className="card px-4 py-3">
          <p>Loading...</p>
        </div>
      );
    }
  
    if (action_type === FETCH_CHART_FAILURE) {
      return <p className="text-danger">{error?.message || "Error"}</p>;
    }
  
    if (!chart || Object.keys(chart).length === 0) {
      return (
        <div className="card px-4 py-3">
          <p>No Data</p>
        </div>
      );
    }
  
    return Object.keys(chart).map((key) => {
      const parts = key.split("#").filter(Boolean);
  
      const title = parts.length === 1 ? parts[0] : parts.join(" > ");
  
      return (
        <div key={key} className="card d-flex flex-row">
          <div className="col-12">
            <h3 className="text-primary bg-primary text-white px-3 py-3">
              {title}
            </h3>
  
            <div className="grid px-4 py-3">
              {chart[key].map((c, i) => (
                <div key={i} className="row">
                  <div className="col-12 text-center text-success">
                    {c.pertanyaan}
                  </div>
  
                  <div className="col-12">
                    {c.jenis_pilihan === "rating5" ? (
                      <Bar
                        data={c.chart}
                        options={buildOptionsChart(c.chart, true)}
                      />
                    ) : (
                      <Pie data={c.chart} options={buildOptionsChart(c.chart)} />
                    )}
                  </div>
                </div>
              ))}
  
              {/* Tambah rata-rata rating */}
              <RataRataRatingChart data={chart[key]} />
            </div>
          </div>
        </div>
      );
    });
  }

  useEffect(() => {
      dispatch(fetchChartSSE(110, "prodi", "ILMU HUKUM (S1)"));
  }, []);
  

  return <>{renderChart()}</>
}
