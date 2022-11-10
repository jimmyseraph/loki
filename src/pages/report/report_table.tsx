import type { ColumnsType } from 'antd/lib/table';
import { history, Link } from 'umi';
import { api, ReportListReply, ReportListVariables } from '@/api/Api4Config';
import { statusTag } from './interface.d';
import moment from 'moment';
import { Button, message, Space, Table } from 'antd';
import { useQuery } from '@apollo/client';

export interface ReportData {
  id: string;
  name: string;
  status: number;
  creator: string;
  createTime: string;
}

interface ReportTableProps {
  payload: ReportListVariables | undefined;
}
const ReportTable: React.FC<ReportTableProps> = (props: ReportTableProps) => {
  const { loading, error, data } = useQuery<
    { ReportList: ReportListReply[] },
    { reportListRequest: ReportListVariables }
  >(api.getReportList, {
    variables: { reportListRequest: props?.payload as ReportListVariables },
  });

  if (error) {
    message.error(error.message);
    // if (error.message === 'auth failed') {
    //   history.push('/login');
    // }
  }

  const handleDelete = (id: string) => {
    message.info('not implemented');
  };

  const columns: ColumnsType<ReportData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: any, record: ReportData, _index: number) => (
        <Link to={`/report/detail?id=${record.id}`}>{value}</Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: any, record: ReportData, _index: number) =>
        statusTag(record.status),
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) =>
        moment(a.createTime).valueOf() - moment(b.createTime).valueOf(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_value: any, record: ReportData, _index: number) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.ReportList}
      rowKey={(row) => row.id}
      style={{ marginTop: '10px' }}
      loading={loading}
    />
  );
};

export default ReportTable;
