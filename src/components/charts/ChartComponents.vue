<template>
  <div>
    <!-- Column Chart -->
    <div v-if="type === 'column'" class="chart-container">
      <canvas ref="chartCanvas" :height="height"></canvas>
    </div>

    <!-- Pie Chart -->
    <div v-if="type === 'pie'" class="chart-container">
      <canvas ref="chartCanvas" :height="height"></canvas>
    </div>

    <!-- Doughnut Chart -->
    <div v-if="type === 'doughnut'" class="chart-container position-relative">
      <canvas ref="chartCanvas" :height="height"></canvas>
      <div v-if="centerText" class="chart-center-text">
        <div class="center-value">{{ centerText.value }}</div>
        <div class="center-label">{{ centerText.label }}</div>
      </div>
    </div>

    <!-- Line Chart -->
    <div v-if="type === 'line'" class="chart-container">
      <canvas ref="chartCanvas" :height="height"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartComponent',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['column', 'pie', 'doughnut', 'line'].includes(value)
    },
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: Number,
      default: 300
    },
    centerText: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      chart: null,
      isChartReady: false
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },

  watch: {
    data: {
      deep: true,
      handler() {
        if (this.isChartReady) {
          this.updateChart()
        }
      }
    }
  },

  beforeUnmount() {
    this.destroyChart()
  },

  methods: {
    async initChart() {
      try {
        // Wait for the next tick to ensure DOM is ready
        await this.$nextTick()
        
        // Check if canvas ref exists
        if (!this.$refs.chartCanvas) {
          console.warn('Chart canvas ref not found, retrying...')
          setTimeout(() => this.initChart(), 100)
          return
        }

        await this.renderChart()
      } catch (error) {
        console.error('Error initializing chart:', error)
      }
    },

    async renderChart() {
      try {
        // Dynamic import Chart.js
        const { Chart, registerables } = await import('chart.js')
        Chart.register(...registerables)
        
        // Destroy existing chart
        this.destroyChart()
        
        // Check if canvas element exists and get context
        const canvas = this.$refs.chartCanvas
        if (!canvas) {
          console.warn('Canvas element not found')
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.warn('Unable to get 2D context')
          return
        }
        
        let chartType = this.type
        if (this.type === 'column') {
          chartType = 'bar'
        }
        
        const defaultOptions = this.getDefaultOptions()
        
        this.chart = new Chart(ctx, {
          type: chartType,
          data: this.data,
          options: { ...defaultOptions, ...this.options }
        })

        this.isChartReady = true
      } catch (error) {
        console.error('Error rendering chart:', error)
        this.isChartReady = false
      }
    },

    updateChart() {
      if (this.chart && this.data) {
        try {
          // Update chart data
          this.chart.data = this.data
          this.chart.update('none') // Use 'none' for instant update
        } catch (error) {
          console.error('Error updating chart:', error)
          // If update fails, re-render the chart
          this.renderChart()
        }
      }
    },

    destroyChart() {
      if (this.chart) {
        try {
          this.chart.destroy()
        } catch (error) {
          console.warn('Error destroying chart:', error)
        }
        this.chart = null
        this.isChartReady = false
      }
    },

    getDefaultOptions() {
      const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        }
      }

      switch (this.type) {
        case 'column':
          return {
            ...baseOptions,
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            }
          }

        case 'pie':
          return {
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              legend: {
                display: true,
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || ''
                    const value = context.parsed
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              }
            }
          }

        case 'doughnut':
          return {
            ...baseOptions,
            cutout: '60%',
            plugins: {
              ...baseOptions.plugins,
              legend: {
                display: true,
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || ''
                    const value = context.parsed
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              }
            }
          }

        case 'line':
          return {
            ...baseOptions,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false
                }
              },
              y: {
                display: true,
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            },
            elements: {
              line: {
                tension: 0.4
              }
            }
          }

        default:
          return baseOptions
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.center-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}
</style>