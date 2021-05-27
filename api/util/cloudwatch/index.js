const {
  CloudWatchClient,
  GetMetricDataCommand,
  PutMetricDataCommand
} = require('@aws-sdk/client-cloudwatch')

const allowed = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production'

module.exports = {
  sendIntegerEvent (key, value, source) {
    module.exports.putMetricDataToCloudwatch(key, value, source)
  },
  sendBooleanEvent (key, value, source) {
    value = value ? 1 : 0
    module.exports.putMetricDataToCloudwatch(key, value, source)
  },
  async getMetricDataFromCloudwatch (Metric) {
    if (!allowed) {
      return
    }
    try {
      const REGION = 'us-west-2'
      const cw = new CloudWatchClient({
        region: REGION
      })
      const EndTime = new Date()
      const StartTime = new Date(EndTime.getTime() - 15 * 60000)

      const metricData = await cw.send(new GetMetricDataCommand({
        StartTime,
        EndTime,
        MetricDataQueries: [{
          Id: 'cpu_utilization',
          MetricStat: {
            Metric,
            Stat: 'Average',
            Period: 60 // seconds
          }
        }]
      }))

      const metricDataResults = metricData.MetricDataResults

      if (!metricDataResults.length) {
        throw Error(`No data found for MetricName: ${Metric.MetricName}, Namespace: ${Metric.Namespace}, Dimensions: ${Metric.Dimensions}`)
      }

      if (!metricDataResults[0].Values.length) {
        throw Error(`No values found for MetricName: ${Metric.MetricName}, Namespace: ${Metric.Namespace}, Dimensions: ${Metric.Dimensions}`)
      }

      // the first value is the most recent metric
      return metricDataResults[0].Values[0]
    } catch (error) {
      throw new Error('ERROR: getMetricDataFromCloudwatch', error)
    }
  },
  async putMetricDataToCloudwatch (key, value, source) {
    if (!allowed) {
      return
    }
    console.log('Sending data to cloudwatch, ', key, value)
    try {
      const REGION = 'us-west-2'
      const cw = new CloudWatchClient({
        region: REGION
      })

      const params = {
        MetricData: [{
          MetricName: key,
          Dimensions: [{
            Name: key,
            Value: source || 'local'
          }],
          Timestamp: new Date(),
          Unit: 'None',
          Value: value
        }],
        Namespace: 'ce-heartbeat'
      }

      await cw.send(new PutMetricDataCommand(params))

      // the first value is the most recent metric
    } catch (error) {
      console.log('ERROR >>> putMetricDataToCloudwatch::', error)
      throw new Error('putMetricDataToCloudwatch', error)
    }
  },

  async aeHasAdequateCapacity () {
    if (!allowed) {
      return
    }
    const MAX_CPU_UTILIZATION = 80

    try {
      const aeMachine1CpuMetric = {
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [{
          Name: 'InstanceId',
          Value: 'i-025b02759e0d54ca3'
        }]
      }
      const aeMachine2CpuMetric = {
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [{
          Name: 'InstanceId',
          Value: 'i-063c306062cfa634d'
        }]
      }

      const cpuUtilization1 = await module.exports.getMetricDataFromCloudwatch(aeMachine1CpuMetric)
      const cpuUtilization2 = await module.exports.getMetricDataFromCloudwatch(aeMachine2CpuMetric)
      const averageCpuUtilization = Math.ceil((cpuUtilization1, cpuUtilization2) / 2)

      return averageCpuUtilization < MAX_CPU_UTILIZATION
    } catch (error) {
      throw new Error('aeHasAdequateCapacity', error)
    }
  }
}
