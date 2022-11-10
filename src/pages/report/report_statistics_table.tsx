import { useQuery } from '@apollo/client';
import { message, Row, Spin, Table } from 'antd';
import {
  api,
  ErrorStat,
  ReportStatisticsReply,
  ReportStatisticsVariables,
} from '@/api/Api4Config';
import { history } from 'umi';
import { ReactNode } from 'react';
import type { ColumnsType } from 'antd/lib/table';

interface SamplerData {
  id: string;
  label: string;
  samplers: number;
  failures: number;
  errorPercent: number;
  average: number;
  min: number;
  max: number;
  ninty: number;
  ninty_five: number;
  ninty_nine: number;
  tps: number;
  recieved: number;
  sent: number;
}

interface SamplerErrorData {
  id: string;
  type: string;
  num: number;
  errorPercent: number;
  threadsPercent: number;
}

interface ReportStatisticTableProps {
  reportId: string;
  polling: boolean;
}

const ReportStatisticTable: React.FC<ReportStatisticTableProps> = (
  props: ReportStatisticTableProps,
) => {
  let samplersData: SamplerData[] = [];
  let errorData: SamplerErrorData[] = [];

  const { loading, error, data, startPolling, stopPolling } = useQuery<
    { ReportStatistics: ReportStatisticsReply[] },
    ReportStatisticsVariables
  >(api.getReportStatistics, { variables: { id: props.reportId } });

  if (error) {
    message.error(error.message);
    // if (error.message === 'auth failed') {
    //   history.push('/login');
    // }
  }

  if (props && props.polling) {
    startPolling(5000);
  } else {
    stopPolling();
  }

  if (data && data.ReportStatistics && data.ReportStatistics.length > 0) {
    let sdList: SamplerData[] = [];
    let edList: SamplerErrorData[] = [];
    data.ReportStatistics.forEach(
      (item: ReportStatisticsReply, index: number) => {
        sdList.push({
          id: index + '',
          label: item.label,
          samplers: item.samplers,
          failures: item.failures,
          errorPercent: item.failures / item.samplers,
          average: item.average,
          min: item.min,
          max: item.max,
          ninty: item.ninty,
          ninty_five: item.ninty_five,
          ninty_nine: item.ninty_nine,
          tps: item.tps,
          recieved: item.recieved,
          sent: item.sent,
        });
        if (item.errors && item.errors.length > 0) {
          item.errors.forEach((er: ErrorStat) => {
            for (let i = 0; i < edList.length; i++) {
              if (edList[i].type === er.type) {
                edList[i].num += er.num;
                return;
              }
            }
            edList.push({
              id: '',
              type: er.type,
              num: er.num,
              errorPercent: 0.0,
              threadsPercent: 0.0,
            });
          });
        }
      },
    );
    let all_samplers = 0;
    let all_errors = 0;
    sdList.forEach((item) => (all_samplers += item.samplers));
    edList.forEach((item) => (all_errors += item.num));
    edList.forEach((item, index) => {
      item.id = index + '';
      item.errorPercent = item.num / all_errors;
      item.threadsPercent = item.num / all_samplers;
    });
    samplersData = sdList;
    errorData = edList;
  }

  const samplerInfoColumns: ColumnsType<SamplerData> = [
    {
      title: 'Label',
      key: 'label',
      dataIndex: 'label',
    },
    {
      title: '#Samplers',
      key: 'samplers',
      dataIndex: 'samplers',
    },
    {
      title: 'Failures',
      key: 'failures',
      dataIndex: 'failures',
    },
    {
      title: 'Error%',
      key: 'errorPercent',
      dataIndex: 'errorPercent',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        ((value as number) * 100).toFixed(2) + '%',
    },
    {
      title: 'Average',
      key: 'average',
      dataIndex: 'average',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
    {
      title: 'Min',
      key: 'min',
      dataIndex: 'min',
    },
    {
      title: 'Max',
      key: 'max',
      dataIndex: 'max',
    },
    {
      title: '90th pct',
      key: 'ninty',
      dataIndex: 'ninty',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
    {
      title: '95th pct',
      key: 'ninty_five',
      dataIndex: 'ninty_five',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
    {
      title: '99th pct',
      key: 'ninty_nine',
      dataIndex: 'ninty_nine',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
    {
      title: 'Transactions/s',
      key: 'tps',
      dataIndex: 'tps',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
    {
      title: 'Recieved',
      key: 'recieved',
      dataIndex: 'recieved',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
    {
      title: 'Sent',
      key: 'sent',
      dataIndex: 'sent',
      render: (value: any, _record: SamplerData, _index: number): ReactNode =>
        (value as number).toFixed(2),
    },
  ];

  const errorInfoColumns: ColumnsType<SamplerErrorData> = [
    {
      title: 'Type of Error',
      key: 'type',
      dataIndex: 'type',
    },
    {
      title: 'Number of errors',
      key: 'num',
      dataIndex: 'num',
    },
    {
      title: '% in errors',
      key: 'errorPercent',
      dataIndex: 'errorPercent',
      render: (
        value: any,
        _record: SamplerErrorData,
        _index: number,
      ): ReactNode => ((value as number) * 100).toFixed(2) + '%',
    },
    {
      title: '% in all threads',
      key: 'threadsPercent',
      dataIndex: 'threadsPercent',
      render: (
        value: any,
        _record: SamplerErrorData,
        _index: number,
      ): ReactNode => ((value as number) * 100).toFixed(2) + '%',
    },
  ];

  return (
    <Spin tip="Collecting..." spinning={loading}>
      <Row style={{ marginTop: '20px' }}>
        <h3>Statistics of Samplers</h3>
        <Table
          columns={samplerInfoColumns}
          dataSource={samplersData}
          rowKey={(row) => row.id}
          pagination={false}
          bordered
          style={{ width: '100%' }}
        />
      </Row>
      <Row style={{ marginTop: '20px' }}>
        <h3>Statistics of Errors</h3>
        <Table
          columns={errorInfoColumns}
          dataSource={errorData}
          rowKey={(row) => row.id}
          pagination={false}
          bordered
          style={{ width: '100%' }}
        />
      </Row>
    </Spin>
  );
};

export default ReportStatisticTable;
