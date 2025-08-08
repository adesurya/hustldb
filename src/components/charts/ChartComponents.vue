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
      chart: null
    }
  },

  mounted() {
    this.renderChart()
  },

  watch: {
    data: {
      deep: true,
      handler() {
        this.renderChart()
      }
    }
  },

  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },

  methods: {
    async renderChart() {
      try {
        const { Chart, registerables } = await import('chart.js')
        Chart.register(...registerables)
        
        if (this.chart) {
          this.chart.destroy()
        }
        
        const ctx = this.$refs.chartCanvas.getContext('2d')
        
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
      } catch (error) {
        console.error('Error rendering chart:', error)
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
                    const percentage = ((value / total) * 100).toFixed(1)
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
                    const percentage = ((value / total) * 100).toFixed(1)
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