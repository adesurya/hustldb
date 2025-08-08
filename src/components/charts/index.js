import ChartComponent from './ChartComponents.vue'

// Individual chart components for easier usage
export const ColumnChart = {
  name: 'ColumnChart',
  extends: ChartComponent,
  props: {
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
    }
  },
  data() {
    return {
      type: 'column'
    }
  }
}

export const PieChart = {
  name: 'PieChart',
  extends: ChartComponent,
  props: {
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
    }
  },
  data() {
    return {
      type: 'pie'
    }
  }
}

export const DoughnutChart = {
  name: 'DoughnutChart',
  extends: ChartComponent,
  props: {
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
      type: 'doughnut'
    }
  }
}

export const LineChart = {
  name: 'LineChart',
  extends: ChartComponent,
  props: {
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
    }
  },
  data() {
    return {
      type: 'line'
    }
  }
}

export default ChartComponent