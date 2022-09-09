import { Line } from '@ant-design/charts';
import { Collapse, message, Space, Spin } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import {
  ActiveThreadsOverTime,
  api,
  BytesThroughputOverTime,
  ReportChartsReply,
  ReportChartsVariables,
  ResponseTimesOverTime,
  TransactionsPerSecond,
} from '@/api/Api4Config';
import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { history } from 'umi';

interface ReportChartsProps {
  reportId: string;
  finished: boolean;
}

const ReportCharts: React.FC<ReportChartsProps> = (
  props: ReportChartsProps,
) => {
  const [responseTimesOverTimeData, setResponseTimesOverTimeData] = useState<
    ResponseTimesOverTime[]
  >([]);
  const [activeThreadsOverTimeData, setActiveThreadsOverTimeData] = useState<
    ActiveThreadsOverTime[]
  >([]);
  const [bytesThroughputOverTimeData, setBytesThroughputOverTimeData] =
    useState<BytesThroughputOverTime[]>([]);
  const [transactionsPerSecondData, setTransactionsPerSecondData] = useState<
    TransactionsPerSecond[]
  >([]);

  const [getCharts] = useLazyQuery<
    { ReportCharts: ReportChartsReply },
    ReportChartsVariables
  >(api.getReportCharts);

  const panelHeaderRender = (header: string) => {
    return (
      <Space>
        <LineChartOutlined />
        {header}
      </Space>
    );
  };

  useEffect(() => {
    if (props.finished) {
      getCharts({ variables: { id: props.reportId } })
        .then((res) => {
          if (res.error) {
            message.error(res.error.message);
            if (res.error.message === 'auth failed') {
              history.push('/login');
            }
            return;
          }
          if (
            res.data?.ReportCharts &&
            res.data?.ReportCharts.response_times_over_time.length > 0
          ) {
            setResponseTimesOverTimeData(
              res.data.ReportCharts.response_times_over_time,
            );
            setActiveThreadsOverTimeData(
              res.data.ReportCharts.active_threads_over_time,
            );
            setBytesThroughputOverTimeData(
              res.data.ReportCharts.bytes_throughput_over_time,
            );
            setTransactionsPerSecondData(
              res.data.ReportCharts.transactions_per_second,
            );
          }
        })
        .catch((err) => {
          message.error(err.message);
        });
    }
  }, [props.finished]);

  return (
    <Space direction="vertical" size={'large'} style={{ width: '100%' }}>
      <Spin tip="Collecting..." spinning={!props.finished}>
        <Collapse collapsible={'header'}>
          <Collapse.Panel
            header={panelHeaderRender('Response Times Over Time')}
            key={1}
          >
            <Line
              data={responseTimesOverTimeData}
              xField="time"
              yField="response_times"
              seriesField="label"
              xAxis={{
                tickCount: 15,
              }}
            />
          </Collapse.Panel>
        </Collapse>
      </Spin>
      <Spin tip="Collecting..." spinning={!props.finished}>
        <Collapse collapsible={'header'}>
          <Collapse.Panel
            header={panelHeaderRender('Active Threads Over Time')}
            key={1}
          >
            <Line
              data={activeThreadsOverTimeData}
              xField="time"
              yField="active_threads"
              xAxis={{
                tickCount: 15,
              }}
            />
          </Collapse.Panel>
        </Collapse>
      </Spin>
      <Spin tip="Collecting..." spinning={!props.finished}>
        <Collapse collapsible={'header'}>
          <Collapse.Panel
            header={panelHeaderRender('Bytes Throughput Over Time')}
            key={1}
          >
            <Line
              data={bytesThroughputOverTimeData}
              xField="time"
              yField="bytes"
              xAxis={{
                tickCount: 15,
              }}
            />
          </Collapse.Panel>
        </Collapse>
      </Spin>
      <Spin tip="Collecting..." spinning={!props.finished}>
        <Collapse collapsible={'header'}>
          <Collapse.Panel
            header={panelHeaderRender('Transactions Per Second')}
            key={1}
          >
            <Line
              data={transactionsPerSecondData}
              xField="time"
              yField="transactions"
              seriesField="label"
              yAxis={{
                title: {
                  text: 'Number of transactions / sec',
                },
              }}
              xAxis={{
                tickCount: 15,
              }}
            />
          </Collapse.Panel>
        </Collapse>
      </Spin>
    </Space>
  );
};

export default ReportCharts;
